-- ===================================================================
-- 财务分析模块 - 表初始化数据（修正版）
-- 创建时间：2024-01-15
-- 说明：为财务分析模块的各个表插入示例数据，基于database_design.sql的表结构
-- ===================================================================

-- 清理现有数据（谨慎使用）
-- DELETE FROM soo_chart_simulation WHERE 1=1;
-- DELETE FROM soo_chart_series WHERE 1=1;
-- DELETE FROM soo_chart_analysis_model WHERE 1=1;
-- DELETE FROM soo_variable_dependency WHERE 1=1;
-- DELETE FROM soo_model_variable WHERE 1=1;
-- DELETE FROM soo_financial_model WHERE 1=1;

-- ===================================================================
-- 1. 财务模型基础数据
-- ===================================================================

INSERT INTO soo_financial_model (
    model_code, model_name, model_version, model_category, model_description, 
    is_template, is_active, creator_name, tenant_id, created_at, updated_at
) VALUES 
(
    'BREAKEVEN_001', 
    '盈亏平衡分析模型',
    '1.0.0', 
    'breakeven_analysis', 
    '用于分析企业在何种销售水平下能够实现收支平衡的财务模型。包含固定成本、变动成本、销售价格等关键变量。', 
    true,
    true,
    'system',
    'default',
    NOW(),
    NOW()
),
(
    'COST_BENEFIT_001', 
    '成本效益分析模型',
    '1.0.0', 
    'cost_benefit', 
    '分析项目或决策的成本与效益，帮助评估投资回报率和经济可行性。', 
    true,
    true,
    'system',
    'default',
    NOW(),
    NOW()
),
(
    'SENSITIVITY_001', 
    '敏感性分析模型',
    '1.0.0', 
    'sensitivity_analysis', 
    '评估关键参数变化对财务结果的影响程度，识别风险因素和关键驱动因子。', 
    true,
    true,
    'system',
    'default',
    NOW(),
    NOW()
),
(
    'CASHFLOW_001', 
    '现金流预测模型',
    '1.0.0', 
    'cashflow_forecast', 
    '预测企业未来现金流入和流出，评估流动性风险和资金需求。', 
    false,
    true,
    'system',
    'default',
    NOW(),
    NOW()
);

-- ===================================================================
-- 2. 模型变量配置数据
-- ===================================================================

-- 盈亏平衡分析模型变量 (model_id = 1)
INSERT INTO soo_model_variable (
    model_id, variable_code, variable_name, variable_type, data_type,
    default_value, min_value, max_value, unit, calculation_formula,
    display_order, is_required, is_key_indicator, is_visible, 
    description, help_text, created_at, updated_at
) VALUES 
-- 输入变量
(1, 'sales_volume', '销售数量', 'INPUT', 'DECIMAL', 0, 0, 1000000, '件', NULL, 1, true, false, true, '产品的销售数量', '请输入预期的产品销售数量', NOW(), NOW()),
(1, 'unit_price', '销售单价', 'INPUT', 'CURRENCY', 100, 0.01, NULL, '元', NULL, 2, true, false, true, '产品的销售单价', '请输入产品的市场销售价格', NOW(), NOW()),
(1, 'fixed_cost', '固定成本', 'INPUT', 'CURRENCY', 10000, 0, NULL, '元', NULL, 3, true, false, true, '不随销量变化的固定成本', '包括租金、管理费用等固定支出', NOW(), NOW()),
(1, 'variable_cost', '单位变动成本', 'INPUT', 'CURRENCY', 50, 0, NULL, '元', NULL, 4, true, false, true, '每单位产品的变动成本', '包括原料成本、直接人工等', NOW(), NOW()),
(1, 'tax_rate', '税率', 'INPUT', 'PERCENTAGE', 0.25, 0, 1, '%', NULL, 5, false, false, true, '企业所得税率', '当前适用的企业所得税率', NOW(), NOW()),

-- 计算变量
(1, 'total_revenue', '总收入', 'CALC', 'CURRENCY', NULL, NULL, NULL, '元', 'sales_volume * unit_price', 6, false, true, true, '销售总收入', '总收入 = 销售数量 × 单价', NOW(), NOW()),
(1, 'total_variable_cost', '总变动成本', 'CALC', 'CURRENCY', NULL, NULL, NULL, '元', 'sales_volume * variable_cost', 7, false, false, true, '总变动成本', '总变动成本 = 销售数量 × 单位变动成本', NOW(), NOW()),
(1, 'total_cost', '总成本', 'CALC', 'CURRENCY', NULL, NULL, NULL, '元', 'fixed_cost + total_variable_cost', 8, false, true, true, '总成本', '总成本 = 固定成本 + 总变动成本', NOW(), NOW()),
(1, 'profit_before_tax', '税前利润', 'CALC', 'CURRENCY', NULL, NULL, NULL, '元', 'total_revenue - total_cost', 9, false, true, true, '税前利润', '税前利润 = 总收入 - 总成本', NOW(), NOW()),
(1, 'profit_after_tax', '税后利润', 'CALC', 'CURRENCY', NULL, NULL, NULL, '元', 'profit_before_tax * (1 - tax_rate)', 10, false, true, true, '税后利润', '税后利润 = 税前利润 × (1 - 税率)', NOW(), NOW()),
(1, 'breakeven_point', '盈亏平衡点', 'CALC', 'DECIMAL', NULL, NULL, NULL, '件', 'fixed_cost / (unit_price - variable_cost)', 11, false, true, true, '盈亏平衡销售数量', '盈亏平衡点 = 固定成本 ÷ (单价 - 变动成本)', NOW(), NOW()),
(1, 'contribution_margin_ratio', '边际贡献率', 'CALC', 'PERCENTAGE', NULL, NULL, NULL, '%', '(unit_price - variable_cost) / unit_price', 12, false, true, true, '边际贡献率', '边际贡献率 = (单价 - 变动成本) ÷ 单价', NOW(), NOW());

