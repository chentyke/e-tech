import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET - 获取所有标签
export async function GET() {
  try {
    const tags = db.prepare(`
      SELECT t.*, 
        (SELECT COUNT(*) FROM product_tags WHERE tag_id = t.id) as product_count
      FROM tags t
      ORDER BY t.name ASC
    `).all();

    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json({ success: false, error: '获取标签失败' }, { status: 500 });
  }
}

// POST - 创建新标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: '标签名称不能为空' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM tags WHERE name = ?').get(name);
    if (existing) {
      return NextResponse.json({ success: false, error: '标签已存在' }, { status: 400 });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO tags (id, name) VALUES (?, ?)').run(id, name);

    const newTag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);

    return NextResponse.json({ success: true, data: newTag }, { status: 201 });
  } catch (error) {
    console.error('创建标签失败:', error);
    return NextResponse.json({ success: false, error: '创建标签失败' }, { status: 500 });
  }
}

