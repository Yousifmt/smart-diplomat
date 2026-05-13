"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  BotMessageSquare,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { CountrySelector } from "@/components/chat/country-selector";
import { cn } from "@/lib/utils";

const suggestedQuestions = [
  "لخّص آخر التصريحات الرسمية المتعلقة بالأزمات الدبلوماسية.",
  "ما أهم أولويات السياسات لهذا البلد خلال هذا الشهر؟",
  "اذكر أبرز الأزمات المتوقعة وقدّم التوصيات (مع الاستشهاد بالمصادر).",
];

export function AppSidebar() {
  const pathname = usePathname();

  const { isMobile, setOpenMobile } = useSidebar();

  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const navBtnBase = cn(
    "text-blue-100/85 transition",
    "hover:bg-white/10 hover:text-white",
    "data-[active=true]:bg-blue-500/20",
    "data-[active=true]:text-white",
    "data-[active=true]:shadow-sm",
    "data-[active=true]:shadow-blue-950/20"
  );

  return (
    <Sidebar
      collapsible="offcanvas"
      dir="rtl"
      lang="ar"
      className="
        border-l border-blue-200/10
        bg-[#0b1730]/92
        text-white
        backdrop-blur-xl
      "
    >
      {/* Header */}
      <SidebarHeader className="px-3 py-4">
        <Link
          href="/chat"
          onClick={closeIfMobile}
          className="
            flex items-center gap-3
            rounded-2xl px-2 py-2
            transition hover:bg-white/5
          "
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl",
              "border border-blue-300/25",
              "bg-blue-400/15",
              "text-blue-100",
              "shadow-lg shadow-blue-950/25"
            )}
          >
            <ShieldCheck className="h-5 w-5 text-blue-200" />
          </div>

          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-white">
              Smart Diplomat
            </div>

            <div className="text-xs text-blue-100/65">
              مساعد ذكاء إصطناعي للمعلومات الدبلوماسية
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="bg-blue-200/10" />

      {/* Content */}
      <SidebarContent className="px-2 sidebar-scroll">

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100/60">
            التنقّل
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/chat")}
                  className={navBtnBase}
                >
                  <Link href="/chat" onClick={closeIfMobile}>
                    <BotMessageSquare className="text-blue-200" />
                    <span>المحادثة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/admin")}
                  className={navBtnBase}
                >
                  <Link href="/admin" onClick={closeIfMobile}>
                    <Settings className="text-blue-200" />
                    <span>تدوين المعلومات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-blue-200/10" />

        {/* Country */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100/60">
            الدولة
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <div
              className="px-2 py-1"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div
                className="
                  country-select-white
                  rounded-2xl
                  border border-gray-200
                  bg-white
                  p-1
                  shadow-sm
                "
              >
                <CountrySelector />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-blue-200/10" />

        {/* Suggested Questions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100/60">
            اقتراحات الأسئلة
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <div className="space-y-2 px-2 pb-2">

              {suggestedQuestions.map((q) => (
                <Link
                  key={q}
                  href={`/chat?q=${encodeURIComponent(q)}`}
                  onClick={closeIfMobile}
                  className={cn(
                    "block rounded-2xl",
                    "border border-white/80",
                    "bg-white",
                    "px-3 py-3",
                    "text-[12px]",
                    "font-normal",
                    "text-black",
                    "shadow-sm shadow-blue-950/15",
                    "transition",
                    "hover:bg-blue-50"
                  )}
                >
                  {q}
                </Link>
              ))}

            </div>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-blue-200/10 px-4 py-3">
        <div className="text-[11px] leading-5 text-blue-100/60">
          دعم معلوماتي فقط — وليس سياسة رسمية أو استشارة قانونية.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}