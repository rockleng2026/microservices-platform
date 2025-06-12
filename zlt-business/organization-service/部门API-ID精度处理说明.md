# 部门API - ID精度处理说明

## 问题背景

JavaScript 的 Number 类型采用 IEEE 754 双精度浮点数标准，只能安全表示 -(2^53-1) 到 2^53-1 之间的整数。超出这个范围的长整型数字会发生精度丢失，导致前后端数据不一致。

## 解决方案

### 1. 后端序列化策略

#### 自定义注解
```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@JsonSerialize(using = LongToStringSerializer.class)
public @interface LongToString {
}
```

#### 实体类应用
```java
@Data
@TableName("department")
public class Department {
    @TableId(type = IdType.ASSIGN_ID)
    @IdUtils.LongToString  // 自动将Long类型ID序列化为字符串
    private Long id;
    
    @IdUtils.LongToString
    private Long parentId;
    
    @IdUtils.LongToString
    private Long directorId;
}
```

#### VO类应用
```java
@Data
public class DepartmentTreeVO {
    @IdUtils.LongToString
    private Long id;
    
    @IdUtils.LongToString
    private Long parentId;
    
    @IdUtils.LongToString
    private Long directorId;
}
```

### 2. ID转换工具

#### 核心工具类
```java
public class IdUtils {
    /**
     * ID转字符串，避免前端精度丢失
     */
    public static String toIdString(Long id) {
        return id != null ? String.valueOf(id) : null;
    }
    
    /**
     * 字符串转ID
     */
    public static Long toIdLong(String idStr) {
        try {
            return idStr != null && !idStr.trim().isEmpty() ? Long.valueOf(idStr) : null;
        } catch (NumberFormatException e) {
            log.warn("Invalid id string: {}", idStr);
            return null;
        }
    }
}
```

### 3. Controller层处理

#### API输入处理
```java
@GetMapping("/{id}")
public Result<Department> getDepartmentById(@PathVariable String id) {
    try {
        // 接收字符串格式的ID
        log.info("获取部门详情请求 - ID字符串: {}", id);
        
        // 转换为Long进行业务处理
        Long idLong = IdUtils.toIdLong(id);
        log.info("ID转换结果 - 字符串: {} -> Long: {}", id, idLong);
        
        if (idLong == null) {
            return Result.failed("无效的部门ID");
        }
        
        Department department = departmentService.getDepartmentById(idLong);
        
        // 返回时自动序列化为字符串（通过@IdUtils.LongToString注解）
        log.debug("返回的部门ID将序列化为字符串: {}", IdUtils.toIdString(department.getId()));
        
        return Result.succeed(department);
    } catch (Exception e) {
        log.error("获取部门详情失败", e);
        return Result.failed("获取部门详情失败：" + e.getMessage());
    }
}
```

#### API输出检查
```java
@GetMapping("/tree")
public Result<List<DepartmentTreeVO>> getDepartmentTree(DepartmentQueryDTO query) {
    try {
        List<DepartmentTreeVO> tree = departmentService.getDepartmentTree(query);
        
        // 记录ID转换信息，确保精度不丢失
        if (tree != null && !tree.isEmpty()) {
            log.info("部门树查询成功 - 返回 {} 个顶级部门", tree.size());
            tree.forEach(dept -> {
                log.debug("部门ID转换检查 - 原始ID: {}, 序列化后预期: {}", 
                         dept.getId(), IdUtils.toIdString(dept.getId()));
            });
        }
        
        return Result.succeed(tree);
    } catch (Exception e) {
        log.error("获取部门树失败", e);
        return Result.failed("获取部门树失败：" + e.getMessage());
    }
}
```

## API接口ID处理策略

### 路径参数处理
所有包含ID的路径参数统一使用 `String` 类型：
```java
// ✅ 正确
@GetMapping("/{id}")
public Result<Department> getDepartmentById(@PathVariable String id)

// ❌ 错误
@GetMapping("/{id}")  
public Result<Department> getDepartmentById(@PathVariable Long id)
```

### 请求体参数处理
DTO中的ID字段使用 `Long` 类型，通过工具类进行转换：
```java
@PostMapping("/save")
public Result<Department> saveDepartment(@RequestBody DepartmentSaveDTO saveDTO) {
    // 处理ID转换，确保精度
    if (saveDTO.getId() != null) {
        saveDTO.setId(IdUtils.toIdLong(IdUtils.toIdString(saveDTO.getId())));
    }
    // ...
}
```

### 响应数据处理
通过注解自动转换，无需手动处理：
```java
// Department实体和DepartmentTreeVO都已配置@IdUtils.LongToString注解
// JSON响应中ID字段会自动序列化为字符串
{
  "id": "1734567890123456789",     // 字符串格式，避免精度丢失
  "parentId": "1734567890123456788",
  "directorId": "1734567890123456790"
}
```

## 验证方法

### 1. 日志检查
启用DEBUG级别日志，观察ID转换过程：
```
2024-12-19 10:30:15 [INFO ] - 获取部门详情请求 - ID字符串: 1734567890123456789
2024-12-19 10:30:15 [INFO ] - ID转换结果 - 字符串: 1734567890123456789 -> Long: 1734567890123456789
2024-12-19 10:30:15 [DEBUG] - 返回的部门ID将序列化为字符串: 1734567890123456789
```

### 2. API响应检查
使用Postman或其他工具验证API响应中ID的格式：
```json
{
  "resp_code": 0,
  "resp_msg": "成功",
  "datas": [{
    "id": "1734567890123456789",        // 字符串格式
    "name": "技术部",
    "parentId": "1734567890123456788",   // 字符串格式
    "directorId": null
  }]
}
```

### 3. 前端接收测试
在浏览器控制台验证接收到的数据：
```javascript
// ✅ 正确 - 接收到字符串格式的ID
console.log(response.data.id);        // "1734567890123456789"
console.log(typeof response.data.id); // "string"

// ❌ 错误 - 如果接收到数字格式
console.log(response.data.id);        // 1734567890123456800 (精度丢失)
console.log(typeof response.data.id); // "number"
```

## 注意事项

1. **一致性**: 所有涉及ID的API都必须遵循字符串输入输出的规范
2. **兼容性**: IdUtils.toIdLong() 方法能够安全处理null和空字符串
3. **性能**: 字符串转换的性能开销可忽略不计
4. **扩展性**: 这套机制适用于所有需要精度保护的长整型字段

## 相关文件

- `IdUtils.java` - ID转换工具类
- `Department.java` - 部门实体类
- `DepartmentTreeVO.java` - 部门树VO类
- `DepartmentController.java` - 部门控制器
- `DepartmentSaveDTO.java` - 部门保存DTO

通过这套完整的ID精度保护机制，确保前后端数据传输过程中ID的完整性和一致性。 