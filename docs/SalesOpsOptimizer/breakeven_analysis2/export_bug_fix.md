# 财务模型导出功能Bug修复总结

## 问题描述

在测试财务模型导出功能时，发现以下两个问题：

### 1. JSON导出问题
- **现象**: 点击"导出JSON"按钮后，返回的是JSON格式的响应体内容，下载的文件里面是null
- **原因**: 后端接口返回的是`Result<String>`格式，而不是直接的文件下载

### 2. Excel导出问题
- **现象**: 点击"导出Excel"按钮后报错401
- **原因**: 前端请求缺少必要的请求头`Authorization`和`x-tenant-header`

## 修复方案

### 1. JSON导出修复

#### 后端修复
**修改前**:
```java
@GetMapping("/{id}/export")
@Operation(summary = "导出模型配置", description = "导出模型配置为JSON格式")
public Result<String> exportModelConfig(@PathVariable @NotNull Long id) {
    String configJson = financialModelService.exportModelConfig(id);
    return Result.succeed(configJson);
}
```

**修改后**:
```java
@GetMapping("/{id}/export")
@Operation(summary = "导出模型配置", description = "导出模型配置为JSON格式")
public void exportModelConfig(
        @PathVariable @NotNull Long id,
        HttpServletResponse response,
        @LoginUser SysUser user) throws IOException {
    
    log.info("用户[{}]导出财务模型配置: {}", user.getUsername(), id);
    
    try {
        String configJson = financialModelService.exportModelConfig(id);
        
        // 设置响应头
        String fileName = URLEncoder.encode("财务模型配置_" + id + "_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")), 
                StandardCharsets.UTF_8);
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".json");
        
        // 写入响应体
        response.getWriter().write(configJson);
        
        log.info("财务模型配置导出成功，ID: {}", id);
    } catch (Exception e) {
        log.error("财务模型配置导出失败，ID: {}, 错误: {}", id, e.getMessage(), e);
        throw e;
    }
}
```

#### 前端修复
**修改前**:
```typescript
static async exportModelConfig(id: number): Promise<string> {
  const response = await request<ApiResponse<string>>(`${API_BASE}/${id}/export`, {
    method: 'GET',
  });

  if (response.resp_code === 0) {
    return response.datas;
  }
  throw new Error(response.resp_msg || '导出模型配置失败');
}
```

**修改后**:
```typescript
static async exportModelConfig(id: number): Promise<void> {
  const token = localStorage.getItem('access_token');
  const tenant = localStorage.getItem('tenant_id') || 'default';
  
  const response = await fetch(`${API_BASE}/${id}/export`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant-header': tenant,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('导出失败');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `财务模型配置_${id}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
```

#### Excel表头修复
**修改前**:
```java
// 创建Excel写入器
try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream()).build()) {
    
    // 1. 导出模型基本信息
    WriteSheet modelSheet = EasyExcel.writerSheet(0, "模型信息").build();
    FinancialModelExportDTO modelExportDTO = convertToModelExportDTO(model);
    excelWriter.write(List.of(modelExportDTO), modelSheet);
    
    // 2. 导出模型变量
    WriteSheet variableSheet = EasyExcel.writerSheet(1, "模型变量").build();
    List<ModelVariableExportDTO> variableExportDTOs = variables.stream()
            .map(this::convertToVariableExportDTO)
            .collect(Collectors.toList());
    excelWriter.write(variableExportDTOs, variableSheet);
}
```

**修改后**:
```java
// 创建Excel写入器
try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream()).build()) {
    
    // 1. 导出模型基本信息
    WriteSheet modelSheet = EasyExcel.writerSheet(0, "模型信息")
            .head(FinancialModelExportDTO.class)
            .build();
    FinancialModelExportDTO modelExportDTO = convertToModelExportDTO(model);
    excelWriter.write(List.of(modelExportDTO), modelSheet);
    
    // 2. 导出模型变量
    WriteSheet variableSheet = EasyExcel.writerSheet(1, "模型变量")
            .head(ModelVariableExportDTO.class)
            .build();
    List<ModelVariableExportDTO> variableExportDTOs = variables.stream()
            .map(this::convertToVariableExportDTO)
            .collect(Collectors.toList());
    excelWriter.write(variableExportDTOs, variableSheet);
}
```

### 2. Excel导出修复

#### 前端修复
为所有Excel导出方法添加必要的请求头：

**修改前**:
```typescript
static async exportModelToExcel(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}/export/excel`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  // ...
}
```

