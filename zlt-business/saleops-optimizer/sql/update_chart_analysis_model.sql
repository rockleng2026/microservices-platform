-- 更新图表分析模型表结构
-- 添加 x_axis_name 和 y_axis_name 字段

-- 检查字段是否存在，如果不存在则添加
ALTER TABLE soo_chart_analysis_model 
ADD COLUMN IF NOT EXISTS x_axis_name VARCHAR(50) NOT NULL DEFAULT '' COMMENT 'X轴名称标识' AFTER chart_name;

ALTER TABLE soo_chart_analysis_model 
ADD COLUMN IF NOT EXISTS y_axis_name VARCHAR(50) NOT NULL DEFAULT '' COMMENT 'Y轴名称标识' AFTER x_axis_unit;

-- 更新现有数据的轴名称字段
-- 如果轴名称为空，则使用轴字段作为默认名称
UPDATE soo_chart_analysis_model 
SET x_axis_name = CASE 
    WHEN x_axis_name = '' OR x_axis_name IS NULL THEN x_axis_field 
    ELSE x_axis_name 
END;

UPDATE soo_chart_analysis_model 
SET y_axis_name = CASE 
    WHEN y_axis_name = '' OR y_axis_name IS NULL THEN y_axis_field 
    ELSE y_axis_name 
END;

-- 验证表结构
DESCRIBE soo_chart_analysis_model; 