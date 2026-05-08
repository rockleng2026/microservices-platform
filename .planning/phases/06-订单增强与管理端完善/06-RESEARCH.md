# Phase 6: 订单增强与管理端完善 - Research

**Research Date:** 2026-05-08
**Phase:** 06-订单增强与管理端完善

---

## Research Questions

Q1: 如何实现管理员关闭已发货订单？
Q2: 如何实现管理员修改订单金额（优惠折让）？
Q3: 如何实现订单备注功能（用户+管理员）？
Q4: 如何实现销售趋势统计（日/周/月）？
Q5: 如何实现库存预警统计？
Q6: 如何实现用户分析（新增/活跃度）？

---

## Q1: 管理员关闭已发货订单

### 现状
MallOrder.status 当前值：
- 1=待付款, 2=已付款, 3=已发货, 4=已完成, 5=已取消, 6=退款中, 7=已退款

### 实现方案
在 `IOrderService` 添加：
```java
/**
 * 管理员强制关闭订单（仅已发货状态）
 * @param orderId 订单ID
 * @param adminId 管理员ID
 * @param reason 关闭原因
 */
boolean adminCloseOrder(Long orderId, Long adminId, String reason);
```

状态流转：3(已发货) → 8(已关闭)，记录 adminId + closeReason。

管理员关闭与用户取消的区别：
- 用户取消：仅限 1(待付款) 状态
- 管理员关闭：限 3(已发货) 状态，强制关闭不退款

### 幂等性
- 使用 Redis 锁 `order:close:{orderId}`
- 重复关闭返回成功（幂等）

---

## Q2: 管理员修改订单金额

### 实现方案
新增 `AdminAdjustOrderDTO`：
```java
@Data
public class AdminAdjustOrderDTO {
    private Long orderId;
    private BigDecimal adjustAmount;  // 调整金额（负数=减少，正数=增加）
    private String reason;
}
```

在 `IOrderService` 添加：
```java
/**
 * 管理员调整订单金额（优惠折让）
 */
boolean adjustOrderAmount(Long orderId, BigDecimal adjustAmount, String reason, Long adminId);
```

### 约束
- 仅限 1(待付款) 或 2(已付款未发货) 状态可调整
- 调整后 payAmount 不能为负
- 记录操作日志：operator=adminId, before=oldPayAmount, after=newPayAmount

### 微信支付更新
如果订单已支付，需要调用微信支付"合单支付"或使用转账功能（复杂，一期暂不考虑）

---

## Q3: 订单备注功能

### 现状
MallOrder.remark 字段已存在，但只支持单一字符串。

### 扩展方案
保留 `remark` 字段，同时新增 `adminRemark` 字段：
```java
private String remark;      // 用户备注
private String adminRemark; // 管理员备注
```

订单详情返回时同时返回两个字段。

### 接口
用户端：
- `POST /order/{id}/remark` — 添加用户备注（订单创建后任意时间）

管理端：
- `POST /admin/order/{id}/remark` — 添加管理员备注
- `GET /admin/order/{id}` — 订单详情包含 adminRemark

---

## Q4: 销售趋势统计

### 实现方案
新增 `SalesTrendDTO`：
```java
@Data
public class SalesTrendDTO {
    private String date;           // 日期
    private Integer orderCount;    // 订单数
    private BigDecimal salesAmount; // 销售额
    private Integer userCount;     // 购买用户数
}
```

新增接口 `GET /admin/statistics/sales-trend?type=day|week|month&startDate=&endDate=`

### SQL 统计
```sql
SELECT DATE(create_time) as date,
       COUNT(*) as order_count,
       SUM(pay_amount) as sales_amount,
       COUNT(DISTINCT user_id) as user_count
FROM mall_order
WHERE status IN (2,3,4) AND create_time BETWEEN ? AND ?
GROUP BY DATE(create_time)
ORDER BY date
```

---

## Q5: 库存预警统计

### 现状
`IStockService` 已有库存管理，新增预警功能。

### 实现方案
新增 `StockWarningDTO`：
```java
@Data
public class StockWarningDTO {
    private Long skuId;
    private String skuName;
    private Long goodsId;
    private String goodsName;
    private Integer realStock;     // 当前真实库存
    private Integer warningStock;  // 预警阈值
    private Integer soldToday;     // 今日销售
}
```

新增接口 `GET /admin/statistics/stock-warning`

### SQL
```sql
SELECT s.id as skuId, s.sku_name, g.goods_name, s.stock as realStock,
       IFNULL(w.threshold, 10) as warningStock,
       (SELECT COUNT(*) FROM mall_order_item oi WHERE oi.sku_id = s.id AND DATE(oi.create_time) = CURDATE()) as soldToday
FROM mall_goods_sku s
JOIN mall_goods g ON s.goods_id = g.id
WHERE s.stock <= IFNULL(w.threshold, 10)
ORDER BY s.stock ASC
```

---

## Q6: 用户分析统计

### 实现方案
新增 `UserAnalysisDTO`：
```java
@Data
public class UserAnalysisDTO {
    private Integer todayNewUsers;    // 今日新增
    private Integer weekNewUsers;      // 本周新增
    private Integer monthNewUsers;     // 本月新增
    private Integer activeUsers;       // 活跃用户（当月有订单）
    private BigDecimal avgOrderAmount; // 平均订单金额
}
```

新增接口 `GET /admin/statistics/user-analysis`

### SQL
```sql
-- 新增用户
SELECT COUNT(*) FROM mall_user
WHERE create_time >= DATE_SUB(NOW(), INTERVAL 1 DAY)  -- 今日新增

-- 活跃用户（本月有订单）
SELECT COUNT(DISTINCT user_id) FROM mall_order
WHERE status IN (2,3,4) AND create_time >= DATE_FORMAT(NOW(), '%Y-%m-01')
```

---

## Validation Architecture

### Phase 6 验证策略
- 所有新增接口需要测试验证
- 订单状态变更需要集成测试验证
- 统计接口需要数据验证（SQL 结果校验）

### 关键验证点
1. 管理员关单：仅限已发货状态，非该状态返回错误
2. 管理员改价：调整后金额不能为负，不能高于原价
3. 统计接口：空数据时返回空列表，不报错

---

## Implementation Notes

### 文件新增/修改清单
1. `MallOrder.java` — 新增 `adminRemark` 字段
2. `IOrderService.java` — 新增 `adminCloseOrder`, `adjustOrderAmount`, `updateUserRemark`
3. `OrderServiceImpl.java` — 实现上述方法
4. `AdminOrderController.java` — 新增关单/改价/管理员备注接口
5. `AdminStatisticsController.java` — 扩展统计接口
6. `AdminAdjustOrderDTO.java` — 新增收银调整DTO

### 数据库变更
- `mall_order`: 新增 `admin_remark` 字段（VARCHAR 255）

---

*Research complete: 2026-05-08*
*Validated against: ROADMAP.md, REQUIREMENTS.md, MallOrder.java, IOrderService.java*