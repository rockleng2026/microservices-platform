-- ===================================================================
-- Portal 3.0 组织架构模块完整数据库脚本
-- 包含用户、员工、部门、岗位、菜单权限、个性化配置等完整功能
-- ===================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `central_organization` DEFAULT CHARACTER SET = utf8mb4;
USE `central_organization`;

-- ===================================================================
-- 1. 清理现有数据
-- ===================================================================

DELETE FROM `user_personal_config` WHERE `tenant_id` = 'default';
DELETE FROM `menu_function` WHERE `tenant_id` = 'default';
DELETE FROM `menu` WHERE `tenant_id` = 'default';
DELETE FROM `workposition_manage_dept` WHERE `tenant_id` = 'default';
DELETE FROM `users` WHERE `tenant_id` = 'default';
DELETE FROM `employee` WHERE `tenant_id` = 'default';
DELETE FROM `workposition` WHERE `tenant_id` = 'default';
DELETE FROM `department` WHERE `tenant_id` = 'default';

-- ===================================================================
-- 2. 表结构创建
-- ===================================================================

-- 部门表
CREATE TABLE IF NOT EXISTS `department` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '部门名称',
  `director_id` bigint(20) DEFAULT NULL COMMENT '部门主管员工ID',
  `parent_id` bigint(20) DEFAULT '0' COMMENT '上级部门ID，0表示顶级部门',
  `dep_no` varchar(50) DEFAULT NULL COMMENT '部门编号',
  `grade_id` bigint(20) DEFAULT NULL COMMENT '部门级别ID',
  `description` text COMMENT '部门描述',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序序号',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) DEFAULT NULL COMMENT '更新人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dep_no_tenant` (`dep_no`, `tenant_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_director_id` (`director_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 工作岗位表
