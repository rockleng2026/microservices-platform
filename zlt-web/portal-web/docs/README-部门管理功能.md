# Portal 3.0 部门管理功能

## 概述

部门管理功能是Portal 3.0组织架构管理模块的核心功能，提供了完整的部门组织结构管理能力。

## 功能特性

### 1. 部门树管理
- **层级展示**：支持多级部门树形结构显示
- **实时搜索**：支持部门名称实时搜索过滤
- **拖拽排序**：支持部门节点拖拽调整层级关系
- **展开控制**：支持一键展开/折叠所有节点
- **状态标识**：直观显示部门启用/禁用状态

### 2. 页面布局设计（遵循原型规范）
- **左右分栏布局**：左侧400px宽度部门树面板，右侧自适应详情面板
- **树节点交互**：悬停显示操作按钮（新增、编辑、删除）
- **视觉规范**：圆角8px卡片设计，统一阴影效果
- **响应式适配**：支持不同屏幕尺寸自适应

### 3. 部门详情展示
- **统计卡片**：展示在职员工、岗位数量、部门等级、状态信息
- **基本信息**：部门名称、编号、主管、联系方式等
- **组织关系**：上级部门、子部门数量、部门路径等
- **操作面板**：编辑、岗位管理、人员管理、状态切换

### 4. 表单操作
- **新增部门**：支持选择上级部门，自动计算层级
- **编辑部门**：内联编辑和弹窗编辑两种模式
- **复制结构**：支持复制部门及其子部门结构
- **批量操作**：支持批量导入导出功能

### 5. 权限控制
- **多租户支持**：基于租户ID进行数据隔离
- **角色权限**：不同角色对部门的操作权限控制
- **数据安全**：防止跨租户数据访问

## 技术架构

### 前端技术栈
- **框架**：React 18 + TypeScript
- **UI组件**：Ant Design 4.x
- **状态管理**：React Hooks（useState, useEffect）
- **数据处理**：树形数据转换和递归处理
- **样式方案**：CSS-in-JS + 内联样式

### 后端接口
- **基础URL**：`/api/organization/departments`
- **数据格式**：RESTful API，JSON数据交换
- **错误处理**：统一错误响应格式
- **分页支持**：支持分页查询和批量操作

### 关键接口
```typescript
// 获取部门树
GET /api/organization/departments/tree?includeDisabled=false

// 获取部门详情
GET /api/organization/departments/{id}

// 新增/编辑部门
POST /api/organization/departments/save

// 删除部门
DELETE /api/organization/departments/{id}

// 更新状态
PUT /api/organization/departments/{id}/status?status=1

// 复制结构
POST /api/organization/departments/{id}/copy?targetParentId=0
```

## 数据结构

### 部门节点接口
```typescript
interface DepartmentNode {
  id: string;
  name: string;
  parentId: string;
  depNo: string;
  directorId?: string;
  directorName?: string;
  employeeCount: number;
  positionCount: number;
  status: number;
  gradeid: number;
  gradeName: string;
  children?: DepartmentNode[];
}
```

### 部门详情接口
```typescript
interface Department {
  id: string;
  name: string;
  parentId: string;
  depNo: string;
  directorId?: string;
  gradeid: number;
  tel?: string;
  address?: string;
  description?: string;
  status: number;
  employeeCount: number;
  positionCount: number;
  gradeName: string;
  directorName?: string;
  parentName?: string;
  path?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 组件结构

```
src/pages/Organization/Departments/
├── index.tsx                 # 主组件（左右分栏布局）
├── components/
│   ├── DepartmentForm.tsx   # 部门表单组件
│   ├── DepartmentDetail.tsx # 部门详情组件
│   └── DepartmentStatistics.tsx # 部门统计组件
└── styles/
    └── department.css       # 样式文件（可选）
```

## 核心功能实现

### 1. 部门树渲染
```typescript
// 递归转换数据结构
const convertToTreeNodes = (departments: any[]): DepartmentNode[] => {
  return departments.map(dept => ({
    key: dept.id,
    title: renderTreeNodeTitle(dept),
    children: dept.children ? convertToTreeNodes(dept.children) : undefined,
    // ... 其他属性
  }));
};

// 自定义节点标题渲染
const renderTreeNodeTitle = (dept: any) => (
  <div className="tree-item-content">
    <div>
      <ApartmentOutlined />
      <span>{dept.name}</span>
      <Tag color={dept.status === 1 ? 'green' : 'red'}>
        {dept.status === 1 ? '正常' : '禁用'}
      </Tag>
    </div>
    <div className="tree-actions">
      {/* 悬停显示的操作按钮 */}
    </div>
  </div>
);
```

### 2. 交互样式优化
```css
/* 悬停时显示操作按钮 */
.tree-item-content:hover .tree-actions {
  display: flex !important;
}

/* 选中状态样式 */
.ant-tree-node-content-wrapper.ant-tree-node-selected {
  background-color: rgba(24, 144, 255, 0.1) !important;
}
```

### 3. 状态管理
```typescript
const [selectedDept, setSelectedDept] = useState<Department | null>(null);
const [showEditForm, setShowEditForm] = useState(false);

// 切换编辑模式
const handleEdit = () => {
  setShowEditForm(true);
};

// 树节点选择
const onSelectTreeNode = async (selectedKeys: React.Key[]) => {
  setShowEditForm(false); // 切换时隐藏编辑表单
  if (selectedKeys.length > 0) {
    await loadDepartmentDetail(selectedKeys[0] as string);
  }
};
```

## 网关配置

由于系统采用微服务架构，前端通过网关访问后端服务：

### 开发环境配置
```typescript
// .umirc.ts
proxy: {
  '/api': {
    target: 'http://127.0.0.1:9900',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api-portal/api',
    },
  },
}
```

### 访问地址
- **开发环境**：`http://127.0.0.1:8001/organization/departments`
- **生产环境**：`http://127.0.0.1:9900/api-portal/organization/departments`

