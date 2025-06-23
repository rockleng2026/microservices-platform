### PRD：Portal 3.0 项目管理与人事绩效薪酬系统（优化版）

---

#### 一、项目背景与目标

本系统旨在基于Portal 3.0现有组织、员工、岗位等基础模块，融合原有项目管理功能，新增OA-人事绩效考核与薪酬分配模块，实现"组织-项目-绩效-薪酬"一体化管理。目标是提升员工积极性、规范项目分红、实现多维度绩效激励，支持多租户、微服务架构，满足企业级扩展需求。

---

#### 二、系统功能架构

1. **组织管理模块**（已实现，复用）
   - 部门、岗位、员工、权限、审计日志等
2. **项目管理模块**（原有+扩展）
   - 项目全生命周期管理、项目角色、进度、结项、分红
3. **绩效考核模块**（新增）
   - 部门/个人绩效目标、考核、审批、绩效等级
4. **薪酬与分红模块**（新增/优化）
   - 基本工资、绩效工资、项目提成、部门分红、分阶段兑现
5. **流程与审批模块**
   - 基于Flowable工作流引擎，覆盖绩效、分红、项目分配等审批流

---

#### 三、核心业务流程

##### 1. 项目管理流程
- **项目立项**：员工/部门提交商机，领导审批立项，指定项目负责人、参与人、客户等。
- **项目执行**：项目进度、任务分解、角色分配、进度跟踪、里程碑管理。
- **项目结项**：结项时录入合同金额、实际金额、毛利率，自动计算项目提成池。
- **项目提成**：按产品毛利分配指导表、项目角色、部门权重分配提成，部门内部分配、储备金管理。
- **提成方案审批**：提成方案需部门负责人制定并审批，财务可分阶段发放。

##### 2. 绩效考核流程
- **目标设定**：上级对下级部门/个人设定绩效目标，支持多周期（年/季/月）。
- **自评与互评**：员工自评，部门领导/HR评价，综合考评等级。
- **审批流转**：填报、报批、执行、审批、完结，支持多级审批流。
- **绩效与薪酬挂钩**：绩效达标发放绩效工资与分红，不达标则不发放。

##### 3. 薪酬分配流程
- **基础工资**：按岗位、等级、合同约定发放。
- **绩效工资**：按绩效考核结果发放。
- **项目提成**：项目回款后3个月内发放，按分配规则自动计算。
- **部门分红**：年度审核后发放，需部门业绩达标，按考核系数调整分红比例。
- **分阶段兑现**：大额奖金可分期发放，防止人员流失。

---

#### 四、数据结构建议（表结构/字段/关系）

##### 1. 组织与员工（复用现有表，见 organization-module.sql）
- `department`、`employee`、`workposition`、`employee_grade`、`field_config`、`employee_extend_data`、`employee_attachment` 等

##### 2. 项目管理相关表（建议扩展/优化）
- **产品毛利分配指导表**（product_profit_distribution_guide）
  - id, product_name, role, commission_type, value_range, tenant_id, 审计字段
- **项目表**（project）
  - id, name, category, participants, leader_id, customer_name, customer_contact, start_time, status, tenant_id, 审计字段
- **项目明细表**（project_detail）
  - id, project_id, participant_id, role, tenant_id, 审计字段
- **项目进度表/明细表**（project_progress, project_progress_detail）
- **项目结项表**（project_closure）
  - id, project_id, closure_time, contract_amount, actual_amount, gross_profit, gross_profit_rate, tenant_id, 审计字段
- **项目人员毛利分配表**（project_profit_distribution）
  - id, project_id, guide_id, employee_id, role, distribution_type, distribution_value, process_instance_id, tenant_id, 审计字段
- **项目人员毛利分配调整表**（project_profit_distribution_adjustment）
  - id, project_profit_distribution_id, apply_reason, status, process_instance_id, tenant_id, 审计字段

##### 3. 绩效考核相关表（新增）
- **部门绩效目标表**（department_performance_target）
  - id, target_type, department_id, name, description, standard_excellent, standard_good, standard_pass, target_amount, cycle, process_instance_id, tenant_id, 审计字段
