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
          path: '/project',
          name: '项目管理',
          routes: [
            {
              path: '/project',
              redirect: '/project/list',
            },
            {
              path: '/project/list',
              name: '项目列表',
              component: '@/pages/Project/List',
            },
            {
              path: '/project/my',
              name: '我的项目',
              component: '@/pages/Project/My',
            },
            {
              path: '/project/approval',
              name: '项目审批',
              component: '@/pages/Project/Approval',
            },
            {
              path: '/project/statistics',
              name: '项目统计',
              component: '@/pages/Project/Statistics',
            },
            {
              path: '/project/template',
              name: '项目模板',
              component: '@/pages/Project/Template',
            },
            {
              path: '/project/profit-guide',
              name: '产品毛利配置',
              component: '@/pages/Project/ProfitGuide',
            },
          ],
        },
        {
          path: '/crm',
          name: 'CRM管理',
          routes: [
            {
              path: '/crm',
              redirect: '/crm/dashboard',
            },
            {
              path: '/crm/dashboard',
              name: 'CRM工作台',
              component: '@/pages/CRM/Dashboard',
            },
            {
              path: '/crm/customers',
              name: '客户管理',
              component: '@/pages/CRM/Customers',
            },
            {
              path: '/crm/opportunities',
              name: '商机管理',
              component: '@/pages/CRM/Opportunities',
            },
            {
              path: '/crm/opportunities/:id',
              name: '商机详情',
              component: '@/pages/CRM/Opportunities/Detail',
              hideInMenu: true,
            },
            {
              path: '/crm/follow-records',
              name: '跟进记录',
              component: '@/pages/CRM/FollowRecords',
            },
            {
              path: '/crm/transfers',
              name: '客户移交',
              component: '@/pages/CRM/Transfers',
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

  // 基础路径配置 - 通过网关访问 (测试环境和生产环境都使用)
  base: process.env.NODE_ENV === 'development' ? '/' : '/api-portal/',
  publicPath: process.env.NODE_ENV === 'development' ? '/' : '/api-portal/',

  // 代理配置 - 开发环境所有API请求代理到网关
  proxy: {
    '/api-project': {
      target: 'http://127.0.0.1:9900',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/api-portal': {
      target: 'http://127.0.0.1:9900',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/api-uaa': {
      target: 'http://127.0.0.1:9900',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/api-organization': {
      target: 'http://127.0.0.1:9900',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/api-crm': {
      target: 'http://127.0.0.1:9900',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
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

  // 样式配置
  cssLoader: {},
  lessLoader: {},
  
  // 主题配置
  theme: {
    'primary-color': '#1890ff',
    'border-radius-base': '6px',
    'box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)',
  },

  // 构建配置
  define: {
    API_BASE_URL: process.env.API_GATEWAY_URL || 'http://127.0.0.1:9900',
    API_GATEWAY_URL: process.env.API_GATEWAY_URL || 'http://127.0.0.1:9900',
  },

  // 修复：禁用可能导致问题的UMI功能
  mfsu: false,
  
  // 修复：使用legacy模式确保兼容性
  legacy: {},

}); 