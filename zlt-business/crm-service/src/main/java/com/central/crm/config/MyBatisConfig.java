package com.central.crm.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

/**
 * MyBatis配置类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Configuration
public class MyBatisConfig {

    @Autowired
    private TenantSqlInterceptor tenantSqlInterceptor;

    /**
     * 配置SqlSessionFactory，注册租户拦截器
     */
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        
        // 设置Mapper XML文件位置
        factoryBean.setMapperLocations(
            new PathMatchingResourcePatternResolver().getResources("classpath*:mapper/**/*.xml")
        );
        
        // 注册租户拦截器
        factoryBean.setPlugins(tenantSqlInterceptor);
        
        return factoryBean.getObject();
    }
}