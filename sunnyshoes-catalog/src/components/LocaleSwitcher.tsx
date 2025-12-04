"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { locales } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = locales.find((l) => l.code === locale);

  // 避免 hydration mismatch - 只在客户端渲染
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground">
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLocale?.label}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLocale?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={locale === l.code ? "bg-secondary" : ""}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

