"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiImageUpload } from "@/components/ui/image-upload";
import { formatPrice } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, Package, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocale } from "@/contexts/LocaleContext";

interface ProductImage { id: string; url: string; alt_text: string | null; is_primary: number; }
interface Product { 
  id: string; 
  name: string; 
  name_en: string | null;
  name_ko: string | null;
  description: string | null; 
  description_en: string | null;
  description_ko: string | null;
  price: number; 
  original_price: number | null; 
  sku: string | null; 
  category_id: string | null; 
  category_name?: string; 
  brand: string | null; 
  material: string | null; 
  color: string | null; 
  sizes: string | null; 
  stock_status: string; 
  stock_quantity: number; 
  is_featured: number; 
  is_new: number; 
  is_sale: number; 
  view_count: number; 
  images?: ProductImage[]; 
}
interface Category { id: string; name: string; }

interface EditingProduct extends Partial<Product> {
  images_urls: string[];
}

const emptyProduct: EditingProduct = { 
  name: "", name_en: "", name_ko: "",
  description: "", description_en: "", description_ko: "",
  price: 0, original_price: null, sku: "", category_id: null, 
  brand: "", material: "", color: "", sizes: "[]", 
  stock_status: "in_stock", stock_quantity: 0, 
  is_featured: 0, is_new: 0, is_sale: 0, images_urls: [] 
};

