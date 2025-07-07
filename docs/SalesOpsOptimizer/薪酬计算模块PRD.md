# 薪酬计算模块产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品背景
基于现有的销售运营优化器平台，开发一套完整的薪酬计算系统，实现员工工资的自动化计算、发放管理和统计分析。系统需要支持复杂的薪酬结构，包括基础工资、绩效工资、项目提成、团队提成、部门分红等多种收入来源。

### 1.2 产品目标
- 实现薪酬计算的自动化，减少人工计算错误
- 提供灵活的薪酬配置机制，适应不同岗位和部门的薪酬结构
- 建立完整的薪酬审批和发放流程
- 提供详细的薪酬数据分析和报表功能
- 确保薪酬计算的合规性和透明度

### 1.3 目标用户
- **人力资源部门**：负责薪酬政策制定、工资计算和发放管理
- **财务部门**：负责薪酬成本核算和财务审批
- **部门经理**：查看部门薪酬成本和员工薪酬情况
- **普通员工**：查看个人薪酬明细和工资条

## 2. 核心功能模块

### 2.1 工资计算引擎

#### 2.1.1 计算引擎架构
```
工资计算引擎
├── 核心计算器 (SalaryCalculationEngine)
│   ├── 基础工资计算器 (BaseSalaryCalculator)
│   ├── 绩效工资计算器 (PerformancePayCalculator)
│   ├── 项目提成计算器 (ProjectCommissionCalculator)
│   ├── 团队提成计算器 (TeamCommissionCalculator)
│   ├── 部门分红计算器 (DepartmentBonusCalculator)
│   ├── 社保公积金计算器 (SocialSecurityCalculator)
│   └── 个人所得税计算器 (TaxCalculator)
├── 规则引擎 (RuleEngine)
│   ├── 薪酬规则解析器 (SalaryRuleParser)
│   ├── 条件判断器 (ConditionEvaluator)
│   └── 公式计算器 (FormulaCalculator)
└── 数据聚合器 (DataAggregator)
    ├── 员工数据聚合器 (EmployeeDataAggregator)
    ├── 绩效数据聚合器 (PerformanceDataAggregator)
    └── 项目数据聚合器 (ProjectDataAggregator)
```

#### 2.1.2 计算流程
```mermaid
graph TD
    A[开始计算] --> B[获取员工基础信息]
    B --> C[获取薪酬配置]
    C --> D[获取绩效数据]
    D --> E[获取项目数据]
    E --> F[计算基础工资]
    F --> G[计算绩效工资]
    G --> H[计算项目提成]
    H --> I[计算团队提成]
    I --> J[计算部门分红]
    J --> K[计算应发工资合计]
    K --> L[计算社保公积金]
    L --> M[计算个人所得税]
    M --> N[计算实发工资]
    N --> O[保存计算结果]
    O --> P[结束计算]
```

### 2.2 薪酬计算规则

#### 2.2.1 基础工资计算
```sql
-- 基础工资计算公式
adjusted_base_salary = base_salary * region_coefficient

-- 计算逻辑
SELECT 
    esc.base_salary * rsc.salary_coefficient AS adjusted_base_salary
FROM soo_employee_salary_config esc
LEFT JOIN soo_regional_salary_coefficient rsc ON esc.region = rsc.region
WHERE esc.employee_id = ? AND esc.status = 1 AND rsc.status = 1
```

#### 2.2.2 绩效工资计算
```sql
-- 绩效工资计算公式
performance_pay = adjusted_base_salary * performance_ratio

-- 绩效比例计算
performance_ratio = MAX(min_ratio, MIN(max_ratio, performance_score / 100))

-- 计算逻辑
SELECT 
    adjusted_base_salary * 
    GREATEST(jls.performance_ratio_min, 
        LEAST(jls.performance_ratio_max, mp.performance_score / 100)
    ) AS performance_pay
FROM soo_job_level_salary jls
JOIN soo_monthly_performance mp ON mp.employee_id = ?
WHERE jls.position_id = (SELECT position_id FROM employee WHERE id = ?)
  AND mp.month = ?
```

