import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 允许的图片格式，优先使用WebP
    formats: ['image/webp', 'image/avif'],
    // 预设设备尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // 预设图片尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 384, 400, 800],
    // 最小缓存TTL (30天)
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // 服务端组件配置（SQLite需要）
  serverExternalPackages: ['better-sqlite3'],
  // 启用压缩
  compress: true,
  // 优化生产构建
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

export default nextConfig;
