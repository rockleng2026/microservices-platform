# 财务模型导出功能

## 功能概述

财务模型导出功能支持将模型及其相关数据导出到Excel文件，包含多个sheet页，便于数据备份、迁移和分享。

## 导出内容

### Excel文件结构
每个导出的Excel文件包含以下sheet页：

1. **模型信息** - 财务模型的基本信息
2. **模型变量** - 模型的所有变量配置
3. **图表配置** - 模型的图表分析配置
4. **图表系列** - 图表的系列数据配置

### 导出数据类型

#### 1. 模型信息 (Sheet: 模型信息)
- 模型ID、编码、名称、版本
- 模型分类、描述、父模型ID
- 是否为模板、是否启用
- 创建人、租户、时间信息

#### 2. 模型变量 (Sheet: 模型变量)
- 变量ID、模型ID、编码、名称
- 变量类型、数据类型、单位
- 父级ID、默认值、最小值、最大值
- 计算公式、约束条件
- 显示顺序、是否必填、是否关键指标
- 是否显示、描述、帮助说明

#### 3. 图表配置 (Sheet: 图表配置)
- 图表ID、模型ID、图表名称
- X轴名称、字段、单位
- Y轴名称、单位
- 图表类型、模拟步数
- 创建和更新时间

#### 4. 图表系列 (Sheet: 图表系列)
- 系列ID、图表ID、系列名称
- 系列字段、类型、值
- 颜色、排序、创建时间

## 导出方式

### 1. 单个模型导出
- **API接口**: `GET /api/soo/v2/models/{id}/export/excel`
- **功能**: 导出指定模型的所有相关数据
- **文件名**: `{模型名称}_{时间戳}.xlsx`

### 2. 批量模型导出
- **API接口**: `POST /api/soo/v2/models/export/excel/batch`
- **功能**: 导出多个模型的所有相关数据
- **文件名**: `财务模型批量导出_{时间戳}.xlsx`

### 3. 全量模型导出
- **API接口**: `GET /api/soo/v2/models/export/excel/all`
- **功能**: 导出系统中所有模型的数据
- **文件名**: `财务模型全量导出_{时间戳}.xlsx`

## 技术实现

### 后端实现

#### 1. 导出DTO类
```java
// 财务模型导出DTO
@Data
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 22)
public class FinancialModelExportDTO {
    @ExcelProperty(value = "模型ID", index = 0)
    private Long id;
    
    @ExcelProperty(value = "模型编码", index = 1)
    private String modelCode;
    
    // ... 其他字段
}

// 模型变量导出DTO
@Data
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 23)
public class ModelVariableExportDTO {
    @ExcelProperty(value = "变量ID", index = 0)
    private Long id;
    
    // ... 其他字段
}

// 图表配置导出DTO
@Data
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 24)
public class ChartAnalysisModelExportDTO {
    @ExcelProperty(value = "图表ID", index = 0)
    private Long id;
    
    // ... 其他字段
}

// 图表系列导出DTO
@Data
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 25)
public class ChartSeriesExportDTO {
    @ExcelProperty(value = "系列ID", index = 0)
    private Long id;
    
    // ... 其他字段
}
```

#### 2. 导出服务接口
```java
public interface FinancialModelExportService {
    // 导出单个财务模型到Excel
    void exportModelToExcel(Long modelId, HttpServletResponse response) throws IOException;
    
    // 导出多个财务模型到Excel
    void exportModelsToExcel(List<Long> modelIds, HttpServletResponse response) throws IOException;
    
    // 导出所有财务模型到Excel
    void exportAllModelsToExcel(HttpServletResponse response) throws IOException;
}
```

