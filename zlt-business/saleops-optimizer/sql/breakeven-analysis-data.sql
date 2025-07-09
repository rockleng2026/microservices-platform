-- =============================================
-- 盈亏平衡分析系统初始数据
-- 创建时间: 2024-01-15
-- 说明: 包含默认配置数据、模板数据等
-- =============================================

-- 1. 插入默认配置数据
INSERT INTO `soo_breakeven_config` (
    `config_key`, `config_name`, `config_category`, `tenant_id`, `config_value`, 
    `numeric_value`, `boolean_value`, `description`, `default_value`, `data_type`, 
    `is_required`, `is_enabled`, `is_system`, `display_order`
) VALUES 
-- 计算相关配置
('default_analysis_period', '默认分析期间', 'calculation', 'default', 'monthly', NULL, NULL, '默认的分析期间类型', 'monthly', 'enum', 1, 1, 1, 1),
('confidence_level', '默认置信水平', 'calculation', 'default', '0.95', 0.95, NULL, '默认的置信水平', '0.95', 'number', 1, 1, 1, 2),
('decimal_places', '小数位数', 'calculation', 'default', '2', 2, NULL, '计算结果保留的小数位数', '2', 'number', 1, 1, 1, 3),
('calculation_timeout', '计算超时时间(秒)', 'calculation', 'default', '300', 300, NULL, '单次计算的最大超时时间', '300', 'number', 1, 1, 1, 4),
('max_scenarios_per_analysis', '每个分析最大场景数', 'calculation', 'default', '10', 10, NULL, '每个分析允许的最大场景数量', '10', 'number', 1, 1, 1, 5),

-- 敏感性分析配置
('sensitivity_range', '敏感性分析变化范围', 'sensitivity', 'default', '0.1', 0.1, NULL, '敏感性分析的默认变化范围(±10%)', '0.1', 'number', 1, 1, 1, 10),
('sensitivity_step_size', '敏感性分析步长', 'sensitivity', 'default', '0.01', 0.01, NULL, '敏感性分析的计算步长', '0.01', 'number', 1, 1, 1, 11),
('sensitivity_confidence_level', '敏感性分析置信水平', 'sensitivity', 'default', '0.95', 0.95, NULL, '敏感性分析的置信水平', '0.95', 'number', 1, 1, 1, 12),
('max_sensitivity_parameters', '最大敏感性参数数量', 'sensitivity', 'default', '15', 15, NULL, '每个分析允许的最大敏感性参数数量', '15', 'number', 1, 1, 1, 13),

-- 预测分析配置
('forecast_horizon', '默认预测期数', 'forecast', 'default', '12', 12, NULL, '默认的预测期数(月)', '12', 'number', 1, 1, 1, 20),
('forecast_model', '默认预测模型', 'forecast', 'default', 'linear_regression', NULL, NULL, '默认使用的预测模型', 'linear_regression', 'enum', 1, 1, 1, 21),
('forecast_historical_window', '预测历史数据窗口', 'forecast', 'default', '24', 24, NULL, '预测使用的历史数据窗口(月)', '24', 'number', 1, 1, 1, 22),
('forecast_confidence_level', '预测置信水平', 'forecast', 'default', '0.95', 0.95, NULL, '预测分析的置信水平', '0.95', 'number', 1, 1, 1, 23),
('forecast_auto_update', '预测自动更新', 'forecast', 'default', 'true', NULL, 1, '是否启用预测自动更新', 'true', 'boolean', 0, 1, 1, 24),

-- 场景分析配置
('scenario_types', '支持的场景类型', 'scenario', 'default', '["conservative","baseline","optimistic","industry_specific"]', NULL, NULL, '系统支持的场景分析类型', '["conservative","baseline","optimistic"]', 'json', 1, 1, 1, 30),
('scenario_risk_levels', '风险等级定义', 'scenario', 'default', '["low","medium","high"]', NULL, NULL, '场景分析的风险等级定义', '["low","medium","high"]', 'json', 1, 1, 1, 31),
('scenario_confidence_threshold', '场景置信度阈值', 'scenario', 'default', '0.8', 0.8, NULL, '场景被标记为推荐的最低置信度', '0.8', 'number', 1, 1, 1, 32),

