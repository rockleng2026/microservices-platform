/*
 Navicat Premium Data Transfer

 Source Server         : 127.0.0.1
 Source Server Type    : MySQL
 Source Server Version : 50744
 Source Host           : localhost:3306
 Source Schema         : multi_table_system

 Target Server Type    : MySQL
 Target Server Version : 50744
 File Encoding         : 65001

 Date: 17/06/2025 15:30:58
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for mt_app_space
-- ----------------------------
DROP TABLE IF EXISTS `mt_app_space`;
CREATE TABLE `mt_app_space`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '应用空间ID，主键',
  `uni_code` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '应用空间编码，唯一键',
  `tenant_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属租户ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '应用空间名称-创建表格默认创建应用空间和对应一条表格数据',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '应用空间',
  `team_id` bigint(20) NULL DEFAULT NULL COMMENT '所属团队ID',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '表格图标',
  `color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '表格颜色（十六进制）',
  `created_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `table_count` int(11) NOT NULL DEFAULT 0 COMMENT '表格数量',
  `view_count` int(11) NOT NULL DEFAULT 0 COMMENT '视图数量',
  `is_template` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否模板：1=是，0=否',
  `template_category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '模板分类',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=正常，0=删除',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_team`(`team_id`) USING BTREE,
  INDEX `idx_code`(`uni_code`) USING BTREE,
  INDEX `idx_creator`(`created_by`) USING BTREE,
  INDEX `idx_template`(`is_template`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '表格应用空间信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of mt_app_space
-- ----------------------------
INSERT INTO `mt_app_space` VALUES (1, 'Q4Aub0W40axbTusDZ34cBIEEnAf', 'default', '员工问卷调查表', '问卷调查表', 101, NULL, NULL, 1, 0, 0, 0, NULL, 1, '2025-06-17 15:14:26', '2025-06-17 15:14:26');

SET FOREIGN_KEY_CHECKS = 1;
