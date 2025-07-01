-- CRM服务初始数据脚本
-- 用于生成测试数据，包含客户、商机、跟进记录等完整业务场景

-- 使用central_crm数据库
USE central_crm;

-- 1. 插入客户标签数据
INSERT INTO customer_tag (tag_id, tag_name, tag_color, description, sort_order, is_enabled, created_at, created_by, updated_at, updated_by) VALUES
(1001, '重要客户', '#FF6B6B', '具有较高商业价值的重要客户', 1, 1, NOW(), 1001, NOW(), 1001),
(1002, 'potential', '#4ECDC4', '有购买意向但未成交的潜在客户', 2, 1, NOW(), 1001, NOW(), 1001),
(1003, '老客户', '#45B7D1', '已有长期合作关系的客户', 3, 1, NOW(), 1001, NOW(), 1001),
(1004, '高价值', '#96CEB4', '年消费金额较高的客户', 4, 1, NOW(), 1001, NOW(), 1001),
(1005, '科技行业', '#FFEAA7', '科技互联网行业客户', 5, 1, NOW(), 1001, NOW(), 1001),
(1006, '制造业', '#DDA0DD', '制造业行业客户', 6, 1, NOW(), 1001, NOW(), 1001),
(1007, '金融业', '#98D8C8', '金融保险行业客户', 7, 1, NOW(), 1001, NOW(), 1001),
(1008, '教育行业', '#FDCB6E', '教育培训行业客户', 8, 1, NOW(), 1001, NOW(), 1001);

-- 2. 插入客户数据
INSERT INTO customer (customer_id, tenant_id, customer_name, customer_type, customer_status, customer_source, owner_employee_id, contact_phone, contact_email, contact_address, industry, company_scale, annual_revenue, website, description, created_at, created_by, updated_at, updated_by, is_deleted) VALUES
-- 企业客户
(2001, 'default', '阿里云计算有限公司', 'enterprise', 'confirmed', '网络推广', 3001, '400-8888-888', 'business@aliyun.com', '杭州市西湖区文三路969号', '云计算', '1000人以上', 50000000.00, 'https://www.aliyun.com', '国内领先的云计算服务提供商', NOW(), 1001, NOW(), 1001, 0),
(2002, 'default', '腾讯科技(深圳)有限公司', 'enterprise', 'confirmed', '客户介绍', 3002, '0755-86013388', 'contact@tencent.com', '深圳市南山区科技中一路腾讯大厦', '互联网', '1000人以上', 80000000.00, 'https://www.tencent.com', '国内知名互联网公司', NOW(), 1001, NOW(), 1001, 0),
(2003, 'default', '华为技术有限公司', 'enterprise', 'confirmed', '展会获取', 3001, '400-822-9999', 'info@huawei.com', '深圳市龙岗区坂田华为总部', '通信设备', '1000人以上', 120000000.00, 'https://www.huawei.com', '全球领先的ICT解决方案提供商', NOW(), 1001, NOW(), 1001, 0),
(2004, 'default', '字节跳动科技有限公司', 'enterprise', 'potential', '网络推广', 3003, '400-140-2108', 'business@bytedance.com', '北京市海淀区知春路甲48号', '互联网', '1000人以上', 60000000.00, 'https://www.bytedance.com', '全球化的互联网技术公司', NOW(), 1001, NOW(), 1001, 0),
(2005, 'default', '美团', 'enterprise', 'confirmed', '客户介绍', 3002, '10109777', 'corp@meituan.com', '北京市朝阳区望京东路6号', '电子商务', '501-1000人', 35000000.00, 'https://www.meituan.com', '本地生活服务平台', NOW(), 1001, NOW(), 1001, 0),
(2006, 'default', '小米科技有限责任公司', 'enterprise', 'potential', '电话营销', 3001, '400-100-5678', 'service@xiaomi.com', '北京市海淀区清河中街68号', '消费电子', '501-1000人', 25000000.00, 'https://www.mi.com', '智能手机及智能硬件制造商', NOW(), 1001, NOW(), 1001, 0),
(2007, 'default', '滴滴出行科技有限公司', 'enterprise', 'lost', '网络推广', 3003, '400-000-0999', 'business@didiglobal.com', '北京市海淀区中关村软件园', '共享出行', '501-1000人', 15000000.00, 'https://www.didiglobal.com', '移动出行和本地生活服务平台', NOW(), 1001, NOW(), 1001, 0),
(2008, 'default', '比亚迪股份有限公司', 'enterprise', 'confirmed', '展会获取', 3002, '0755-8988-8888', 'ir@byd.com', '深圳市坪山区比亚迪路3009号', '新能源汽车', '1000人以上', 45000000.00, 'https://www.byd.com', '新能源汽车及电池制造商', NOW(), 1001, NOW(), 1001, 0),
-- 个人客户
(2009, 'default', '张明', 'individual', 'confirmed', '客户介绍', 3001, '13800138001', 'zhangming@email.com', '北京市朝阳区建国门外大街1号', '软件开发', 'individual', 300000.00, '', 'IT从业者，有软件采购需求', NOW(), 1001, NOW(), 1001, 0),
(2010, 'default', '李华', 'individual', 'potential', '网络推广', 3002, '13800138002', 'lihua@email.com', '上海市浦东新区陆家嘴环路1000号', '金融', 'individual', 500000.00, '', '金融行业从业者', NOW(), 1001, NOW(), 1001, 0),
(2011, 'default', '王芳', 'individual', 'confirmed', '电话营销', 3003, '13800138003', 'wangfang@email.com', '广州市天河区珠江新城花城大道85号', '教育', 'individual', 200000.00, '', '教育培训机构负责人', NOW(), 1001, NOW(), 1001, 0),
(2012, 'default', '刘强', 'individual', 'potential', '客户介绍', 3001, '13800138004', 'liuqiang@email.com', '深圳市南山区科技园南区', '制造业', 'individual', 800000.00, '', '制造业企业主', NOW(), 1001, NOW(), 1001, 0);

