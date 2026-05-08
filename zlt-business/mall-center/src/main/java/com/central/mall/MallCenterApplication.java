package com.central.mall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * 商城中心服务启动类
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@SpringBootApplication(scanBasePackages = {
    "com.central.mall",
    "com.central.common"
})
@EnableDiscoveryClient
public class MallCenterApplication {

    public static void main(String[] args) {
        SpringApplication.run(MallCenterApplication.class, args);
    }
}