-- 成本效益分析模型变量 (model_id = 2)
INSERT INTO soo_model_variable (
    model_id, variable_code, variable_name, variable_type, data_type,
    default_value, min_value, max_value, unit, calculation_formula,
    display_order, is_required, is_key_indicator, is_visible, 
    description, help_text, created_at, updated_at
) VALUES 
(2, 'initial_investment', '初始投资', 'INPUT', 'CURRENCY', 100000, 0, NULL, '元', NULL, 1, true, false, true, '项目初始投资金额', '包括设备采购、安装调试等初期投入', NOW(), NOW()),
(2, 'annual_benefit', '年收益', 'INPUT', 'CURRENCY', 30000, 0, NULL, '元', NULL, 2, true, false, true, '项目年收益', '项目每年预期产生的收益', NOW(), NOW()),
(2, 'annual_cost', '年成本', 'INPUT', 'CURRENCY', 15000, 0, NULL, '元', NULL, 3, true, false, true, '项目年成本', '项目每年的运营成本', NOW(), NOW()),
(2, 'project_period', '项目周期', 'INPUT', 'NUMBER', 5, 1, 50, '年', NULL, 4, true, false, true, '项目生命周期', '项目的预期使用年限', NOW(), NOW()),
(2, 'discount_rate', '折现率', 'INPUT', 'PERCENTAGE', 0.08, 0, 1, '%', NULL, 5, true, false, true, '资本成本或期望收益率', '用于计算净现值的折现率', NOW(), NOW()),
(2, 'npv', '净现值', 'CALC', 'CURRENCY', NULL, NULL, NULL, '元', 'NPV(discount_rate, annual_benefit - annual_cost, project_period) - initial_investment', 6, false, true, true, '净现值', '项目净现值，衡量项目的盈利能力', NOW(), NOW()),
(2, 'irr', '内部收益率', 'CALC', 'PERCENTAGE', NULL, NULL, NULL, '%', 'IRR(initial_investment, annual_benefit - annual_cost, project_period)', 7, false, true, true, '内部收益率', '项目的内部收益率', NOW(), NOW()),
(2, 'roi', '投资回报率', 'CALC', 'PERCENTAGE', NULL, NULL, NULL, '%', '((annual_benefit - annual_cost) * project_period - initial_investment) / initial_investment', 8, false, true, true, '投资回报率', '项目的投资回报率', NOW(), NOW());

-- ===================================================================
-- 3. 图表分析模型数据
-- ===================================================================

INSERT INTO soo_chart_analysis_model (
    model_id, chart_name, x_axis_field, x_axis_unit,
    y_axis_field, y_axis_unit, chart_type, simulation_steps, 
    created_at, updated_at
) VALUES 
(
    1, 
    '盈亏平衡分析图', 
    'sales_volume', 
    '件',
    'profit_after_tax', 
    '元', 
    'line', 
    100, 
    NOW(),
    NOW()
),
(
    1, 
    '成本结构分析图', 
    'cost_category', 
    NULL,
    'cost_amount', 
    '元', 
    'bar', 
    10, 
    NOW(),
    NOW()
),
(
    2, 
    '现金流分析图', 
    'period', 
    '年',
    'cash_flow', 
    '元', 
    'line', 
    20, 
    NOW(),
    NOW()
),
(
    3, 
    '敏感性分析散点图', 
    'parameter_change', 
    '%',
    'impact_value', 
    '元', 
    'scatter', 
    50, 
    NOW(),
    NOW()
);

-- ===================================================================
-- 4. 图表系列配置数据
-- ===================================================================

INSERT INTO soo_chart_series (
    chart_id, series_name, series_field, series_type,
    series_value, color, sort_order, created_at
) VALUES 
-- 盈亏平衡分析图系列 (chart_id = 1)
(5, '利润线', 'profit_after_tax', 'variable', NULL, '#1890ff', 1, NOW()),
(5, '总收入线', 'total_revenue', 'variable', NULL, '#52c41a', 2, NOW()),
(5, '总成本线', 'total_cost', 'variable', NULL, '#faad14', 3, NOW()),
(5, '盈亏平衡线', 'zero_line', 'fixed', '0', '#ff4d4f', 4, NOW()),

