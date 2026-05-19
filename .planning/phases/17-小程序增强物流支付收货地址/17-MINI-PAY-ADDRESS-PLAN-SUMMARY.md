# Phase 17 Wave 2 - Execution Summary

**Phase:** 17-小程序增强物流支付收货地址
**Wave:** 2
**Executed:** 2026-05-19
**Status:** COMPLETED

## Tasks Completed

### Task 1: Refactor payment/index.vue handlePay
**File:** `mall-mini-program/src/pages/payment/index.vue`

- Added `WechatLoginResponse` interface
- Refactored `handlePay` to async/await pattern
- Added `wx.login()` call before payment (line 161)
- Passes `loginRes.code` as `openId` query param to backend (line 176)
- Proper field mapping: `timestamp` -> `timeStamp`, `nonceStr`, `package` (prepends `prepay_id=`)
- Handles success/cancel/fail with redirect to result page
- Try-catch error handling with user-friendly toast messages

### Task 2: Add saveWeChatAddress to user.ts
**File:** `mall-mini-program/src/services/user.ts`

- Added `ADDRESS_SAVE` constant to `api.ts` (`/api/mall/address`)
- Added `WeChatAddress` interface mapping `wx.chooseAddress` fields:
  - `userName` -> `receiverName`
  - `telNumber` -> `phone`
  - `provinceName` -> `province`
  - `cityName` -> `city`
  - `countyName` -> `district`
  - `detailInfo` -> `detail`
  - `isDefault: 0`
- `saveWeChatAddress` POSTs to `/api/mall/address`

### Task 3: Add "Use WeChat Address" button to checkout
**File:** `mall-mini-program/src/pages/checkout/index.vue`

- Added green "使用微信地址" button with WeChat icon next to address section header
- `chooseWeChatAddress` function uses `wx.chooseAddress` API directly
- Calls `saveWeChatAddress` to persist address to backend
- Shows toast "地址已同步" on success, "获取地址失败" on failure
- Auto-reloads address list after sync via `loadAddressList()`
- Button styled with green border (#07c160) matching WeChat brand

## Verification Results

| Check | Result |
|-------|--------|
| `wx.login` in payment/index.vue | 3 occurrences (lines 159, 161, 168) |
| `saveWeChatAddress` in user.ts | 1 occurrence (line 76) |
| `chooseWeChatAddress` in checkout/index.vue | 3 occurrences (lines 11, 296, 317) |

## Files Modified

1. `mall-mini-program/src/pages/payment/index.vue` - handlePay refactored with wx.login
2. `mall-mini-program/src/services/user.ts` - added saveWeChatAddress and WeChatAddress interface
3. `mall-mini-program/src/config/api.ts` - added ADDRESS_SAVE constant
4. `mall-mini-program/src/pages/checkout/index.vue` - added WeChat address button and chooseWeChatAddress function

## Artifacts

- `mall-mini-program/src/pages/payment/index.vue` exports `handlePay` with wx.login + backend pre-pay + wx.requestPayment flow
- `mall-mini-program/src/services/user.ts` exports `saveWeChatAddress` to persist wx.chooseAddress result
- `mall-mini-program/src/pages/checkout/index.vue` provides "Use WeChat Address" button wired to saveWeChatAddress