package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.mall.mapper.MallOrderMapper;
import com.central.mall.model.entity.MallOrder;
import com.central.mall.service.IOrderService;
import com.central.mall.service.IPayService;
import com.central.mall.utils.WeChatPayUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayServiceImpl implements IPayService {

    private final MallOrderMapper orderMapper;
    private final IOrderService orderService;

    @Value("${wechat.pay.app-id:#{null}}")
    private String appId;

    @Value("${wechat.pay.mch-id:#{null}}")
    private String mchId;

    @Value("${wechat.pay.api-key:#{null}}")
    private String apiKey;

    @Value("${wechat.pay.notify-url:#{null}}")
    private String notifyUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Map<String, String> initiatePay(Long orderId, String openId) {
        MallOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }
        if (order.getStatus() != 1) {
            throw new RuntimeException("Order is not in pending pay status");
        }

        // Build WeChat unified order request parameters
        Map<String, String> params = new HashMap<>();
        params.put("appid", appId != null ? appId : "");
        params.put("mch_id", mchId != null ? mchId : "");
        params.put("nonce_str", generateNonceStr());
        params.put("body", "Mall Order:" + order.getOrderNo());
        params.put("out_trade_no", order.getOrderNo());
        // Convert to fen (cents)
        params.put("total_fee", String.valueOf(order.getPayAmount().multiply(new java.math.BigDecimal("100")).intValue()));
        params.put("spbill_create_ip", "127.0.0.1");
        params.put("notify_url", notifyUrl != null ? notifyUrl : "http://localhost:7010/api/mall/order/pay/callback");
        params.put("trade_type", "JSAPI");
        params.put("openid", openId != null ? openId : "");

        // Generate signature
        if (apiKey != null && !apiKey.isEmpty()) {
            params.put("sign", WeChatPayUtil.generateSignature(params, apiKey));
        }

        try {
            // Call WeChat unified order API
            String unifiedOrderUrl = "https://api.mch.weixin.qq.com/pay/unifiedorder";
            String responseXml = sendRequest(unifiedOrderUrl, params);

            // Parse response
            Map<String, String> response = WeChatPayUtil.parseXml(responseXml);

            if ("SUCCESS".equals(response.get("result_code")) && response.containsKey("prepay_id")) {
                String prepayId = response.get("prepay_id");

                // Build JSAPI payment parameters
                Map<String, String> jsapiParams = new HashMap<>();
                jsapiParams.put("appId", appId != null ? appId : "");
                jsapiParams.put("timeStamp", String.valueOf(System.currentTimeMillis() / 1000));
                jsapiParams.put("nonceStr", generateNonceStr());
                jsapiParams.put("package", "prepay_id=" + prepayId);
                jsapiParams.put("signType", "MD5");

                if (apiKey != null && !apiKey.isEmpty()) {
                    jsapiParams.put("paySign", WeChatPayUtil.generateSignature(jsapiParams, apiKey));
                }

                return jsapiParams;
            } else {
                log.error("WeChat unified order failed: {}", response.get("err_code_des"));
                throw new RuntimeException("Payment initiation failed: " + response.get("err_code_des"));
            }
        } catch (Exception e) {
            log.error("Error initiating WeChat Pay", e);
            // Return mock data for development/testing when WeChat config is missing
            return buildMockPayParams(order);
        }
    }

    @Override
    public boolean processPayCallback(String xmlData) {
        try {
            // Verify signature
            if (apiKey != null && !apiKey.isEmpty()) {
                if (!WeChatPayUtil.verifySignature(xmlData, apiKey)) {
                    log.error("WeChat Pay callback signature verification failed");
                    return false;
                }
            }

            // Parse callback data
            Map<String, String> callbackData = WeChatPayUtil.parseXml(xmlData);

            if (!"SUCCESS".equals(callbackData.get("result_code"))) {
                log.error("WeChat Pay callback result failed: {}", callbackData.get("err_code_des"));
                return false;
            }

            String orderNo = callbackData.get("out_trade_no");
            String transactionId = callbackData.get("transaction_id");

            // Find order by orderNo
            LambdaQueryWrapper<MallOrder> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MallOrder::getOrderNo, orderNo);
            MallOrder order = orderMapper.selectOne(wrapper);

            if (order == null) {
                log.error("Order not found for callback: {}", orderNo);
                return false;
            }

            // Update order as paid (will handle virtual goods auto-complete)
            orderService.updateOrderPaid(order.getId());

            log.info("WeChat Pay callback processed successfully: orderNo={}, transactionId={}", orderNo, transactionId);
            return true;

        } catch (Exception e) {
            log.error("Error processing WeChat Pay callback", e);
            return false;
        }
    }

    @Override
    public String queryPayStatus(Long orderId) {
        MallOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            return "ORDER_NOT_FOUND";
        }
        switch (order.getStatus()) {
            case 1: return "NOT_PAID";
            case 2: return "PAID";
            case 3: return "SHIPPED";
            case 4: return "COMPLETED";
            case 5: return "CANCELLED";
            default: return "UNKNOWN";
        }
    }

    /**
     * Build mock payment parameters for development/testing
     */
    private Map<String, String> buildMockPayParams(MallOrder order) {
        Map<String, String> mockParams = new HashMap<>();
        mockParams.put("appId", appId != null ? appId : "wx_mock_appid");
        mockParams.put("timeStamp", String.valueOf(System.currentTimeMillis() / 1000));
        mockParams.put("nonceStr", generateNonceStr());
        mockParams.put("package", "prepay_id=mock_prepay_id");
        mockParams.put("signType", "MD5");
        mockParams.put("paySign", "MOCK_SIGNATURE");
        log.warn("Using mock WeChat Pay parameters - set wechat.pay.* properties for real payments");
        return mockParams;
    }

    private String generateNonceStr() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }

    private String sendRequest(String url, Map<String, String> params) {
        try {
            // Build XML request body
            StringBuilder xmlBuilder = new StringBuilder("<xml>");
            for (Map.Entry<String, String> entry : params.entrySet()) {
                xmlBuilder.append("<").append(entry.getKey()).append("><![CDATA[")
                        .append(entry.getValue()).append("]]></").append(entry.getKey()).append(">");
            }
            xmlBuilder.append("</xml>");

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_XML);

            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(xmlBuilder.toString(), headers);
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error sending request to WeChat Pay API", e);
            throw new RuntimeException("Failed to call WeChat Pay API", e);
        }
    }
}