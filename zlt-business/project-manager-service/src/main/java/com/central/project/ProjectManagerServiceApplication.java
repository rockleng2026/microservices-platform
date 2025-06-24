package com.central.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 项目管理服务启动类
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.central")
@EnableTransactionManagement
public class ProjectManagerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectManagerServiceApplication.class, args);
    }
} 