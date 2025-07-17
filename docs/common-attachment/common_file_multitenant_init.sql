-- 通用附件管理-多租户版-数据库初始化脚本

-- 附件主表
CREATE TABLE common_attachment (
    id BIGINT PRIMARY KEY COMMENT '主键，雪花算法生成',
    tenant_id VARCHAR(32) NOT NULL DEFAULT 'default' COMMENT '租户ID',
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_key VARCHAR(100) NOT NULL UNIQUE COMMENT '存储唯一标识(UUID)',
    file_type VARCHAR(50) COMMENT 'MIME类型',
    file_size BIGINT COMMENT '字节数',
    storage_type VARCHAR(20) COMMENT '存储类型 OSS/LOCAL/S3等',
    md5 CHAR(32) COMMENT '文件摘要',
    upload_time DATETIME NOT NULL COMMENT '上传时间',
    upload_user_id BIGINT COMMENT '上传用户ID',
    sort_order INT DEFAULT 0 COMMENT '排序字段，用户自定义显示顺序',
    delflag TINYINT(1) NULL DEFAULT 0 COMMENT '删除标识',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT NULL DEFAULT NULL COMMENT '创建人',
    updated_by BIGINT NULL DEFAULT NULL COMMENT '更新人',
    INDEX idx_tenant (tenant_id),
    INDEX idx_upload_user (upload_user_id),
    INDEX idx_upload_time (upload_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通用附件主表';

-- 附件关联表
CREATE TABLE common_attachment_rel (
    id BIGINT PRIMARY KEY COMMENT '主键，雪花算法生成',
    tenant_id VARCHAR(32) NOT NULL DEFAULT 'default' COMMENT '租户ID',
    biz_id BIGINT NOT NULL COMMENT '业务主键',
    biz_type VARCHAR(50) NOT NULL COMMENT '业务类型（如order、product）',
    attachment_id BIGINT NOT NULL COMMENT '附件ID',
    sort_order INT DEFAULT 0 COMMENT '排序字段',
    delflag TINYINT(1) NULL DEFAULT 0 COMMENT '删除标识',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT NULL DEFAULT NULL COMMENT '创建人',
    updated_by BIGINT NULL DEFAULT NULL COMMENT '更新人',
    FOREIGN KEY (attachment_id) REFERENCES common_attachment(id),
    INDEX idx_tenant_biz (tenant_id, biz_type, biz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通用附件关联表';

-- 附件元数据表（可选）
CREATE TABLE common_attachment_meta (
    tenant_id VARCHAR(32) NOT NULL DEFAULT 'default' COMMENT '租户ID',
    attachment_id BIGINT NOT NULL COMMENT '附件ID',
    meta_key VARCHAR(50) NOT NULL COMMENT '元数据键',
    meta_value VARCHAR(200) COMMENT '元数据值',
    delflag TINYINT(1) NULL DEFAULT 0 COMMENT '删除标识',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT NULL DEFAULT NULL COMMENT '创建人',
    updated_by BIGINT NULL DEFAULT NULL COMMENT '更新人',
    PRIMARY KEY (tenant_id, attachment_id, meta_key),
    INDEX idx_attachment (attachment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通用附件元数据表'; 



-- 插入演示租户
SET @tenant_id = 'default';

-- 附件主表示例数据
INSERT INTO common_attachment (
    id, tenant_id, original_name, file_key, file_type, file_size, storage_type, md5, upload_time, upload_user_id, sort_order, delflag, created_at, updated_at, created_by, updated_by
) VALUES
(10001, @tenant_id, '合同.pdf', 'filekey-001', 'application/pdf', 204800, 'OSS', 'd41d8cd98f00b204e9800998ecf8427e', NOW(), 1, 1, 0, NOW(), NOW(), 1, 1),
(10002, @tenant_id, '发票.jpg', 'filekey-002', 'image/jpeg', 102400, 'OSS', 'e2fc714c4727ee9395f324cd2e7f331f', NOW(), 2, 2, 0, NOW(), NOW(), 2, 2);

-- 附件关联表示例数据
INSERT INTO common_attachment_rel (
    id, tenant_id, biz_id, biz_type, attachment_id, sort_order, delflag, created_at, updated_at, created_by, updated_by
) VALUES
(20001, @tenant_id, 30001, 'order', 10001, 1, 0, NOW(), NOW(), 1, 1),
(20002, @tenant_id, 30001, 'order', 10002, 2, 0, NOW(), NOW(), 2, 2);

-- 附件元数据表示例数据
INSERT INTO common_attachment_meta (
    tenant_id, attachment_id, meta_key, meta_value, delflag, created_at, updated_at, created_by, updated_by
) VALUES
(@tenant_id, 10001, 'is_cover', 'true', 0, NOW(), NOW(), 1, 1),
(@tenant_id, 10001, 'category', '合同', 0, NOW(), NOW(), 1, 1),
(@tenant_id, 10002, 'category', '发票', 0, NOW(), NOW(), 2, 2);