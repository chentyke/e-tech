"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface Category { 
  id: string; 
  name: string; 
  name_en: string | null;
  name_ko: string | null;
  description: string | null; 
  description_en: string | null;
  description_ko: string | null;
  image_url: string | null; 
  product_count: number; 
}

export default function CategoriesPage() {
  const { t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const fetchCategories = async () => { const res = await fetch("/api/categories"); const data = await res.json(); if (data.success) setCategories(data.data); setLoading(false); };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = () => { 
    setEditingCategory({ 
      name: "", name_en: "", name_ko: "",
      description: "", description_en: "", description_ko: "",
      image_url: "" 
    }); 
    setDialogOpen(true); 
  };
  
  const handleEdit = (cat: Category) => { setEditingCategory({ ...cat }); setDialogOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm(t("confirmDelete"))) return; const res = await fetch(`/api/categories/${id}`, { method: "DELETE" }); const data = await res.json(); if (data.success) fetchCategories(); else alert(data.error); };

  const handleSave = async () => {
    if (!editingCategory?.name) { alert(t("fillCategoryName")); return; }
    setSaving(true);
    const isNew = !editingCategory.id;
    const res = await fetch(isNew ? "/api/categories" : `/api/categories/${editingCategory.id}`, { 
      method: isNew ? "POST" : "PUT", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        name: editingCategory.name, 
        name_en: editingCategory.name_en,
        name_ko: editingCategory.name_ko,
        description: editingCategory.description, 
        description_en: editingCategory.description_en,
        description_ko: editingCategory.description_ko,
        image_url: editingCategory.image_url || null 
      }) 
    });
    const data = await res.json();
    if (data.success) { setDialogOpen(false); fetchCategories(); } else alert(data.error);
    setSaving(false);
  };

  const handleImageError = (catId: string) => {
    setImageErrors(prev => ({ ...prev, [catId]: true }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{t("categoryManagement")}</h1>
          <p className="text-sm text-muted-foreground">{t("manageCategories")}</p>
        </div>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-1.5" />{t("addCategory")}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden"><Skeleton className="aspect-video" /><div className="p-4 space-y-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-full" /></div></div>
        )) : categories.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">{t("noCategoriesYet")}</div>
        ) : categories.map((cat) => (
          <div key={cat.id} className="group border rounded-lg overflow-hidden hover:border-foreground/20 transition-colors">
            <div className="relative aspect-video bg-secondary">
              {cat.image_url && !imageErrors[cat.id] ? (
                <Image 
                  src={cat.image_url} 
                  alt={cat.name} 
                  fill 
                  className="object-cover" 
                  onError={() => handleImageError(cat.id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Package className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(cat)}><Pencil className="w-3 h-3 mr-1" />{t("editCategory")}</Button>
                <Button size="sm" variant="secondary" onClick={() => handleDelete(cat.id)}><Trash2 className="w-3 h-3 mr-1" />{t("deleteProduct")}</Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{cat.name}</h3>
                <Badge variant="secondary" className="text-xs font-normal">{cat.product_count} {t("items")}</Badge>
              </div>
              {cat.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>}
              {(cat.name_en || cat.name_ko) && (
                <div className="flex gap-1 mt-2">
                  {cat.name_en && <Badge variant="outline" className="text-xs">EN</Badge>}
                  {cat.name_ko && <Badge variant="outline" className="text-xs">KO</Badge>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory?.id ? t("editCategory") : t("addCategory")}</DialogTitle>
            <DialogDescription>{t("manageCategories")}</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="zh" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="zh">中文</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ko">한국어</TabsTrigger>
                </TabsList>
                <TabsContent value="zh" className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("categoryName")} (中文) *</Label>
                    <Input value={editingCategory.name || ""} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("categoryDescription")} (中文)</Label>
                    <Textarea value={editingCategory.description || ""} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} rows={3} />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category Name (English)</Label>
                    <Input value={editingCategory.name_en || ""} onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })} placeholder="Sports Shoes" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description (English)</Label>
                    <Textarea value={editingCategory.description_en || ""} onChange={(e) => setEditingCategory({ ...editingCategory, description_en: e.target.value })} rows={3} placeholder="Professional sports shoes..." />
                  </div>
                </TabsContent>
                <TabsContent value="ko" className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">카테고리명 (한국어)</Label>
                    <Input value={editingCategory.name_ko || ""} onChange={(e) => setEditingCategory({ ...editingCategory, name_ko: e.target.value })} placeholder="운동화" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">설명 (한국어)</Label>
                    <Textarea value={editingCategory.description_ko || ""} onChange={(e) => setEditingCategory({ ...editingCategory, description_ko: e.target.value })} rows={3} placeholder="전문 운동화 시리즈..." />
                  </div>
                </TabsContent>
              </Tabs>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("coverImage")}</Label>
                <ImageUpload 
                  value={editingCategory.image_url || ""} 
                  onChange={(url) => setEditingCategory({ ...editingCategory, image_url: url })}
                  type="category"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? t("saving") : t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
