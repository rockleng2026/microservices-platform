---
phase: 15-管理后台前端UAT测试
plan: 04
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java
autonomous: true
gap_closure: true
requirements:
  - ADMIN-05
---

<objective>
Fix backend stock search to support skuCode keyword and prevent SQL injection (Gap 1).

Purpose: The keyword search currently only searches goodsName/sub_title but comment claims it should also search skuCode. Also, the current implementation has SQL injection vulnerability.

Output: Keyword search finds matches in name, sub_title, AND skuCode using parameterized queries.
</objective>

<context>
@zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java (lines 56-62 - the buggy code)

Current buggy code (lines 56-62):
```java
// Filter by keyword (goodsName or skuCode)
if (params.get("keyword") != null && StringUtils.isNotBlank(params.get("keyword").toString())) {
    String keyword = params.get("keyword").toString();
    // Need to join with MallGoods for goodsName - use sub-query
    wrapper.inSql(MallGoodsSku::getGoodsId,
        "SELECT id FROM mall_goods WHERE tenant_id = '" + tenantId + "' AND del_flag = 0 AND (name LIKE '%" + keyword + "%' OR sub_title LIKE '%" + keyword + "%')");
}
```

Issues:
1. Comment says "goodsName or skuCode" but only searches goods name/sub_title (no skuCode)
2. SQL injection vulnerability - keyword is directly concatenated without parameterization
3. Uses inSql subquery which is inefficient

Fixed approach:
- Use OR condition to search both goods.name AND MallGoodsSku.skuCode
- Use parameterized query (? placeholder) to prevent SQL injection
- Use leftJoin instead of inSql for cleaner SQL and better performance
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix keyword search to support skuCode and prevent SQL injection</name>
  <files>zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java</files>
  <read_first>
    - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java (full file to understand structure)
  </read_first>
  <action>
    Replace the buggy keyword search code (lines 56-62) with the fixed version below.

The fixed code uses a LEFT JOIN to search BOTH goods.name AND skuCode with parameterized query:

```java
// Filter by keyword (goodsName, sub_title, or skuCode)
if (params.get("keyword") != null && StringUtils.isNotBlank(params.get("keyword").toString())) {
    String keyword = params.get("keyword").toString();
    // Use left join to search goods.name, goods.sub_title, AND sku.skuCode
    // Using apply() with parameterized query to prevent SQL injection
    wrapper.and(w => w
        .like(MallGoods::getName, keyword)
        .or()
        .like(MallGoods::getSubTitle, keyword)
        .or()
        .like(MallGoodsSku::getSkuCode, keyword)
    );
}
```

Or alternatively with explicit LEFT JOIN:

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

Also update the comment to accurately reflect what is being searched:
From: `// Filter by keyword (goodsName or skuCode)`
To: `// Filter by keyword (goodsName, sub_title, or skuCode)`
</action>
  <verify>
    <automated>grep -c "skuCode.*keyword" zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java</automated>
    <automated>grep -c "like.*MallGoodsSku" zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java</automated>
    <automated>grep -c "'"'"'" zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java || echo "No SQL concat found"</automated>
  </verify>
  <done>
    Keyword search now searches goodsName, sub_title, AND skuCode using parameterized queries. No SQL injection vulnerability.
  </done>
</task>

</tasks>

<must_haves>
  truths:
    - "搜索 keyword 时能匹配 skuCode（不只是 name/sub_title）"
    - "搜索使用参数化查询，无 SQL 注入风险"
  artifacts:
    - path: "zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java"
      provides: "Stock search with keyword support for name, sub_title, AND skuCode"
      contains: "like(MallGoodsSku::getSkuCode, keyword)"
  key_links:
    - from: "AdminStockController.getSkuStockPage"
      to: "AdminStockServiceImpl.getSkuStockPage"
      via: "params keyword passed to service"
</must_haves>

<verification>
1. Search with keyword "SKU001" matches skuCode containing "SKU001"
2. Search with keyword matches goodsName (existing behavior)
3. Search with keyword matches sub_title (existing behavior)
4. No SQL injection possible - keyword uses parameterized query
</verification>

<success_criteria>
- Search keyword="test" matches skuCode="TEST-001" (case insensitive via LOWER)
- No SQL injection via keyword parameter
- Backend compiles without errors
</success_criteria>

<output>
After completion, create `.planning/phases/15-管理后台前端UAT测试/15-ADMIN-UAT-04-SUMMARY.md`
</output>