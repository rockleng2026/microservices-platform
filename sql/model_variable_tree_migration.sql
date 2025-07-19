-- 模型变量表树形结构迁移脚本
-- 为soo_model_variable表添加parent_id和constraint_formula字段
-- 执行日期: 2024-12-19

-- 检查字段是否存在，如果不存在则添加
-- 添加parent_id字段
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'soo_model_variable' 
     AND COLUMN_NAME = 'parent_id') = 0,
    'ALTER TABLE soo_model_variable ADD COLUMN parent_id BIGINT COMMENT ''父级树ID,标识这个变量属于parent_id的子变量，他的值受父级变量值的约束''',
    'SELECT ''parent_id字段已存在'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加constraint_formula字段
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'soo_model_variable' 
     AND COLUMN_NAME = 'constraint_formula') = 0,
    'ALTER TABLE soo_model_variable ADD COLUMN constraint_formula TEXT COMMENT ''约束条件公式，定义子变量与父变量之间的关系''',
    'SELECT ''constraint_formula字段已存在'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 为parent_id字段添加索引
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'soo_model_variable' 
     AND INDEX_NAME = 'idx_parent_id') = 0,
    'ALTER TABLE soo_model_variable ADD INDEX idx_parent_id (parent_id)',
    'SELECT ''parent_id索引已存在'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 为constraint_formula字段添加索引（用于全文搜索）
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'soo_model_variable' 
     AND INDEX_NAME = 'idx_constraint_formula') = 0,
    'ALTER TABLE soo_model_variable ADD INDEX idx_constraint_formula (constraint_formula(100))',
    'SELECT ''constraint_formula索引已存在'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新表注释
ALTER TABLE soo_model_variable COMMENT = '模型变量表 - 支持树形结构和约束条件';

-- 显示表结构
DESCRIBE soo_model_variable;

-- 显示添加的字段信息
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'soo_model_variable' 
AND COLUMN_NAME IN ('parent_id', 'constraint_formula');

-- 显示索引信息
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'soo_model_variable' 
AND INDEX_NAME IN ('idx_parent_id', 'idx_constraint_formula'); 