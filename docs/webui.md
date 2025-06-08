# Portal 3.0 Web UI 原型设计指南

## 📋 设计原则

### 1. 业务对标与竞品分析
- **参考优秀同类产品**：钉钉、企业微信、飞书、泛微OA、用友、金蝶等企业级管理系统
- **核心定位**：Portal 3.0为OA+CRM+进销存一体化企业管理平台
- **用户角色**：管理层、部门主管、普通员工、客服人员、销售人员等
- **使用场景**：办公自动化、客户管理、商品管理、订单处理、工单流转等

### 2. 技术架构对应
- **前端技术栈**：基于React + TypeScript + Ant Design Pro
- **响应式设计**：兼容桌面端(2560×1440,1920x1080)、平板端(768px)、手机端(375px)
- **浏览器兼容**：Chrome、Firefox、Safari、Edge主流浏览器
- **交互模式**：现代化SPA单页应用，左侧导航+右侧内容区布局

### 3. 设计风格定位
- **设计语言**：现代简约、商务专业、高效实用
- **色彩方案**：主色调#1890ff(蓝色)，辅助色#52c41a(绿色)、#faad14(橙色)、#f5222d(红色)
- **界面风格**：扁平化设计，圆角8px，阴影层次感，图标线性风格
- **排版规范**：14px正文，16px标题，12px辅助信息，行高1.5倍

## 🎯 核心功能模块原型需求

### 模块0：登录与工作台
**原型页面：**
- `auth/login.html` - 用户登录页面
- `dashboard/oa-workspace.html` - OA工作台页面
- `dashboard/crm-workspace.html` - CRM工作台页面
- `dashboard/sales-workspace.html` - 销售工作台页面
- `dashboard/workspace-config.html` - 工作台配置页面

**关键设计要求：**

**登录页面 (auth/login.html)：**
- 响应式布局，支持桌面端和移动端
- 左侧展示企业Logo、Slogan和产品介绍轮播图
- 右侧登录表单区域：用户名/手机号、密码、验证码、记住密码
- 支持多种登录方式：账号密码、手机验证码、扫码登录
- **多租户支持**：支持租户域名识别和租户选择
- **租户切换**：超级管理员可切换到不同租户环境
- 登录成功后根据用户角色自动跳转到对应工作台
- 集成忘记密码、注册账号等辅助功能

**OA工作台 (dashboard/oa-workspace.html)：**
- 顶部欢迎语和快捷操作按钮区域
- 可拖拽的卡片式布局，支持动态配置显示模块
- 核心展示模块：
  - 任务安排：今日待办、本周任务、逾期任务统计
  - 代办审核单据提醒：流程审批、费用审核、请假申请等
  - 工作日程计划：日历组件显示会议、活动安排
  - 日志审批提醒：下属工作日志、审批状态展示
  - 公式格言：每日励志语录、企业文化宣传
  - 公告：重要通知、制度更新、活动公告
  - 公司最新动态：新闻资讯、人事变动、业务进展
  - 即将到期的事项提醒：合同到期、证件到期等
- 每个模块支持展开/收起、拖拽排序、个性化配置

**CRM工作台 (dashboard/crm-workspace.html)：**
- 数据概览仪表板，关键指标卡片展示
- 核心展示模块：
  - 客户转化数：意向客户、试用客户、正式客户数量及转化率
  - 跟进记录：今日跟进任务、待跟进客户、跟进完成率
  - 部门统计：各部门客户分布、业绩排名、团队表现
- 图表展示：折线图、饼图、柱状图等多种可视化组件
- 快捷操作：新增客户、批量导入、客户分配等

**销售工作台 (dashboard/sales-workspace.html)：**
- 销售业绩仪表板，核心KPI指标展示
- 核心展示模块：
  - 在售商品数：商品总数、新品数量、促销商品
  - 浏览数：商品浏览量、页面访问统计
  - 点击数：商品点击率、转化漏斗分析
  - 转化数：销售转化率、成交订单统计
  - 成交量：销售额、订单量、客单价分析
  - 小组业绩：团队排名、个人业绩、目标完成度
- 实时数据刷新，支持时间范围筛选(今日、本周、本月、自定义)
- 业绩趋势图表，支持同比、环比分析

**工作台配置 (dashboard/workspace-config.html)：**
- 模块管理：启用/禁用显示模块、调整模块大小
- 布局设置：拖拽排序、网格配置、响应式适配
- 权限控制：基于角色的模块可见性配置
- 主题设置：色彩主题、卡片样式、字体大小调整

