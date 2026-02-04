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
import { BotMessageSquare, Settings, PlusCircle, ShieldCheck } from "lucide-react";
import { CountrySelector } from "@/components/chat/country-selector";
import { cn } from "@/lib/utils";

const suggestedQuestions = [
  "لخّص آخر التصريحات الرسمية المتعلقة بالعقوبات والدبلوماسية.",
  "ما أهم أولويات السياسات لهذا البلد خلال هذا الشهر؟",
  "اذكر أبرز المخاطر الدبلوماسية وقدّم توصيات (مع الاستشهاد بالمصادر).",
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const navBtnBase =
    "text-blue-950 hover:bg-blue-50 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-950";

  return (
    <Sidebar
      collapsible="offcanvas"
      dir="rtl"
      lang="ar"
      className="border-l border-blue-200 bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="px-3 py-4">
        <Link href="/chat" onClick={closeIfMobile} className="flex items-center gap-3 px-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl",
              "border border-blue-200",
              "bg-blue-50 text-blue-950 shadow-sm"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-blue-950">Smart Diplomat</div>
            <div className="text-xs text-blue-950/70">مساعد ذكاء للمعلومات الدبلوماسية</div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="bg-blue-200" />

      <SidebarContent className="px-2 sidebar-scroll">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-950/70">إجراءات سريعة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="محادثة جديدة" className={navBtnBase}>
                  <Link href="/chat" onClick={closeIfMobile}>
                    <PlusCircle className="text-blue-700" />
                    <span>محادثة جديدة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-blue-200" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-950/70">التنقّل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/chat")} className={navBtnBase}>
                  <Link href="/chat" onClick={closeIfMobile}>
                    <BotMessageSquare className="text-blue-700" />
                    <span>المحادثة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")} className={navBtnBase}>
                  <Link href="/admin" onClick={closeIfMobile}>
                    <Settings className="text-blue-700" />
                    <span>تدوين المعلومات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-blue-200" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-950/70">سياق الدولة</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* ✅ لا يغلق السايدبار عند الضغط على الدروب داون */}
            <div
              className="px-2 py-1"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <CountrySelector />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-blue-200" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-950/70">اقتراحات الأسئلة</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2 pb-2">
              {suggestedQuestions.map((q) => (
                <Link
                  key={q}
                  href={`/chat?q=${encodeURIComponent(q)}`}
                  onClick={closeIfMobile}
                  className="
                    block rounded-2xl border border-blue-200
                    bg-white/70 px-3 py-2 text-xs
                    text-blue-950/80 transition
                    hover:bg-blue-50 hover:text-blue-950
                  "
                >
                  {q}
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <div className="text-[11px] text-blue-950/70">
          دعم معلوماتي فقط — وليس سياسة رسمية أو استشارة قانونية.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
