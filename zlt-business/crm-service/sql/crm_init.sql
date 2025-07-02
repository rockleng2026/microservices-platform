-- CRM客户关系管理系统 - 数据库表结构创建脚本
-- 数据库：central_crm
-- 版本：v1.0
-- 创建时间：2024-01-20

-- 使用central_crm数据库
USE central_crm;

-- 1. 客户主表
DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
    customer_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '客户唯一标识',
    tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
    customer_name VARCHAR(100) NOT NULL COMMENT '客户名称/企业名称',
    customer_type ENUM('individual','enterprise') NOT NULL DEFAULT 'individual' COMMENT '客户类型(individual:个人,enterprise:企业)',
    customer_status ENUM('potential','confirmed','lost') NOT NULL DEFAULT 'potential' COMMENT '客户状态(potential:潜在客户,confirmed:已确认,lost:已流失)',
    customer_source VARCHAR(50) NULL COMMENT '来源渠道(线上/展会/转介绍等)',
    owner_employee_id BIGINT NOT NULL COMMENT '业务负责人ID',
    contact_phone VARCHAR(20) NULL COMMENT '联系电话',
    contact_email VARCHAR(100) NULL COMMENT '联系邮箱',
    contact_address VARCHAR(200) NULL COMMENT '联系地址',
    industry VARCHAR(50) NULL COMMENT '所属行业',
    company_scale VARCHAR(20) NULL COMMENT '企业规模',
    annual_revenue DECIMAL(15,2) NULL COMMENT '年收入/营业额',
    website VARCHAR(200) NULL COMMENT '网站地址',
    description TEXT NULL COMMENT '客户描述',
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by BIGINT NULL COMMENT '更新人ID',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '删除标记(0:正常 1:删除)',

    PRIMARY KEY (customer_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_customer_name (customer_name),
    INDEX idx_owner_employee (owner_employee_id),
    INDEX idx_customer_status (customer_status),
    INDEX idx_customer_type (customer_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='客户主表';

-- 2. 商机表
DROP TABLE IF EXISTS opportunity;
CREATE TABLE opportunity (
    opportunity_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '商机ID',
    tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    opportunity_name VARCHAR(100) NOT NULL COMMENT '商机名称',
    opportunity_source VARCHAR(50) NULL COMMENT '商机来源',
    stage ENUM('potential','initial_contact','requirement_confirmed','solution_demo','business_negotiation','contract_signed','won','lost') NOT NULL DEFAULT 'potential' COMMENT '商机阶段(potential:潜在客户,initial_contact:初步接触,requirement_confirmed:需求确认,solution_demo:方案演示,business_negotiation:商务谈判,contract_signed:合同签署,won:已成交,lost:已失败)',
    probability TINYINT NULL COMMENT '成交概率(0-100%)',
    expected_amount DECIMAL(15,2) NULL COMMENT '预期金额',
    expected_close_date DATE NULL COMMENT '预期成交日期',
    owner_employee_id BIGINT NOT NULL COMMENT '负责人ID',
    competitor VARCHAR(200) NULL COMMENT '竞争对手',
    description TEXT NULL COMMENT '商机描述',
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by BIGINT NULL COMMENT '更新人ID',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '删除标记',

    PRIMARY KEY (opportunity_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_stage (stage),
    INDEX idx_owner_employee (owner_employee_id),
    INDEX idx_expected_close_date (expected_close_date),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='商机表';

-- 3. 客户跟进表
DROP TABLE IF EXISTS customer_follow;
CREATE TABLE customer_follow (
    follow_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '跟进ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    employee_id BIGINT NOT NULL COMMENT '跟进人ID',
    follow_type ENUM('phone','visit','email','wechat','other') NOT NULL COMMENT '跟进方式(phone:电话,visit:拜访,email:邮件,wechat:微信,other:其他)',
    follow_time TIMESTAMP NOT NULL COMMENT '跟进时间',
    next_follow_time TIMESTAMP NULL COMMENT '下次跟进时间',
    content TEXT NOT NULL COMMENT '跟进内容',
    stage ENUM('potential','initial_contact','requirement_confirmed','solution_demo','business_negotiation','won','lost') NOT NULL COMMENT '商机阶段(potential:潜在客户,initial_contact:初步接触,requirement_confirmed:需求确认,solution_demo:方案演示,business_negotiation:商务谈判,won:已成交,lost:已失败)',
    probability TINYINT NULL COMMENT '成交概率(0-100%)',
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by BIGINT NULL COMMENT '更新人ID',

    PRIMARY KEY (follow_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_follow_time (follow_time),
    INDEX idx_employee_id (employee_id),
    INDEX idx_stage (stage),
    INDEX idx_next_follow_time (next_follow_time),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='客户跟进表';

-- 4. 个人客户扩展表
DROP TABLE IF EXISTS individual_customer;
CREATE TABLE individual_customer (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    id_card VARCHAR(20) NULL COMMENT '身份证号',
    gender ENUM('male','female','unknown') NULL COMMENT '性别(male:男,female:女,unknown:未知)',
    birth_date DATE NULL COMMENT '出生日期',
    marital_status ENUM('single','married','divorced','widowed','unknown') NULL COMMENT '婚姻状况(single:未婚,married:已婚,divorced:离异,widowed:丧偶,unknown:未知)',
    education ENUM('primary','junior','senior','college','bachelor','master','doctor','other') NULL COMMENT '教育程度(primary:小学,junior:初中,senior:高中,college:大专,bachelor:本科,master:硕士,doctor:博士,other:其他)',
    occupation VARCHAR(50) NULL COMMENT '职业',
    annual_income VARCHAR(20) NULL COMMENT '年收入',
    home_address VARCHAR(200) NULL COMMENT '家庭地址',
    work_company VARCHAR(100) NULL COMMENT '工作单位',
    work_address VARCHAR(200) NULL COMMENT '工作地址',
    hobbies VARCHAR(200) NULL COMMENT '兴趣爱好',
    wechat VARCHAR(50) NULL COMMENT '微信号',
    qq VARCHAR(20) NULL COMMENT 'QQ号',
    emergency_contact VARCHAR(50) NULL COMMENT '紧急联系人',
    emergency_phone VARCHAR(20) NULL COMMENT '紧急联系电话',
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by BIGINT NULL COMMENT '更新人ID',

    PRIMARY KEY (id),
    UNIQUE KEY uk_customer_id (customer_id),
    INDEX idx_real_name (real_name),
    INDEX idx_id_card (id_card),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='个人客户扩展表';

-- 5. 企业客户扩展表
DROP TABLE IF EXISTS corporate_customer;
CREATE TABLE corporate_customer (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    company_full_name VARCHAR(200) NOT NULL COMMENT '企业全称',
    credit_code VARCHAR(50) NULL COMMENT '统一社会信用代码',
    legal_person VARCHAR(50) NULL COMMENT '法定代表人',
    registered_capital DECIMAL(15,2) NULL COMMENT '注册资本',
    establishment_date DATE NULL COMMENT '成立日期',
    business_scope TEXT NULL COMMENT '经营范围',
    company_nature ENUM('state_owned','private','foreign','joint_venture','other') NULL COMMENT '企业性质(state_owned:国有企业,private:民营企业,foreign:外资企业,joint_venture:合资企业,other:其他)',
    employee_count VARCHAR(20) NULL COMMENT '员工人数',
    main_products VARCHAR(500) NULL COMMENT '主要产品/服务',
    target_customers VARCHAR(200) NULL COMMENT '目标客户群体',
    official_website VARCHAR(200) NULL COMMENT '官方网站',
    office_address VARCHAR(200) NULL COMMENT '办公地址',
    registered_address VARCHAR(200) NULL COMMENT '注册地址',
    bank_account VARCHAR(50) NULL COMMENT '银行账号',
    bank_name VARCHAR(100) NULL COMMENT '开户银行',
    tax_number VARCHAR(50) NULL COMMENT '税号',
    main_contact VARCHAR(50) NULL COMMENT '主要联系人',
    contact_position VARCHAR(50) NULL COMMENT '联系人职位',
    contact_phone VARCHAR(20) NULL COMMENT '联系人电话',
    contact_email VARCHAR(100) NULL COMMENT '联系人邮箱',
    decision_maker VARCHAR(50) NULL COMMENT '决策人',
    purchase_process VARCHAR(200) NULL COMMENT '采购流程',
    payment_method VARCHAR(100) NULL COMMENT '付款方式',
    credit_rating VARCHAR(10) NULL COMMENT '信用等级',
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by BIGINT NULL COMMENT '更新人ID',

    PRIMARY KEY (id),
    UNIQUE KEY uk_customer_id (customer_id),
    INDEX idx_company_full_name (company_full_name),
    INDEX idx_credit_code (credit_code),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='企业客户扩展表';

-- 6. 客户移交表
DROP TABLE IF EXISTS customer_transfer;
CREATE TABLE customer_transfer (
    transfer_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '移交ID',
    customer_id BIGINT NOT NULL COMMENT '关联客户ID',
    from_employee_id BIGINT NOT NULL COMMENT '原负责人ID',
    to_employee_id BIGINT NOT NULL COMMENT '新负责人ID',
    transfer_reason VARCHAR(200) NOT NULL COMMENT '移交原因',
    transfer_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '移交时间',
    approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审批状态(pending:待审批,approved:已通过,rejected:已拒绝)',
    approval_status ENUM('待审批','已通过','已拒绝') NOT NULL DEFAULT '待审批' COMMENT '审批状态',
    approval_time TIMESTAMP NULL COMMENT '审批时间',
    approval_notes TEXT NULL COMMENT '审批意见',
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by BIGINT NULL COMMENT '更新人ID',

    PRIMARY KEY (transfer_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_transfer_time (transfer_time),
    INDEX idx_approval_status (approval_status),
    INDEX idx_from_employee (from_employee_id),
    INDEX idx_to_employee (to_employee_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
) ENGINE=InnoDB COMMENT='客户移交表';

-- 7. 客户标签表
DROP TABLE IF EXISTS customer_tag;
CREATE TABLE customer_tag (
    tag_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '标签ID',
    tag_name VARCHAR(50) NOT NULL COMMENT '标签名称',
    tag_color VARCHAR(10) NULL COMMENT '标签颜色',
    description VARCHAR(200) NULL COMMENT '标签描述',
    sort_order INT NULL DEFAULT 0 COMMENT '排序',
    is_enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    updated_by BIGINT NULL COMMENT '更新人ID',

    PRIMARY KEY (tag_id),
    UNIQUE KEY uk_tag_name (tag_name),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB COMMENT='客户标签表';

-- 8. 客户标签关系表
DROP TABLE IF EXISTS customer_tag_relation;
CREATE TABLE customer_tag_relation (
    relation_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '关系ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',

    PRIMARY KEY (relation_id),
    UNIQUE KEY uk_customer_tag (customer_id, tag_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_tag_id (tag_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (tag_id) REFERENCES customer_tag(tag_id)
) ENGINE=InnoDB COMMENT='客户标签关系表';

-- 创建完成提示
SELECT 'CRM数据库表结构创建完成！' as '状态';

-- 显示所有创建的表
SHOW TABLES;
