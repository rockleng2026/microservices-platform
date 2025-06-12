/*
 Navicat Premium Data Transfer

 Source Server         : 127.0.0.1
 Source Server Type    : MySQL
 Source Server Version : 50744
 Source Host           : localhost:3306
 Source Schema         : central_organization

 Target Server Type    : MySQL
 Target Server Version : 50744
 File Encoding         : 65001

 Date: 11/06/2025 23:27:59
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for audit_log
-- ----------------------------
DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE `audit_log`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` int(11) NULL DEFAULT NULL COMMENT '操作用户ID',
  `user_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '操作用户名',
  `module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '操作模块',
  `operation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '操作类型',
  `target_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '目标类型',
  `target_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '目标ID',
  `target_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '目标名称',
  `operation_desc` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '操作描述',
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '变更前值',
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '变更后值',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户代理',
  `operation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_operation_time`(`operation_time`) USING BTREE,
  INDEX `idx_module`(`module`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_audit_tenant_time`(`tenant_id`, `operation_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '审计日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_log
-- ----------------------------

-- ----------------------------
-- Table structure for department
-- ----------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '部门名称',
  `director_id` bigint(20) NULL DEFAULT NULL COMMENT '部门主管ID',
  `parent_id` bigint(20) NULL DEFAULT 0 COMMENT '父部门ID',
  `dep_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '部门编号',
  `grade_id` tinyint(1) NULL DEFAULT 7 COMMENT '部门等级(1-7级)',
  `is_level` tinyint(1) NULL DEFAULT NULL COMMENT '部门级别',
  `fiiale` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '是否为分公司(1是,空否)',
  `filialemark` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '分公司标识',
  `tel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '电话',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '办公地址',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '部门描述',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` int(11) NULL DEFAULT 0 COMMENT '删除标识(0正常,1删除)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_director_id`(`director_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE,
  INDEX `idx_dept_tenant_parent`(`tenant_id`, `parent_id`, `status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '部门表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of department
-- ----------------------------
INSERT INTO `department` VALUES (1, 'Portal科技公司', NULL, 0, 'HQ001', 1, NULL, NULL, NULL, NULL, NULL, '公司总部', 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (2, '技术研发部', 3, 1, 'RD001', 2, NULL, NULL, NULL, NULL, NULL, '负责产品技术研发和创新', 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (3, '人力行政部', 11, 1, 'HR001', 2, NULL, NULL, NULL, NULL, NULL, '负责人力资源管理和行政事务', 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (4, '市场销售部', 16, 1, 'MK001', 2, NULL, NULL, NULL, NULL, NULL, '负责市场营销和销售业务', 3, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (5, '财务部', 19, 1, 'FN001', 2, NULL, NULL, NULL, NULL, NULL, '负责财务管理和会计核算', 4, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (6, '后端开发组', 5, 2, 'RD101', 3, NULL, NULL, NULL, NULL, NULL, '负责后端系统开发', 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (7, '前端开发组', 8, 2, 'RD102', 3, NULL, NULL, NULL, NULL, NULL, '负责前端界面开发', 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (8, '测试质量组', 10, 2, 'RD103', 3, NULL, NULL, NULL, NULL, NULL, '负责软件测试和质量保证', 3, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (9, '运维支持组', NULL, 2, 'RD104', 3, NULL, NULL, NULL, NULL, NULL, '负责系统运维和技术支持', 4, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (10, '招聘培训组', 12, 3, 'HR101', 3, NULL, NULL, NULL, NULL, NULL, '负责人员招聘和员工培训', 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (11, '薪酬绩效组', 14, 3, 'HR102', 3, NULL, NULL, NULL, NULL, NULL, '负责薪酬管理和绩效考核', 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (12, '行政后勤组', NULL, 3, 'HR103', 3, NULL, NULL, NULL, NULL, NULL, '负责行政管理和后勤服务', 3, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);

-- ----------------------------
-- Table structure for department_grade
-- ----------------------------
DROP TABLE IF EXISTS `department_grade`;
CREATE TABLE `department_grade`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '部门级别ID',
  `dg_num` tinyint(1) NOT NULL COMMENT '部门等级数字(1-7)',
  `dg_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '部门等级名称',
  `dg_desc` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '部门等级描述',
  `level_weight` tinyint(1) NULL DEFAULT 0 COMMENT '级别权重',
  `can_manage_lower` tinyint(1) NULL DEFAULT 1 COMMENT '是否可管理下级(1是,0否)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dg_num_tenant`(`dg_num`, `tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '部门等级配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of department_grade
-- ----------------------------
INSERT INTO `department_grade` VALUES (1, 1, '集团级', '集团公司级别部门', 7, 1, '2025-06-09 23:36:38', 'default');
INSERT INTO `department_grade` VALUES (2, 2, '公司级', '分公司级别部门', 6, 1, '2025-06-09 23:36:38', 'default');
INSERT INTO `department_grade` VALUES (3, 3, '事业部级', '事业部级别部门', 5, 1, '2025-06-09 23:36:38', 'default');
INSERT INTO `department_grade` VALUES (4, 4, '部门级', '部门级别部门', 4, 1, '2025-06-09 23:36:38', 'default');
INSERT INTO `department_grade` VALUES (5, 5, '科室级', '科室级别部门', 3, 1, '2025-06-09 23:36:38', 'default');
INSERT INTO `department_grade` VALUES (6, 6, '小组级', '小组级别部门', 2, 1, '2025-06-09 23:36:38', 'default');
INSERT INTO `department_grade` VALUES (7, 7, '班组级', '班组级别部门', 1, 1, '2025-06-09 23:36:38', 'default');

-- ----------------------------
-- Table structure for employee
-- ----------------------------
DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '员工ID',
  `emp_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '员工编号',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名',
  `name_en` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '英文姓名',
  `birth_date` date NULL DEFAULT NULL COMMENT '出生日期',
  `gender` tinyint(1) NULL DEFAULT NULL COMMENT '性别(1:男,2:女)',
  `id_card` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '身份证号',
  `mobile` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `department_id` bigint(20) NULL DEFAULT NULL COMMENT '部门ID',
  `position_id` bigint(20) NULL DEFAULT NULL COMMENT '主岗位ID',
  `secondary_position_ids` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '副岗位ID列表',
  `grade_id` tinyint(1) NULL DEFAULT NULL COMMENT '员工等级ID',
  `employment_type` tinyint(1) NULL DEFAULT NULL COMMENT '用工类型(1:正式,2:实习,3:外包,4:劳务)',
  `employment_status` tinyint(1) NULL DEFAULT NULL COMMENT '在职状态(1:在职,2:试用,3:离职)',
  `entry_date` date NULL DEFAULT NULL COMMENT '入职日期',
  `probation_end_date` date NULL DEFAULT NULL COMMENT '试用期结束日期',
  `leave_date` date NULL DEFAULT NULL COMMENT '离职日期',
  `leave_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '离职原因',
  `login_account_flag` tinyint(1) NULL DEFAULT NULL COMMENT '登陆账号状态(0-无登陆账号，1-有登陆账号，2-禁止登录)',
  `education` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '学历',
  `nation` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '民族',
  `health_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '健康状况',
  `height` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '身高',
  `weight` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '体重',
  `marital_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '婚姻状况',
  `birthplace` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '籍贯',
  `residence` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '现居住地',
  `emergency_contact` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '紧急联系人',
  `emergency_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '紧急联系电话',
  `specialty` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '专业技能',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '头像',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '备注',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_emp_no`(`emp_no`, `tenant_id`) USING BTREE,
  INDEX `idx_department`(`department_id`) USING BTREE,
  INDEX `idx_position`(`position_id`) USING BTREE,
  INDEX `idx_status`(`employment_status`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_emp_tenant_dept`(`tenant_id`, `department_id`, `employment_status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '员工表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of employee
-- ----------------------------
INSERT INTO `employee` VALUES (1, 'EMP20240001', '张伟强', 'Zhang Weiqiang', '1975-03-15', 1, '110101197503156789', '13800001001', 'zhangwq@portal.com', 1, 1, NULL, 10, 1, 1, '2020-01-01', NULL, NULL, NULL, NULL, '硕士', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (2, 'EMP20240002', '李雅芳', 'Li Yafang', '1978-07-22', 2, '110101197807226789', '13800001002', 'liyf@portal.com', 1, 2, NULL, 9, 1, 1, '2020-02-01', NULL, NULL, NULL, NULL, '硕士', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (3, 'EMP20240003', '王建华', 'Wang Jianhua', '1982-11-08', 1, '110101198211086789', '13800001003', 'wangjh@portal.com', 2, 3, NULL, 9, 1, 1, '2020-03-01', NULL, NULL, NULL, NULL, '硕士', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (4, 'EMP20240004', '陈明亮', 'Chen Mingliang', '1985-09-12', 1, '110101198509126789', '13800001004', 'chenml@portal.com', 2, 4, NULL, 8, 1, 1, '2020-04-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (5, 'EMP20240005', '刘华强', 'Liu Huaqiang', '1987-05-20', 1, '110101198705206789', '13800001005', 'liuhq@portal.com', 6, 5, NULL, 7, 1, 1, '2020-05-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (6, 'EMP20240006', '赵敏', 'Zhao Min', '1990-12-03', 2, '110101199012036789', '13800001006', 'zhaom@portal.com', 6, 6, NULL, 6, 1, 1, '2021-01-15', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (7, 'EMP20240007', '周杰', 'Zhou Jie', '1992-08-18', 1, '110101199208186789', '13800001007', 'zhouj@portal.com', 6, 7, NULL, 5, 1, 1, '2021-03-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (8, 'EMP20240008', '孙丽', 'Sun Li', '1988-04-25', 2, '110101198804256789', '13800001008', 'sunl@portal.com', 7, 8, NULL, 7, 1, 1, '2020-06-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (9, 'EMP20240009', '马超', 'Ma Chao', '1991-01-10', 1, '110101199101106789', '13800001009', 'machao@portal.com', 7, 9, NULL, 6, 1, 1, '2021-05-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (10, 'EMP20240010', '黄飞鸿', 'Huang Feihong', '1989-10-30', 1, '110101198910306789', '13800001010', 'huangfh@portal.com', 8, 10, NULL, 7, 1, 1, '2020-07-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (11, 'EMP20240011', '林雪梅', 'Lin Xuemei', '1983-06-14', 2, '110101198306146789', '13800001011', 'linxm@portal.com', 3, 12, NULL, 9, 1, 1, '2020-02-15', NULL, NULL, NULL, NULL, '硕士', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (12, 'EMP20240012', '吴佳怡', 'Wu Jiayi', '1986-02-28', 2, '110101198602286789', '13800001012', 'wujy@portal.com', 10, 13, NULL, 7, 1, 1, '2020-08-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (13, 'EMP20240013', '许文静', 'Xu Wenjing', '1993-04-16', 2, '110101199304166789', '13800001013', 'xuwj@portal.com', 10, 14, NULL, 5, 1, 1, '2021-09-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (14, 'EMP20240014', '胡小芳', 'Hu Xiaofang', '1987-12-05', 2, '110101198712056789', '13800001014', 'huxf@portal.com', 11, 15, NULL, 7, 1, 1, '2020-09-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (15, 'EMP20240015', '梁美玲', 'Liang Meiling', '1994-07-08', 2, '110101199407086789', '13800001015', 'liangml@portal.com', 11, 16, NULL, 4, 1, 1, '2022-01-10', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (16, 'EMP20240016', '郑志强', 'Zheng Zhiqiang', '1980-09-22', 1, '110101198009226789', '13800001016', 'zhengzq@portal.com', 4, 18, NULL, 9, 1, 1, '2020-03-15', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (17, 'EMP20240017', '钟辉', 'Zhong Hui', '1984-11-18', 1, '110101198411186789', '13800001017', 'zhongh@portal.com', 4, 19, NULL, 8, 1, 1, '2020-10-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (18, 'EMP20240018', '谢丽娜', 'Xie Lina', '1990-03-25', 2, '110101199003256789', '13800001018', 'xieln@portal.com', 4, 20, NULL, 6, 1, 1, '2021-06-15', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (19, 'EMP20240019', '冯建国', 'Feng Jianguo', '1979-05-12', 1, '110101197905126789', '13800001019', 'fengjg@portal.com', 5, 21, NULL, 9, 1, 1, '2020-04-15', NULL, NULL, NULL, NULL, '硕士', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `employee` VALUES (20, 'EMP20240020', '邓秀珍', 'Deng Xiuzhen', '1985-08-30', 2, '110101198508306789', '13800001020', 'dengxz@portal.com', 5, 22, NULL, 8, 1, 1, '2020-11-01', NULL, NULL, NULL, NULL, '本科', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);

-- ----------------------------
-- Table structure for employee_attachment
-- ----------------------------
DROP TABLE IF EXISTS `employee_attachment`;
CREATE TABLE `employee_attachment`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '附件ID',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `attachment_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '附件类型',
  `attachment_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '附件名称',
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '原始文件名',
  `file_size` bigint(20) NULL DEFAULT NULL COMMENT '文件大小(bytes)',
  `file_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '文件类型',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '文件存储路径',
  `upload_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `upload_by` bigint(20) NULL DEFAULT NULL COMMENT '上传人',
  `audit_status` tinyint(1) NULL DEFAULT 0 COMMENT '审核状态(0:待审核,1:通过,2:拒绝)',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `audit_by` bigint(20) NULL DEFAULT NULL COMMENT '审核人',
  `audit_remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审核备注',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee`(`employee_id`) USING BTREE,
  INDEX `idx_type`(`attachment_type`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '员工附件表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of employee_attachment
-- ----------------------------

-- ----------------------------
-- Table structure for employee_extend_data
-- ----------------------------
DROP TABLE IF EXISTS `employee_extend_data`;
CREATE TABLE `employee_extend_data`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '扩展数据ID',
  `employee_id` bigint(20) NOT NULL COMMENT '员工ID',
  `config_id` bigint(20) NOT NULL COMMENT '配置ID',
  `data_content` json NOT NULL COMMENT '数据内容(JSON格式)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee`(`employee_id`) USING BTREE,
  INDEX `idx_config`(`config_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '员工扩展数据表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of employee_extend_data
-- ----------------------------

-- ----------------------------
-- Table structure for employee_grade
-- ----------------------------
DROP TABLE IF EXISTS `employee_grade`;
CREATE TABLE `employee_grade`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '等级ID',
  `grade_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '等级编码',
  `grade_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '等级名称',
  `grade_level` tinyint(2) NULL DEFAULT NULL COMMENT '等级级别(1-20)',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '等级描述',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_grade_code`(`grade_code`, `tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '员工等级表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of employee_grade
-- ----------------------------
INSERT INTO `employee_grade` VALUES (1, 'L01', '初级员工', 1, '初级员工等级', 1, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (2, 'L02', '中级员工', 2, '中级员工等级', 2, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (3, 'L03', '高级员工', 3, '高级员工等级', 3, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (4, 'L04', '专家级员工', 4, '专家级员工等级', 4, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (5, 'M01', '初级主管', 5, '初级主管等级', 5, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (6, 'M02', '中级主管', 6, '中级主管等级', 6, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (7, 'M03', '高级主管', 7, '高级主管等级', 7, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (8, 'S01', '初级经理', 8, '初级经理等级', 8, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (9, 'S02', '中级经理', 9, '中级经理等级', 9, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `employee_grade` VALUES (10, 'S03', '高级经理', 10, '高级经理等级', 10, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);

-- ----------------------------
-- Table structure for field_config
-- ----------------------------
DROP TABLE IF EXISTS `field_config`;
CREATE TABLE `field_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `uuid` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'UUID',
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '实体类型(Employee)',
  `config_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置名称',
  `config_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置编码',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '描述',
  `field_definitions` json NULL COMMENT '字段定义(JSON格式)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_entity_code`(`entity_type`, `config_code`, `tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字段配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of field_config
-- ----------------------------
INSERT INTO `field_config` VALUES (1, NULL, 'Employee', '家庭成员', 'family_members', '员工家庭成员信息', '[{\"type\": \"text\", \"field\": \"name\", \"label\": \"姓名\", \"required\": true}, {\"type\": \"select\", \"field\": \"relationship\", \"label\": \"关系\", \"options\": [\"父亲\", \"母亲\", \"配偶\", \"子女\", \"兄弟姐妹\", \"其他\"], \"required\": true}, {\"type\": \"text\", \"field\": \"position\", \"label\": \"职位\", \"required\": false}, {\"type\": \"text\", \"field\": \"company\", \"label\": \"工作单位\", \"required\": false}]', '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `field_config` VALUES (2, NULL, 'Employee', '教育经历', 'education_history', '员工教育经历信息', '[{\"type\": \"text\", \"field\": \"school\", \"label\": \"毕业院校\", \"required\": true}, {\"type\": \"date\", \"field\": \"start_date\", \"label\": \"开始时间\", \"required\": true}, {\"type\": \"date\", \"field\": \"end_date\", \"label\": \"结束时间\", \"required\": true}, {\"type\": \"text\", \"field\": \"major\", \"label\": \"专业\", \"required\": true}, {\"type\": \"text\", \"field\": \"degree\", \"label\": \"学位/证书\", \"required\": false}, {\"type\": \"text\", \"field\": \"referee\", \"label\": \"证明人\", \"required\": false}]', '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);
INSERT INTO `field_config` VALUES (3, NULL, 'Employee', '工作经验', 'work_experience', '员工工作经验信息', '[{\"type\": \"text\", \"field\": \"company\", \"label\": \"公司\", \"required\": true}, {\"type\": \"date\", \"field\": \"start_date\", \"label\": \"开始时间\", \"required\": true}, {\"type\": \"date\", \"field\": \"end_date\", \"label\": \"结束时间\", \"required\": true}, {\"type\": \"text\", \"field\": \"position\", \"label\": \"职务\", \"required\": true}, {\"type\": \"number\", \"field\": \"salary\", \"label\": \"收入\", \"required\": false}, {\"type\": \"text\", \"field\": \"leave_reason\", \"label\": \"离职原因\", \"required\": false}, {\"type\": \"text\", \"field\": \"referee\", \"label\": \"证明人\", \"required\": false}, {\"type\": \"text\", \"field\": \"referee_phone\", \"label\": \"证明人联系电话\", \"required\": false}]', '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default', 0);

-- ----------------------------
-- Table structure for menu_func
-- ----------------------------
DROP TABLE IF EXISTS `menu_func`;
CREATE TABLE `menu_func`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `perm_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限代码',
  `perm_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限名称',
  `perm_type` tinyint(1) NULL DEFAULT 1 COMMENT '权限类型(1按钮,2数据)',
  `menu_page_id` int(11) NULL DEFAULT 0 COMMENT '父权限ID',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图标',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '权限描述',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_perm_code`(`perm_code`, `tenant_id`) USING BTREE,
  INDEX `idx_menu_page_id`(`menu_page_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1042 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '菜单页面功能点表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu_func
-- ----------------------------
INSERT INTO `menu_func` VALUES (1000, 'system:user:view', '查看用户', 1, 11, 1, NULL, '查看用户列表和详情', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1001, 'system:user:add', '新增用户', 1, 11, 2, NULL, '新增系统用户', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1002, 'system:user:edit', '编辑用户', 1, 11, 3, NULL, '编辑用户信息', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1003, 'system:user:delete', '删除用户', 1, 11, 4, NULL, '删除系统用户', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1004, 'system:user:reset-password', '重置密码', 1, 11, 5, NULL, '重置用户密码', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1005, 'system:user:assign-role', '分配角色', 1, 11, 6, NULL, '为用户分配角色', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1006, 'system:user:export', '导出用户', 1, 11, 7, NULL, '导出用户数据', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1007, 'system:user:import', '导入用户', 1, 11, 8, NULL, '导入用户数据', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1008, 'system:role:view', '查看角色', 1, 12, 1, NULL, '查看角色列表和详情', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1009, 'system:role:add', '新增角色', 1, 12, 2, NULL, '新增系统角色', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1010, 'system:role:edit', '编辑角色', 1, 12, 3, NULL, '编辑角色信息', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1011, 'system:role:delete', '删除角色', 1, 12, 4, NULL, '删除系统角色', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1012, 'system:role:assign-permission', '分配权限', 1, 12, 5, NULL, '为角色分配权限', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1013, 'system:role:assign-user', '分配用户', 1, 12, 6, NULL, '为角色分配用户', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1014, 'system:menu:view', '查看菜单', 1, 13, 1, NULL, '查看菜单列表和详情', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1015, 'system:menu:add', '新增菜单', 1, 13, 2, NULL, '新增系统菜单', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1016, 'system:menu:edit', '编辑菜单', 1, 13, 3, NULL, '编辑菜单信息', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1017, 'system:menu:delete', '删除菜单', 1, 13, 4, NULL, '删除系统菜单', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1018, 'system:menu:sort', '菜单排序', 1, 13, 5, NULL, '调整菜单排序', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1019, 'system:menu:export', '导出菜单', 1, 13, 6, NULL, '导出菜单配置', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1020, 'system:permission:view', '查看权限', 1, 14, 1, NULL, '查看权限列表和详情', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1021, 'system:permission:add', '新增权限', 1, 14, 2, NULL, '新增系统权限', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1022, 'system:permission:edit', '编辑权限', 1, 14, 3, NULL, '编辑权限信息', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1023, 'system:permission:delete', '删除权限', 1, 14, 4, NULL, '删除系统权限', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1024, 'system:log:view', '查看日志', 1, 15, 1, NULL, '查看操作日志', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1025, 'system:log:export', '导出日志', 1, 15, 2, NULL, '导出日志数据', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1026, 'system:log:clean', '清理日志', 1, 15, 3, NULL, '清理历史日志', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1027, 'system:log:statistics', '日志统计', 1, 15, 4, NULL, '查看日志统计报表', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1028, 'system:config:view', '查看配置', 1, 16, 1, NULL, '查看系统配置', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1029, 'system:config:edit', '编辑配置', 1, 16, 2, NULL, '编辑系统配置', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1030, 'system:config:cache', '缓存管理', 1, 16, 3, NULL, '管理系统缓存', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1031, 'system:config:backup', '数据备份', 1, 16, 4, NULL, '系统数据备份', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1032, 'system:tenant:view', '查看租户', 1, 17, 1, NULL, '查看租户列表和详情', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1033, 'system:tenant:add', '新增租户', 1, 17, 2, NULL, '新增系统租户', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1034, 'system:tenant:edit', '编辑租户', 1, 17, 3, NULL, '编辑租户信息', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1035, 'system:tenant:delete', '删除租户', 1, 17, 4, NULL, '删除系统租户', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1036, 'system:tenant:enable', '启用租户', 1, 17, 5, NULL, '启用禁用租户', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1037, 'system:tenant:config', '租户配置', 1, 17, 6, NULL, '管理租户配置', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1038, 'system:tenant-config:view', '查看配置', 1, 18, 1, NULL, '查看租户配置', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1039, 'system:tenant-config:edit', '编辑配置', 1, 18, 2, NULL, '编辑租户配置', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1040, 'system:tenant-config:delete', '删除配置', 1, 18, 3, NULL, '删除租户配置', '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_func` VALUES (1041, 'system:tenant-config:export', '导出配置', 1, 18, 4, NULL, '导出租户配置', '2025-06-10 11:08:19', 'default');

-- ----------------------------
-- Table structure for menu_page
-- ----------------------------
DROP TABLE IF EXISTS `menu_page`;
CREATE TABLE `menu_page`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜单名称',
  `parent_id` int(11) NOT NULL DEFAULT 0 COMMENT '父级id',
  `link_url` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '链接功能页面',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '权限描述',
  `image_path` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图片路径',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图标',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` int(11) NULL DEFAULT 0 COMMENT '删除标识',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 100 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '菜单页面表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu_page
-- ----------------------------
INSERT INTO `menu_page` VALUES (1, '工作台', 0, '/dashboard', '系统工作台', NULL, 'dashboard', 1, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (2, '组织架构', 0, '/organization', '组织架构管理', NULL, 'team', 2, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (3, '部门管理', 2, '/organization/department', '部门管理页面', NULL, 'apartment', 1, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (4, '员工管理', 2, '/organization/employee', '员工管理页面', NULL, 'user', 2, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (5, '岗位管理', 2, '/organization/position', '岗位管理页面', NULL, 'contacts', 3, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (6, 'CRM管理', 0, '/crm', 'CRM客户关系管理', NULL, 'user-group', 3, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (7, '客户管理', 6, '/crm/customer', '客户管理页面', NULL, 'contacts', 1, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (8, '产品管理', 0, '/product', '产品管理', NULL, 'box', 4, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (9, '订单管理', 0, '/order', '订单管理', NULL, 'file-text', 5, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (10, '系统管理', 0, '/system', '系统管理', NULL, 'settings', 6, 1, 0, '2025-06-09 23:36:38', 'default');
INSERT INTO `menu_page` VALUES (11, '用户管理', 10, '/system/user', '系统用户管理页面', NULL, 'user', 1, 1, 0, '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_page` VALUES (12, '角色管理', 10, '/system/role', '系统角色管理页面', NULL, 'team', 2, 1, 0, '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_page` VALUES (13, '菜单管理', 10, '/system/menu', '系统菜单管理页面', NULL, 'menu', 3, 1, 0, '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_page` VALUES (14, '权限管理', 10, '/system/permission', '系统权限管理页面', NULL, 'safety-certificate', 4, 1, 0, '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_page` VALUES (15, '操作日志', 10, '/system/log', '系统操作日志页面', NULL, 'history', 5, 1, 0, '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_page` VALUES (16, '系统配置', 10, '/system/config', '系统配置管理页面', NULL, 'tool', 6, 1, 0, '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_page` VALUES (17, '租户管理', 10, '/system/tenant', '租户管理页面', NULL, 'cluster', 7, 1, 0, '2025-06-10 11:08:19', 'default');
INSERT INTO `menu_page` VALUES (18, '租户配置', 10, '/system/tenant-config', '租户配置管理页面', NULL, 'setting', 8, 1, 0, '2025-06-10 11:08:19', 'default');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint(20) NOT NULL COMMENT '角色ID',
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色名称',
  `role_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '角色描述',
  `role_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '角色编码',
  `role_type` tinyint(1) NULL DEFAULT 1 COMMENT '角色类型(1系统角色,2自定义角色)',
  `permissions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '权限配置JSON',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_code`(`role_code`, `tenant_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色组表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, '系统管理员', '系统超级管理员角色', 'ADMIN', 1, NULL, 0, 1, 0, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default');
INSERT INTO `roles` VALUES (2, 'HR管理员', '人力资源管理员角色', 'HR_ADMIN', 1, NULL, 0, 1, 0, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default');
INSERT INTO `roles` VALUES (3, '部门主管', '部门主管角色', 'DEPT_MANAGER', 1, NULL, 0, 1, 0, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default');
INSERT INTO `roles` VALUES (4, '普通员工', '普通员工角色', 'EMPLOYEE', 1, NULL, 0, 1, 0, '2025-06-09 23:36:38', '2025-06-09 23:36:38', 'default');

-- ----------------------------
-- Table structure for tenant
-- ----------------------------
DROP TABLE IF EXISTS `tenant`;
CREATE TABLE `tenant`  (
  `id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '租户ID',
  `tenant_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '租户编码',
  `tenant_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '租户名称',
  `company_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '公司名称',
  `contact_person` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '联系人',
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '联系电话',
  `contact_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '联系邮箱',
  `company_address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '公司地址',
  `logo_url` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Logo地址',
  `domain` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '独立域名',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `expire_time` datetime NULL DEFAULT NULL COMMENT '到期时间',
  `max_users` int(11) NULL DEFAULT 100 COMMENT '最大用户数',
  `max_storage` bigint(20) NULL DEFAULT 10737418240 COMMENT '最大存储空间(字节)',
  `used_storage` bigint(20) NULL DEFAULT 0 COMMENT '已用存储空间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_tenant_code`(`tenant_code`) USING BTREE,
  UNIQUE INDEX `uk_domain`(`domain`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '租户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tenant
-- ----------------------------
INSERT INTO `tenant` VALUES ('default', 'DEFAULT', '默认租户', 'Portal 3.0 Default Tenant', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 100, 10737418240, 0, '2025-06-09 23:36:38', '2025-06-09 23:36:38', NULL);

-- ----------------------------
-- Table structure for tenant_config
-- ----------------------------
DROP TABLE IF EXISTS `tenant_config`;
CREATE TABLE `tenant_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '租户ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置键',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '配置值',
  `config_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'string' COMMENT '配置类型',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '配置描述',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_tenant_config`(`tenant_id`, `config_key`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '租户配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tenant_config
-- ----------------------------

-- ----------------------------
-- Table structure for user_personal_config
-- ----------------------------
DROP TABLE IF EXISTS `user_personal_config`;
CREATE TABLE `user_personal_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `default_position_id` bigint(20) NULL DEFAULT NULL COMMENT '默认岗位ID，当用户有多个岗位时，指定默认登录时展示的岗位',
  `theme` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'light' COMMENT '系统主题配置：light(浅色主题)、dark(深色主题)、auto(跟随系统)',
  `layout_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '布局配置，JSON格式存储，包含侧边栏、顶栏等布局偏好',
  `language` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'zh-CN' COMMENT '语言设置：zh-CN(中文简体)、zh-TW(中文繁体)、en-US(英语)',
  `timezone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'Asia/Shanghai' COMMENT '时区设置',
  `home_page` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '/dashboard' COMMENT '首页设置，登录后默认跳转的页面路径',
  `notification_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '消息通知配置，JSON格式存储各类消息的通知偏好',
  `extend_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '其他扩展配置，JSON格式存储其他个性化设置',
  `enabled` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用',
  `tenant_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_tenant`(`user_id`, `tenant_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_default_position`(`default_position_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户个性化配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_personal_config
-- ----------------------------
INSERT INTO `user_personal_config` VALUES (1, 1, 1, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 1, 1);
INSERT INTO `user_personal_config` VALUES (2, 2, 2, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 2, 2);
INSERT INTO `user_personal_config` VALUES (3, 3, 3, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 3, 3);
INSERT INTO `user_personal_config` VALUES (4, 4, 4, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 4, 4);
INSERT INTO `user_personal_config` VALUES (5, 5, 5, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 5, 5);
INSERT INTO `user_personal_config` VALUES (6, 6, 6, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 6, 6);
INSERT INTO `user_personal_config` VALUES (7, 7, 7, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 7, 7);
INSERT INTO `user_personal_config` VALUES (8, 8, 12, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 8, 8);
INSERT INTO `user_personal_config` VALUES (9, 9, 13, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 9, 9);
INSERT INTO `user_personal_config` VALUES (10, 10, 14, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 10, 10);
INSERT INTO `user_personal_config` VALUES (11, 11, 18, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 11, 11);
INSERT INTO `user_personal_config` VALUES (12, 12, 19, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 12, 12);
INSERT INTO `user_personal_config` VALUES (13, 13, 21, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 13, 13);
INSERT INTO `user_personal_config` VALUES (14, 14, 22, 'light', '{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}', 'zh-CN', 'Asia/Shanghai', '/dashboard', '{\"email\": true, \"push\": true, \"sms\": false}', '{}', 1, 'default', '2025-06-11 23:19:13', '2025-06-11 23:19:13', 14, 14);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录密码',
  `employee_id` int(11) NULL DEFAULT NULL COMMENT '员工ID',
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `head_img_url` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `mobile` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sex` tinyint(1) NULL DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态(1正常,0禁用)',
  `type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户类型',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '公司',
  `open_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'open_id',
  `is_del` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标识',
  `creator_id` int(11) NULL DEFAULT NULL COMMENT '创建人id',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_username`(`username`) USING BTREE,
  INDEX `idx_mobile`(`mobile`) USING BTREE,
  INDEX `idx_open_id`(`open_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '{bcrypt}$2a$10$TtxVJn2ut/IlJqbmkkuR0uoYoqeQX0wVF2t5MDrh.OiACzDymTuxi', 1, '张总', NULL, '13800001001', 1, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (2, 'vp001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 2, '李副总', NULL, '13800001002', 2, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (3, 'cto001', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 3, '王技术总监', NULL, '13800001003', 1, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (4, 'arch001', '$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 4, '陈架构师', NULL, '13800001004', 1, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (5, 'dev001', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 5, '刘开发经理', NULL, '13800001005', 1, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (6, 'dev002', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 6, '赵敏', NULL, '13800001006', 2, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (7, 'dev003', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 7, '周杰', NULL, '13800001007', 1, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (8, 'hr001', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 11, 'HR总监', NULL, '13800001011', 2, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (9, 'hr002', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 12, '招聘经理', NULL, '13800001012', 2, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (10, 'hr003', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 13, '小许', NULL, '13800001013', 2, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (11, 'sales001', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 16, '销售总监', NULL, '13800001016', 1, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (12, 'sales002', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 17, '钟经理', NULL, '13800001017', 1, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (13, 'fin001', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 19, '财务总监', NULL, '13800001019', 1, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');
INSERT INTO `users` VALUES (14, 'fin002', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', 20, '邓会计', NULL, '13800001020', 2, 1, 'app', '2025-06-10 14:58:46', '2025-06-10 14:58:46', NULL, NULL, 0, NULL, 'default');

-- ----------------------------
-- Table structure for workposition
-- ----------------------------
DROP TABLE IF EXISTS `workposition`;
CREATE TABLE `workposition`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '岗位ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '岗位名称',
  `short_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '岗位简写',
  `department_id` bigint(20) NOT NULL COMMENT '所属部门ID',
  `position_level` tinyint(1) NULL DEFAULT 1 COMMENT '岗位级别',
  `job_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '岗位职责描述',
  `requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '任职要求',
  `salary_range` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '薪资范围',
  `max_employees` int(11) NULL DEFAULT 1 COMMENT '最大任职人数',
  `menu_ids` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '菜单页面功能点id集合，用逗号分割',
  `menu_func_ids` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '菜单页面功能点id集合，用逗号分割',
  `is_manager` tinyint(1) NULL DEFAULT 0 COMMENT '是否主管岗位(1是,0否)',
  `is_director` tinyint(1) NULL DEFAULT 0 COMMENT '是否领导岗位(1是,0否)',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE,
  INDEX `idx_status`(`status`, `delflag`) USING BTREE,
  INDEX `idx_pos_tenant_dept`(`tenant_id`, `department_id`, `status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '岗位表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of workposition
-- ----------------------------
INSERT INTO `workposition` VALUES (1, '总经理', '总经理', 1, 1, '负责公司整体战略规划和经营管理', '10年以上管理经验，具备战略思维', '面议', 1, '1,2,3,4,5,6,7,8,9,10', '1,2,3,4,5,6,7,8,9,10,11,12,13', 1, 1, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (2, '副总经理', '副总', 1, 2, '协助总经理管理公司日常经营', '8年以上管理经验', '面议', 2, '1,2,3,4,5,6,7,8,9', '1,2,3,4,5,6,7,8,9,10,11,12', 1, 1, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (3, '技术总监', '技术总监', 2, 1, '负责技术团队管理和技术架构设计', '8年以上技术经验，5年以上管理经验', '30-50万', 1, '1,2,3,4,5,8,10', '1,2,3,4,5,6,7,8,9,10,11,12,13', 1, 1, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (4, '高级架构师', '架构师', 2, 2, '负责系统架构设计和技术选型', '5年以上架构经验', '25-40万', 2, '1,2,8', '1,5,9', 0, 0, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (5, '后端开发经理', '后端经理', 6, 1, '负责后端开发团队管理和项目推进', '5年以上开发经验，3年以上管理经验', '20-35万', 1, '1,2,4,5,8', '1,5,6,7,9,10,11', 1, 0, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (6, '高级后端工程师', '高级后端', 6, 2, '负责核心后端功能开发', '3年以上Java开发经验', '18-30万', 5, '1,8', '1,5,9', 0, 0, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (7, '中级后端工程师', '中级后端', 6, 3, '负责业务功能开发和维护', '1-3年开发经验', '12-20万', 10, '1,8', '1,5,9', 0, 0, 3, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (8, '前端开发经理', '前端经理', 7, 1, '负责前端开发团队管理', '5年以上前端经验，2年以上管理经验', '18-30万', 1, '1,2,4,5,8', '1,5,6,7,9,10,11', 1, 0, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (9, '高级前端工程师', '高级前端', 7, 2, '负责前端架构和核心功能开发', '3年以上前端开发经验', '15-25万', 3, '1,8', '1,5,9', 0, 0, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (10, '测试经理', '测试经理', 8, 1, '负责测试团队管理和质量把控', '5年以上测试经验，2年以上管理经验', '15-25万', 1, '1,2,4,5,8', '1,5,6,7,9,10,11', 1, 0, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (11, '高级测试工程师', '高级测试', 8, 2, '负责测试方案设计和自动化测试', '3年以上测试经验', '12-20万', 3, '1,8', '1,5,9', 0, 0, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (12, 'HR总监', 'HR总监', 3, 1, '负责人力资源战略规划和团队管理', '8年以上HR经验，5年以上管理经验', '25-40万', 1, '1,2,3,4,5', '1,2,3,4,5,6,7,8,9,10,11,12,13', 1, 1, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (13, '招聘经理', '招聘经理', 10, 1, '负责公司招聘工作和人才储备', '5年以上招聘经验', '15-25万', 1, '1,2,4', '1,5,6,7,9', 1, 0, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (14, '招聘专员', '招聘专员', 10, 2, '负责具体招聘执行工作', '2年以上招聘经验', '8-15万', 3, '1,2,4', '1,5,6,7,9', 0, 0, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (15, '薪酬绩效经理', '薪酬经理', 11, 1, '负责薪酬设计和绩效管理', '5年以上薪酬绩效经验', '18-30万', 1, '1,2,4', '1,5,6,7,9', 1, 0, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (16, 'HR专员', 'HR专员', 11, 2, '负责人力资源日常事务处理', '1年以上HR经验', '6-12万', 2, '1,2,4', '1,5,9', 0, 0, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (17, '行政经理', '行政经理', 12, 1, '负责行政管理和后勤服务', '3年以上行政管理经验', '12-20万', 1, '1,2', '1,5,9', 1, 0, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (18, '销售总监', '销售总监', 4, 1, '负责销售团队管理和业绩达成', '8年以上销售经验，5年以上管理经验', '30-50万+提成', 1, '1,6,7,9', '1,5,9', 1, 1, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (19, '销售经理', '销售经理', 4, 2, '负责区域销售管理', '5年以上销售经验，2年以上管理经验', '20-35万+提成', 3, '1,6,7,9', '1,5,9', 1, 0, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (20, '高级销售代表', '高级销售', 4, 3, '负责重要客户维护和新客户开发', '3年以上销售经验', '15-25万+提成', 5, '1,6,7', '1,5,9', 0, 0, 3, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (21, '财务总监', '财务总监', 5, 1, '负责财务管理和风险控制', '8年以上财务经验，CPA资格', '25-40万', 1, '1,2,4,9,10', '1,5,9', 1, 1, 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (22, '财务经理', '财务经理', 5, 2, '负责财务核算和报表管理', '5年以上财务经验', '15-25万', 1, '1,9', '1,5,9', 1, 0, 2, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);
INSERT INTO `workposition` VALUES (23, '会计', '会计', 5, 3, '负责日常财务核算工作', '2年以上会计经验', '8-15万', 2, '1,9', '1,5,9', 0, 0, 3, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL);

-- ----------------------------
-- Table structure for workposition_manage_dept
-- ----------------------------
DROP TABLE IF EXISTS `workposition_manage_dept`;
CREATE TABLE `workposition_manage_dept`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `workposition_id` bigint(20) NOT NULL COMMENT '岗位ID',
  `department_id` bigint(20) NOT NULL COMMENT '分管部门ID',
  `manage_type` tinyint(1) NULL DEFAULT 1 COMMENT '分管类型(1直管,2协管)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_wp_dept`(`workposition_id`, `department_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '岗位分管部门表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of workposition_manage_dept
-- ----------------------------
INSERT INTO `workposition_manage_dept` VALUES (1, 1, 2, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (2, 1, 3, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (3, 1, 4, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (4, 1, 5, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (5, 2, 2, 2, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (6, 2, 3, 2, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (7, 2, 4, 2, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (8, 3, 6, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (9, 3, 7, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (10, 3, 8, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (11, 3, 9, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (12, 5, 6, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (13, 8, 7, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (14, 10, 8, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (15, 13, 10, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (16, 15, 11, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (17, 17, 12, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (18, 19, 4, 1, '2025-06-10 14:58:46', NULL, 'default');
INSERT INTO `workposition_manage_dept` VALUES (19, 22, 5, 1, '2025-06-10 14:58:46', NULL, 'default');

SET FOREIGN_KEY_CHECKS = 1;
