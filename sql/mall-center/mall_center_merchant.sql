-- 商户表 - Phase 07-02 多租户商户平台
CREATE TABLE IF NOT EXISTS `mall_merchant` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商户ID',
  `tenant_id` VARCHAR(64) DEFAULT NULL COMMENT '商户分配的租户ID（如 MERCHANT_001）',
  `merchant_name` VARCHAR(128) NOT NULL COMMENT '商户名称（营业执照名称）',
  `contact_name` VARCHAR(64) DEFAULT NULL COMMENT '联系人姓名',
  `contact_phone` VARCHAR(32) DEFAULT NULL COMMENT '联系人电话',
  `business_license_url` VARCHAR(512) DEFAULT NULL COMMENT '营业执照图片URL',
  `status` INT NOT NULL DEFAULT 0 COMMENT '状态：0=待审核, 1=已通过, 2=已拒绝',
  `reject_reason` VARCHAR(256) DEFAULT NULL COMMENT '拒绝原因',
  `apply_time` DATETIME DEFAULT NULL COMMENT '申请时间',
  `review_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户表';

-- 插入测试商户数据
INSERT INTO `mall_merchant` (`merchant_name`, `contact_name`, `contact_phone`, `business_license_url`, `status`, `apply_time`, `review_time`, `reject_reason`) VALUES
('Test Merchant Tech Co.', 'Zhang San', '13800138001', 'https://example.com/license1.jpg', 0, NOW(), NULL, NULL),
('Example Merchant Group', 'Li Si', '13900139002', 'https://example.com/license2.jpg', 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NULL),
('Rejected Merchant Ltd.', 'Wang Wu', '13700137003', 'https://example.com/license3.jpg', 2, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Qualification does not meet requirements');