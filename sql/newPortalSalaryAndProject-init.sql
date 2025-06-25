-- =============================
-- Portal 3.0 项目管理与人事绩效薪酬系统
-- SQL初始化脚本（含详细字段注释）
-- 版本: v1.0
-- 创建时间: 2024-12-19
-- 描述: 基于Flowable工作流引擎的薪酬绩效管理系统
-- =============================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===================================================================
-- 1. 审批关联表（桥接业务表与Flowable流程实例）
-- ===================================================================

CREATE TABLE `approval_flow` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `biz_type` varchar(50) NOT NULL COMMENT '业务类型，如project（项目）、performance（绩效）、bonus（分红）等',
  `biz_id` bigint(20) NOT NULL COMMENT '业务表主键ID（如项目ID、绩效ID等）',
  `process_instance_id` varchar(64) NOT NULL COMMENT 'Flowable流程实例ID',
  `initiator_id` bigint(20) NOT NULL COMMENT '流程发起人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_biz` (`biz_type`, `biz_id`),
  KEY `idx_proc` (`process_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批关联表，桥接业务表与流程实例';

-- ===================================================================
-- 2. 项目管理相关表
-- ===================================================================

-- 产品毛利分配指导表
CREATE TABLE `product_profit_distribution_guide` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `product_name` varchar(100) NOT NULL COMMENT '产品名称（如党建项目、IDC项目等）',
  `role` varchar(50) NOT NULL COMMENT '参与角色（如销售、技术、产品经理等）',
  `commission_type` varchar(10) NOT NULL COMMENT '提成类型（比例/金额）',
  `value_range` varchar(50) COMMENT '数值范围（如1-5、500-10000）',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_name`),
  KEY `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品毛利分配指导表';

-- 项目表
CREATE TABLE `project` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(200) NOT NULL COMMENT '项目名称',
  `category` varchar(50) COMMENT '项目类别（如党建、IDC、软件等）',
  `participants` text COMMENT '参与人列表（JSON数组，存员工ID及角色）',
  `leader_id` bigint(20) COMMENT '项目负责人ID',
  `max_distribution` float DEFAULT 0.5 COMMENT '最大分配比例默认50%即0.5'
  `customer_name` varchar(100) COMMENT '项目客户名称',
  `customer_contact` varchar(100) COMMENT '项目客户代表',
  `start_time` datetime COMMENT '立项时间',
  `status` varchar(20) DEFAULT 'init' COMMENT '项目状态（如init、running、closed等）',
  `process_instance_id` varchar(64) COMMENT '流程实例ID',
  `final_status` varchar(20) DEFAULT NULL COMMENT '最终审批状态（如approved、rejected等）',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
  PRIMARY KEY (`id`),
  KEY `idx_leader` (`leader_id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_proc` (`process_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 项目明细表