-- 告警配置
('alert_thresholds', '告警阈值配置', 'alert', 'default', '{"margin_safety_ratio":0.2,"reasonability_score":0.6}', NULL, NULL, '各种指标的告警阈值配置', '{}', 'json', 0, 1, 1, 40),
('alert_enabled', '告警功能启用', 'alert', 'default', 'true', NULL, 1, '是否启用告警功能', 'true', 'boolean', 0, 1, 1, 41),
('alert_check_interval', '告警检查间隔(分钟)', 'alert', 'default', '60', 60, NULL, '告警检查的时间间隔', '60', 'number', 0, 1, 1, 42),

-- 导出配置
('export_format', '默认导出格式', 'export', 'default', 'excel', NULL, NULL, '默认的数据导出格式', 'excel', 'enum', 0, 1, 1, 50),
('export_max_records', '导出最大记录数', 'export', 'default', '10000', 10000, NULL, '单次导出允许的最大记录数', '10000', 'number', 1, 1, 1, 51),
('export_timeout', '导出超时时间(秒)', 'export', 'default', '600', 600, NULL, '导出操作的最大超时时间', '600', 'number', 1, 1, 1, 52),

-- 显示配置
('currency_symbol', '货币符号', 'display', 'default', '¥', NULL, NULL, '显示用的货币符号', '¥', 'string', 0, 1, 1, 60),
('number_format', '数字格式', 'display', 'default', '#,##0.00', NULL, NULL, '数字的显示格式', '#,##0.00', 'string', 0, 1, 1, 61),
('date_format', '日期格式', 'display', 'default', 'YYYY-MM-DD', NULL, NULL, '日期的显示格式', 'YYYY-MM-DD', 'string', 0, 1, 1, 62),
('chart_theme', '图表主题', 'display', 'default', 'default', NULL, NULL, '图表的默认主题', 'default', 'string', 0, 1, 1, 63),

-- 系统配置
('auto_recalculation', '自动重算功能', 'system', 'default', 'true', NULL, 1, '是否启用自动重算功能', 'true', 'boolean', 0, 1, 1, 70),
('auto_recalculation_interval', '自动重算间隔(小时)', 'system', 'default', '24', 24, NULL, '自动重算的时间间隔', '24', 'number', 0, 1, 1, 71),
('calculation_engine_version', '计算引擎版本', 'system', 'default', '1.0.0', NULL, NULL, '当前计算引擎版本', '1.0.0', 'string', 1, 1, 1, 72),
('data_retention_days', '数据保留天数', 'system', 'default', '365', 365, NULL, '归档数据的保留天数', '365', 'number', 1, 1, 1, 73),
('max_concurrent_calculations', '最大并发计算数', 'system', 'default', '5', 5, NULL, '系统允许的最大并发计算数', '5', 'number', 1, 1, 1, 74);

-- 2. 插入示例分析模板数据
INSERT INTO `soo_breakeven_analysis` (
    `analysis_id`, `analysis_name`, `analysis_type`, `analysis_period`, `tenant_id`, 
    `creator_id`, `creator_name`, `current_parameters`, `breakeven_point`, 
    `total_fixed_cost`, `variable_cost_ratio`, `margin_safety`, `margin_safety_ratio`,
    `reasonability_score`, `calculation_trigger`, `calculation_engine_version`,
    `status`, `is_real_time`, `auto_recalculation`
) VALUES 
('TEMPLATE_001', '制造业标准模板', 'monthly', '2024-01', 'default', 1, '系统管理员',
 '{"baseRevenue":1000000,"fixedCost":300000,"variableCostRatio":0.4,"targetProfit":50000}',
 500000.00, 300000.00, 0.4000, 500000.00, 0.5000, 0.85, 'manual', '1.0.0',
 'draft', 0, 0),

