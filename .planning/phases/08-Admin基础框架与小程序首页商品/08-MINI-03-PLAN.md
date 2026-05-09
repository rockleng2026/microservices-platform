---
phase: "08"
plan: "04"
type: execute
wave: 2
depends_on: []
files_modified:
  - mall-mini-program/src/pages/product-detail/index.vue
  - mall-mini-program/src/pages/product-detail/components/ImageCarousel.vue
  - mall-mini-program/src/pages/product-detail/components/SpecSelector.vue
  - mall-mini-program/src/pages/product-detail/components/QuantityStepper.vue
  - mall-mini-program/src/pages/product-detail/components/EvalSummary.vue
  - mall-mini-program/src/pages/product-detail/index.less
  - mall-mini-program/src/services/goods.ts
  - mall-mini-program/src/services/cart.ts
autonomous: true
requirements:
  - MINI-03-01
  - MINI-03-02
  - MINI-03-03
  - MINI-03-04
  - MINI-03-05
  - MINI-03-06
  - MINI-03-07
  - MINI-03-08
  - MINI-03-09
user_setup: []
---

<objective>
实现小程序商品详情页面，支持图片轮播、规格选择、数量选择、加入购物车、评价摘要。

Purpose: 为商城小程序用户提供商品详情浏览和购买体验，满足 MINI-03-01~09 共9个需求。
Output: 商品详情页正确显示图片轮播(300px)、规格选择、数量选择、评价摘要，支持加入购物车和立即购买。
</objective>

<context>
@.planning/phases/08-Admin基础框架与小程序首页商品/08-RESEARCH.md
@.planning/phases/08-Admin基础框架与小程序首页商品/08-UI-SPEC.md
@.planning/phases/08-Admin基础框架与小程序首页商品/08-CONTEXT.md
@mall-mini-program/src/services/goods.ts
@mall-mini-program/src/services/cart.ts

# Locked Decisions (MUST implement)
- D-07: 商品详情页采用紧凑型布局：图片300px高度 + 规格选择 + 数量增减 + 底部购买栏

# Claude's Discretion
- Tab Bar 激活状态使用 accent 色（#ff5500）
</context>

<interfaces>
<!-- From mall-center backend (from RESEARCH.md) -->

GoodsDetail (from /api/mall/goods/{id}):
```typescript
interface GoodsDetail {
  id: number;
  name: string;
  subTitle: string;
  mainImage: string;
  images: string[];  // 图片数组
  detail: string;   // HTML详情
  price: number;
  sales: number;
  status: number;   // 1=上架
  goodsType: number; // 1=实物 2=虚拟
  categoryId: number;
  categoryName: string;
  skus: MallGoodsSku[];
}

interface MallGoodsSku {
  id: number;
  goodsId: number;
  specs: string;  // "颜色:黑色;内存:256GB"
  price: number;
  stock: number;
  status: number;
}
```

