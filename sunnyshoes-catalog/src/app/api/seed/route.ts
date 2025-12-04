import { NextResponse } from 'next/server';
import { seed } from '@/lib/seed';

// POST - 重新初始化数据
export async function POST() {
  try {
    seed();
    return NextResponse.json({ success: true, message: '数据初始化完成' });
  } catch (error) {
    console.error('数据初始化失败:', error);
    return NextResponse.json({ success: false, error: '数据初始化失败' }, { status: 500 });
  }
}