#### 2.2.3 个人项目提成计算
```sql
-- 个人项目提成计算公式
personal_commission = IF(is_sales_incentive = 1, 
    personal_project_profit * commission_base_rate * performance_factor * sales_incentive_ratio / 100,
    0)

-- 详细计算
commission_base_rate = 0.5 * 0.7 * 0.2  -- 毛利润50% * 部门分配70% * 个人分配20%
performance_factor = performance_score / 100
personal_project_profit = personal_project_revenue * personal_project_margin

-- 计算逻辑
SELECT 
    CASE WHEN esc.is_sales_incentive = 1 THEN
        mp.personal_project_revenue * mp.personal_project_margin * 0.07 * 
        (mp.performance_score / 100) * (esc.sales_incentive_ratio / 100)
    ELSE 0 END AS personal_commission
FROM soo_employee_salary_config esc
JOIN soo_monthly_performance mp ON mp.employee_id = esc.employee_id
WHERE esc.employee_id = ? AND mp.month = ?
```

#### 2.2.4 团队项目提成计算
```sql
-- 团队项目提成计算公式
team_commission = IF(is_team_incentive = 1,
    (team_project_profit * commission_base_rate / team_member_count) * team_incentive_ratio / 100,
    0)

-- 详细计算
commission_base_rate = 0.5 * 0.7 * 0.1  -- 毛利润50% * 部门分配70% * 团队分配10%
team_project_profit = team_project_revenue * team_project_margin

-- 计算逻辑
SELECT 
    CASE WHEN esc.is_team_incentive = 1 THEN
        (mp.team_project_revenue * mp.team_project_margin * 0.035 / mp.team_member_count) * 
        (esc.team_incentive_ratio / 100)
    ELSE 0 END AS team_commission
FROM soo_employee_salary_config esc
JOIN soo_monthly_performance mp ON mp.employee_id = esc.employee_id
WHERE esc.employee_id = ? AND mp.month = ?
```

#### 2.2.5 部门分红计算
```sql
-- 部门分红计算公式
department_bonus = IF(is_department_bonus = 1,
    (distributable_profit * department_bonus_weight) / department_employee_count,
    0)

-- 计算逻辑
SELECT 
    CASE WHEN esc.is_department_bonus = 1 THEN
        (ba.distributable_profit * dbc.bonus_weight / 100) / 
        (SELECT COUNT(*) FROM employee WHERE department_id = e.department_id AND status = 1)
    ELSE 0 END AS department_bonus
FROM soo_employee_salary_config esc
JOIN employee e ON e.id = esc.employee_id
JOIN soo_department_bonus_config dbc ON dbc.department_id = e.department_id
JOIN soo_breakeven_analysis ba ON ba.period = ?
WHERE esc.employee_id = ? AND ba.distributable_profit > 0
```

#### 2.2.6 社保公积金计算
```sql
-- 社保基数确定
social_base = MIN(MAX(gross_pay, social_security_base_lower), social_security_base_upper)
housing_base = MIN(MAX(gross_pay, housing_fund_base_lower), housing_fund_base_upper)

-- 个人缴费计算
personal_pension = social_base * pension_personal_ratio / 100
personal_medical = social_base * medical_personal_ratio / 100
personal_unemployment = social_base * unemployment_personal_ratio / 100
personal_housing_fund = housing_base * housing_fund_personal_ratio / 100

-- 公司缴费计算
company_pension = social_base * pension_company_ratio / 100
company_medical = social_base * medical_company_ratio / 100
company_unemployment = social_base * unemployment_company_ratio / 100
company_maternity = social_base * maternity_company_ratio / 100
company_injury = social_base * injury_company_ratio / 100
company_housing_fund = housing_base * housing_fund_company_ratio / 100
```

#### 2.2.7 个人所得税计算
```sql
-- 应纳税所得额计算
taxable_income = gross_pay - personal_social_total - 5000

-- 个人所得税计算（月度）
CASE 
    WHEN taxable_income <= 0 THEN 0
    WHEN taxable_income <= 3000 THEN taxable_income * 0.03
    WHEN taxable_income <= 12000 THEN taxable_income * 0.1 - 210
    WHEN taxable_income <= 25000 THEN taxable_income * 0.2 - 1410
    WHEN taxable_income <= 35000 THEN taxable_income * 0.25 - 2660
    WHEN taxable_income <= 55000 THEN taxable_income * 0.3 - 4410
    WHEN taxable_income <= 80000 THEN taxable_income * 0.35 - 7160
    ELSE taxable_income * 0.45 - 15160
END AS personal_income_tax
```

