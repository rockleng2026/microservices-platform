# Portal 3.0 微服务重构项目需求文档 (PRD)

## 1. 项目概述

### 1.1 项目背景
基于现代微服务架构，对原有基于SSH+JSP+jQuery框架的Portal系统进行全面重构，构建新一代Portal 3.0综合管理平台，集成OA办公自动化、CRM客户关系管理、进销存库存管理三大核心业务模块。

### 1.2 项目目标
- **技术升级**：从单体架构迁移到微服务架构
- **功能保持**：完整保留原有系统核心功能
- **性能提升**：提高系统可扩展性、可维护性和性能
- **用户体验**：现代化UI/UX设计，提升用户使用体验
- **数据迁移**：最大程度复用原系统数据库表结构，确保数据平滑迁移
- **多租户支持**：支持SaaS化多租户模式，实现数据和功能的完全隔离

### 1.3 现有技术架构分析

#### 1.3.1 后端框架 (microservices-platform)
**技术栈：**
- **框架版本**：Spring Boot 3.1.6 + Spring Cloud 2022.0.4
- **认证授权**：Spring Authorization Server 1.1.3
- **注册中心**：Nacos[8848]
- **API网关**：Spring Cloud Gateway[9900]
- **监控中心**：Spring Boot Admin[6500]

**现有服务模块：**
```
├── zlt-uaa -- 认证中心[8000]
├── zlt-gateway/sc-gateway -- API网关[9900]
├── zlt-register -- 注册中心Nacos[8848]
├── zlt-business -- 业务模块
│   ├── user-center -- 用户中心[7000]
│   ├── file-center -- 文件中心[5000]
│   ├── code-generator -- 代码生成器[7300]
│   └── search-center -- 搜索中心[7100]
├── zlt-monitor
│   ├── sc-admin -- 应用监控[6500]
│   └── log-center -- 日志中心[7200]
└── zlt-commons -- 通用组件
    ├── zlt-auth-client-spring-boot-starter
    ├── zlt-common-spring-boot-starter
    ├── zlt-db-spring-boot-starter
    ├── zlt-redis-spring-boot-starter
    └── 其他通用starter
```

#### 1.3.2 前端框架 (zlt-web)
**技术选型：**
- **主框架**：React + TypeScript
- **UI组件库**：Ant Design Pro
- **构建工具**：UmiJS v3.x
- **图表库**：Ant Design Charts
- **兼容版本**：保留LayUI版本作为备选

**项目结构：**
```
zlt-web/
├── react-web -- React主前端[8066]
│   └── src/main/frontend -- 前端源码(Ant Design Pro)
└── layui-web -- LayUI备选前端[8066]
    └── src/main/resources/static -- 前端源码
```

### 1.4 技术栈对比
| 维度 | 旧架构 | 新架构 |
|------|--------|--------|
| 架构模式 | SSH单体架构 | Spring Cloud微服务 |
| 前端技术 | JSP + jQuery | React + TypeScript + Ant Design Pro |
| 后端框架 | SSH (Spring+Struts+Hibernate) | Spring Boot 3.x + Spring Cloud |
| 认证方式 | Session + Filter | OAuth2 + JWT + Spring Authorization Server |
| 数据库 | 单体数据库 | 分布式数据库设计 |
| 部署方式 | 传统部署 | 容器化部署(Docker+K8s) |

## 2. 数据库表结构复用策略

### 2.1 数据源分析
**原系统数据库：** `portal/document/portal20160513.sql`
**进销存文档：** `portal/document/进销存数据库文档（2016）.doc`

### 2.2 核心表结构保留
基于对原系统数据库的分析，以下核心表结构将被最大程度保留：

#### 2.2.1 组织架构相关表
```sql
-- 部门表 (保留原结构)
department (
    id int(11) -- 部门ID
    name varchar(128) -- 部门名称  
    directorId int(11) -- 部门主管ID
    parentId int(11) -- 父部门ID
    delflag int(11) -- 删除标识
    tel varchar(50) -- 电话
    depNo varchar(10) -- 部门编号
    filialemark varchar(100) -- 分公司标识
    fiiale varchar(11) -- 是否为分公司
    islevel int(10) -- 部门级别
    gradeid int(11) DEFAULT 7 -- 部门等级(1-7级)
    Time datetime -- 创建时间
)

-- 部门等级表 关联到department表的gradeid
department_grade (
  id int(11) -- '部门级别表',
  dg_num tinyint(4) -- '部门等级数字',
  dg_name varchar(32) -- '部门等级名称',
  dg_desc varchar(200) -- '部门等级描述'
)





-- 员工表 (保留原结构，扩展字段)
employee (
    id int(11) -- 员工ID
    uuid varchar(255) -- UUID标识
    name varchar(20) -- 姓名
    birth varchar(255) -- 生日
    sex int(11) -- 性别
    cardid varchar(50) -- 身份证号
    department int(11) -- 部门ID
    position int(11) -- 职位ID
    workposition int(11) -- 工作岗位
    empNo varchar(50) -- 员工编号
    isLoginAccount int(11) -- 是否有登录账号
    email varchar(255) -- 邮箱
    Tel varchar(50) -- 电话
    isLeave int(255) -- 是否离职
    gradeid int(11) -- 员工等级
    entryTime varchar(255) -- 入职时间
    leaveTime varchar(255) -- 离职时间
    delflag int(11) -- 删除标识
)

-- 权限组表 (基于原系统groups表)
groups (
    groupID int(11) -- 组ID
    groupName varchar(50) -- 组名称
    groupInfo varchar(500) -- 组描述
    isDelete int(11) -- 删除标识
)
```

#-- 岗位表 (扩展原workposition表)
workposition (
    id int(11) -- 岗位ID
    name varchar(100) -- 岗位名称
    shortname varchar(20) -- 岗位简称
    deptid int(11) -- 部门ID
    workgrade int(11) -- 权重等级(1-5)
    workcontent text -- 工作职责
    functionIDs varchar(500) -- 功能权限ID串
    permissions text -- 权限配置JSON
    parpostionid int(11) -- 上级岗位ID
    ispersonman int(11) -- 是否主管岗位
    edittime datetime -- 最后编辑时间
    delflag int(11) -- 删除标识
)

-- 权限组表 (基于原groups表)
groups (
    groupID int(11) -- 权限组ID
    groupName varchar(50) -- 权限组名称
    groupInfo varchar(500) -- 权限组描述
    functionIDs varchar(500) -- 包含的功能权限ID
    isDelete int(11) -- 删除标识
)
```

### 2.2.2 客户管理相关表  
```sql
-- 客户表 (保留原结构)
customer (
    customer_id int(11) -- 客户ID
    customer_name varchar(255) -- 客户名称
    customer_status varchar(10) -- 客户状态(1意向,2试用,3正式,4审核中)
    vendition int(11) -- 业务负责人ID
    CardID varchar(50) -- 身份证号
    customer_type varchar(50) -- 客户类型
    customer_email varchar(255) -- 邮箱
    customer_mobile varchar(20) -- 手机
    customer_regtime varchar(50) -- 注册时间
    companyadress varchar(255) -- 公司地址
    companyScale varchar(255) -- 公司规模
    companyphone varchar(255) -- 公司电话
)

