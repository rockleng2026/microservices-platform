-- 模型实例测试数据
-- 注意：执行前请确保已创建相关表结构

-- 插入测试财务模型实例
INSERT INTO `soo_financial_model_instance` (
    `instance_code`, `instance_name`, `model_id`, `project_id`, `instance_status`, 
    `instance_version`, `instance_description`, `instance_config`, `calculation_result`,
    `last_calculated_at`, `calculation_status`, `creator_id`, `tenant_id`, 
    `created_at`, `updated_at`, `deleted`
) VALUES 
-- 示例1：基础盈亏平衡分析实例
('BREAKEVEN_BASIC_001', '基础盈亏平衡分析实例', 1, 1, 'ACTIVE', '1.0.0', 
 '基于基础财务模型的盈亏平衡分析实例，用于分析产品盈亏平衡点', 
 '{"revenue": 1000000, "cost": 600000, "fixed_cost": 200000, "variable_cost_rate": 0.4}',
 '{"breakeven_point": 333333.33, "profit": 200000, "margin": 0.2, "safety_margin": 0.67}',
 '2024-12-19 10:30:00', 'COMPLETED', 1, 'default', 
 '2024-12-19 10:00:00', '2024-12-19 10:30:00', 0),

-- 示例2：高级财务分析实例
('FINANCIAL_ADVANCED_001', '高级财务分析实例', 2, 2, 'ACTIVE', '1.0.0',
 '包含多维度财务指标的高级分析实例，用于综合财务评估',
 '{"revenue": 2000000, "cost": 1200000, "fixed_cost": 300000, "variable_cost_rate": 0.45, "tax_rate": 0.25}',
 '{"breakeven_point": 545454.55, "profit": 375000, "margin": 0.1875, "roi": 0.25, "payback_period": 2.67}',
 '2024-12-19 11:00:00', 'COMPLETED', 1, 'default',
 '2024-12-19 10:30:00', '2024-12-19 11:00:00', 0),

-- 示例3：项目成本分析实例
('PROJECT_COST_001', '项目成本分析实例', 3, 3, 'DRAFT', '1.0.0',
 '专门用于项目成本控制和分析的实例',
 '{"project_budget": 500000, "actual_cost": 450000, "labor_cost": 200000, "material_cost": 150000, "overhead_cost": 100000}',
 NULL, NULL, 'PENDING', 1, 'default',
 '2024-12-19 12:00:00', '2024-12-19 12:00:00', 0),

-- 示例4：产品定价分析实例
('PRODUCT_PRICING_001', '产品定价分析实例', 4, 4, 'ACTIVE', '1.0.0',
 '用于产品定价策略分析的实例',
 '{"unit_cost": 50, "target_margin": 0.3, "market_price": 80, "competitor_price": 75, "demand_elasticity": -1.5}',
 '{"optimal_price": 71.43, "expected_profit": 21.43, "price_sensitivity": 0.15, "market_share": 0.25}',
 '2024-12-19 13:00:00', 'COMPLETED', 1, 'default',
 '2024-12-19 12:30:00', '2024-12-19 13:00:00', 0),

-- 示例5：投资回报分析实例
('INVESTMENT_ROI_001', '投资回报分析实例', 5, 5, 'ACTIVE', '1.0.0',
 '用于投资决策和回报分析的实例',
 '{"initial_investment": 1000000, "annual_revenue": 300000, "annual_cost": 150000, "project_life": 5, "discount_rate": 0.1}',
 '{"npv": 136365.64, "irr": 0.15, "payback_period": 3.33, "profitability_index": 1.14}',
 '2024-12-19 14:00:00', 'COMPLETED', 1, 'default',
 '2024-12-19 13:30:00', '2024-12-19 14:00:00', 0);

