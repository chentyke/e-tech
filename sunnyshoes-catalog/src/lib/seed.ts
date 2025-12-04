import db from './db';
import { v4 as uuidv4 } from 'uuid';

// 清空现有数据
const clearData = () => {
  db.exec(`
    DELETE FROM view_logs;
    DELETE FROM product_tags;
    DELETE FROM tags;
    DELETE FROM product_images;
    DELETE FROM products;
    DELETE FROM categories;
  `);
};

// 种子数据
const seedData = () => {
  // 创建分类 - 包含多语言
  const categories = [
    { 
      id: uuidv4(), 
      name: '运动鞋', 
      name_en: 'Sports Shoes',
      name_ko: '운동화',
      description: '专业运动鞋系列，适合各类运动场景', 
      description_en: 'Professional sports shoe collection for various athletic activities',
      description_ko: '다양한 운동 활동에 적합한 전문 운동화 컬렉션',
      image_url: '/images/categories/sports.jpg' 
    },
    { 
      id: uuidv4(), 
      name: '休闲鞋', 
      name_en: 'Casual Shoes',
      name_ko: '캐주얼 신발',
      description: '日常穿搭必备，舒适时尚', 
      description_en: 'Daily essentials, comfortable and stylish',
      description_ko: '일상의 필수품, 편안하고 스타일리시한',
      image_url: '/images/categories/casual.jpg' 
    },
    { 
      id: uuidv4(), 
      name: '皮鞋', 
      name_en: 'Leather Shoes',
      name_ko: '구두',
      description: '商务正装鞋款，彰显品味', 
      description_en: 'Business formal footwear, showcasing your taste',
      description_ko: '비즈니스 정장 신발, 당신의 품격을 보여주세요',
      image_url: '/images/categories/leather.jpg' 
    },
    { 
      id: uuidv4(), 
      name: '凉鞋', 
      name_en: 'Sandals',
      name_ko: '샌들',
      description: '夏季清凉之选', 
      description_en: 'Cool choice for summer',
      description_ko: '여름을 위한 시원한 선택',
      image_url: '/images/categories/sandals.jpg' 
    },
    { 
      id: uuidv4(), 
      name: '靴子', 
      name_en: 'Boots',
      name_ko: '부츠',
      description: '秋冬保暖时尚单品', 
      description_en: 'Warm and fashionable items for autumn and winter',
      description_ko: '가을과 겨울을 위한 따뜻하고 패셔너블한 아이템',
      image_url: '/images/categories/boots.jpg' 
    },
    { 
      id: uuidv4(), 
      name: '帆布鞋', 
      name_en: 'Canvas Shoes',
      name_ko: '캔버스화',
      description: '经典百搭，青春活力', 
      description_en: 'Classic versatile style, youthful energy',
      description_ko: '클래식하고 다재다능한 스타일, 젊은 에너지',
      image_url: '/images/categories/canvas.jpg' 
    },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, name_en, name_ko, description, description_en, description_ko, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  categories.forEach((cat, index) => {
    insertCategory.run(cat.id, cat.name, cat.name_en, cat.name_ko, cat.description, cat.description_en, cat.description_ko, cat.image_url, index);
  });

  // 创建标签
  const tags = [
    { id: uuidv4(), name: '新品' },
    { id: uuidv4(), name: '热销' },
    { id: uuidv4(), name: '限量' },
    { id: uuidv4(), name: '环保' },
    { id: uuidv4(), name: '透气' },
    { id: uuidv4(), name: '防水' },
    { id: uuidv4(), name: '轻便' },
    { id: uuidv4(), name: '缓震' },
  ];

  const insertTag = db.prepare('INSERT INTO tags (id, name) VALUES (?, ?)');
  tags.forEach(tag => insertTag.run(tag.id, tag.name));

  // 创建产品 - 包含多语言
  const products = [
    {
      id: uuidv4(),
      name: 'SunnyRun Pro 极速跑鞋',
      name_en: 'SunnyRun Pro Speed Running Shoes',
      name_ko: '써니런 프로 스피드 러닝화',
      description: '采用最新科技缓震材料，轻盈透气，专为长距离跑步设计。鞋面采用3D针织工艺，完美贴合足部曲线，提供卓越的包裹感。',
      description_en: 'Featuring the latest cushioning technology, lightweight and breathable, designed for long-distance running. The upper uses 3D knitting technology for a perfect fit to your foot contours, providing excellent support.',
      description_ko: '최신 쿠셔닝 기술을 적용하여 가볍고 통기성이 뛰어나며, 장거리 러닝을 위해 설계되었습니다. 갑피는 3D 니팅 기술로 발의 곡선에 완벽하게 맞아 탁월한 지지력을 제공합니다.',
      price: 899,
      original_price: 1199,
      sku: 'SR-PRO-001',
      category_id: categories[0].id,
      brand: 'Sunnyshoes',
      material: '飞织网布+TPU',
      color: '星空黑',
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']),
      stock_status: 'in_stock',
      stock_quantity: 150,
      is_featured: 1,
      is_new: 1,
      is_sale: 1,
      view_count: 1256,
      images: ['/images/products/SR-PRO-001-1.jpg', '/images/products/SR-PRO-001-2.jpg', '/images/products/SR-PRO-001-3.jpg']
    },
    {
      id: uuidv4(),
      name: 'CloudWalk 云步休闲鞋',
      name_en: 'CloudWalk Casual Shoes',
      name_ko: '클라우드워크 캐주얼 슈즈',
      description: '云端般的行走体验，采用记忆棉鞋垫，久站不累。简约百搭设计，通勤出行皆宜。',
      description_en: 'Cloud-like walking experience with memory foam insoles. Simple and versatile design, perfect for commuting.',
      description_ko: '메모리폼 인솔로 구름 위를 걷는 듯한 경험. 심플하고 다재다능한 디자인으로 출퇴근에 완벽합니다.',
      price: 599,
      original_price: null,
      sku: 'CW-001',
      category_id: categories[1].id,
      brand: 'Sunnyshoes',
      material: '头层牛皮',
      color: '米白色',
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42', '43']),
      stock_status: 'in_stock',
      stock_quantity: 200,
      is_featured: 1,
      is_new: 0,
      is_sale: 0,
      view_count: 892,
      images: ['/images/products/CW-001-1.jpg', '/images/products/CW-001-2.jpg']
    },
    {
      id: uuidv4(),
      name: 'Executive 商务精英皮鞋',
      name_en: 'Executive Business Leather Shoes',
      name_ko: '이그제큐티브 비즈니스 가죽 구두',
      description: '意大利进口小牛皮，手工固特异缝制工艺，商务人士的品质之选。',
      description_en: 'Italian imported calfskin leather with handcrafted Goodyear welt construction. The quality choice for business professionals.',
      description_ko: '이탈리아산 송아지 가죽과 수제 구드이어 웰트 공법. 비즈니스 전문가를 위한 품질 있는 선택.',
      price: 1599,
      original_price: 1999,
      sku: 'EX-001',
      category_id: categories[2].id,
      brand: 'Sunnyshoes Premium',
      material: '意大利小牛皮',
      color: '深棕色',
      sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
      stock_status: 'low_stock',
      stock_quantity: 25,
      is_featured: 1,
      is_new: 0,
      is_sale: 1,
      view_count: 567,
      images: ['/images/products/EX-001-1.jpg', '/images/products/EX-001-2.jpg']
    },
    {
      id: uuidv4(),
      name: 'BreezeSandal 清风凉鞋',
      name_en: 'BreezeSandal Summer Sandals',
      name_ko: '브리즈샌들 여름 샌들',
      description: '轻盈透气设计，人体工学足弓支撑，夏日出行必备。',
      description_en: 'Lightweight breathable design with ergonomic arch support. Essential for summer outings.',
      description_ko: '인체공학적 아치 지지대가 있는 가벼운 통기성 디자인. 여름 외출에 필수품.',
      price: 399,
      original_price: null,
      sku: 'BS-001',
      category_id: categories[3].id,
      brand: 'Sunnyshoes',
      material: 'EVA+织带',
      color: '海军蓝',
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42', '43', '44']),
      stock_status: 'in_stock',
      stock_quantity: 300,
      is_featured: 0,
      is_new: 1,
      is_sale: 0,
      view_count: 423,
      images: ['/images/products/BS-001-1.jpg']
    },
    {
      id: uuidv4(),
      name: 'WinterGuard 保暖雪地靴',
      name_en: 'WinterGuard Warm Snow Boots',
      name_ko: '윈터가드 보온 스노우 부츠',
      description: '内里羊毛加绒，防滑耐磨大底，-30°C保暖不惧严寒。',
      description_en: 'Wool-lined interior, anti-slip and wear-resistant sole. Keeps warm at -30°C, fearless of cold weather.',
      description_ko: '양모 안감, 미끄럼 방지 및 내마모성 밑창. -30°C에서도 따뜻함을 유지하며 추위를 두려워하지 않습니다.',
      price: 799,
      original_price: 999,
      sku: 'WG-001',
      category_id: categories[4].id,
      brand: 'Sunnyshoes',
      material: '防水面料+羊毛内里',
      color: '驼色',
      sizes: JSON.stringify(['35', '36', '37', '38', '39', '40']),
      stock_status: 'in_stock',
      stock_quantity: 180,
      is_featured: 1,
      is_new: 0,
      is_sale: 1,
      view_count: 789,
      images: ['/images/products/WG-001-1.jpg', '/images/products/WG-001-2.jpg']
    },
    {
      id: uuidv4(),
      name: 'ClassicCanvas 经典帆布鞋',
      name_en: 'ClassicCanvas Classic Sneakers',
      name_ko: '클래식캔버스 클래식 스니커즈',
      description: '经典永不过时，环保有机棉帆布，青春活力的象征。',
      description_en: 'Timeless classics with eco-friendly organic cotton canvas. A symbol of youthful energy.',
      description_ko: '친환경 유기농 면 캔버스로 만든 시대를 초월한 클래식. 젊은 에너지의 상징.',
      price: 299,
      original_price: null,
      sku: 'CC-001',
      category_id: categories[5].id,
      brand: 'Sunnyshoes',
      material: '有机棉帆布',
      color: '原白色',
      sizes: JSON.stringify(['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']),
      stock_status: 'in_stock',
      stock_quantity: 500,
      is_featured: 0,
      is_new: 0,
      is_sale: 0,
      view_count: 1567,
      images: ['/images/products/CC-001-1.jpg', '/images/products/CC-001-2.jpg']
    },
    {
      id: uuidv4(),
      name: 'AirMax 气垫篮球鞋',
      name_en: 'AirMax Basketball Shoes',
      name_ko: '에어맥스 농구화',
      description: '全掌气垫缓震，高帮护踝设计，球场制胜利器。',
      description_en: 'Full-length air cushioning, high-top ankle support design. Your winning weapon on the court.',
      description_ko: '풀 렝스 에어 쿠셔닝, 하이탑 발목 지지 디자인. 코트에서의 승리의 무기.',
      price: 1299,
      original_price: null,
      sku: 'AM-001',
      category_id: categories[0].id,
      brand: 'Sunnyshoes Sport',
      material: '合成革+网布',
      color: '黑红配色',
      sizes: JSON.stringify(['40', '41', '42', '43', '44', '45', '46']),
      stock_status: 'in_stock',
      stock_quantity: 100,
      is_featured: 1,
      is_new: 1,
      is_sale: 0,
      view_count: 945,
      images: ['/images/products/AM-001-1.jpg', '/images/products/AM-001-2.jpg']
    },
    {
      id: uuidv4(),
      name: 'UrbanWalker 都市漫步鞋',
      name_en: 'UrbanWalker City Walking Shoes',
      name_ko: '어반워커 시티 워킹화',
      description: '时尚与舒适的完美结合，3D立体鞋垫，城市探索好伙伴。',
      description_en: 'Perfect blend of style and comfort with 3D contoured insoles. Your partner for urban exploration.',
      description_ko: '3D 입체 인솔로 스타일과 편안함의 완벽한 조화. 도시 탐험의 파트너.',
      price: 499,
      original_price: 599,
      sku: 'UW-001',
      category_id: categories[1].id,
      brand: 'Sunnyshoes',
      material: '网布+合成革',
      color: '灰绿色',
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42', '43', '44']),
      stock_status: 'in_stock',
      stock_quantity: 220,
      is_featured: 0,
      is_new: 1,
      is_sale: 1,
      view_count: 678,
      images: ['/images/products/UW-001-1.jpg']
    },
    {
      id: uuidv4(),
      name: 'GentleOxford 绅士牛津鞋',
      name_en: 'GentleOxford Gentleman Oxford Shoes',
      name_ko: '젠틀옥스포드 신사 옥스포드 구두',
      description: '英伦复古风格，精细手工雕花，彰显绅士品格。',
      description_en: 'British vintage style with fine handcrafted brogue details. Showcasing gentleman\'s character.',
      description_ko: '정교한 수제 브로그 디테일이 있는 영국 빈티지 스타일. 신사의 품격을 보여줍니다.',
      price: 1299,
      original_price: null,
      sku: 'GO-001',
      category_id: categories[2].id,
      brand: 'Sunnyshoes Premium',
      material: '头层牛皮',
      color: '酒红色',
      sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
      stock_status: 'out_of_stock',
      stock_quantity: 0,
      is_featured: 0,
      is_new: 0,
      is_sale: 0,
      view_count: 456,
      images: ['/images/products/GO-001-1.jpg']
    },
    {
      id: uuidv4(),
      name: 'FlexRun 弹力训练鞋',
      name_en: 'FlexRun Training Shoes',
      name_ko: '플렉스런 트레이닝화',
      description: '碳纤维弹力板设计，能量回弹高达80%，专业训练首选。',
      description_en: 'Carbon fiber flex plate design with up to 80% energy return. Top choice for professional training.',
      description_ko: '최대 80% 에너지 반환을 제공하는 탄소 섬유 플렉스 플레이트 디자인. 전문 트레이닝의 최고 선택.',
      price: 1099,
      original_price: 1399,
      sku: 'FR-001',
      category_id: categories[0].id,
      brand: 'Sunnyshoes Sport',
      material: '飞织面料+碳纤维',
      color: '荧光绿',
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']),
      stock_status: 'in_stock',
      stock_quantity: 85,
      is_featured: 1,
      is_new: 1,
      is_sale: 1,
      view_count: 1123,
      images: ['/images/products/FR-001-1.jpg', '/images/products/FR-001-2.jpg', '/images/products/FR-001-3.jpg']
    },
    {
      id: uuidv4(),
      name: 'VintageCanvas 复古帆布鞋',
      name_en: 'VintageCanvas Retro Sneakers',
      name_ko: '빈티지캔버스 레트로 스니커즈',
      description: '做旧复古处理，经典高帮设计，街头潮流风格。',
      description_en: 'Vintage distressed finish, classic high-top design, street fashion style.',
      description_ko: '빈티지 디스트레스드 마감, 클래식 하이탑 디자인, 스트리트 패션 스타일.',
      price: 359,
      original_price: null,
      sku: 'VC-001',
      category_id: categories[5].id,
      brand: 'Sunnyshoes Street',
      material: '水洗帆布',
      color: '复古蓝',
      sizes: JSON.stringify(['35', '36', '37', '38', '39', '40', '41', '42', '43', '44']),
      stock_status: 'in_stock',
      stock_quantity: 320,
      is_featured: 0,
      is_new: 0,
      is_sale: 0,
      view_count: 834,
      images: ['/images/products/VC-001-1.jpg', '/images/products/VC-001-2.jpg']
    },
    {
      id: uuidv4(),
      name: 'MartinBoots 马丁靴',
      name_en: 'MartinBoots Classic Boots',
      name_ko: '마틴부츠 클래식 부츠',
      description: '经典八孔设计，防滑耐磨橡胶大底，秋冬百搭单品。',
      description_en: 'Classic 8-eye design with anti-slip and wear-resistant rubber sole. Versatile item for fall and winter.',
      description_ko: '미끄럼 방지 및 내마모성 고무 밑창의 클래식 8아이 디자인. 가을과 겨울의 다재다능한 아이템.',
      price: 699,
      original_price: null,
      sku: 'MB-001',
      category_id: categories[4].id,
      brand: 'Sunnyshoes',
      material: '头层牛皮',
      color: '经典黑',
      sizes: JSON.stringify(['35', '36', '37', '38', '39', '40', '41', '42', '43', '44']),
      stock_status: 'in_stock',
      stock_quantity: 150,
      is_featured: 1,
      is_new: 0,
      is_sale: 0,
      view_count: 1034,
      images: ['/images/products/MB-001-1.jpg', '/images/products/MB-001-2.jpg']
    },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, name_en, name_ko, description, description_en, description_ko, price, original_price, sku, category_id, brand, material, color, sizes, stock_status, stock_quantity, is_featured, is_new, is_sale, view_count, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImage = db.prepare(`
    INSERT INTO product_images (id, product_id, url, alt_text, is_primary, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertProductTag = db.prepare(`
    INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)
  `);

  products.forEach((product, index) => {
    insertProduct.run(
      product.id,
      product.name,
      product.name_en,
      product.name_ko,
      product.description,
      product.description_en,
      product.description_ko,
      product.price,
      product.original_price,
      product.sku,
      product.category_id,
      product.brand,
      product.material,
      product.color,
      product.sizes,
      product.stock_status,
      product.stock_quantity,
      product.is_featured,
      product.is_new,
      product.is_sale,
      product.view_count,
      index
    );

    // 添加图片
    product.images.forEach((url, imgIndex) => {
      insertImage.run(
        uuidv4(),
        product.id,
        url,
        product.name,
        imgIndex === 0 ? 1 : 0,
        imgIndex
      );
    });

    // 随机添加标签
    const randomTags = tags.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
    randomTags.forEach(tag => {
      insertProductTag.run(product.id, tag.id);
    });
  });

  // 添加一些模拟的浏览记录
  const insertViewLog = db.prepare(`
    INSERT INTO view_logs (id, product_id, session_id, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const now = new Date();
  products.forEach(product => {
    const viewCount = Math.floor(Math.random() * 50) + 10;
    for (let i = 0; i < viewCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const viewDate = new Date(now);
      viewDate.setDate(viewDate.getDate() - daysAgo);
      viewDate.setHours(Math.floor(Math.random() * 24));
      viewDate.setMinutes(Math.floor(Math.random() * 60));
      
      insertViewLog.run(
        uuidv4(),
        product.id,
        `session_${Math.random().toString(36).substring(7)}`,
        viewDate.toISOString()
      );
    }
  });

  console.log('数据初始化完成！');
  console.log(`- 创建了 ${categories.length} 个分类 (含英文/韩文)`);
  console.log(`- 创建了 ${tags.length} 个标签`);
  console.log(`- 创建了 ${products.length} 个产品 (含英文/韩文)`);
};

export const seed = () => {
  clearData();
  seedData();
};

// 如果直接运行此文件
if (require.main === module) {
  seed();
}
