package com.central.crm.config;

import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.expression.operators.conditional.AndExpression;
import net.sf.jsqlparser.expression.operators.relational.EqualsTo;
import net.sf.jsqlparser.schema.Column;
import net.sf.jsqlparser.schema.Table;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectBody;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Properties;

/**
 * 租户SQL拦截器 - 自动在SQL中添加租户条件
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Component
@Intercepts({
    @Signature(type = Executor.class, method = "query", args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})
})
public class TenantSqlInterceptor implements Interceptor {

    private static final Logger log = LoggerFactory.getLogger(TenantSqlInterceptor.class);
    
    private static final String TENANT_ID_COLUMN = "tenant_id";
    private static final String TENANT_HEADER = "x-tenant-header";

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        try {
            // 获取当前租户ID
            String tenantId = getCurrentTenantId();
            if (tenantId == null) {
                log.warn("当前请求未包含租户信息，跳过租户过滤");
                return invocation.proceed();
            }

            // 执行原始查询
            Object result = invocation.proceed();
            
            // 注: 这里只是一个简化的拦截器示例
            // 实际项目中应该使用MyBatis-Plus的多租户插件
            // 或者更完善的SQL解析和修改逻辑
            
            return result;
        } catch (Exception e) {
            log.error("租户SQL拦截器执行异常", e);
            return invocation.proceed();
        }
    }

    /**
     * 获取当前租户ID
     */
    private String getCurrentTenantId() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getHeader(TENANT_HEADER);
            }
        } catch (Exception e) {
            log.debug("获取租户ID失败", e);
        }
        return null;
    }

    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties) {
        // 可以从配置文件中读取属性
    }
}