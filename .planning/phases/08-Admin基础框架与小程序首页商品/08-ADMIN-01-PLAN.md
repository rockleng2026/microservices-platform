---
phase: "08"
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/mall-admin-web/src/layouts/BasicLayout.tsx
  - zlt-web/mall-admin-web/src/layouts/BasicLayout.less
  - zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx
  - zlt-web/mall-admin-web/src/pages/Dashboard/components/MetricCards.tsx
  - zlt-web/mall-admin-web/src/pages/Dashboard/components/SalesTrendChart.tsx
  - zlt-web/mall-admin-web/src/pages/Dashboard/components/StockWarningList.tsx
  - zlt-web/mall-admin-web/src/pages/Dashboard/components/UserStats.tsx
  - zlt-web/mall-admin-web/src/pages/Dashboard/components/TopProducts.tsx
  - zlt-web/mall-admin-web/src/pages/Dashboard/index.less
  - zlt-web/mall-admin-web/src/services/admin/statistics.ts
  - zlt-web/mall-admin-web/src/config/api.ts
  - zlt-web/mall-admin-web/src/stores/useStore.ts
  - zlt-web/mall-admin-web/src/utils/request.ts
  - zlt-web/mall-admin-web/src/global.less
  - zlt-web/mall-admin-web/src/app.tsx
  - zlt-web/mall-admin-web/.umirc.ts
  - zlt-web/mall-admin-web/package.json
autonomous: true
requirements:
  - ADMIN-01-01
  - ADMIN-01-02
  - ADMIN-01-03
  - ADMIN-01-04
  - ADMIN-01-05
user_setup: []
---

<objective>
搭建 Admin Web 基础框架和 Dashboard 页面，实现工作台仪表盘功能。

Purpose: 为商城系统提供管理后台基础框架，包含布局、路由、Dashboard页面，满足 ADMIN-01-01~05 共5个需求。
Output: 可运行的 mall-admin-web 项目，Dashboard 展示4个指标卡片、销售趋势图、库存预警、用户统计、热销排行。
</objective>

<context>
@zlt-web/portal-web/src/layouts/BasicLayout.tsx
@zlt-web/portal-web/src/layouts/BasicLayout.less
@zlt-web/portal-web/src/pages/Dashboard/index.tsx
@zlt-web/portal-web/.umirc.ts
@zlt-web/portal-web/src/global.less
@zlt-web/portal-web/package.json

# Locked Decisions (MUST implement)
- D-01: Dashboard 顶部放 4 个指标卡片（订单数、销售额、访客数、转化率）
- D-02: 销售趋势使用 ECharts 折线图，支持日/周/月切换
- D-09: 管理后台使用 Zustand 管理全局状态
- D-10: 管理后台通过 API 网关调用 mall-center（路径 /mall-center/...）
</context>

<interfaces>
<!-- Key types from mall-center backend (from RESEARCH.md) -->

StatisticsDTO (from /statistics/today):
```typescript
interface StatisticsDTO {
  todayOrderCount: number;
  todaySalesAmount: number;
  waitDeliveryCount: number;
  todayNewUsers: number;
  yesterdayOrderCount: number;
  yesterdaySalesAmount: number;
  totalPv: number;
  avgOrderAmount: number;
}
```

SalesTrendDTO (from /statistics/sales-trend):
```typescript
interface SalesTrendDTO {
  date: string;
  orderCount: number;
  salesAmount: number;
  userCount: number;
}
```

StockWarningDTO (from /statistics/stock-warning):
```typescript
interface StockWarningDTO {
  skuId: number;
  skuName: string;
  goodsId: number;
  goodsName: string;
  realStock: number;
  warningStock: number;
  soldToday: number;
}
```

UserAnalysisDTO (from /statistics/user-analysis):
```typescript
interface UserAnalysisDTO {
  todayNewUsers: number;
  weekNewUsers: number;
  monthNewUsers: number;
  activeUsers: number;
  avgOrderAmount: number;
}
```

