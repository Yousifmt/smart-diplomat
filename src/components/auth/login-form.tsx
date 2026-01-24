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
  return left.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

  const inputClass =
    "h-12 rounded-2xl bg-blue-50/80 px-4 text-center border-blue-200 " +
    "text-[16px] md:text-sm text-blue-950 placeholder:text-blue-900/40 " +
    "focus-visible:ring-2 focus-visible:ring-blue-500/30";

  return (
    <Card
      dir="rtl"
      lang="ar"
      className="
        w-full max-w-md overflow-hidden rounded-[28px]
        border border-blue-200/80
        bg-white/80 shadow-xl shadow-blue-900/10
        backdrop-blur
      "
    >
      <CardHeader className="relative flex flex-col items-center text-center pb-0">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-blue-300/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" />
        </div>

        <div className="relative mt-2 flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-200 bg-blue-50 shadow-sm">
          <div className="text-blue-950">
            <Logo iconOnly />
          </div>
        </div>

        <div className="relative mt-4 whitespace-nowrap text-3xl font-extrabold tracking-tight text-blue-950">
          Smart Diplomat
        </div>

        <div className="relative mt-3 text-sm text-blue-950/75">
          مساعد دبلوماسي مبني على مصادر معتمدة
        </div>

        <CardTitle className="relative mt-6 text-2xl font-bold tracking-tight text-blue-950">
          تسجيل الدخول
        </CardTitle>
        <p className="relative mt-2 text-sm text-blue-950/75">
          ادخل بريدك وكلمة المرور للمتابعة.
        </p>

        <div className="relative mt-6 h-px w-full bg-gradient-to-l from-transparent via-blue-200 to-transparent" />
      </CardHeader>

      <CardContent className="relative px-6 pb-6 pt-6">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-semibold text-blue-950">
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
              className={inputClass}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-semibold text-blue-950">
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
              className={inputClass}
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="
              mt-2 h-12 w-full rounded-2xl text-base font-semibold
              bg-blue-600 text-white hover:bg-blue-700
              shadow-md shadow-blue-900/15
            "
          >
            {busy ? "جاري الدخول…" : "دخول"}
          </Button>

          <p className="mt-1 text-center text-xs text-blue-950/70">
            باستخدامك للتطبيق فأنت توافق على الاستخدام لأغراض معلوماتية فقط.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
