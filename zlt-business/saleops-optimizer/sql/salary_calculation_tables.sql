-- ===================================================================
-- 薪酬计算模块表结构设计
-- 数据库: central-soo
-- 版本: v2.0
-- 创建时间: 2025-01-XX
-- 描述: 重新设计薪酬计算相关表结构，支持任务化计算和数据追溯
-- ===================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 薪酬计算任务表
-- ----------------------------
DROP TABLE IF EXISTS `soo_salary_calculation_task`;
CREATE TABLE `soo_salary_calculation_task` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '任务ID',
  `task_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '任务名称',
  `calculation_month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '计算月份(YYYY-MM)',
  `calculation_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'FULL' COMMENT '计算类型(FULL全员,DEPARTMENT部门,EMPLOYEE指定员工)',
  `target_department_ids` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '目标部门IDs(多个用逗号分隔)',
  `target_employee_ids` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '目标员工IDs(多个用逗号分隔)',
  `exclude_employee_ids` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '排除员工IDs(多个用逗号分隔)',
  `calculation_rules` json NULL COMMENT '计算规则配置(JSON格式)',
  `task_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING' COMMENT '任务状态(PENDING待执行,RUNNING执行中,COMPLETED已完成,FAILED失败,CANCELLED已取消)',
  `progress_percent` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '执行进度百分比',
  `total_employee_count` int(11) NULL DEFAULT 0 COMMENT '总员工数',
  `processed_employee_count` int(11) NULL DEFAULT 0 COMMENT '已处理员工数',
  `success_employee_count` int(11) NULL DEFAULT 0 COMMENT '成功处理员工数',
  `failed_employee_count` int(11) NULL DEFAULT 0 COMMENT '失败处理员工数',
  `total_gross_pay` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '应发工资总额',
  `total_net_pay` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '实发工资总额',
  `total_company_cost` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '公司总成本',
  `start_time` timestamp NULL DEFAULT NULL COMMENT '开始执行时间',
  `end_time` timestamp NULL DEFAULT NULL COMMENT '结束执行时间',
  `execution_duration` int(11) NULL DEFAULT NULL COMMENT '执行耗时(秒)',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '错误信息',
  `execution_log` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '执行日志',
  `is_final` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否最终确认(1是,0否)',
  `confirmed_by` bigint(20) NULL DEFAULT NULL COMMENT '确认人ID',
  `confirmed_at` timestamp NULL DEFAULT NULL COMMENT '确认时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_id_tenant`(`task_id`, `tenant_id`) USING BTREE,
  INDEX `idx_calculation_month`(`calculation_month`) USING BTREE,
  INDEX `idx_task_status`(`task_status`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE,
  INDEX `idx_status_delflag`(`task_status`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '薪酬计算任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 2. 重构工资计算结果表 (添加任务关联)
-- ----------------------------
-- 备份原有数据
CREATE TABLE `soo_payroll_result_backup` AS SELECT * FROM `soo_payroll_result`;

-- 删除并重建表
DROP TABLE IF EXISTS `soo_payroll_result`;
CREATE TABLE `soo_payroll_result` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '计算任务ID',
  `task_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '任务名称',
  `calculation_version` int(11) NOT NULL DEFAULT 1 COMMENT '计算版本(同月同员工可多次计算)',
  `month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '月份(YYYY-MM)',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `employee_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '员工姓名',
  `employee_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '员工编号',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `department_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '部门名称',
  `position_id` bigint(20) NOT NULL COMMENT '岗位ID',
  `position_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '岗位名称',
  `job_level_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '职级编码',
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '地区',
  
  -- 基础工资相关
  `base_salary` decimal(10, 2) NOT NULL COMMENT '基础工资',
  `region_coefficient` decimal(5, 4) NOT NULL DEFAULT 1.0000 COMMENT '地区系数',
  `adjusted_base_salary` decimal(10, 2) NOT NULL COMMENT '调整后基础工资',
  
  -- 绩效相关
  `performance_score` decimal(5, 2) NOT NULL COMMENT '绩效得分',
  `performance_ratio` decimal(5, 4) NOT NULL COMMENT '绩效比例',
  `performance_pay` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '绩效工资',
  
  -- 提成奖金相关
  `personal_project_profit` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '个人项目毛利润',
  `personal_commission_rate` decimal(5, 4) NULL DEFAULT 0.0000 COMMENT '个人提成比例',
  `personal_commission` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '个人项目提成',
  `team_project_profit` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '团队项目毛利润',
  `team_commission_rate` decimal(5, 4) NULL DEFAULT 0.0000 COMMENT '团队提成比例',
  `team_commission` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '团队项目提成',
  `department_bonus` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '部门分红',
  `other_allowance` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '其他补贴',
  `other_deduction` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '其他扣除',
  
  -- 工资汇总
  `gross_pay` decimal(10, 2) NOT NULL COMMENT '应发工资合计',
  
  -- 个人扣除明细
  `personal_pension` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '个人养老保险',
  `personal_medical` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '个人医疗保险',
  `personal_unemployment` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '个人失业保险',
  `personal_housing_fund` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '个人公积金',
  `personal_social_total` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '个人社保公积金合计',
  
  -- 个税计算
  `taxable_income` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '应纳税所得额',
  `personal_income_tax` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '个人所得税',
  `net_pay` decimal(10, 2) NOT NULL COMMENT '实发工资',
  
  -- 公司成本明细
  `company_pension` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '公司养老保险',
  `company_medical` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '公司医疗保险',
  `company_unemployment` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '公司失业保险',
  `company_maternity` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '公司生育保险',
  `company_injury` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '公司工伤保险',
  `company_housing_fund` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '公司公积金',
  `company_social_total` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '公司社保公积金合计',
  `total_company_cost` decimal(10, 2) NOT NULL COMMENT '公司总成本',
  
  -- 计算相关
  `calculation_rule_snapshot` json NULL COMMENT '计算规则快照(JSON格式)',
  `calculation_details` json NULL COMMENT '计算明细(JSON格式)',
  `calculation_log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '计算日志',
  `calculation_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SUCCESS' COMMENT '计算状态(SUCCESS成功,FAILED失败,WARNING警告)',
  `error_message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '错误信息',
  
  -- 确认和审批
  `is_current_version` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否当前版本(1是,0否)',
  `is_final` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否最终确认(1是,0否)',
  `confirmed_by` bigint(20) NULL DEFAULT NULL COMMENT '确认人',
  `confirmed_at` timestamp NULL DEFAULT NULL COMMENT '确认时间',
  `approval_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'PENDING' COMMENT '审批状态(PENDING待审批,APPROVED已审批,REJECTED已拒绝)',
  `approved_by` bigint(20) NULL DEFAULT NULL COMMENT '审批人',
  `approved_at` timestamp NULL DEFAULT NULL COMMENT '审批时间',
  `approval_remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审批备注',
  
  -- 系统字段
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标识',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_employee`(`task_id`, `employee_id`, `tenant_id`) USING BTREE,
  INDEX `idx_month_employee`(`month`, `employee_id`) USING BTREE,
  INDEX `idx_employee_id`(`employee_id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_task_id`(`task_id`) USING BTREE,
  INDEX `idx_month`(`month`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_is_current`(`is_current_version`) USING BTREE,
  INDEX `idx_is_final`(`is_final`) USING BTREE,
  INDEX `idx_approval_status`(`approval_status`) USING BTREE,
  INDEX `idx_calculation_status`(`calculation_status`) USING BTREE,
  INDEX `idx_status_delflag`(`delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '工资计算结果表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 3. 薪酬统计汇总表
-- ----------------------------
DROP TABLE IF EXISTS `soo_salary_summary`;
CREATE TABLE `soo_salary_summary` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '计算任务ID',
  `summary_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '汇总类型(TOTAL全公司,DEPARTMENT部门)',
  `month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '月份(YYYY-MM)',
  `department_id` bigint(20) NULL DEFAULT NULL COMMENT '部门ID(类型为DEPARTMENT时必填)',
  `department_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '部门名称',
  
  -- 人员统计
  `total_employee_count` int(11) NOT NULL DEFAULT 0 COMMENT '总员工数',
  `calculation_employee_count` int(11) NOT NULL DEFAULT 0 COMMENT '参与计算员工数',
  
  -- 工资统计
  `total_base_salary` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '基础工资总额',
  `total_performance_pay` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '绩效工资总额',
  `total_commission` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '提成总额',
  `total_bonus` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '奖金总额',
  `total_allowance` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '补贴总额',
  `total_gross_pay` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '应发工资总额',
  `total_deduction` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '扣除总额',
  `total_net_pay` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '实发工资总额',
  
  -- 社保公积金统计
  `total_personal_social` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '个人社保公积金总额',
  `total_company_social` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '公司社保公积金总额',
  `total_personal_tax` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '个人所得税总额',
  
  -- 公司成本统计
  `total_company_cost` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '公司总成本',
  
  -- 平均数据
  `avg_gross_pay` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '人均应发工资',
  `avg_net_pay` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '人均实发工资',
  `avg_company_cost` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '人均公司成本',
  
  -- 系统字段
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标识',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_type_dept`(`task_id`, `summary_type`, `department_id`, `tenant_id`) USING BTREE,
  INDEX `idx_task_id`(`task_id`) USING BTREE,
  INDEX `idx_month`(`month`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status_delflag`(`delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '薪酬统计汇总表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 4. 重构盈亏平衡分析表 (基于薪酬计算结果)
-- ----------------------------
-- 备份原有数据
CREATE TABLE `soo_breakeven_analysis_backup` AS SELECT * FROM `soo_breakeven_analysis`;

-- 删除并重建表
DROP TABLE IF EXISTS `soo_breakeven_analysis`;
CREATE TABLE `soo_breakeven_analysis` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `analysis_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析ID',
  `task_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '关联薪酬计算任务ID',
  `analysis_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析名称',
  `analysis_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析类型(monthly/quarterly/yearly)',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析周期(YYYY-MM/YYYY-Q1/YYYY)',
  `start_date` date NOT NULL COMMENT '开始日期',
  `end_date` date NOT NULL COMMENT '结束日期',
  
  -- 营收数据
  `current_total_revenue` decimal(15, 2) NULL DEFAULT NULL COMMENT '当期总营业额',
  `current_gross_margin` decimal(5, 4) NULL DEFAULT NULL COMMENT '当期毛利率',
  `current_gross_profit` decimal(15, 2) NULL DEFAULT NULL COMMENT '当期毛利润',
  
  -- 人工成本数据 (基于薪酬计算结果)
  `total_gross_pay` decimal(15, 2) NULL DEFAULT NULL COMMENT '总应发工资',
  `total_net_pay` decimal(15, 2) NULL DEFAULT NULL COMMENT '总实发工资',
  `total_company_social` decimal(15, 2) NULL DEFAULT NULL COMMENT '公司社保公积金总额',
  `total_salary_cost` decimal(15, 2) NULL DEFAULT NULL COMMENT '总人工成本(应发工资+公司社保)',
  `total_employee_count` int(11) NULL DEFAULT NULL COMMENT '总员工数',
  
  -- 其他成本数据
  `fixed_operating_cost` decimal(15, 2) NULL DEFAULT NULL COMMENT '固定运营成本',
  `variable_operating_cost` decimal(15, 2) NULL DEFAULT NULL COMMENT '可变运营成本',
  `total_cost` decimal(15, 2) NULL DEFAULT NULL COMMENT '总成本',
  
  -- 利润分析
  `current_profit` decimal(15, 2) NULL DEFAULT NULL COMMENT '当期利润',
  `distributable_profit` decimal(15, 2) NULL DEFAULT NULL COMMENT '可分红利润总额',
  `profit_margin` decimal(5, 4) NULL DEFAULT NULL COMMENT '利润率',
  
  -- 盈亏平衡点分析
  `bep_revenue_10gm` decimal(15, 2) NULL DEFAULT NULL COMMENT '10%毛利率盈亏平衡点',
  `bep_revenue_30gm` decimal(15, 2) NULL DEFAULT NULL COMMENT '30%毛利率盈亏平衡点',
  `bep_revenue_65gm` decimal(15, 2) NULL DEFAULT NULL COMMENT '65%毛利率盈亏平衡点',
  
  -- 成本结构分析
  `fixed_cost_ratio` decimal(5, 4) NULL DEFAULT NULL COMMENT '固定成本占比',
  `variable_cost_ratio` decimal(5, 4) NULL DEFAULT NULL COMMENT '变动成本占比',
  `salary_cost_ratio` decimal(5, 4) NULL DEFAULT NULL COMMENT '人工成本占比',
  
  -- 效率分析
  `revenue_per_employee` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均营业额',
  `cost_per_employee` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均成本',
  `profit_per_employee` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均利润',
  `salary_per_employee` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均人工成本',
  
  -- 预测数据
  `predicted_revenue_optimistic` decimal(15, 2) NULL DEFAULT NULL COMMENT '乐观预测营业额',
  `predicted_revenue_baseline` decimal(15, 2) NULL DEFAULT NULL COMMENT '基准预测营业额',
  `predicted_revenue_pessimistic` decimal(15, 2) NULL DEFAULT NULL COMMENT '悲观预测营业额',
  
  -- 分析结果
  `analysis_result` json NULL COMMENT '分析结果详情(JSON格式)',
  `risk_assessment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '风险评估',
  `recommendations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '改进建议',
  `key_indicators` json NULL COMMENT '关键指标(JSON格式)',
  
  -- 数据来源说明
  `data_sources` json NULL COMMENT '数据来源说明(JSON格式)',
  `calculation_method` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '计算方法说明',
  
  -- 系统字段
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态(1有效,0无效)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标识',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_analysis_period_tenant`(`analysis_id`, `period`, `tenant_id`) USING BTREE,
  INDEX `idx_task_id`(`task_id`) USING BTREE,
  INDEX `idx_period`(`period`) USING BTREE,
  INDEX `idx_analysis_type`(`analysis_type`) USING BTREE,
  INDEX `idx_start_date`(`start_date`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status_delflag`(`status`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '盈亏平衡分析表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 5. 工资条生成任务表
-- ----------------------------
DROP TABLE IF EXISTS `soo_payslip_task`;
CREATE TABLE `soo_payslip_task` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '任务ID',
  `task_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '任务名称',
  `salary_task_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '关联薪酬计算任务ID',
  `template_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '工资条模板ID',
  `generation_month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '生成月份(YYYY-MM)',
  `target_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ALL' COMMENT '目标类型(ALL全员,DEPARTMENT部门,EMPLOYEE指定员工)',
  `target_department_ids` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '目标部门IDs',
  `target_employee_ids` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '目标员工IDs',
  `delivery_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'EMAIL' COMMENT '发送方式(EMAIL邮件,SMS短信,MANUAL手工)',
  `task_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING' COMMENT '任务状态',
  `total_count` int(11) NOT NULL DEFAULT 0 COMMENT '总数量',
  `generated_count` int(11) NOT NULL DEFAULT 0 COMMENT '已生成数量',
  `sent_count` int(11) NOT NULL DEFAULT 0 COMMENT '已发送数量',
  `failed_count` int(11) NOT NULL DEFAULT 0 COMMENT '失败数量',
  `start_time` timestamp NULL DEFAULT NULL COMMENT '开始时间',
  `end_time` timestamp NULL DEFAULT NULL COMMENT '结束时间',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '错误信息',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标识',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_id_tenant`(`task_id`, `tenant_id`) USING BTREE,
  INDEX `idx_salary_task_id`(`salary_task_id`) USING BTREE,
  INDEX `idx_generation_month`(`generation_month`) USING BTREE,
  INDEX `idx_task_status`(`task_status`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status_delflag`(`delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '工资条生成任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 6. 工资条记录表
-- ----------------------------
DROP TABLE IF EXISTS `soo_payslip_record`;
CREATE TABLE `soo_payslip_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `payslip_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '工资条ID',
  `task_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '生成任务ID',
  `salary_result_id` bigint(20) NOT NULL COMMENT '薪酬计算结果ID',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `employee_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '员工姓名',
  `month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '月份',
  `template_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '模板ID',
  `payslip_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '工资条内容(HTML)',
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '文件地址',
  `delivery_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '发送方式',
  `delivery_target` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '发送目标(邮箱/手机号)',
  `delivery_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING' COMMENT '发送状态',
  `delivery_time` timestamp NULL DEFAULT NULL COMMENT '发送时间',
  `view_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'UNREAD' COMMENT '查看状态',
  `view_time` timestamp NULL DEFAULT NULL COMMENT '查看时间',
  `error_message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '错误信息',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标识',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_payslip_id_tenant`(`payslip_id`, `tenant_id`) USING BTREE,
  INDEX `idx_task_id`(`task_id`) USING BTREE,
  INDEX `idx_employee_id`(`employee_id`) USING BTREE,
  INDEX `idx_month`(`month`) USING BTREE,
  INDEX `idx_delivery_status`(`delivery_status`) USING BTREE,
  INDEX `idx_view_status`(`view_status`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status_delflag`(`delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '工资条记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 示例数据插入
-- ----------------------------

-- 插入示例薪酬计算任务 (总共32个字段)
INSERT INTO `soo_salary_calculation_task` (
  `id`, `task_id`, `task_name`, `calculation_month`, `calculation_type`, 
  `target_department_ids`, `target_employee_ids`, `exclude_employee_ids`, `calculation_rules`, 
  `task_status`, `progress_percent`, `total_employee_count`, `processed_employee_count`, 
  `success_employee_count`, `failed_employee_count`, `total_gross_pay`, `total_net_pay`, `total_company_cost`,
  `start_time`, `end_time`, `execution_duration`, `error_message`, `execution_log`, 
  `is_final`, `confirmed_by`, `confirmed_at`, `remark`, 
  `created_at`, `updated_at`, `created_by`, `updated_by`, `tenant_id`, `delflag`
) VALUES 
(1, 'TASK_202412_001', '2024年12月全员薪酬计算', '2024-12', 'FULL', 
NULL, NULL, NULL, '{"version": "1.0", "rules": {"baseCalculation": true, "performanceCalculation": true, "commissionCalculation": true}}', 
'COMPLETED', 100.00, 50, 50, 50, 0, 2450000.00, 1896000.00, 2940000.00, 
'2024-12-01 09:00:00', '2024-12-01 09:30:00', 1800, NULL, '任务执行完成，共处理50名员工薪酬计算', 
1, 1, '2024-12-01 09:30:00', '全员薪酬计算', 
NOW(), NOW(), 1, 1, 'default', 0);

-- 插入示例工资计算结果 (总共61个字段)
INSERT INTO `soo_payroll_result` (
  `id`, `task_id`, `task_name`, `calculation_version`, `month`, `employee_id`, `employee_name`, `employee_no`,
  `department_id`, `department_name`, `position_id`, `position_name`, `job_level_code`, `region`,
  `base_salary`, `region_coefficient`, `adjusted_base_salary`, `performance_score`, `performance_ratio`, `performance_pay`,
  `personal_project_profit`, `personal_commission_rate`, `personal_commission`, `team_project_profit`, `team_commission_rate`, 
  `team_commission`, `department_bonus`, `other_allowance`, `other_deduction`, `gross_pay`,
  `personal_pension`, `personal_medical`, `personal_unemployment`, `personal_housing_fund`, `personal_social_total`,
  `taxable_income`, `personal_income_tax`, `net_pay`, `company_pension`, `company_medical`, 
  `company_unemployment`, `company_maternity`, `company_injury`, `company_housing_fund`, `company_social_total`, `total_company_cost`,
  `calculation_rule_snapshot`, `calculation_details`, `calculation_log`, `calculation_status`, `error_message`,
  `is_current_version`, `is_final`, `confirmed_by`, `confirmed_at`, `approval_status`, `approved_by`, `approved_at`, `approval_remark`,
  `created_at`, `updated_at`, `created_by`, `updated_by`, `tenant_id`, `delflag`
) VALUES 
(1, 'TASK_202412_001', '2024年12月全员薪酬计算', 1, '2024-12', 1, '张伟强', 'EMP001', 
1, '技术开发部', 1, '高级开发工程师', 'SENIOR', 'BEIJING', 
15000.00, 1.2000, 18000.00, 88.50, 0.8850, 15930.00, 
120000.00, 0.0700, 8400.00, 300000.00, 0.0400, 12000.00, 5000.00, 500.00, 0.00, 59830.00,
1440.00, 360.00, 180.00, 2160.00, 4140.00, 55690.00, 0.00, 51550.00, 
2880.00, 1800.00, 180.00, 180.00, 36.00, 2160.00, 7236.00, 67066.00,
'{"rules": "standard_v1.0"}', '{"steps": "completed"}', NULL, 'SUCCESS', NULL,
1, 0, NULL, NULL, 'PENDING', NULL, NULL, NULL,
NOW(), NOW(), 1, 1, 'default', 0);

-- 插入示例薪酬汇总 (总共25个字段)
INSERT INTO `soo_salary_summary` (
  `id`, `task_id`, `summary_type`, `month`, `department_id`, `department_name`,
  `total_employee_count`, `calculation_employee_count`, `total_base_salary`, `total_performance_pay`, 
  `total_commission`, `total_bonus`, `total_allowance`, `total_gross_pay`, `total_deduction`, `total_net_pay`,
  `total_personal_social`, `total_company_social`, `total_personal_tax`, `total_company_cost`,
  `avg_gross_pay`, `avg_net_pay`, `avg_company_cost`, 
  `created_at`, `updated_at`, `created_by`, `updated_by`, `tenant_id`, `delflag`
) VALUES 
(1, 'TASK_202412_001', 'TOTAL', '2024-12', NULL, NULL, 
50, 50, 750000.00, 500000.00, 200000.00, 150000.00, 50000.00, 1650000.00, 200000.00, 1450000.00,
150000.00, 200000.00, 50000.00, 1850000.00, 33000.00, 29000.00, 37000.00, 
NOW(), NOW(), 1, 1, 'default', 0);

-- 插入示例盈亏平衡分析 (总共33个字段)
INSERT INTO `soo_breakeven_analysis` (
  `id`, `analysis_id`, `task_id`, `analysis_name`, `analysis_type`, `period`, `start_date`, `end_date`,
  `current_total_revenue`, `current_gross_margin`, `current_gross_profit`, `total_gross_pay`, `total_net_pay`, 
  `total_company_social`, `total_salary_cost`, `total_employee_count`, `fixed_operating_cost`, `variable_operating_cost`, `total_cost`,
  `current_profit`, `distributable_profit`, `profit_margin`, `bep_revenue_10gm`, `bep_revenue_30gm`, `bep_revenue_65gm`,
  `fixed_cost_ratio`, `variable_cost_ratio`, `salary_cost_ratio`, `revenue_per_employee`, `cost_per_employee`, 
  `profit_per_employee`, `salary_per_employee`, `predicted_revenue_optimistic`, `predicted_revenue_baseline`, `predicted_revenue_pessimistic`,
  `analysis_result`, `risk_assessment`, `recommendations`, `key_indicators`, `data_sources`, `calculation_method`,
  `status`, `created_at`, `updated_at`, `created_by`, `updated_by`, `tenant_id`, `delflag`
) VALUES 
(1, 'BEP_202412_001', 'TASK_202412_001', '2024年12月盈亏平衡分析', 'monthly', '2024-12', 
'2024-12-01', '2024-12-31', 5000000.00, 0.3500, 1750000.00, 1650000.00, 1450000.00, 200000.00, 1850000.00, 50, 
300000.00, 500000.00, 2350000.00, -600000.00, 0.00, -0.1200, 23500000.00, 7833333.33, 3615384.62,
0.1277, 0.2128, 0.7872, 100000.00, 47000.00, -12000.00, 37000.00, 5500000.00, 5000000.00, 4500000.00, 
'{"profitability": "negative", "riskLevel": "high"}', '现金流紧张，需要提升营收', '建议优化成本结构，提高毛利率',
'{"efficiency": "low", "costControl": "poor"}', '{"salaryData": "soo_payroll_result", "revenueData": "manual_input"}', '基于实际薪酬计算数据进行分析',
1, NOW(), NOW(), 1, 1, 'default', 0);

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- 数据迁移脚本 (可选执行)
-- ----------------------------

-- 将原有 soo_payroll_result 数据迁移到新表结构
-- INSERT INTO `soo_payroll_result` (
--   task_id, task_name, calculation_version, month, employee_id, employee_name, employee_no,
--   department_id, department_name, position_id, job_level_code, region,
--   base_salary, region_coefficient, adjusted_base_salary, performance_score, performance_ratio, performance_pay,
--   personal_commission, team_commission, department_bonus, gross_pay,
--   personal_pension, personal_medical, personal_unemployment, personal_housing_fund, personal_social_total,
--   taxable_income, personal_income_tax, net_pay,
--   company_pension, company_medical, company_unemployment, company_maternity, company_injury, company_housing_fund, company_social_total, total_company_cost,
--   calculation_rule_snapshot, calculation_log, is_final, confirmed_by, confirmed_at,
--   created_at, updated_at, created_by, updated_by, tenant_id, delflag
-- )
-- SELECT 
--   CONCAT('MIGRATED_', id) as task_id, 
--   CONCAT(month, '月份工资计算') as task_name,
--   1 as calculation_version,
--   month, employee_id, employee_name, employee_no,
--   department_id, department_name, position_id, job_level_code, region,
--   base_salary, region_coefficient, adjusted_base_salary, performance_score, performance_ratio, performance_pay,
--   personal_commission, team_commission, department_bonus, gross_pay,
--   personal_pension, personal_medical, personal_unemployment, personal_housing_fund, personal_social_total,
--   taxable_income, personal_income_tax, net_pay,
--   company_pension, company_medical, company_unemployment, company_maternity, company_injury, company_housing_fund, company_social_total, total_cost,
--   calculation_rule, calculation_log, is_final, confirmed_by, confirmed_at,
--   created_at, updated_at, created_by, updated_by, tenant_id, delflag
-- FROM `soo_payroll_result_backup`
-- WHERE delflag = 0; 