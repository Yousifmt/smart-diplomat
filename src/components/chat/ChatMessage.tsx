import { useEffect, useState } from "react";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, User, ExternalLink } from "lucide-react";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  // subtle appear animation
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
        {/* Avatar */}
        <div
          className={cn(
            "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
            isUser
              ? "bg-muted/50 text-foreground border-border/70"
              : "bg-primary text-primary-foreground border-primary/30"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Bubble */}
        <div className={cn("flex-1", isUser ? "flex justify-end" : "flex justify-start")}>
          <div
            dir="rtl"
            lang="ar"
            className={cn(
              "relative max-w-[92%] md:max-w-[85%]",
              "rounded-[22px] border px-4 py-3 text-sm leading-relaxed shadow-sm",
              isUser
                ? "bg-primary text-primary-foreground border-primary/30 rounded-tr-md"
                : "bg-background/70 text-foreground border-border/70 rounded-tl-md backdrop-blur"
            )}
          >
            {/* assistant bubble glow */}
            {!isUser && (
              <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(70%_60%_at_40%_0%,rgba(59,130,246,0.10)_0%,rgba(0,0,0,0)_60%)]" />
            )}

            <div className="relative whitespace-pre-wrap">{message.content}</div>

            {message.citations && message.citations.length > 0 && (
              <div className="relative mt-4 border-t border-border/60 pt-3">
                <div className="mb-2 text-xs font-semibold text-muted-foreground">
                  References
                </div>
                <ul className="space-y-2">
                  {message.citations.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                      >
                        <span>
                          {i + 1}. {c.title}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="ms-2 opacity-90">({c.publisher})</span>
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
