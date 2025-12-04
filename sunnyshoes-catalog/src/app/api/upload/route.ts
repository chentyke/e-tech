import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// 图片尺寸配置
const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 200 },   // 缩略图
  small: { width: 400, height: 400 },        // 小图
  medium: { width: 800, height: 800 },       // 中图
  large: { width: 1200, height: 1200 },      // 大图
} as const;

// WebP 压缩质量配置
const WEBP_QUALITY = {
  thumbnail: 70,
  small: 75,
  medium: 80,
  large: 85,
} as const;

interface ProcessedImage {
  size: string;
  url: string;
  width: number;
  height: number;
}

async function processAndSaveImage(
  buffer: Buffer,
  uploadDir: string,
  baseFilename: string,
  subDir: string
): Promise<{ original: string; optimized: ProcessedImage[] }> {
  const results: ProcessedImage[] = [];
  
  // 获取原始图片信息
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width || 1000;
  const originalHeight = metadata.height || 1000;
  
  // 处理各种尺寸
  for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
    const quality = WEBP_QUALITY[sizeName as keyof typeof WEBP_QUALITY];
    const filename = `${baseFilename}-${sizeName}.webp`;
    const filePath = path.join(uploadDir, filename);
    
    // 只在原图大于目标尺寸时才缩放
    const needsResize = originalWidth > dimensions.width || originalHeight > dimensions.height;
    
    let processedBuffer: Buffer;
    let finalWidth: number;
    let finalHeight: number;
    
    if (needsResize) {
      // 保持宽高比缩放
      const resized = await sharp(buffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 6 })
        .toBuffer({ resolveWithObject: true });
      
      processedBuffer = resized.data;
      finalWidth = resized.info.width;
      finalHeight = resized.info.height;
    } else {
      // 原图小于目标尺寸，只转换格式和压缩
      const converted = await sharp(buffer)
        .webp({ quality, effort: 6 })
        .toBuffer({ resolveWithObject: true });
      
      processedBuffer = converted.data;
      finalWidth = converted.info.width;
      finalHeight = converted.info.height;
    }
    
    await writeFile(filePath, processedBuffer);
    
    results.push({
      size: sizeName,
      url: `/images/${subDir}/${filename}`,
      width: finalWidth,
      height: finalHeight,
    });
  }
  
  // 保存优化后的原尺寸版本（WebP格式，高质量）
  const originalFilename = `${baseFilename}-original.webp`;
  const originalFilePath = path.join(uploadDir, originalFilename);
  
  const originalProcessed = await sharp(buffer)
    .webp({ quality: 90, effort: 6 })
    .toBuffer();
  
  await writeFile(originalFilePath, originalProcessed);
  
  return {
    original: `/images/${subDir}/${originalFilename}`,
    optimized: results,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'product' or 'category'

    if (!file) {
      return NextResponse.json({ success: false, error: '没有上传文件' }, { status: 400 });
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: '只支持 JPG、PNG、WebP、GIF 格式' }, { status: 400 });
    }

    // 检查文件大小 (最大 10MB - 因为会压缩)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: '文件大小不能超过 10MB' }, { status: 400 });
    }

    // 生成基础文件名
    const baseFilename = uuidv4();

    // 确定保存目录
    const subDir = type === 'category' ? 'categories' : 'products';
    const uploadDir = path.join(process.cwd(), 'public', 'images', subDir);

    // 确保目录存在
    await mkdir(uploadDir, { recursive: true });

    // 读取文件buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 处理和压缩图片
    const { original, optimized } = await processAndSaveImage(
      buffer,
      uploadDir,
      baseFilename,
      subDir
    );

    // 返回最适合显示的URL（medium尺寸）作为主URL
    // 同时返回所有尺寸供前端选择
    const mediumImage = optimized.find(img => img.size === 'medium');
    const primaryUrl = mediumImage?.url || original;

    return NextResponse.json({ 
      success: true, 
      url: primaryUrl,
      images: {
        original,
        ...Object.fromEntries(optimized.map(img => [img.size, img.url])),
      },
      // 返回srcset供响应式图片使用
      srcset: optimized
        .map(img => `${img.url} ${img.width}w`)
        .join(', '),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: '上传失败' }, { status: 500 });
  }
}
