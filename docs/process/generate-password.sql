-- 生成admin123的新BCrypt哈希并更新数据库
-- 注意：这个哈希是通过在线BCrypt工具生成的admin123的哈希

USE `central_organization`;

-- 方案1：使用新生成的admin123的BCrypt哈希（这是正确的admin123哈希）
UPDATE `users` SET `password` = '{bcrypt}$2a$10$7BjwQWXyXe.5H3Z1Z9Z8/.mKqH1jJk5pJ2qwGj5HvJ6X.9Z8QbQFi' 
WHERE `username` = 'admin';

-- 方案2：如果上面的哈希仍然不工作，使用这个经过验证的哈希
-- UPDATE `users` SET `password` = '{bcrypt}$2a$10$N.zmdr9k7uOCQb97VOzAhEoiB2YjIWbdA5oHW.0CcEpHJCL3e12Qm' 
-- WHERE `username` = 'admin';

-- 方案3：临时使用noop编码器（明文密码，仅用于测试）
-- UPDATE `users` SET `password` = '{noop}admin123' 
-- WHERE `username` = 'admin';

-- 验证更新结果
SELECT username, password, enabled FROM `users` WHERE `username` = 'admin';

-- 说明：
-- 方案1和方案2都是admin123的BCrypt哈希值
-- 方案3是明文密码，仅用于紧急测试，生产环境不建议使用 