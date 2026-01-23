// src/actions/ask.ts
"use server";

import { getSourcesByCountry } from "@/actions/sources";
import { getRelevantPassages } from "@/actions/passages";
import { retrieveFromApprovedSources } from "@/lib/retrieval/rss-retriever";
import { provideNumberedCitations } from "@/ai/flows/provide-numbered-citations";

export async function askDiplomat(opts: { country: string; query: string }) {
  const { country, query } = opts;

  const c = String(country ?? "").trim();
  const q = String(query ?? "").trim();

  if (!c || !q) {
    return { answer: "من فضلك أدخل سؤالًا واضحًا وحدد الدولة.", citations: [] };
  }

  // 1) Approved sources (RSS)
  const sources = await getSourcesByCountry(c);

  const approved = sources
    .filter((s) => s.enabled)
    .map((s: any) => ({
      name: s.name,
      baseUrl: s.baseUrl,
      rssUrl: s.rssUrl,
      category: s.category,
      language: s.language,
      tier: s.tier,
      enabled: s.enabled,
    }));

  // 2) Try RSS retrieval first
  let retrievedPassages = await retrieveFromApprovedSources({
    query: q,
    sources: approved,
    topK: 8,
  });

  // 3) Fallback: use manual Firestore passages (keyword scoring)
  if (!retrievedPassages || retrievedPassages.length === 0) {
    const manual = await getRelevantPassages(c, q, 8);

    retrievedPassages = manual.map((p: any) => ({
      title: p.title,
      publisher: p.publisher || p.sourceName || "Manual Source",
      publicationDate: p.publicationDate, // ✅ optional string
      url: p.url,
      snippet: p.snippet,
    }));
  }

  // 4) Model call
  const { answer, citations } = await provideNumberedCitations({
    query: q,
    country: c,
    approvedSources: approved.map(({ rssUrl, ...rest }) => rest),
    retrievedPassages,
  });

  return { answer, citations };
}