-- 客户跟进记录表
customerfollow (
    id int(11) -- 跟进ID
    customer_id int(11) -- 客户ID
    employee_id int(11) -- 跟进员工ID
    followTime varchar(50) -- 跟进时间
    followContent text -- 跟进内容
    nextTime varchar(50) -- 下次跟进时间
    followType varchar(20) -- 跟进方式
)

-- 客户交接记录表 (基于原表customermove)
customermove (
    id int(11) -- 交接ID
    customerId int(11) -- 客户ID
    oldPrincipal int(11) -- 原负责人
    newPrincipal int(11) -- 新负责人
    moveCause varchar(500) -- 交接原因
    movetime varchar(50) -- 交接时间
)
```

#### 2.2.3 商品管理相关表
```sql
-- 商品类型表 (保留原结构)
commoditytpye (
    id int(11) -- 类型ID
    typename varchar(100) -- 类型名称
    parentid int(11) -- 父类型ID
    delflag int(11) -- 删除标识
    fieldid int(11) -- 字段配置ID
)

-- 产品表 (保留原结构)  
product (
    id int(11) -- 产品ID
    name varchar(100) -- 产品名称
    type int(11) -- 产品类型ID
    model int(11) -- 型号ID
    price double -- 价格
    time datetime -- 录入时间
    employee int(11) -- 录入员工
    supplier int(11) -- 供应商ID
    delflag int(11) -- 删除标识
)

-- 字段配置表 (保留原结构)
field (
    id int(11) -- 字段ID
    temp1-temp20 varchar(50-100) -- 自定义属性字段
)
```

#### 2.2.4 订单管理相关表
```sql
-- 销售订单表 (保留原结构)
saleorder (
    Id int(11) -- 订单ID
    orderNo varchar(50) -- 订单号
    customer_id int(11) -- 客户ID
    employee_id int(11) -- 销售员工ID
    orderTime varchar(50) -- 下单时间
    totalMoney double -- 订单总金额
    orderStatus varchar(20) -- 订单状态
    delflag int(11) -- 删除标识
)

-- 订单详情表
saleorderinfo (
    id int(11) -- 详情ID
    saleOrderId int(11) -- 订单ID
    productId int(11) -- 产品ID
    quantity int(11) -- 数量
    price double -- 单价
    amount double -- 小计
)
```

### 2.3 表结构迁移策略

#### 2.3.1 直接复用
- 保持原有表结构和字段定义
- 仅调整字符集为UTF8MB4
- 添加必要的索引优化

#### 2.3.2 扩展改造
- 增加`created_at`、`updated_at`时间戳字段
- 统一删除标识字段为`deleted`
- 添加`tenant_id`字段支持多租户
- 添加多租户管理相关表结构

#### 2.3.3 微服务拆分
按业务域将表分配到不同的微服务数据库：
```
├── user-center-db -- 用户中心数据库
│   ├── department (复用原表)
│   ├── employee (复用原表)
│   ├── groups (复用原表)
│   └── users (复用原表)
├── central_crm -- CRM数据库  
│   ├── customer (复用原表)
│   ├── customermove (复用原表)
│   └── customerfollow (新建表)
├── central_product -- 商品管理数据库
│   ├── commoditytpye (复用原表)
│   ├── product (复用原表)
│   ├── field (复用原表)
│   └── supplier (复用原表)
├── central_order -- 订单管理数据库
│   ├── saleorder (复用原表)
│   ├── saleorderinfo (复用原表)
│   └── payment (新建表)
├── central_workflow -- 流程管理数据库
│   ├── approverecord (复用原表)
│   └── workflow_def (新建表)
└── central_tenant -- 多租户管理数据库
    ├── tenant (租户表)
    ├── tenant_config (租户配置表)
    ├── tenant_module (租户模块表)
    └── tenant_user (租户用户关联表)
```

## 3. 多租户架构设计

### 3.1 多租户模式概述

#### 3.1.1 租户隔离模式
Portal 3.0采用**数据库级别的租户隔离**模式，确保各租户间数据完全隔离：

- **Schema隔离**：每个租户使用独立的数据库Schema
- **应用层隔离**：通过tenant_id字段进行数据过滤
- **功能模块隔离**：支持租户级别的功能模块开启/关闭
- **UI定制隔离**：支持租户级别的界面主题和Logo定制

#### 3.1.2 租户管理架构
```
多租户管理架构：
├── 超级管理员 (Super Admin)
│   ├── 租户创建与管理
│   ├── 全局系统配置
│   ├── 租户资源监控
│   └── 系统运维管理
├── 租户管理员 (Tenant Admin)
│   ├── 租户内用户管理
│   ├── 租户功能配置
│   ├── 租户数据管理
│   └── 租户个性化设置
└── 普通用户 (Normal User)
    ├── 业务功能使用
    ├── 个人信息管理
    └── 权限范围内操作
```

### 3.2 多租户数据模型

#### 3.2.1 租户核心表
```sql
-- 租户信息表
CREATE TABLE tenant (
    id varchar(32) NOT NULL COMMENT '租户ID',
    tenant_code varchar(50) NOT NULL COMMENT '租户编码',
    tenant_name varchar(100) NOT NULL COMMENT '租户名称',
    company_name varchar(200) COMMENT '公司名称',
    contact_person varchar(50) COMMENT '联系人',
    contact_phone varchar(20) COMMENT '联系电话',
    contact_email varchar(100) COMMENT '联系邮箱',
    company_address varchar(500) COMMENT '公司地址',
    logo_url varchar(200) COMMENT 'Logo地址',
    domain varchar(100) COMMENT '独立域名',
    status tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
    expire_time datetime COMMENT '到期时间',
    max_users int(11) DEFAULT 100 COMMENT '最大用户数',
    max_storage bigint(20) DEFAULT 10737418240 COMMENT '最大存储空间(字节)',
    used_storage bigint(20) DEFAULT 0 COMMENT '已用存储空间',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by varchar(32) COMMENT '创建人',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_code (tenant_code),
    UNIQUE KEY uk_domain (domain)
) COMMENT='租户信息表';

-- 租户配置表
CREATE TABLE tenant_config (
    id int(11) NOT NULL AUTO_INCREMENT,
    tenant_id varchar(32) NOT NULL COMMENT '租户ID',
    config_key varchar(100) NOT NULL COMMENT '配置键',
    config_value text COMMENT '配置值',
    config_type varchar(20) DEFAULT 'string' COMMENT '配置类型',
    description varchar(500) COMMENT '配置描述',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_config (tenant_id, config_key)
) COMMENT='租户配置表';

