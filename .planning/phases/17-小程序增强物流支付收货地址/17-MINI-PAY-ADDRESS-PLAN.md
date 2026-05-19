---
phase: "17-小程序增强物流支付收货地址"
plan: "02"
type: "execute"
wave: 2
depends_on: []
files_modified:
  - "mall-mini-program/src/pages/payment/index.vue"
  - "mall-mini-program/src/services/payment.ts"
  - "mall-mini-program/src/services/user.ts"
  - "mall-mini-program/src/config/api.ts"
autonomous: true
requirements:
  - "MINI-PAY-01"
  - "MINI-ADDRESS-01"
must_haves:
  truths:
    - "User can complete WeChat payment via wx.login + wx.requestPayment flow"
    - "User can sync WeChat address via wx.chooseAddress and save to backend"
  artifacts:
    - path: "mall-mini-program/src/pages/payment/index.vue"
      provides: "Payment flow with wx.login + backend pre-pay + wx.requestPayment"
      exports: ["handlePay"]
    - path: "mall-mini-program/src/services/user.ts"
      provides: "saveWeChatAddress function to persist wx.chooseAddress result"
      exports: ["saveWeChatAddress"]
    - path: "mall-mini-program/src/pages/checkout/index.vue"
      provides: "Address selection UI with 'Use WeChat Address' option"
  key_links:
    - from: "mall-mini-program/src/pages/payment/index.vue"
      to: "/api-mall/api/mall/pay/create"
      via: "handlePay -> POST with orderId"
      pattern: "PAY_CREATE.*POST"
    - from: "mall-mini-program/src/services/user.ts"
      to: "/api-mall/api/mall/address"
      via: "saveWeChatAddress -> POST"
      pattern: "userAddressService.save"
---

<objective>
Complete the payment flow (wx.login + backend pre-pay + wx.requestPayment) and add WeChat address sync (wx.chooseAddress -> backend save).
</objective>

<context>
@mall-mini-program/src/pages/payment/index.vue
@mall-mini-program/src/services/payment.ts
@mall-mini-program/src/services/user.ts
@mall-mini-program/src/config/api.ts
@zlt-business/mall-center/src/main/java/com/central/mall/controller/UserAddressController.java
</context>

<interfaces>
<!-- From payment.ts - WeChat payment params interface -->
```typescript
interface WeChatPayParams {
  timeStamp: string; nonceStr: string; package: string; signType: string; paySign: string;
}
interface PayCreateResponse {
  prepay_id: string; timestamp: string; nonceStr: string; signType: string;
  paySign: string; packageValue?: string;
}
```

<!-- From user.ts - UserAddressController backend endpoint -->
Backend: POST /api-mall/api/mall/address with MallUserAddress body:
{ userId, receiverName, phone, province, city, district, detail, isDefault }
Returns: Result (empty body on success)