-- 3. 插入企业客户扩展信息
INSERT INTO corporate_customer (id, customer_id, company_full_name, credit_code, legal_person, registered_capital, establishment_date, business_scope, company_nature, employee_count, main_products, target_customers, official_website, office_address, registered_address, bank_account, bank_name, tax_number, main_contact, contact_position, contact_phone, contact_email, decision_maker, purchase_process, payment_method, credit_rating, created_at, created_by, updated_at, updated_by) VALUES
(3001, 2001, '阿里云计算有限公司', '91330000MA27Q2XQ2G', '张勇', 100000000.00, '2009-09-10', '云计算、大数据、人工智能技术开发', 'private', '1000人以上', '云服务器、云数据库、CDN', '企业客户', 'https://www.aliyun.com', '杭州市西湖区文三路969号', '杭州市余杭区文一西路969号', '1234567890123456789', '中国工商银行', '91330000MA27Q2XQ2G', '李云', '商务总监', '400-8888-888', 'business@aliyun.com', '张勇', '1个月内决策', '月付/年付', 'AAA', NOW(), 1001, NOW(), 1001),
(3002, 2002, '腾讯科技(深圳)有限公司', '914403001922038216', '马化腾', 6500000000.00, '1998-11-11', '互联网信息服务、软件开发', 'private', '1000人以上', '微信、QQ、腾讯云', '个人及企业用户', 'https://www.tencent.com', '深圳市南山区科技中一路腾讯大厦', '深圳市南山区科技中一路腾讯大厦', '9876543210987654321', '招商银行', '914403001922038216', '王企鹅', '企业发展部总监', '0755-86013388', 'contact@tencent.com', '马化腾', '3个月决策周期', '季付/年付', 'AAA', NOW(), 1001, NOW(), 1001),
(3003, 2003, '华为技术有限公司', '91440300708461136T', '任正非', 4003350000.00, '1987-09-15', '通信设备、企业网络、消费终端', 'private', '1000人以上', '手机、网络设备、企业解决方案', '全球企业客户', 'https://www.huawei.com', '深圳市龙岗区坂田华为总部', '深圳市龙岗区坂田华为总部', '1357924680246813579', '中国银行', '91440300708461136T', '余承东', '企业业务总裁', '400-822-9999', 'info@huawei.com', '任正非', '6个月决策周期', '分期付款', 'AAA', NOW(), 1001, NOW(), 1001),
(3004, 2004, '字节跳动科技有限公司', '91110108MA00EZ0K7A', '梁汝波', 1000000000.00, '2012-03-09', '技术开发、技术咨询、技术服务', 'private', '1000人以上', '抖音、今日头条、飞书', '全球用户', 'https://www.bytedance.com', '北京市海淀区知春路甲48号', '北京市海淀区知春路甲48号', '2468135792468135792', '中国建设银行', '91110108MA00EZ0K7A', '张一鸣', '产品运营总监', '400-140-2108', 'business@bytedance.com', '梁汝波', '2个月决策周期', '月付/季付', 'AA', NOW(), 1001, NOW(), 1001);