-- 租户功能模块表
CREATE TABLE tenant_module (
    id int(11) NOT NULL AUTO_INCREMENT,
    tenant_id varchar(32) NOT NULL COMMENT '租户ID',
    module_code varchar(50) NOT NULL COMMENT '模块代码',
    module_name varchar(100) NOT NULL COMMENT '模块名称',
    is_enabled tinyint(1) DEFAULT 1 COMMENT '是否启用',
    expire_time datetime COMMENT '模块到期时间',
    max_quota int(11) COMMENT '最大配额',
    used_quota int(11) DEFAULT 0 COMMENT '已用配额',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_module (tenant_id, module_code)
) COMMENT='租户功能模块表';

-- 租户用户关联表
CREATE TABLE tenant_user (
    id int(11) NOT NULL AUTO_INCREMENT,
    tenant_id varchar(32) NOT NULL COMMENT '租户ID',
    user_id int(11) NOT NULL COMMENT '用户ID',
    role_type tinyint(1) DEFAULT 2 COMMENT '角色类型(1租户管理员,2普通用户)',
    join_time datetime DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    status tinyint(1) DEFAULT 1 COMMENT '状态(1正常,0禁用)',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_user (tenant_id, user_id)
) COMMENT='租户用户关联表';
```

#### 3.2.2 租户数据隔离策略
**所有业务表统一添加tenant_id字段：**
```sql
-- 示例：用户表添加租户隔离
ALTER TABLE users ADD COLUMN tenant_id varchar(32) NOT NULL COMMENT '租户ID';
ALTER TABLE users ADD INDEX idx_tenant_id (tenant_id);

-- 示例：部门表添加租户隔离
ALTER TABLE department ADD COLUMN tenant_id varchar(32) NOT NULL COMMENT '租户ID';
ALTER TABLE department ADD INDEX idx_tenant_id (tenant_id);
```

### 3.3 多租户功能特性

#### 3.3.1 租户注册与开通
- **在线注册**：支持企业在线申请试用账号
- **审核机制**：超级管理员审核租户申请
- **自动开通**：审核通过后自动创建租户环境
- **初始配置**：自动创建租户管理员账号和基础数据

#### 3.3.2 租户管理功能
- **租户列表**：展示所有租户基本信息和状态
- **租户详情**：查看租户详细信息、使用统计、配置信息
- **租户配置**：设置租户功能模块、存储配额、用户数限制
- **租户监控**：监控租户资源使用情况、性能指标
- **租户计费**：支持按用户数、存储空间、功能模块计费

#### 3.3.3 租户个性化定制
- **主题定制**：支持自定义Logo、色彩主题、企业标识
- **功能定制**：按需开启/关闭功能模块（OA、CRM、进销存）
- **域名定制**：支持独立域名访问（如：company.portal.com）
- **界面定制**：支持自定义首页布局、菜单结构

### 3.4 多租户权限控制

#### 3.4.1 跨租户访问控制
- **租户上下文**：每个请求携带租户标识
- **数据过滤**：所有数据查询自动添加tenant_id条件
- **API隔离**：确保API调用只能访问本租户数据
- **文件隔离**：上传文件按租户分目录存储

#### 3.4.2 租户级权限管理
- **超级管理员权限**：
  - 创建/删除/管理所有租户
  - 系统全局配置和监控
  - 跨租户数据查询（仅用于运维）
- **租户管理员权限**：
  - 管理本租户内所有用户和数据
  - 配置本租户功能和权限
  - 查看本租户使用统计
- **普通用户权限**：
  - 仅能访问本租户业务功能
  - 受租户内角色权限限制

### 3.5 多租户运维管理

#### 3.5.1 租户监控
- **资源监控**：CPU、内存、存储、网络使用情况
- **性能监控**：响应时间、并发数、错误率统计
- **业务监控**：用户活跃度、功能使用统计、数据增长
- **告警机制**：资源超限、异常访问、性能下降告警

#### 3.5.2 租户备份与恢复
- **数据备份**：支持租户级别数据备份
- **增量备份**：定期增量备份，减少存储开销
- **灾难恢复**：支持租户数据快速恢复
- **跨环境迁移**：支持租户在不同环境间迁移

## 4. 功能模块详细需求

### 3.1 组织架构管理模块

#### 3.1.1 部门管理
**核心功能：**
- 支持7级部门层级结构 (基于gradeid字段)
- 区分分公司与半级机构类型 (基于fiiale字段)
- 部门信息维护（名称、编码、负责人、联系方式等）
- 部门树状结构展示与拖拽调整

**数据模型：**
```sql
-- 复用原department表结构
CREATE TABLE department (
    id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(128) COMMENT '部门名称',
    directorId int(11) COMMENT '部门主管ID',
    parentId int(11) COMMENT '父部门ID',
    depNo varchar(10) COMMENT '部门编号', 
    gradeid int(11) DEFAULT 7 COMMENT '部门等级(1-7级)',
    fiiale varchar(11) COMMENT '是否为分公司(1是,空否)',
    filialemark varchar(100) COMMENT '分公司标识',
    delflag int(11) DEFAULT 0 COMMENT '删除标识',
    Time datetime COMMENT '创建时间',
    -- 新增字段
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tenant_id varchar(32) COMMENT '租户ID',
    PRIMARY KEY (id)
);
```

#### 3.1.2 岗位管理
**核心功能：**
- 岗位信息维护 (复用原workposition表)
- 岗位类型区分（主管岗/非主管岗）
- 岗位权限配置 (关联groups表)
- 岗位与部门关联管理

#### 3.1.3 员工管理  
**核心功能：**
- 员工基础信息管理 (复用原employee表结构)
- 员工多岗位任职 (通过workposition字段)
- 员工部门管理权限（主管/分管）
- 员工入职/离职流程

**数据模型：**
```sql
-- 复用原employee表结构
CREATE TABLE employee (
    id int(11) NOT NULL AUTO_INCREMENT,
    uuid varchar(255) COMMENT 'UUID标识',
    name varchar(20) COMMENT '姓名',
    empNo varchar(50) COMMENT '员工编号',
    department int(11) COMMENT '部门ID',
    position int(11) COMMENT '职位组ID',
    workposition int(11) COMMENT '工作岗位ID',
    gradeid int(11) COMMENT '员工等级',
    isLeave int(11) DEFAULT 1 COMMENT '是否在职(0离职,1在职)',
    entryTime varchar(255) COMMENT '入职时间',
    leaveTime varchar(255) COMMENT '离职时间',
    delflag int(11) DEFAULT 0 COMMENT '删除标识',
    -- 保留其他原有字段...
    PRIMARY KEY (id)
);
```

### 3.2 客户关系管理模块 (CRM)

#### 3.2.1 客户管理
**客户生命周期：**
```
意向客户(1) → 试用客户(2) → 审核中客户(4) → 正式客户(3)
```

**数据模型：**
```sql 
-- 复用原customer表结构
CREATE TABLE customer (
    customer_id int(11) NOT NULL AUTO_INCREMENT,
    customer_name varchar(255) COMMENT '客户名称',
    customer_status varchar(10) COMMENT '客户状态(1意向,2试用,3正式,4审核中)',
    vendition int(11) COMMENT '业务负责人ID',
    customer_type varchar(50) COMMENT '客户类型',
    customer_regtime varchar(50) COMMENT '注册时间',
    -- 保留其他原有字段...
    PRIMARY KEY (customer_id)
);
```

#### 3.2.2 客户跟进管理
**核心功能：**
- 跟进记录维护 (新建表，兼容原数据)
- 跟进计划制定
- 客户交接流程 (复用customermove表)

### 3.3 商品管理模块

#### 3.3.1 商品类目管理
**数据模型：**
```sql
-- 复用原commoditytpye表
CREATE TABLE commoditytpye (
    id int(11) NOT NULL AUTO_INCREMENT,
    typename varchar(100) COMMENT '类型名称',
    parentid int(11) COMMENT '父类型ID',
    fieldid int(11) COMMENT '字段配置ID',
    delflag int(11) DEFAULT 0,
    PRIMARY KEY (id)
);

