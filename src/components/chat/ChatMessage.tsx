"use client";

import { useEffect, useState } from "react";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, User, ExternalLink } from "lucide-react";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className={cn("w-full flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex w-full max-w-3xl gap-3",
          isUser ? "flex-row-reverse" : "flex-row",
          "transition-all duration-200 ease-out",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        )}
      >
        <div
          className={cn(
            "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
            "border-gray-200 bg-white text-black shadow-sm"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div className={cn("flex-1", isUser ? "flex justify-end" : "flex justify-start")}>
          <div
            dir="rtl"
            lang="ar"
            data-role={message.role}
            className={cn(
              "relative max-w-[92%] md:max-w-[85%]",
              "rounded-[22px] border px-4 py-3 text-sm leading-relaxed shadow-sm",
              "border-gray-200 bg-white text-black",
              isUser ? "rounded-tr-md" : "rounded-tl-md"
            )}
          >
            <div className="relative whitespace-pre-wrap text-black">
              {message.content}
            </div>

            {message.citations && message.citations.length > 0 && (
              <div className="relative mt-4 border-t border-gray-200 pt-3">
                <div className="mb-2 text-xs font-semibold text-black/80">
                  References
                </div>

                <ul className="space-y-2">
                  {message.citations.map((c, i) => (
                    <li key={i} className="text-xs text-black/75">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <span>
                          {i + 1}. {c.title}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </a>

                      <span className="ms-2 opacity-90">
                        ({c.publisher})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}