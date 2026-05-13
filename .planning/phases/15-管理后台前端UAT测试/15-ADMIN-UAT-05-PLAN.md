---
phase: 15-管理后台前端UAT测试
plan: 05
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx
autonomous: true
gap_closure: true
requirements:
  - ADMIN-05
---

<objective>
Add goodsName column to stock list table and enable goods name search (Gap 2).

Purpose: Currently the stock list shows goodsId but not goodsName, making it impossible to identify which product a SKU belongs to without looking up the goodsId separately.

Output: Stock table displays goodsName column with search support.
</objective>

<context>
@zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx

Current columns definition (lines 101-179). Key issue:
- Columns show id, goodsId, skuCode, specs, price, stock, status
- NO goodsName column - user cannot identify product from SKU alone
- Backend already returns goodsName in SkuStockDTO (via goodsNameMap)

SkuStockDTO interface already has:
```typescript
interface SkuStockDTO {
  id: number;
  goodsId: number;
  goodsName?: string;  // Already defined!
  skuCode: string;
  ...
}
```

Backend code (AdminStockServiceImpl) already fetches goodsName and adds it to DTO.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add goodsName column to stock table</name>
  <files>zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx</files>
  <read_first>
    - zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx (lines 100-180 for columns definition)
  </read_first>
  <action>
    Add goodsName column to the columns definition in Stock/index.tsx.

Find the columns array (around line 101) and add a goodsName column AFTER the goodsId column:

```typescript
{
  title: '商品名称',
  dataIndex: 'goodsName',
  key: 'goodsName',
  width: 200,
  align: 'center',
  search: true,
  render: (goodsName: string | undefined) => goodsName || '-',
},
```

The goodsName column should:
- Be placed after goodsId column (line ~117)
- Have search: true so users can filter by goods name
- Use render to handle undefined/null gracefully (show '-' if empty)

Also ensure the search handler passes keyword correctly to the backend. The current code already sends keyword parameter, and the backend now supports skuCode search (from Gap 1 fix).
</action>
  <verify>
    <automated>grep -c "goodsName" zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx</automated>
    <automated>grep -c "title.*商品名称" zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx</automated>
    <automated>grep -c "search: true" zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx</automated>
  </verify>
  <done>
    Stock table shows goodsName column. Users can search by goods name.
  </done>
</task>

</tasks>

<must_haves>
  truths:
    - "库存列表显示商品名称（goodsName）列"
    - "可以通过商品名称搜索库存记录"
  artifacts:
    - path: "zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx"
      provides: "Stock list with goodsName column and search"
      contains: "dataIndex: 'goodsName'"
  key_links:
    - from: "Stock/index.tsx columns"
      to: "SkuStockDTO.goodsName"
      via: "dataIndex maps to goodsName field"
</must_haves>

<verification>
1. Stock list table shows "商品名称" column
2. Searching by goods name returns matching stock records
3. Column is searchable (search: true)
</verification>

<success_criteria>
- goodsName column visible in stock table
- goodsName search filters results correctly
- No TypeScript errors for goodsName field
</success_criteria>

<output>
After completion, create `.planning/phases/15-管理后台前端UAT测试/15-ADMIN-UAT-05-SUMMARY.md`
</output>