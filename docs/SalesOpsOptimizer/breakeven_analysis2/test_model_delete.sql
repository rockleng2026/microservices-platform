-- 财务模型删除功能测试脚本
-- 数据库: central-soo
-- 用途: 测试模型删除时的级联删除功能

-- ============================================================================
-- 1. 准备测试数据
-- ============================================================================

-- 创建测试财务模型
INSERT INTO soo_financial_model (
    model_code, 
    model_name, 
    model_category, 
    model_description, 
    is_active, 
    is_template,
    model_version,
    tenant_id,
    creator_id
) VALUES (
    'TEST_DELETE_001',
    '测试删除模型',
    'breakeven_analysis',
    '这是一个用于测试删除功能的模型，包含变量和图表配置',
    true,
    false,
    '1.0.0',
    'default',
    1
);

-- 获取创建的模型ID
SET @test_model_id = LAST_INSERT_ID();
SELECT CONCAT('创建的测试模型ID: ', @test_model_id) AS model_info;

-- 创建测试变量
INSERT INTO soo_model_variable (
    model_id, 
    variable_code, 
    variable_name, 
    variable_type, 
    data_type, 
    default_value, 
    display_order, 
    is_required, 
    is_visible
) VALUES 
    (@test_model_id, 'revenue', '收入', 'INPUT', 'DECIMAL', 1000000.00, 1, true, true),
    (@test_model_id, 'cost', '成本', 'INPUT', 'DECIMAL', 600000.00, 2, true, true),
    (@test_model_id, 'profit', '利润', 'CALC', 'DECIMAL', NULL, 3, false, true),
    (@test_model_id, 'margin', '毛利率', 'CALC', 'PERCENTAGE', NULL, 4, false, true);

-- 创建测试图表配置
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
) VALUES 
    (@test_model_id, '盈亏平衡分析图', '收入', 'revenue', '元', '利润', '元', 'line', 20),
    (@test_model_id, '成本结构分析', '收入', 'revenue', '元', '成本', '元', 'bar', 15);

-- 获取创建的图表ID
SET @chart1_id = (SELECT id FROM soo_chart_analysis_model WHERE model_id = @test_model_id AND chart_name = '盈亏平衡分析图' LIMIT 1);
SET @chart2_id = (SELECT id FROM soo_chart_analysis_model WHERE model_id = @test_model_id AND chart_name = '成本结构分析' LIMIT 1);

-- 创建测试图表系列
INSERT INTO soo_chart_series (
    chart_id, 
    series_name, 
    series_field, 
    series_type, 
    series_value, 
    color, 
    sort_order
) VALUES 
    (@chart1_id, '利润线', 'profit', 'variable', NULL, '#33FF57', 1),
    (@chart1_id, '固定成本线', 'cost', 'fixed', '300000', '#FF5733', 2),
    (@chart2_id, '总成本', 'cost', 'variable', NULL, '#3357FF', 1),
    (@chart2_id, '变动成本', 'cost', 'formula', 'revenue*0.6', '#F333FF', 2);

-- ============================================================================
-- 2. 验证测试数据创建
-- ============================================================================

SELECT '=== 测试数据创建验证 ===' AS section;

-- 检查模型
SELECT 
    '模型' AS type,
    COUNT(*) AS count,
    GROUP_CONCAT(model_name) AS names
FROM soo_financial_model 
WHERE model_code = 'TEST_DELETE_001';

-- 检查变量
SELECT 
    '变量' AS type,
    COUNT(*) AS count,
    GROUP_CONCAT(variable_name) AS names
FROM soo_model_variable 
WHERE model_id = @test_model_id;

-- 检查图表
SELECT 
    '图表' AS type,
    COUNT(*) AS count,
    GROUP_CONCAT(chart_name) AS names
FROM soo_chart_analysis_model 
WHERE model_id = @test_model_id;

-- 检查系列
SELECT 
    '系列' AS type,
    COUNT(*) AS count,
    GROUP_CONCAT(series_name) AS names
FROM soo_chart_series cs
JOIN soo_chart_analysis_model cam ON cs.chart_id = cam.id
WHERE cam.model_id = @test_model_id;

-- ============================================================================
-- 3. 模拟删除操作（手动执行）
-- ============================================================================

SELECT '=== 删除操作说明 ===' AS section;
SELECT '请通过API调用删除模型，然后执行下面的验证查询' AS instruction;

-- 删除API调用示例：
-- curl -X DELETE "http://localhost:8080/api/soo/v2/models/{@test_model_id}" \
--   -H "Authorization: Bearer {your-token}"

-- ============================================================================
-- 4. 验证删除结果
-- ============================================================================

-- 注意：以下查询需要在删除操作后执行

SELECT '=== 删除结果验证 ===' AS section;

-- 检查模型是否删除
SELECT 
    '模型删除检查' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 模型已删除'
        ELSE CONCAT('❌ 模型未删除，剩余: ', COUNT(*))
    END AS result
