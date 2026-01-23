"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSendMessage: (message: string) => void | Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
};

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Message Smart Diplomat…",
}: ChatInputProps) {
  const [value, setValue] = React.useState("");

  const canSend = value.trim().length > 0 && !isLoading;

  const send = React.useCallback(async () => {
    const msg = value.trim();
    if (!msg || isLoading) return;

    setValue("");
    await onSendMessage(msg);
  }, [value, isLoading, onSendMessage]);

  return (
    <div className="w-full" dir="rtl" lang="ar">
      <div
        className={cn(
          "rounded-[26px] border border-border/80",
          "bg-muted/40 backdrop-blur",
          "shadow-sm transition-colors hover:bg-muted/50",
          "focus-within:border-border"
        )}
      >
        {/* ✅ Row: textarea + button (each has its own space) */}
        <div className="flex items-stretch gap-2 p-3">
          {/* Text area */}
          <div className="flex-1">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent outline-none",
                "text-[14px] leading-6 text-foreground placeholder:text-muted-foreground",
                "min-h-[46px] py-2 px-3",
                "overflow-hidden"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) void send();
                }
              }}
            />
          </div>

          {/* Button column (fixed width) */}
          <div className="shrink-0">
            <Button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              className={cn(
                "h-[46px] w-[52px] rounded-2xl p-0",
                "bg-primary text-primary-foreground shadow-sm",
                "hover:bg-primary/90 disabled:opacity-50"
              )}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer hints */}
        <div className="border-t border-border/70 px-3 py-2">
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-muted/30 px-2 py-0.5">
              Enter للإرسال
            </span>
            <span className="rounded-full border border-border/70 bg-muted/30 px-2 py-0.5">
              Shift+Enter سطر جديد
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
