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

 Date: 25/06/2025 05:31:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1933203349172219905 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '部门表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of department
-- ----------------------------
INSERT INTO `department` VALUES (1, 'Portal科技公司', NULL, 0, 'HQ001', 1, NULL, NULL, NULL, NULL, NULL, '公司总部', 1, 1, 0, '2025-06-10 14:58:46', '2025-06-10 14:58:46', 'default', NULL, NULL);
INSERT INTO `department` VALUES (2, '技术研发部1', 3, 1, 'RD001', 2, NULL, NULL, NULL, '18612345678', 'xxxxxxx2', '负责产品技术研发和创新2', 1, 1, 0, '2025-06-10 14:58:46', '2025-06-12 23:36:34', 'default', NULL, NULL);
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
INSERT INTO `department` VALUES (13, '运维A组', NULL, 9, 'RD111', 4, NULL, NULL, NULL, '18612345624', 'xxxxxx32', '负责外部运维4444', 1, 1, 1, '2025-06-12 22:52:45', '2025-06-13 01:05:08', 'default', NULL, NULL);
INSERT INTO `department` VALUES (1933186684942409728, '党建一体机部4', NULL, 2, 'RD0011', 3, NULL, NULL, NULL, '18612345674', 'xxxxxxx4', '党建一体机部测试4', 0, 1, 0, '2025-06-12 23:36:37', '2025-06-13 00:13:11', 'default', NULL, NULL);
INSERT INTO `department` VALUES (1933203349172219904, 'TEST', NULL, 2, 'TEST', 3, NULL, NULL, NULL, '18612345612', 'xxxxxxx4', 'SADFASDFASDF', 0, 1, 0, '2025-06-13 00:42:50', '2025-06-13 00:42:50', 'default', NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
