-- ============================================
-- 模块名称: mall-center
-- 功能描述: 商品评价表
-- 创建日期: 2026-05-13
-- ============================================

USE central_mall;

-- ----------------------------------------
-- 商品评价表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_evaluate` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `order_item_id` BIGINT NOT NULL COMMENT '订单项ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `star` INT NOT NULL COMMENT '评分1-5',
    `content` VARCHAR(500) COMMENT '评价内容',
    `images` TEXT COMMENT '评价图片JSON数组',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_item_id` (`order_item_id`),
    KEY `idx_goods_id` (`goods_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品评价';

-- ----------------------------------------
-- 初始化测试评价数据
-- ----------------------------------------
INSERT INTO `mall_evaluate` (`id`, `tenant_id`, `order_id`, `order_item_id`, `goods_id`, `user_id`, `star`, `content`, `create_time`) VALUES
(1, 'default', 1, 1, 2, 1, 5, '性能很强，运行稳定，非常满意！', '2026-05-10 10:00:00'),
(2, 'default', 2, 2, 2, 1, 4, '还不错，装机一次点亮，就是散热稍微大了一点', '2026-05-11 14:30:00');