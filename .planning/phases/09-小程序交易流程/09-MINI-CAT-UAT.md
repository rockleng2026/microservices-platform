---
status: testing
phase: 09-小程序交易流程
source: [category page issue]
started: 2026-05-16T04:20:00Z
updated: 2026-05-16T04:35:00Z
---

## Current Test

number: 4
name: 商品详情页 - 立即购买跳转结算页
expected: |
  点击商品详情页的"立即购买"按钮，应跳转到结算确认页面，商品信息正确显示。
awaiting: user response

## Tests

### 1. 分类页面 - 点击分类Tab显示数据
expected: 点击底部"分类"Tab后，左侧显示分类列表，点击某个分类后，右侧显示该分类的子分类和商品列表。
result: pass
note: "已将 onLoad 改为 onShow，因为 tabBar 页面切换时 onLoad 只在首次加载时触发"

### 2. 商品详情页 - 价格显示
expected: 商品详情页显示商品价格
result: pass
note: "后端返回了 price:8999.00，但前端 displayPrice 计算属性缺失，已添加"

### 3. 商品详情页 - 分类Tab数据刷新
expected: |
  点击底部"分类"Tab后，左侧显示分类列表，点击某个分类后，右侧显示该分类的子分类和商品列表。
result: pass
note: "已修复：tabBar切换使用 onShow 触发数据加载"

### 4. 商品详情页 - 立即购买跳转结算页
expected: 点击商品详情页的"立即购买"按钮，应跳转到结算确认页面，商品信息正确显示。
result: pending
note: "修复了立即购买功能：自动选择唯一SKU，传递goodsId供结算页获取商品详情，结算页增加直接购买时获取商品详情的逻辑"

## Summary

total: 4
passed: 3
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps

- truth: "点击分类Tab后左侧显示分类列表，点击某个分类后右侧显示子分类和商品"
  status: failed
  reason: "User reported: 点击分类，页面没有显示，控制台没有产生报错也没有触发后端请求"
  severity: major
  test: 1
  root_cause: "tabBar页面使用onLoad只触发一次，后续切换tab不会重新加载数据"
  artifacts:
    - path: "mall-mini-program/src/pages/category/index.vue"
      issue: "使用onLoad而不是onShow，导致tabBar切换时数据不刷新"
  missing:
    - "将onLoad改为onShow，添加hasLoaded标志防止重复加载"
  debug_session: ""

- truth: "商品详情页显示商品价格"
  status: failed
  reason: "后端返回数据包含 price:8999.00，但页面价格显示为空"
  severity: major
  test: 2
  root_cause: "displayPrice 计算属性缺失，只有显示库存的 displayStock"
  artifacts:
    - path: "mall-mini-program/src/pages/product-detail/index.vue"
      issue: "模板使用 displayPrice 但未定义计算属性"
  missing:
    - "添加 displayPrice 计算属性：优先选中的SKU价格，否则用商品默认价格"
  debug_session: ""