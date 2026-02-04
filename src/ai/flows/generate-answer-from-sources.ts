// src/ai/flows/generate-answer-from-sources.ts
'use server';
/**
 * @fileOverview Generates answers to user questions based on provided sources.
 *
 * - generateAnswerFromSources - A function that generates answers from sources.
 * - GenerateAnswerFromSourcesInput - The input type for the generateAnswerFromSources function.
 * - GenerateAnswerFromSourcesOutput - The return type for the generateAnswerFromSources function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SourceSchema = z.object({
  name: z.string(),
  baseUrl: z.string(),
  category: z.string(),
  language: z.string(),
  tier: z.string(),
  enabled: z.boolean(),
});

export type Source = z.infer<typeof SourceSchema>;

const GenerateAnswerFromSourcesInputSchema = z.object({
  country: z.string().describe('The selected country.'),
  question: z.string().describe('The user question.'),
  sources: z.array(SourceSchema).describe('The approved sources for the country.'),
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
    .describe('Retrieved passages from the approved sources.'),
});

export type GenerateAnswerFromSourcesInput = z.infer<typeof GenerateAnswerFromSourcesInputSchema>;

const GenerateAnswerFromSourcesOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
  citations: z
    .array(
      z.object({
        title: z.string(),
        publisher: z.string(),
        publicationDate: z.string().optional(),
        url: z.string(),
      })
    )
    .describe('The citations for the answer.'),
});

export type GenerateAnswerFromSourcesOutput = z.infer<typeof GenerateAnswerFromSourcesOutputSchema>;

export async function generateAnswerFromSources(
  input: GenerateAnswerFromSourcesInput
): Promise<GenerateAnswerFromSourcesOutput> {
  return generateAnswerFromSourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerFromSourcesPrompt',
  input: { schema: GenerateAnswerFromSourcesInputSchema },
  output: { schema: GenerateAnswerFromSourcesOutputSchema },
  prompt: `You are a diplomatic intelligence chat assistant for envoys and diplomatic missions. You answer questions about political, policy, and diplomatic context for a selected country.

CRITICAL RULES:
1) FACTS: Only state factual claims that are explicitly supported by the retrieved passages below. Every factual claim must include an inline numbered citation like [1], [2], etc.
2) ANALYSIS/INFERENCE: You may provide reasoned analysis even if not explicitly stated in the passages, BUT you must clearly label it as "Analysis" and include assumptions, a confidence level (High/Medium/Low), and verification steps. Do NOT present analysis as fact. Do not add citations to analysis unless it is directly supported by a passage.
3) If the retrieved passages do not contain enough information to answer the factual part of the question, explicitly say so in the Facts section and suggest what additional sources or a narrower question would help.

Tone: neutral, diplomatic, and careful. Avoid rumors and unverified social posts; prioritize official and reputable publications.

Include this disclaimer at the end: "This is informational support, not official policy or legal advice."

You must format the answer with these headings:
- Facts
- Analysis
- Recommendations
- References

Question: {{{question}}}

Use only the following retrieved passages:

{{#each retrievedPassages}}
Source [{{@index_1}}]
Title: {{{title}}}
Publisher: {{{publisher}}}
Publication Date: {{{publicationDate}}}
URL: {{{url}}}
Snippet: {{{snippet}}}

{{/each}}

Output must include:
1) "answer" string containing the formatted sections above, with inline citations like [1], [2].
2) "citations" array listing ONLY sources you cited, in the order they first appear (title, publisher, publicationDate if found, url).`,
});

const generateAnswerFromSourcesFlow = ai.defineFlow(
  {
    name: 'generateAnswerFromSourcesFlow',
    inputSchema: GenerateAnswerFromSourcesInputSchema,
    outputSchema: GenerateAnswerFromSourcesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