-- 4. 插入个人客户扩展信息
INSERT INTO individual_customer (id, customer_id, real_name, id_card, gender, birth_date, marital_status, education, occupation, annual_income, home_address, work_company, work_address, hobbies, wechat, qq, emergency_contact, emergency_phone, created_at, created_by, updated_at, updated_by) VALUES
(4001, 2009, '张明', '110101199001011234', 'male', '1990-01-01', 'married', 'bachelor', '软件工程师', '300000', '北京市朝阳区建国门外大街1号', '百度在线网络技术有限公司', '北京市海淀区上地十街10号', '编程、阅读、旅游', 'zhangming_wx', '123456789', '李梅', '13900139001', NOW(), 1001, NOW(), 1001),
(4002, 2010, '李华', '310101198501015678', 'female', '1985-01-01', 'married', 'master', '投资经理', '500000', '上海市浦东新区陆家嘴环路1000号', '中信证券股份有限公司', '上海市浦东新区银城中路68号', '投资理财、健身、音乐', 'lihua_wx', '987654321', '王强', '13900139002', NOW(), 1001, NOW(), 1001),
(4003, 2011, '王芳', '440101198801019012', 'female', '1988-01-01', 'single', 'bachelor', '教育培训机构负责人', '200000', '广州市天河区珠江新城花城大道85号', '新东方教育科技集团', '广州市天河区珠江新城花城大道85号', '教育、读书、瑜伽', 'wangfang_wx', '135792468', '王父', '13900139003', NOW(), 1001, NOW(), 1001),
(4004, 2012, '刘强', '320101197501013456', 'male', '1975-01-01', 'married', 'college', '制造业企业主', '800000', '深圳市南山区科技园南区', '深圳市强盛制造有限公司', '深圳市南山区科技园南区', '商务、高尔夫、收藏', 'liuqiang_wx', '246813579', '刘妻', '13900139004', NOW(), 1001, NOW(), 1001);

-- 5. 插入客户标签关联
INSERT INTO customer_tag_relation (relation_id, customer_id, tag_id, created_at, created_by) VALUES
-- 阿里云：重要客户、科技行业、高价值
(5001, 2001, 1001, NOW(), 1001),
(5002, 2001, 1005, NOW(), 1001),
(5003, 2001, 1004, NOW(), 1001),
-- 腾讯：重要客户、科技行业、老客户
(5004, 2002, 1001, NOW(), 1001),
(5005, 2002, 1005, NOW(), 1001),
(5006, 2002, 1003, NOW(), 1001),
-- 华为：重要客户、科技行业、高价值
(5007, 2003, 1001, NOW(), 1001),
(5008, 2003, 1005, NOW(), 1001),
(5009, 2003, 1004, NOW(), 1001),
-- 字节跳动：潜在客户、科技行业
(5010, 2004, 1002, NOW(), 1001),
(5011, 2004, 1005, NOW(), 1001),
-- 美团：重要客户、科技行业
(5012, 2005, 1001, NOW(), 1001),
(5013, 2005, 1005, NOW(), 1001),
-- 个人客户标签
(5014, 2009, 1002, NOW(), 1001),
(5015, 2010, 1007, NOW(), 1001),
(5016, 2011, 1008, NOW(), 1001),
(5017, 2012, 1006, NOW(), 1001);

