# Mall-Center 在线商城系统 — 里程碑总结

**版本:** v2.0 (SHIPPED 2026-05-20)
**主分支:** portal
**数据库:** cp_mall (nacos/Leng@123456)

---

## 1. 项目概述

### 是什么

基于 `central-platform v6.0.0` 微服务平台构建的通用在线商城系统，支持**实物商品**（服务器、CPU、NAS等IT硬件）和**虚拟商品**（技术文档、软件授权）混合销售。

**前端载体：**
- 微信小程序（uni-app + Vue 3）— 面向下游企业/个人客户
- 管理后台 Web（React 18 + Umi 4 + Ant Design）— 运营人员

**后端服务：** `mall-center` 微服务（端口 7010），数据库 `cp_mall`

### 核心价值

为IT硬件经销商提供一套完整的B2C在线销售解决方案，一套系统覆盖从商品展示到支付交付的全链路电商能力。

### 里程碑进度

| 里程碑 | 状态 | 日期 | Phases | Plans |
|--------|------|------|--------|-------|
| v1.0 MVP | ✅ SHIPPED | 2026-05-08 | 1-4 | 12 |
| v1.2 | ✅ SHIPPED | 2026-05-08 | 5-7 | 8 |
| v2.0 | ✅ SHIPPED | 2026-05-20 | 8-13 | 34 |

---

## 2. 系统架构

### 技术栈

| 层级 | 技术选型 |
|------|---------|
| 微服务框架 | Spring Boot 3.1.6 + Spring Cloud Alibaba |
| 数据库 | MySQL + Druid + MyBatis Plus 3.5.4.1 |
| 缓存 | Redis (Redisson/Spring Data Redis scripting) |
| 注册/配置中心 | Nacos |
| 认证 | OAuth2 (zlt-uaa) |
| 网关 | zlt-gateway |
| 小程序 | uni-app + Vue 3 + TypeScript |
| 管理后台 | React 18 + Umi 4 + Ant Design 4 + TypeScript |
| 文件中心 | file-center |
| 用户中心 | user-center |

### 数据库用户

```
用户名: nacos
密码: Leng@123456
数据库: cp_mall
```

### 基础设施服务

| 服务 | 端口 | 说明 |
|------|------|------|
| mall-center | 7010 | 商城核心微服务 |
| zlt-gateway | 9000 | API网关 |
| zlt-uaa | 9900 | OAuth2认证服务 |
| user-center | 8000 | 用户中心 |
| file-center | 8002 | 文件中心 |
| nacos | 8848 | 注册/配置中心 |

---

## 3. 里程碑详情

### v1.0 MVP — 2026-05-08

**4 Phases / 12 Plans / 39 Commits**

#### 完成内容

1. **基础架构** — mall-center服务(7010)、数据库8表、商品/购物车/地址CRUD
2. **后台管理** — 商品分类树形管理、轮播图管理、微信支付参数配置、统计卡片
3. **订单支付核心** — 订单创建/流转/管理、微信JSAPI支付、Redis库存预占防超卖
4. **用户侧评价** — 评价模块(评分/评论/图片)、物流轨迹追踪、用户消费统计

#### 关键决策

| 决策 | 结果 |
|------|------|
| 虚拟商品订单支付后自动完成，无需发货 | ✅ 已实现 |
| 混合购物车不支持实物+虚拟同时结算 | ✅ 已实现 |
| 库存扣减：下单预占+支付成功真实扣减 | ✅ 已实现 |
| 微信支付配置一期暂不联调 | ⚠️ 延期 |

#### 已知遗留

- 微信支付联调需真实商户参数

---

### v1.2 — 2026-05-08

**3 Phases / 8 Plans / 23 Commits**

#### 完成内容