EvaluateListDTO (from /api/mall/evaluate/goods/{goodsId}):
```typescript
interface EvaluateListDTO {
  id: number;
  orderId: number;
  star: number;
  content: string;
  images: string[];
  userNickname: string;
  createTime: string;
}
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: 商品详情页面框架</name>
  <files>mall-mini-program/src/pages/product-detail/index.vue, mall-mini-program/src/pages/product-detail/index.less</files>
  <action>
    创建商品详情页面框架：

    1. pages.json 注册页面：
       ```json
       {
         "pages/product-detail/index": {
           "style": {
             "navigationBarTitleText": "商品详情",
             "navigationBarBackgroundColor": "#ffffff"
           }
         }
       }
       ```

    2. src/pages/product-detail/index.vue：
       - 页面结构：
         - ImageCarousel（图片轮播 300px）
         - 商品基础信息区域
         - SpecSelector（规格选择）
         - QuantityStepper（数量选择）
         - EvalSummary（评价摘要）
         - 商品详情描述区域
         - BuyBar（底部购买栏，sticky）

    3. 页面布局（per D-07 紧凑型）：
       ```
       <scroll-view class="detail-scroll">
         <ImageCarousel :images="goodsDetail.images" />
         <GoodsInfo :goods="goodsDetail" />
         <SpecSelector v-if="goodsDetail.skus?.length" :skus="goodsDetail.skus" @select="onSpecSelect" />
         <QuantityStepper :stock="selectedSkuStock" v-model="quantity" />
         <EvalSummary :goodsId="goodsId" />
         <DetailContent :content="goodsDetail.detail" />
         <view style="height: 80px"></view>
       </scroll-view>
       <BuyBar :goods="goodsDetail" :selectedSku="selectedSku" :quantity="quantity" @add-cart="addToCart" @buy-now="buyNow" />
       ```

    4. 页面样式：
       ```scss
       .detail-scroll {
         height: calc(100vh - 50px);
       }
       .goods-info {
         padding: 16px;
         background: #fff;
         margin-bottom: 8px;
         .price {
           color: #ff5500;
           font-size: 24px;
           font-weight: bold;
         }
         .name {
           font-size: 16px;
           color: #333;
           margin-top: 8px;
         }
         .sales {
           color: #999;
           font-size: 12px;
           margin-top: 4px;
         }
       }
       .detail-content {
         padding: 16px;
         background: #fff;
         margin-top: 8px;
         .title {
           font-size: 14px;
           font-weight: 600;
           color: #333;
           margin-bottom: 12px;
         }
       }
       ```

    5. onLoad 获取商品ID：
       - onLoad(options) 获取 id 参数
       - 调用 getGoodsDetail(id) 加载商品详情
       - 调用 getGoodsEvaluates(goodsId) 加载评价摘要

    6. BuyBar 样式（sticky 底部）：
       ```scss
       .buy-bar {
         position: fixed;
         bottom: 50px;
         left: 0;
         right: 0;
         height: 50px;
         background: #fff;
         box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
         display: flex;
         align-items: center;
         padding: 0 16px;
         .btn-cart {
           width: 80px;
           height: 36px;
           border: 1px solid #ff5500;
           color: #ff5500;
           border-radius: 18px;
           background: #fff;
           margin-right: 8px;
         }
         .btn-buy {
           flex: 1;
           height: 36px;
           background: #ff5500;
           color: #fff;
           border-radius: 18px;
           border: none;
         }
       }
       ```
  </action>
  <verify>
    <automated>grep -l "product-detail" mall-mini-program/src/pages/product-detail/index.vue && grep -l "300px" mall-mini-program/src/pages/product-detail/index.vue</automated>
  </verify>
  <done>商品详情页面框架创建完成，紧凑型布局，300px图片高度，底部购买栏</done>
</task>

<task type="auto">
  <name>Task 2: 图片轮播组件</name>
  <files>mall-mini-program/src/pages/product-detail/components/ImageCarousel.vue</files>
  <action>
    创建图片轮播组件（实现 MINI-03-01 per D-07）：

    1. src/pages/product-detail/components/ImageCarousel.vue：
       - Props: images: string[]（图片URL数组）
       - 高度：300px（per D-07）
       - 使用 uni-app <swiper> 组件

    2. 轮播配置：
       - indicator-dots: true（白色小圆点）
       - autoplay: false（详情页不自动播放）
       - circular: true
       - previous-margin, next-margin: 0

    3. 图片展示：
       - 循环渲染 images 数组
       - mode="widthFix"（宽度固定，高度自适应）
       - 加载中显示占位图

    4. 样式：
       ```scss
       .image-carousel {
         height: 300px;
         swiper {
           height: 100%;
         }
         image {
           width: 100%;
           height: 300px;
         }
       }
       ```
  </action>
  <verify>
    <automated>grep -l "height: 300px" mall-mini-program/src/pages/product-detail/components/ImageCarousel.vue</automated>
  </verify>
  <done>图片轮播组件创建完成，300px高度，支持手动滑动</done>
</task>

<task type="auto">
  <name>Task 3: 规格选择组件</name>
  <files>mall-mini-program/src/pages/product-detail/components/SpecSelector.vue</files>
  <action>
    创建规格选择组件（实现 MINI-03-03）：

    1. src/pages/product-detail/components/SpecSelector.vue：
       - Props: skus: MallGoodsSku[]
       - Emits: select(sku)

    2. SKU 规格解析：
       - 解析每个 SKU 的 specs 字符串："颜色:黑色;内存:256GB"
       - 提取所有规格名称和选项
       - 构建规格选项列表：
         ```typescript
         interface SpecOption {
           name: string;  // "颜色"
           value: string; // "黑色"
         }
         interface SpecGroup {
           name: string;
           options: string[];
           selected: string;
         }
         ```

    3. UI 展示：
       - 遍历规格组，每个规格一组
       - 规格名称 + 选项按钮横向排列
       - 已选选项：accent 边框 #ff5500
       - 未选选项：灰色边框

    4. 规格选择逻辑：
       - 点击选项 -> 更新 selected
       - 根据已选规格匹配对应 SKU
       - 找到匹配 SKU -> 更新 selectedSku 和价格/库存
       - 如果组合不存在（某规格无货）-> 禁用该选项按钮

    5. 样式：
       ```scss
       .spec-selector {
         padding: 16px;
         background: #fff;
         margin-bottom: 8px;
         .spec-group {
           margin-bottom: 16px;
           &:last-child {
             margin-bottom: 0;
           }
           .spec-name {
             font-size: 14px;
             color: #333;
             margin-bottom: 8px;
           }
           .spec-options {
             display: flex;
             flex-wrap: wrap;
             gap: 8px;
             .spec-btn {
               padding: 6px 12px;
               border: 1px solid #ddd;
               border-radius: 4px;
               font-size: 13px;
               color: #333;
               background: #fff;
               &.selected {
                 border-color: #ff5500;
                 color: #ff5500;
               }
               &.disabled {
                 opacity: 0.4;
                 pointer-events: none;
               }
             }
           }
         }
       }
       ```

    6. 如果只有一个 SKU 或没有规格，不显示规格选择区域
  </action>
  <verify>
  </verify>
  <done>规格选择组件创建完成，支持多规格组合选择，正确匹配SKU</done>
</task>

<task type="auto">
  <name>Task 4: 数量选择组件</name>
  <files>mall-mini-program/src/pages/product-detail/components/QuantityStepper.vue</files>
  <action>
    创建数量选择组件（实现 MINI-03-04）：

    1. src/pages/product-detail/components/QuantityStepper.vue：
       - Props: stock: number（当前 SKU 库存）
       - v-model: 绑定数量值

    2. UI 展示：
       - label: "购买数量"
       - 数量选择器：[-] [数量] [+]

    3. 交互逻辑：
       - 点击 "-"：quantity > 1 时 quantity--
       - 点击 "+"：quantity < stock 时 quantity++
       - 库存为 0 时禁用 "+" 按钮

    4. 边界处理：
       - quantity 最小值：1
       - quantity 最大值：stock（当前 SKU 库存）
       - 如果 stock <= 0，显示 "无货" 提示

    5. 样式：
       ```scss
       .quantity-stepper {
         display: flex;
         align-items: center;
         justify-content: space-between;
         padding: 16px;
         background: #fff;
         .label {
           font-size: 14px;
           color: #333;
         }
         .stepper {
           display: flex;
           align-items: center;
           border: 1px solid #ddd;
           border-radius: 4px;
           .btn {
             width: 28px;
             height: 28px;
             display: flex;
             align-items: center;
             justify-content: center;
             background: #f5f5f5;
             font-size: 16px;
             color: #666;
             &.disabled {
               opacity: 0.3;
             }
           }
           .num {
             width: 40px;
             text-align: center;
             font-size: 14px;
             color: #333;
           }
         }
       }
       ```
  </action>
  <verify>
  </verify>
  <done>数量选择组件创建完成，范围1~stock，支持增减</done>
</task>

<task type="auto">
  <name>Task 5: 评价摘要组件</name>
  <files>mall-mini-program/src/pages/product-detail/components/EvalSummary.vue</files>
  <action>
    创建评价摘要组件（实现 MINI-03-06）：

    1. src/pages/product-detail/components/EvalSummary.vue：
       - Props: goodsId: number
       - Emits: none（只展示）

    2. 数据加载（onMounted）：
       - 调用 getGoodsEvaluates(goodsId, { page: 1, pageSize: 1 })
       - 只获取1条评价用于摘要展示
       - 计算平均评分和总评价数

    3. UI 展示：
       - 评价摘要条：显示评分（如 4.8）、评价数（如 123条评价）
       - 点击跳转评价列表页面（如 /pages/evaluate-list/index?goodsId=X）
       - 箭头指示器 ">"

    4. 如果有评价数据：
       - 显示第一条评价的用户昵称和内容摘要
       - 评价内容最多显示2行

    5. 样式：
       ```scss
       .eval-summary {
         padding: 16px;
         background: #fff;
         margin-bottom: 8px;
         display: flex;
         justify-content: space-between;
         align-items: center;
         .eval-info {
           display: flex;
           align-items: center;
           .score {
             color: #ff5500;
             font-size: 18px;
             font-weight: bold;
           }
           .count {
             color: #999;
             font-size: 14px;
             margin-left: 8px;
           }
         }
         .arrow {
           color: #999;
           font-size: 14px;
         }
       }
       ```
  </action>
  <verify>
  </verify>
  <done>评价摘要组件创建完成，显示评分和评价数</done>
</task>

<task type="auto">
  <name>Task 6: 购物车和购买服务</name>
  <files>mall-mini-program/src/services/cart.ts, mall-mini-program/src/services/goods.ts</files>
  <action>
    完善购物车和购买服务（实现 MINI-03-05, MINI-03-08）：

    1. src/services/goods.ts 添加评价API：
       - getGoodsEvaluates(goodsId, { page, pageSize }): 调用 GET /api/mall/evaluate/goods/{goodsId}
       - 返回 { datas: EvaluateListDTO[], total }

    2. src/services/cart.ts：
       - addToCart(skuId, quantity): POST /api/mall/cart，data: { skuId, quantity }
       - 返回空 body（成功）

    3. 购买服务（后续 Phase 实现支付，当前仅跳转）：
       - buyNow(skuId, quantity): 记录到本地存储，跳转结算页面
       - 由于支付 Phase 9+ 才实现，当前仅 showToast 提示 "支付功能开发中"

    4. 页面中的使用：
       ```typescript
       const addToCart = async () => {
         if (!selectedSku.value) {
           uni.showToast({ title: '请选择规格', icon: 'none' });
           return;
         }
         try {
           await cartApi.addToCart(selectedSku.value.id, quantity.value);
           uni.showToast({ title: '已加入购物车', icon: 'success' });
         } catch (e) {
           uni.showToast({ title: '加入失败，请重试', icon: 'none' });
         }
       };

       const buyNow = () => {
         if (!selectedSku.value) {
           uni.showToast({ title: '请选择规格', icon: 'none' });
           return;
         }
         uni.showToast({ title: '支付功能开发中', icon: 'none' });
         // 后续 Phase 跳转结算页
       };
       ```
  </action>
  <verify>
  </verify>
  <done>购物车和购买服务创建完成，加入购物车功能可用</done>
</task>

<task type="auto">
  <name>Task 7: 商品详情页面完善</name>
  <files>mall-mini-program/src/pages/product-detail/index.vue</files>
  <action>
    完善商品详情页面逻辑：

    1. 规格选择处理：
       - onSpecSelect(selectedSku): 更新 selectedSku
       - selectedSku 更新时重置 quantity 为 1

    2. 商品信息区域：
       - 价格：selectedSku?.price || goodsDetail.price
       - 库存：selectedSku?.stock || goodsDetail.stock

    3. 无规格时的默认 SKU：
       - 如果 skus 数组为空或只有一个，直接使用 goodsDetail
       - selectedSku 设置为 skus[0] 或 null

    4. 返回按钮（实现 MINI-03-09）：
       - 使用 uni.navigateBack() 或 <navigator open-type="navigateBack">
       - 页面左上角显示返回按钮（原生导航栏）

    5. 空状态处理：
       - 商品不存在或加载失败：showToast + navigateBack
       - 商品下架：显示 "商品已下架" 提示

    6. 生命周期：
       - onLoad: 加载商品详情
       - onShow: 可选刷新评价数
  </action>
  <verify>
  </verify>
  <done>商品详情页面逻辑完善，规格选择/数量选择/加入购物车/评价摘要全部实现</done>
</task>

</tasks>

<verification>
1. 商品详情页正确显示图片轮播（300px高度）
2. 商品基础信息显示：名称、价格、库存、销量
3. 规格选择组件正确解析 SKU 规格，支持多规格组合选择
4. 数量选择组件正确限制范围 1~stock
5. 加入购物车功能正常工作
6. 评价摘要正确显示评分和评价数
7. 商品详情（HTML）正确渲染
8. 底部购买栏 sticky 定位在页面底部
9. 返回按钮正常工作
</verification>

<must_haves>
truths:
  - "商品详情页正确显示图片轮播（300px高度，支持手动滑动）"
  - "商品价格、名称、库存、销量正确显示"
  - "规格选择支持多规格组合，正确匹配 SKU"
  - "数量选择范围 1~stock"
  - "加入购物车功能正常，成功提示 '已加入购物车'"
  - "评价摘要显示评分（如 4.8）和评价数"
  - "商品详情 HTML 内容正确渲染"
  - "底部购买栏 sticky 定位"
artifacts:
  - path: "mall-mini-program/src/pages/product-detail/index.vue"
    provides: "商品详情页面入口"
  - path: "mall-mini-program/src/pages/product-detail/components/ImageCarousel.vue"
    provides: "图片轮播组件（per D-07 300px）"
  - path: "mall-mini-program/src/pages/product-detail/components/SpecSelector.vue"
    provides: "规格选择组件（MINI-03-03）"
  - path: "mall-mini-program/src/pages/product-detail/components/QuantityStepper.vue"
    provides: "数量选择组件（MINI-03-04）"
  - path: "mall-mini-program/src/pages/product-detail/components/EvalSummary.vue"
    provides: "评价摘要组件（MINI-03-06）"
  - path: "mall-mini-program/src/services/cart.ts"
    provides: "购物车 API 服务（MINI-03-05）"
  - path: "mall-mini-program/src/services/goods.ts"
    provides: "商品详情 API（MINI-03-07）"
key_links:
  - from: "mall-mini-program/src/pages/product-list/components/ProductItem.vue"
    to: "mall-mini-program/src/pages/product-detail/index"
    via: "uni.navigateTo (商品点击)"
  - from: "mall-mini-program/src/pages/product-detail/index.vue"
    to: "mall-mini-program/src/services/cart.ts"
    via: "import { addToCart }"
  - from: "mall-mini-program/src/pages/product-detail/index.vue"
    to: "mall-mini-program/src/pages/cart/index"
    via: "uni.switchTab (Tab Bar 购物车)"
</must_haves>

<output>
After completion, create `.planning/phases/08-Admin基础框架与小程序首页商品/08-MINI-03-SUMMARY.md`
</output>
