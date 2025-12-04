import { NextRequest, NextResponse } from 'next/server';
import db, { Product, ProductImage } from '@/lib/db';

interface ProductWithDetails extends Product {
  category_name?: string;
  category_name_en?: string;
  category_name_ko?: string;
  images?: ProductImage[];
}

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { message, locale = 'zh', history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'DeepSeek API key not configured' },
        { status: 500 }
      );
    }

    // Fetch all products with their details for context
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, c.name_en as category_name_en, c.name_ko as category_name_ko
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.view_count DESC
      LIMIT 100
    `).all() as ProductWithDetails[];

    // Get images for products
    const imageStmt = db.prepare(`
      SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC LIMIT 1
    `);

    products.forEach(product => {
      product.images = imageStmt.all(product.id) as ProductImage[];
    });

    // Create product catalog context
    const productCatalog = products.map(p => ({
      id: p.id,
      name: p.name,
      name_en: p.name_en,
      name_ko: p.name_ko,
      description: p.description,
      description_en: p.description_en,
      price: p.price,
      original_price: p.original_price,
      brand: p.brand,
      material: p.material,
      color: p.color,
      sizes: p.sizes ? JSON.parse(p.sizes) : [],
      category: p.category_name,
      category_en: p.category_name_en,
      is_new: p.is_new === 1,
      is_sale: p.is_sale === 1,
      is_featured: p.is_featured === 1,
      stock_status: p.stock_status,
      image: p.images?.[0]?.url || null
    }));

    // Build system prompt based on locale
    const systemPrompts: Record<string, string> = {
      zh: `你是 Sunnyshoes 鞋类商城的智能购物助手。你的任务是帮助顾客找到合适的鞋子产品。

以下是当前商品目录：
${JSON.stringify(productCatalog, null, 2)}

请根据用户的需求推荐合适的产品。在回复中：
1. 理解用户的需求（如运动、休闲、正式场合等）
2. 推荐1-3款最合适的产品
3. 简要说明推荐理由
4. 如果推荐产品，请在回复末尾添加一个JSON数组，格式为：
   [PRODUCTS]{"products": [{"id": "产品ID", "name": "产品名称"}]}[/PRODUCTS]

保持友好、专业的态度，用中文回复。`,
      
      en: `You are Sunnyshoes' intelligent shopping assistant. Your job is to help customers find the right shoes.

Here is the current product catalog:
${JSON.stringify(productCatalog, null, 2)}

Based on user needs, recommend suitable products. In your response:
1. Understand user needs (sports, casual, formal occasions, etc.)
2. Recommend 1-3 most suitable products
3. Briefly explain your recommendations
4. If recommending products, add a JSON array at the end:
   [PRODUCTS]{"products": [{"id": "productId", "name": "productName"}]}[/PRODUCTS]

Maintain a friendly and professional attitude, respond in English.`,
      
      ko: `당신은 Sunnyshoes의 스마트 쇼핑 어시스턴트입니다. 고객이 적합한 신발을 찾도록 도와주세요.

현재 상품 카탈로그:
${JSON.stringify(productCatalog, null, 2)}

사용자 요구에 따라 적합한 제품을 추천하세요. 응답할 때:
1. 사용자 요구 이해 (운동, 캐주얼, 정장 등)
2. 가장 적합한 제품 1-3개 추천
3. 추천 이유 간략히 설명
4. 제품 추천 시 마지막에 JSON 배열 추가:
   [PRODUCTS]{"products": [{"id": "제품ID", "name": "제품명"}]}[/PRODUCTS]

친절하고 전문적인 태도를 유지하고 한국어로 응답하세요.`
    };

    const systemPrompt = systemPrompts[locale] || systemPrompts.zh;

    // Build conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ];

    // Call DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || '';

    // Extract product recommendations if present
    let recommendedProducts: { id: string; name: string; image?: string; price?: number }[] = [];
    const productMatch = aiMessage.match(/\[PRODUCTS\]([\s\S]*?)\[\/PRODUCTS\]/);
    
    if (productMatch) {
      try {
        const productData = JSON.parse(productMatch[1]);
        if (productData.products && Array.isArray(productData.products)) {
          recommendedProducts = productData.products.map((p: { id: string; name: string }) => {
            const fullProduct = products.find(prod => prod.id === p.id);
            return {
              id: p.id,
              name: p.name,
              image: fullProduct?.images?.[0]?.url,
              price: fullProduct?.price
            };
          }).filter((p: { id: string }) => p.id);
        }
      } catch (e) {
        console.error('Failed to parse product recommendations:', e);
      }
    }

    // Clean the message by removing the product JSON
    const cleanMessage = aiMessage.replace(/\[PRODUCTS\][\s\S]*?\[\/PRODUCTS\]/, '').trim();

    return NextResponse.json({
      success: true,
      data: {
        message: cleanMessage,
        products: recommendedProducts
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

