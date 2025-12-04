"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="text-lg font-semibold">
              {t("brand")}
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("brandSlogan")} - {t("footerSlogan")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium mb-3 text-sm">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  {t("categoriesPage")}
                </Link>
              </li>
              <li>
                <Link href="/products?new=true" className="hover:text-foreground transition-colors">
                  {t("newArrivals")}
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className="hover:text-foreground transition-colors">
                  {t("saleLabel")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-medium mb-3 text-sm">{t("productCategoriesFooter")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>运动鞋 / Sports</li>
              <li>休闲鞋 / Casual</li>
              <li>皮鞋 / Leather</li>
              <li>凉鞋 / Sandals</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium mb-3 text-sm">{t("contact")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("location")}</li>
              <li>service@sunnyshoes.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Sunnyshoes Co. {t("allRights")}</p>
        </div>
      </div>
    </footer>
  );
}
