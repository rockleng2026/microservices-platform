# Mall-Center 项目执行指南

## 项目概述

Mall-Center 是在 central-platform v6.0.0 微服务平台基础上构建的在线商城系统，支持实物商品（IT硬件）和虚拟商品（文档/软件）混合销售。

## 技术栈

- **框架**: Spring Boot 3.1.6 + Spring Cloud 2022.0.4 + Spring Cloud Alibaba 2022.0.0.0
- **ORM**: MyBatis Plus 3.5.4.1 + Druid
- **缓存**: Redis (Redisson 3.25.0)
- **注册/配置**: Nacos
- **服务**: mall-center (端口 7010)
- **数据库**: cp_mall

## 开发规范

### 模块创建
```
zlt-business/mall-center/
├── MallCenterApplication.java
├── config/
├── controller/
├── mapper/
├── model/ (entity, dto, vo)
├── service/ (impl/)
└── utils/
```

### 表命名
- `mall_category` - 商品分类
- `mall_goods` - 商品（含 goods_type: 1实物 2虚拟）
- `mall_goods_spec` - 规格定义
- `mall_goods_sku` - SKU
- `mall_cart` - 购物车
- `mall_order` - 订单
- `mall_order_item` - 订单明细
- `mall_delivery` - 物流
- `mall_user_address` - 收货地址
- `mall_evaluate` - 评价

### 必须字段
所有业务表必须包含: `id`, `tenant_id`, `create_time`, `update_time`

## 关键设计

### 库存扣减
```
下单 → Redis DECRBY 预占库存
支付成功 → 数据库真实扣减
超时取消 → Redis INCRBY 释放库存
```

### 微信支付
```
统一下单 → 获取 prepay_id → 小程序 requestPayment → 回调通知
```

### 虚拟商品
- 支付成功后自动完成订单
- 生成 mall_resource_delivery 交付记录

## 快速命令

```bash
# 规划 Phase 1
/gsd-plan-phase 1

# 讨论 Phase 1
/gsd-discuss-phase 1

# 查看进度
/gsd-progress

# Phase 完成后归档
/gsd-complete-milestone
```

## 文档位置

- `.planning/PROJECT.md` - 项目定义
- `.planning/ROADMAP.md` - 路线图
- `.planning/REQUIREMENTS.md` - 需求清单
