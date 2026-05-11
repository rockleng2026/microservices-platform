-- =========================================
-- 商城管理模块菜单初始化脚本
-- 执行前请备份数据库
-- 数据库: central_organization
-- =========================================

-- 检查是否已存在商城管理菜单
SELECT id, name, link_url FROM menu_page WHERE link_url = '/mall-admin' OR name = '商城管理';

-- 添加商城管理父菜单 (ID: 400)
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`, `updated_at`, `created_by`, `updated_by`)
VALUES (400, '商城管理', 0, '/mall-admin', '商城管理系统管理', NULL, 'shopping', 13, 1, 0, NOW(), 'default', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE `name` = '商城管理', `link_url` = '/mall-admin', `sort_order` = 13, `status` = 1;

-- 添加商城管理子菜单
-- 注意: 使用 REPLACE INTO 以便重复执行时更新已有记录

-- 1. 工作台 (Dashboard)
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (401, '工作台', 400, '/mall-admin/dashboard', '商城管理仪表盘', NULL, 'dashboard', 1, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '工作台', `link_url` = '/mall-admin/dashboard', `sort_order` = 1;

-- 2. 商品管理
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (402, '商品管理', 400, '/mall-admin/goods', '商品信息管理', NULL, 'shop', 2, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '商品管理', `link_url` = '/mall-admin/goods', `sort_order` = 2;

-- 3. 分类管理
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (403, '分类管理', 400, '/mall-admin/categories', '商品分类管理', NULL, 'appstore', 3, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '分类管理', `link_url` = '/mall-admin/categories', `sort_order` = 3;

-- 4. 订单管理
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (404, '订单管理', 400, '/mall-admin/orders', '商城订单管理', NULL, 'file-text', 4, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '订单管理', `link_url` = '/mall-admin/orders', `sort_order` = 4;

-- 5. Banner管理
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (405, 'Banner管理', 400, '/mall-admin/banners', '商城轮播图管理', NULL, 'picture', 5, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = 'Banner管理', `link_url` = '/mall-admin/banners', `sort_order` = 5;

-- 6. 优惠券管理 (之前缺失)
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (406, '优惠券管理', 400, '/mall-admin/coupon', '商城优惠券管理', NULL, 'gift', 6, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '优惠券管理', `link_url` = '/mall-admin/coupon', `sort_order` = 6;

-- 7. 库存管理 (之前缺失)
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (407, '库存管理', 400, '/mall-admin/stock', '商城库存管理', NULL, 'box-plot', 7, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '库存管理', `link_url` = '/mall-admin/stock', `sort_order` = 7;

-- 8. 会员管理 (之前缺失) - 注意：用户菜单显示为"客户管理"
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (408, '会员管理', 400, '/mall-admin/member', '商城会员管理', NULL, 'team', 8, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '会员管理', `link_url` = '/mall-admin/member', `sort_order` = 8;

-- =========================================
-- 验证查询
-- =========================================
SELECT id, parent_id, name, link_url, icon, sort_order, status
FROM menu_page
WHERE parent_id = 400 OR link_url LIKE '/mall-admin%'
ORDER BY parent_id, sort_order;

-- =========================================
-- 为超级管理员角色添加商城管理菜单权限
-- 假设超级管理员角色ID为1，请根据实际情况调整
-- =========================================
-- 注意: 具体的角色-菜单关联表结构需要根据实际系统确定
-- 以下为示例，请根据实际情况调整

-- 查询角色-菜单关联表结构
-- SELECT * FROM menu_func LIMIT 1;

-- 为管理员角色添加商城菜单权限（如果系统有角色菜单关联表）
-- INSERT IGNORE INTO `角色菜单关联表` (`角色ID`, `菜单ID`, ...) VALUES (1, 400, ...);
