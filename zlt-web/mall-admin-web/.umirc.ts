import { defineConfig } from 'umi';

export default defineConfig({
  // 路由配置
  routes: [
    {
      path: '/',
      component: '@/layouts/BasicLayout',
      routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', name: '工作台', component: '@/pages/Dashboard' },
<<<<<<< HEAD
        { path: '/goods', name: '商品管理', component: '@/pages/Goods' },
        { path: '/goods/detail/:id', component: '@/pages/Goods/detail' },
        { path: '/categories', name: '分类管理', component: '@/pages/Categories' },
        { path: '/orders', name: '订单管理', component: '@/pages/Orders' },
        { path: '/banners', name: 'Banner 管理', component: '@/pages/Banners' },
=======
        { path: '/goods', name: '商品管理', component: '@/pages/Goods' },
        { path: '/goods/detail/:id', component: '@/pages/Goods/detail' },
        { path: '/categories', name: '分类管理', component: '@/pages/Categories' },
        { path: '/orders', name: '订单管理', component: '@/pages/Orders' },
        { path: '/banners', name: 'Banner 管理', component: '@/pages/Banners' },
>>>>>>> phase-10
      ],
    },
  ],

  // 基础路径配置
  base: '/',
  publicPath: '/',

  // 代理配置 - 通过网关调用 mall-center (D-10)
  proxy: {
    '/mall-center': {
      target: 'http://127.0.0.1:7010',
      changeOrigin: true,
      secure: false,
    },
'/api/mall/admin': {
      target: 'http://127.0.0.1:7010',
      changeOrigin: true,
      secure: false,
    },
  },

  // 构建输出配置
  outputPath: 'dist',
  hash: true,

  // 标题配置
  title: 'Mall Admin',

  // 忽略moment.js国际化包
  ignoreMomentLocale: true,

  // 快速刷新
  fastRefresh: true,

  // 主题配置 (D-09)
  theme: {
    'primary-color': '#1890ff',
    'border-radius-base': '6px',
    'box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)',
  },

  // 构建配置
  define: {
    API_BASE_URL: '/mall-center',
  },

  // 禁用可能导致问题的UMI功能
  mfsu: false,
  legacy: {},
});