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
        {
          path: '/saleops-optimizer',
          name: '盈策通决策',
          routes: [
            {
              path: '/saleops-optimizer',
              redirect: '/saleops-optimizer/config-center',
            },
            {
              path: '/saleops-optimizer/config-center',
              name: '配置中心',
              component: '@/pages/SaleopsOptimizer/ConfigCenter',
            },
            {
              path: '/saleops-optimizer/financial-analysis',
              name: '财务分析',
              routes: [
                {
                  path: '/saleops-optimizer/financial-analysis',
                  redirect: '/saleops-optimizer/financial-analysis/financial-models',
                },
                {
                  path: '/saleops-optimizer/financial-analysis/financial-models',
                  name: '财务模型管理',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/FinancialModelManagement',
                },
                {
                  path: '/saleops-optimizer/financial-analysis/variable-management/:modelId',
                  name: '变量配置管理',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/VariableManagement',
                  hideInMenu: true,
                },
                {
                  path: '/saleops-optimizer/financial-analysis/chart-management',
                  name: '模型图表管理',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/ChartManagement',
                },
                {
                  path: '/saleops-optimizer/financial-analysis/breakeven-analysis',
                  name: '盈亏平衡分析',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/BreakevenAnalysisPage',
                },
                {
                  path: '/saleops-optimizer/financial-analysis/api-test',
                  name: 'API测试',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/ApiTest',
                  hideInMenu: true,
                },
                // V2版本路由
                {
                  path: '/saleops-optimizer/financial-analysis/v2/financial-models',
                  name: '财务模型管理V2',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/v2/FinancialModelManagement',
                  hideInMenu: true,
                },
                {
                  path: '/saleops-optimizer/financial-analysis/v2/variable-management',
                  name: '变量管理V2',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/v2/VariableManagement',
                  hideInMenu: true,
                },
                {
                  path: '/saleops-optimizer/financial-analysis/v2/chart-management',
                  name: '图表管理V2',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/v2/ChartManagement',
                  hideInMenu: true,
                },
                {
                  path: '/saleops-optimizer/financial-analysis/v2/breakeven-analysis',
                  name: '盈亏平衡分析V2',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/v2/BreakevenAnalysisPage',
                  hideInMenu: true,
                },
                {
                  path: '/saleops-optimizer/financial-analysis/v2/api-test',
                  name: 'API测试V2',
                  component: '@/pages/SaleopsOptimizer/FinancialAnalysis/v2/ApiTestPage',
                  hideInMenu: true,
                },
              ],
            },
            {
              path: '/saleops-optimizer/monthly-performance',
              name: '月度绩效管理',
              component: '@/pages/SaleopsOptimizer/MonthlyPerformance',
            },
            {
              path: '/saleops-optimizer/salary-calculation',
              name: '薪酬计算',
              component: '@/pages/SaleopsOptimizer/SalaryCalculation/SalaryCalculation',
            },
            {
              path: '/saleops-optimizer/salary-query',
              name: '工资查询',
              component: '@/pages/SaleopsOptimizer/SalaryCalculation/SalaryQuery',
            },
            {
              path: '/saleops-optimizer/payslip-generation',
              name: '工资条生成',
              component: '@/pages/SaleopsOptimizer/SalaryCalculation/PayslipGeneration',
            },
            // 其他子页面可在此补充
          ],
        },
        {
          path: '/system',
          name: '系统管理',
          routes: [
            {
              path: '/system',
              name: '系统概览',
              component: '@/pages/System',
            },
            {
              path: '/system/dict',
              name: '字典配置',
              component: '@/pages/System/DictConfig',
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
    '/api-soo': {
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

  // webpack 配置优化
  chainWebpack(config) {
    // 确保正确处理 dayjs 和 moment
    // 不强制替换 moment，让 Ant Design 自行处理
  },

}); 