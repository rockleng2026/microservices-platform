# 财务分析模块 - 前端页面

## 模块概述

财务分析模块是 SalesOpsOptimizer 中的核心功能模块，提供了完整的盈亏平衡分析能力。包含4个主要页面：

1. **财务模型管理** - 创建和管理财务计算模型
2. **变量配置管理** - 配置模型变量和计算规则
3. **模型图表管理** - 管理图表配置和可视化
4. **盈亏平衡分析** - 实时分析和结果展示

## 页面组件

### 1. FinancialModelManagement.tsx
财务模型管理页面，支持模型的CRUD操作。

**主要功能：**
- 模型列表展示和分页
- 模型添加、编辑、删除
- 模型搜索和筛选
- 模型统计信息
- 变量管理入口

**使用示例：**
```tsx
import { FinancialModelManagement } from './FinancialAnalysis';

<FinancialModelManagement />
```

### 2. VariableManagement.tsx
变量配置管理页面，支持模型变量的详细配置。

**主要功能：**
- 输入变量、计算变量、常量管理
- 公式表达式编辑
- 验证规则配置
- 变量关系图谱

**变量类型：**
- `input`: 用户输入变量
- `calculated`: 计算变量（基于公式）
- `constant`: 常量

**使用示例：**
```tsx
import { VariableManagement } from './FinancialAnalysis';

<VariableManagement modelId={modelId} />
```

### 3. ChartManagement.tsx
模型图表管理页面，支持图表配置和数据模拟。

**主要功能：**
- 图表配置管理
- 图表类型选择（线图、柱图、散点图等）
- 数据系列配置
- 历史版本管理
- 数据模拟预览

**图表类型：**
- `line`: 线图
- `bar`: 柱状图
- `pie`: 饼图
- `scatter`: 散点图
- `area`: 面积图

**使用示例：**
```tsx
import { ChartManagement } from './FinancialAnalysis';

<ChartManagement />
```

### 4. BreakevenAnalysisPage.tsx
盈亏平衡分析页面，提供实时分析功能。

**主要功能：**
- 模型选择和参数输入
- 实时盈亏平衡分析
- 多周期分析（月度、季度、半年、年度）
- 可视化图表展示
- 分析报告生成

**分析指标：**
- 盈亏平衡点
- 边际贡献率
- 安全边际
- 最大利润
- 周期分析数据

**使用示例：**
```tsx
import { BreakevenAnalysisPage } from './FinancialAnalysis';

<BreakevenAnalysisPage />
```

## 技术栈

- **React 18** + **TypeScript**
- **Ant Design 4.x** - UI组件库
- **ECharts 5.x** - 图表可视化
- **Axios** - HTTP请求
- **Day.js** - 日期处理

## API接口

### 财务模型相关
```typescript
// 获取模型列表
GET /api/soo/financial-models

// 创建模型
POST /api/soo/financial-models

// 更新模型
PUT /api/soo/financial-models/{id}

// 删除模型
DELETE /api/soo/financial-models/{id}

// 克隆模型
POST /api/soo/financial-models/{id}/clone
```

### 变量管理相关
```typescript
// 获取模型变量
GET /api/soo/financial-models/{modelId}/variables

// 创建变量
POST /api/soo/model-variables

// 更新变量
PUT /api/soo/model-variables/{id}

// 删除变量
DELETE /api/soo/model-variables/{id}
```

### 图表管理相关
```typescript
// 获取图表配置列表
GET /api/soo/chart-analysis-models

// 创建图表配置
POST /api/soo/chart-analysis-models

// 更新图表配置
PUT /api/soo/chart-analysis-models/{id}

// 数据模拟
POST /api/soo/chart-analysis-models/{id}/simulate
```

### 分析计算相关
```typescript
// 执行盈亏平衡分析
POST /api/soo/financial-models/{id}/analyze

// 获取分析历史
GET /api/soo/calculation-instances

// 导出分析报告
GET /api/soo/calculation-instances/{id}/export
```

## 数据结构

### FinancialModel
```typescript
interface FinancialModel {
  id: number;
  modelName: string;
  modelCode: string;
  modelType: string;
  description?: string;
  status: 'active' | 'inactive';
  version: string;
  isTemplate: boolean;
  variables: ModelVariable[];
  createdTime: string;
  updatedTime: string;
}
```

### ModelVariable
```typescript
interface ModelVariable {
  id: number;
  variableName: string;
  variableCode: string;
  variableType: 'input' | 'calculated' | 'constant';
  dataType: 'number' | 'string' | 'boolean' | 'date';
  defaultValue?: string | number;
  unit?: string;
  description?: string;
  isRequired: boolean;
  validationRules?: string;
  calculationFormula?: string;
  displayOrder: number;
  isVisible: boolean;
}
```

### ChartConfig
```typescript
interface ChartConfig {
  id: number;
  modelId: number;
  chartName: string;
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  chartConfig: string; // JSON格式的ECharts配置
  version: string;
  isActive: boolean;
  series: ChartSeries[];
}
```

## 路由配置

在项目路由中添加以下配置：

```typescript
// routes/index.ts
import { 
  FinancialModelManagement, 
  VariableManagement, 
  ChartManagement, 
  BreakevenAnalysisPage 
} from '@/pages/SaleopsOptimizer/FinancialAnalysis';

{
  path: '/saleops-optimizer',
  component: Layout,
  children: [
    {
      path: 'financial-models',
      component: FinancialModelManagement,
      meta: { title: '财务模型管理' }
    },
    {
      path: 'variable-management/:modelId',
      component: VariableManagement,
      meta: { title: '变量配置管理' }
    },
    {
      path: 'chart-management',
      component: ChartManagement,
      meta: { title: '图表管理' }
    },
    {
      path: 'breakeven-analysis',
      component: BreakevenAnalysisPage,
      meta: { title: '盈亏平衡分析' }
    }
  ]
}
```

## 样式说明

所有页面都使用了Ant Design的默认样式，同时支持自定义主题。主要的样式类：

- `.financial-model-management` - 财务模型管理页面容器
- `.variable-management` - 变量管理页面容器
- `.chart-management` - 图表管理页面容器
- `.breakeven-analysis-page` - 盈亏平衡分析页面容器

## 部署说明

1. 确保后端API服务正常运行
2. 配置正确的API基础URL
3. 安装所需依赖：
   ```bash
   npm install echarts
   npm install dayjs
   ```

## 注意事项

1. **数据权限**：所有页面都需要登录用户权限
2. **模型状态**：只有激活状态的模型才能用于分析
3. **公式验证**：变量公式需要通过后端验证才能保存
4. **图表性能**：大数据量时建议使用数据采样
5. **浏览器兼容**：建议使用Chrome、Firefox、Safari等现代浏览器

## 更新日志

### v2.0.0 (2024-01-15)
- 新增图表管理功能
- 优化分析计算引擎
- 支持多周期分析
- 增强用户体验

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础财务模型管理
- 简单盈亏平衡分析 