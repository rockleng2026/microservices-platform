# Phase 10 UAT — 管理后台核心模块

**Phase:** 10-管理后台核心模块
**Date:** 2026-05-09
**Plans:** 10-ADMIN-01~04, 10-ADMIN-10
**Status:** Ready for execution

---

## Module 1: 商品管理 (ADMIN-02)

### ADMIN-02-01 新建商品

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击「新建商品」按钮 | Modal 打开，标题显示"新建商品" |
| 2 | 填写名称、副标题、选择分类、输入价格 | 表单字段正常显示 |
| 3 | 选择商品类型为"实物商品" | 显示总库存字段，隐藏虚拟商品URL字段 |
| 4 | 选择商品类型为"虚拟商品" | 显示虚拟商品URL字段，隐藏总库存字段 |
| 5 | 上传5张商品图片 | 显示5张缩略图，支持拖拽排序 |
| 6 | 上传第6张图片 | 提示"最多上传5张图片"或禁用上传 |
| 7 | 添加SKU规格组合 | SKU列表显示规格、价格、库存 |
| 8 | 点击「保存」 | POST请求发出，Modal关闭，列表刷新，新商品出现在列表 |

**Acceptance:** 新建商品提交后，商品出现在商品列表中，状态为"下架"

### ADMIN-02-02 编辑商品

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击商品列表「编辑」按钮 | Modal 打开，数据填充到表单 |
| 2 | 修改商品名称/价格 | 字段值更新 |
| 3 | 点击「保存」 | PUT请求发出，Modal关闭，列表刷新，修改生效 |

**Acceptance:** 编辑保存后，列表中该商品信息已更新

### ADMIN-02-03 删除商品

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击商品列表「删除」按钮 | 弹出确认框"确定要删除该商品吗？删除后无法恢复。" |
| 2 | 点击「确定」 | DELETE请求发出，列表刷新，商品从列表消失 |

**Acceptance:** 删除后商品不在列表中出现（软删除）

### ADMIN-02-04 商品列表搜索/筛选

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 输入关键词搜索 | 列表按商品名筛选 |
| 2 | 选择分类下拉 | 列表按分类筛选 |
| 3 | 选择状态下拉（上架/下架） | 列表按状态筛选 |
| 4 | 点击分页数字 | 列表翻页，数字分页样式为 1 2 3 ... 10 |

**Acceptance:** 搜索/筛选条件可组合使用，分页正常

### ADMIN-02-05 批量上架

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 勾选2个商品 | 工具栏「批量上架」按钮启用 |
| 2 | 点击「批量上架」 | 弹出确认框"确定要上架 N 个商品吗？" |
| 3 | 点击「确定」 | PUT /batch/status 请求发出，列表刷新，选中商品状态变为"上架" |

**Acceptance:** 批量上架后，选中商品 status=1，可在列表中确认

### ADMIN-02-06 批量下架

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 勾选2个已上架商品 | 工具栏「批量下架」按钮启用 |
| 2 | 点击「批量下架」 | 弹出确认框 |
| 3 | 点击「确定」 | PUT /batch/status {status:0} 请求发出，列表刷新，状态变为"下架" |

**Acceptance:** 批量下架后，选中商品 status=0

### ADMIN-02-07 分类管理

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 进入分类管理页面 | 显示分类列表（支持树形结构） |
| 2 | 点击「新建分类」 | 新增一行分类编辑输入框 |
| 3 | 输入分类名称，选择父分类 | 保存后显示在列表中 |
| 4 | 拖拽分类行进行排序 | 拖拽后调用 PUT /sort 接口，顺序保存 |
| 5 | 点击「编辑」修改分类 | 表单填充，可修改名称和父分类 |
| 6 | 点击「删除」删除分类 | 确认后 DELETE 请求发出 |

**Acceptance:** 分类支持CRUD和拖拽排序

### ADMIN-02-08 商品图片上传

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 在商品编辑Modal中上传图片 | 调用 file-center 接口，显示上传进度 |
| 2 | 上传成功 | 显示缩略图，显示删除按钮 |
| 3 | 拖拽图片改变顺序 | 顺序变更，保存后以新顺序提交 |

**Acceptance:** 最多5张图片，拖拽排序生效

### ADMIN-02-09 SKU规格管理

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 在商品编辑Modal中选择规格模板 | SKU列表生成对应规格组合行 |
| 2 | 编辑SKU行价格/库存 | InputNumber 可编辑 |
| 3 | 删除某个SKU行 | 行从列表移除 |
| 4 | 保存商品 | skus 数组随商品表单提交 |

**Acceptance:** 规格与商品同表单，一个弹窗完成所有编辑

