-- ===================================================================
-- Portal 3.0 示例数据初始化脚本
-- 创建时间: 2024-12-19
-- 描述: 包含用户、员工、职位和权限的完整示例数据
-- ===================================================================

SET NAMES utf8mb4;

-- ===================================================================
-- 1. 初始化部门数据
-- ===================================================================

-- 插入根部门（总公司）
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`) VALUES
(1, 'Portal科技有限公司', NULL, 0, 'D001', 1, 1, '021-12345678', '上海市浦东新区张江高科技园区', '公司总部', 1, 1, 0, NOW(), NOW(), 'default', 1);

-- 插入技术部
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`) VALUES
(2, '技术研发部', NULL, 1, 'D002', 4, 0, '021-12345679', '上海市浦东新区张江高科技园区A座5楼', '负责产品技术研发', 1, 1, 0, NOW(), NOW(), 'default', 1);

-- 插入人事行政部
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`) VALUES
(3, '人事行政部', NULL, 1, 'D003', 4, 0, '021-12345680', '上海市浦东新区张江高科技园区A座3楼', '负责人事管理和行政事务', 2, 1, 0, NOW(), NOW(), 'default', 1);

-- ===================================================================
-- 2. 初始化职位数据
-- ===================================================================

-- 插入系统管理员职位
INSERT INTO `workposition` (`id`, `name`, `short_name`, `department_id`, `position_level`, `job_description`, `requirements`, `salary_range`, `max_employees`, `is_manager`, `is_director`, `sort_order`, `status`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`) VALUES
(1, '系统管理员', '系统管理', 2, 3, '负责系统的日常维护、用户管理、权限配置等工作', '计算机相关专业，熟悉Linux、数据库管理，有系统运维经验', '8000-12000', 2, 0, 0, 1, 1, 0, NOW(), NOW(), 'default', 1);

-- 插入高级开发工程师职位
INSERT INTO `workposition` (`id`, `name`, `short_name`, `department_id`, `position_level`, `job_description`, `requirements`, `salary_range`, `max_employees`, `is_manager`, `is_director`, `sort_order`, `status`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`) VALUES
(2, '高级开发工程师', '高级开发', 2, 4, '负责核心业务系统的开发、架构设计和技术攻关', 'Java开发经验5年以上，熟悉Spring、微服务架构，有大型项目经验', '15000-25000', 5, 0, 0, 2, 1, 0, NOW(), NOW(), 'default', 1);

-- 插入人事专员职位
INSERT INTO `workposition` (`id`, `name`, `short_name`, `department_id`, `position_level`, `job_description`, `requirements`, `salary_range`, `max_employees`, `is_manager`, `is_director`, `sort_order`, `status`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`) VALUES
(3, '人事专员', '人事专员', 3, 2, '负责招聘、员工关系维护、考勤管理等工作', '人力资源相关专业，有2年以上HR工作经验，沟通能力强', '6000-10000', 3, 0, 0, 1, 1, 0, NOW(), NOW(), 'default', 1);

-- ===================================================================
-- 3. 初始化员工数据
-- ===================================================================

-- 插入系统管理员员工
INSERT INTO `employee` (`id`, `emp_no`, `name`, `name_en`, `birth_date`, `gender`, `id_card`, `mobile`, `email`, `department_id`, `position_id`, `grade_id`, `employment_type`, `employment_status`, `entry_date`, `probation_end_date`, `login_account_flag`, `education`, `nation`, `health_status`, `height`, `weight`, `marital_status`, `birthplace`, `residence`, `emergency_contact`, `emergency_phone`, `specialty`, `avatar`, `remark`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`, `updated_by`) VALUES
(1, 'E001', '张明', 'Zhang Ming', '1990-05-15', 1, '310101199005150000', '13800138001', 'zhang.ming@portal.com', 2, 1, 3, 1, 1, '2023-01-15', '2023-04-15', 1, '本科', '汉族', '健康', '175', '70', '未婚', '上海市', '上海市浦东新区', '张父', '13900139001', 'Linux系统管理、数据库运维', '', '系统管理专家，负责公司IT基础设施', 0, NOW(), NOW(), 'default', 1, 1);

-- 插入高级开发工程师员工
INSERT INTO `employee` (`id`, `emp_no`, `name`, `name_en`, `birth_date`, `gender`, `id_card`, `mobile`, `email`, `department_id`, `position_id`, `grade_id`, `employment_type`, `employment_status`, `entry_date`, `probation_end_date`, `login_account_flag`, `education`, `nation`, `health_status`, `height`, `weight`, `marital_status`, `birthplace`, `residence`, `emergency_contact`, `emergency_phone`, `specialty`, `avatar`, `remark`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`, `updated_by`) VALUES
(2, 'E002', '李华', 'Li Hua', '1988-03-20', 1, '310101198803200000', '13800138002', 'li.hua@portal.com', 2, 2, 4, 1, 1, '2022-06-01', '2022-09-01', 1, '硕士', '汉族', '健康', '178', '72', '已婚', '北京市', '上海市徐汇区', '李妻', '13900139002', 'Java开发、微服务架构、系统设计', '', '技术骨干，参与核心系统开发', 0, NOW(), NOW(), 'default', 1, 1);