wx.chooseAddress response fields: userName, telNumber, provinceName, cityName, countyName, detailInfo
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Refactor payment/index.vue handlePay to use wx.login + proper field mapping</name>
  <files>mall-mini-program/src/pages/payment/index.vue</files>
  <read_first>
    - mall-mini-program/src/pages/payment/index.vue (handlePay at lines 146-197, import at line 69-71)
    - mall-mini-program/src/services/payment.ts (createPayment function)
  </read_first>
  <action>
    The current handlePay (lines 146-197) does NOT call wx.login before payment.
    The backend initiatePay endpoint requires openId (line 92 of OrderController.java: @PostMapping("/{id}/pay") @RequestParam String openId).
    wx.login is needed to get the code, then backend exchanges it for openid.

    REFACTOR handlePay to:
    1. Call wx.login() to get code first
    2. Pass code to backend (backend will exchange for openid)
    3. Backend returns pay params
    4. Call wx.requestPayment with correct field mapping

    Replace the entire handlePay function (lines 146-197) with:

    ```typescript
    const handlePay = async () => {
      if (isExpired.value || isPaying.value) return

      isPaying.value = true
      uni.showLoading({ title: '正在唤起支付...' })

      try {
        // Step 1: Call wx.login to get code (required for backend to get openid)
        const loginRes = await new Promise<WechatLoginResponse>((resolve, reject) => {
          wx.login({
            success: (res) => resolve(res as any),
            fail: reject
          })
        })

        if (!loginRes.code) {
          throw new Error('wx.login failed - no code returned')
        }

        const userId = getCurrentUserId()

        // Step 2: Call backend to get payment params (backend exchanges code for openid)
        const payRes = await new Promise<any>((resolve, reject) => {
          uni.request({
            url: `${API_BASE}/api/mall/order/${orderId.value}/pay?openId=${loginRes.code}`,
            method: 'POST',
            data: { userId },
            header: { 'x-user-id': userId, 'Content-Type': 'application/json' },
            success: (res: any) => {
              if (res.statusCode === 200 && res.data) resolve(res.data)
              else reject(res)
            },
            fail: reject
          })
        })

        uni.hideLoading()

        if (payRes.code !== 200) {
          throw new Error(payRes.msg || '获取支付参数失败')
        }

        // Step 3: Extract pay params from backend response
        const payData = payRes.datas || payData
        const wxPayParams: WeChatPayParams = {
          timeStamp: String(payData.timestamp || payData.timeStamp || ''),
          nonceStr: payData.nonceStr || payData.nonce_string || '',
          package: payData.packageValue || `prepay_id=${payData.prepay_id}`,
          signType: payData.signType || 'HMAC-SHA256',
          paySign: payData.paySign || payData.pay_sign || ''
        }

        // Step 4: Call wx.requestPayment
        const payResult = await new Promise<string>((resolve) => {
          wx.requestPayment({
            ...wxPayParams,
            success: () => resolve('success'),
            fail: (err) => {
              if (err.errMsg && err.errMsg.includes('cancel')) {
                resolve('cancel')
              } else {
                resolve('fail')
              }
            }
          })
        })

        // Step 5: Redirect to result page
        uni.redirectTo({
          url: `/pages/payment/result?orderId=${orderId.value}&status=${payResult}`
        })
      } catch (e: any) {
        uni.hideLoading()
        isPaying.value = false
        uni.showToast({ title: e.message || '支付失败', icon: 'none' })
        console.error('handlePay failed', e)
      }
    }
    ```

    Add this type at the top of the script section:
    ```typescript
    interface WechatLoginResponse {
      errMsg: string
      code: string
    }
    ```
  </action>
  <verify>
    <automated>grep -c "wx.login" mall-mini-program/src/pages/payment/index.vue</automated>
  </verify>
  <done>Payment page calls wx.login before initiating payment, proper error handling</done>
</task>

<task type="auto">
  <name>Task 2: Add saveWeChatAddress to user.ts service</name>
  <files>mall-mini-program/src/services/user.ts</files>
  <read_first>
    - mall-mini-program/src/services/user.ts (all lines, existing request wrapper)
    - mall-mini-program/src/config/api.ts (ADDRESS_LIST = '/api/mall/address/list')
    - mall-mini-program/src/services/payment.ts lines 1-8 (pattern for request wrapper)
  </read_first>
  <action>
    Add a saveWeChatAddress function that maps wx.chooseAddress response to backend DTO and saves it.

    Backend endpoint: POST /api-mall/api/mall/address (UserAddressController.java line 29-36)
    Request body: MallUserAddress { userId, receiverName, phone, province, city, district, detail, isDefault }
    Note: backend sets userId from UserContext, so not sent in body.

    wx.chooseAddress returns: { userName, telNumber, provinceName, cityName, countyName, detailInfo }

    Add after updateProfile function (after line 63):

    ```typescript
    // Map WeChat address response to backend DTO and save
    export interface WeChatAddress {
      userName: string
      telNumber: string
      provinceName: string
      cityName: string
      countyName: string
      detailInfo: string
    }

    // Save WeChat address to backend
    export const saveWeChatAddress = (wechatAddr: WeChatAddress): Promise<void> => {
      const addressDto = {
        receiverName: wechatAddr.userName,
        phone: wechatAddr.telNumber,
        province: wechatAddr.provinceName,
        city: wechatAddr.cityName,
        district: wechatAddr.countyName,
        detail: wechatAddr.detailInfo,
        isDefault: 0
      }
      return request<void>('/api/mall/address', {
        method: 'POST',
        data: addressDto
      })
    }
    ```

    Also add ADDRESS_SAVE constant to api.ts:
    ```
    export const ADDRESS_SAVE = '/api/mall/address'
    ```

    Then update user.ts to import ADDRESS_SAVE and use it in saveWeChatAddress.
  </action>
  <verify>
    <automated>grep -c "saveWeChatAddress" mall-mini-program/src/services/user.ts</automated>
  </verify>
  <done>saveWeChatAddress maps wx.chooseAddress fields to backend DTO and posts to /api/mall/address</done>
