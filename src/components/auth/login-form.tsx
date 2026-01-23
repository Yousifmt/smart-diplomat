"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "../shared/logo";
import { useApp } from "@/providers/app-providers";

function nameFromEmail(email: string) {
  const left = (email.split("@")[0] ?? "User").trim() || "User";
  return left
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const displayName = useMemo(
    () => (email.trim() ? nameFromEmail(email.trim()) : null),
    [email]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const safeEmail = email.trim();
    if (!safeEmail || !password) return;

    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      setSession({ email: safeEmail, displayName });
      router.push("/chat");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      dir="rtl"
      lang="ar"
      className="w-full max-w-md rounded-3xl border bg-card/75 shadow-xl shadow-black/20 backdrop-blur"
    >
      <CardHeader className="flex flex-col items-center text-center pb-0" dir="rtl" lang="ar">
        {/* ICON */}
        <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-400/25 bg-indigo-500/10 shadow-sm">
          <div className="text-indigo-300">
            <Logo iconOnly /* className="text-indigo-300" */ />
          </div>
        </div>

        {/* TITLE (EN only) */}
        <div className="mt-4 whitespace-nowrap text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-sky-300 to-indigo-300">
          Smart Diplomat
        </div>

        {/* SUBTITLE */}
        <div className="mt-3 text-sm text-muted-foreground">
          مساعد دبلوماسي مبني على مصادر معتمدة
        </div>

        {/* SECTION TITLE */}
        <CardTitle className="mt-6 text-2xl font-bold tracking-tight">تسجيل الدخول</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">ادخل بريدك وكلمة المرور للمتابعة.</p>

        <div className="mt-6 h-px w-full bg-border/60" />
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-6">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              البريد الوظيفي
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@mission.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              required
              className="h-12 rounded-2xl bg-background/35 px-4 text-center text-base"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              كلمة المرور
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-12 rounded-2xl bg-background/35 px-4 text-center text-base"
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="mt-2 h-12 w-full rounded-2xl text-base font-semibold"
          >
            {busy ? "جاري الدخول…" : "دخول"}
          </Button>

          <p className="mt-1 text-center text-xs text-muted-foreground">
            باستخدامك للتطبيق فأنت توافق على الاستخدام لأغراض معلوماتية فقط.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
