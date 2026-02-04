// src/ai/flows/generate-chat-response.ts
'use server';
/**
 * @fileOverview Generates responses to user chat messages.
 *
 * - generateChatResponse - A function that generates a response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
export async function generateChatResponse(
  input: GenerateChatResponseInput
): Promise<GenerateChatResponseOutput> {
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
    // Arabic-first system instruction + language mirroring rule
    const systemInstruction = `أنت مساعد ذكاء اصطناعي مفيد ومحايد.

قاعدة اللغة (مهمة جداً):
- لازم ترد بنفس لغة المستخدم.
- إذا المستخدم كتب بالعربية: رد بالعربية.
- إذا المستخدم كتب بالإنجليزية: رد بالإنجليزية.
- إذا المستخدم خلط لغتين: استخدم اللغة الغالبة أو اسأله أي لغة يفضّل.

ملاحظة القدرات:
- ما عندك وصول مباشر للويب أو بيانات لحظية إلا إذا التطبيق وفّر لك مصادر/أدوات.
- إذا سُئلت عن أحداث حديثة بدون مصادر، كن شفافاً واطلب رابط/مصدر أو اقترح استخدام نظام المصادر المعتمدة.
- افصل بين الحقائق والاستنتاجات، ووضّح الافتراضات بوضوح.
- تجنب اختلاق معلومات.

تعليمات الإخراج:
- أعطِ جواباً واضحاً ومباشراً.
- إذا كنت غير متأكد، قل ذلك واقترح ما يلزم للتأكد.`;

    // Build a single prompt string (most compatible with Genkit typings)
    const formattedHistory = (input.history || [])
      .map((m) => (m.role === 'user' ? `المستخدم: ${m.content}` : `المساعد: ${m.content}`))
      .join('\n');

    const fullPrompt = [
      `SYSTEM:\n${systemInstruction}`,
      formattedHistory ? `\n\nسجل المحادثة:\n${formattedHistory}` : '',
      `\n\nالمستخدم: ${input.message}\nالمساعد:`,
    ].join('');

    const { text } = await ai.generate(fullPrompt);

    return text;
  }
);
