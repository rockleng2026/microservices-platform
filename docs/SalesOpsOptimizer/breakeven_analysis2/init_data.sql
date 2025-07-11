-- ===================================================================
-- 财务分析模块 - 表初始化数据
-- 创建时间：2024-01-15
-- 说明：为财务分析模块的各个表插入示例数据
-- ===================================================================

-- 清理现有数据（谨慎使用）
-- DELETE FROM soo_chart_simulation WHERE 1=1;
-- DELETE FROM soo_chart_series WHERE 1=1;
-- DELETE FROM soo_chart_analysis_model WHERE 1=1;
-- DELETE FROM soo_calculation_instance WHERE 1=1;
-- DELETE FROM soo_model_variable WHERE 1=1;
-- DELETE FROM soo_financial_model WHERE 1=1;

-- ===================================================================
-- 1. 财务模型基础数据
-- ===================================================================

INSERT INTO soo_financial_model (
    model_name, model_code, model_category, model_description, is_active, version,
    is_template, created_by, created_time, updated_time
) VALUES 
(
    '盈亏平衡分析模型', 
    'BREAKEVEN_001', 
    'breakeven_analysis',
    '用于分析企业在何种销售水平下能够实现收支平衡的财务模型。包含固定成本、变动成本、销售价格等关键变量。',
    'active',
    '1.0.0',
    true,
    'system',
    NOW(),
    NOW()
),
(
    '成本效益分析模型', 
    'COST_BENEFIT_001', 
    'cost_benefit', 
    '分析项目或决策的成本与效益，帮助评估投资回报率和经济可行性。', 
    'active',
    '1.0.0',
    true,
    'system',
    NOW(),
    NOW()
),
(
    '敏感性分析模型', 
    'SENSITIVITY_001', 
    'sensitivity_analysis', 
    '评估关键参数变化对财务结果的影响程度，识别风险因素和关键驱动因子。', 
    'active',
    '1.0.0',
    true,
    'system',
    NOW(),
    NOW()
),
(
    '现金流预测模型', 
    'CASHFLOW_001', 
    'cashflow_forecast', 
    '预测企业未来现金流入和流出，评估流动性风险和资金需求。', 
    'active',
    '1.0.0',
    false,
    'system',
    NOW(),
    NOW()
);

-- ===================================================================
-- 2. 模型变量配置数据
-- ===================================================================

-- 盈亏平衡分析模型变量 (model_id = 1)
INSERT INTO soo_model_variable (
    financial_model_id, variable_name, variable_code, variable_type, data_type,
    default_value, unit, description, is_required, calculation_formula,
    validation_rules, display_order, is_visible, created_by, created_time, updated_time
) VALUES 
-- 输入变量
(1, '销售数量', 'sales_volume', 'input', 'number', '0', '件', '产品的销售数量', true, NULL, '{"min": 0, "max": 1000000}', 1, true, 'system', NOW(), NOW()),
(1, '销售单价', 'unit_price', 'input', 'number', '100', '元', '产品的销售单价', true, NULL, '{"min": 0.01}', 2, true, 'system', NOW(), NOW()),
(1, '固定成本', 'fixed_cost', 'input', 'number', '10000', '元', '不随销量变化的固定成本', true, NULL, '{"min": 0}', 3, true, 'system', NOW(), NOW()),
(1, '单位变动成本', 'variable_cost', 'unit_price', 'input', 'number', '50', '元', '每单位产品的变动成本', true, NULL, '{"min": 0}', 4, true, 'system', NOW(), NOW()),
(1, '税率', 'tax_rate', 'input', 'number', '0.25', '%', '企业所得税率', false, NULL, '{"min": 0, "max": 1}', 5, true, 'system', NOW(), NOW()),

