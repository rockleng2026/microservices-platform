---
status: testing
phase: 10-管理后台核心模块
source: 10-ADMIN-01-SUMMARY.md, 10-ADMIN-02-SUMMARY.md, 10-ADMIN-03-SUMMARY.md, 10-ADMIN-04-SUMMARY.md, 10-ADMIN-10-SUMMARY.md
started: 2026-05-09T18:00:00Z
updated: 2026-05-09T18:00:00Z
---

## Current Test

number: 1
name: ADMIN-02-01 新建商品
expected: |
  点击「新建商品」按钮 → Modal 打开，标题显示"新建商品"
  填写名称、副标题、选择分类、输入价格
  选择商品类型为"实物商品" → 显示总库存字段
  选择商品类型为"虚拟商品" → 显示虚拟商品URL字段
  上传5张商品图片 → 显示5张缩略图
  上传第6张图片 → 提示"最多上传5张图片"
  添加SKU规格组合 → SKU列表显示规格、价格、库存
  点击「保存」 → POST请求发出，Modal关闭，列表刷新，新商品出现在列表
awaiting: user response

## Tests

### 1. ADMIN-02-01 新建商品
expected: 点击新建商品 → Modal打开 → 填写信息 → 上传图片 → 添加SKU → 保存后商品出现在列表
result: [pending]

### 2. ADMIN-02-02 编辑商品
expected: 点击商品列表「编辑」按钮 → Modal打开，数据填充 → 修改名称/价格 → 保存后列表刷新
result: [pending]

### 3. ADMIN-02-03 删除商品
expected: 点击商品列表「删除」按钮 → 弹出确认框 → 确认后DELETE请求发出，商品从列表消失
result: [pending]

### 4. ADMIN-02-04 商品列表搜索/筛选
expected: 输入关键词搜索 → 列表筛选；选择分类下拉 → 列表筛选；选择状态下拉 → 列表筛选；点击分页 → 翻页正常
result: [pending]

### 5. ADMIN-02-05 批量上架
expected: 勾选2个商品 → 工具栏「批量上架」按钮启用 → 点击弹出确认框 → 确认后PUT请求发出，商品状态变为"上架"
result: [pending]

### 6. ADMIN-02-06 批量下架
expected: 勾选2个已上架商品 → 工具栏「批量下架」按钮启用 → 点击弹出确认框 → 确认后PUT请求发出，状态变为"下架"
result: [pending]

### 7. ADMIN-02-07 分类管理
expected: 进入分类管理页面 → 显示分类列表 → 新建分类 → 编辑分类 → 拖拽排序 → 删除分类
result: [pending]

### 8. ADMIN-02-08 商品图片上传
expected: 在商品编辑Modal中上传图片 → 显示缩略图 → 拖拽图片改变顺序 → 保存后顺序保持
result: [pending]

### 9. ADMIN-02-09 SKU规格管理
expected: 在商品编辑Modal中选择规格模板 → SKU列表生成 → 编辑价格/库存 → 保存商品
result: [pending]

### 10. ADMIN-02-10 商品详情页
expected: 点击商品列表「查看详情」 → 跳转到 /goods/detail/:id → 显示名称、价格、图片轮播、详情、SKU列表
result: [pending]

### 11. ADMIN-03-01 订单列表筛选
expected: 进入订单管理页面 → 显示订单列表 → 点击Tab筛选状态 → 输入订单号搜索 → 选择日期范围
result: [pending]

### 12. ADMIN-03-02 订单详情查看
expected: 点击订单列表「查看详情」 → 跳转到 /orders/detail/:id → 显示订单号、状态、商品列表、金额、地址、物流、时间线
result: [pending]

### 13. ADMIN-03-03 订单改价
expected: 在订单详情页点击「改价」 → 显示输入框 → 输入小于当前金额 → 点击确认 → POST /adjust-amount → 刷新后金额已更新
result: [pending]

