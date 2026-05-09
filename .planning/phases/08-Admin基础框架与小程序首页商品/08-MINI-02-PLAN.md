---
phase: "08"
plan: "03"
type: execute
wave: 2
depends_on: []
files_modified:
  - mall-mini-program/src/pages/product-list/index.vue
  - mall-mini-program/src/pages/product-list/components/ProductItem.vue
  - mall-mini-program/src/pages/product-list/components/FilterBar.vue
  - mall-mini-program/src/services/goods.ts
autonomous: true
requirements:
  - MINI-02-01
  - MINI-02-02
  - MINI-02-03
  - MINI-02-04
  - MINI-02-05
user_setup: []
---

<objective>
实现小程序商品列表页面，支持分类筛选、排序、分页、搜索功能。

Purpose: 为商城小程序用户提供商品浏览和筛选体验，满足 MINI-02-01~05 共5个需求。
Output: 商品列表2列网格布局，支持分类筛选（默认展开可折叠）、价格/销量/新品排序、分页加载、关键词搜索。
</objective>

<context>
@.planning/phases/08-Admin基础框架与小程序首页商品/08-RESEARCH.md
@.planning/phases/08-Admin基础框架与小程序首页商品/08-UI-SPEC.md
@.planning/phases/08-Admin基础框架与小程序首页商品/08-CONTEXT.md
@mall-mini-program/src/services/goods.ts

# Locked Decisions (MUST implement)
- D-06: 商品列表使用图片优先卡片，2列网格布局，图片顶部+信息底部
- D-08: 搜索通过点击搜索按钮触发（非实时搜索/联想）

# Claude's Discretion
- 分类筛选默认展开在顶部，支持折叠
</context>

<interfaces>
<!-- From previous MINI-01 plan -->

MallGoods (from /api/mall/goods/list):
```typescript
interface MallGoods {
  id: number;
  name: string;
  mainImage: string;
  price: number;
  sales: number;
}

interface GoodsListResult {
  datas: MallGoods[];
  pageNum: number;
  pageSize: number;
  total: number;
}
```

Category (from /api/mall/goods/categories):
```typescript
interface Category {
  id: number;
  name: string;
  icon: string;
  parentId: number;
  children?: Category[];
}
```

Sort options (from RESEARCH.md):
| Sort Field | Sort Order | Meaning |
|------------|------------|---------|
| price | asc | Price low to high |
| price | desc | Price high to low |
| sales | desc | Sales volume (default for hot) |
| createTime | desc | Newest first (default for list) |
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: 商品列表页面框架</name>
  <files>mall-mini-program/src/pages/product-list/index.vue, mall-mini-program/src/pages/product-list/index.less</files>
  <action>
    创建商品列表页面框架（实现 MINI-02-01, MINI-02-04）：

    1. pages.json 注册页面：
       ```json
       {
         "pages/product-list/index": {
           "style": {
             "navigationBarTitleText": "商品列表",
             "enablePullDownRefresh": false
           }
         }
       }
       ```

    2. src/pages/product-list/index.vue：
       - 页面结构：FilterBar + ProductItem 列表
       - 接收参数：onLoad(options) 获取 categoryId, keyword
       - 初始化加载商品列表（第一页，10条）

    3. 商品列表布局（per D-06 2列网格）：
       ```vue
       <view class="product-list">
         <view class="product-grid">
           <ProductItem v-for="item in products" :key="item.id" :product="item" />
         </view>
         <view class="loading" v-if="loading">加载中...</view>
         <view class="no-more" v-if="noMore">没有更多了</view>
         <view class="empty" v-if="!loading && products.length === 0">
           <text>暂无商品</text>
         </view>
       </view>
       ```

    4. 分页加载（实现 MINI-02-01）：
       - onReachBottom：触底加载更多
       - page++，调用 getGoodsList
       - loading 状态防止重复请求
       - noMore 状态：total <= page * pageSize

    5. 样式：
       ```scss
       .product-list {
         background: #f5f5f5;
         min-height: 100vh;
         padding-bottom: 16px;
       }
       .product-grid {
         display: grid;
         grid-template-columns: repeat(2, 1fr);
         gap: 8px;
         padding: 8px;
       }
       .loading, .no-more {
         text-align: center;
         padding: 16px;
         color: #999;
         font-size: 14px;
       }
       .empty {
         text-align: center;
         padding: 100px 0;
         color: #999;
       }
       ```

    6. ProductItem 点击跳转详情：
       - @click="goDetail(product.id)"
       - uni.navigateTo('/pages/product-detail/index?id=' + id)
  </action>
  <verify>
    <automated>grep -l "product-grid" mall-mini-program/src/pages/product-list/index.vue && grep -l "onReachBottom" mall-mini-program/src/pages/product-list/index.vue</automated>
  </verify>
  <done>商品列表页面框架创建完成，2列网格布局，分页加载，商品点击跳转详情</done>
