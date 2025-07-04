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

 Date: 13/06/2025 17:49:49
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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

SET FOREIGN_KEY_CHECKS = 1;