-- 计算变量
(1, '总收入', 'total_revenue', 'calculated', 'number', NULL, '元', '销售总收入', false, 'sales_volume * unit_price', NULL, 6, true, 'system', NOW(), NOW()),
(1, '总变动成本', 'total_variable_cost', 'calculated', 'number', NULL, '元', '总变动成本', false, 'sales_volume * variable_cost', NULL, 7, true, 'system', NOW(), NOW()),
(1, '总成本', 'total_cost', 'calculated', 'number', NULL, '元', '总成本', false, 'fixed_cost + total_variable_cost', NULL, 8, true, 'system', NOW(), NOW()),
(1, '税前利润', 'profit_before_tax', 'calculated', 'number', NULL, '元', '税前利润', false, 'total_revenue - total_cost', NULL, 9, true, 'system', NOW(), NOW()),
(1, '税后利润', 'profit_after_tax', 'calculated', 'number', NULL, '元', '税后利润', false, 'profit_before_tax * (1 - tax_rate)', NULL, 10, true, 'system', NOW(), NOW()),
(1, '盈亏平衡点', 'breakeven_point', 'calculated', 'number', NULL, '件', '盈亏平衡销售数量', false, 'fixed_cost / (unit_price - variable_cost)', NULL, 11, true, 'system', NOW(), NOW()),
(1, '边际贡献率', 'contribution_margin_ratio', 'calculated', 'number', NULL, '%', '边际贡献率', false, '(unit_price - variable_cost) / unit_price', NULL, 12, true, 'system', NOW(), NOW()),

-- 常量
(1, '分析周期', 'analysis_period', 'constant', 'string', '年度', NULL, '分析的时间周期', false, NULL, NULL, 13, false, 'system', NOW(), NOW());

-- 成本效益分析模型变量 (model_id = 2)
INSERT INTO soo_model_variable (
    financial_model_id, variable_name, variable_code, variable_type, data_type,
    default_value, unit, description, is_required, calculation_formula,
    validation_rules, display_order, is_visible, created_by, created_time, updated_time
) VALUES 
(2, '初始投资', 'initial_investment', 'input', 'number', '100000', '元', '项目初始投资金额', true, NULL, '{"min": 0}', 1, true, 'system', NOW(), NOW()),
(2, '年收益', 'annual_benefit', 'input', 'number', '30000', '元', '项目年收益', true, NULL, '{"min": 0}', 2, true, 'system', NOW(), NOW()),
(2, '年成本', 'annual_cost', 'input', 'number', '15000', '元', '项目年成本', true, NULL, '{"min": 0}', 3, true, 'system', NOW(), NOW()),
(2, '项目周期', 'project_period', 'input', 'number', '5', '年', '项目生命周期', true, NULL, '{"min": 1, "max": 50}', 4, true, 'system', NOW(), NOW()),
(2, '折现率', 'discount_rate', 'input', 'number', '0.08', '%', '资本成本或期望收益率', true, NULL, '{"min": 0, "max": 1}', 5, true, 'system', NOW(), NOW()),
(2, '净现值', 'npv', 'calculated', 'number', NULL, '元', '净现值', false, 'NPV(discount_rate, annual_benefit - annual_cost, project_period) - initial_investment', NULL, 6, true, 'system', NOW(), NOW()),
(2, '内部收益率', 'irr', 'calculated', 'number', NULL, '%', '内部收益率', false, 'IRR(initial_investment, annual_benefit - annual_cost, project_period)', NULL, 7, true, 'system', NOW(), NOW()),
(2, '投资回报率', 'roi', 'calculated', 'number', NULL, '%', '投资回报率', false, '((annual_benefit - annual_cost) * project_period - initial_investment) / initial_investment', NULL, 8, true, 'system', NOW(), NOW());

-- ===================================================================
-- 3. 图表分析模型数据
-- ===================================================================