**修改后**:
```typescript
static async exportModelToExcel(id: number): Promise<void> {
  const token = localStorage.getItem('access_token');
  const tenant = localStorage.getItem('tenant_id') || 'default';
  
  const response = await fetch(`${API_BASE}/${id}/export/excel`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant-header': tenant,
      'Content-Type': 'application/json',
    },
  });
  // ...
}
```

## 修复内容总结

### 1. 后端修复
- ✅ 修改JSON导出接口，直接返回文件下载而不是JSON响应
- ✅ 添加必要的导入语句（URLEncoder、LocalDateTime等）
- ✅ 设置正确的响应头（Content-Type、Content-disposition）
- ✅ 添加详细的日志记录
- ✅ **增强JSON导出内容**: 包含图表配置和系列数据

### 2. 前端修复
- ✅ 修改JSON导出API调用，处理文件下载
- ✅ 为所有导出方法添加Authorization和x-tenant-header
- ✅ 简化前端导出处理逻辑
- ✅ 统一错误处理方式
- ✅ **修复token获取问题**: 使用正确的localStorage键名

### 3. 请求头修复
- ✅ `Authorization`: Bearer Token认证（使用`access_token`）
- ✅ `x-tenant-header`: 租户信息（使用`tenant_id`）
- ✅ `Content-Type`: 内容类型

### 4. 功能增强
- ✅ **完整数据导出**: 模型信息 + 变量配置 + 图表配置 + 系列数据
- ✅ **导入功能增强**: 支持完整配置的导入，包括图表和系列
- ✅ **数据完整性**: 保持所有关联关系和字段完整性
- ✅ **Excel表头修复**: 为所有sheet页添加正确的表头配置

## 测试验证

### 1. JSON导出测试
```bash
# 测试JSON导出
curl -X GET "http://localhost:8080/api/soo/v2/models/1/export" \
  -H "Authorization: Bearer {your-token}" \
  -H "x-tenant-header: default" \
  --output "test_config.json"
```

**预期结果**:
- 状态码: 200 OK
- Content-Type: application/json
- Content-disposition: attachment;filename*=utf-8''财务模型配置_1_20241219_143022.json
- 文件内容: 正确的JSON配置数据

### 2. Excel导出测试
```bash
# 测试Excel导出
curl -X GET "http://localhost:8080/api/soo/v2/models/1/export/excel" \
  -H "Authorization: Bearer {your-token}" \
  -H "x-tenant-header: default" \
  --output "test_model.xlsx"
```

**预期结果**:
- 状态码: 200 OK
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- 文件内容: 包含4个sheet页的Excel文件

## 相关文件

### 修改的后端文件
- `FinancialModelController.java` - 修改JSON导出接口

### 修改的前端文件
- `financialModel.ts` - 修改导出API调用
- `FinancialModelManagement.tsx` - 修改导出处理逻辑

### 新增的导入
```java
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
```

## 修复效果

### 修复前的问题
1. ❌ JSON导出返回响应体而不是文件
2. ❌ Excel导出401认证失败
3. ❌ 缺少必要的请求头
4. ❌ **Token获取错误**: 使用错误的localStorage键名
5. ❌ **JSON导出内容不完整**: 缺少图表配置和系列数据
6. ❌ **Excel导出缺少表头**: 导出的Excel文件没有表头

### 修复后的效果
1. ✅ JSON导出正确下载文件
2. ✅ Excel导出正常认证
3. ✅ 所有请求头正确设置
4. ✅ 文件命名规范
5. ✅ 错误处理完善
6. ✅ **Token获取正确**: 使用正确的localStorage键名（`access_token`、`tenant_id`）
7. ✅ **JSON导出内容完整**: 包含模型信息、变量配置、图表配置、系列数据
8. ✅ **Excel表头完整**: 所有sheet页都有正确的表头

## 总结

通过本次修复，财务模型导出功能现在可以正常工作：

1. **JSON导出**: 正确返回文件下载，文件名包含模型ID和时间戳
2. **Excel导出**: 正确设置认证头，支持单个、批量、全量导出
3. **用户体验**: 统一的错误处理和成功提示
4. **安全性**: 正确的认证和授权机制

所有导出功能现在都可以正常使用，为用户提供了完整的数据导出解决方案。 