### 模块1：组织架构管理
**原型页面：**
- `organization/department-tree.html` - 部门树状结构管理页面
- `organization/employee-list.html` - 员工信息列表页面  
- `organization/position-manage.html` - 岗位管理页面
- `organization/role-permission.html` - 角色权限配置页面
- `tenant/tenant-list.html` - 租户管理列表页面（超级管理员）
- `tenant/tenant-config.html` - 租户配置页面
- `tenant/org-template.html` - 组织架构模板管理页面

**关键设计要求：**
- 部门树支持拖拽调整层级关系,部门树可以实时编辑，部门树上可以进行岗位管理、岗位人员管理
- 员工列表支持多维度筛选(部门、岗位、在职状态、员工姓名、工号)
- 表格支持批量操作(导入、导出、批量修改)
- 权限配置采用树形选择组件
- **多租户管理**：租户列表展示、租户配置、资源监控
- **租户隔离**：确保各租户数据和界面完全隔离
- **配额监控**：实时显示租户资源使用情况和配额限制

### 模块2：客户关系管理(CRM)
**原型页面：**
- `crm/customer-dashboard.html` - CRM工作台页面
- `crm/customer-list.html` - 客户列表页面
- `crm/customer-detail.html` - 客户详情页面
- `crm/follow-record.html` - 跟进记录页面
- `crm/customer-transfer.html` - 客户交接页面

**关键设计要求：**
- 工作台展示关键指标(客户数量、跟进任务、转化率等)
- 客户列表支持状态标签(意向、试用、正式、审核中)
- 详情页采用Tab切换展示基本信息、跟进记录、订单历史
- 跟进记录支持时间轴展示

### 模块3：商品管理
**原型页面：**
- `product/category-manage.html` - 商品类目管理页面
- `product/product-list.html` - 商品列表页面
- `product/product-form.html` - 商品新增/编辑页面
- `product/inventory-monitor.html` - 库存监控页面

**关键设计要求：**
- 类目管理采用左侧树形+右侧属性配置布局
- 商品列表支持多图展示模式切换(列表/卡片/网格)
- 商品表单支持动态属性字段(基于类目配置)
- 库存监控包含预警提醒和统计图表

### 模块4：订单管理
**原型页面：**
- `order/order-dashboard.html` - 订单工作台页面
- `order/order-list.html` - 订单列表页面
- `order/order-detail.html` - 订单详情页面
- `order/order-create.html` - 订单创建页面

**关键设计要求：**
- 工作台展示订单统计图表(趋势图、饼图、柱状图)
- 订单列表支持多状态筛选和快速操作
- 详情页展示完整订单流程和物流信息
- 创建页面支持客户选择、商品选择、价格计算

### 模块5：客服中心
**原型页面：**
- `support/ticket-dashboard.html` - 工单工作台页面
- `support/ticket-list.html` - 工单列表页面
- `support/ticket-detail.html` - 工单详情页面
- `support/knowledge-base.html` - 知识库页面

**关键设计要求：**
- 工单列表支持优先级颜色标识和状态流转
- 详情页支持工单流转轨迹展示
- 知识库支持分类浏览和全文搜索
- 集成在线聊天组件界面

### 模块6：运维管理
**原型页面：**
- `ops/task-board.html` - 任务看板页面
- `ops/schedule-calendar.html` - 日程日历页面
- `ops/work-log.html` - 工作日志页面
- `ops/report-center.html` - 报表中心页面

**关键设计要求：**
- 任务看板采用Kanban布局(待办、进行中、已完成)
- 日程采用月视图/周视图/日视图切换
- 工作日志支持富文本编辑和模板填写
- 报表中心集成多种图表组件展示

## 🎨 界面设计规范

### 布局规范
```
整体布局：
├── 顶部导航栏 (60px高度)
│   ├── Logo区域 (240px宽度)
│   ├── 面包屑导航
│   ├── 搜索框
│   └── 用户信息 (头像、通知、设置)
├── 侧边导航栏 (240px宽度)
│   ├── 主导航菜单
│   ├── 子菜单展开
│   └── 收起/展开控制
└── 主内容区域
    ├── 页面标题区 (48px高度)
    ├── 工具栏区域 (操作按钮、筛选器等)
    ├── 内容展示区 (表格、表单、图表等)
    └── 分页器区域 (底部固定)
```

