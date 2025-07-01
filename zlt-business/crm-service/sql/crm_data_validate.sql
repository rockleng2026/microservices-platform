-- CRM数据验证查询脚本
USE central_crm;

-- 1. 客户数据统计
SELECT 
    '客户数据统计' as 类型, 
    COUNT(*) as 总数,
    SUM(CASE WHEN customer_type = '企业' THEN 1 ELSE 0 END) as 企业客户,
    SUM(CASE WHEN customer_type = '个人' THEN 1 ELSE 0 END) as 个人客户
FROM customer WHERE is_deleted = 0;

-- 2. 商机数据统计
SELECT 
    '商机数据统计' as 类型,
    COUNT(*) as 总数,
    SUM(CASE WHEN stage = '已成交' THEN 1 ELSE 0 END) as 已成交,
    ROUND(SUM(expected_amount), 2) as 总预期金额
FROM opportunity WHERE is_deleted = 0;

-- 3. 验证租户ID
SELECT DISTINCT tenant_id as 租户ID FROM customer;
