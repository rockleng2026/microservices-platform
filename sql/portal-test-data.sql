-- ===================================================================
-- Portal 3.0 测试数据脚本
-- 用于测试Portal用户登录和权限功能
-- ===================================================================

USE central_organization;

-- 清理测试数据
DELETE FROM workposition_manage_dept WHERE workposition_id IN (1, 2, 3);
DELETE FROM workposition WHERE id IN (1, 2, 3);
DELETE FROM employee WHERE id IN (1, 2, 3);
DELETE FROM users WHERE id IN (1, 2, 3);
DELETE FROM department WHERE id IN (1, 2, 3);

-- 插入测试部门
INSERT INTO department (id, name, director_id, parent_id, dep_no, grade_id, tel, address, description, sort_order, status, delflag, tenant_id, created_by) VALUES
(1, 'Portal科技有限公司', NULL, 0, 'D001', 1, '021-12345678', '上海市浦东新区', '公司总部', 1, 1, 0, 'default', 1),
(2, '技术研发部', NULL, 1, 'D002', 4, '021-12345679', '上海市浦东新区A座5楼', '负责产品技术研发', 1, 1, 0, 'default', 1),
(3, '人事行政部', NULL, 1, 'D003', 4, '021-12345680', '上海市浦东新区A座3楼', '负责人事管理和行政事务', 2, 1, 0, 'default', 1);

-- 插入测试岗位（配置菜单权限）
INSERT INTO workposition (id, name, short_name, department_id, position_level, job_description, menu_ids, menu_func_ids, is_manager, is_director, sort_order, status, delflag, tenant_id, created_by) VALUES
(1, '系统管理员', '系统管理', 2, 3, '负责系统的日常维护、用户管理、权限配置等工作', '1,2,3,4,5,6,7,8,9,10', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20', 0, 0, 1, 1, 0, 'default', 1),
(2, '高级开发工程师', '高级开发', 2, 4, '负责核心业务系统的开发、架构设计和技术攻关', '1,2,3,4,5,8,9', '1,2,3,4,5,6,7,8,9,10,11,12', 0, 0, 2, 1, 0, 'default', 1),
(3, '人事专员', '人事专员', 3, 2, '负责招聘、员工关系维护、考勤管理等工作', '1,2,3,4,5', '1,2,3,4,5,6,7,8', 0, 0, 1, 1, 0, 'default', 1);

-- 插入测试员工
INSERT INTO employee (id, emp_no, name, birth_date, gender, id_card, mobile, email, department_id, position_id, grade_id, employment_type, employment_status, entry_date, login_account_flag, education, tenant_id, created_by) VALUES
(1, 'E001', '张明', '1990-05-15', 1, '310101199005150001', '13800138001', 'zhang.ming@portal.com', 2, 1, 3, 1, 1, '2023-01-15', 1, '本科', 'default', 1),
(2, 'E002', '李华', '1988-03-20', 1, '310101198803200001', '13800138002', 'li.hua@portal.com', 2, 2, 4, 1, 1, '2022-06-01', 1, '硕士', 'default', 1),
(3, 'E003', '王小红', '1992-08-10', 2, '310101199208100001', '13800138003', 'wang.xiaohong@portal.com', 3, 3, 2, 1, 1, '2023-03-01', 1, '本科', 'default', 1);

-- 插入测试用户（密码都是: admin123，BCrypt加密后的值）
INSERT INTO users (id, username, password, employee_id, nickname, mobile, sex, enabled, type, create_time, update_time, company, tenant_id) VALUES
(1, 'admin', '$2a$10$TJyFNFt8khGjXS9fWEvPOOvJdNDzWbjLNTpLz2gNYwUKGsPvDnIwq', 1, '系统管理员', '13800138001', 1, 1, 'portal', NOW(), NOW(), 'Portal科技有限公司', 'default'),
(2, 'lihua', '$2a$10$TJyFNFt8khGjXS9fWEvPOOvJdNDzWbjLNTpLz2gNYwUKGsPvDnIwq', 2, '李华', '13800138002', 1, 1, 'portal', NOW(), NOW(), 'Portal科技有限公司', 'default'),
(3, 'wangxh', '$2a$10$TJyFNFt8khGjXS9fWEvPOOvJdNDzWbjLNTpLz2gNYwUKGsPvDnIwq', 3, '王小红', '13800138003', 2, 1, 'portal', NOW(), NOW(), 'Portal科技有限公司', 'default');

-- 更新岗位的分管部门关系
INSERT INTO workposition_manage_dept (workposition_id, department_id, manage_type, tenant_id, created_by) VALUES
(1, 2, 1, 'default', 1),  -- 系统管理员分管技术部
(1, 3, 1, 'default', 1),  -- 系统管理员分管人事部
(2, 2, 2, 'default', 1),  -- 高级开发协管技术部
(3, 3, 1, 'default', 1);  -- 人事专员分管人事部

-- 验证数据
SELECT '=== 用户信息 ===' as info;
SELECT u.id, u.username, u.nickname, e.name as employee_name, e.emp_no, d.name as dept_name, w.name as position_name
FROM users u 
LEFT JOIN employee e ON u.employee_id = e.id
LEFT JOIN department d ON e.department_id = d.id  
LEFT JOIN workposition w ON e.position_id = w.id
WHERE u.type = 'portal';

SELECT '=== 岗位权限配置 ===' as info;
SELECT w.id, w.name, w.menu_ids, w.menu_func_ids, d.name as dept_name
FROM workposition w
LEFT JOIN department d ON w.department_id = d.id
WHERE w.id IN (1, 2, 3);

SELECT '=== 菜单数据 ===' as info;
SELECT mp.id, mp.name, mp.parent_id, mp.link_url, mp.icon, mp.sort_order
FROM menu_page mp 
WHERE mp.status = 1 AND mp.delflag = 0
ORDER BY mp.parent_id, mp.sort_order;

-- 提示信息
SELECT '测试账号信息:' as tip, 'admin/admin123 (系统管理员)' as account_1, 'lihua/admin123 (开发工程师)' as account_2, 'wangxh/admin123 (人事专员)' as account_3; 