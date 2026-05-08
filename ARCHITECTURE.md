# 微服务平台架构文档

> 版本: 1.0  
> 更新日期: 2026-05-08  
> 项目: central-platform v6.0.0

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [模块架构](#3-模块架构)
4. [核心模块详解](#4-核心模块详解)
5. [服务治理](#5-服务治理)
6. [多租户架构](#6-多租户架构)
7. [开发规范](#7-开发规范)
8. [新建模块指南](#8-新建模块指南)
9. [数据库设计规范](#9-数据库设计规范)
10. [API设计规范](#10-api设计规范)

---

## 1. 项目概述

### 1.1 项目简介

central-platform 是一个基于 Spring Cloud 的微服务架构平台，采用 Spring Boot 3.x 和 Spring Cloud Alibaba 技术栈，支持多租户、OAuth2 认证、API 网关等企业级功能。

### 1.2 架构演进

```
单体架构 (SSH)  →  微服务架构 (Spring Cloud)
     ↓                    ↓
  紧耦合           ├── zlt-commons (公共组件)
  单点部署         ├── zlt-gateway (网关)
                   ├── zlt-uaa (认证)
                   ├── zlt-business (业务服务)
                   └── zlt-monitor (监控)
```

### 1.3 核心特性

- **微服务架构**: 基于 Spring Cloud 的分布式架构
- **多租户支持**: 数据库级租户隔离
- **统一认证**: OAuth2 + JWT 令牌机制
- **服务治理**: Nacos 注册中心、配置中心
- **Api Gateway**: 统一路由、限流、权限控制

---

## 2. 技术栈

### 2.1 核心框架版本

| 技术组件 | 版本 | 说明 |
|---------|------|------|
| JDK | 17 | 最低支持 JDK 17 |
| Spring Boot | 3.1.6 | 核心框架 |
| Spring Cloud | 2022.0.4 | 微服务框架 |
| Spring Cloud Alibaba | 2022.0.0.0 | 阿里微服务组件 |
| Spring Authorization Server | 1.1.3 | OAuth2 认证服务器 |

### 2.2 主要依赖

| 组件 | 版本 | 用途 |
|------|------|------|
| MyBatis Plus | 3.5.4.1 | ORM 框架 |
| Druid | 1.2.18 | 数据库连接池 |
| Redisson | 3.25.0 | Redis 客户端 |
| Dubbo | 2.7.8 | RPC 框架 |
| Sentinel | - | 限流熔断 |
| Nacos | - | 注册中心/配置中心 |
| Redis | - | 缓存/会话 |
| Elasticsearch | 7.x | 搜索引擎 |

### 2.3 基础设施

| 组件 | 默认端口 | 说明 |
|------|---------|------|
| Nacos Server | 8848 | 注册与配置中心 |
| MySQL | 3306 | 主数据库 |
| Redis | 6379 | 缓存服务 |
| Elasticsearch | 9200 | 搜索服务 |
| Sentinel | 8858 | 限流控制台 |

---

## 3. 模块架构

### 3.1 模块一览

```
central-platform (父项目)
├── zlt-commons/              # 公共组件库
├── zlt-config/               # 配置中心
├── zlt-register/             # 注册中心 (Nacos)
├── zlt-uaa/                  # 认证中心 (OAuth2)
├── zlt-gateway/              # API 网关
├── zlt-monitor/              # 监控中心
├── zlt-business/             # 业务服务
├── zlt-web/                  # 前端应用
├── zlt-demo/                 # 示例代码
└── sql/                      # 数据库脚本
```

### 3.2 架构层级图

```
┌──────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│              PC Web / Mobile / Third-party API              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        网关层 (zlt-gateway)                   │
│     路由转发  │  认证授权  │  限流熔断  │  跨域处理  │  日志追踪  │
│    端口: 9900                                                     │
└──────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    业务服务层      │ │    认证中心        │ │    监控服务       │
│ (zlt-business)   │ │   (zlt-uaa)       │ │ (zlt-monitor)    │
│                  │ │                  │ │                  │
│ user-center:7000 │ │  端口: 9500       │ │ sc-admin:6500    │
│ org-center:7002  │ │                  │ │ log-center:7200  │
│ crm-center:7005  │ │  OAuth2 Server   │ │                  │
│ file-center:5000  │ │  JWT Token       │ │  Spring Boot     │
│ search-center:7100│ │                  │ │  Admin           │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      基础设施层                               │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │ MySQL  │  │ Redis  │  │ Nacos  │  │   ES   │            │
│  │ 3306   │  │ 6379   │  │ 8848   │  │  9200  │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 zlt-commons 子模块

| 模块 | 说明 | 引入方式 |
|------|------|---------|
| zlt-common-core | 核心工具类 | 必需 |
| zlt-common-spring-boot-starter | Spring Boot 通用配置 | 必需 |
| zlt-db-spring-boot-starter | 数据库组件 (MyBatis Plus + Druid) | 必需 |
| zlt-redis-spring-boot-starter | Redis 组件 (Redisson) | 必需 |
| zlt-auth-client-spring-boot-starter | 认证客户端 | 需认证时引入 |
| zlt-loadbalancer-spring-boot-starter | 负载均衡 | 可选 |
| zlt-sentinel-spring-boot-starter | Sentinel 限流 | 可选 |
| zlt-log-spring-boot-starter | 日志组件 | 可选 |
| zlt-elasticsearch-spring-boot-starter | ES 搜索组件 | 搜索服务引入 |
| zlt-oss-spring-boot-starter | 对象存储组件 | 文件服务引入 |

---

## 4. 核心模块详解

### 4.1 网关层 (zlt-gateway)

**模块路径**: `zlt-gateway/sc-gateway/`

**职责**:
- 统一路由转发
- OAuth2 令牌校验
- 权限校验
- 请求限流
- 跨域处理
- 全局日志追踪

**核心配置类**:
```java
// 资源配置
com.central.gateway.config.ResourceServerConfiguration.java

// 跨域配置
com.central.gateway.config.CorsConfig.java

// 动态路由
com.central.gateway.config.DynamicRouteConfig.java

// 过滤器
com.central.gateway.filter.TraceFilter.java      // 链路追踪
com.central.gateway.filter.RequestStatisticsFilter.java  // 请求统计
```

**路由配置** (Nacos 或配置文件):
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-center
          uri: lb://user-center
          predicates:
            - Path=/api/user/**
        - id: organization-service
          uri: lb://organization-service
          predicates:
            - Path=/api/org/**
```

### 4.2 认证中心 (zlt-uaa)

**模块路径**: `zlt-uaa/`

**职责**:
- OAuth2 授权服务器
- 用户认证
- 令牌发放与刷新
- 客户端管理
- 多租户上下文注入

**核心配置**:
```java
// OAuth2 授权服务器配置
com.central.oauth.config.AuthorizationServerConfig.java

// 安全配置
com.central.oauth.config.SecurityConfig.java

// 登录过滤器 (注入租户上下文)
com.central.oauth.component.LoginProcessSetTenantFilter.java
```

**Token 配置**:
- 访问令牌有效期: 1小时
- 刷新令牌有效期: 7天
- 令牌格式: JWT

### 4.3 业务服务层 (zlt-business)

**服务列表**:

| 服务名 | 端口 | 说明 |
|--------|------|------|
| user-center | 7000 | 用户中心 |
| organization-service | 7002 | 组织架构服务 |
| system-service | 7001 | 系统管理服务 |
| file-center | 5000 | 文件中心 |
| search-center | 7100 | 搜索中心 |
| multi-table-service | 7003 | 多维表格服务 |
| project-manager-service | 7004 | 项目管理服务 |
| crm-service | 7005 | CRM 客户服务 |
| saleops-optimizer | 7006 | 盈策通决策服务 |

**标准服务结构**:
```
{服务名}/
├── src/main/java/com/central/{模块名}/
│   ├── annotation/           # 自定义注解
│   │   └── LongToString.java
│   ├── config/               # 配置类
│   │   ├── MyBatisConfig.java
│   │   ├── TenantInterceptor.java      # 租户拦截器
│   │   └── WebMvcConfig.java
│   ├── controller/           # 控制器
│   │   └── XxxController.java
│   ├── mapper/               # MyBatis Mapper
│   │   └── XxxMapper.java
│   ├── model/                # 数据模型
│   │   ├── Xxx.java          # 实体类
│   │   ├── dto/              # 数据传输对象
│   │   └── vo/               # 视图对象
│   ├── service/              # 服务接口
│   │   ├── XxxService.java
│   │   └── impl/             # 服务实现
│   │       └── XxxServiceImpl.java
│   └── utils/                # 工具类
├── src/main/resources/
│   ├── application.yml      # 应用配置
│   └── mapper/               # Mapper XML
│       └── XxxMapper.xml
└── pom.xml
```

---

## 5. 服务治理

### 5.1 服务注册与发现

**组件**: Nacos Discovery

**配置**:
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: dev
```

**服务注册**:
```java
@SpringBootApplication
@EnableDiscoveryClient
public class UserCenterApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserCenterApplication.class, args);
    }
}
```

### 5.2 配置中心

**组件**: Nacos Config

**配置**:
```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yml
        shared-configs:
          - data-id: common.yml
            group: DEFAULT_GROUP
            refresh: true
```

### 5.3 负载均衡

**组件**: Spring Cloud LoadBalancer + Ribbon

**调用方式**:
```java
// Feign 调用
@FeignClient(name = "user-center", fallback = UserClientFallback.class)
public interface UserClient {
    @GetMapping("/api/user/{id}")
    User getUser(@PathVariable Long id);
}

// 声明式 REST 调用
@LoadBalancerClient(name = "user-center", configuration = LoadBalancerConfig.class)
```

### 5.4 限流熔断

**组件**: Sentinel

**配置**:
```yaml
spring:
  cloud:
    sentinel:
      eager: true  # 启动时加载规则
      transport:
        dashboard: 127.0.0.1:8858
```

---

## 6. 多租户架构

### 6.1 租户隔离策略

采用 **数据库字段级隔离** 方案，通过拦截器自动处理。

### 6.2 核心组件

**租户上下文拦截器**:
```java
// com.central.organization.config.TenantInterceptor.java
// 从请求头或上下文中获取租户ID，设置到 ThreadLocal
```

**租户 SQL 拦截器**:
```java
// com.central.organization.config.TenantSqlInterceptor.java
// 自动在 SQL 中注入 tenant_id 条件
```

### 6.3 请求头

```
X-Tenant-Id: {租户编码}
Authorization: Bearer {JWT_TOKEN}
```

### 6.4 数据模型

所有业务表包含租户字段:
```sql
CREATE TABLE xxx (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(32) NOT NULL,  -- 租户ID
    ...业务字段
);

-- 公共表（不属于任何租户）
CREATE TABLE sys_tenant (
    id BIGINT PRIMARY KEY,
    tenant_code VARCHAR(32) NOT NULL,  -- 租户编码
    tenant_name VARCHAR(64),            -- 租户名称
    ...配置字段
);
```

---

## 7. 开发规范

### 7.1 项目命名规范

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| 模块名 | zlt-{业务名} | zlt-user |
| 服务名 | {业务名}-center | user-center |
| 数据库名 | {项目前缀}_{业务名} | cp_user |
| 表名 | {模块前缀}_{业务表名} | sys_user |

### 7.2 代码分层规范

```
controller/     →  处理请求参数校验、调用service、返回响应
     ↓
service/        →  业务逻辑处理、事务管理
     ↓
mapper/         →  数据访问层、SQL编写
     ↓
model/          →  数据模型、DTO、VO
```

### 7.3 包命名规范

```java
com.central.{模块名}
├── annotation    // 自定义注解
├── config        // 配置类
├── controller    // 控制器
├── mapper        // Mapper接口
├── model         // 数据模型
│   ├── entity    // 实体类
│   ├── dto       // 数据传输对象
│   └── vo        // 视图对象
├── service       // 服务接口
│   └── impl      // 服务实现
└── utils         // 工具类
```

### 7.4 RESTful API 规范

| 操作 | HTTP方法 | URL示例 |
|------|---------|---------|
| 查询列表 | GET | /api/org/department |
| 查询详情 | GET | /api/org/department/{id} |
| 新增 | POST | /api/org/department |
| 修改 | PUT | /api/org/department |
| 删除 | DELETE | /api/org/department/{id} |

### 7.5 返回结果格式

```java
// 统一返回结果
{
    "code": 200,        // 状态码
    "msg": "success",   // 消息
    "data": {...}       // 数据
}

// 失败返回
{
    "code": 500,
    "msg": "业务异常描述",
    "data": null
}
```

---

## 8. 新建模块指南

### 8.1 步骤概览

```
1. 在 zlt-business 下创建服务模块
2. 配置 pom.xml 依赖
3. 创建启动类和配置
4. 实现 CRUD 代码
5. 配置路由规则
6. 编写数据库脚本
```

### 8.1 创建服务模块

**1. 在 zlt-business/{服务名}/ 下创建模块**

**2. pom.xml 配置**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>zlt-business</artifactId>
        <groupId>com.central</groupId>
        <version>${revision}</version>
    </parent>
    
    <modelVersion>4.0.0</modelVersion>
    <artifactId>{服务名}-service</artifactId>
    
    <dependencies>
        <!-- 公共组件 -->
        <dependency>
            <groupId>com.central</groupId>
            <artifactId>zlt-common-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.central</groupId>
            <artifactId>zlt-db-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.central</groupId>
            <artifactId>zlt-redis-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.central</groupId>
            <artifactId>zlt-auth-client-spring-boot-starter</artifactId>
        </dependency>
        
        <!-- 其他业务依赖 -->
    </dependencies>
</project>
```

**3. 父模块 pom.xml 添加子模块**:
```xml
<modules>
    <module>user-center</module>
    <module>organization-service</module>
    <!-- 添加新模块 -->
    <module>{服务名}-service</module>
</modules>
```

**4. 启动类**:
```java
package com.central.{模块名};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {
    "com.central.{模块名}",
    "com.central.common"  // 扫描公共包
})
@EnableDiscoveryClient
public class {服务名}Application {
    public static void main(String[] args) {
        SpringApplication.run({服务名}Application.class, args);
    }
}
```

**5. 配置文件 application.yml**:
```yaml
server:
  port: {端口号}

spring:
  application:
    name: {服务名}-service
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: dev
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yml

# 数据源配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/{数据库名}?useUnicode=true
    username: root
    password: your_password

# MyBatis Plus 配置
mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.central.{模块名}.model.entity
  configuration:
    map-underscore-to-camel-case: true
```

**6. 基础代码模板**:

*实体类*:
```java
package com.central.{模块名}.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("{表名}")
public class Xxx extends Model<Xxx> {
    private Long id;
    private String tenantId;        // 租户ID (必须)
    private String name;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

*Mapper*:
```java
package com.central.{模块名}.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.{模块名}.model.entity.Xxx;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface XxxMapper extends BaseMapper<Xxx> {
}
```

*Service*:
```java
package com.central.{模块名}.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.{模块名}.model.entity.Xxx;

public interface IXxxService extends IService<Xxx> {
    // 定义业务方法
}
```

*ServiceImpl*:
```java
package com.central.{模块名}.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.{模块名}.mapper.XxxMapper;
import com.central.{模块名}.model.entity.Xxx;
import com.central.{模块名}.service.IXxxService;
import org.springframework.stereotype.Service;

@Service
public class XxxServiceImpl extends ServiceImpl<XxxMapper, Xxx> implements IXxxService {
    // 实现业务方法
}
```

*Controller*:
```java
package com.central.{模块名}.controller;

import com.central.common.utils.Result;
import com.central.{模块名}.model.entity.Xxx;
import com.central.{模块名}.service.IXxxService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{模块名}/xxx")
@RequiredArgsConstructor
public class XxxController {
    
    private final IXxxService xxxService;
    
    @GetMapping("/{id}")
    public Result<Xxx> getById(@PathVariable Long id) {
        return Result.success(xxxService.getById(id));
    }
    
    @GetMapping("/list")
    public Result list() {
        return Result.success(xxxService.list());
    }
    
    @PostMapping
    public Result save(@RequestBody Xxx xxx) {
        xxxService.save(xxx);
        return Result.success();
    }
    
    @PutMapping
    public Result update(@RequestBody Xxx xxx) {
        xxxService.updateById(xxx);
        return Result.success();
    }
    
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Long id) {
        xxxService.removeById(id);
        return Result.success();
    }
}
```

### 8.2 配置网关路由

**方式1: 配置文件 (zlt-gateway/sc-gateway/src/main/resources/)**

```yaml
spring:
  cloud:
    gateway:
      routes:
        # 新服务路由
        - id: {服务名}-service
          uri: lb://{服务名}-service
          predicates:
            - Path=/api/{模块名}/**
          filters:
            - StripPrefix=1  # 去掉前缀
```

**方式2: Nacos 配置中心**

在 Nacos 中创建 `sc-gateway.yml`:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: {服务名}-service
          uri: lb://{服务名}-service
          predicates:
            - Path=/api/{模块名}/**
```

### 8.3 数据库脚本规范

**脚本文件位置**: `sql/{模块名}/`

**脚本命名**:
```
{模块名}_module.sql          # 模块表结构
{模块名}_init_data.sql       # 初始化数据
{模块名}_dict.sql            # 字典数据
```

**脚本模板**:
```sql
-- ============================================
-- 模块名称: {模块名}
-- 功能描述: {功能描述}
-- 创建日期: {日期}
-- ============================================

-- 租户表
CREATE TABLE IF NOT EXISTS `{表前缀}_xxx` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `name` VARCHAR(64) NOT NULL COMMENT '名称',
    `status` TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_id` (`tenant_id`),
    INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='{表描述}';

-- 初始化数据
INSERT INTO `{表前缀}_xxx` (`id`, `tenant_id`, `name`, `status`) VALUES
(1, 'SUPER', '示例数据', 1);
```

---

## 9. 数据库设计规范

### 9.1 表命名规范

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| 系统表 | sys_{实体} | sys_user, sys_role |
| 租户表 | {前缀}_{实体} | org_department |
| 关联表 | {表1}_{表2}_rel | user_role_rel |
| 字典表 | sys_dict | sys_dict |
| 日志表 | log_{类型} | log_operation |

### 9.2 字段命名规范

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| 主键 | id | id, user_id |
| 外键 | {实体}_id | department_id |
| 租户ID | tenant_id | tenant_id |
| 创建时间 | create_time | create_time |
| 更新时间 | update_time | update_time |
| 逻辑删除 | del_flag | del_flag |
| 状态 | status | status |

### 9.3 必须字段

所有业务表必须包含:
```sql
id          BIGINT      PRIMARY KEY AUTO_INCREMENT
tenant_id   VARCHAR(32) NOT NULL        -- 租户ID
create_time DATETIME    DEFAULT CURRENT_TIMESTAMP
update_time DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 9.4 常用字段

| 字段 | 类型 | 说明 |
|------|------|------|
| name | VARCHAR(64) | 名称 |
| code | VARCHAR(32) | 编码 |
| status | TINYINT | 状态 (0禁用 1启用) |
| sort | INT | 排序 |
| remark | VARCHAR(255) | 备注 |
| del_flag | TINYINT | 删除标志 (0未删 1已删) |
| create_by | VARCHAR(64) | 创建人 |
| update_by | VARCHAR(64) | 更新人 |

---

## 10. API 设计规范

### 10.1 URL 规范

```
/api/{模块名}/{实体}
/api/{模块名}/{实体}/{id}
/api/{模块名}/{实体}/{id}/{action}
```

### 10.2 请求方法

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 查询 | GET /api/org/department |
| POST | 新增 | POST /api/org/department |
| PUT | 修改 | PUT /api/org/department |
| DELETE | 删除 | DELETE /api/org/department/1 |

### 10.3 分页查询

**请求**:
```bash
GET /api/org/department/list?page=1&pageSize=10&keyword=xxx
```

**响应**:
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "records": [...],
        "total": 100,
        "size": 10,
        "current": 1,
        "pages": 10
    }
}
```

### 10.4 批量操作

```bash
POST /api/org/department/batch
Content-Type: application/json

{
    "departmentIds": [1, 2, 3],
    "action": "delete"  // delete/enable/disable
}
```

---

## 附录

### A. 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| README | README.md | 项目主文档 |
| PRD | docs/prd.md | 需求文档 |
| Web UI | docs/webui.md | 前端设计文档 |
| SQL 脚本 | sql/ | 数据库脚本 |

### B. 常用命令

**Maven 构建**:
```bash
# 全量构建
mvn clean package

# 跳过测试
mvn clean package -DskipTests

# 指定模块
mvn clean package -pl zlt-business/{服务名} -am
```

**Nacos 启动**:
```bash
# Windows
startup.cmd -m standalone

# Linux
./startup.sh -m standalone
```

### C. 联系我

如有问题，请查阅:
- Spring Cloud: https://spring.io/projects/spring-cloud
- Spring Cloud Alibaba: https://github.com/alibaba/spring-cloud-alibaba
- MyBatis Plus: https://baomidou.com/
- Nacos: https://nacos.io/

---

*本文档由架构分析工具自动生成，仅供参考。*