-- 插入人事专员员工
INSERT INTO `employee` (`id`, `emp_no`, `name`, `name_en`, `birth_date`, `gender`, `id_card`, `mobile`, `email`, `department_id`, `position_id`, `grade_id`, `employment_type`, `employment_status`, `entry_date`, `probation_end_date`, `login_account_flag`, `education`, `nation`, `health_status`, `height`, `weight`, `marital_status`, `birthplace`, `residence`, `emergency_contact`, `emergency_phone`, `specialty`, `avatar`, `remark`, `delflag`, `created_at`, `updated_at`, `tenant_id`, `created_by`, `updated_by`) VALUES
(3, 'E003', '王小红', 'Wang Xiaohong', '1992-08-10', 2, '310101199208100000', '13800138003', 'wang.xiaohong@portal.com', 3, 3, 2, 1, 1, '2023-03-01', '2023-06-01', 1, '本科', '汉族', '健康', '165', '55', '未婚', '江苏省', '上海市黄浦区', '王母', '13900139003', '招聘管理、员工关系、薪酬福利', '', '人事管理专员，负责公司人力资源工作', 0, NOW(), NOW(), 'default', 1, 1);

-- ===================================================================
-- 4. 初始化用户数据
-- ===================================================================

-- 系统管理员用户（对应员工张明）
INSERT INTO `users` (`id`, `username`, `password`, `employee_id`, `nickname`, `head_img_url`, `mobile`, `sex`, `enabled`, `type`, `create_time`, `update_time`, `company`, `open_id`, `is_del`, `creator_id`, `tenant_id`) VALUES
(1, 'admin', '$2a$10$TJyFNFt8khGjXS9fWEvPOOvJdNDzWbjLNTpLz2gNYwUKGsPvDnIwq', 1, '系统管理员', '', '13800138001', 1, 1, 'admin', NOW(), NOW(), 'Portal科技有限公司', '', 0, 1, 'default');

-- 开发工程师用户（对应员工李华）
INSERT INTO `users` (`id`, `username`, `password`, `employee_id`, `nickname`, `head_img_url`, `mobile`, `sex`, `enabled`, `type`, `create_time`, `update_time`, `company`, `open_id`, `is_del`, `creator_id`, `tenant_id`) VALUES
(2, 'lihua', '$2a$10$TJyFNFt8khGjXS9fWEvPOOvJdNDzWbjLNTpLz2gNYwUKGsPvDnIwq', 2, '李华', '', '13800138002', 1, 1, 'employee', NOW(), NOW(), 'Portal科技有限公司', '', 0, 1, 'default');

-- 人事专员用户（对应员工王小红）
INSERT INTO `users` (`id`, `username`, `password`, `employee_id`, `nickname`, `head_img_url`, `mobile`, `sex`, `enabled`, `type`, `create_time`, `update_time`, `company`, `open_id`, `is_del`, `creator_id`, `tenant_id`) VALUES
(3, 'wangxh', '$2a$10$TJyFNFt8khGjXS9fWEvPOOvJdNDzWbjLNTpLz2gNYwUKGsPvDnIwq', 3, '王小红', '', '13800138003', 2, 1, 'employee', NOW(), NOW(), 'Portal科技有限公司', '', 0, 1, 'default');

