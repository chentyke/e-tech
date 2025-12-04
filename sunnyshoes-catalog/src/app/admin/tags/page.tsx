"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Tags } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface Tag { id: string; name: string; product_count: number; }

export default function TagsPage() {
  const { t } = useLocale();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTags = async () => { const res = await fetch("/api/tags"); const data = await res.json(); if (data.success) setTags(data.data); setLoading(false); };

  useEffect(() => { fetchTags(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTagName.trim() }) });
    const data = await res.json();
    if (data.success) { setNewTagName(""); fetchTags(); } else alert(data.error);
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("tagManagement")}</h1>
        <p className="text-sm text-muted-foreground">{t("manageTags")}</p>
      </div>

      <Card className="border shadow-none">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("addTag")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder={t("tagName")} className="max-w-xs h-9" />
            <Button type="submit" size="sm" disabled={saving || !newTagName.trim()}><Plus className="w-4 h-4 mr-1" />{t("addTag")}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border shadow-none">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Tags className="w-4 h-4" />{t("allTags")}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-wrap gap-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-7 w-16 rounded-full" />)}</div>
          ) : tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noTags")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => <Badge key={tag.id} variant="secondary" className="font-normal">{tag.name}<span className="ml-1.5 text-muted-foreground">{tag.product_count}</span></Badge>)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
