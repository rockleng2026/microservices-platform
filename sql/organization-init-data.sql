-- ===================================================================
-- Portal 3.0 组织架构初始化数据脚本
-- 基于 organization.md 设计理念
-- 权限体系：用户 → 员工 → 部门/岗位 → 功能页面/功能点
-- ===================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===================================================================
-- 1. 清理现有数据
-- ===================================================================

DELETE FROM `workposition_manage_dept` WHERE `tenant_id` = 'default';
DELETE FROM `users` WHERE `tenant_id` = 'default';
DELETE FROM `employee` WHERE `tenant_id` = 'default';
DELETE FROM `workposition` WHERE `tenant_id` = 'default';
DELETE FROM `department` WHERE `tenant_id` = 'default';

-- ===================================================================
-- 2. 部门结构数据
-- ===================================================================

-- 创建Portal科技公司完整部门结构
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `description`, `sort_order`, `tenant_id`, `created_at`) VALUES
-- 一级部门：总部
(1, 'Portal科技公司', NULL, 0, 'HQ001', 1, '公司总部', 1, 'default', NOW()),

-- 二级部门：主要业务部门
(2, '技术研发部', NULL, 1, 'RD001', 2, '负责产品技术研发和创新', 1, 'default', NOW()),
(3, '人力行政部', NULL, 1, 'HR001', 2, '负责人力资源管理和行政事务', 2, 'default', NOW()),
(4, '市场销售部', NULL, 1, 'MK001', 2, '负责市场营销和销售业务', 3, 'default', NOW()),
(5, '财务部', NULL, 1, 'FN001', 2, '负责财务管理和会计核算', 4, 'default', NOW()),

-- 三级部门：技术研发部下属
(6, '后端开发组', NULL, 2, 'RD101', 3, '负责后端系统开发', 1, 'default', NOW()),
(7, '前端开发组', NULL, 2, 'RD102', 3, '负责前端界面开发', 2, 'default', NOW()),
(8, '测试质量组', NULL, 2, 'RD103', 3, '负责软件测试和质量保证', 3, 'default', NOW()),
(9, '运维支持组', NULL, 2, 'RD104', 3, '负责系统运维和技术支持', 4, 'default', NOW()),

-- 三级部门：人力行政部下属
(10, '招聘培训组', NULL, 3, 'HR101', 3, '负责人员招聘和员工培训', 1, 'default', NOW()),
(11, '薪酬绩效组', NULL, 3, 'HR102', 3, '负责薪酬管理和绩效考核', 2, 'default', NOW()),
(12, '行政后勤组', NULL, 3, 'HR103', 3, '负责行政管理和后勤服务', 3, 'default', NOW());

-- ===================================================================
-- 3. 岗位数据（包含权限配置）
-- ===================================================================

-- 创建各部门关键岗位，直接配置menu_ids和menu_func_ids
INSERT INTO `workposition` (`id`, `name`, `short_name`, `department_id`, `position_level`, `job_description`, `requirements`, `salary_range`, `max_employees`, `menu_ids`, `menu_func_ids`, `is_manager`, `is_director`, `sort_order`, `tenant_id`, `created_at`) VALUES

-- 公司级别岗位
(1, '总经理', '总经理', 1, 1, '负责公司整体战略规划和经营管理', '10年以上管理经验，具备战略思维', '面议', 1, '1,2,3,4,5,6,7,8,9,10', '1,2,3,4,5,6,7,8,9,10,11,12,13', 1, 1, 1, 'default', NOW()),
(2, '副总经理', '副总', 1, 2, '协助总经理管理公司日常经营', '8年以上管理经验', '面议', 2, '1,2,3,4,5,6,7,8,9', '1,2,3,4,5,6,7,8,9,10,11,12', 1, 1, 2, 'default', NOW()),

