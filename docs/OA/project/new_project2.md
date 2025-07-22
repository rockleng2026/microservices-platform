## 项目具体分配模型 V2
基于原有项目管理的功能上进行扩展
项目表增加字段 financial_model_instance_id 财务模型实例id 关联到财务分析模块
增加一个项目计提配置表，根据模型配置生成数据
增加一个项目计提明细表，保存具体的集团/部门/员工个人提成/员工项目提成的明细数据

### 设计交互明细
第一步 项目计提配置 生成项目提成模型配置表
选择模型->选择模型实例->配置模型分配方案
选择集团分配
选择部分分配
选择员工个人提成分配
选择员工项目提成
第二步 项目结项时 根据项目毛利润自动计算出各个分配项的具体金额 和总毛利润的占比 金额自动更新到关联项目提成模型配置表

id 项目id 项目名称 模型变量名称 模型code 金额 表达式                毛利润总占比
1  1    a项目   集团分配    xxx1   50000  gain_profits * 50%   50%
2  1    a项目   部门分配    xxx1   50000  gain_profits * 50%*30%   15%
3  1   a项目   员工个人提成    xxx1   50000  gain_profits * 50%*30%   15%
4  1    a项目   员工项目提成    xxx1   50000  gain_profits * 50%*30%   15%


第三步，项目计提
读取项目的信息以及项目计提配置列表，参考现有v1版页面的交互方式，罗列出所有及计提配置，在列表右边点击添加，新增一行
选择类比 集团/部门/员工 集团就是固定值，部门二级联动显示当前项目的所有大部门名称，选择员工默认当前项目的所有参与员工
然后对选择的项进行分配比例配置，然后关联显示对应的金额 和毛利润占比，所有的子项金额之和不能超过计提配置的最大值
最终确认无误后写入项目计提分配表
具体分配表 100W利润
id 名称  提成类型  提成金额 提成总占比 关联提成实例表Id
1  集团 集团分配    50W    50%       1
2  A部门 部门分配  3.75W 0.5*0.3*0.25=3.75% 2
3  B部门 部门分配  3.75W 0.5*0.3*0.25=3.75% 2
4  C部门 部门分配  3.75W 0.5*0.3*0.25=3.75% 2
5  C部门 部门分配  3.75W 0.5*0.3*0.25=3.75% 2

6  A员工 员工个人提成  1W   2%  3
7  A员工 员工项目提成  1W  0.5% 4

原有设计
只有部分分配/员工分配 --> 现在需要增加分配类型 也就是读取模型的分配方式 集团分配/部门分配/员工个人提成/员工项目提成


### 要求
1、请分析现有项目管理的功能，了解现有项目的整体交互和接口
2、结合新需求，设计表结构
3、生成后端实现代码，新的需求功能的接口统一用v2 用于区别老的功能实现
4、请完成前端交互设计且与后端进行联调

---

## 1. 需求梳理与核心要点

**核心流程：**
1. 项目计提配置（选择模型、配置分配方案，集团/部门/员工个人/员工项目提成）
2. 项目结项时自动计算各分配项金额和占比，写入配置表
3. 项目计提分配（可手动调整，金额之和不能超过最大值，最终写入分配表）

**分配类型：**
- 集团分配
- 部门分配（支持多部门,项目参与的二级部门）
- 员工个人提成(项目下的参与人)
- 员工项目提成

---

## 2. 表结构设计（基于现有 central_project.sql 扩展）

### 2.1 新增/扩展表结构

#### 2.1.1 项目表（扩展）
```sql
ALTER TABLE `project`
  ADD COLUMN `financial_model_instance_id` BIGINT(20) DEFAULT NULL COMMENT '财务模型实例id';
```

#### 2.1.2 项目计提配置表（新）
```sql
CREATE TABLE `project_accrual_config` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` BIGINT(20) NOT NULL COMMENT '项目ID',
  `model_instance_id` BIGINT(20) NOT NULL COMMENT '财务模型实例ID',
  `type` VARCHAR(20) NOT NULL COMMENT '分配类型（group/department/project_individual/project_team）',
  `name` VARCHAR(100) NOT NULL COMMENT '分配项名称-默认模型变量名称',
  `model_variable_code` VARCHAR(20) NOT NULL COMMENT '模型变量code',
  `max_amount` DECIMAL(18,2) DEFAULT NULL COMMENT '最大可分配金额',
  `max_ratio` DECIMAL(5,2) DEFAULT NULL COMMENT '最大可分配比例',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `tenant_id` VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project`(`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目计提配置表';