### 组件规范
- **按钮**：主按钮32px高度，次要按钮28px，小按钮24px
- **表单控件**：输入框32px高度，间距16px，标签右对齐
- **表格**：行高44px，斑马纹背景，hover高亮效果
- **卡片**：圆角8px，阴影0 2px 8px rgba(0,0,0,0.1)
- **图标**：16px标准尺寸，使用Ant Design图标库

### 交互规范
- **加载状态**：使用Skeleton骨架屏或Spin加载组件
- **消息反馈**：成功(绿色)、警告(橙色)、错误(红色)、信息(蓝色)
- **表单验证**：实时校验，错误信息红色显示
- **页面跳转**：使用页内路由，保持导航状态

## 🏢 多租户UI设计规范

### 1. 租户识别与切换

#### 1.1 租户域名识别
- **独立域名**：支持租户独立域名访问（如：company.portal.com）
- **子路径模式**：支持子路径租户识别（如：portal.com/company）
- **参数模式**：支持URL参数租户识别（如：portal.com?tenant=company）

#### 1.2 租户切换界面
```html
<!-- 超级管理员租户切换器 -->
<div class="tenant-switcher">
  <div class="current-tenant">
    <img src="{tenant.logoUrl}" class="tenant-logo" />
    <span class="tenant-name">{tenant.name}</span>
    <i class="anticon anticon-down"></i>
  </div>
  <div class="tenant-dropdown">
    <div class="tenant-search">
      <input placeholder="搜索租户..." />
    </div>
    <div class="tenant-list">
      <div class="tenant-item" v-for="tenant in tenants">
        <img :src="tenant.logoUrl" />
        <div class="tenant-info">
          <div class="tenant-name">{{tenant.name}}</div>
          <div class="tenant-status">{{tenant.status}}</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2. 租户个性化界面

#### 2.1 Logo与品牌定制
- **Logo替换**：支持租户自定义Logo，自动适配不同尺寸
- **主题色彩**：支持租户自定义主题色彩，影响按钮、链接、图标等
- **企业标识**：顶部导航栏显示租户企业名称和标识

#### 2.2 界面布局定制
```typescript
// 租户UI配置接口
interface TenantUIConfig {
  theme: {
    primaryColor: string;      // 主色调
    secondaryColor: string;    // 辅助色
    successColor: string;      // 成功色
    warningColor: string;      // 警告色
    errorColor: string;        // 错误色
  };
  logo: {
    url: string;              // Logo URL
    width: number;            // Logo宽度
    height: number;           // Logo高度
  };
  layout: {
    sidebarCollapsed: boolean; // 侧边栏默认状态
    breadcrumbEnabled: boolean; // 面包屑导航
    footerEnabled: boolean;    // 页脚显示
  };
  features: {
    enabledModules: string[];  // 启用的功能模块
    customMenus: MenuConfig[]; // 自定义菜单
  };
}
```

### 3. 租户管理界面

#### 3.1 租户列表页面 (tenant/tenant-list.html)
- **列表视图**：表格展示所有租户基本信息
- **筛选功能**：按状态、到期时间、创建时间筛选
- **搜索功能**：支持租户名称、编码、联系人搜索
- **状态标识**：不同状态用不同颜色标签区分
- **操作菜单**：查看详情、编辑、启用/禁用、删除

```html
<div class="tenant-list-page">
  <!-- 工具栏 -->
  <div class="toolbar">
    <div class="left-actions">
      <a-button type="primary" @click="createTenant">
        <PlusOutlined /> 新增租户
      </a-button>
      <a-button @click="exportTenants">
        <ExportOutlined /> 导出
      </a-button>
    </div>
    <div class="right-filters">
      <a-select placeholder="状态筛选" style="width: 120px">
        <a-select-option value="active">启用</a-select-option>
        <a-select-option value="inactive">禁用</a-select-option>
        <a-select-option value="expired">已过期</a-select-option>
      </a-select>
      <a-input-search placeholder="搜索租户..." style="width: 200px" />
    </div>
  </div>
  
  <!-- 租户表格 -->
  <a-table 
    :dataSource="tenants" 
    :columns="columns"
    :pagination="pagination"
    row-key="id">
    
    <!-- 租户信息列 -->
    <template #tenantInfo="{ record }">
      <div class="tenant-info">
        <img :src="record.logoUrl" class="tenant-avatar" />
        <div>
          <div class="tenant-name">{{ record.name }}</div>
          <div class="tenant-code">{{ record.code }}</div>
        </div>
      </div>
    </template>
    
    <!-- 状态列 -->
    <template #status="{ record }">
      <a-tag :color="getStatusColor(record.status)">
        {{ getStatusText(record.status) }}
      </a-tag>
    </template>
    
    <!-- 配额使用情况 -->
    <template #usage="{ record }">
      <div class="quota-usage">
        <div class="usage-item">
          <span>用户：</span>
          <a-progress 
            :percent="record.userUsageRate" 
            size="small"
            :showInfo="false" />
          <span>{{ record.userCount }}/{{ record.maxUsers }}</span>
        </div>
        <div class="usage-item">
          <span>存储：</span>
          <a-progress 
            :percent="record.storageUsageRate" 
            size="small"
            :showInfo="false" />
          <span>{{ formatStorage(record.usedStorage) }}/{{ formatStorage(record.maxStorage) }}</span>
        </div>
      </div>
    </template>
    
    <!-- 操作列 -->
    <template #action="{ record }">
      <a-space>
        <a @click="viewTenant(record)">查看</a>
        <a @click="editTenant(record)">编辑</a>
        <a @click="configTenant(record)">配置</a>
        <a-dropdown>
          <a>更多 <DownOutlined /></a>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="resetTenant(record)">重置</a-menu-item>
              <a-menu-item @click="backupTenant(record)">备份</a-menu-item>
              <a-menu-item @click="deleteTenant(record)" danger>删除</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </template>
  </a-table>
