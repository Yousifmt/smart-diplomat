import Parser from "rss-parser";

export type ApprovedSource = {
  name: string;
  baseUrl: string;
  rssUrl?: string;
  category: string;
  language: string;
  tier: string;
  enabled: boolean;
};

export type RetrievedPassage = {
  title: string;
  publisher: string;
  publicationDate?: string;
  url: string;
  snippet: string;
};

const parser = new Parser();

function tokenize(q: string) {
  return q
    .toLowerCase()
    .split(/[\s,.!?;:()]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function score(text: string, tokens: string[]) {
  const hay = text.toLowerCase();
  let s = 0;
  for (const t of tokens) if (hay.includes(t)) s += 1;
  return s;
}

export async function retrieveFromApprovedSources(opts: {
  query: string;
  sources: ApprovedSource[];
  maxItemsPerSource?: number;
  topK?: number;
}): Promise<RetrievedPassage[]> {
  const { query: userQuery, sources, maxItemsPerSource = 12, topK = 8 } = opts;

  const tokens = tokenize(userQuery);
  const enabled = sources.filter((s) => s.enabled && s.rssUrl);

  const bucket: Array<{ p: RetrievedPassage; s: number }> = [];

  await Promise.all(
    enabled.map(async (src) => {
      try {
        const res = await fetch(src.rssUrl!, { cache: "no-store" });
        const xml = await res.text();
        const feed = await parser.parseString(xml);

        const items = (feed.items ?? []).slice(0, maxItemsPerSource);

        for (const item of items) {
          const title = item.title ?? "بدون عنوان";
          const link = (item.link ?? src.baseUrl) as string;
          const pubDate = (item.isoDate ?? item.pubDate ?? "") as string;

          const snippet =
            (item.contentSnippet ??
              (typeof item.content === "string" ? item.content : "") ??
              "") as string;

          const combined = `${title}\n${snippet}`;
          const sc = score(combined, tokens);

          if (sc > 0) {
            bucket.push({
              p: {
                title,
                publisher: src.name,
                publicationDate: pubDate || undefined,
                url: link,
                snippet: (snippet || "").slice(0, 1200),
              },
              s: sc,
            });
          }
        }
      } catch {
        // ignore in MVP
      }
    })
  );

  bucket.sort((a, b) => b.s - a.s);
  return bucket.slice(0, topK).map((x) => x.p);
}
