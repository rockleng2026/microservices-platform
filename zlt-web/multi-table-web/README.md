# 多维表格系统前端项目

基于 VTable 的现代化多维表格解决方案，提供高性能的数据展示、编辑和管理功能。

## 🚀 项目特性

- **高性能表格**: 基于 @visactor/vtable，支持大数据量展示和虚拟滚动
- **丰富字段类型**: 支持文本、数字、日期、选择器、关联等多种字段类型
- **实时编辑**: 提供直观的单元格编辑体验
- **响应式设计**: 适配桌面端、平板和移动设备
- **现代技术栈**: React 18 + TypeScript + Vite
- **组件化架构**: 高度可复用的组件设计

## 🛠️ 技术栈

### 核心技术
- **React 18** - 用户界面构建
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **SCSS** - CSS预处理器

### VTable生态
- **@visactor/vtable** - 核心表格组件
- **@visactor/vtable-editors** - 表格编辑器
- **@visactor/vtable-export** - 数据导出功能
- **@visactor/vtable-search** - 表格搜索功能
- **@visactor/react-vtable** - React集成

### 状态管理与数据
- **@tanstack/react-query** - 服务端状态管理
- **Zustand** - 客户端状态管理
- **Axios** - HTTP客户端

### 工具库
- **Lodash-es** - 实用工具函数
- **Day.js** - 日期时间处理
- **React Router DOM** - 路由管理

## 📦 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖
```bash
# 进入项目目录
cd zlt-web/multi-table-web

# 安装依赖
npm install
# 或
yarn install
```

### 开发运行
```bash
# 启动开发服务器
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000 查看项目

### 生产构建
```bash
# 构建项目
npm run build
# 或
yarn build

# 预览构建结果
npm run preview
# 或
yarn preview
```

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Layout/         # 布局组件
│   ├── VTable/         # VTable相关组件
│   │   ├── MultiTableEditor.tsx
│   │   └── MultiTableEditor.scss
│   └── UI/             # 基础UI组件
├── pages/              # 页面组件
│   ├── HomePage/       # 首页
│   ├── TableManagement/ # 表格管理
│   ├── FieldConfig/    # 字段配置
│   ├── FormEditor/     # 表单编辑器
│   └── FormViewer/     # 表单查看器
├── hooks/              # 自定义Hooks
├── services/           # API服务
├── store/              # 状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── styles/             # 全局样式
│   ├── index.scss      # 主样式文件
│   ├── variables.scss  # SCSS变量
│   └── mixins.scss     # SCSS混入
└── assets/             # 静态资源
```

## 🎯 核心功能

### 1. 多维表格编辑器 (MultiTableEditor)

基于 VTable 的核心表格组件，提供：

- **字段类型支持**: 文本、数字、日期、布尔值、选择器等
- **实时编辑**: 双击单元格进入编辑模式
- **数据验证**: 字段级别的数据验证
- **批量操作**: 支持多行选择和批量操作
- **响应式**: 适配不同屏幕尺寸

#### 使用示例

```tsx
import MultiTableEditor from '@/components/VTable/MultiTableEditor'

const MyPage = () => {
  const tableSchema = {
    id: 'table1',
    name: '项目任务表',
    fields: [
      { id: 'name', name: '任务名称', type: 'TEXT' },
      { id: 'assignee', name: '负责人', type: 'USER' },
      { id: 'dueDate', name: '截止日期', type: 'DATE' },
      { id: 'status', name: '状态', type: 'SINGLE_SELECT' }
    ]
  }

  const data = [
    {
      id: 'row1',
      data: {
        name: '设计原型图',
        assignee: 'user1',
        dueDate: '2024-01-15',
        status: 'progress'
      }
    }
  ]

  return (
    <MultiTableEditor
      tableSchema={tableSchema}
      data={data}
      onDataChange={(newData) => console.log(newData)}
    />
  )
}
```

### 2. 字段配置系统

支持动态配置表格字段：

- **字段类型**: 10+ 种字段类型支持
- **验证规则**: 必填、唯一性、格式验证
- **显示配置**: 列宽、排序、隐藏等
- **关联配置**: 跨表字段关联

### 3. 视图管理

提供多种数据展示视图：

- **表格视图**: 传统的行列展示
- **看板视图**: 卡片式项目管理
- **日历视图**: 基于日期字段的日历展示
- **表单视图**: 数据录入表单

## 🎨 样式系统

### SCSS 架构
- **变量系统**: 统一的颜色、间距、字体等设计token
- **混入库**: 可复用的样式混入
- **组件样式**: BEM命名规范
- **响应式**: 移动优先的响应式设计

### 主题支持
- **明亮主题**: 默认的明亮色调
- **暗色主题**: 可选的暗色模式
- **自定义主题**: 支持品牌色彩定制

## 🔧 开发指南

### 添加新字段类型

1. 在 `types/index.ts` 中添加字段类型枚举
2. 在 `MultiTableEditor.tsx` 中添加字段处理逻辑
3. 创建对应的编辑器组件
4. 注册编辑器到 VTable

### 创建自定义编辑器

```tsx
import { IEditor } from '@visactor/vtable-editors'

class CustomEditor implements IEditor {
  onStart(context) {
    // 编辑器启动逻辑
  }

  onEnd() {
    // 编辑器结束逻辑
  }

  getValue() {
    // 返回编辑后的值
  }
}

// 注册编辑器
ListTable.register.editor('custom-editor', new CustomEditor())
```

## 🧪 测试

```bash
# 运行测试
npm run test

# 运行测试并查看覆盖率
npm run coverage

# 运行测试UI
npm run test:ui
```

## 📝 代码规范

### ESLint 配置
项目使用 ESLint 进行代码检查：

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint --fix
```

### TypeScript
- 严格模式启用
- 类型检查: `npm run type-check`
- 路径别名支持

## 🔗 API 集成

### 后端接口
项目通过 Axios 与后端 API 集成：

```typescript
// 配置在 vite.config.ts 中
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

### 数据查询
使用 React Query 进行数据管理：

```tsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['tables'],
  queryFn: () => tableService.getTableList()
})
```

## 📈 性能优化

- **虚拟滚动**: VTable 内置虚拟滚动支持大数据量
- **代码分割**: 路由级别的代码分割
- **懒加载**: 组件和图片懒加载
- **缓存策略**: React Query 缓存配置

## 🚀 部署

### 构建优化
- **Tree Shaking**: 自动移除未使用代码
- **代码压缩**: Vite 自动压缩代码
- **资源优化**: 图片压缩和格式优化

### 部署配置
支持多种部署方式：
- **Nginx**: 静态文件服务
- **CDN**: 资源加速分发
- **Docker**: 容器化部署

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙋‍♂️ 支持

如有问题或建议，请：

1. 查看 [常见问题](docs/FAQ.md)
2. 提交 [Issue](https://github.com/your-repo/issues)
3. 联系开发团队

---

## 📚 相关链接

- [VTable 官方文档](https://www.visactor.io/vtable)
- [React 官方文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
- [Vite 文档](https://vitejs.dev)

---

**多维表格系统** - 让数据管理更简单、更高效 ✨ 