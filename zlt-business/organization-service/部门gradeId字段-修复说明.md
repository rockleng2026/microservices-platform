# 部门gradeId字段修复说明

## 问题描述

用户反馈部门树接口返回的数据中，所有部门的 `gradeid` 字段都是 `null`，但是 `level` 字段显示了正确的层级。

从API响应数据可以看出：
```json
{
  "id": "1933186684942409728",
  "name": "党建一体机部4",
  "gradeid": null,  // ❌ 这个字段为空
  "level": 3,       // ✅ 但层级计算是正确的
  ...
}
```

## 问题分析

### 根本原因
数据库中 `department` 表的 `grade_id` 字段在部分或全部记录中为 `NULL`，导致序列化到前端时显示为 `null`。

### 技术分析
1. **SQL查询正确** - Mapper.xml中包含了 `grade_id` 字段
2. **字段映射正确** - ResultMap配置了 `gradeId` 映射
3. **计算逻辑正确** - `getDepartmentLevel()` 方法能正确计算层级
4. **数据库数据问题** - `grade_id` 字段确实为 `NULL`

## 修复方案

### 方案1：代码层面立即修复 ✅

在 `convertToTreeVO` 方法中添加了补偿逻辑：

```java
// 修复gradeId字段：如果数据库中gradeId为空，使用计算出的level值
if (vo.getGradeid() == null && level != null) {
    vo.setGradeid(level);
    log.debug("修复部门{}的gradeId字段：从null设置为{}", department.getName(), level);
}
```

**优点**：
- 立即生效，无需数据库操作
- 不影响现有数据
- 向后兼容

### 方案2：数据库批量修复 📋

使用提供的SQL脚本 `部门gradeId字段修复脚本.sql` 批量更新数据库：

```sql
-- 示例：为根部门设置grade_id=1
UPDATE department 
SET grade_id = 1, updated_at = NOW()
WHERE delflag = 0 AND grade_id IS NULL AND parent_id = 0;
```

**优点**：
- 彻底解决数据问题
- 提高查询性能
- 数据一致性更好

### 方案3：保存时自动修复 ✅

在部门保存逻辑中添加了 `gradeId` 设置：

```java
// 新增部门时
if (department.getGradeId() == null) {
    Integer calculatedGrade = calculateDepartmentGrade(department.getParentId());
    department.setGradeId(calculatedGrade);
}

// 编辑部门时
if (saveDTO.getGradeid() != null) {
    department.setGradeId(saveDTO.getGradeid());
} else if (department.getGradeId() == null) {
    Integer calculatedGrade = calculateDepartmentGrade(department.getParentId());
    department.setGradeId(calculatedGrade);
}
```

## 修复效果

### 立即效果（方案1）
- ✅ API响应中 `gradeid` 不再为 `null`
- ✅ 使用计算出的正确层级值
- ✅ 不影响现有功能

### 长期效果（方案2+3）
- ✅ 数据库数据完整性
- ✅ 新增/编辑部门时自动设置正确的 `gradeId`
- ✅ 查询性能更好

## 实施建议

### 1. 立即部署（推荐）
直接部署包含方案1和方案3的代码修改，立即解决问题。

### 2. 数据修复（可选）
在维护窗口期间执行SQL脚本进行数据修复：

```bash
# 1. 备份数据库
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 执行修复脚本
mysql -u username -p database_name < 部门gradeId字段修复脚本.sql

# 3. 验证修复结果
mysql -u username -p database_name -e "SELECT grade_id, COUNT(*) FROM department WHERE delflag=0 GROUP BY grade_id;"
```

### 3. 验证测试

**测试步骤**：
1. 访问部门树接口：`GET /api/organization/departments/tree`
2. 检查响应中所有部门的 `gradeid` 字段
3. 验证 `gradeid` 与 `level` 字段值一致
4. 测试新增部门时 `gradeid` 是否正确设置
5. 测试编辑部门时 `gradeid` 是否正确更新

**预期结果**：
```json
{
  "id": "1933186684942409728",
  "name": "党建一体机部4", 
  "gradeid": 3,  // ✅ 不再为null
  "level": 3,    // ✅ 与gradeid一致
  ...
}
```

## 相关文件

### 后端文件
- `DepartmentServiceImpl.java` - 主要修复逻辑
- `DepartmentMapper.xml` - SQL查询配置
- `部门gradeId字段修复脚本.sql` - 数据修复脚本

### 测试验证
- 部门树接口：`GET /api/organization/departments/tree`
- 部门详情接口：`GET /api/organization/departments/{id}`
- 部门保存接口：`POST /api/organization/departments/save`

## 注意事项

1. **数据备份**：执行SQL脚本前务必备份数据库
2. **测试验证**：在测试环境先验证修复效果
3. **性能影响**：修复逻辑对性能影响很小
4. **兼容性**：修改完全向后兼容，不影响现有功能

## 监控指标

修复后可以通过以下指标监控效果：
- API响应中 `gradeid` 字段的非空率
- 新增部门时 `gradeId` 的设置成功率
- 数据库中 `grade_id` 字段的完整性

这个修复方案确保了部门层级信息的完整性和一致性，提升了用户体验。 