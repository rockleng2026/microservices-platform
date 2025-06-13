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
              path: '/organization',
              redirect: '/organization/dashboard',
            },
            {
              path: '/organization/dashboard',
              name: '组织概览',
              component: '@/pages/Organization/Dashboard',
            },
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
            {
              path: '/organization/departments/positions',
              name: '部门岗位',
              component: '@/pages/Organization/DepartmentPositions',
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

  // 基础路径配置 - 通过网关访问 (仅在生产环境使用)
  base: process.env.NODE_ENV === 'production' ? '/api-portal/' : '/',
  publicPath: process.env.NODE_ENV === 'production' ? '/api-portal/' : '/',

  // 代理配置 - 开发环境所有API请求代理到网关
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:9900',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api-portal/api',
      },
    },
  },

  // 构建输出配置
  outputPath: 'dist',
  hash: true,

  // 标题配置
  title: 'Portal 3.0',

  // 忽略moment.js国际化包
  ignoreMomentLocale: true,

  // 快速刷新
  fastRefresh: true,



  // 构建配置
  define: {
    API_BASE_URL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:9900' : '',
  },

}); 