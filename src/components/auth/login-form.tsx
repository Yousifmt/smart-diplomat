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
  const [error, setError] = useState("");

  const displayName = useMemo(
    () => (email.trim() ? nameFromEmail(email.trim()) : null),
    [email]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (busy) return;

    const safeEmail = email.trim();

    if (!safeEmail || !password) {
      setError("يرجى إدخال البريد وكلمة المرور.");
      return;
    }

    if (password !== "12345") {
      setError("كلمة المرور غير صحيحة.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      await new Promise((r) => setTimeout(r, 450));

      setSession({
        email: safeEmail,
        displayName,
      });

      router.push("/chat");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "h-12 rounded-2xl border-white/10 bg-white/[0.07] px-4 text-center " +
    "text-[16px] md:text-sm text-white placeholder:text-blue-100/40 " +
    "shadow-sm shadow-blue-950/20 backdrop-blur " +
    "focus-visible:border-blue-400/40 focus-visible:ring-2 focus-visible:ring-blue-400/25";

  return (
    <Card
      dir="rtl"
      lang="ar"
      className="
        w-full max-w-md overflow-hidden rounded-[28px]
        border border-white/10
        bg-slate-950/70 text-white
        shadow-2xl shadow-blue-950/40
        backdrop-blur-xl
      "
    >
      <CardHeader className="relative flex flex-col items-center pb-0 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative mt-2 flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-400/25 bg-blue-500/15 shadow-lg shadow-blue-950/25">
          <div className="text-blue-100">
            <Logo iconOnly />
          </div>
        </div>

        <div className="relative mt-4 whitespace-nowrap text-3xl font-extrabold tracking-tight text-white">
          Smart Diplomat
        </div>

        <div className="relative mt-3 text-sm text-blue-100/70">
          مساعد دبلوماسي مبني على مصادر معتمدة
        </div>

        <CardTitle className="relative mt-6 text-2xl font-bold tracking-tight text-white">
          تسجيل الدخول
        </CardTitle>

        <p className="relative mt-2 text-sm text-blue-100/70">
          ادخل بريدك وكلمة المرور للمتابعة.
        </p>

        <div className="relative mt-6 h-px w-full bg-gradient-to-l from-transparent via-blue-400/30 to-transparent" />
      </CardHeader>

      <CardContent className="relative px-6 pb-6 pt-6">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-blue-100/85"
            >
              البريد الوظيفي
            </Label>

            <Input
              id="email"
              type="email"
              placeholder="name@mission.gov"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              inputMode="email"
              required
              className={inputClass}
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-blue-100/85"
            >
              كلمة المرور
            </Label>

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="
              mt-2 h-12 w-full rounded-2xl text-base font-semibold
              bg-blue-500 text-white shadow-lg shadow-blue-950/30
              hover:bg-blue-400 active:bg-blue-600
              disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none
            "
          >
            {busy ? "جاري الدخول…" : "دخول"}
          </Button>

          <p className="mt-1 text-center text-xs text-blue-100/60">
            باستخدامك للتطبيق فأنت توافق على الاستخدام لأغراض معلوماتية فقط.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}