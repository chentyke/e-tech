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

// GET - 获取产品列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const newProducts = searchParams.get('new');
    const sale = searchParams.get('sale');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    let whereClause = '1=1';
    const params: (string | number)[] = [];

    if (category) {
      whereClause += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (featured === 'true') {
      whereClause += ' AND p.is_featured = 1';
    }

    if (newProducts === 'true') {
      whereClause += ' AND p.is_new = 1';
    }

    if (sale === 'true') {
      whereClause += ' AND p.is_sale = 1';
    }

    // 验证排序字段
    const validSortFields = ['created_at', 'price', 'view_count', 'name', 'sort_order'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 获取总数
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM products p WHERE ${whereClause}
    `).get(...params) as { total: number };

    // 获取产品列表
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, c.name_en as category_name_en, c.name_ko as category_name_ko
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY p.${sortField} ${sortDir}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as ProductWithDetails[];

    // 获取每个产品的图片
    const imageStmt = db.prepare(`
      SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC
    `);

    const tagStmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN product_tags pt ON t.id = pt.tag_id
      WHERE pt.product_id = ?
    `);

    products.forEach(product => {
      product.images = imageStmt.all(product.id) as ProductImage[];
      product.tags = tagStmt.all(product.id) as { id: string; name: string }[];
    });

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total: countResult.total,
        limit,
        offset,
        hasMore: offset + limit < countResult.total
      }
    });
  } catch (error) {
    console.error('获取产品列表失败:', error);
    return NextResponse.json({ success: false, error: '获取产品列表失败' }, { status: 500 });
  }
}

// POST - 创建新产品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      images,
      tags
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ success: false, error: '产品名称和价格不能为空' }, { status: 400 });
    }

    const id = uuidv4();
    const maxSortOrder = db.prepare('SELECT MAX(sort_order) as max FROM products').get() as { max: number };
    const sortOrder = (maxSortOrder?.max || 0) + 1;

    db.prepare(`
      INSERT INTO products (
        id, name, name_en, name_ko, description, description_en, description_ko, 
        price, original_price, sku, category_id,
        brand, material, color, sizes, stock_status, stock_quantity,
        is_featured, is_new, is_sale, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, name_en || null, name_ko || null, 
      description || null, description_en || null, description_ko || null,
      price, original_price || null,
      sku || null, category_id || null, brand || null, material || null,
      color || null, sizes ? JSON.stringify(sizes) : null,
      stock_status || 'in_stock', stock_quantity || 0,
      is_featured ? 1 : 0, is_new ? 1 : 0, is_sale ? 1 : 0, sortOrder
    );

    // 添加图片
    if (images && Array.isArray(images)) {
      const insertImage = db.prepare(`
        INSERT INTO product_images (id, product_id, url, alt_text, is_primary, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      images.forEach((url: string, index: number) => {
        insertImage.run(uuidv4(), id, url, name, index === 0 ? 1 : 0, index);
      });
    }

    // 添加标签
    if (tags && Array.isArray(tags)) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO product_tags (product_id, tag_id) VALUES (?, ?)');
      tags.forEach((tagId: string) => {
        insertTag.run(id, tagId);
      });
    }

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error('创建产品失败:', error);
    return NextResponse.json({ success: false, error: '创建产品失败' }, { status: 500 });
  }
}

