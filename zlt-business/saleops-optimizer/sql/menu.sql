/*
 盈策通决策平台（saleops-optimizer）菜单表初始化脚本
 参考 menu_page.sql 结构
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
) ENGINE = InnoDB AUTO_INCREMENT = 410 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '菜单页面表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu_page（盈策通决策平台）
-- ----------------------------
-- 一级菜单：盈策通决策平台
INSERT INTO `menu_page` VALUES (400, '盈策通决策平台', 0, '/saleops-optimizer', '盈策通决策平台主入口', NULL, 'bar-chart', 20, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 二级菜单：配置中心
INSERT INTO `menu_page` VALUES (401, '配置中心', 400, '/saleops-optimizer/config-center', '配置中心', NULL, 'setting', 1, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 三级菜单：各功能页
INSERT INTO `menu_page` VALUES (402, '部门分红配置', 401, '/saleops-optimizer/config-center/department-bonus', '部门分红配置', NULL, 'apartment', 1, 1, 0, NOW(), 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (403, '职级薪资标准', 401, '/saleops-optimizer/config-center/position-salary', '职级薪资标准', NULL, 'user', 2, 1, 0, NOW(), 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (404, '员工薪酬配置', 401, '/saleops-optimizer/config-center/employee-salary', '员工薪酬配置', NULL, 'contacts', 3, 1, 0, NOW(), 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (405, '社保公积金基数', 401, '/saleops-optimizer/config-center/social-security', '社保公积金基数', NULL, 'safety', 4, 1, 0, NOW(), 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (406, '地区工资系数', 401, '/saleops-optimizer/config-center/region-coefficient', '地区工资系数', NULL, 'global', 5, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 三级菜单：数据看板
INSERT INTO `menu_page` VALUES (407, '决策数据看板', 400, '/saleops-optimizer/dashboard', '盈策通决策数据看板', NULL, 'dashboard', 2, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 三级菜单：历史记录
INSERT INTO `menu_page` VALUES (408, '历史记录', 400, '/saleops-optimizer/history', '盈策通决策历史记录', NULL, 'history', 3, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 按钮权限（以部门分红配置为例，其他功能页可类推扩展）
INSERT INTO `menu_page` VALUES (409, '新增部门分红', 402, NULL, '新增部门分红按钮', NULL, 'plus', 1, 1, 0, NOW(), 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (410, '编辑部门分红', 402, NULL, '编辑部门分红按钮', NULL, 'edit', 2, 1, 0, NOW(), 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (411, '删除部门分红', 402, NULL, '删除部门分红按钮', NULL, 'delete', 3, 1, 0, NOW(), 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (412, '批量导入部门分红', 402, NULL, '批量导入部门分红按钮', NULL, 'import', 4, 1, 0, NOW(), 'default', NULL, NULL, NULL);
INSERT INTO `menu_page` VALUES (413, '批量导出部门分红', 402, NULL, '批量导出部门分红按钮', NULL, 'export', 5, 1, 0, NOW(), 'default', NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
