-- 模型变量树形结构示例数据
-- 展示财务模型2.0设计文档中的三个场景
-- 执行日期: 2024-12-19

-- 假设已经存在一个财务模型，ID为1
-- 如果没有，请先创建模型

-- 场景1: 毛利润分配
-- 父级变量：毛利润
INSERT INTO soo_model_variable (
    model_id, variable_code, variable_name, variable_type, data_type,
    default_value, unit, description, is_required, display_order,
    parent_id, constraint_formula, created_at, updated_at
) VALUES 
-- 父变量：毛利润
(1, 'gross_profit', '毛利润', 'INPUT', 'CURRENCY', 10000.00, '元', '毛利润总额', true, 1, NULL, NULL, NOW(), NOW()),

-- 子变量：集团预留比例
(1, 'group_reserve_ratio', '集团预留比例', 'INPUT', 'PERCENTAGE', 40.00, '%', '集团预留的毛利润比例', true, 2, 
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'gross_profit'), 
 'group_reserve_ratio + team_reserve_ratio = 100', NOW(), NOW()),

-- 子变量：团队预留比例
(1, 'team_reserve_ratio', '团队预留比例', 'INPUT', 'PERCENTAGE', 60.00, '%', '团队预留的毛利润比例', true, 3,
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'gross_profit'),
 'group_reserve_ratio + team_reserve_ratio = 100', NOW(), NOW()),

-- 计算变量：集团预留金额
(1, 'group_reserve_amount', '集团预留金额', 'CALC', 'CURRENCY', NULL, '元', '集团预留的毛利润金额', false, 4,
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'gross_profit'),
 'group_reserve_amount = gross_profit * group_reserve_ratio / 100', NOW(), NOW()),

-- 计算变量：团队预留金额
(1, 'team_reserve_amount', '团队预留金额', 'CALC', 'CURRENCY', NULL, '元', '团队预留的毛利润金额', false, 5,
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'gross_profit'),
 'team_reserve_amount = gross_profit * team_reserve_ratio / 100', NOW(), NOW());

-- 场景2: 毛利润分配（包含定向结余）
-- 父级变量：毛利润（如果已存在则跳过）
INSERT INTO soo_model_variable (
    model_id, variable_code, variable_name, variable_type, data_type,
    default_value, unit, description, is_required, display_order,
    parent_id, constraint_formula, created_at, updated_at
) VALUES 
-- 子变量：定向结余
(1, 'surplus_amount', '定向结余', 'INPUT', 'CURRENCY', 1000.00, '元', '定向结余金额', false, 6,
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'gross_profit'),
 'group_reserve_amount + team_reserve_amount + surplus_amount = gross_profit', NOW(), NOW());

-- 场景3: 团队预留比例细分
-- 父级变量：团队预留比例
INSERT INTO soo_model_variable (
    model_id, variable_code, variable_name, variable_type, data_type,
    default_value, unit, description, is_required, display_order,
    parent_id, constraint_formula, created_at, updated_at
) VALUES 
-- 子变量：项目中参与部门的计提比例
(1, 'dept_reserve_ratio', '项目中参与部门的计提比例', 'INPUT', 'PERCENTAGE', 30.00, '%', '部门计提比例', true, 7,
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'team_reserve_ratio'),
 'dept_reserve_ratio + employee_reserve_ratio = 100', NOW(), NOW()),

-- 子变量：项目中参与员工的计提比例
(1, 'employee_reserve_ratio', '项目中参与员工的计提比例', 'INPUT', 'PERCENTAGE', 70.00, '%', '员工计提比例', true, 8,
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'team_reserve_ratio'),
 'dept_reserve_ratio + employee_reserve_ratio = 100', NOW(), NOW()),

-- 计算变量：部门计提金额
(1, 'dept_reserve_amount', '部门计提金额', 'CALC', 'CURRENCY', NULL, '元', '部门计提的金额', false, 9,
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'team_reserve_ratio'),
 'dept_reserve_amount = team_reserve_amount * dept_reserve_ratio / 100', NOW(), NOW()),

-- 计算变量：员工计提金额
(1, 'employee_reserve_amount', '员工计提金额', 'CALC', 'CURRENCY', NULL, '元', '员工计提的金额', false, 10,
 (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'team_reserve_ratio'),
 'employee_reserve_amount = team_reserve_amount * employee_reserve_ratio / 100', NOW(), NOW());

-- 查询树形结构示例
-- 查看根变量
SELECT 
    id, variable_code, variable_name, variable_type, data_type, 
    default_value, unit, parent_id, constraint_formula
FROM soo_model_variable 
WHERE model_id = 1 AND (parent_id IS NULL OR parent_id = 0)
ORDER BY display_order;

-- 查看毛利润的子变量
SELECT 
    v.id, v.variable_code, v.variable_name, v.variable_type, v.data_type,
    v.default_value, v.unit, v.parent_id, v.constraint_formula,
    p.variable_name as parent_name
FROM soo_model_variable v
LEFT JOIN soo_model_variable p ON v.parent_id = p.id
WHERE v.parent_id = (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'gross_profit')
ORDER BY v.display_order;

-- 查看团队预留比例的子变量
SELECT 
    v.id, v.variable_code, v.variable_name, v.variable_type, v.data_type,
    v.default_value, v.unit, v.parent_id, v.constraint_formula,
    p.variable_name as parent_name
FROM soo_model_variable v
LEFT JOIN soo_model_variable p ON v.parent_id = p.id
WHERE v.parent_id = (SELECT id FROM soo_model_variable WHERE model_id = 1 AND variable_code = 'team_reserve_ratio')
ORDER BY v.display_order;

-- 查看完整的树形结构（按层级显示）
WITH RECURSIVE variable_tree AS (
    -- 根节点
    SELECT 
        id, variable_code, variable_name, variable_type, data_type,
        default_value, unit, parent_id, constraint_formula, display_order,
        0 as level, CAST(variable_name AS CHAR(1000)) as path
    FROM soo_model_variable 
    WHERE model_id = 1 AND (parent_id IS NULL OR parent_id = 0)
    
    UNION ALL
    
    -- 子节点
    SELECT 
        v.id, v.variable_code, v.variable_name, v.variable_type, v.data_type,
        v.default_value, v.unit, v.parent_id, v.constraint_formula, v.display_order,
        vt.level + 1, CONCAT(vt.path, ' > ', v.variable_name)
    FROM soo_model_variable v
    INNER JOIN variable_tree vt ON v.parent_id = vt.id
    WHERE v.model_id = 1
)
SELECT 
    level,
    LPAD('', level * 2, '  ') || variable_name as tree_display,
    variable_code,
    variable_type,
    data_type,
    default_value,
    unit,
    constraint_formula,
    path
FROM variable_tree
ORDER BY path, display_order; 