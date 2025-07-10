# 盈亏平衡分析增强版 PRD 文档

## 1. 项目概述

### 1.1 功能定位
基于现有盈策通决策平台，开发增强版盈亏平衡分析功能。在保留原有功能基础上，新增灵活的模型管理系统，支持自定义计算模型、多场景对比分析和智能预测功能。

### 1.2 核心升级特性
- **智能模型管理**: 支持自定义财务计算模型，灵活配置变量和计算公式
- **多维度分析**: 三种核心场景分析，支持参数敏感性测试
- **实时计算引擎**: 支持API数据源，实现动态数据获取和计算
- **多周期预测**: 月/季/半年/年度多维度指标展示和趋势分析
- **智能决策支持**: 基于机器学习的预测模型和风险预警

### 1.3 业务价值
- **提升决策精度**: 通过多模型对比分析，提供更准确的财务决策依据
- **降低运营风险**: 实时监控关键指标，及时发现潜在风险点
- **优化资源配置**: 基于预测分析，合理配置人力和资源
- **加强成本控制**: 精确计算各类成本，制定有效的成本控制策略

## 2. 系统架构设计

### 2.1 模块架构
```
盈亏平衡分析增强版
├── 财务分析
│   ├── 财务模型定义
│   ├── 变量配置管理
│   ├── 图表管理
│   └── 盈亏平衡分析
```

### 2.2 技术架构
- **计算引擎**: 基于Spring Boot + 表达式引擎(JEXL/MVEL)
- **数据存储**: MySQL 8.0 + Redis缓存
- **实时计算**: 基于观察者模式的响应式计算
- **API集成**: 支持RESTful API和GraphQL查询
- **前端展示**: React + Ant Design + ECharts

## 3. 功能模块详细设计

### 3.1 智能模型管理中心

#### 3.1.1 财务模型定义
**功能描述**: 允许用户创建和管理多个财务计算模型，支持不同业务场景的个性化需求。

**核心功能**:
- **模型创建**: 支持基于模板或从零创建财务模型
- **模型分类**: 按行业、部门、时间周期等维度分类管理
- **模型继承**: 支持基于现有模型创建衍生模型
- **版本管理**: 完整的模型版本历史和回滚功能

**数据模型**:
```sql
-- 财务模型表
CREATE TABLE soo_financial_model (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    model_code VARCHAR(50) UNIQUE NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) DEFAULT '1.0.0',
    model_category VARCHAR(50),
    model_description TEXT,
    parent_model_id BIGINT,
    is_template BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    tenant_id varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户',
    created_by bigint(20) NULL DEFAULT NULL COMMENT '创建人',
    updated_by bigint(20) NULL DEFAULT NULL COMMENT '更新人',
    
);
```

#### 3.1.2 变量配置管理
**功能描述**: 灵活定义模型变量，支持三种变量类型：输入变量、计算变量、API变量。

**变量类型说明**:
- **输入变量(INPUT)**: 用户手动输入的基础数据
- **计算变量(CALC)**: 基于其他变量通过公式计算得出
- **API变量(API)**: 通过API接口实时获取的外部数据

**数据模型**:
```sql
-- 模型变量表
CREATE TABLE soo_model_variable (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    model_id BIGINT NOT NULL,
    variable_code VARCHAR(50) NOT NULL,
    variable_name VARCHAR(100) NOT NULL,
    variable_type ENUM('INPUT','CALC','API') NOT NULL,
    data_type ENUM('NUMBER','DECIMAL','PERCENTAGE','CURRENCY') DEFAULT 'DECIMAL',
    default_value DECIMAL(20,6),
    min_value DECIMAL(20,6),
    max_value DECIMAL(20,6),
    calculation_formula TEXT,
    api_config JSON,
    display_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    is_key_indicator BOOLEAN DEFAULT FALSE,
    validation_rules JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    INDEX idx_model_var (model_id, variable_code)
);
```

#### 3.1.3 计算公式引擎
**功能描述**: 支持复杂的数学表达式和逻辑运算，提供丰富的内置函数库。

**支持的运算类型**:
- **基础运算**: +、-、*、/、%、^（幂运算）
- **逻辑运算**: >、<、>=、<=、==、!=、&&、||
- **数学函数**: SUM、AVG、MAX、MIN、ROUND、ABS等
- **财务函数**: NPV、IRR、PMT、FV、PV等
- **条件函数**: IF、SWITCH、CASE等