</task>

<task type="auto">
  <name>Task 3: Add 'Use WeChat Address' button to checkout page</name>
  <files>mall-mini-program/src/pages/checkout/index.vue</files>
  <read_first>
    - mall-mini-program/src/pages/checkout/index.vue (or find checkout page path)
    - If checkout page does not exist: Create mall-mini-program/src/pages/checkout/index.vue with address selection UI
  </read_first>
  <action>
    First check if checkout page exists: `ls mall-mini-program/src/pages/checkout/`

    If it exists:
    1. Read the existing checkout page to understand address section structure
    2. Add a "Use WeChat Address" button that calls wx.chooseAddress() then saveWeChatAddress()

    If it does NOT exist (checkout is part of another flow):
    Create mall-mini-program/src/pages/checkout/index.vue with:
    - Address display section
    - "Use WeChat Address" button (primary action)
    - "Manual Entry" button (secondary)
    - On wx.chooseAddress success: call saveWeChatAddress, then display saved address

    The WeChat address button implementation:
    ```typescript
    const chooseWeChatAddress = async () => {
      try {
        const [chooseErr, chooseRes] = await uni.chooseAddress()
        if (chooseErr) {
          uni.showToast({ title: '获取地址失败', icon: 'none' })
          return
        }
        // Save to backend
        await saveWeChatAddress({
          userName: chooseRes.userName,
          telNumber: chooseRes.telNumber,
          provinceName: chooseRes.provinceName,
          cityName: chooseRes.cityName,
          countyName: chooseRes.countyName,
          detailInfo: chooseRes.detailInfo
        })
        uni.showToast({ title: '地址已同步', icon: 'success' })
        // Reload address list or update selected address
        await loadAddressList()
      } catch (e) {
        uni.showToast({ title: '同步失败', icon: 'none' })
        console.error('saveWeChatAddress failed', e)
      }
    }
    ```

    NOTE: uni.chooseAddress is NOT a standard uni-app API — use wx.chooseAddress directly:
    ```typescript
    wx.chooseAddress({
      success: (res) => { /* save via saveWeChatAddress */ },
      fail: (err) => { /* user denied or API unavailable */ }
    })
    ```

    Import saveWeChatAddress from @/services/user.
  </action>
  <verify>
    <automated>grep -c "wx.chooseAddress" mall-mini-program/src/pages/checkout/index.vue 2>/dev/null || echo "0"</automated>
  </verify>
  <done>Checkout page has 'Use WeChat Address' button that syncs address to backend</done>
</task>

</tasks>

<verification>
Payment page properly calls wx.login before payment.
WeChat address can be synced via wx.chooseAddress and saved to backend /api/mall/address.
</verification>

<success_criteria>
- [ ] handlePay in payment/index.vue calls wx.login() and passes code to backend
- [ ] Backend payment params correctly mapped to wx.requestPayment format
- [ ] saveWeChatAddress function exists and maps wx.chooseAddress fields correctly
- [ ] Checkout page has "Use WeChat Address" button wired to saveWeChatAddress
</success_criteria>

<output>
After completion, create `.planning/phases/17-小程序增强物流支付收货地址/17-MINI-PAY-ADDRESS-PLAN-SUMMARY.md`
</output>