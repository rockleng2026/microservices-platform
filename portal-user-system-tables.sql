-- Portal用户系统相关表结构
-- 包含用户个性化配置表等扩展表

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===================================================================
-- 用户个性化配置表
-- ===================================================================

-- 创建用户个性化配置表
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
-- 工作岗位表（如果不存在）
-- ===================================================================

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

-- ===================================================================
-- 菜单表（如果不存在）
-- ===================================================================

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

-- ===================================================================
-- 菜单功能权限表（如果不存在）
-- ===================================================================

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

-- ===================================================================
-- 插入测试数据
-- ===================================================================

-- 插入测试菜单数据
INSERT IGNORE INTO `menu` (`id`, `name`, `code`, `parent_id`, `path`, `component`, `icon`, `menu_type`, `sort_order`, `tenant_id`) VALUES
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

-- 插入测试菜单功能权限数据
INSERT IGNORE INTO `menu_function` (`id`, `menu_id`, `name`, `code`, `description`, `sort_order`, `tenant_id`) VALUES
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

-- ===================================================================
-- 为现有用户初始化个性化配置
-- ===================================================================

INSERT IGNORE INTO `user_personal_config` (
    `user_id`, `default_position_id`, `theme`, `layout_config`, `language`, `timezone`,
    `home_page`, `notification_config`, `extend_config`, `enabled`, `tenant_id`,
    `created_at`, `updated_at`, `created_by`, `updated_by`
) 
SELECT 
    u.id as user_id,
    e.position_id as default_position_id,
    'light' as theme,
    '{"sidebarCollapsed": false, "showBreadcrumb": true}' as layout_config,
    'zh-CN' as language,
    'Asia/Shanghai' as timezone,
    '/dashboard' as home_page,
    '{"email": true, "push": true, "sms": false}' as notification_config,
    '{}' as extend_config,
    1 as enabled,
    u.tenant_id,
    NOW() as created_at,
    NOW() as updated_at,
    u.id as created_by,
    u.id as updated_by
FROM users u
LEFT JOIN employee e ON u.employee_id = e.id
WHERE u.tenant_id = 'default'
AND NOT EXISTS (
    SELECT 1 FROM user_personal_config upc 
    WHERE upc.user_id = u.id AND upc.tenant_id = u.tenant_id
);

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- 验证数据
-- ===================================================================

-- 查看用户个性化配置
SELECT 
    upc.id, upc.user_id, u.username, u.nickname,
    upc.default_position_id, wp.name as position_name,
    upc.theme, upc.language, upc.tenant_id
FROM user_personal_config upc
LEFT JOIN users u ON upc.user_id = u.id
LEFT JOIN workposition wp ON upc.default_position_id = wp.id
WHERE upc.tenant_id = 'default'
ORDER BY upc.user_id;

-- 查看菜单权限配置
SELECT id, name, code, parent_id, path, sort_order, tenant_id 
FROM menu 
WHERE tenant_id = 'default' 
ORDER BY parent_id, sort_order; 