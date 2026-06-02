//src\components\chat\ChatInput.tsx
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
  placeholder = "اكتب رسالتك هنا...",
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
          "chat-input-box",
          "overflow-hidden",
          "rounded-[26px]",
          "border border-white/10",
          "bg-[#243b72]",
          "shadow-xl shadow-black/10",
          "transition-all duration-200",
          "focus-within:border-blue-400",
          "focus-within:ring-2",
          "focus-within:ring-blue-400/25"
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
                "chat-input-field",
                "w-full resize-none",
                "rounded-2xl",
                "border border-gray-200",
                "bg-white",
                "text-black",
                "placeholder:text-gray-500",
                "outline-none",
                "text-[15px] md:text-[14px]",
                "leading-6",
                "min-h-[48px]",
                "py-3 px-4",
                "overflow-hidden",
                "shadow-sm",
                "focus:border-blue-400",
                "focus:ring-2",
                "focus:ring-blue-400/20"
              )}
              style={{
                background: "#ffffff",
                backgroundColor: "#ffffff",
                color: "#000000",
                WebkitTextFillColor: "#000000",
              }}
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  if (canSend) void send();
                }
              }}
            />
          </div>

          <Button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            aria-label="Send"
            className={cn(
              "h-[48px] w-[54px]",
              "rounded-2xl p-0",
              "bg-blue-500 text-white",
              "shadow-lg shadow-blue-500/20",
              "transition-all",
              "hover:bg-blue-400",
              "active:bg-blue-600",
              "disabled:bg-white/15",
              "disabled:text-white/40",
              "disabled:shadow-none",
              "disabled:opacity-100"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div
          className={cn(
            "chat-input-footer",
            "border-t border-white/10",
            "bg-[#243b72]",
            "px-3 py-2",
            "rounded-b-[26px]"
          )}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-blue-100/70">
            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5">
              Enter للإرسال
            </span>

            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5">
              Shift + Enter سطر جديد
            </span>
          </div>
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}