FROM soo_financial_model 
WHERE model_code = 'TEST_DELETE_001';

-- 检查变量是否删除
SELECT 
    '变量删除检查' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 变量已删除'
        ELSE CONCAT('❌ 变量未删除，剩余: ', COUNT(*))
    END AS result
FROM soo_model_variable 
WHERE model_id = @test_model_id;

-- 检查图表是否删除
SELECT 
    '图表删除检查' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 图表已删除'
        ELSE CONCAT('❌ 图表未删除，剩余: ', COUNT(*))
    END AS result
FROM soo_chart_analysis_model 
WHERE model_id = @test_model_id;

-- 检查系列是否删除
SELECT 
    '系列删除检查' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 系列已删除'
        ELSE CONCAT('❌ 系列未删除，剩余: ', COUNT(*))
    END AS result
FROM soo_chart_series cs
JOIN soo_chart_analysis_model cam ON cs.chart_id = cam.id
WHERE cam.model_id = @test_model_id;

-- ============================================================================
-- 5. 清理测试数据（如果需要）
-- ============================================================================

-- 如果测试失败，可以手动清理数据
-- 注意：这些删除语句会直接删除数据，请谨慎使用

/*
-- 手动清理系列数据
DELETE FROM soo_chart_series cs
JOIN soo_chart_analysis_model cam ON cs.chart_id = cam.id
WHERE cam.model_id = @test_model_id;

-- 手动清理图表数据
DELETE FROM soo_chart_analysis_model WHERE model_id = @test_model_id;

-- 手动清理变量数据
DELETE FROM soo_model_variable WHERE model_id = @test_model_id;

-- 手动清理模型数据
DELETE FROM soo_financial_model WHERE model_code = 'TEST_DELETE_001';
*/

-- ============================================================================
-- 6. 性能测试（可选）
-- ============================================================================

-- 测试大量数据的删除性能
SELECT '=== 性能测试建议 ===' AS section;
SELECT '建议创建包含大量变量和图表的模型来测试删除性能' AS suggestion;

-- 创建性能测试模型
INSERT INTO soo_financial_model (
    model_code, 
    model_name, 
    model_category, 
    is_active
) VALUES (
    'PERF_TEST_001',
    '性能测试模型',
    'breakeven_analysis',
    true
);

SET @perf_model_id = LAST_INSERT_ID();

-- 批量创建测试变量（示例：创建100个变量）
-- 这里只创建10个作为示例
INSERT INTO soo_model_variable (model_id, variable_code, variable_name, variable_type, display_order)
SELECT 
    @perf_model_id,
    CONCAT('var_', numbers.n),
    CONCAT('变量_', numbers.n),
    CASE WHEN numbers.n % 3 = 0 THEN 'INPUT' WHEN numbers.n % 3 = 1 THEN 'CALC' ELSE 'API' END,
    numbers.n
FROM (
    SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) numbers;

-- 批量创建测试图表（示例：创建5个图表）
INSERT INTO soo_chart_analysis_model (model_id, chart_name, x_axis_field, y_axis_field, chart_type)
SELECT 
    @perf_model_id,
    CONCAT('图表_', numbers.n),
    'var_1',
    'var_2',
    CASE WHEN numbers.n % 2 = 0 THEN 'line' ELSE 'bar' END
FROM (
    SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) numbers;

-- 获取性能测试图表ID
SET @perf_chart_ids = (SELECT GROUP_CONCAT(id) FROM soo_chart_analysis_model WHERE model_id = @perf_model_id);

-- 批量创建测试系列（每个图表3个系列）
INSERT INTO soo_chart_series (chart_id, series_name, series_field, series_type, sort_order)
SELECT 
    cam.id,
    CONCAT('系列_', cam.id, '_', series.n),
    CONCAT('var_', series.n),
    'variable',
    series.n
FROM soo_chart_analysis_model cam
CROSS JOIN (
    SELECT 1 as n UNION SELECT 2 UNION SELECT 3
) series
WHERE cam.model_id = @perf_model_id;

SELECT '性能测试数据创建完成' AS status;
SELECT CONCAT('模型ID: ', @perf_model_id) AS model_info;
SELECT CONCAT('变量数量: ', (SELECT COUNT(*) FROM soo_model_variable WHERE model_id = @perf_model_id)) AS variable_count;
SELECT CONCAT('图表数量: ', (SELECT COUNT(*) FROM soo_chart_analysis_model WHERE model_id = @perf_model_id)) AS chart_count;
SELECT CONCAT('系列数量: ', (
    SELECT COUNT(*) FROM soo_chart_series cs
    JOIN soo_chart_analysis_model cam ON cs.chart_id = cam.id
    WHERE cam.model_id = @perf_model_id
)) AS series_count;

-- ============================================================================
-- 7. 测试完成
-- ============================================================================

SELECT '=== 测试完成 ===' AS section;
SELECT '请检查上述验证结果，确保所有相关数据都被正确删除' AS final_check; 