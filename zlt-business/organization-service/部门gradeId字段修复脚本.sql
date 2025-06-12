-- 部门gradeId字段修复脚本
-- 用于修复数据库中grade_id字段为NULL的部门数据

-- 1. 首先查看当前gradeId为空的部门
SELECT id, name, dep_no, parent_id, grade_id 
FROM department 
WHERE delflag = 0 AND grade_id IS NULL
ORDER BY parent_id, id;

-- 2. 为根部门（parent_id=0）设置grade_id=1
UPDATE department 
SET grade_id = 1, updated_at = NOW()
WHERE delflag = 0 
  AND grade_id IS NULL 
  AND parent_id = 0;

-- 3. 为二级部门设置grade_id=2
UPDATE department 
SET grade_id = 2, updated_at = NOW()
WHERE delflag = 0 
  AND grade_id IS NULL 
  AND parent_id IN (
    SELECT id FROM (
      SELECT id FROM department 
      WHERE delflag = 0 AND parent_id = 0
    ) AS temp
  );

-- 4. 为三级部门设置grade_id=3
UPDATE department 
SET grade_id = 3, updated_at = NOW()
WHERE delflag = 0 
  AND grade_id IS NULL 
  AND parent_id IN (
    SELECT id FROM (
      SELECT id FROM department 
      WHERE delflag = 0 AND grade_id = 2
    ) AS temp
  );

-- 5. 为四级部门设置grade_id=4
UPDATE department 
SET grade_id = 4, updated_at = NOW()
WHERE delflag = 0 
  AND grade_id IS NULL 
  AND parent_id IN (
    SELECT id FROM (
      SELECT id FROM department 
      WHERE delflag = 0 AND grade_id = 3
    ) AS temp
  );

-- 6. 为五级部门设置grade_id=5
UPDATE department 
SET grade_id = 5, updated_at = NOW()
WHERE delflag = 0 
  AND grade_id IS NULL 
  AND parent_id IN (
    SELECT id FROM (
      SELECT id FROM department 
      WHERE delflag = 0 AND grade_id = 4
    ) AS temp
  );

-- 7. 为六级部门设置grade_id=6
UPDATE department 
SET grade_id = 6, updated_at = NOW()
WHERE delflag = 0 
  AND grade_id IS NULL 
  AND parent_id IN (
    SELECT id FROM (
      SELECT id FROM department 
      WHERE delflag = 0 AND grade_id = 5
    ) AS temp
  );

-- 8. 为七级部门设置grade_id=7
UPDATE department 
SET grade_id = 7, updated_at = NOW()
WHERE delflag = 0 
  AND grade_id IS NULL 
  AND parent_id IN (
    SELECT id FROM (
      SELECT id FROM department 
      WHERE delflag = 0 AND grade_id = 6
    ) AS temp
  );

-- 9. 验证修复结果：检查是否还有gradeId为空的部门
SELECT id, name, dep_no, parent_id, grade_id 
FROM department 
WHERE delflag = 0 AND grade_id IS NULL;

-- 10. 查看修复后的部门层级分布
SELECT grade_id, COUNT(*) as count
FROM department 
WHERE delflag = 0
GROUP BY grade_id
ORDER BY grade_id;

-- 11. 查看具体的部门层级结构
SELECT 
  d1.id,
  d1.name,
  d1.dep_no,
  d1.grade_id,
  CASE 
    WHEN d1.parent_id = 0 THEN '根部门'
    ELSE p.name
  END as parent_name
FROM department d1
LEFT JOIN department p ON d1.parent_id = p.id AND p.delflag = 0
WHERE d1.delflag = 0
ORDER BY d1.grade_id, d1.parent_id, d1.id;

-- 注意事项：
-- 1. 执行前请备份数据库
-- 2. 可以先在测试环境验证
-- 3. 如果组织结构复杂（超过7级），可能需要调整脚本
-- 4. 执行完成后，重启应用或清理缓存以确保更改生效 