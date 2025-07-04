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

 Date: 04/07/2025 20:59:32
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_dict_category
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_category`;
CREATE TABLE `sys_dict_category`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类目名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类目编码（英文唯一标识）',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '描述信息',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '状态（0=禁用, 1=启用）',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  `extend_schema` json NULL COMMENT '扩展字段JSON结构（冗余字段，优化查询）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字典类目表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dict_category
-- ----------------------------
INSERT INTO `sys_dict_category` VALUES (1, '性别', 'GENDER', '性别分类', 1, '2025-07-04 18:06:22', '2025-07-04 18:06:22', NULL, NULL, NULL);
INSERT INTO `sys_dict_category` VALUES (2, '项目阶段', 'PROJECT_PHASE', '项目生命周期阶段', 1, '2025-07-04 20:46:22', '2025-07-04 20:46:22', NULL, NULL, '[{\"required\": true, \"field_code\": \"percent\", \"field_name\": \"进度百分比\", \"field_type\": \"number\", \"default_value\": \"0\"}, {\"required\": false, \"field_code\": \"owner_role\", \"field_name\": \"负责人角色\", \"field_type\": \"string\"}]');
INSERT INTO `sys_dict_category` VALUES (3, '优先级', 'PRIORITY', '任务优先级分类', 1, '2025-07-04 20:47:10', '2025-07-04 20:47:10', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for sys_dict_extend_field
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_extend_field`;
CREATE TABLE `sys_dict_extend_field`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `category_id` bigint(20) NOT NULL COMMENT '关联的字典类目ID',
  `field_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '扩展字段编码（英文标识，同一类目下唯一）',
  `field_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '扩展字段显示名称',
  `field_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '字段类型(string/number/date/boolean)',
  `default_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '默认值',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序序号',
  `required` tinyint(1) NULL DEFAULT 0 COMMENT '是否必填(0=否,1=是)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_category_field`(`category_id`, `field_code`) USING BTREE,
  INDEX `idx_category_id`(`category_id`) USING BTREE,
  INDEX `idx_field_code`(`field_code`) USING BTREE,
  CONSTRAINT `sys_dict_extend_field_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `sys_dict_category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字典扩展字段定义表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dict_extend_field
-- ----------------------------
INSERT INTO `sys_dict_extend_field` VALUES (1, 2, 'percent', '进度百分比', 'number', '0', 0, 1, '2025-07-04 20:46:52', '2025-07-04 20:46:52', NULL, NULL);
INSERT INTO `sys_dict_extend_field` VALUES (2, 2, 'owner_role', '负责人角色', 'string', NULL, 0, 0, '2025-07-04 20:46:52', '2025-07-04 20:46:52', NULL, NULL);

-- ----------------------------
-- Table structure for sys_dict_item
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_item`;
CREATE TABLE `sys_dict_item`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `category_id` bigint(20) NOT NULL COMMENT '关联类目ID',
  `item_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '子项编码（如：MALE/FEMALE）',
  `item_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '子项名称（如：男/女）',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序序号',
  `extend_data` json NULL COMMENT '\'扩展字段值，格式：{\"字段编码\":\"值\"}\'',
  `is_default` tinyint(1) NULL DEFAULT 0 COMMENT '是否默认项（0=否, 1=是）',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '状态（0=禁用, 1=启用）',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_category_item`(`category_id`, `item_code`) USING BTREE,
  CONSTRAINT `sys_dict_item_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `sys_dict_category` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字典明细表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dict_item
-- ----------------------------
INSERT INTO `sys_dict_item` VALUES (7, 1, 'MALE', '男', 1, NULL, 1, 1, '2025-07-04 18:23:21', '2025-07-04 18:23:21', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (8, 1, 'FEMALE', '女', 2, NULL, 0, 1, '2025-07-04 18:23:21', '2025-07-04 18:23:21', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (9, 1, 'UNKNOWN', '未知', 3, NULL, 0, 1, '2025-07-04 18:23:21', '2025-07-04 18:23:21', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (10, 2, 'REQUIRE', '需求分析', 1, '{\"percent\": 30, \"owner_role\": \"产品经理\"}', 1, 1, '2025-07-04 20:47:00', '2025-07-04 20:47:00', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (11, 2, 'DESIGN', '设计阶段', 2, '{\"percent\": 50, \"owner_role\": \"架构师\"}', 0, 1, '2025-07-04 20:47:00', '2025-07-04 20:47:00', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (12, 2, 'DEVELOP', '开发阶段', 3, '{\"percent\": 80, \"owner_role\": \"开发工程师\"}', 0, 1, '2025-07-04 20:47:00', '2025-07-04 20:47:00', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (13, 2, 'TEST', '测试阶段', 4, '{\"percent\": 95, \"owner_role\": \"测试工程师\"}', 0, 1, '2025-07-04 20:47:00', '2025-07-04 20:47:00', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (14, 2, 'DEPLOY', '部署上线', 5, '{\"percent\": 100, \"owner_role\": \"运维工程师\"}', 0, 1, '2025-07-04 20:47:00', '2025-07-04 20:47:00', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (15, 3, 'HIGH', '高', 1, NULL, 0, 1, '2025-07-04 20:47:15', '2025-07-04 20:47:15', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (16, 3, 'MEDIUM', '中', 2, '{\"color\": \"#ff9900\"}', 1, 1, '2025-07-04 20:47:15', '2025-07-04 20:47:15', NULL, NULL);
INSERT INTO `sys_dict_item` VALUES (17, 3, 'LOW', '低', 3, NULL, 0, 1, '2025-07-04 20:47:15', '2025-07-04 20:47:15', NULL, NULL);

-- ----------------------------
-- Table structure for sys_dict_item_i18n
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_item_i18n`;
CREATE TABLE `sys_dict_item_i18n`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) NOT NULL COMMENT '字典明细ID',
  `lang` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '语言代码（如zh-CN、en-US）',
  `item_name_i18n` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '多语言名称',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_item_lang`(`item_id`, `lang`) USING BTREE,
  CONSTRAINT `sys_dict_item_i18n_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `sys_dict_item` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字典明细多语言表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dict_item_i18n
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
