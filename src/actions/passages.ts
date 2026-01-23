"use server";

import { z } from "zod";
import crypto from "crypto";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getSourcesByCountry } from "@/actions/sources";

/* ---------------- Schema & Types ---------------- */

const PassageSchema = z.object({
  country: z.string().min(2),
  sourceName: z.string().min(1),
  publisher: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  snippet: z.string().min(1),
  publicationDate: z.string().min(4).optional(), // optional
});

export type PassageDoc = z.infer<typeof PassageSchema> & {
  id: string;
  createdAt: number | null;
};

function toMillis(ts: any): number | null {
  return ts?.seconds ? ts.seconds * 1000 : null;
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function clip(s: string, max = 1800) {
  const t = String(s ?? "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) : t;
}

/** Simple tokenizer/scorer for keyword fallback */
function tokenize(q: string) {
  return q
    .toLowerCase()
    .split(/[\s,.!?;:()]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function scoreText(text: string, tokens: string[]) {
  const hay = (text || "").toLowerCase();
  let s = 0;
  for (const t of tokens) if (hay.includes(t)) s += 1;
  return s;
}

/* ---------------- CRUD: Manual passages ---------------- */

export async function addPassage(formData: FormData) {
  const publicationRaw = String(formData.get("publicationDate") ?? "").trim();

  const raw = {
    country: String(formData.get("country") ?? "").trim(),
    sourceName: String(formData.get("sourceName") ?? "").trim(),
    publisher: String(formData.get("publisher") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
    snippet: clip(String(formData.get("snippet") ?? "").trim()),
    publicationDate: publicationRaw ? publicationRaw : undefined, // do not send if empty
  };

  const parsed = PassageSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid passage data." };

  const ref = collection(db, "passages");
  await addDoc(
    ref,
    stripUndefined({
      ...parsed.data,
      createdAt: serverTimestamp(),
    })
  );

  return { success: true };
}

export async function getPassagesByCountry(country: string, take = 200): Promise<PassageDoc[]> {
  const ref = collection(db, "passages");
  const qy = query(ref, where("country", "==", country), limit(take));
  const snap = await getDocs(qy);

  const docs = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      country: data.country,
      sourceName: data.sourceName,
      publisher: data.publisher,
      title: data.title,
      url: data.url,
      snippet: data.snippet,
      publicationDate: data.publicationDate ?? undefined,
      createdAt: toMillis(data.createdAt),
    };
  });

  docs.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return docs.slice(0, take);
}

/**
 * ✅ Delete a passage by id
 * - optionally pass country to ensure you're deleting within the selected country
 */
export async function deletePassage(id: string, country?: string) {
  const safeId = String(id ?? "").trim();
  if (!safeId) return { error: "Missing passage id." };

  const ref = doc(db, "passages", safeId);

  // Optional safety check (recommended)
  if (country) {
    const snap = await getDoc(ref);
    if (!snap.exists()) return { error: "Passage not found." };
    const data = snap.data() as any;
    if (String(data?.country ?? "") !== String(country)) {
      return { error: "Not allowed (country mismatch)." };
    }
  }

  await deleteDoc(ref);
  return { success: true };
}

export async function getRelevantPassages(country: string, userQuery: string, topK = 8) {
  const batch = await getPassagesByCountry(country, 200);

  const q = String(userQuery ?? "").trim();
  if (!q) return batch.slice(0, topK);

  const tokens = tokenize(q);
  const scored = batch
    .map((p) => ({
      p,
      s: scoreText(`${p.title}\n${p.snippet}\n${p.publisher}\n${p.sourceName}`, tokens),
    }))
    .filter((x) => x.s > 0);

  if (!scored.length) return batch.slice(0, topK);

  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, topK).map((x) => x.p);
}

/* ---------------- RSS ingest (for the indexing button) ---------------- */

type RssItem = {
  title: string;
  url: string;
  snippet: string;
  publicationDate?: string;
};

function decodeHtmlEntities(str: string) {
  return String(str ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(html: string) {
  return decodeHtmlEntities(String(html ?? "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function pickTag(block: string, tag: string) {
  const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(r);
  return m?.[1]?.trim() ?? "";
}

function pickAttr(block: string, tag: string, attr: string) {
  const r = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"[^>]*\\/?>`, "i");
  const m = block.match(r);
  return m?.[1]?.trim() ?? "";
}

function parseRss(xml: string, maxItems: number): RssItem[] {
  const out: RssItem[] = [];
  const clean = String(xml ?? "");

  // RSS
  const items = clean.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const it of items.slice(0, maxItems)) {
    const title = stripTags(pickTag(it, "title")) || "بدون عنوان";
    let link = stripTags(pickTag(it, "link"));
    if (!link) link = stripTags(pickTag(it, "guid"));
    const pub = stripTags(pickTag(it, "pubDate")) || stripTags(pickTag(it, "dc:date"));
    const desc =
      pickTag(it, "content:encoded") || pickTag(it, "description") || pickTag(it, "summary");

    const snippet = clip(stripTags(desc), 1400);
    if (link && snippet) out.push({ title, url: link, snippet, publicationDate: pub || undefined });
  }

  if (out.length) return out;

  // Atom
  const entries = clean.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  for (const en of entries.slice(0, maxItems)) {
    const title = stripTags(pickTag(en, "title")) || "بدون عنوان";
    let link = pickAttr(en, "link", "href");
    if (!link) link = stripTags(pickTag(en, "id"));
    const pub = stripTags(pickTag(en, "updated")) || stripTags(pickTag(en, "published"));
    const desc = pickTag(en, "content") || pickTag(en, "summary");
    const snippet = clip(stripTags(desc), 1400);
    if (link && snippet) out.push({ title, url: link, snippet, publicationDate: pub || undefined });
  }

  return out;
}

async function fetchRssItems(rssUrl: string, maxItems: number): Promise<RssItem[]> {
  const res = await fetch(rssUrl, {
    headers: {
      "user-agent": "SmartDiplomat/1.0 (+https://example.local)",
      accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];
  const xml = await res.text();
  return parseRss(xml, maxItems);
}

export async function ingestCountrySources(country: string) {
  const sources = await getSourcesByCountry(country);
  const enabled = sources.filter((s) => s.enabled && !!s.rssUrl);

  let total = 0;
  const perSource: Array<{ sourceId: string; name: string; ingested: number }> = [];

  for (const s of enabled) {
    const items = await fetchRssItems(String(s.rssUrl), 25);
    let ingested = 0;

    for (const item of items) {
      const url = String(item.url ?? "").trim();
      if (!url) continue;

      const urlHash = sha256(url);
      const id = `${country}__${urlHash}`;
      const ref = doc(db, "passages", id);

      const payload = stripUndefined({
        country,
        sourceName: s.name,
        publisher: new URL(url).host,
        title: clip(item.title || "بدون عنوان", 220),
        url,
        snippet: clip(`${item.title}\n${item.snippet}`, 1600),
        publicationDate: item.publicationDate ? String(item.publicationDate).trim() : undefined,
        createdAt: serverTimestamp(),
      });

      await setDoc(ref, payload, { merge: true });
      ingested += 1;
    }

    total += ingested;
    perSource.push({ sourceId: s.id, name: s.name, ingested });
  }

  return { success: true, total, perSource };
}
