import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - 获取分析数据
export async function GET() {
  try {
    // 总览统计
    const overview = {
      totalProducts: (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count,
      totalCategories: (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count,
      totalViews: (db.prepare('SELECT SUM(view_count) as sum FROM products').get() as { sum: number }).sum || 0,
      lowStockCount: (db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_status = 'low_stock' OR stock_quantity < 30").get() as { count: number }).count,
      outOfStockCount: (db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_status = 'out_of_stock' OR stock_quantity = 0").get() as { count: number }).count,
    };

    // 热门产品（按浏览量）
    const topProducts = db.prepare(`
      SELECT p.id, p.name, p.view_count, p.price,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
      FROM products p
      ORDER BY p.view_count DESC
      LIMIT 10
    `).all();

    // 分类分布
    const categoryDistribution = db.prepare(`
      SELECT c.name, COUNT(p.id) as product_count,
        SUM(p.view_count) as total_views
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY product_count DESC
    `).all();

    // 库存状态分布
    const stockDistribution = db.prepare(`
      SELECT 
        stock_status,
        COUNT(*) as count
      FROM products
      GROUP BY stock_status
    `).all();

    // 价格区间分布
    const priceRanges = db.prepare(`
      SELECT 
        CASE 
          WHEN price < 300 THEN '0-299'
          WHEN price < 500 THEN '300-499'
          WHEN price < 800 THEN '500-799'
          WHEN price < 1000 THEN '800-999'
          ELSE '1000+'
        END as price_range,
        COUNT(*) as count
      FROM products
      GROUP BY price_range
      ORDER BY 
        CASE price_range
          WHEN '0-299' THEN 1
          WHEN '300-499' THEN 2
          WHEN '500-799' THEN 3
          WHEN '800-999' THEN 4
          ELSE 5
        END
    `).all();

    // 最近30天浏览趋势
    const viewTrend = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views
      FROM view_logs
      WHERE created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    // 新品和促销统计
    const productStats = {
      newProducts: (db.prepare('SELECT COUNT(*) as count FROM products WHERE is_new = 1').get() as { count: number }).count,
      saleProducts: (db.prepare('SELECT COUNT(*) as count FROM products WHERE is_sale = 1').get() as { count: number }).count,
      featuredProducts: (db.prepare('SELECT COUNT(*) as count FROM products WHERE is_featured = 1').get() as { count: number }).count,
    };

    return NextResponse.json({
      success: true,
      data: {
        overview,
        topProducts,
        categoryDistribution,
        stockDistribution,
        priceRanges,
        viewTrend,
        productStats,
      }
    });
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json({ success: false, error: '获取分析数据失败' }, { status: 500 });
  }
}

