package com.central.mall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

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
@EnableFeignClients(basePackages = "com.central.common.feign")
public class MallCenterApplication {

    public static void main(String[] args) {
        SpringApplication.run(MallCenterApplication.class, args);
    }
}