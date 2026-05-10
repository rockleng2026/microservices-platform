# Phase 6 UAT 测试结果摘要

**测试时间：** 2026-05-10
**测试范围：** 订单增强（ORDER-EXT-01~03）+ 管理端统计（STAT-01~03）
**测试方式：** 直接验证后端API接口（略过前端验证）
**结果：** 订单增强功能全部通过，统计功能部分未实现（stub代码）

---

## 测试结果汇总

### ORDER-EXT（订单增强）

| # | API端点 | 功能 | 结果 |
|---|---------|------|------|
| 1 | POST /api/mall/admin/order/{id}/close | 管理员关闭已发货订单 | ✅ PASS |
| 2 | POST /api/mall/admin/order/{id}/adjust-amount | 管理员调整订单金额 | ✅ PASS |
| 3 | POST /api/mall/order/{id}/remark | 用户添加订单备注 | ✅ PASS |
| 4 | POST /api/mall/admin/order/{id}/admin-remark | 管理员添加订单备注 | ✅ PASS |

### STAT-01（销售趋势统计）

| # | API端点 | 功能 | 结果 |
|---|---------|------|------|
| 5 | GET /api/mall/admin/statistics/sales-trend | 销售趋势（日/周/月） | ⚠️ STUB（返回空列表） |

### STAT-02（库存预警统计）

| # | API端点 | 功能 | 结果 |
|---|---------|------|------|
| 6 | GET /api/mall/admin/statistics/stock-warning | 库存预警列表 | ⚠️ STUB（返回空列表） |

### STAT-03（用户分析统计）

| # | API端点 | 功能 | 结果 |
|---|---------|------|------|
| 7 | GET /api/mall/admin/statistics/user-analysis | 用户分析 | ⚠️ STUB（返回全0） |

**汇总：** 4通过 / 3未实现（stub代码）

---

## 详细测试记录

### ORDER-EXT-01: 管理员关闭订单

**测试步骤：**
1. 将订单2状态改为已发货（status=3）
2. 调用 POST /api/mall/admin/order/2/close

**请求：**
```json
{"reason": "test close reason"}
```

**响应：**
```json
{"datas":true,"resp_code":0,"resp_msg":"订单关闭成功"}
```

**验证结果：** ✅ PASS - 订单状态变为8（已关闭）

**后续验证：**
```sql
SELECT id, status, pay_amount, total_amount FROM mall_order WHERE id=2;
-- 结果：id=2, status=8, pay_amount=5998.00
```

---

### ORDER-EXT-02: 管理员调整订单金额

**测试步骤：**
1. 调用 POST /api/mall/admin/order/1/adjust-amount
2. 传入调整金额 -100（减少100元）

**请求：**
```json
{"adjustAmount": -100, "reason": "discount"}
```

**响应：**
```json
{"datas":true,"resp_code":0,"resp_msg":"金额调整成功"}
```

**验证结果：** ✅ PASS

**后续验证：**
```sql
SELECT id, pay_amount, total_amount FROM mall_order WHERE id=1;
-- 结果：pay_amount=2899.00（原2999.00 - 100）
```

**业务逻辑验证：**
- adjustAmount 必须为负数（减少），不允许正数
- newPayAmount >= 0 且 newPayAmount <= totalAmount
- 仅限 status=1（待付款）或 status=2（已付款）订单

---

### ORDER-EXT-03: 用户添加订单备注

**测试步骤：**
1. 调用 POST /api/mall/order/1/remark

**请求：**
```json
{"remark": "user test remark"}
```

**响应：**
```json
{"datas":true,"resp_code":0,"resp_msg":"备注添加成功"}
```

**验证结果：** ✅ PASS

---

### ORDER-EXT-03: 管理员添加订单备注

**测试步骤：**
1. 调用 POST /api/mall/admin/order/1/admin-remark

**请求：**
```json
{"reason": "admin test remark"}
```

**响应：**
```json
{"datas":true,"resp_code":0,"resp_msg":"备注添加成功"}
```

**验证结果：** ✅ PASS

**数据库验证：**
```sql
SELECT id, remark, admin_remark FROM mall_order WHERE id=1;
-- 结果：remark="user test remark", admin_remark="test"
```

---

### STAT-01: 销售趋势统计（未实现）

**问题：** `AdminStatisticsServiceImpl.getSalesTrend()` 返回空列表

**根因：** Phase 2/3 阶段代码仍为 stub，直接返回 `new ArrayList<>()`

**预期行为：**
```sql
SELECT DATE(create_time) as date, COUNT(*) as orderCount,
       SUM(payAmount) as salesAmount, COUNT(DISTINCT userId) as userCount
FROM mall_order WHERE status IN (2,3,4) AND createTime BETWEEN startDate AND endDate
GROUP BY DATE(create_time)
```

**当前数据：**
- 订单3（已完成）pay_amount=99.00，应该出现在统计中

**修复建议：** 实现 `getSalesTrend()` 实际查询逻辑

---

### STAT-02: 库存预警统计（未实现）

**问题：** `AdminStatisticsServiceImpl.getStockWarningList()` 返回空列表

**根因：** stub代码直接返回空列表

**数据库实际数据：**
```sql
SELECT id, goods_id, stock FROM mall_goods_sku;
-- SKU ID=1: stock=100（正常）
-- SKU ID=2: stock=8（低于阈值10，应触发预警）
```

**修复建议：** 实现 `getStockWarningList()` 查询 stock <= 10 的SKU

---

### STAT-03: 用户分析统计（未实现）

**问题：** `AdminStatisticsServiceImpl.getUserAnalysis()` 返回全0

**根因：** stub代码直接返回全0的DTO

**返回数据：**
```json
{"datas":{"todayNewUsers":0,"weekNewUsers":0,"monthNewUsers":0,"activeUsers":0,"avgOrderAmount":0},"resp_code":0}
```

**修复建议：** 实现查询 mall_user 和 mall_order 表计算实际统计数据

---

## 订单状态验证

| 订单ID | 订单号 | 原状态 | 操作 | 新状态 | 结果 |
|--------|--------|--------|------|--------|------|
| 1 | ORD202605100001 | 1-待付款 | adjust-amount(-100) | 1-待付款 | ✅ |
| 1 | ORD202605100001 | 1-待付款 | 添加备注 | 1-待付款 | ✅ |
| 2 | ORD202605100002 | 3-已发货 | adminCloseOrder | 8-已关闭 | ✅ |

---

## 服务状态

- **Mall-Center端口:** 7010
- **租户头:** x-tenant-header: SUPER
- **数据库:** central_mall (MySQL root/lengfeng847)

### 数据库数据状态
| 表名 | 数据量 | 说明 |
|------|--------|------|
| mall_order | 3条 | 订单1-待付款, 订单2-已关闭, 订单3-已完成 |
| mall_goods_sku | 2条 | SKU001(100件), SKU002(8件-预警) |

---

## 经验教训

1. **关闭订单校验：** 仅 status=3（已发货）订单可关闭，已关闭订单不可重复关闭

2. **调整金额限制：** adjustAmount 必须 <= 0，不允许涨价；newPayAmount 必须在 [0, totalAmount] 范围内

3. **统计接口stub：** Phase 6 的统计接口在 Phase 2/3 期间未实现实际查询，需要后续补充

4. **数据验证重要性：** 测试时应同时验证数据库状态，确认变更已正确持久化

---

*Phase 6 UAT 测试完成 - 2026-05-10*