### ADMIN-02-10 商品详情页

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击商品列表「查看详情」或行 | 跳转到 /goods/detail/:id |
| 2 | 查看商品详情页 | 显示名称、价格、图片轮播、详情、SKU列表 |
| 3 | 点击「编辑」按钮 | 打开 GoodsModal 填充数据 |
| 4 | 点击「上架」/「下架」按钮 | 调用 PUT /{id}/status/{status} |
| 5 | 点击「返回」 | 返回商品列表页 |

**Acceptance:** 详情页显示完整商品信息和SKU，状态切换正常

---

## Module 2: 订单管理 (ADMIN-03)

### ADMIN-03-01 订单列表筛选

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 进入订单管理页面 | 显示订单列表，当前Tab为"全部" |
| 2 | 点击"待付款"Tab | 列表只显示 status=1 的订单 |
| 3 | 点击"已付款"Tab | 列表只显示 status=2 的订单 |
| 4 | 输入订单号搜索 | 列表按订单号筛选 |
| 5 | 选择日期范围 | 列表按日期筛选 |

**Acceptance:** 5个状态Tab + 订单号/日期组合筛选正常

### ADMIN-03-02 订单详情查看

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击订单列表「查看详情」 | 跳转到 /orders/detail/:id |
| 2 | 查看订单详情页 | 显示订单号、状态、商品列表、金额、地址（实物）、物流（已发货） |
| 3 | 查看状态时间线 | 显示各状态时间点 |

**Acceptance:** 详情页显示订单完整信息，包括商品/金额/地址/物流

### ADMIN-03-03 订单改价

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 在订单详情页点击「改价」按钮 | 显示改价输入框 |
| 2 | 输入小于当前金额的新金额 | 显示调价金额 |
| 3 | 输入大于当前金额的新金额 | 提示"改价只能是减少金额" |
| 4 | 输入负数 | 提示金额必须大于等于0 |
| 5 | 输入正确金额，点击确认 | POST /adjust-amount 发出，后端返回成功 |
| 6 | 刷新页面 | 金额已更新 |

**Acceptance:** 改价仅限减价，后端接受负数adjustAmount；D-09成本价校验无法实现（无costPrice字段）

### ADMIN-03-04 订单备注

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 在订单详情页点击「备注」按钮 | 显示备注输入框 |
| 2 | 输入备注内容，点击确认 | POST /admin-remark 发出 |
| 3 | 刷新页面 | 备注内容显示在订单详情中 |

**Acceptance:** 备注提交后保存并显示

### ADMIN-03-05 关闭订单

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 在订单详情页点击「关单」按钮（status=1,2显示） | 弹出关单Modal |
| 2 | 选择关闭原因 | 下拉选择关闭原因 |
| 3 | 点击确认 | POST /close 发出 |
| 4 | 刷新页面 | 订单状态变为"已取消" |

**Acceptance:** 关单成功，状态变为5=已取消

### ADMIN-03-06 订单状态流程

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 查看订单详情页 | statusDesc 显示当前状态 |
| 2 | 查看时间线 | 各状态对应时间显示 |

**Acceptance:** 状态描述和时间线正确显示

### ADMIN-03-07 虚拟商品自动完成

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 查看虚拟商品订单（goodsType=2）详情页 | 订单状态已为"已完成" |
| 2 | 查看说明文字 | 显示"虚拟商品订单在支付成功后自动完成" |

**Acceptance:** 虚拟商品订单由后端自动完成（无需前端操作）

---

## Module 3: 优惠券管理 (ADMIN-04)

### ADMIN-04-01 创建优惠券

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击「创建优惠券」 | 跳转到 /coupons/create |
| 2 | 填写优惠券名称、类型为"满减券" | faceValue 字段显示 |
| 3 | 填写类型为"折扣券" | discountRate 和 maxDiscount 字段显示 |
| 4 | 选择有效类型为"固定时间" | 显示开始/结束时间选择器 |
| 5 | 选择有效类型为"领券后N天" | 显示有效天数输入框 |
| 6 | 点击「保存」 | POST /template 发出 |
| 7 | 跳转回列表页 | 新优惠券出现在列表 |

**Acceptance:** 创建成功，优惠券出现在列表

### ADMIN-04-02 编辑优惠券

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击优惠券列表「编辑」 | 跳转到 /coupons/edit/:id |
| 2 | 修改名称/面值的值 | 表单数据填充 |
| 3 | 点击「保存」 | PUT /template/{id} 发出 |

**Acceptance:** 编辑后信息更新

### ADMIN-04-03 删除优惠券

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击「删除」按钮 | 弹出确认框（需后端支持DELETE接口） |

**Acceptance:** 删除功能需后端确认DELETE接口存在

### ADMIN-04-04 优惠券列表

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 进入优惠券管理页面 | 显示优惠券列表 |
| 2 | 点击"发放中"Tab | 仅显示 status=1 的优惠券 |
| 3 | 点击"已下架"Tab | 仅显示 status=0 的优惠券 |
| 4 | 点击"已过期"Tab | 仅显示 status=2 的优惠券 |