</task>

<task type="auto">
  <name>Task 2: 商品项组件</name>
  <files>mall-mini-program/src/pages/product-list/components/ProductItem.vue</files>
  <action>
    创建商品项组件（实现 MINI-02-01 per D-06）：

    1. src/pages/product-list/components/ProductItem.vue：
       - Props: product: MallGoods

    2. 商品卡片布局（per D-06 图片优先）：
       - 图片 1:1 比例（宽度100%，高度等于宽度）
       - 商品名称（最多2行，超长省略）
       - 价格：红色（#ff5500），加粗，显示 ¥ 符号
       - 销量：灰色小字，显示 xxx件

    3. 点击事件：
       - @click="goDetail"
       - navigateTo 商品详情页

    4. 样式：
       ```scss
       .product-item {
         background: #fff;
         border-radius: 8px;
         overflow: hidden;
         .product-image {
           width: 100%;
           aspect-ratio: 1;
           background: #f5f5f5;
           image {
             width: 100%;
             height: 100%;
           }
         }
         .product-info {
           padding: 8px;
           .product-name {
             font-size: 14px;
             color: #333;
             line-height: 1.4;
             overflow: hidden;
             display: -webkit-box;
             -webkit-line-clamp: 2;
             -webkit-box-orient: vertical;
           }
           .product-bottom {
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-top: 8px;
             .product-price {
               color: #ff5500;
               font-size: 16px;
               font-weight: bold;
             }
             .product-sales {
               color: #999;
               font-size: 12px;
             }
           }
         }
       }
       ```
  </action>
  <verify>
    <automated>grep -l "aspect-ratio: 1" mall-mini-program/src/pages/product-list/components/ProductItem.vue && grep -l "#ff5500" mall-mini-program/src/pages/product-list/components/ProductItem.vue</automated>
  </verify>
  <done>商品项组件创建完成，图片优先卡片，价格红色</done>
</task>

<task type="auto">
  <name>Task 3: 筛选栏组件</name>
  <files>mall-mini-program/src/pages/product-list/components/FilterBar.vue</files>
  <action>
    创建筛选栏组件（实现 MINI-02-02, MINI-02-03, MINI-02-05）：

    1. src/pages/product-list/components/FilterBar.vue：
       - Props: categories[], selectedCategoryId, selectedSort, keyword
       - Emits: filter-change(categoryId), sort-change(sort), search(keyword)

    2. 分类筛选区域（per Claude's Discretion 默认展开可折叠）：
       - 使用 <view class="filter-section"> 包裹
       - 点击标题 "分类" 可折叠/展开
       - v-show 控制展开状态
       - 横向滚动分类标签（scroll-x）
       - 分类项：全部 + 各个 category
       - 选中状态：accent 背景色 #ff5500，白色文字

    3. 排序区域（实现 MINI-02-03）：
       - 横向排列4个排序按钮：
         - "综合"（默认，sortField: createTime, sortOrder: desc）
         - "价格最低"（sortField: price, sortOrder: asc）
         - "价格最高"（sortField: price, sortOrder: desc）
         - "销量优先"（sortField: sales, sortOrder: desc）
       - 选中状态：accent 颜色 #ff5500
       - 点击排序按钮触发 sort-change

    4. 搜索功能（实现 MINI-02-05 per D-08）：
       - 如果有 keyword props，显示搜索结果
       - 显示 "搜索: xxx" 标签
       - 可点击 X 清除搜索

    5. 样式：
       ```scss
       .filter-bar {
         position: sticky;
         top: 0;
         z-index: 99;
         background: #fff;
         .filter-section {
           .section-header {
             display: flex;
             justify-content: space-between;
             padding: 12px 16px;
             border-bottom: 1px solid #f0f0f0;
             text {
               font-size: 14px;
               color: #333;
             }
             .arrow {
               transition: transform 0.3s;
             }
             .arrow.down {
               transform: rotate(90deg);
             }
           }
           .section-content {
             padding: 12px 16px;
             &.collapsed {
               display: none;
             }
           }
         }
         .category-list {
           display: flex;
           flex-wrap: wrap;
           gap: 8px;
           .category-tag {
             padding: 6px 12px;
             border-radius: 16px;
             background: #f5f5f5;
             font-size: 13px;
             color: #333;
             &.active {
               background: #ff5500;
               color: #fff;
             }
           }
         }
         .sort-bar {
           display: flex;
           justify-content: space-around;
           padding: 12px 16px;
           border-top: 1px solid #f0f0f0;
           .sort-item {
             font-size: 14px;
             color: #666;
             padding: 4px 8px;
             &.active {
               color: #ff5500;
               font-weight: 600;
             }
           }
         }
       }
       ```

    6. 交互逻辑：
       - 点击分类标签 -> emit('filter-change', categoryId)
       - 点击排序 -> emit('sort-change', { sortField, sortOrder })
       - 分类/排序变化 -> 重置 page=1，重新加载商品列表
  </action>
  <verify>
    <automated>grep -l "价格最低" mall-mini-program/src/pages/product-list/components/FilterBar.vue && grep -l "categoryId" mall-mini-program/src/pages/product-list/components/FilterBar.vue</automated>
  </verify>
  <done>筛选栏组件创建完成，分类筛选默认展开可折叠，4种排序选项</done>
