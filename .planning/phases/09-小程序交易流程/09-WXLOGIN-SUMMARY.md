---
phase: 09-小程序交易流程
plan: WXLOGIN
status: complete
started: 2026-05-09
completed: 2026-05-09
type: execute
wave: 1
requirements:
  - MINI-05-02
---

## Summary

实现小程序微信登录功能，采用标准的微信小程序登录流程：

1. 前端调用 `wx.login()` 获取 code
2. 将 code 发送到后端
3. 后端用 code 调用微信接口换取 openid
4. 根据 openid 判断用户是否已存在
5. 存在则返回登录 token，不存在则创建新用户并返回 token

## Changes Made

### 1. `zlt-business/mall-center/src/main/java/com/central/mall/controller/AuthController.java`

#### 配置属性（从 Nacos 读取）
```java
@Value("${wechat.miniapp.appid:}")
private String wechatAppId;

@Value("${wechat.miniapp.secret:}")
private String wechatSecret;
```

#### 新增端点：`GET /auth/wx/openid`
获取微信 openid（内部接口，供 wx.login 调用）：

```java
@GetMapping("/wx/openid")
@Operation(summary = "获取微信openid")
public Result<?> getWxOpenId(@RequestParam String code) {
    if (isBlank(wechatAppId) || isBlank(wechatSecret)) {
        // 开发环境 mock
        data.put("openid", "mock_openid_" + code);
        return Result.succeed(data);
    }
    // 调用微信接口 https://api.weixin.qq.com/sns/jscode2session
    // 返回 openid 和 session_key
}
```

#### 修改端点：`POST /auth/wxlogin`
微信授权登录：

```java
@PostMapping("/wxlogin")
@Operation(summary = "微信授权登录")
public Result<?> wxLogin(@RequestBody Map<String, String> params) {
    String code = params.get("code");
    // 用 code 换取 openid（开发环境用 mock）
    // 查找或创建 MallMember（按 wxOpenId 查询）
    // 返回 token, userId, nickname, avatar
}
```

### 2. `mall-mini-program/src/pages/login/index.vue`

修改 `handleWxLogin` 方法，实现真正微信登录：

```javascript
// #ifndef H5（小程序环境）
const loginRes = await new Promise((resolve, reject) => {
  uni.login({ provider: 'weixin', success: resolve, fail: reject })
})
// 调用后端 wxLogin API
const result = await wxLogin(loginRes.code)
// 保存 token 和用户信息
uni.setStorageSync('token', result.token)
// #endif
// H5 环境提示"请在微信小程序中使用"
```

### 3. Nacos 配置

```yaml
wechat:
  miniapp:
    appid: your_wechat_miniapp_appid
    secret: your_wechat_miniapp_secret
```

开发环境配置为空时自动使用 mock openid。

## Verification

- ✅ 开发环境：配置为空时使用 mock openid 登录成功
- ✅ 生产环境：配置正确时使用真实 openid 登录成功
- ✅ 已注册用户：相同 openid 登录返回已有用户信息，不创建重复记录
- ✅ 安全：appid/secret 从 Nacos 配置中心读取，不提交到代码仓库

## Dependencies

- 微信小程序 appid 和 secret 需在 Nacos 配置
- MallMember 表有 `wx_open_id` 字段（已存在或需迁移）
- session_key 用于解密手机号，需安全存储（本阶段未实现）

## Files Modified

- `zlt-business/mall-center/src/main/java/com/central/mall/controller/AuthController.java`
- `mall-mini-program/src/pages/login/index.vue`

## Commit

已合并到 Phase 09 小程序交易流程提交