</div>
```

#### 3.2 租户配置页面 (tenant/tenant-config.html)
- **基本信息**：租户名称、编码、联系方式等
- **功能模块**：可开启/关闭的功能模块配置
- **资源配额**：用户数、存储空间、API调用限制等
- **个性化设置**：Logo、主题、域名等定制选项

```html
<div class="tenant-config-page">
  <a-tabs v-model:activeKey="activeTab">
    
    <!-- 基本信息 -->
    <a-tab-pane key="basic" tab="基本信息">
      <a-form :model="tenantForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="租户名称" required>
              <a-input v-model:value="tenantForm.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="租户编码" required>
              <a-input v-model:value="tenantForm.code" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="联系人">
              <a-input v-model:value="tenantForm.contactPerson" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话">
              <a-input v-model:value="tenantForm.contactPhone" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="公司地址">
          <a-textarea v-model:value="tenantForm.address" rows="3" />
        </a-form-item>
      </a-form>
    </a-tab-pane>
    
    <!-- 功能模块 -->
    <a-tab-pane key="modules" tab="功能模块">
      <div class="module-config">
        <div class="module-group" v-for="group in moduleGroups" :key="group.code">
          <h3>{{ group.name }}</h3>
          <a-row :gutter="16">
            <a-col :span="8" v-for="module in group.modules" :key="module.code">
              <a-card size="small" class="module-card">
                <div class="module-header">
                  <a-switch 
                    v-model:checked="module.enabled"
                    @change="onModuleChange(module)" />
                  <span class="module-name">{{ module.name }}</span>
                </div>
                <p class="module-desc">{{ module.description }}</p>
                <div class="module-quota" v-if="module.hasQuota">
                  <span>配额：</span>
                  <a-input-number 
                    v-model:value="module.quota"
                    :min="0"
                    :disabled="!module.enabled" />
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </div>
    </a-tab-pane>
    
    <!-- 资源配额 -->
    <a-tab-pane key="quota" tab="资源配额">
      <a-form :model="quotaForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="最大用户数">
              <a-input-number 
                v-model:value="quotaForm.maxUsers"
                :min="1"
                style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最大存储空间(GB)">
              <a-input-number 
                v-model:value="quotaForm.maxStorageGB"
                :min="1"
                style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="API调用限制(/小时)">
              <a-input-number 
                v-model:value="quotaForm.apiRateLimit"
                :min="100"
                style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <!-- 使用统计 -->
        <div class="usage-statistics">
          <h4>当前使用情况</h4>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-statistic 
                title="用户数" 
                :value="currentUsage.userCount"
                suffix="/ {{ quotaForm.maxUsers }}" />
              <a-progress 
                :percent="currentUsage.userUsageRate"
                :status="getUsageStatus(currentUsage.userUsageRate)" />
            </a-col>
            <a-col :span="8">
              <a-statistic 
                title="存储空间" 
                :value="currentUsage.storageUsedGB"
                :precision="2"
                suffix="GB / {{ quotaForm.maxStorageGB }}GB" />
              <a-progress 
                :percent="currentUsage.storageUsageRate"
                :status="getUsageStatus(currentUsage.storageUsageRate)" />
            </a-col>
            <a-col :span="8">
              <a-statistic 
                title="今日API调用" 
                :value="currentUsage.todayApiCalls"
                suffix="/ {{ quotaForm.apiRateLimit }}" />
              <a-progress 
                :percent="currentUsage.apiUsageRate"
                :status="getUsageStatus(currentUsage.apiUsageRate)" />
            </a-col>
          </a-row>
        </div>
      </a-form>
    </a-tab-pane>
    
    <!-- 个性化设置 -->
    <a-tab-pane key="customization" tab="个性化设置">
      <a-form :model="customForm" layout="vertical">
        <!-- Logo上传 -->
        <a-form-item label="企业Logo">
          <div class="logo-upload">
            <a-upload
              name="logo"
              list-type="picture-card"
              class="logo-uploader"
              :show-upload-list="false"
              action="/api/upload/logo"
              @change="handleLogoChange">
              <img v-if="customForm.logoUrl" :src="customForm.logoUrl" alt="logo" />
              <div v-else>
                <PlusOutlined />
                <div style="margin-top: 8px">上传Logo</div>
              </div>
            </a-upload>
          </div>
        </a-form-item>
        
        <!-- 主题色彩 -->
        <a-form-item label="主题色彩">
          <div class="theme-colors">
            <div class="color-item">
              <span>主色调：</span>
              <a-input 
                v-model:value="customForm.primaryColor"
                type="color"
                style="width: 60px" />
            </div>
            <div class="color-item">
              <span>辅助色：</span>
              <a-input 
                v-model:value="customForm.secondaryColor"
                type="color"
                style="width: 60px" />
            </div>
          </div>
        </a-form-item>
        
        <!-- 独立域名 -->
        <a-form-item label="独立域名">
          <a-input 
            v-model:value="customForm.domain"
            placeholder="例如：company.portal.com"
            addon-before="https://" />
        </a-form-item>
        
        <!-- 界面布局 -->
        <a-form-item label="界面布局">
          <a-space direction="vertical">
            <a-checkbox v-model:checked="customForm.sidebarCollapsed">
              默认收起侧边栏
            </a-checkbox>
            <a-checkbox v-model:checked="customForm.breadcrumbEnabled">
              显示面包屑导航
            </a-checkbox>
            <a-checkbox v-model:checked="customForm.footerEnabled">
              显示页面页脚
            </a-checkbox>
          </a-space>
        </a-form-item>
      </a-form>
    </a-tab-pane>
  </a-tabs>
  
  <!-- 底部操作栏 -->
  <div class="config-actions">
    <a-space>
      <a-button @click="resetConfig">重置</a-button>
      <a-button type="primary" @click="saveConfig">保存配置</a-button>
    </a-space>
  </div>
