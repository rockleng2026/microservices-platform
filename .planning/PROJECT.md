# Mall-Center 在线商城系统

## What This Is

基于 central-platform v6.0.0 微服务平台构建的通用在线商城系统，支持**实物商品**（服务器、CPU、NAS等IT硬件）和**虚拟商品**（技术文档、软件授权）混合销售。前端载体为微信小程序，面向下游企业/个人客户提供商品浏览、下单、支付、物流追踪等电商体验；后端提供独立管理后台供运营人员完成商品上架、订单处理、库存管理等工作。

## Core Value

为IT硬件经销商提供一套完整的B2C在线销售解决方案，同时支持实物与虚拟商品，一套系统覆盖从商品展示到支付交付的全链路电商能力。

## Requirements

### Validated

(None yet — ship to validate)

### Active

**小程序端用户侧：**
- [ ] 商品模块：首页轮播广告、商品分类、商品搜索、商品列表（筛选/排序）、商品详情（SKU选择）
- [ ] 购物车：加购、修改数量/规格、选中状态、合计金额
- [ ] 订单模块：创建订单、微信支付、订单列表（按状态筛选）、订单详情（物流追踪）、取消订单、确认收货
- [ ] 用户模块：微信授权登录、收货地址管理、个人信息
- [ ] 评价模块：订单完成后评价商品

**管理后台运营侧：**
- [ ] 商品管理：分类管理（树形）、商品CRUD、批量上下架、富文本详情、SKU规格配置
- [ ] 订单管理：多条件筛选、订单详情、物流发货（运单号/物流公司）、退款处理
- [ ] 库存管理：SKU库存查看与修正、库存预警
- [ ] 客户管理：用户列表、订单/消费统计
- [ ] 系统设置：广告位管理（轮播图）、物流公司配置、支付配置（微信支付参数）

### Out of Scope

- 优惠券/满减活动（一期）— 营销工具可二期扩展
- 会员与权限精细化控制（一期）— 复用平台现有用户体系
- 退款流程自动化（一期）— 人工审核退款即可
- 多租户商户入驻（一期）— 表结构已支持，运营层面先单租户运营

## Context

**技术背景：**
- central-platform v6.0.0 微服务平台，基于 Spring Cloud Alibaba
- 现有基础设施：Nacos注册/配置中心、OAuth2认证(zlt-uaa)、API网关(zlt-gateway)、用户中心(user-center)、文件中心(file-center)
- 新增服务 `mall-center`（端口7010），数据库 `cp_mall`
- 技术栈：Spring Boot 3.1.6、MyBatis Plus 3.5.4.1、Druid、Redis (Redisson)、微信支付

**需求来源：**
- docs/mall-center/在线销售服务器硬件小程序开发V1.0.md — 基础需求（实物商品）
- docs/mall-center/在线销售服务器硬件小程序开发V1.1.md — 修订需求（新增虚拟商品类型）

**设计约束：**
- 遵循现有架构规范：表结构必含 `id`、`tenant_id`、`create_time`、`update_time`
- 复用现有公共组件：zlt-common-spring-boot-starter、zlt-db-starter、zlt-redis-starter、zlt-auth-client-starter
- 网关路由：所有 `/api/mall/**` 路由至 mall-center
- 微信登录通过 zlt-uaa 集成（接收code换Token）

## Constraints

- **技术栈**: Spring Boot 3.x + Spring Cloud Alibaba + MyBatis Plus — 必须复用平台技术栈
- **微信支付**: JSAPI支付，配置待后期联调 — 一期先完成业务逻辑，支付联调后续
- **多租户**: 表结构支持 `tenant_id`，但一期运营层面单租户 — 避免过度设计
- **前端载体**: 微信小程序（主）+ 管理后台Web（独立项目） — 小程序和管理后台分开开发

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 服务名 mall-center，端口7010 | 与现有服务命名规范一致 | ✓ |
| 数据库名 cp_mall | 与平台数据库命名规范一致 | ✓ |
| 虚拟商品订单支付后自动完成，无需发货 | 虚拟商品无需物流，提升交付效率 | ✓ |
| 混合购物车不支持实物+虚拟同时结算 | 避免订单类型歧义，简化业务流程 | ✓ |
| 库存扣减：下单预占+支付成功真实扣减 | Redis原子操作防超卖，订单超时回滚 | ✓ |
| 管理后台独立前端项目 | 复用现有 zlt-web 或新建 Vue3 项目 | ✓ Pending |
| 微信支付配置 | 一期暂不配置，待后期联调再配置真实商户参数 | ✓ |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state (users, feedback, metrics)

---
*Last updated: 2026-05-08 after initialization*
