我们设计一个图表分析模型配置表，用于存储用户自定义的图表设置。每个图表关联一个模型（model_id），并定义图表的名称（chart_name）、X轴、Y轴以及指标项（可能多个）等。
考虑到指标项可能有多个，我们需要一个单独的表来存储每个图表对应的指标项（即系列）。因此，我们将图表的基本配置放在`soo_chart_analysis_model`表中，而将图表包含的指标项（系列）放在另一个表`soo_chart_series`中。
另外，我们还需要定义X轴和Y轴对应的字段（即模型中的变量key）以及单位。
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
   注意：由于模型计算可能涉及多个变量依赖，我们需要确保变量计算的顺序（按照变量定义的依赖关系进行拓扑排序）。在模型变量表中，我们可以记录每个变量的表达式，表达式可能引用其他变量。因此，在计算时，我们需要解析表达式并按照依赖关系计算。
   这个计算逻辑在服务端实现。
   另外，我们允许用户不指定基础运行ID（base_run_id可以为空），那么我们就使用模型变量的默认值（如果有）或者0？但是这样可能没有意义。所以，通常用户需要先运行一次模型（得到基础运行数据），然后基于这次运行的数据进行模拟。
   因此，我们要求base_run_id不能为空。
   修改：base_run_id设置为NOT NULL。
   但是，我们也可以考虑另一种情况：用户可能没有运行模型，而是手动输入了一些基础值？那么我们可以允许用户手动设置基础值（即不依赖运行记录）。这样，我们需要在图表配置中允许用户设置基础值。这会使问题复杂化。我们先按照基于运行记录的方式设计。
   所以，最终表结构如下：
   图表分析模型扩展设计
   表结构设计
   sql
   -- 图表分析模型配置表
   CREATE TABLE soo_chart_analysis_model (
   id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '图表分析模型ID',
   model_id BIGINT NOT NULL COMMENT '关联的模型ID',
   chart_name VARCHAR(100) NOT NULL COMMENT '图表名称',
   x_axis_field VARCHAR(50) NOT NULL COMMENT 'X轴对应字段标识',
   x_axis_unit VARCHAR(20) COMMENT 'X轴单位',
   y_axis_field VARCHAR(50) NOT NULL COMMENT 'Y轴对应字段标识',
   y_axis_unit VARCHAR(20) COMMENT 'Y轴单位',
   chart_type ENUM('line', 'bar', 'scatter') DEFAULT 'line' COMMENT '图表类型',
   simulation_steps INT DEFAULT 10 COMMENT '模拟步数',
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   FOREIGN KEY (model_id) REFERENCES financial_model(id) ON DELETE CASCADE
   ) COMMENT '图表分析模型配置表';

-- 图表指标系列表
CREATE TABLE soo_chart_series (
id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '系列ID',
chart_id BIGINT NOT NULL COMMENT '关联图表ID',
series_name VARCHAR(100) NOT NULL COMMENT '系列名称',
series_field VARCHAR(50) NOT NULL COMMENT '对应字段标识',
series_type ENUM('fixed', 'variable') DEFAULT 'fixed' COMMENT '系列类型',
series_value DECIMAL(15,4) COMMENT '固定系列值',
color VARCHAR(20) COMMENT '系列颜色',
sort_order INT DEFAULT 0 COMMENT '排序',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
FOREIGN KEY (chart_id) REFERENCES soo_chart_analysis_model(id) ON DELETE CASCADE
) COMMENT '图表指标系列配置表';

-- 图表模拟结果表
CREATE TABLE soo_chart_simulation (
id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模拟结果ID',
run_id BIGINT NOT NULL COMMENT '关联模型运行ID',
chart_id BIGINT NOT NULL COMMENT '关联图表ID',
x_value DECIMAL(15,2) NOT NULL COMMENT 'X轴值',
series_id BIGINT NOT NULL COMMENT '关联系列ID',
y_value DECIMAL(15,2) NOT NULL COMMENT 'Y轴值',
calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '计算时间',
FOREIGN KEY (run_id) REFERENCES model_run(id) ON DELETE CASCADE,
FOREIGN KEY (chart_id) REFERENCES soo_chart_analysis_model(id) ON DELETE CASCADE,
FOREIGN KEY (series_id) REFERENCES soo_chart_series(id) ON DELETE CASCADE
) COMMENT '图表模拟结果存储表';
图表分析模型示例（盈亏平衡分析）
1. 图表配置
   sql
   INSERT INTO soo_chart_analysis_model
   (model_id, chart_name, x_axis_field, x_axis_unit, y_axis_field, y_axis_unit, chart_type, simulation_steps)
   VALUES
   (1, '盈亏平衡分析', 'revenue', '元', 'net_profit', '元', 'line', 20);