### 2.3 业务流程

#### 2.3.1 月度工资计算流程
```mermaid
graph TD
    A[月度工资计算任务] --> B[检查基础数据完整性]
    B --> C[验证绩效数据]
    C --> D[执行工资计算]
    D --> E[生成计算报告]
    E --> F[人力资源审核]
    F --> G{审核通过?}
    G -->|是| H[财务确认]
    G -->|否| I[修正数据]
    I --> D
    H --> J{确认通过?}
    J -->|是| K[生成工资条]
    J -->|否| L[财务调整]
    L --> D
    K --> M[发放工资]
    M --> N[归档计算结果]
```

#### 2.3.2 项目提成计算流程
```mermaid
graph TD
    A[项目回款确认] --> B[计算项目毛利润]
    B --> C[确定提成分配方案]
    C --> D[计算个人提成金额]
    D --> E[生成提成明细]
    E --> F[部门经理审核]
    F --> G{审核通过?}
    G -->|是| H[财务确认]
    G -->|否| I[调整分配方案]
    I --> D
    H --> J[生成提成工资条]
    J --> K[发放项目提成]
    K --> L[更新项目提成记录]
```

## 3. 数据模型设计

### 3.1 工资计算结果表扩展
基于现有的 `soo_payroll_result` 表，添加以下计算字段：

```sql
-- 计算规则字段
ALTER TABLE soo_payroll_result ADD COLUMN calculation_rules JSON COMMENT '计算规则配置';
ALTER TABLE soo_payroll_result ADD COLUMN calculation_details JSON COMMENT '计算明细数据';
ALTER TABLE soo_payroll_result ADD COLUMN error_log TEXT COMMENT '计算错误日志';
ALTER TABLE soo_payroll_result ADD COLUMN calculation_status TINYINT DEFAULT 0 COMMENT '计算状态(0待计算,1计算中,2计算完成,3计算失败)';
```

### 3.2 工资计算规则表
```sql
CREATE TABLE `soo_salary_calculation_rule` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `rule_name` varchar(100) NOT NULL COMMENT '规则名称',
  `rule_type` varchar(50) NOT NULL COMMENT '规则类型(base_salary/performance/commission/bonus)',
  `department_id` bigint(20) NULL COMMENT '适用部门ID(空表示全公司)',
  `job_level_code` varchar(50) NULL COMMENT '适用职级(空表示全职级)',
  `rule_formula` text NOT NULL COMMENT '计算公式',
  `rule_conditions` json NULL COMMENT '生效条件',
  `rule_parameters` json NULL COMMENT '规则参数',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expire_date` date NULL COMMENT '失效日期',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态(1启用,0禁用)',
  `priority` int(11) DEFAULT 0 COMMENT '优先级',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default',
  `delflag` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) COMMENT='薪酬计算规则表';
```

### 3.3 工资计算任务表
```sql
CREATE TABLE `soo_salary_calculation_task` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_name` varchar(100) NOT NULL COMMENT '任务名称',
  `calculation_month` varchar(7) NOT NULL COMMENT '计算月份(YYYY-MM)',
  `task_type` varchar(20) NOT NULL COMMENT '任务类型(monthly/commission/bonus)',
  `employee_scope` varchar(20) DEFAULT 'all' COMMENT '员工范围(all/department/individual)',
  `scope_values` json NULL COMMENT '范围具体值',
  `task_status` varchar(20) DEFAULT 'pending' COMMENT '任务状态(pending/running/completed/failed)',
  `total_employees` int(11) DEFAULT 0 COMMENT '总员工数',
  `processed_employees` int(11) DEFAULT 0 COMMENT '已处理员工数',
  `success_count` int(11) DEFAULT 0 COMMENT '成功数量',
  `error_count` int(11) DEFAULT 0 COMMENT '失败数量',
  `start_time` timestamp NULL COMMENT '开始时间',
  `end_time` timestamp NULL COMMENT '结束时间',
  `error_details` text NULL COMMENT '错误详情',
  `created_by` bigint(20) NULL COMMENT '创建人',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) DEFAULT 'default',
  PRIMARY KEY (`id`)
) COMMENT='薪酬计算任务表';
```

