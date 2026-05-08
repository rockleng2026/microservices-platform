package com.central.mall.utils;

import org.springframework.util.DigestUtils;

import java.util.Map;
import java.util.TreeMap;

public class WeChatPayUtil {

    /**
     * Generate WeChat Pay signature (MD5)
     * Parameters sorted alphabetically, joined with &, appended with key, MD5 hashed, uppercase
     */
    public static String generateSignature(Map<String, String> params, String apiKey) {
        TreeMap<String, String> sortedParams = new TreeMap<>(params);
        StringBuilder signStr = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (signStr.length() > 0) {
                signStr.append("&");
            }
            signStr.append(entry.getKey()).append("=").append(entry.getValue());
        }
        signStr.append("&key=").append(apiKey);
        return DigestUtils.md5DigestAsHex(signStr.toString().getBytes()).toUpperCase();
    }

    /**
     * Verify WeChat Pay callback signature
     */
    public static boolean verifySignature(String xmlData, String apiKey) {
        try {
            Map<String, String> params = parseXml(xmlData);
            if (!"SUCCESS".equals(params.get("result_code"))) {
                return false;
            }
            String signFromXml = params.remove("sign");
            String calculatedSign = generateSignature(params, apiKey);
            return calculatedSign.equals(signFromXml);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Parse XML to Map
     */
    public static Map<String, String> parseXml(String xml) {
        java.util.Map<String, String> result = new java.util.HashMap<>();
        if (xml == null || xml.isEmpty()) {
            return result;
        }
        // Simple XML parsing
        String[] pairs = xml.replaceAll("<[^>]+>", "").split("\n?,");
        // Actually parse XML properly
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("<(\\w+)><!\\[CDATA\\[(.*?)\\]\\]></\\1>|<(\\w+)>(.*?)</\\3>");
        java.util.regex.Matcher m = p.matcher(xml);
        while (m.find()) {
            String key = m.group(1) != null ? m.group(1) : m.group(3);
            String value = m.group(2) != null ? m.group(2) : m.group(4);
            result.put(key, value);
        }
        return result;
    }

    /**
     * Build XML response for WeChat Pay callback acknowledgment
     */
    public static String buildCallbackResponse(String returnCode, String returnMsg) {
        return "<xml><return_code><![CDATA[" + returnCode + "]]></return_code><return_msg><![CDATA[" + returnMsg + "]]></return_msg></xml>";
    }
}