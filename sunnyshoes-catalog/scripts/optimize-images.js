/**
 * 图片优化脚本
 * 为现有图片生成优化版本（WebP格式，多尺寸）
 * 
 * 使用方法: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// 图片尺寸配置
const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 200, quality: 70 },
  small: { width: 400, height: 400, quality: 75 },
  medium: { width: 800, height: 800, quality: 80 },
  large: { width: 1200, height: 1200, quality: 85 },
};

// 支持的图片格式
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// 要处理的目录
const IMAGE_DIRECTORIES = [
  'public/images/products',
  'public/images/categories',
  'public/images',  // banner等
];

async function processImage(inputPath, outputDir, baseFilename) {
  console.log(`  处理: ${path.basename(inputPath)}`);
  
  const buffer = await fs.readFile(inputPath);
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width || 1000;
  const originalHeight = metadata.height || 1000;
  
  const results = [];
  
  // 生成各尺寸版本
  for (const [sizeName, config] of Object.entries(IMAGE_SIZES)) {
    const outputFilename = `${baseFilename}-${sizeName}.webp`;
    const outputPath = path.join(outputDir, outputFilename);
    
    // 检查是否已存在
    try {
      await fs.access(outputPath);
      console.log(`    跳过 ${sizeName} (已存在)`);
      continue;
    } catch {
      // 文件不存在，继续处理
    }
    
    const needsResize = originalWidth > config.width || originalHeight > config.height;
    
    let processedBuffer;
    if (needsResize) {
      processedBuffer = await sharp(buffer)
        .resize(config.width, config.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: config.quality, effort: 6 })
        .toBuffer();
    } else {
      processedBuffer = await sharp(buffer)
        .webp({ quality: config.quality, effort: 6 })
        .toBuffer();
    }
    
    await fs.writeFile(outputPath, processedBuffer);
    
    const originalSize = buffer.length;
    const newSize = processedBuffer.length;
    const savings = Math.round((1 - newSize / originalSize) * 100);
    
    console.log(`    ${sizeName}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (节省 ${savings}%)`);
    results.push({ size: sizeName, path: outputPath });
  }
  
  // 生成优化的原尺寸版本
  const originalFilename = `${baseFilename}-original.webp`;
  const originalOutputPath = path.join(outputDir, originalFilename);
  
  try {
    await fs.access(originalOutputPath);
    console.log(`    跳过 original (已存在)`);
  } catch {
    const originalProcessed = await sharp(buffer)
      .webp({ quality: 90, effort: 6 })
      .toBuffer();
    
    await fs.writeFile(originalOutputPath, originalProcessed);
    
    const savings = Math.round((1 - originalProcessed.length / buffer.length) * 100);
    console.log(`    original: ${(buffer.length / 1024).toFixed(1)}KB → ${(originalProcessed.length / 1024).toFixed(1)}KB (节省 ${savings}%)`);
  }
  
  return results;
}

async function processDirectory(dirPath) {
  const absolutePath = path.join(process.cwd(), dirPath);
  
  try {
    await fs.access(absolutePath);
  } catch {
    console.log(`目录不存在，跳过: ${dirPath}`);
    return;
  }
  
  console.log(`\n处理目录: ${dirPath}`);
  
  const files = await fs.readdir(absolutePath);
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    // 跳过已经是优化版本的文件
    if (file.match(/-(thumbnail|small|medium|large|original)\.webp$/)) {
      skippedCount++;
      continue;
    }
    
    // 检查是否是支持的图片格式
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      continue;
    }
    
    const inputPath = path.join(absolutePath, file);
    const stats = await fs.stat(inputPath);
    
    // 跳过目录
    if (stats.isDirectory()) {
      continue;
    }
    
    // 获取基础文件名（不含扩展名）
    const baseFilename = path.basename(file, ext);
    
    try {
      await processImage(inputPath, absolutePath, baseFilename);
      processedCount++;
    } catch (error) {
      console.error(`  处理失败: ${file}`, error.message);
    }
  }
  
  console.log(`完成: 处理 ${processedCount} 个文件, 跳过 ${skippedCount} 个已优化文件`);
}

async function main() {
  console.log('===========================================');
  console.log('图片优化脚本');
  console.log('将现有图片转换为 WebP 格式并生成多尺寸版本');
  console.log('===========================================');
  
  const startTime = Date.now();
  
  for (const dir of IMAGE_DIRECTORIES) {
    await processDirectory(dir);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n全部完成！耗时: ${duration}秒`);
}

main().catch(console.error);



