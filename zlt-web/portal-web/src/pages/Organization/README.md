# 组织管理前端模块

## 概述

组织管理前端模块基于React + TypeScript + Ant Design开发，提供直观易用的企业组织架构管理界面。支持部门管理、员工管理、岗位管理等核心功能的可视化操作。

## 功能模块

### 1. 部门管理 (/Organization/Departments)
- **树形视图**：直观的部门树形结构展示
- **表格视图**：支持切换到表格模式进行批量操作
- **部门操作**：新增、编辑、删除、移动、复制部门
- **状态管理**：启用/禁用部门状态切换
- **统计信息**：部门员工数量、性别比例、学历分布等统计图表
- **搜索过滤**：支持部门名称、编号等关键词搜索
- **导入导出**：Excel批量导入导出功能

### 2. 员工管理 (/Organization/Employees)
- **员工列表**：分页展示员工信息，支持多维度筛选
- **员工档案**：完整的员工个人信息管理
- **状态管理**：在职、试用期、离职等状态变更
- **生命周期**：入职、转正、调动、离职等操作
- **统计面板**：员工总数、在职数、试用期数等统计
- **批量操作**：批量删除、导入、导出等
- **提醒功能**：生日提醒、试用期到期提醒

### 3. 岗位管理 (/Organization/Positions)
- **岗位配置**：岗位信息、职责、要求等配置
- **人员管理**：岗位人员配置和在岗人员查看
- **级别体系**：初级、中级、高级、专家等级别管理
- **薪资配置**：岗位薪资范围设置
- **岗位复制**：跨部门复制岗位配置
- **权限关联**：岗位权限配置（扩展功能）

## 技术架构

### 前端技术栈
- **React 18**：前端框架
- **TypeScript**：类型安全的JavaScript
- **Ant Design 5**：UI组件库
- **UMI 4**：企业级前端应用框架
- **Axios**：HTTP客户端
- **Less**：CSS预处理器

### 目录结构
```
src/pages/Organization/
├── Departments/                 # 部门管理
│   ├── index.tsx               # 主页面
│   ├── components/             # 组件
│   │   ├── DepartmentForm.tsx  # 部门表单
│   │   ├── DepartmentDetail.tsx # 部门详情
│   │   └── DepartmentStatistics.tsx # 统计组件
│   └── index.less              # 样式文件
├── Employees/                  # 员工管理
│   ├── index.tsx               # 主页面
│   ├── components/             # 组件
│   │   ├── EmployeeForm.tsx    # 员工表单
│   │   ├── EmployeeDetail.tsx  # 员工详情
│   │   └── EmployeeStatistics.tsx # 统计组件
│   └── index.less              # 样式文件
├── Positions/                  # 岗位管理
│   ├── index.tsx               # 主页面
│   ├── components/             # 组件
│   │   ├── PositionForm.tsx    # 岗位表单
│   │   └── PositionDetail.tsx  # 岗位详情
│   └── index.less              # 样式文件
└── README.md
```

### API服务
```
src/services/organization/
├── department.ts               # 部门API服务
├── employee.ts                 # 员工API服务
└── position.ts                 # 岗位API服务
```

## 核心组件

### 1. 部门管理组件
- **DepartmentTree**：部门树形组件，支持拖拽、右键菜单
- **DepartmentForm**：部门表单组件，支持新增/编辑模式
- **DepartmentDetail**：部门详情展示组件
- **DepartmentStatistics**：部门统计图表组件

### 2. 员工管理组件
- **EmployeeTable**：员工列表表格组件
- **EmployeeForm**：员工信息表单组件
- **EmployeeDetail**：员工详情展示组件
- **EmployeeStatistics**：员工统计面板组件

### 3. 岗位管理组件
- **PositionTable**：岗位列表表格组件
- **PositionForm**：岗位配置表单组件
- **PositionDetail**：岗位详情展示组件

## 路由配置

```typescript
// 在config/routes.ts中配置
{
  path: '/organization',
  name: '组织管理',
  icon: 'team',
  routes: [
    {
      path: '/organization/departments',
      name: '部门管理',
      component: './Organization/Departments',
    },
    {
      path: '/organization/employees',
      name: '员工管理',
      component: './Organization/Employees',
    },
    {
      path: '/organization/positions',
      name: '岗位管理',
      component: './Organization/Positions',
    },
  ],
}
```

## 权限控制

