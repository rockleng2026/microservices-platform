package com.central;

import com.central.common.lb.annotation.EnableFeignInterceptor;
import com.central.search.annotation.EnableSearchClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 多维表格服务启动类
 *
 * @author multi-table-system
 */
@EnableDiscoveryClient
@EnableSearchClient
@EnableTransactionManagement
@EnableFeignInterceptor
@SpringBootApplication
public class MultiTableServiceApp {
    public static void main(String[] args) {
        SpringApplication.run(MultiTableServiceApp.class, args);
    }
} 