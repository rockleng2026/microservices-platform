-- 财务模型复制功能演示脚本
-- 该脚本展示了如何使用复制功能快速创建新的财务模型

-- 1. 首先创建一个示例财务模型
INSERT INTO soo_financial_model (
    model_code, 
    model_name, 
    model_category, 
    model_description, 
    is_active, 
    is_template,
    model_version,
    creator_id,
    tenant_id
) VALUES (
    'BREAKEVEN_DEMO',
    '盈亏平衡分析示例模型',
    'breakeven_analysis',
    '这是一个用于演示复制功能的示例模型，包含完整的变量和图表配置',
    true,
    false,
    '1.0.0',
    1,
    'default'
);

-- 获取新创建的模型ID
SET @source_model_id = LAST_INSERT_ID();

-- 2. 创建模型变量
INSERT INTO soo_model_variable (
    model_id,
    variable_code,
    variable_name,
    variable_type,
    data_type,
    variable_value,
    variable_formula,
    description,
    sort_order,
    parent_id,
    constraint_formula
) VALUES 
-- 输入变量
(@source_model_id, 'unit_price', '单位售价', 'INPUT', 'CURRENCY', '100.00', NULL, '产品的单位售价', 1, NULL, NULL),
(@source_model_id, 'variable_cost', '单位变动成本', 'INPUT', 'CURRENCY', '60.00', NULL, '每单位产品的变动成本', 2, NULL, NULL),
(@source_model_id, 'fixed_cost', '固定成本', 'INPUT', 'CURRENCY', '50000.00', NULL, '总固定成本', 3, NULL, NULL),
(@source_model_id, 'sales_volume', '销售数量', 'INPUT', 'NUMBER', '1000', NULL, '预期销售数量', 4, NULL, NULL),

-- 计算变量
(@source_model_id, 'total_revenue', '总收入', 'CALC', 'CURRENCY', NULL, 'unit_price * sales_volume', '总收入 = 单位售价 × 销售数量', 5, NULL, NULL),
(@source_model_id, 'total_variable_cost', '总变动成本', 'CALC', 'CURRENCY', NULL, 'variable_cost * sales_volume', '总变动成本 = 单位变动成本 × 销售数量', 6, NULL, NULL),
(@source_model_id, 'total_cost', '总成本', 'CALC', 'CURRENCY', NULL, 'fixed_cost + total_variable_cost', '总成本 = 固定成本 + 总变动成本', 7, NULL, NULL),
(@source_model_id, 'profit', '利润', 'CALC', 'CURRENCY', NULL, 'total_revenue - total_cost', '利润 = 总收入 - 总成本', 8, NULL, NULL),
(@source_model_id, 'contribution_margin', '贡献毛益', 'CALC', 'CURRENCY', NULL, 'unit_price - variable_cost', '贡献毛益 = 单位售价 - 单位变动成本', 9, NULL, NULL),
(@source_model_id, 'breakeven_point', '盈亏平衡点', 'CALC', 'NUMBER', NULL, 'fixed_cost / contribution_margin', '盈亏平衡点 = 固定成本 / 贡献毛益', 10, NULL, NULL);

-- 3. 创建图表分析模型
INSERT INTO soo_chart_analysis_model (
    model_id,
    chart_name,
    x_axis_name,
    x_axis_field,
    x_axis_unit,
    y_axis_name,
    y_axis_unit,
    chart_type,
    simulation_steps
) VALUES (
    @source_model_id,
    '盈亏平衡分析图',
    '销售数量',
    'sales_volume',
    '件',
    '金额',
    '元',
    'line',
    20
);

-- 获取新创建的图表ID
SET @chart_id = LAST_INSERT_ID();

-- 4. 创建图表系列
INSERT INTO soo_chart_series (
    chart_id,
    series_name,
    series_field,
    series_type,
    series_value,
    color,
    sort_order
) VALUES 
(@chart_id, '总收入', 'total_revenue', 'variable', NULL, '#1890ff', 1),
(@chart_id, '总成本', 'total_cost', 'variable', NULL, '#ff4d4f', 2),
(@chart_id, '利润', 'profit', 'variable', NULL, '#52c41a', 3),
(@chart_id, '盈亏平衡线', 'profit', 'formula', '0', '#faad14', 4);

-- 5. 演示复制功能的使用
-- 通过API调用复制模型，将创建以下数据：

-- 复制后的模型
-- INSERT INTO soo_financial_model (
--     model_code, 
--     model_name, 
--     model_category, 
--     model_description, 
--     is_active, 
--     is_template,
--     model_version,
--     parent_model_id,  -- 指向源模型
--     creator_id,
--     tenant_id
-- ) VALUES (
--     'BREAKEVEN_DEMO_COPY_1234567890',
--     '盈亏平衡分析示例模型 - 副本',
--     'breakeven_analysis',
--     '这是一个用于演示复制功能的示例模型，包含完整的变量和图表配置',
--     true,
--     false,
--     '1.0.0',
--     @source_model_id,  -- 指向源模型
--     1,
--     'default'
-- );

-- 复制后的变量（model_id会更新为新模型ID）
-- 复制后的图表（model_id会更新为新模型ID，chart_name会添加" - 副本"后缀）
-- 复制后的系列（chart_id会更新为新图表ID）

-- 6. 查询复制结果示例
-- 查看源模型及其复制品
SELECT 
    m1.id as source_model_id,
    m1.model_code as source_model_code,
    m1.model_name as source_model_name,
    m2.id as cloned_model_id,
    m2.model_code as cloned_model_code,
    m2.model_name as cloned_model_name,
    m2.parent_model_id
FROM soo_financial_model m1
LEFT JOIN soo_financial_model m2 ON m2.parent_model_id = m1.id
WHERE m1.model_code = 'BREAKEVEN_DEMO';

-- 查看变量复制情况
SELECT 
    'Source Variables' as type,
    COUNT(*) as count
FROM soo_model_variable 
WHERE model_id = @source_model_id
UNION ALL
SELECT 
    'Cloned Variables' as type,
    COUNT(*) as count
FROM soo_model_variable mv
JOIN soo_financial_model m ON mv.model_id = m.id
WHERE m.parent_model_id = @source_model_id;

-- 查看图表复制情况
SELECT 
    'Source Charts' as type,
    COUNT(*) as count
FROM soo_chart_analysis_model 
WHERE model_id = @source_model_id
UNION ALL
SELECT 
    'Cloned Charts' as type,
    COUNT(*) as count
FROM soo_chart_analysis_model cam
JOIN soo_financial_model m ON cam.model_id = m.id
WHERE m.parent_model_id = @source_model_id;

-- 7. 清理演示数据（可选）
-- DELETE FROM soo_chart_series WHERE chart_id IN (
--     SELECT id FROM soo_chart_analysis_model WHERE model_id = @source_model_id
-- );
-- DELETE FROM soo_chart_analysis_model WHERE model_id = @source_model_id;
-- DELETE FROM soo_model_variable WHERE model_id = @source_model_id;
-- DELETE FROM soo_financial_model WHERE id = @source_model_id;

-- 复制功能的主要优势：
-- 1. 快速建模：一键复制现有模型，避免重复配置
-- 2. 完整性保证：复制包含所有相关配置（变量、图表、系列）
-- 3. 灵活性：可选择是否复制变量和图表
-- 4. 可追溯性：通过parent_model_id记录复制关系
-- 5. 安全性：复制操作在事务中执行，确保数据一致性 