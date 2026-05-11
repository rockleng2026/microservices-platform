-- ============================================
-- 模块名称: mall-center
-- 功能描述: 订单与支付核心表结构 (Phase 3补录)
-- 创建日期: 2026-05-10
-- ============================================

USE central_mall;

-- ----------------------------------------
-- 订单主表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `order_no` VARCHAR(64) NOT NULL COMMENT '订单号（唯一）',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `address_id` BIGINT COMMENT '收货地址ID（虚拟商品可为空）',
    `goods_type` TINYINT NOT NULL DEFAULT 1 COMMENT '商品类型:1=实物,2=虚拟',
    `total_amount` DECIMAL(12,2) NOT NULL COMMENT '总金额',
    `freight_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '运费',
    `pay_amount` DECIMAL(12,2) NOT NULL COMMENT '实付金额',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1=待付款,2=已付款,3=已发货,4=已完成,5=已取消,6=退款中,7=已退款,8=已关闭',
    `coupon_id` BIGINT COMMENT '使用的优惠券ID',
    `discount_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
    `pay_time` DATETIME COMMENT '支付时间',
    `ship_time` DATETIME COMMENT '发货时间',
    `complete_time` DATETIME COMMENT '完成时间',
    `remark` VARCHAR(255) COMMENT '用户备注',
    `admin_remark` VARCHAR(255) COMMENT '管理员备注',
    `openid` VARCHAR(64) COMMENT '用户openid，用于微信模板消息',
    `del_flag` TINYINT DEFAULT 0 COMMENT '删除标记:0=未删除,1=已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- ----------------------------------------
-- 订单明细表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_order_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `sku_id` BIGINT COMMENT 'SKU ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `goods_name` VARCHAR(128) NOT NULL COMMENT '商品名称',
    `sku_specs` VARCHAR(500) COMMENT '规格(JSON格式)',
    `goods_image` VARCHAR(255) COMMENT '商品图片',
    `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
    `quantity` INT NOT NULL COMMENT '数量',
    `subtotal` DECIMAL(12,2) NOT NULL COMMENT '小计',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- ----------------------------------------
-- 物流信息表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_delivery` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `express_code` VARCHAR(32) COMMENT '快递公司编码',
    `express_name` VARCHAR(64) COMMENT '快递公司名称',
    `waybill_no` VARCHAR(64) COMMENT '运单号',
    `sender_name` VARCHAR(64) COMMENT '发货人姓名',
    `sender_phone` VARCHAR(20) COMMENT '发货人电话',
    `sender_address` VARCHAR(255) COMMENT '发货地址',
    `receiver_name` VARCHAR(64) COMMENT '收货人姓名',
    `receiver_phone` VARCHAR(20) COMMENT '收货人电话',
    `receiver_address` VARCHAR(255) COMMENT '收货地址',
    `status` TINYINT DEFAULT 0 COMMENT '状态:0=待发货,1=运输中,2=已签收,3=拒收,4=退回',
    `ship_time` DATETIME COMMENT '发货时间',
    `delivery_time` DATETIME COMMENT '签收时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_waybill_no` (`waybill_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物流信息表';

-- ----------------------------------------
-- 虚拟商品交付记录表 (Phase 2已有，此处补充)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='虚拟商品交付记录表';

-- ----------------------------------------
-- 库存操作日志表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_stock_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `sku_id` BIGINT NOT NULL COMMENT 'SKU ID',
    `order_id` BIGINT COMMENT '关联订单ID（手动修正时可为空）',
    `change` INT NOT NULL COMMENT '库存变化（正数=增加，负数=减少）',
    `stock_before` INT COMMENT '变更前库存',
    `stock_after` INT COMMENT '变更后库存',
    `operation_type` TINYINT NOT NULL COMMENT '操作类型:1=预占,2=真实扣减,3=释放/回滚,4=手动修正',
    `operator` VARCHAR(64) COMMENT '操作人',
    `remark` VARCHAR(255) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_sku_id` (`sku_id`),
    KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存操作日志表';

-- ----------------------------------------
-- 初始化测试数据
-- ----------------------------------------
-- 测试订单（待付款状态）
INSERT INTO `mall_order` (`tenant_id`, `order_no`, `user_id`, `address_id`, `goods_type`, `total_amount`, `freight_amount`, `pay_amount`, `status`, `remark`, `create_time`) VALUES
('default', 'ORD202605100001', 1, 1, 1, 2999.00, 0.00, 2999.00, 1, 'TestOrder1', NOW()),
('default', 'ORD202605100002', 1, 1, 1, 5998.00, 10.00, 6008.00, 2, 'TestOrder2', NOW()),
('default', 'ORD202605100003', 1, NULL, 2, 99.00, 0.00, 99.00, 4, 'VirtualOrder', NOW());

-- 测试订单项
INSERT INTO `mall_order_item` (`tenant_id`, `order_id`, `user_id`, `sku_id`, `goods_id`, `goods_name`, `sku_specs`, `goods_image`, `price`, `quantity`, `subtotal`, `create_time`) VALUES
('default', 1, 1, 1, 1, '测试商品A', '{"颜色":"黑色","内存":"16GB"}', 'https://picsum.photos/200', 2999.00, 1, 2999.00, NOW()),
('default', 2, 1, 2, 1, '测试商品A', '{"颜色":"银色","内存":"32GB"}', 'https://picsum.photos/200', 2999.00, 2, 5998.00, NOW()),
('default', 3, 1, NULL, 2, '虚拟商品', NULL, 'https://picsum.photos/200', 99.00, 1, 99.00, NOW());

-- 测试物流信息
INSERT INTO `mall_delivery` (`tenant_id`, `order_id`, `express_code`, `express_name`, `waybill_no`, `receiver_name`, `receiver_phone`, `receiver_address`, `status`, `ship_time`) VALUES
('default', 2, 'SF', '顺丰速运', 'SF1234567890', '张三', '13800138000', '北京市朝阳区xxx', 1, NOW());

-- 测试库存日志
INSERT INTO `mall_stock_log` (`tenant_id`, `sku_id`, `order_id`, `change`, `stock_before`, `stock_after`, `operation_type`, `operator`, `remark`) VALUES
('default', 1, 1, -1, 100, 99, 1, 'system', '订单预占'),
('default', 2, 2, -2, 50, 48, 1, 'system', '订单预占');