MallGoods (for top products):
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
  <name>Task 1: Admin Web 项目初始化</name>
  <files>zlt-web/mall-admin-web/package.json, zlt-web/mall-admin-web/.umirc.ts</files>
  <action>
    创建 mall-admin-web 项目结构（基于 portal-web 复制并适配）：

    1. 在 zlt-web/mall-admin-web/ 目录下创建项目结构
    2. 从 portal-web 复制以下文件并适配为 mall-admin 专用：
       - package.json（修改 name 为 "mall-admin-web"，保留所有依赖）
       - .umirc.ts（修改 title 为 "Mall Admin"，proxy 添加 /mall-center 代理到 127.0.0.1:7010）
       - src/app.tsx
       - src/global.less

    3. package.json 依赖必须包含：
       - react: ^18.2.0
       - umi: ^4.0.74
       - antd: ^4.24.8
       - @ant-design/pro-components: ^2.8.7
       - echarts: ^5.6.0
       - zustand: ^4.x
       - dayjs: ^1.11.7

    4. .umirc.ts 配置：
       - title: "Mall Admin"
       - proxy: /mall-center -> http://127.0.0.1:7010
       - theme: primary-color: #1890ff
       - define: API_BASE_URL = '/mall-center'

    5. 安装依赖：npm install（使用 --registry https://registry.npmmirror.com）
  </action>
  <verify>
    <automated>ls zlt-web/mall-admin-web/package.json && cat zlt-web/mall-admin-web/package.json | grep -o '"name": "mall-admin-web"'</automated>
  </verify>
  <done>mall-admin-web 项目创建完成，npm install 成功，.umirc.ts proxy 配置正确</done>
</task>

<task type="auto">
  <name>Task 2: BasicLayout 布局组件</name>
  <files>zlt-web/mall-admin-web/src/layouts/BasicLayout.tsx, zlt-web/mall-admin-web/src/layouts/BasicLayout.less</files>
  <action>
    创建 BasicLayout 布局组件（基于 portal-web 适配）：

    1. src/layouts/BasicLayout.tsx：
       - 复制自 portal-web/BasicLayout.tsx
       - 修改 logo 文字为 "Mall Admin"，图标为 "🛒"
       - 保留 DynamicMenu 和 UserMenu 组件引用
       - 面包屑根据 location.pathname 显示：/dashboard -> "工作台"
       - 使用 <Outlet /> 渲染子页面

    2. src/layouts/BasicLayout.less：
       - 复制自 portal-web/BasicLayout.less
       - 布局：grid-template-areas "sidebar header" "sidebar main" "sidebar footer"
       - sidebar 宽度：240px（grid-template-columns: 240px 1fr）
       - header 高度：60px
       - 主内容区 padding: 24px
       - 背景色：#f5f5f5

    3. 暂时使用简化版 DynamicMenu（硬编码菜单数组），后续 Phase 10+ 再对接动态菜单
       菜单项：[{path: '/dashboard', name: '工作台'}, {path: '/goods', name: '商品管理'}, {path: '/orders', name: '订单管理'}]

    4. 暂时使用简化版 UserMenu（显示固定用户名 "Admin"），后续 Phase 10+ 再对接用户中心
  </action>
  <verify>
    <automated>grep -l "Mall Admin" zlt-web/mall-admin-web/src/layouts/BasicLayout.tsx && grep -l "240px" zlt-web/mall-admin-web/src/layouts/BasicLayout.less</automated>
  </verify>
  <done>BasicLayout 组件创建完成，sidebar 240px + header 60px + content 24px padding 布局正确</done>
</task>

<task type="auto">
  <name>Task 3: API 配置和服务层</name>
  <files>zlt-web/mall-admin-web/src/config/api.ts, zlt-web/mall-admin-web/src/services/admin/statistics.ts, zlt-web/mall-admin-web/src/utils/request.ts</files>
  <action>
    创建 API 配置和服务层（参考 portal-web 模式）：

    1. src/config/api.ts：
       - API_BASE_URL: '/mall-center'（网关代理路径）
       - 导出所有 API 端点常量：
         - STAT_TODAY = '/api/mall/admin/statistics/today'
         - STAT_SALES_TREND = '/api/mall/admin/statistics/sales-trend'
         - STAT_STOCK_WARNING = '/api/mall/admin/statistics/stock-warning'
         - STAT_USER_ANALYSIS = '/api/mall/admin/statistics/user-analysis'

    2. src/utils/request.ts：
       - 复制自 portal-web/src/utils/request.ts
       - 基于 umi 的 request 封装
       - 响应拦截器处理 Result<T> 包装（返回 .datas 或 .data 字段）
       - 错误处理：显示 notification 提示

    3. src/services/admin/statistics.ts：
       - getTodayStatistics(): 调用 /statistics/today，返回 StatisticsDTO
       - getSalesTrend(type, startDate, endDate): 调用 /statistics/sales-trend，返回 SalesTrendDTO[]
       - getStockWarningList(): 调用 /statistics/stock-warning，返回 StockWarningDTO[]
       - getUserAnalysis(): 调用 /statistics/user-analysis，返回 UserAnalysisDTO

    4. 创建 src/stores/useStore.ts（Zustand store per D-09）：
       - 创建 useAdminStore
       - state: statistics (StatisticsDTO), salesTrend (SalesTrendDTO[]), stockWarnings, userAnalysis
       - actions: fetchStatistics, fetchSalesTrend, fetchStockWarnings, fetchUserAnalysis
  </action>
  <verify>
    <automated>ls zlt-web/mall-admin-web/src/services/admin/statistics.ts && grep -l "getTodayStatistics" zlt-web/mall-admin-web/src/services/admin/statistics.ts</automated>
  </verify>
  <done>API 配置和服务层创建完成，4个 STAT API 调用函数已导出</done>
