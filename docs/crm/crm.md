# 客户关系管理系统
我们设计一个现代化的CRM系统，需要满足以下需求：
1. 支持个人客户和企业客户
2. 客户状态：意向客户（商机）和正式客户
3. 意向客户跟进 
4. 转正式客户 状态机管理（意向→正式→流失）
5. 客户移交
6. 客户资料详细

系统核心模块
    客户管理：个人/企业客户全生命周期管理
    商机管理：意向客户创建、跟进、转化
    客户移交：负责人变更流程
    审核体系：关键操作审核追踪

客户分类优化
  主表区分个人/企业类型
  扩展表存储差异化信息（身份证/营业执照等）
  状态机管理（意向→正式→流失）

商机全流程管理

  跟进记录关联商机阶段
    可视化销售漏斗（初步接触→成交）    
    自动提醒下次跟进时间

审计追踪

    关键操作记录（移交/审核）    
    数据变更历史可追溯    
    完整时间戳记录    
    现代化字段    
    使用ENUM限定取值范围    
    日期时间用DATETIME类型    
    删除标记改用布尔值

### 业务流程
graph TD
A[创建意向客户] --> B{客户类型}
B -->|个人| C[填写个人资料]
B -->|企业| D[填写企业资料]
C --> E[添加跟进记录]
D --> E
E --> F{是否成交}
F -->|是| G[转为正式客户]
F -->|否| H[继续跟进]
G --> I[创建系统账户]
I --> J[服务开通]

设计满足以下需求：
    完整记录个人/企业客户信息
    商机跟进与转化流程管理
    客户负责人变更流程
    全操作审计追踪

## 数据库表结构设计
### 1. 客户主表 (customer)
| 字段名               | 类型         | 空/非空 | 默认值 | 约束条件       | 说明                          |
|----------------------|--------------|---------|--------|----------------|-----------------------------|
| customer_id          | BIGINT       | NOT NULL|        | 主键, AUTO_INCREMENT | 客户唯一标识              |
| customer_type        | ENUM('个人','企业') | NOT NULL| '个人' |                | 客户类型                    |
| customer_status      | ENUM('意向','正式','流失') | NOT NULL| '意向' | | 客户状态                  |
| customer_name        | VARCHAR(100) | NOT NULL|        |                | 客户名称/企业名称           |
| customer_source      | VARCHAR(50)  | NULL    |        |                | 来源渠道(线上/展会/转介绍等)|
| owner_employee_id    | INT          | NOT NULL|        | 外键(employee) | 业务负责人                  |
| **审计字段**    |              |         |                  |                    |
| created_at      | DATETIME     | NOT NULL| NOW()            | 创建时间           |
| created_by      | INT          | NOT NULL| 外键(employee)   | 创建人ID           |
| updated_at      | DATETIME     | NULL    |                  | 更新时间           |
| updated_by      | INT          | NULL    | 外键(employee)   | 更新人ID           |
| is_deleted           | TINYINT(1)   | NOT NULL| 0      |                | 删除标记(0:正常 1:删除)     |


### 2. 个人客户扩展表 (individual_customer)
| 字段名           | 类型         | 空/非空 | 约束条件         | 说明      |
|---------------|--------------|---------|------------------|---------|
| individual_id | BIGINT       | NOT NULL| 主键, AUTO_INCREMENT | 个人ID    |
| customer_id   | BIGINT       | NOT NULL| 外键(customer)   | 关联客户ID  |
| real_name     | VARCHAR(50)  | NOT NULL|                  | 真实姓名    |
| id_card       | VARCHAR(20)  | NULL    | UNIQUE           | 身份证号    |
| mobile_phone  | VARCHAR(15)  | NOT NULL|                  | 手机号     |
| email         | VARCHAR(50)  | NULL    |                  | 邮箱      |
| weixin        | VARCHAR(20)  | NULL    |                  | weixin号 |
| date_of_birth | DATE         | NULL    |                  | 出生日期    |
| id_card_photo | VARCHAR(255) | NULL    |                  | 身份证照片路径 |
| **审计字段**      |              |         |                  |         |
| created_at    | DATETIME     | NOT NULL| NOW()            | 创建时间    |
| created_by    | INT          | NOT NULL| 外键(employee)   | 创建人ID   |
| updated_at    | DATETIME     | NULL    |                  | 更新时间    |
| updated_by    | INT          | NULL    | 外键(employee)   | 更新人ID   |

