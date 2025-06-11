-- 快速修复admin密码 - 使用noop编码器（明文密码）
-- 这是临时解决方案，仅用于快速恢复登录功能

USE `central_organization`;

-- 临时使用明文密码（noop编码器）
UPDATE `users` SET `password` = '{noop}admin123' WHERE `username` = 'admin';

-- 验证更新
SELECT username, password, enabled FROM `users` WHERE `username` = 'admin';

-- 重要提醒：
-- 1. 这只是临时解决方案
-- 2. 生产环境应该使用BCrypt编码的密码
-- 3. 修复后应该尽快替换为正确的BCrypt哈希 