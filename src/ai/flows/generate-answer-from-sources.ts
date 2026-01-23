// src/ai/flows/generate-answer-from-sources.ts
'use server';
/**
 * @fileOverview Generates answers to user questions based on provided sources.
 *
 * - generateAnswerFromSources - A function that generates answers from sources.
 * - GenerateAnswerFromSourcesInput - The input type for the generateAnswerFromSources function.
 * - GenerateAnswerFromSourcesOutput - The return type for the generateAnswerFromSources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  retrievedPassages: z.array(z.object({
    title: z.string(),
    publisher: z.string(),
    publicationDate: z.string().optional(),
    url: z.string(),
    snippet: z.string(),
  })).describe('Retrieved passages from the approved sources.'),
});

export type GenerateAnswerFromSourcesInput = z.infer<typeof GenerateAnswerFromSourcesInputSchema>;

const GenerateAnswerFromSourcesOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
  citations: z.array(z.object({
    title: z.string(),
    publisher: z.string(),
    publicationDate: z.string().optional(),
    url: z.string(),
  })).describe('The citations for the answer.'),
});

export type GenerateAnswerFromSourcesOutput = z.infer<typeof GenerateAnswerFromSourcesOutputSchema>;

export async function generateAnswerFromSources(input: GenerateAnswerFromSourcesInput): Promise<GenerateAnswerFromSourcesOutput> {
  return generateAnswerFromSourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerFromSourcesPrompt',
  input: {schema: GenerateAnswerFromSourcesInputSchema},
  output: {schema: GenerateAnswerFromSourcesOutputSchema},
  prompt: `You are a diplomatic intelligence chat assistant for envoys and diplomatic missions. You answer questions about political, policy, and diplomatic context for a selected country.  You MUST provide references/citations for all factual claims.

Keep a neutral, diplomatic tone. Separate Facts vs Analysis vs Recommendations in the response. Avoid rumors and unverified social posts; prioritize official and reputable publications.

Include this disclaimer: "This is informational support, not official policy or legal advice."

Answer the following question: {{{question}}}

Use only the following sources to answer the question. If the sources do not contain the answer, say so and suggest a narrower question or suggest adding more approved sources.

{{#each retrievedPassages}}
  Title: {{{title}}}
  Publisher: {{{publisher}}}
  Publication Date: {{{publicationDate}}}
  URL: {{{url}}}
  Snippet: {{{snippet}}}
{{/each}}

Output must include References with numbered citations like [1] [2] and a list of:

title
publisher/source
publication date (if found)
URL`,
});

const generateAnswerFromSourcesFlow = ai.defineFlow(
  {
    name: 'generateAnswerFromSourcesFlow',
    inputSchema: GenerateAnswerFromSourcesInputSchema,
    outputSchema: GenerateAnswerFromSourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
