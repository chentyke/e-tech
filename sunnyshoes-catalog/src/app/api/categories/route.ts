import { NextRequest, NextResponse } from 'next/server';
import db, { Category } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET - 获取所有分类
export async function GET() {
  try {
    const categories = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.sort_order ASC
    `).all() as (Category & { product_count: number })[];

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ success: false, error: '获取分类失败' }, { status: 500 });
  }
}

// POST - 创建新分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, name_en, name_ko, description, description_en, description_ko, image_url, parent_id } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: '分类名称不能为空' }, { status: 400 });
    }

    const id = uuidv4();
    const maxSortOrder = db.prepare('SELECT MAX(sort_order) as max FROM categories').get() as { max: number };
    const sortOrder = (maxSortOrder?.max || 0) + 1;

    db.prepare(`
      INSERT INTO categories (id, name, name_en, name_ko, description, description_en, description_ko, image_url, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, name_en || null, name_ko || null, description || null, description_en || null, description_ko || null, image_url || null, parent_id || null, sortOrder);

    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ success: false, error: '创建分类失败' }, { status: 500 });
  }
}