('TEMPLATE_002', '服务业标准模板', 'monthly', '2024-01', 'default', 1, '系统管理员',
 '{"baseRevenue":800000,"fixedCost":200000,"variableCostRatio":0.3,"targetProfit":80000}',
 285714.29, 200000.00, 0.3000, 514285.71, 0.6429, 0.90, 'manual', '1.0.0',
 'draft', 0, 0),

('TEMPLATE_003', '零售业标准模板', 'monthly', '2024-01', 'default', 1, '系统管理员',
 '{"baseRevenue":1200000,"fixedCost":400000,"variableCostRatio":0.6,"targetProfit":60000}',
 1000000.00, 400000.00, 0.6000, 200000.00, 0.1667, 0.75, 'manual', '1.0.0',
 'draft', 0, 0);

-- 3. 插入示例场景数据
INSERT INTO `soo_breakeven_scenarios` (
    `scenario_id`, `analysis_id`, `tenant_id`, `scenario_name`, `scenario_type`,
    `scenario_description`, `is_baseline`, `is_recommended`, `breakeven_point`,
    `total_fixed_cost`, `variable_cost_ratio`, `margin_safety`, `margin_safety_ratio`,
    `feasibility_score`, `risk_level`, `confidence_level`, `sort_order`, `status`
) VALUES 
-- 制造业模板场景
('SCENARIO_001', 'TEMPLATE_001', 'default', '保守场景', 'conservative', 
 '考虑市场下行风险的保守估计', 0, 0, 550000.00, 330000.00, 0.45, 450000.00, 0.45, 0.90, 'low', 0.85, 1, 'active'),

('SCENARIO_002', 'TEMPLATE_001', 'default', '基准场景', 'baseline',
 '基于当前市场条件的基准预测', 1, 1, 500000.00, 300000.00, 0.40, 500000.00, 0.50, 0.85, 'medium', 0.90, 2, 'active'),

('SCENARIO_003', 'TEMPLATE_001', 'default', '乐观场景', 'optimistic',
 '市场向好时的乐观预期', 0, 0, 450000.00, 270000.00, 0.35, 550000.00, 0.55, 0.80, 'medium', 0.75, 3, 'active'),

-- 服务业模板场景  
('SCENARIO_004', 'TEMPLATE_002', 'default', '基准场景', 'baseline',
 '服务业标准运营场景', 1, 1, 285714.29, 200000.00, 0.30, 514285.71, 0.6429, 0.90, 'low', 0.95, 1, 'active'),

('SCENARIO_005', 'TEMPLATE_002', 'default', '数字化升级场景', 'industry_specific',
 '通过数字化提升效率的场景', 0, 1, 250000.00, 180000.00, 0.28, 550000.00, 0.6875, 0.95, 'low', 0.85, 2, 'active');

-- 4. 插入示例敏感性分析数据
INSERT INTO `soo_breakeven_sensitivity` (
    `analysis_id`, `tenant_id`, `parameter_name`, `parameter_label`, `parameter_category`,
    `baseline_value`, `sensitivity_coefficient`, `sensitivity_level`, `impact_direction`,
    `is_critical`, `is_controllable`, `sort_order`, `calculation_status`
) VALUES 
-- 制造业模板敏感性参数
('TEMPLATE_001', 'default', 'fixed_cost', '固定成本', 'cost', 300000.0000, 1.6667, 'high', 'positive', 1, 1, 1, 'completed'),
('TEMPLATE_001', 'default', 'variable_cost_ratio', '变动成本率', 'cost', 0.4000, 1.6667, 'high', 'positive', 1, 1, 2, 'completed'),
('TEMPLATE_001', 'default', 'unit_price', '单价', 'price', 100.0000, -1.0000, 'high', 'negative', 1, 1, 3, 'completed'),
('TEMPLATE_001', 'default', 'sales_volume', '销量', 'volume', 10000.0000, -1.0000, 'high', 'negative', 1, 0, 4, 'completed'),
('TEMPLATE_001', 'default', 'capacity_utilization', '产能利用率', 'efficiency', 0.8000, -0.5000, 'medium', 'negative', 0, 1, 5, 'completed'),