2. 指标系列配置
   sql
   -- 固定成本线
   INSERT INTO soo_chart_series
   (chart_id, series_name, series_field, series_type, color)
   VALUES
   (1, '固定成本', 'total_fixed_cost', 'fixed', '#FF5733');

-- 不同毛利率的利润线
INSERT INTO soo_chart_series
(chart_id, series_name, series_field, series_type, series_value, color)
VALUES
(1, '毛利率10%', 'net_profit', 'variable', 0.10, '#33FF57'),
(1, '毛利率30%', 'net_profit', 'variable', 0.30, '#3357FF'),
(1, '毛利率65%', 'net_profit', 'variable', 0.65, '#F333FF');
图表数据生成逻辑
python
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
盈亏平衡点图表说明
图表要素：
X轴：营业额（从基准值的50%到200%）

Y轴：净利润

系列：

红色水平线：总固定成本（不随营业额变化）

绿色线：毛利率10%时的利润线

蓝色线：毛利率30%时的利润线

紫色线：毛利率65%时的利润线

分析点：
盈亏平衡点：各利润线与固定成本线的交点

利润增长斜率：毛利率越高，利润线斜率越大

安全边际：当前营业额与盈亏平衡点的差距

图表数据查询示例
sql
-- 获取图表模拟数据
SELECT
s.series_name,
c.x_value,
c.y_value
FROM soo_chart_simulation c
JOIN soo_chart_series s ON c.series_id = s.id
WHERE c.run_id = 123
AND c.chart_id = 1
ORDER BY s.sort_order, c.x_value;
前端展示示例（ECharts）
javascript
// 基于查询结果生成图表
function renderBreakevenChart(data) {
const chart = echarts.init(document.getElementById('chart-container'));

    const series = [];
    const legendData = [];
    
    // 组织数据系列
    data.forEach(item => {
        if (!series[item.series_name]) {
            series[item.series_name] = {
                name: item.series_name,
                type: 'line',
                data: []
            };
            legendData.push(item.series_name);
        }
        series[item.series_name].data.push([item.x_value, item.y_value]);
    });
    
    // 图表配置
    const option = {
        title: { text: '盈亏平衡分析' },
        tooltip: { trigger: 'axis' },
        legend: { data: legendData },
        xAxis: {
            name: '营业额',
            type: 'value',
            axisLabel: { formatter: '{value} 元' }
        },
        yAxis: {
            name: '净利润',
            type: 'value',
            axisLabel: { formatter: '{value} 元' }
        },
        series: Object.values(series)
    };
    
    chart.setOption(option);
}
扩展功能设计
图表模板库：

预置常用财务分析图表模板

用户可基于模板快速创建新图表

交叉分析：

sql
-- 示例：不同固定成本下的盈亏平衡点
INSERT INTO soo_chart_series
(chart_id, series_name, series_field, series_type, series_value)
VALUES
(1, '固定成本+10%', 'total_fixed_cost', 'variable', 'base*1.1'),
(1, '固定成本+20%', 'total_fixed_cost', 'variable', 'base*1.2');
动态参数：

允许用户调整模拟范围和步长

支持参数化公式（如 base*1.1）

多模型对比：

在同一图表中展示不同模型的结果

对比不同业务场景下的盈亏平衡点

智能标注：

自动标记盈亏平衡点

计算并显示安全边际区域

这套设计实现了灵活可扩展的图表分析系统，用户可以通过配置不同的X轴、Y轴和指标系列，生成多种财务分析图表，特别是盈亏平衡分析图表，直观展示不同变量对盈亏平衡点的影响