## 4. 系统接口设计

### 4.1 工资计算接口

#### 4.1.1 批量计算月度工资
```java
@PostMapping("/api/soo/salary/calculate/monthly")
public ApiResult<SalaryCalculationTaskVO> calculateMonthlySalary(
    @RequestBody MonthlySalaryCalculationDTO dto) {
    // 创建计算任务
    // 异步执行工资计算
    // 返回任务ID和状态
}
```

#### 4.1.2 单个员工工资计算
```java
@PostMapping("/api/soo/salary/calculate/employee/{employeeId}")
public ApiResult<PayrollResultVO> calculateEmployeeSalary(
    @PathVariable Long employeeId,
    @RequestParam String month) {
    // 计算指定员工指定月份工资
}
```

#### 4.1.3 获取计算任务状态
```java
@GetMapping("/api/soo/salary/task/{taskId}/status")
public ApiResult<SalaryCalculationTaskVO> getTaskStatus(@PathVariable Long taskId) {
    // 返回任务执行状态和进度
}
```

#### 4.1.4 工资计算结果查询
```java
@GetMapping("/api/soo/salary/result")
public ApiResult<PageInfo<PayrollResultVO>> getPayrollResults(
    @RequestParam String month,
    @RequestParam(required = false) Long departmentId,
    @RequestParam(required = false) Long employeeId) {
    // 分页查询工资计算结果
}
```

### 4.2 工资审核接口

#### 4.2.1 工资审核
```java
@PostMapping("/api/soo/salary/approve")
public ApiResult<Void> approveSalary(@RequestBody SalaryApprovalDTO dto) {
    // 批量审核工资计算结果
}
```

#### 4.2.2 工资调整
```java
@PostMapping("/api/soo/salary/adjust")
public ApiResult<Void> adjustSalary(@RequestBody SalaryAdjustmentDTO dto) {
    // 调整工资计算结果
}
```

### 4.3 工资条生成接口

#### 4.3.1 生成工资条
```java
@PostMapping("/api/soo/salary/payslip/generate")
public ApiResult<Void> generatePayslips(@RequestParam String month) {
    // 批量生成工资条
}
```

#### 4.3.2 下载工资条
```java
@GetMapping("/api/soo/salary/payslip/{employeeId}/{month}")
public ResponseEntity<Resource> downloadPayslip(
    @PathVariable Long employeeId,
    @PathVariable String month) {
    // 下载个人工资条PDF
}
```

## 5. 前端页面设计

### 5.1 页面结构
```
薪酬计算模块
├── 工资计算
│   ├── 月度工资计算
│   ├── 项目提成计算
│   └── 计算任务管理
├── 工资查询
│   ├── 工资明细查询
│   ├── 工资统计分析
│   └── 工资对比分析
├── 工资条生成
│   ├── 工资条模板管理
│   ├── 批量生成工资条
│   └── 工资条发送管理
└── 薪酬报表
    ├── 部门薪酬统计
    ├── 薪酬成本分析
    └── 薪酬趋势分析
```

### 5.2 核心页面功能

#### 5.2.1 月度工资计算页面
- **计算参数设置**：选择计算月份、员工范围、计算类型
- **数据验证**：检查绩效数据、项目数据完整性
- **计算执行**：启动计算任务，实时显示计算进度
- **结果预览**：计算完成后展示结果摘要
- **异常处理**：显示计算错误详情，支持重新计算

#### 5.2.2 工资查询页面
- **多维度查询**：按月份、部门、员工等条件查询
- **明细展示**：显示工资构成明细（基础工资、绩效、提成等）
- **统计分析**：部门薪酬统计、同比环比分析
- **数据导出**：支持Excel格式导出

