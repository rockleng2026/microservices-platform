# Portal 3.0 前端工程

基于 React + TypeScript + Ant Design Pro + UmiJS 构建的现代化企业管理系统前端应用。

## 🚀 技术栈

- **框架**: React 18 + TypeScript
- **UI组件库**: Ant Design Pro 2.6.x + Ant Design 5.x
- **构建工具**: UmiJS 4.x
- **图表库**: Ant Design Charts 2.x
- **状态管理**: React Hooks + Context API
- **请求库**: UmiJS Request (基于 Axios)
- **代码规范**: ESLint + Prettier + TypeScript

## 📁 项目结构

```
portal-web/
├── public/                     # 静态资源
│   ├── favicon.ico            # 网站图标
│   └── logo.svg              # Logo文件
├── src/                       # 源代码
│   ├── components/           # 通用组件
│   ├── layouts/              # 布局组件
│   │   └── BasicLayout.tsx   # 基础布局
│   ├── pages/               # 页面组件
│   │   ├── Dashboard/       # 工作台
│   │   │   └── index.tsx
│   │   ├── Organization/    # 组织架构
│   │   │   ├── Departments/ # 部门管理
│   │   │   ├── Employees/   # 员工管理
│   │   │   └── Positions/   # 岗位管理
│   │   ├── CRM/            # 客户管理
│   │   └── System/         # 系统管理
│   ├── services/           # API服务层
│   │   ├── user.ts         # 用户服务
│   │   └── organization.ts # 组织架构服务
│   ├── utils/              # 工具函数
│   ├── models/             # 数据模型
│   ├── hooks/              # 自定义Hook
│   └── app.tsx             # 应用入口
├── .umirc.ts               # UmiJS配置
├── tsconfig.json           # TypeScript配置
├── .eslintrc.js           # ESLint配置
├── .prettierrc            # Prettier配置
├── typings.d.ts           # 类型声明
├── package.json           # 依赖配置
└── README.md             # 项目说明
```

## 🛠️ 开发环境

- **Node.js**: >= 18.0.0
- **包管理器**: npm >= 8.0.0 或 yarn >= 1.22.0
- **浏览器**: Chrome >= 80, Firefox >= 78, Safari >= 13

## 🚦 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd portal-web
```

### 2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 3. 启动开发服务器
```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

开发服务器将在 http://localhost:8066 启动

### 4. 构建生产版本
```bash
# 使用 npm
npm run build

# 或使用 yarn
yarn build
```

## ⚙️ 配置说明

### 环境变量
- `NODE_ENV`: 环境标识 (development/production/test)
- `API_BASE_URL`: API基础地址

### API代理配置
开发环境下，API请求会自动代理到后端服务：

```typescript
// .umirc.ts 代理配置
proxy: {
  '/api': {
    target: 'http://localhost:9900', // 后端API网关地址
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
  },
}
```

### 主题定制
在 `.umirc.ts` 中可以自定义主题：

```typescript
theme: {
  'primary-color': '#1890ff',
  'border-radius-base': '6px',
}
```

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint + Prettier 代码格式化规范
- 组件采用函数式组件 + Hooks
- 统一使用 ProComponents 组件库

### 文件命名规范
- **组件文件**: PascalCase (如: `EmployeeList.tsx`)
- **工具函数**: camelCase (如: `formatDate.ts`)
- **样式文件**: kebab-case (如: `employee-list.less`)
- **API服务**: camelCase (如: `userService.ts`)

### API调用规范
```typescript
// 统一使用 services 下的API服务
import { getEmployees } from '@/services/organization';

// 统一的错误处理和Loading状态
const { data, loading, error } = useRequest(getEmployees);
```

### 路由配置
路由在 `.umirc.ts` 中统一配置：

```typescript
routes: [
  {
    path: '/organization/employees',
    name: '员工管理',
    component: '@/pages/Organization/Employees',
  },
]
```

## 🎨 UI设计规范

### 色彩规范
- **主色**: #1890ff (蓝色)
- **成功色**: #52c41a (绿色)
- **警告色**: #faad14 (橙色)
- **错误色**: #f5222d (红色)

### 间距规范
- **小间距**: 8px
- **中间距**: 16px
- **大间距**: 24px
- **超大间距**: 32px

### 组件使用
优先使用 ProComponents 高级组件：
- `ProTable` - 表格组件
- `ProForm` - 表单组件
- `PageContainer` - 页面容器
- `ProLayout` - 布局组件

## 🧪 测试

### 代码检查
```bash
npm run lint          # ESLint 检查
npm run lint:fix      # 自动修复格式问题
npm run type-check    # TypeScript 类型检查
```

### 单元测试
```bash
npm run test          # 运行测试
npm run test:coverage # 测试覆盖率
```

### 构建分析
```bash
npm run analyze       # 构建包大小分析
```

## 📦 部署

### Docker部署
```bash
# 构建镜像
docker build -t portal-web .

# 运行容器
docker run -p 8066:80 portal-web
```

### Nginx部署
```nginx
server {
    listen 80;
    server_name portal.example.com;
    
    # 前端静态文件
    location / {
        root /var/www/portal-web;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://api-gateway:9900;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🌟 功能特性

### 🏢 组织架构管理
- **部门管理**: 树形结构展示，支持无限层级
- **员工管理**: 完整的员工生命周期管理
- **岗位管理**: 岗位权限配置，层级关系管理
- **数据统计**: 可视化图表展示组织数据

### 🔐 权限控制
- **菜单权限**: 基于角色动态生成导航
- **功能权限**: 按钮级别的权限控制
- **数据权限**: 基于部门/角色的数据访问控制

### 📱 响应式设计
- 支持桌面端、平板、手机端
- 自适应布局，优秀的移动端体验
- 支持暗黑模式切换

### 🚀 性能优化
- 路由懒加载
- 组件按需加载
- 图片懒加载
- 缓存策略优化

## 🔗 相关链接

- [Ant Design Pro](https://pro.ant.design/)
- [UmiJS](https://umijs.org/)
- [Ant Design](https://ant.design/)
- [TypeScript](https://www.typescriptlang.org/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

如有问题或建议，请：
- 提交 [Issue](https://github.com/yourorg/portal-web/issues)
- 联系开发团队
- 查看项目 [Wiki](https://github.com/yourorg/portal-web/wiki)

---

**Portal 3.0** - 现代化企业管理系统 ✨ 