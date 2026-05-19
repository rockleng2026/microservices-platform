---
phase: 12
plan: ADMIN-11
subsystem: mall-admin
tags: [ADMIN-11, wechat-payment, admin-config]
dependency_graph:
  requires: []
  provides:
    - WeChat payment configuration page
    - WeChat config API service
  affects:
    - zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig
tech_stack:
  added:
    - React with Antd Form
    - Zustand store integration
  patterns:
    - Service-layer API calls with request wrapper
    - Component-level form with validation
key_files:
  created:
    - zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx
    - zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.less
    - zlt-web/portal-web/src/services/mall-admin/wechatConfig.ts
  modified:
    - zlt-web/portal-web/src/stores/mallAdminStore.ts
    - zlt-web/portal-web/.umirc.ts
decisions: []
metrics:
  duration: "2026-05-19"
  completed: "2026-05-19"
  tasks: 3
  files: 5
---

# Phase 12 Plan ADMIN-11: WeChat Payment Configuration Page Summary

## One-liner

Implement WeChat payment configuration page with form, status display, save and test connectivity functionality.

## Task Summary

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Create WeChat config service | 2c31cad61 | wechatConfig.ts, mallAdminStore.ts |
| 2 | Create WeChat config page | 3513ebaa8 | index.tsx, index.less |
| 3 | Register route and menu | 5c12980cf | .umirc.ts |

## Commits

- `2c31cad61`: feat(12-ADMIN-11): add WeChat config service
- `403ff71c4`: feat(12-ADMIN-11): add WeChat config state to mallAdminStore
- `3513ebaa8`: feat(12-ADMIN-11): add WeChat config page
- `5c12980cf`: feat(12-ADMIN-11): register WeChat config route

## Deviations from Plan

None - plan executed exactly as written.

## WeChat Config Service API

**File:** `zlt-web/portal-web/src/services/mall-admin/wechatConfig.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `getWeChatConfig()` | GET /api-mall/api/mall/admin/settings | Fetch wx_pay_* settings, filter and return config |
| `updateWeChatConfig(config)` | PUT /api-mall/api/mall/admin/settings | Update each wx_pay_* key individually |
| `testWeChatConfig()` | POST /api-mall/api/mall/admin/settings/test-decrypt | Test connectivity by decrypting mch_id |

## WeChat Config Page Features

**File:** `zlt-web/portal-web/src/pages/MallAdmin/WeChatConfig/index.tsx`

- **Status Badge:** Displays configuration status (unconfigured/configured/testing/success/failed)
- **Form Fields:**
  - AppID (required)
  - 商户号 MCH_ID (required, numeric only)
  - API密钥 API_KEY (required, password type)
  - 证书路径 CERT_PATH (required)
- **Action Buttons:**
  - 保存配置: Saves configuration via `updateWeChatConfig()`
  - 测试连接: Saves and tests connectivity via `testWeChatConfig()`
- **Chinese labels, placeholders, and help text**
- **Validation:** Required fields, numeric-only for mchId

## Store Integration

**File:** `zlt-web/portal-web/src/stores/mallAdminStore.ts`

Added WeChat config state:
- `wechatConfig: WeChatConfig | null`
- `wechatConfigStatus: 'unconfigured' | 'configured' | 'testing' | 'success' | 'failed'`
- `wechatConfigLoading: boolean`
- `wechatConfigError: string | null`

Actions:
- `fetchWeChatConfig()`: Load current configuration
- `updateWeChatConfig(config)`: Save configuration
- `testWeChatConfig()`: Test connectivity

## Route Registration

**File:** `zlt-web/portal-web/.umirc.ts`

Added route under `/mall-admin`:
```typescript
{
  path: '/mall-admin/wechat-config',
  name: '微信支付配置',
  component: '@/pages/MallAdmin/WeChatConfig',
}
```

## Self-Check

- [x] All 3 tasks committed individually
- [x] Service methods verified (3 grep matches)
- [x] Form fields verified (24 grep matches)
- [x] Route registration verified (2 grep matches)
- [x] All 5 files created/modified

## Self-Check: PASSED