# CRM

## 表枚举说明
8个表的11个枚举字段全部使用英文值：
customer表
customer_type: 'individual','enterprise'
customer_status: 'potential','confirmed','lost'
opportunity表
stage: 'potential','initial_contact','requirement_confirmed','solution_demo','business_negotiation','contract_signed','won','lost'
customer_follow表
follow_type: 'phone','visit','email','wechat','other'
stage: 同opportunity表
individual_customer表
gender: 'male','female','unknown'
marital_status: 'single','married','divorced','widowed','unknown'
education: 'primary','junior','senior','college','bachelor','master','doctor','other'
corporate_customer表
company_nature: 'state_owned','private','foreign','joint_venture','other'
customer_transfer表
approval_status: 'pending','approved','rejected'
✅ 数据脚本修复 (crm_init_data.sql)
26处枚举值全部修正为英文：
✅ 客户类型：'企业' → 'enterprise', '个人' → 'individual'
✅ 客户状态：'已确认' → 'confirmed', '潜在客户' → 'potential'
✅ 商机阶段：'商务谈判' → 'business_negotiation' 等
✅ 跟进方式：'电话' → 'phone', '拜访' → 'visit' 等
✅ 性别：'男' → 'male', '女' → 'female'
✅ 婚姻状况：'已婚' → 'married', '未婚' → 'single'
✅ 教育程度：'本科' → 'bachelor', '硕士' → 'master', '大专' → 'college'
✅ 企业性质：'民营企业' → 'private'
✅ 审批状态：'已通过' → 'approved', '待审批' → 'pending'