-- 技术研发部岗位
(3, '技术总监', '技术总监', 2, 1, '负责技术团队管理和技术架构设计', '8年以上技术经验，5年以上管理经验', '30-50万', 1, '1,2,3,4,5,8,10', '1,2,3,4,5,6,7,8,9,10,11,12,13', 1, 1, 1, 'default', NOW()),
(4, '高级架构师', '架构师', 2, 2, '负责系统架构设计和技术选型', '5年以上架构经验', '25-40万', 2, '1,2,8', '1,5,9', 0, 0, 2, 'default', NOW()),
(5, '后端开发经理', '后端经理', 6, 1, '负责后端开发团队管理和项目推进', '5年以上开发经验，3年以上管理经验', '20-35万', 1, '1,2,4,5,8', '1,5,6,7,9,10,11', 1, 0, 1, 'default', NOW()),
(6, '高级后端工程师', '高级后端', 6, 2, '负责核心后端功能开发', '3年以上Java开发经验', '18-30万', 5, '1,8', '1,5,9', 0, 0, 2, 'default', NOW()),
(7, '中级后端工程师', '中级后端', 6, 3, '负责业务功能开发和维护', '1-3年开发经验', '12-20万', 10, '1,8', '1,5,9', 0, 0, 3, 'default', NOW()),
(8, '前端开发经理', '前端经理', 7, 1, '负责前端开发团队管理', '5年以上前端经验，2年以上管理经验', '18-30万', 1, '1,2,4,5,8', '1,5,6,7,9,10,11', 1, 0, 1, 'default', NOW()),
(9, '高级前端工程师', '高级前端', 7, 2, '负责前端架构和核心功能开发', '3年以上前端开发经验', '15-25万', 3, '1,8', '1,5,9', 0, 0, 2, 'default', NOW()),
(10, '测试经理', '测试经理', 8, 1, '负责测试团队管理和质量把控', '5年以上测试经验，2年以上管理经验', '15-25万', 1, '1,2,4,5,8', '1,5,6,7,9,10,11', 1, 0, 1, 'default', NOW()),
(11, '高级测试工程师', '高级测试', 8, 2, '负责测试方案设计和自动化测试', '3年以上测试经验', '12-20万', 3, '1,8', '1,5,9', 0, 0, 2, 'default', NOW()),

-- 人力行政部岗位
(12, 'HR总监', 'HR总监', 3, 1, '负责人力资源战略规划和团队管理', '8年以上HR经验，5年以上管理经验', '25-40万', 1, '1,2,3,4,5', '1,2,3,4,5,6,7,8,9,10,11,12,13', 1, 1, 1, 'default', NOW()),
(13, '招聘经理', '招聘经理', 10, 1, '负责公司招聘工作和人才储备', '5年以上招聘经验', '15-25万', 1, '1,2,4', '1,5,6,7,9', 1, 0, 1, 'default', NOW()),
(14, '招聘专员', '招聘专员', 10, 2, '负责具体招聘执行工作', '2年以上招聘经验', '8-15万', 3, '1,2,4', '1,5,6,7,9', 0, 0, 2, 'default', NOW()),
(15, '薪酬绩效经理', '薪酬经理', 11, 1, '负责薪酬设计和绩效管理', '5年以上薪酬绩效经验', '18-30万', 1, '1,2,4', '1,5,6,7,9', 1, 0, 1, 'default', NOW()),
(16, 'HR专员', 'HR专员', 11, 2, '负责人力资源日常事务处理', '1年以上HR经验', '6-12万', 2, '1,2,4', '1,5,9', 0, 0, 2, 'default', NOW()),
(17, '行政经理', '行政经理', 12, 1, '负责行政管理和后勤服务', '3年以上行政管理经验', '12-20万', 1, '1,2', '1,5,9', 1, 0, 1, 'default', NOW()),

-- 市场销售部岗位
(18, '销售总监', '销售总监', 4, 1, '负责销售团队管理和业绩达成', '8年以上销售经验，5年以上管理经验', '30-50万+提成', 1, '1,6,7,9', '1,5,9', 1, 1, 1, 'default', NOW()),
(19, '销售经理', '销售经理', 4, 2, '负责区域销售管理', '5年以上销售经验，2年以上管理经验', '20-35万+提成', 3, '1,6,7,9', '1,5,9', 1, 0, 2, 'default', NOW()),
(20, '高级销售代表', '高级销售', 4, 3, '负责重要客户维护和新客户开发', '3年以上销售经验', '15-25万+提成', 5, '1,6,7', '1,5,9', 0, 0, 3, 'default', NOW()),