</div>
```

### 4. 多租户数据隔离UI

#### 4.1 租户上下文显示
- **顶部标识**：页面顶部显示当前租户信息
- **数据过滤**：所有列表自动过滤显示当前租户数据
- **操作限制**：根据租户权限限制可见操作按钮

#### 4.2 配额警告提示
```html
<!-- 配额警告组件 -->
<div class="quota-warning" v-if="showQuotaWarning">
  <a-alert
    :message="quotaWarning.message"
    :type="quotaWarning.type"
    :showIcon="true"
    :closable="true"
    @close="dismissWarning">
    <template #description>
      <div>
        <p>{{ quotaWarning.description }}</p>
        <a-button size="small" @click="upgradeQuota">升级配额</a-button>
      </div>
    </template>
  </a-alert>
</div>
```

### 5. 组织架构模板界面

#### 5.1 模板管理页面 (tenant/org-template.html)
- **模板列表**：预定义的组织架构模板
- **模板预览**：可视化预览组织架构结构
- **自定义模板**：支持创建自定义组织架构模板
- **模板应用**：一键应用模板到新租户

```html
<div class="org-template-page">
  <!-- 模板分类 -->
  <div class="template-categories">
    <a-radio-group v-model:value="currentCategory" button-style="solid">
      <a-radio-button value="all">全部模板</a-radio-button>
      <a-radio-button value="startup">初创企业</a-radio-button>
      <a-radio-button value="small">小型企业</a-radio-button>
      <a-radio-button value="medium">中型企业</a-radio-button>
      <a-radio-button value="large">大型企业</a-radio-button>
    </a-radio-group>
  </div>
  
  <!-- 模板网格 -->
  <div class="template-grid">
    <a-row :gutter="16">
      <a-col :span="6" v-for="template in templates" :key="template.id">
        <a-card 
          hoverable
          class="template-card"
          @click="selectTemplate(template)">
          <div class="template-preview">
            <img :src="template.previewImage" :alt="template.name" />
          </div>
          <div class="template-info">
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
            <div class="template-stats">
              <span>{{ template.deptCount }}个部门</span>
              <span>{{ template.positionCount }}个岗位</span>
            </div>
          </div>
          <div class="template-actions">
            <a-button size="small" @click.stop="previewTemplate(template)">
              预览
            </a-button>
            <a-button 
              type="primary" 
              size="small" 
              @click.stop="applyTemplate(template)">
              应用
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</div>
```

## 💻 技术实现要求

### 1. HTML结构规范
- 使用HTML5语义化标签
- 响应式Meta viewport设置
- 合理的DOM结构层次
- 无障碍访问性考虑(aria-label等)

### 2. CSS样式规范
- **原子化CSS**：使用Tailwind CSS风格的utility类
- **组件化**：可复用的UI组件样式
- **响应式**：@media查询适配不同屏幕
- **主题变量**：CSS自定义属性定义色彩/尺寸

### 3. 组件库集成
- **推荐使用**：Ant Design、Element UI、Arco Design等成熟组件库
- **图表组件**：ECharts、AntV G2Plot、Chart.js
- **图标库**：Ant Design Icons、Feather Icons、Heroicons

### 4. 文件组织结构
```
docs/html/
├── index.html (总览页面，iframe集成)
├── assets/
│   ├── css/
│   │   ├── common.css (通用样式)
│   │   ├── components.css (组件样式)
│   │   └── pages.css (页面样式)
│   ├── js/
│   │   ├── common.js (通用脚本)
│   │   ├── mock-data.js (模拟数据)
│   │   └── components.js (组件逻辑)
│   └── images/ (图片资源)
├── auth/ (登录认证模块页面)
├── dashboard/ (工作台模块页面)
├── organization/ (组织架构模块页面)
├── crm/ (客户管理模块页面)
├── product/ (商品管理模块页面)
├── order/ (订单管理模块页面)
├── support/ (客服中心模块页面)
└── ops/ (运维管理模块页面)
```

## 🔧 工作台特殊设计说明

### 登录流程设计
```
用户访问系统 → 显示登录页面 → 验证身份信息 → 根据角色跳转工作台
                                    ↓
