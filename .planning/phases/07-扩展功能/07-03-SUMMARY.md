---
phase: "07-扩展功能"
plan: "03"
subsystem: "mall-center"
tags: ["WeChat", "template-message", "notification"]
dependency_graph:
  requires: []
  provides: ["WeChat-template-notification"]
  affects: ["PayServiceImpl", "OrderServiceImpl"]
tech_stack:
  added: ["WeChatTemplateMsgUtil"]
  patterns: ["WeChat subscribe/send API", "graceful degradation"]
key_files:
  created:
    - "zlt-business/mall-center/src/main/java/com/central/mall/utils/WeChatTemplateMsgUtil.java"
  modified:
    - "zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallOrder.java"
    - "zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java"
    - "zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java"
decisions:
  - "Used @Lazy injection to avoid circular dependency between OrderServiceImpl and WeChatTemplateMsgUtil"
  - "Graceful degradation: notification failure logged but does not fail order flow"
  - "Template IDs configured via wechat.template.order-notify-id and wechat.template.shipping-notify-id"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-08T23:20:00.000Z"
  tasks: 3
  files: 4
---

# Phase 07 Plan 03: WeChat Template Message Notifications Summary

## One-liner

WeChat subscribe message notifications for order payment success and merchant shipping with openid field added to MallOrder.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add openid field to MallOrder entity | `ce45acaeb` | MallOrder.java |
| 2 | Create WeChatTemplateMsgUtil | `223abdfd3` | WeChatTemplateMsgUtil.java |
| 3 | Integrate into PayServiceImpl and OrderServiceImpl | `7c19fdb22` | PayServiceImpl.java, OrderServiceImpl.java |

## What Was Built

**MallOrder.java** - Added `openid` field for storing user's WeChat openid:
```java
private String openid;      // 用户openid，用于微信模板消息
```

**WeChatTemplateMsgUtil.java** - New utility component providing:
- `sendOrderNotify(MallOrder order)` - sends payment success notification with orderNo, amount, payTime
- `sendShippingNotify(MallOrder order, String expressName, String waybillNo)` - sends shipping notification with orderNo, expressName, waybillNo
- Uses WeChat subscribe/send API: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send`
- Graceful degradation when template IDs not configured or openid is missing

**PayServiceImpl.java** - Integration in `processPayCallback()`:
```java
// Send WeChat template message notification
try {
    weChatTemplateMsgUtil.sendOrderNotify(order);
} catch (Exception e) {
    log.error("Failed to send order notification for order {}", order.getOrderNo(), e);
}
```

**OrderServiceImpl.java** - Integration in `shipOrder()`:
```java
// Send WeChat template message notification
try {
    weChatTemplateMsgUtil.sendShippingNotify(order, expressName, waybillNo);
} catch (Exception e) {
    log.error("Failed to send shipping notification for order {}", order.getOrderNo(), e);
}
```

## Configuration Properties

```yaml
wechat:
  pay:
    app-id: ${WECHAT_APP_ID}           # WeChat app ID
  template:
    order-notify-id: ${WECHAT_ORDER_NOTIFY_TEMPLATE_ID}    # Order notification template ID
    shipping-notify-id: ${WECHAT_SHIPPING_NOTIFY_TEMPLATE_ID}  # Shipping notification template ID
```

## Deviations from Plan

None - plan executed exactly as written.

## Threat Flags

None - implementation follows the threat model mitigations in the plan.

## Commits

- `ce45acaeb` - feat(7-03): add openid field to MallOrder for WeChat template messages
- `223abdfd3` - feat(7-03): create WeChatTemplateMsgUtil for sending template messages
- `7c19fdb22` - feat(7-03): integrate WeChatTemplateMsgUtil into PayServiceImpl and OrderServiceImpl

## Self-Check

- [x] MallOrder.java contains `openid` field
- [x] WeChatTemplateMsgUtil.java created with sendOrderNotify and sendShippingNotify
- [x] PayServiceImpl.java calls weChatTemplateMsgUtil.sendOrderNotify in processPayCallback
- [x] OrderServiceImpl.java calls weChatTemplateMsgUtil.sendShippingNotify in shipOrder
- [x] All 3 tasks committed individually

## Self-Check: PASSED
