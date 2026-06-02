'use server';

/**
 * @fileOverview This file defines a Genkit flow that processes user queries, retrieves information from approved sources,
 * and provides answers with numbered citations linked to the source URLs.
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
  config: {
    temperature: 0.2, 
    topK: 32,
    topP: 0.8,
  },
  prompt: `أنت مساعد استخباراتي ودبلوماسي متقدم، مصمم خصيصاً لدعم الدبلوماسيين والمبتعثين العراقيين.
مهمتك هي تقديم إجابات دقيقة، تحليلية، ومنظمة بناءً على السياق (البلد: {{country}}) والمعلومات المسترجعة.

=== القواعد الأساسية (التزم بها بصرامة مطلقة) ===

1. هيكلة الإجابة والمسافات:
- 🚫 يُمنع استخدام أي رموز Markdown نهائياً (لا تستخدم ** أو ## أو #). اكتب كنص عادي تماماً.
- ⚠️ يجب وضع "سطر فارغ تماماً" (Double Line Break) بعد كل عنوان، وبعد كل فقرة، لفصل الكلام بصرياً.
- استخدم الرموز التعبيرية كعناوين رئيسية، مع إضافة نقطتين رأسيتين (:) في النهاية، بهذا التنسيق بالضبط:

📌 الخلاصة:
(اكتب الخلاصة هنا...)

🔍 التحليل والأبعاد:
(اكتب التحليل هنا...)

💡 التداعيات أو التوصيات:
(اكتب التوصيات هنا...)

2. أسلوب القوائم والنقاط:
- لا تستخدم الأرقام أو النجوم للقوائم. استخدم فقط الرمز (•) في بداية كل نقطة.
- يجب أن تضع سطر جديد بعد كل نقطة (•) لكي لا تتداخل النقاط مع بعضها.

3. الدقة والتوثيق (RAG):
- استند بشكل أساسي على "المقاطع المسترجعة" المرفقة.
- استخدم أرقاماً مرجعية في النص مثل [1] أو [2] عند ذكر معلومة مسترجعة.
- 🚫 يُمنع منعاً باتاً كتابة قائمة "المصادر" أو "المراجع" في نهاية الإجابة النصية. الواجهة تتكفل بذلك.

4. طول الإجابة والأسلوب:
- كن مباشراً، واضحاً، وابتعد عن اللغة الإنشائية الفضفاضة.
- أجب بنفس لغة السؤال (عربي/إنجليزي)، وبنبرة رسمية وهادئة تليق بالتقارير الدبلوماسية.

5. المخرجات وتنسيق JSON:
- مصفوفة الاقتباسات (citations) يجب أن تحتوي فقط على المصادر التي قمت بذكرها فعلياً في النص عبر الأرقام المرجعية [1]، [2].. الخ.


=== المعلومات المسترجعة (المصادر المتاحة) ===
{{#each retrievedPassages}}
Source [{{@index_1}}]:
Title: {{{title}}}
Publisher: {{{publisher}}}
Publication Date: {{{publicationDate}}}
URL: {{{url}}}
Snippet: {{{snippet}}}
---
{{/each}}

=== سؤال المستخدم ===
"{{{query}}}"
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