#### 5.2.3 工资条生成页面
- **模板选择**：选择工资条模板样式
- **批量生成**：批量生成指定月份工资条
- **预览功能**：生成前预览工资条样式
- **发送管理**：邮件发送工资条，发送状态跟踪

## 6. 技术实现方案

### 6.1 计算引擎架构
```java
// 薪酬计算引擎主接口
public interface SalaryCalculationEngine {
    PayrollResult calculateSalary(Long employeeId, String month);
    List<PayrollResult> batchCalculateSalary(SalaryCalculationRequest request);
    SalaryCalculationTask createCalculationTask(SalaryCalculationRequest request);
}

// 具体计算器接口
public interface SalaryCalculator {
    String getCalculatorType();
    BigDecimal calculate(SalaryCalculationContext context);
    boolean isApplicable(SalaryCalculationContext context);
}

// 计算上下文
public class SalaryCalculationContext {
    private Employee employee;
    private EmployeeSalaryConfig salaryConfig;
    private MonthlyPerformance performance;
    private List<ProjectCommission> commissions;
    private SocialSecurityBase socialSecurityBase;
    private Map<String, Object> parameters;
}
```

### 6.2 规则引擎设计
```java
// 规则引擎接口
public interface SalaryRuleEngine {
    SalaryRule parseRule(String ruleExpression);
    BigDecimal executeRule(SalaryRule rule, SalaryCalculationContext context);
    boolean evaluateCondition(String condition, SalaryCalculationContext context);
}

// 规则定义
public class SalaryRule {
    private String ruleName;
    private String ruleType;
    private String formula;
    private List<RuleCondition> conditions;
    private Map<String, Object> parameters;
}
```

### 6.3 异步计算处理
```java
@Service
public class AsyncSalaryCalculationService {
    
    @Async("salaryCalculationExecutor")
    public CompletableFuture<Void> executeCalculationTask(Long taskId) {
        // 异步执行薪酬计算任务
        // 更新任务状态和进度
        // 处理计算异常
    }
    
    @EventListener
    public void handleCalculationProgress(SalaryCalculationProgressEvent event) {
        // 处理计算进度事件
        // 更新任务进度
        // 发送进度通知
    }
}
```

## 7. 质量保证

### 7.1 数据验证
- **输入数据验证**：绩效数据完整性、项目数据准确性
- **计算结果验证**：工资合理性检查、异常值检测
- **业务规则验证**：薪酬政策合规性检查

### 7.2 计算准确性
- **单元测试**：每个计算器的独立测试
- **集成测试**：完整计算流程测试
- **回归测试**：历史数据重新计算对比

### 7.3 性能优化
- **批量计算**：支持大批量员工并发计算
- **缓存机制**：缓存常用配置数据
- **数据库优化**：索引优化、查询优化

## 8. 风险控制

### 8.1 数据安全
- **权限控制**：严格的数据访问权限
- **操作审计**：所有操作记录审计日志
- **数据加密**：敏感薪酬数据加密存储

### 8.2 计算准确性
- **多重验证**：多层次计算结果验证
- **人工审核**：关键节点人工审核确认
- **版本控制**：计算规则版本管理

### 8.3 系统稳定性
- **异常处理**：完善的异常处理机制
- **容错机制**：计算失败自动重试
- **监控告警**：系统状态实时监控

## 9. 实施计划

### 9.1 开发阶段
1. **第一阶段**（2周）：核心计算引擎开发
2. **第二阶段**（2周）：业务规则引擎开发
3. **第三阶段**（2周）：前端页面开发
4. **第四阶段**（1周）：系统集成测试

### 9.2 测试阶段
1. **单元测试**（1周）：各模块功能测试
2. **集成测试**（1周）：系统整体测试
3. **用户验收测试**（1周）：业务用户验收

### 9.3 上线阶段
1. **试运行**（2周）：小范围试运行
2. **全面上线**（1周）：正式上线部署
3. **运维支持**（持续）：系统运维和优化

## 10. 总结

薪酬计算模块是企业人力资源管理的核心功能，需要确保计算准确性、系统稳定性和数据安全性。通过模块化的设计架构、灵活的规则引擎和完善的质量保证体系，为企业提供可靠、高效的薪酬计算解决方案。 