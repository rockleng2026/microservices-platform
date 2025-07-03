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

 Date: 04/07/2025 03:11:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for menu_page
-- ----------------------------
DROP TABLE IF EXISTS `menu_page`;
CREATE TABLE `menu_page`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜单名称',
  `parent_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '父级id',
  `link_url` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '链接功能页面',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '权限描述',
  `image_path` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图片路径',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图标',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `delflag` int(11) NULL DEFAULT 0 COMMENT '删除标识',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) NULL DEFAULT NULL,
  `updated_by` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_tenant_id`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 310 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '菜单页面表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu_page
-- ----------------------------
INSERT INTO `menu_page` VALUES (1, '工作台', 0, '/dashboard', '系统工作台', NULL, 'dashboard', 1, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (2, '组织架构', 0, '/organization', '组织架构管理', NULL, 'team', 2, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (3, '部门管理', 2, '/organization/departments', '部门管理页面', NULL, 'apartment', 1, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (4, '员工管理', 2, '/organization/employees', '员工管理页面', NULL, 'user', 2, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (5, '岗位管理', 2, '/organization/positions', '岗位管理页面', NULL, 'contacts', 3, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (6, 'CRM管理', 0, '/crm', 'CRM客户关系管理', NULL, 'user-group', 3, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (8, '产品管理', 0, '/product', '产品管理', NULL, 'box', 4, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (9, '订单管理', 0, '/order', '订单管理', NULL, 'file-text', 5, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (10, '系统管理', 0, '/system', '系统管理', NULL, 'settings', 6, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (11, '用户管理', 10, '/system/user', '系统用户管理页面', NULL, 'user', 1, 1, 0, '2025-06-10 11:08:19', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (12, '角色管理', 10, '/system/role', '系统角色管理页面', NULL, 'team', 2, 1, 0, '2025-06-10 11:08:19', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (13, '菜单管理', 10, '/system/menu', '系统菜单管理页面', NULL, 'menu', 3, 1, 0, '2025-06-10 11:08:19', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (14, '权限管理', 10, '/system/permission', '系统权限管理页面', NULL, 'safety-certificate', 4, 1, 0, '2025-06-10 11:08:19', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (15, '操作日志', 10, '/system/log', '系统操作日志页面', NULL, 'history', 5, 1, 0, '2025-06-10 11:08:19', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (16, '系统配置', 10, '/system/config', '系统配置管理页面', NULL, 'tool', 6, 1, 0, '2025-06-10 11:08:19', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (17, '租户管理', 10, '/system/tenant', '租户管理页面', NULL, 'cluster', 7, 1, 0, '2025-06-10 11:08:19', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (18, '租户配置', 10, '/system/tenant-config', '租户配置管理页面', NULL, 'setting', 8, 1, 0, '2025-06-10 11:08:19', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (19, '部门岗位', 2, '/organization/departments/positions', '部门岗位管理页面', NULL, 'contacts', 4, 1, 0, '2025-06-09 23:36:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (61, 'CRM工作台', 6, '/crm/dashboard', 'CRM数据概览和工作台', NULL, 'dashboard', 1, 1, 0, '2025-07-01 20:15:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (62, '客户管理', 6, '/crm/customers', '客户信息管理', NULL, 'contacts', 2, 1, 0, '2025-07-01 20:15:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (63, '商机管理', 6, '/crm/opportunities', '销售商机管理', NULL, 'fund', 3, 1, 0, '2025-07-01 20:15:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (64, '跟进记录', 6, '/crm/follow-records', '客户跟进记录管理', NULL, 'phone', 4, 1, 0, '2025-07-01 20:15:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (65, '客户移交', 6, '/crm/transfers', '客户移交审批管理', NULL, 'swap', 5, 1, 0, '2025-07-01 20:15:38', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (100, '项目管理', 0, '/project', '项目全生命周期管理', NULL, 'project', 10, 1, 0, '2025-06-24 12:04:42', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (101, '项目列表', 100, '/project/list', '项目列表管理', NULL, 'unordered-list', 1, 1, 0, '2025-06-24 12:04:42', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (102, '我的项目', 100, '/project/my', '我参与的项目', NULL, 'user', 2, 1, 0, '2025-06-24 12:04:42', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (103, '项目审批', 100, '/project/approval', '项目立项和结项审批', NULL, 'audit', 3, 1, 0, '2025-06-24 12:04:42', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (104, '项目统计', 100, '/project/statistics', '项目数据统计分析', NULL, 'bar-chart', 4, 1, 0, '2025-06-24 12:04:42', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (105, '项目模板', 100, '/project/template', '项目模板管理', NULL, 'copy', 5, 1, 0, '2025-06-24 12:04:42', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (106, '产品毛利配置', 100, '/project/profit-guide', '产品毛利分配指导配置', NULL, 'dollar', 6, 1, 0, '2025-06-24 12:04:42', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (200, '绩效管理', 0, '/performance', '员工绩效考核管理', NULL, 'dashboard', 11, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (201, '绩效考核', 200, '/performance/appraisal', '绩效考核评估', NULL, 'form', 1, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (202, '我的绩效', 200, '/performance/my', '个人绩效查看', NULL, 'user', 2, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (203, '绩效审批', 200, '/performance/approval', '绩效考核审批', NULL, 'check-circle', 3, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (204, '绩效指标', 200, '/performance/indicator', '绩效指标管理', NULL, 'aim', 4, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (205, '考核周期', 200, '/performance/cycle', '考核周期管理', NULL, 'calendar', 5, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (206, '绩效报表', 200, '/performance/report', '绩效统计报表', NULL, 'line-chart', 6, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (207, '绩效排名', 200, '/performance/ranking', '绩效排名榜', NULL, 'trophy', 7, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (208, '绩效设置', 200, '/performance/config', '绩效系统配置', NULL, 'setting', 8, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (300, '薪酬管理', 0, '/salary', '员工薪酬福利管理', NULL, 'money-collect', 12, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (301, '薪资核算', 300, '/salary/calculation', '员工薪资核算', NULL, 'calculator', 1, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (302, '工资条', 300, '/salary/payslip', '工资条查看和发放', NULL, 'file-text', 2, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (303, '薪资调整', 300, '/salary/adjustment', '薪资调整申请审批', NULL, 'rise', 3, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (304, '薪资结构', 300, '/salary/structure', '薪资结构设置', NULL, 'build', 4, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (305, '福利管理', 300, '/salary/benefit', '员工福利管理', NULL, 'heart', 5, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (306, '社保管理', 300, '/salary/insurance', '社保公积金管理', NULL, 'safety', 6, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (307, '个税管理', 300, '/salary/tax', '个人所得税管理', NULL, 'bank', 7, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (308, '薪资报表', 300, '/salary/report', '薪资统计报表', NULL, 'fund', 8, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (309, '薪资设置', 300, '/salary/config', '薪资系统配置', NULL, 'tool', 9, 1, 0, '2025-06-24 12:04:43', 'default', NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
