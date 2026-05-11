-- =========================================
-- 商城管理模块菜单初始化脚本
-- 执行前请备份数据库
-- 数据库: central_organization
-- =========================================

-- =========================================
-- Step 1: 添加商城管理菜单到 menu_page 表
-- =========================================

-- 添加商城管理父菜单 (ID: 400)
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (400, '商城管理', 0, '/mall-admin', '商城管理系统管理', NULL, 'shopping', 13, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '商城管理', `link_url` = '/mall-admin', `sort_order` = 13, `status` = 1;

-- 添加商城管理子菜单
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `image_path`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES
(401, '工作台', 400, '/mall-admin/dashboard', '商城管理仪表盘', NULL, 'dashboard', 1, 1, 0, NOW(), 'default'),
(402, '商品管理', 400, '/mall-admin/goods', '商品信息管理', NULL, 'shop', 2, 1, 0, NOW(), 'default'),
(403, '分类管理', 400, '/mall-admin/categories', '商品分类管理', NULL, 'appstore', 3, 1, 0, NOW(), 'default'),
(404, '订单管理', 400, '/mall-admin/orders', '商城订单管理', NULL, 'file-text', 4, 1, 0, NOW(), 'default'),
(405, 'Banner管理', 400, '/mall-admin/banners', '商城轮播图管理', NULL, 'picture', 5, 1, 0, NOW(), 'default'),
(406, '优惠券管理', 400, '/mall-admin/coupon', '商城优惠券管理', NULL, 'gift', 6, 1, 0, NOW(), 'default'),
(407, '库存管理', 400, '/mall-admin/stock', '商城库存管理', NULL, 'box-plot', 7, 1, 0, NOW(), 'default'),
(408, '会员管理', 400, '/mall-admin/member', '商城会员管理', NULL, 'team', 8, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `link_url` = VALUES(`link_url`), `sort_order` = VALUES(`sort_order`);

-- =========================================
-- Step 2: 为岗位添加商城菜单权限
-- =========================================

-- 查看当前岗位的menu_ids配置
SELECT id, name, menu_ids FROM workposition WHERE tenant_id = 'default' AND menu_ids IS NOT NULL LIMIT 5;

-- 为管理员岗位添加商城菜单ID (ID=1 的总经理岗位)
-- 需要将 400,401,402,403,404,405,406,407,408 添加到 menu_ids 字段
UPDATE workposition
SET menu_ids = CONCAT(IFNULL(menu_ids, ''), ',400,401,402,403,404,405,406,407,408')
WHERE tenant_id = 'default'
AND menu_ids IS NOT NULL
AND id = 1;

-- 如果需要为其他岗位也添加，可以重复执行上面的语句修改 id 值

-- =========================================
-- Step 3: 验证结果
-- =========================================

-- 验证菜单是否添加成功
SELECT id, parent_id, name, link_url, icon, sort_order, status
FROM menu_page
WHERE id >= 400 AND id <= 408
ORDER BY id;

-- 验证岗位权限是否更新
SELECT id, name, menu_ids FROM workposition WHERE tenant_id = 'default' AND menu_ids LIKE '%400%' LIMIT 5;

-- =========================================
-- 如果发现菜单ID重复，可以使用以下SQL清理
-- =========================================
-- CREATE FUNCTION IF NOT EXISTS remove_duplicate_ids(ids TEXT) RETURNS TEXT
-- DETERMINISTIC
-- BEGIN
--   DECLARE result TEXT DEFAULT '';
--   DECLARE cur_id TEXT;
--   DECLARE done INT DEFAULT FALSE;
--   DECLARE cur CURSOR FOR SELECT DISTINCT id FROM (SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(ids, ',', n.n), ',', -1) AS id FROM (SELECT @rownum:=@rownum+1 AS n FROM (SELECT @rownum:=0) r, (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1, (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2) numbers WHERE n.n <= LENGTH(ids) - LENGTH(REPLACE(ids, ',', '')) + 1) AS t WHERE id != '') t;
--   DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
--   OPEN cur;
--   read_loop: LOOP
--     FETCH cur INTO cur_id;
--     IF done THEN LEAVE read_loop; END IF;
--     IF result = '' THEN SET result = cur_id;
--     ELSE SET result = CONCAT(result, ',', cur_id);
--     END IF;
--   END LOOP;
--   CLOSE cur;
--   RETURN result;
-- END;
