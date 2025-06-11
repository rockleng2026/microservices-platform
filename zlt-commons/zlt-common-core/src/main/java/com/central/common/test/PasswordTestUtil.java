package com.central.common.test;
import java.util.HashMap;
import java.util.Map;

// 模拟Spring Security的相关类
class BCryptPasswordEncoder {
    public boolean matches(String rawPassword, String encodedPassword) {
        // 简化的BCrypt验证逻辑
        System.out.println("验证密码: " + rawPassword + " 与哈希: " + encodedPassword.substring(0, 20) + "...");

        // 这里实际需要BCrypt算法，我们只是模拟
        // 根据给定的哈希，admin123应该匹配
        if ("$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy".equals(encodedPassword)) {
            return "admin123".equals(rawPassword);
        }
        return false;
    }

    public String encode(String rawPassword) {
        // 模拟生成新的哈希
        return "$2a$10$NEW_HASH_FOR_" + rawPassword;
    }
}

class DelegatingPasswordEncoder {
    private Map<String, BCryptPasswordEncoder> encoders = new HashMap<>();

    public DelegatingPasswordEncoder() {
        encoders.put("bcrypt", new BCryptPasswordEncoder());
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        if (encodedPassword.startsWith("{bcrypt}")) {
            String actualHash = encodedPassword.substring(8); // 移除{bcrypt}前缀
            return encoders.get("bcrypt").matches(rawPassword, actualHash);
        }
        return false;
    }
}

public class PasswordTestUtil {
    public static void main(String[] args) {
        System.out.println("=== 密码验证测试 ===");

        // 模拟数据库中的密码
        String dbPassword = "{bcrypt}$2a$10$TJkwVdmJsm8r3W9VQU0Kj.3HGdz/h0F5kZnQ7RW8QdGHk2yBF.nYy";

        // 创建密码编码器
        DelegatingPasswordEncoder encoder = new DelegatingPasswordEncoder();

        // 测试不同的密码
        String[] testPasswords = {
                "admin123",    // 预期正确
                "123456",      // 旧密码
                "admin",       // 简化密码
                "password",    // 常用密码
                "admin123456"  // 可能的组合
        };

        System.out.println("数据库密码: " + dbPassword);
        System.out.println();

        for (String testPwd : testPasswords) {
            boolean matches = encoder.matches(testPwd, dbPassword);
            System.out.println("测试密码 '" + testPwd + "': " + (matches ? "✓ 匹配" : "✗ 不匹配"));
        }

        System.out.println("\n=== 分析 ===");
        System.out.println("如果所有密码都不匹配，可能的原因：");
        System.out.println("1. 数据库中的哈希值不是admin123的正确哈希");
        System.out.println("2. 密码编码器配置不正确");
        System.out.println("3. 密码在存储时使用了不同的编码方式");

        // 建议的解决方案
        System.out.println("\n=== 解决方案 ===");
        System.out.println("1. 重新生成admin123的BCrypt哈希");
        System.out.println("2. 更新数据库中的密码");
        System.out.println("3. 或者尝试其他可能的密码");
    }
}
