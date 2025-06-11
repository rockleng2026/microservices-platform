-- 初始化central_organization数据库和基础数据
-- 基于Portal 3.0 organization.md设计

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `central_organization` DEFAULT CHARACTER SET = utf8mb4;
USE `central_organization`;

-- 创建基础表结构（如果不存在）
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `employee_id` bigint(20) DEFAULT NULL COMMENT '关联员工ID',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `head_img_url` varchar(200) DEFAULT NULL COMMENT '头像',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
  `sex` tinyint(1) DEFAULT '0' COMMENT '性别 0-男 1-女',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `type` varchar(20) DEFAULT 'APP' COMMENT '用户类型',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `company` varchar(255) DEFAULT NULL COMMENT '公司',
  `open_id` varchar(255) DEFAULT NULL COMMENT '开放ID',
  `is_del` tinyint(1) DEFAULT '0' COMMENT '是否删除',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '创建者ID',
  `tenant_id` varchar(255) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `mobile` (`mobile`),
  KEY `employee_id` (`employee_id`),
  KEY `tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 创建员工表结构（如果不存在）
CREATE TABLE IF NOT EXISTS `employee` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `emp_no` (`emp_no`),
  KEY `department_id` (`department_id`),
  KEY `position_id` (`position_id`),
  KEY `tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

-- 清空现有数据
DELETE FROM `users` WHERE `tenant_id` = 'default';
DELETE FROM `employee` WHERE `tenant_id` = 'default';

-- 插入测试员工数据
INSERT INTO `employee` (`id`, `emp_no`, `name`, `mobile`, `email`, `gender`, `employment_status`, `entry_date`, `education`, `tenant_id`) VALUES
(1, 'EMP20240001', '管理员', '13800001001', 'admin@portal.com', 1, 1, '2020-01-01', '本科', 'default'),
(2, 'EMP20240002', '张三', '13800001002', 'zhangsan@portal.com', 1, 1, '2021-01-01', '本科', 'default'),
(3, 'EMP20240003', '李四', '13800001003', 'lisi@portal.com', 2, 1, '2021-02-01', '硕士', 'default');

-- 插入测试用户数据，正确关联员工ID
INSERT INTO `users` (`id`, `username`, `password`, `employee_id`, `nickname`, `mobile`, `sex`, `enabled`, `type`, `tenant_id`) VALUES
(1, 'admin', '{bcrypt}$2a$10$N.zmdr9k7uOCQb97VOzAhEoiB2YjIWbdA5oHW.0CcEpHJCL3e12Qm', 1, '系统管理员', '13800001001', 1, 1, 'portal', 'default'), -- 密码: admin123
(2, 'zhangsan', '{bcrypt}$2a$10$N.zmdr9k7uOCQb97VOzAhEoiB2YjIWbdA5oHW.0CcEpHJCL3e12Qm', 2, '张三', '13800001002', 1, 1, 'portal', 'default'), -- 密码: admin123
(3, 'lisi', '{bcrypt}$2a$10$N.zmdr9k7uOCQb97VOzAhEoiB2YjIWbdA5oHW.0CcEpHJCL3e12Qm', 3, '李四', '13800001003', 2, 1, 'portal', 'default'); -- 密码: admin123

-- 验证插入结果
SELECT u.id, u.username, u.nickname, u.employee_id, e.name as employee_name, u.enabled, u.tenant_id 
FROM `users` u 
LEFT JOIN `employee` e ON u.employee_id = e.id 
WHERE u.tenant_id = 'default';

-- 显示表结构
SHOW CREATE TABLE `users`;
SHOW CREATE TABLE `employee`; 