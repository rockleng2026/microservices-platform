package com.central.mall.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 自定义安全配置 - 开发环境放行Swagger/Knife4j文档
 *
 * @author Portal Team
 * @since 2026-05-09
 */
@Configuration
public class SecurityConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain swaggerSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/doc.html", "/swagger-ui.html", "/v3/api-docs/**", "/swagger-ui/**", "/webjars/**", "/favicon.ico")
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().permitAll()
            )
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable);
        return http.build();
    }
}