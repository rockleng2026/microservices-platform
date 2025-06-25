-- =============================
-- 项目结项和提成分配数据库表
-- 基于设计文档创建
-- =============================

-- 1. 项目结项表
CREATE TABLE IF NOT EXISTS project_closure (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  project_id BIGINT NOT NULL COMMENT '项目ID',
  closure_time DATETIME COMMENT '结项时间',
  contract_amount DECIMAL(18,2) COMMENT '项目合同金额',
  actual_amount DECIMAL(18,2) COMMENT '项目实际金额',
  gross_profit DECIMAL(18,2) COMMENT '项目毛利润',
  gross_profit_rate DECIMAL(5,2) COMMENT '毛利率（%）',
  process_instance_id VARCHAR(64) COMMENT '流程实例ID',
  final_status VARCHAR(20) DEFAULT NULL COMMENT '最终审批状态',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_project (project_id),
  INDEX idx_proc (process_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目结项表';

-- 2. 项目人员毛利分配表
CREATE TABLE IF NOT EXISTS project_profit_distribution (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  project_id BIGINT NOT NULL COMMENT '项目ID',
  guide_id BIGINT COMMENT '产品毛利分配指导表ID',
  employee_id BIGINT NOT NULL COMMENT '分配员工ID',
  role VARCHAR(50) NOT NULL COMMENT '分配角色',
  distribution_type VARCHAR(10) NOT NULL COMMENT '分配形式（比例/金额）',
  distribution_value DECIMAL(10,2) NOT NULL COMMENT '分配数值',
  process_instance_id VARCHAR(64) COMMENT '流程实例ID',
  final_status VARCHAR(20) DEFAULT NULL COMMENT '最终审批状态',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_project (project_id),
  INDEX idx_employee (employee_id),
  INDEX idx_proc (process_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目人员毛利分配表';

-- 3. 产品毛利分配指导表（如果不存在）
CREATE TABLE IF NOT EXISTS product_profit_distribution_guide (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  product_name VARCHAR(100) NOT NULL COMMENT '产品名称（如党建项目、IDC项目等）',
  role VARCHAR(50) NOT NULL COMMENT '参与角色（如销售、技术、产品经理等）',
  commission_type VARCHAR(10) NOT NULL COMMENT '提成类型（比例/金额）',
  value_range VARCHAR(50) COMMENT '数值范围（如1-5、500~10000）',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识（0正常，1删除）'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品毛利分配指导表';

-- 4. 初始化产品毛利分配指导数据
INSERT INTO product_profit_distribution_guide (product_name, role, commission_type, value_range, tenant_id, created_by, updated_by) VALUES
('党建项目', '销售', '比例', '30-50', 'default', 1, 1),
('党建项目', '技术', '比例', '20-30', 'default', 1, 1),
('党建项目', '产品经理', '比例', '15-25', 'default', 1, 1),
('党建项目', '售前', '比例', '10-20', 'default', 1, 1),
('IDC项目', '销售', '比例', '40-60', 'default', 1, 1),
('IDC项目', '技术', '比例', '25-35', 'default', 1, 1),
('IDC项目', '产品经理', '比例', '15-25', 'default', 1, 1),
('软件项目', '销售', '比例', '25-40', 'default', 1, 1),
('软件项目', '技术', '比例', '30-45', 'default', 1, 1),
('软件项目', '产品经理', '比例', '20-30', 'default', 1, 1),
('软件项目', '运维', '比例', '10-20', 'default', 1, 1);

-- 5. 检查是否需要为现有项目表添加结项相关字段
-- ALTER TABLE project ADD COLUMN closure_status VARCHAR(20) DEFAULT NULL COMMENT '结项状态' AFTER final_status;
-- ALTER TABLE project ADD COLUMN closure_time DATETIME DEFAULT NULL COMMENT '结项完成时间' AFTER closure_status;

-- 项目表
CREATE TABLE IF NOT EXISTS `project` (
    `id` BIGINT NOT NULL COMMENT '项目ID',
    `name` VARCHAR(255) NOT NULL COMMENT '项目名称',
    `category` VARCHAR(100) COMMENT '项目类别（如党建、IDC、软件等）',
    `participants` TEXT COMMENT '参与人列表（JSON数组，存员工ID及角色）',
    `leader_id` BIGINT COMMENT '项目负责人ID',
    `max_distribution` DECIMAL(5,4) DEFAULT 0.5000 COMMENT '最大分配比例（默认0.5即50%）',
    `customer_name` VARCHAR(255) COMMENT '项目客户名称',
    `customer_contact` VARCHAR(255) COMMENT '项目客户代表',
    `start_time` DATETIME COMMENT '立项时间',
    `status` VARCHAR(50) DEFAULT 'init' COMMENT '项目状态（如init、running、closed等）',
    `process_instance_id` VARCHAR(255) COMMENT '流程实例ID',
    `final_status` VARCHAR(50) COMMENT '最终审批状态（如approved、rejected等）',
    `profit_distribution_status` VARCHAR(50) DEFAULT 'not_set' COMMENT '利润计提状态：not_set未设置,awaiting_approval待审批,in_approval审批中,approved审批通过,approval_failed审批失败,partially_settled部分计提,settled已计提完毕',
    `tenant_id` VARCHAR(50) NOT NULL DEFAULT 'default' COMMENT '租户ID',
    `created_by` BIGINT COMMENT '创建人ID',
    `updated_by` BIGINT COMMENT '修改人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `delflag` TINYINT DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
    PRIMARY KEY (`id`),
    KEY `idx_name` (`name`),
    KEY `idx_category` (`category`),
    KEY `idx_leader_id` (`leader_id`),
    KEY `idx_status` (`status`),
    KEY `idx_final_status` (`final_status`),
    KEY `idx_profit_distribution_status` (`profit_distribution_status`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_delflag` (`delflag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- 为现有项目表添加利润计提状态字段
ALTER TABLE project ADD COLUMN profit_distribution_status VARCHAR(50) DEFAULT 'not_set' COMMENT '利润计提状态：not_set未设置,awaiting_approval待审批,in_approval审批中,approved审批通过,approval_failed审批失败,partially_settled部分计提,settled已计提完毕' AFTER final_status;

-- 添加索引
ALTER TABLE project ADD KEY `idx_profit_distribution_status` (`profit_distribution_status`); 