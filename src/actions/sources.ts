"use server";

import { z } from "zod";
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
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
};

function toMillis(ts: any): number | null {
  return ts?.seconds ? ts.seconds * 1000 : null;
}

export async function addSource(formData: FormData) {
  const raw = {
    country: String(formData.get("country") ?? ""),
    name: String(formData.get("name") ?? ""),
    baseUrl: String(formData.get("baseUrl") ?? ""),
    rssUrl: formData.get("rssUrl") ? String(formData.get("rssUrl")) : undefined,
    category: String(formData.get("category") ?? "official"),
    language: String(formData.get("language") ?? "ar"),
    tier: String(formData.get("tier") ?? "A"),
    enabled: String(formData.get("enabled") ?? "true") === "true",
  };

  const parsed = SourceSchema.safeParse(raw);
  if (!parsed.success) return { error: "بيانات المصدر غير صحيحة." };

  const ref = collection(db, "sources");
  await addDoc(ref, { ...parsed.data, createdAt: serverTimestamp() });

  return { success: true };
}

export async function setSourceEnabled(sourceId: string, enabled: boolean) {
  const ref = doc(db, "sources", sourceId);
  await updateDoc(ref, { enabled });
  return { success: true };
}

export async function getSourcesByCountry(country: string): Promise<SourceDoc[]> {
  const ref = collection(db, "sources");
  const q = query(ref, where("country", "==", country));
  const snap = await getDocs(q);

  const docs: SourceDoc[] = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      country: data.country,
      name: data.name,
      baseUrl: data.baseUrl,
      rssUrl: data.rssUrl ?? undefined,
      category: data.category,
      language: data.language,
      tier: data.tier,
      enabled: Boolean(data.enabled),
      createdAt: toMillis(data.createdAt),
    };
  });

  docs.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return docs;
}
