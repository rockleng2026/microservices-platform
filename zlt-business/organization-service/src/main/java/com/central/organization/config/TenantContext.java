package com.central.organization.config;

/**
 * 租户上下文管理器
 * 通过ThreadLocal实现租户信息传递
 * 
 * @author Central Team
 * @since 2024-12-19
 */
public class TenantContext {
    
    private static final ThreadLocal<String> TENANT_ID_HOLDER = new ThreadLocal<>();
    private static final String DEFAULT_TENANT_ID = "default";
    
    /**
     * 设置当前租户ID
     * @param tenantId 租户ID
     */
    public static void setTenantId(String tenantId) {
        TENANT_ID_HOLDER.set(tenantId);
    }
    
    /**
     * 获取当前租户ID
     * @return 租户ID
     */
    public static String getTenantId() {
        String tenantId = TENANT_ID_HOLDER.get();
        return tenantId != null ? tenantId : DEFAULT_TENANT_ID;
    }
    
    /**
     * 清除租户上下文
     */
    public static void clear() {
        TENANT_ID_HOLDER.remove();
    }
    
    /**
     * 检查是否有租户上下文
     * @return true如果有租户上下文
     */
    public static boolean hasTenantId() {
        return TENANT_ID_HOLDER.get() != null;
    }
} 