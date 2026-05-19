---
phase: 15-管理后台前端UAT测试
gap: 01
status: complete
started: 2026-05-12
completed: 2026-05-12
type: gap-closure
gap_closure: true
source: 15-ADMIN-UAT-01-UAT.md (用户统计为0)
---

## Summary

修复 Dashboard 工作台用户统计显示为 0 的问题。

**问题现象：** 手动初始化用户后，工作台用户统计仍显示 0。

**根因：** `AdminStatisticsServiceImpl.getUserAnalysis()` 返回硬编码的 0 值，未实现真实查询逻辑。

## Changes Made

### `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStatisticsServiceImpl.java`

重写 `getUserAnalysis()` 方法，从数据库查询真实统计数据：

```java
public UserAnalysisDTO getUserAnalysis() {
    UserAnalysisDTO dto = new UserAnalysisDTO();
    String tenantId = TenantInterceptor.getCurrentTenantId();

    LocalDate today = LocalDate.now();
    LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
    LocalDate monthStart = today.withDayOfMonth(1);
    LocalDateTime todayStart = today.atStartOfDay();

    // 今日新增用户
    LambdaQueryWrapper<MallMember> todayWrapper = new LambdaQueryWrapper<>();
    todayWrapper.eq(MallMember::getTenantId, tenantId)
                .ge(MallMember::getCreateTime, todayStart);
    dto.setTodayNewUsers((int) memberMapper.selectCount(todayWrapper));

    // 本周新增用户
    LambdaQueryWrapper<MallMember> weekWrapper = new LambdaQueryWrapper<>();
    weekWrapper.eq(MallMember::getTenantId, tenantId)
               .ge(MallMember::getCreateTime, weekStart.atStartOfDay());
    dto.setWeekNewUsers((int) memberMapper.selectCount(weekWrapper));

    // 本月新增用户
    LambdaQueryWrapper<MallMember> monthWrapper = new LambdaQueryWrapper<>();
    monthWrapper.eq(MallMember::getTenantId, tenantId)
                .ge(MallMember::getCreateTime, monthStart.atStartOfDay());
    dto.setMonthNewUsers((int) memberMapper.selectCount(monthWrapper));

    // 活跃用户（当月有已付款订单的去重用户数）
    List<MallOrder> activeOrders = orderMapper.selectList(
        new LambdaQueryWrapper<MallOrder>()
            .eq(MallOrder::getTenantId, tenantId)
            .ge(MallOrder::getCreateTime, monthStart.atStartOfDay())
            .in(MallOrder::getStatus, 2, 3, 4)  // 已付款/已发货/已完成
    );
    long activeUsers = activeOrders.stream().map(MallOrder::getUserId).distinct().count();
    dto.setActiveUsers((int) activeUsers);

    return dto;
}
```

## Verification

- ✅ 编译通过，服务启动正常
- ✅ 调用 `/api-mall/api/mall/admin/statistics/user-analysis` 返回真实统计数据
- ✅ Dashboard 前端用户统计组件正确显示数值（非硬编码 0）
- ✅ 无用户数据时返回 0，不报错

## Files Modified

- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStatisticsServiceImpl.java`

## Commit

已合并到 Phase 15 批量提交 (e161fcf03)