角色判断：管理员/部门主管 → OA工作台 (默认)
         销售人员 → 销售工作台
         客服人员 → CRM工作台  
         可手动切换工作台类型
```

### 工作台模块卡片设计
- **卡片尺寸**：小卡片(240x160px)、中卡片(240x240px)、大卡片(480x240px)
- **网格布局**：12列网格系统，响应式调整列数
- **拖拽排序**：使用HTML5 Drag & Drop API，支持跨区域拖拽
- **状态保存**：用户个性化配置存储到localStorage/用户配置表

### 数据刷新策略
- **实时数据**：WebSocket推送关键指标更新
- **定时刷新**：每5分钟自动刷新一次数据
- **手动刷新**：每个卡片提供刷新按钮
- **数据缓存**：本地缓存数据减少服务器请求

### 权限控制机制
- **模块权限**：基于用户角色控制可见模块
- **数据权限**：按部门、用户级别过滤数据范围
- **操作权限**：控制用户可执行的操作类型
- **配置权限**：管理员可配置其他用户的工作台

## 🔍 原型验收标准

### 功能完整性
- [ ] 所有PRD需求模块100%覆盖
- [ ] 关键用户路径完整可操作
- [ ] 登录流程和工作台跳转逻辑正确
- [ ] 三种工作台模块配置功能完整
- [ ] 工作台卡片拖拽和排序功能正常
- [ ] 表单验证和反馈机制完善
- [ ] 数据展示和交互逻辑合理

### 视觉质量
- [ ] 界面风格统一美观
- [ ] 色彩搭配协调专业
- [ ] 排版布局清晰合理
- [ ] 图标和图片高清适配

### 用户体验
- [ ] 登录界面美观专业，支持多种登录方式
- [ ] 工作台界面信息密度适中，重要信息突出
- [ ] 卡片式布局清晰，支持个性化配置
- [ ] 操作流程简洁直观
- [ ] 信息层次清晰有序
- [ ] 反馈机制及时明确
- [ ] 学习成本低易上手

### 技术实现
- [ ] 代码结构清晰规范
- [ ] 响应式适配良好
- [ ] 浏览器兼容性好
- [ ] 加载性能优秀

## 🚀 输出要求

### 1. 总览页面 (index.html)
- 使用iframe方式平铺展示所有原型页面
- 提供导航菜单快速定位到具体页面
- 展示整体设计风格和交互效果
- 包含项目说明和使用指南

### 2. 模块页面
- 每个功能模块对应独立的HTML文件
- 包含完整的交互逻辑和数据展示
- 使用模拟数据验证界面效果
- 保持统一的视觉风格和交互规范

### 3. 文档说明
- 提供设计说明文档
- 组件使用指南
- 交互逻辑说明
- 后续开发建议

---

**输出路径：** `docs/html/` 文件夹  
**文件命名：** 采用kebab-case命名规范  
**版本标注：** v1.0 Portal 3.0 原型设计

**整体设计要求**
- 页面功能点可以根据给用户配置的权限点进行控制(置灰或者不展示)
- 导航菜单支持动态配置，根据用户角色和权限动态生成
- 工作台模块支持个性化配置，基于权限控制可见性
- 所有操作按钮支持权限控制(显示/隐藏/置灰)
- 数据展示支持按权限过滤，确保用户只能看到有权限的数据

## 🔐 权限控制系统设计

### 权限控制核心原则
1. **菜单权限**：控制用户可以访问哪些菜单和页面
2. **功能权限**：控制用户在页面内可以执行哪些操作
3. **数据权限**：控制用户可以查看和操作哪些数据范围
4. **字段权限**：控制用户可以看到哪些字段信息
5. **工作台权限**：控制用户工作台显示哪些模块卡片

### 权限控制模块页面

#### 权限管理页面
**原型页面：**
- `system/role-manage.html` - 角色管理页面
- `system/menu-manage.html` - 菜单权限配置页面  
- `system/permission-assign.html` - 权限分配页面
- `system/data-permission.html` - 数据权限配置页面

**关键设计要求：**

**角色管理页面 (system/role-manage.html)：**
- 角色列表展示：角色名称、描述、状态、创建时间
- 角色新增/编辑表单：基本信息录入
- 角色权限配置按钮：跳转到权限分配页面
- 支持角色启用/禁用状态切换
- 角色删除确认机制

**菜单权限配置页面 (system/menu-manage.html)：**
- 左侧：树形菜单结构展示，支持拖拽排序
- 右侧：菜单详情配置表单
  - 菜单基本信息：名称、编码、图标、路径
  - 菜单类型：目录、菜单、按钮、接口
  - 权限标识：用于前端权限判断
  - 显示设置：是否可见、是否外链、排序
- 菜单状态管理：启用/禁用
- 批量操作：批量启用/禁用、批量删除

**权限分配页面 (system/permission-assign.html)：**
- 左侧：角色列表，支持搜索和筛选
- 中间：权限树形选择器
  - 菜单权限：按模块分类的树形结构
  - 功能权限：每个菜单下的操作权限(增删改查等)
  - 支持全选/反选、父子联动
- 右侧：已选权限预览
- 权限继承关系展示
- 批量权限操作

**数据权限配置页面 (system/data-permission.html)：**
- 数据权限规则定义
  - 全部数据：无限制访问
  - 本部门：仅本部门数据  
  - 本部门及下级：本部门及所有子部门
  - 仅本人：只能查看自己的数据
  - 自定义：自定义SQL条件
- 角色数据权限配置
- 特殊用户权限例外设置

### 动态菜单设计规范

#### 菜单层级结构
```
一级菜单 (主模块)
├── 工作台
├── 组织架构
│   ├── 部门管理 (二级菜单)
│   │   ├── 查看部门 (三级权限-功能点)
│   │   ├── 新增部门 (三级权限-功能点)
│   │   ├── 编辑部门 (三级权限-功能点)
│   │   └── 删除部门 (三级权限-功能点)
│   └── 员工管理
├── CRM管理
│   ├── 客户管理
│   └── 跟进记录
├── 商品管理
├── 订单管理
├── 客服中心
├── 运维管理
└── 系统管理
    ├── 角色管理
    ├── 菜单管理
    └── 权限配置
