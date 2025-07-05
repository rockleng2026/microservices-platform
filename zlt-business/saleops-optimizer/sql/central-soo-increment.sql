-- ===================================================================
-- 销售运营优化器模块增量表设计
-- 数据库: central-soo
-- 版本: v1.0
-- 创建时间: 2024-12-19
-- 描述: 基于现有组织架构数据，扩展销售运营优化功能
-- ===================================================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `central_soo` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `central_soo`;

-- ===================================================================
-- 1. 部门分红配置表
-- ===================================================================
CREATE TABLE `soo_department_bonus_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `department_name` varchar(128) NOT NULL COMMENT '部门名称',
  `bonus_weight` decimal(7,4) NOT NULL COMMENT '分红权重(0-100)',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date COMMENT '失效日期',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `remark` varchar(500) COMMENT '备注',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_effective_date` (`effective_date`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门分红配置表';

-- ===================================================================
-- 2. 职级薪资标准表
-- ===================================================================
CREATE TABLE `soo_job_level_salary` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `department_id` bigint(20) NOT NULL COMMENT '部门ID-关联部门表',
    `position_id` bigint(20) NOT NULL COMMENT '岗位ID-关联岗位表',
    `job_level_code` varchar(50) NOT NULL COMMENT '职级编码-编码定义在通用字典表',
    `base_salary_min` decimal(10,2) NOT NULL COMMENT '基础工资下限',
    `base_salary_max` decimal(10,2) NOT NULL COMMENT '基础工资上限',
    `performance_ratio_min` decimal(5,4) NOT NULL COMMENT '绩效比例下限',
    `performance_ratio_max` decimal(5,4) NOT NULL COMMENT '绩效比例上限',
    `effective_date` date NOT NULL COMMENT '生效日期',
    `expire_date` date DEFAULT NULL COMMENT '失效日期',
    `status` tinyint(1) DEFAULT '1' COMMENT '状态(1启用,0禁用)',
    `sort_order` int(11) DEFAULT '0' COMMENT '排序号',
    `remark` varchar(500) DEFAULT NULL COMMENT '备注',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `created_by` bigint(20) DEFAULT NULL COMMENT '创建人',
    `updated_by` bigint(20) DEFAULT NULL COMMENT '更新人',
    `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
    `delflag` tinyint(1) DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_job_level_dept` (`position_id`,`tenant_id`),
    KEY `idx_department_id` (`department_id`),
    KEY `idx_effective_date` (`effective_date`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_status` (`status`,`delflag`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COMMENT='职位职级薪资标准表';

-- ===================================================================
-- 3. 员工薪酬配置表
-- ===================================================================
CREATE TABLE `soo_employee_salary_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `base_salary` decimal(10,2) NOT NULL COMMENT '基础工资',
  `region` varchar(50) NOT NULL COMMENT '所在地区--关联通用字典表',
  `is_sales_incentive` tinyint(1) DEFAULT 0 COMMENT '是否参与销售提成(1是,0否)',
  `is_team_incentive` tinyint(1) DEFAULT 0 COMMENT '是否参与团队提成(1是,0否)',
  `is_department_bonus` tinyint(1) DEFAULT 0 COMMENT '是否参与部门分红(1是,0否)',
  `sales_incentive_ratio` decimal(6,2) DEFAULT 0 COMMENT '销售提成比例-%号单位',
  `team_incentive_ratio` decimal(6,2) DEFAULT 0 COMMENT '团队提成比例-%号单位',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date COMMENT '失效日期',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `remark` varchar(500) COMMENT '备注',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employee_effective` (`employee_id`, `tenant_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工薪酬配置表';

-- ===================================================================
-- 4. 月度绩效表
-- ===================================================================
CREATE TABLE `soo_monthly_performance` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `month` varchar(7) NOT NULL COMMENT '月份(YYYY-MM)',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `employee_name` varchar(50) NOT NULL COMMENT '员工姓名',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `performance_score` decimal(5,2) NOT NULL COMMENT '绩效得分(0-100)',
  `personal_project_revenue` decimal(15,2) DEFAULT 0 COMMENT '个人项目营业额',
  `personal_project_margin` decimal(5,4) DEFAULT 0 COMMENT '个人项目毛利率',
  `personal_project_profit` decimal(15,2) DEFAULT 0 COMMENT '个人项目毛利润',
  `team_project_id` varchar(100) COMMENT '团队项目ID(多个用逗号分隔)',
  `team_project_revenue` decimal(15,2) DEFAULT 0 COMMENT '团队项目营业额',
  `team_project_margin` decimal(5,4) DEFAULT 0 COMMENT '团队项目毛利率',
  `team_project_profit` decimal(15,2) DEFAULT 0 COMMENT '团队项目毛利润',
  `team_member_count` int(11) DEFAULT 1 COMMENT '团队成员数量',
  `kpi_scores` json COMMENT 'KPI得分详情(JSON格式)',
  `performance_remark` varchar(1000) COMMENT '绩效备注',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1有效,0无效)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_month_employee` (`month`, `employee_id`, `tenant_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_month` (`month`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月度绩效表';

-- ===================================================================
-- 5. 工资计算结果表
-- ===================================================================
CREATE TABLE `soo_payroll_result` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `month` varchar(7) NOT NULL COMMENT '月份(YYYY-MM)',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `employee_name` varchar(50) NOT NULL COMMENT '员工姓名',
  `employee_no` varchar(20) NOT NULL COMMENT '员工编号',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `department_name` varchar(128) NOT NULL COMMENT '部门名称',
  `position_id` bigint(20) NOT NULL COMMENT '岗位ID',
  `job_level_id` varchar(50) NOT NULL COMMENT '职级ID',
  `region` varchar(50) NOT NULL COMMENT '地区',
  
  -- 基础薪酬
  `base_salary` decimal(10,2) NOT NULL COMMENT '基础工资',
  `region_coefficient` decimal(5,4) DEFAULT 1 COMMENT '地区系数',
  `adjusted_base_salary` decimal(10,2) NOT NULL COMMENT '调整后基础工资',
  
  -- 绩效薪酬
  `performance_score` decimal(5,2) NOT NULL COMMENT '绩效得分',
  `performance_ratio` decimal(5,4) NOT NULL COMMENT '绩效比例',
  `performance_pay` decimal(10,2) DEFAULT 0 COMMENT '绩效工资',
  
  -- 提成薪酬
  `personal_commission` decimal(10,2) DEFAULT 0 COMMENT '个人项目提成',
  `team_commission` decimal(10,2) DEFAULT 0 COMMENT '团队项目提成',
  `department_bonus` decimal(10,2) DEFAULT 0 COMMENT '部门分红',
  
  -- 应发工资
  `gross_pay` decimal(10,2) NOT NULL COMMENT '应发工资合计',
  
  -- 社保公积金(个人部分)
  `personal_pension` decimal(10,2) DEFAULT 0 COMMENT '个人养老保险',
  `personal_medical` decimal(10,2) DEFAULT 0 COMMENT '个人医疗保险',
  `personal_unemployment` decimal(10,2) DEFAULT 0 COMMENT '个人失业保险',
  `personal_housing_fund` decimal(10,2) DEFAULT 0 COMMENT '个人公积金',
  `personal_social_total` decimal(10,2) DEFAULT 0 COMMENT '个人社保公积金合计',
  
  -- 个人所得税
  `taxable_income` decimal(10,2) DEFAULT 0 COMMENT '应纳税所得额',
  `personal_income_tax` decimal(10,2) DEFAULT 0 COMMENT '个人所得税',
  
  -- 实发工资
  `net_pay` decimal(10,2) NOT NULL COMMENT '实发工资',
  
  -- 公司成本
  `company_pension` decimal(10,2) DEFAULT 0 COMMENT '公司养老保险',
  `company_medical` decimal(10,2) DEFAULT 0 COMMENT '公司医疗保险',
  `company_unemployment` decimal(10,2) DEFAULT 0 COMMENT '公司失业保险',
  `company_maternity` decimal(10,2) DEFAULT 0 COMMENT '公司生育保险',
  `company_injury` decimal(10,2) DEFAULT 0 COMMENT '公司工伤保险',
  `company_housing_fund` decimal(10,2) DEFAULT 0 COMMENT '公司公积金',
  `company_social_total` decimal(10,2) DEFAULT 0 COMMENT '公司社保公积金合计',
  `total_cost` decimal(10,2) NOT NULL COMMENT '公司总成本',
  
  -- 计算相关
  `calculation_rule` json COMMENT '计算规则(JSON格式)',
  `calculation_log` text COMMENT '计算日志',
  `is_final` tinyint(1) DEFAULT 0 COMMENT '是否最终确认(1是,0否)',
  `confirmed_by` bigint(20) COMMENT '确认人',
  `confirmed_at` timestamp NULL COMMENT '确认时间',
  
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_month_employee` (`month`, `employee_id`, `tenant_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_month` (`month`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_is_final` (`is_final`),
  KEY `idx_status` (`delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工资计算结果表';

-- ===================================================================
-- 6. 社保公积金基数配置表
-- ===================================================================
CREATE TABLE `soo_social_security_base` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `region` varchar(50) NOT NULL COMMENT '地区',
  `year` int(4) NOT NULL COMMENT '年度',
  `social_security_base_upper` decimal(10,2) NOT NULL COMMENT '社保基数上限',
  `social_security_base_lower` decimal(10,2) NOT NULL COMMENT '社保基数下限',
  `housing_fund_base_upper` decimal(10,2) NOT NULL COMMENT '公积金基数上限',
  `housing_fund_base_lower` decimal(10,2) NOT NULL COMMENT '公积金基数下限',
  
  -- 个人缴费比例
  `pension_personal_ratio` decimal(5,4) NOT NULL COMMENT '养老保险个人比例',
  `medical_personal_ratio` decimal(5,4) NOT NULL COMMENT '医疗保险个人比例',
  `unemployment_personal_ratio` decimal(5,4) NOT NULL COMMENT '失业保险个人比例',
  `housing_fund_personal_ratio` decimal(5,4) NOT NULL COMMENT '公积金个人比例',
  
  -- 公司缴费比例
  `pension_company_ratio` decimal(5,4) NOT NULL COMMENT '养老保险公司比例',
  `medical_company_ratio` decimal(5,4) NOT NULL COMMENT '医疗保险公司比例',
  `unemployment_company_ratio` decimal(5,4) NOT NULL COMMENT '失业保险公司比例',
  `maternity_company_ratio` decimal(5,4) NOT NULL COMMENT '生育保险公司比例',
  `injury_company_ratio` decimal(5,4) NOT NULL COMMENT '工伤保险公司比例',
  `housing_fund_company_ratio` decimal(5,4) NOT NULL COMMENT '公积金公司比例',
  
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date COMMENT '失效日期',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `remark` varchar(500) COMMENT '备注',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_region_year` (`region`, `year`, `tenant_id`),
  KEY `idx_region` (`region`),
  KEY `idx_year` (`year`),
  KEY `idx_effective_date` (`effective_date`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社保公积金基数配置表';

-- ===================================================================
-- 7. 地区工资系数表
-- ===================================================================
CREATE TABLE `soo_regional_salary_coefficient` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `region` varchar(50) NOT NULL COMMENT '地区',
  `region_code` varchar(20) NOT NULL COMMENT '地区编码',
  `salary_coefficient` decimal(5,4) NOT NULL COMMENT '工资系数',
  `cost_of_living_index` decimal(5,4) COMMENT '生活成本指数',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date COMMENT '失效日期',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序号',
  `remark` varchar(500) COMMENT '备注',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_region_effective` (`region`, `effective_date`, `tenant_id`),
  KEY `idx_region` (`region`),
  KEY `idx_effective_date` (`effective_date`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地区工资系数表';

-- ===================================================================
-- 8. KPI定义表
-- ===================================================================
CREATE TABLE `soo_kpi_definition` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `kpi_id` varchar(50) NOT NULL COMMENT 'KPI ID',
  `kpi_name` varchar(100) NOT NULL COMMENT 'KPI名称',
  `kpi_category` varchar(50) COMMENT 'KPI分类',
  `department_id` bigint(20) COMMENT '所属部门ID(空表示通用)',
  `job_level_id` varchar(50) COMMENT '适用职级ID(空表示通用)',
  `weight` decimal(5,4) NOT NULL COMMENT '权重(0-1)',
  `calculation_method` varchar(50) COMMENT '计算方式',
  `target_value` decimal(15,2) COMMENT '目标值',
  `unit` varchar(20) COMMENT '单位',
  `formula` varchar(500) COMMENT '计算公式',
  `data_source` varchar(100) COMMENT '数据来源',
  `frequency` varchar(20) DEFAULT 'monthly' COMMENT '考核频率(monthly/quarterly/yearly)',
  `is_core` tinyint(1) DEFAULT 0 COMMENT '是否核心KPI(1是,0否)',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date COMMENT '失效日期',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序号',
  `remark` varchar(500) COMMENT '备注',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kpi_id` (`kpi_id`, `tenant_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_job_level_id` (`job_level_id`),
  KEY `idx_effective_date` (`effective_date`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='KPI定义表';

-- ===================================================================
-- 9. 盈亏平衡分析表
-- ===================================================================
CREATE TABLE `soo_breakeven_analysis` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `analysis_id` varchar(50) NOT NULL COMMENT '分析ID',
  `analysis_type` varchar(20) NOT NULL COMMENT '分析类型(monthly/quarterly/yearly)',
  `period` varchar(20) NOT NULL COMMENT '分析周期(YYYY-MM/YYYY-Q1/YYYY)',
  `start_date` date NOT NULL COMMENT '开始日期',
  `end_date` date NOT NULL COMMENT '结束日期',
  
  -- 营业额数据
  `current_total_revenue` decimal(15,2) COMMENT '当期总营业额',
  `current_gross_margin` decimal(5,4) COMMENT '当期毛利率',
  `current_gross_profit` decimal(15,2) COMMENT '当期毛利润',
  
  -- 成本数据
  `total_salary_cost` decimal(15,2) COMMENT '总工资成本(含社保公积金)',
  `fixed_operating_cost` decimal(15,2) COMMENT '固定运营成本',
  `variable_operating_cost` decimal(15,2) COMMENT '可变运营成本',
  `total_cost` decimal(15,2) COMMENT '总成本',
  
  -- 利润数据
  `current_profit` decimal(15,2) COMMENT '当期利润',
  `distributable_profit` decimal(15,2) COMMENT '可分红利润总额',
  `profit_margin` decimal(5,4) COMMENT '利润率',
  
  -- 盈亏平衡点(不同毛利率场景)
  `bep_revenue_10gm` decimal(15,2) COMMENT '10%毛利率盈亏平衡点',
  `bep_revenue_30gm` decimal(15,2) COMMENT '30%毛利率盈亏平衡点',
  `bep_revenue_65gm` decimal(15,2) COMMENT '65%毛利率盈亏平衡点',
  
  -- 成本结构分析
  `fixed_cost_ratio` decimal(5,4) COMMENT '固定成本占比',
  `variable_cost_ratio` decimal(5,4) COMMENT '变动成本占比',
  `salary_cost_ratio` decimal(5,4) COMMENT '人工成本占比',
  
  -- 业绩预测
  `predicted_revenue_optimistic` decimal(15,2) COMMENT '乐观预测营业额',
  `predicted_revenue_baseline` decimal(15,2) COMMENT '基准预测营业额',
  `predicted_revenue_pessimistic` decimal(15,2) COMMENT '悲观预测营业额',
  
  -- 团队分析
  `total_employee_count` int(11) COMMENT '总员工数',
  `revenue_per_employee` decimal(10,2) COMMENT '人均营业额',
  `cost_per_employee` decimal(10,2) COMMENT '人均成本',
  `profit_per_employee` decimal(10,2) COMMENT '人均利润',
  
  -- 分析结果
  `analysis_result` json COMMENT '分析结果详情(JSON格式)',
  `risk_assessment` text COMMENT '风险评估',
  `recommendations` text COMMENT '改进建议',
  
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1有效,0无效)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) COMMENT '创建人',
  `updated_by` bigint(20) COMMENT '更新人',
  `tenant_id` varchar(32) DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_analysis_period` (`analysis_id`, `period`, `tenant_id`),
  KEY `idx_period` (`period`),
  KEY `idx_analysis_type` (`analysis_type`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`, `delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='盈亏平衡分析表';

-- ===================================================================
-- 10. 项目相关数据复用说明
-- ===================================================================

-- 注意：项目相关数据复用现有项目管理模块的表结构
-- 
-- 1. 项目基本信息：复用表 `project` 
--    - 项目ID、项目名称、项目类别、负责人等基础信息
--    - 参与人员通过 participants 字段（JSON格式）存储
--    - 项目状态、创建时间等通用字段
--
-- 2. 项目毛利分配：复用表 `project_profit_distribution`
--    - 项目人员角色分配和提成比例
--    - 支持按比例和固定金额两种分配方式
--    - 包含审批流程字段
--
-- 3. 项目结项数据：复用表 `project_closure`
--    - 项目结项时间、合同金额、实际金额
--    - 毛利润和毛利率计算
--    - 结项审批状态
--
-- 4. 产品分配指导：复用表 `product_profit_distribution_guide`
--    - 不同产品类型的标准分配比例
--    - 不同角色的提成范围指导
--
-- 薪酬计算模块通过以下方式关联项目数据：
-- - monthly_performance.team_project_id 关联 project.id
-- - 通过 project.participants 获取项目成员信息
-- - 通过 project_profit_distribution 获取分配比例
-- - 通过 project_closure 获取项目财务数据

-- ===================================================================
-- 11. 操作日志说明
-- ===================================================================

-- 注意：操作日志功能使用平台公共模块提供的统一日志服务
-- 
-- 销售运营优化器模块不单独维护操作日志表，而是通过以下方式记录日志：
-- 1. 使用统一的日志切面(AOP)自动记录关键操作
-- 2. 通过日志服务API主动记录重要业务操作
-- 3. 日志数据存储在公共日志库中，支持跨模块查询
-- 
-- 关键业务操作日志记录范围：
-- - 薪酬配置的增删改操作
-- - 绩效数据的录入和修改
-- - 工资计算和审批操作
-- - 盈亏平衡分析的生成和修改
-- - 重要配置参数的变更

-- ===================================================================
-- 12. 预置数据插入
-- ===================================================================

-- 插入地区工资系数预置数据
INSERT INTO `soo_regional_salary_coefficient` 
(`region`, `region_code`, `salary_coefficient`, `effective_date`, `sort_order`) VALUES
('北京', 'BJ', 1.2000, '2024-01-01', 1),
('上海', 'SH', 1.1000, '2024-01-01', 2),
('广州', 'GZ', 1.0500, '2024-01-01', 3),
('深圳', 'SZ', 1.1000, '2024-01-01', 4),
('杭州', 'HZ', 1.0000, '2024-01-01', 5),
('西安', 'XA', 0.8000, '2024-01-01', 6),
('成都', 'CD', 0.9000, '2024-01-01', 7),
('武汉', 'WH', 0.8500, '2024-01-01', 8),
('南京', 'NJ', 0.9500, '2024-01-01', 9),
('重庆', 'CQ', 0.8500, '2024-01-01', 10);

-- 插入社保公积金基数预置数据(以北京2024年为例)
INSERT INTO `soo_social_security_base` 
(`region`, `year`, `social_security_base_upper`, `social_security_base_lower`, 
 `housing_fund_base_upper`, `housing_fund_base_lower`,
 `pension_personal_ratio`, `medical_personal_ratio`, `unemployment_personal_ratio`, `housing_fund_personal_ratio`,
 `pension_company_ratio`, `medical_company_ratio`, `unemployment_company_ratio`, 
 `maternity_company_ratio`, `injury_company_ratio`, `housing_fund_company_ratio`,
 `effective_date`) VALUES
('北京', 2024, 31884.00, 5869.00, 31884.00, 2540.00,
 0.0800, 0.0200, 0.0050, 0.1200,
 0.1600, 0.1000, 0.0050, 0.0080, 0.0020, 0.1200,
 '2024-01-01'),
('上海', 2024, 36549.00, 7310.00, 36549.00, 2690.00,
 0.0800, 0.0200, 0.0050, 0.0700,
 0.1600, 0.0950, 0.0050, 0.0080, 0.0020, 0.0700,
 '2024-01-01');

-- 插入职级薪资标准预置数据
INSERT INTO `soo_job_level_salary` 
(`job_level_id`, `job_level_name`, `department_id`, `department_name`,
 `base_salary_min`, `base_salary_max`, `performance_ratio_min`, `performance_ratio_max`,
 `effective_date`) VALUES
('L1', '初级员工', 0, '通用', 5000.00, 8000.00, 0.3000, 0.8000, '2024-01-01'),
('L2', '中级员工', 0, '通用', 8000.00, 12000.00, 0.4000, 0.9000, '2024-01-01'),
('L3', '高级员工', 0, '通用', 12000.00, 18000.00, 0.5000, 1.0000, '2024-01-01'),
('M1', '初级主管', 0, '通用', 15000.00, 25000.00, 0.6000, 1.1000, '2024-01-01'),
('M2', '中级主管', 0, '通用', 20000.00, 35000.00, 0.7000, 1.2000, '2024-01-01'),
('S1', '经理', 0, '通用', 25000.00, 50000.00, 0.8000, 1.5000, '2024-01-01'),
('D1', '总监', 0, '通用', 40000.00, 80000.00, 1.0000, 2.0000, '2024-01-01');

-- 插入KPI定义预置数据
INSERT INTO `soo_kpi_definition` 
(`kpi_id`, `kpi_name`, `kpi_category`, `weight`, `calculation_method`, `target_value`, `unit`, `frequency`, `is_core`, `effective_date`) VALUES
('KPI001', '销售额达成率', '销售类', 0.5000, '达成率', 100.00, '%', 'monthly', 1, '2024-01-01'),
('KPI002', '客户满意度', '服务类', 0.3000, '评分', 90.00, '分', 'monthly', 1, '2024-01-01'),
('KPI003', '项目按时交付率', '项目类', 0.4000, '达成率', 95.00, '%', 'monthly', 1, '2024-01-01'),
('KPI004', '代码提交量', '研发类', 0.2000, '数量', 100.00, '次', 'monthly', 0, '2024-01-01'),
('KPI005', '培训完成率', '学习类', 0.1000, '达成率', 100.00, '%', 'quarterly', 0, '2024-01-01');

-- ===================================================================
-- 创建索引优化
-- ===================================================================

-- 为常用查询字段创建复合索引
CREATE INDEX `idx_payroll_tenant_month` ON `soo_payroll_result` (`tenant_id`, `month`, `delflag`);
CREATE INDEX `idx_performance_tenant_month` ON `soo_monthly_performance` (`tenant_id`, `month`, `delflag`);
CREATE INDEX `idx_breakeven_tenant_period` ON `soo_breakeven_analysis` (`tenant_id`, `period`, `delflag`);
CREATE INDEX `idx_employee_config_tenant_effective` ON `soo_employee_salary_config` (`tenant_id`, `effective_date`, `delflag`);

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- 结束
-- =================================================================== 