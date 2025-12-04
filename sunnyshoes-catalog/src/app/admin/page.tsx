"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { Package, FolderTree, Eye, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";

interface AnalyticsData {
  overview: { totalProducts: number; totalCategories: number; totalViews: number; lowStockCount: number; outOfStockCount: number; };
  topProducts: { id: string; name: string; view_count: number; price: number; image_url: string | null; }[];
  categoryDistribution: { name: string; product_count: number; total_views: number; }[];
  productStats: { newProducts: number; saleProducts: number; featuredProducts: number; };
}

export default function AdminDashboard() {
  const { t } = useLocale();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then((res) => res.json()).then((result) => { if (result.success) setData(result.data); }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-muted-foreground">{t("noData")}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground">{t("welcomeAdmin")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold">{data.overview.totalProducts}</p>
                <p className="text-xs text-muted-foreground">{t("totalProductsCount")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FolderTree className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold">{data.overview.totalCategories}</p>
                <p className="text-xs text-muted-foreground">{t("totalCategoriesCount")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold">{data.overview.totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{t("totalViews")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold">{data.overview.lowStockCount + data.overview.outOfStockCount}</p>
                <p className="text-xs text-muted-foreground">{t("stockWarning")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border shadow-none">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{data.productStats.newProducts}</p>
            <p className="text-xs text-muted-foreground">{t("newProducts")}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-none">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{data.productStats.saleProducts}</p>
            <p className="text-xs text-muted-foreground">{t("saleProducts")}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-none">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{data.productStats.featuredProducts}</p>
            <p className="text-xs text-muted-foreground">{t("recommendedProducts")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border shadow-none">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("topProducts")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.slice(0, 8).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                <div className="relative w-10 h-10 rounded bg-secondary overflow-hidden flex-shrink-0">
                  {product.image_url ? <Image src={product.image_url} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground/30" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                </div>
                <Badge variant="secondary" className="text-xs font-normal">{product.view_count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("categoryDistribution")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.categoryDistribution.map((cat) => {
              const maxProducts = Math.max(...data.categoryDistribution.map((c) => c.product_count));
              const percentage = maxProducts > 0 ? (cat.product_count / maxProducts) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground">{cat.product_count} {t("items")}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
