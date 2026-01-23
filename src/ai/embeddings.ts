// src/lib/ai/embeddings.ts
"use server";

import { googleAI } from "@genkit-ai/google-genai";
import { ai } from "@/ai/genkit";

const MODEL_ID = process.env.GEMINI_EMBEDDING_MODEL_ID || "gemini-embedding-001";
const MAX_CHARS = Number(process.env.SD_EMBED_MAX_CHARS || 5000);

// cache بسيط داخل السيرفر (نفس الـ runtime)
const mem = new Map<string, { v: number[]; t: number }>();
const TTL_MS = Number(process.env.SD_EMBED_CACHE_TTL_MS || 10 * 60 * 1000);

function clip(text: string) {
  const s = String(text ?? "").trim();
  if (!s) return "";
  return s.length > MAX_CHARS ? s.slice(0, MAX_CHARS) : s;
}

export async function embedText(text: string): Promise<number[]> {
  const content = clip(text);
  if (!content) return [];

  const key = `${MODEL_ID}::${content}`;
  const now = Date.now();
  const cached = mem.get(key);
  if (cached && now - cached.t < TTL_MS) return cached.v;

  const embeddings = await ai.embed({
    embedder: googleAI.embedder(MODEL_ID),
    content,
  });

  // Genkit يرجّع EmbeddingBatch (غالباً array)
  const vec =
    Array.isArray(embeddings) && embeddings.length
      ? (embeddings[0] as any)?.embedding ?? (embeddings[0] as any)?.vector ?? []
      : (embeddings as any)?.embedding ?? (embeddings as any)?.vector ?? [];

  const out = Array.isArray(vec) ? (vec as number[]) : [];
  mem.set(key, { v: out, t: now });
  return out;
}
