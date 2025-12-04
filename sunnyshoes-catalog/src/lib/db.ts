import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'catalog.db');

// 确保数据目录存在
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// 启用外键约束
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 初始化数据库表
db.exec(`
  -- 产品分类表
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ko TEXT,
    description TEXT,
    description_en TEXT,
    description_ko TEXT,
    image_url TEXT,
    parent_id TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  -- 产品表
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ko TEXT,
    description TEXT,
    description_en TEXT,
    description_ko TEXT,
    price REAL NOT NULL,
    original_price REAL,
    sku TEXT UNIQUE,
    category_id TEXT,
    brand TEXT,
    material TEXT,
    color TEXT,
    sizes TEXT, -- JSON array
    stock_status TEXT DEFAULT 'in_stock', -- in_stock, low_stock, out_of_stock
    stock_quantity INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    is_sale INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  -- 产品图片表
  CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  -- 产品标签表
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 产品-标签关联表
  CREATE TABLE IF NOT EXISTS product_tags (
    product_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  -- 浏览记录表（用于分析）
  CREATE TABLE IF NOT EXISTS view_logs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  -- 创建索引
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
  CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
  CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
  CREATE INDEX IF NOT EXISTS idx_view_logs_product ON view_logs(product_id);
  CREATE INDEX IF NOT EXISTS idx_view_logs_created ON view_logs(created_at);
`);

// 数据库迁移 - 添加多语言字段
const migrateMultilingual = () => {
  try {
    // 检查 categories 表是否有 name_en 列
    const catColumns = db.prepare("PRAGMA table_info(categories)").all() as { name: string }[];
    const hasCatNameEn = catColumns.some(col => col.name === 'name_en');
    
    if (!hasCatNameEn) {
      db.exec(`
        ALTER TABLE categories ADD COLUMN name_en TEXT;
        ALTER TABLE categories ADD COLUMN name_ko TEXT;
        ALTER TABLE categories ADD COLUMN description_en TEXT;
        ALTER TABLE categories ADD COLUMN description_ko TEXT;
      `);
      console.log('已添加 categories 多语言字段');
    }

    // 检查 products 表是否有 name_en 列
    const prodColumns = db.prepare("PRAGMA table_info(products)").all() as { name: string }[];
    const hasProdNameEn = prodColumns.some(col => col.name === 'name_en');
    
    if (!hasProdNameEn) {
      db.exec(`
        ALTER TABLE products ADD COLUMN name_en TEXT;
        ALTER TABLE products ADD COLUMN name_ko TEXT;
        ALTER TABLE products ADD COLUMN description_en TEXT;
        ALTER TABLE products ADD COLUMN description_ko TEXT;
      `);
      console.log('已添加 products 多语言字段');
    }
  } catch (error) {
    // 忽略列已存在的错误
    console.log('多语言字段迁移完成或已存在');
  }
};

migrateMultilingual();

export default db;

// 类型定义
export interface Category {
  id: string;
  name: string;
  name_en: string | null;
  name_ko: string | null;
  description: string | null;
  description_en: string | null;
  description_ko: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  name_en: string | null;
  name_ko: string | null;
  description: string | null;
  description_en: string | null;
  description_ko: string | null;
  price: number;
  original_price: number | null;
  sku: string | null;
  category_id: string | null;
  brand: string | null;
  material: string | null;
  color: string | null;
  sizes: string | null;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity: number;
  is_featured: number;
  is_new: number;
  is_sale: number;
  view_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: number;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface ViewLog {
  id: string;
  product_id: string;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

