-- =========================================
-- 商城使用帮助文档菜单初始化脚本
-- 执行前请备份数据库
-- 数据库: central_organization
-- =========================================

-- =========================================
-- Step 1: 添加商城使用帮助文档父菜单到 menu_page 表
-- =========================================

-- 添加商城使用帮助文档父菜单 (ID: 900)
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (900, '商城使用帮助文档', 0, '/mall-help', '商城使用帮助文档', NULL, 'question-circle', 90, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '商城使用帮助文档', `link_url` = '/mall-help', `sort_order` = 90, `status` = 1, `icon` = 'question-circle';

-- =========================================
-- Step 2: 添加商城使用帮助文档子菜单
-- =========================================

INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES
(901, '接口文档', 900, '/mall-help/api', '商城接口文档', NULL, 'api', 1, 1, 0, NOW(), 'default'),
(902, '菜单使用说明', 900, '/mall-help/menu', '商城菜单使用说明', NULL, 'menu', 2, 1, 0, NOW(), 'default'),
(903, 'FAQ', 900, '/mall-help/faq', '常见问题与解决方案', NULL, 'solution', 3, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `link_url` = VALUES(`link_url`), `sort_order` = VALUES(`sort_order`);

-- =========================================
-- Step 3: 为岗位添加商城使用帮助文档菜单权限
-- =========================================

-- 为管理员岗位添加商城使用帮助文档菜单ID (ID=1 的总经理岗位)
UPDATE `workposition`
SET `menu_ids` = CONCAT(IFNULL(`menu_ids`, ''), ',900,901,902,903')
WHERE `tenant_id` = 'default'
AND `menu_ids` IS NOT NULL
AND `id` = 1;

-- =========================================
-- Step 4: 验证结果
-- =========================================

-- 验证菜单是否添加成功
SELECT id, parent_id, name, link_url, icon, sort_order, status
FROM menu_page
WHERE id >= 900 AND id <= 903
ORDER BY id;

-- 验证岗位权限是否更新
SELECT id, name, menu_ids FROM workposition WHERE tenant_id = 'default' AND menu_ids LIKE '%900%' LIMIT 5;