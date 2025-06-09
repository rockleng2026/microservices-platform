import { defineConfig } from 'umi';

export default defineConfig({
  // 路由配置
  routes: [
    {
      path: '/',
      component: '@/layouts/BasicLayout',
      routes: [
        {
          path: '/',
          redirect: '/dashboard',
        },
        {
          path: '/dashboard',
          name: '工作台',
          component: '@/pages/Dashboard',
        },
        {
          path: '/organization',
          name: '组织架构',
          routes: [
            {
              path: '/organization/departments',
              name: '部门管理',
              component: '@/pages/Organization/Departments',
            },
            {
              path: '/organization/employees',
              name: '员工管理',
              component: '@/pages/Organization/Employees',
            },
            {
              path: '/organization/positions',
              name: '岗位管理',
              component: '@/pages/Organization/Positions',
            },
          ],
        },
        {
          path: '/crm',
          name: 'CRM管理',
          routes: [
            {
              path: '/crm/customers',
              name: '客户管理',
              component: '@/pages/CRM/Customers',
            },
          ],
        },
      ],
    },
    {
      path: '/login',
      component: '@/pages/Login',
      layout: false,
    },
  ],

  // 代理配置
  proxy: {
    '/api': {
      target: 'http://localhost:9900',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api',
      },
    },
  },

  // 开发服务器配置
  devServer: {
    port: 8066,
  },

  // 构建输出配置
  outputPath: 'dist',
  hash: true,

  // 标题配置
  title: 'Portal 3.0',

  // 忽略moment.js国际化包
  ignoreMomentLocale: true,

  // TypeScript 配置
  mfsu: {},
  
  // Antd 配置
  antd: {},

  // 快速刷新
  fastRefresh: true,

  // 构建配置
  define: {
    API_BASE_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:9900' : '',
  },
}); 