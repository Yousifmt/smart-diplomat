"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Message, Citation } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";

import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";

import { useApp } from "@/providers/app-providers";
import { askDiplomat } from "@/actions/ask";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Trash2 } from "lucide-react";

function normalizeError(err: unknown) {
  if (!err) return "خطأ غير معروف.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return "خطأ غير معروف (غير قابل للعرض).";
  }
}

function normalizeCitations(input: any): Citation[] {
  const arr = Array.isArray(input) ? input : [];
  return arr.map((c: any) => ({
    title: String(c?.title ?? ""),
    publisher: String(c?.publisher ?? ""),
    url: String(c?.url ?? ""),
    publicationDate: c?.publicationDate ? String(c.publicationDate) : undefined,
  }));
}

export function ChatInterface() {
  const { country } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const inFlightRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => !isLoading && !inFlightRef.current, [isLoading]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    requestAnimationFrame(() => scrollToBottom("auto"));
  }, [scrollToBottom]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      if (!canSend) return;

      inFlightRef.current = true;
      setIsLoading(true);

      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), role: "user", content: trimmed, createdAt: new Date() },
      ]);

      requestAnimationFrame(() => scrollToBottom());

      try {
        const res = await askDiplomat({ country, query: trimmed });
        const answer = String(res?.answer ?? "");
        const citations = normalizeCitations(res?.citations);

        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content: answer,
            citations,
            createdAt: new Date(),
          },
        ]);
      } catch (err) {
        const msg = normalizeError(err);
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content:
              `صار خطأ أثناء الإجابة.\n\n` +
              `التفاصيل: ${msg}\n\n` +
              `تأكد من:\n` +
              `- صلاحيات Firestore Rules\n` +
              `- وجود GEMINI_API_KEY\n` +
              `- إضافة مصادر فيها rssUrl أو passages من لوحة Admin`,
            createdAt: new Date(),
          },
        ]);
      } finally {
        inFlightRef.current = false;
        setIsLoading(false);
        requestAnimationFrame(() => scrollToBottom());
      }
    },
    [canSend, country, scrollToBottom]
  );

  useEffect(() => {
    const question = searchParams.get("q");
    if (!question) return;

    const decoded = decodeURIComponent(question);
    handleSendMessage(decoded);
    router.replace("/chat", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="relative h-[calc(100vh-48px)]" dir="rtl" lang="ar">
      {/* Midnight blue luxury background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(59,130,246,0.26)_0%,rgba(0,0,0,0)_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_18%_18%,rgba(245,158,11,0.12)_0%,rgba(0,0,0,0)_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_100%,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0)_55%)]" />
        <div className="absolute inset-0 opacity-[0.55] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      </div>

      {/* Shell */}
      <div
        className="
          h-full flex flex-col overflow-hidden rounded-[28px]
          border border-amber-400/14
          bg-card/80 shadow-2xl shadow-black/35 backdrop-blur-xl
        "
      >
        {/* Header */}
        <div className="shrink-0 border-b border-amber-400/10 bg-card/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-4">
            <div className="flex min-w-0 items-center gap-2">
              <div className="font-semibold tracking-tight text-amber-100/95">
                Smart Diplomat
              </div>

              <Badge className="gap-1 border border-amber-400/14 bg-amber-400/10 text-amber-100/90">
                <Globe className="h-3.5 w-3.5 text-amber-300" />
                {country}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0 || isLoading}
              className="gap-2 text-amber-100/90 hover:bg-amber-400/10 hover:text-amber-100"
            >
              <Trash2 className="h-4 w-4 text-amber-300" />
              مسح
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-5 py-6" dir="ltr">
            {messages.length === 0 && !isLoading ? (
              <div
                className="
                  mx-auto max-w-2xl rounded-[26px]
                  border border-amber-400/14
                  bg-background/45 p-10 text-center
                  shadow-lg shadow-black/25
                "
                dir="rtl"
                lang="ar"
              >
                <div className="text-base font-semibold text-amber-100/95">
                  ابدأ بسؤال دبلوماسي
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  اختر دولة من الشريط الجانبي ثم اكتب سؤالك.
                </p>

                <div className="mt-6 grid gap-3 text-right text-sm text-muted-foreground">
                  <div className="rounded-2xl border border-amber-400/12 bg-amber-400/5 px-4 py-3">
                    مثال: ما آخر التطورات في العلاقات بين X و Y؟
                  </div>
                  <div className="rounded-2xl border border-amber-400/12 bg-amber-400/5 px-4 py-3">
                    مثال: لخص لي أهم الأخبار السياسية في الدولة المختارة مع مصادر.
                  </div>
                </div>
              </div>
            ) : (
              <ChatMessages messages={messages} isLoading={isLoading} />
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-amber-400/10 bg-card/70 backdrop-blur">
          <div className="mx-auto w-full max-w-4xl px-5 py-4" dir="rtl">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="اكتب رسالتك هنا..."
            />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              هذا دعم معلوماتي فقط، وليس سياسة رسمية أو استشارة قانونية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