-- 插入测试实例变量数据
INSERT INTO `soo_model_instance_variable` (
    `instance_id`, `variable_id`, `variable_value`, `calculated_value`, 
    `is_calculated`, `calculation_error`, `created_at`, `updated_at`
) VALUES 
-- 基础盈亏平衡分析实例的变量
(1, 1, '1000000', NULL, 0, NULL, '2024-12-19 10:00:00', '2024-12-19 10:00:00'),
(1, 2, '600000', NULL, 0, NULL, '2024-12-19 10:00:00', '2024-12-19 10:00:00'),
(1, 3, '200000', NULL, 0, NULL, '2024-12-19 10:00:00', '2024-12-19 10:00:00'),
(1, 4, '0.4', NULL, 0, NULL, '2024-12-19 10:00:00', '2024-12-19 10:00:00'),
(1, 5, NULL, '333333.33', 1, NULL, '2024-12-19 10:30:00', '2024-12-19 10:30:00'),
(1, 6, NULL, '200000', 1, NULL, '2024-12-19 10:30:00', '2024-12-19 10:30:00'),
(1, 7, NULL, '0.2', 1, NULL, '2024-12-19 10:30:00', '2024-12-19 10:30:00'),

-- 高级财务分析实例的变量
(2, 1, '2000000', NULL, 0, NULL, '2024-12-19 10:30:00', '2024-12-19 10:30:00'),
(2, 2, '1200000', NULL, 0, NULL, '2024-12-19 10:30:00', '2024-12-19 10:30:00'),
(2, 3, '300000', NULL, 0, NULL, '2024-12-19 10:30:00', '2024-12-19 10:30:00'),
(2, 4, '0.45', NULL, 0, NULL, '2024-12-19 10:30:00', '2024-12-19 10:30:00'),
(2, 8, '0.25', NULL, 0, NULL, '2024-12-19 10:30:00', '2024-12-19 10:30:00'),
(2, 5, NULL, '545454.55', 1, NULL, '2024-12-19 11:00:00', '2024-12-19 11:00:00'),
(2, 6, NULL, '375000', 1, NULL, '2024-12-19 11:00:00', '2024-12-19 11:00:00'),
(2, 7, NULL, '0.1875', 1, NULL, '2024-12-19 11:00:00', '2024-12-19 11:00:00'),
(2, 9, NULL, '0.25', 1, NULL, '2024-12-19 11:00:00', '2024-12-19 11:00:00'),
(2, 10, NULL, '2.67', 1, NULL, '2024-12-19 11:00:00', '2024-12-19 11:00:00'),

-- 项目成本分析实例的变量
(3, 11, '500000', NULL, 0, NULL, '2024-12-19 12:00:00', '2024-12-19 12:00:00'),
(3, 12, '450000', NULL, 0, NULL, '2024-12-19 12:00:00', '2024-12-19 12:00:00'),
(3, 13, '200000', NULL, 0, NULL, '2024-12-19 12:00:00', '2024-12-19 12:00:00'),
(3, 14, '150000', NULL, 0, NULL, '2024-12-19 12:00:00', '2024-12-19 12:00:00'),
(3, 15, '100000', NULL, 0, NULL, '2024-12-19 12:00:00', '2024-12-19 12:00:00'),

-- 产品定价分析实例的变量
(4, 16, '50', NULL, 0, NULL, '2024-12-19 12:30:00', '2024-12-19 12:30:00'),
(4, 17, '0.3', NULL, 0, NULL, '2024-12-19 12:30:00', '2024-12-19 12:30:00'),
(4, 18, '80', NULL, 0, NULL, '2024-12-19 12:30:00', '2024-12-19 12:30:00'),
(4, 19, '75', NULL, 0, NULL, '2024-12-19 12:30:00', '2024-12-19 12:30:00'),
(4, 20, '-1.5', NULL, 0, NULL, '2024-12-19 12:30:00', '2024-12-19 12:30:00'),
(4, 21, NULL, '71.43', 1, NULL, '2024-12-19 13:00:00', '2024-12-19 13:00:00'),
(4, 22, NULL, '21.43', 1, NULL, '2024-12-19 13:00:00', '2024-12-19 13:00:00'),
(4, 23, NULL, '0.15', 1, NULL, '2024-12-19 13:00:00', '2024-12-19 13:00:00'),
(4, 24, NULL, '0.25', 1, NULL, '2024-12-19 13:00:00', '2024-12-19 13:00:00'),

