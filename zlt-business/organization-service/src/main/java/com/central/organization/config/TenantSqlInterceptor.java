package com.central.organization.config;

import com.central.common.context.TenantContextHolder;
import org.apache.ibatis.cache.CacheKey;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.mapping.SqlSource;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * 多租户SQL拦截器
 * 自动在SQL查询中添加tenant_id条件
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Component
@Intercepts({
    @Signature(type = Executor.class, method = "query", 
               args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}),
    @Signature(type = Executor.class, method = "update", 
               args = {MappedStatement.class, Object.class})
})
public class TenantSqlInterceptor implements Interceptor {
    
    // 需要自动添加租户条件的表
    private static final List<String> TENANT_TABLES = List.of(
        "department", "employee", "workposition", "employee_grade",
        "field_config", "employee_extend_data", "employee_attachment"
    );
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        
        // 获取当前租户ID
        String tenantId = TenantContextHolder.getTenant();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            tenantId = "default"; // 使用默认租户
        }
        
        MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
        Object parameter = invocation.getArgs()[1];
        
        // 获取原始SQL
        BoundSql boundSql = mappedStatement.getBoundSql(parameter);
        String sql = boundSql.getSql();
        
        // 检查SQL是否需要添加租户条件
        if (!needTenantCondition(sql)) {
            return invocation.proceed();
        }
        
        // 添加租户条件
        String newSql = addTenantCondition(sql, tenantId);
        if (!newSql.equals(sql)) {
            // 创建新的BoundSql
            BoundSql newBoundSql = new BoundSql(mappedStatement.getConfiguration(), newSql, 
                boundSql.getParameterMappings(), parameter);
            
            // 复制额外的参数
            for (ParameterMapping mapping : boundSql.getParameterMappings()) {
                String prop = mapping.getProperty();
                if (boundSql.hasAdditionalParameter(prop)) {
                    newBoundSql.setAdditionalParameter(prop, boundSql.getAdditionalParameter(prop));
                }
            }
            
            // 创建新的MappedStatement
            MappedStatement.Builder builder = new MappedStatement.Builder(
                mappedStatement.getConfiguration(), mappedStatement.getId(), 
                new BoundSqlSqlSource(newBoundSql), mappedStatement.getSqlCommandType());
            
            builder.resource(mappedStatement.getResource());
            builder.fetchSize(mappedStatement.getFetchSize());
            builder.statementType(mappedStatement.getStatementType());
            builder.keyGenerator(mappedStatement.getKeyGenerator());
            if (mappedStatement.getKeyProperties() != null) {
                builder.keyProperty(String.join(",", mappedStatement.getKeyProperties()));
            }
            builder.timeout(mappedStatement.getTimeout());
            builder.parameterMap(mappedStatement.getParameterMap());
            builder.resultMaps(mappedStatement.getResultMaps());
            builder.resultSetType(mappedStatement.getResultSetType());
            builder.cache(mappedStatement.getCache());
            builder.flushCacheRequired(mappedStatement.isFlushCacheRequired());
            builder.useCache(mappedStatement.isUseCache());
            
            MappedStatement newMs = builder.build();
            invocation.getArgs()[0] = newMs;
        }
        
        return invocation.proceed();
    }
    
    /**
     * 检查SQL是否需要添加租户条件
     */
    private boolean needTenantCondition(String sql) {
        if (sql == null) {
            return false;
        }
        
        String lowerSql = sql.toLowerCase();
        
        // 如果已经包含tenant_id条件，不需要添加
        if (lowerSql.contains("tenant_id")) {
            return false;
        }
        
        // 检查是否涉及租户表
        for (String table : TENANT_TABLES) {
            if (lowerSql.contains(table)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 在SQL中添加租户条件
     */
    private String addTenantCondition(String sql, String tenantId) {
        try {
            String lowerSql = sql.toLowerCase().trim();
            
            // 对于SELECT语句
            if (lowerSql.startsWith("select")) {
                return addTenantConditionToSelect(sql, tenantId);
            }
            // 对于UPDATE语句
            else if (lowerSql.startsWith("update")) {
                return addTenantConditionToUpdate(sql, tenantId);
            }
            // 对于DELETE语句
            else if (lowerSql.startsWith("delete")) {
                return addTenantConditionToDelete(sql, tenantId);
            }
            
            return sql;
        } catch (Exception e) {
            // 如果解析失败，返回原SQL
            return sql;
        }
    }
    
    /**
     * 为SELECT语句添加租户条件
     */
    private String addTenantConditionToSelect(String sql, String tenantId) {
        String lowerSql = sql.toLowerCase();
        
        // 查找WHERE子句位置
        int whereIndex = lowerSql.indexOf(" where ");
        
        if (whereIndex > 0) {
            // 已有WHERE子句，添加AND条件
            return sql.substring(0, whereIndex + 7) + 
                   " tenant_id = '" + tenantId + "' AND " + 
                   sql.substring(whereIndex + 7);
        } else {
            // 没有WHERE子句，添加WHERE条件
            // 查找ORDER BY、GROUP BY、HAVING、LIMIT等子句
            String[] keywords = {" order by ", " group by ", " having ", " limit "};
            int insertIndex = sql.length();
            
            for (String keyword : keywords) {
                int index = lowerSql.indexOf(keyword);
                if (index > 0 && index < insertIndex) {
                    insertIndex = index;
                }
            }
            
            return sql.substring(0, insertIndex) + 
                   " WHERE tenant_id = '" + tenantId + "' " + 
                   sql.substring(insertIndex);
        }
    }
    
    /**
     * 为UPDATE语句添加租户条件
     */
    private String addTenantConditionToUpdate(String sql, String tenantId) {
        String lowerSql = sql.toLowerCase();
        int whereIndex = lowerSql.indexOf(" where ");
        
        if (whereIndex > 0) {
            return sql.substring(0, whereIndex + 7) + 
                   " tenant_id = '" + tenantId + "' AND " + 
                   sql.substring(whereIndex + 7);
        } else {
            return sql + " WHERE tenant_id = '" + tenantId + "'";
        }
    }
    
    /**
     * 为DELETE语句添加租户条件
     */
    private String addTenantConditionToDelete(String sql, String tenantId) {
        return addTenantConditionToUpdate(sql, tenantId);
    }
    
    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }
    
    @Override
    public void setProperties(Properties properties) {
        // 可以从配置中读取属性
    }
    
    /**
     * 内部类：自定义SqlSource
     */
    private static class BoundSqlSqlSource implements SqlSource {
        private final BoundSql boundSql;
        
        public BoundSqlSqlSource(BoundSql boundSql) {
            this.boundSql = boundSql;
        }
        
        @Override
        public BoundSql getBoundSql(Object parameterObject) {
            return boundSql;
        }
    }
} 