1. **修复编译问题** — `Result.succeed()` 泛型修复，项目完整编译
2. **退款模块** — 用户申请→管理员审核→微信退款→库存回增，状态机完整
3. **营销模块** — 优惠券/促销互斥、会员积分体系
4. **订单增强** — 管理员关单（status=3）、改价（仅允许减少）、备注
5. **数据看板** — 销售趋势/库存预警/用户分析
6. **扩展功能** — Redis Lua原子化库存、商户多租户入驻、微信模板消息

#### 关键决策

| 决策 | 结果 |
|------|------|
| 使用 Spring Data Redis scripting 替代 Redisson | ✅ 已实现 |
| 商户审批后自动生成 `MERCHANT_{id}` 作为 tenantId | ✅ 已实现 |
| 优惠券与促销活动互斥 | ✅ 已实现 |
| ADVANCED-01 (Elasticsearch) 放弃 | ❌ 移除 — 增加复杂度 |

#### 技术债务

- `OrderServiceImpl.java` line 45 存在 TODO（zlt-uaa 集成，pre-existing）

---

### v2.0 — 2026-05-20 (最新)

**6 Phases / 34 Plans / ~134 Requirements**

#### Phase 8: Admin基础框架 + 小程序首页/商品 ✅

| 模块 | 需求 | 完成 |
|------|------|------|
| ADMIN-01 Dashboard | ADMIN-01-01~05 | ✅ |
| MINI-01 首页 | MINI-01-01~07 | ✅ |
| MINI-02 商品列表 | MINI-02-01~05 | ✅ |
| MINI-03 商品详情 | MINI-03-01~09 | ✅ |

#### Phase 9: 小程序交易流程 ✅

| 模块 | 需求 | 完成 |
|------|------|------|
| MINI-04 购物车 | MINI-04-01~07 | ✅ |
| MINI-05 订单确认 | MINI-05-01~09 | ✅ |
| MINI-06 订单列表 | MINI-06-01~05 | ✅ |
| MINI-07 订单详情 | MINI-07-01~05 | ✅ |
| MINI-08 退款申请 | MINI-08-01~06 | ✅ |
| MINI-10 微信支付 | MINI-10-01~05 | ✅ |

#### Phase 10: 管理后台核心模块 ✅

| 模块 | 需求 | 完成 |
|------|------|------|
| ADMIN-02 商品管理 | ADMIN-02-01~10 | ✅ |
| ADMIN-03 订单管理 | ADMIN-03-01~07 | ✅ |
| ADMIN-04 优惠券管理 | ADMIN-04-01~07 | ✅ |
| ADMIN-10 Banner管理 | ADMIN-10-01~05 | ✅ |

#### Phase 11: 管理后台运营模块 ✅

| 模块 | 需求 | 完成 |
|------|------|------|
| ADMIN-06 退款审核 | ADMIN-06-01~06 | ✅ |
| ADMIN-07 物流管理 | ADMIN-07-01~06 | ✅ |
| ADMIN-08 用户管理 | ADMIN-08-01~04 | ✅ |
| ADMIN-09 商户管理 | ADMIN-09-01~05 | ✅ |

#### Phase 12: 管理后台配置与小程序个人中心 ✅

| 模块 | 需求 | 完成 |
|------|------|------|
| ADMIN-05 促销管理 | ADMIN-05-01~06 | ✅ |
| ADMIN-11 微信配置 | ADMIN-11-01~03 | ✅ |
| MINI-09 个人中心 | MINI-09-01~07 | ✅ |

#### Phase 13: 集成测试与优化 ✅

- End-to-end 测试完成
- UI/Performance 优化完成
- Bug 修复完成

---

## 4. 需求覆盖

### 已验证需求 (v2.0)

| 需求范围 | 状态 |
|----------|------|
| ADMIN-01~11 (管理后台) | ✅ 全部完成 |
| MINI-01~10 (小程序) | ✅ 全部完成 |
| 总计 134 requirements | ✅ 全部完成 |

### v1.0 + v1.2 需求覆盖

