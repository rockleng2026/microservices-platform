-- ============================================
-- 模块名称: mall-center
-- 功能描述: 商城核心表结构
-- 创建日期: 2026-05-08
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS cp_mall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cp_mall;

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
