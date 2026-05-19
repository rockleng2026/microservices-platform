---
phase: 12
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx
  - zlt-web/portal-web/src/services/mall-admin/wechatConfig.ts
  - zlt-web/portal-web/src/stores/mallAdminStore.ts
autonomous: true
requirements:
  - ADMIN-11-01
  - ADMIN-11-02
  - ADMIN-11-03

must_haves:
  truths:
    - "Admin can configure WeChat payment parameters"
    - "Admin can test WeChat payment connectivity"
    - "Admin can view WeChat payment configuration status"
  artifacts:
    - path: "zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx"
      provides: "WeChat payment configuration page"
    - path: "zlt-web/portal-web/src/services/mall-admin/wechatConfig.ts"
      provides: "WeChat config API service"
      exports: ["getWeChatConfig", "updateWeChatConfig", "testWeChatConfig"]
  key_links:
    - from: "zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx"
      to: "/api-mall/api/mall/admin/settings"
      via: "wechatConfig.ts service"
    - from: "zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx"
      to: "/api-mall/api/mall/admin/settings/wx-config"
      via: "wechatConfig.ts service"
---

<objective>
Implement ADMIN-11 WeChat Configuration page for admin portal.

Purpose: Allow admin to configure WeChat payment parameters (appId, mchId, apiKey, certPath) and test connectivity.
Output: WeChat payment configuration page with form, status display, and test connectivity.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@zlt-web/portal-web/src/pages/MallAdmin/Dashboard/index.tsx
@zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminSettingsController.java
@zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminSettingsService.java
</context>

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From AdminSettingsController.java:
```java
// Endpoints available:
GET  /api/mall/admin/settings           // getAllSettings() - returns all settings (masked)
PUT  /api/mall/admin/settings           // setSetting(key, value, type, description)
GET  /api/mall/admin/settings/wx-config // getWechatPayConfig() - returns decrypted config for payment
```

From IAdminSettingsService:
```java
// Key methods:
String getSetting(String key);                    // Decrypted value
SettingsDTO getSettingMasked(String key);        // Masked for display (e.g., ***1234)
boolean setSetting(String key, value, type, description);
Map<String, String> getWechatPayConfig();        // Decrypted config for payment
```

WeChat payment config keys (stored in settings table):
- wx_pay_app_id
- wx_pay_mch_id
- wx_pay_api_key
- wx_pay_cert_path
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create WeChat config service</name>
  <files>
    zlt-web/portal-web/src/services/mall-admin/wechatConfig.ts
    zlt-web/portal-web/src/stores/mallAdminStore.ts
  </files>
  <action>
Create `zlt-web/portal-web/src/services/mall-admin/wechatConfig.ts`:
- `getWeChatConfig()`: GET /api-mall/api/mall/admin/settings - returns all settings, filter for wx_pay_* keys
- `updateWeChatConfig(config)`: PUT /api-mall/api/mall/admin/settings - set each wx_pay_* key individually
  - config: { appId, mchId, apiKey, certPath }
  - For each key, call setSetting with key="wx_pay_{field}", value=the value, type="string"
- `testWeChatConfig()`: POST /api-mall/api/mall/admin/settings/test-decrypt with test payload

Add to `mallAdminStore.ts`:
- `wechatConfig`, `wechatConfigStatus` state
- `fetchWeChatConfig()`, `updateWeChatConfig(config)`, `testWeChatConfig()`
- `wechatConfigStatus`: 'unconfigured' | 'configured' | 'testing' | 'success' | 'failed'
</action>
  <verify>
    <automated>grep -c "getWeChatConfig\|updateWeChatConfig\|testWeChatConfig" zlt-web/portal-web/src/services/mall-admin/wechatConfig.ts</automated>
  </verify>
  <done>WeChat config service methods exist with correct API endpoints</done>
</task>

<task type="auto">
  <name>Task 2: Create WeChat config page</name>
  <files>
    zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx
  </files>
  <action>
Create `zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx`:
- Page title: "微信支付配置"
- Status badge at top: 显示配置状态 (ADMIN-11-03)
  - 未配置 (red) / 已配置 (green) / 配置异常 (orange)
- Form card with fields (ADMIN-11-01):
  - AppID: input, required
  - 商户号(MCH_ID): input, required
  - API密钥(API_KEY): input (password type), required
  - 证书路径(CERT_PATH): input (file upload or path string), required for JSAPI refunds
- Action buttons: 保存配置, 测试连接
- Test connectivity button shows loading, then result toast (ADMIN-11-02)
- Form validation: all fields required, mchId numeric only

Use Antd Form with:
- Item labels in Chinese
- Placeholder text showing expected format
- Help text explaining each field
</action>
  <verify>
    <automated>grep -c "AppID\|mchId\|apiKey\|certPath\|Form\." zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx</automated>
  </verify>
  <done>WeChat config page with form, status badge, save and test buttons complete</done>
</task>

<task type="auto">
  <name>Task 3: Register route and menu</name>
  <files>
    zlt-web/portal-web/src/router/index.tsx
  </files>
  <action>
Add route for `/mall-admin/wechat-config` in the router config.

Add menu item in mall-admin layout sidebar:
- path: /mall-admin/wechat-config
- name: 微信支付配置
- icon: WechatOutlined
- Position: under System or Settings section
</action>
  <verify>
    <automated>grep -c "WeChatConfig\|/mall-admin/wechat-config" zlt-web/portal-web/src/router/index.tsx</automated>
  </verify>
  <done>Route registered, menu item visible in sidebar</done>
</task>

</tasks>

<verification>
- WeChat config page accessible at /mall-admin/wechat-config
- Form displays current config values (masked for apiKey)
- Save button calls update API and shows success/error toast
- Test button calls test API and shows connectivity result
- Status badge updates based on config presence
</verification>

<success_criteria>
- Admin can configure WeChat payment parameters: appId, mchId, apiKey, certPath (ADMIN-11-01)
- Admin can test WeChat payment configuration connectivity (ADMIN-11-02)
- Admin can view current WeChat payment configuration status (ADMIN-11-03)
</success_criteria>

<output>
After completion, create `.planning/phases/12-管理后台配置与小程序个人中心/12-ADMIN-11-SUMMARY.md`
</output>