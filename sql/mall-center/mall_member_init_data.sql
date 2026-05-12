-- ============================================
-- 会员管理测试数据
-- 包含 mall_points_account 和 mall_member
-- ============================================

USE central_mall;

-- ----------------------------------------
-- 插入会员积分账户数据
-- ----------------------------------------
INSERT INTO `mall_points_account` (`tenant_id`, `user_id`, `balance`, `total_earned`, `total_spent`, `create_time`, `update_time`) VALUES
('default', 1, 500, 600, 100, NOW(), NOW()),
('default', 2, 1200, 1500, 300, NOW(), NOW()),
('default', 3, 350, 500, 150, NOW(), NOW()),
('default', 4, 2800, 3000, 200, NOW(), NOW()),
('default', 5, 80, 200, 120, NOW(), NOW()),
('default', 6, 5600, 6000, 400, NOW(), NOW()),
('default', 7, 150, 300, 150, NOW(), NOW()),
('default', 8, 980, 1000, 20, NOW(), NOW())
ON DUPLICATE KEY UPDATE `balance` = VALUES(`balance`), `total_earned` = VALUES(`total_earned`), `total_spent` = VALUES(`total_spent`);

-- ----------------------------------------
-- 插入会员资料数据
-- ----------------------------------------
INSERT INTO `mall_member` (`tenant_id`, `user_id`, `nickname`, `avatar`, `wx_open_id`, `wx_nickname`, `phone`, `gender`, `birthday`, `province`, `city`, `remark`, `create_time`, `update_time`) VALUES
('default', 1, '张小明', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangXiaoMing', 'wx_open_id_001', '小明', '13800138001', 1, '1990-05-15', '北京', '北京市', 'VIP客户，活跃度高', NOW(), NOW()),
('default', 2, '李雪梅', 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiXueMei', 'wx_open_id_002', '雪梅', '13800138002', 2, '1988-03-22', '上海', '上海市', '高消费会员', NOW(), NOW()),
('default', 3, '王强', 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangQiang', 'wx_open_id_003', '强子', '13800138003', 1, '1995-08-10', '广东省', '深圳市', '普通会员', NOW(), NOW()),
('default', 4, '陈思思', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenSiSi', 'wx_open_id_004', '思思', '13800138004', 2, '1992-12-01', '浙江省', '杭州市', '新客户，潜力大', NOW(), NOW()),
('default', 5, '刘建国', 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuJianGuo', 'wx_open_id_005', '老刘', '13800138005', 1, '1985-06-18', '江苏省', '南京市', '沉默用户', NOW(), NOW()),
('default', 6, '赵雅琪', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoYaQi', 'wx_open_id_006', '雅琪', '13800138006', 2, '1998-02-14', '四川省', '成都市', '忠诚会员', NOW(), NOW()),
('default', 7, '孙浩宇', 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunHaoYu', 'wx_open_id_007', '浩浩', '13800138007', 1, '1993-09-25', '湖北省', '武汉市', '普通会员', NOW(), NOW()),
('default', 8, '周美玲', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouMeiLing', 'wx_open_id_008', '美玲', '13800138008', 2, '1991-11-30', '福建省', '福州市', '优质客户', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `nickname` = VALUES(`nickname`),
  `avatar` = VALUES(`avatar`),
  `wx_open_id` = VALUES(`wx_open_id`),
  `wx_nickname` = VALUES(`wx_nickname`),
  `phone` = VALUES(`phone`),
  `gender` = VALUES(`gender`),
  `birthday` = VALUES(`birthday`),
  `province` = VALUES(`province`),
  `city` = VALUES(`city`),
  `remark` = VALUES(`remark`);

-- ----------------------------------------
-- 插入收货地址数据
-- ----------------------------------------
INSERT INTO `mall_user_address` (`tenant_id`, `user_id`, `name`, `phone`, `province`, `city`, `district`, `detail`, `is_default`, `create_time`, `update_time`) VALUES
('default', 1, '张小明', '13800138001', '北京', '北京市', '朝阳区', '建国路88号SOHO现代城A座1201', 1, NOW(), NOW()),
('default', 1, '张小明', '13800138001', '北京', '北京市', '海淀区', '中关村大街1号院', 0, NOW(), NOW()),
('default', 2, '李雪梅', '13800138002', '上海', '上海市', '浦东新区', '陆家嘴环路1000号', 1, NOW(), NOW()),
('default', 3, '王强', '13800138003', '广东省', '深圳市', '南山区', '科技园南区高新南七道R2-B栋3楼', 1, NOW(), NOW()),
('default', 4, '陈思思', '13800138004', '浙江省', '杭州市', '西湖区', '文三路398号东信大厦', 1, NOW(), NOW()),
('default', 5, '刘建国', '13800138005', '江苏省', '南京市', '鼓楼区', '中山北路200号', 1, NOW(), NOW()),
('default', 6, '赵雅琪', '13800138006', '四川省', '成都市', '高新区', '天府大道中段666号希顿国际广场', 1, NOW(), NOW()),
('default', 7, '孙浩宇', '13800138007', '湖北省', '武汉市', '洪山区', '珞瑜路727号鲁巷花园', 1, NOW(), NOW()),
('default', 8, '周美玲', '13800138008', '福建省', '福州市', '鼓楼区', '五四路128号恒力城', 1, NOW(), NOW());

-- ----------------------------------------
-- 验证数据
-- ----------------------------------------
SELECT '=== 会员列表 ===' as info;
SELECT m.id, m.nickname, m.phone, m.gender, m.birthday, p.balance, p.total_earned, p.total_spent
FROM mall_points_account p
LEFT JOIN mall_member m ON p.user_id = m.user_id
ORDER BY p.id;

SELECT '=== 会员收货地址 ===' as info;
SELECT user_id, name, phone, CONCAT(province, city, district, detail) as address FROM mall_user_address ORDER BY user_id;
