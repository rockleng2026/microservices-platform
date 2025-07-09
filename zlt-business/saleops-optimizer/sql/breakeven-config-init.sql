-- 盈亏平衡分析配置初始化脚本
-- 插入默认系统配置

INSERT INTO `soo_breakeven_config` (
    `config_key`, `config_name`, `config_category`, `tenant_id`, `config_value`, 
    `numeric_value`, `boolean_value`, `description`, `default_value`, `data_type`, 
    `is_required`, `is_enabled`, `is_system`, `display_order`
) VALUES 
-- 计算配置
('default_analysis_period', '默认分析期间', 'calculation', 0, 'monthly', NULL, NULL, '默认分析期间', 'monthly', 'enum', 1, 1, 1, 1),
('confidence_level', '默认置信水平', 'calculation', 0, '0.95', 0.95, NULL, '默认置信水平', '0.95', 'number', 1, 1, 1, 2),
('decimal_places', '小数位数', 'calculation', 0, '2', 2, NULL, '结果小数位数', '2', 'number', 1, 1, 1, 3),

-- 敏感性分析配置
('sensitivity_range', '敏感性变化范围', 'sensitivity', 0, '0.1', 0.1, NULL, '敏感性分析变化范围', '0.1', 'number', 1, 1, 1, 10),
('sensitivity_step_size', '敏感性步长', 'sensitivity', 0, '0.01', 0.01, NULL, '敏感性分析步长', '0.01', 'number', 1, 1, 1, 11),

-- 预测配置
('forecast_horizon', '预测期数', 'forecast', 0, '12', 12, NULL, '默认预测期数(月)', '12', 'number', 1, 1, 1, 20),
('forecast_model', '预测模型', 'forecast', 0, 'linear_regression', NULL, NULL, '默认预测模型', 'linear_regression', 'enum', 1, 1, 1, 21),

-- 告警配置
('alert_enabled', '告警功能', 'alert', 0, 'true', NULL, 1, '是否启用告警', 'true', 'boolean', 0, 1, 1, 40),

-- 导出配置
('export_format', '导出格式', 'export', 0, 'excel', NULL, NULL, '默认导出格式', 'excel', 'enum', 0, 1, 1, 50),

-- 显示配置
('currency_symbol', '货币符号', 'display', 0, '¥', NULL, NULL, '货币符号', '¥', 'string', 0, 1, 1, 60),

-- 系统配置
('auto_recalculation', '自动重算', 'system', 0, 'true', NULL, 1, '自动重算功能', 'true', 'boolean', 0, 1, 1, 70),
('calculation_engine_version', '引擎版本', 'system', 0, '1.0.0', NULL, NULL, '计算引擎版本', '1.0.0', 'string', 1, 1, 1, 71); 