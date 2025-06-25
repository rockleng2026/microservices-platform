# 项目利润计提状态功能说明

## 功能概述
为项目表增加了`profit_distribution_status`字段，用于跟踪项目利润计提的状态流转。

## 状态定义

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| `not_set` | 未设置 | 项目初始状态，尚未设置利润计提 |
| `awaiting_approval` | 待审批 | 已保存利润计提方案，等待审批 |
| `in_approval` | 审批中 | 利润计提方案正在审批流程中 |
| `approved` | 审批通过 | 利润计提方案已审批通过 |
| `approval_failed` | 审批失败 | 利润计提方案审批被拒绝 |
| `partially_settled` | 部分计提 | 已开始计提，但未完全完成 |
| `settled` | 已计提完毕 | 利润计提已全部完成 |

## 数据库变更

### 1. 添加字段
```sql
ALTER TABLE project ADD COLUMN profit_distribution_status VARCHAR(50) DEFAULT 'not_set' 
COMMENT '利润计提状态：not_set未设置,awaiting_approval待审批,in_approval审批中,approved审批通过,approval_failed审批失败,partially_settled部分计提,settled已计提完毕' 
AFTER final_status;

ALTER TABLE project ADD KEY `idx_profit_distribution_status` (`profit_distribution_status`);
```

### 2. 更新逻辑
- 保存项目提成分配时，自动将状态更新为`awaiting_approval`
- 审批通过后更新为`approved`
- 审批失败后更新为`approval_failed`
- 开始计提时更新为`partially_settled`
- 完成计提时更新为`settled`

## 后端实现

### 1. 实体类更新
- `Project.java` 增加 `profitDistributionStatus` 字段
- 增加 `profitDistributionStatusText` 扩展字段用于显示

### 2. 业务逻辑更新
- `ProjectServiceImpl.saveProfitDistribution()` 方法在保存提成分配后更新状态为`awaiting_approval`

## 前端实现

### 1. 类型定义
- `types/project.ts` 增加 `profitDistributionStatus` 字段
- 添加利润计提状态枚举

### 2. 界面显示
- 项目列表增加"计提状态"列
- 项目详情页面增加计提状态显示
- 使用不同颜色的Tag组件区分不同状态

## 状态流转图

```
not_set (未设置)
    ↓ 保存提成分配
awaiting_approval (待审批)
    ↓ 进入审批流程
in_approval (审批中)
    ↓ 审批完成
approved (审批通过) / approval_failed (审批失败)
    ↓ 开始计提 (仅审批通过)
partially_settled (部分计提)
    ↓ 完成计提
settled (已计提完毕)
```

## 使用说明

1. **项目创建时**：状态默认为`not_set`
2. **设置提成分配时**：保存分配方案后状态自动变为`awaiting_approval`
3. **审批流程中**：状态变为`in_approval`
4. **审批完成后**：根据审批结果变为`approved`或`approval_failed`
5. **开始计提时**：状态变为`partially_settled`
6. **计提完成时**：状态变为`settled`

## 注意事项

1. 状态变更需要有相应的权限控制
2. 已审批通过的提成分配不允许修改
3. 状态变更需要记录操作日志
4. 前端显示需要根据状态提供相应的操作按钮 