**公式示例**:
```javascript
// 基础计算公式
"total_fixed_cost = salary + social_insurance + fixed_cost"

// 条件计算公式  
"performance_bonus = IF(revenue > target_revenue, revenue * 0.05, 0)"

// 复杂财务计算
"breakeven_point = total_fixed_cost / (gross_margin - variable_cost_rate)"

// API数据引用
"market_index = API_GET('market_data', {date: current_date, type: 'index'})"
```

### 3.2 增强计算分析引擎

#### 3.2.1 三大核心场景分析

**场景A: 毛利率敏感性分析**
- 分析不同毛利率(10%/30%/65%)下的盈亏平衡点
- 计算达到目标利润所需的最低毛利率
- 评估毛利率变化对整体财务状况的影响

**场景B: 固定成本影响分析**  
- 模拟固定成本增加对盈亏平衡点的影响
- 分析人员扩张、租金上涨等因素的财务影响
- 计算成本优化后的盈利能力提升

**场景C: 综合敏感性分析**
- 同时变动多个关键参数的影响分析
- 最优参数组合推荐
- 风险阈值设定和预警机制

#### 3.2.2 多周期预测分析
**功能描述**: 基于历史数据和趋势分析，提供多时间维度的财务预测。

**预测维度**:
- **月度预测**: 基于近3-6个月数据的短期预测
- **季度预测**: 考虑季节性因素的中期预测  
- **年度预测**: 结合行业趋势的长期预测
- **滚动预测**: 动态更新的连续12个月预测

**预测算法**:
- **时间序列分析**: ARIMA、指数平滑法
- **回归分析**: 多元线性回归、逻辑回归
- **机器学习**: 随机森林、神经网络
- **集成方法**: 多模型加权预测

### 3.3 实时数据集成服务

#### 3.3.1 API数据接口设计
**功能描述**: 支持从外部系统实时获取数据，实现动态计算和分析。

**支持的数据源类型**:
- **内部系统API**: 人事系统、财务系统、CRM系统
- **第三方API**: 市场数据、汇率信息、行业指标
- **文件数据源**: Excel、CSV文件导入
- **数据库连接**: 其他业务数据库的直连查询

**API配置示例**:
```json
{
  "api_type": "REST",
  "url": "https://api.company.com/hr/salary-total",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer {token}",
    "Content-Type": "application/json"
  },
  "params": {
    "department_id": "${department_id}",
    "month": "${calculation_month}"
  },
  "data_path": "data.total_salary",
  "cache_duration": 3600,
  "retry_config": {
    "max_attempts": 3,
    "backoff_factor": 2
  }
}
```

#### 3.3.2 数据质量监控
**功能描述**: 确保数据的准确性、完整性和时效性。

**监控指标**:
- **数据完整性**: 必要字段的完整率检查
- **数据准确性**: 数据范围和格式验证  
- **数据时效性**: 数据更新频率和延迟监控
- **异常检测**: 基于统计学的异常值识别

## 4. 数据库设计

### 4.1 核心表结构

```

## 5. API接口设计

### 5.1 模型管理接口

```
# 模型管理
POST   /api/soo/v2/models                    # 创建财务模型
GET    /api/soo/v2/models                    # 获取模型列表  
GET    /api/soo/v2/models/{id}               # 获取模型详情
PUT    /api/soo/v2/models/{id}               # 更新模型
DELETE /api/soo/v2/models/{id}               # 删除模型
POST   /api/soo/v2/models/{id}/clone         # 克隆模型

