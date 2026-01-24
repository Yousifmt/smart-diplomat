"use client";

import type { Message } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { Bot } from "lucide-react";

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Typing">
      <span className="h-2 w-2 rounded-full bg-blue-900/45 animate-bounce" />
      <span className="h-2 w-2 rounded-full bg-blue-900/45 animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="h-2 w-2 rounded-full bg-blue-900/45 animate-bounce" style={{ animationDelay: "240ms" }} />
    </div>
  );
}

export function ChatMessages({ messages, isLoading }: { messages: Message[]; isLoading: boolean }) {
  return (
    <div className="space-y-6">
      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} />
      ))}

      {isLoading && (
        <div className="w-full flex justify-start">
          <div className="flex w-full max-w-3xl gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-950">
              <Bot className="h-4 w-4" />
            </div>

            <div className="flex-1 flex justify-start">
              <div
                dir="rtl"
                lang="ar"
                className="relative max-w-[70%] rounded-[22px] rounded-tl-md border border-blue-200 bg-white/80 px-4 py-3 text-sm text-blue-950 shadow-sm backdrop-blur"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(70%_60%_at_40%_0%,rgba(37,99,235,0.10)_0%,rgba(0,0,0,0)_60%)]" />
                <div className="relative">
                  <TypingDots />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
