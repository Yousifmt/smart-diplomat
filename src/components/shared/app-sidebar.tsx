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

  // ✅ shadcn sidebar context: closes offcanvas on mobile
  const { isMobile, setOpenMobile } = useSidebar();

  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const navBtnBase =
    "text-amber-100/85 hover:text-amber-100 hover:bg-amber-400/10 data-[active=true]:bg-amber-400/12 data-[active=true]:text-amber-100";

  return (
    <Sidebar
      collapsible="offcanvas"
      dir="rtl"
      lang="ar"
      className="
        border-l border-amber-400/10
        bg-sidebar text-sidebar-foreground
      "
    >
      <SidebarHeader className="px-3 py-4">
        <Link href="/chat" onClick={closeIfMobile} className="flex items-center gap-3 px-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl",
              "border border-amber-400/14",
              "bg-amber-400/8 text-amber-200 shadow-sm"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-amber-100/95">Smart Diplomat</div>
            <div className="text-xs text-sidebar-foreground/65">
              مساعد ذكاء للمعلومات الدبلوماسية
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="bg-amber-400/10" />

      <SidebarContent className="px-2 sidebar-scroll">
        {/* Quick actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/65">إجراءات سريعة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="محادثة جديدة" className={navBtnBase}>
                  <Link href="/chat" onClick={closeIfMobile}>
                    <PlusCircle className="text-amber-300" />
                    <span>محادثة جديدة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-amber-400/10" />

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/65">التنقّل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/chat")}
                  className={navBtnBase}
                >
                  <Link href="/chat" onClick={closeIfMobile}>
                    <BotMessageSquare className="text-amber-300" />
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
                    <Settings className="text-amber-300" />
                    <span>الإدارة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-amber-400/10" />

        {/* Country context */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/65">سياق الدولة</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1" onClick={closeIfMobile}>
              {/* If you DON'T want it to close when selecting country, remove onClick above */}
              <CountrySelector />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-amber-400/10" />

        {/* Suggested questions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/65">اقتراحات الأسئلة</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2 pb-2">
              {suggestedQuestions.map((q) => (
                <Link
                  key={q}
                  href={`/chat?q=${encodeURIComponent(q)}`}
                  onClick={closeIfMobile} // ✅ auto close on mobile
                  className="
                    block rounded-2xl border border-amber-400/12
                    bg-amber-400/6 px-3 py-2 text-xs
                    text-amber-100/75
                    transition
                    hover:bg-amber-400/10 hover:text-amber-100
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
        <div className="text-[11px] text-sidebar-foreground/65">
          دعم معلوماتي فقط — وليس سياسة رسمية أو استشارة قانونية.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