# 变量管理
GET    /api/soo/v2/models/{id}/variables     # 获取模型变量
POST   /api/soo/v2/models/{id}/variables     # 添加变量
PUT    /api/soo/v2/variables/{id}            # 更新变量
DELETE /api/soo/v2/variables/{id}            # 删除变量
POST   /api/soo/v2/variables/validate        # 验证计算公式
```


## 6. 前端界面设计

### 6.1 页面结构

```
盈策通决策平台
├── 盈亏平衡分析
│   ├── 财务模型管理
│   ├── 模型设计器
│   ├── 图表管理
│   └── 盈亏平衡分析
```
--- 
页面逻辑
财务模型管理
  财务模型列表，新增，编辑、删除、以及模型变量管理
变量配置管理
  变量列表、编辑、新增、删除
模型图标管理
 显示所有的财务模型的图表配置、可以新增、修改、可以查看历史的版本数据
盈亏平衡分析
  加载模型、填写模型参数，然后立即分析，下面显示分析数据
指标	当月	当季	半年	年度
总固定成本	3084378.74	N/A	N/A	N/A
当月净利润	-807378.74	N/A	N/A	N/A
盈亏平衡点 (营业额)	13410342.34	40231027.03	80462054.05	160924108.11

同时下面显示模型对应的图表
显示图表的参数
已经渲染好的图表，修改图表的参数，可以动态渲染图表

### 6.2 核心页面设计

#### 6.2.1 模型设计器
**功能描述**: 拖拽式模型构建界面，支持可视化编辑财务计算模型。

**界面元素**:
- 变量面板：显示所有可用变量，支持拖拽添加
- 公式编辑器：代码高亮的公式编辑界面
- 预览面板：实时显示模型结构和计算流程
- 验证工具：公式语法检查和逻辑验证

#### 6.2.2 盈亏平衡分析
**功能描述**: 选择模型，填写参数，然后执行分析，支持动态试算
图表区支持自定义图标，可以添加多个图表，按场景选择x轴 y轴 以及参数后 动态显示

#### 6.2.3 盈亏平衡分析图表
我现在还要扩展下模型表，增加一个模型图标关联表，用户可以自定义一个图表， 定义图标的X轴 Y轴 以及分类 ，执行模型时，产生的数据形成图标展示
下面是我的表设计开头，请帮我完善
-- 图表分析模型配置表
CREATE TABLE soo_chart_analysis_model (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '图表分析模型ID',
    model_id BIGINT NOT NULL COMMENT '关联的模型ID',
    chart_name VARCHAR(100) NOT NULL COMMENT '图表名称',
x轴对应字段 x轴单位 
y轴对应字段 y轴单位
指标项--可能有多个，比如综合毛利率10% 30% 65% 以及总成本 作为指标项，统计在x轴总营收增加的时，对应总的利润，利润与总成本的交点就是盈亏平衡点

设计如下：
 1. 图表分析模型配置表（soo_chart_analysis_model）：
    - id: 主键
    - model_id: 关联的模型ID
    - chart_name: 图表名称
    - x_axis_field: X轴对应的变量key（例如：'revenue'）
    - x_axis_unit: X轴单位（如：元，万元等）
    - y_axis_field: 主Y轴对应的变量key（注意：这里我们简化设计，先只支持一个Y轴。但实际中可能有多个Y轴？如果支持多个Y轴，则可能需要另一个表，但这里我们先按一个Y轴设计，如果有多个指标项，它们都使用同一个Y轴）
    - y_axis_unit: Y轴单位
 但是，考虑到一个图表可能有多个数据系列（例如：在同一个图中绘制多条线，分别代表不同毛利率下的利润曲线），因此我们需要一个系列表来存储每个系列。
 2. 图表系列表（soo_chart_series）：
    - id: 主键
    - chart_id: 关联的图表配置ID
    - series_name: 系列名称（例如：毛利率10%的利润曲线）
    - series_field: 该系列对应的变量key（注意：这个字段可能是一个计算表达式？但这里我们存储的是变量key，因为我们的模型运行数据中存储了各个变量的值。但是，如果系列需要计算，则需要在模型变量中定义好，然后这里引用变量key）
    - sort_order: 排序（用于控制系列显示顺序）
 这样，在生成图表时，我们可以根据图表的x_axis_field和每个系列的series_field，从模型运行数据中获取数据点。
 但是，这里有一个问题：我们的模型运行数据是固定的（即一次运行只产生一组数据），而图表可能需要多组数据（比如X轴是营业额，我们可能需要营业额从0到某个最大值，步进增加，然后计算每个营业额下的净利润）。所以，我们需要的是模拟数据，而不是一次运行的数据。
 因此，我们需要扩展模型运行的概念：对于图表，我们可能需要根据用户设置的X轴范围（最小值，最大值，步长）来模拟生成一系列数据点。所以，我们还需要在图表配置中增加模拟参数。
 调整设计：
 在图表配置表中增加：
    - simulate_min: X轴模拟最小值
    - simulate_max: X轴模拟最大值
    - simulate_step: 模拟步长
 这样，在生成图表数据时，我们将根据simulate_min到simulate_max，以simulate_step为步长，生成一系列的模拟点。然后，对于每个模拟点，我们使用模型中的公式计算各个指标项的值。
 注意：在计算时，我们需要将模拟点赋值给X轴对应的变量，然后重新计算整个模型（但只改变X轴对应的变量，其他变量保持不变）。所以，这实际上是一次模型运行的多次模拟。
 因此，我们需要记录图表模拟运行的基础运行ID（即用户输入的基础数据运行ID），然后在此基础上改变X轴变量进行模拟。
 但是，由于模拟计算可能很频繁，我们可以在用户请求图表数据时实时计算，而不需要存储模拟过程，只存储配置。
 所以，图表配置表修改为：
 CREATE TABLE soo_chart_analysis_model (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '图表分析模型ID',
    model_id BIGINT NOT NULL COMMENT '关联的模型ID',
    chart_name VARCHAR(100) NOT NULL COMMENT '图表名称',
    x_axis_field VARCHAR(50) NOT NULL COMMENT 'X轴对应的变量key',
    x_axis_unit VARCHAR(20) COMMENT 'X轴单位',
    y_axis_field VARCHAR(50) NOT NULL COMMENT 'Y轴对应的变量key（主Y轴）',
    y_axis_unit VARCHAR(20) COMMENT 'Y轴单位',
    simulate_min DECIMAL(15,2) NOT NULL COMMENT '模拟最小值',
    simulate_max DECIMAL(15,2) NOT NULL COMMENT '模拟最大值',
    simulate_step DECIMAL(15,2) NOT NULL COMMENT '模拟步长',
    base_run_id BIGINT COMMENT '基础运行ID（用户运行模型时保存的运行数据，作为其他变量的基础值）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (model_id) REFERENCES financial_model(id)
 ) COMMENT '图表分析模型配置表';
 然后，系列表：
 CREATE TABLE soo_chart_series (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '系列ID',
    chart_id BIGINT NOT NULL COMMENT '关联的图表配置ID',
    series_name VARCHAR(100) NOT NULL COMMENT '系列名称',
    series_field VARCHAR(50) NOT NULL COMMENT '该系列对应的变量key（在模型变量中定义）',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (chart_id) REFERENCES soo_chart_analysis_model(id)
 ) COMMENT '图表系列配置表';
 这样，当用户请求图表的模拟数据时，我们可以：
 1. 根据chart_id获取图表配置和所有系列。
 2. 获取基础运行数据（base_run_id对应的运行数据）作为基础变量值（除了X轴变量，因为X轴变量要模拟变化）。
 3. 从simulate_min到simulate_max，按步长simulate_step生成X轴的值。
 4. 对于每个X轴的值，将基础变量中的X轴变量替换为当前模拟值，然后根据模型公式计算所有变量（注意：由于变量之间可能有依赖，需要按依赖顺序计算）。
 5. 对于每个系列，取出该系列对应的变量（series_field）的值，作为Y轴的值。
 6. 返回数据格式为：
    {
        xAxis: [x0, x1, x2, ...],
        series: [
            { name: '系列1', data: [y10, y11, y12, ...] },
            { name: '系列2', data: [y20, y21, y22, ...] },
            ...
        ]
    }
 注意：由于模型计算可能涉及多个变量依赖，我们需要确保变量计算的顺序（按照变量定义的依赖关系进行拓扑排序）。在模型变量表中，我们可以记录每个变量的表达式，表达式可能引用其他变量。因此，在计算时，我们需要解析表达式并按照依赖关系计算
 
 
 def generate_chart_data(chart_id, run_id):
    """
    生成图表模拟数据
    """
    # 获取图表配置
    chart = get_chart_config(chart_id)
    
    # 获取基础运行数据
    base_data = get_run_data(run_id)
    
    # 获取系列配置
    series_list = get_chart_series(chart_id)
    
    # 确定模拟范围
    min_x = base_data[chart.x_axis_field] * 0.5
    max_x = base_data[chart.x_axis_field] * 2.0
    step = (max_x - min_x) / chart.simulation_steps
    
    # 存储模拟结果
    results = []
    
    # 遍历每个X轴点
    for i in range(chart.simulation_steps + 1):
        x_value = min_x + i * step
        
        # 遍历每个系列
        for series in series_list:
            # 复制基础数据
            sim_data = base_data.copy()
            
            # 设置当前X值
            sim_data[chart.x_axis_field] = x_value
            
            # 如果是变量系列，覆盖特定值
            if series.series_type == 'variable':
                sim_data[series.series_field] = series.series_value
            
            # 计算所有变量
            calculated_data = calculate_model(sim_data)
            
            # 获取Y值
            y_value = calculated_data[chart.y_axis_field]
            
            # 存储结果
            save_simulation(
                run_id, 
                chart_id,
                x_value,
                series.id,
                y_value
            )
            results.append((x_value, series.id, y_value))
    
    return results
---

**文档版本**: v2.0  
**创建日期**: 2024-12-19  
**更新日期**: 2024-12-19  
**作者**: Portal 3.0 开发团队 