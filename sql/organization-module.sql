-- ===================================================================
-- Portal 3.0 组织管理模块数据库脚本
-- 版本: v1.0
-- 创建时间: 2024-12-19
-- 描述: 基于原有SSH系统数据结构的微服务化重构，支持多租户
-- ===================================================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===================================================================
-- 1. 多租户管理相关表
-- ===================================================================

-- 租户信息表
CREATE TABLE `tenant` (
  `id` varchar(32) NOT NULL COMMENT '租户ID',
  `tenant_code` varchar(50) NOT NULL COMMENT '租户编码',
  `tenant_name` varchar(100) NOT NULL COMMENT '租户名称',
  `company_name` varchar(200) COMMENT '公司名称',
  `contact_person` varchar(50) COMMENT '联系人',
  `contact_phone` varchar(20) COMMENT '联系电话',
  `contact_email` varchar(100) COMMENT '联系邮箱',
  `company_address` varchar(500) COMMENT '公司地址',
  `logo_url` varchar(200) COMMENT 'Logo地址',
  `domain` varchar(100) COMMENT '独立域名',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `expire_time` datetime COMMENT '到期时间',
  `max_users` int(11) DEFAULT 100 COMMENT '最大用户数',
  `max_storage` bigint(20) DEFAULT 10737418240 COMMENT '最大存储空间(字节)',
  `used_storage` bigint(20) DEFAULT 0 COMMENT '已用存储空间',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(32) COMMENT '创建人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_code` (`tenant_code`),
  UNIQUE KEY `uk_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租户信息表';

-- 租户配置表
CREATE TABLE `tenant_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(32) NOT NULL COMMENT '租户ID',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text COMMENT '配置值',
  `config_type` varchar(20) DEFAULT 'string' COMMENT '配置类型',
  `description` varchar(500) COMMENT '配置描述',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_config` (`tenant_id`, `config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租户配置表';

-- ===================================================================
-- 2. 部门管理相关表 (基于原department表扩展)
-- ===================================================================

-- 部门表（复用原表结构，添加微服务字段）
CREATE TABLE `department` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `name` varchar(128) NOT NULL COMMENT '部门名称',
  `directorId` bigint(20) COMMENT '部门主管ID',
  `parentId` bigint(20) DEFAULT 0 COMMENT '父部门ID',
  `depNo` varchar(10) COMMENT '部门编号',
  `gradeid` tinyint(1) DEFAULT 7 COMMENT '部门等级(1-7级)',
  `islevel` tinyint(1) COMMENT '部门级别',
  `fiiale` varchar(11) COMMENT '是否为分公司(1是,空否)',
  `filialemark` varchar(100) COMMENT '分公司标识',
  `tel` varchar(50) COMMENT '电话',
  `address` varchar(255) COMMENT '办公地址',
  `description` text COMMENT '部门描述',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` int(11) DEFAULT 0 COMMENT '删除标识(0正常,1删除)',
  -- 新增微服务字段
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parentId`),
  KEY `idx_director_id` (`directorId`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 部门等级配置表（基于原department_grade表）
CREATE TABLE `department_grade` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '部门级别ID',
  `dg_num` tinyint(1) NOT NULL COMMENT '部门等级数字(1-7)',
  `dg_name` varchar(32) NOT NULL COMMENT '部门等级名称',
  `dg_desc` varchar(200) COMMENT '部门等级描述',
  `level_weight` tinyint(1) DEFAULT 0 COMMENT '级别权重',
  `can_manage_lower` tinyint(1) DEFAULT 1 COMMENT '是否可管理下级(1是,0否)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dg_num_tenant` (`dg_num`, `tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门等级配置表';

-- ===================================================================
-- 3. 岗位管理相关表 (基于原workposition表扩展)
-- ===================================================================

-- 岗位表（扩展原workposition表）
CREATE TABLE `workposition` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '岗位ID',
  `name` varchar(100) NOT NULL COMMENT '岗位名称',
  `short_name` varchar(20) COMMENT '岗位简写',
  `department_id` bigint(20) NOT NULL COMMENT '所属部门ID',
  `position_level` tinyint(1) DEFAULT 1 COMMENT '岗位级别',
  `job_description` text COMMENT '岗位职责描述',
  `requirements` text COMMENT '任职要求',
  `salary_range` varchar(50) COMMENT '薪资范围',
  `max_employees` int(11) DEFAULT 1 COMMENT '最大任职人数',
  `permissions` text COMMENT '权限配置JSON',
  `is_manager` tinyint(1) DEFAULT 0 COMMENT '是否主管岗位(1是,0否)',
  `is_director` tinyint(1) DEFAULT 0 COMMENT '是否领导岗位(1是,0否)',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  -- 新增微服务字段
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人',
  PRIMARY KEY (`id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- 岗位分管部门关联表
CREATE TABLE `workposition_manage_dept` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `workposition_id` bigint(20) NOT NULL COMMENT '岗位ID',
  `department_id` bigint(20) NOT NULL COMMENT '分管部门ID',
  `manage_type` tinyint(1) DEFAULT 1 COMMENT '分管类型(1直管,2协管)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint(20) COMMENT '创建人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wp_dept` (`workposition_id`, `department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位分管部门表';

-- ===================================================================
-- 4. 员工管理相关表 (基于原employee表扩展)
-- ===================================================================

-- 员工表（复用原employee表结构，添加扩展字段）
CREATE TABLE `employee` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '员工ID',
  `emp_no` varchar(20) NOT NULL COMMENT '员工编号',
  `name` varchar(50) NOT NULL COMMENT '姓名',
  `name_en` varchar(100) COMMENT '英文姓名',
  `birth_date` date COMMENT '出生日期',
  `gender` tinyint(1) COMMENT '性别(1:男,2:女)',
  `id_card` varchar(18) COMMENT '身份证号',
  `mobile` varchar(11) COMMENT '手机号',
  `email` varchar(100) COMMENT '邮箱',
  `department_id` bigint(20) COMMENT '部门ID',
  `position_id`bigint(20) COMMENT '主岗位ID',
  `secondary_position_ids` varchar(200) COMMENT '副岗位ID列表',
  `grade_id` tinyint(1) COMMENT '员工等级ID',
  `employment_type` tinyint(1) COMMENT '用工类型(1:正式,2:实习,3:外包,4:劳务)',
  `employment_status` tinyint(1) COMMENT '在职状态(1:在职,2:试用,3:离职)',
  `entry_date` date COMMENT '入职日期',
  `probation_end_date` date COMMENT '试用期结束日期',
  `leave_date` date COMMENT '离职日期',
  `leave_reason` varchar(500) COMMENT '离职原因',
  `login_account_flag` tinyint(1) COMMENT '登陆账号状态(0-无登陆账号，1-有登陆账号，2-禁止登录)',
  `education` varchar(20) COMMENT '学历',
  `nation` varchar(20) COMMENT '民族',
  `health_status` varchar(20) COMMENT '健康状况',
  `height` varchar(10) COMMENT '身高',
  `weight` varchar(10) COMMENT '体重',
  `marital_status` varchar(20) COMMENT '婚姻状况',
  `birthplace` varchar(100) COMMENT '籍贯',
  `residence` varchar(200) COMMENT '现居住地',
  `emergency_contact` varchar(50) COMMENT '紧急联系人',
  `emergency_phone` varchar(20) COMMENT '紧急联系电话',
  `specialty` varchar(200) COMMENT '专业技能',
  `avatar` varchar(255) COMMENT '头像',
  `remark` text COMMENT '备注',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  -- 新增微服务字段
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_no` (`emp_no`, `tenant_id`),
  KEY `idx_department` (`department_id`),
  KEY `idx_position` (`position_id`),
  KEY `idx_status` (`employment_status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

-- 员工等级表
CREATE TABLE `employee_grade` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '等级ID',
  `grade_code` varchar(20) NOT NULL COMMENT '等级编码',
  `grade_name` varchar(50) NOT NULL COMMENT '等级名称',
  `grade_level` tinyint(2) COMMENT '等级级别(1-20)',
  `description` varchar(200) COMMENT '等级描述',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_grade_code` (`grade_code`, `tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工等级表';

-- 字段配置表（用于扩展信息配置）
CREATE TABLE `field_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `uuid` varchar(36) COMMENT 'UUID',
  `entity_type` varchar(50) NOT NULL COMMENT '实体类型(Employee)',
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `config_code` varchar(50) NOT NULL COMMENT '配置编码',
  `description` varchar(200) COMMENT '描述',
  `field_definitions` json COMMENT '字段定义(JSON格式)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_entity_code` (`entity_type`, `config_code`, `tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字段配置表';

-- 员工扩展数据表
CREATE TABLE `employee_extend_data` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '扩展数据ID',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `config_id` bigint(20) NOT NULL COMMENT '配置ID',
  `data_content` json NOT NULL COMMENT '数据内容(JSON格式)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_config` (`config_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工扩展数据表';

-- 员工附件表
CREATE TABLE `employee_attachment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '附件ID',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `attachment_type` varchar(20) NOT NULL COMMENT '附件类型',
  `attachment_name` varchar(100) NOT NULL COMMENT '附件名称',
  `original_name` varchar(255) NOT NULL COMMENT '原始文件名',
  `file_size` bigint(20) COMMENT '文件大小(bytes)',
  `file_type` varchar(20) COMMENT '文件类型',
  `file_path` varchar(500) NOT NULL COMMENT '文件存储路径',
  `upload_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `upload_by`bigint(20) COMMENT '上传人',
  `audit_status` tinyint(1) DEFAULT 0 COMMENT '审核状态(0:待审核,1:通过,2:拒绝)',
  `audit_time` datetime COMMENT '审核时间',
  `audit_by` bigint(20) COMMENT '审核人',
  `audit_remark` varchar(200) COMMENT '审核备注',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_type` (`attachment_type`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工附件表';

-- ===================================================================
-- 5. 权限管理相关表 (基于原有权限表扩展)
-- ===================================================================

-- 角色组表（role表-保留后面使用）
CREATE TABLE `roles` (
  `id` bigint(20) COMMENT '角色ID',
  `role_name` varchar(50) NOT NULL COMMENT '角色名称',
  `role_description` varchar(500) COMMENT '角色描述',
  `role_code` varchar(50) COMMENT '角色编码',
  `role_type` tinyint(1) DEFAULT 1 COMMENT '角色类型(1系统角色,2自定义角色)',
  `permissions` text COMMENT '权限配置JSON',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_code` (`role_code`, `tenant_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色组表';

-- 用户登录表（基于原users表）

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '登录密码',
  `employee_id` int(11) COMMENT '员工ID', 
  `nickname` varchar(255) DEFAULT NULL,
  `head_img_url` varchar(1024) DEFAULT NULL,
  `mobile` varchar(11) DEFAULT NULL,
  `sex` tinyint(1) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态(1正常,0禁用)',
  `type` varchar(16) NOT NULL COMMENT '用户类型',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `company` varchar(255) DEFAULT NULL COMMENT '公司',
  `open_id` varchar(32) DEFAULT NULL COMMENT 'open_id',
  `is_del` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标识',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建人id',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_mobile` (`mobile`),
  KEY `idx_open_id` (`open_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- 菜单页面表
CREATE TABLE `menu_page` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `name` varchar(255) NOT NULL COMMENT '菜单名称',
  `parent_id` int(11) NOT NULL DEFAULT 0 COMMENT '父级id',
  `link_url` varchar(100) COMMENT '链接功能页面',
  `description` varchar(255) COMMENT '权限描述',
  `image_path` varchar(50) COMMENT '图片路径',
  `icon` varchar(50) COMMENT '图标',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` int(11) DEFAULT 0 COMMENT '删除标识',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单页面表';

-- 菜单页面功能点表
CREATE TABLE `menu_func` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `perm_code` varchar(100) NOT NULL COMMENT '权限代码',
  `perm_name` varchar(100) NOT NULL COMMENT '权限名称',
  `perm_type` tinyint(1) DEFAULT 1 COMMENT '权限类型(1按钮,2数据)',
  `menu_page_id` int(11) DEFAULT 0 COMMENT '父权限ID',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序号',
  `icon` varchar(50) COMMENT '图标',
  `description` varchar(255) COMMENT '权限描述',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_perm_code` (`perm_code`, `tenant_id`),
  KEY `idx_menu_page_id` (`menu_page_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单页面功能点表';

-- ===================================================================
-- 6. 审计日志表
-- ===================================================================

-- 操作日志表
CREATE TABLE `audit_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` int(11) COMMENT '操作用户ID',
  `user_name` varchar(50) COMMENT '操作用户名',
  `module` varchar(50) COMMENT '操作模块',
  `operation` varchar(100) COMMENT '操作类型',
  `target_type` varchar(50) COMMENT '目标类型',
  `target_id` varchar(100) COMMENT '目标ID',
  `target_name` varchar(200) COMMENT '目标名称',
  `operation_desc` varchar(500) COMMENT '操作描述',
  `old_value` text COMMENT '变更前值',
  `new_value` text COMMENT '变更后值',
  `ip_address` varchar(50) COMMENT 'IP地址',
  `user_agent` varchar(500) COMMENT '用户代理',
  `operation_time` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_operation_time` (`operation_time`),
  KEY `idx_module` (`module`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';

-- ===================================================================
-- 7. 预置数据
-- ===================================================================

-- 插入默认租户
INSERT INTO `tenant` (`id`, `tenant_code`, `tenant_name`, `company_name`, `status`) VALUES
('default', 'DEFAULT', '默认租户', 'Portal 3.0 Default Tenant', 1);

-- 插入部门等级配置
INSERT INTO `department_grade` (`dg_num`, `dg_name`, `dg_desc`, `level_weight`, `tenant_id`) VALUES
(1, '集团级', '集团公司级别部门', 7, 'default'),
(2, '公司级', '分公司级别部门', 6, 'default'),
(3, '事业部级', '事业部级别部门', 5, 'default'),
(4, '部门级', '部门级别部门', 4, 'default'),
(5, '科室级', '科室级别部门', 3, 'default'),
(6, '小组级', '小组级别部门', 2, 'default'),
(7, '班组级', '班组级别部门', 1, 'default');

-- 插入员工等级预置数据
INSERT INTO `employee_grade` (`grade_code`, `grade_name`, `grade_level`, `description`, `sort_order`, `tenant_id`) VALUES
('L01', '初级员工', 1, '初级员工等级', 1, 'default'),
('L02', '中级员工', 2, '中级员工等级', 2, 'default'),
('L03', '高级员工', 3, '高级员工等级', 3, 'default'),
('L04', '专家级员工', 4, '专家级员工等级', 4, 'default'),
('M01', '初级主管', 5, '初级主管等级', 5, 'default'),
('M02', '中级主管', 6, '中级主管等级', 6, 'default'),
('M03', '高级主管', 7, '高级主管等级', 7, 'default'),
('S01', '初级经理', 8, '初级经理等级', 8, 'default'),
('S02', '中级经理', 9, '中级经理等级', 9, 'default'),
('S03', '高级经理', 10, '高级经理等级', 10, 'default');

-- 插入扩展字段预置配置
INSERT INTO `field_config` (`entity_type`, `config_name`, `config_code`, `description`, `field_definitions`, `tenant_id`) VALUES
('Employee', '家庭成员', 'family_members', '员工家庭成员信息', '[
  {"field": "name", "label": "姓名", "type": "text", "required": true},
  {"field": "relationship", "label": "关系", "type": "select", "required": true, "options": ["父亲", "母亲", "配偶", "子女", "兄弟姐妹", "其他"]},
  {"field": "position", "label": "职位", "type": "text", "required": false},
  {"field": "company", "label": "工作单位", "type": "text", "required": false}
]', 'default'),
('Employee', '教育经历', 'education_history', '员工教育经历信息', '[
  {"field": "school", "label": "毕业院校", "type": "text", "required": true},
  {"field": "start_date", "label": "开始时间", "type": "date", "required": true},
  {"field": "end_date", "label": "结束时间", "type": "date", "required": true},
  {"field": "major", "label": "专业", "type": "text", "required": true},
  {"field": "degree", "label": "学位/证书", "type": "text", "required": false},
  {"field": "referee", "label": "证明人", "type": "text", "required": false}
]', 'default'),
('Employee', '工作经验', 'work_experience', '员工工作经验信息', '[
  {"field": "company", "label": "公司", "type": "text", "required": true},
  {"field": "start_date", "label": "开始时间", "type": "date", "required": true},
  {"field": "end_date", "label": "结束时间", "type": "date", "required": true},
  {"field": "position", "label": "职务", "type": "text", "required": true},
  {"field": "salary", "label": "收入", "type": "number", "required": false},
  {"field": "leave_reason", "label": "离职原因", "type": "text", "required": false},
  {"field": "referee", "label": "证明人", "type": "text", "required": false},
  {"field": "referee_phone", "label": "证明人联系电话", "type": "text", "required": false}
]', 'default');

-- 插入菜单页面数据
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `icon`, `sort_order`, `tenant_id`) VALUES
(1, '工作台', 0, '/dashboard', '系统工作台', 'dashboard', 1, 'default'),
(2, '组织架构', 0, '/organization', '组织架构管理', 'team', 2, 'default'),
(3, '部门管理', 2, '/organization/department', '部门管理页面', 'apartment', 1, 'default'),
(4, '员工管理', 2, '/organization/employee', '员工管理页面', 'user', 2, 'default'),
(5, '岗位管理', 2, '/organization/position', '岗位管理页面', 'contacts', 3, 'default'),
(6, 'CRM管理', 0, '/crm', 'CRM客户关系管理', 'user-group', 3, 'default'),
(7, '客户管理', 6, '/crm/customer', '客户管理页面', 'contacts', 1, 'default'),
(8, '产品管理', 0, '/product', '产品管理', 'box', 4, 'default'),
(9, '订单管理', 0, '/order', '订单管理', 'file-text', 5, 'default'),
(10, '系统管理', 0, '/system', '系统管理', 'settings', 6, 'default');

-- 插入菜单功能点数据
INSERT INTO `menu_func` (`perm_code`, `perm_name`, `perm_type`, `menu_page_id`, `sort_order`, `tenant_id`) VALUES
-- 部门管理权限
('organization:dept:view', '查看部门', 1, 3, 1, 'default'),
('organization:dept:add', '新增部门', 1, 3, 2, 'default'),
('organization:dept:edit', '编辑部门', 1, 3, 3, 'default'),
('organization:dept:delete', '删除部门', 1, 3, 4, 'default'),
-- 员工管理权限
('organization:emp:view', '查看员工', 1, 4, 1, 'default'),
('organization:emp:add', '新增员工', 1, 4, 2, 'default'),
('organization:emp:edit', '编辑员工', 1, 4, 3, 'default'),
('organization:emp:delete', '删除员工', 1, 4, 4, 'default'),
-- 岗位管理权限
('organization:pos:view', '查看岗位', 1, 5, 1, 'default'),
('organization:pos:add', '新增岗位', 1, 5, 2, 'default'),
('organization:pos:edit', '编辑岗位', 1, 5, 3, 'default'),
('organization:pos:delete', '删除岗位', 1, 5, 4, 'default'),
('organization:pos:permission', '配置权限', 1, 5, 5, 'default');

-- 插入默认角色
INSERT INTO `roles` (`id`, `role_name`,  `role_description`,`role_code`, `role_type`, `tenant_id`) VALUES
(1, '系统管理员', '系统超级管理员角色', 'ADMIN', 1, 'default'),
(2, 'HR管理员',  '人力资源管理员角色', 'HR_ADMIN', 1, 'default'),
(3, '部门主管',  '部门主管角色', 'DEPT_MANAGER', 1, 'default'),
(4, '普通员工',  '普通员工角色', 'EMPLOYEE', 1, 'default');

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- 创建索引优化
-- ===================================================================

-- 为常用查询字段创建复合索引
CREATE INDEX `idx_dept_tenant_parent` ON `department` (`tenant_id`, `parentId`, `status`);
CREATE INDEX `idx_emp_tenant_dept` ON `employee` (`tenant_id`, `department_id`, `employment_status`);
CREATE INDEX `idx_pos_tenant_dept` ON `workposition` (`tenant_id`, `department_id`, `status`);
CREATE INDEX `idx_audit_tenant_time` ON `audit_log` (`tenant_id`, `operation_time`);

-- ===================================================================
-- 结束
-- ===================================================================