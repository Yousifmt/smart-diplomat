"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useApp } from "@/providers/app-providers";
import { addPassage, getPassagesByCountry, deletePassage } from "@/actions/passages";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const inputBase =
    "admin-input h-12 rounded-2xl bg-white text-black placeholder:text-gray-500 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400/25";

  const textareaBase =
    "admin-textarea rounded-2xl bg-white text-black placeholder:text-gray-500 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400/25";

  const labelBase = "text-blue-100/85";

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
            toast({
              variant: "destructive",
              title: "فشل الحفظ",
              description: res.error,
            });
            return;
          }

          toast({
            title: "تم الحفظ",
            description: "تمت إضافة المعلومات اليدوية.",
          });

          formRef.current?.reset();
          onSaved();
        });
      }}
    >
      <input type="hidden" name="country" value={country} />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className={labelBase}>اسم المصدر</Label>
          <Input name="sourceName" required className={inputBase} />
        </div>

        <div className="space-y-1.5">
          <Label className={labelBase}>الناشر</Label>
          <Input name="publisher" required className={inputBase} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={labelBase}>العنوان</Label>
        <Input name="title" required className={inputBase} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className={labelBase}>الرابط</Label>
          <Input name="url" className={inputBase} inputMode="url" />
        </div>

        <div className="space-y-1.5">
          <Label className={labelBase}>تاريخ النشر (اختياري)</Label>
          <Input
            name="publicationDate"
            placeholder="2026-01-22"
            className={inputBase}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={labelBase}>المحتوى</Label>

        <Textarea
          name="snippet"
          rows={7}
          required
          className={textareaBase}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="
          h-12 rounded-2xl bg-blue-500 px-6 text-white
          shadow-lg shadow-blue-950/30
          hover:bg-blue-400 active:bg-blue-600
          disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none
        "
      >
        {isPending ? "جاري الحفظ..." : "إضافة معلومات يدوية"}
      </Button>

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

    const prev = manualInfos;
    setManualInfos((x) => x.filter((p) => p.id !== id));

    try {
      const res = await deletePassage(id);
      if (res?.error) throw new Error(res.error);

      toast({
        title: "تم الحذف",
        description: "تم حذف المعلومات اليدوية.",
      });
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
    <div className="space-y-6 text-white" dir="rtl" lang="ar">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              تدوين المعلومات
            </h1>

            <Badge className="gap-1 border border-blue-400/30 bg-blue-500/15 text-blue-100 shadow-sm shadow-blue-950/20">
              <Globe className="h-3.5 w-3.5 text-blue-300" />
              {country}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-blue-100/65">
            إضافة/إدارة المعلومات اليدوية فقط.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={refresh}
          className="
            gap-2 rounded-2xl border-blue-400/25
            bg-white/[0.07] text-white shadow-sm shadow-blue-950/20
            hover:bg-blue-500/15 hover:text-white
          "
        >
          <RefreshCcw className="h-4 w-4 text-blue-300" />
          تحديث
        </Button>
      </div>

      <Card className="w-full border-white/10 bg-white/[0.07] text-white shadow-2xl shadow-blue-950/25 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">الدولة</CardTitle>

          <CardDescription className="text-blue-100/65">
            اختر الدولة ثم أضف/احذف المعلومات.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="country-select-white max-w-md rounded-2xl bg-white p-1 text-black shadow-sm">
            <CountrySelector />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full border-white/10 bg-white/[0.07] text-white shadow-2xl shadow-blue-950/25 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">
            دون المعلومات المطلوبة
          </CardTitle>

          <CardDescription className="text-blue-100/65">
            أضف المعلومات ويمكنك حذفها لاحقًا.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <ManualInfoForm onSaved={refresh} />

          <div className="pt-1">
            <div className="mb-3 text-sm font-semibold text-white">
              العناصر الحالية
            </div>

            {loading ? (
              <Skeleton className="h-24 w-full rounded-2xl bg-white/10" />
            ) : manualInfos.length ? (
              <div className="space-y-2">
                {manualInfos.map((p) => (
                  <div
                    key={p.id}
                    className="
                      rounded-2xl border border-blue-400/20
                      bg-slate-950/35 p-4 text-sm
                      shadow-sm shadow-blue-950/20 backdrop-blur
                    "
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs text-blue-100/60">
                          {p.sourceName} • {p.publisher}
                        </div>

                        <div className="mt-1 font-semibold text-white">
                          {p.title}
                        </div>

                        <div className="mt-1 break-all text-xs text-blue-100/60">
                          {p.url}
                        </div>

                        {p.publicationDate ? (
                          <div className="mt-2 text-xs text-blue-100/60">
                            التاريخ: {p.publicationDate}
                          </div>
                        ) : null}
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-10 shrink-0 gap-2 rounded-2xl"
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
              <div className="text-sm text-blue-100/65">
                لا توجد معلومات بعد.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}