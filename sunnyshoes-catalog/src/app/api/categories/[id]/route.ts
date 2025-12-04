import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - 获取单个分类
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
      FROM categories c
      WHERE c.id = ?
    `).get(id);

    if (!category) {
      return NextResponse.json({ success: false, error: '分类不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ success: false, error: '获取分类失败' }, { status: 500 });
  }
}

// PUT - 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, name_en, name_ko, description, description_en, description_ko, image_url, parent_id, sort_order } = body;

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: '分类不存在' }, { status: 404 });
    }

    db.prepare(`
      UPDATE categories 
      SET name = COALESCE(?, name),
          name_en = ?,
          name_ko = ?,
          description = ?,
          description_en = ?,
          description_ko = ?,
          image_url = ?,
          parent_id = ?,
          sort_order = COALESCE(?, sort_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, name_en || null, name_ko || null, description || null, description_en || null, description_ko || null, image_url || null, parent_id || null, sort_order, id);

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ success: false, error: '更新分类失败' }, { status: 500 });
  }
}

// DELETE - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: '分类不存在' }, { status: 404 });
    }

    // 将该分类下的产品设为无分类
    db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(id);
    
    // 删除分类
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: '分类已删除' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ success: false, error: '删除分类失败' }, { status: 500 });
  }
}

