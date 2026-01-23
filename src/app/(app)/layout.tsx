import type { ReactNode } from "react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen w-full bg-background">
        {/* ✅ مهم: flex-row-reverse = أول عنصر يصير على اليمين */}
        <div className="flex w-full flex-row-reverse">
          <AppSidebar />

          <SidebarInset className="min-w-0 flex-1">
            {/* Topbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-card/50 backdrop-blur">
  {/* ✅ نخلي الهيدر LTR عشان زر القائمة يصير يسار */}
  <div dir="ltr" className="flex w-full items-center justify-between px-4 py-3 md:px-6">
    {/* يسار الشاشة */}
    <div className="flex items-center gap-2">
      <SidebarTrigger className="md:hidden" aria-label="فتح القائمة">
        <Menu className="h-5 w-5" />
      </SidebarTrigger>

      {/* نخلي النص عربي RTL داخل بلوك مستقل */}
      <div dir="rtl" className="text-sm font-semibold tracking-tight">
        Smart Diplomat
      </div>
    </div>

    <div />
  </div>
</header>


            <main className="w-full px-4 py-4 md:px-6 md:py-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
