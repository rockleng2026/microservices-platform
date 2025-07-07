-- ===================================================================
-- 销售运营优化器模块增量表设计
-- 数据库: central-soo
-- 版本: v1.0
-- 创建时间: 2025-07-07
-- 描述: 基于现有组织架构数据，扩展销售运营优化功能
-- ===================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for soo_breakeven_analysis
-- ----------------------------
DROP TABLE IF EXISTS `soo_breakeven_analysis`;
CREATE TABLE `soo_breakeven_analysis`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `analysis_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析ID',
  `analysis_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析类型(monthly/quarterly/yearly)',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析周期(YYYY-MM/YYYY-Q1/YYYY)',
  `start_date` date NOT NULL COMMENT '开始日期',
  `end_date` date NOT NULL COMMENT '结束日期',
  `current_total_revenue` decimal(15, 2) NULL DEFAULT NULL COMMENT '当期总营业额',
  `current_gross_margin` decimal(5, 4) NULL DEFAULT NULL COMMENT '当期毛利率',
  `current_gross_profit` decimal(15, 2) NULL DEFAULT NULL COMMENT '当期毛利润',
  `total_salary_cost` decimal(15, 2) NULL DEFAULT NULL COMMENT '总工资成本(含社保公积金)',
  `fixed_operating_cost` decimal(15, 2) NULL DEFAULT NULL COMMENT '固定运营成本',
  `variable_operating_cost` decimal(15, 2) NULL DEFAULT NULL COMMENT '可变运营成本',
  `total_cost` decimal(15, 2) NULL DEFAULT NULL COMMENT '总成本',
  `current_profit` decimal(15, 2) NULL DEFAULT NULL COMMENT '当期利润',
  `distributable_profit` decimal(15, 2) NULL DEFAULT NULL COMMENT '可分红利润总额',
  `profit_margin` decimal(5, 4) NULL DEFAULT NULL COMMENT '利润率',
  `bep_revenue_10gm` decimal(15, 2) NULL DEFAULT NULL COMMENT '10%毛利率盈亏平衡点',
  `bep_revenue_30gm` decimal(15, 2) NULL DEFAULT NULL COMMENT '30%毛利率盈亏平衡点',
  `bep_revenue_65gm` decimal(15, 2) NULL DEFAULT NULL COMMENT '65%毛利率盈亏平衡点',
  `fixed_cost_ratio` decimal(5, 4) NULL DEFAULT NULL COMMENT '固定成本占比',
  `variable_cost_ratio` decimal(5, 4) NULL DEFAULT NULL COMMENT '变动成本占比',
  `salary_cost_ratio` decimal(5, 4) NULL DEFAULT NULL COMMENT '人工成本占比',
  `predicted_revenue_optimistic` decimal(15, 2) NULL DEFAULT NULL COMMENT '乐观预测营业额',
  `predicted_revenue_baseline` decimal(15, 2) NULL DEFAULT NULL COMMENT '基准预测营业额',
  `predicted_revenue_pessimistic` decimal(15, 2) NULL DEFAULT NULL COMMENT '悲观预测营业额',
  `total_employee_count` int(11) NULL DEFAULT NULL COMMENT '总员工数',
  `revenue_per_employee` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均营业额',
  `cost_per_employee` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均成本',
  `profit_per_employee` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均利润',
  `analysis_result` json NULL COMMENT '分析结果详情(JSON格式)',
  `risk_assessment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '风险评估',
  `recommendations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '改进建议',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1有效,0无效)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_analysis_period`(`analysis_id`, `period`, `tenant_id`) USING BTREE,
  INDEX `idx_period`(`period`) USING BTREE,
  INDEX `idx_analysis_type`(`analysis_type`) USING BTREE,
  INDEX `idx_start_date`(`start_date`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE,
  INDEX `idx_breakeven_tenant_period`(`tenant_id`, `period`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '盈亏平衡分析表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_breakeven_analysis
-- ----------------------------

-- ----------------------------
-- Table structure for soo_department_bonus_config
-- ----------------------------
DROP TABLE IF EXISTS `soo_department_bonus_config`;
CREATE TABLE `soo_department_bonus_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `department_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '部门名称',
  `bonus_weight` decimal(7, 4) NOT NULL COMMENT '分红权重(0-100)',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date NULL DEFAULT NULL COMMENT '失效日期',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_effective_date`(`effective_date`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '部门分红配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_department_bonus_config
-- ----------------------------
INSERT INTO `soo_department_bonus_config` VALUES (1, 2, '技术研发部1', 53.0000, '2025-07-04', NULL, 1, '撒旦法索拉卡代发阿斯蒂芬', '2025-07-04 14:40:04', '2025-07-06 04:23:38', NULL, NULL, 'default', 0);
INSERT INTO `soo_department_bonus_config` VALUES (2, 3, '人力行政部', 43.0000, '2025-07-04', NULL, 1, NULL, '2025-07-04 15:33:35', '2025-07-04 15:33:35', NULL, NULL, 'default', 0);

-- ----------------------------
-- Table structure for soo_employee_salary_config
-- ----------------------------
DROP TABLE IF EXISTS `soo_employee_salary_config`;
CREATE TABLE `soo_employee_salary_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `base_salary` decimal(10, 2) NOT NULL COMMENT '基础工资',
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '所在地区--关联通用字典表',
  `is_sales_incentive` tinyint(1) NULL DEFAULT 0 COMMENT '是否参与销售提成(1是,0否)',
  `is_team_incentive` tinyint(1) NULL DEFAULT 0 COMMENT '是否参与团队提成(1是,0否)',
  `is_department_bonus` tinyint(1) NULL DEFAULT 0 COMMENT '是否参与部门分红(1是,0否)',
  `sales_incentive_ratio` decimal(6, 2) NULL DEFAULT 0.00 COMMENT '销售提成比例-%号单位',
  `team_incentive_ratio` decimal(6, 2) NULL DEFAULT 0.00 COMMENT '团队提成比例-%号单位',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date NULL DEFAULT NULL COMMENT '失效日期',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_employee_effective`(`employee_id`, `tenant_id`) USING BTREE,
  INDEX `idx_employee_id`(`employee_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '员工薪酬配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_employee_salary_config
-- ----------------------------
INSERT INTO `soo_employee_salary_config` VALUES (1, 26, 9000.00, 'BEIJING', 1, 1, 1, 3.00, 4.00, '2025-07-05', NULL, 1, 'ytttt', '2025-07-06 02:30:51', '2025-07-06 02:43:51', NULL, NULL, 'default', 0);

-- ----------------------------
-- Table structure for soo_job_level_salary
-- ----------------------------
DROP TABLE IF EXISTS `soo_job_level_salary`;
CREATE TABLE `soo_job_level_salary`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID-关联部门表',
  `position_id` bigint(20) NOT NULL COMMENT '岗位ID-关联岗位表',
  `job_level_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '职级编码-编码定义在通用字典表',
  `base_salary_min` decimal(10, 2) NOT NULL COMMENT '基础工资下限',
  `base_salary_max` decimal(10, 2) NOT NULL COMMENT '基础工资上限',
  `performance_ratio_min` decimal(5, 4) NOT NULL COMMENT '绩效比例下限',
  `performance_ratio_max` decimal(5, 4) NOT NULL COMMENT '绩效比例上限',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date NULL DEFAULT NULL COMMENT '失效日期',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_job_level_dept`(`position_id`, `tenant_id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_effective_date`(`effective_date`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '职位职级薪资标准表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_job_level_salary
-- ----------------------------
INSERT INTO `soo_job_level_salary` VALUES (1, 2, 24, 'LEADER', 6000.00, 9000.00, 0.4000, 0.9000, '2025-07-05', NULL, 1, 0, 'test', '2025-07-05 14:53:08', '2025-07-05 14:53:08', NULL, NULL, 'default', 0);
INSERT INTO `soo_job_level_salary` VALUES (2, 2, 3, 'LEADER', 6000.00, 10000.00, 0.4000, 0.9000, '2025-07-05', NULL, 1, 0, 'hhhh', '2025-07-05 15:21:28', '2025-07-05 15:21:28', NULL, NULL, 'default', 0);

-- ----------------------------
-- Table structure for soo_kpi_definition
-- ----------------------------
DROP TABLE IF EXISTS `soo_kpi_definition`;
CREATE TABLE `soo_kpi_definition`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `kpi_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'KPI ID',
  `kpi_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'KPI名称',
  `kpi_category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'KPI分类',
  `department_id` bigint(20) NULL DEFAULT NULL COMMENT '所属部门ID(空表示通用)',
  `job_level_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '适用职级ID(空表示通用)',
  `weight` decimal(5, 4) NOT NULL COMMENT '权重(0-1)',
  `calculation_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '计算方式',
  `target_value` decimal(15, 2) NULL DEFAULT NULL COMMENT '目标值',
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '单位',
  `formula` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '计算公式',
  `data_source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '数据来源',
  `frequency` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'monthly' COMMENT '考核频率(monthly/quarterly/yearly)',
  `is_core` tinyint(1) NULL DEFAULT 0 COMMENT '是否核心KPI(1是,0否)',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date NULL DEFAULT NULL COMMENT '失效日期',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_kpi_id`(`kpi_id`, `tenant_id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_job_level_id`(`job_level_id`) USING BTREE,
  INDEX `idx_effective_date`(`effective_date`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'KPI定义表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_kpi_definition
-- ----------------------------
INSERT INTO `soo_kpi_definition` VALUES (1, 'KPI001', '销售额达成率', '销售类', NULL, NULL, 0.5000, '达成率', 100.00, '%', NULL, NULL, 'monthly', 1, '2024-01-01', NULL, 1, 0, NULL, '2025-07-03 16:02:26', '2025-07-03 16:02:26', NULL, NULL, 'default', 0);
INSERT INTO `soo_kpi_definition` VALUES (2, 'KPI002', '客户满意度', '服务类', NULL, NULL, 0.3000, '评分', 90.00, '分', NULL, NULL, 'monthly', 1, '2024-01-01', NULL, 1, 0, NULL, '2025-07-03 16:02:26', '2025-07-03 16:02:26', NULL, NULL, 'default', 0);
INSERT INTO `soo_kpi_definition` VALUES (3, 'KPI003', '项目按时交付率', '项目类', NULL, NULL, 0.4000, '达成率', 95.00, '%', NULL, NULL, 'monthly', 1, '2024-01-01', NULL, 1, 0, NULL, '2025-07-03 16:02:26', '2025-07-03 16:02:26', NULL, NULL, 'default', 0);
INSERT INTO `soo_kpi_definition` VALUES (4, 'KPI004', '代码提交量', '研发类', NULL, NULL, 0.2000, '数量', 100.00, '次', NULL, NULL, 'monthly', 0, '2024-01-01', NULL, 1, 0, NULL, '2025-07-03 16:02:26', '2025-07-03 16:02:26', NULL, NULL, 'default', 0);
INSERT INTO `soo_kpi_definition` VALUES (5, 'KPI005', '培训完成率', '学习类', NULL, NULL, 0.1000, '达成率', 100.00, '%', NULL, NULL, 'quarterly', 0, '2024-01-01', NULL, 1, 0, NULL, '2025-07-03 16:02:26', '2025-07-03 16:02:26', NULL, NULL, 'default', 0);

-- ----------------------------
-- Table structure for soo_monthly_performance
-- ----------------------------
DROP TABLE IF EXISTS `soo_monthly_performance`;
CREATE TABLE `soo_monthly_performance`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '月份(YYYY-MM)',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `employee_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '员工姓名',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `department_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '部门名称',
  `performance_score` decimal(5, 2) NOT NULL COMMENT '绩效得分(0-100)',
  `personal_project_revenue` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '个人项目营业额',
  `personal_project_margin` decimal(5, 4) NULL DEFAULT 0.0000 COMMENT '个人项目毛利率',
  `personal_project_profit` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '个人项目毛利润',
  `team_project_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '团队项目ID(多个用逗号分隔)',
  `team_project_revenue` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '团队项目营业额',
  `team_project_margin` decimal(5, 4) NULL DEFAULT 0.0000 COMMENT '团队项目毛利率',
  `team_project_profit` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '团队项目毛利润',
  `team_member_count` int(11) NULL DEFAULT 1 COMMENT '团队成员数量',
  `kpi_scores` json NULL COMMENT 'KPI得分详情(JSON格式)',
  `performance_remark` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '绩效备注',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1有效,0无效)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_month_employee`(`month`, `employee_id`, `tenant_id`) USING BTREE,
  INDEX `idx_employee_id`(`employee_id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_month`(`month`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE,
  INDEX `idx_performance_tenant_month`(`tenant_id`, `month`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '月度绩效表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_monthly_performance
-- ----------------------------
INSERT INTO `soo_monthly_performance` VALUES (1, '2024-06', 1, '张伟强', 1, 'test', 88.50, 120000.00, 0.3200, 38400.00, 'P1001', 300000.00, 0.2800, 84000.00, 5, '{\"kpiA\": 90, \"kpiB\": 85}', '表现优秀', 1, '2025-07-07 00:07:05', '2025-07-07 10:49:02', NULL, NULL, 'default', 0);
INSERT INTO `soo_monthly_performance` VALUES (2, '2024-06', 2, '李雅芳', 1, 'test', 75.00, 90000.00, 0.2500, 22500.00, 'P1002', 200000.00, 0.2200, 44000.00, 4, '{\"kpiA\": 75, \"kpiB\": 80}', '完成基本目标', 1, '2025-07-07 00:07:05', '2025-07-07 10:49:09', NULL, NULL, 'default', 0);
INSERT INTO `soo_monthly_performance` VALUES (3, '2024-06', 3, '王建华', 2, 'test2', 92.00, 150000.00, 0.3500, 52500.00, 'P1003', 350000.00, 0.3000, 105000.00, 6, '{\"kpiA\": 95, \"kpiB\": 90}', '团队贡献突出', 1, '2025-07-07 00:07:05', '2025-07-07 10:49:07', NULL, NULL, 'default', 0);
INSERT INTO `soo_monthly_performance` VALUES (4, '2025-02', 26, '张1天', 2, '技术研发部', 94.00, 11111.00, 0.0100, 0.00, NULL, 22223.00, 0.0200, 0.00, 1, NULL, NULL, 1, '2025-07-07 10:50:58', '2025-07-07 11:24:34', NULL, NULL, 'default', 1);
INSERT INTO `soo_monthly_performance` VALUES (5, '2024-01', 1, '张伟强', 1, 'PORTAL科技公司', 85.50, 50000.00, 0.2000, 0.00, NULL, 100000.00, 0.1500, 0.00, 1, NULL, NULL, 1, '2025-07-07 13:11:56', '2025-07-07 13:11:56', NULL, NULL, 'default', 0);
INSERT INTO `soo_monthly_performance` VALUES (6, '2024-02', 1, '张伟强', 1, 'PORTAL科技公司', 90.00, 100000.00, 0.2000, 0.00, NULL, 100000.00, 0.1500, 0.00, 1, NULL, NULL, 1, '2025-07-07 13:11:56', '2025-07-07 13:11:56', NULL, NULL, 'default', 0);

-- ----------------------------
-- Table structure for soo_payroll_result
-- ----------------------------
DROP TABLE IF EXISTS `soo_payroll_result`;
CREATE TABLE `soo_payroll_result`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '月份(YYYY-MM)',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `employee_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '员工姓名',
  `employee_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '员工编号',
  `department_id` bigint(20) NOT NULL COMMENT '部门ID',
  `department_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '部门名称',
  `position_id` bigint(20) NOT NULL COMMENT '岗位ID',
  `job_level_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '职级编码-岗位所对应的职级',
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '地区',
  `base_salary` decimal(10, 2) NOT NULL COMMENT '基础工资',
  `region_coefficient` decimal(5, 4) NULL DEFAULT 1.0000 COMMENT '地区系数',
  `adjusted_base_salary` decimal(10, 2) NOT NULL COMMENT '调整后基础工资',
  `performance_score` decimal(5, 2) NOT NULL COMMENT '绩效得分',
  `performance_ratio` decimal(5, 4) NOT NULL COMMENT '绩效比例',
  `performance_pay` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '绩效工资',
  `personal_commission` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '个人项目提成',
  `team_commission` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '团队项目提成',
  `department_bonus` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '部门分红',
  `gross_pay` decimal(10, 2) NOT NULL COMMENT '应发工资合计',
  `personal_pension` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '个人养老保险',
  `personal_medical` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '个人医疗保险',
  `personal_unemployment` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '个人失业保险',
  `personal_housing_fund` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '个人公积金',
  `personal_social_total` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '个人社保公积金合计',
  `taxable_income` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '应纳税所得额',
  `personal_income_tax` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '个人所得税',
  `net_pay` decimal(10, 2) NOT NULL COMMENT '实发工资',
  `company_pension` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '公司养老保险',
  `company_medical` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '公司医疗保险',
  `company_unemployment` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '公司失业保险',
  `company_maternity` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '公司生育保险',
  `company_injury` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '公司工伤保险',
  `company_housing_fund` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '公司公积金',
  `company_social_total` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '公司社保公积金合计',
  `total_cost` decimal(10, 2) NOT NULL COMMENT '公司总成本',
  `calculation_rule` json NULL COMMENT '计算规则(JSON格式)',
  `calculation_log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '计算日志',
  `is_final` tinyint(1) NULL DEFAULT 0 COMMENT '是否最终确认(1是,0否)',
  `confirmed_by` bigint(20) NULL DEFAULT NULL COMMENT '确认人',
  `confirmed_at` timestamp NULL DEFAULT NULL COMMENT '确认时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_month_employee`(`month`, `employee_id`, `tenant_id`) USING BTREE,
  INDEX `idx_employee_id`(`employee_id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_month`(`month`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_is_final`(`is_final`) USING BTREE,
  INDEX `idx_status`(`delflag`) USING BTREE,
  INDEX `idx_payroll_tenant_month`(`tenant_id`, `month`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '工资计算结果表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_payroll_result
-- ----------------------------

-- ----------------------------
-- Table structure for soo_regional_salary_coefficient
-- ----------------------------
DROP TABLE IF EXISTS `soo_regional_salary_coefficient`;
CREATE TABLE `soo_regional_salary_coefficient`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '地区',
  `region_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '地区编码',
  `salary_coefficient` decimal(5, 4) NOT NULL COMMENT '工资系数',
  `cost_of_living_index` decimal(5, 4) NULL DEFAULT NULL COMMENT '生活成本指数',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date NULL DEFAULT NULL COMMENT '失效日期',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_region_effective`(`region`, `effective_date`, `tenant_id`) USING BTREE,
  INDEX `idx_region`(`region`) USING BTREE,
  INDEX `idx_effective_date`(`effective_date`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '地区工资系数表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_regional_salary_coefficient
-- ----------------------------
INSERT INTO `soo_regional_salary_coefficient` VALUES (1, '北京', 'BEIGJING', 1.2000, NULL, '2024-01-01', NULL, 1, 1, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:16', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (2, '上海', 'SHANHAI', 1.1000, NULL, '2024-01-01', NULL, 1, 2, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:21', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (3, '广州', 'GUANGZ', 1.0500, NULL, '2024-01-01', NULL, 1, 3, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:23', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (4, '深圳', 'SHENZHEN', 1.1000, NULL, '2024-01-01', NULL, 1, 4, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:26', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (5, '杭州', 'HANGZHOU', 1.0000, NULL, '2024-01-01', NULL, 1, 5, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:28', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (6, '西安', 'XIAN', 0.8000, NULL, '2024-01-01', NULL, 1, 6, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:30', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (7, '成都', 'CHENGDU', 0.9000, NULL, '2024-01-01', NULL, 1, 7, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:34', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (8, '武汉', 'WUHAN', 0.8500, NULL, '2024-01-01', NULL, 1, 8, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:36', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (9, '南京', 'NANJING', 0.9500, NULL, '2024-01-01', NULL, 1, 9, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:40', NULL, NULL, 'default', 0);
INSERT INTO `soo_regional_salary_coefficient` VALUES (10, '重庆', 'CHONGQING', 0.8500, NULL, '2024-01-01', NULL, 1, 10, NULL, '2025-07-03 16:02:26', '2025-07-06 03:28:42', NULL, NULL, 'default', 0);

-- ----------------------------
-- Table structure for soo_social_security_base
-- ----------------------------
DROP TABLE IF EXISTS `soo_social_security_base`;
CREATE TABLE `soo_social_security_base`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '地区',
  `year` int(4) NOT NULL COMMENT '年度',
  `social_security_base_upper` decimal(10, 2) NOT NULL COMMENT '社保基数上限',
  `social_security_base_lower` decimal(10, 2) NOT NULL COMMENT '社保基数下限',
  `housing_fund_base_upper` decimal(10, 2) NOT NULL COMMENT '公积金基数上限',
  `housing_fund_base_lower` decimal(10, 2) NOT NULL COMMENT '公积金基数下限',
  `pension_personal_ratio` decimal(4, 0) NOT NULL COMMENT '养老保险个人比例',
  `medical_personal_ratio` decimal(4, 0) NOT NULL COMMENT '医疗保险个人比例',
  `unemployment_personal_ratio` decimal(4, 0) NOT NULL COMMENT '失业保险个人比例',
  `housing_fund_personal_ratio` decimal(4, 0) NOT NULL COMMENT '公积金个人比例',
  `pension_company_ratio` decimal(4, 0) NOT NULL COMMENT '养老保险公司比例',
  `medical_company_ratio` decimal(4, 0) NOT NULL COMMENT '医疗保险公司比例',
  `unemployment_company_ratio` decimal(4, 0) NOT NULL COMMENT '失业保险公司比例',
  `maternity_company_ratio` decimal(4, 0) NOT NULL COMMENT '生育保险公司比例',
  `injury_company_ratio` decimal(4, 0) NOT NULL COMMENT '工伤保险公司比例',
  `housing_fund_company_ratio` decimal(4, 0) NOT NULL COMMENT '公积金公司比例',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date NULL DEFAULT NULL COMMENT '失效日期',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_region_year`(`region`, `year`, `tenant_id`) USING BTREE,
  INDEX `idx_region`(`region`) USING BTREE,
  INDEX `idx_year`(`year`) USING BTREE,
  INDEX `idx_effective_date`(`effective_date`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '社保公积金基数配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of soo_social_security_base
-- ----------------------------
INSERT INTO `soo_social_security_base` VALUES (1, 'BEIJING', 2024, 31884.00, 5869.00, 31884.00, 2540.00, 8, 2, 1, 12, 16, 10, 1, 1, 0, 12, '2024-01-01', NULL, 1, NULL, '2025-07-06 03:10:19', '2025-07-06 03:21:48', NULL, NULL, 'default', 0);
INSERT INTO `soo_social_security_base` VALUES (2, 'SHANGHAI', 2024, 36549.00, 7310.00, 36549.00, 2690.00, 8, 2, 1, 7, 16, 10, 1, 1, 0, 7, '2024-01-01', NULL, 1, NULL, '2025-07-06 03:10:19', '2025-07-06 03:27:47', NULL, NULL, 'default', 1);
INSERT INTO `soo_social_security_base` VALUES (3, 'GUANGZHOU', 2025, 30000.00, 5000.00, 30000.00, 2540.00, 8, 2, 1, 12, 16, 10, 1, 1, 0, 12, '2025-01-01', NULL, 1, 'GZ2025', '2025-07-06 03:25:28', '2025-07-06 03:25:28', NULL, NULL, 'default', 0);

SET FOREIGN_KEY_CHECKS = 1;
