// src/ai/flows/provide-numbered-citations.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that processes user queries, retrieves information from approved sources,
 * and provides answers with numbered citations linked to the source URLs.
 *
 * - provideNumberedCitations - A function that processes the user query and returns the answer with citations.
 * - ProvideNumberedCitationsInput - The input type for the provideNumberedCitations function.
 * - ProvideNumberedCitationsOutput - The return type for the provideNumberedCitations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProvideNumberedCitationsInputSchema = z.object({
  query: z.string().describe('The user query.'),
  country: z.string().describe('The country context for the query.'),
  approvedSources: z
    .array(
      z.object({
        name: z.string(),
        baseUrl: z.string(),
        category: z.string(),
        language: z.string(),
        tier: z.string(),
        enabled: z.boolean(),
      })
    )
    .describe('List of approved sources for the country.'),
  retrievedPassages: z
    .array(
      z.object({
        title: z.string(),
        publisher: z.string(),
        publicationDate: z.string().optional(),
        url: z.string(),
        snippet: z.string(),
      })
    )
    .describe('Retrieved passages from approved sources.'),
});
export type ProvideNumberedCitationsInput = z.infer<typeof ProvideNumberedCitationsInputSchema>;

const ProvideNumberedCitationsOutputSchema = z.object({
  answer: z
    .string()
    .describe('The answer to the query, with inline numbered citations like [1], [2], etc.'),
  citations: z
    .array(
      z.object({
        title: z.string(),
        publisher: z.string(),
        publicationDate: z.string().optional(),
        url: z.string(),
      })
    )
    .describe('An array of the source documents that were cited in the answer, in the order they were cited.'),
});
export type ProvideNumberedCitationsOutput = z.infer<typeof ProvideNumberedCitationsOutputSchema>;

export async function provideNumberedCitations(
  input: ProvideNumberedCitationsInput
): Promise<ProvideNumberedCitationsOutput> {
  return provideNumberedCitationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideNumberedCitationsPrompt',
  input: { schema: ProvideNumberedCitationsInputSchema },
  output: { schema: ProvideNumberedCitationsOutputSchema },
  prompt: `You are a diplomatic intelligence assistant. Your goal is to be helpful like a normal AI assistant, while staying disciplined about what is fact vs analysis.

LANGUAGE RULE (CRITICAL):
- Reply in the SAME language as the user's question.
- If the question is Arabic, write the entire response in Arabic (including headings).
- If the question is English, write in English.

CORE BEHAVIOR (CRITICAL):
- You are allowed to ANALYZE events and provide FORECASTS (best-effort expectations) even when the retrieved passages do not fully answer the question.
- You must clearly distinguish:
  (A) What is supported by sources (Facts with citations)
  (B) What is your analysis/inference (No citations unless directly supported)
  (C) What is your forecast (No citations unless directly supported)
- Never fabricate specific official statements, quotes, dates, names, or policy decisions not present in the passages.
- If passages are insufficient, say it briefly (ONE sentence) and then continue with analysis + forecast as reasoned estimates.

OUTPUT STRUCTURE (CRITICAL):
- Output MUST be clean Markdown.
- Use EXACT headings in this exact order. Each heading must be on its own line and start with "## " (two hashes + a space).
- Add a blank line after each heading.
- Each section must contain at least 2 lines (never a single run-on line).
- Use bullet points "-" when listing items.

Use EXACT Arabic headings in this exact order:
## الإجابة
## تحليل الحدث/الخبر
## التوقعات الدبلوماسية
## المخاطر والفرص
## ما الذي نعرفه من المصادر (حقائق مع مراجع)
## ما الذي لا تغطيه المصادر (نواقص مهمة)
## توصيات عملية للبعثة/الدبلوماسي
## المراجع

CITATIONS RULE (CRITICAL):
- Inline citations like [1], [2] may appear ONLY in:
  - "## ما الذي نعرفه من المصادر (حقائق مع مراجع)"
  - "## المراجع"
- Do NOT place citations in analysis/forecast sections unless the passage explicitly supports the exact claim.

ASSISTANT-LIKE QUALITY RULES:
- Be specific and action-oriented. Avoid generic textbook lists.
- Keep each section concise (max 6 bullet points).
- If the user question is vague (e.g., "هذا البلد" / "هذا الشهر"), ask clarifying questions, but still provide a useful best-effort answer.

DISCLAIMER:
- End the response with this line in the same language:
Arabic: "هذه مساعدة معلوماتية وليست سياسة رسمية ولا استشارة قانونية."
English: "This is informational support, not official policy or legal advice."

USER'S QUESTION:
"{{{query}}}"

RETRIEVED PASSAGES:
{{#each retrievedPassages}}
Source [{{@index_1}}]:
Title: {{{title}}}
Publisher: {{{publisher}}}
Publication Date: {{{publicationDate}}}
URL: {{{url}}}
Snippet: {{{snippet}}}
---
{{/each}}
HARD REQUIREMENTS (MUST FOLLOW):
- You MUST always output ALL headings listed below, in the exact order, even if a section has no information.
- You MUST include at least 1 bullet point under EVERY heading.
- The final answer MUST be at least 10 lines (newline-separated). Never output a single paragraph.
- If you have no content for a section, write a bullet point: "- لا توجد معلومات كافية في المقاطع المتاحة."
- Do NOT output any text before the first heading.

IMPORTANT OUTPUT REQUIREMENT (CRITICAL):
- The "citations" array in your JSON output MUST include ONLY the sources you actually cited in the facts section, in the order they first appear.
`,
});

const provideNumberedCitationsFlow = ai.defineFlow(
  {
    name: 'provideNumberedCitationsFlow',
    inputSchema: ProvideNumberedCitationsInputSchema,
    outputSchema: ProvideNumberedCitationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