**Acceptance:** 状态Tab筛选正常，后端无分页（返回全量）

### ADMIN-04-05 手动发放优惠券给用户（BLOCKED）

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击「发放」按钮 | 弹出IssueModal，显示"后端API暂未实现" |
| 2 | 填写userId/phone | 按钮disabled，hover提示功能待开发 |

**Acceptance:** UI骨架存在，功能标记为BLOCKED；需后端提供 `/issue` 接口后完善

### ADMIN-04-06 优惠券统计（BLOCKED）

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击「统计」按钮 | 弹出StatisticsModal，显示"后端API暂未实现" |
| 2 | 查看统计数据 | 显示 "-" 占位符 |

**Acceptance:** UI骨架存在，功能标记为BLOCKED；需后端提供统计接口后完善

### ADMIN-04-07 提前失效

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击优惠券列表「提前失效」按钮（仅status=1显示） | 弹出确认框 |
| 2 | 点击确认 | POST /template/{id}/offline |
| 3 | 刷新列表 | 优惠券状态变为"已下架" |

**Acceptance:** 提前失效成功，优惠券下架

---

## Module 4: 轮播图管理 (ADMIN-10)

### ADMIN-10-01 新建Banner

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击「添加Banner」（<5张时可用） | 弹出BannerModal |
| 2 | 填写标题、上传图片 | 图片显示预览 |
| 3 | 选择链接类型为"商品详情"，输入商品ID | 保存时goodsId字段填充 |
| 4 | 选择链接类型为"外部链接"，输入URL | 保存时externalUrl字段填充 |
| 5 | 点击「保存」 | POST /banner 发出 |
| 6 | 刷新列表 | 新Banner出现在列表 |

**Acceptance:** Banner创建成功

### ADMIN-10-02 编辑Banner

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击Banner列表「编辑」 | 弹出Modal，数据填充 |
| 2 | 修改标题/图片/链接 | 点击保存，PUT /banner 发出 |

**Acceptance:** 编辑后Banner信息更新

### ADMIN-10-03 删除Banner

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 点击Banner「删除」 | 弹出确认框 |
| 2 | 点击确认 | DELETE /{id} 发出 |
| 3 | 刷新列表 | Banner从列表移除 |

**Acceptance:** 删除后Banner不在列表中出现

### ADMIN-10-04 Banner列表（拖拽排序）

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 进入轮播图管理页面 | 显示Banner列表（非ProTable，使用拖拽列表） |
| 2 | 拖拽Banner行改变顺序 | 拖拽结束后依次调用 PUT /{id}/sort/{sort} |
| 3 | 刷新页面 | Banner顺序按新的sort值排列 |

**Acceptance:** 拖拽排序后顺序保存

### ADMIN-10-05 启用/禁用Banner

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 找到Banner行，查看Switch | status=1时Switch为ON |
| 2 | 点击Switch关闭 | PUT /banner 发出，status=0 |
| 3 | 刷新页面 | 该Banner为禁用状态 |

**Acceptance:** Switch切换更新Banner状态

### D-13 最多5张Banner限制

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | 已添加5张Banner | 页面显示"当前 5/5 个Banner" |
| 2 | 点击「添加Banner」 | 按钮disabled，提示"最多添加5张Banner" |
| 3 | 删除1张Banner | 按钮恢复可用 |

**Acceptance:** 达到5张后无法继续添加

---

## Cross-Module: 全局交互

| Scenario | Test | Expected |
|----------|------|----------|
| 批量操作 | 勾选商品后点击批量操作按钮 | Modal.confirm显示选中数量 |
| 空状态 | 商品/订单/优惠券列表无数据 | 显示"暂无XX" |
| 错误处理 | API请求失败 | 显示错误提示，列表不更新 |
| 成功提示 | 增删改操作成功 | message.success toast，3秒消失 |

---

## BLOCKED Items (Known & Expected)

| Item | Reason | Precondition |
|------|--------|-------------|
| ADMIN-04-05 发放优惠券给用户 | 后端无 POST /coupon/template/{id}/issue 接口 | 需后端实现发放接口 |
| ADMIN-04-06 优惠券统计 | 后端无统计聚合接口 | 需后端实现统计接口 |
| D-11 生成领取链接 | 后端无限时claim code接口 | 需后端实现链接生成接口 |
| ADMIN-03-03 成本价校验 | OrderDetailDTO无costPrice字段 | 需后端将costPrice加入DTO |
| ADMIN-03-01 订单列表API | AdminOrderController GET /list 有TODO | 需后端确认list接口完整实现 |

---

*UAT prepared: 2026-05-09 based on 10-CONTEXT.md, 10-RESEARCH.md, and plan files*