</task>

<task type="auto">
  <name>Task 4: Dashboard 页面组件</name>
  <files>zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx, zlt-web/mall-admin-web/src/pages/Dashboard/index.less, zlt-web/mall-admin-web/src/pages/Dashboard/components/MetricCards.tsx, zlt-web/mall-admin-web/src/pages/Dashboard/components/SalesTrendChart.tsx, zlt-web/mall-admin-web/src/pages/Dashboard/components/StockWarningList.tsx, zlt-web/mall-admin-web/src/pages/Dashboard/components/UserStats.tsx, zlt-web/mall-admin-web/src/pages/Dashboard/components/TopProducts.tsx</files>
  <action>
    创建 Dashboard 页面及其子组件（实现 ADMIN-01-01~05）：

    1. src/pages/Dashboard/index.tsx：
       - 欢迎横幅：蓝色渐变背景（linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)）
       - 引入并组合所有子组件
       - 使用 useAdminStore 获取数据
       - 加载时显示 skeleton placeholder

    2. src/pages/Dashboard/components/MetricCards.tsx（ADMIN-01-01 per D-01）：
       - 4个指标卡片：订单数、销售额、访客数、转化率
       - 使用 antd Card + Statistic 组件
       - 订单数：todayOrderCount，格式化为千分位
       - 销售额：todaySalesAmount，格式化为 ¥xxx,xxx
       - 访客数：totalPv，格式化为千分位
       - 转化率：avgOrderAmount > 0 ? (todayOrderCount / totalPv * 100).toFixed(2) + '%' : '0%'
       - 对比昨日：显示 yesterdayOrderCount 和 yesterdaySalesAmount 的涨跌指示

    3. src/pages/Dashboard/components/SalesTrendChart.tsx（ADMIN-01-02 per D-02）：
       - 使用 echarts 折线图（不是 recharts）
       - 日/周/月切换按钮：DayButton, WeekButton, MonthButton
       - X轴：日期，Y轴：销售额/订单数
       - 两条线：销售额（left Y轴）、订单数（right Y轴）
       - 默认显示日维度数据
       - 颜色：销售额 #1890ff，订单数 #52c41a

    4. src/pages/Dashboard/components/StockWarningList.tsx（ADMIN-01-03）：
       - 库存预警列表，显示前10条
       - Table 列：商品名称、SKU规格、当前库存、预警阈值、今日销售
       - 库存低于预警阈值时该行标红（style: { background: '#fff2f0' }）
       - 空状态：显示 "暂无预警商品"

    5. src/pages/Dashboard/components/UserStats.tsx（ADMIN-01-04）：
       - 用户统计卡片组：今日新增、本周新增、本月新增、活跃用户
       - 使用 antd Row + Col 布局（xs=12, md=6）
       - 数字使用 Statistic 组件展示

    6. src/pages/Dashboard/components/TopProducts.tsx（ADMIN-01-05）：
       - 热销排行，显示前10名商品
       - 列表：排名、商品图片（40x40）、商品名称、销量
       - 排名1-3显示不同颜色徽章：#faad14（金）、#8c8c8c（银）、#d4a574（铜）
       - 点击商品跳转商品详情（/goods/detail/:id）

    7. src/pages/Dashboard/index.less：
       - Dashboard 页面样式
       - MetricCards 卡片间距：gutter [16, 16]
       - 图表卡片高度：400px
  </action>
  <verify>
    <automated>grep -l "todayOrderCount" zlt-web/mall-admin-web/src/pages/Dashboard/components/MetricCards.tsx && grep -l "SalesTrendChart" zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx</automated>
  </verify>
  <done>Dashboard 页面创建完成，5个需求全部实现：指标卡片(D-01)、销售趋势图(D-02)、库存预警、用户统计、热销排行</done>
