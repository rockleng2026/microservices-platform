-- ============================================
-- 模块名称: mall-center
-- 功能描述: 商城核心表结构
-- 创建日期: 2026-05-08
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS central_mall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE central_mall;

-- ----------------------------------------
-- 1. 商品分类表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父级ID',
    `name` VARCHAR(64) NOT NULL COMMENT '分类名称',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `icon` VARCHAR(255) COMMENT '图标',
    `status` TINYINT DEFAULT 1 COMMENT '状态(0禁用,1启用)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类';

-- ----------------------------------------
-- 2. 商品表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_goods` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `category_id` BIGINT NOT NULL COMMENT '分类ID',
    `name` VARCHAR(128) NOT NULL COMMENT '商品名称',
    `sub_title` VARCHAR(255) COMMENT '副标题',
    `main_image` VARCHAR(255) COMMENT '主图',
    `images` TEXT COMMENT '商品图集(JSON数组)',
    `detail` LONGTEXT COMMENT '详情(富文本)',
    `price` DECIMAL(10,2) COMMENT '划线价/参考价',
    `sales` INT DEFAULT 0 COMMENT '销量',
    `status` TINYINT DEFAULT 1 COMMENT '状态(0下架,1上架)',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `goods_type` TINYINT NOT NULL DEFAULT 1 COMMENT '商品类型:1实物,2虚拟',
    `virtual_url` VARCHAR(500) COMMENT '虚拟资源链接',
    `virtual_file_id` BIGINT COMMENT '虚拟资源文件ID',
    `virtual_expire` DATETIME COMMENT '资源有效期',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `del_flag` TINYINT DEFAULT 0 COMMENT '删除标志(0未删,1已删)',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category_id`),
    KEY `idx_tenant` (`tenant_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品信息';

-- ----------------------------------------
-- 3. 商品规格表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_goods_spec` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `spec_name` VARCHAR(64) NOT NULL COMMENT '规格名称(如CPU型号)',
    `spec_values` TEXT COMMENT '规格值列表(JSON:["i7-13700","i9-13900"])',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格定义';

-- ----------------------------------------
-- 4. 商品SKU表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_goods_sku` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `sku_code` VARCHAR(128) COMMENT '商家SKU编码',
    `specs` TEXT COMMENT '规格组合(JSON:{"CPU型号":"i7-13700","内存":"32GB"})',
    `price` DECIMAL(10,2) NOT NULL COMMENT '销售价',
    `stock` INT NOT NULL DEFAULT 0 COMMENT '库存数量(-1表示无限制)',
    `image` VARCHAR(255) COMMENT 'SKU图片',
    `status` TINYINT DEFAULT 1 COMMENT '状态(0禁用,1启用)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_goods_id` (`goods_id`),
    KEY `idx_sku_code` (`sku_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU';

-- ----------------------------------------
-- 5. 购物车表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_cart` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `sku_id` BIGINT NOT NULL COMMENT 'SKU ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
    `checked` TINYINT DEFAULT 1 COMMENT '是否选中(1是,0否)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_sku` (`user_id`,`sku_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车';

-- ----------------------------------------
-- 6. 收货地址表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_user_address` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `name` VARCHAR(32) NOT NULL COMMENT '收货人',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `province` VARCHAR(32) NOT NULL COMMENT '省份',
    `city` VARCHAR(32) NOT NULL COMMENT '城市',
    `district` VARCHAR(32) NOT NULL COMMENT '区县',
    `detail` VARCHAR(255) NOT NULL COMMENT '详细地址',
    `is_default` TINYINT DEFAULT 0 COMMENT '是否默认(0否,1是)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址';

-- ----------------------------------------
-- 初始化测试数据
-- ----------------------------------------
INSERT INTO `mall_category` (`id`, `tenant_id`, `parent_id`, `name`, `sort`, `status`) VALUES
(1, 'SUPER', 0, '服务器', 1, 1),
(2, 'SUPER', 0, 'CPU处理器', 2, 1),
(3, 'SUPER', 0, '内存', 3, 1),
(4, 'SUPER', 0, 'NAS存储', 4, 1),
(5, 'SUPER', 0, '网络设备', 5, 1),
(6, 'SUPER', 0, '技术文档', 6, 1);

INSERT INTO `mall_goods` (`id`, `tenant_id`, `category_id`, `name`, `sub_title`, `main_image`, `price`, `sales`, `status`, `goods_type`) VALUES
(1, 'SUPER', 1, 'Dell PowerEdge R750 服务器', '2U机架式服务器', '/images/goods/dell_r750.jpg', 25999.00, 100, 1, 1),
(2, 'SUPER', 2, 'Intel Xeon Gold 6348', '28核56线程处理器', '/images/goods/xeon_6348.jpg', 8999.00, 50, 1, 1),
(3, 'SUPER', 3, '三星 64GB DDR5 ECC', '服务器内存 4800MHz', '/images/goods/ddr5_64g.jpg', 1899.00, 200, 1, 1),
(4, 'SUPER', 6, 'Kubernetes实战指南', '云原生架构与实践', '/images/goods/k8s_guide.jpg', 99.00, 1000, 1, 2);

-- ----------------------------------------
-- 7. 轮播图管理表 (Phase 2)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_banner` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `title` VARCHAR(128) NOT NULL COMMENT '轮播图标题',
    `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
    `link_type` TINYINT NOT NULL DEFAULT 1 COMMENT '链接类型:1=商品,2=外部链接',
    `goods_id` BIGINT COMMENT '关联商品ID',
    `external_url` VARCHAR(500) COMMENT '外部链接地址',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图管理';

-- ----------------------------------------
-- 8. SKU规格定义表 (Phase 2)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_spec` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `spec_name` VARCHAR(64) NOT NULL COMMENT '规格名称(如:颜色,内存,硬盘)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SKU规格定义';

-- ----------------------------------------
-- 9. SKU规格值表 (Phase 2)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_spec_value` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `spec_id` BIGINT NOT NULL COMMENT '规格ID',
    `spec_value` VARCHAR(128) NOT NULL COMMENT '规格值(如:红色,16GB,1TB)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_spec_id` (`spec_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SKU规格值';

-- ----------------------------------------
-- 10. 物流公司表 (Phase 2)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_express` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `name` VARCHAR(64) NOT NULL COMMENT '物流公司名称',
    `code` VARCHAR(32) NOT NULL COMMENT '物流编码',
    `logo` VARCHAR(255) COMMENT 'Logo URL',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物流公司';

-- ----------------------------------------
-- 11. 系统配置表 (Phase 2)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_settings` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `setting_key` VARCHAR(128) NOT NULL COMMENT '配置键',
    `setting_value` TEXT COMMENT '配置值(AES加密存储敏感信息)',
    `value_type` VARCHAR(32) DEFAULT 'string' COMMENT '值类型:string,int,json',
    `description` VARCHAR(255) COMMENT '配置描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tenant_key` (`tenant_id`, `setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置';

-- ----------------------------------------
-- 12. 虚拟商品交付记录表 (Phase 2)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_resource_delivery` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `order_item_id` BIGINT NOT NULL COMMENT '订单项ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `sku_id` BIGINT COMMENT 'SKU ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `resource_url` VARCHAR(500) COMMENT '资源下载链接',
    `file_id` BIGINT COMMENT '文件ID',
    `token` VARCHAR(64) NOT NULL COMMENT '下载Token(UUID)',
    `deliver_time` DATETIME COMMENT '交付时间',
    `expire_time` DATETIME COMMENT '过期时间',
    `download_count` INT DEFAULT 0 COMMENT '下载次数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_order_id` (`order_id`),
    UNIQUE KEY `uk_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='虚拟商品交付记录';

-- ----------------------------------------
-- 13. 优惠券模板表 (Phase 2+)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_coupon_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `name` VARCHAR(64) NOT NULL COMMENT '券名称',
    `type` TINYINT NOT NULL COMMENT '类型:1=满减券,2=折扣券,3=无门槛券',
    `face_value` DECIMAL(10,2) COMMENT '面额（满减券）',
    `discount_rate` DECIMAL(5,4) COMMENT '折扣率（折扣券，如0.85=85折）',
    `min_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '最低消费金额',
    `max_discount` DECIMAL(10,2) COMMENT '最高优惠金额',
    `total_count` INT NOT NULL COMMENT '总数量',
    `remain_count` INT NOT NULL COMMENT '剩余数量',
    `per_user_limit` INT DEFAULT 1 COMMENT '每人限领数量',
    `valid_type` TINYINT NOT NULL COMMENT '有效期类型:1=固定日期,2=领取后N天',
    `start_time` DATETIME COMMENT '开始时间',
    `end_time` DATETIME COMMENT '结束时间',
    `valid_days` INT COMMENT '领取后有效天数',
    `status` TINYINT DEFAULT 0 COMMENT '状态:0=未发布,1=已发布,2=已下架',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券模板';

-- ----------------------------------------
-- 14. 用户优惠券表 (Phase 2+)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_coupon` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `template_id` BIGINT NOT NULL COMMENT '模板ID',
    `coupon_no` VARCHAR(32) NOT NULL COMMENT '唯一标识',
    `name` VARCHAR(64) NOT NULL COMMENT '券名称',
    `type` TINYINT NOT NULL COMMENT '类型:1=满减券,2=折扣券,3=无门槛券',
    `face_value` DECIMAL(10,2) COMMENT '面额',
    `discount_rate` DECIMAL(5,4) COMMENT '折扣率',
    `min_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '最低消费金额',
    `max_discount` DECIMAL(10,2) COMMENT '最高优惠金额',
    `order_id` BIGINT COMMENT '关联使用的订单',
    `status` TINYINT DEFAULT 1 COMMENT '状态:1=未使用,2=已使用,3=已过期',
    `receive_time` DATETIME COMMENT '领取时间',
    `use_time` DATETIME COMMENT '使用时间',
    `expire_time` DATETIME COMMENT '过期时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_template_id` (`template_id`),
    UNIQUE KEY `uk_coupon_no` (`coupon_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券';

-- ----------------------------------------
-- 15. 用户积分账户表 (Phase 2+)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_points_account` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `balance` INT DEFAULT 0 COMMENT '当前余额',
    `total_earned` INT DEFAULT 0 COMMENT '累计获得',
    `total_spent` INT DEFAULT 0 COMMENT '累计消耗',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户积分账户';

-- ----------------------------------------
-- 16. 积分变动日志表 (Phase 2+)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_points_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `type` TINYINT NOT NULL COMMENT '类型:1=获得,2=消耗',
    `points` INT NOT NULL COMMENT '积分数量',
    `balance_after` INT NOT NULL COMMENT '变动后余额',
    `source` VARCHAR(32) NOT NULL COMMENT '来源:ORDER,REFUND,REDEEM',
    `source_id` VARCHAR(64) COMMENT '关联业务ID',
    `remark` VARCHAR(255) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_source` (`source`, `source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分变动日志';

-- ----------------------------------------
-- 17. 促销活动表 (Phase 2+)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_marketing_activity` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `name` VARCHAR(128) NOT NULL COMMENT '活动名称',
    `type` TINYINT NOT NULL COMMENT '类型:1=满减,2=折扣,3=买赠',
    `rule_json` TEXT COMMENT '规则JSON: {"minAmount":100,"discountAmount":10}',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `end_time` DATETIME NOT NULL COMMENT '结束时间',
    `status` TINYINT DEFAULT 1 COMMENT '状态:1=待发布,2=进行中,3=已结束',
    `priority` INT DEFAULT 0 COMMENT '优先级',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='促销活动';

-- ----------------------------------------
-- 初始化规格测试数据 (Phase 2)
-- ----------------------------------------
INSERT INTO `mall_spec` (`id`, `tenant_id`, `spec_name`) VALUES
(1, 'SUPER', '颜色'),
(2, 'SUPER', '内存'),
(3, 'SUPER', '硬盘');

INSERT INTO `mall_spec_value` (`id`, `tenant_id`, `spec_id`, `spec_value`) VALUES
(1, 'SUPER', 1, '黑色'),
(2, 'SUPER', 1, '银色'),
(3, 'SUPER', 2, '16GB'),
(4, 'SUPER', 2, '32GB'),
(5, 'SUPER', 2, '64GB'),
(6, 'SUPER', 3, '512GB'),
(7, 'SUPER', 3, '1TB'),
(8, 'SUPER', 3, '2TB');
