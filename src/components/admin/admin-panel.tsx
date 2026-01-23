"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { addPassage, getPassagesByCountry } from "@/actions/passages";
import { addSource, getSourcesByCountry, setSourceEnabled } from "@/actions/sources";

/** ✅ helper: trim a field; delete it if empty (prevents undefined / empty optional fields) */
function trimOrDelete(fd: FormData, key: string) {
  const raw = fd.get(key);
  const val = String(raw ?? "").trim();
  if (!val) fd.delete(key);
  else fd.set(key, val);
}

/** ✅ helper: normalize boolean string fields like "true"/"false" */
function normalizeBoolField(fd: FormData, key: string, defaultValue = "true") {
  const raw = String(fd.get(key) ?? defaultValue).trim().toLowerCase();
  const val = raw === "false" ? "false" : "true";
  fd.set(key, val);
}

export function AdminPanel() {
  const { country } = useApp();
  const [refresh, setRefresh] = useState(0);

  const [sources, setSources] = useState<any[]>([]);
  const [passages, setPassages] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [s, p] = await Promise.all([
        getSourcesByCountry(country),
        getPassagesByCountry(country),
      ]);
      setSources(s);
      setPassages(p);
    })();
  }, [country, refresh]);

  const enabledSources = useMemo(() => sources.filter((s) => s.enabled), [sources]);

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <div>
        <h1 className="text-2xl font-headline">الإدارة</h1>
        <p className="text-sm text-muted-foreground">
          إدارة المصادر المعتمدة والمقاطع المحفوظة لـ{" "}
          <span className="font-semibold">{country}</span>.
        </p>
      </div>

      <Tabs defaultValue="sources">
        <TabsList>
          <TabsTrigger value="sources">المصادر</TabsTrigger>
          <TabsTrigger value="passages">المقاطع</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>إضافة مصدر</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 md:grid-cols-2"
                action={async (fd) => {
                  fd.set("country", country);

                  // ✅ sanitize + prevent undefined
                  trimOrDelete(fd, "name");
                  trimOrDelete(fd, "baseUrl");
                  trimOrDelete(fd, "category");
                  trimOrDelete(fd, "language");
                  trimOrDelete(fd, "tier");

                  // optional fields (if you have them in your action/schema)
                  trimOrDelete(fd, "rssUrl"); // if form doesn't include it, harmless
                  normalizeBoolField(fd, "enabled", "true");

                  const res = await addSource(fd);
                  if (!res?.error) setRefresh((x) => x + 1);
                }}
              >
                <div className="grid gap-2">
                  <Label>الاسم</Label>
                  <Input name="name" placeholder="Reuters" required />
                </div>

                <div className="grid gap-2">
                  <Label>الرابط الأساسي</Label>
                  <Input name="baseUrl" placeholder="https://www.reuters.com" required />
                </div>

                <div className="grid gap-2">
                  <Label>التصنيف</Label>
                  <Input name="category" placeholder="News / Official / Think Tank" required />
                </div>

                <div className="grid gap-2">
                  <Label>اللغة</Label>
                  <Input name="language" placeholder="ar أو en" required />
                </div>

                <div className="grid gap-2">
                  <Label>Tier</Label>
                  <Input name="tier" placeholder="A" required />
                </div>

                <div className="grid gap-2">
                  <Label>مفعّل</Label>
                  <Input name="enabled" defaultValue="true" />
                  <p className="text-xs text-muted-foreground">اكتب "true" أو "false".</p>
                </div>

                <div className="md:col-span-2">
                  <Button type="submit">حفظ المصدر</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-3">
            {sources.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.baseUrl}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.category} • {s.language} • {s.tier}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {s.enabled ? "مفعّل" : "معطّل"}
                    </span>
                    <Switch
                      checked={!!s.enabled}
                      onCheckedChange={async (val) => {
                        await setSourceEnabled(s.id, val);
                        setRefresh((x) => x + 1);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="passages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>إضافة مقطع / ملاحظة</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4"
                action={async (fd) => {
                  fd.set("country", country);

                  // ✅ sanitize required fields
                  trimOrDelete(fd, "sourceName");
                  trimOrDelete(fd, "title");
                  trimOrDelete(fd, "publisher");
                  trimOrDelete(fd, "url");
                  trimOrDelete(fd, "snippet");

                  // ✅ crucial: optional publicationDate must be deleted if empty
                  trimOrDelete(fd, "publicationDate");

                  const res = await addPassage(fd);
                  if (!res?.error) setRefresh((x) => x + 1);
                }}
              >
                <div className="grid gap-2">
                  <Label>المصدر</Label>
                  <Input
                    name="sourceName"
                    placeholder={
                      enabledSources.length
                        ? `مثال: ${enabledSources[0]?.name}`
                        : "أضف مصدر أولاً"
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>العنوان</Label>
                  <Input name="title" placeholder="تحديث سياسي: ..." required />
                </div>

                <div className="grid gap-2">
                  <Label>الناشر</Label>
                  <Input name="publisher" placeholder="وزارة / وكالة / جهة رسمية..." required />
                </div>

                <div className="grid gap-2">
                  <Label>الرابط</Label>
                  <Input name="url" placeholder="https://..." required />
                </div>

                <div className="grid gap-2">
                  <Label>تاريخ النشر (اختياري)</Label>
                  <Input name="publicationDate" placeholder="2026-01-15" />
                </div>

                <div className="grid gap-2">
                  <Label>المقتطف / الملخص</Label>
                  <Input name="snippet" placeholder="الصق الفقرة أو الملخص هنا..." required />
                </div>

                <Button type="submit">حفظ المقطع</Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-3">
            {passages.map((p) => (
              <Card key={p.id}>
                <CardContent className="py-4">
                  <div className="text-xs text-muted-foreground">{p.sourceName}</div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{p.snippet}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {p.publisher} • {p.publicationDate ?? "—"} • {p.url}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