</task>

<task type="auto">
  <name>Task 5: 路由配置和入口文件</name>
  <files>zlt-web/mall-admin-web/.umirc.ts, zlt-web/mall-admin-web/src/app.tsx, zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx</files>
  <action>
    配置路由和入口文件：

    1. .umirc.ts routes 配置：
       ```typescript
       routes: [
         {
           path: '/',
           component: '@/layouts/BasicLayout',
           routes: [
             { path: '/', redirect: '/dashboard' },
             { path: '/dashboard', name: '工作台', component: '@/pages/Dashboard' },
             { path: '/goods', name: '商品管理', routes: [...] },  // Phase 9+
             { path: '/orders', name: '订单管理', routes: [...] }, // Phase 9+
           ],
         },
       ]
       ```

    2. .umirc.ts proxy 配置（确保 D-10 通过网关调用 mall-center）：
       ```typescript
       proxy: {
         '/mall-center': {
           target: 'http://127.0.0.1:7010',
           changeOrigin: true,
         },
       }
       ```

    3. src/app.tsx：
       - 保留标准 Umi app 入口
       - 可添加全局布局嵌套

    4. 确保 src/pages/Dashboard/index.tsx 正确导出默认组件
  </action>
  <verify>
    <automated>grep -l "Dashboard" zlt-web/mall-admin-web/.umirc.ts && grep -l "/mall-center" zlt-web/mall-admin-web/.umirc.ts</automated>
  </verify>
  <done>路由配置完成，Dashboard 可通过 /dashboard 访问</done>
</task>

</tasks>

<verification>
1. Admin Web 可通过 npm run dev 启动（PORT=8002）
2. 访问 http://localhost:8002/dashboard 显示 Dashboard 页面
3. 4个指标卡片正确显示数据（订单数、销售额、访客数、转化率）
4. 销售趋势 ECharts 折线图正常渲染，支持日/周/月切换
5. 库存预警列表正确显示
6. 用户统计正确显示
7. 热销排行正确显示前10名
8. API 请求通过 /mall-center 代理到 mall-center (7010)
</verification>

<must_haves>
truths:
  - "Admin Web 可运行，Dashboard 页面可访问"
  - "4个指标卡片显示今日订单数、销售额、访客数、转化率"
  - "销售趋势 ECharts 折线图支持日/周/月切换"
  - "库存预警列表显示库存不足商品"
  - "用户统计显示新增用户和活跃用户"
  - "热销排行显示销量前10商品"
artifacts:
  - path: "zlt-web/mall-admin-web/src/layouts/BasicLayout.tsx"
    provides: "Admin 布局组件（sidebar 240px + header 60px）"
  - path: "zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx"
    provides: "Dashboard 页面入口"
  - path: "zlt-web/mall-admin-web/src/pages/Dashboard/components/MetricCards.tsx"
    provides: "4个指标卡片（per D-01）"
  - path: "zlt-web/mall-admin-web/src/pages/Dashboard/components/SalesTrendChart.tsx"
    provides: "销售趋势 ECharts 折线图（per D-02）"
  - path: "zlt-web/mall-admin-web/src/services/admin/statistics.ts"
    provides: "4个 STAT API 调用函数"
  - path: "zlt-web/mall-admin-web/src/stores/useStore.ts"
    provides: "Zustand 状态管理（per D-09）"
key_links:
  - from: "zlt-web/mall-admin-web/.umirc.ts"
    to: "mall-center (7010)"
    via: "proxy /mall-center -> http://127.0.0.1:7010 (per D-10)"
  - from: "zlt-web/mall-admin-web/src/pages/Dashboard"
    to: "zlt-web/mall-admin-web/src/services/admin/statistics.ts"
    via: "import { getTodayStatistics, ... } from '@/services/admin/statistics'"
  - from: "zlt-web/mall-admin-web/src/pages/Dashboard/components/SalesTrendChart.tsx"
    to: "echarts"
    via: "import * as echarts from 'echarts'"
</must_haves>

<output>
After completion, create `.planning/phases/08-Admin基础框架与小程序首页商品/08-ADMIN-01-SUMMARY.md`
</output>
