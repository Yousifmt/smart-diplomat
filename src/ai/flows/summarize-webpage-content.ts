// src/ai/flows/summarize-webpage-content.ts
'use server';
/**
 * @fileOverview Summarizes the content of a webpage given its URL.
 *
 * - summarizeWebpageContent - A function that summarizes the content of a webpage.
 * - SummarizeWebpageContentInput - The input type for the summarizeWebpageContent function.
 * - SummarizeWebpageContentOutput - The return type for the summarizeWebpageContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeWebpageContentInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage to summarize.'),
});
export type SummarizeWebpageContentInput = z.infer<typeof SummarizeWebpageContentInputSchema>;

const SummarizeWebpageContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the webpage content.'),
});
export type SummarizeWebpageContentOutput = z.infer<typeof SummarizeWebpageContentOutputSchema>;

export async function summarizeWebpageContent(
  input: SummarizeWebpageContentInput
): Promise<SummarizeWebpageContentOutput> {
  return summarizeWebpageContentFlow(input);
}

const summarizeWebpageContentPrompt = ai.definePrompt({
  name: 'summarizeWebpageContentPrompt',
  input: { schema: SummarizeWebpageContentInputSchema },
  output: { schema: SummarizeWebpageContentOutputSchema },
  prompt: `Summarize the content of the webpage at the following URL.

URL: {{{url}}}

Guidelines:
- Provide a concise summary with key points.
- If the content is not accessible from the provided URL in your environment, say so and suggest providing the text directly.`,
});

const summarizeWebpageContentFlow = ai.defineFlow(
  {
    name: 'summarizeWebpageContentFlow',
    inputSchema: SummarizeWebpageContentInputSchema,
    outputSchema: SummarizeWebpageContentOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeWebpageContentPrompt(input);
    return output!;
  }
);
