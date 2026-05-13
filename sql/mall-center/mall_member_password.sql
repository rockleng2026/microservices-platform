-- ----------------------------------------
-- 会员资料表更新：添加密码字段
-- ----------------------------------------
USE central_mall;

ALTER TABLE mall_member ADD COLUMN IF NOT EXISTS `password` VARCHAR(128) COMMENT '登录密码(加密)' AFTER `phone`;

-- 初始化数据：设置测试用户密码 (密码是 123456 的SHA256)
-- UPDATE mall_member SET password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' WHERE id = 1;