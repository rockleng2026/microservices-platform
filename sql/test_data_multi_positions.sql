-- Portal 多岗位功能测试数据
-- 创建时间: 2024-12-19
-- 用途: 为多岗位功能提供测试数据

SET NAMES utf8mb4;

-- ===================================================================
-- 1. 创建测试部门
-- ===================================================================

-- 插入测试部门（如果不存在）
INSERT IGNORE INTO `department` (`id`, `name`, `parent_id`, `dep_no`, `grade_id`, `sort_order`, `status`, `tenant_id`, `created_at`) VALUES
(1, '总经理办公室', 0, 'GM001', 1, 1, 1, 'default', NOW()),
(2, '技术研发部', 1, 'RD001', 2, 2, 1, 'default', NOW()),
(3, '市场营销部', 1, 'MK001', 2, 3, 1, 'default', NOW()),
(4, '人力资源部', 1, 'HR001', 2, 4, 1, 'default', NOW()),
(5, '财务部', 1, 'FN001', 2, 5, 1, 'default', NOW()),
(6, '前端开发组', 2, 'FE001', 3, 6, 1, 'default', NOW()),
(7, '后端开发组', 2, 'BE001', 3, 7, 1, 'default', NOW());

-- ===================================================================
-- 2. 创建测试岗位
-- ===================================================================

-- 插入测试岗位
INSERT IGNORE INTO `workposition` (`id`, `name`, `short_name`, `department_id`, `position_level`, `job_description`, `is_manager`, `is_director`, `sort_order`, `status`, `tenant_id`, `created_at`) VALUES
(1, '总经理', '总经理', 1, 1, '负责公司整体战略规划和经营管理', 1, 1, 1, 1, 'default', NOW()),
(2, '技术总监', '技术总监', 2, 2, '负责技术团队管理和技术架构规划', 1, 1, 2, 1, 'default', NOW()),
(3, '市场总监', '市场总监', 3, 2, '负责市场策略制定和市场团队管理', 1, 1, 3, 1, 'default', NOW()),
(4, '人力资源经理', 'HR经理', 4, 3, '负责人力资源管理和企业文化建设', 1, 0, 4, 1, 'default', NOW()),
(5, '财务经理', '财务经理', 5, 3, '负责财务管理和成本控制', 1, 0, 5, 1, 'default', NOW()),
(6, '前端开发经理', '前端经理', 6, 4, '负责前端开发团队管理', 1, 0, 6, 1, 'default', NOW()),
(7, '后端开发经理', '后端经理', 7, 4, '负责后端开发团队管理', 1, 0, 7, 1, 'default', NOW()),
(8, '高级前端工程师', '高级前端', 6, 5, '负责前端架构设计和核心功能开发', 0, 0, 8, 1, 'default', NOW()),
(9, '高级后端工程师', '高级后端', 7, 5, '负责后端架构设计和核心功能开发', 0, 0, 9, 1, 'default', NOW()),
(10, '产品经理', '产品经理', 3, 4, '负责产品规划和需求管理', 0, 0, 10, 1, 'default', NOW());

-- ===================================================================
-- 3. 创建岗位分管关系（实现多岗位功能）
-- ===================================================================

-- 插入岗位分管关系（岗位A分管岗位B）
INSERT IGNORE INTO `workposition_manage_dept` (`workposition_id`, `charge_department_id`, `charge_workposition_id`, `tenant_id`, `created_at`) VALUES
-- 总经理分管各部门经理岗位
(1, 2, 2, 'default', NOW()),  -- 总经理分管技术总监
(1, 3, 3, 'default', NOW()),  -- 总经理分管市场总监
(1, 4, 4, 'default', NOW()),  -- 总经理分管HR经理
(1, 5, 5, 'default', NOW()),  -- 总经理分管财务经理

-- 技术总监分管开发经理岗位
(2, 6, 6, 'default', NOW()),  -- 技术总监分管前端经理
(2, 7, 7, 'default', NOW()),  -- 技术总监分管后端经理

-- 前端经理分管前端工程师
(6, 6, 8, 'default', NOW()),  -- 前端经理分管高级前端工程师

-- 后端经理分管后端工程师
(7, 7, 9, 'default', NOW()),  -- 后端经理分管高级后端工程师

-- 市场总监分管产品经理
(3, 3, 10, 'default', NOW()); -- 市场总监分管产品经理

-- ===================================================================
-- 4. 创建测试员工
-- ===================================================================