-- 复用原field表作为属性配置
CREATE TABLE field (
    id int(11) NOT NULL AUTO_INCREMENT,
    temp1-temp20 varchar(50-100) COMMENT '自定义属性字段',
    PRIMARY KEY (id)
);
```

#### 3.3.2 商品信息管理
**数据模型：**
```sql
-- 复用原product表结构
CREATE TABLE product (
    id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(100) COMMENT '产品名称',
    type int(11) COMMENT '产品类型ID',
    model int(11) COMMENT '型号ID', 
    price double COMMENT '价格',
    employee int(11) COMMENT '录入员工ID',
    supplier int(11) COMMENT '供应商ID',
    delflag int(11) DEFAULT 0,
    time datetime COMMENT '录入时间',
    PRIMARY KEY (id)
);
```

### 3.4 订单管理模块

#### 3.4.1 订单处理
**数据模型：**
```sql
-- 复用原saleorder表结构
CREATE TABLE saleorder (
    Id int(11) NOT NULL AUTO_INCREMENT,
    orderNo varchar(50) COMMENT '订单号',
    customer_id int(11) COMMENT '客户ID',
    employee_id int(11) COMMENT '销售员工ID',
    orderTime varchar(50) COMMENT '下单时间',
    totalMoney double COMMENT '订单总金额',
    orderStatus varchar(20) COMMENT '订单状态',
    delflag int(11) DEFAULT 0,
    PRIMARY KEY (Id)
);
```

### 3.5 客服中心模块

#### 3.5.1 工单管理
**工单流转流程：**
```
客户提交 → 客服接收 → 分类处理 → 专业处理 → 客服确认 → 客户反馈 → 工单完结
```

### 3.6 运维管理模块

#### 3.6.1 任务管理
**核心功能：**
- 任务创建与分配
- 任务进度跟踪  
- 任务优先级管理

#### 3.6.2 工作日志
**核心功能：**
- 日报/周报/月报
- 工作总结与计划 (复用原有日志相关表)

### 3.7 流程管理模块

#### 3.7.1 审批流程管理
**核心功能：**
- 流程设计器
- 审批节点配置 (复用原approverecord表)

### 3.8 权限管理模块

#### 3.8.1 角色权限  
**数据模型：**
```sql
-- 复用原groups表作为角色表
CREATE TABLE groups (
    groupID int(11) NOT NULL AUTO_INCREMENT,
    groupName varchar(50) COMMENT '角色名称',
    groupInfo varchar(500) COMMENT '角色描述', 
    isDelete int(11) DEFAULT 0,
    PRIMARY KEY (groupID)
);

-- 复用原users表作为用户登录表
CREATE TABLE users (
    id int(11) NOT NULL AUTO_INCREMENT,
    username varchar(50) COMMENT '用户名',
    password varchar(100) COMMENT '密码',
    employee_id int(11) COMMENT '员工ID',
    groupID int(11) COMMENT '角色ID',
    isDelete int(11) DEFAULT 0,
    PRIMARY KEY (id)
);
```

#### 3.8.2 动态菜单权限控制
**核心功能：**
- 导航菜单动态配置：根据用户权限动态生成导航菜单
- 页面功能点权限控制：页面内操作按钮、功能模块的显示/隐藏/置灰
- 数据权限过滤：基于部门、角色的数据访问范围控制
- 个性化工作台：用户可自定义工作台模块显示

**权限控制模型：**
```
用户 → 角色 → 权限组 → 菜单权限 + 功能权限 + 数据权限
```

**数据模型：**
```sql
-- 菜单表 (新增)
CREATE TABLE sys_menu (
    id int(11) NOT NULL AUTO_INCREMENT,
    menu_code varchar(50) NOT NULL COMMENT '菜单编码',
    menu_name varchar(100) NOT NULL COMMENT '菜单名称',
    menu_type varchar(20) NOT NULL COMMENT '菜单类型(menu:菜单,button:按钮,api:接口)',
    parent_id int(11) DEFAULT 0 COMMENT '父菜单ID',
    menu_path varchar(200) COMMENT '菜单路径',
    component_path varchar(200) COMMENT '组件路径', 
    menu_icon varchar(50) COMMENT '菜单图标',
    sort_order int(11) DEFAULT 0 COMMENT '排序序号',
    is_visible tinyint(1) DEFAULT 1 COMMENT '是否可见(1:是,0:否)',
    is_external tinyint(1) DEFAULT 0 COMMENT '是否外链(1:是,0:否)',
    menu_status tinyint(1) DEFAULT 1 COMMENT '菜单状态(1:启用,0:禁用)',
    perms varchar(200) COMMENT '权限标识',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tenant_id varchar(32) COMMENT '租户ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_menu_code (menu_code),
    KEY idx_parent_id (parent_id)
);

-- 角色菜单关联表 (新增)
CREATE TABLE sys_role_menu (
    id int(11) NOT NULL AUTO_INCREMENT,
    role_id int(11) NOT NULL COMMENT '角色ID',
    menu_id int(11) NOT NULL COMMENT '菜单ID',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    tenant_id varchar(32) COMMENT '租户ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_menu (role_id, menu_id),
    KEY idx_role_id (role_id),
    KEY idx_menu_id (menu_id)
);

-- 用户菜单权限表 (新增，支持个性化权限)
CREATE TABLE sys_user_menu (
    id int(11) NOT NULL AUTO_INCREMENT,
    user_id int(11) NOT NULL COMMENT '用户ID',
    menu_id int(11) NOT NULL COMMENT '菜单ID',
    permission_type varchar(20) NOT NULL COMMENT '权限类型(grant:授权,deny:拒绝)',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    tenant_id varchar(32) COMMENT '租户ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_menu (user_id, menu_id),
    KEY idx_user_id (user_id),
    KEY idx_menu_id (menu_id)
);

-- 数据权限表 (新增)
CREATE TABLE sys_data_permission (
    id int(11) NOT NULL AUTO_INCREMENT,
    permission_code varchar(50) NOT NULL COMMENT '权限编码',
    permission_name varchar(100) NOT NULL COMMENT '权限名称',
    permission_type varchar(20) NOT NULL COMMENT '权限类型(dept:部门,user:用户,custom:自定义)',
    rule_content text COMMENT '权限规则内容(JSON格式)',
    status tinyint(1) DEFAULT 1 COMMENT '状态(1:启用,0:禁用)',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tenant_id varchar(32) COMMENT '租户ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_permission_code (permission_code)
);

