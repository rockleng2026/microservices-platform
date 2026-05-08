# Phase 06 Plan 01: 订单增强（管理员关单、改价、备注） Summary

## Objective
实现订单增强功能：管理员关闭已发货订单、修改订单金额、添加管理员备注，以及用户添加订单备注。

## Requirements Covered
- **ORDER-EXT-01**: 管理员可关闭/取消订单（已发货订单强制关闭）
- **ORDER-EXT-02**: 管理员可修改订单金额（优惠折让，不能高于原价）
- **ORDER-EXT-03**: 用户和管理员可给订单添加备注

## Implementation

### Task 1: MallOrder.java 新增 adminRemark 字段
**Files:** `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallOrder.java`
- 添加 `adminRemark` 字段（String类型）
- 添加 `STATUS_CLOSED = 8` 常量及 `getStatusName()` 方法返回"已关闭"

### Task 2: 创建 DTO 类
**Files:**
- `AdminAdjustOrderDTO.java` - orderId, adjustAmount(BigDecimal, 负数=减少), reason
- `UpdateRemarkDTO.java` - remark 字段
- `CloseOrderDTO.java` - reason 字段

### Task 3: IOrderService.java 添加方法并实现
**Files:** `IOrderService.java`, `OrderServiceImpl.java`
- `adminCloseOrder`: 仅 status=3 可关闭，用 Redis 锁 `order:close:{orderId}`，设置 status=8
- `adjustOrderAmount`: 仅 status in (1,2)，adjustAmount <= 0，newPayAmount >= 0 且 <= totalAmount
- `updateUserRemark`: 校验订单属于用户
- `updateAdminRemark`: 更新 adminRemark 字段

### Task 4: AdminOrderController.java 添加接口
**Files:** `AdminOrderController.java`
- `POST /{id}/close` - 管理员关闭订单
- `POST /{id}/adjust-amount` - 管理员调整金额
- `POST /{id}/admin-remark` - 管理员添加备注

### Task 5: OrderController.java 添加用户备注接口
**Files:** `OrderController.java`
- `POST /{id}/remark` - 用户添加备注

## Commits

| Hash | Message |
|------|---------|
| b74b5f699 | feat(6-01): add order extension features - admin close/adjust/remark, user remark |

## Files Created/Modified

| File | Change |
|------|--------|
| `MallOrder.java` | Modified - add adminRemark, STATUS_CLOSED=8, getStatusName() |
| `AdminAdjustOrderDTO.java` | Created |
| `CloseOrderDTO.java` | Created |
| `UpdateRemarkDTO.java` | Created |
| `IOrderService.java` | Modified - add 4 new method declarations |
| `OrderServiceImpl.java` | Modified - implement 4 methods with Redis locks |
| `AdminOrderController.java` | Modified - add 3 admin endpoints |
| `OrderController.java` | Modified - add user remark endpoint |

## Verification

- **Compilation:** `mvn compile -pl zlt-business/mall-center -am -q` - PASSED
- **adminCloseOrder:** Only status=3 (shipped) can be closed
- **adjustOrderAmount:** adjustAmount <= 0, newPayAmount >= 0 and <= totalAmount
- **updateUserRemark:** Validates order belongs to user

## Deviations from Plan
None - plan executed exactly as written.

## Known Stubs
None