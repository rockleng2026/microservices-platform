package com.central.organization.config;

import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 租户拦截器
 * 从请求中提取租户信息并设置到上下文
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Component
public class TenantInterceptor implements HandlerInterceptor {
    
    private static final String TENANT_ID_HEADER = "X-Tenant-Id";
    private static final String TENANT_ID_PARAM = "tenantId";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String tenantId = extractTenantId(request);
        
        if (StrUtil.isNotBlank(tenantId)) {
            TenantContext.setTenantId(tenantId);
            log.debug("Set tenant context: {}", tenantId);
        } else {
            // 使用默认租户
            TenantContext.setTenantId("default");
            log.debug("Using default tenant");
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                              Object handler, Exception ex) {
        TenantContext.clear();
    }
    
    /**
     * 从请求中提取租户ID
     * 优先级：Header > Parameter > Subdomain
     * 
     * @param request HTTP请求
     * @return 租户ID
     */
    private String extractTenantId(HttpServletRequest request) {
        // 1. 从请求头获取
        String tenantId = request.getHeader(TENANT_ID_HEADER);
        if (StrUtil.isNotBlank(tenantId)) {
            return tenantId.trim();
        }
        
        // 2. 从请求参数获取
        tenantId = request.getParameter(TENANT_ID_PARAM);
        if (StrUtil.isNotBlank(tenantId)) {
            return tenantId.trim();
        }
        
        // 3. 从子域名提取（如：tenant1.portal.com）
        String serverName = request.getServerName();
        if (StrUtil.isNotBlank(serverName) && serverName.contains(".")) {
            String[] parts = serverName.split("\\.");
            if (parts.length > 2) {
                String subdomain = parts[0];
                if (!"www".equals(subdomain) && !"api".equals(subdomain)) {
                    return subdomain;
                }
            }
        }
        
        return null;
    }
} 