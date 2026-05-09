package com.central.mall.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * MyBatis Plus配置
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@Configuration
public class MyBatisConfig {

    @Bean
    @Primary
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // Temporarily disabled due to double LIMIT issue with IPage<AdminGoodsDTO>
        // This causes AdminGoodsServiceImpl.getGoodsPage to fail with "LIMIT ? LIMIT ?"
        // Re-enable once the root cause is fixed
        // interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}