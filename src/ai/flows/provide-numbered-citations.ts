//src\ai\flows\provide-numbered-citations.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that processes user queries, retrieves information from approved sources,
 * and provides answers with numbered citations linked to the source URLs.
 *
 * - provideNumberedCitations - A function that processes the user query and returns the answer with citations.
 * - ProvideNumberedCitationsInput - The input type for the provideNumberedCitations function.
 * - ProvideNumberedCitationsOutput - The return type for the provideNumberedCitations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideNumberedCitationsInputSchema = z.object({
  query: z.string().describe('The user query.'),
  country: z.string().describe('The country context for the query.'),
  approvedSources: z.array(
    z.object({
      name: z.string(),
      baseUrl: z.string(),
      category: z.string(),
      language: z.string(),
      tier: z.string(),
      enabled: z.boolean(),
    })
  ).describe('List of approved sources for the country.'),
  retrievedPassages: z.array(
    z.object({
      title: z.string(),
      publisher: z.string(),
      publicationDate: z.string().optional(),
      url: z.string(),
      snippet: z.string(),
    })
  ).describe('Retrieved passages from approved sources.'),
});
export type ProvideNumberedCitationsInput = z.infer<typeof ProvideNumberedCitationsInputSchema>;

const ProvideNumberedCitationsOutputSchema = z.object({
  answer: z.string().describe('The answer to the query, with inline numbered citations like [1], [2], etc.'),
  citations: z.array(
    z.object({
      title: z.string(),
      publisher: z.string(),
      publicationDate: z.string().optional(),
      url: z.string(),
    })
  ).describe('An array of the source documents that were cited in the answer, in the order they were cited.'),
});
export type ProvideNumberedCitationsOutput = z.infer<typeof ProvideNumberedCitationsOutputSchema>;

export async function provideNumberedCitations(input: ProvideNumberedCitationsInput): Promise<ProvideNumberedCitationsOutput> {
  return provideNumberedCitationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideNumberedCitationsPrompt',
  input: {schema: ProvideNumberedCitationsInputSchema},
  output: {schema: ProvideNumberedCitationsOutputSchema},
  prompt: `You are a diplomatic intelligence assistant. Your role is to provide neutral, factual answers to questions from diplomatic envoys and mission staff.

You MUST answer the user's question using ONLY the information provided in the retrieved passages below. If the passages do not contain enough information, you MUST state that you cannot answer the question with the provided sources.

GUIDELINES:
- Your answer must be in a neutral, diplomatic tone.
- Separate facts from analysis.
- For every factual claim, include a numbered citation corresponding to the source, like [1], [2], etc.
- The 'citations' array in your final JSON output must contain the full details for each source you cite, in the order they first appear in your answer.
- Include this disclaimer at the end of your answer: "This is informational support, not official policy or legal advice."

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
`,
});

const provideNumberedCitationsFlow = ai.defineFlow(
  {
    name: 'provideNumberedCitationsFlow',
    inputSchema: ProvideNumberedCitationsInputSchema,
    outputSchema: ProvideNumberedCitationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
