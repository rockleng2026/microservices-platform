-- 修正central_organization数据库用户密码格式
-- 使用DelegatingPasswordEncoder格式，密码为admin123

USE `central_organization`;

-- 更新现有用户密码为正确的DelegatingPasswordEncoder格式
UPDATE `users` SET `password` = '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy' WHERE `username` IN ('admin', 'cto001', 'dev001', 'dev002', 'dev003', 'hr001', 'hr002', 'hr003', 'sales001', 'sales002', 'fin001', 'fin002');

-- 如果不存在admin用户，插入一个
INSERT IGNORE INTO `users` (`username`, `password`, `nickname`, `mobile`, `sex`, `enabled`, `type`, `create_time`, `update_time`, `tenant_id`) VALUES
('admin', '{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy', '系统管理员', '13800001001', 1, 1, 'app', NOW(), NOW(), 'default');

-- 验证密码格式
SELECT username, password, enabled FROM `users` WHERE `username` = 'admin';

-- 说明：所有密码都是 admin123
-- BCrypt加密值：$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy
-- DelegatingPasswordEncoder格式：{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy 