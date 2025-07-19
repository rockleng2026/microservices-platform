-- 财务模型实例表
CREATE TABLE `soo_financial_model_instance` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `instance_code` varchar(100) NOT NULL COMMENT '实例编码',
  `instance_name` varchar(200) NOT NULL COMMENT '实例名称',
  `model_id` bigint(20) NOT NULL COMMENT '关联的财务模型ID',
  `project_id` bigint(20) DEFAULT NULL COMMENT '关联的项目ID',
  `instance_status` varchar(20) NOT NULL DEFAULT 'DRAFT' COMMENT '实例状态：DRAFT-草稿，ACTIVE-激活，INACTIVE-停用，ARCHIVED-归档',
  `instance_version` varchar(20) NOT NULL DEFAULT '1.0.0' COMMENT '实例版本号',
  `instance_description` text COMMENT '实例描述',
  `instance_config` longtext COMMENT '实例配置JSON，存储所有变量值',
  `calculation_result` longtext COMMENT '计算结果JSON，存储计算后的变量值',
  `last_calculated_at` datetime DEFAULT NULL COMMENT '最后计算时间',
  `calculation_status` varchar(20) DEFAULT 'PENDING' COMMENT '计算状态：PENDING-待计算，CALCULATING-计算中，COMPLETED-已完成，FAILED-失败',
  `creator_id` bigint(20) NOT NULL COMMENT '创建人ID',
  `tenant_id` varchar(50) NOT NULL COMMENT '租户ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_instance_code_tenant` (`instance_code`, `tenant_id`, `deleted`),
  KEY `idx_model_id` (`model_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_instance_status` (`instance_status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务模型实例表';

-- 模型实例变量值表
CREATE TABLE `soo_model_instance_variable` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `instance_id` bigint(20) NOT NULL COMMENT '模型实例ID',
  `variable_id` bigint(20) NOT NULL COMMENT '模型变量ID',
  `variable_value` text COMMENT '变量值',
  `calculated_value` text COMMENT '计算后的值',
  `is_calculated` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已计算：0-未计算，1-已计算',
  `calculation_error` text COMMENT '计算错误信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_instance_variable` (`instance_id`, `variable_id`),
  KEY `idx_instance_id` (`instance_id`),
  KEY `idx_variable_id` (`variable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型实例变量值表';

-- 模型实例计算历史表
CREATE TABLE `soo_model_instance_calculation_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `instance_id` bigint(20) NOT NULL COMMENT '模型实例ID',
  `calculation_version` varchar(20) NOT NULL COMMENT '计算版本号',
  `calculation_type` varchar(20) NOT NULL COMMENT '计算类型：MANUAL-手动计算，AUTO-自动计算，SCHEDULED-定时计算',
  `calculation_status` varchar(20) NOT NULL COMMENT '计算状态：STARTED-开始，PROCESSING-处理中，COMPLETED-完成，FAILED-失败',
  `input_data` longtext COMMENT '输入数据JSON',
  `output_data` longtext COMMENT '输出数据JSON',
  `error_message` text COMMENT '错误信息',
  `execution_time` int(11) DEFAULT NULL COMMENT '执行时间(毫秒)',
  `triggered_by` bigint(20) NOT NULL COMMENT '触发人ID',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `completed_at` datetime DEFAULT NULL COMMENT '完成时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_instance_id` (`instance_id`),
  KEY `idx_calculation_version` (`calculation_version`),
  KEY `idx_calculation_status` (`calculation_status`),
  KEY `idx_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型实例计算历史表'; 