-- 插入测试员工
INSERT IGNORE INTO `employee` (`id`, `emp_no`, `name`, `mobile`, `email`, `department_id`, `position_id`, `employment_status`, `entry_date`, `tenant_id`, `created_at`) VALUES
(1, 'EMP001', '张三', '13800138001', 'zhangsan@portal.com', 1, 1, 1, '2024-01-01', 'default', NOW()),
(2, 'EMP002', '李四', '13800138002', 'lisi@portal.com', 2, 2, 1, '2024-01-15', 'default', NOW()),
(3, 'EMP003', '王五', '13800138003', 'wangwu@portal.com', 3, 3, 1, '2024-02-01', 'default', NOW()),
(4, 'EMP004', '赵六', '13800138004', 'zhaoliu@portal.com', 6, 6, 1, '2024-02-15', 'default', NOW()),
(5, 'EMP005', '钱七', '13800138005', 'qianqi@portal.com', 7, 7, 1, '2024-03-01', 'default', NOW());

-- ===================================================================
-- 5. 创建测试用户
-- ===================================================================

-- 插入测试用户（如果不存在）
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `nickname`, `mobile`, `email`, `enabled`, `employee_id`, `tenant_id`, `created_time`) VALUES
(1, 'admin', '{bcrypt}$2a$10$TJMxNfqq/Gg4.PsWv1jL5OQzBt.SV.cYwmjR5.YqEYt1J.hNp.OlO', '系统管理员', '13800138001', 'admin@portal.com', 1, 1, 'default', NOW()),
(2, 'tech_director', '{bcrypt}$2a$10$TJMxNfqq/Gg4.PsWv1jL5OQzBt.SV.cYwmjR5.YqEYt1J.hNp.OlO', '技术总监', '13800138002', 'tech@portal.com', 1, 2, 'default', NOW()),
(3, 'market_director', '{bcrypt}$2a$10$TJMxNfqq/Gg4.PsWv1jL5OQzBt.SV.cYwmjR5.YqEYt1J.hNp.OlO', '市场总监', '13800138003', 'market@portal.com', 1, 3, 'default', NOW()),
(4, 'frontend_manager', '{bcrypt}$2a$10$TJMxNfqq/Gg4.PsWv1jL5OQzBt.SV.cYwmjR5.YqEYt1J.hNp.OlO', '前端经理', '13800138004', 'frontend@portal.com', 1, 4, 'default', NOW()),
(5, 'backend_manager', '{bcrypt}$2a$10$TJMxNfqq/Gg4.PsWv1jL5OQzBt.SV.cYwmjR5.YqEYt1J.hNp.OlO', '后端经理', '13800138005', 'backend@portal.com', 1, 5, 'default', NOW());

-- ===================================================================
-- 6. 创建用户个性化配置
-- ===================================================================

-- 插入用户个性化配置
INSERT IGNORE INTO `user_personal_config` (`user_id`, `default_position_id`, `theme`, `language`, `tenant_id`, `enabled`, `created_at`) VALUES
(1, 1, 'light', 'zh-CN', 'default', 1, NOW()),
(2, 2, 'light', 'zh-CN', 'default', 1, NOW()),
(3, 3, 'light', 'zh-CN', 'default', 1, NOW()),
(4, 6, 'light', 'zh-CN', 'default', 1, NOW()),
(5, 7, 'light', 'zh-CN', 'default', 1, NOW());

-- ===================================================================
-- 验证查询SQL
-- ===================================================================

-- 查询用户的主岗位
SELECT u.username, e.name as employee_name, wp.name as position_name, d.name as dept_name
FROM users u
LEFT JOIN employee e ON u.employee_id = e.id
LEFT JOIN workposition wp ON e.position_id = wp.id
LEFT JOIN department d ON wp.department_id = d.id
WHERE u.tenant_id = 'default';

-- 查询技术总监（岗位ID=2）的分管岗位
SELECT 
wp.id, wp.name, wp.short_name, d.name as dept_name
FROM workposition wp
INNER JOIN workposition_manage_dept wmd ON wp.id = wmd.charge_workposition_id
INNER JOIN department d ON wp.department_id = d.id
WHERE wmd.workposition_id = 2 AND wmd.tenant_id = 'default'
AND wp.status = 1
AND wp.delflag = 0
ORDER BY wp.sort_order ASC;

-- 验证完整的多岗位查询（主岗位 + 分管岗位）
SELECT 'main_position' as position_type, wp.id, wp.name, wp.short_name, d.name as dept_name
FROM employee e
JOIN workposition wp ON e.position_id = wp.id
JOIN department d ON wp.department_id = d.id
WHERE e.id = 2  -- 技术总监员工

UNION ALL

SELECT 'managed_position' as position_type, wp.id, wp.name, wp.short_name, d.name as dept_name
FROM workposition wp
INNER JOIN workposition_manage_dept wmd ON wp.id = wmd.charge_workposition_id
INNER JOIN department d ON wp.department_id = d.id
WHERE wmd.workposition_id = (SELECT position_id FROM employee WHERE id = 2)  -- 技术总监的岗位ID
AND wmd.tenant_id = 'default'
AND wp.status = 1
AND wp.delflag = 0
ORDER BY position_type, id; 