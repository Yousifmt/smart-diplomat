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
          "rounded-[26px] border border-blue-200 bg-white/70 backdrop-blur",
          "shadow-sm transition-colors hover:bg-white/85",
          "focus-within:ring-2 focus-within:ring-blue-400/25"
        )}
      >
        <div className="flex items-stretch gap-2 p-3">
          <div className="flex-1">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent outline-none",
                "text-[16px] md:text-[14px] leading-6", // ✅ iOS no-zoom
                "text-slate-950 placeholder:text-slate-500",
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

          <div className="shrink-0">
            <Button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              className={cn(
                "h-[48px] w-[54px] rounded-2xl p-0",
                "bg-blue-200 text-slate-950 shadow-md shadow-blue-900/10",
                "hover:bg-blue-300/80 active:bg-blue-300",
                "disabled:opacity-50"
              )}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-t border-blue-200 px-3 py-2">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5">
              Enter للإرسال
            </span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5">
              Shift+Enter سطر جديد
            </span>
          </div>
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