### 权限配置
```typescript
// 权限定义
const permissions = {
  // 部门权限
  'organization:department:view': '查看部门',
  'organization:department:add': '新增部门',
  'organization:department:edit': '编辑部门',
  'organization:department:delete': '删除部门',
  
  // 员工权限
  'organization:employee:view': '查看员工',
  'organization:employee:add': '新增员工',
  'organization:employee:edit': '编辑员工',
  'organization:employee:delete': '删除员工',
  
  // 岗位权限
  'organization:position:view': '查看岗位',
  'organization:position:add': '新增岗位',
  'organization:position:edit': '编辑岗位',
  'organization:position:delete': '删除岗位',
};
```

### 权限使用
```typescript
// 在组件中使用权限
import { Access, useAccess } from 'umi';

const access = useAccess();

// 条件渲染
{access.canAddDepartment && (
  <Button type="primary" onClick={handleAdd}>
    新增部门
  </Button>
)}

// 组件包装
<Access accessible={access.canEditDepartment}>
  <Button onClick={handleEdit}>编辑</Button>
</Access>
```

## 状态管理

### 使用UMI的model进行状态管理
```typescript
// models/organization.ts
export default {
  namespace: 'organization',
  state: {
    departments: [],
    employees: [],
    positions: [],
    selectedDepartment: null,
  },
  effects: {
    *fetchDepartments({ payload }, { call, put }) {
      const response = yield call(getDepartmentTree, payload);
      yield put({
        type: 'saveDepartments',
        payload: response.data,
      });
    },
  },
  reducers: {
    saveDepartments(state, action) {
      return {
        ...state,
        departments: action.payload,
      };
    },
  },
};
```

## 国际化

### 多语言支持
```typescript
// locales/zh-CN/organization.ts
export default {
  'organization.department.title': '部门管理',
  'organization.department.add': '新增部门',
  'organization.employee.title': '员工管理',
  'organization.position.title': '岗位管理',
};

// 在组件中使用
import { useIntl } from 'umi';

const intl = useIntl();
const title = intl.formatMessage({ id: 'organization.department.title' });
```

## 样式规范

### 使用Ant Design设计规范
```less
// 自定义主题变量
@primary-color: #1890ff;
@border-radius-base: 6px;
@font-size-base: 14px;

// 组件样式
.organization-container {
  .ant-card {
    border-radius: @border-radius-base;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .department-tree {
    .ant-tree-node-content-wrapper {
      padding: 4px 8px;
      border-radius: 4px;
      
      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
```

## 数据流

### API请求流程
1. 组件调用API服务函数
2. API服务发送HTTP请求到后端
3. 后端返回数据
4. 组件更新状态和UI

### 错误处理
```typescript
// 统一错误处理
const handleRequest = async (apiFunc: Function, ...args: any[]) => {
  try {
    const response = await apiFunc(...args);
    if (response.success) {
      return response.data;
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error) {
    message.error('网络请求失败');
    console.error('API Error:', error);
  }
};
```

## 性能优化

### 1. 组件优化
- 使用React.memo避免不必要的重渲染
- 使用useMemo和useCallback缓存计算结果
- 懒加载大型组件

### 2. 数据优化
- 虚拟滚动处理大量数据
- 分页加载减少单次数据量
- 防抖搜索减少API调用

### 3. 缓存策略
- 使用SWR或React Query进行数据缓存
- 本地存储常用配置数据

## 测试

### 单元测试
```typescript
// 使用Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import DepartmentForm from './DepartmentForm';

describe('DepartmentForm', () => {
  test('should render form fields', () => {
    render(<DepartmentForm />);
    expect(screen.getByLabelText('部门名称')).toBeInTheDocument();
  });
});
```

## 开发规范

### 1. 代码规范
- 使用ESLint + Prettier进行代码格式化
- 遵循TypeScript类型定义规范
- 组件和函数使用英文命名

### 2. 提交规范
- 使用conventional commits规范
- 提交信息格式：type(scope): description

### 3. 文档规范
- 重要组件添加注释说明
- API接口添加类型定义
- 复杂逻辑添加代码注释

## 部署

### 构建生产版本
```bash
# 安装依赖
npm install

# 构建
npm run build

# 本地预览
npm run preview
```

### 环境配置
```typescript
// config/config.ts
export default {
  // 开发环境
  development: {
    apiUrl: 'http://localhost:8080',
  },
  // 生产环境
  production: {
    apiUrl: 'https://api.example.com',
  },
};
```

## 常见问题

### 1. 权限问题
- 确保用户有相应的功能权限
- 检查路由权限配置是否正确

### 2. 数据加载问题
- 检查API接口地址是否正确
- 确认后端服务是否正常运行

### 3. 样式问题
- 检查Ant Design版本兼容性
- 确认自定义样式是否覆盖了组件默认样式

## 技术支持

如有问题或需要技术支持，请联系前端开发团队。 