-- 成本结构分析图系列 (chart_id = 2)  
(6, '固定成本', 'fixed_cost', 'fixed', NULL, '#1890ff', 1, NOW()),
(6, '变动成本', 'total_variable_cost', 'variable', NULL, '#52c41a', 2, NOW()),

-- 现金流分析图系列 (chart_id = 3)
(7, '现金流入', 'annual_benefit', 'variable', NULL, '#52c41a', 1, NOW()),
(7, '现金流出', 'annual_cost', 'variable', NULL, '#ff4d4f', 2, NOW()),
(7, '净现金流', 'net_cash_flow', 'variable', NULL, '#1890ff', 3, NOW()),

-- 敏感性分析散点图系列 (chart_id = 4)
(8, '销售价格敏感性', 'price_sensitivity', 'variable', NULL, '#1890ff', 1, NOW()),
(8, '成本敏感性', 'cost_sensitivity', 'variable', NULL, '#ff4d4f', 2, NOW());

-- ===================================================================
-- 5. API接口配置数据（可选）
-- ===================================================================

INSERT INTO soo_api_interface (
    interface_code, interface_name, endpoint_url, http_method,
    request_config, response_config, data_mapping, is_active,
    created_at, updated_at
) VALUES 
(
    'MARKET_PRICE_API',
    '市场价格数据接口',
    'https://api.example.com/market/price',
    'GET',
    '{"headers": {"Authorization": "Bearer {token}"}, "params": {"product_id": "{product_id}"}}',
    '{"data_path": "data.price", "unit": "yuan"}',
    '{"unit_price": "data.price"}',
    true,
    NOW(),
    NOW()
),
(
    'COST_DATA_API',
    '成本数据接口',
    'https://api.example.com/cost/data',
    'POST',
    '{"headers": {"Content-Type": "application/json"}, "body": {"date_range": "{date_range}"}}',
    '{"data_path": "result.costs", "format": "array"}',
    '{"fixed_cost": "result.costs.fixed", "variable_cost": "result.costs.variable"}',
    true,
    NOW(),
    NOW()
);

-- ===================================================================
-- 6. 变量依赖关系数据
-- ===================================================================

INSERT INTO soo_variable_dependency (
    model_id, variable_id, dependent_variable_id, dependency_type, created_at
) VALUES 
-- 盈亏平衡模型的依赖关系
(1, 6, 1, 'DIRECT', NOW()), -- total_revenue 依赖 sales_volume
(1, 6, 2, 'DIRECT', NOW()), -- total_revenue 依赖 unit_price
(1, 7, 1, 'DIRECT', NOW()), -- total_variable_cost 依赖 sales_volume
(1, 7, 4, 'DIRECT', NOW()), -- total_variable_cost 依赖 variable_cost
(1, 8, 3, 'DIRECT', NOW()), -- total_cost 依赖 fixed_cost
(1, 8, 7, 'DIRECT', NOW()), -- total_cost 依赖 total_variable_cost
(1, 9, 6, 'DIRECT', NOW()), -- profit_before_tax 依赖 total_revenue
(1, 9, 8, 'DIRECT', NOW()), -- profit_before_tax 依赖 total_cost
(1, 10, 9, 'DIRECT', NOW()), -- profit_after_tax 依赖 profit_before_tax
(1, 10, 5, 'DIRECT', NOW()), -- profit_after_tax 依赖 tax_rate
(1, 11, 3, 'DIRECT', NOW()), -- breakeven_point 依赖 fixed_cost
(1, 11, 2, 'DIRECT', NOW()), -- breakeven_point 依赖 unit_price
(1, 11, 4, 'DIRECT', NOW()), -- breakeven_point 依赖 variable_cost
(1, 12, 2, 'DIRECT', NOW()), -- contribution_margin_ratio 依赖 unit_price
(1, 12, 4, 'DIRECT', NOW()); -- contribution_margin_ratio 依赖 variable_cost

-- ===================================================================
-- 7. 查询验证数据
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
SELECT 'Variable Dependencies Count', COUNT(*) FROM soo_variable_dependency
UNION ALL
SELECT 'API Interfaces Count', COUNT(*) FROM soo_api_interface;

-- 查看盈亏平衡分析模型的完整配置
SELECT 
    fm.model_name,
    fm.model_code,
    mv.variable_name,
    mv.variable_code,
    mv.variable_type,
    mv.data_type,
    mv.default_value,
    mv.unit,
    mv.description
FROM soo_financial_model fm
LEFT JOIN soo_model_variable mv ON fm.id = mv.model_id
WHERE fm.model_code = 'BREAKEVEN_001'
ORDER BY mv.display_order;

-- 查看图表配置和系列
SELECT 
    cam.chart_name,
    cam.chart_type,
    cs.series_name,
    cs.series_field,
    cs.color
FROM soo_chart_analysis_model cam
LEFT JOIN soo_chart_series cs ON cam.id = cs.chart_id
ORDER BY cam.id, cs.sort_order;

COMMIT; 