-- 角色数据权限关联表 (新增)
CREATE TABLE sys_role_data_permission (
    id int(11) NOT NULL AUTO_INCREMENT,
    role_id int(11) NOT NULL COMMENT '角色ID',
    permission_id int(11) NOT NULL COMMENT '数据权限ID',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    tenant_id varchar(32) COMMENT '租户ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_permission (role_id, permission_id)
);

-- 工作台配置表 (新增)
CREATE TABLE sys_workspace_config (
    id int(11) NOT NULL AUTO_INCREMENT,
    user_id int(11) NOT NULL COMMENT '用户ID',
    workspace_type varchar(20) NOT NULL COMMENT '工作台类型(oa:OA工作台,crm:CRM工作台,sales:销售工作台)',
    module_config text COMMENT '模块配置(JSON格式)',
    layout_config text COMMENT '布局配置(JSON格式)',
    is_default tinyint(1) DEFAULT 0 COMMENT '是否默认工作台',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tenant_id varchar(32) COMMENT '租户ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_workspace (user_id, workspace_type)
);
```

**权限控制层级：**
```
1. 一级权限：模块访问权限 (用户是否能看到某个模块)
   - OA办公模块 (organization:oa)
   - CRM客户管理模块 (crm:management)  
   - 商品管理模块 (product:management)
   - 订单管理模块 (order:management)
   - 客服中心模块 (support:center)
   - 运维管理模块 (ops:management)

2. 二级权限：页面访问权限 (用户是否能访问模块下的具体页面)
   - 部门管理页面 (organization:dept:view)
   - 员工管理页面 (organization:emp:view)
   - 客户列表页面 (crm:customer:view)
   - 客户详情页面 (crm:customer:detail)

3. 三级权限：功能操作权限 (用户在页面内能执行的具体操作)
   - 新增操作 (add)
   - 编辑操作 (edit) 
   - 删除操作 (delete)
   - 导入操作 (import)
   - 导出操作 (export)
   - 审核操作 (approve)

4. 数据权限：数据访问范围控制
   - 仅本人 (self)：只能查看自己的数据
   - 本部门 (dept)：只能查看本部门的数据
   - 本部门及下级 (dept_and_child)：本部门及所有下级部门
   - 全部 (all)：查看所有数据
```

**菜单配置示例：**
```sql
-- 主菜单数据示例
INSERT INTO sys_menu VALUES 
(1, 'dashboard', '工作台', 'menu', 0, '/dashboard', null, 'dashboard', 1, 1, 0, 1, 'dashboard:view', now(), now(), 'default'),
(2, 'organization', '组织架构', 'menu', 0, '/organization', null, 'team', 2, 1, 0, 1, 'organization:view', now(), now(), 'default'),
(3, 'organization_dept', '部门管理', 'menu', 2, '/organization/department', 'organization/DepartmentList', 'apartment', 1, 1, 0, 1, 'organization:dept:view', now(), now(), 'default'),
(4, 'organization_emp', '员工管理', 'menu', 2, '/organization/employee', 'organization/EmployeeList', 'user', 2, 1, 0, 1, 'organization:emp:view', now(), now(), 'default'),
(5, 'emp_add', '新增员工', 'button', 4, null, null, null, 1, 1, 0, 1, 'organization:emp:add', now(), now(), 'default'),
(6, 'emp_edit', '编辑员工', 'button', 4, null, null, null, 2, 1, 0, 1, 'organization:emp:edit', now(), now(), 'default'),
(7, 'emp_delete', '删除员工', 'button', 4, null, null, null, 3, 1, 0, 1, 'organization:emp:delete', now(), now(), 'default'),
(8, 'crm', 'CRM管理', 'menu', 0, '/crm', null, 'user-group', 3, 1, 0, 1, 'crm:view', now(), now(), 'default'),
(9, 'crm_customer', '客户管理', 'menu', 8, '/crm/customer', 'crm/CustomerList', 'contacts', 1, 1, 0, 1, 'crm:customer:view', now(), now(), 'default');

-- 数据权限配置示例  
INSERT INTO sys_data_permission VALUES
(1, 'dept_data', '部门数据权限', 'dept', '{"type":"dept","rule":"current_and_children"}', 1, now(), now(), 'default'),
(2, 'self_data', '个人数据权限', 'user', '{"type":"user","rule":"self_only"}', 1, now(), now(), 'default'),
(3, 'all_data', '全部数据权限', 'custom', '{"type":"all","rule":"no_limit"}', 1, now(), now(), 'default');
```

#### 3.8.3 前端权限控制实现
**权限指令：**
```typescript
// 权限判断Hook
const usePermission = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(perm => hasPermission(perm));
  };
  
  return { hasPermission, hasAnyPermission };
};

// 权限控制组件
const PermissionWrapper: React.FC<{
  permission: string | string[];
  fallback?: React.ReactNode;
  mode?: 'hidden' | 'disabled';
  children: React.ReactNode;
}> = ({ permission, fallback = null, mode = 'hidden', children }) => {
  const { hasPermission, hasAnyPermission } = usePermission();
  
  const hasAccess = Array.isArray(permission) 
    ? hasAnyPermission(permission)
    : hasPermission(permission);
    
  if (!hasAccess) {
    if (mode === 'hidden') return fallback;
    if (mode === 'disabled') {
      return React.cloneElement(children as React.ReactElement, {
        disabled: true,
        style: { opacity: 0.5, cursor: 'not-allowed' }
      });
    }
  }
  
  return children;
};
```

**动态路由生成：**
```typescript
// 路由权限控制
const generateRoutes = (menuList: MenuItem[]): RouteObject[] => {
  return menuList
    .filter(menu => menu.menu_type === 'menu' && menu.is_visible)
    .map(menu => ({
      path: menu.menu_path,
      element: React.lazy(() => import(menu.component_path)),
      children: menu.children ? generateRoutes(menu.children) : undefined
    }));
};

// 菜单权限过滤
const filterMenuByPermission = (menus: MenuItem[], userPermissions: string[]): MenuItem[] => {
  return menus
    .filter(menu => !menu.perms || userPermissions.includes(menu.perms))
    .map(menu => ({
      ...menu,
      children: menu.children ? filterMenuByPermission(menu.children, userPermissions) : []
    }))
    .filter(menu => menu.menu_type !== 'menu' || !menu.children || menu.children.length > 0);
};
```

#### 3.8.4 后端权限服务实现
**权限服务架构：**
```
├── permission-service -- 权限管理服务[7100]
│   ├── MenuController -- 菜单管理接口
│   ├── RoleController -- 角色管理接口
│   ├── PermissionController -- 权限控制接口
│   ├── DataPermissionController -- 数据权限接口
│   └── WorkspaceController -- 工作台配置接口
```

**核心API接口设计：**
```java
// 权限查询接口
@RestController
@RequestMapping("/api/permission")
public class PermissionController {
    