-- 6. 插入商机数据
INSERT INTO opportunity (opportunity_id, tenant_id, customer_id, opportunity_name, opportunity_source, stage, probability, expected_amount, expected_close_date, owner_employee_id, competitor, description, created_at, created_by, updated_at, updated_by, is_deleted) VALUES
(6001, 'default', 2001, '阿里云企业级解决方案采购', '客户介绍', 'business_negotiation', 70, 1200000.00, '2024-02-15', 3001, '腾讯云,华为云', '阿里云需要采购企业级CRM解决方案，预算充足', NOW(), 1001, NOW(), 1001, 0),
(6002, 'default', 2002, '腾讯内部管理系统升级', '老客户', 'solution_demo', 50, 800000.00, '2024-03-01', 3002, '阿里云,华为云', '腾讯计划升级内部客户管理系统', NOW(), 1001, NOW(), 1001, 0),
(6003, 'default', 2003, '华为全球CRM平台建设', '展会获取', 'contract_signed', 90, 2500000.00, '2024-01-30', 3001, '微软,Salesforce', '华为全球业务CRM平台统一建设项目', NOW(), 1001, NOW(), 1001, 0),
(6004, 'default', 2004, '字节跳动营销自动化平台', '网络推广', 'requirement_confirmed', 30, 600000.00, '2024-04-15', 3003, 'HubSpot,Marketo', '字节跳动营销部门自动化工具需求', NOW(), 1001, NOW(), 1001, 0),
(6005, 'default', 2005, '美团商家CRM系统', '客户介绍', 'initial_contact', 20, 400000.00, '2024-05-01', 3002, '有赞,微盟', '美团商家端客户关系管理系统', NOW(), 1001, NOW(), 1001, 0),
(6006, 'default', 2006, '小米生态链CRM', '电话营销', 'potential', 10, 300000.00, '2024-06-01', 3001, '金蝶,用友', '小米生态链企业客户管理需求', NOW(), 1001, NOW(), 1001, 0),
(6007, 'default', 2001, '阿里云大数据分析平台', '老客户', 'won', 100, 1500000.00, '2023-12-15', 3001, '', '已成交的大数据分析平台项目', NOW(), 1001, NOW(), 1001, 0),
(6008, 'default', 2008, '比亚迪销售管理系统', '展会获取', 'business_negotiation', 60, 800000.00, '2024-02-28', 3002, '金蝶,用友', '比亚迪汽车销售管理系统建设', NOW(), 1001, NOW(), 1001, 0),
(6009, 'default', 2009, '个人软件采购', '客户介绍', 'won', 100, 50000.00, '2023-11-30', 3001, '', '个人客户软件工具采购', NOW(), 1001, NOW(), 1001, 0),
(6010, 'default', 2010, '投资管理工具', '网络推广', 'solution_demo', 40, 80000.00, '2024-03-15', 3002, 'Wind,Bloomberg', '投资管理和分析工具需求', NOW(), 1001, NOW(), 1001, 0);

