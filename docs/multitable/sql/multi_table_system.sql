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

 Date: 16/06/2025 18:07:57
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for mt_field
-- ----------------------------
DROP TABLE IF EXISTS `mt_field`;
CREATE TABLE `mt_field`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '字段ID，主键',
  `table_id` bigint(20) NOT NULL COMMENT '所属表格ID',
  `field_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字段标识（表内唯一）',
  `field_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字段名称',
  `field_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字段类型（关联字典表type_key）',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '字段描述',
  `config` json NULL COMMENT '字段配置（JSON格式）',
  `default_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '默认值',
  `is_required` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否必填：1=是，0=否',
  `is_unique` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否唯一：1=是，0=否',
  `is_system` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否系统字段：1=是，0=否',
  `is_hidden` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否隐藏：1=是，0=否',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序序号',
  `width` int(11) NULL DEFAULT 120 COMMENT '列宽度（像素）',
  `created_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_table_field_key`(`table_id`, `field_key`) USING BTREE,
  INDEX `idx_table`(`table_id`) USING BTREE,
  INDEX `idx_type`(`field_type`) USING BTREE,
  INDEX `idx_creator`(`created_by`) USING BTREE,
  CONSTRAINT `fk_field_creator` FOREIGN KEY (`created_by`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_field_table` FOREIGN KEY (`table_id`) REFERENCES `mt_table` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10010 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '表格字段定义表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_field
-- ----------------------------
INSERT INTO `mt_field` VALUES (10000, 2001, 'respondent_name', '填写人', 'user', '问卷填写人员', '{\"multiple\": false, \"filterRole\": \"\", \"filterDepartment\": \"\"}', NULL, 1, 0, 0, 0, 1, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10001, 2001, 'respondent_dept', '填写人部门', 'text', '填写人所属部门', '{\"maxLength\": 100, \"multiline\": false, \"placeholder\": \"请输入部门名称\"}', NULL, 1, 0, 0, 0, 2, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10002, 2001, 'submit_time', '提交时间', 'created_time', '问卷提交时间', '{\"format\": \"YYYY-MM-DD HH:mm:ss\", \"readonly\": true}', NULL, 0, 0, 0, 0, 3, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10003, 2001, 'leadership_satisfaction', '公司的领导和管理满意度如何', 'rating', '对公司领导层和管理制度的满意度评价', '{\"icon\": \"star\", \"maxStars\": 5, \"allowHalf\": false}', NULL, 1, 0, 0, 0, 4, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10004, 2001, 'colleague_relationship', '您觉得同事之间的关系', 'single_select', '对同事关系的评价', '{\"options\": [{\"color\": \"#4CAF50\", \"label\": \"非常融洽\", \"value\": \"excellent\"}, {\"color\": \"#8BC34A\", \"label\": \"比较和谐\", \"value\": \"good\"}, {\"color\": \"#FFC107\", \"label\": \"一般\", \"value\": \"average\"}, {\"color\": \"#FF9800\", \"label\": \"存在一些摩擦\", \"value\": \"poor\"}, {\"color\": \"#F44336\", \"label\": \"关系紧张\", \"value\": \"bad\"}], \"allowOther\": false}', NULL, 1, 0, 0, 0, 5, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10005, 2001, 'superior_communication', '您觉得与上级领导的沟通', 'single_select', '与直属上级的沟通情况评价', '{\"options\": [{\"color\": \"#4CAF50\", \"label\": \"非常顺畅\", \"value\": \"excellent\"}, {\"color\": \"#8BC34A\", \"label\": \"比较顺畅\", \"value\": \"good\"}, {\"color\": \"#FFC107\", \"label\": \"一般\", \"value\": \"average\"}, {\"color\": \"#FF9800\", \"label\": \"有时存在障碍\", \"value\": \"poor\"}, {\"color\": \"#F44336\", \"label\": \"沟通困难\", \"value\": \"bad\"}], \"allowOther\": false}', NULL, 1, 0, 0, 0, 6, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10006, 2001, 'work_pressure', '您认为自己的工作压力', 'single_select', '当前工作压力水平评估', '{\"options\": [{\"color\": \"#4CAF50\", \"label\": \"压力很小，工作轻松\", \"value\": \"low\"}, {\"color\": \"#8BC34A\", \"label\": \"压力适中，能够承受\", \"value\": \"moderate\"}, {\"color\": \"#FF9800\", \"label\": \"压力较大，有些吃力\", \"value\": \"high\"}, {\"color\": \"#F44336\", \"label\": \"压力很大，难以承受\", \"value\": \"extreme\"}], \"allowOther\": false}', NULL, 1, 0, 0, 0, 7, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10007, 2001, 'improvement_areas', '您认为公司在哪些方面需要改进', 'multiple_select', '公司需要改进的方面（可多选）', '{\"options\": [{\"color\": \"#E91E63\", \"label\": \"薪酬福利\", \"value\": \"salary\"}, {\"color\": \"#9C27B0\", \"label\": \"工作环境\", \"value\": \"environment\"}, {\"color\": \"#673AB7\", \"label\": \"培训发展\", \"value\": \"training\"}, {\"color\": \"#3F51B5\", \"label\": \"管理制度\", \"value\": \"management\"}, {\"color\": \"#2196F3\", \"label\": \"团队协作\", \"value\": \"teamwork\"}, {\"color\": \"#00BCD4\", \"label\": \"技术设备\", \"value\": \"equipment\"}, {\"color\": \"#009688\", \"label\": \"企业文化\", \"value\": \"culture\"}, {\"color\": \"#4CAF50\", \"label\": \"职业发展\", \"value\": \"career\"}], \"allowOther\": true, \"maxSelections\": 0}', NULL, 0, 0, 0, 0, 8, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10008, 2001, 'other_feedback', '请您提供对公司的其他建议和意见', 'text', '其他建议和反馈意见', '{\"maxLength\": 1000, \"multiline\": true, \"placeholder\": \"请输入您的建议和意见...\"}', NULL, 0, 0, 0, 0, 9, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field` VALUES (10009, 2001, 'overall_rating', '综合评分', 'rating', '对公司的综合满意度评分', '{\"icon\": \"star\", \"maxStars\": 10, \"allowHalf\": true}', NULL, 1, 0, 0, 0, 10, 120, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');

-- ----------------------------
-- Table structure for mt_field_type_dict
-- ----------------------------
DROP TABLE IF EXISTS `mt_field_type_dict`;
CREATE TABLE `mt_field_type_dict`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '字段类型ID，主键',
  `type_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字段类型标识',
  `type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字段类型名称',
  `category` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字段分类：常规类型/业务类型/高级类型',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '字段类型描述',
  `config_schema` json NULL COMMENT '字段配置Schema（JSON格式）',
  `is_system` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否系统字段：1=是，0=否',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序序号',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=启用，0=禁用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_type_key`(`type_key`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '字段类型字典表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_field_type_dict
-- ----------------------------
INSERT INTO `mt_field_type_dict` VALUES (1, 'text', '文本', '常规类型', '单行或多行文本输入', '{\"maxLength\": 255, \"multiline\": false, \"placeholder\": \"\"}', 0, 1, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (2, 'single_select', '单选', '常规类型', '单选选项列表', '{\"options\": [{\"color\": \"\", \"label\": \"\", \"value\": \"\"}], \"allowOther\": false}', 0, 2, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (3, 'multiple_select', '多选', '常规类型', '多选选项列表', '{\"options\": [{\"color\": \"\", \"label\": \"\", \"value\": \"\"}], \"allowOther\": false, \"maxSelections\": 0}', 0, 3, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (4, 'user', '人员', '常规类型', '用户选择器', '{\"multiple\": false, \"filterRole\": \"\", \"filterDepartment\": \"\"}', 0, 4, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (5, 'group', '群组', '常规类型', '用户组选择器', '{\"multiple\": false, \"includeSubGroups\": false}', 0, 5, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (6, 'date', '日期', '常规类型', '日期时间选择器', '{\"format\": \"YYYY-MM-DD\", \"timezone\": \"Asia/Shanghai\", \"includeTime\": false}', 0, 6, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (7, 'attachment', '附件', '常规类型', '文件上传管理', '{\"maxSize\": 10485760, \"maxFiles\": 10, \"allowedTypes\": [\"image/*\", \"application/pdf\"]}', 0, 7, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (8, 'number', '数字', '常规类型', '数值输入', '{\"max\": null, \"min\": null, \"unit\": \"\", \"precision\": 2}', 0, 8, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (9, 'checkbox', '复选框', '常规类型', '布尔值选择', '{\"trueLabel\": \"是\", \"falseLabel\": \"否\", \"defaultValue\": false}', 0, 9, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (10, 'url', '超链接', '常规类型', 'URL链接', '{\"autoDetect\": true, \"openInNewTab\": true}', 0, 10, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (11, 'formula', '公式', '常规类型', '计算字段', '{\"formula\": \"\", \"resultType\": \"number\", \"dependencies\": []}', 0, 11, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (12, 'lookup', '查找引用', '常规类型', '关联表字段查找', '{\"linkedTableId\": 0, \"linkedFieldKey\": \"\", \"displayFieldKey\": \"\"}', 0, 12, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (13, 'workflow', '流程', '业务类型', '工作流状态', '{\"workflowId\": 0, \"initialStatus\": \"\", \"allowedTransitions\": []}', 0, 20, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (14, 'button', '按钮', '业务类型', '操作按钮', '{\"label\": \"点击\", \"action\": \"custom\", \"actionConfig\": {}}', 0, 21, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (15, 'auto_number', '自动编号', '业务类型', '自动递增编号', '{\"format\": \"\", \"prefix\": \"\", \"suffix\": \"\", \"increment\": 1, \"startNumber\": 1}', 0, 22, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (16, 'phone', '电话号码', '业务类型', '电话号码格式', '{\"format\": \"mobile\", \"enableCall\": true, \"countryCode\": \"+86\"}', 0, 23, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (17, 'email', '邮箱', '业务类型', '邮箱地址格式', '{\"template\": \"\", \"enableSend\": true}', 0, 24, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (18, 'location', '地理位置', '业务类型', '地理位置坐标', '{\"allowEdit\": true, \"enableMap\": true, \"defaultZoom\": 10}', 0, 25, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (19, 'barcode', '条码', '业务类型', '条码/二维码', '{\"size\": 100, \"type\": \"qr\", \"autoGenerate\": false}', 0, 26, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (20, 'progress', '进度', '业务类型', '进度条显示', '{\"max\": 100, \"min\": 0, \"unit\": \"%\", \"color\": \"blue\"}', 0, 27, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (21, 'currency', '货币', '业务类型', '货币金额', '{\"currency\": \"CNY\", \"precision\": 2, \"showSymbol\": true}', 0, 28, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (22, 'rating', '评分', '业务类型', '星级评分', '{\"icon\": \"star\", \"maxStars\": 5, \"allowHalf\": false}', 0, 29, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (23, 'bidirectional_link', '双向关联', '高级类型', '双向表关联', '{\"linkType\": \"one_to_many\", \"linkedTableId\": 0, \"backLinkFieldKey\": \"\"}', 0, 40, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (24, 'unidirectional_link', '单向关联', '高级类型', '单向表关联', '{\"linkType\": \"many_to_one\", \"cascadeDelete\": false, \"linkedTableId\": 0}', 0, 41, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (25, 'created_by', '创建人', '高级类型', '记录创建人', '{\"readonly\": true, \"showAvatar\": true}', 0, 42, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (26, 'modified_by', '修改人', '高级类型', '最后修改人', '{\"readonly\": true, \"showAvatar\": true}', 0, 43, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (27, 'created_time', '创建时间', '高级类型', '记录创建时间', '{\"format\": \"YYYY-MM-DD HH:mm:ss\", \"readonly\": true}', 0, 44, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_field_type_dict` VALUES (28, 'modified_time', '最后更新时间', '高级类型', '最后更新时间', '{\"format\": \"YYYY-MM-DD HH:mm:ss\", \"readonly\": true}', 0, 45, 1, '2025-06-16 17:11:15', '2025-06-16 17:11:15');

-- ----------------------------
-- Table structure for mt_permission
-- ----------------------------
DROP TABLE IF EXISTS `mt_permission`;
CREATE TABLE `mt_permission`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '权限ID，主键',
  `tenant_id` bigint(20) NOT NULL COMMENT '所属租户ID',
  `resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资源类型：table/row/field/view',
  `resource_id` bigint(20) NOT NULL COMMENT '资源ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `permission_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限类型：read/write/manage/admin',
  `granted_by` bigint(20) NOT NULL COMMENT '授权人ID',
  `expires_at` datetime NULL DEFAULT NULL COMMENT '权限过期时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_resource_user_type`(`resource_type`, `resource_id`, `user_id`, `permission_type`) USING BTREE,
  INDEX `idx_user`(`user_id`) USING BTREE,
  INDEX `idx_resource`(`resource_type`, `resource_id`) USING BTREE,
  INDEX `idx_grantor`(`granted_by`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE,
  CONSTRAINT `fk_permission_grantor` FOREIGN KEY (`granted_by`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_permission_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 100007 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '权限管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_permission
-- ----------------------------
INSERT INTO `mt_permission` VALUES (100000, 1001, 'table', 2001, 1002, 'admin', 1001, NULL, '2025-06-16 17:11:15', '2025-06-16 17:18:56');
INSERT INTO `mt_permission` VALUES (100001, 1001, 'table', 2001, 1003, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-16 17:18:56');
INSERT INTO `mt_permission` VALUES (100002, 1001, 'table', 2001, 1004, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-16 17:18:56');
INSERT INTO `mt_permission` VALUES (100003, 1001, 'table', 2001, 1005, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-16 17:18:56');
INSERT INTO `mt_permission` VALUES (100004, 1001, 'table', 2001, 1006, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-16 17:18:56');
INSERT INTO `mt_permission` VALUES (100005, 1001, 'table', 2001, 1007, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-16 17:18:56');
INSERT INTO `mt_permission` VALUES (100006, 1001, 'table', 2001, 1008, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-16 17:18:56');

-- ----------------------------
-- Table structure for mt_row
-- ----------------------------
DROP TABLE IF EXISTS `mt_row`;
CREATE TABLE `mt_row`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '行ID，主键',
  `table_id` bigint(20) NOT NULL COMMENT '所属表格ID',
  `row_data` json NOT NULL COMMENT '行数据（JSON格式，key为field_key）',
  `created_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `updated_by` bigint(20) NOT NULL COMMENT '最后更新人ID',
  `version` int(11) NOT NULL DEFAULT 1 COMMENT '数据版本号',
  `is_deleted` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否删除：1=是，0=否',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_table`(`table_id`) USING BTREE,
  INDEX `idx_creator`(`created_by`) USING BTREE,
  INDEX `idx_updater`(`updated_by`) USING BTREE,
  INDEX `idx_deleted`(`is_deleted`) USING BTREE,
  CONSTRAINT `fk_row_creator` FOREIGN KEY (`created_by`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_row_table` FOREIGN KEY (`table_id`) REFERENCES `mt_table` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_row_updater` FOREIGN KEY (`updated_by`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 100005 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '表格数据行存储表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_row
-- ----------------------------
INSERT INTO `mt_row` VALUES (100000, 2001, '{\"work_pressure\": \"moderate\", \"other_feedback\": \"希望公司能够提供更多的技术培训机会，同时升级开发设备。\", \"overall_rating\": 8, \"respondent_dept\": \"技术部\", \"respondent_name\": 1003, \"improvement_areas\": [\"salary\", \"training\", \"equipment\"], \"colleague_relationship\": \"good\", \"superior_communication\": \"excellent\", \"leadership_satisfaction\": 4}', 1003, 1003, 1, 0, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_row` VALUES (100001, 2001, '{\"work_pressure\": \"low\", \"other_feedback\": \"工作氛围很好，希望能有更舒适的办公环境。\", \"overall_rating\": 9, \"respondent_dept\": \"设计部\", \"respondent_name\": 1005, \"improvement_areas\": [\"environment\", \"culture\"], \"colleague_relationship\": \"excellent\", \"superior_communication\": \"good\", \"leadership_satisfaction\": 5}', 1005, 1005, 1, 0, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_row` VALUES (100002, 2001, '{\"work_pressure\": \"high\", \"other_feedback\": \"工作压力较大，希望能改善团队沟通效率，明确职业发展路径。\", \"overall_rating\": 6, \"respondent_dept\": \"技术部\", \"respondent_name\": 1006, \"improvement_areas\": [\"management\", \"teamwork\", \"career\"], \"colleague_relationship\": \"average\", \"superior_communication\": \"poor\", \"leadership_satisfaction\": 3}', 1006, 1006, 1, 0, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_row` VALUES (100003, 2001, '{\"work_pressure\": \"moderate\", \"other_feedback\": \"希望提供财务相关的专业培训，更新财务软件系统。\", \"overall_rating\": 7.5, \"respondent_dept\": \"财务部\", \"respondent_name\": 1007, \"improvement_areas\": [\"training\", \"equipment\"], \"colleague_relationship\": \"good\", \"superior_communication\": \"good\", \"leadership_satisfaction\": 4}', 1007, 1007, 1, 0, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_row` VALUES (100004, 2001, '{\"work_pressure\": \"low\", \"other_feedback\": \"团队合作很愉快，建议适当调整薪酬结构。\", \"overall_rating\": 8.5, \"respondent_dept\": \"运营部\", \"respondent_name\": 1008, \"improvement_areas\": [\"salary\", \"culture\"], \"colleague_relationship\": \"excellent\", \"superior_communication\": \"excellent\", \"leadership_satisfaction\": 5}', 1008, 1008, 1, 0, '2025-06-16 17:11:15', '2025-06-16 17:11:15');

-- ----------------------------
-- Table structure for mt_table
-- ----------------------------
DROP TABLE IF EXISTS `mt_table`;
CREATE TABLE `mt_table`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '表格ID，主键',
  `tenant_id` bigint(20) NOT NULL COMMENT '所属租户ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '表格名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '表格描述',
  `team_id` bigint(20) NOT NULL COMMENT '所属团队ID',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '表格图标',
  `color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '表格颜色（十六进制）',
  `created_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `row_count` bigint(20) NOT NULL DEFAULT 0 COMMENT '数据行数',
  `field_count` int(11) NOT NULL DEFAULT 0 COMMENT '字段数量',
  `view_count` int(11) NOT NULL DEFAULT 0 COMMENT '视图数量',
  `is_template` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否模板：1=是，0=否',
  `template_category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '模板分类',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=正常，0=删除',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_team`(`team_id`) USING BTREE,
  INDEX `idx_creator`(`created_by`) USING BTREE,
  INDEX `idx_template`(`is_template`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE,
  CONSTRAINT `fk_table_creator` FOREIGN KEY (`created_by`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_table_team` FOREIGN KEY (`team_id`) REFERENCES `mt_team` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '表格基础信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_table
-- ----------------------------
INSERT INTO `mt_table` VALUES (2001, 1001, '员工满意度调查问卷', '公司年度员工满意度调查问卷，用于收集员工对公司各方面的反馈意见', 102, '📊', '#4CAF50', 1002, 5, 10, 3, 0, NULL, 1, '2025-06-16 17:11:15', '2025-06-16 17:18:56');

-- ----------------------------
-- Table structure for mt_team
-- ----------------------------
DROP TABLE IF EXISTS `mt_team`;
CREATE TABLE `mt_team`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '团队ID，主键',
  `tenant_id` bigint(20) NOT NULL COMMENT '所属租户ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '团队名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '团队描述',
  `owner_id` bigint(20) NOT NULL COMMENT '团队负责人ID',
  `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '团队Logo URL',
  `member_count` int(11) NOT NULL DEFAULT 0 COMMENT '成员数量',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=正常，0=停用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_owner`(`owner_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE,
  CONSTRAINT `fk_team_owner` FOREIGN KEY (`owner_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 104 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '团队组织表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_team
-- ----------------------------
INSERT INTO `mt_team` VALUES (101, 1001, '默认团队', '系统默认团队，用于组织管理', 1001, NULL, 4, 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_team` VALUES (102, 1001, '人事管理团队', '负责人事相关业务管理', 1002, NULL, 3, 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_team` VALUES (103, 1001, '产品研发团队', '负责产品开发和技术管理', 1003, NULL, 4, 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');

-- ----------------------------
-- Table structure for mt_team_invitation
-- ----------------------------
DROP TABLE IF EXISTS `mt_team_invitation`;
CREATE TABLE `mt_team_invitation`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '邀请ID，主键',
  `tenant_id` bigint(20) NOT NULL COMMENT '租户ID',
  `team_id` bigint(20) NOT NULL COMMENT '团队ID',
  `inviter_id` bigint(20) NOT NULL COMMENT '邀请人ID',
  `invitee_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '被邀请人邮箱',
  `invitee_id` bigint(20) NULL DEFAULT NULL COMMENT '被邀请人ID（如果已是系统用户）',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member' COMMENT '邀请角色',
  `invitation_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邀请令牌',
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '邀请消息',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=待处理，2=已接受，3=已拒绝，0=已失效',
  `expires_at` datetime NOT NULL COMMENT '邀请过期时间',
  `responded_at` datetime NULL DEFAULT NULL COMMENT '响应时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_team_email_active`(`team_id`, `invitee_email`, `status`) USING BTREE,
  UNIQUE INDEX `uk_invitation_token`(`invitation_token`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE,
  INDEX `idx_team`(`team_id`) USING BTREE,
  INDEX `idx_inviter`(`inviter_id`) USING BTREE,
  INDEX `idx_invitee`(`invitee_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_expires`(`expires_at`) USING BTREE,
  CONSTRAINT `fk_invitation_invitee` FOREIGN KEY (`invitee_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_invitation_inviter` FOREIGN KEY (`inviter_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_invitation_team` FOREIGN KEY (`team_id`) REFERENCES `mt_team` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_invitation_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `mt_tenant` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '团队邀请表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_team_invitation
-- ----------------------------

-- ----------------------------
-- Table structure for mt_team_member
-- ----------------------------
DROP TABLE IF EXISTS `mt_team_member`;
CREATE TABLE `mt_team_member`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '关系ID，主键',
  `tenant_id` bigint(20) NOT NULL COMMENT '租户ID',
  `team_id` bigint(20) NOT NULL COMMENT '团队ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member' COMMENT '团队角色：owner/admin/member/viewer',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=正常，2=待确认，0=已退出',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `invited_by` bigint(20) NULL DEFAULT NULL COMMENT '邀请人ID',
  `permissions` json NULL COMMENT '团队内特殊权限（JSON格式）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_team_user`(`team_id`, `user_id`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE,
  INDEX `idx_team`(`team_id`) USING BTREE,
  INDEX `idx_user`(`user_id`) USING BTREE,
  INDEX `idx_role`(`role`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `fk_team_member_inviter`(`invited_by`) USING BTREE,
  CONSTRAINT `fk_team_member_inviter` FOREIGN KEY (`invited_by`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_team_member_team` FOREIGN KEY (`team_id`) REFERENCES `mt_team` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_team_member_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `mt_tenant` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_team_member_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '团队成员关系表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_team_member
-- ----------------------------
INSERT INTO `mt_team_member` VALUES (1, 1001, 101, 1001, 'owner', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (2, 1001, 101, 1002, 'admin', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (3, 1001, 101, 1003, 'member', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (4, 1001, 101, 1004, 'member', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (5, 1001, 102, 1002, 'owner', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (6, 1001, 102, 1001, 'admin', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (7, 1001, 102, 1007, 'member', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (8, 1001, 103, 1003, 'owner', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (9, 1001, 103, 1005, 'member', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (10, 1001, 103, 1006, 'member', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_member` VALUES (11, 1001, 103, 1008, 'member', 1, '2025-06-16 17:19:11', NULL, NULL, '2025-06-16 17:19:11', '2025-06-16 17:19:11');

-- ----------------------------
-- Table structure for mt_team_role
-- ----------------------------
DROP TABLE IF EXISTS `mt_team_role`;
CREATE TABLE `mt_team_role`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '角色ID，主键',
  `role_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色标识',
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '角色描述',
  `permissions` json NOT NULL COMMENT '角色权限列表（JSON数组）',
  `is_system` tinyint(4) NOT NULL DEFAULT 1 COMMENT '是否系统角色：1=是，0=否',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序序号',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_key`(`role_key`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '团队角色定义表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_team_role
-- ----------------------------
INSERT INTO `mt_team_role` VALUES (1, 'owner', '团队所有者', '团队创建者，拥有所有权限', '[\"team.manage\", \"team.delete\", \"team.settings\", \"member.invite\", \"member.remove\", \"member.role.change\", \"table.create\", \"table.delete\", \"table.manage\", \"permission.grant\", \"permission.revoke\"]', 1, 1, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_role` VALUES (2, 'admin', '团队管理员', '团队管理员，可管理成员和表格', '[\"team.settings\", \"member.invite\", \"member.remove\", \"member.role.change\", \"table.create\", \"table.delete\", \"table.manage\", \"permission.grant\", \"permission.revoke\"]', 1, 2, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_role` VALUES (3, 'member', '团队成员', '普通团队成员，可创建和管理自己的表格', '[\"table.create\", \"table.manage.own\", \"data.read\", \"data.write\"]', 1, 3, '2025-06-16 17:19:11', '2025-06-16 17:19:11');
INSERT INTO `mt_team_role` VALUES (4, 'viewer', '访客', '只读访问权限，不能创建或修改', '[\"data.read\"]', 1, 4, '2025-06-16 17:19:11', '2025-06-16 17:19:11');

-- ----------------------------
-- Table structure for mt_tenant
-- ----------------------------
DROP TABLE IF EXISTS `mt_tenant`;
CREATE TABLE `mt_tenant`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '租户ID，主键',
  `tenant_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '租户编码，唯一标识',
  `tenant_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '租户名称（公司/组织名）',
  `domain` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '企业域名',
  `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '企业Logo URL',
  `contact_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系人姓名',
  `contact_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系人邮箱',
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系人电话',
  `industry` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属行业',
  `scale` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '企业规模：small/medium/large/enterprise',
  `subscription_plan` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'free' COMMENT '订阅计划：free/standard/professional/enterprise',
  `max_users` int(11) NOT NULL DEFAULT 3 COMMENT '最大用户数限制',
  `max_storage_gb` int(11) NOT NULL DEFAULT 1 COMMENT '最大存储空间(GB)',
  `features` json NULL COMMENT '可用功能列表（JSON数组）',
  `expired_at` datetime NULL DEFAULT NULL COMMENT '订阅到期时间',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=正常，2=试用，3=过期，0=停用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_tenant_code`(`tenant_code`) USING BTREE,
  INDEX `idx_domain`(`domain`) USING BTREE,
  INDEX `idx_plan`(`subscription_plan`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1004 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '租户管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_tenant
-- ----------------------------
INSERT INTO `mt_tenant` VALUES (1001, 'demo_company', '示例科技有限公司', 'demo.company.com', NULL, '张经理', 'admin@demo.company.com', NULL, '科技', 'medium', 'professional', 100, 100, '[\"basic\", \"workflow\", \"ai\", \"advanced_permission\"]', NULL, 1, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant` VALUES (1002, 'startup_inc', '创新创业公司', 'startup.inc.com', NULL, '李总', 'ceo@startup.inc.com', NULL, '互联网', 'small', 'standard', 20, 50, '[\"basic\", \"workflow\"]', NULL, 1, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant` VALUES (1003, 'enterprise_corp', '大型企业集团', 'enterprise.corp.com', NULL, '王总监', 'admin@enterprise.corp.com', NULL, '制造业', 'enterprise', 'enterprise', 1000, 1000, '[\"basic\", \"workflow\", \"ai\", \"advanced_permission\", \"custom_integration\"]', NULL, 1, '2025-06-16 17:18:56', '2025-06-16 17:18:56');

-- ----------------------------
-- Table structure for mt_tenant_archive_log
-- ----------------------------
DROP TABLE IF EXISTS `mt_tenant_archive_log`;
CREATE TABLE `mt_tenant_archive_log`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '归档日志ID',
  `tenant_id` bigint(20) NOT NULL COMMENT '租户ID',
  `archive_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '归档类型：data/user/table',
  `archive_date` date NOT NULL COMMENT '归档日期',
  `archived_count` int(11) NOT NULL DEFAULT 0 COMMENT '归档记录数',
  `archive_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '归档文件路径',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=成功，0=失败',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_tenant_type`(`tenant_id`, `archive_type`) USING BTREE,
  INDEX `idx_date`(`archive_date`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '租户数据归档日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_tenant_archive_log
-- ----------------------------

-- ----------------------------
-- Table structure for mt_tenant_config
-- ----------------------------
DROP TABLE IF EXISTS `mt_tenant_config`;
CREATE TABLE `mt_tenant_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '配置ID，主键',
  `tenant_id` bigint(20) NOT NULL COMMENT '租户ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置键',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '配置值',
  `config_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string' COMMENT '配置类型：string/number/boolean/json',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '配置描述',
  `is_system` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否系统配置：1=是，0=否',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_tenant_config`(`tenant_id`, `config_key`) USING BTREE,
  CONSTRAINT `fk_tenant_config_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `mt_tenant` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '租户配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_tenant_config
-- ----------------------------
INSERT INTO `mt_tenant_config` VALUES (1, 1001, 'theme_color', '#1976D2', 'string', '主题颜色', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (2, 1001, 'enable_sso', 'false', 'boolean', '是否启用单点登录', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (3, 1001, 'max_file_size_mb', '50', 'number', '最大文件上传大小(MB)', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (4, 1001, 'allowed_domains', '[\"demo.company.com\", \"*.demo.company.com\"]', 'json', '允许的邮箱域名', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (5, 1002, 'theme_color', '#4CAF50', 'string', '主题颜色', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (6, 1002, 'enable_sso', 'false', 'boolean', '是否启用单点登录', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (7, 1002, 'max_file_size_mb', '20', 'number', '最大文件上传大小(MB)', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (8, 1003, 'theme_color', '#FF5722', 'string', '主题颜色', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (9, 1003, 'enable_sso', 'true', 'boolean', '是否启用单点登录', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (10, 1003, 'max_file_size_mb', '100', 'number', '最大文件上传大小(MB)', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (11, 1003, 'sso_provider', 'LDAP', 'string', 'SSO提供商', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_config` VALUES (12, 1003, 'data_retention_days', '2555', 'number', '数据保留天数（7年）', 0, '2025-06-16 17:18:56', '2025-06-16 17:18:56');

-- ----------------------------
-- Table structure for mt_tenant_usage
-- ----------------------------
DROP TABLE IF EXISTS `mt_tenant_usage`;
CREATE TABLE `mt_tenant_usage`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '统计ID，主键',
  `tenant_id` bigint(20) NOT NULL COMMENT '租户ID',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `user_count` int(11) NOT NULL DEFAULT 0 COMMENT '用户数量',
  `table_count` int(11) NOT NULL DEFAULT 0 COMMENT '表格数量',
  `row_count` bigint(20) NOT NULL DEFAULT 0 COMMENT '数据行总数',
  `storage_used_mb` bigint(20) NOT NULL DEFAULT 0 COMMENT '已使用存储空间(MB)',
  `api_calls` bigint(20) NOT NULL DEFAULT 0 COMMENT 'API调用次数',
  `active_users` int(11) NOT NULL DEFAULT 0 COMMENT '活跃用户数',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_tenant_date`(`tenant_id`, `stat_date`) USING BTREE,
  INDEX `idx_date`(`stat_date`) USING BTREE,
  CONSTRAINT `fk_usage_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `mt_tenant` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '租户使用统计表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_tenant_usage
-- ----------------------------
INSERT INTO `mt_tenant_usage` VALUES (1, 1001, '2025-06-16', 4, 1, 5, 0, 0, 5, '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_usage` VALUES (2, 1002, '2025-06-16', 2, 0, 0, 0, 0, 0, '2025-06-16 17:18:56');
INSERT INTO `mt_tenant_usage` VALUES (3, 1003, '2025-06-16', 2, 0, 0, 0, 0, 0, '2025-06-16 17:18:56');

-- ----------------------------
-- Table structure for mt_user
-- ----------------------------
DROP TABLE IF EXISTS `mt_user`;
CREATE TABLE `mt_user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键',
  `tenant_id` bigint(20) NOT NULL COMMENT '所属租户ID',
  `default_team_id` bigint(20) NULL DEFAULT NULL COMMENT '默认团队ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名，唯一标识',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱地址',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希值',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号码',
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属部门',
  `position` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '职位',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1=正常，0=禁用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username`) USING BTREE,
  UNIQUE INDEX `uk_email`(`email`) USING BTREE,
  INDEX `idx_department`(`department`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_tenant`(`tenant_id`) USING BTREE,
  INDEX `idx_default_team`(`default_team_id`) USING BTREE,
  CONSTRAINT `fk_user_default_team` FOREIGN KEY (`default_team_id`) REFERENCES `mt_team` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1009 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户基础信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_user
-- ----------------------------
INSERT INTO `mt_user` VALUES (1001, 1001, 101, 'admin', 'admin@company.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu', '系统管理员', NULL, NULL, 'IT部', '系统管理员', 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_user` VALUES (1002, 1001, 102, 'hr_manager', 'hr@company.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu', '张人事', NULL, NULL, '人事部', 'HR经理', 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_user` VALUES (1003, 1001, 103, 'dev_leader', 'dev@company.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu', '李开发', NULL, NULL, '技术部', '技术经理', 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_user` VALUES (1004, 1001, 101, 'sales_manager', 'sales@company.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu', '王销售', NULL, NULL, '销售部', '销售经理', 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_user` VALUES (1005, 1002, 103, 'designer', 'design@company.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu', '赵设计', NULL, NULL, '设计部', 'UI设计师', 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_user` VALUES (1006, 1002, 103, 'tester', 'test@company.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu', '钱测试', NULL, NULL, '技术部', '测试工程师', 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_user` VALUES (1007, 1003, 102, 'finance', 'finance@company.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu', '孙财务', NULL, NULL, '财务部', '财务专员', 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');
INSERT INTO `mt_user` VALUES (1008, 1003, 103, 'operation', 'ops@company.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu', '周运营', NULL, NULL, '运营部', '运营专员', 1, '2025-06-16 17:11:15', '2025-06-16 17:19:11');

-- ----------------------------
-- Table structure for mt_view
-- ----------------------------
DROP TABLE IF EXISTS `mt_view`;
CREATE TABLE `mt_view`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '视图ID，主键',
  `table_id` bigint(20) NOT NULL COMMENT '所属表格ID',
  `view_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '视图名称',
  `view_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '视图类型：grid/kanban/calendar/gallery/form',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '视图描述',
  `config` json NOT NULL COMMENT '视图配置（JSON格式）',
  `is_default` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否默认视图：1=是，0=否',
  `is_public` tinyint(4) NOT NULL DEFAULT 1 COMMENT '是否公开：1=是，0=否',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序序号',
  `created_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_table`(`table_id`) USING BTREE,
  INDEX `idx_creator`(`created_by`) USING BTREE,
  INDEX `idx_default`(`is_default`) USING BTREE,
  INDEX `idx_public`(`is_public`) USING BTREE,
  CONSTRAINT `fk_view_creator` FOREIGN KEY (`created_by`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_view_table` FOREIGN KEY (`table_id`) REFERENCES `mt_table` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10003 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '表格视图配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_view
-- ----------------------------
INSERT INTO `mt_view` VALUES (10000, 2001, '问卷结果汇总', 'grid', '显示所有问卷填写结果的表格视图', '{\"sorts\": [{\"fieldKey\": \"submit_time\", \"direction\": \"desc\"}], \"fields\": [{\"width\": 120, \"visible\": true, \"fieldKey\": \"respondent_name\"}, {\"width\": 120, \"visible\": true, \"fieldKey\": \"respondent_dept\"}, {\"width\": 160, \"visible\": true, \"fieldKey\": \"submit_time\"}, {\"width\": 140, \"visible\": true, \"fieldKey\": \"leadership_satisfaction\"}, {\"width\": 140, \"visible\": true, \"fieldKey\": \"colleague_relationship\"}, {\"width\": 140, \"visible\": true, \"fieldKey\": \"superior_communication\"}, {\"width\": 120, \"visible\": true, \"fieldKey\": \"work_pressure\"}, {\"width\": 180, \"visible\": true, \"fieldKey\": \"improvement_areas\"}, {\"width\": 100, \"visible\": true, \"fieldKey\": \"overall_rating\"}], \"groups\": [], \"filters\": []}', 1, 1, 1, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_view` VALUES (10001, 2001, '满意度统计看板', 'kanban', '按部门分组显示满意度调查结果', '{\"sorts\": [{\"fieldKey\": \"overall_rating\", \"direction\": \"desc\"}], \"filters\": [], \"cardFields\": [\"respondent_name\", \"leadership_satisfaction\", \"overall_rating\"], \"colorField\": \"leadership_satisfaction\", \"groupByField\": \"respondent_dept\"}', 0, 1, 2, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_view` VALUES (10002, 2001, '问卷填写表单', 'form', '用于员工填写满意度调查问卷的表单视图', '{\"sections\": [{\"title\": \"基本信息\", \"fields\": [\"respondent_name\", \"respondent_dept\"]}, {\"title\": \"满意度评价\", \"fields\": [\"leadership_satisfaction\", \"colleague_relationship\", \"superior_communication\", \"work_pressure\"]}, {\"title\": \"改进建议\", \"fields\": [\"improvement_areas\", \"other_feedback\", \"overall_rating\"]}], \"submitText\": \"提交问卷\", \"successMessage\": \"感谢您的参与，问卷已成功提交！\"}', 0, 1, 3, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');

-- ----------------------------
-- View structure for v_team_statistics
-- ----------------------------
DROP VIEW IF EXISTS `v_team_statistics`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_team_statistics` AS select `t`.`id` AS `team_id`,`t`.`tenant_id` AS `tenant_id`,`t`.`name` AS `team_name`,`t`.`owner_id` AS `owner_id`,`owner`.`real_name` AS `owner_name`,count(distinct `tm`.`user_id`) AS `member_count`,count(distinct (case when (`tm`.`role` = 'admin') then `tm`.`user_id` end)) AS `admin_count`,count(distinct `tb`.`id`) AS `table_count`,coalesce(sum(`tb`.`row_count`),0) AS `total_rows`,`t`.`created_at` AS `created_at`,`t`.`updated_at` AS `updated_at` from (((`mt_team` `t` join `mt_user` `owner` on((`t`.`owner_id` = `owner`.`id`))) left join `mt_team_member` `tm` on(((`t`.`id` = `tm`.`team_id`) and (`tm`.`status` = 1)))) left join `mt_table` `tb` on(((`t`.`id` = `tb`.`team_id`) and (`tb`.`status` = 1)))) where (`t`.`status` = 1) group by `t`.`id`,`t`.`tenant_id`,`t`.`name`,`t`.`owner_id`,`owner`.`real_name`,`t`.`created_at`,`t`.`updated_at`;

-- ----------------------------
-- View structure for v_tenant_overview
-- ----------------------------
DROP VIEW IF EXISTS `v_tenant_overview`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_tenant_overview` AS select `t`.`id` AS `tenant_id`,`t`.`tenant_code` AS `tenant_code`,`t`.`tenant_name` AS `tenant_name`,`t`.`subscription_plan` AS `subscription_plan`,`t`.`status` AS `status`,count(distinct `u`.`id`) AS `user_count`,count(distinct `tb`.`id`) AS `table_count`,coalesce(sum(`tb`.`row_count`),0) AS `total_rows`,`t`.`max_users` AS `max_users`,`t`.`max_storage_gb` AS `max_storage_gb`,`t`.`created_at` AS `created_at` from ((`mt_tenant` `t` left join `mt_user` `u` on(((`t`.`id` = `u`.`tenant_id`) and (`u`.`status` = 1)))) left join `mt_table` `tb` on(((`t`.`id` = `tb`.`tenant_id`) and (`tb`.`status` = 1)))) where (`t`.`status` in (1,2)) group by `t`.`id`,`t`.`tenant_code`,`t`.`tenant_name`,`t`.`subscription_plan`,`t`.`status`,`t`.`max_users`,`t`.`max_storage_gb`,`t`.`created_at`;

-- ----------------------------
-- View structure for v_user_table_permissions
-- ----------------------------
DROP VIEW IF EXISTS `v_user_table_permissions`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_user_table_permissions` AS select `p`.`id` AS `permission_id`,`p`.`tenant_id` AS `tenant_id`,`t`.`tenant_name` AS `tenant_name`,`u`.`id` AS `user_id`,`u`.`username` AS `username`,`u`.`real_name` AS `real_name`,`tb`.`id` AS `table_id`,`tb`.`name` AS `table_name`,`p`.`permission_type` AS `permission_type`,`p`.`created_at` AS `granted_at` from (((`mt_permission` `p` join `mt_tenant` `t` on((`p`.`tenant_id` = `t`.`id`))) join `mt_user` `u` on((`p`.`user_id` = `u`.`id`))) join `mt_table` `tb` on(((`p`.`resource_type` = 'table') and (`p`.`resource_id` = `tb`.`id`)))) where ((`p`.`resource_type` = 'table') and (`t`.`status` = 1) and (`u`.`status` = 1) and (`tb`.`status` = 1));

-- ----------------------------
-- View structure for v_user_team_details
-- ----------------------------
DROP VIEW IF EXISTS `v_user_team_details`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_user_team_details` AS select `tm`.`id` AS `member_id`,`tm`.`tenant_id` AS `tenant_id`,`t`.`tenant_name` AS `tenant_name`,`tm`.`team_id` AS `team_id`,`team`.`name` AS `team_name`,`team`.`description` AS `team_description`,`tm`.`user_id` AS `user_id`,`u`.`username` AS `username`,`u`.`real_name` AS `real_name`,`u`.`email` AS `email`,`u`.`department` AS `department`,`u`.`position` AS `position`,`tm`.`role` AS `team_role`,`tr`.`role_name` AS `role_name`,`tr`.`permissions` AS `role_permissions`,`tm`.`status` AS `member_status`,`tm`.`joined_at` AS `joined_at`,(case when (`team`.`owner_id` = `tm`.`user_id`) then 1 else 0 end) AS `is_owner`,(case when (`u`.`default_team_id` = `tm`.`team_id`) then 1 else 0 end) AS `is_default_team` from ((((`mt_team_member` `tm` join `mt_tenant` `t` on((`tm`.`tenant_id` = `t`.`id`))) join `mt_team` `team` on((`tm`.`team_id` = `team`.`id`))) join `mt_user` `u` on((`tm`.`user_id` = `u`.`id`))) left join `mt_team_role` `tr` on((`tm`.`role` = `tr`.`role_key`))) where ((`tm`.`status` = 1) and (`u`.`status` = 1) and (`team`.`status` = 1));

-- ----------------------------
-- Function structure for fn_check_tenant_access
-- ----------------------------
DROP FUNCTION IF EXISTS `fn_check_tenant_access`;
delimiter ;;
CREATE FUNCTION `fn_check_tenant_access`(p_user_id BIGINT,
    p_tenant_id BIGINT)
 RETURNS tinyint(1)
  READS SQL DATA 
  DETERMINISTIC
BEGIN
    DECLARE user_tenant_id BIGINT DEFAULT 0;
    
    SELECT tenant_id INTO user_tenant_id 
    FROM mt_user 
    WHERE id = p_user_id AND status = 1;
    
    RETURN (user_tenant_id = p_tenant_id);
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_accept_team_invitation
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_accept_team_invitation`;
delimiter ;;
CREATE PROCEDURE `sp_accept_team_invitation`(IN p_invitation_token VARCHAR(100),
    IN p_user_id BIGINT)
BEGIN
    DECLARE v_invitation_id BIGINT;
    DECLARE v_tenant_id BIGINT;
    DECLARE v_team_id BIGINT;
    DECLARE v_role VARCHAR(50);
    DECLARE v_status TINYINT;
    DECLARE v_expires_at DATETIME;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- 获取邀请信息
    SELECT id, tenant_id, team_id, role, status, expires_at
    INTO v_invitation_id, v_tenant_id, v_team_id, v_role, v_status, v_expires_at
    FROM mt_team_invitation
    WHERE invitation_token = p_invitation_token;
    
    -- 验证邀请有效性
    IF v_invitation_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid invitation token';
    END IF;
    
    IF v_status != 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invitation is not active';
    END IF;
    
    IF v_expires_at < NOW() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invitation has expired';
    END IF;
    
    -- 检查用户是否已是团队成员
    IF EXISTS (
        SELECT 1 FROM mt_team_member 
        WHERE team_id = v_team_id AND user_id = p_user_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is already a team member';
    END IF;
    
    -- 添加用户到团队
    INSERT INTO `mt_team_member` (tenant_id, team_id, user_id, role, status)
    VALUES (v_tenant_id, v_team_id, p_user_id, v_role, 1);
    
    -- 更新邀请状态
    UPDATE `mt_team_invitation` 
    SET status = 2, responded_at = NOW()
    WHERE id = v_invitation_id;
    
    -- 如果用户没有默认团队，设置为默认团队
    UPDATE `mt_user` 
    SET default_team_id = v_team_id 
    WHERE id = p_user_id AND default_team_id IS NULL;
    
    COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_change_member_role
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_change_member_role`;
delimiter ;;
CREATE PROCEDURE `sp_change_member_role`(IN p_team_id BIGINT,
    IN p_operator_id BIGINT,
    IN p_member_id BIGINT,
    IN p_new_role VARCHAR(50))
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- 检查操作者权限
    IF NOT EXISTS (
        SELECT 1 FROM mt_team_member tm
        INNER JOIN mt_team_role tr ON tm.role = tr.role_key
        WHERE tm.team_id = p_team_id 
          AND tm.user_id = p_operator_id 
          AND tm.status = 1
          AND JSON_CONTAINS(tr.permissions, '"member.role.change"')
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient permissions to change member role';
    END IF;
    
    -- 不能修改团队所有者的角色
    IF EXISTS (
        SELECT 1 FROM mt_team t
        INNER JOIN mt_team_member tm ON t.id = tm.team_id
        WHERE t.id = p_team_id AND t.owner_id = p_member_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot change team owner role';
    END IF;
    
    -- 更新成员角色
    UPDATE `mt_team_member` 
    SET role = p_new_role
    WHERE team_id = p_team_id AND user_id = p_member_id;
    
    COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_create_team
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_create_team`;
delimiter ;;
CREATE PROCEDURE `sp_create_team`(IN p_tenant_id BIGINT,
    IN p_team_name VARCHAR(100),
    IN p_description TEXT,
    IN p_owner_id BIGINT,
    OUT p_team_id BIGINT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- 创建团队
    INSERT INTO `mt_team` (tenant_id, name, description, owner_id)
    VALUES (p_tenant_id, p_team_name, p_description, p_owner_id);
    
    SET p_team_id = LAST_INSERT_ID();
    
    -- 添加创建者为团队所有者
    INSERT INTO `mt_team_member` (tenant_id, team_id, user_id, role, status)
    VALUES (p_tenant_id, p_team_id, p_owner_id, 'owner', 1);
    
    -- 如果用户没有默认团队，设置为默认团队
    UPDATE `mt_user` 
    SET default_team_id = p_team_id 
    WHERE id = p_owner_id AND default_team_id IS NULL;
    
    COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_tenant_tables
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_tenant_tables`;
delimiter ;;
CREATE PROCEDURE `sp_get_tenant_tables`(IN p_tenant_id BIGINT,
    IN p_user_id BIGINT)
BEGIN
    -- 检查用户权限
    IF NOT fn_check_tenant_access(p_user_id, p_tenant_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access denied: User does not belong to this tenant';
    END IF;
    
    -- 返回用户有权限的表格列表
    SELECT DISTINCT
        t.id,
        t.name,
        t.description,
        t.icon,
        t.color,
        t.row_count,
        t.field_count,
        t.created_at,
        p.permission_type
    FROM mt_table t
    INNER JOIN mt_permission p ON t.id = p.resource_id 
        AND p.resource_type = 'table' 
        AND p.user_id = p_user_id
    WHERE t.tenant_id = p_tenant_id 
      AND t.status = 1
    ORDER BY t.updated_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_invite_user_to_team
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_invite_user_to_team`;
delimiter ;;
CREATE PROCEDURE `sp_invite_user_to_team`(IN p_tenant_id BIGINT,
    IN p_team_id BIGINT,
    IN p_inviter_id BIGINT,
    IN p_invitee_email VARCHAR(100),
    IN p_role VARCHAR(50),
    IN p_message TEXT,
    OUT p_invitation_id BIGINT)
BEGIN
    DECLARE v_invitee_id BIGINT DEFAULT NULL;
    DECLARE v_invitation_token VARCHAR(100);
    DECLARE v_expires_at DATETIME;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- 检查邀请人权限
    IF NOT EXISTS (
        SELECT 1 FROM mt_team_member tm
        INNER JOIN mt_team_role tr ON tm.role = tr.role_key
        WHERE tm.team_id = p_team_id 
          AND tm.user_id = p_inviter_id 
          AND tm.status = 1
          AND JSON_CONTAINS(tr.permissions, '"member.invite"')
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient permissions to invite members';
    END IF;
    
    -- 检查用户是否已存在
    SELECT id INTO v_invitee_id 
    FROM mt_user 
    WHERE email = p_invitee_email AND tenant_id = p_tenant_id;
    
    -- 生成邀请令牌和过期时间
    SET v_invitation_token = CONCAT('invite_', UUID(), '_', UNIX_TIMESTAMP());
    SET v_expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY);
    
    -- 创建邀请记录
    INSERT INTO `mt_team_invitation` (
        tenant_id, team_id, inviter_id, invitee_email, invitee_id, 
        role, invitation_token, message, expires_at
    ) VALUES (
        p_tenant_id, p_team_id, p_inviter_id, p_invitee_email, v_invitee_id,
        p_role, v_invitation_token, p_message, v_expires_at
    );
    
    SET p_invitation_id = LAST_INSERT_ID();
    
    COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_update_tenant_usage
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_update_tenant_usage`;
delimiter ;;
CREATE PROCEDURE `sp_update_tenant_usage`(IN p_tenant_id BIGINT,
    IN p_stat_date DATE)
BEGIN
    DECLARE v_user_count INT DEFAULT 0;
    DECLARE v_table_count INT DEFAULT 0;
    DECLARE v_row_count BIGINT DEFAULT 0;
    DECLARE v_active_users INT DEFAULT 0;
    
    -- 计算各项统计数据
    SELECT COUNT(*) INTO v_user_count 
    FROM mt_user 
    WHERE tenant_id = p_tenant_id AND status = 1;
    
    SELECT COUNT(*) INTO v_table_count 
    FROM mt_table 
    WHERE tenant_id = p_tenant_id AND status = 1;
    
    SELECT COALESCE(SUM(row_count), 0) INTO v_row_count 
    FROM mt_table 
    WHERE tenant_id = p_tenant_id AND status = 1;
    
    -- 计算活跃用户（最近7天有操作的用户）
    SELECT COUNT(DISTINCT updated_by) INTO v_active_users
    FROM mt_row r
    INNER JOIN mt_table t ON r.table_id = t.id
    WHERE t.tenant_id = p_tenant_id 
      AND r.updated_at >= DATE_SUB(p_stat_date, INTERVAL 7 DAY);
    
    -- 插入或更新统计数据
    INSERT INTO mt_tenant_usage (tenant_id, stat_date, user_count, table_count, row_count, active_users)
    VALUES (p_tenant_id, p_stat_date, v_user_count, v_table_count, v_row_count, v_active_users)
    ON DUPLICATE KEY UPDATE
        user_count = v_user_count,
        table_count = v_table_count,
        row_count = v_row_count,
        active_users = v_active_users;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table mt_permission
-- ----------------------------
DROP TRIGGER IF EXISTS `tr_permission_insert_tenant_check`;
delimiter ;;
CREATE TRIGGER `tr_permission_insert_tenant_check` BEFORE INSERT ON `mt_permission` FOR EACH ROW BEGIN
    DECLARE user_tenant_id BIGINT;
    DECLARE resource_tenant_id BIGINT DEFAULT NULL;
    
    -- 获取用户的租户ID
    SELECT tenant_id INTO user_tenant_id 
    FROM mt_user 
    WHERE id = NEW.user_id;
    
    -- 根据资源类型获取资源的租户ID
    IF NEW.resource_type = 'table' THEN
        SELECT tenant_id INTO resource_tenant_id 
        FROM mt_table 
        WHERE id = NEW.resource_id;
    END IF;
    
    -- 确保权限的租户ID正确
    IF NEW.tenant_id != user_tenant_id OR (resource_tenant_id IS NOT NULL AND NEW.tenant_id != resource_tenant_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Permission tenant_id validation failed';
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table mt_table
-- ----------------------------
DROP TRIGGER IF EXISTS `tr_table_insert_tenant_check`;
delimiter ;;
CREATE TRIGGER `tr_table_insert_tenant_check` BEFORE INSERT ON `mt_table` FOR EACH ROW BEGIN
    DECLARE creator_tenant_id BIGINT;
    
    -- 获取创建者的租户ID
    SELECT tenant_id INTO creator_tenant_id 
    FROM mt_user 
    WHERE id = NEW.created_by;
    
    -- 确保表格的租户ID与创建者一致
    IF NEW.tenant_id != creator_tenant_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Table tenant_id must match creator tenant_id';
    END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