-- 投资回报分析实例的变量
(5, 25, '1000000', NULL, 0, NULL, '2024-12-19 13:30:00', '2024-12-19 13:30:00'),
(5, 26, '300000', NULL, 0, NULL, '2024-12-19 13:30:00', '2024-12-19 13:30:00'),
(5, 27, '150000', NULL, 0, NULL, '2024-12-19 13:30:00', '2024-12-19 13:30:00'),
(5, 28, '5', NULL, 0, NULL, '2024-12-19 13:30:00', '2024-12-19 13:30:00'),
(5, 29, '0.1', NULL, 0, NULL, '2024-12-19 13:30:00', '2024-12-19 13:30:00'),
(5, 30, NULL, '136365.64', 1, NULL, '2024-12-19 14:00:00', '2024-12-19 14:00:00'),
(5, 31, NULL, '0.15', 1, NULL, '2024-12-19 14:00:00', '2024-12-19 14:00:00'),
(5, 32, NULL, '3.33', 1, NULL, '2024-12-19 14:00:00', '2024-12-19 14:00:00'),
(5, 33, NULL, '1.14', 1, NULL, '2024-12-19 14:00:00', '2024-12-19 14:00:00');

-- 插入测试计算历史数据
INSERT INTO `soo_model_instance_calculation_history` (
    `instance_id`, `calculation_version`, `calculation_type`, `calculation_status`,
    `input_data`, `output_data`, `error_message`, `execution_time`, `triggered_by`,
    `started_at`, `completed_at`, `created_at`
) VALUES 
-- 基础盈亏平衡分析实例的计算历史
(1, '1.0.0', 'MANUAL', 'COMPLETED',
 '{"revenue": 1000000, "cost": 600000, "fixed_cost": 200000, "variable_cost_rate": 0.4}',
 '{"breakeven_point": 333333.33, "profit": 200000, "margin": 0.2, "safety_margin": 0.67}',
 NULL, 1250, 1,
 '2024-12-19 10:30:00', '2024-12-19 10:30:01', '2024-12-19 10:30:00'),

-- 高级财务分析实例的计算历史
(2, '1.0.0', 'MANUAL', 'COMPLETED',
 '{"revenue": 2000000, "cost": 1200000, "fixed_cost": 300000, "variable_cost_rate": 0.45, "tax_rate": 0.25}',
 '{"breakeven_point": 545454.55, "profit": 375000, "margin": 0.1875, "roi": 0.25, "payback_period": 2.67}',
 NULL, 1800, 1,
 '2024-12-19 11:00:00', '2024-12-19 11:00:02', '2024-12-19 11:00:00'),

-- 产品定价分析实例的计算历史
(4, '1.0.0', 'MANUAL', 'COMPLETED',
 '{"unit_cost": 50, "target_margin": 0.3, "market_price": 80, "competitor_price": 75, "demand_elasticity": -1.5}',
 '{"optimal_price": 71.43, "expected_profit": 21.43, "price_sensitivity": 0.15, "market_share": 0.25}',
 NULL, 950, 1,
 '2024-12-19 13:00:00', '2024-12-19 13:00:01', '2024-12-19 13:00:00'),

-- 投资回报分析实例的计算历史
(5, '1.0.0', 'MANUAL', 'COMPLETED',
 '{"initial_investment": 1000000, "annual_revenue": 300000, "annual_cost": 150000, "project_life": 5, "discount_rate": 0.1}',
 '{"npv": 136365.64, "irr": 0.15, "payback_period": 3.33, "profitability_index": 1.14}',
 NULL, 2100, 1,
 '2024-12-19 14:00:00', '2024-12-19 14:00:02', '2024-12-19 14:00:00'),

-- 失败的计算历史示例
(3, '1.0.0', 'AUTO', 'FAILED',
 '{"project_budget": 500000, "actual_cost": 450000}',
 NULL,
 '变量 labor_cost 未定义，无法完成计算', 500, 1,
 '2024-12-19 12:15:00', '2024-12-19 12:15:00', '2024-12-19 12:15:00');

-- 更新实例的最后计算时间
UPDATE `soo_financial_model_instance` 
SET `last_calculated_at` = '2024-12-19 10:30:01' 
WHERE `id` = 1;

UPDATE `soo_financial_model_instance` 
SET `last_calculated_at` = '2024-12-19 11:00:02' 
WHERE `id` = 2;

UPDATE `soo_financial_model_instance` 
SET `last_calculated_at` = '2024-12-19 13:00:01' 
WHERE `id` = 4;

UPDATE `soo_financial_model_instance` 
SET `last_calculated_at` = '2024-12-19 14:00:02' 
WHERE `id` = 5; 