    /**
     * 获取用户菜单权限
     */
    @GetMapping("/menu/user/{userId}")
    public Result<List<MenuDTO>> getUserMenus(@PathVariable Long userId) {
        List<MenuDTO> menus = permissionService.getUserMenuPermissions(userId);
        return Result.success(menus);
    }
    
    /**
     * 获取用户功能权限
     */
    @GetMapping("/function/user/{userId}")
    public Result<Set<String>> getUserPermissions(@PathVariable Long userId) {
        Set<String> permissions = permissionService.getUserFunctionPermissions(userId);
        return Result.success(permissions);
    }
    
    /**
     * 校验用户权限
     */
    @PostMapping("/check")
    public Result<Boolean> checkPermission(@RequestBody PermissionCheckDTO request) {
        boolean hasPermission = permissionService.checkUserPermission(
            request.getUserId(), request.getPermission());
        return Result.success(hasPermission);
    }
    
    /**
     * 批量校验权限
     */
    @PostMapping("/check/batch")
    public Result<Map<String, Boolean>> checkPermissions(@RequestBody BatchPermissionCheckDTO request) {
        Map<String, Boolean> result = permissionService.batchCheckPermissions(
            request.getUserId(), request.getPermissions());
        return Result.success(result);
    }
}

// 菜单管理接口
@RestController  
@RequestMapping("/api/menu")
public class MenuController {
    
    /**
     * 菜单树形结构
     */
    @GetMapping("/tree")
    public Result<List<MenuTreeDTO>> getMenuTree() {
        List<MenuTreeDTO> menuTree = menuService.getMenuTree();
        return Result.success(menuTree);
    }
    
    /**
     * 保存菜单
     */
    @PostMapping("/save")
    public Result<Void> saveMenu(@RequestBody @Valid MenuSaveDTO menu) {
        menuService.saveMenu(menu);
        return Result.success();
    }
    
    /**
     * 菜单排序
     */
    @PostMapping("/sort")
    public Result<Void> sortMenus(@RequestBody List<MenuSortDTO> sortList) {
        menuService.sortMenus(sortList);
        return Result.success();
    }
}

// 角色权限管理接口
@RestController
@RequestMapping("/api/role")
public class RoleController {
    
    /**
     * 角色权限配置
     */
    @PostMapping("/{roleId}/permissions")
    public Result<Void> configRolePermissions(
            @PathVariable Long roleId, 
            @RequestBody RolePermissionConfigDTO config) {
        roleService.configRolePermissions(roleId, config);
        return Result.success();
    }
    
    /**
     * 获取角色权限
     */
    @GetMapping("/{roleId}/permissions")
    public Result<RolePermissionDTO> getRolePermissions(@PathVariable Long roleId) {
        RolePermissionDTO permissions = roleService.getRolePermissions(roleId);
        return Result.success(permissions);
    }
}

// 工作台配置接口
@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {
    
    /**
     * 获取用户工作台配置
     */
    @GetMapping("/user/{userId}")
    public Result<WorkspaceConfigDTO> getUserWorkspaceConfig(@PathVariable Long userId) {
        WorkspaceConfigDTO config = workspaceService.getUserWorkspaceConfig(userId);
        return Result.success(config);
    }
    
    /**
     * 保存工作台配置
     */
    @PostMapping("/save")
    public Result<Void> saveWorkspaceConfig(@RequestBody WorkspaceConfigSaveDTO config) {
        workspaceService.saveWorkspaceConfig(config);
        return Result.success();
    }
    
    /**
     * 获取可用模块列表
     */
    @GetMapping("/modules/available/{userId}")
    public Result<List<WorkspaceModuleDTO>> getAvailableModules(@PathVariable Long userId) {
        List<WorkspaceModuleDTO> modules = workspaceService.getAvailableModules(userId);
        return Result.success(modules);
    }
}
```

**权限拦截器实现：**
```java
// 权限注解
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String value(); // 权限标识
    boolean requireAll() default true; // 是否需要全部权限
}

// 权限拦截器
@Component
public class PermissionInterceptor implements HandlerInterceptor {
    
    @Autowired
    private PermissionService permissionService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                           Object handler) throws Exception {
        
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequirePermission permission = handlerMethod.getMethodAnnotation(RequirePermission.class);
        
        if (permission == null) {
            permission = handlerMethod.getBeanType().getAnnotation(RequirePermission.class);
        }
        
        if (permission == null) {
            return true;
        }
        
        // 获取当前用户
        Long userId = getCurrentUserId(request);
        if (userId == null) {
            throw new UnauthorizedException("用户未登录");
        }
        
        // 权限校验
        String[] perms = permission.value().split(",");
        boolean hasPermission = permission.requireAll() 
            ? permissionService.hasAllPermissions(userId, perms)
            : permissionService.hasAnyPermission(userId, perms);
            
        if (!hasPermission) {
            throw new ForbiddenException("权限不足");
        }
        
        return true;
    }
}

// 数据权限切面
@Aspect
@Component
public class DataPermissionAspect {
    
    @Autowired
    private DataPermissionService dataPermissionService;
    
    @Around("@annotation(dataPermission)")
    public Object around(ProceedingJoinPoint joinPoint, DataPermission dataPermission) throws Throwable {
        
        // 获取当前用户
        Long userId = SecurityUtils.getCurrentUserId();
        
        // 构建数据权限SQL条件
        String condition = dataPermissionService.buildDataPermissionCondition(
            userId, dataPermission.entity(), dataPermission.alias());
        
        // 设置到ThreadLocal，供MyBatis拦截器使用
        DataPermissionContext.setCondition(condition);
        
        try {
            return joinPoint.proceed();
        } finally {
            DataPermissionContext.clear();
        }
    }
}

// MyBatis数据权限拦截器
@Intercepts({
    @Signature(type = Executor.class, method = "query", 
               args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})
})
public class DataPermissionInterceptor implements Interceptor {
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        
        String condition = DataPermissionContext.getCondition();
        if (StringUtils.isBlank(condition)) {
            return invocation.proceed();
        }
        
        // 解析SQL，添加数据权限条件
        MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
        String originalSql = mappedStatement.getBoundSql(invocation.getArgs()[1]).getSql();
        
        // 使用JSQLParser解析SQL并添加WHERE条件
        String newSql = SqlParserUtils.addDataPermissionCondition(originalSql, condition);
        
        // 创建新的MappedStatement
        MappedStatement newMs = SqlParserUtils.newMappedStatement(mappedStatement, newSql);
        invocation.getArgs()[0] = newMs;
        
