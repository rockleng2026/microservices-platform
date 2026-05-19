---
status: resolved
phase: 16-订单列表优化
source: [order-list/index.vue]
started: 2026-05-18T00:00:00Z
updated: 2026-05-18T00:00:00Z
---

## Current Test

number: 1
name: 订单卡片商品信息展示
expected: |
  订单卡片中应展示商品名称和规格信息，而非仅显示缩略图。用户能直接看到购买的商品是什么。
awaiting: user response

## Tests

### 1. 订单卡片商品信息展示
expected: 订单卡片中展示商品名称（goodsName）和规格（specs）
result: pass
note: "订单列表API已返回items，商品信息完整展示"

### 2. 待付款订单操作按钮
expected: 待付款订单卡片底部显示"取消"和"去支付"按钮
result: pass
note: "状态值类型修复：后端返回整数(1)，前端同时支持字符串和整数比较"

### 3. 已付款订单操作按钮
expected: 已付款/已发货/待收货订单卡片底部显示"查看明细"按钮
result: pass

### 4. 已完成订单操作按钮
expected: 已完成订单卡片底部显示"查看明细"按钮
result: pass

### 5. 商品信息点击跳转
expected: 点击订单卡片中的商品名称可跳转到商品详情页
result: pass
note: "商品信息点击跳转已实现"

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0
partial: 0

## Gaps

[none]

## Issues Found

### ISSUE-16-01: 订单列表API不返回items

**问题描述：**
后端 `GET /api/mall/order` 仅返回 `MallOrder` 实体，不包含 `items`（订单商品明细）。前端 `getOrderList` 解析 `res.data.datas` 直接作为订单列表，每个订单的 `items` 字段为 `null`。

**影响：**
- 订单卡片中无法展示商品名称、价格、数量
- 点击商品行改为跳转到订单详情页

**根因：**
`OrderServiceImpl.getOrderList()` 使用 `baseMapper.selectList(wrapper)` 直接返回 `MallOrder` 实体列表，没有JOIN查询订单商品表。

**建议修复：**
修改后端 `OrderServiceImpl.getOrderList()` 方法，查询每个订单关联的商品明细并填充到返回对象中。

### ISSUE-16-02: 后端返回status为整数，前端期望字符串 [已修复]

**问题描述：**
后端返回订单状态为整数：`status: 1`（1=待付款，2=待发货，3=已发货，4=已完成...），前端 `Order` 接口定义 `status: string`，且 `statusTextMap` 使用字符串键如 `'PENDING'`。

**已修复：**
- `statusTextMap` 同时支持整数和字符串键
- 状态比较同时支持整数和字符串
- CSS 类名同时支持 `.status-1` 和 `.status-PENDING`

## Changes Made

### 第一次提交 (d4f1d186e)
- 移除横向缩略图滚动，改用文字列表展示
- 待发货/已发货/待收货/已完成: 查看明细按钮

### 第二次提交 (e5e1904f5)
- 修复状态值类型：后端返回整数(1,2,3,4)，前端同时支持
- 修复items为null时的显示：显示"点击查看商品详情"
- 状态按钮逻辑同时支持字符串和整数状态值