export default function ProductsPage() {
  const { t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const fetchProducts = async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    params.set("limit", "100");
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); fetch("/api/categories").then((res) => res.json()).then((data) => { if (data.success) setCategories(data.data); }); }, []);
  useEffect(() => { const timer = setTimeout(fetchProducts, 300); return () => clearTimeout(timer); }, [searchQuery]);

  const handleCreate = () => { setEditingProduct({ ...emptyProduct }); setDialogOpen(true); };
  const handleEdit = (product: Product) => { 
    setEditingProduct({ 
      ...product, 
      images_urls: product.images?.map((img) => img.url) || [] 
    }); 
    setDialogOpen(true); 
  };
  const handleDelete = async (id: string) => { if (!confirm(t("confirmDelete"))) return; const res = await fetch(`/api/products/${id}`, { method: "DELETE" }); const data = await res.json(); if (data.success) fetchProducts(); else alert(data.error); };

  const handleSave = async () => {
    if (!editingProduct?.name || !editingProduct?.price) { alert(t("fillRequired")); return; }
    setSaving(true);
    const sizes = editingProduct.sizes ? (typeof editingProduct.sizes === "string" ? JSON.parse(editingProduct.sizes) : editingProduct.sizes) : [];
    const payload = { 
      name: editingProduct.name, 
      name_en: editingProduct.name_en,
      name_ko: editingProduct.name_ko,
      description: editingProduct.description, 
      description_en: editingProduct.description_en,
      description_ko: editingProduct.description_ko,
      price: Number(editingProduct.price), 
      original_price: editingProduct.original_price ? Number(editingProduct.original_price) : null, 
      sku: editingProduct.sku, 
      category_id: editingProduct.category_id || null, 
      brand: editingProduct.brand, 
      material: editingProduct.material, 
      color: editingProduct.color, 
      sizes, 
      stock_status: editingProduct.stock_status, 
      stock_quantity: Number(editingProduct.stock_quantity), 
      is_featured: editingProduct.is_featured, 
      is_new: editingProduct.is_new, 
      is_sale: editingProduct.is_sale, 
      images: editingProduct.images_urls 
    };
    const isNew = !editingProduct.id;
    const res = await fetch(isNew ? "/api/products" : `/api/products/${editingProduct.id}`, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) { setDialogOpen(false); fetchProducts(); } else alert(data.error);
    setSaving(false);
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{t("productManagement")}</h1>
          <p className="text-sm text-muted-foreground">{t("manageProducts")}</p>
        </div>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-1.5" />{t("addProduct")}</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input type="search" placeholder={t("search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-9" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">{t("image")}</TableHead>
              <TableHead>{t("productName")}</TableHead>
              <TableHead>{t("categories")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              <TableHead>{t("stock")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="w-10 h-10 rounded" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
              </TableRow>
            )) : products.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("noProducts")}</TableCell></TableRow>
            ) : products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative w-10 h-10 rounded bg-secondary overflow-hidden">
                    {product.images?.[0]?.url && !imageErrors[product.id] ? (
                      <Image 
                        src={product.images[0].url} 
                        alt="" 
                        fill 
                        className="object-cover" 
                        onError={() => handleImageError(product.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Package className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[180px]">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}
                    {(product.name_en || product.name_ko) && (
                      <div className="flex gap-1 mt-1">
                        {product.name_en && <Badge variant="outline" className="text-[10px] px-1">EN</Badge>}
                        {product.name_ko && <Badge variant="outline" className="text-[10px] px-1">KO</Badge>}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{product.category_name || "-"}</span></TableCell>
                <TableCell><p className="text-sm font-medium">{formatPrice(product.price)}</p></TableCell>
                <TableCell><span className="text-sm">{product.stock_quantity}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.is_new === 1 && <Badge variant="secondary" className="text-xs font-normal">{t("newLabel")}</Badge>}
                    {product.is_sale === 1 && <Badge variant="secondary" className="text-xs font-normal">{t("saleLabel")}</Badge>}
                    {product.is_featured === 1 && <Badge variant="secondary" className="text-xs font-normal">{t("featuredLabel")}</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(product)}><Pencil className="w-4 h-4 mr-2" />{t("editProduct")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />{t("deleteProduct")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct?.id ? t("editProduct") : t("addProduct")}</DialogTitle>
            <DialogDescription>{t("manageProducts")}</DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="zh" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="zh">中文</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ko">한국어</TabsTrigger>
                </TabsList>
                <TabsContent value="zh" className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("productName")} (中文) *</Label>
                    <Input value={editingProduct.name || ""} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("description")} (中文)</Label>
                    <Textarea value={editingProduct.description || ""} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Product Name (English)</Label>
                    <Input value={editingProduct.name_en || ""} onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })} placeholder="SunnyRun Pro Running Shoes" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description (English)</Label>
                    <Textarea value={editingProduct.description_en || ""} onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })} rows={3} placeholder="Professional running shoes with advanced cushioning technology..." />
                  </div>
                </TabsContent>
                <TabsContent value="ko" className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">상품명 (한국어)</Label>
                    <Input value={editingProduct.name_ko || ""} onChange={(e) => setEditingProduct({ ...editingProduct, name_ko: e.target.value })} placeholder="써니런 프로 러닝화" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">설명 (한국어)</Label>
                    <Textarea value={editingProduct.description_ko || ""} onChange={(e) => setEditingProduct({ ...editingProduct, description_ko: e.target.value })} rows={3} placeholder="최신 쿠셔닝 기술이 적용된 전문 러닝화..." />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">{t("sku")}</Label><Input value={editingProduct.sku || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t("categories")}</Label>
                  <Select value={editingProduct.category_id || "none"} onValueChange={(v) => setEditingProduct({ ...editingProduct, category_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue placeholder={t("filterCategory")} /></SelectTrigger>
                    <SelectContent><SelectItem value="none">{t("noCategory")}</SelectItem>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">{t("price")} *</Label><Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t("originalPrice")}</Label><Input type="number" value={editingProduct.original_price || ""} onChange={(e) => setEditingProduct({ ...editingProduct, original_price: e.target.value ? Number(e.target.value) : null })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t("stockQuantity")}</Label><Input type="number" value={editingProduct.stock_quantity} onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">{t("productBrand")}</Label><Input value={editingProduct.brand || ""} onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t("material")}</Label><Input value={editingProduct.material || ""} onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t("color")}</Label><Input value={editingProduct.color || ""} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">{t("sizes")} (JSON)</Label><Input value={typeof editingProduct.sizes === "string" ? editingProduct.sizes : JSON.stringify(editingProduct.sizes)} onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value })} placeholder='["36","37","38"]' /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t("stockStatus")}</Label>
                  <Select value={editingProduct.stock_status} onValueChange={(v) => setEditingProduct({ ...editingProduct, stock_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">{t("inStock")}</SelectItem>
                      <SelectItem value="low_stock">{t("lowStock")}</SelectItem>
                      <SelectItem value="out_of_stock">{t("outOfStock")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">{t("tags")}</Label>
                <div className="flex gap-2 pt-1.5">
                  <Button type="button" size="sm" variant={editingProduct.is_new ? "default" : "outline"} onClick={() => setEditingProduct({ ...editingProduct, is_new: editingProduct.is_new ? 0 : 1 })}>{t("newLabel")}</Button>
                  <Button type="button" size="sm" variant={editingProduct.is_sale ? "default" : "outline"} onClick={() => setEditingProduct({ ...editingProduct, is_sale: editingProduct.is_sale ? 0 : 1 })}>{t("saleLabel")}</Button>
                  <Button type="button" size="sm" variant={editingProduct.is_featured ? "default" : "outline"} onClick={() => setEditingProduct({ ...editingProduct, is_featured: editingProduct.is_featured ? 0 : 1 })}>{t("featuredLabel")}</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("productImages")}</Label>
                <MultiImageUpload 
                  value={editingProduct.images_urls} 
                  onChange={(urls) => setEditingProduct({ ...editingProduct, images_urls: urls })}
                  type="product"
                  maxImages={10}
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