INSERT INTO soo_chart_analysis_model (
    model_id, chart_name, chart_type, x_axis_field, x_axis_unit,
    y_axis_field, y_axis_unit, simulation_steps, description, 
    is_active, version, created_by, created_time, updated_time
) VALUES 
(
    1, 
    '盈亏平衡分析图', 
    'line', 
    'sales_volume', 
    '件',
    'profit_after_tax', 
    '元', 
    100, 
    '展示销售数量与利润的关系曲线，包含盈亏平衡点分析', 
    true, 
    '1.0.0',
    'system',
    NOW(),
    NOW()
),
(
    1, 
    '成本结构分析图', 
    'bar', 
    'cost_category', 
    NULL,
    'cost_amount', 
    '元', 
    10, 
    '展示固定成本和变动成本的构成比例', 
    true, 
    '1.0.0',
    'system',
    NOW(),
    NOW()
),
(
    2, 
    '现金流分析图', 
    'line', 
    'period', 
    '年',
    'cash_flow', 
    '元', 
    20, 
    '展示项目各年度现金流情况', 
    true, 
    '1.0.0',
    'system',
    NOW(),
    NOW()
),
(
    3, 
    '敏感性分析散点图', 
    'scatter', 
    'parameter_change', 
    '%',
    'impact_value', 
    '元', 
    50, 
    '显示关键参数变化对财务指标的影响程度', 
    true, 
    '1.0.0',
    'system',
    NOW(),
    NOW()
);

-- ===================================================================
-- 4. 图表系列配置数据
-- ===================================================================

INSERT INTO soo_chart_series (
    chart_model_id, series_name, formula_expression, series_color,
    line_style, is_visible, display_order, created_by, created_time, updated_time
) VALUES 
-- 盈亏平衡分析图系列 (chart_model_id = 1)
(1, '利润线', 'total_revenue - total_cost', '#1890ff', 'solid', true, 1, 'system', NOW(), NOW()),
(1, '总收入线', 'sales_volume * unit_price', '#52c41a', 'solid', true, 2, 'system', NOW(), NOW()),
(1, '总成本线', 'fixed_cost + sales_volume * variable_cost', '#faad14', 'solid', true, 3, 'system', NOW(), NOW()),
(1, '盈亏平衡线', '0', '#ff4d4f', 'dashed', true, 4, 'system', NOW(), NOW()),

-- 成本结构分析图系列 (chart_model_id = 2)  
(2, '固定成本', 'fixed_cost', '#1890ff', 'solid', true, 1, 'system', NOW(), NOW()),
(2, '变动成本', 'total_variable_cost', '#52c41a', 'solid', true, 2, 'system', NOW(), NOW()),

-- 现金流分析图系列 (chart_model_id = 3)
(3, '现金流入', 'annual_benefit', '#52c41a', 'solid', true, 1, 'system', NOW(), NOW()),
(3, '现金流出', 'annual_cost + initial_investment / project_period', '#ff4d4f', 'solid', true, 2, 'system', NOW(), NOW()),
(3, '净现金流', 'annual_benefit - annual_cost', '#1890ff', 'solid', true, 3, 'system', NOW(), NOW()),

-- 敏感性分析散点图系列 (chart_model_id = 4)
(4, '销售价格敏感性', 'unit_price_change_impact', '#1890ff', 'solid', true, 1, 'system', NOW(), NOW()),
(4, '成本敏感性', 'cost_change_impact', '#ff4d4f', 'solid', true, 2, 'system', NOW(), NOW());

-- ===================================================================
-- 5. 计算实例示例数据
-- ===================================================================