-- 服务业模板敏感性参数
('TEMPLATE_002', 'default', 'fixed_cost', '固定成本', 'cost', 200000.0000, 1.4286, 'high', 'positive', 1, 1, 1, 'completed'),
('TEMPLATE_002', 'default', 'variable_cost_ratio', '变动成本率', 'cost', 0.3000, 1.4286, 'high', 'positive', 1, 1, 2, 'completed'),
('TEMPLATE_002', 'default', 'service_price', '服务单价', 'price', 200.0000, -1.0000, 'high', 'negative', 1, 1, 3, 'completed'),
('TEMPLATE_002', 'default', 'customer_count', '客户数量', 'volume', 4000.0000, -1.0000, 'high', 'negative', 1, 0, 4, 'completed'),
('TEMPLATE_002', 'default', 'service_efficiency', '服务效率', 'efficiency', 0.9000, -0.3000, 'medium', 'negative', 0, 1, 5, 'completed');

-- 5. 插入菜单数据(如果需要集成到现有菜单系统)
-- 注意：这里的菜单插入需要根据实际的菜单表结构进行调整
INSERT INTO `sys_menu` (
    `menu_id`, `menu_name`, `parent_id`, `sort_no`, `route_url`, `menu_type`, 
    `is_route`, `component`, `perms`, `description`, `status`, `icon`
) VALUES 
(NEXTVAL('seq_sys_menu'), '盈亏平衡分析', (SELECT menu_id FROM sys_menu WHERE menu_name = '销售运营优化器'), 10, 
 '/saleops/breakeven', 1, 1, 'saleops/breakeven/index', 'soo:breakeven:view', '盈亏平衡分析管理', 1, 'BarChartOutlined'),

(NEXTVAL('seq_sys_menu'), '分析列表', (SELECT menu_id FROM sys_menu WHERE menu_name = '盈亏平衡分析'), 1,
 '', 2, 0, '', 'soo:breakeven:list', '查看分析列表', 1, ''),

(NEXTVAL('seq_sys_menu'), '创建分析', (SELECT menu_id FROM sys_menu WHERE menu_name = '盈亏平衡分析'), 2,
 '', 2, 0, '', 'soo:breakeven:create', '创建新的盈亏平衡分析', 1, ''),

(NEXTVAL('seq_sys_menu'), '编辑分析', (SELECT menu_id FROM sys_menu WHERE menu_name = '盈亏平衡分析'), 3,
 '', 2, 0, '', 'soo:breakeven:edit', '编辑盈亏平衡分析', 1, ''),

(NEXTVAL('seq_sys_menu'), '删除分析', (SELECT menu_id FROM sys_menu WHERE menu_name = '盈亏平衡分析'), 4,
 '', 2, 0, '', 'soo:breakeven:delete', '删除盈亏平衡分析', 1, ''),

(NEXTVAL('seq_sys_menu'), '场景分析', (SELECT menu_id FROM sys_menu WHERE menu_name = '盈亏平衡分析'), 5,
 '', 2, 0, '', 'soo:breakeven:scenario', '场景分析管理', 1, ''),

(NEXTVAL('seq_sys_menu'), '敏感性分析', (SELECT menu_id FROM sys_menu WHERE menu_name = '盈亏平衡分析'), 6,
 '', 2, 0, '', 'soo:breakeven:sensitivity', '敏感性分析管理', 1, ''),

(NEXTVAL('seq_sys_menu'), '预测分析', (SELECT menu_id FROM sys_menu WHERE menu_name = '盈亏平衡分析'), 7,
 '', 2, 0, '', 'soo:breakeven:forecast', '预测分析管理', 1, ''),

(NEXTVAL('seq_sys_menu'), '导出数据', (SELECT menu_id FROM sys_menu WHERE menu_name = '盈亏平衡分析'), 8,
 '', 2, 0, '', 'soo:breakeven:export', '导出分析数据', 1, '');

COMMIT; 