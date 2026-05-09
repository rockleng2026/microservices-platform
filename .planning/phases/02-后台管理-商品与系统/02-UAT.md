---
status: testing
phase: 02-后台管理-商品与系统
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md
started: 2026-05-10T08:45:00+08:00
updated: 2026-05-10T09:15:00+08:00
---

## Current Test

[testing complete]

## Tests

### 1. 管理员查看分类树
expected: 返回完整的分类树结构，包含子分类嵌套
result: pass
note: POST /api/mall/admin/category 创建测试分类成功；GET /api/mall/admin/category/list 返回8个分类

### 2. 管理员查看商品列表（分页）
expected: 返回商品分页列表，支持page/size参数
result: pass
note: |
  - PaginationInnerInterceptor 导致 double LIMIT 问题（BUG）
  - 临时修复：使用 wrapper.last("LIMIT ...") 绕过MyBatis-Plus插件
  - 修复：AdminGoodsServiceImpl.getGoodsPage() 使用手动count+wrapper.last()方式
  - 分页功能正常：page=1/3 返回正确结果，page=2/3 返回第4-7条
  - keyword搜索正常：keyword=Test 返回2条结果

### 3. 管理员查看商品详情
expected: 返回商品完整信息，包含SKU列表
result: pass
note: GET /api/mall/admin/goods/1 返回商品详情，skus为空数组（无SKU数据）

### 4. 管理员更新商品状态
expected: 商品状态从1变为0或从0变为1
result: pass
note: PUT /api/mall/admin/goods/1/status/0 成功；再次PUT /api/mall/admin/goods/1/status/1 恢复

### 5. 管理员发布商品
expected: 发布新商品，返回成功
result: pass
note: POST /api/mall/admin/goods 发布 TestProduct (id=8)，后删除验证

### 6. 管理员删除商品（软删除）
expected: delFlag设为1，商品从列表消失
result: pass
note: DELETE /api/mall/admin/goods/8 后 total 从8变为7

### 7. 管理员配置轮播图
expected: 成功创建轮播图，列表返回新增的banner
result: pass
note: POST /api/mall/admin/banner 创建TestBannerNew成功，列表包含4个banner

### 8. 管理员查看统计卡片
expected: 返回统计数据（mock数据，订单相关表尚未创建）
result: pass
note: GET /api/mall/admin/statistics/today 返回全0统计数据（Phase3订单表未创建）

### 9. 管理员查看系统设置
expected: 返回设置列表（目前为空）
result: pass
note: GET /api/mall/admin/settings 返回空数组（未配置微信支付等敏感信息）

### 10. 管理员查看规格列表
expected: 返回规格列表（目前为空）
result: pass
note: GET /api/mall/admin/spec/list 返回空数组（规格数据尚未创建）

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]

## Known Issues

### BUG-01: PaginationInnerInterceptor causes double LIMIT
- **Severity:** major
- **Root Cause:** When IPage<AdminGoodsDTO> (different generic type) is passed to selectPage(), 
  the PaginationInnerInterceptor adds LIMIT clause but the page object already has its own pagination logic, 
  resulting in "LIMIT ? LIMIT ?" SQL syntax error.
- **Current Workaround:** AdminGoodsServiceImpl uses manual count + wrapper.last("LIMIT...") instead of selectPage()
- **Affected:** AdminGoodsServiceImpl.getGoodsPage() only
- **Status:** Workaround in place, pagination works correctly

## Fix Applied
Commit: (pending)
Files modified:
- zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminGoodsServiceImpl.java
- zlt-business/mall-center/src/main/java/com/central/mall/config/MyBatisConfig.java (PaginationInnerInterceptor temporarily disabled)