CREATE TABLE `project_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(20) NOT NULL COMMENT '项目ID',
  `participant_id` bigint(20) NOT NULL COMMENT '参与人ID（员工ID）',
  `role` varchar(50) NOT NULL COMMENT '项目角色',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_participant` (`participant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目明细表，记录项目参与人及角色';

-- 项目结项表
CREATE TABLE `project_closure` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(20) NOT NULL COMMENT '项目ID',
  `closure_time` datetime COMMENT '结项时间',
  `contract_amount` decimal(18,2) COMMENT '项目合同金额',
  `actual_amount` decimal(18,2) COMMENT '项目实际金额',
  `gross_profit` decimal(18,2) COMMENT '项目毛利润',
  `gross_profit_rate` decimal(5,2) COMMENT '毛利率（%）',
  `process_instance_id` varchar(64) COMMENT '流程实例ID',
  `final_status` varchar(20) DEFAULT NULL COMMENT '最终审批状态',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_proc` (`process_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目结项表';

-- 项目人员毛利分配表
CREATE TABLE `project_profit_distribution` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(20) NOT NULL COMMENT '项目ID',
  `guide_id` bigint(20) COMMENT '产品毛利分配指导表ID',
  `dept_id` BIGINT(20) NOT NULL COMMENT '分配员工ID',
  `employee_id` BIGINT(20)  COMMENT '分配员工ID',
  `role` varchar(50) NOT NULL COMMENT '分配角色',
  `distribution_type` varchar(10) NOT NULL COMMENT '分配形式（比例/金额）',
  `distribution_value` decimal(10,2) NOT NULL COMMENT '分配数值',
  `process_instance_id` varchar(64) COMMENT '流程实例ID',
  `final_status` varchar(20) DEFAULT NULL COMMENT '最终审批状态',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_proc` (`process_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目人员毛利分配表';

-- 项目人员毛利分配调整表
CREATE TABLE `project_profit_distribution_adjustment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `profit_distribution_id` bigint(20) NOT NULL COMMENT '项目人员毛利分配表ID',
  `apply_reason` varchar(255) COMMENT '调整申请原因',
  `status` varchar(20) DEFAULT 'pending' COMMENT '调整审批状态',
  `process_instance_id` varchar(64) COMMENT '流程实例ID',
  `final_status` varchar(20) DEFAULT NULL COMMENT '最终审批状态',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_profit` (`profit_distribution_id`),
  KEY `idx_proc` (`process_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目人员毛利分配调整表';

-- ===================================================================
-- 3. 绩效考核相关表
-- ===================================================================

-- 部门绩效目标表
CREATE TABLE `department_performance_target` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `target_type` varchar(20) NOT NULL COMMENT '考核对象类型（部门/岗位/个人）',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `name` varchar(100) NOT NULL COMMENT '绩效名称',
  `description` varchar(255) COMMENT '绩效描述',
  `standard_excellent` varchar(255) COMMENT '卓越标准',
  `standard_good` varchar(255) COMMENT '良好标准',
  `standard_pass` varchar(255) COMMENT '及格标准',
  `target_amount` decimal(18,2) COMMENT '目标金额',
  `cycle` varchar(20) COMMENT '考核周期（月度/季度/半年度/年度）',
  `process_instance_id` varchar(64) COMMENT '流程实例ID',
  `final_status` varchar(20) DEFAULT NULL COMMENT '最终审批状态',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_dept` (`department_id`),
  KEY `idx_proc` (`process_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门绩效目标表';

-- 部门绩效考核结果表
CREATE TABLE `department_performance_result` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `target_id` bigint(20) NOT NULL COMMENT '部门绩效目标表ID',
  `cycle` varchar(20) COMMENT '考核周期',
  `self_evaluation` text COMMENT '自我评价',
  `leader_evaluation` text COMMENT '领导评价',
  `self_grade` varchar(10) COMMENT '自评等级',
  `leader_grade` varchar(10) COMMENT '领导评分等级',
  `comments` text COMMENT '综合考评意见',
  `fill_time` datetime COMMENT '填写时间',
  `update_time` datetime COMMENT '更新时间',
  `process_instance_id_1` varchar(64) COMMENT '填报审批流程实例ID',
  `process_instance_id_2` varchar(64) COMMENT '评价审批流程实例ID',
  `final_status` varchar(20) DEFAULT NULL COMMENT '最终审批状态',
  `target_amount` decimal(18,2) COMMENT '目标金额',
  `actual_amount` decimal(18,2) COMMENT '实际金额',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_target` (`target_id`),
  KEY `idx_proc1` (`process_instance_id_1`),
  KEY `idx_proc2` (`process_instance_id_2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门绩效考核结果表';

-- 部门绩效考核明细表
CREATE TABLE `department_performance_result_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `result_id` bigint(20) NOT NULL COMMENT '部门绩效考核结果表ID',
  `source` varchar(20) COMMENT '目标来源（上级制定/个人制定）',
  `item_name` varchar(100) COMMENT '事项名称',
  `item_description` varchar(255) COMMENT '事项描述',
  `standard_excellent` varchar(255) COMMENT '卓越标准',
  `standard_good` varchar(255) COMMENT '良好标准',
  `standard_pass` varchar(255) COMMENT '及格标准',
  `completion_status` varchar(20) COMMENT '完成情况（卓越/良好/及格/不及格）',
  `target_amount` decimal(18,2) COMMENT '目标金额',
  `actual_amount` decimal(18,2) COMMENT '实际金额',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_result` (`result_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门绩效考核明细表';

-- 个人绩效目标表
CREATE TABLE `employee_performance_target` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `cycle` varchar(20) COMMENT '考核周期',
  `name` varchar(100) COMMENT '绩效名称',
  `description` varchar(255) COMMENT '绩效描述',
  `standard_excellent` varchar(255) COMMENT '卓越标准',
  `standard_good` varchar(255) COMMENT '良好标准',
  `standard_pass` varchar(255) COMMENT '及格标准',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='个人绩效目标表';

-- 个人绩效考核表
CREATE TABLE `employee_performance_result` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `target_id` bigint(20) NOT NULL COMMENT '个人绩效目标表ID',
  `cycle` varchar(20) COMMENT '考核周期',
  `self_evaluation` text COMMENT '自我评价',
  `leader_evaluation` text COMMENT '领导评价',
  `self_grade` varchar(10) COMMENT '自评等级',
  `leader_grade` varchar(10) COMMENT '领导评分等级',
  `comments` text COMMENT '综合考评意见',
  `fill_time` datetime COMMENT '填写时间',
  `update_time` datetime COMMENT '更新时间',
  `process_instance_id_1` varchar(64) COMMENT '填报审批流程实例ID',
  `process_instance_id_2` varchar(64) COMMENT '评价审批流程实例ID',
  `final_status` varchar(20) DEFAULT NULL COMMENT '最终审批状态',
  `target_amount` decimal(18,2) COMMENT '目标金额',
  `actual_amount` decimal(18,2) COMMENT '实际金额',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_target` (`target_id`),
  KEY `idx_proc1` (`process_instance_id_1`),
  KEY `idx_proc2` (`process_instance_id_2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='个人绩效考核表';

-- 个人绩效考核明细表
CREATE TABLE `employee_performance_result_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `result_id` bigint(20) NOT NULL COMMENT '个人绩效考核表ID',
  `source` varchar(20) COMMENT '目标来源（上级制定/个人制定）',
  `item_name` varchar(100) COMMENT '事项名称',
  `item_description` varchar(255) COMMENT '事项描述',
  `standard_excellent` varchar(255) COMMENT '卓越标准',
  `standard_good` varchar(255) COMMENT '良好标准',
  `standard_pass` varchar(255) COMMENT '及格标准',
  `completion_status` varchar(20) COMMENT '完成情况（卓越/良好/及格/不及格）',
  `target_amount` decimal(18,2) COMMENT '目标金额',
  `actual_amount` decimal(18,2) COMMENT '实际金额',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_result` (`result_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='个人绩效考核明细表';

-- ===================================================================
-- 4. 薪酬分红相关表
-- ===================================================================

-- 部门分红储备金账户表
CREATE TABLE `department_bonus_reserve` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `reserve_amount` decimal(18,2) DEFAULT 0.00 COMMENT '储备金余额',
  `total_income` decimal(18,2) DEFAULT 0.00 COMMENT '累计收入',
  `total_distributed` decimal(18,2) DEFAULT 0.00 COMMENT '累计分配金额',
  `year` int(4) NOT NULL COMMENT '年度',
  `quarter` int(1) COMMENT '季度（可选）',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dept_year` (`department_id`, `year`, `quarter`),
  KEY `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门分红储备金账户表';

-- 部门分红分配表
CREATE TABLE `department_bonus_distribution` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `year` int(4) NOT NULL COMMENT '分红年度',
  `performance_score` decimal(5,2) COMMENT '部门绩效得分',
  `qualification_count` int(2) COMMENT '达标项目数量（0-4）',
  `bonus_coefficient` decimal(3,2) COMMENT '分红系数',
  `available_amount` decimal(18,2) COMMENT '可分配金额',
  `distributed_amount` decimal(18,2) COMMENT '实际分配金额',
  `distribution_plan` text COMMENT '分配方案（JSON格式）',
  `apply_reason` varchar(500) COMMENT '申请理由',
  `process_instance_id` varchar(64) COMMENT '流程实例ID',
  `final_status` varchar(20) DEFAULT NULL COMMENT '最终审批状态',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_dept` (`department_id`),
  KEY `idx_year` (`year`),
  KEY `idx_proc` (`process_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门分红分配表';

-- 薪酬核算表
CREATE TABLE `salary_calculation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `year` int(4) NOT NULL COMMENT '年度',
  `month` int(2) NOT NULL COMMENT '月份',
  `base_salary` decimal(10,2) COMMENT '基础工资',
  `performance_salary` decimal(10,2) COMMENT '绩效工资',
  `project_commission` decimal(10,2) COMMENT '项目提成',
  `department_bonus` decimal(10,2) COMMENT '部门分红',
  `total_salary` decimal(10,2) COMMENT '总薪酬',
  `calculation_details` text COMMENT '计算明细（JSON格式）',
  `pay_status` varchar(20) DEFAULT 'pending' COMMENT '发放状态',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) COMMENT '创建人ID',
  `updated_by` bigint(20) COMMENT '修改人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_year_month` (`employee_id`, `year`, `month`),
  KEY `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='薪酬核算表';

-- ===================================================================
-- 5. 初始化数据
-- ===================================================================

-- 产品毛利分配指导数据
INSERT INTO `product_profit_distribution_guide` 
(`product_name`, `role`, `commission_type`, `value_range`, `tenant_id`) 
VALUES 
('党建项目', '销售', '比例', '3-5', 'default'),
('党建项目', '技术', '比例', '2-3', 'default'),
('党建项目', '产品经理', '比例', '1-2', 'default'),
('IDC项目', '销售', '比例', '2-4', 'default'),
('IDC项目', '技术', '比例', '3-5', 'default'),
('IDC项目', '运维', '比例', '2-3', 'default'),
('软件项目', '销售', '比例', '2-3', 'default'),
('软件项目', '技术', '比例', '4-6', 'default'),
('软件项目', '产品经理', '比例', '2-3', 'default'),
('软件项目', '售前', '金额', '500-2000', 'default'),
('软件项目', '售后', '金额', '300-1000', 'default');

-- ===================================================================
-- 6. 创建索引
-- ===================================================================

-- 审批流程相关索引
CREATE INDEX `idx_approval_tenant_time` ON `approval_flow` (`tenant_id`, `created_at`);

-- 项目相关索引
CREATE INDEX `idx_project_status_time` ON `project` (`status`, `created_at`);
CREATE INDEX `idx_project_category` ON `project` (`category`);

-- 绩效相关索引
CREATE INDEX `idx_perf_cycle` ON `department_performance_target` (`cycle`);
CREATE INDEX `idx_emp_perf_cycle` ON `employee_performance_target` (`cycle`);

-- 薪酬相关索引
CREATE INDEX `idx_salary_year_month` ON `salary_calculation` (`year`, `month`);
CREATE INDEX `idx_bonus_year` ON `department_bonus_distribution` (`year`);

-- ===================================================================
-- 7. 创建视图（便于查询）
-- ===================================================================

-- 项目审批状态视图
CREATE VIEW `v_project_with_approval_status` AS
SELECT 
    p.*,
    af.process_instance_id as approval_process_id,
    af.initiator_id as approval_initiator
FROM `project` p
LEFT JOIN `approval_flow` af ON af.biz_type = 'project' AND af.biz_id = p.id;

-- 员工薪酬汇总视图
CREATE VIEW `v_employee_salary_summary` AS
SELECT 
    sc.employee_id,
    sc.year,
    SUM(sc.base_salary) as annual_base_salary,
    SUM(sc.performance_salary) as annual_performance_salary,
    SUM(sc.project_commission) as annual_project_commission,
    SUM(sc.department_bonus) as annual_department_bonus,
    SUM(sc.total_salary) as annual_total_salary
FROM `salary_calculation` sc
WHERE sc.delflag = 0
GROUP BY sc.employee_id, sc.year;

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- 脚本执行完成
-- =================================================================== 