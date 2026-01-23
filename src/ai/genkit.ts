// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI()],
  // ✅ الأفضل: default model ref
  model: googleAI.model(process.env.GEMINI_MODEL_ID || "gemini-2.5-flash"),
});