#### 3. 导出服务实现
```java
@Service
public class FinancialModelExportServiceImpl implements FinancialModelExportService {
    
    @Override
    public void exportModelToExcel(Long modelId, HttpServletResponse response) throws IOException {
        // 1. 获取模型信息
        FinancialModel model = financialModelMapper.selectById(modelId);
        
        // 2. 设置响应头
        String fileName = URLEncoder.encode(model.getModelName() + "_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")), 
                StandardCharsets.UTF_8);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        
        // 3. 创建Excel写入器
        try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream()).build()) {
            
            // 导出模型基本信息
            WriteSheet modelSheet = EasyExcel.writerSheet(0, "模型信息").build();
            excelWriter.write(List.of(convertToModelExportDTO(model)), modelSheet);
            
            // 导出模型变量
            List<ModelVariable> variables = modelVariableMapper.selectByModelId(modelId);
            if (!variables.isEmpty()) {
                WriteSheet variableSheet = EasyExcel.writerSheet(1, "模型变量").build();
                List<ModelVariableExportDTO> variableExportDTOs = variables.stream()
                        .map(this::convertToVariableExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(variableExportDTOs, variableSheet);
            }
            
            // 导出图表配置和系列
            List<ChartAnalysisModel> charts = chartAnalysisModelMapper.selectByModelId(modelId);
            if (!charts.isEmpty()) {
                // 导出图表配置
                WriteSheet chartSheet = EasyExcel.writerSheet(2, "图表配置").build();
                List<ChartAnalysisModelExportDTO> chartExportDTOs = charts.stream()
                        .map(this::convertToChartExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(chartExportDTOs, chartSheet);
                
                // 导出图表系列
                List<ChartSeriesExportDTO> allSeriesExportDTOs = charts.stream()
                        .flatMap(chart -> {
                            List<ChartSeries> series = chartSeriesMapper.selectByChartId(chart.getId());
                            return series.stream().map(this::convertToSeriesExportDTO);
                        })
                        .collect(Collectors.toList());
                
                if (!allSeriesExportDTOs.isEmpty()) {
                    WriteSheet seriesSheet = EasyExcel.writerSheet(3, "图表系列").build();
                    excelWriter.write(allSeriesExportDTOs, seriesSheet);
                }
            }
        }
    }
}
```

### 前端实现

