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

 Date: 17/06/2025 10:36:25
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
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '字段类型ID，主键',
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
  `tenant_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属租户ID',
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
  INDEX `idx_tenant`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 100007 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '权限管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_permission
-- ----------------------------
INSERT INTO `mt_permission` VALUES (100000, 'default', 'table', 2001, 1002, 'admin', 1001, NULL, '2025-06-16 17:11:15', '2025-06-17 10:31:09');
INSERT INTO `mt_permission` VALUES (100001, 'default', 'table', 2001, 1003, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-17 10:31:09');
INSERT INTO `mt_permission` VALUES (100002, 'default', 'table', 2001, 1004, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-17 10:31:09');
INSERT INTO `mt_permission` VALUES (100003, 'default', 'table', 2001, 1005, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-17 10:31:09');
INSERT INTO `mt_permission` VALUES (100004, 'default', 'table', 2001, 1006, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-17 10:31:09');
INSERT INTO `mt_permission` VALUES (100005, 'default', 'table', 2001, 1007, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-17 10:31:09');
INSERT INTO `mt_permission` VALUES (100006, 'default', 'table', 2001, 1008, 'write', 1002, NULL, '2025-06-16 17:11:15', '2025-06-17 10:31:09');

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
  CONSTRAINT `fk_row_table` FOREIGN KEY (`table_id`) REFERENCES `mt_table` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
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
  `tenant_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属租户ID',
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
  INDEX `idx_tenant`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '表格基础信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_table
-- ----------------------------
INSERT INTO `mt_table` VALUES (2001, 'default', '员工满意度调查问卷', '公司年度员工满意度调查问卷，用于收集员工对公司各方面的反馈意见', 102, '📊', '#4CAF50', 1002, 5, 10, 3, 0, NULL, 1, '2025-06-16 17:11:15', '2025-06-17 10:31:14');

-- ----------------------------
-- Table structure for mt_team
-- ----------------------------
DROP TABLE IF EXISTS `mt_team`;
CREATE TABLE `mt_team`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '团队ID，主键',
  `tenant_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属租户ID',
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
  INDEX `idx_tenant`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 104 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '团队组织表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_team
-- ----------------------------
INSERT INTO `mt_team` VALUES (101, 'default', '默认团队', '系统默认团队，用于组织管理', 1001, NULL, 4, 1, '2025-06-16 17:11:15', '2025-06-17 10:31:16');
INSERT INTO `mt_team` VALUES (102, 'default', '人事管理团队', '负责人事相关业务管理', 1002, NULL, 3, 1, '2025-06-16 17:11:15', '2025-06-17 10:31:16');
INSERT INTO `mt_team` VALUES (103, 'default', '产品研发团队', '负责产品开发和技术管理', 1003, NULL, 4, 1, '2025-06-16 17:11:15', '2025-06-17 10:31:16');

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
  CONSTRAINT `fk_view_table` FOREIGN KEY (`table_id`) REFERENCES `mt_table` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10003 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '表格视图配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_view
-- ----------------------------
INSERT INTO `mt_view` VALUES (10000, 2001, '问卷结果汇总', 'grid', '显示所有问卷填写结果的表格视图', '{\"sorts\": [{\"fieldKey\": \"submit_time\", \"direction\": \"desc\"}], \"fields\": [{\"width\": 120, \"visible\": true, \"fieldKey\": \"respondent_name\"}, {\"width\": 120, \"visible\": true, \"fieldKey\": \"respondent_dept\"}, {\"width\": 160, \"visible\": true, \"fieldKey\": \"submit_time\"}, {\"width\": 140, \"visible\": true, \"fieldKey\": \"leadership_satisfaction\"}, {\"width\": 140, \"visible\": true, \"fieldKey\": \"colleague_relationship\"}, {\"width\": 140, \"visible\": true, \"fieldKey\": \"superior_communication\"}, {\"width\": 120, \"visible\": true, \"fieldKey\": \"work_pressure\"}, {\"width\": 180, \"visible\": true, \"fieldKey\": \"improvement_areas\"}, {\"width\": 100, \"visible\": true, \"fieldKey\": \"overall_rating\"}], \"groups\": [], \"filters\": []}', 1, 1, 1, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_view` VALUES (10001, 2001, '满意度统计看板', 'kanban', '按部门分组显示满意度调查结果', '{\"sorts\": [{\"fieldKey\": \"overall_rating\", \"direction\": \"desc\"}], \"filters\": [], \"cardFields\": [\"respondent_name\", \"leadership_satisfaction\", \"overall_rating\"], \"colorField\": \"leadership_satisfaction\", \"groupByField\": \"respondent_dept\"}', 0, 1, 2, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');
INSERT INTO `mt_view` VALUES (10002, 2001, '问卷填写表单', 'form', '用于员工填写满意度调查问卷的表单视图', '{\"sections\": [{\"title\": \"基本信息\", \"fields\": [\"respondent_name\", \"respondent_dept\"]}, {\"title\": \"满意度评价\", \"fields\": [\"leadership_satisfaction\", \"colleague_relationship\", \"superior_communication\", \"work_pressure\"]}, {\"title\": \"改进建议\", \"fields\": [\"improvement_areas\", \"other_feedback\", \"overall_rating\"]}], \"submitText\": \"提交问卷\", \"successMessage\": \"感谢您的参与，问卷已成功提交！\"}', 0, 1, 3, 1002, '2025-06-16 17:11:15', '2025-06-16 17:11:15');

SET FOREIGN_KEY_CHECKS = 1;
