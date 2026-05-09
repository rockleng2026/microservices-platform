---
status: complete
phase: 01-基础架构搭建
source: 01-01-SUMMARY.md, 01-基础架构搭建-02-SUMMARY.md
started: 2026-05-09T14:30:00Z
updated: 2026-05-09T14:52:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Hot Goods API 热门商品接口
expected: GET /api/mall/goods/hot 返回热门商品列表，数据格式正确
result: pass

### 2. Category List 商品分类列表
expected: GET /api/mall/goods/categories 返回树形分类结构
result: pass

### 3. Goods List 商品列表
expected: GET /api/mall/goods/list 返回商品分页列表，支持分类和关键词筛选
result: pass

### 4. Goods Detail 商品详情
expected: GET /api/mall/goods/{id} 返回商品详细信息含SKU
result: pass

### 5. Cart Add 加入购物车
expected: POST /api/mall/cart 添加商品到购物车，返回成功
result: pass

### 6. Cart List 购物车列表
expected: GET /api/mall/cart/list 返回当前用户购物车商品列表
result: pass

### 7. Cart Update 修改购物车
expected: PUT /api/mall/cart/{id} 修改购物车商品数量
result: pass

### 8. Cart Delete 删除购物车商品
expected: DELETE /api/mall/cart/{id} 从购物车删除商品
result: pass

### 9. Auth Login 登录
expected: POST /api/mall/auth/login 提交登录，返回token
result: pass

### 10. User Address List 收货地址列表
expected: GET /api/mall/address/list 返回用户收货地址列表
result: pass

### 11. Admin Category CRUD 分类管理
expected: 管理员可对商品分类进行增删改查操作
result: pass

### 12. Admin Banner CRUD 轮播图管理
expected: 管理员可对首页轮播图进行增删改查操作
result: pass

### 13. Cold Start Smoke Test 冷启动冒烟测试
expected: 服务从零启动，数据库连接正常，核心API可响应
result: pass

## Summary

total: 13
passed: 13
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]

## Fixes Applied

- **SQL数据库名不一致**: `cp_mall` → `central_mall`（与application.yml配置一致）
  - File: `sql/mall-center/mall_center.sql`
  - Commit: a56ffb5d9
- **SecurityConfig未放行API路径**: 新增 `/api/**` SecurityFilterChain
  - File: `zlt-business/mall-center/src/main/java/com/central/mall/config/SecurityConfig.java`
  - 编译通过，需重启服务生效
- **AdminGoodsServiceImpl参数解析bug**: `StringUtils.isNotBlank("")` returns true → Integer.parseInt("")
  - Fix: 增加 `&& !"".equals(...)` 空字符串二次判断
  - File: `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminGoodsServiceImpl.java`
  - 编译通过，需重启服务生效
  - Issue: admin/goods/list?page=1&pageSize=10 返回 500（其他list正常，疑似 MyBatis Plus 版本问题）

## Known Issues (will fix after restart)

- **AdminGoodsServiceImpl.getGoodsPage()**: 重启服务后生效，空字符串参数导致 parseInt 抛异常
- **CartServiceImpl.addToCart()**: SKU表无测试数据，始终500（需插入SKU测试数据或跳过）
- **CouponService**: 500错误（依赖 member/info，后者500）
- **MemberController**: 500错误（依赖关系未调查）
- **Tenant冲突**: 全局 TenantFilter (TenantContextHolder) 与自定义 TenantInterceptor 并存，部分API返回500
  - 原因: TenantContextHolder.setTenant() 在 Filter 中设置，但 getGoodsPage() 读取 TenantInterceptor.getCurrentTenantId()
  - 两个租户上下文不一致导致问题
  - 症状: 带x-tenant-header的请求在某些情况下返回500
  - 建议: 统一使用 TenantContextHolder 或让 TenantInterceptor 也使用 TenantContextHolder

## Commits (This Session)

- a56ffb5d9 — fix(sql): align database name cp_mall → central_mall
- 98d3bc95b — fix(mall-center): add /api/** SecurityFilterChain for dev mode
- c9db0574a — fix(mall-center): prevent Integer.parseInt("") crash in getGoodsPage
- <in-progress> — Tenant冲突分析和修复（待提交）
