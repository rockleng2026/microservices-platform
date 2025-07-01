-- CRM客户关系管理系统 - 增强版数据库设计
-- 基于原有设计，添加租户支持和独立的商机表

-- 1. 客户管理相关表
-- ================================

-- 客户主表
DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
                          customer_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '客户唯一标识',
                          tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
                          customer_type ENUM('个人','企业') NOT NULL DEFAULT '个人' COMMENT '客户类型',
                          customer_status ENUM('意向','正式','流失') NOT NULL DEFAULT '意向' COMMENT '客户状态',
                          customer_name VARCHAR(100) NOT NULL COMMENT '客户名称/企业名称',
                          customer_source VARCHAR(50) NULL COMMENT '来源渠道(线上/展会/转介绍等)',
                          customer_level ENUM('A','B','C','D') NULL COMMENT '客户等级',
                          owner_employee_id INT NOT NULL COMMENT '业务负责人',
    -- 审计字段
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                          created_by INT NOT NULL COMMENT '创建人ID',
                          updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                          updated_by INT NULL COMMENT '更新人ID',
                          is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '删除标记(0:正常 1:删除)',

                          PRIMARY KEY (customer_id),
                          INDEX idx_customer_name (customer_name),
                          INDEX idx_owner_employee (owner_employee_id),
                          INDEX idx_customer_status (customer_status),
                          INDEX idx_customer_type (customer_type),
                          INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='客户主表';

