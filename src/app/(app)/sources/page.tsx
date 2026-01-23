// src/actions/sources.ts
"use server";

import { z } from "zod";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const SourceSchema = z.object({
  country: z.string().min(2),
  name: z.string().min(1),
  baseUrl: z.string().url(),
  rssUrl: z.string().url().optional(),
  category: z.string().min(1),
  language: z.string().min(1),
  tier: z.string().min(1),
  enabled: z.boolean(),
});

export type SourceDoc = z.infer<typeof SourceSchema> & {
  id: string;
  createdAt: number | null;
  updatedAt: number | null;
};

function toMillis(ts: any): number | null {
  return ts?.seconds ? ts.seconds * 1000 : null;
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
}

export async function addSource(formData: FormData) {
  const rssRaw = String(formData.get("rssUrl") ?? "").trim();

  const raw = {
    country: String(formData.get("country") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    baseUrl: String(formData.get("baseUrl") ?? "").trim(),
    rssUrl: rssRaw ? rssRaw : undefined,
    category: String(formData.get("category") ?? "official").trim(),
    language: String(formData.get("language") ?? "ar").trim(),
    tier: String(formData.get("tier") ?? "A").trim(),
    enabled: String(formData.get("enabled") ?? "true").trim().toLowerCase() === "true",
  };

  const parsed = SourceSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid source data." };

  const ref = collection(db, "sources");
  const payload = stripUndefined({
    ...parsed.data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(ref, payload);
  return { success: true };
}

/** ✅ موجود عشان لا يطلع لك خطأ import */
export async function setSourceEnabled(sourceId: string, enabled: boolean) {
  if (!sourceId) return { error: "Missing sourceId" };

  try {
    const ref = doc(db, "sources", sourceId);
    await updateDoc(ref, {
      enabled: !!enabled,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (e: any) {
    return { error: e?.message ?? "Failed to update source." };
  }
}

export async function getSourcesByCountry(country: string): Promise<SourceDoc[]> {
  const ref = collection(db, "sources");
  const qy = query(ref, where("country", "==", country));
  const snap = await getDocs(qy);

  const out: SourceDoc[] = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      country: String(data.country ?? ""),
      name: String(data.name ?? ""),
      baseUrl: String(data.baseUrl ?? ""),
      rssUrl: data.rssUrl ? String(data.rssUrl) : undefined,
      category: String(data.category ?? "official"),
      language: String(data.language ?? "ar"),
      tier: String(data.tier ?? "A"),
      enabled: Boolean(data.enabled),
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
    };
  });

  out.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return out;
}
