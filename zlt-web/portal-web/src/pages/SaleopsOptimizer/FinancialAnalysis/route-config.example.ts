// 财务分析模块路由配置示例
// 使用方法：将以下配置添加到项目的路由配置文件中

import { 
  FinancialModelManagement, 
  VariableManagement, 
  ChartManagement, 
  BreakevenAnalysisPage 
} from '@/pages/SaleopsOptimizer/FinancialAnalysis';

// 注意：以下的 Layout 需要从您的项目布局组件中导入
// import Layout from '@/components/Layout';

// 如果使用 React Router v6
export const financialAnalysisRoutes = [
  {
    path: 'financial-models',
    component: FinancialModelManagement,
    meta: { title: '财务模型管理', requireAuth: true }
  },
  {
    path: 'variable-management/:modelId',
    component: VariableManagement,
    meta: { title: '变量配置管理', requireAuth: true }
  },
  {
    path: 'chart-management',
    component: ChartManagement,
    meta: { title: '模型图表管理', requireAuth: true }
  },
  {
    path: 'breakeven-analysis',
    component: BreakevenAnalysisPage,
    meta: { title: '盈亏平衡分析', requireAuth: true }
  }
];

// 如果使用传统的路由配置对象
export const financialAnalysisRoutesLegacy = {
  path: '/saleops-optimizer',
  component: 'Layout', // 替换为您项目中的Layout组件
  meta: { title: 'SalesOps优化器', icon: 'BarChartOutlined' },
  children: [
    {
      path: 'financial-models',
      name: 'FinancialModelManagement',
      component: FinancialModelManagement,
      meta: { 
        title: '财务模型管理', 
        icon: 'DatabaseOutlined',
        keepAlive: true,
        requireAuth: true
      }
    },
    {
      path: 'variable-management/:modelId',
      name: 'VariableManagement',
      component: VariableManagement,
      meta: { 
        title: '变量配置管理', 
        icon: 'SettingOutlined',
        hideInMenu: true,
        requireAuth: true
      }
    },
    {
      path: 'chart-management',
      name: 'ChartManagement',
      component: ChartManagement,
      meta: { 
        title: '模型图表管理', 
        icon: 'LineChartOutlined',
        keepAlive: true,
        requireAuth: true
      }
    },
    {
      path: 'breakeven-analysis',
      name: 'BreakevenAnalysisPage',
      component: BreakevenAnalysisPage,
      meta: { 
        title: '盈亏平衡分析', 
        icon: 'RiseOutlined',
        keepAlive: true,
        requireAuth: true
      }
    }
  ]
};

// 菜单配置
export const financialAnalysisMenu = [
  {
    key: 'saleops-optimizer',
    icon: 'BarChartOutlined',
    title: 'SalesOps优化器',
    children: [
      {
        key: 'financial-models',
        title: '财务模型管理',
        path: '/saleops-optimizer/financial-models'
      },
      {
        key: 'chart-management',
        title: '模型图表管理',
        path: '/saleops-optimizer/chart-management'
      },
      {
        key: 'breakeven-analysis',
        title: '盈亏平衡分析',
        path: '/saleops-optimizer/breakeven-analysis'
      }
    ]
  }
];

// 权限配置
export const financialAnalysisPermissions = {
  'saleops:financial-models:view': '查看财务模型',
  'saleops:financial-models:create': '创建财务模型',
  'saleops:financial-models:edit': '编辑财务模型',
  'saleops:financial-models:delete': '删除财务模型',
  'saleops:variables:view': '查看模型变量',
  'saleops:variables:edit': '编辑模型变量',
  'saleops:charts:view': '查看图表配置',
  'saleops:charts:edit': '编辑图表配置',
  'saleops:analysis:execute': '执行盈亏平衡分析',
  'saleops:analysis:export': '导出分析报告'
}; 