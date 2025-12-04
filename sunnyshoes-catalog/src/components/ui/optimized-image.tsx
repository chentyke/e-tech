"use client";

import { useState, useCallback } from "react";
import Image, { ImageProps } from "next/image";
import { getOptimizedImageUrl, type ImageSize } from "@/lib/utils";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string | null | undefined;
  /**
   * 目标显示尺寸，用于选择合适的压缩版本
   * - thumbnail: 200px (列表缩略图)
   * - small: 400px (网格卡片)
   * - medium: 800px (详情页主图)
   * - large: 1200px (全屏/大图)
   * - original: 原始尺寸
   */
  imageSize?: ImageSize;
  /**
   * 是否显示占位符（当没有图片或加载失败时）
   */
  showPlaceholder?: boolean;
  /**
   * 占位符图标大小
   */
  placeholderIconSize?: "sm" | "md" | "lg";
  /**
   * 占位符容器的额外类名
   */
  placeholderClassName?: string;
  /**
   * 图片加载失败时的回调
   */
  onImageError?: () => void;
}

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-16 h-16",
};

export function OptimizedImage({
  src,
  imageSize = "medium",
  showPlaceholder = true,
  placeholderIconSize = "md",
  placeholderClassName,
  onImageError,
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = useCallback(() => {
    setError(true);
    onImageError?.();
  }, [onImageError]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  // 获取优化后的图片URL
  const optimizedSrc = src ? getOptimizedImageUrl(src, imageSize) : null;

  // 如果没有图片或加载失败，显示占位符
  if (!optimizedSrc || error) {
    if (!showPlaceholder) return null;
    
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-muted",
          placeholderClassName
        )}
      >
        <Package
          className={cn(
            "text-muted-foreground/30",
            iconSizes[placeholderIconSize]
          )}
        />
      </div>
    );
  }

  return (
    <>
      {/* 加载时显示骨架屏 */}
      {!loaded && (
        <div
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            placeholderClassName
          )}
        />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        className={cn(
          className,
          !loaded && "opacity-0",
          loaded && "opacity-100 transition-opacity duration-200"
        )}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
}

/**
 * 带有回退机制的图片组件
 * 会先尝试加载优化版本，失败后尝试原始版本
 */
interface FallbackImageProps extends OptimizedImageProps {
  fallbackSrc?: string;
}

export function FallbackImage({
  src,
  fallbackSrc,
  imageSize = "medium",
  onImageError,
  ...props
}: FallbackImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const handleError = useCallback(() => {
    if (!useFallback && (fallbackSrc || src)) {
      setUseFallback(true);
    } else {
      setFallbackError(true);
      onImageError?.();
    }
  }, [useFallback, fallbackSrc, src, onImageError]);

  // 如果fallback也失败了，显示占位符
  if (fallbackError) {
    return (
      <OptimizedImage
        src={null}
        imageSize={imageSize}
        {...props}
      />
    );
  }

  // 使用fallback或原始URL
  const currentSrc = useFallback ? (fallbackSrc || src) : src;

  return (
    <OptimizedImage
      src={currentSrc}
      imageSize={useFallback ? "original" : imageSize}
      onImageError={handleError}
      {...props}
    />
  );
}

