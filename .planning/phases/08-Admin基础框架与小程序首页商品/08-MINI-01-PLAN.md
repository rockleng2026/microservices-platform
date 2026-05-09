---
phase: "08"
plan: "02"
type: execute
wave: 2
depends_on: []
files_modified:
  - mall-mini-program/package.json
  - mall-mini-program/manifest.json
  - mall-mini-program/pages.json
  - mall-mini-program/src/App.vue
  - mall-mini-program/src/uni.scss
  - mall-mini-program/src/pages.json
  - mall-mini-program/src/pages/home/index.vue
  - mall-mini-program/src/pages/home/components/BannerSwiper.vue
  - mall-mini-program/src/pages/home/components/CategoryGrid.vue
  - mall-mini-program/src/pages/home/components/ProductCard.vue
  - mall-mini-program/src/pages/home/components/SearchBar.vue
  - mall-mini-program/src/services/home.ts
  - mall-mini-program/src/services/goods.ts
  - mall-mini-program/src/config/api.ts
  - mall-mini-program/src/stores/cart.ts
  - mall-mini-program/src/tabbar.json
autonomous: true
requirements:
  - MINI-01-01
  - MINI-01-02
  - MINI-01-03
  - MINI-01-04
  - MINI-01-05
  - MINI-01-06
  - MINI-01-07
user_setup:
  - service: WeChat DevTools
    why: "Mini program preview and debugging"
    env_vars: []
    dashboard_config:
      - task: "Install WeChat DevTools"
        location: "https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
---

<objective>
实现小程序首页功能，包括 Banner 轮播、分类入口、搜索、推荐商品展示。

Purpose: 为商城小程序用户提供首页浏览体验，满足 MINI-01-01~07 共7个需求。
Output: 小程序首页正常展示 Banner 轮播(160px)、分类网格(4列)、搜索栏、推荐商品，支持下拉刷新和页面跳转。
</objective>

<context>
@.planning/phases/08-Admin基础框架与小程序首页商品/08-RESEARCH.md
@.planning/phases/08-Admin基础框架与小程序首页商品/08-UI-SPEC.md
@.planning/phases/08-Admin基础框架与小程序首页商品/08-CONTEXT.md

# Locked Decisions (MUST implement)
- D-04: Tab Bar 设置 4 个项目：首页 | 分类 | 购物车 | 我的
- D-05: 图标使用 uni-icons（内置，无需额外安装）
- D-08: 搜索通过点击搜索按钮触发（非实时搜索/联想）

# Claude's Discretion
- Tab Bar 激活状态使用 accent 色（#ff5500）
- 分类筛选默认展开在顶部，支持折叠
</context>

<interfaces>
<!-- Key types from mall-center backend (from RESEARCH.md) -->

BannerDTO (from /api/mall/admin/banner/list):
```typescript
interface BannerDTO {
  id: number;
  title: string;
  imageUrl: string;
  linkType: 1 | 2;  // 1=goods, 2=external
  goodsId: number;   // when linkType=1
  externalUrl: string;  // when linkType=2
  sort: number;
}
```

Category (from /api/mall/goods/categories):
```typescript
interface Category {
  id: number;
  name: string;
  icon: string;  // URL or icon name
  parentId: number;
  children?: Category[];
}
```

