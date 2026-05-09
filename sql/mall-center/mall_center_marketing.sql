-- ============================================
-- 增量SQL: 添加营销模块表结构
-- 执行日期: 2026-05-10
-- ============================================

USE central_mall;

-- ----------------------------------------
-- 13. 优惠券模板表
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
-- 14. 用户优惠券表
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
-- 15. 用户积分账户表
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
-- 16. 积分变动日志表
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
-- 17. 促销活动表
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
-- 初始化测试数据
-- ----------------------------------------
INSERT INTO `mall_coupon_template` (`tenant_id`, `name`, `type`, `face_value`, `min_amount`, `total_count`, `remain_count`, `per_user_limit`, `valid_type`, `valid_days`, `status`) VALUES
('SUPER', '新人满100减10优惠券', 1, 10.00, 100.00, 1000, 1000, 1, 2, 30, 1),
('SUPER', '85折折扣券', 2, 0.00, 200.00, 500, 500, 1, 2, 7, 1);

-- 用户积分账户测试数据
INSERT INTO `mall_points_account` (`tenant_id`, `user_id`, `balance`, `total_earned`, `total_spent`) VALUES
('SUPER', 1, 500, 600, 100);