// V2版本财务分析模块路由配置
export const financialAnalysisV2Routes = [
  {
    path: '/saleops-optimizer/financial-analysis/v2/financial-models',
    name: '财务模型管理V2',
    component: './SaleopsOptimizer/FinancialAnalysis/v2/FinancialModelManagement',
    access: 'canSaleopsOptimizer',
  },
  {
    path: '/saleops-optimizer/financial-analysis/v2/variable-management',
    name: '变量管理V2',
    component: './SaleopsOptimizer/FinancialAnalysis/v2/VariableManagement',
    access: 'canSaleopsOptimizer',
  },
  {
    path: '/saleops-optimizer/financial-analysis/v2/model-instances',
    name: '模型实例管理V2',
    component: './SaleopsOptimizer/FinancialAnalysis/v2/ModelInstanceManagement',
    access: 'canSaleopsOptimizer',
  },
  {
    path: '/saleops-optimizer/financial-analysis/v2/model-instance-variables',
    name: '模型实例变量管理V2',
    component: './SaleopsOptimizer/FinancialAnalysis/v2/ModelInstanceVariableManagement',
    access: 'canSaleopsOptimizer',
  },
  {
    path: '/saleops-optimizer/financial-analysis/v2/chart-management',
    name: '图表管理V2',
    component: './SaleopsOptimizer/FinancialAnalysis/v2/ChartManagement',
    access: 'canSaleopsOptimizer',
  },
  {
    path: '/saleops-optimizer/financial-analysis/v2/breakeven-analysis',
    name: '盈亏平衡分析V2',
    component: './SaleopsOptimizer/FinancialAnalysis/v2/BreakevenAnalysisPage',
    access: 'canSaleopsOptimizer',
  },
  {
    path: '/saleops-optimizer/financial-analysis/v2/api-test',
    name: 'API测试V2',
    component: './SaleopsOptimizer/FinancialAnalysis/v2/ApiTestPage',
    access: 'canSaleopsOptimizer',
    hideInMenu: true,
  },
];

export default financialAnalysisV2Routes; 