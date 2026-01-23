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
} from "@/components/ui/sidebar";
import { BotMessageSquare, Database, Settings, PlusCircle, ShieldCheck } from "lucide-react";
import { CountrySelector } from "@/components/chat/country-selector";
import { cn } from "@/lib/utils";

const suggestedQuestions = [
  "لخّص آخر التصريحات الرسمية المتعلقة بالعقوبات والدبلوماسية.",
  "ما أهم أولويات السياسات لهذا البلد خلال هذا الشهر؟",
  "اذكر أبرز المخاطر الدبلوماسية وقدّم توصيات (مع الاستشهاد بالمصادر).",
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-l border-sidebar-border bg-sidebar text-sidebar-foreground"
      dir="rtl"
      lang="ar"
    >
      <SidebarHeader className="px-3 py-4">
        <Link href="/chat" className="flex items-center gap-3 px-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl",
              "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Smart Diplomat</div>
            <div className="text-xs text-sidebar-foreground/70">مساعد ذكاء للمعلومات الدبلوماسية</div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="bg-sidebar-border" />

      <SidebarContent className="px-2 sidebar-scroll">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">إجراءات سريعة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="محادثة جديدة">
                  <Link href="/chat">
                    <PlusCircle />
                    <span>محادثة جديدة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">التنقّل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/chat")}>
                  <Link href="/chat">
                    <BotMessageSquare />
                    <span>المحادثة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")}>
                  <Link href="/admin">
                    <Settings />
                    <span>الإدارة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">سياق الدولة</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1">
              <CountrySelector />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">اقتراحات الأسئلة</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2 pb-2">
              {suggestedQuestions.map((q) => (
                <Link
                  key={q}
                  href={`/chat?q=${encodeURIComponent(q)}`}
                  className="block rounded-2xl border border-sidebar-border bg-sidebar-background/40 px-3 py-2 text-xs text-sidebar-foreground/80 hover:bg-sidebar-background/70 hover:text-sidebar-foreground transition"
                >
                  {q}
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <div className="text-[11px] text-sidebar-foreground/70">
          دعم معلوماتي فقط — وليس سياسة رسمية أو استشارة قانونية.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
