// src/app/(app)/admin/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useApp } from "@/providers/app-providers";
import { addPassage, getPassagesByCountry, deletePassage } from "@/actions/passages";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Globe, RefreshCcw, Trash2 } from "lucide-react";

import { CountrySelector } from "@/components/chat/country-selector";

function trimOrDelete(fd: FormData, key: string) {
  const raw = fd.get(key);
  const val = String(raw ?? "").trim();
  if (!val) fd.delete(key);
  else fd.set(key, val);
}

function ManualInfoForm({ onSaved }: { onSaved: () => void }) {
  const { toast } = useToast();
  const { country } = useApp();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("country", country);

        trimOrDelete(fd, "sourceName");
        trimOrDelete(fd, "publisher");
        trimOrDelete(fd, "title");
        trimOrDelete(fd, "url");
        trimOrDelete(fd, "snippet");
        trimOrDelete(fd, "publicationDate");

        startTransition(async () => {
          const res = await addPassage(fd);
          if (res?.error) {
            toast({ variant: "destructive", title: "فشل الحفظ", description: res.error });
            return;
          }
          toast({ title: "تم الحفظ", description: "تمت إضافة المعلومات اليدوية." });
          formRef.current?.reset();
          onSaved();
        });
      }}
    >
      <input type="hidden" name="country" value={country} />

      {/* ✅ Mobile perfect grid */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-amber-100/90">اسم المصدر</Label>
          <Input
            name="sourceName"
            required
            className="
              h-12 rounded-2xl bg-background/30
              border-amber-400/14
              text-[16px] md:text-sm
              text-amber-100/90
              placeholder:text-amber-100/30
              focus-visible:ring-2 focus-visible:ring-blue-400/30
              focus-visible:border-amber-300/30
            "
            placeholder="مثال: وزارة الخارجية"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-amber-100/90">الناشر</Label>
          <Input
            name="publisher"
            required
            className="
              h-12 rounded-2xl bg-background/30
              border-amber-400/14
              text-[16px] md:text-sm
              text-amber-100/90
              placeholder:text-amber-100/30
              focus-visible:ring-2 focus-visible:ring-blue-400/30
              focus-visible:border-amber-300/30
            "
            placeholder="مثال: Official Gazette"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-amber-100/90">العنوان</Label>
        <Input
          name="title"
          required
          className="
            h-12 rounded-2xl bg-background/30
            border-amber-400/14
            text-[16px] md:text-sm
            text-amber-100/90
            placeholder:text-amber-100/30
            focus-visible:ring-2 focus-visible:ring-blue-400/30
            focus-visible:border-amber-300/30
          "
          placeholder="عنوان مختصر وواضح"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-amber-100/90">الرابط</Label>
          <Input
            name="url"
            required
            inputMode="url"
            className="
              h-12 rounded-2xl bg-background/30
              border-amber-400/14
              text-[16px] md:text-sm
              text-amber-100/90
              placeholder:text-amber-100/30
              focus-visible:ring-2 focus-visible:ring-blue-400/30
              focus-visible:border-amber-300/30
            "
            placeholder="https://example.gov/..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-amber-100/90">تاريخ النشر (اختياري)</Label>
          <Input
            name="publicationDate"
            placeholder="2026-01-22"
            inputMode="numeric"
            className="
              h-12 rounded-2xl bg-background/30
              border-amber-400/14
              text-[16px] md:text-sm
              text-amber-100/90
              placeholder:text-amber-100/30
              focus-visible:ring-2 focus-visible:ring-blue-400/30
              focus-visible:border-amber-300/30
            "
          />
          <p className="text-[11px] text-muted-foreground">
            صيغة مقترحة: YYYY-MM-DD
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-amber-100/90">المحتوى</Label>
        <Textarea
          name="snippet"
          rows={7}
          required
          className="
            rounded-2xl bg-background/30
            border-amber-400/14
            text-[16px] md:text-sm
            text-amber-100/90
            placeholder:text-amber-100/30
            focus-visible:ring-2 focus-visible:ring-blue-400/30
            focus-visible:border-amber-300/30
          "
          placeholder="اكتب المحتوى/المعلومة هنا..."
        />
      </div>

      {/* Buttons row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          disabled={isPending}
          className="
            h-12 rounded-2xl
            bg-gradient-to-l from-indigo-500 via-blue-600 to-indigo-600
            text-white shadow-lg shadow-black/25
            hover:brightness-[1.06] active:brightness-[0.98]
            disabled:opacity-60
          "
        >
          {isPending ? "جاري الحفظ..." : "إضافة معلومات يدوية"}
        </Button>

        <div className="text-xs text-muted-foreground text-center sm:text-left">
          تُحفظ البيانات ضمن سياق الدولة المحددة.
        </div>
      </div>

      {/* Safe area for iPhone home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </form>
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  const { country } = useApp();

  const [manualInfos, setManualInfos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const p = await getPassagesByCountry(country, 200);
    setManualInfos(p);
    setLoading(false);
  }, [country]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDelete = async (id: string) => {
    const ok = window.confirm("أكيد تبي تحذف هذا العنصر؟");
    if (!ok) return;

    setDeletingId(id);

    // Optimistic UI
    const prev = manualInfos;
    setManualInfos((x) => x.filter((p) => p.id !== id));

    try {
      const res = await deletePassage(id);
      if (res?.error) throw new Error(res.error);

      toast({ title: "تم الحذف", description: "تم حذف المعلومات اليدوية." });
    } catch (e: any) {
      setManualInfos(prev);
      toast({
        variant: "destructive",
        title: "فشل الحذف",
        description: e?.message ?? "خطأ غير متوقع.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative space-y-6" dir="rtl" lang="ar">
      {/* Background similar to chat */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(59,130,246,0.22)_0%,rgba(0,0,0,0)_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_18%_18%,rgba(245,158,11,0.10)_0%,rgba(0,0,0,0)_58%)]" />
        <div className="absolute inset-0 opacity-[0.55] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-amber-100/95">
              الإدارة
            </h1>
            <Badge className="gap-1 border border-amber-400/14 bg-amber-400/10 text-amber-100/90">
              <Globe className="h-3.5 w-3.5 text-amber-300" />
              {country}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">إضافة/إدارة المعلومات اليدوية فقط.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refresh}
            className="
              gap-2 rounded-2xl
              border-amber-400/14 bg-amber-400/5
              text-amber-100/85 hover:bg-amber-400/10 hover:text-amber-100
            "
          >
            <RefreshCcw className="h-4 w-4 text-amber-300" />
            تحديث
          </Button>
        </div>
      </div>

      {/* ✅ CountrySelector added (same as sidebar) */}
      <Card className="w-full border-amber-400/14 bg-card/75 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-100/95">سياق الدولة</CardTitle>
          <CardDescription>اختر الدولة التي تريد إدارة معلوماتها.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <CountrySelector />
          </div>
        </CardContent>
      </Card>

      {/* Manual info card */}
      <Card className="w-full border-amber-400/14 bg-card/75 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-amber-100/95">المعلومات اليدوية</CardTitle>
          <CardDescription>أضف معلومات بشكل يدوي ويمكنك حذف أي عنصر لاحقاً.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <ManualInfoForm onSaved={refresh} />

          <div className="pt-1">
            <div className="text-sm font-semibold mb-3 text-amber-100/90">العناصر الحالية</div>

            {loading ? (
              <Skeleton className="h-24 w-full rounded-2xl bg-amber-400/5" />
            ) : manualInfos.length ? (
              <div className="space-y-2">
                {manualInfos.map((p) => (
                  <div
                    key={p.id}
                    className="
                      rounded-2xl border border-amber-400/12
                      bg-background/30 p-4 text-sm
                      shadow-sm
                    "
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">
                          {p.sourceName} • {p.publisher}
                        </div>
                        <div className="mt-1 font-semibold text-amber-100/95">{p.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground break-all">{p.url}</div>
                        {p.publicationDate ? (
                          <div className="text-xs text-muted-foreground mt-2">
                            التاريخ: {p.publicationDate}
                          </div>
                        ) : null}
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="shrink-0 gap-2 rounded-2xl h-10"
                        disabled={deletingId === p.id}
                        onClick={() => onDelete(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === p.id ? "جاري الحذف..." : "حذف"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">لا توجد معلومات بعد.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
