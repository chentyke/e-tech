"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FallbackImage } from "@/components/ui/optimized-image";
import { ArrowRight, Package } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { getLocalizedContent } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  name_en: string | null;
  name_ko: string | null;
  description: string;
  description_en: string | null;
  description_ko: string | null;
  image_url: string | null;
  product_count: number;
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

export default function HomePage() {
  const { t, locale } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featuredRes, newRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?featured=true&limit=4"),
          fetch("/api/products?new=true&limit=4"),
        ]);

        const [catData, featuredData, newData] = await Promise.all([
          catRes.json(),
          featuredRes.json(),
          newRes.json(),
        ]);

        if (catData.success) setCategories(catData.data);
        if (featuredData.success) setFeaturedProducts(featuredData.data);
        if (newData.success) setNewProducts(newData.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[480px] overflow-hidden">
        {/* Banner Image - Background */}
        <FallbackImage
          src="/images/banner.jpeg"
          fallbackSrc="/images/banner.jpeg"
          alt="Sunnyshoes Banner"
          fill
          className="object-cover object-center"
          imageSize="large"
          sizes="100vw"
          showPlaceholder={false}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Text Content - Overlaid */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight text-white drop-shadow-lg">
                {t("heroTitle1")}
                <br />
                <span className="text-white/80">{t("heroTitle2")}</span>
              </h1>
              <p className="text-lg text-white/90 mb-6 leading-relaxed drop-shadow">
                {t("heroDescription")}
              </p>
              <Button asChild className="bg-white text-zinc-900 hover:bg-zinc-100">
                <Link href="/products">
                  {t("exploreProducts")}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{t("productCategories")}</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/categories">
                {t("viewAll")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
                ))
              : categories.slice(0, 6).map((category) => {
                  const catName = getLocalizedContent(category, 'name', locale);
                  return (
                    <Link key={category.id} href={`/products?category=${category.id}`}>
                      <div className="group relative aspect-square rounded-lg overflow-hidden bg-secondary">
                        {category.image_url ? (
                          <FallbackImage
                            src={category.image_url}
                            fallbackSrc={category.image_url}
                            alt={catName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            imageSize="small"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                            showPlaceholder={true}
                            placeholderIconSize="md"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Package className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <h3 className="font-medium text-sm">{catName}</h3>
                          <p className="text-xs opacity-70">{category.product_count} {t("items")}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{t("featured")}</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/products?featured=true">
                {t("viewMore")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{t("newArrivals")}</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/products?new=true">
                {t("viewMore")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <ProductGrid products={newProducts} loading={loading} />
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-12 md:py-16 border-t bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">{t("aboutUs")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("brandStory")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
