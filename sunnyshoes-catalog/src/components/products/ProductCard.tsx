"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getLocalizedContent } from "@/lib/utils";
import { Package } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useState } from "react";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: number;
}

interface Product {
  id: string;
  name: string;
  name_en?: string | null;
  name_ko?: string | null;
  description: string | null;
  description_en?: string | null;
  description_ko?: string | null;
  price: number;
  original_price: number | null;
  category_name?: string;
  category_name_en?: string | null;
  category_name_ko?: string | null;
  stock_status: string;
  is_featured: number;
  is_new: number;
  is_sale: number;
  view_count: number;
  images?: ProductImage[];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, locale } = useLocale();
  const [imgError, setImgError] = useState(false);
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;
  
  // 获取本地化的产品名称和分类名称
  const productName = getLocalizedContent(product, 'name', locale);
  const categoryName = product.category_name ? getLocalizedContent(product, 'category_name', locale) : undefined;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="product-card group">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
          {primaryImage && !imgError ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              fill
              className="object-cover product-image"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Package className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_new === 1 && (
              <Badge variant="secondary" className="text-xs font-normal">
                {t("newLabel")}
              </Badge>
            )}
            {product.is_sale === 1 && discount > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">
                -{discount}%
              </Badge>
            )}
          </div>

          {product.stock_status === "out_of_stock" && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">{t("outOfStock")}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          {categoryName && (
            <p className="text-xs text-muted-foreground mb-0.5">
              {categoryName}
            </p>
          )}
          <h3 className="text-sm font-medium line-clamp-2 mb-1 group-hover:underline underline-offset-2">
            {productName}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="font-medium">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
