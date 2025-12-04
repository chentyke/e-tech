"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { Package, Eye } from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";

interface AnalyticsData {
  overview: { totalProducts: number; totalCategories: number; totalViews: number; lowStockCount: number; outOfStockCount: number; };
  topProducts: { id: string; name: string; view_count: number; price: number; image_url: string | null; }[];
  categoryDistribution: { name: string; product_count: number; total_views: number; }[];
  stockDistribution: { stock_status: string; count: number; }[];
  priceRanges: { price_range: string; count: number; }[];
  viewTrend: { date: string; views: number; }[];
}

export default function AnalyticsPage() {
  const { t } = useLocale();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/analytics").then((res) => res.json()).then((result) => { if (result.success) setData(result.data); }).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div></div>;
  if (!data) return <div className="p-6 text-muted-foreground">{t("noData")}</div>;

  const stockStatusMap: Record<string, string> = { in_stock: t("inStock"), low_stock: t("lowStock"), out_of_stock: t("outOfStock") };
  const totalStock = data.stockDistribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("analytics")}</h1>
        <p className="text-sm text-muted-foreground">{t("analyticsOverview")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-none"><CardContent className="p-4"><p className="text-2xl font-semibold">{data.overview.totalProducts}</p><p className="text-xs text-muted-foreground">{t("totalProductsCount")}</p></CardContent></Card>
        <Card className="border shadow-none"><CardContent className="p-4"><p className="text-2xl font-semibold">{data.overview.totalViews.toLocaleString()}</p><p className="text-xs text-muted-foreground">{t("totalViews")}</p></CardContent></Card>
        <Card className="border shadow-none"><CardContent className="p-4"><p className="text-2xl font-semibold">{data.overview.totalCategories}</p><p className="text-xs text-muted-foreground">{t("totalCategoriesCount")}</p></CardContent></Card>
        <Card className="border shadow-none"><CardContent className="p-4"><p className="text-2xl font-semibold">{data.overview.totalProducts > 0 ? Math.round(data.overview.totalViews / data.overview.totalProducts) : 0}</p><p className="text-xs text-muted-foreground">{t("avgViews")}</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border shadow-none">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("viewTrend")}</CardTitle></CardHeader>
          <CardContent>
            {data.viewTrend.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">{t("noData")}</p> : (
              <div className="h-32 flex items-end gap-px">
                {data.viewTrend.map((item) => {
                  const maxViews = Math.max(...data.viewTrend.map((v) => v.views));
                  const height = maxViews > 0 ? (item.views / maxViews) * 100 : 0;
                  return <div key={item.date} className="flex-1 group relative" title={`${item.date}: ${item.views}`}><div className="bg-foreground rounded-t transition-all" style={{ height: `${Math.max(height, 2)}%` }} /></div>;
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("stockDistribution")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.stockDistribution.map((item) => {
              const percentage = totalStock > 0 ? (item.count / totalStock) * 100 : 0;
              return (
                <div key={item.stock_status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm"><span>{stockStatusMap[item.stock_status] || item.stock_status}</span><span className="text-muted-foreground">{item.count} ({percentage.toFixed(0)}%)</span></div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-foreground rounded-full" style={{ width: `${percentage}%` }} /></div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("priceRange")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.priceRanges.map((item) => {
              const maxCount = Math.max(...data.priceRanges.map((p) => p.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.price_range} className="space-y-1">
                  <div className="flex items-center justify-between text-sm"><span>¥{item.price_range}</span><span className="text-muted-foreground">{item.count} {t("items")}</span></div>
                  <div className="h-5 rounded bg-secondary overflow-hidden"><div className="h-full bg-foreground/80 rounded" style={{ width: `${Math.max(percentage, 5)}%` }} /></div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("topProductsChart")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.slice(0, 8).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                <div className="relative w-9 h-9 rounded bg-secondary overflow-hidden flex-shrink-0">
                  {product.image_url ? <Image src={product.image_url} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground/30" /></div>}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{product.name}</p><p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p></div>
                <Badge variant="secondary" className="text-xs font-normal"><Eye className="w-3 h-3 mr-1" />{product.view_count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
