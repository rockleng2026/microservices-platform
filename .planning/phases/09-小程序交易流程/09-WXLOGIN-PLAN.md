# 微信登录功能实现计划

## 概述

实现小程序微信登录功能，采用标准的微信小程序登录流程：
1. 前端调用 `wx.login()` 获取 code
2. 将 code 发送到后端
3. 后端用 code 调用微信接口换取 openid
4. 根据 openid 判断用户是否已存在
5. 存在则返回登录token，不存在则创建新用户并返回token

## 前端修改

### 文件：`mall-mini-program/src/pages/login/index.vue`

修改 `handleWxLogin` 方法，实现真正的微信登录：

```javascript
// Handle WeChat login
const handleWxLogin = async () => {
  // #ifdef H5
  // H5环境下不支持微信登录，提示用户
  uni.showToast({ title: '请在微信小程序中使用', icon: 'none' })
  // #endif

  // #ifndef H5
  // 小程序环境
  try {
    loading.value = true
    // 1. 调用 wx.login 获取 code
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    if (!loginRes.code) {
      uni.showToast({ title: '微信登录失败', icon: 'none' })
      return
    }

    // 2. 调用后端接口，用 code 换取 openid 并登录
    const result = await wxLogin(loginRes.code)

    // 3. 保存 token 和用户信息
    uni.setStorageSync('token', result.token)
    uni.setStorageSync('userInfo', {
      userId: result.userId,
      nickname: result.nickname || '微信用户',
      avatar: result.avatar || '/static/default-avatar.png'
    })

    uni.showToast({ title: '登录成功', icon: 'success' })

    setTimeout(() => {
      uni.switchTab({ url: '/pages/user/index' })
    }, 1500)
  } catch (e) {
    console.error('WeChat login failed:', e)
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
  // #endif
}
```

## 后端修改

### 文件：`zlt-business/mall-center/src/main/java/com/central/mall/controller/AuthController.java`

1. 添加微信API配置（从Nacos配置中心读取）
2. 实现真正的微信 code 换 openid 接口

修改内容：

```java
// 添加配置
@Value("${wechat.miniapp.appid:}")
private String wechatAppId;

@Value("${wechat.miniapp.secret:}")
private String wechatSecret;

// 修改 getWxOpenId 方法
@GetMapping("/wx/openid")
@Operation(summary = "获取微信openid")
public Result<?> getWxOpenId(@RequestParam String code) {
    if (StringUtils.isBlank(wechatAppId) || StringUtils.isBlank(wechatSecret)) {
        Map<String, String> data = new HashMap<>();
        data.put("openid", "mock_openid_" + code);
        return Result.succeed(data);
    }

    try {
        // 调用微信接口
        String url = "https://api.weixin.qq.com/sns/jscode2session?" +
            "appid=" + wechatAppId +
            "&secret=" + wechatSecret +
            "&js_code=" + code +
            "&grant_type=authorization_code";

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject(url, String.class);

        JSONObject jsonObject = JSON.parseObject(response);
        String openid = jsonObject.getString("openid");
        String sessionKey = jsonObject.getString("session_key");

        Map<String, String> data = new HashMap<>();
        data.put("openid", openid);
        data.put("session_key", sessionKey);
        return Result.succeed(data);
    } catch (Exception e) {
        log.error("Failed to get wx openid", e);
        return Result.failed("微信服务调用失败");
    }
}

// 修改 wxLogin 方法，使用真实 openid
@PostMapping("/wxlogin")
@Operation(summary = "微信授权登录")
public Result<?> wxLogin(@RequestBody Map<String, String> params) {
    String code = params.get("code");

    // 用 code 换取 openid
    String openId;
    if (StringUtils.isBlank(wechatAppId) || StringUtils.isBlank(wechatSecret)) {
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
            JSONObject jsonObject = JSON.parseObject(response);
            openId = jsonObject.getString("openid");
            if (StringUtils.isBlank(openId)) {
                return Result.failed("微信授权失败");
            }
        } catch (Exception e) {
            log.error("WeChat API call failed", e);
            return Result.failed("微信服务调用失败");
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
```

### Nacos 配置

在 Nacos 配置中心的 `application.yml` 或对应 namespace 下添加：

```yaml
wechat:
  miniapp:
    appid: your_wechat_miniapp_appid
    secret: your_wechat_miniapp_secret
```

## 测试用例

### 测试 1：开发环境 Mock 登录
- 前提：微信配置为空或测试环境
- 操作：点击微信登录
- 预期：使用 mock openid 登录成功

### 测试 2：生产环境真实登录
- 前提：微信配置已正确填写
- 操作：在微信小程序中点击登录
- 预期：使用真实 openid 登录成功，新用户自动创建

### 测试 3：已注册用户登录
- 前提：该 openid 已有注册记录
- 操作：使用相同微信账号登录
- 预期：返回已有用户信息，不创建新记录

## 依赖变更

### 后端新增
- `fastjson2` (已有项目中可能已使用)
- Spring Web (RestTemplate)

## 风险与注意事项

1. **微信配置保密**：appid 和 secret 不能提交到代码仓库
2. **session_key 安全**：session_key 用于解密用户手机号等敏感信息，需安全存储
3. **code 一次性**：wx.login 返回的 code 只能使用一次
4. **测试环境**：开发阶段可使用测试号或填写空配置走 mock 流程