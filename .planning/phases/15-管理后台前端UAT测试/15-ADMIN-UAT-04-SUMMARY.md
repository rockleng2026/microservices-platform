---
phase: 15-管理后台前端UAT测试
plan: 04
subsystem: stock-management
tags: [backend, bug-fix, sql-injection]
key-files:
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java
---

# Phase 15 Plan 04: 修复后端库存搜索 Bug + SQL 注入漏洞 Summary

## Objective
修复 AdminStockServiceImpl.java 的 keyword 搜索，支持 skuCode 字段，并修复 SQL 注入漏洞。

## One-liner
库存搜索通过 leftJoin + like 参数化查询消除 SQL 注入风险，并新增 skuCode 字段搜索支持。

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | b47d15626 | 修复keyword搜索支持skuCode，使用leftJoin+参数化查询 |

## Changes Made

### AdminStockServiceImpl.java

**Before (SQL injection vulnerability):**
```java
wrapper.inSql(MallGoodsSku::getGoodsId,
    "SELECT id FROM mall_goods WHERE tenant_id = '" + tenantId + "' AND del_flag = 0 AND (name LIKE '%" + keyword + "%' OR sub_title LIKE '%" + keyword + "%')");
```

**After (parameterized, no SQL injection):**
```java
wrapper.leftJoin(MallGoods.class, MallGoods::getId, MallGoodsSku::getGoodsId);
wrapper.and(w -> w
    .like(MallGoods::getName, keyword)
    .or()
    .like(MallGoods::getSubTitle, keyword)
    .or()
    .like(MallGoodsSku::getSkuCode, keyword)
);
```

## Security Fix
- **Issue:** Original code used string concatenation for SQL query, vulnerable to SQL injection
- **Fix:** Replaced with MyBatis-Plus `leftJoin()` + `like()` API which uses parameterized queries
- **Impact:** All user-supplied `keyword` values are now properly escaped

## New Feature
- Added `skuCode` field to keyword search scope (alongside existing `goodsName` and `subTitle`)

## Deviations
None

## Self-Check
PASSED

**Verification:**
- [x] File modified: `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java`
- [x] Commit exists: `b47d15626`
- [x] MallGoods import already present (line 13: `import com.central.mall.model.entity.MallGoods;`)
- [x] SQL injection vulnerability fixed (parameterized queries)
- [x] skuCode search support added