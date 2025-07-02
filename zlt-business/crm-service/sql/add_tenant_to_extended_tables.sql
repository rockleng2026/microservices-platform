-- 为个人客户扩展表添加tenant_id字段
ALTER TABLE individual_customer 
ADD COLUMN tenant_id VARCHAR(32) NOT NULL DEFAULT 'default' COMMENT '租户ID' AFTER id;

-- 为企业客户扩展表添加tenant_id字段  
ALTER TABLE corporate_customer 
ADD COLUMN tenant_id VARCHAR(32) NOT NULL DEFAULT 'default' COMMENT '租户ID' AFTER id;

-- 为individual_customer表添加索引
ALTER TABLE individual_customer 
ADD INDEX idx_tenant_id (tenant_id);

-- 为corporate_customer表添加索引
ALTER TABLE corporate_customer 
ADD INDEX idx_tenant_id (tenant_id);

-- 为了安全起见，更新现有数据的tenant_id
UPDATE individual_customer SET tenant_id = 'default' WHERE tenant_id IS NULL OR tenant_id = '';
UPDATE corporate_customer SET tenant_id = 'default' WHERE tenant_id IS NULL OR tenant_id = ''; 