## 使用说明

### 1. 部门树操作
1. 点击部门节点查看详情
2. 悬停节点显示快捷操作按钮
3. 使用搜索框过滤部门
4. 点击展开/折叠按钮控制树形结构

### 2. 部门管理
1. 点击"新增"按钮创建部门
2. 在详情面板点击"编辑"修改部门信息
3. 使用"岗位管理"设置部门岗位
4. 通过"人员管理"分配员工

### 3. 批量操作
1. 使用导入功能批量创建部门
2. 导出功能获取部门数据
3. 复制功能快速创建相似部门结构

## 性能优化

### 1. 虚拟滚动
```typescript
<Tree
  height={600}
  virtual
  treeData={treeData}
/>
```

### 2. 懒加载
- 按需加载子部门数据
- 异步获取部门详情
- 分页加载大量数据

### 3. 缓存策略
- 部门树数据本地缓存
- 避免重复API请求
- 智能刷新机制

## 注意事项

1. **数据一致性**：确保部门层级关系的正确性
2. **权限验证**：严格控制操作权限，防止越权访问
3. **性能考虑**：大型组织架构下的渲染性能优化
4. **用户体验**：提供清晰的操作反馈和加载状态
5. **原型遵循**：严格按照UI原型设计实现界面布局

## 后续计划

1. **高级搜索**：支持按部门属性、主管等条件搜索
2. **拖拽排序**：实现部门节点拖拽重排功能
3. **导入导出**：完善Excel批量操作功能
4. **权限管理**：集成细粒度权限控制
5. **移动适配**：优化移动端显示效果

## 访问方式

### 前端页面访问

**部门管理页面URL：**
```
http://localhost:8001/organization/departments
```

### 路由配置
在 `.umirc.ts` 中已配置路由：
```typescript
{
  path: '/organization/departments',
  name: '部门管理',
  component: '@/pages/Organization/Departments',
}
```

### 菜单导航
1. 登录系统后，点击左侧菜单中的 **"组织架构"**
2. 展开后点击 **"部门管理"** 即可进入部门管理页面

## 页面功能说明

### 左侧部门树
- 📂 **部门结构树**：展示完整的组织架构
- 🔍 **搜索框**：快速查找部门
- 🔄 **刷新按钮**：重新加载部门数据
- 📁 **展开/折叠**：控制树形结构显示

### 右侧操作面板
- ➕ **新增部门**：创建新的部门
- ✏️ **编辑部门**：修改部门信息
- 📋 **复制部门**：复制部门结构
- 🗑️ **删除部门**：删除选中部门
- 🔄 **状态切换**：启用/禁用部门

### 部门详情展示
- 📋 **基本信息**：部门名称、编号、描述等
- 👥 **组织关系**：上级部门、下级部门
- 📊 **统计信息**：员工数量、岗位数量
- 📞 **联系信息**：电话、地址等

## 后端API接口

### 基础CRUD接口
```
GET    /api/organization/departments/tree         # 获取部门树
GET    /api/organization/departments/{id}         # 获取部门详情
POST   /api/organization/departments/save         # 保存部门
DELETE /api/organization/departments/{id}         # 删除部门
PUT    /api/organization/departments/{id}/status  # 更新状态
```

### 高级功能接口
```
PUT    /api/organization/departments/{id}/move    # 移动部门
POST   /api/organization/departments/{id}/copy    # 复制部门
GET    /api/organization/departments/check-depno  # 检查编号
GET    /api/organization/departments/check-name   # 检查名称
```

## 数据库设计

基于 `organization-module.sql` 中的设计：

### 主要表结构
- **department**: 部门主表
- **department_grade**: 部门等级配置
- **employee**: 员工表（关联部门）
- **workposition**: 岗位表（关联部门）

### 关键字段
- `tenant_id`: 租户隔离
- `parent_id`: 上级部门ID
- `grade_id`: 部门等级
- `status`: 启用状态
- `delflag`: 删除标识

## 启动说明

### 前端启动
```bash
cd zlt-web/portal-web
npm install
npm start
```

访问地址：http://localhost:8001

### 后端启动
```bash
cd zlt-business/organization-service
mvn spring-boot:run
```

API地址：http://localhost:9900

## 租户支持

系统支持多租户架构：
- 前端自动在请求头中添加 `x-tenant-header`
- 后端通过租户拦截器实现数据隔离
- 默认租户ID为 `default`

## 兼容性说明

- **Java版本**：建议使用 Java 17+（当前Spring Boot 3.x要求）
- **Node.js版本**：建议使用 Node.js 16+
- **浏览器支持**：Chrome 88+, Firefox 78+, Safari 14+

## 开发状态

✅ **已完成功能**
- 部门树形结构展示
- 部门CRUD操作
- 状态管理
- 前后端API对接
- 租户隔离支持

🚧 **待优化功能**
- Excel导入导出
- 高级搜索
- 批量操作
- 操作日志

## 技术栈

### 前端
- **React 18** + **TypeScript**
- **Ant Design** UI组件库
- **Umi 4** 框架
- **Axios** HTTP客户端

### 后端
- **Spring Boot 3.x**
- **MyBatis Plus** ORM框架
- **MySQL 8.0** 数据库
- **Swagger 3** API文档

---

**开发团队**: Central Team  
**更新时间**: 2024-12-19  
**版本**: v1.0 