INSERT INTO soo_calculation_instance (
    financial_model_id, instance_name, input_parameters, calculation_results,
    execution_time, status, created_by, created_time, updated_time
) VALUES 
(
    1,
    '2024年Q1盈亏平衡分析',
    '{"sales_volume": 500, "unit_price": 120, "fixed_cost": 15000, "variable_cost": 60, "tax_rate": 0.25}',
    '{"total_revenue": 60000, "total_cost": 45000, "profit_before_tax": 15000, "profit_after_tax": 11250, "breakeven_point": 250, "contribution_margin_ratio": 0.5}',
    2.15,
    'completed',
    'user_001',
    NOW() - INTERVAL 7 DAY,
    NOW() - INTERVAL 7 DAY
),
(
    1,
    '产品A盈亏平衡分析',
    '{"sales_volume": 800, "unit_price": 100, "fixed_cost": 20000, "variable_cost": 50, "tax_rate": 0.25}',
    '{"total_revenue": 80000, "total_cost": 60000, "profit_before_tax": 20000, "profit_after_tax": 15000, "breakeven_point": 400, "contribution_margin_ratio": 0.5}',
    1.89,
    'completed',
    'user_002',
    NOW() - INTERVAL 3 DAY,
    NOW() - INTERVAL 3 DAY
),
(
    2,
    '设备采购投资分析',
    '{"initial_investment": 200000, "annual_benefit": 80000, "annual_cost": 30000, "project_period": 5, "discount_rate": 0.1}',
    '{"npv": 189539.75, "irr": 0.245, "roi": 1.25}',
    3.42,
    'completed',
    'user_001',
    NOW() - INTERVAL 1 DAY,
    NOW() - INTERVAL 1 DAY
);

-- ===================================================================
-- 6. 图表模拟数据
-- ===================================================================

INSERT INTO soo_chart_simulation (
    chart_model_id, simulation_name, parameter_values, chart_data,
    simulation_time, created_by, created_time
) VALUES 
(
    1,
    '盈亏平衡模拟_基准场景',
    '{"unit_price": 100, "fixed_cost": 10000, "variable_cost": 50, "tax_rate": 0.25}',
    '[{"sales_volume": 0, "profit": -10000, "revenue": 0, "total_cost": 10000}, {"sales_volume": 100, "profit": -5000, "revenue": 10000, "total_cost": 15000}, {"sales_volume": 200, "profit": 0, "revenue": 20000, "total_cost": 20000}, {"sales_volume": 300, "profit": 5000, "revenue": 30000, "total_cost": 25000}]',
    1.23,
    'system',
    NOW()
),
(
    2,
    '成本结构模拟_标准配置',
    '{"fixed_cost": 10000, "variable_cost_per_unit": 50, "sales_volume": 500}',
    '[{"category": "固定成本", "amount": 10000}, {"category": "变动成本", "amount": 25000}]',
    0.85,
    'system',
    NOW()
);

-- ===================================================================
-- 7. 系统配置数据
-- ===================================================================

-- 可以添加一些系统级别的配置，如计算引擎参数、默认设置等
-- INSERT INTO soo_system_config (config_key, config_value, description) VALUES 
-- ('calculation_timeout', '30', '计算超时时间(秒)'),
-- ('max_simulation_steps', '1000', '最大模拟步数'),
-- ('default_chart_theme', 'blue', '默认图表主题');

-- ===================================================================
-- 查询验证数据
-- ===================================================================

-- 验证数据插入结果
SELECT 'Financial Models Count' as Table_Name, COUNT(*) as Record_Count FROM soo_financial_model
UNION ALL
SELECT 'Model Variables Count', COUNT(*) FROM soo_model_variable  
UNION ALL
SELECT 'Chart Models Count', COUNT(*) FROM soo_chart_analysis_model
UNION ALL
SELECT 'Chart Series Count', COUNT(*) FROM soo_chart_series
UNION ALL
SELECT 'Calculation Instances Count', COUNT(*) FROM soo_calculation_instance
UNION ALL
SELECT 'Chart Simulations Count', COUNT(*) FROM soo_chart_simulation;

-- 查看盈亏平衡分析模型的完整配置
SELECT 
    fm.model_name,
    fm.model_code,
    mv.variable_name,
    mv.variable_code,
    mv.variable_type,
    mv.default_value,
    mv.unit,
    mv.description
FROM soo_financial_model fm
LEFT JOIN soo_model_variable mv ON fm.id = mv.financial_model_id
WHERE fm.model_code = 'BREAKEVEN_001'
ORDER BY mv.display_order;

COMMIT; 