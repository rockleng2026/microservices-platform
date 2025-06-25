/*
 Navicat Premium Data Transfer

 Source Server         : 127.0.0.1
 Source Server Type    : MySQL
 Source Server Version : 50744
 Source Host           : localhost:3306
 Source Schema         : central_project

 Target Server Type    : MySQL
 Target Server Version : 50744
 File Encoding         : 65001

 Date: 25/06/2025 22:53:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for product_profit_distribution_guide
-- ----------------------------
DROP TABLE IF EXISTS `product_profit_distribution_guide`;
CREATE TABLE `product_profit_distribution_guide`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '产品名称（如党建项目、IDC项目等）',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '参与角色（如销售、技术、产品经理等）',
  `commission_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '提成类型（比例/金额）',
  `value_range` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '数值范围（如1-5、500-10000）',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '修改人ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_product`(`product_name`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1937416375161171980 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '产品毛利分配指导表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_profit_distribution_guide
-- ----------------------------
INSERT INTO `product_profit_distribution_guide` VALUES (1, '党建项目', '销售', 'ratio', '10-20', 'default', NULL, 1, '2025-06-24 11:49:07', '2025-06-24 15:44:10', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (2, '党建项目', '技术', '比例', '2-3', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (3, '党建项目', '产品经理', '比例', '1-2', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (4, 'IDC项目', '销售', '比例', '2-4', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (5, 'IDC项目', '技术', '比例', '3-5', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (6, 'IDC项目', '运维', '比例', '2-3', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (7, '软件项目', '销售', '比例', '2-3', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (8, '软件项目', '技术', '比例', '4-6', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (9, '软件项目', '产品经理', '比例', '2-3', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (10, '软件项目', '售前', '金额', '500-2000', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (11, '软件项目', '售后', '金额', '300-1000', 'default', NULL, NULL, '2025-06-24 11:49:07', '2025-06-24 11:49:07', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171968, '党建项目', '售后', 'ratio', '1-3', 'default', 1, 1, '2025-06-24 15:43:54', '2025-06-24 15:43:54', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171969, '党建项目', '销售', '比例', '30-50', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171970, '党建项目', '技术', '比例', '20-30', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171971, '党建项目', '产品经理', '比例', '15-25', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171972, '党建项目', '售前', '比例', '10-20', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171973, 'IDC项目', '销售', '比例', '40-60', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171974, 'IDC项目', '技术', '比例', '25-35', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171975, 'IDC项目', '产品经理', '比例', '15-25', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171976, '软件项目', '销售', '比例', '25-40', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171977, '软件项目', '技术', '比例', '30-45', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171978, '软件项目', '产品经理', '比例', '20-30', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);
INSERT INTO `product_profit_distribution_guide` VALUES (1937416375161171979, '软件项目', '运维', '比例', '10-20', 'default', 1, 1, '2025-06-25 03:46:41', '2025-06-25 03:46:41', 0);

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '项目名称',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目类别（如党建、IDC、软件等）',
  `participants` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '参与人列表（JSON数组，存员工ID及角色）',
  `leader_id` bigint(20) NULL DEFAULT NULL COMMENT '项目负责人ID',
  `max_distribution` float NULL DEFAULT NULL COMMENT '最大分配比例默认50%即0.5',
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '项目客户名称',
  `customer_contact` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目客户代表',
  `start_time` datetime NULL DEFAULT NULL COMMENT '立项时间',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'init' COMMENT '项目状态（如init、running、closed等）',
  `profit_distribution_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目提成分配状态(not_set:未设置，awaiting_approval:待审批,in_approval：审批中,approved:审批通过,approval_failed:审批失败,partially_settled部分计提，Settled：已计提完毕)',
  `process_instance_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '流程实例ID',
  `final_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最终审批状态（如approved、rejected等）',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '修改人ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_leader`(`leader_id`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE,
  INDEX `idx_proc`(`process_instance_id`) USING BTREE,
  INDEX `idx_profit_distribution_status`(`profit_distribution_status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1937591119709835265 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project
-- ----------------------------
INSERT INTO `project` VALUES (1, '智慧党建管理平台', '党建项目', '[{\"participantId\": 1001, \"role\": \"销售\"}, {\"participantId\": 1002, \"role\": \"技术\"}, {\"participantId\": 1003, \"role\": \"产品经理\"}]', 1001, NULL, '某县委组织部', '张主任', '2024-01-15 09:00:00', 'running', 'not_set', NULL, 'approved', 'default', 1001, 1001, '2024-01-15 09:00:00', '2025-06-25 18:53:21', 0);
INSERT INTO `project` VALUES (2, '数据中心机房建设项目', 'IDC项目', '[{\"participantId\": 1002, \"role\": \"销售\"}, {\"participantId\": 1004, \"role\": \"技术\"}, {\"participantId\": 1005, \"role\": \"运维\"}]', 1002, NULL, '某科技有限公司', '李经理', '2024-02-01 10:00:00', 'running', 'not_set', NULL, 'approved', 'default', 1002, 1002, '2024-02-01 10:00:00', '2025-06-25 18:53:19', 0);
INSERT INTO `project` VALUES (3, 'ERP系统开发项目', '软件项目', '[{\"participantId\": 1003, \"role\": \"销售\"}, {\"participantId\": 1006, \"role\": \"技术\"}, {\"participantId\": 1007, \"role\": \"产品经理\"}, {\"participantId\": 1008, \"role\": \"售前\"}]', 1003, NULL, '某制造企业', '王总', '2024-02-15 14:00:00', 'init', 'not_set', NULL, 'pending', 'default', 1003, 1003, '2024-02-15 14:00:00', '2025-06-25 18:53:17', 0);
INSERT INTO `project` VALUES (4, '智慧城市管理系统', '软件项目', '[{\"participantId\": 1004, \"role\": \"销售\"}, {\"participantId\": 1009, \"role\": \"技术\"}, {\"participantId\": 1010, \"role\": \"产品经理\"}, {\"participantId\": 1011, \"role\": \"售后\"}]', 1004, NULL, '某市政府', '陈局长', '2024-03-01 09:30:00', 'closed', 'not_set', NULL, 'approved', 'default', 1004, 1004, '2024-03-01 09:30:00', '2025-06-25 18:53:15', 0);
INSERT INTO `project` VALUES (5, '党建-福建代理商', '党建项目', '[{\"participantId\": 1005, \"role\": \"销售\"}, {\"participantId\": 1012, \"role\": \"技术\"}, {\"participantId\": 1013, \"role\": \"产品经理\"}]', 26, 0.5, '某集团公司', '刘总监', '2025-06-25 08:00:00', 'closed', 'awaiting_approval', NULL, 'approved', 'default', 1005, 1, '2024-03-15 16:00:00', '2025-06-25 19:03:31', 0);
INSERT INTO `project` VALUES (1937591119709835264, '党建-成都代理商1', '党建项目', NULL, 15, 0.5, '海天集团', '王海明王总', '2025-06-25 08:00:00', 'closed', 'awaiting_approval', NULL, NULL, 'default', 1, 1, '2025-06-25 03:18:16', '2025-06-25 19:05:37', 0);

-- ----------------------------
-- Table structure for project_closure
-- ----------------------------
DROP TABLE IF EXISTS `project_closure`;
CREATE TABLE `project_closure`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(20) NOT NULL COMMENT '项目ID',
  `closure_time` datetime NULL DEFAULT NULL COMMENT '结项时间',
  `contract_amount` decimal(18, 2) NULL DEFAULT NULL COMMENT '项目合同金额',
  `actual_amount` decimal(18, 2) NULL DEFAULT NULL COMMENT '项目实际金额',
  `gross_profit` decimal(18, 2) NULL DEFAULT NULL COMMENT '项目毛利润',
  `gross_profit_rate` decimal(5, 2) NULL DEFAULT NULL COMMENT '毛利率（%）',
  `process_instance_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '流程实例ID',
  `final_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最终审批状态',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '修改人ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project`(`project_id`) USING BTREE,
  INDEX `idx_proc`(`process_instance_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目结项表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_closure
-- ----------------------------
INSERT INTO `project_closure` VALUES (1, 4, '2024-05-20 17:00:00', 1200000.00, 1150000.00, 460000.00, 40.00, NULL, 'approved', 'default', 1004, 1004, '2024-05-20 17:00:00', '2024-05-20 17:00:00', 0);
INSERT INTO `project_closure` VALUES (2, 1937591119709835264, '2025-06-25 04:16:28', 1000000.00, 900000.00, 90000.00, 10.00, NULL, NULL, 'default', 1, 1, '2025-06-25 04:16:49', '2025-06-25 04:16:49', 0);
INSERT INTO `project_closure` VALUES (3, 5, '2025-06-25 16:23:39', 200000.00, 200000.00, 200000.00, 100.00, NULL, NULL, 'default', 1, 1, '2025-06-25 16:24:03', '2025-06-25 16:24:03', 0);

-- ----------------------------
-- Table structure for project_detail
-- ----------------------------
DROP TABLE IF EXISTS `project_detail`;
CREATE TABLE `project_detail`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(20) NOT NULL COMMENT '项目ID',
  `participant_id` bigint(20) NOT NULL COMMENT '参与人ID（员工ID）',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '项目角色',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '修改人ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project`(`project_id`) USING BTREE,
  INDEX `idx_participant`(`participant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1937594591628759041 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目明细表，记录项目参与人及角色' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_detail
-- ----------------------------
INSERT INTO `project_detail` VALUES (1, 1, 1001, '销售', 'default', 1001, 1001, '2024-01-15 09:00:00', '2024-01-15 09:00:00', 0);
INSERT INTO `project_detail` VALUES (2, 1, 1002, '技术', 'default', 1001, 1001, '2024-01-15 09:00:00', '2024-01-15 09:00:00', 0);
INSERT INTO `project_detail` VALUES (3, 1, 1003, '产品经理', 'default', 1001, 1001, '2024-01-15 09:00:00', '2024-01-15 09:00:00', 0);
INSERT INTO `project_detail` VALUES (4, 2, 1002, '销售', 'default', 1002, 1002, '2024-02-01 10:00:00', '2024-02-01 10:00:00', 0);
INSERT INTO `project_detail` VALUES (5, 2, 1004, '技术', 'default', 1002, 1002, '2024-02-01 10:00:00', '2024-02-01 10:00:00', 0);
INSERT INTO `project_detail` VALUES (6, 2, 1005, '运维', 'default', 1002, 1002, '2024-02-01 10:00:00', '2024-02-01 10:00:00', 0);
INSERT INTO `project_detail` VALUES (7, 3, 1003, '销售', 'default', 1003, 1003, '2024-02-15 14:00:00', '2024-02-15 14:00:00', 0);
INSERT INTO `project_detail` VALUES (8, 3, 1006, '技术', 'default', 1003, 1003, '2024-02-15 14:00:00', '2024-02-15 14:00:00', 0);
INSERT INTO `project_detail` VALUES (9, 3, 1007, '产品经理', 'default', 1003, 1003, '2024-02-15 14:00:00', '2024-02-15 14:00:00', 0);
INSERT INTO `project_detail` VALUES (10, 3, 1008, '售前', 'default', 1003, 1003, '2024-02-15 14:00:00', '2024-02-15 14:00:00', 0);
INSERT INTO `project_detail` VALUES (11, 4, 1004, '销售', 'default', 1004, 1004, '2024-03-01 09:30:00', '2024-03-01 09:30:00', 0);
INSERT INTO `project_detail` VALUES (12, 4, 1009, '技术', 'default', 1004, 1004, '2024-03-01 09:30:00', '2024-03-01 09:30:00', 0);
INSERT INTO `project_detail` VALUES (13, 4, 1010, '产品经理', 'default', 1004, 1004, '2024-03-01 09:30:00', '2024-03-01 09:30:00', 0);
INSERT INTO `project_detail` VALUES (14, 4, 1011, '售后', 'default', 1004, 1004, '2024-03-01 09:30:00', '2024-03-01 09:30:00', 0);
INSERT INTO `project_detail` VALUES (15, 5, 1005, '销售', 'default', 1005, 1, '2024-03-15 16:00:00', '2025-06-24 23:45:32', 1);
INSERT INTO `project_detail` VALUES (16, 5, 1012, '技术', 'default', 1005, 1, '2024-03-15 16:00:00', '2025-06-24 23:45:32', 1);
INSERT INTO `project_detail` VALUES (17, 5, 1013, '产品经理', 'default', 1005, 1, '2024-03-15 16:00:00', '2025-06-24 23:45:32', 1);
INSERT INTO `project_detail` VALUES (1937537584406208512, 5, 15, '销售', 'default', 1, 1, '2025-06-24 23:45:32', '2025-06-24 23:46:55', 1);
INSERT INTO `project_detail` VALUES (1937537584439762944, 5, 13, '产品经理', 'default', 1, 1, '2025-06-24 23:45:32', '2025-06-24 23:46:55', 1);
INSERT INTO `project_detail` VALUES (1937537584473317376, 5, 18, '技术', 'default', 1, 1, '2025-06-24 23:45:32', '2025-06-24 23:46:55', 1);
INSERT INTO `project_detail` VALUES (1937537929563873280, 5, 15, '销售', 'default', 1, 1, '2025-06-24 23:46:55', '2025-06-25 00:03:03', 1);
INSERT INTO `project_detail` VALUES (1937537929572261888, 5, 13, '售前', 'default', 1, 1, '2025-06-24 23:46:55', '2025-06-25 00:03:03', 1);
INSERT INTO `project_detail` VALUES (1937537929584844800, 5, 18, '产品经理', 'default', 1, 1, '2025-06-24 23:46:55', '2025-06-25 00:03:03', 1);
INSERT INTO `project_detail` VALUES (1937541993353732096, 5, 15, '销售', 'default', 1, 1, '2025-06-25 00:03:03', '2025-06-25 00:09:21', 1);
INSERT INTO `project_detail` VALUES (1937541993391480832, 5, 13, '技术', 'default', 1, 1, '2025-06-25 00:03:03', '2025-06-25 00:09:21', 1);
INSERT INTO `project_detail` VALUES (1937541993433423872, 5, 18, '产品经理', 'default', 1, 1, '2025-06-25 00:03:03', '2025-06-25 00:09:21', 1);
INSERT INTO `project_detail` VALUES (1937543576053374976, 5, 15, '销售', 'default', 1, 1, '2025-06-25 00:09:21', '2025-06-25 00:13:24', 1);
INSERT INTO `project_detail` VALUES (1937543576061763584, 5, 13, '技术', 'default', 1, 1, '2025-06-25 00:09:21', '2025-06-25 00:13:24', 1);
INSERT INTO `project_detail` VALUES (1937543576074346496, 5, 15, '产品经理', 'default', 1, 1, '2025-06-25 00:09:21', '2025-06-25 00:13:24', 1);
INSERT INTO `project_detail` VALUES (1937544594791157760, 5, 15, '销售', 'default', 1, 1, '2025-06-25 00:13:24', '2025-06-25 00:29:51', 1);
INSERT INTO `project_detail` VALUES (1937544594812129280, 5, 13, '技术', 'default', 1, 1, '2025-06-25 00:13:24', '2025-06-25 00:29:51', 1);
INSERT INTO `project_detail` VALUES (1937544594828906496, 5, 18, '产品经理', 'default', 1, 1, '2025-06-25 00:13:24', '2025-06-25 00:29:51', 1);
INSERT INTO `project_detail` VALUES (1937544594828906497, 5, 15, '销售', 'default', 1, 1, '2025-06-25 00:29:51', '2025-06-25 00:41:41', 1);
INSERT INTO `project_detail` VALUES (1937544594828906498, 5, 13, '技术', 'default', 1, 1, '2025-06-25 00:29:51', '2025-06-25 00:41:41', 1);
INSERT INTO `project_detail` VALUES (1937544594828906499, 5, 18, '产品经理', 'default', 1, 1, '2025-06-25 00:29:51', '2025-06-25 00:41:41', 1);
INSERT INTO `project_detail` VALUES (1937544594828906500, 5, 15, '销售', 'default', 1, 1, '2025-06-25 00:41:41', '2025-06-25 01:22:12', 1);
INSERT INTO `project_detail` VALUES (1937544594828906501, 5, 13, '技术', 'default', 1, 1, '2025-06-25 00:41:41', '2025-06-25 01:22:12', 1);
INSERT INTO `project_detail` VALUES (1937544594828906502, 5, 18, '产品经理', 'default', 1, 1, '2025-06-25 00:41:41', '2025-06-25 01:22:12', 1);
INSERT INTO `project_detail` VALUES (1937544594828906503, 5, 15, '销售', 'default', 1, 1, '2025-06-25 01:22:12', '2025-06-25 01:34:31', 1);
INSERT INTO `project_detail` VALUES (1937544594828906504, 5, 13, '技术', 'default', 1, 1, '2025-06-25 01:22:12', '2025-06-25 01:34:31', 1);
INSERT INTO `project_detail` VALUES (1937544594828906505, 5, 9, '产品经理', 'default', 1, 1, '2025-06-25 01:22:12', '2025-06-25 01:34:31', 1);
INSERT INTO `project_detail` VALUES (1937544594828906506, 5, 15, '销售', 'default', 1, 1, '2025-06-25 01:34:31', '2025-06-25 01:37:54', 1);
INSERT INTO `project_detail` VALUES (1937544594828906507, 5, 13, '技术', 'default', 1, 1, '2025-06-25 01:34:31', '2025-06-25 01:37:54', 1);
INSERT INTO `project_detail` VALUES (1937544594828906508, 5, 9, '产品经理', 'default', 1, 1, '2025-06-25 01:34:31', '2025-06-25 01:37:54', 1);
INSERT INTO `project_detail` VALUES (1937544594828906509, 5, 15, '销售', 'default', 1, 1, '2025-06-25 01:37:54', '2025-06-25 01:43:24', 1);
INSERT INTO `project_detail` VALUES (1937544594828906510, 5, 13, '技术', 'default', 1, 1, '2025-06-25 01:37:54', '2025-06-25 01:43:24', 1);
INSERT INTO `project_detail` VALUES (1937544594828906511, 5, 9, '产品经理', 'default', 1, 1, '2025-06-25 01:37:54', '2025-06-25 01:43:24', 1);
INSERT INTO `project_detail` VALUES (1937544594828906512, 5, 15, '销售', 'default', 1, 1, '2025-06-25 01:43:24', '2025-06-25 01:43:24', 0);
INSERT INTO `project_detail` VALUES (1937544594828906513, 5, 13, '技术', 'default', 1, 1, '2025-06-25 01:43:24', '2025-06-25 01:43:24', 0);
INSERT INTO `project_detail` VALUES (1937544594828906514, 5, 9, '产品经理', 'default', 1, 1, '2025-06-25 01:43:24', '2025-06-25 01:43:24', 0);
INSERT INTO `project_detail` VALUES (1937544594828906515, 1937591119709835264, 15, '产品经理', 'default', 1, 1, '2025-06-25 03:18:16', '2025-06-25 03:25:31', 1);
INSERT INTO `project_detail` VALUES (1937544594828906516, 1937591119709835264, 18, '技术', 'default', 1, 1, '2025-06-25 03:18:16', '2025-06-25 03:25:31', 1);
INSERT INTO `project_detail` VALUES (1937544594828906517, 1937591119709835264, 15, '产品经理', 'default', 1, 1, '2025-06-25 03:25:31', '2025-06-25 03:25:31', 0);
INSERT INTO `project_detail` VALUES (1937544594828906518, 1937591119709835264, 18, '技术', 'default', 1, 1, '2025-06-25 03:25:31', '2025-06-25 03:25:31', 0);
INSERT INTO `project_detail` VALUES (1937544594828906519, 1937591119709835264, 18, '售后', 'default', 1, 1, '2025-06-25 03:25:31', '2025-06-25 03:25:31', 0);
INSERT INTO `project_detail` VALUES (1937593379944665088, 1937591119709835264, 7, '技术', 'default', 1, 1, '2025-06-25 03:27:15', '2025-06-25 03:27:15', 0);
INSERT INTO `project_detail` VALUES (1937594591628759040, 5, 14, '运维', 'default', 1, 1, '2025-06-25 03:32:04', '2025-06-25 03:32:04', 0);

-- ----------------------------
-- Table structure for project_profit_distribution
-- ----------------------------
DROP TABLE IF EXISTS `project_profit_distribution`;
CREATE TABLE `project_profit_distribution`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(20) NOT NULL COMMENT '项目ID',
  `guide_id` bigint(20) NULL DEFAULT NULL COMMENT '产品毛利分配指导表ID',
  `dept_id` bigint(20) NULL DEFAULT NULL COMMENT '分配部门ID',
  `employee_id` bigint(20) NULL DEFAULT NULL COMMENT '分配员工ID',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分配角色',
  `distribution_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分配形式（比例/金额）',
  `distribution_value` decimal(10, 2) NOT NULL COMMENT '分配数值',
  `process_instance_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '流程实例ID',
  `final_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最终审批状态',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '修改人ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project`(`project_id`) USING BTREE,
  INDEX `idx_employee`(`employee_id`) USING BTREE,
  INDEX `idx_proc`(`process_instance_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 43 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目人员毛利分配表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_profit_distribution
-- ----------------------------
INSERT INTO `project_profit_distribution` VALUES (1, 1, 1, NULL, 1001, '销售', '比例', 4.00, NULL, 'approved', 'default', 1001, 1001, '2024-01-15 10:00:00', '2024-01-15 10:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (2, 1, 2, NULL, 1002, '技术', '比例', 2.50, NULL, 'approved', 'default', 1001, 1001, '2024-01-15 10:00:00', '2024-01-15 10:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (3, 1, 3, NULL, 1003, '产品经理', '比例', 1.50, NULL, 'approved', 'default', 1001, 1001, '2024-01-15 10:00:00', '2024-01-15 10:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (4, 2, 4, NULL, 1002, '销售', '比例', 3.00, NULL, 'approved', 'default', 1002, 1002, '2024-02-01 11:00:00', '2024-02-01 11:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (5, 2, 5, NULL, 1004, '技术', '比例', 4.00, NULL, 'approved', 'default', 1002, 1002, '2024-02-01 11:00:00', '2024-02-01 11:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (6, 2, 6, NULL, 1005, '运维', '比例', 2.50, NULL, 'approved', 'default', 1002, 1002, '2024-02-01 11:00:00', '2024-02-01 11:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (7, 3, 7, NULL, 1003, '销售', '比例', 2.50, NULL, 'pending', 'default', 1003, 1003, '2024-02-15 15:00:00', '2024-02-15 15:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (8, 3, 8, NULL, 1006, '技术', '比例', 5.00, NULL, 'pending', 'default', 1003, 1003, '2024-02-15 15:00:00', '2024-02-15 15:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (9, 3, 9, NULL, 1007, '产品经理', '比例', 2.00, NULL, 'pending', 'default', 1003, 1003, '2024-02-15 15:00:00', '2024-02-15 15:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (10, 3, 10, NULL, 1008, '售前', '金额', 1500.00, NULL, 'pending', 'default', 1003, 1003, '2024-02-15 15:00:00', '2024-02-15 15:00:00', 0);
INSERT INTO `project_profit_distribution` VALUES (11, 4, 7, NULL, 1004, '销售', '比例', 2.50, NULL, 'approved', 'default', 1004, 1004, '2024-03-01 10:30:00', '2024-03-01 10:30:00', 0);
INSERT INTO `project_profit_distribution` VALUES (12, 4, 8, NULL, 1009, '技术', '比例', 5.50, NULL, 'approved', 'default', 1004, 1004, '2024-03-01 10:30:00', '2024-03-01 10:30:00', 0);
INSERT INTO `project_profit_distribution` VALUES (13, 4, 9, NULL, 1010, '产品经理', '比例', 2.50, NULL, 'approved', 'default', 1004, 1004, '2024-03-01 10:30:00', '2024-03-01 10:30:00', 0);
INSERT INTO `project_profit_distribution` VALUES (14, 4, 11, NULL, 1011, '售后', '金额', 800.00, NULL, 'approved', 'default', 1004, 1004, '2024-03-01 10:30:00', '2024-03-01 10:30:00', 0);
INSERT INTO `project_profit_distribution` VALUES (15, 5, 7, NULL, 1005, '销售', '比例', 2.50, NULL, 'approved', 'default', 1005, 1005, '2024-03-15 17:00:00', '2025-06-25 19:03:31', 1);
INSERT INTO `project_profit_distribution` VALUES (16, 5, 8, NULL, 1012, '技术', '比例', 5.00, NULL, 'approved', 'default', 1005, 1005, '2024-03-15 17:00:00', '2025-06-25 19:03:31', 1);
INSERT INTO `project_profit_distribution` VALUES (17, 5, 9, NULL, 1013, '产品经理', '比例', 2.00, NULL, 'approved', 'default', 1005, 1005, '2024-03-15 17:00:00', '2025-06-25 19:03:31', 1);
INSERT INTO `project_profit_distribution` VALUES (30, 5, NULL, 2, NULL, '部门分配', '比例', 20.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:03:31', '2025-06-25 19:03:31', 0);
INSERT INTO `project_profit_distribution` VALUES (31, 5, NULL, 2, 9, '员工分配', '比例', 10.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:03:31', '2025-06-25 19:03:31', 0);
INSERT INTO `project_profit_distribution` VALUES (32, 5, NULL, 2, 26, '员工分配', '比例', 9.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:03:31', '2025-06-25 19:03:31', 0);
INSERT INTO `project_profit_distribution` VALUES (33, 5, NULL, 3, NULL, '部门分配', '比例', 70.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:03:31', '2025-06-25 19:03:31', 0);
INSERT INTO `project_profit_distribution` VALUES (34, 5, NULL, 3, 13, '员工分配', '比例', 40.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:03:31', '2025-06-25 19:03:31', 0);
INSERT INTO `project_profit_distribution` VALUES (35, 5, NULL, 3, 14, '员工分配', '比例', 10.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:03:31', '2025-06-25 19:03:31', 0);
INSERT INTO `project_profit_distribution` VALUES (36, 5, NULL, 3, 15, '员工分配', '比例', 5.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:03:31', '2025-06-25 19:03:31', 0);
INSERT INTO `project_profit_distribution` VALUES (37, 1937591119709835264, NULL, 2, NULL, '部门分配', '比例', 10.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:05:37', '2025-06-25 19:05:37', 0);
INSERT INTO `project_profit_distribution` VALUES (38, 1937591119709835264, NULL, 2, 7, '员工分配', '比例', 8.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:05:37', '2025-06-25 19:05:37', 0);
INSERT INTO `project_profit_distribution` VALUES (39, 1937591119709835264, NULL, 4, NULL, '部门分配', '比例', 70.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:05:37', '2025-06-25 19:05:37', 0);
INSERT INTO `project_profit_distribution` VALUES (40, 1937591119709835264, NULL, 4, 18, '员工分配', '比例', 23.10, NULL, NULL, 'default', 1, 1, '2025-06-25 19:05:37', '2025-06-25 19:05:37', 0);
INSERT INTO `project_profit_distribution` VALUES (41, 1937591119709835264, NULL, 3, NULL, '部门分配', '比例', 20.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:05:37', '2025-06-25 19:05:37', 0);
INSERT INTO `project_profit_distribution` VALUES (42, 1937591119709835264, NULL, 3, 15, '员工分配', '比例', 10.00, NULL, NULL, 'default', 1, 1, '2025-06-25 19:05:37', '2025-06-25 19:05:37', 0);

-- ----------------------------
-- Table structure for project_profit_distribution_adjustment
-- ----------------------------
DROP TABLE IF EXISTS `project_profit_distribution_adjustment`;
CREATE TABLE `project_profit_distribution_adjustment`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `profit_distribution_id` bigint(20) NOT NULL COMMENT '项目人员毛利分配表ID',
  `apply_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '调整申请原因',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'pending' COMMENT '调整审批状态',
  `process_instance_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '流程实例ID',
  `final_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最终审批状态',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '修改人ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_profit`(`profit_distribution_id`) USING BTREE,
  INDEX `idx_proc`(`process_instance_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目人员毛利分配调整表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_profit_distribution_adjustment
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
