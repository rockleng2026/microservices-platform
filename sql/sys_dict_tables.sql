-- 通用字典配置数据库表结构
-- 创建时间: 2024-12-19

-- 1. 通用字典类目表
CREATE TABLE IF NOT EXISTS `sys_dict_category` (
  `id` BIGINT(20) NOT NULL COMMENT '主键ID',
  `name` VARCHAR(100) NOT NULL COMMENT '类目名称',
  `code` VARCHAR(50) NOT NULL COMMENT '类目编码(唯一)',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '类目描述',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态(0=禁用, 1=启用)',
  `extend_schema` JSON DEFAULT NULL COMMENT '扩展字段Schema(JSON格式)',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序值',
  `tenant_id` VARCHAR(32) NOT NULL DEFAULT 'default' COMMENT '租户ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` BIGINT(20) DEFAULT NULL COMMENT '创建人ID',
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` BIGINT(20) DEFAULT NULL COMMENT '更新人ID',
  `delflag` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '删除标记(0=正常, 1=删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code_tenant` (`code`, `tenant_id`, `delflag`),
  KEY `idx_tenant_status` (`tenant_id`, `status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通用字典类目表';

-- 2. 通用字典明细项表
CREATE TABLE IF NOT EXISTS `sys_dict_item` (
  `id` BIGINT(20) NOT NULL COMMENT '主键ID',
  `category_id` BIGINT(20) NOT NULL COMMENT '类目ID',
  `item_code` VARCHAR(50) NOT NULL COMMENT '项目编码',
  `item_name` VARCHAR(100) NOT NULL COMMENT '项目名称',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序值',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认项(0=否, 1=是)',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态(0=禁用, 1=启用)',
  `extend_data` JSON DEFAULT NULL COMMENT '扩展数据(JSON格式)',
  `tenant_id` VARCHAR(32) NOT NULL DEFAULT 'default' COMMENT '租户ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` BIGINT(20) DEFAULT NULL COMMENT '创建人ID',
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` BIGINT(20) DEFAULT NULL COMMENT '更新人ID',
  `delflag` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '删除标记(0=正常, 1=删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_item_code_category` (`category_id`, `item_code`, `tenant_id`, `delflag`),
  KEY `idx_category_status` (`category_id`, `status`),
  KEY `idx_tenant_status` (`tenant_id`, `status`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_dict_item_category` FOREIGN KEY (`category_id`) REFERENCES `sys_dict_category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通用字典明细项表';

-- 3. 初始化数据 - 示例字典类目
INSERT INTO `sys_dict_category` (`id`, `name`, `code`, `description`, `status`, `sort_order`, `tenant_id`, `created_by`) VALUES
(1, '性别', 'GENDER', '性别枚举', 1, 1, 'default', 1),
(2, '职位等级', 'JOB_LEVEL', '员工职位等级分类', 1, 2, 'default', 1),
(3, '项目类别', 'PROJECT_TYPE', '项目分类枚举', 1, 3, 'default', 1),
(4, '学历', 'EDUCATION', '学历枚举', 1, 4, 'default', 1),
(5, '民族', 'NATION', '民族枚举', 1, 5, 'default', 1);

-- 4. 初始化数据 - 示例字典明细项
INSERT INTO `sys_dict_item` (`id`, `category_id`, `item_code`, `item_name`, `sort_order`, `is_default`, `status`, `tenant_id`, `created_by`) VALUES
-- 性别
(10, 1, 'MALE', '男', 1, 0, 1, 'default', 1),
(11, 1, 'FEMALE', '女', 2, 0, 1, 'default', 1),

-- 职位等级
(20, 2, 'JUNIOR', '初级', 1, 0, 1, 'default', 1),
(21, 2, 'INTERMEDIATE', '中级', 2, 0, 1, 'default', 1),
(22, 2, 'SENIOR', '高级', 3, 0, 1, 'default', 1),
(23, 2, 'EXPERT', '专家', 4, 0, 1, 'default', 1),
(24, 2, 'LEADER', '主管', 5, 0, 1, 'default', 1),

-- 项目类别
(30, 3, 'INTERNAL', '内部项目', 1, 0, 1, 'default', 1),
(31, 3, 'EXTERNAL', '外部项目', 2, 0, 1, 'default', 1),
(32, 3, 'RESEARCH', '研发项目', 3, 0, 1, 'default', 1),

-- 学历
(40, 4, 'HIGH_SCHOOL', '高中', 1, 0, 1, 'default', 1),
(41, 4, 'COLLEGE', '大专', 2, 0, 1, 'default', 1),
(42, 4, 'BACHELOR', '本科', 3, 1, 1, 'default', 1),
(43, 4, 'MASTER', '硕士', 4, 0, 1, 'default', 1),
(44, 4, 'DOCTOR', '博士', 5, 0, 1, 'default', 1),

-- 民族
(50, 5, 'HAN', '汉族', 1, 1, 1, 'default', 1),
(51, 5, 'MONGOL', '蒙古族', 2, 0, 1, 'default', 1),
(52, 5, 'HUI', '回族', 3, 0, 1, 'default', 1),
(53, 5, 'TIBET', '藏族', 4, 0, 1, 'default', 1),
(54, 5, 'UYGHUR', '维吾尔族', 5, 0, 1, 'default', 1);

-- 5. 扩展字段示例 - 为职位等级添加扩展字段
UPDATE `sys_dict_category` SET `extend_schema` = JSON_ARRAY(
  JSON_OBJECT(
    'code', 'salary_range', 
    'name', '薪资范围', 
    'type', 'string', 
    'defaultValue', '', 
    'required', 0, 
    'sort', 1
  ),
  JSON_OBJECT(
    'code', 'experience_years', 
    'name', '工作年限要求', 
    'type', 'number', 
    'defaultValue', '0', 
    'required', 1, 
    'sort', 2
  ),
  JSON_OBJECT(
    'code', 'promotion_eligible', 
    'name', '可晋升', 
    'type', 'boolean', 
    'defaultValue', 'true', 
    'required', 0, 
    'sort', 3
  )
) WHERE `code` = 'JOB_LEVEL';

-- 6. 为职位等级明细项添加扩展数据示例
UPDATE `sys_dict_item` SET `extend_data` = JSON_OBJECT(
  'salary_range', '5K-8K',
  'experience_years', 1,
  'promotion_eligible', true
) WHERE `category_id` = 2 AND `item_code` = 'JUNIOR';

UPDATE `sys_dict_item` SET `extend_data` = JSON_OBJECT(
  'salary_range', '8K-12K',
  'experience_years', 3,
  'promotion_eligible', true
) WHERE `category_id` = 2 AND `item_code` = 'INTERMEDIATE';

UPDATE `sys_dict_item` SET `extend_data` = JSON_OBJECT(
  'salary_range', '12K-18K',
  'experience_years', 5,
  'promotion_eligible', true
) WHERE `category_id` = 2 AND `item_code` = 'SENIOR';

UPDATE `sys_dict_item` SET `extend_data` = JSON_OBJECT(
  'salary_range', '18K-25K',
  'experience_years', 8,
  'promotion_eligible', false
) WHERE `category_id` = 2 AND `item_code` = 'EXPERT';

UPDATE `sys_dict_item` SET `extend_data` = JSON_OBJECT(
  'salary_range', '20K-30K',
  'experience_years', 5,
  'promotion_eligible', false
) WHERE `category_id` = 2 AND `item_code` = 'LEADER'; 