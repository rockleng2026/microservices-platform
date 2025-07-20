-- 盈亏平衡分析增强版数据库设计
-- 数据库: central-soo
-- 版本: v2.0
-- 创建日期: 2024-12-19

-- ============================================================================
-- 1. 财务模型管理
-- ============================================================================

-- 财务模型表
CREATE TABLE soo_financial_model (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模型ID',
    model_code VARCHAR(50) UNIQUE NOT NULL COMMENT '模型编码',
    model_name VARCHAR(100) NOT NULL COMMENT '模型名称',
    model_version VARCHAR(20) DEFAULT '1.0.0' COMMENT '模型版本',
    model_category VARCHAR(50) COMMENT '模型分类',
    model_description TEXT COMMENT '模型描述',
    parent_model_id BIGINT COMMENT '父模型ID',
    is_template BOOLEAN DEFAULT FALSE COMMENT '是否为模板',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    model_config JSON COMMENT '模型配置',
    validation_rules JSON COMMENT '验证规则',
    creator_id BIGINT COMMENT '创建人ID',
    creator_name VARCHAR(50) COMMENT '创建人姓名',
    tenant_id VARCHAR(50) COMMENT '租户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_model_code (model_code),
    INDEX idx_category_active (model_category, is_active),
    INDEX idx_tenant_creator (tenant_id, creator_id),
    FOREIGN KEY (parent_model_id) REFERENCES soo_financial_model(id)
) COMMENT '财务模型表';

-- 模型变量表
CREATE TABLE soo_model_variable (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '变量ID',
    model_id BIGINT NOT NULL COMMENT '模型ID',
    variable_code VARCHAR(50) NOT NULL COMMENT '变量编码',
    variable_name VARCHAR(100) NOT NULL COMMENT '变量名称',
    variable_type ENUM('INPUT','CALC','API','CALC_FACTORS') NOT NULL COMMENT '变量类型：输入/计算/API/计算因子',
    data_type ENUM('NUMBER','DECIMAL','PERCENTAGE','CURRENCY','BOOLEAN','STRING') DEFAULT 'DECIMAL' COMMENT '数据类型',
    unit VARCHAR(20) COMMENT '单位',
    parent_id BIGINT COMMENT '父级树ID,标识这个变量属于parent_id的子变量，他的值受父级变量值的约束',
    default_value DECIMAL(20,6) COMMENT '默认值',
    min_value DECIMAL(20,6) COMMENT '最小值',
    max_value DECIMAL(20,6) COMMENT '最大值',
    calculation_formula TEXT COMMENT '计算公式',
    constraint_formula TEXT COMMENT '约束条件公式，定义子变量与父变量之间的关系',
    api_config JSON COMMENT 'API配置',
    display_order INT DEFAULT 0 COMMENT '显示顺序',
    is_required BOOLEAN DEFAULT FALSE COMMENT '是否必填',
    is_key_indicator BOOLEAN DEFAULT FALSE COMMENT '是否关键指标',
    is_visible BOOLEAN DEFAULT TRUE COMMENT '是否显示',
    validation_rules JSON COMMENT '验证规则',
    description TEXT COMMENT '变量描述',
    help_text TEXT COMMENT '帮助说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_model_variable (model_id, variable_code),
    INDEX idx_model_type (model_id, variable_type),
    INDEX idx_model_order (model_id, display_order),
    INDEX idx_parent_id (parent_id),
    INDEX idx_constraint_formula (constraint_formula),
    FOREIGN KEY (model_id) REFERENCES soo_financial_model(id) ON DELETE CASCADE
) COMMENT '模型变量表';

-- 模型变量依赖关系表
CREATE TABLE soo_variable_dependency (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '依赖ID',
    model_id BIGINT NOT NULL COMMENT '模型ID',
    variable_id BIGINT NOT NULL COMMENT '变量ID',
    dependent_variable_id BIGINT NOT NULL COMMENT '依赖的变量ID',
    dependency_type ENUM('DIRECT','INDIRECT') DEFAULT 'DIRECT' COMMENT '依赖类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    UNIQUE KEY uk_variable_dependency (variable_id, dependent_variable_id),
    INDEX idx_model_variable (model_id, variable_id),
    FOREIGN KEY (model_id) REFERENCES soo_financial_model(id) ON DELETE CASCADE,
    FOREIGN KEY (variable_id) REFERENCES soo_model_variable(id) ON DELETE CASCADE,
    FOREIGN KEY (dependent_variable_id) REFERENCES soo_model_variable(id) ON DELETE CASCADE
) COMMENT '变量依赖关系表';


