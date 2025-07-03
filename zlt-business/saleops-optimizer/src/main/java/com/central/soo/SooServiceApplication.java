package com.central.soo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 销售运营优化器服务启动类
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.central")
@EnableTransactionManagement
public class SooServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SooServiceApplication.class, args);
        System.out.println("销售运营优化器服务启动成功！");
        System.out.println("Swagger文档地址: http://localhost:7006/doc.html");
        System.out.println("盈策通决策平台 - SalesOpsOptimizer Service Started Successfully!");
    }
} 