-- 财务部岗位
(21, '财务总监', '财务总监', 5, 1, '负责财务管理和风险控制', '8年以上财务经验，CPA资格', '25-40万', 1, '1,2,4,9,10', '1,5,9', 1, 1, 1, 'default', NOW()),
(22, '财务经理', '财务经理', 5, 2, '负责财务核算和报表管理', '5年以上财务经验', '15-25万', 1, '1,9', '1,5,9', 1, 0, 2, 'default', NOW()),
(23, '会计', '会计', 5, 3, '负责日常财务核算工作', '2年以上会计经验', '8-15万', 2, '1,9', '1,5,9', 0, 0, 3, 'default', NOW());

-- ===================================================================
-- 4. 员工数据
-- ===================================================================

-- 创建示例员工数据
INSERT INTO `employee` (`id`, `emp_no`, `name`, `name_en`, `birth_date`, `gender`, `id_card`, `mobile`, `email`, `department_id`, `position_id`, `grade_id`, `employment_type`, `employment_status`, `entry_date`, `education`, `tenant_id`, `created_at`) VALUES

-- 公司高管
(1, 'EMP20240001', '张伟强', 'Zhang Weiqiang', '1975-03-15', 1, '110101197503156789', '13800001001', 'zhangwq@portal.com', 1, 1, 10, 1, 1, '2020-01-01', '硕士', 'default', NOW()),
(2, 'EMP20240002', '李雅芳', 'Li Yafang', '1978-07-22', 2, '110101197807226789', '13800001002', 'liyf@portal.com', 1, 2, 9, 1, 1, '2020-02-01', '硕士', 'default', NOW()),

-- 技术团队
(3, 'EMP20240003', '王建华', 'Wang Jianhua', '1982-11-08', 1, '110101198211086789', '13800001003', 'wangjh@portal.com', 2, 3, 9, 1, 1, '2020-03-01', '硕士', 'default', NOW()),
(4, 'EMP20240004', '陈明亮', 'Chen Mingliang', '1985-09-12', 1, '110101198509126789', '13800001004', 'chenml@portal.com', 2, 4, 8, 1, 1, '2020-04-01', '本科', 'default', NOW()),
(5, 'EMP20240005', '刘华强', 'Liu Huaqiang', '1987-05-20', 1, '110101198705206789', '13800001005', 'liuhq@portal.com', 6, 5, 7, 1, 1, '2020-05-01', '本科', 'default', NOW()),
(6, 'EMP20240006', '赵敏', 'Zhao Min', '1990-12-03', 2, '110101199012036789', '13800001006', 'zhaom@portal.com', 6, 6, 6, 1, 1, '2021-01-15', '本科', 'default', NOW()),
(7, 'EMP20240007', '周杰', 'Zhou Jie', '1992-08-18', 1, '110101199208186789', '13800001007', 'zhouj@portal.com', 6, 7, 5, 1, 1, '2021-03-01', '本科', 'default', NOW()),
(8, 'EMP20240008', '孙丽', 'Sun Li', '1988-04-25', 2, '110101198804256789', '13800001008', 'sunl@portal.com', 7, 8, 7, 1, 1, '2020-06-01', '本科', 'default', NOW()),
(9, 'EMP20240009', '马超', 'Ma Chao', '1991-01-10', 1, '110101199101106789', '13800001009', 'machao@portal.com', 7, 9, 6, 1, 1, '2021-05-01', '本科', 'default', NOW()),
(10, 'EMP20240010', '黄飞鸿', 'Huang Feihong', '1989-10-30', 1, '110101198910306789', '13800001010', 'huangfh@portal.com', 8, 10, 7, 1, 1, '2020-07-01', '本科', 'default', NOW()),

