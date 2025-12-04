import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Locale } from "./i18n"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 图片尺寸类型
export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

// 从原始图片URL获取优化版本的URL
export function getOptimizedImageUrl(url: string, size: ImageSize = 'medium'): string {
  if (!url) return url;
  
  // 如果是外部URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 检查是否已经是优化版本的URL（包含尺寸后缀）
  const sizePattern = /-(thumbnail|small|medium|large|original)\.webp$/;
  if (sizePattern.test(url)) {
    // 已经是优化版本，替换为目标尺寸
    return url.replace(sizePattern, `-${size}.webp`);
  }
  
  // 检查文件扩展名
  const extMatch = url.match(/\.([^.]+)$/);
  if (!extMatch) return url;
  
  const ext = extMatch[1].toLowerCase();
  const basePath = url.slice(0, -ext.length - 1); // 移除扩展名
  
  // 尝试返回优化版本的URL
  return `${basePath}-${size}.webp`;
}

// 生成响应式图片srcSet
export function generateSrcSet(url: string): string {
  if (!url) return '';
  
  // 外部URL不处理
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return '';
  }
  
  const sizes: { size: ImageSize; width: number }[] = [
    { size: 'thumbnail', width: 200 },
    { size: 'small', width: 400 },
    { size: 'medium', width: 800 },
    { size: 'large', width: 1200 },
  ];
  
  return sizes
    .map(({ size, width }) => `${getOptimizedImageUrl(url, size)} ${width}w`)
    .join(', ');
}

// 根据显示尺寸选择最佳图片
export function getBestImageSize(displayWidth: number): ImageSize {
  // 考虑 2x 视网膜屏幕
  const targetWidth = displayWidth * 2;
  
  if (targetWidth <= 200) return 'thumbnail';
  if (targetWidth <= 400) return 'small';
  if (targetWidth <= 800) return 'medium';
  return 'large';
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

