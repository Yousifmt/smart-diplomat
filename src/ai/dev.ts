import { config } from 'dotenv';
config();

import '@/ai/flows/generate-answer-from-sources.ts';
import '@/ai/flows/summarize-webpage-content.ts';
import '@/ai/flows/provide-numbered-citations.ts';
import '@/ai/flows/generate-chat-response.ts';
