package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.model.entity.MallMember;
import com.central.mall.service.IMallMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 用户认证控制器
 */
@RestController
@RequestMapping("/api/mall/auth")
@RequiredArgsConstructor
@Tag(name = "用户认证", description = "小程序端认证接口")
public class AuthController {

    private final IMallMemberService memberService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 微信小程序配置
    @Value("${wechat.miniapp.appid:}")
    private String wechatAppId;

    @Value("${wechat.miniapp.secret:}")
    private String wechatSecret;

    /**
     * SHA-256哈希密码
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    /**
     * 验证密码
     */
    private boolean verifyPassword(String rawPassword, String hashedPassword) {
        return hashPassword(rawPassword).equals(hashedPassword);
    }

    private boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    private String getFirstNotBlank(String... strings) {
        for (String s : strings) {
            if (!isBlank(s)) return s;
        }
        return null;
    }

    /**
     * 微信授权登录
     */
    @PostMapping("/wxlogin")
    @Operation(summary = "微信授权登录")
    public Result<?> wxLogin(@RequestBody Map<String, String> params) {
        String code = params.get("code");

        if (isBlank(code)) {
            return Result.failed("code不能为空");
        }

        // 用 code 换取 openid
        String openId;
        if (isBlank(wechatAppId) || isBlank(wechatSecret)) {
            // 开发环境使用 mock
            openId = "mock_openid_" + System.currentTimeMillis();
        } else {
            // 生产环境调用微信接口
            String url = "https://api.weixin.qq.com/sns/jscode2session?" +
                "appid=" + wechatAppId +
                "&secret=" + wechatSecret +
                "&js_code=" + code +
                "&grant_type=authorization_code";

            try {
                RestTemplate restTemplate = new RestTemplate();
                String response = restTemplate.getForObject(url, String.class);
                JsonNode jsonNode = objectMapper.readTree(response);
                openId = jsonNode.get("openid").asText();

                if (isBlank(openId)) {
                    return Result.failed("微信授权失败：" + jsonNode.get("errmsg").asText());
                }
            } catch (Exception e) {
                return Result.failed("微信服务调用失败：" + e.getMessage());
            }
        }

        String token = "WX_" + UUID.randomUUID().toString().replace("-", "");

        // 查找或创建会员
        MallMember member = memberService.getByWxOpenId(openId);
        if (member == null) {
            member = new MallMember();
            member.setTenantId("default");
            member.setUserId(System.currentTimeMillis());
            member.setWxOpenId(openId);
            member.setWxNickname(params.get("nickname"));
            member.setAvatar(params.get("avatar"));
            memberService.save(member);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", member.getId());
        data.put("nickname", member.getNickname() != null ? member.getNickname() : member.getWxNickname());
        data.put("avatar", member.getAvatar() != null ? member.getAvatar() : "");
        return Result.succeed(data);
    }

    /**
     * 账号密码登录
     */
    @PostMapping("/login")
    @Operation(summary = "账号密码登录")
    public Result<?> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return Result.failed("用户名和密码不能为空");
        }

        // 根据用户名或手机号查找会员
        MallMember member = memberService.getByUsername(username);
        if (member == null) {
            return Result.failed("用户不存在");
        }

        // 验证密码
        if (member.getPassword() == null || !verifyPassword(password, member.getPassword())) {
            return Result.failed("密码错误");
        }

        // 生成token
        String token = "TOKEN_" + UUID.randomUUID().toString().replace("-", "");

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", member.getId());
        data.put("nickname", member.getNickname() != null ? member.getNickname() : username);
        data.put("avatar", member.getAvatar() != null ? member.getAvatar() : "");
        return Result.succeed(data);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册")
    public Result<?> register(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        String phone = params.get("phone");
        String code = params.get("code");

        if (username == null || username.isBlank()) {
            return Result.failed("用户名不能为空");
        }
        if (password == null || password.length() < 6) {
            return Result.failed("密码至少6位");
        }
        if (phone == null || phone.isBlank()) {
            return Result.failed("手机号不能为空");
        }
        // TODO: 验证码校验

        // 检查用户名是否已存在
        MallMember existMember = memberService.getByUsername(username);
        if (existMember != null) {
            return Result.failed("用户名已存在");
        }

        // 检查手机号是否已注册
        MallMember existPhone = memberService.getByPhone(phone);
        if (existPhone != null) {
            return Result.failed("手机号已被注册");
        }

        // 创建会员
        MallMember member = new MallMember();
        member.setTenantId("default");
        member.setUserId(System.currentTimeMillis());
        member.setNickname(username);
        member.setPhone(phone);
        member.setPassword(hashPassword(password)); // 加密存储密码
        member.setAvatar("/static/default-avatar.png");
        memberService.save(member);

        String token = "TOKEN_" + UUID.randomUUID().toString().replace("-", "");

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", member.getId());
        data.put("nickname", username);
        data.put("avatar", member.getAvatar());
        return Result.succeed(data);
    }

    /**
     * 发送验证码
     */
    @PostMapping("/send-code")
    @Operation(summary = "发送验证码")
    public Result<?> sendCode(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        String type = params.get("type"); // login, register, reset

        if (phone == null || phone.isBlank()) {
            return Result.failed("手机号不能为空");
        }

        // TODO: 集成短信网关发送真实验证码
        // 模拟发送成功
        Map<String, Object> data = new HashMap<>();
        data.put("code", "123456");
        data.put("expire", 300);
        return Result.succeed(data);
    }

    /**
     * 忘记密码-重置密码
     */
    @PostMapping("/reset-pwd")
    @Operation(summary = "重置密码")
    public Result<?> resetPassword(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        String code = params.get("code");
        String newPassword = params.get("newPassword");

        if (phone == null || phone.isBlank()) {
            return Result.failed("手机号不能为空");
        }
        if (newPassword == null || newPassword.length() < 6) {
            return Result.failed("新密码至少6位");
        }
        // TODO: 验证码校验

        // 查找会员并更新密码
        MallMember member = memberService.getByPhone(phone);
        if (member == null) {
            return Result.failed("该手机号未注册");
        }

        // 加密并更新密码
        member.setPassword(hashPassword(newPassword));
        memberService.updateById(member);

        return Result.succeed("密码重置成功");
    }

    /**
     * 微信小程序获取openid（内部接口，供wx.login调用）
     */
    @GetMapping("/wx/openid")
    @Operation(summary = "获取微信openid")
    public Result<?> getWxOpenId(@RequestParam String code) {
        if (isBlank(wechatAppId) || isBlank(wechatSecret)) {
            // 开发环境使用 mock
            Map<String, String> data = new HashMap<>();
            data.put("openid", "mock_openid_" + code);
            data.put("session_key", "mock_session_key_" + code);
            return Result.succeed(data);
        }

        try {
            // 调用微信接口用 code 换取 openid
            String url = "https://api.weixin.qq.com/sns/jscode2session?" +
                "appid=" + wechatAppId +
                "&secret=" + wechatSecret +
                "&js_code=" + code +
                "&grant_type=authorization_code";

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            JsonNode jsonNode = objectMapper.readTree(response);
            String openid = jsonNode.get("openid").asText();
            String sessionKey = jsonNode.get("session_key").asText();

            if (isBlank(openid)) {
                return Result.failed("微信授权失败：" + jsonNode.get("errmsg").asText());
            }

            Map<String, String> data = new HashMap<>();
            data.put("openid", openid);
            data.put("session_key", sessionKey);
            return Result.succeed(data);
        } catch (Exception e) {
            return Result.failed("微信服务调用失败：" + e.getMessage());
        }
    }
}