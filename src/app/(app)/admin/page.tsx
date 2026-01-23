// src/app/(app)/admin/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useApp } from "@/providers/app-providers";
import { addPassage, getPassagesByCountry, ingestCountrySources, deletePassage } from "@/actions/passages";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Globe, RefreshCcw, Trash2 } from "lucide-react";

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
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("country", country);

        trimOrDelete(fd, "sourceName");
        trimOrDelete(fd, "publisher");
        trimOrDelete(fd, "title");
        trimOrDelete(fd, "url");
        trimOrDelete(fd, "snippet");
        trimOrDelete(fd, "publicationDate"); // optional

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

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>اسم المصدر</Label>
          <Input name="sourceName" required />
        </div>
        <div className="space-y-1">
          <Label>الناشر</Label>
          <Input name="publisher" required />
        </div>
      </div>

      <div className="space-y-1">
        <Label>العنوان</Label>
        <Input name="title" required />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>الرابط</Label>
          <Input name="url" required />
        </div>
        <div className="space-y-1">
          <Label>تاريخ النشر (اختياري)</Label>
          <Input name="publicationDate" placeholder="2026-01-22" />
        </div>
      </div>

      <div className="space-y-1">
        <Label>المحتوى</Label>
        <Textarea name="snippet" rows={6} required />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "جاري الحفظ..." : "إضافة معلومات يدوية"}
      </Button>
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
      // rollback
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
    <div className="space-y-6" dir="rtl" lang="ar">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">الإدارة</h1>
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3.5 w-3.5" />
              {country}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">إضافة/إدارة المعلومات اليدوية فقط.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* ✅ Full width card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>المعلومات اليدوية</CardTitle>
          <CardDescription>أضف معلومات بشكل يدوي ويمكنك حذف أي عنصر لاحقاً.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ManualInfoForm onSaved={refresh} />

          <div className="pt-2">
            <div className="text-sm font-semibold mb-2">العناصر الحالية</div>

            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : manualInfos.length ? (
              <div className="space-y-2">
                {manualInfos.map((p) => (
                  <div key={p.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">
                          {p.sourceName} • {p.publisher}
                        </div>
                        <div className="font-semibold">{p.title}</div>
                        <div className="text-xs text-muted-foreground break-all">{p.url}</div>
                        {p.publicationDate ? (
                          <div className="text-xs text-muted-foreground mt-1">التاريخ: {p.publicationDate}</div>
                        ) : null}
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="shrink-0 gap-2"
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
    </div>
  );
}
