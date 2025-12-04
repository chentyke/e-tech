"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ArrowRight } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { getLocalizedContent } from "@/lib/utils";

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

function CategoryImage({ src, alt }: { src: string | null; alt: string }) {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Package className="w-12 h-12 text-muted-foreground/30" />
      </div>
    );
  }
  
  return (
    <Image 
      src={src} 
      alt={alt} 
      fill 
      className="object-cover group-hover:scale-105 transition-transform duration-300" 
      onError={() => setError(true)}
    />
  );
}

export default function CategoriesPage() {
  const { t, locale } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => { if (data.success) setCategories(data.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">{t("categoriesTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("categoriesDescription")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <Skeleton className="aspect-[3/2]" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        ) : (
          categories.map((category) => {
            const catName = getLocalizedContent(category, 'name', locale);
            const catDesc = getLocalizedContent(category, 'description', locale);
            return (
              <Link key={category.id} href={`/products?category=${category.id}`}>
                <div className="group rounded-lg border hover:border-foreground/20 transition-colors overflow-hidden">
                  <div className="relative aspect-[3/2] overflow-hidden bg-secondary">
                    <CategoryImage src={category.image_url} alt={catName} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-medium">{catName}</h2>
                        <p className="text-sm text-muted-foreground">{category.product_count} {t("items")}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    {catDesc && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{catDesc}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {!loading && categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{t("noCategories")}</p>
        </div>
      )}
    </div>
  );
}
