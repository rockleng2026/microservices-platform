---
phase: 15-管理后台前端UAT测试
plan: 05
subsystem: stock-management
tags: [frontend, ui-enhancement]
key-files:
  - zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx
---

# Phase 15 Plan 05: 库存列表添加商品名称列

在库存管理页面添加 goodsName（商品名称）列，让用户能识别 SKU 属于哪个商品。

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | ff1b7c3b6 | 添加goodsName列到库存列表，支持按商品名称搜索 |

## Decisions Made

- 在 goodsId 列后添加 goodsName 列（顺序符合用户认知：先商品ID，再商品名称，再SKU编码）
- 宽度设置为 200px，确保商品名称足够展示
- 启用搜索功能（search: true），方便用户按商品名称筛选
- 当 goodsName 为 undefined 时显示 "-" 替代空值

## Deviations
None

## Threat Flags
None

## Self-Check
PASSED