        return invocation.proceed();
    }
}
```

**权限缓存策略：**
```java
// 权限缓存服务
@Service
public class PermissionCacheService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String USER_PERMISSION_KEY = "user:permission:";
    private static final String USER_MENU_KEY = "user:menu:";
    private static final int CACHE_EXPIRE_HOURS = 2;
    
    /**
     * 缓存用户权限
     */
    public void cacheUserPermissions(Long userId, Set<String> permissions) {
        String key = USER_PERMISSION_KEY + userId;
        redisTemplate.opsForValue().set(key, permissions, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
    }
    
    /**
     * 获取缓存的用户权限
     */
    @SuppressWarnings("unchecked")
    public Set<String> getCachedUserPermissions(Long userId) {
        String key = USER_PERMISSION_KEY + userId;
        return (Set<String>) redisTemplate.opsForValue().get(key);
    }
    
    /**
     * 清除用户权限缓存
     */
    public void clearUserPermissionCache(Long userId) {
        String permissionKey = USER_PERMISSION_KEY + userId;
        String menuKey = USER_MENU_KEY + userId;
        redisTemplate.delete(Arrays.asList(permissionKey, menuKey));
    }
    
    /**
     * 角色权限变更时，清除相关用户缓存
     */
    public void clearRoleUsersCache(Long roleId) {
        // 查询该角色下的所有用户
        List<Long> userIds = userService.getUserIdsByRoleId(roleId);
        
        // 批量清除缓存
        List<String> keys = userIds.stream()
            .flatMap(userId -> Stream.of(
                USER_PERMISSION_KEY + userId,
                USER_MENU_KEY + userId
            ))
            .collect(Collectors.toList());
            
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
```

## 4. 技术架构设计

### 4.1 微服务拆分策略
基于现有microservices-platform架构，扩展业务服务：

```
├── zlt-uaa -- 认证中心[8000]
├── zlt-gateway -- API网关[9900]
├── zlt-register -- 注册中心[8848]
├── zlt-business -- 业务模块
│   ├── user-center -- 用户中心[7000]
│   ├── file-center -- 文件中心[5000]
│   ├── permission-center -- 权限管理中心[7100]
│   ├── crm-service -- 客户管理服务[7400]
│   ├── product-service -- 商品管理服务[7500]
│   ├── order-service -- 订单管理服务[7600]
│   ├── support-service -- 客服中心服务[7700]
│   ├── ops-service -- 运维管理服务[7800]
│   └── workflow-service -- 流程引擎服务[7900]
├── zlt-monitor -- 监控模块
└── zlt-commons -- 通用组件
```

### 4.2 数据库设计
按业务域拆分数据库，复用原有表结构：

```
├── central_user -- 用户中心数据库
│   ├── department (复用原表)
│   ├── employee (复用原表)
│   ├── groups (复用原表)
│   └── users (复用原表)
├── central_crm -- CRM数据库  
│   ├── customer (复用原表)
│   ├── customermove (复用原表)
│   └── customerfollow (新建表)
├── central_product -- 商品管理数据库
│   ├── commoditytpye (复用原表)
│   ├── product (复用原表)
│   ├── field (复用原表)
│   └── supplier (复用原表)
├── central_order -- 订单管理数据库
│   ├── saleorder (复用原表)
│   ├── saleorderinfo (复用原表)
│   └── payment (新建表)
└── central_workflow -- 流程管理数据库
    ├── approverecord (复用原表)
    └── workflow_def (新建表)
```

### 4.3 前端技术架构
基于现有zlt-web React框架：

**技术栈：**
- **主框架**：React 18 + TypeScript
- **UI组件库**：Ant Design Pro 
- **构建工具**：UmiJS v3.x
- **状态管理**：React Hooks + Context API
- **图表组件**：Ant Design Charts
- **请求库**：Axios + SWR

**项目结构：**
```
react-web/src/main/frontend/
├── src/
│   ├── components/ -- 通用组件
│   ├── pages/ -- 页面组件
│   │   ├── organization/ -- 组织架构
│   │   ├── crm/ -- 客户管理
│   │   ├── product/ -- 商品管理
│   │   ├── order/ -- 订单管理
│   │   ├── support/ -- 客服中心
│   │   └── ops/ -- 运维管理
│   ├── services/ -- API服务层
│   ├── utils/ -- 工具函数
│   └── styles/ -- 样式文件
├── config/ -- 配置文件
└── mock/ -- Mock数据
```

## 5. 重构实施计划

### 5.1 Phase 1: 基础设施完善 (2周)
- 基于现有microservices-platform框架
- 完善服务注册发现配置
- 数据库表结构迁移脚本编写
- 基础权限认证集成

### 5.2 Phase 2: 核心服务扩展 (4周)
- 扩展user-center支持组织架构管理
- 开发crm-service客户管理服务
- 前端基础框架集成现有React项目

### 5.3 Phase 3: 业务服务开发 (8周)
- 开发product-service商品管理服务
- 开发order-service订单管理服务  
- 开发support-service客服中心服务
- 前端业务页面开发

### 5.4 Phase 4: 高级功能开发 (6周)
- 开发workflow-service流程引擎服务
- 开发ops-service运维管理服务
- 报表统计功能
- 移动端适配

### 5.5 Phase 5: 测试与部署 (4周)
- 数据迁移测试
- 系统集成测试
- 性能压力测试
- 生产环境部署

## 6. 数据迁移方案

### 6.1 迁移策略
1. **渐进式迁移**：保持原系统运行，逐步迁移数据
2. **双写方案**：新旧系统并行，确保数据一致性
3. **回滚保障**：制定完整的回滚方案

### 6.2 迁移步骤
1. **结构迁移**：创建新数据库，复用原表结构
2. **历史数据迁移**：批量迁移存量数据
3. **增量同步**：实时同步新增数据
4. **数据校验**：确保数据完整性和一致性

## 7. 风险控制

### 7.1 技术风险
- **数据迁移风险**：制定详细的迁移测试方案
- **系统兼容性风险**：保持原有API接口兼容
- **性能风险**：进行充分的压力测试

### 7.2 业务风险
- **功能缺失风险**：详细对比原系统功能清单
- **用户习惯变更风险**：提供用户培训和过渡期支持
- **数据丢失风险**：多重备份和校验机制

## 8. 验收标准

### 8.1 功能验收
- 所有原系统功能100%复现
- 数据迁移完整性验证
- 业务流程端到端测试通过

### 8.2 性能验收
- 系统响应时间≤2秒  
- 并发用户数≥1000
- 数据库查询优化达标

### 8.3 数据验收
- 数据迁移完整性100%
- 数据一致性校验通过
- 历史数据可追溯性保证

---

**文档版本：** V2.0  
**更新时间：** 2024年  
**负责人：** 项目组  
**审核人：** 技术总监

### 3.4 组织管理模块数据库设计

#### 3.4.1 核心表设计

**员工表 (employee)**
```sql
CREATE TABLE `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '员工ID',
  `uuid` varchar(36) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'UUID',
  `emp_no` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '员工编号',
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '姓名',
  `name_en` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '英文姓名',
  `gender` tinyint(1) NULL DEFAULT NULL COMMENT '性别(1:男,2:女)',
  `birth_date` date NULL DEFAULT NULL COMMENT '出生日期',
  `id_card` varchar(18) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '身份证号',
  `mobile` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `department_id` int(11) NULL DEFAULT NULL COMMENT '部门ID',
  `position_id` int(11) NULL DEFAULT NULL COMMENT '主岗位ID',
  `secondary_position_ids` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '副岗位ID列表',
  `grade_id` int(11) NULL DEFAULT NULL COMMENT '员工等级ID',
  `employment_type` tinyint(1) NULL DEFAULT NULL COMMENT '用工类型(1:正式,2:实习,3:外包,4:劳务)',
  `employment_status` tinyint(1) NULL DEFAULT NULL COMMENT '在职状态(1:在职,2:试用,3:离职)',
  `entry_date` date NULL DEFAULT NULL COMMENT '入职日期',
  `probation_end_date` date NULL DEFAULT NULL COMMENT '试用期结束日期',
  `leave_date` date NULL DEFAULT NULL COMMENT '离职日期',
  `leave_reason` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '离职原因',
  `education` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '学历',
  `nation` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '民族',
  `health_status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '健康状况',
  `height` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '身高',
  `weight` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '体重',
  `marital_status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '婚姻状况',
  `birthplace` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '籍贯',
  `residence` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '现居住地',
  `emergency_contact` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '紧急联系人',
  `emergency_phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '紧急联系电话',
  `specialty` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '专业技能',
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '头像',
  `remark` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '备注',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` int(11) NULL DEFAULT NULL COMMENT '创建人',
  `update_by` int(11) NULL DEFAULT NULL COMMENT '更新人',
  `del_flag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标记(0:正常,1:删除)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_emp_no`(`emp_no`) USING BTREE,
  INDEX `idx_department`(`department_id`) USING BTREE,
  INDEX `idx_position`(`position_id`) USING BTREE,
  INDEX `idx_status`(`employment_status`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '员工表';
```

**员工等级表 (employee_grade)**
```sql
CREATE TABLE `employee_grade` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '等级ID',
  `grade_code` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '等级编码',
  `grade_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '等级名称',
  `grade_level` tinyint(2) NULL DEFAULT NULL COMMENT '等级级别(1-20)',
  `description` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '等级描述',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_grade_code`(`grade_code`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '员工等级表';
```

#### 3.4.2 扩展信息设计

**字段配置表 (field_config)**
```sql
CREATE TABLE `field_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `uuid` varchar(36) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'UUID',
  `entity_type` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '实体类型(Employee)',
  `config_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '配置名称',
  `config_code` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '配置编码',
  `description` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '描述',
  `field_definitions` json NULL COMMENT '字段定义(JSON格式)',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_entity_code`(`entity_type`, `config_code`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '字段配置表';
```

**员工扩展数据表 (employee_extend_data)**
```sql
CREATE TABLE `employee_extend_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '扩展数据ID',
  `employee_id` int(11) NOT NULL COMMENT '员工ID',
  `config_id` int(11) NOT NULL COMMENT '配置ID',
  `data_content` json NOT NULL COMMENT '数据内容(JSON格式)',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee`(`employee_id`) USING BTREE,
  INDEX `idx_config`(`config_id`) USING BTREE,
  CONSTRAINT `fk_extend_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_extend_config` FOREIGN KEY (`config_id`) REFERENCES `field_config` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '员工扩展数据表';
```

#### 3.4.3 附件管理设计

**员工附件表 (employee_attachment)**
```sql
CREATE TABLE `employee_attachment` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '附件ID',
  `employee_id` int(11) NOT NULL COMMENT '员工ID',
  `attachment_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '附件类型',
  `attachment_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '附件名称',
  `original_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '原始文件名',
  `file_size` bigint(20) NULL DEFAULT NULL COMMENT '文件大小(bytes)',
  `file_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '文件类型',
  `file_path` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '文件存储路径',
  `upload_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `upload_by` int(11) NULL DEFAULT NULL COMMENT '上传人',
  `audit_status` tinyint(1) NULL DEFAULT 0 COMMENT '审核状态(0:待审核,1:通过,2:拒绝)',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `audit_by` int(11) NULL DEFAULT NULL COMMENT '审核人',
  `audit_remark` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '审核备注',
  `del_flag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee`(`employee_id`) USING BTREE,
  INDEX `idx_type`(`attachment_type`) USING BTREE,
  CONSTRAINT `fk_attachment_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '员工附件表';
```

#### 3.4.4 预置数据配置

**员工等级预置数据**
```sql
INSERT INTO `employee_grade` (`grade_code`, `grade_name`, `grade_level`, `description`, `sort_order`) VALUES
('L01', '初级员工', 1, '初级员工等级', 1),
('L02', '中级员工', 2, '中级员工等级', 2),
('L03', '高级员工', 3, '高级员工等级', 3),
('L04', '专家级员工', 4, '专家级员工等级', 4),
('M01', '初级主管', 5, '初级主管等级', 5),
('M02', '中级主管', 6, '中级主管等级', 6),
('M03', '高级主管', 7, '高级主管等级', 7),
('S01', '初级经理', 8, '初级经理等级', 8),
('S02', '中级经理', 9, '中级经理等级', 9),
('S03', '高级经理', 10, '高级经理等级', 10);
```

**扩展字段预置配置**
```sql
INSERT INTO `field_config` (`entity_type`, `config_name`, `config_code`, `description`, `field_definitions`) VALUES
('Employee', '家庭成员', 'family_members', '员工家庭成员信息', '[
  {"field": "name", "label": "姓名", "type": "text", "required": true},
  {"field": "relationship", "label": "关系", "type": "select", "required": true, "options": ["父亲", "母亲", "配偶", "子女", "兄弟姐妹", "其他"]},
  {"field": "position", "label": "职位", "type": "text", "required": false},
  {"field": "company", "label": "工作单位", "type": "text", "required": false}
]'),
('Employee', '教育经历', 'education_history', '员工教育经历信息', '[
  {"field": "school", "label": "毕业院校", "type": "text", "required": true},
  {"field": "start_date", "label": "开始时间", "type": "date", "required": true},
  {"field": "end_date", "label": "结束时间", "type": "date", "required": true},
  {"field": "major", "label": "专业", "type": "text", "required": true},
  {"field": "degree", "label": "学位/证书", "type": "text", "required": false},
  {"field": "referee", "label": "证明人", "type": "text", "required": false}
]'),
('Employee', '工作经验', 'work_experience', '员工工作经验信息', '[
  {"field": "company", "label": "公司", "type": "text", "required": true},
  {"field": "start_date", "label": "开始时间", "type": "date", "required": true},
  {"field": "end_date", "label": "结束时间", "type": "date", "required": true},
  {"field": "position", "label": "职务", "type": "text", "required": true},
  {"field": "salary", "label": "收入", "type": "number", "required": false},
  {"field": "leave_reason", "label": "离职原因", "type": "text", "required": false},
  {"field": "referee", "label": "证明人", "type": "text", "required": false},
  {"field": "referee_phone", "label": "证明人联系电话", "type": "text", "required": false}
]');
```

#### 3.4.5 附件类型定义

**员工附件类型枚举**
- PHOTO_2INCH: 2寸半身照
- ID_CARD_FRONT: 身份证正面
- ID_CARD_BACK: 身份证反面
- DIPLOMA: 毕业证
- DEGREE: 学位证
- EXAM_SCORE: 笔试成绩
- FULL_PHOTO: 个人全身照
- RESUME: 个人简历
- OTHER: 其他附件


