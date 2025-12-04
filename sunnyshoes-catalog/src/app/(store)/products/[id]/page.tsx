"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FallbackImage } from "@/components/ui/optimized-image";
import { formatPrice, getLocalizedContent, getOptimizedImageUrl } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Package, Eye, Check, AlertTriangle, XCircle } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: number;
}

interface Tag {
  id: string;
  name: string;
}

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
  category_name_en?: string | null;
  category_name_ko?: string | null;
  brand: string | null;
  material: string | null;
  color: string | null;
  sizes: string | null;
  stock_status: string;
  stock_quantity: number;
  is_new: number;
  is_sale: number;
  view_count: number;
  images?: ProductImage[];
  tags?: Tag[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  }, []);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data);
          if (data.data.sizes) {
            const sizes = JSON.parse(data.data.sizes);
            if (sizes.length > 0) setSelectedSize(sizes[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-medium mb-4">{t("productNotFound")}</h1>
        <Button variant="outline" asChild>
          <Link href="/products">{t("backToProducts")}</Link>
        </Button>
      </div>
    );
  }

  const images = product.images || [];
  const sizes = product.sizes ? JSON.parse(product.sizes) : [];
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;
  
  // 获取本地化内容
  const productName = getLocalizedContent(product, 'name', locale);
  const productDesc = getLocalizedContent(product, 'description', locale);
  const categoryName = product.category_name ? getLocalizedContent(product, 'category_name', locale) : null;

  const getStockStatus = () => {
    switch (product.stock_status) {
      case "in_stock": return { icon: Check, text: t("inStock"), className: "text-foreground" };
      case "low_stock": return { icon: AlertTriangle, text: t("lowStock"), className: "text-muted-foreground" };
      case "out_of_stock": return { icon: XCircle, text: t("outOfStock"), className: "text-muted-foreground" };
      default: return { icon: Package, text: t("checking"), className: "text-muted-foreground" };
    }
  };

  const stockInfo = getStockStatus();
  const StockIcon = stockInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">{t("home")}</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">{t("products")}</Link>
        {categoryName && (
          <>
            <span>/</span>
            <Link href={`/products?category=${product.category_id}`} className="hover:text-foreground">
              {categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-3">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
            {images[selectedImage] && !imageErrors[selectedImage] ? (
              <FallbackImage 
                src={images[selectedImage].url}
                fallbackSrc={images[selectedImage].url}
                alt={images[selectedImage].alt_text || product.name} 
                fill 
                className="object-cover" 
                imageSize="large"
                sizes="(max-width: 768px) 100vw, 50vw"
                onImageError={() => handleImageError(selectedImage)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Package className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={() => setSelectedImage((prev) => prev === 0 ? images.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedImage((prev) => prev === images.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_new === 1 && <Badge variant="secondary">{t("newLabel")}</Badge>}
              {product.is_sale === 1 && discount > 0 && <Badge variant="secondary">-{discount}%</Badge>}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, index) => (
                <button key={img.id} onClick={() => setSelectedImage(index)} className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === index ? "border-foreground" : "border-transparent hover:border-muted-foreground"}`}>
                  {!imageErrors[index] ? (
                    <FallbackImage 
                      src={img.url}
                      fallbackSrc={img.url}
                      alt="" 
                      fill 
                      className="object-cover" 
                      imageSize="thumbnail"
                      sizes="64px"
                      onImageError={() => handleImageError(index)} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Package className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => <Badge key={tag.id} variant="outline" className="font-normal">{tag.name}</Badge>)}
            </div>
          )}

          <div>
            {product.brand && <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>}
            <h1 className="text-2xl font-semibold">{productName}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>

          <div className={`flex items-center gap-2 text-sm ${stockInfo.className}`}>
            <StockIcon className="w-4 h-4" />
            <span>{stockInfo.text}</span>
            {product.stock_status !== "out_of_stock" && product.stock_quantity > 0 && (
              <span className="text-muted-foreground">({product.stock_quantity})</span>
            )}
          </div>

          <Separator />

          {productDesc && (
            <div>
              <h3 className="text-sm font-medium mb-2">{t("productIntro")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{productDesc}</p>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">{t("selectSize")}</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size: string) => (
                  <button key={size} onClick={() => setSelectedSize(size)} disabled={product.stock_status === "out_of_stock"} className={`w-10 h-10 rounded border text-sm font-medium transition-colors ${selectedSize === size ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {product.material && <div><span className="text-muted-foreground">{t("material")}</span><p className="font-medium">{product.material}</p></div>}
            {product.color && <div><span className="text-muted-foreground">{t("color")}</span><p className="font-medium">{product.color}</p></div>}
            {product.sku && <div><span className="text-muted-foreground">SKU</span><p className="font-medium">{product.sku}</p></div>}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Eye className="w-3.5 h-3.5" />
            <span>{product.view_count} {t("views")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
