-- 插入图表分析模型示例数据
-- 展示如何使用新的 x_axis_name 和 y_axis_name 字段

INSERT INTO soo_chart_analysis_model (
    model_id,
    chart_name,
    x_axis_name,
    x_axis_field,
    x_axis_unit,
    y_axis_name,
    y_axis_field,
    y_axis_unit,
    chart_type,
    simulation_steps
) VALUES 
-- 示例1: 营业额分析图表
(1, '营业额趋势分析', '时间', 'time', '月', '营业额', 'revenue', '万元', 'line', 1000),

-- 示例2: 成本分析图表  
(1, '成本结构分析', '成本类型', 'cost_type', '', '成本金额', 'cost_amount', '万元', 'bar', 1000),

-- 示例3: 利润分析图表
(1, '利润变化趋势', '月份', 'month', '月', '净利润', 'net_profit', '万元', 'line', 1000),

-- 示例4: 盈亏平衡分析
(1, '盈亏平衡点分析', '销售量', 'sales_volume', '件', '收入/成本', 'revenue_cost', '万元', 'scatter', 1000);

-- 查询验证
SELECT 
    id,
    chart_name,
    x_axis_name,
    x_axis_field,
    x_axis_unit,
    y_axis_name,
    y_axis_field,
    y_axis_unit,
    chart_type,
    simulation_steps
FROM soo_chart_analysis_model 
WHERE model_id = 1
ORDER BY id; 