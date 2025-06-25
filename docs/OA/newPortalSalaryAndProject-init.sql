-- =============================
-- Portal 3.0 项目管理与人事绩效薪酬系统
-- SQL初始化脚本（含详细字段注释）
-- =============================

-- 1. 审批关联表
CREATE TABLE approval_flow (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  biz_type VARCHAR(50) NOT NULL COMMENT '业务类型，如project（项目）、performance（绩效）、bonus（分红）等',
  biz_id BIGINT NOT NULL COMMENT '业务表主键ID（如项目ID、绩效ID等）',
  process_instance_id VARCHAR(64) NOT NULL COMMENT 'Flowable流程实例ID',
  initiator_id BIGINT NOT NULL COMMENT '流程发起人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  INDEX idx_biz (biz_type, biz_id),
  INDEX idx_proc (process_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批关联表，桥接业务表与流程实例';

-- 2. 产品毛利分配指导表
CREATE TABLE product_profit_distribution_guide (
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

-- 3. 项目表
CREATE TABLE project (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  name VARCHAR(200) NOT NULL COMMENT '项目名称',
  category VARCHAR(50) COMMENT '项目类别（如党建、IDC、软件等）',
  participants TEXT COMMENT '参与人列表（JSON数组，存员工ID及角色）',
  leader_id BIGINT COMMENT '项目负责人ID',
  max_distribution float DEFAULT 0.5 COMMENT '最大分配比例默认50%即0.5'
  customer_name VARCHAR(100) COMMENT '项目客户名称',
  customer_contact VARCHAR(100) COMMENT '项目客户代表',
  start_time DATETIME COMMENT '立项时间',
  status VARCHAR(20) DEFAULT 'init' COMMENT '项目状态（如init、running、closed等）',
  process_instance_id VARCHAR(64) COMMENT '流程实例ID',
  final_status VARCHAR(20) DEFAULT NULL COMMENT '最终审批状态（如approved、rejected等）',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
  INDEX idx_leader (leader_id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_proc (process_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 4. 项目明细表
CREATE TABLE project_detail (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  project_id BIGINT NOT NULL COMMENT '项目ID',
  participant_id BIGINT NOT NULL COMMENT '参与人ID（员工ID）',
  role VARCHAR(50) NOT NULL COMMENT '项目角色',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识（0正常，1删除）',
  INDEX idx_project (project_id),
  INDEX idx_participant (participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目明细表，记录项目参与人及角色';

-- 5. 项目结项表
CREATE TABLE project_closure (
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

-- 6. 项目人员毛利分配表
CREATE TABLE project_profit_distribution (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  project_id BIGINT NOT NULL COMMENT '项目ID',
  guide_id BIGINT COMMENT '产品毛利分配指导表ID',
  dept_id BIGINT NOT NULL COMMENT '分配员工ID',
  employee_id BIGINT  COMMENT '分配员工ID',
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

-- 7. 项目人员毛利分配调整表
CREATE TABLE project_profit_distribution_adjustment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  profit_distribution_id BIGINT NOT NULL COMMENT '项目人员毛利分配表ID',
  apply_reason VARCHAR(255) COMMENT '调整申请原因',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '调整审批状态',
  process_instance_id VARCHAR(64) COMMENT '流程实例ID',
  final_status VARCHAR(20) DEFAULT NULL COMMENT '最终审批状态',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_profit (profit_distribution_id),
  INDEX idx_proc (process_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目人员毛利分配调整表';

-- 8. 部门绩效目标表
CREATE TABLE department_performance_target (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  target_type VARCHAR(20) NOT NULL COMMENT '考核对象类型（部门/岗位/个人）',
  department_id BIGINT NOT NULL COMMENT '部门ID',
  name VARCHAR(100) NOT NULL COMMENT '绩效名称',
  description VARCHAR(255) COMMENT '绩效描述',
  standard_excellent VARCHAR(255) COMMENT '卓越标准',
  standard_good VARCHAR(255) COMMENT '良好标准',
  standard_pass VARCHAR(255) COMMENT '及格标准',
  target_amount DECIMAL(18,2) COMMENT '目标金额',
  cycle VARCHAR(20) COMMENT '考核周期（月度/季度/半年度/年度）',
  process_instance_id VARCHAR(64) COMMENT '流程实例ID',
  final_status VARCHAR(20) DEFAULT NULL COMMENT '最终审批状态',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_dept (department_id),
  INDEX idx_proc (process_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门绩效目标表';

-- 9. 部门绩效考核结果表
CREATE TABLE department_performance_result (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  target_id BIGINT NOT NULL COMMENT '部门绩效目标表ID',
  cycle VARCHAR(20) COMMENT '考核周期',
  self_evaluation TEXT COMMENT '自我评价',
  leader_evaluation TEXT COMMENT '领导评价',
  self_grade VARCHAR(10) COMMENT '自评等级',
  leader_grade VARCHAR(10) COMMENT '领导评分等级',
  comments TEXT COMMENT '综合考评意见',
  fill_time DATETIME COMMENT '填写时间',
  update_time DATETIME COMMENT '更新时间',
  process_instance_id_1 VARCHAR(64) COMMENT '填报审批流程实例ID',
  process_instance_id_2 VARCHAR(64) COMMENT '评价审批流程实例ID',
  final_status VARCHAR(20) DEFAULT NULL COMMENT '最终审批状态',
  target_amount DECIMAL(18,2) COMMENT '目标金额',
  actual_amount DECIMAL(18,2) COMMENT '实际金额',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_target (target_id),
  INDEX idx_proc1 (process_instance_id_1),
  INDEX idx_proc2 (process_instance_id_2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门绩效考核结果表';

-- 10. 部门绩效考核明细表
CREATE TABLE department_performance_result_detail (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  result_id BIGINT NOT NULL COMMENT '部门绩效考核结果表ID',
  source VARCHAR(20) COMMENT '目标来源（上级制定/个人制定）',
  item_name VARCHAR(100) COMMENT '事项名称',
  item_description VARCHAR(255) COMMENT '事项描述',
  standard_excellent VARCHAR(255) COMMENT '卓越标准',
  standard_good VARCHAR(255) COMMENT '良好标准',
  standard_pass VARCHAR(255) COMMENT '及格标准',
  completion_status VARCHAR(20) COMMENT '完成情况（卓越/良好/及格/不及格）',
  target_amount DECIMAL(18,2) COMMENT '目标金额',
  actual_amount DECIMAL(18,2) COMMENT '实际金额',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_result (result_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门绩效考核明细表';

-- 11. 个人绩效目标表
CREATE TABLE employee_performance_target (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  employee_id BIGINT NOT NULL COMMENT '员工ID',
  cycle VARCHAR(20) COMMENT '考核周期',
  name VARCHAR(100) COMMENT '绩效名称',
  description VARCHAR(255) COMMENT '绩效描述',
  standard_excellent VARCHAR(255) COMMENT '卓越标准',
  standard_good VARCHAR(255) COMMENT '良好标准',
  standard_pass VARCHAR(255) COMMENT '及格标准',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='个人绩效目标表';

-- 12. 个人绩效考核表
CREATE TABLE employee_performance_result (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  target_id BIGINT NOT NULL COMMENT '个人绩效目标表ID',
  cycle VARCHAR(20) COMMENT '考核周期',
  self_evaluation TEXT COMMENT '自我评价',
  leader_evaluation TEXT COMMENT '领导评价',
  self_grade VARCHAR(10) COMMENT '自评等级',
  leader_grade VARCHAR(10) COMMENT '领导评分等级',
  comments TEXT COMMENT '综合考评意见',
  fill_time DATETIME COMMENT '填写时间',
  update_time DATETIME COMMENT '更新时间',
  process_instance_id_1 VARCHAR(64) COMMENT '填报审批流程实例ID',
  process_instance_id_2 VARCHAR(64) COMMENT '评价审批流程实例ID',
  final_status VARCHAR(20) DEFAULT NULL COMMENT '最终审批状态',
  target_amount DECIMAL(18,2) COMMENT '目标金额',
  actual_amount DECIMAL(18,2) COMMENT '实际金额',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_target (target_id),
  INDEX idx_proc1 (process_instance_id_1),
  INDEX idx_proc2 (process_instance_id_2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='个人绩效考核表';

-- 13. 个人绩效考核明细表
CREATE TABLE employee_performance_result_detail (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  result_id BIGINT NOT NULL COMMENT '个人绩效考核表ID',
  source VARCHAR(20) COMMENT '目标来源（上级制定/个人制定）',
  item_name VARCHAR(100) COMMENT '事项名称',
  item_description VARCHAR(255) COMMENT '事项描述',
  standard_excellent VARCHAR(255) COMMENT '卓越标准',
  standard_good VARCHAR(255) COMMENT '良好标准',
  standard_pass VARCHAR(255) COMMENT '及格标准',
  completion_status VARCHAR(20) COMMENT '完成情况（卓越/良好/及格/不及格）',
  target_amount DECIMAL(18,2) COMMENT '目标金额',
  actual_amount DECIMAL(18,2) COMMENT '实际金额',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_result (result_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='个人绩效考核明细表';

-- 14. 部门分红储备金账户表
CREATE TABLE department_bonus_reserve (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  department_id BIGINT NOT NULL COMMENT '部门ID',
  year INT NOT NULL COMMENT '年份',
  total_amount DECIMAL(18,2) DEFAULT 0 COMMENT '总金额',
  used_amount DECIMAL(18,2) DEFAULT 0 COMMENT '已用金额',
  available_amount DECIMAL(18,2) DEFAULT 0 COMMENT '可用金额',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_dept_year (department_id, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门分红储备金账户表';

-- 15. 部门分红分配表
CREATE TABLE department_bonus_distribution (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  reserve_id BIGINT NOT NULL COMMENT '部门分红储备金账户ID',
  employee_id BIGINT NOT NULL COMMENT '员工ID',
  amount DECIMAL(18,2) NOT NULL COMMENT '分配金额',
  distribution_time DATETIME COMMENT '分配时间',
  process_instance_id VARCHAR(64) COMMENT '流程实例ID',
  final_status VARCHAR(20) DEFAULT NULL COMMENT '最终审批状态',
  tenant_id VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  created_by BIGINT COMMENT '创建人ID',
  updated_by BIGINT COMMENT '修改人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  delflag TINYINT(1) DEFAULT 0 COMMENT '删除标识',
  INDEX idx_reserve (reserve_id),
  INDEX idx_employee (employee_id),
  INDEX idx_proc (process_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门分红分配表'; 