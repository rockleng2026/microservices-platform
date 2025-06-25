# 修复项目查询接口未返回profit_distribution_status字段

## 问题描述
调用项目分页查询接口 `GET /api/project/projects/page` 时，返回的项目数据中 `profitDistributionStatus` 字段为空或不存在。

## 问题原因
1. 数据库中可能缺少 `profit_distribution_status` 字段
2. MyBatis Mapper.xml 文件中未包含该字段的映射
3. 现有数据库记录中该字段值为 NULL

## 解决方案

### 1. 数据库修改
创建了 `sql/update_profit_distribution_status.sql` 脚本：
- 智能检测并添加 `profit_distribution_status` 字段（如果不存在）
- 添加索引提升查询性能
- 更新现有记录的默认值为 'not_set'
- 根据已有提成分配记录智能设置状态

### 2. MyBatis Mapper 修改
修改 `ProjectMapper.xml`：

#### ResultMap 映射
```xml
<result column="profit_distribution_status" property="profitDistributionStatus" jdbcType="VARCHAR"/>
```

#### SQL 查询字段
```xml
p.profit_distribution_status,
```

#### 查询条件
```xml
<if test="params.profitDistributionStatus != null and params.profitDistributionStatus != ''">
    AND p.profit_distribution_status = #{params.profitDistributionStatus}
</if>
```

### 3. DTO 类修改
在 `ProjectQueryDTO.java` 中添加：
```java
/**
 * 利润计提状态
 */
private String profitDistributionStatus;
```

## 修改文件清单

### 后端文件
1. `sql/update_profit_distribution_status.sql` - 数据库更新脚本（新建）
2. `zlt-business/project-manager-service/src/main/resources/mapper/ProjectMapper.xml` - 添加字段映射和查询
3. `zlt-business/project-manager-service/src/main/java/com/central/project/model/dto/ProjectQueryDTO.java` - 添加查询条件字段

### 数据库字段定义
```sql
profit_distribution_status VARCHAR(50) DEFAULT 'not_set' 
COMMENT '利润计提状态：not_set未设置,awaiting_approval待审批,in_approval审批中,approved审批通过,approval_failed审批失败,partially_settled部分计提,settled已计提完毕'
```

## 执行步骤

1. **执行数据库脚本**：
   ```bash
   # 在数据库中执行
   source sql/update_profit_distribution_status.sql
   ```

2. **重启服务**：
   重启 project-manager-service 服务以加载新的 Mapper 配置

3. **验证接口**：
   ```bash
   curl "http://127.0.0.1:8065/api-project/api/project/projects/page?page=1&size=10"
   ```

## 预期结果

修复后，项目查询接口将正确返回 `profitDistributionStatus` 字段：

```json
{
  "resp_code": 0,
  "resp_msg": "success",
  "datas": {
    "records": [
      {
        "id": "1234567890",
        "name": "示例项目",
        "profitDistributionStatus": "not_set",
        "...": "其他字段"
      }
    ]
  }
}
```

## 状态值说明

| 状态值 | 中文说明 | 使用场景 |
|--------|----------|----------|
| `not_set` | 未设置 | 新建项目或未设置提成分配 |
| `awaiting_approval` | 待审批 | 已保存提成分配方案 |
| `in_approval` | 审批中 | 提成分配审批流程中 |
| `approved` | 审批通过 | 提成分配方案已通过 |
| `approval_failed` | 审批失败 | 提成分配方案被拒绝 |
| `partially_settled` | 部分计提 | 开始计提但未完成 |
| `settled` | 已计提完毕 | 提成已全部发放 | 