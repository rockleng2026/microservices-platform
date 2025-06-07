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

#### 2.2.2 客户管理相关表  
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
└── central_workflow -- 流程管理数据库
    ├── approverecord (复用原表)
    └── workflow_def (新建表)
```

## 3. 功能模块详细需求

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

## 4. 技术架构设计

### 4.1 微服务拆分策略
基于现有microservices-platform架构，扩展业务服务：

```
├── zlt-uaa -- 认证中心[8000] (已有)
├── zlt-gateway -- API网关[9900] (已有)
├── zlt-register -- 注册中心[8848] (已有)
├── zlt-business -- 业务模块
│   ├── user-center -- 用户中心[7000] (已有，扩展组织架构)
│   ├── file-center -- 文件中心[5000] (已有)
│   ├── crm-service -- 客户管理服务[7400] (新增)
│   ├── product-service -- 商品管理服务[7500] (新增)
│   ├── order-service -- 订单管理服务[7600] (新增)
│   ├── support-service -- 客服中心服务[7700] (新增)
│   ├── ops-service -- 运维管理服务[7800] (新增)
│   └── workflow-service -- 流程引擎服务[7900] (新增)
├── zlt-monitor -- 监控模块 (已有)
└── zlt-commons -- 通用组件 (已有)
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