-- HR团队
(11, 'EMP20240011', '林雪梅', 'Lin Xuemei', '1983-06-14', 2, '110101198306146789', '13800001011', 'linxm@portal.com', 3, 12, 9, 1, 1, '2020-02-15', '硕士', 'default', NOW()),
(12, 'EMP20240012', '吴佳怡', 'Wu Jiayi', '1986-02-28', 2, '110101198602286789', '13800001012', 'wujy@portal.com', 10, 13, 7, 1, 1, '2020-08-01', '本科', 'default', NOW()),
(13, 'EMP20240013', '许文静', 'Xu Wenjing', '1993-04-16', 2, '110101199304166789', '13800001013', 'xuwj@portal.com', 10, 14, 5, 1, 1, '2021-09-01', '本科', 'default', NOW()),
(14, 'EMP20240014', '胡小芳', 'Hu Xiaofang', '1987-12-05', 2, '110101198712056789', '13800001014', 'huxf@portal.com', 11, 15, 7, 1, 1, '2020-09-01', '本科', 'default', NOW()),
(15, 'EMP20240015', '梁美玲', 'Liang Meiling', '1994-07-08', 2, '110101199407086789', '13800001015', 'liangml@portal.com', 11, 16, 4, 1, 1, '2022-01-10', '本科', 'default', NOW()),

-- 销售团队
(16, 'EMP20240016', '郑志强', 'Zheng Zhiqiang', '1980-09-22', 1, '110101198009226789', '13800001016', 'zhengzq@portal.com', 4, 18, 9, 1, 1, '2020-03-15', '本科', 'default', NOW()),
(17, 'EMP20240017', '钟辉', 'Zhong Hui', '1984-11-18', 1, '110101198411186789', '13800001017', 'zhongh@portal.com', 4, 19, 8, 1, 1, '2020-10-01', '本科', 'default', NOW()),
(18, 'EMP20240018', '谢丽娜', 'Xie Lina', '1990-03-25', 2, '110101199003256789', '13800001018', 'xieln@portal.com', 4, 20, 6, 1, 1, '2021-06-15', '本科', 'default', NOW()),

-- 财务团队
(19, 'EMP20240019', '冯建国', 'Feng Jianguo', '1979-05-12', 1, '110101197905126789', '13800001019', 'fengjg@portal.com', 5, 21, 9, 1, 1, '2020-04-15', '硕士', 'default', NOW()),
(20, 'EMP20240020', '邓秀珍', 'Deng Xiuzhen', '1985-08-30', 2, '110101198508306789', '13800001020', 'dengxz@portal.com', 5, 22, 8, 1, 1, '2020-11-01', '本科', 'default', NOW());

-- ===================================================================
-- 5. 用户账号数据
-- ===================================================================

-- 创建用户登录账号
INSERT INTO `users` (`id`, `username`, `password`, `employee_id`, `nickname`, `mobile`, `sex`, `enabled`, `type`, `create_time`, `update_time`, `tenant_id`) VALUES

