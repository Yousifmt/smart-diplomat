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
          "rounded-[26px] border",
          "border-amber-400/14",
          "bg-amber-400/5 backdrop-blur",
          "shadow-sm transition-colors hover:bg-amber-400/7",
          "focus-within:border-amber-300/25 focus-within:ring-1 focus-within:ring-amber-300/15"
        )}
      >
        {/* Row */}
        <div className="flex items-stretch gap-2 p-3">
          {/* Textarea */}
          <div className="flex-1">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent outline-none",
                // ✅ iOS no-zoom: >= 16px on mobile
                "text-[16px] md:text-[14px] leading-6",
                "text-amber-100/95 placeholder:text-amber-100/35",
                "min-h-[48px] py-2 px-3",
                "overflow-hidden"
              )}
              autoCapitalize="sentences"
              autoCorrect="on"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) void send();
                }
              }}
            />
          </div>

          {/* Send Button (NOT yellow) */}
          <div className="shrink-0">
            <Button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              className={cn(
                "h-[48px] w-[54px] rounded-2xl p-0",
                "bg-gradient-to-l from-indigo-500 via-blue-600 to-indigo-600",
                "text-white shadow-lg shadow-black/25",
                "hover:brightness-[1.06] active:brightness-[0.98]",
                "disabled:opacity-50"
              )}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer hints */}
        <div className="border-t border-amber-400/10 px-3 py-2">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-amber-100/60">
            <span className="rounded-full border border-amber-400/14 bg-amber-400/5 px-2 py-0.5">
              Enter للإرسال
            </span>
            <span className="rounded-full border border-amber-400/14 bg-amber-400/5 px-2 py-0.5">
              Shift+Enter سطر جديد
            </span>
          </div>
        </div>
      </div>

      {/* Safe area for iPhone home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
