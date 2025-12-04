"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Package, FolderTree, Tags, BarChart3, ArrowLeft, Menu, X, Database } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLocale();

  const sidebarItems = [
    { title: t("dashboard"), href: "/admin", icon: LayoutDashboard },
    { title: t("productManagement"), href: "/admin/products", icon: Package },
    { title: t("categoryManagement"), href: "/admin/categories", icon: FolderTree },
    { title: t("tagManagement"), href: "/admin/tags", icon: Tags },
    { title: t("analytics"), href: "/admin/analytics", icon: BarChart3 },
  ];

  const handleResetData = async () => {
    if (confirm(t("confirmDelete"))) {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Success!");
        window.location.reload();
      } else {
        alert("Failed: " + data.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="lg:hidden sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-semibold">{t("admin")}</Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-56 bg-background border-r transform transition-transform lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b hidden lg:flex items-center justify-between">
              <div>
                <Link href="/admin" className="font-semibold">{t("brand")}</Link>
                <p className="text-xs text-muted-foreground">{t("admin")}</p>
              </div>
              <LocaleSwitcher />
            </div>

            <ScrollArea className="flex-1 px-3 py-3">
              <nav className="space-y-0.5">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === item.href ? "bg-secondary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>

              <Separator className="my-3" />

              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleResetData}>
                <Database className="w-4 h-4 mr-2.5" />
                {t("resetData")}
              </Button>
            </ScrollArea>

            <div className="p-3 border-t">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" />{t("backToStore")}</Link>
              </Button>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
