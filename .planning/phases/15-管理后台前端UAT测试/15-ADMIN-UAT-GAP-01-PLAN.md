---
name: 15-ADMIN-UAT-GAP-01-PLAN
description: 修复工作台用户统计为0的问题
phase: 15
gap_closure: true
status: completed
created: 2026-05-12
source: |
  用户报告: 手动初始化了用户，但工作台用户统计界面显示还是0
  同时模拟创建了几个订单，今日订单、热销排行还是0
parent_plans:
  - 15-ADMIN-UAT-01-PLAN.md
artifacts:
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStatisticsServiceImpl.java
---

## Gap Summary

**现象:** 工作台用户统计界面显示0，虽然已手动初始化用户
**根因:** `AdminStatisticsServiceImpl.getUserAnalysis()` 返回硬编码0，未实现真实查询逻辑

---

## Implementation Plan

### Task 1: 分析用户表和订单表结构

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/`

1. 查找用户表对应的Mapper和Entity（如 `MallUser` 或 `User`）
2. 确认用户表的创建时间字段和状态字段
3. 确认订单表 `MallOrder` 的 user_id 关联

**验证标准:** 确认用户表名、关键字段（创建时间、状态、租户ID）

### Task 2: 修改 getUserAnalysis() 实现

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStatisticsServiceImpl.java`

实现真实的用户统计查询：

```java
@Override
public UserAnalysisDTO getUserAnalysis() {
    UserAnalysisDTO dto = new UserAnalysisDTO();
    String tenantId = TenantInterceptor.getCurrentTenantId();

    try {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate monthStart = today.withDayOfMonth(1);

        // 今日新增用户
        // 查询用户表，根据创建时间统计
        LocalDateTime todayStart = today.atStartOfDay();
        // dto.setTodayNewUsers(userMapper.countUsersCreatedAfter(tenantId, todayStart));

        // 本周新增用户
        // dto.setWeekNewUsers(userMapper.countUsersCreatedAfter(tenantId, weekStart.atStartOfDay()));

        // 本月新增用户
        // dto.setMonthNewUsers(userMapper.countUsersCreatedAfter(tenantId, monthStart.atStartOfDay()));

        // 活跃用户（当月有订单的用户）
        // SELECT COUNT(DISTINCT user_id) FROM mall_order
        // WHERE tenant_id = ? AND create_time >= ? AND status >= 2
        // dto.setActiveUsers(orderMapper.countActiveUsers(tenantId, monthStart.atStartOfDay()));

    } catch (Exception e) {
        log.error("Error getting user analysis: {}", e.getMessage(), e);
    }

    return dto;
}
```

**验证标准:**
- 编译通过
- 启动服务后调用 `/api/mall/admin/statistics/user-analysis` 返回非零数据（如果有用户）

### Task 3: 验证用户统计接口

1. 确认数据库中确实有用户数据
2. 调用接口验证返回正确的用户数量
3. 确认前端Dashboard正确显示用户统计

**验证标准:** 前端Dashboard用户统计显示正确数值

---

## Technical Notes

- 需要确认 `MallUser` 或对应用户表的Mapper是否存在
- 如果用户表不在 mall-center 模块，需要通过API调用用户服务获取数据
- 活跃用户定义：当月有已付款订单的用户（status >= 2）

---

## Dependencies

- Task 2 依赖 Task 1 的分析结果

---

## Success Criteria

1. `getUserAnalysis()` 返回真实统计数据（非硬编码0）
2. Dashboard前端用户统计组件正确显示数值
3. 如果数据库无用户数据，接口应返回0而非错误
