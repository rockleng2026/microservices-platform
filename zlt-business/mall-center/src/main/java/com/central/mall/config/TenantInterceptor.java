package com.central.mall.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 租户拦截器 - 从请求头提取租户信息
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(TenantInterceptor.class);

    private static final String TENANT_HEADER = "x-tenant-header";
    private static final ThreadLocal<String> TENANT_CONTEXT = new ThreadLocal<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        try {
            String tenantId = request.getHeader(TENANT_HEADER);

            if (tenantId != null && !tenantId.trim().isEmpty()) {
                TENANT_CONTEXT.set(tenantId.trim());
                log.debug("设置当前线程租户ID: {}", tenantId);
            } else {
                log.warn("请求头中未找到租户信息: {}", request.getRequestURI());
            }

            return true;
        } catch (Exception e) {
            log.error("处理租户信息时发生异常", e);
            return true;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        TENANT_CONTEXT.remove();
        log.debug("清理线程租户上下文");
    }

    public static String getCurrentTenantId() {
        return TENANT_CONTEXT.get();
    }

    public static void setCurrentTenantId(String tenantId) {
        TENANT_CONTEXT.set(tenantId);
    }

    public static void clearCurrentTenantId() {
        TENANT_CONTEXT.remove();
    }
}