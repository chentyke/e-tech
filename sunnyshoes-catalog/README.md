# Sunnyshoes 电子目录系统

> 基于 Next.js + ShadCN UI + SQLite 的现代化电子目录管理系统

![Sunnyshoes](https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200)

## 项目简介

这是一个为 Sunnyshoes Co. 设计的电子目录系统，采用先进的三层架构设计，具备高效的产品图片管理与展示功能。

### 技术架构

本系统遵循**三层架构（Three-Tiered Architecture）**设计：

```
┌─────────────────────────────────────────────────────┐
│                   客户端层                           │
│        (Next.js React 前端 + ShadCN UI)             │
├─────────────────────────────────────────────────────┤
│                  应用服务层                          │
│          (Next.js API Routes + 业务逻辑)            │
├─────────────────────────────────────────────────────┤
│                   数据源层                          │
│              (SQLite 数据库)                        │
└─────────────────────────────────────────────────────┘
```

### 核心特性

- 📦 **产品管理**：完整的产品CRUD功能，支持多图片、多尺码、多标签
- 📁 **分类管理**：层级分类结构，方便产品组织
- 🏷️ **标签系统**：灵活的产品标签，便于筛选
- 📊 **数据分析**：浏览统计、库存分析、热门产品等
- 🔍 **智能搜索**：支持按名称、品牌、分类搜索
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🌙 **深色模式**：支持明暗主题切换

## 快速开始

### 1. 安装依赖

```bash
cd sunnyshoes-catalog
npm install
```

### 2. 初始化数据库

首次运行时，系统会自动创建数据库。你也可以通过以下方式初始化示例数据：

```bash
# 方式一：通过脚本
npm run seed

# 方式二：启动后在管理后台点击"重置示例数据"
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看前台商城
访问 http://localhost:3000/admin 进入管理后台

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
sunnyshoes-catalog/
├── src/
│   ├── app/
│   │   ├── (store)/          # 前台商城页面
│   │   │   ├── page.tsx      # 首页
│   │   │   ├── products/     # 产品列表/详情
│   │   │   └── categories/   # 分类浏览
│   │   ├── admin/            # 后台管理页面
│   │   │   ├── page.tsx      # 仪表盘
│   │   │   ├── products/     # 产品管理
│   │   │   ├── categories/   # 分类管理
│   │   │   ├── tags/         # 标签管理
│   │   │   └── analytics/    # 数据分析
│   │   └── api/              # API 路由
│   │       ├── products/     # 产品 API
│   │       ├── categories/   # 分类 API
│   │       ├── tags/         # 标签 API
│   │       ├── analytics/    # 分析 API
│   │       └── seed/         # 数据初始化 API
│   ├── components/
│   │   ├── ui/               # ShadCN UI 组件
│   │   ├── layout/           # 布局组件
│   │   └── products/         # 产品相关组件
│   └── lib/
│       ├── db.ts             # 数据库配置
│       ├── seed.ts           # 种子数据
│       └── utils.ts          # 工具函数
├── data/
│   └── catalog.db            # SQLite 数据库文件
└── public/                   # 静态资源
```

## API 文档

### 产品 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/products | 获取产品列表（支持搜索、筛选、排序） |
| POST | /api/products | 创建新产品 |
| GET | /api/products/:id | 获取产品详情 |
| PUT | /api/products/:id | 更新产品 |
| DELETE | /api/products/:id | 删除产品 |

### 分类 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/categories | 获取所有分类 |
| POST | /api/categories | 创建新分类 |
| PUT | /api/categories/:id | 更新分类 |
| DELETE | /api/categories/:id | 删除分类 |

### 标签 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/tags | 获取所有标签 |
| POST | /api/tags | 创建新标签 |

### 分析 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/analytics | 获取分析数据 |

## 课程概念应用

本项目综合运用了以下课程知识：

### ICT基础设施与架构
- **三层架构**：客户端层、应用服务层、数据源层分离
- **云计算就绪**：设计支持弹性扩展
- **SOA设计**：模块化API服务

### CRM系统
- **用户行为追踪**：记录产品浏览行为
- **数据分析**：热门产品、浏览趋势分析

### SCM供应链管理
- **库存可视化**：实时显示库存状态
- **库存预警**：低库存、缺货提醒

### ERP与技术
- **Web Store架构**：完整的产品目录流程
- **关系数据库设计**：规范化的数据模型

## 技术栈

- **前端框架**：Next.js 15 (App Router)
- **UI组件**：ShadCN UI + Radix UI
- **样式**：Tailwind CSS
- **数据库**：SQLite (better-sqlite3)
- **语言**：TypeScript

## 部署说明

### 国内服务器部署

1. 将代码上传至服务器
2. 安装 Node.js (推荐 v18+)
3. 安装依赖并构建：
   ```bash
   npm install
   npm run build
   ```
4. 使用 PM2 启动：
   ```bash
   pm2 start npm --name "sunnyshoes" -- start
   ```

### 数据库位置

SQLite 数据库文件位于 `data/catalog.db`，请确保该目录有写入权限。

## 许可证

MIT License

---

*Sunnyshoes Co. - 阳光鞋业，为您带来舒适与时尚的完美结合*
