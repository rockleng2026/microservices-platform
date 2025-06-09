package com.central.organization.config;

import com.central.common.context.TenantContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 多租户拦截器
 * 用于处理租户上下文，确保每个请求都有有效的租户ID
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {
    
    private static final String DEFAULT_TENANT_ID = "default";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        // 从请求头获取租户ID
        String tenantId = request.getHeader("tenant-id");
        
        // 如果没有租户ID，使用默认值
        if (tenantId == null || tenantId.trim().isEmpty()) {
            tenantId = DEFAULT_TENANT_ID;
        }
        
        // 设置租户上下文
        TenantContextHolder.setTenant(tenantId);
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                              Object handler, Exception ex) throws Exception {
        // 清理租户上下文
        TenantContextHolder.clear();
    }
    
    /**
     * 获取当前租户ID
     */
    public static String getCurrentTenantId() {
        String tenantId = TenantContextHolder.getTenant();
        return tenantId != null ? tenantId : DEFAULT_TENANT_ID;
    }
} 