| 需求范围 | 状态 |
|----------|------|
| GOODS-01~08 | ✅ |
| CART-01~06 | ✅ |
| USER-01~05 | ✅ |
| ORDER-01~09 | ✅ |
| PAY-01~04 | ✅ |
| STOCK-01~06 | ✅ |
| EVAL-01~03 | ✅ |
| DELIVERY-01~04 | ✅ |
| COMPILE-01 | ✅ |
| REFUND-01~10 | ✅ |
| MARKETING-01~09 | ✅ |
| ORDER-EXT-01~03 | ✅ |
| STAT-01~03 | ✅ |
| ADVANCED-02~04 | ✅ |

---

## 5. 架构决策记录

| 决策 | 原因 | 结果 |
|------|------|------|
| 服务名 mall-center，端口7010 | 与现有服务命名规范一致 | ✅ |
| 数据库名 cp_mall | 与平台数据库命名规范一致 | ✅ |
| 虚拟商品订单支付后自动完成，无需发货 | 虚拟商品无需物流，提升交付效率 | ✅ |
| 混合购物车不支持实物+虚拟同时结算 | 避免订单类型歧义，简化业务流程 | ✅ |
| 库存扣减：下单预占+支付成功真实扣减 | Redis原子操作防超卖，订单超时回滚 | ✅ |
| 管理后台独立前端项目 | 复用现有 zlt-web 或新建 Vue3 项目 | ✅ |
| 使用 Spring Data Redis scripting 替代 Redisson | Redisson API 不存在但效果相同 | ✅ |
| 商户审批后自动生成 `MERCHANT_{id}` 作为 tenantId | 运营层面多租户隔离 | ✅ |
| 优惠券与促销活动互斥 | 避免利润侵蚀，简化业务逻辑 | ✅ |

### 延期项目

| 项目 | 原因 |
|------|------|
| 微信支付联调 | 需要真实商户参数 |
| 积分兑换商品 | 复杂度高，二期再做 |
| 限时秒杀 | 可复用 Lua 脚本 |
| Elasticsearch搜索 | 增加系统复杂度和部署难度 |

---

## 6. 技术债务

| 项目 | 阶段 | 说明 |
|------|------|------|
| OrderServiceImpl.java line 45 TODO | v1.2 | zlt-uaa 集成，pre-existing |
| 微信支付联调 | v1.0 | 需要真实商户参数 |

---

## 7. 快速上手

### 环境要求

- JDK 17+
- Node.js 18+
- Maven 3.8+
- Redis
- Nacos (已配置 central-platform)

### 启动顺序

```bash
# 1. 启动基础设施 (确保已运行)
- Nacos (8848)
- MySQL (cp_mall 数据库)
- Redis

# 2. 启动后端服务
cd mall-center
mvn spring-boot:run

# 3. 启动管理后台 (可选)
# 独立项目，需另行启动

# 4. 启动小程序 (可选)
# 独立项目，需另行启动
```

### 数据库配置

```yaml
# application.yml 中配置
database:
  host: localhost
  port: 3306
  name: cp_mall
  username: nacos
  password: Leng@123456
```

### 微信支付配置 (待联调)

- 管理后台: 运营 → 微信支付参数配置
- 需要真实商户号和AppID才能生效

---

## 8. 项目文件结构

```
microservices-platform/
├── mall-center/                    # 商城核心微服务 (7010)
│   └── src/main/java/.../mall/
│       ├── controller/             # REST API 控制器
│       ├── service/                # 业务服务层
│       ├── mapper/                # MyBatis Plus Mapper
│       └── model/                 # 实体和DTO
├── mall-admin-web/                 # 管理后台 Web (React + Umi)
├── mall-mini-program/              # 微信小程序 (uni-app + Vue)
└── .planning/                      # 项目规划文档
    ├── ROADMAP.md
    ├── PROJECT.md
    ├── STATE.md
    ├── milestones/                 # 历史里程碑存档
    └── phases/                     # 各阶段详细计划/总结
```

---

*文档生成时间: 2026-05-20*
*最后更新: v2.0 milestone shipped*