-- 商机表（新增）
DROP TABLE IF EXISTS opportunity;
CREATE TABLE opportunity (
    opportunity_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '商机ID',
    tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    opportunity_name VARCHAR(100) NOT NULL COMMENT '商机名称',
    opportunity_source VARCHAR(50) NULL COMMENT '商机来源',
    stage ENUM('初步接触','需求分析','方案报价','商务谈判','合同签署','成交','流失') NOT NULL DEFAULT '初步接触' COMMENT '商机阶段',
    probability TINYINT NULL COMMENT '成交概率(0-100%)',
    expected_amount DECIMAL(12,2) NULL COMMENT '预期金额',
    expected_close_date DATE NULL COMMENT '预期成交日期',
    owner_employee_id INT NOT NULL COMMENT '负责人ID',
    competitor VARCHAR(200) NULL COMMENT '竞争对手',
    description TEXT NULL COMMENT '商机描述',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by INT NOT NULL COMMENT '创建人ID',
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by INT NULL COMMENT '更新人ID',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '删除标记',
    
    PRIMARY KEY (opportunity_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_stage (stage),
    INDEX idx_owner_employee (owner_employee_id)
) ENGINE=InnoDB COMMENT='商机表';


-- 个人客户扩展表
DROP TABLE IF EXISTS individual_customer;
CREATE TABLE individual_customer (
    individual_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '个人ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    id_card VARCHAR(20) NULL COMMENT '身份证号',
    mobile_phone VARCHAR(15) NOT NULL COMMENT '手机号',
    email VARCHAR(50) NULL COMMENT '邮箱',
    weixin VARCHAR(20) NULL COMMENT '微信号',
    date_of_birth DATE NULL COMMENT '出生日期',
    id_card_photo VARCHAR(255) NULL COMMENT '身份证照片路径',
    -- 审计字段
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by INT NOT NULL COMMENT '创建人ID',
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by INT NULL COMMENT '更新人ID',
    
    PRIMARY KEY (individual_id),
    UNIQUE KEY uk_customer_id (customer_id),
    UNIQUE KEY uk_id_card (id_card),
    INDEX idx_mobile_phone (mobile_phone),
    INDEX idx_real_name (real_name),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='个人客户扩展表';

-- 企业客户扩展表
DROP TABLE IF EXISTS corporate_customer;
CREATE TABLE corporate_customer (
    corporate_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '企业ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    business_license VARCHAR(50) NOT NULL COMMENT '营业执照号',
    company_address VARCHAR(200) NOT NULL COMMENT '公司注册地址',
    company_phone VARCHAR(20) NOT NULL COMMENT '公司电话',
    company_fax VARCHAR(20) NULL COMMENT '传真号码',
    company_scale ENUM('小微','中小','大型','集团') NULL COMMENT '公司规模',
    legal_representative VARCHAR(50) NOT NULL COMMENT '法定代表人',
    business_contact VARCHAR(50) NOT NULL COMMENT '业务联系人',
    contact_phone VARCHAR(15) NOT NULL COMMENT '联系人电话',
    -- 审计字段
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by INT NOT NULL COMMENT '创建人ID',
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by INT NULL COMMENT '更新人ID',
    
    PRIMARY KEY (corporate_id),
    UNIQUE KEY uk_customer_id (customer_id),
    UNIQUE KEY uk_business_license (business_license),
    INDEX idx_contact_phone (contact_phone),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='企业客户扩展表';

-- 客户跟进表
DROP TABLE IF EXISTS customer_follow;
CREATE TABLE customer_follow (
    follow_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '跟进ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    employee_id INT NOT NULL COMMENT '跟进人ID',
    follow_type ENUM('电话','拜访','邮件','微信','其他') NOT NULL COMMENT '跟进方式',
    follow_time DATETIME NOT NULL COMMENT '跟进时间',
    next_follow_time DATETIME NULL COMMENT '下次跟进时间',
    content TEXT NOT NULL COMMENT '跟进内容',
    stage ENUM('初步接触','需求分析','方案报价','谈判','成交','流失') NOT NULL COMMENT '商机阶段',
    probability TINYINT NULL COMMENT '成交概率(0-100%)',
    -- 审计字段
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by INT NOT NULL COMMENT '创建人ID',
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by INT NULL COMMENT '更新人ID',
    
    PRIMARY KEY (follow_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_follow_time (follow_time),
    INDEX idx_employee_id (employee_id),
    INDEX idx_stage (stage),
    INDEX idx_next_follow_time (next_follow_time),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='客户跟进表';

-- 客户移交表
DROP TABLE IF EXISTS customer_transfer;
CREATE TABLE customer_transfer (
    transfer_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '移交ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    from_employee_id INT NOT NULL COMMENT '原负责人ID',
    to_employee_id INT NOT NULL COMMENT '新负责人ID',
    transfer_reason VARCHAR(200) NOT NULL COMMENT '移交原因',
    transfer_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '移交时间',
    process_instance_id VARCHAR(64) COMMENT '流程实例ID',
    approval_status ENUM('待审批','已通过','已拒绝') NOT NULL DEFAULT '待审批' COMMENT '审批状态',
    approval_time DATETIME NULL COMMENT '审批时间',
    approval_notes TEXT NULL COMMENT '审批意见',
    -- 审计字段
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by INT NOT NULL COMMENT '创建人ID',
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by INT NULL COMMENT '更新人ID',
    
    PRIMARY KEY (transfer_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_transfer_time (transfer_time),
    INDEX idx_approval_status (approval_status),
    INDEX idx_from_employee (from_employee_id),
    INDEX idx_to_employee (to_employee_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='客户移交表';

-- 审核记录表
DROP TABLE IF EXISTS audit_log;
CREATE TABLE audit_log (
    audit_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '审核ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    employee_id INT NOT NULL COMMENT '审核人ID',
    audit_type VARCHAR(50) NOT NULL COMMENT '审核类型(升级/移交等)',
    audit_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '审核时间',
    audit_result ENUM('通过','拒绝') NOT NULL COMMENT '审核结果',
    audit_notes TEXT NULL COMMENT '审核意见',
    -- 审计字段
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by INT NOT NULL COMMENT '创建人ID',
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by INT NULL COMMENT '更新人ID',
    
    PRIMARY KEY (audit_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_audit_time (audit_time),
    INDEX idx_audit_type (audit_type),
    INDEX idx_employee_id (employee_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='审核记录表';


-- 客户标签表
DROP TABLE IF EXISTS customer_tag;
CREATE TABLE customer_tag (
    tag_id INT NOT NULL AUTO_INCREMENT COMMENT '标签ID',
    tag_name VARCHAR(50) NOT NULL COMMENT '标签名称',
    tag_color VARCHAR(10) NULL COMMENT '标签颜色',
    tag_category VARCHAR(50) NULL COMMENT '标签分类',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by INT NOT NULL COMMENT '创建人ID',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '删除标记',
    
    PRIMARY KEY (tag_id),
    UNIQUE KEY uk_tag_name (tag_name),
    INDEX idx_tag_category (tag_category)
) ENGINE=InnoDB COMMENT='客户标签表';

-- 客户标签关系表
DROP TABLE IF EXISTS customer_tag_relation;
CREATE TABLE customer_tag_relation (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    tag_id INT NOT NULL COMMENT '标签ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by INT NOT NULL COMMENT '创建人ID',
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_customer_tag (customer_id, tag_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_tag_id (tag_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (tag_id) REFERENCES customer_tag(tag_id)
) ENGINE=InnoDB COMMENT='客户标签关系表';