```

#### 菜单权限控制状态
1. **正常显示**：用户有完整访问权限
2. **置灰显示**：用户有查看权限但无操作权限  
3. **完全隐藏**：用户无任何访问权限
4. **部分显示**：子菜单根据权限动态显示/隐藏

#### 导航菜单组件设计
**菜单项状态样式：**
```css
/* 正常状态 */
.menu-item {
  color: #333;
  cursor: pointer;
}

/* 置灰状态 */
.menu-item.disabled {
  color: #ccc;
  cursor: not-allowed;
  opacity: 0.5;
}

/* 隐藏状态 */
.menu-item.hidden {
  display: none;
}

/* 有权限但子菜单全部隐藏 */
.menu-item.empty-children {
  opacity: 0.6;
}
```

### 页面功能点权限控制

#### 按钮权限控制
**控制方式：**
1. **完全隐藏**：按钮不显示，适用于无权限的操作
2. **置灰禁用**：按钮显示但不可点击，提示用户权限不足
3. **文字提示**：显示"无权限"文字代替按钮

**权限控制组件设计：**
```html
<!-- 权限控制包装器 -->
<PermissionWrapper permission="organization:emp:add" mode="hidden">
  <Button type="primary">新增员工</Button>
</PermissionWrapper>

<PermissionWrapper permission="organization:emp:edit" mode="disabled">
  <Button>编辑</Button>
