package com.central.system.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

/**
 * MyBatis配置
 * 注册SQL拦截器和其他MyBatis相关配置
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Configuration
public class MyBatisConfig {
    
    @Autowired
    private DataSource dataSource;
    
    /**
     * MyBatis Plus拦截器
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 添加分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        
        return interceptor;
    }
    
    /**
     * 配置SqlSessionFactory，注册租户SQL拦截器
     */
    @Bean
    @Primary
    public SqlSessionFactory sqlSessionFactory() throws Exception {
        MybatisSqlSessionFactoryBean sessionFactory = new MybatisSqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        
        // 设置mapper文件位置
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        sessionFactory.setMapperLocations(resolver.getResources("classpath*:mapper/*.xml"));
        
        // 注册拦截器
        sessionFactory.setPlugins(
            mybatisPlusInterceptor(),  // MyBatis Plus拦截器
            tenantSqlInterceptor()     // 租户SQL拦截器
        );
        
        return sessionFactory.getObject();
    }
    
    /**
     * 租户SQL拦截器Bean
     */
    @Bean
    public TenantSqlInterceptor tenantSqlInterceptor() {
        return new TenantSqlInterceptor();
    }
} 