#### 1. API服务
```typescript
export class FinancialModelAPI {
  // 导出单个财务模型到Excel
  static async exportModelToExcel(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}/export/excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `财务模型_${id}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // 批量导出财务模型到Excel
  static async exportModelsToExcel(modelIds: number[]): Promise<void> {
    const response = await fetch(`${API_BASE}/export/excel/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modelIds),
    });

    if (!response.ok) {
      throw new Error('批量导出失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `财务模型批量导出_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // 导出所有财务模型到Excel
  static async exportAllModelsToExcel(): Promise<void> {
    const response = await fetch(`${API_BASE}/export/excel/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `财务模型全量导出_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
```

#### 2. 用户界面
```typescript
const FinancialModelManagementV2: React.FC = () => {
  // 状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // 处理Excel导出
  const handleExportToExcel = async (record: FinancialModel) => {
    try {
      setLoading(true);
      await FinancialModelAPI.exportModelToExcel(record.id);
      message.success('Excel导出成功');
    } catch (error) {
      console.error('Excel导出失败:', error);
      message.error(error instanceof Error ? error.message : 'Excel导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理批量导出
  const handleBatchExport = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要导出的模型');
      return;
    }

    try {
      setLoading(true);
      await FinancialModelAPI.exportModelsToExcel(selectedRowKeys);
      message.success('批量导出成功');
    } catch (error) {
      console.error('批量导出失败:', error);
      message.error(error instanceof Error ? error.message : '批量导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理全量导出
  const handleExportAll = async () => {
    try {
      setLoading(true);
      await FinancialModelAPI.exportAllModelsToExcel();
      message.success('全量导出成功');
    } catch (error) {
      console.error('全量导出失败:', error);
      message.error(error instanceof Error ? error.message : '全量导出失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 操作按钮 */}
      <Space>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExportAll}
          disabled={loading}
        >
          全量导出
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleBatchExport}
          disabled={selectedRowKeys.length === 0 || loading}
        >
          批量导出 ({selectedRowKeys.length})
        </Button>
      </Space>

      {/* 数据表格 */}
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[]),
        }}
        columns={[
          // ... 其他列
          {
            title: '操作',
            render: (_, record) => (
              <Space>
                <Tooltip title="导出JSON">
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport(record)}
                  />
                </Tooltip>
                <Tooltip title="导出Excel">
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<DownloadOutlined />}
                    onClick={() => handleExportToExcel(record)}
                  />
                </Tooltip>
              </Space>
            ),
          }
        ]}
      />
    </div>
  );
};
```

## 使用示例

### 1. 单个模型导出
```bash
# 通过API导出
curl -X GET "http://localhost:8080/api/soo/v2/models/123/export/excel" \
  -H "Authorization: Bearer {your-token}" \
  --output "财务模型_123.xlsx"

# 通过前端界面
# 1. 在模型列表中点击"导出Excel"按钮
# 2. 系统自动下载Excel文件
```

### 2. 批量模型导出
```bash
# 通过API导出
curl -X POST "http://localhost:8080/api/soo/v2/models/export/excel/batch" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d "[123, 456, 789]" \
  --output "财务模型批量导出.xlsx"

# 通过前端界面
# 1. 在模型列表中勾选要导出的模型
# 2. 点击"批量导出"按钮
# 3. 系统自动下载Excel文件
```

### 3. 全量模型导出
```bash
# 通过API导出
curl -X GET "http://localhost:8080/api/soo/v2/models/export/excel/all" \
  -H "Authorization: Bearer {your-token}" \
  --output "财务模型全量导出.xlsx"

# 通过前端界面
# 1. 点击"全量导出"按钮
# 2. 系统自动下载Excel文件
```

## 文件格式说明

### Excel文件结构
```
财务模型_123_20241219_143022.xlsx
├── 模型信息 (Sheet 1)
│   ├── 模型ID | 模型编码 | 模型名称 | 模型版本 | 模型分类 | ...
│   └── 123    | MODEL001 | 盈亏平衡分析 | 1.0.0 | breakeven_analysis | ...
├── 模型变量 (Sheet 2)
│   ├── 变量ID | 模型ID | 变量编码 | 变量名称 | 变量类型 | 数据类型 | ...
│   └── 1      | 123    | revenue  | 收入     | INPUT    | DECIMAL  | ...
├── 图表配置 (Sheet 3)
│   ├── 图表ID | 模型ID | 图表名称 | X轴名称 | X轴字段 | Y轴名称 | ...
│   └── 1      | 123    | 盈亏平衡图 | 收入   | revenue | 利润   | ...
└── 图表系列 (Sheet 4)
    ├── 系列ID | 图表ID | 系列名称 | 系列字段 | 系列类型 | 系列值 | ...
    └── 1      | 1      | 利润线   | profit   | variable |        | ...
```

### 数据格式
- **文本字段**: 直接显示
- **数值字段**: 保留原始精度
- **布尔字段**: 显示为"是"/"否"或"true"/"false"
- **时间字段**: 格式化为"yyyy-MM-dd HH:mm:ss"
- **JSON字段**: 保持原始JSON格式

## 性能优化

### 1. 大数据量处理
- 使用流式写入，避免内存溢出
- 分批处理大量数据
- 设置合理的超时时间

### 2. 文件大小控制
- 压缩Excel文件
- 优化数据格式
- 分批导出大量数据

### 3. 用户体验
- 显示导出进度
- 提供取消导出功能
- 优化错误提示

## 安全考虑

### 1. 权限控制
- 验证用户权限
- 限制导出数据范围
- 记录导出操作日志

### 2. 数据安全
- 敏感数据脱敏
- 文件访问控制
- 临时文件清理

### 3. 系统安全
- 防止SQL注入
- 限制文件大小
- 验证文件格式

## 相关文件

### 后端文件
- `FinancialModelExportService.java` - 导出服务接口
- `FinancialModelExportServiceImpl.java` - 导出服务实现
- `FinancialModelExportDTO.java` - 模型导出DTO
- `ModelVariableExportDTO.java` - 变量导出DTO
- `ChartAnalysisModelExportDTO.java` - 图表导出DTO
- `ChartSeriesExportDTO.java` - 系列导出DTO
- `FinancialModelController.java` - 控制器

### 前端文件
- `financialModel.ts` - API服务
- `FinancialModelManagement.tsx` - 管理页面

### 文档文件
- `model_export_feature.md` - 功能文档

## 总结

财务模型导出功能提供了完整的Excel导出解决方案，支持：

1. **多种导出方式**: 单个、批量、全量导出
2. **完整数据覆盖**: 模型、变量、图表、系列数据
3. **用户友好界面**: 直观的操作按钮和进度提示
4. **高性能处理**: 流式写入和内存优化
5. **安全可靠**: 权限控制和数据安全保护

该功能大大提升了财务模型数据的管理效率，便于数据备份、迁移和分享。 