</task>

<task type="auto">
  <name>Task 4: 商品列表页面集成</name>
  <files>mall-mini-program/src/pages/product-list/index.vue</files>
  <action>
    完善商品列表页面数据逻辑：

    1. 页面初始化（onLoad）：
       - 获取 categoryId, keyword 参数
       - 如果有 categoryId，设置 selectedCategoryId
       - 如果有 keyword，设置搜索关键词

    2. 加载分类数据：
       - 调用 getCategories() 获取分类列表
       - 过滤出一级分类（parentId === 0）

    3. 加载商品列表：
       - 调用 getGoodsList({ page, pageSize: 10, categoryId, keyword, sortField, sortOrder })
       - 追加到 products 数组（不是覆盖）
       - 处理加载状态

    4. FilterBar 事件处理：
       - @filter-change: 更新 categoryId，重置 page=1，重新加载
       - @sort-change: 更新排序参数，重置 page=1，重新加载
       - 注意：排序变化也要重置 page=1

    5. 触底加载（onReachBottom）：
       - page++
       - 调用 getGoodsList
       - 追加到 products

    6. 下拉刷新（enablePullDownRefresh: true）：
       - onPullDownRefresh
       - 重置 page=1, products=[]
       - 重新加载所有数据
       - uni.stopPullDownRefresh()

    7. 空状态处理：
       - 如果 products.length === 0 且 !loading，显示空状态插画和文字
       - 文字："暂无相关商品，看看其他分类吧"（per UI-SPEC）
  </action>
  <verify>
    <automated>grep -l "getGoodsList" mall-mini-program/src/pages/product-list/index.vue && grep -l "onReachBottom" mall-mini-program/src/pages/product-list/index.vue</automated>
  </verify>
  <done>商品列表页面集成完成，分类筛选/排序/搜索/分页功能全部实现</done>
</task>

</tasks>

<verification>
1. 商品列表2列网格显示，图片优先卡片
2. 分类筛选显示一级分类，默认展开，可折叠
3. 4种排序选项正确：综合、价格升序、价格降序、销量
4. 分类/排序变化重新加载数据，重置分页
5. 触底自动加载更多
6. 支持下拉刷新
7. 商品点击跳转商品详情
8. 分类筛选跳转商品列表正确传参
9. 搜索跳转商品列表显示搜索结果
</verification>

<must_haves>
truths:
  - "商品列表2列网格布局，图片优先卡片"
  - "分类筛选默认展开在顶部，支持折叠"
  - "4种排序选项：综合/价格升/价格降/销量"
  - "分页加载，触底自动加载更多"
  - "支持下拉刷新"
  - "商品点击跳转商品详情"
artifacts:
  - path: "mall-mini-program/src/pages/product-list/index.vue"
    provides: "商品列表页面入口"
  - path: "mall-mini-program/src/pages/product-list/components/ProductItem.vue"
    provides: "商品项组件（per D-06 图片优先）"
  - path: "mall-mini-program/src/pages/product-list/components/FilterBar.vue"
    provides: "筛选栏组件（分类筛选+排序）"
  - path: "mall-mini-program/src/services/goods.ts"
    provides: "商品 API 服务"
key_links:
  - from: "mall-mini-program/src/pages/product-list/index.vue"
    to: "mall-mini-program/src/pages/product-detail/index"
    via: "uni.navigateTo (商品点击)"
  - from: "mall-mini-program/src/pages/product-list/index.vue"
    to: "mall-mini-program/src/services/goods.ts"
    via: "import { getGoodsList, getCategories }"
  - from: "mall-mini-program/src/pages/home/components/CategoryGrid.vue"
    to: "mall-mini-program/src/pages/product-list/index"
    via: "navigateTo?categoryId=X (分类点击)"
</must_haves>

<output>
After completion, create `.planning/phases/08-Admin基础框架与小程序首页商品/08-MINI-02-SUMMARY.md`
</output>
