-- 更新项目利润计提状态字段
-- 如果字段不存在则添加，如果存在则更新现有数据

-- 1. 添加字段（如果不存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'project' 
               AND COLUMN_NAME = 'profit_distribution_status');

SET @sql = IF(@exist = 0, 
    'ALTER TABLE project ADD COLUMN profit_distribution_status VARCHAR(50) DEFAULT ''not_set'' COMMENT ''利润计提状态：not_set未设置,awaiting_approval待审批,in_approval审批中,approved审批通过,approval_failed审批失败,partially_settled部分计提,settled已计提完毕'' AFTER final_status',
    'SELECT ''字段已存在'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 添加索引（如果不存在）
SET @index_exist := (SELECT COUNT(*) FROM information_schema.STATISTICS 
                     WHERE TABLE_SCHEMA = DATABASE() 
                     AND TABLE_NAME = 'project' 
                     AND INDEX_NAME = 'idx_profit_distribution_status');

SET @index_sql = IF(@index_exist = 0,
    'ALTER TABLE project ADD INDEX idx_profit_distribution_status (profit_distribution_status)',
    'SELECT ''索引已存在'' AS message');
PREPARE index_stmt FROM @index_sql;
EXECUTE index_stmt;
DEALLOCATE PREPARE index_stmt;

-- 3. 更新现有数据的默认值
UPDATE project 
SET profit_distribution_status = 'not_set' 
WHERE profit_distribution_status IS NULL 
   OR profit_distribution_status = '';

-- 4. 根据项目状态智能设置初始值
-- 如果项目已有提成分配记录，设置为awaiting_approval
UPDATE project p
SET p.profit_distribution_status = 'awaiting_approval'
WHERE p.profit_distribution_status = 'not_set'
  AND EXISTS (
    SELECT 1 FROM project_profit_distribution ppd 
    WHERE ppd.project_id = p.id 
    AND ppd.delflag = 0
  );

-- 5. 显示更新结果
SELECT 
    profit_distribution_status,
    COUNT(*) as count
FROM project 
WHERE delflag = 0
GROUP BY profit_distribution_status
ORDER BY profit_distribution_status; 