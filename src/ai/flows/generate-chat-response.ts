//src\ai\flows\generate-chat-response.ts
'use server';
/**
 * @fileOverview Generates responses to user chat messages.
 *
 * - generateChatResponse - A function that generates a response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const GenerateChatResponseInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string().describe("The user's latest message."),
});
type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
});
type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;

// Wrapper function to be called from the client
export async function generateChatResponse(input: GenerateChatResponseInput): Promise<GenerateChatResponseOutput> {
  const response = await generateChatResponseFlow(input);
  return { response };
}

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const history = input.history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model' as 'user' | 'model',
        content: [{ text: m.content }],
    }));
    
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: 'You are a helpful AI assistant. Your goal is to provide accurate and up-to-date information. When asked about recent events, provide the most current information you have access to. If you cannot provide recent information on a topic, please state that your knowledge has a cutoff and you cannot provide real-time updates.',
      prompt: input.message,
      history: history,
    });

    return text;
  }
);