### 3. 企业客户扩展表 (corporate_customer)
| 字段名            | 类型         | 空/非空 | 约束条件         | 说明                |
|-------------------|--------------|---------|------------------|---------------------|
| corporate_id      | BIGINT       | NOT NULL| 主键, AUTO_INCREMENT | 企业ID           |
| customer_id       | BIGINT       | NOT NULL| 外键(customer)   | 关联客户ID         |
| business_license  | VARCHAR(50)  | NOT NULL| UNIQUE           | 营业执照号          |
| company_address   | VARCHAR(200) | NOT NULL|                  | 公司注册地址        |
| company_phone     | VARCHAR(20)  | NOT NULL|                  | 公司电话            |
| company_fax       | VARCHAR(20)  | NULL    |                  | 传真号码            |
| company_scale     | ENUM('小微','中小','大型','集团') | NULL |      | 公司规模            |
| legal_representative | VARCHAR(50) | NOT NULL |                | 法定代表人          |
| business_contact  | VARCHAR(50)  | NOT NULL|                  | 业务联系人          |
| contact_phone     | VARCHAR(15)  | NOT NULL|                  | 联系人电话          |
| **审计字段**    |              |         |                  |                    |
| created_at      | DATETIME     | NOT NULL| NOW()            | 创建时间           |
| created_by      | INT          | NOT NULL| 外键(employee)   | 创建人ID           |
| updated_at      | DATETIME     | NULL    |                  | 更新时间           |
| updated_by      | INT          | NULL    | 外键(employee)   | 更新人ID           |

### 4. 客户跟进表 (customer_follow)
| 字段名          | 类型          | 空/非空 | 约束条件         | 说明                     |
|-----------------|---------------|---------|------------------|--------------------------|
| follow_id       | BIGINT        | NOT NULL| 主键, AUTO_INCREMENT | 跟进ID               |
| customer_id     | BIGINT        | NOT NULL| 外键(customer)   | 关联客户ID             |
| employee_id     | INT           | NOT NULL| 外键(employee)   | 跟进人ID               |
| follow_type     | ENUM('电话','拜访','邮件','微信','其他') | NOT NULL |   | 跟进方式               |
| follow_time     | DATETIME      | NOT NULL|                  | 跟进时间               |
| next_follow_time| DATETIME      | NULL    |                  | 下次跟进时间           |
| content         | TEXT          | NOT NULL|                  | 跟进内容               |
| stage           | ENUM('初步接触','需求分析','方案报价','谈判','成交','流失') | NOT NULL | | 商机阶段 |
| probability     | TINYINT       | NULL    |                  | 成交概率(0-100%)       |
| **审计字段**    |              |         |                  |                    |
| created_at      | DATETIME     | NOT NULL| NOW()            | 创建时间           |
| created_by      | INT          | NOT NULL| 外键(employee)   | 创建人ID           |
| updated_at      | DATETIME     | NULL    |                  | 更新时间           |
| updated_by      | INT          | NULL    | 外键(employee)   | 更新人ID           |

### 5. 客户移交表 (customer_transfer)
| 字段名          | 类型         | 空/非空 | 约束条件         | 说明                |
|-----------------|--------------|---------|------------------|---------------------|
| transfer_id     | BIGINT       | NOT NULL| 主键, AUTO_INCREMENT | 移交ID          |
| customer_id     | BIGINT       | NOT NULL| 外键(customer)   | 关联客户ID         |
| from_employee_id| INT          | NOT NULL| 外键(employee)   | 原负责人ID         |
| to_employee_id  | INT          | NOT NULL| 外键(employee)   | 新负责人ID         |
| transfer_reason | VARCHAR(200) | NOT NULL|                  | 移交原因            |
| transfer_time   | DATETIME     | NOT NULL| NOW()            | 移交时间            |
| approval_status | ENUM('待审批','已通过','已拒绝') | NOT NULL |         | 审批状态            |
| **审计字段**    |              |         |                  |                    |
| created_at      | DATETIME     | NOT NULL| NOW()            | 创建时间           |
| created_by      | INT          | NOT NULL| 外键(employee)   | 创建人ID           |
| updated_at      | DATETIME     | NULL    |                  | 更新时间           |
| updated_by      | INT          | NULL    | 外键(employee)   | 更新人ID           |



### 7. 审核记录表 (audit_log)
| 字段名          | 类型         | 空/非空 | 约束条件         | 说明                |
|-----------------|--------------|---------|------------------|---------------------|
| audit_id        | BIGINT       | NOT NULL| 主键, AUTO_INCREMENT | 审核ID          |
| customer_id     | BIGINT       | NOT NULL| 外键(customer)   | 关联客户ID         |
| employee_id     | INT          | NOT NULL| 外键(employee)   | 审核人ID           |
| audit_type      | VARCHAR(50)  | NOT NULL|                  | 审核类型(升级/移交等)|
| audit_time      | DATETIME     | NOT NULL| NOW()            | 审核时间            |
| audit_result    | ENUM('通过','拒绝') | NOT NULL |             | 审核结果            |
| audit_notes     | TEXT         | NULL    |                  | 审核意见            |
| **审计字段**    |              |         |                  |                    |
| created_at      | DATETIME     | NOT NULL| NOW()            | 创建时间           |
| created_by      | INT          | NOT NULL| 外键(employee)   | 创建人ID           |
| updated_at      | DATETIME     | NULL    |                  | 更新时间           |
| updated_by      | INT          | NULL    | 外键(employee)   | 更新人ID           |


增加审计字段
