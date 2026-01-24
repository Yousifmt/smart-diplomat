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
      className="
        relative w-full max-w-md overflow-hidden rounded-[28px]
        border border-amber-400/20
        bg-card/70 shadow-2xl shadow-black/35 backdrop-blur-xl
      "
    >
      {/* Premium background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      </div>

      <CardHeader className="relative flex flex-col items-center text-center pb-0">
        {/* ICON */}
        <div
          className="
            mt-2 flex h-16 w-16 items-center justify-center rounded-3xl
            border border-amber-400/25 bg-blue-500/10 shadow-sm
          "
        >
          <div className="text-amber-300 drop-shadow">
            <Logo iconOnly />
          </div>
        </div>

        {/* TITLE */}
        <div
          className="
            mt-4 whitespace-nowrap text-3xl font-extrabold tracking-tight
            text-transparent bg-clip-text
            bg-gradient-to-l from-amber-200 via-yellow-300 to-amber-400
          "
        >
          Smart Diplomat
        </div>

        {/* SUBTITLE */}
        <div className="mt-3 text-sm text-muted-foreground">
          مساعد دبلوماسي مبني على مصادر معتمدة
        </div>

        {/* SECTION TITLE */}
        <CardTitle className="mt-6 text-2xl font-bold tracking-tight text-amber-200">
          تسجيل الدخول
        </CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          ادخل بريدك وكلمة المرور للمتابعة.
        </p>

        <div className="mt-6 h-px w-full bg-gradient-to-l from-transparent via-amber-400/25 to-transparent" />
      </CardHeader>

      <CardContent className="relative px-6 pb-6 pt-6">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-semibold text-amber-100/95">
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
              className="
                h-12 rounded-2xl bg-background/30 px-4 text-center text-base
                border-amber-400/20
                focus-visible:ring-2 focus-visible:ring-blue-400/40
                focus-visible:border-amber-300/45
                placeholder:text-amber-100/40
              "
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-semibold text-amber-100/95">
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
              className="
                h-12 rounded-2xl bg-background/30 px-4 text-center text-base
                border-amber-400/20
                focus-visible:ring-2 focus-visible:ring-blue-400/40
                focus-visible:border-amber-300/45
                placeholder:text-amber-100/40
              "
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="
              mt-2 h-12 w-full rounded-2xl text-base font-semibold
              bg-gradient-to-l from-amber-300 via-yellow-300 to-amber-400
              text-slate-950
              shadow-lg shadow-black/25
              hover:brightness-[1.03]
              active:brightness-[0.98]
              disabled:opacity-70
            "
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
