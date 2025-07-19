import { RouteRecordRaw } from 'vue-router';

const saleopsOptimizerRoutes: RouteRecordRaw[] = [
  {
    path: '/saleops-optimizer',
    name: 'SaleopsOptimizer',
    component: () => import('@/layouts/BasicLayout.vue'),
    meta: {
      title: '销售运营优化器',
      icon: 'BarChartOutlined',
      requiresAuth: true,
      permissions: ['soo:view']
    },
    children: [
      // 财务分析模块
      {
        path: 'financial-analysis',
        name: 'FinancialAnalysis',
        component: () => import('@/pages/SaleopsOptimizer/FinancialAnalysis/index.vue'),
        meta: {
          title: '财务分析',
          icon: 'CalculatorOutlined',
          requiresAuth: true,
          permissions: ['soo:financial-analysis:view']
        },
        children: [
          // 盈亏平衡分析
          {
            path: 'breakeven-analysis',
            name: 'BreakevenAnalysis',
            component: () => import('@/pages/SaleopsOptimizer/FinancialAnalysis/BreakevenAnalysis.vue'),
            meta: {
              title: '盈亏平衡分析',
              icon: 'LineChartOutlined',
              requiresAuth: true,
              permissions: ['soo:breakeven-analysis:view']
            }
          },
          // 财务模型管理
          {
            path: 'financial-models',
            name: 'FinancialModelManagement',
            component: () => import('@/pages/SaleopsOptimizer/FinancialAnalysis/FinancialModelManagement.vue'),
            meta: {
              title: '财务模型管理',
              icon: 'DatabaseOutlined',
              requiresAuth: true,
              permissions: ['soo:financial-model:view']
            }
          },
          // 模型实例管理
          {
            path: 'model-instances',
            name: 'ModelInstanceManagement',
            component: () => import('@/pages/SaleopsOptimizer/FinancialAnalysis/ModelInstanceManagement.vue'),
            meta: {
              title: '模型实例管理',
              icon: 'FileTextOutlined',
              requiresAuth: true,
              permissions: ['soo:model-instance:view']
            }
          },
          // 成本分析
          {
            path: 'cost-analysis',
            name: 'CostAnalysis',
            component: () => import('@/pages/SaleopsOptimizer/FinancialAnalysis/CostAnalysis.vue'),
            meta: {
              title: '成本分析',
              icon: 'DollarOutlined',
              requiresAuth: true,
              permissions: ['soo:cost-analysis:view']
            }
          },
          // 收益分析
          {
            path: 'revenue-analysis',
            name: 'RevenueAnalysis',
            component: () => import('@/pages/SaleopsOptimizer/FinancialAnalysis/RevenueAnalysis.vue'),
            meta: {
              title: '收益分析',
              icon: 'TrendingUpOutlined',
              requiresAuth: true,
              permissions: ['soo:revenue-analysis:view']
            }
          }
        ]
      },
      // 销售分析模块
      {
        path: 'sales-analysis',
        name: 'SalesAnalysis',
        component: () => import('@/pages/SaleopsOptimizer/SalesAnalysis/index.vue'),
        meta: {
          title: '销售分析',
          icon: 'ShoppingCartOutlined',
          requiresAuth: true,
          permissions: ['soo:sales-analysis:view']
        },
        children: [
          // 销售趋势分析
          {
            path: 'sales-trends',
            name: 'SalesTrends',
            component: () => import('@/pages/SaleopsOptimizer/SalesAnalysis/SalesTrends.vue'),
            meta: {
              title: '销售趋势分析',
              icon: 'TrendingUpOutlined',
              requiresAuth: true,
              permissions: ['soo:sales-trends:view']
            }
          },
          // 客户分析
          {
            path: 'customer-analysis',
            name: 'CustomerAnalysis',
            component: () => import('@/pages/SaleopsOptimizer/SalesAnalysis/CustomerAnalysis.vue'),
            meta: {
              title: '客户分析',
              icon: 'UserOutlined',
              requiresAuth: true,
              permissions: ['soo:customer-analysis:view']
            }
          },
          // 产品分析
          {
            path: 'product-analysis',
            name: 'ProductAnalysis',
            component: () => import('@/pages/SaleopsOptimizer/SalesAnalysis/ProductAnalysis.vue'),
            meta: {
              title: '产品分析',
              icon: 'AppstoreOutlined',
              requiresAuth: true,
              permissions: ['soo:product-analysis:view']
            }
          }
        ]
      },
      // 运营优化模块
      {
        path: 'operations-optimization',
        name: 'OperationsOptimization',
        component: () => import('@/pages/SaleopsOptimizer/OperationsOptimization/index.vue'),
        meta: {
          title: '运营优化',
          icon: 'SettingOutlined',
          requiresAuth: true,
          permissions: ['soo:operations:view']
        },
        children: [
          // 资源配置优化
          {
            path: 'resource-allocation',
            name: 'ResourceAllocation',
            component: () => import('@/pages/SaleopsOptimizer/OperationsOptimization/ResourceAllocation.vue'),
            meta: {
              title: '资源配置优化',
              icon: 'TeamOutlined',
              requiresAuth: true,
              permissions: ['soo:resource-allocation:view']
            }
          },
          // 流程优化
          {
            path: 'process-optimization',
            name: 'ProcessOptimization',
            component: () => import('@/pages/SaleopsOptimizer/OperationsOptimization/ProcessOptimization.vue'),
            meta: {
              title: '流程优化',
              icon: 'DeploymentUnitOutlined',
              requiresAuth: true,
              permissions: ['soo:process-optimization:view']
            }
          },
          // 绩效分析
          {
            path: 'performance-analysis',
            name: 'PerformanceAnalysis',
            component: () => import('@/pages/SaleopsOptimizer/OperationsOptimization/PerformanceAnalysis.vue'),
            meta: {
              title: '绩效分析',
              icon: 'TrophyOutlined',
              requiresAuth: true,
              permissions: ['soo:performance-analysis:view']
            }
          }
        ]
      },
      // 报告中心
      {
        path: 'reports',
        name: 'ReportsCenter',
        component: () => import('@/pages/SaleopsOptimizer/ReportsCenter/index.vue'),
        meta: {
          title: '报告中心',
          icon: 'FileTextOutlined',
          requiresAuth: true,
          permissions: ['soo:reports:view']
        },
        children: [
          // 财务报告
          {
            path: 'financial-reports',
            name: 'FinancialReports',
            component: () => import('@/pages/SaleopsOptimizer/ReportsCenter/FinancialReports.vue'),
            meta: {
              title: '财务报告',
              icon: 'AccountBookOutlined',
              requiresAuth: true,
              permissions: ['soo:financial-reports:view']
            }
          },
          // 销售报告
          {
            path: 'sales-reports',
            name: 'SalesReports',
            component: () => import('@/pages/SaleopsOptimizer/ReportsCenter/SalesReports.vue'),
            meta: {
              title: '销售报告',
              icon: 'ShoppingOutlined',
              requiresAuth: true,
              permissions: ['soo:sales-reports:view']
            }
          },
          // 运营报告
          {
            path: 'operations-reports',
            name: 'OperationsReports',
            component: () => import('@/pages/SaleopsOptimizer/ReportsCenter/OperationsReports.vue'),
            meta: {
              title: '运营报告',
              icon: 'BarChartOutlined',
              requiresAuth: true,
              permissions: ['soo:operations-reports:view']
            }
          }
        ]
      }
    ]
  }
];

export default saleopsOptimizerRoutes; 