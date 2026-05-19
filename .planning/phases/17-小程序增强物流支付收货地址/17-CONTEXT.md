---
phase: 17-小程序增强物流支付收货地址
status: ready_for_planning
source: User requirements via /gsd-plan-phase
created: 2026-05-19
---

# Phase 17: 小程序增强（物流/支付/收货地址）

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Source:** User requirements via /gsd-plan-phase 17

---

<domain>

## Phase Boundary

为小程序增强以下功能：

1. **物流查询** — 对接微信物流实时查询接口，展示物流轨迹
2. **支付接口** — 完善 wx.login + wx.requestPayment 支付流程
3. **小程序订单** — 修复"已付款订单列表 → 查看明细"不显示问题
4. **微信收货地址** — 对接 wx.chooseAddress，允许用户同步微信收货地址

</domain>

<decisions>

### 物流查询

- 后端需新增物流轨迹查询 API（调用微信物流接口）
- 前端在订单详情页展示物流轨迹时间线
- 微信物流文档：https://developers.weixin.qq.com/miniprogram/dev/server/API/express/

### 支付接口

- 前端：`wx.login()` 获取 code，后端用 code 换 openid/session_key
- 前端：调起 `wx.requestPayment()` 完成支付（参数：timeStamp, nonceStr, package, signType, paySign）
- 后端：生成预支付订单，返回必要参数给小程序
- wx.login 文档：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html
- wx.requestPayment 文档：https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestPayment.html

### 小程序订单明细

- 问题：后端 API 数据已返回，但前端订单明细页没有显示
- 需检查：API 响应结构、字段映射、前端数据解析

### 微信收货地址

- 前端调用 `wx.chooseAddress()` 获取用户微信收货地址
- 后端需提供地址保存接口
- 文档：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/address/wx.chooseAddress.html

</decisions>

<specifics>

## 现有代码结构

**小程序页面：** `mall-mini-program/src/pages/`
- `order-list/index.vue` — 订单列表（610行）
- `order-detail/index.vue` — 订单详情（709行）
- `payment/index.vue` — 支付页（224行）

**小程序服务层：** `mall-mini-program/src/services/`
- `order.ts` — 订单 API
- `payment.ts` — 支付 API
- `user.ts` — 用户 API

**后端接口（需确认）：**
- 物流查询 API：`GET /api-mall/api/mall/order/{id}/delivery` 或类似
- 支付 API：`POST /api-mall/api/mall/order/{id}/pay` 或类似
- 地址保存：`POST /api-mall/api/mall/address` 或类似

## 关键修复：订单明细不显示

**现象：** 订单列表"查看明细"点击后，页面空白或数据不显示
**可能原因：**
1. 后端返回数据格式与前端期望不一致
2. 前端数据解析逻辑有问题
3. 页面加载状态处理不当

**排查步骤：**
1. 检查 `order-detail/index.vue` 的 `onLoad` 生命周期
2. 检查 `services/order.ts` 的 `getOrderDetail` 返回值处理
3. 确认后端返回字段与前端 `OrderDetailDTO` 类型定义是否匹配

## WeChat 物流接口说明

微信物流 API 分两类：
1. ** сторона клиента (C端)**：`wx.openDeliveryView()` 调起微信物流小程序查看物流
2. ** сторона сервера (服务端)**：第三方物流推送轨迹，或自建物流轨迹

推荐方案：使用 `wx.openDeliveryView()` 打开微信官方物流小程序页面（最简单）

## WeChat 收货地址接口

```javascript
// 小程序端调用
wx.chooseAddress({
  success (res) {
    // res 包含: userName, postalCode, provinceName, cityName, countyName, detailInfo, telNumber
    // 保存到后端
    api.saveAddress(res)
  }
})
```

</specifics>

---

*Phase: 17-小程序增强物流支付收货地址*
*Context gathered: 2026-05-19 via /gsd-plan-phase*