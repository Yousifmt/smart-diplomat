import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "Smart Diplomat",
  description: "مساعد دبلوماسي ذكي مبني على مصادر معتمدة.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="font-body antialiased bg-background text-foreground" suppressHydrationWarning>
        <AuthProvider>
          <AppProviders>
            {children}
            <Toaster />
          </AppProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