### 14. ADMIN-03-04 订单备注
expected: 在订单详情页点击「备注」 → 显示输入框 → 输入备注内容 → 点击确认 → POST /admin-remark → 刷新后备注显示
result: [pending]

### 15. ADMIN-03-05 关闭订单
expected: 在订单详情页点击「关单」 → 弹出Modal → 选择关闭原因 → 点击确认 → POST /close → 刷新后状态变为"已取消"
result: [pending]

### 16. ADMIN-03-06 订单状态流程
expected: 查看订单详情页 → statusDesc显示当前状态 → 时间线显示各状态时间点
result: [pending]

### 17. ADMIN-03-07 虚拟商品自动完成
expected: 查看虚拟商品订单（goodsType=2）详情页 → 订单状态已为"已完成" → 显示"虚拟商品订单在支付成功后自动完成"
result: [pending]

### 18. ADMIN-04-01 创建优惠券
expected: 点击「创建优惠券」 → 跳转到 /coupons/create → 填写名称、类型、有效类型 → 点击「保存」 → POST /template → 跳转回列表，新优惠券出现
result: [pending]

### 19. ADMIN-04-02 编辑优惠券
expected: 点击优惠券列表「编辑」 → 跳转到 /coupons/edit/:id → 修改名称/面值 → 点击「保存」 → PUT /template/{id}
result: [pending]

### 20. ADMIN-04-03 删除优惠券
expected: 点击「删除」按钮 → 弹出确认框 → 确认后DELETE请求发出
result: [pending]

### 21. ADMIN-04-04 优惠券列表
expected: 进入优惠券管理页面 → 显示优惠券列表 → 点击Tab（发放中/已下架/已过期） → 列表按status筛选
result: [pending]

### 22. ADMIN-04-05 手动发放优惠券（BLOCKED）
expected: 点击「发放」按钮 → 弹出IssueModal，显示"后端API暂未实现" → 按钮disabled
result: [pending]

### 23. ADMIN-04-06 优惠券统计（BLOCKED）
expected: 点击「统计」按钮 → 弹出StatisticsModal，显示"后端API暂未实现" → 显示"-"占位符
result: [pending]

### 24. ADMIN-04-07 提前失效
expected: 点击优惠券列表「提前失效」按钮（仅status=1显示） → 弹出确认框 → 确认后POST /template/{id}/offline → 刷新后状态变为"已下架"
result: [pending]

### 25. ADMIN-10-01 新建Banner
expected: 点击「添加Banner」（<5张时可用） → 弹出BannerModal → 填写标题、上传图片、选择链接类型 → 点击「保存」 → POST /banner → 新Banner出现在列表
result: [pending]

### 26. ADMIN-10-02 编辑Banner
expected: 点击Banner列表「编辑」 → 弹出Modal，数据填充 → 修改标题/图片/链接 → 点击保存 → PUT /banner
result: [pending]

### 27. ADMIN-10-03 删除Banner
expected: 点击Banner「删除」 → 弹出确认框 → 确认后DELETE /{id} → Banner从列表移除
result: [pending]

### 28. ADMIN-10-04 Banner列表（拖拽排序）
expected: 进入轮播图管理页面 → 显示Banner列表（非ProTable，使用拖拽列表） → 拖拽Banner行改变顺序 → 刷新后顺序按新的sort值排列
result: [pending]

### 29. ADMIN-10-05 启用/禁用Banner
expected: 找到Banner行，查看Switch → status=1时Switch为ON → 点击Switch关闭 → PUT /banner → 刷新后该Banner为禁用状态
result: [pending]

### 30. D-13 最多5张Banner限制
expected: 已添加5张Banner → 页面显示"当前 5/5 个Banner" → 点击「添加Banner」 → 按钮disabled，提示"最多添加5张Banner" → 删除1张后按钮恢复可用
result: [pending]

## Summary

total: 30
passed: 0
issues: 0
pending: 30
skipped: 0
blocked: 0

## Gaps

[none yet]