CREATE TABLE IF NOT EXISTS `workposition` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '岗位名称',
  `short_name` varchar(50) DEFAULT NULL COMMENT '岗位简称',
  `department_id` bigint(20) DEFAULT NULL COMMENT '所属部门ID',
  `position_level` int(11) DEFAULT '3' COMMENT '岗位级别：1-高管，2-中层，3-基层',
  `job_description` text COMMENT '岗位描述',
  `requirements` text COMMENT '任职要求',
  `salary_range` varchar(100) DEFAULT NULL COMMENT '薪资范围',
  `max_employees` int(11) DEFAULT '1' COMMENT '最大员工数',
  `menu_ids` text COMMENT '菜单权限ID列表，逗号分隔',
  `menu_func_ids` text COMMENT '菜单功能权限ID列表，逗号分隔',
  `is_manager` tinyint(1) DEFAULT '0' COMMENT '是否管理岗位',
  `is_director` tinyint(1) DEFAULT '0' COMMENT '是否主管岗位',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序序号',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) DEFAULT NULL COMMENT '更新人ID',
  PRIMARY KEY (`id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_position_level` (`position_level`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作岗位表';

-- 员工表
CREATE TABLE IF NOT EXISTS `employee` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `emp_no` varchar(50) NOT NULL COMMENT '员工编号',
  `name` varchar(50) NOT NULL COMMENT '姓名',
  `name_en` varchar(100) DEFAULT NULL COMMENT '英文名',
  `birth_date` date DEFAULT NULL COMMENT '出生日期',
  `gender` tinyint(1) DEFAULT NULL COMMENT '性别 1-男 2-女',
  `id_card` varchar(18) DEFAULT NULL COMMENT '身份证号',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `department_id` bigint(20) DEFAULT NULL COMMENT '部门ID',
  `position_id` bigint(20) DEFAULT NULL COMMENT '岗位ID',
  `grade_id` bigint(20) DEFAULT NULL COMMENT '职级ID',
  `employment_type` tinyint(1) DEFAULT '1' COMMENT '用工类型 1-正式员工 2-实习生 3-外包',
  `employment_status` tinyint(1) DEFAULT '1' COMMENT '在职状态 1-在职 2-离职 3-停薪留职',
  `entry_date` date DEFAULT NULL COMMENT '入职日期',
  `education` varchar(20) DEFAULT NULL COMMENT '学历',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) DEFAULT NULL COMMENT '更新人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_no_tenant` (`emp_no`, `tenant_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_position_id` (`position_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `employee_id` bigint(20) DEFAULT NULL COMMENT '关联员工ID',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `head_img_url` varchar(200) DEFAULT NULL COMMENT '头像',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
  `sex` tinyint(1) DEFAULT '0' COMMENT '性别 0-男 1-女',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `type` varchar(20) DEFAULT 'portal' COMMENT '用户类型',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `company` varchar(255) DEFAULT NULL COMMENT '公司',
  `open_id` varchar(255) DEFAULT NULL COMMENT '开放ID',
  `is_del` tinyint(1) DEFAULT '0' COMMENT '是否删除',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '创建者ID',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username_tenant` (`username`, `tenant_id`),
  KEY `idx_mobile` (`mobile`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 菜单表
CREATE TABLE IF NOT EXISTS `menu` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '菜单名称',
  `code` varchar(100) NOT NULL COMMENT '菜单编码',
  `parent_id` bigint(20) DEFAULT '0' COMMENT '父菜单ID，0表示顶级菜单',
  `path` varchar(255) DEFAULT NULL COMMENT '菜单路径',
  `component` varchar(255) DEFAULT NULL COMMENT '组件路径',
  `icon` varchar(100) DEFAULT NULL COMMENT '菜单图标',
  `menu_type` tinyint(4) DEFAULT '1' COMMENT '菜单类型：1-菜单，2-按钮，3-外链',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序序号',
  `visible` tinyint(1) DEFAULT '1' COMMENT '是否显示',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) DEFAULT NULL COMMENT '更新人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code_tenant` (`code`, `tenant_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';

-- 菜单功能权限表
CREATE TABLE IF NOT EXISTS `menu_function` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `menu_id` bigint(20) NOT NULL COMMENT '菜单ID',
  `name` varchar(100) NOT NULL COMMENT '功能名称',
  `code` varchar(100) NOT NULL COMMENT '功能编码',
  `description` varchar(255) DEFAULT NULL COMMENT '功能描述',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序序号',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_code_tenant` (`menu_id`, `code`, `tenant_id`),
  KEY `idx_menu_id` (`menu_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单功能权限表';

-- 岗位分管部门关系表
CREATE TABLE IF NOT EXISTS `workposition_manage_dept` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `workposition_id` bigint(20) NOT NULL COMMENT '岗位ID',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `manage_type` tinyint(1) DEFAULT '1' COMMENT '管理类型：1-直接管理，2-协助管理',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pos_dept_tenant` (`workposition_id`, `department_id`, `tenant_id`),
  KEY `idx_workposition_id` (`workposition_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位分管部门关系表';

-- 用户个性化配置表
CREATE TABLE IF NOT EXISTS `user_personal_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `default_position_id` bigint(20) DEFAULT NULL COMMENT '默认岗位ID，当用户有多个岗位时，指定默认登录时展示的岗位',
  `theme` varchar(50) DEFAULT 'light' COMMENT '系统主题配置：light(浅色主题)、dark(深色主题)、auto(跟随系统)',
  `layout_config` longtext COMMENT '布局配置，JSON格式存储，包含侧边栏、顶栏等布局偏好',
  `language` varchar(20) DEFAULT 'zh-CN' COMMENT '语言设置：zh-CN(中文简体)、zh-TW(中文繁体)、en-US(英语)',
  `timezone` varchar(50) DEFAULT 'Asia/Shanghai' COMMENT '时区设置',
  `home_page` varchar(255) DEFAULT '/dashboard' COMMENT '首页设置，登录后默认跳转的页面路径',
  `notification_config` longtext COMMENT '消息通知配置，JSON格式存储各类消息的通知偏好',
  `extend_config` longtext COMMENT '其他扩展配置，JSON格式存储其他个性化设置',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) DEFAULT NULL COMMENT '更新人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_tenant` (`user_id`, `tenant_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_default_position` (`default_position_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户个性化配置表';

-- ===================================================================
-- 3. 基础数据插入
-- ===================================================================

-- 插入部门数据
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
(8, '测试质量组', NULL, 2, 'RD103', 3, '负责软件测试和质量保证', 3, 'default', NOW());

-- 插入岗位数据（包含权限配置）
INSERT INTO `workposition` (`id`, `name`, `short_name`, `department_id`, `position_level`, `job_description`, `menu_ids`, `menu_func_ids`, `is_manager`, `is_director`, `sort_order`, `tenant_id`, `created_at`) VALUES
-- 公司级别岗位
(1, '总经理', '总经理', 1, 1, '负责公司整体战略规划和经营管理', '1,2,3,4,5,6,7,8,9,10', '1,2,3,4,5,6,7,8,9,10,11,12,13', 1, 1, 1, 'default', NOW()),
(2, '副总经理', '副总', 1, 2, '协助总经理管理公司日常经营', '1,2,3,4,5,6,7,8,9', '1,2,3,4,5,6,7,8,9,10,11,12', 1, 1, 2, 'default', NOW()),
-- 技术研发部岗位
(3, '技术总监', '技术总监', 2, 1, '负责技术团队管理和技术架构设计', '1,2,3,4,5,8,10', '1,2,3,4,5,6,7,8,9,10,11,12,13', 1, 1, 1, 'default', NOW()),
(4, '高级架构师', '架构师', 2, 2, '负责系统架构设计和技术选型', '1,2,8', '1,5,9', 0, 0, 2, 'default', NOW()),
(5, '后端开发经理', '后端经理', 6, 1, '负责后端开发团队管理和项目推进', '1,2,4,5,8', '1,5,6,7,9,10,11', 1, 0, 1, 'default', NOW()),
(6, '高级后端工程师', '高级后端', 6, 2, '负责核心后端功能开发', '1,8', '1,5,9', 0, 0, 2, 'default', NOW()),
(7, '中级后端工程师', '中级后端', 6, 3, '负责业务功能开发和维护', '1,8', '1,5,9', 0, 0, 3, 'default', NOW());

-- 插入员工数据
INSERT INTO `employee` (`id`, `emp_no`, `name`, `mobile`, `email`, `gender`, `department_id`, `position_id`, `employment_status`, `entry_date`, `education`, `tenant_id`, `created_at`) VALUES
(1, 'EMP20240001', '系统管理员', '13800001001', 'admin@portal.com', 1, 1, 1, 1, '2020-01-01', '本科', 'default', NOW()),
(2, 'EMP20240002', '张三', '13800001002', 'zhangsan@portal.com', 1, 6, 6, 1, '2021-01-01', '本科', 'default', NOW()),
(3, 'EMP20240003', '李四', '13800001003', 'lisi@portal.com', 2, 7, 7, 1, '2021-02-01', '硕士', 'default', NOW());

-- 插入用户数据
INSERT INTO `users` (`id`, `username`, `password`, `employee_id`, `nickname`, `mobile`, `sex`, `enabled`, `type`, `tenant_id`) VALUES
(1, 'admin', '{bcrypt}$2a$10$N.zmdr9k7uOCQb97VOzAhEoiB2YjIWbdA5oHW.0CcEpHJCL3e12Qm', 1, '系统管理员', '13800001001', 1, 1, 'portal', 'default'), -- 密码: admin123
(2, 'zhangsan', '{bcrypt}$2a$10$N.zmdr9k7uOCQb97VOzAhEoiB2YjIWbdA5oHW.0CcEpHJCL3e12Qm', 2, '张三', '13800001002', 1, 1, 'portal', 'default'), -- 密码: admin123
(3, 'lisi', '{bcrypt}$2a$10$N.zmdr9k7uOCQb97VOzAhEoiB2YjIWbdA5oHW.0CcEpHJCL3e12Qm', 3, '李四', '13800001003', 2, 1, 'portal', 'default'); -- 密码: admin123

-- 插入菜单数据
INSERT INTO `menu` (`id`, `name`, `code`, `parent_id`, `path`, `component`, `icon`, `menu_type`, `sort_order`, `tenant_id`) VALUES
(1, '系统管理', 'system', 0, '/system', NULL, 'system', 1, 1, 'default'),
(2, '用户管理', 'user', 1, '/system/user', 'system/user/index', 'user', 1, 1, 'default'),
(3, '部门管理', 'department', 1, '/system/department', 'system/department/index', 'department', 1, 2, 'default'),
(4, '岗位管理', 'position', 1, '/system/position', 'system/position/index', 'position', 1, 3, 'default'),
(5, '菜单管理', 'menu', 1, '/system/menu', 'system/menu/index', 'menu', 1, 4, 'default'),
(6, '业务管理', 'business', 0, '/business', NULL, 'business', 1, 2, 'default'),
(7, '客户管理', 'customer', 6, '/business/customer', 'business/customer/index', 'customer', 1, 1, 'default'),
(8, '个人中心', 'profile', 0, '/profile', 'profile/index', 'user', 1, 9, 'default'),
(9, '财务管理', 'finance', 0, '/finance', NULL, 'money', 1, 3, 'default'),
(10, '报表中心', 'report', 0, '/report', NULL, 'chart', 1, 4, 'default');

-- 插入菜单功能权限数据
INSERT INTO `menu_function` (`id`, `menu_id`, `name`, `code`, `description`, `sort_order`, `tenant_id`) VALUES
(1, 2, '查看用户', 'view', '查看用户列表', 1, 'default'),
(2, 2, '新增用户', 'create', '新增用户', 2, 'default'),
(3, 2, '编辑用户', 'edit', '编辑用户信息', 3, 'default'),
(4, 2, '删除用户', 'delete', '删除用户', 4, 'default'),
(5, 2, '重置密码', 'reset_password', '重置用户密码', 5, 'default'),
(6, 3, '查看部门', 'view', '查看部门列表', 1, 'default'),
(7, 3, '新增部门', 'create', '新增部门', 2, 'default'),
(8, 3, '编辑部门', 'edit', '编辑部门信息', 3, 'default'),
(9, 3, '删除部门', 'delete', '删除部门', 4, 'default'),
(10, 4, '查看岗位', 'view', '查看岗位列表', 1, 'default'),
(11, 4, '新增岗位', 'create', '新增岗位', 2, 'default'),
(12, 4, '编辑岗位', 'edit', '编辑岗位信息', 3, 'default'),
(13, 4, '删除岗位', 'delete', '删除岗位', 4, 'default');

-- 插入用户个性化配置数据
INSERT INTO `user_personal_config` (
    `user_id`, `default_position_id`, `theme`, `layout_config`, `language`, `timezone`,
    `home_page`, `notification_config`, `extend_config`, `enabled`, `tenant_id`,
    `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES
(1, 1, 'light', '{"sidebarCollapsed": false, "showBreadcrumb": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{"email": true, "push": true, "sms": false}', '{}', 1, 'default', NOW(), NOW(), 1, 1),
(2, 6, 'light', '{"sidebarCollapsed": false, "showBreadcrumb": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{"email": true, "push": true, "sms": false}', '{}', 1, 'default', NOW(), NOW(), 2, 2),
(3, 7, 'light', '{"sidebarCollapsed": false, "showBreadcrumb": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{"email": true, "push": true, "sms": false}', '{}', 1, 'default', NOW(), NOW(), 3, 3);

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- 验证数据
-- ===================================================================

-- 查看完整的用户权限配置
SELECT 
    u.id, u.username, u.nickname,
    e.name as employee_name, e.emp_no,
    d.name as department_name,
    wp.name as position_name,
    upc.theme, upc.language,
    upc.default_position_id
FROM users u
LEFT JOIN employee e ON u.employee_id = e.id
LEFT JOIN department d ON e.department_id = d.id
LEFT JOIN workposition wp ON e.position_id = wp.id
LEFT JOIN user_personal_config upc ON u.id = upc.user_id
WHERE u.tenant_id = 'default'
ORDER BY u.id;

-- 查看菜单权限配置
SELECT 
    m.id, m.name, m.code, m.parent_id, 
    (CASE WHEN m.parent_id = 0 THEN '顶级菜单' ELSE pm.name END) as parent_name,
    m.path, m.sort_order
FROM menu m
LEFT JOIN menu pm ON m.parent_id = pm.id
WHERE m.tenant_id = 'default'
ORDER BY m.parent_id, m.sort_order; 