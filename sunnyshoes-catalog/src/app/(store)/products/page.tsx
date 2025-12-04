"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_name?: string;
  stock_status: string;
  is_featured: number;
  is_new: number;
  is_sale: number;
  view_count: number;
  images?: ProductImage[];
}

function ProductsContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  const featured = searchParams.get("featured") === "true";
  const newProducts = searchParams.get("new") === "true";
  const sale = searchParams.get("sale") === "true";

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => { if (data.success) setCategories(data.data); });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      if (featured) params.set("featured", "true");
      if (newProducts) params.set("new", "true");
      if (sale) params.set("sale", "true");
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.pagination.total);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy, sortOrder, featured, newProducts, sale]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("created_at");
    setSortOrder("DESC");
    window.history.pushState({}, "", "/products");
  };

  const hasActiveFilters = searchQuery || selectedCategory || featured || newProducts || sale;

  const getPageTitle = () => {
    if (featured) return t("featured");
    if (newProducts) return t("newArrivals");
    if (sale) return t("saleLabel");
    return t("products");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
        <p className="text-muted-foreground">{t("totalProducts", { count: total })}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={t("filterCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(v) => {
            const [by, order] = v.split("-");
            setSortBy(by);
            setSortOrder(order);
          }}
        >
          <SelectTrigger className="w-full md:w-48">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-DESC">{t("sortNewest")}</SelectItem>
            <SelectItem value="created_at-ASC">{t("sortOldest")}</SelectItem>
            <SelectItem value="price-ASC">{t("sortPriceLow")}</SelectItem>
            <SelectItem value="price-DESC">{t("sortPriceHigh")}</SelectItem>
            <SelectItem value="view_count-DESC">{t("sortPopular")}</SelectItem>
            <SelectItem value="name-ASC">{t("sortName")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">{t("filterConditions")}</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              {t("searchLabel")} {searchQuery}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {t("categoryLabel")} {categories.find((c) => c.id === selectedCategory)?.name}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
            </Badge>
          )}
          {featured && <Badge variant="secondary">{t("featuredLabel")}</Badge>}
          {newProducts && <Badge variant="secondary">{t("newLabel")}</Badge>}
          {sale && <Badge variant="secondary">{t("saleLabel")}</Badge>}
          <Button variant="ghost" size="sm" onClick={clearFilters}>{t("clearAll")}</Button>
        </div>
      )}

      <ProductGrid products={products} loading={loading} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><ProductGrid products={[]} loading={true} /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
