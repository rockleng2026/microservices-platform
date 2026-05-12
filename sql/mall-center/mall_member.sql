-- ----------------------------------------
-- 会员资料表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_member` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `nickname` VARCHAR(64) COMMENT '昵称',
    `avatar` VARCHAR(500) COMMENT '头像URL',
    `wx_open_id` VARCHAR(128) COMMENT '微信OpenId',
    `wx_nickname` VARCHAR(64) COMMENT '微信昵称',
    `phone` VARCHAR(20) COMMENT '手机号',
    `gender` TINYINT COMMENT '性别:0=未知,1=男,2=女',
    `birthday` DATE COMMENT '生日',
    `province` VARCHAR(32) COMMENT '省份',
    `city` VARCHAR(32) COMMENT '城市',
    `remark` VARCHAR(255) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员资料表';