-- ============================================================================
-- 4. API数据集成
-- ============================================================================
-- API接口配置表
CREATE TABLE soo_api_interface (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '接口ID',
    interface_code VARCHAR(50) NOT NULL COMMENT '接口编码',
    interface_name VARCHAR(100) NOT NULL COMMENT '接口名称',
    endpoint_url VARCHAR(500) NOT NULL COMMENT '接口地址',
    http_method ENUM('GET','POST','PUT','DELETE') DEFAULT 'GET' COMMENT 'HTTP方法',
    request_config JSON COMMENT '请求配置',
    response_config JSON COMMENT '响应配置',
    data_mapping JSON COMMENT '数据映射配置',
    cache_config JSON COMMENT '缓存配置',
    validation_rules JSON COMMENT '数据验证规则',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    test_parameters JSON COMMENT '测试参数',
    last_test_time TIMESTAMP COMMENT '最后测试时间',
    test_result JSON COMMENT '测试结果',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_datasource_interface (interface_code),
    INDEX idx_interface_code (interface_code),
    INDEX idx_active_test (is_active, last_test_time)
) COMMENT 'API接口配置表';

-- ============================================================================
-- 5. 图表分析模型-
-- ============================================================================
-- 图表分析模型配置表
CREATE TABLE soo_chart_analysis_model (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '图表分析模型ID',
  model_id BIGINT NOT NULL COMMENT '关联的模型ID',
  chart_name VARCHAR(100) NOT NULL COMMENT '图表名称',
  x_axis_name VARCHAR(50) NOT NULL COMMENT 'X轴名称标识',
  x_axis_field VARCHAR(50) NOT NULL COMMENT 'X轴对应模型变量表字段-variable_code',
  x_axis_unit VARCHAR(20) COMMENT 'X轴单位',
  y_axis_name VARCHAR(50) NOT NULL COMMENT 'Y轴对应字段标识',
  y_axis_unit VARCHAR(20) COMMENT 'Y轴单位',
  chart_type ENUM('line', 'bar', 'scatter') DEFAULT 'line' COMMENT '图表类型',
  simulation_steps INT DEFAULT 10 COMMENT '模拟步数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (model_id) REFERENCES soo_financial_model(id) ON DELETE CASCADE
) COMMENT '图表分析模型配置表';

-- 图表指标系列表
CREATE TABLE soo_chart_series (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '系列ID',
  chart_id BIGINT NOT NULL COMMENT '关联图表ID',
  series_name VARCHAR(100) NOT NULL COMMENT '系列名称',
  series_field VARCHAR(50) NOT NULL COMMENT '对应字段标识',
  series_type ENUM('fixed', 'variable','formula') DEFAULT 'fixed' COMMENT '系列类型',
  series_value VARCHAR(15) COMMENT '可以是个固定值(100),可以是变量(a)，也可以是个变量表达式(ax+b)，注意有个特殊变量x代指，图表分析模型配置表中x轴的x_axis_field，用他来关联x轴的变量',
  color VARCHAR(20) COMMENT '系列颜色',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (chart_id) REFERENCES soo_chart_analysis_model(id) ON DELETE CASCADE
) COMMENT '图表指标系列配置表';

-- 图表模拟结果表
CREATE TABLE soo_chart_simulation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模拟结果ID',
  run_id BIGINT NOT NULL COMMENT '关联模型运行ID',
  chart_id BIGINT NOT NULL COMMENT '关联图表ID',
  x_value DECIMAL(15,2) NOT NULL COMMENT 'X轴值',
  series_id BIGINT NOT NULL COMMENT '关联系列ID',
  y_value DECIMAL(15,2) NOT NULL COMMENT 'Y轴值',
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '计算时间',
  FOREIGN KEY (chart_id) REFERENCES soo_chart_analysis_model(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES soo_chart_series(id) ON DELETE CASCADE
) COMMENT '图表模拟结果存储表';

-- ============================================================================
-- 7. 初始化数据
-- ============================================================================

-- 创建索引优化查询性能
CREATE INDEX idx_model_variable_type_order ON soo_model_variable(model_id, variable_type, display_order);

INSERT INTO soo_chart_analysis_model
(model_id, chart_name, x_axis_field, x_axis_unit, y_axis_field, y_axis_unit, chart_type, simulation_steps)
VALUES
    (1, '盈亏平衡分析', 'revenue', '元', 'net_profit', '元', 'line', 20);

-- 固定成本线
INSERT INTO soo_chart_series
(chart_id, series_name, series_field, series_type, color)
VALUES
    (1, '固定成本', 'total_fixed_cost', 'fixed', '#FF5733');

-- 不同毛利率的利润线
INSERT INTO soo_chart_series
(chart_id, series_name, series_field, series_type, series_value, color)
VALUES
    (1, '毛利率10%', 'net_profit', 'variable', 0.10, '#33FF57'),
    (1, '毛利率30%', 'net_profit', 'variable', 0.30, '#3357FF'),
    (1, '毛利率65%', 'net_profit', 'variable', 0.65, '#F333FF');


-- 示例：不同固定成本下的盈亏平衡点
INSERT INTO soo_chart_series
(chart_id, series_name, series_field, series_type, series_value)
VALUES
    (1, '固定成本+10%', 'total_fixed_cost', 'variable', 'base*1.1'),
    (1, '固定成本+20%', 'total_fixed_cost', 'variable', 'base*1.2');
