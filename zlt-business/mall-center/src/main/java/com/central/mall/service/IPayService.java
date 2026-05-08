package com.central.mall.service;

import java.util.Map;

public interface IPayService {

    /**
     * Initiate WeChat JSAPI payment (PAY-01)
     * Returns payment params: {timeStamp, nonceStr, package, signType, paySign}
     */
    Map<String, String> initiatePay(Long orderId, String openId);

    /**
     * Process WeChat payment callback (PAY-02)
     * Verify signature and update order status
     */
    boolean processPayCallback(String xmlData);

    /**
     * Query payment status
     */
    String queryPayStatus(Long orderId);
}