```

#### 2.1.3 项目计提明细表（新）
```sql
CREATE TABLE `project_accrual_detail` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` BIGINT(20) NOT NULL COMMENT '项目ID',
  `config_id` BIGINT(20) NOT NULL COMMENT '计提配置ID',
  `type` VARCHAR(20) NOT NULL COMMENT '分配类型（group/department/project_individual/project_team）',
  `target_id` BIGINT(20) DEFAULT NULL COMMENT '目标ID（集团/部门/员工）',
  `target_name` VARCHAR(100) DEFAULT NULL COMMENT '目标名称',
  `amount` DECIMAL(18,2) NOT NULL COMMENT '分配金额',
  `ratio` DECIMAL(5,2) DEFAULT NULL COMMENT '当前分配占比',
  `total_ratio` DECIMAL(5,2) DEFAULT NULL COMMENT '总毛利润的分配占比',
  `tenant_id` VARCHAR(32) DEFAULT 'default' COMMENT '租户ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project`(`project_id`),
  INDEX `idx_config`(`config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目计提明细表';
```

---

## 3. 后端接口设计（建议统一加 `/v2/` 前缀）

### 3.1 主要接口

#### 3.1.1 获取项目可选模型及实例
- `GET /api/v2/project/{projectId}/accrual-models`
- 返回：模型列表、实例列表

#### 3.1.2 获取项目计提配置
- `GET /api/v2/project/{projectId}/accrual-config`
- 返回：所有配置项（集团/部门/员工等）

#### 3.1.3 保存/更新项目计提配置
- `POST /api/v2/project/{projectId}/accrual-config`
- 入参：配置项数组

#### 3.1.4 获取项目计提明细
- `GET /api/v2/project/{projectId}/accrual-detail`
- 返回：所有分配明细

#### 3.1.5 保存/更新项目计提明细
- `POST /api/v2/project/{projectId}/accrual-detail`
- 入参：明细项数组

#### 3.1.6 结项时自动计算分配
- `POST /api/v2/project/{projectId}/accrual-calc`
- 入参：结项数据
- 返回：各分配项金额、占比

---

## 4. 前端交互设计

### 4.1 主要页面/弹窗

#### 4.1.1 项目计提配置页面
- 选择模型、模型实例
- 配置分配项（集团/部门/员工/个人），支持添加/删除/排序
- 每项可填写表达式、最大金额/比例

#### 4.1.2 项目结项分配页面
- 展示所有分配项，自动带出金额和占比
- 支持手动调整分配明细（如部门/员工分配）
- 校验总金额不超过最大值
- 实时显示各项金额、占比、总计

#### 4.1.3 分配明细表
- 列表展示所有分配明细
- 支持导出、打印

---

## 5. 示例表结构SQL（可直接用）

```sql
-- 项目表扩展
ALTER TABLE `project`
  ADD COLUMN `financial_model_instance_id` BIGINT(20) DEFAULT NULL COMMENT '财务模型实例id';

-- 项目计提配置表
CREATE TABLE `project_accrual_config` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` BIGINT(20) NOT NULL COMMENT '项目ID',
  `model_instance_id` BIGINT(20) NOT NULL COMMENT '财务模型实例ID',
  `type` VARCHAR(20) NOT NULL COMMENT '分配类型（group/department/employee/personal）',
  `name` VARCHAR(100) NOT NULL COMMENT '分配项名称',
  `expression` VARCHAR(200) NOT NULL COMMENT '分配表达式',
  `max_amount` DECIMAL(18,2) DEFAULT NULL COMMENT '最大可分配金额',
  `max_ratio` DECIMAL(5,2) DEFAULT NULL COMMENT '最大可分配比例',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project`(`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目计提配置表';

-- 项目计提明细表
CREATE TABLE `project_accrual_detail` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` BIGINT(20) NOT NULL COMMENT '项目ID',
  `config_id` BIGINT(20) NOT NULL COMMENT '计提配置ID',
  `type` VARCHAR(20) NOT NULL COMMENT '分配类型（group/department/employee/personal）',
  `target_id` BIGINT(20) DEFAULT NULL COMMENT '目标ID（集团/部门/员工）',
  `target_name` VARCHAR(100) DEFAULT NULL COMMENT '目标名称',
  `amount` DECIMAL(18,2) NOT NULL COMMENT '分配金额',
  `ratio` DECIMAL(5,2) DEFAULT NULL COMMENT '分配占比',
  `expression` VARCHAR(200) DEFAULT NULL COMMENT '分配表达式',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project`(`project_id`),
  INDEX `idx_config`(`config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目计提明细表';
```

---

## 6. 后端实现建议

- 推荐在 `project-manager-service` 新建 `ProjectAccrualConfigController`、`ProjectAccrualDetailController`
- Service 层实现配置、明细的增删改查和自动计算逻辑
- 结项时自动计算分配金额，支持表达式解析（如 gain_profits * 50% * 30%）

---

## 7. 前端实现建议

- 在项目详情页增加“计提配置”与“计提分配”入口
- 计提配置页：表单+动态分配项列表，支持表达式输入
- 计提分配页：分配明细表格，支持动态添加/编辑/校验
- 结项时自动带出分配明细，支持手动调整
- 所有接口统一用 `/v2/` 前缀，便于新老功能切换

---

如需具体后端Java代码或前端React页面代码示例，请告知需要哪一部分，我可以直接生成！