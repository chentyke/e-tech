import { NextRequest, NextResponse } from 'next/server';
import db, { Product, ProductImage } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface ProductWithDetails extends Product {
  category_name?: string;
  category_name_en?: string;
  category_name_ko?: string;
  images?: ProductImage[];
  tags?: { id: string; name: string }[];
}

// GET - 获取单个产品详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.name_en as category_name_en, c.name_ko as category_name_ko
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id) as ProductWithDetails | undefined;

    if (!product) {
      return NextResponse.json({ success: false, error: '产品不存在' }, { status: 404 });
    }

    // 获取图片
    product.images = db.prepare(`
      SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC
    `).all(id) as ProductImage[];

    // 获取标签
    product.tags = db.prepare(`
      SELECT t.* FROM tags t
      JOIN product_tags pt ON t.id = pt.tag_id
      WHERE pt.product_id = ?
    `).all(id) as { id: string; name: string }[];

    // 增加浏览量
    db.prepare('UPDATE products SET view_count = view_count + 1 WHERE id = ?').run(id);

    // 记录浏览日志
    db.prepare(`
      INSERT INTO view_logs (id, product_id, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(uuidv4(), id);

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('获取产品详情失败:', error);
    return NextResponse.json({ success: false, error: '获取产品详情失败' }, { status: 500 });
  }
}

// PUT - 更新产品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: '产品不存在' }, { status: 404 });
    }

    const {
      name,
      name_en,
      name_ko,
      description,
      description_en,
      description_ko,
      price,
      original_price,
      sku,
      category_id,
      brand,
      material,
      color,
      sizes,
      stock_status,
      stock_quantity,
      is_featured,
      is_new,
      is_sale,
      sort_order,
      images,
      tags
    } = body;

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        name_en = ?,
        name_ko = ?,
        description = ?,
        description_en = ?,
        description_ko = ?,
        price = COALESCE(?, price),
        original_price = ?,
        sku = COALESCE(?, sku),
        category_id = ?,
        brand = COALESCE(?, brand),
        material = COALESCE(?, material),
        color = COALESCE(?, color),
        sizes = COALESCE(?, sizes),
        stock_status = COALESCE(?, stock_status),
        stock_quantity = COALESCE(?, stock_quantity),
        is_featured = COALESCE(?, is_featured),
        is_new = COALESCE(?, is_new),
        is_sale = COALESCE(?, is_sale),
        sort_order = COALESCE(?, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, name_en || null, name_ko || null,
      description || null, description_en || null, description_ko || null,
      price, original_price,
      sku, category_id, brand, material, color,
      sizes ? JSON.stringify(sizes) : null,
      stock_status, stock_quantity,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_new !== undefined ? (is_new ? 1 : 0) : null,
      is_sale !== undefined ? (is_sale ? 1 : 0) : null,
      sort_order, id
    );

    // 更新图片
    if (images !== undefined) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
      if (Array.isArray(images)) {
        const insertImage = db.prepare(`
          INSERT INTO product_images (id, product_id, url, alt_text, is_primary, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        images.forEach((url: string, index: number) => {
          insertImage.run(uuidv4(), id, url, name || '', index === 0 ? 1 : 0, index);
        });
      }
    }

    // 更新标签
    if (tags !== undefined) {
      db.prepare('DELETE FROM product_tags WHERE product_id = ?').run(id);
      if (Array.isArray(tags)) {
        const insertTag = db.prepare('INSERT OR IGNORE INTO product_tags (product_id, tag_id) VALUES (?, ?)');
        tags.forEach((tagId: string) => {
          insertTag.run(id, tagId);
        });
      }
    }

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('更新产品失败:', error);
    return NextResponse.json({ success: false, error: '更新产品失败' }, { status: 500 });
  }
}

// DELETE - 删除产品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: '产品不存在' }, { status: 404 });
    }

    // 删除相关数据（外键级联会自动处理 images, tags, view_logs）
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: '产品已删除' });
  } catch (error) {
    console.error('删除产品失败:', error);
    return NextResponse.json({ success: false, error: '删除产品失败' }, { status: 500 });
  }
}