</PermissionWrapper>

<PermissionWrapper permission="organization:emp:delete" fallback={<span>无权限</span>}>
  <Button danger>删除</Button>
</PermissionWrapper>
```

#### 表格操作列权限控制
**操作列动态生成：**
- 根据用户权限动态显示操作按钮
- 支持批量操作权限控制
- 行级权限控制(如只能操作自己创建的数据)

#### 表单字段权限控制
**字段级权限：**
- 只读权限：字段显示但不可编辑
- 隐藏权限：字段完全不显示
- 脱敏权限：敏感信息部分遮盖显示

### 工作台权限配置

#### 工作台模块权限
**模块卡片控制：**
```typescript
// 工作台模块权限配置
const workspaceModules = [
  {
    code: 'task_summary',
    name: '任务汇总',
    permission: 'dashboard:task:view',
    defaultSize: 'medium',
    position: { x: 0, y: 0 }
  },
  {
    code: 'approval_pending', 
    name: '待审批',
    permission: 'workflow:approve:view',
    defaultSize: 'small',
    position: { x: 1, y: 0 }
  },
  {
    code: 'customer_stats',
    name: '客户统计', 
    permission: 'crm:stats:view',
    defaultSize: 'large',
    position: { x: 0, y: 1 }
  }
];
```

#### 个性化配置权限
- 用户可自定义显示的模块
- 管理员可配置默认工作台布局
- 部门主管可配置下属默认工作台
- 支持工作台模板保存和应用

### 数据权限展示规范

#### 列表数据过滤
**数据范围控制：**
- 列表自动按权限过滤数据
- 统计数据基于权限范围计算
- 搜索结果限制在权限范围内
- 导出数据按权限限制

#### 详情页面权限
**信息展示控制：**
- 敏感字段根据权限显示/隐藏
- 关联数据按权限过滤
- 操作历史按权限显示
- 附件下载权限控制

### 权限提示和反馈

#### 无权限状态页面
**空状态设计：**
```html
<div class="no-permission-state">
  <Icon name="lock" size="48" color="#ccc" />
  <h3>暂无访问权限</h3>
  <p>您当前没有访问此页面的权限，请联系管理员</p>
  <Button type="link">申请权限</Button>
</div>
```

#### 权限不足提示
**操作反馈：**
- Toast提示：操作失败，权限不足
- Modal确认：确定要申请此权限吗？
- 内联提示：鼠标悬停显示权限说明

### 权限控制实现规范

#### 前端权限校验
**多层权限校验：**
1. 路由层：页面访问权限
2. 组件层：功能操作权限  
3. 数据层：数据获取权限
4. 接口层：API调用权限

#### 权限缓存策略
**缓存机制：**
- 用户权限本地缓存，减少服务器请求
- 权限变更时自动刷新缓存
- 菜单权限缓存到SessionStorage
- 定期校验权限有效性

#### 安全防护
**前端安全：**
- 敏感操作二次确认
- 关键权限服务端双重校验
- 防止权限绕过攻击
- 权限变更日志记录