- **部门绩效考核结果表**（department_performance_result）
  - id, target_id, cycle, self_evaluation, leader_evaluation, self_grade, leader_grade, comments, fill_time, update_time, process_instance_id_1, process_instance_id_2, status, target_amount, actual_amount, tenant_id, 审计字段
- **部门绩效考核明细表**（department_performance_result_detail）
  - id, result_id, source, item_name, item_description, standard_excellent, standard_good, standard_pass, completion_status, target_amount, actual_amount, tenant_id, 审计字段
- **个人绩效目标表**（employee_performance_target）
  - id, employee_id, cycle, name, description, standard_excellent, standard_good, standard_pass, tenant_id, 审计字段
- **个人绩效考核表**（employee_performance_result）
  - id, target_id, cycle, self_evaluation, leader_evaluation, self_grade, leader_grade, comments, fill_time, update_time, process_instance_id_1, process_instance_id_2, status, target_amount, actual_amount, tenant_id, 审计字段
- **个人绩效考核明细表**（employee_performance_result_detail）
  - id, result_id, source, item_name, item_description, standard_excellent, standard_good, standard_pass, completion_status, target_amount, actual_amount, tenant_id, 审计字段

##### 4. 部门分红与储备金
- **部门分红储备金账户表**（department_bonus_reserve）
  - id, department_id, year, total_amount, used_amount, available_amount, tenant_id, 审计字段
- **部门分红分配表**（department_bonus_distribution）
  - id, reserve_id, employee_id, amount, distribution_time, process_instance_id, tenant_id, 审计字段

##### 5. 审计与流程
- 所有表需加`tenant_id`、`created_by`、`updated_by`、`created_at`、`updated_at`、`delflag`等审计字段
- 关键业务表需预留`process_instance_id`字段对接Flowable工作流

---

#### 五、关键业务规则与分红逻辑

1. **项目提成分配**
   - 项目毛利润的50%作为项目提成池
   - 按部门权重分配给参与部门（可按角色/部门预设或立项时指定）
   - 部门内部分配：80%分配给个人，20%进入部门储备金（可配置）
   - 项目回款后3个月内发放

2. **部门分红**
   - 剩余50%中的30%用于部门分红，前提：部门年度业绩达标且纯利润为正
   - 分红系数：4项全部达标系数1，3项0.9，2项0.7，1项0.6，0项保底（需部门申请）
   - 年终奖分配：大部门→小部门→个人，支持分阶段兑现

3. **绩效与薪酬挂钩**
   - 绩效工资、分红、提成均与绩效考核结果挂钩
   - 当月绩效按当月项目回款金额评估，绩效不达标则不发放

4. **审批与流程**
   - 所有分红、绩效、项目分配均需走审批流，支持多级审批、流程可追溯

---

#### 六、角色与权限

- **系统管理员**：全局配置、租户管理、数据维护
- **HR管理员**：绩效考核、薪酬分配、员工管理
- **部门主管**：部门目标设定、分红分配、项目审批
- **项目经理**：项目立项、进度管理、分红方案制定
- **普通员工**：自评、参与项目、查看个人绩效与分红

---

#### 七、系统集成与扩展

- **多租户支持**：所有数据表均需tenant_id隔离
- **微服务架构**：各模块独立服务，支持水平扩展
- **流程引擎集成**：与Flowable无缝对接，支持自定义审批流
- **数据统计与报表**：支持多维度统计分析，导出报表
- **安全与审计**：操作日志、数据变更记录、权限控制

---

#### 八、实施建议

- **数据迁移**：保持与原有表结构兼容，平滑迁移
- **接口规范**：RESTful API，统一响应格式
- **前端设计**：现代化UI，支持移动端，数据可视化
- **性能优化**：合理索引、缓存机制、分布式部署
- **风险控制**：数据备份、权限校验、流程回滚

---

#### 九、验收标准

- 原有项目管理功能100%复现
- 新增绩效、薪酬、分红功能完整实现
- 业务流程端到端测试通过
- 多租户数据隔离与权限控制无误
- 数据统计、报表、审批流等功能可用

---

如需详细表结构SQL、接口设计或流程图，可进一步补充。  
如有细节问题，欢迎随时补充需求！

---

**（如需英文版或详细ER图、流程图，请告知）** 