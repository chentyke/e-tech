import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Locale } from "./i18n"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// 获取本地化内容的辅助函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedContent(
  item: any,
  field: string,
  locale: Locale
): string {
  if (locale === 'en') {
    const enField = `${field}_en`;
    if (item[enField]) return item[enField] as string;
  }
  if (locale === 'ko') {
    const koField = `${field}_ko`;
    if (item[koField]) return item[koField] as string;
  }
  // 默认返回中文（原字段）
  return (item[field] as string) || '';
}

