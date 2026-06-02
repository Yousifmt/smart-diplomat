"use client";

import { useEffect, useState } from "react";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, User, ExternalLink } from "lucide-react";

// 1. دالة تنسيق النص
const formatMessageText = (text: string) => {
  if (!text) return null;
  
  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('📌') || trimmedLine.startsWith('🔍') || trimmedLine.startsWith('💡')) {
      return (
        <div key={index} className="font-bold text-base mt-4 mb-2 text-black">
          {trimmedLine}
        </div>
      );
    }
    
    if (trimmedLine === '') {
      return <div key={index} className="h-2" />; 
    }
    
    return (
      <div key={index} className="mb-2 leading-relaxed text-black/90">
        {trimmedLine}
      </div>
    );
  });
};

// 2. مكون تأثير الآلة الكاتبة (تمت إضافة خاصية onComplete)
function TypewriterMessage({ 
  content, 
  isAssistant, 
  onComplete 
}: { 
  content: string; 
  isAssistant: boolean; 
  onComplete: () => void;
}) {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    if (!isAssistant) {
      setDisplayedContent(content);
      onComplete(); // إنهاء فوري إذا كان المستخدم
      return;
    }

    let currentLength = 0;
    setDisplayedContent(''); 
    
    const timer = setInterval(() => {
      currentLength += 2;
      setDisplayedContent(content.slice(0, currentLength));
      
      if (currentLength >= content.length) {
        clearInterval(timer);
        onComplete(); // إخبار الواجهة بانتهاء الكتابة لإظهار المصادر
      }
    }, 15);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, isAssistant]);

  return (
    <div className="whitespace-pre-wrap">
      {formatMessageText(displayedContent)}
    </div>
  );
}

// 3. المكون الرئيسي للرسالة
export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  const [mounted, setMounted] = useState(false);
  // حالة جديدة: هل الذكاء الاصطناعي يكتب الآن؟ (تبدأ بـ نعم إذا كانت الرسالة منه)
  const [isTyping, setIsTyping] = useState(!isUser);

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
            <div className="relative text-black">
              <TypewriterMessage 
                content={message.content} 
                isAssistant={!isUser} 
                onComplete={() => setIsTyping(false)} // تحويل الحالة عند الانتهاء
              />
            </div>

            {/* لا نعرض المصادر إلا إذا انتهت الكتابة (!isTyping) */}
            {!isTyping && message.citations && message.citations.length > 0 && (
              <div className="relative mt-4 border-t border-gray-200 pt-3 animate-in fade-in duration-700">
                <div className="mb-2 text-xs font-semibold text-black/80">
                  المراجع (References)
                </div>

                <ul className="space-y-2">
                  {message.citations.map((c, i) => (
                    <li key={i} className="text-xs text-black/75">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
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