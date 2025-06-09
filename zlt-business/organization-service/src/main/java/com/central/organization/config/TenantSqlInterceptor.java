package com.central.organization.config;

import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.StringValue;
import net.sf.jsqlparser.expression.operators.conditional.AndExpression;
import net.sf.jsqlparser.expression.operators.relational.EqualsTo;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.schema.Column;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.delete.Delete;
import net.sf.jsqlparser.statement.insert.Insert;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.update.Update;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.SqlSource;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

/**
 * MyBatis租户SQL拦截器
 * 自动为SQL添加租户条件，实现多租户数据隔离
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Component
@Intercepts({
    @Signature(type = Executor.class, method = "query", args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}),
    @Signature(type = Executor.class, method = "update", args = {MappedStatement.class, Object.class})
})
public class TenantSqlInterceptor implements Interceptor {
    
    /**
     * 需要进行租户隔离的表名
     */
    private static final Set<String> TENANT_TABLES = new HashSet<>(Arrays.asList(
        "department", "employee", "workposition", "tenant_config",
        "workposition_manage_dept", "employee_extend_data", "employee_attachment",
        "department_grade", "employee_grade", "field_config", "audit_log"
    ));
    
    private static final String TENANT_ID_COLUMN = "tenant_id";
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        String tenantId = TenantContext.getTenantId();
        if (StrUtil.isBlank(tenantId)) {
            return invocation.proceed();
        }
        
        MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
        Object parameter = invocation.getArgs()[1];
        
        BoundSql boundSql = mappedStatement.getBoundSql(parameter);
        String sql = boundSql.getSql();
        
        try {
            String newSql = addTenantCondition(sql, tenantId);
            
            if (!sql.equals(newSql)) {
                // 创建新的MappedStatement
                MappedStatement newMappedStatement = copyFromMappedStatement(mappedStatement, newSql, boundSql);
                invocation.getArgs()[0] = newMappedStatement;
                log.debug("Modified SQL with tenant condition: {}", newSql);
            }
        } catch (Exception e) {
            log.warn("Failed to add tenant condition to SQL: {}, error: {}", sql, e.getMessage());
        }
        
        return invocation.proceed();
    }
    
    /**
     * 为SQL添加租户条件
     */
    private String addTenantCondition(String sql, String tenantId) {
        try {
            Statement statement = CCJSqlParserUtil.parse(sql);
            
            if (statement instanceof Select) {
                processSelect((Select) statement, tenantId);
            } else if (statement instanceof Update) {
                processUpdate((Update) statement, tenantId);
            } else if (statement instanceof Delete) {
                processDelete((Delete) statement, tenantId);
            } else if (statement instanceof Insert) {
                // INSERT语句暂不处理，由业务层在插入时设置tenant_id
                return sql;
            }
            
            return statement.toString();
        } catch (JSQLParserException e) {
            log.warn("Failed to parse SQL: {}", sql);
            return sql;
        }
    }
    
    /**
     * 处理SELECT语句
     */
    private void processSelect(Select select, String tenantId) {
        if (select.getSelectBody() instanceof PlainSelect) {
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            String tableName = extractTableName(plainSelect.getFromItem().toString());
            
            if (TENANT_TABLES.contains(tableName)) {
                Expression tenantCondition = new EqualsTo(
                    new Column(TENANT_ID_COLUMN),
                    new StringValue(tenantId)
                );
                
                if (plainSelect.getWhere() == null) {
                    plainSelect.setWhere(tenantCondition);
                } else {
                    plainSelect.setWhere(new AndExpression(plainSelect.getWhere(), tenantCondition));
                }
            }
        }
    }
    
    /**
     * 处理UPDATE语句
     */
    private void processUpdate(Update update, String tenantId) {
        String tableName = extractTableName(update.getTable().getName());
        
        if (TENANT_TABLES.contains(tableName)) {
            Expression tenantCondition = new EqualsTo(
                new Column(TENANT_ID_COLUMN),
                new StringValue(tenantId)
            );
            
            if (update.getWhere() == null) {
                update.setWhere(tenantCondition);
            } else {
                update.setWhere(new AndExpression(update.getWhere(), tenantCondition));
            }
        }
    }
    
    /**
     * 处理DELETE语句
     */
    private void processDelete(Delete delete, String tenantId) {
        String tableName = extractTableName(delete.getTable().getName());
        
        if (TENANT_TABLES.contains(tableName)) {
            Expression tenantCondition = new EqualsTo(
                new Column(TENANT_ID_COLUMN),
                new StringValue(tenantId)
            );
            
            if (delete.getWhere() == null) {
                delete.setWhere(tenantCondition);
            } else {
                delete.setWhere(new AndExpression(delete.getWhere(), tenantCondition));
            }
        }
    }
    
    /**
     * 提取表名
     */
    private String extractTableName(String tableExpression) {
        if (StrUtil.isBlank(tableExpression)) {
            return "";
        }
        
        // 移除数据库名前缀和别名
        String tableName = tableExpression.trim();
        if (tableName.contains(".")) {
            tableName = tableName.substring(tableName.lastIndexOf(".") + 1);
        }
        if (tableName.contains(" ")) {
            tableName = tableName.split(" ")[0];
        }
        
        // 移除反引号
        return tableName.replace("`", "");
    }
    
    /**
     * 复制MappedStatement并替换SQL
     */
    private MappedStatement copyFromMappedStatement(MappedStatement ms, String newSql, BoundSql boundSql) {
        BoundSql newBoundSql = new BoundSql(ms.getConfiguration(), newSql, 
            boundSql.getParameterMappings(), boundSql.getParameterObject());
        
        // 复制属性
        for (String key : boundSql.getAdditionalParameters().keySet()) {
            newBoundSql.setAdditionalParameter(key, boundSql.getAdditionalParameter(key));
        }
        
        MappedStatement.Builder builder = new MappedStatement.Builder(
            ms.getConfiguration(), ms.getId(), 
            new BoundSqlSqlSource(newBoundSql), ms.getSqlCommandType());
        
        builder.resource(ms.getResource());
        builder.fetchSize(ms.getFetchSize());
        builder.statementType(ms.getStatementType());
        builder.keyGenerator(ms.getKeyGenerator());
        if (ms.getKeyProperties() != null && ms.getKeyProperties().length > 0) {
            builder.keyProperty(String.join(",", ms.getKeyProperties()));
        }
        builder.timeout(ms.getTimeout());
        builder.parameterMap(ms.getParameterMap());
        builder.resultMaps(ms.getResultMaps());
        builder.resultSetType(ms.getResultSetType());
        builder.cache(ms.getCache());
        builder.flushCacheRequired(ms.isFlushCacheRequired());
        builder.useCache(ms.isUseCache());
        
        return builder.build();
    }
    
    /**
     * BoundSql包装器
     */
    public static class BoundSqlSqlSource implements SqlSource {
        private final BoundSql boundSql;
        
        public BoundSqlSqlSource(BoundSql boundSql) {
            this.boundSql = boundSql;
        }
        
        @Override
        public BoundSql getBoundSql(Object parameterObject) {
            return boundSql;
        }
    }
    
    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }
    
    @Override
    public void setProperties(Properties properties) {
        // 可以从配置文件读取需要拦截的表名
    }
} 