-- 管理层账号
(1, 'admin', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 1, '张总', '13800001001', 1, 1, 'app', NOW(), NOW(), 'default'), -- 密码: 123456
(2, 'vp001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 2, '李副总', '13800001002', 2, 1, 'app', NOW(), NOW(), 'default'),

-- 技术团队账号
(3, 'cto001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 3, '王技术总监', '13800001003', 1, 1, 'app', NOW(), NOW(), 'default'),
(4, 'arch001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 4, '陈架构师', '13800001004', 1, 1, 'app', NOW(), NOW(), 'default'),
(5, 'dev001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 5, '刘开发经理', '13800001005', 1, 1, 'app', NOW(), NOW(), 'default'),
(6, 'dev002', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 6, '赵敏', '13800001006', 2, 1, 'app', NOW(), NOW(), 'default'),
(7, 'dev003', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 7, '周杰', '13800001007', 1, 1, 'app', NOW(), NOW(), 'default'),

-- HR团队账号
(8, 'hr001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 11, 'HR总监', '13800001011', 2, 1, 'app', NOW(), NOW(), 'default'),
(9, 'hr002', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 12, '招聘经理', '13800001012', 2, 1, 'app', NOW(), NOW(), 'default'),
(10, 'hr003', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 13, '小许', '13800001013', 2, 1, 'app', NOW(), NOW(), 'default'),

-- 销售团队账号
(11, 'sales001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 16, '销售总监', '13800001016', 1, 1, 'app', NOW(), NOW(), 'default'),
(12, 'sales002', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 17, '钟经理', '13800001017', 1, 1, 'app', NOW(), NOW(), 'default'),

-- 财务团队账号
(13, 'fin001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 19, '财务总监', '13800001019', 1, 1, 'app', NOW(), NOW(), 'default'),
(14, 'fin002', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 20, '邓会计', '13800001020', 2, 1, 'app', NOW(), NOW(), 'default');

-- ===================================================================
-- 6. 更新部门主管关联
-- ===================================================================

-- 更新部门主管信息
UPDATE `department` SET `director_id` = 3 WHERE `id` = 2; -- 技术研发部主管：王建华
UPDATE `department` SET `director_id` = 11 WHERE `id` = 3; -- 人力行政部主管：林雪梅
UPDATE `department` SET `director_id` = 16 WHERE `id` = 4; -- 市场销售部主管：郑志强
UPDATE `department` SET `director_id` = 19 WHERE `id` = 5; -- 财务部主管：冯建国
UPDATE `department` SET `director_id` = 5 WHERE `id` = 6; -- 后端开发组主管：刘华强
UPDATE `department` SET `director_id` = 8 WHERE `id` = 7; -- 前端开发组主管：孙丽
UPDATE `department` SET `director_id` = 10 WHERE `id` = 8; -- 测试质量组主管：黄飞鸿
UPDATE `department` SET `director_id` = 12 WHERE `id` = 10; -- 招聘培训组主管：吴佳怡
UPDATE `department` SET `director_id` = 14 WHERE `id` = 11; -- 薪酬绩效组主管：胡小芳

-- ===================================================================
-- 7. 岗位分管部门配置
-- ===================================================================

-- 配置岗位分管部门关系
INSERT INTO `workposition_manage_dept` (`workposition_id`, `department_id`, `manage_type`, `tenant_id`) VALUES

-- 总经理分管所有部门
(1, 2, 1, 'default'), (1, 3, 1, 'default'), (1, 4, 1, 'default'), (1, 5, 1, 'default'),

-- 副总经理协管主要部门
(2, 2, 2, 'default'), (2, 3, 2, 'default'), (2, 4, 2, 'default'),

-- 技术总监分管技术部门
(3, 6, 1, 'default'), (3, 7, 1, 'default'), (3, 8, 1, 'default'), (3, 9, 1, 'default'),

-- 部门经理分管本部门
(5, 6, 1, 'default'), -- 后端开发经理管理后端开发组
(8, 7, 1, 'default'), -- 前端开发经理管理前端开发组
(10, 8, 1, 'default'), -- 测试经理管理测试质量组
(13, 10, 1, 'default'), -- 招聘经理管理招聘培训组
(15, 11, 1, 'default'), -- 薪酬绩效经理管理薪酬绩效组
(17, 12, 1, 'default'), -- 行政经理管理行政后勤组
(19, 4, 1, 'default'), -- 销售经理管理销售部门
(22, 5, 1, 'default'); -- 财务经理管理财务部门

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- 8. 数据验证查询
-- ===================================================================

-- 验证组织架构数据
SELECT 
    '=== 组织架构概览 ===' as info,
    (SELECT COUNT(*) FROM department WHERE tenant_id = 'default') as 部门总数,
    (SELECT COUNT(*) FROM workposition WHERE tenant_id = 'default') as 岗位总数,
    (SELECT COUNT(*) FROM employee WHERE tenant_id = 'default') as 员工总数,
    (SELECT COUNT(*) FROM users WHERE tenant_id = 'default') as 用户总数;

-- 验证权限分配
SELECT 
    '=== 权限配置概览 ===' as info,
    (SELECT COUNT(*) FROM workposition WHERE menu_ids IS NOT NULL AND tenant_id = 'default') as 已配置菜单权限岗位数,
    (SELECT COUNT(*) FROM workposition WHERE menu_func_ids IS NOT NULL AND tenant_id = 'default') as 已配置功能权限岗位数,
    (SELECT COUNT(*) FROM workposition_manage_dept WHERE tenant_id = 'default') as 岗位分管关系数;

-- 验证各级管理岗位
SELECT 
    '=== 管理岗位统计 ===' as info,
    (SELECT COUNT(*) FROM workposition WHERE is_director = 1 AND tenant_id = 'default') as 领导岗位数,
    (SELECT COUNT(*) FROM workposition WHERE is_manager = 1 AND tenant_id = 'default') as 主管岗位数;

-- ===================================================================
-- 初始化完成
-- =================================================================== 