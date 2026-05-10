-- ============================================
-- 模块名称: mall-center
-- 功能描述: 退款模块表结构 (Phase 5)
-- 创建日期: 2026-05-10
-- ============================================

USE central_mall;

-- ----------------------------------------
-- 退款申请表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_refund` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `refund_no` VARCHAR(64) NOT NULL COMMENT '退款单号（唯一键，幂等）',
    `refund_type` TINYINT NOT NULL DEFAULT 1 COMMENT '退款类型:1=仅退款,2=退货退款',
    `refund_amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
    `reason` VARCHAR(500) COMMENT '退款原因',
    `evidence_images` TEXT COMMENT '凭证图片(JSON数组格式)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1=待审核,2=审核通过,3=审核拒绝,4=退款中,5=已完成,6=已关闭',
    `admin_id` BIGINT COMMENT '处理管理员ID',
    `admin_remark` VARCHAR(255) COMMENT '管理员备注',
    `wechat_refund_no` VARCHAR(64) COMMENT '微信退款单号',
    `refund_time` DATETIME COMMENT '退款完成时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_refund_no` (`refund_no`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款申请表';

-- ----------------------------------------
-- 退款明细表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_refund_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `refund_id` BIGINT NOT NULL COMMENT '退款申请ID',
    `order_item_id` BIGINT NOT NULL COMMENT '订单项ID',
    `sku_id` BIGINT COMMENT 'SKU ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `quantity` INT NOT NULL COMMENT '退款数量',
    `refund_amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_refund_id` (`refund_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款明细表';