-- 7. 插入客户跟进记录
INSERT INTO customer_follow (follow_id, customer_id, employee_id, follow_type, follow_time, next_follow_time, content, stage, probability, created_at, created_by, updated_at, updated_by) VALUES
(7001, 2001, 3001, 'phone', '2024-01-05 14:30:00', '2024-01-12 14:30:00', '与阿里云技术总监通话，了解其CRM需求，客户对我们的解决方案很感兴趣，约定下周进行详细方案演示。', 'requirement_confirmed', 60, NOW(), 3001, NOW(), 3001),
(7002, 2001, 3001, 'visit', '2024-01-12 10:00:00', '2024-01-19 10:00:00', '在阿里云总部进行方案演示，客户对功能很满意，特别是大数据分析模块。提出了一些定制化需求，需要准备详细报价。', 'solution_demo', 70, NOW(), 3001, NOW(), 3001),
(7003, 2002, 3002, 'email', '2024-01-03 09:00:00', '2024-01-10 09:00:00', '发送产品介绍邮件给腾讯采购部，收到回复表示有兴趣，安排下周电话沟通。', 'initial_contact', 30, NOW(), 3002, NOW(), 3002),
(7004, 2002, 3002, 'phone', '2024-01-10 15:00:00', '2024-01-17 15:00:00', '与腾讯采购经理电话沟通，了解其现有系统痛点和升级需求。客户预算500-1000万，时间不紧急。', 'requirement_confirmed', 40, NOW(), 3002, NOW(), 3002),
(7005, 2003, 3001, 'visit', '2024-01-08 14:00:00', '2024-01-15 14:00:00', '拜访华为企业业务部门，深入了解全球CRM统一平台需求。项目规模大，决策周期长，需要多轮方案优化。', 'requirement_confirmed', 50, NOW(), 3001, NOW(), 3001),
(7006, 2003, 3001, 'visit', '2024-01-15 10:30:00', '2024-01-22 10:30:00', '参加华为内部需求评审会议，与技术团队详细讨论集成方案。客户对我们的技术实力认可，进入商务谈判阶段。', 'business_negotiation', 80, NOW(), 3001, NOW(), 3001),
(7007, 2004, 3003, 'phone', '2024-01-06 11:00:00', '2024-01-13 11:00:00', '字节跳动营销负责人电话沟通，了解营销自动化需求。客户正在调研阶段，预算未定。', 'potential', 20, NOW(), 3003, NOW(), 3003),
(7008, 2005, 3002, 'email', '2024-01-04 16:00:00', '2024-01-11 16:00:00', '美团商家业务部询问CRM解决方案，发送初步方案介绍材料。', 'initial_contact', 25, NOW(), 3002, NOW(), 3002),
(7009, 2006, 3001, 'phone', '2024-01-07 13:30:00', '2024-01-14 13:30:00', '小米生态链负责人电话了解，目前还在内部论证阶段，3个月后会有明确需求。', 'potential', 15, NOW(), 3001, NOW(), 3001),
(7010, 2008, 3002, 'visit', '2024-01-09 15:30:00', '2024-01-16 15:30:00', '拜访比亚迪销售总监，了解其销售管理痛点。客户急需解决方案，预算800万左右。', 'requirement_confirmed', 60, NOW(), 3002, NOW(), 3002),
(7011, 2009, 3001, 'phone', '2024-01-02 10:00:00', NULL, '个人客户张明咨询软件工具，已推荐合适产品并成交。', 'won', 100, NOW(), 3001, NOW(), 3001),
(7012, 2010, 3002, 'email', '2024-01-05 09:30:00', '2024-01-12 09:30:00', '投资经理李华询问金融分析工具，发送产品演示视频和报价。', 'solution_demo', 45, NOW(), 3002, NOW(), 3002);

-- 8. 插入客户移交记录示例
INSERT INTO customer_transfer (transfer_id, customer_id, from_employee_id, to_employee_id, transfer_reason, transfer_time, process_instance_id, approval_status, approval_time, approval_notes, created_at, created_by, updated_at, updated_by) VALUES
(8001, 2007, 3003, 3001, '负责人离职，移交给其他销售', '2024-01-10 10:00:00', 'PROC_2024_001', 'approved', '2024-01-11 14:00:00', '同意移交，新负责人有相关行业经验', NOW(), 3003, NOW(), 3003),
(8002, 2006, 3001, 3002, '客户行业调整，更换专业负责人', '2024-01-15 09:00:00', 'PROC_2024_002', 'pending', NULL, NULL, NOW(), 3001, NOW(), 3001);

(9001, 3001, '张销售', 'CREATE', 'customer', 2001, '阿里云计算有限公司', '创建新客户', NULL, '{"customerName":"阿里云计算有限公司","customerType":"企业"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW(), 'SUCCESS', NULL, 150),
(9002, 3001, '张销售', 'UPDATE', 'opportunity', 6001, '阿里云企业级解决方案采购', '更新商机阶段', '{"stage":"需求确认","probability":50}', '{"stage":"商务谈判","probability":70}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW(), 'SUCCESS', NULL, 120),
(9003, 3002, '李销售', 'CREATE', 'follow', 7001, '客户跟进记录', '创建跟进记录', NULL, '{"customerId":2001,"followType":"电话"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW(), 'SUCCESS', NULL, 80),
(9004, 3003, '王销售', 'CREATE', 'transfer', 8001, '客户移交申请', '提交客户移交申请', NULL, '{"customerId":2007,"toEmployeeId":3001}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW(), 'SUCCESS', NULL, 200);

COMMIT;