-- ===================================================================
-- 5. 创建权限关联表（如果不存在的话）
-- ===================================================================

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `user_role` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `role_id` bigint(20) NOT NULL COMMENT '角色ID',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`, `tenant_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 角色菜单关联表
CREATE TABLE IF NOT EXISTS `role_menu` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` bigint(20) NOT NULL COMMENT '角色ID',
  `menu_id` bigint(20) NOT NULL COMMENT '菜单ID',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_menu` (`role_id`, `menu_id`, `tenant_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';

-- 角色功能权限关联表
CREATE TABLE IF NOT EXISTS `role_function` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` bigint(20) NOT NULL COMMENT '角色ID',
  `function_id` bigint(20) NOT NULL COMMENT '功能权限ID',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_function` (`role_id`, `function_id`, `tenant_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_function_id` (`function_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色功能权限关联表';

-- ===================================================================
-- 6. 初始化权限关联数据
-- ===================================================================

-- 为系统管理员用户分配系统管理员角色
INSERT INTO `user_role` (`user_id`, `role_id`, `tenant_id`) VALUES
(1, 1, 'default'); -- admin用户分配系统管理员角色

-- 为开发工程师用户分配普通员工角色
INSERT INTO `user_role` (`user_id`, `role_id`, `tenant_id`) VALUES
(2, 4, 'default'); -- lihua用户分配普通员工角色

-- 为人事专员用户分配HR管理员角色
INSERT INTO `user_role` (`user_id`, `role_id`, `tenant_id`) VALUES
(3, 2, 'default'); -- wangxh用户分配HR管理员角色

-- ===================================================================
-- 7. 为系统管理员角色分配所有菜单权限
-- ===================================================================

-- 系统管理员角色分配系统管理相关菜单
INSERT INTO `role_menu` (`role_id`, `menu_id`, `tenant_id`) VALUES
(1, 10, 'default'), -- 系统管理
(1, 11, 'default'), -- 用户管理  
(1, 12, 'default'), -- 角色管理
(1, 13, 'default'), -- 菜单管理
(1, 14, 'default'), -- 权限管理
(1, 15, 'default'), -- 操作日志
(1, 16, 'default'), -- 系统配置
(1, 17, 'default'), -- 租户管理
(1, 18, 'default'); -- 租户配置

-- ===================================================================
-- 8. 为系统管理员角色分配所有功能权限
-- ===================================================================

-- 用户管理功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 1, id, 'default' FROM `menu_func` WHERE `menu_page_id` = 11 AND `tenant_id` = 'default';

-- 角色管理功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 1, id, 'default' FROM `menu_func` WHERE `menu_page_id` = 12 AND `tenant_id` = 'default';

-- 菜单管理功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 1, id, 'default' FROM `menu_func` WHERE `menu_page_id` = 13 AND `tenant_id` = 'default';

-- 权限管理功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 1, id, 'default' FROM `menu_func` WHERE `menu_page_id` = 14 AND `tenant_id` = 'default';

-- 操作日志功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 1, id, 'default' FROM `menu_func` WHERE `menu_page_id` = 15 AND `tenant_id` = 'default';

-- 系统配置功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 1, id, 'default' FROM `menu_func` WHERE `menu_page_id` = 16 AND `tenant_id` = 'default';

-- 租户管理功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 1, id, 'default' FROM `menu_func` WHERE `menu_page_id` = 17 AND `tenant_id` = 'default';

-- 租户配置功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 1, id, 'default' FROM `menu_func` WHERE `menu_page_id` = 18 AND `tenant_id` = 'default';

-- ===================================================================
-- 9. 为HR管理员角色分配相关权限
-- ===================================================================

-- HR管理员角色分配组织架构相关菜单
INSERT INTO `role_menu` (`role_id`, `menu_id`, `tenant_id`) VALUES
(2, 2, 'default'), -- 组织架构
(2, 3, 'default'), -- 部门管理
(2, 4, 'default'), -- 员工管理
(2, 5, 'default'), -- 岗位管理
(2, 11, 'default'), -- 用户管理（只读）
(2, 15, 'default'); -- 操作日志（只读）

-- HR管理员分配组织架构功能权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 2, id, 'default' FROM `menu_func` WHERE `menu_page_id` IN (3, 4, 5) AND `tenant_id` = 'default';

-- ===================================================================
-- 10. 为普通员工角色分配基础权限
-- ===================================================================

-- 普通员工角色分配基础菜单
INSERT INTO `role_menu` (`role_id`, `menu_id`, `tenant_id`) VALUES
(4, 1, 'default'), -- 工作台
(4, 2, 'default'), -- 组织架构（只读）
(4, 6, 'default'), -- CRM管理
(4, 7, 'default'), -- 客户管理
(4, 8, 'default'), -- 产品管理
(4, 9, 'default'); -- 订单管理

-- 普通员工分配只读权限
INSERT INTO `role_function` (`role_id`, `function_id`, `tenant_id`) 
SELECT 4, id, 'default' FROM `menu_func` WHERE `perm_code` LIKE '%:view' AND `tenant_id` = 'default';

-- ===================================================================
-- 完成数据初始化
-- ===================================================================

-- 重置自增序列（如果需要）
-- ALTER TABLE `users` AUTO_INCREMENT = 4;
-- ALTER TABLE `employee` AUTO_INCREMENT = 4;
-- ALTER TABLE `workposition` AUTO_INCREMENT = 4;
-- ALTER TABLE `department` AUTO_INCREMENT = 4;

-- 输出初始化完成信息
SELECT '示例数据初始化完成！' as message,
       '用户账号信息：' as info,
       'admin/123456 - 系统管理员' as admin_account,
       'lihua/123456 - 高级开发工程师' as dev_account,  
       'wangxh/123456 - 人事专员' as hr_account; 