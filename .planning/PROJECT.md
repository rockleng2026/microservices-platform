# Mall-Center 在线商城系统

## What This Is

基于 central-platform v6.0.0 微服务平台构建的通用在线商城系统，支持**实物商品**（服务器、CPU、NAS等IT硬件）和**虚拟商品**（技术文档、软件授权）混合销售。前端载体为微信小程序，面向下游企业/个人客户提供商品浏览、下单、支付、物流追踪等电商体验；后端提供独立管理后台供运营人员完成商品上架、订单处理、库存管理等工作。

## Core Value

为IT硬件经销商提供一套完整的B2C在线销售解决方案，同时支持实物与虚拟商品，一套系统覆盖从商品展示到支付交付的全链路电商能力。

## Current Milestone: v2.0

**Goal:** 为商城系统开发管理前端（React + Umi + Ant Design）和微信小程序前端（uni-app + Vue），覆盖所有后端 API 的管理操作界面。

**Target features:**
- 管理后台 Web（React + Umi + Ant Design Pro）：商品管理、订单管理、优惠券/促销管理、发货与物流等运营模块
- 微信小程序（uni-app + Vue）：面向消费者的商品浏览、购物车、订单、支付等用户侧功能
- 页面设计需调用 `/gsd-ui-phase` 进行 UI 设计规划，注重美观和交互体验

**技术栈：**
- 管理后台：React 18 + Umi 4 + Ant Design 4 + TypeScript（与 portal-web 保持一致）
- 微信小程序：uni-app + Vue 3
- 后端 API：mall-center 微服务（端口 7010）

## Requirements

### Validated

- ✓ GOODS-01~04 — Phase 1 (商品分类、搜索、列表、详情)
- ✓ CART-01~06 — Phase 1 (购物车全功能)
- ✓ USER-01~03 — Phase 1 (微信登录、收货地址、个人信息)
- ✓ VIRTUAL-01 — Phase 1 (虚拟商品无需收货地址)
- ✓ GOODS-05~08 — Phase 2 (管理员商品管理、批量上下架、实物/虚拟商品类型)
- ✓ SYS-01~03 — Phase 2 (轮播图管理、微信支付参数配置、统计卡片)
- ✓ VIRTUAL-02~04 — Phase 2 (虚拟商品资源交付、有效期、无限制库存)
- ✓ ORDER-01~09 — Phase 3 (订单创建/流转/管理)
- ✓ PAY-01~04 — Phase 3 (微信JSAPI支付集成)
- ✓ STOCK-01~06 — Phase 3 (Redis库存预占/真实扣减/释放、手动修正、预警)
- ✓ DELIVERY-01 — Phase 3 (物流公司配置CRUD)
- ✓ EVAL-01~03 — Phase 4 (评价模块：评分/评论/图片)
- ✓ USER-04~05 — Phase 4 (用户列表、消费统计)
- ✓ DELIVERY-02~04 — Phase 4 (物流轨迹追踪)
- ✓ COMPILE-01 — Phase 5 (Result.succeed() 泛型修复)
- ✓ REFUND-01~10 — Phase 5 (退款模块：申请/审核/微信退款/库存回增)
- ✓ MARKETING-01~09 — Phase 5 (营销模块：优惠券/促销/会员积分)
- ✓ ORDER-EXT-01~03 — Phase 6 (管理员关单/改价/备注)
- ✓ STAT-01~03 — Phase 6 (销售趋势/库存预警/用户分析)
- ✓ ADVANCED-02 — Phase 7 (Redis Lua 原子化库存)
- ✓ ADVANCED-03 — Phase 7 (商户多租户入驻)
- ✓ ADVANCED-04 — Phase 7 (微信模板消息通知)

### Active

(None — v2.0 not yet planned)

### Out of Scope

- 优惠券/满减活动（一期→二期）— v1.2 已实现
- 会员与权限精细化控制（一期）— 复用平台现有用户体系
- 视频/直播带货 — 非核心需求
- 自动化退款审批 — 欺诈风险，人工审核更安全
- 限时秒杀（Redis原子扣减库存）— 可复用 Lua 脚本
- 积分兑换商品 — 复杂度高，二期再做
- Elasticsearch搜索 — 增加系统复杂度和部署难度

## Context

**技术背景：**
- central-platform v6.0.0 微服务平台，基于 Spring Cloud Alibaba
- 现有基础设施：Nacos注册/配置中心、OAuth2认证(zlt-uaa)、API网关(zlt-gateway)、用户中心(user-center)、文件中心(file-center)
- 新增服务 `mall-center`（端口7010），数据库 `cp_mall`
- 技术栈：Spring Boot 3.1.6、MyBatis Plus 3.5.4.1、Druid、Redis (Redisson)、微信支付

**需求来源：**
- docs/mall-center/在线销售服务器硬件小程序开发V1.0.md — 基础需求（实物商品）
- docs/mall-center/在线销售服务器硬件小程序开发V1.1.md — 修订需求（新增虚拟商品类型）

**当前状态：**
- v1.0 MVP 已完成 (2026-05-08)
- v1.2 已完成 (2026-05-08) — 退款+营销+订单增强+扩展功能
- v2.0 规划中

## Constraints

- **技术栈**: Spring Boot 3.x + Spring Cloud Alibaba + MyBatis Plus — 必须复用平台技术栈
- **微信支付**: JSAPI支付，配置待后期联调 — 一期先完成业务逻辑，支付联调后续
- **多租户**: 表结构支持 `tenant_id`，商户运营层面多租户 — v1.2 已实现
- **前端载体**: 微信小程序（主）+ 管理后台Web（独立项目） — 小程序和管理后台分开开发

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 服务名 mall-center，端口7010 | 与现有服务命名规范一致 | ✓ |
| 数据库名 cp_mall | 与平台数据库命名规范一致 | ✓ |
| 虚拟商品订单支付后自动完成，无需发货 | 虚拟商品无需物流，提升交付效率 | ✓ |
| 混合购物车不支持实物+虚拟同时结算 | 避免订单类型歧义，简化业务流程 | ✓ |
| 库存扣减：下单预占+支付成功真实扣减 | Redis原子操作防超卖，订单超时回滚 | ✓ |
| 管理后台独立前端项目 | 复用现有 zlt-web 或新建 Vue3 项目 | ✓ |
| 微信支付配置 | 一期暂不配置，待后期联调再配置真实商户参数 | ⚠️ Deferred |
| 使用 Spring Data Redis scripting 替代 Redisson evalReadOnly | Redisson API 不存在但效果相同 | ✓ |
| 商户审批后自动生成 `MERCHANT_{id}` 作为 tenantId | 运营层面多租户隔离 | ✓ |
| 优惠券与促销活动互斥，同一订单只能使用一种 | 避免利润侵蚀，简化业务逻辑 | ✓ |

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
*Last updated: 2026-05-09 after v2.0 milestone started*
