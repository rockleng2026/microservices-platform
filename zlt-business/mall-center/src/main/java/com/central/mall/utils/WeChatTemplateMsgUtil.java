package com.central.mall.utils;

import com.central.mall.model.entity.MallOrder;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class WeChatTemplateMsgUtil {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${wechat.pay.app-id:#{null}}")
    private String appId;

    @Value("${wechat.template.order-notify-id:#{null}}")
    private String orderNotifyTemplateId;

    @Value("${wechat.template.shipping-notify-id:#{null}}")
    private String shippingNotifyTemplateId;

    private static final String TEMPLATE_MSG_URL = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Send order payment success notification
     */
    public boolean sendOrderNotify(MallOrder order) {
        if (order.getOpenid() == null || order.getOpenid().isEmpty()) {
            log.warn("Cannot send order notification: openid is null for order {}", order.getOrderNo());
            return false;
        }
        if (orderNotifyTemplateId == null || orderNotifyTemplateId.isEmpty()) {
            log.warn("WeChat template ID not configured, skipping order notification");
            return false;
        }

        Map<String, String> data = new HashMap<>();
        data.put("character_string1", order.getOrderNo());  // Order number
        data.put("amount2", order.getPayAmount().toString() + "元");  // Amount paid
        data.put("date3", order.getPayTime() != null ? order.getPayTime().format(DATE_FORMAT) : LocalDateTime.now().format(DATE_FORMAT));  // Payment time

        return sendTemplateMessage(order.getOpenid(), orderNotifyTemplateId, "pages/order/detail?orderId=" + order.getId(), data);
    }

    /**
     * Send shipping notification with logistics details
     */
    public boolean sendShippingNotify(MallOrder order, String expressName, String waybillNo) {
        if (order.getOpenid() == null || order.getOpenid().isEmpty()) {
            log.warn("Cannot send shipping notification: openid is null for order {}", order.getOrderNo());
            return false;
        }
        if (shippingNotifyTemplateId == null || shippingNotifyTemplateId.isEmpty()) {
            log.warn("WeChat template ID not configured, skipping shipping notification");
            return false;
        }

        Map<String, String> data = new HashMap<>();
        data.put("character_string1", order.getOrderNo());  // Order number
        data.put("character_string2", expressName);  // Express company name
        data.put("character_string3", waybillNo);  // Waybill number
        data.put("date4", LocalDateTime.now().format(DATE_FORMAT));  // Shipping time

        return sendTemplateMessage(order.getOpenid(), shippingNotifyTemplateId, "pages/order/detail?orderId=" + order.getId(), data);
    }

    private boolean sendTemplateMessage(String openid, String templateId, String page, Map<String, String> data) {
        try {
            String url = TEMPLATE_MSG_URL + "?access_token=" + getAccessToken();

            Map<String, Object> body = new HashMap<>();
            body.put("touser", openid);
            body.put("template_id", templateId);
            body.put("page", page);
            body.put("miniprogram_state", "developer");
            body.put("lang", "zh_CN");

            // Build data map in WeChat required format: { "key": { "value": "content" } }
            Map<String, Map<String, String>> dataMap = new HashMap<>();
            for (Map.Entry<String, String> entry : data.entrySet()) {
                Map<String, String> item = new HashMap<>();
                item.put("value", entry.getValue());
                dataMap.put(entry.getKey(), item);
            }
            body.put("data", dataMap);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String jsonBody = objectMapper.writeValueAsString(body);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(jsonBody, headers);

            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            Map<String, Object> result = objectMapper.readValue(response.getBody(), Map.class);

            if ("0".equals(String.valueOf(result.get("errcode"))) || result.get("errcode") == null) {
                log.info("WeChat template message sent successfully: openid={}, templateId={}", openid, templateId);
                return true;
            } else {
                log.error("WeChat template message failed: errcode={}, errmsg={}", result.get("errcode"), result.get("errmsg"));
                return false;
            }
        } catch (Exception e) {
            log.error("Error sending WeChat template message", e);
            return false;
        }
    }

    private String getAccessToken() {
        // For Phase 7, return empty string to fall through to mock mode
        // Full implementation would fetch token from https://api.weixin.qq.com/cgi-bin/token
        // and cache in Redis with key "wechat:access_token:{appId}"
        if (appId == null || appId.isEmpty()) {
            return "";
        }
        // Placeholder - in production, fetch and cache token
        return "";
    }
}