MallGoods (from /api/mall/goods/hot):
```typescript
interface MallGoods {
  id: number;
  name: string;
  mainImage: string;
  price: number;
  sales: number;
}
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: uni-app 项目初始化</name>
  <files>mall-mini-program/package.json, mall-mini-program/manifest.json, mall-mini-program/pages.json, mall-mini-program/src/App.vue, mall-mini-program/src/uni.scss</files>
  <action>
    创建 mall-mini-program uni-app Vue 3 项目：

    1. 在项目根目录创建 mall-mini-program/ 目录
    2. 初始化 uni-app Vue 3 项目：
       ```bash
       npx degit dcloudio/uni-preset-vue#Vue3 mall-mini-program
       cd mall-mini-program
       npm install
       ```

    3. package.json 修改：
       - name: "mall-mini-program"
       - 确保 vue: ^3.x

    4. manifest.json 配置：
       - appid: 使用微信小程序 appid（或 untitled 占位）
       - name: "商城小程序"
       - description: "IT硬件商城微信小程序"
       - setting: es6, minified 等

    5. pages.json 配置 Tab Bar（per D-04）：
       ```json
       {
         "tabBar": {
           "color": "#999999",
           "selectedColor": "#ff5500",
           "backgroundColor": "#ffffff",
           "borderStyle": "black",
           "list": [
             { "pagePath": "pages/home/index", "text": "首页", "iconPath": "static/tabbar/home.png", "selectedIconPath": "static/tabbar/home-active.png" },
             { "pagePath": "pages/category/index", "text": "分类", "iconPath": "static/tabbar/category.png", "selectedIconPath": "static/tabbar/category-active.png" },
             { "pagePath": "pages/cart/index", "text": "购物车", "iconPath": "static/tabbar/cart.png", "selectedIconPath": "static/tabbar/cart-active.png" },
             { "pagePath": "pages/user/index", "text": "我的", "iconPath": "static/tabbar/user.png", "selectedIconPath": "static/tabbar/user-active.png" }
           ]
         }
       }
       ```

    6. 使用 uni-icons 实现 Tab Bar 图标（per D-05）：
       - 图标路径：static/tabbar/（使用 uni-icons 内置或占位图片）
       - selectedColor: #ff5500（accent 色 per Claude's Discretion）

    7. src/uni.scss 配置全局样式变量：
       ```scss
       $primary-color: #1890ff;
       $accent-color: #ff5500;
       $bg-color: #f5f5f5;
       $text-primary: #333333;
       $text-secondary: #666666;
       $text-tertiary: #999999;
       ```

    8. src/App.vue 保留标准入口

    9. 创建 static/tabbar/ 目录并添加占位图标文件（可使用 1x1 透明 PNG 占位）
  </action>
  <verify>
    <automated>ls mall-mini-program/package.json && cat mall-mini-program/manifest.json | grep -o '"name": "商城小程序"'</automated>
  </verify>
  <done>uni-app 项目初始化完成，Tab Bar 配置正确（4项目：首页|分类|购物车|我的），selectedColor=#ff5500</done>
</task>

<task type="auto">
  <name>Task 2: 首页 API 服务层</name>
  <files>mall-mini-program/src/config/api.ts, mall-mini-program/src/services/home.ts, mall-mini-program/src/services/goods.ts, mall-mini-program/src/stores/cart.ts</files>
  <action>
    创建首页 API 服务层：

    1. src/config/api.ts：
       - API_BASE: '/mall-center'（网关代理路径）
       - 导出端点常量：
         - BANNER_LIST = '/api/mall/admin/banner/list'
         - CATEGORIES = '/api/mall/goods/categories'
         - HOT_GOODS = '/api/mall/goods/hot'
         - GOODS_LIST = '/api/mall/goods/list'

    2. src/services/home.ts：
       - getBannerList(): 调用 GET /api/mall/admin/banner/list，返回 BannerDTO[]
       - getCategories(): 调用 GET /api/mall/goods/categories，返回 Category[]
       - getHotGoods(limit = 10): 调用 GET /api/mall/goods/hot?limit=N，返回 MallGoods[]

    3. src/services/goods.ts：
       - getGoodsList(params): 调用 GET /api/mall/goods/list
         - params: { page, pageSize, categoryId?, keyword?, sortField?, sortOrder? }
         - 返回：{ datas: MallGoods[], pageNum, pageSize, total }
       - getGoodsDetail(id): 调用 GET /api/mall/goods/{id}

    4. src/stores/cart.ts（Zustand 或简单 reactive 状态）：
       - 购物车状态：cartItems[]
       - addToCart(skuId, quantity)
       - removeFromCart(skuId)
       - updateQuantity(skuId, quantity)
       - 计算 totalPrice, totalCount
       - 持久化到 uni.setStorageSync('cart', cartItems)

    5. uni-request 封装（参考）：
       ```typescript
       const request = (url: string, options?: any) => {
         return new Promise((resolve, reject) => {
           uni.request({
             url: `${API_BASE}${url}`,
             ...options,
             success: (res) => {
               if (res.statusCode === 200) {
                 resolve(res.data.datas || res.data.data || res.data);
               } else {
                 reject(res);
               }
             },
             fail: reject
           });
         });
       };
       ```
  </action>
  <verify>
    <automated>ls mall-mini-program/src/services/home.ts && grep -l "getBannerList" mall-mini-program/src/services/home.ts</automated>
  </verify>
  <done>API 服务层创建完成，Banner/Category/HotGoods/GoodsList API 已导出</done>
</task>

<task type="auto">
  <name>Task 3: 首页 Banner 轮播组件</name>
  <files>mall-mini-program/src/pages/home/components/BannerSwiper.vue</files>
  <action>
    创建首页 Banner 轮播组件（实现 MINI-01-01）：

    1. src/pages/home/components/BannerSwiper.vue：
       - 使用 uni-app <swiper> 组件
       - 属性：banners: BannerDTO[]
       - 高度：160px（per UI-SPEC）
       - indicator-dots: true（白色小圆点）
       - autoplay: true（自动播放）
       - circular: true（循环滚动）
       - interval: 3000（3秒）
       - @click: 触发 banner 点击事件

    2. 点击处理（实现 MINI-01-05）：
       - linkType === 1（goods）：navigateTo 商品详情 /pages/product-detail/index?id={goodsId}
       - linkType === 2（external）：navigateTo webview /pages/web-view/index?url={encodeURIComponent(externalUrl)}
       - 空链接或异常：showToast 提示

    3. 图片展示：
       - mode="aspectFill"（保证填充且不变形）
       - 占位图：/static/images/placeholder.png（灰色占位）
       - error 事件：回退到占位图

    4. 样式：
       ```scss
       .banner-swiper {
         height: 160px;
         width: 100%;
       }
       .banner-image {
         width: 100%;
         height: 100%;
       }
       ```
  </action>
  <verify>
    <automated>grep -l "160px" mall-mini-program/src/pages/home/components/BannerSwiper.vue && grep -l "linkType" mall-mini-program/src/pages/home/components/BannerSwiper.vue</automated>
  </verify>
  <done>Banner 轮播组件创建完成，160px高度，支持自动播放，点击跳转正确</done>
</task>

<task type="auto">
  <name>Task 4: 分类网格组件</name>
  <files>mall-mini-program/src/pages/home/components/CategoryGrid.vue</files>
  <action>
    创建分类网格组件（实现 MINI-01-02）：

    1. src/pages/home/components/CategoryGrid.vue：
       - 4列网格布局（per D-04 分类入口）
       - 使用 <view class="category-grid"> + <navigator>
       - 每个分类项：图标/图片 + 名称

    2. 属性：categories: Category[]
       - 最多显示8个分类（首页只展示一级分类）
       - 如果有 children，取前8个一级分类

    3. 分类项展示：
       - 图标：使用 category.icon 或 emoji 占位
       - 名称：category.name（最多4字，超长省略）
       - 点击跳转到商品列表并筛选该分类：
         /pages/product-list/index?categoryId={id}

    4. 样式：
       ```scss
       .category-grid {
         display: grid;
         grid-template-columns: repeat(4, 1fr);
         gap: 8px;
         padding: 16px;
         background: #fff;
       }
       .category-item {
         display: flex;
         flex-direction: column;
         align-items: center;
         .category-icon {
           width: 48px;
           height: 48px;
           border-radius: 8px;
           background: #f5f5f5;
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 24px;
         }
         .category-name {
           margin-top: 8px;
           font-size: 12px;
           color: #666;
         }
       }
       ```
  </action>
  <verify>
    <automated>grep -l "grid-template-columns: repeat(4, 1fr)" mall-mini-program/src/pages/home/components/CategoryGrid.vue</automated>
  </verify>
  <done>分类网格组件创建完成，4列布局，点击跳转商品列表</done>
</task>

<task type="auto">
  <name>Task 5: 搜索栏组件</name>
  <files>mall-mini-program/src/pages/home/components/SearchBar.vue</files>
  <action>
    创建搜索栏组件（实现 MINI-01-03 per D-08）：

    1. src/pages/home/components/SearchBar.vue：
       - 白色背景搜索栏，sticky 定位在顶部
       - 高度：32px（或 44px 触摸友好）
       - placeholder: "搜索商品..."（per specifics）

    2. 实现方式（per D-08 搜索通过点击按钮触发）：
       - 使用 <input> + <button> 组合
       - 点击搜索按钮触发搜索，而非实时监听
       - input v-model 绑定 keyword
       - @confirm: 输入法回车也触发搜索

    3. 点击搜索按钮：
       - 如果 keyword 有值：navigateTo /pages/product-list/index?keyword={keyword}
       - 如果 keyword 为空：showToast '请输入搜索关键词'

    4. 样式：
       ```scss
       .search-bar {
         position: sticky;
         top: 0;
         z-index: 99;
         background: #fff;
         padding: 8px 16px;
         .search-box {
           display: flex;
           align-items: center;
           background: #f5f5f5;
           border-radius: 16px;
           padding: 0 12px;
           height: 32px;
           input {
             flex: 1;
             border: none;
             background: transparent;
             outline: none;
             font-size: 14px;
           }
           button {
             border: none;
             background: transparent;
             color: #999;
             padding: 0;
             font-size: 14px;
           }
         }
       }
       ```
  </action>
  <verify>
    <automated>grep -l "搜索商品" mall-mini-program/src/pages/home/components/SearchBar.vue</automated>
  </verify>
  <done>搜索栏组件创建完成，点击按钮触发搜索（非实时）</done>
</task>

<task type="auto">
  <name>Task 6: 推荐商品卡片组件</name>
  <files>mall-mini-program/src/pages/home/components/ProductCard.vue</files>
  <action>
    创建推荐商品卡片组件（实现 MINI-01-04）：

    1. src/pages/home/components/ProductCard.vue：
       - 单个商品卡片组件
       - Props: product: MallGoods

    2. 商品卡片布局（per D-06 图片优先）：
       - 图片 1:1 比例（宽度50%，高度等于宽度）
       - 商品名称（最多2行，超长省略）
       - 价格：红色（#ff5500），加粗
       - 销量：灰色小字

    3. 点击卡片：
       - navigateTo /pages/product-detail/index?id={product.id}

    4. 样式：
       ```scss
       .product-card {
         background: #fff;
         border-radius: 8px;
         overflow: hidden;
         .product-image {
           width: 100%;
           aspect-ratio: 1;
           background: #f5f5f5;
         }
         .product-info {
           padding: 8px;
           .product-name {
             font-size: 14px;
             color: #333;
             line-height: 1.4;
             height: 2.8em;
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
    <automated>grep -l "product-price" mall-mini-program/src/pages/home/components/ProductCard.vue && grep -l "#ff5500" mall-mini-program/src/pages/home/components/ProductCard.vue</automated>
  </verify>
  <done>推荐商品卡片组件创建完成，图片优先，价格红色加粗</done>
</task>

<task type="auto">
  <name>Task 7: 首页页面组合</name>
  <files>mall-mini-program/src/pages/home/index.vue</files>
  <action>
    创建首页页面（实现 MINI-01-06, MINI-01-07）：

    1. src/pages/home/index.vue：
       - 引入并组合所有子组件：SearchBar, BannerSwiper, CategoryGrid, ProductCard

    2. 数据加载（onLoad 或 onShow）：
       - 调用 getBannerList() 获取 Banner 数据
       - 调用 getCategories() 获取分类数据
       - 调用 getHotGoods(10) 获取推荐商品数据

    3. 实现 MINI-01-06 下拉刷新：
       - 页面配置 enablePullDownRefresh: true
       - onPullDownRefresh: 重新加载所有数据，完成后 uni.stopPullDownRefresh()
       - 刷新时显示加载状态

    4. 实现 MINI-01-07 页面跳转：
       - Banner 点击：BannerSwiper 组件内部处理
       - 分类点击：CategoryGrid 组件内部处理
       - 商品点击：ProductCard 组件内部处理
       - Tab Bar 跳转：使用 uni.switchTab()

    5. 布局结构：
       ```
       <view class="home-page">
         <SearchBar />
         <BannerSwiper :banners="banners" />
         <CategoryGrid :categories="categories" />
         <view class="section-title">热门推荐</view>
         <view class="product-grid">
           <ProductCard v-for="p in hotGoods" :key="p.id" :product="p" />
         </view>
       </view>
       ```

    6. 热门推荐区域：
       - 2列网格布局
       - 每个 ProductCard 占 50% 宽度
       - 标题："热门推荐"（16px，居左，#333）

    7. 样式：
       ```scss
       .home-page {
         background: #f5f5f5;
         min-height: 100vh;
       }
       .section-title {
         padding: 16px;
         font-size: 16px;
         font-weight: 600;
         color: #333;
         background: #fff;
       }
       .product-grid {
         display: grid;
         grid-template-columns: repeat(2, 1fr);
         gap: 8px;
         padding: 8px;
       }
       ```
  </action>
  <verify>
    <automated>grep -l "onPullDownRefresh" mall-mini-program/src/pages/home/index.vue && grep -l "getHotGoods" mall-mini-program/src/pages/home/index.vue</automated>
  </verify>
  <done>首页页面创建完成，Banner/分类/搜索/推荐商品正常展示，支持下拉刷新</done>
</task>

</tasks>

<verification>
1. 小程序可通过 npm run dev:mp-weixin 编译
2. 微信开发者工具导入 mall-mini-program/dist/dev/mp-weixin 可预览
3. 首页正确显示 Banner 轮播（160px，自动播放）
4. 首页正确显示4列分类入口
5. 搜索栏点击搜索按钮跳转商品列表
6. 推荐商品2列网格显示，价格红色
7. Tab Bar 4项目正确显示，active 状态 #ff5500
8. 下拉刷新功能正常
9. Banner/分类/商品点击正确跳转
</verification>

<must_haves>
truths:
  - "小程序首页正确显示 Banner 轮播（160px高度，自动播放）"
  - "首页正确显示分类网格（4列布局）"
  - "搜索栏点击按钮触发搜索跳转（非实时搜索）"
  - "推荐商品2列网格显示，图片优先"
  - "Tab Bar 4个项目正确显示，激活状态 #ff5500"
  - "支持下拉刷新重新加载数据"
  - "Banner/分类/商品点击正确跳转"
artifacts:
  - path: "mall-mini-program/src/pages/home/index.vue"
    provides: "首页页面入口"
  - path: "mall-mini-program/src/pages/home/components/BannerSwiper.vue"
    provides: "Banner 轮播组件（per MINI-01-01）"
  - path: "mall-mini-program/src/pages/home/components/CategoryGrid.vue"
    provides: "分类网格组件（per MINI-01-02）"
  - path: "mall-mini-program/src/pages/home/components/SearchBar.vue"
    provides: "搜索栏组件（per MINI-01-03, D-08）"
  - path: "mall-mini-program/src/pages/home/components/ProductCard.vue"
    provides: "推荐商品卡片（per MINI-01-04, D-06）"
  - path: "mall-mini-program/src/services/home.ts"
    provides: "首页 API 服务"
  - path: "mall-mini-program/src/config/api.ts"
    provides: "API 端点配置"
key_links:
  - from: "mall-mini-program/src/pages/home/index.vue"
    to: "mall-mini-program/src/services/home.ts"
    via: "import { getBannerList, getCategories, getHotGoods }"
  - from: "mall-mini-program/src/pages/home/index.vue"
    to: "/pages/product-list/index"
    via: "uni.navigateTo (分类点击, 商品点击)"
  - from: "mall-mini-program/src/pages/home/components/BannerSwiper.vue"
    to: "/pages/product-detail/index"
    via: "uni.navigateTo (linkType=1 goods)"
</must_haves>

<output>
After completion, create `.planning/phases/08-Admin基础框架与小程序首页商品/08-MINI-01-SUMMARY.md`
</output>
