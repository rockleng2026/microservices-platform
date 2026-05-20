package com.central.mall.common;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 用户上下文工具类 - 从 HTTP header 中提取当前登录用户 ID
 * 前端传入 x-user-id header，网关/网关拦截器会解析 token 并设置此 header
 */
public class UserContext {

    private static final String USER_ID_HEADER = "x-user-id";

    /**
     * 获取当前登录用户 ID
     * 优先从 x-user-id header 读取，未登录时抛出异常
     */
    public static Long getCurrentUserId() {
        HttpServletRequest request = getRequest();
        if (request == null) {
            throw new SecurityException("无法获取HTTP请求上下文，请检查网关配置");
        }
        String userIdHeader = request.getHeader(USER_ID_HEADER);
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            try {
                return Long.parseLong(userIdHeader);
            } catch (NumberFormatException e) {
                throw new SecurityException("无效的用户ID header: " + userIdHeader);
            }
        }
        throw new SecurityException("用户未登录或登录已过期，请重新登录");
    }

    private static HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attrs != null ? attrs.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }
}