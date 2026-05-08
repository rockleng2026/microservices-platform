# Plan: Phase 1 - 基础架构搭建

**Phase:** 1
**Goal:** 完成mall-center服务创建、数据库设计、用户侧商品浏览与购物车基础功能
**Created:** 2026-05-08
**Mode:** mvp

---

## Plan 1: 服务模块与配置

**Objective:** 创建 mall-center 服务模块，配置基础依赖和启动类

### Wave 1 | Depends on: — | Requirements: GOODS-01~04, CART-01~06, USER-01~03, VIRTUAL-01

#### Tasks

##### Task 1.1: 创建 mall-center 模块目录和 pom.xml

<read_first>
- `D:\code\microservices-platform\zlt-business\pom.xml` (父模块配置)
- `D:\code\microservices-platform\zlt-business\crm-service\pom.xml` (依赖参考)
</read_first>

<acceptance_criteria>
- [ ] `zlt-business/mall-center/pom.xml` 存在
- [ ] pom.xml 包含 `zlt-common-spring-boot-starter`、`zlt-db-spring-boot-starter`、`zlt-redis-spring-boot-starter` 依赖
- [ ] parent 指向 `zlt-business`
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.zlt</groupId>
        <artifactId>zlt-business</artifactId>
        <version>6.0.0</version>
    </parent>
    <artifactId>mall-center</artifactId>
    <description>商城中心服务</description>

    <dependencies>
        <dependency>
            <groupId>com.zlt</groupId>
            <artifactId>zlt-common-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.zlt</groupId>
            <artifactId>zlt-db-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.zlt</groupId>
            <artifactId>zlt-redis-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.zlt</groupId>
            <artifactId>zlt-auth-client-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.zlt</groupId>
            <artifactId>zlt-oss-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
        <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
        <finalName>${project.artifactId}</finalName>
    </build>
</project>
```
</action>

---

##### Task 1.2: 创建启动类 MallCenterApplication.java

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\CrmServiceApplication.java`
</read_first>

<acceptance_criteria>
- [ ] `MallCenterApplication.java` 存在于 `com.central.mall` 包下
- [ ] 包含 `@SpringBootApplication`、`@EnableDiscoveryClient`、`scanBasePackages` 配置
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/MallCenterApplication.java`：

```java
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
```
</action>

---

##### Task 1.3: 创建 application.yml 配置文件

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\resources\application.yml` (参考配置)
</read_first>

<acceptance_criteria>
- [ ] `application.yml` 存在于 `mall-center/src/main/resources/`
- [ ] 端口配置为 7010
- [ ] 应用名为 mall-center
- [ ] 包含 Nacos discovery 和 config 配置
- [ ] 包含 MySQL 和 Redis 配置占位符
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/resources/application.yml`：

```yaml
server:
  port: 7010

spring:
  application:
    name: mall-center
  cloud:
    nacos:
      discovery:
        server-addr: ${NACOS_SERVER:127.0.0.1:8848}
        namespace: ${NACOS_NAMESPACE:dev}
      config:
        server-addr: ${NACOS_SERVER:127.0.0.1:8848}
        file-extension: yml
        shared-configs:
          - data-id: common.yml
            group: DEFAULT_GROUP
            refresh: true
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://${DB_HOST:127.0.0.1}:${DB_PORT:3306}/${DB_NAME:cp_mall}?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:root}
  redis:
    host: ${REDIS_HOST:127.0.0.1}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    database: 0

mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.central.mall.model.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

springdoc:
  api-docs:
    enabled: true
  swagger-ui:
    enabled: true

# 商城配置
mall:
  goods:
    default-page-size: 20
    max-page-size: 100
```

在父模块 `zlt-business/pom.xml` 中添加子模块引用：
```xml
<module>mall-center</module>
```
</action>

---

## Plan 2: 数据库表结构

**Objective:** 创建商城核心数据库表结构

### Wave 1 | Depends on: Plan 1 | Requirements: GOODS-01~04, CART-01~06, VIRTUAL-01

#### Tasks

##### Task 2.1: 创建数据库脚本

<read_first>
- `D:\code\microservices-platform\sql\` (现有SQL目录结构)
- ARCHITECTURE.md 数据库设计规范章节
</read_first>

<acceptance_criteria>
- [ ] SQL文件创建于 `sql/mall-center/` 目录
- [ ] 包含 6 张表：mall_category, mall_goods, mall_goods_spec, mall_goods_sku, mall_cart, mall_user_address
- [ ] 所有表包含 `id`, `tenant_id`, `create_time`, `update_time` 字段
- [ ] 包含初始化测试数据
</acceptance_criteria>

<action>
创建 `sql/mall-center/mall_center.sql`：

```sql
-- ============================================
-- 模块名称: mall-center
-- 功能描述: 商城核心表结构
-- 创建日期: 2026-05-08
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS cp_mall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cp_mall;

-- ----------------------------------------
-- 1. 商品分类表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父级ID',
    `name` VARCHAR(64) NOT NULL COMMENT '分类名称',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `icon` VARCHAR(255) COMMENT '图标',
    `status` TINYINT DEFAULT 1 COMMENT '状态(0禁用,1启用)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类';

-- ----------------------------------------
-- 2. 商品表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_goods` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `category_id` BIGINT NOT NULL COMMENT '分类ID',
    `name` VARCHAR(128) NOT NULL COMMENT '商品名称',
    `sub_title` VARCHAR(255) COMMENT '副标题',
    `main_image` VARCHAR(255) COMMENT '主图',
    `images` TEXT COMMENT '商品图集(JSON数组)',
    `detail` LONGTEXT COMMENT '详情(富文本)',
    `price` DECIMAL(10,2) COMMENT '划线价/参考价',
    `sales` INT DEFAULT 0 COMMENT '销量',
    `status` TINYINT DEFAULT 1 COMMENT '状态(0下架,1上架)',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `goods_type` TINYINT NOT NULL DEFAULT 1 COMMENT '商品类型:1实物,2虚拟',
    `virtual_url` VARCHAR(500) COMMENT '虚拟资源链接',
    `virtual_file_id` BIGINT COMMENT '虚拟资源文件ID',
    `virtual_expire` DATETIME COMMENT '资源有效期',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `del_flag` TINYINT DEFAULT 0 COMMENT '删除标志(0未删,1已删)',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category_id`),
    KEY `idx_tenant` (`tenant_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品信息';

-- ----------------------------------------
-- 3. 商品规格表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_goods_spec` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `spec_name` VARCHAR(64) NOT NULL COMMENT '规格名称(如CPU型号)',
    `spec_values` TEXT COMMENT '规格值列表(JSON:["i7-13700","i9-13900"])',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格定义';

-- ----------------------------------------
-- 4. 商品SKU表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_goods_sku` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `sku_code` VARCHAR(128) COMMENT '商家SKU编码',
    `specs` TEXT COMMENT '规格组合(JSON:{"CPU型号":"i7-13700","内存":"32GB"})',
    `price` DECIMAL(10,2) NOT NULL COMMENT '销售价',
    `stock` INT NOT NULL DEFAULT 0 COMMENT '库存数量(-1表示无限制)',
    `image` VARCHAR(255) COMMENT 'SKU图片',
    `status` TINYINT DEFAULT 1 COMMENT '状态(0禁用,1启用)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_goods_id` (`goods_id`),
    KEY `idx_sku_code` (`sku_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU';

-- ----------------------------------------
-- 5. 购物车表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_cart` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `sku_id` BIGINT NOT NULL COMMENT 'SKU ID',
    `goods_id` BIGINT NOT NULL COMMENT '商品ID',
    `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
    `checked` TINYINT DEFAULT 1 COMMENT '是否选中(1是,0否)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_sku` (`user_id`,`sku_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车';

-- ----------------------------------------
-- 6. 收货地址表
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `mall_user_address` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `tenant_id` VARCHAR(32) NOT NULL COMMENT '租户ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `name` VARCHAR(32) NOT NULL COMMENT '收货人',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `province` VARCHAR(32) NOT NULL COMMENT '省份',
    `city` VARCHAR(32) NOT NULL COMMENT '城市',
    `district` VARCHAR(32) NOT NULL COMMENT '区县',
    `detail` VARCHAR(255) NOT NULL COMMENT '详细地址',
    `is_default` TINYINT DEFAULT 0 COMMENT '是否默认(0否,1是)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址';

-- ----------------------------------------
-- 初始化测试数据
-- ----------------------------------------
INSERT INTO `mall_category` (`id`, `tenant_id`, `parent_id`, `name`, `sort`, `status`) VALUES
(1, 'SUPER', 0, '服务器', 1, 1),
(2, 'SUPER', 0, 'CPU处理器', 2, 1),
(3, 'SUPER', 0, '内存', 3, 1),
(4, 'SUPER', 0, 'NAS存储', 4, 1),
(5, 'SUPER', 0, '网络设备', 5, 1),
(6, 'SUPER', 0, '技术文档', 6, 1);

INSERT INTO `mall_goods` (`id`, `tenant_id`, `category_id`, `name`, `sub_title`, `main_image`, `price`, `sales`, `status`, `goods_type`) VALUES
(1, 'SUPER', 1, 'Dell PowerEdge R750 服务器', '2U机架式服务器', '/images/goods/dell_r750.jpg', 25999.00, 100, 1, 1),
(2, 'SUPER', 2, 'Intel Xeon Gold 6348', '28核56线程处理器', '/images/goods/xeon_6348.jpg', 8999.00, 50, 1, 1),
(3, 'SUPER', 3, '三星 64GB DDR5 ECC', '服务器内存 4800MHz', '/images/goods/ddr5_64g.jpg', 1899.00, 200, 1, 1),
(4, 'SUPER', 6, 'Kubernetes实战指南', '云原生架构与实践', '/images/goods/k8s_guide.jpg', 99.00, 1000, 1, 2);
```

在 `sql/` 目录下创建 `mall-center` 子目录并将脚本放入。
</action>

---

## Plan 3: 实体类与Mapper

**Objective:** 创建商城实体类和MyBatis Mapper

### Wave 1 | Depends on: Plan 1 | Requirements: GOODS-01~04, CART-01~06, USER-02, VIRTUAL-01

#### Tasks

##### Task 3.1: 创建实体类

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\model\` (现有实体模型)
- ARCHITECTURE.md 实体类命名规范
</read_first>

<acceptance_criteria>
- [ ] 6个实体类创建于 `com.central.mall.model.entity` 包
- [ ] 包含 `MallCategory.java`, `MallGoods.java`, `MallGoodsSpec.java`, `MallGoodsSku.java`, `MallCart.java`, `MallUserAddress.java`
- [ ] 所有实体使用 `@TableName` 注解
- [ ] 包含 Lombok `@Data` 注解
- [ ] 包含继承 `Model<T>` 或添加必要字段
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallCategory.java`：

```java
package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_category")
public class MallCategory extends Model<MallCategory> {
    private Long id;
    private String tenantId;
    private Long parentId;
    private String name;
    private Integer sort;
    private String icon;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

创建 `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallGoods.java`：

```java
package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("mall_goods")
public class MallGoods extends Model<MallGoods> {
    private Long id;
    private String tenantId;
    private Long categoryId;
    private String name;
    private String subTitle;
    private String mainImage;
    private String images;
    private String detail;
    private BigDecimal price;
    private Integer sales;
    private Integer status;
    private Integer sort;
    private Integer goodsType;  // 1=实物, 2=虚拟
    private String virtualUrl;
    private Long virtualFileId;
    private LocalDateTime virtualExpire;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer delFlag;
}
```

创建 `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallGoodsSpec.java`：

```java
package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_goods_spec")
public class MallGoodsSpec extends Model<MallGoodsSpec> {
    private Long id;
    private String tenantId;
    private Long goodsId;
    private String specName;
    private String specValues;  // JSON数组
    private LocalDateTime createTime;
}
```

创建 `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallGoodsSku.java`：

```java
package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("mall_goods_sku")
public class MallGoodsSku extends Model<MallGoodsSku> {
    private Long id;
    private String tenantId;
    private Long goodsId;
    private String skuCode;
    private String specs;  // JSON对象
    private BigDecimal price;
    private Integer stock;  // -1表示无限制
    private String image;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

创建 `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallCart.java`：

```java
package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_cart")
public class MallCart extends Model<MallCart> {
    private Long id;
    private String tenantId;
    private Long userId;
    private Long skuId;
    private Long goodsId;
    private Integer quantity;
    private Integer checked;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

创建 `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallUserAddress.java`：

```java
package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_user_address")
public class MallUserAddress extends Model<MallUserAddress> {
    private Long id;
    private String tenantId;
    private Long userId;
    private String name;
    private String phone;
    private String province;
    private String city;
    private String district;
    private String detail;
    private Integer isDefault;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```
</action>

---

##### Task 3.2: 创建 Mapper 接口

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\mapper\CustomerMapper.java`
</read_first>

<acceptance_criteria>
- [ ] 6个Mapper接口创建于 `com.central.mall.mapper` 包
- [ ] 继承 `BaseMapper<T>` 接口
- [ ] 添加 `@Mapper` 注解
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallCategoryMapper.java`：

```java
package com.central.mall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.mall.model.entity.MallCategory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MallCategoryMapper extends BaseMapper<MallCategory> {
}
```

类似创建 `MallGoodsMapper.java`, `MallGoodsSpecMapper.java`, `MallGoodsSkuMapper.java`, `MallCartMapper.java`, `MallUserAddressMapper.java`。
</action>

---

## Plan 4: Service层实现

**Objective:** 实现商品服务和购物车服务

### Wave 2 | Depends on: Plan 3 | Requirements: GOODS-01~04, CART-01~06, VIRTUAL-01

#### Tasks

##### Task 4.1: 创建商品服务

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\service\CustomerFollowService.java`
</read_first>

<acceptance_criteria>
- [ ] `IGoodsService.java` 接口创建于 `com.central.mall.service`
- [ ] `GoodsServiceImpl.java` 创建于 `com.central.mall.service.impl`
- [ ] 实现商品分类树查询
- [ ] 实现商品列表查询（支持分类、关键词、排序、分页）
- [ ] 实现商品详情查询（含SKU列表）
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/service/IGoodsService.java`：

```java
package com.central.mall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallGoodsSku;

import java.util.List;
import java.util.Map;

public interface IGoodsService extends IService<MallGoods> {

    /**
     * 获取分类树
     */
    List<Map<String, Object>> getCategoryTree();

    /**
     * 分页查询商品列表
     */
    IPage<MallGoods> getGoodsPage(IPage<MallGoods> page, Map<String, Object> params);

    /**
     * 获取商品详情（含SKU）
     */
    Map<String, Object> getGoodsDetail(Long goodsId);

    /**
     * 获取商品SKU列表
     */
    List<MallGoodsSku> getGoodsSkus(Long goodsId);

    /**
     * 获取热门/推荐商品
     */
    List<MallGoods> getHotGoods(int limit);
}
```

创建 `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/GoodsServiceImpl.java`：

实现上述接口方法，包含：
- `getCategoryTree()`: 使用递归构建分类树
- `getGoodsPage()`: 支持 categoryId、keyword、sortField、sortOrder 参数
- `getGoodsDetail()`: 返回商品信息和SKU规格列表
- `getGoodsSkus()`: 返回指定商品的SKU列表
- `getHotGoods()`: 按销量排序获取推荐商品
</action>

---

##### Task 4.2: 创建购物车服务

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\service\CustomerFollowService.java`
</read_first>

<acceptance_criteria>
- [ ] `ICartService.java` 接口创建于 `com.central.mall.service`
- [ ] `CartServiceImpl.java` 创建于 `com.central.mall.service.impl`
- [ ] 实现加入购物车
- [ ] 实现购物车列表查询（含商品和SKU信息）
- [ ] 实现修改数量和选中状态
- [ ] 实现删除购物车项
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/service/ICartService.java`：

```java
package com.central.mall.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.entity.MallCart;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ICartService extends IService<MallCart> {

    /**
     * 加入购物车
     */
    boolean addToCart(Long userId, Long skuId, Integer quantity);

    /**
     * 获取购物车列表（含商品和SKU信息）
     */
    List<Map<String, Object>> getCartList(Long userId);

    /**
     * 计算购物车总价
     */
    BigDecimal calculateTotal(Long userId, List<Long> checkedSkuIds);

    /**
     * 修改购物车商品数量
     */
    boolean updateQuantity(Long cartId, Integer quantity);

    /**
     * 修改选中状态
     */
    boolean updateChecked(Long cartId, Integer checked);

    /**
     * 删除购物车项
     */
    boolean deleteCartItem(Long cartId);

    /**
     * 清空已选中的购物车项
     */
    boolean clearChecked(Long userId);
}
```
</action>

---

## Plan 5: Controller层实现

**Objective:** 实现商品和购物车API接口

### Wave 2 | Depends on: Plan 4 | Requirements: GOODS-01~04, CART-01~06, VIRTUAL-01

#### Tasks

##### Task 5.1: 创建商品Controller

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\controller\CustomerController.java`
</read_first>

<acceptance_criteria>
- [ ] `GoodsController.java` 创建于 `com.central.mall.controller`
- [ ] 实现 `/api/mall/goods/categories` GET - 获取分类树
- [ ] 实现 `/api/mall/goods/list` GET - 商品列表
- [ ] 实现 `/api/mall/goods/{id}` GET - 商品详情
- [ ] 实现 `/api/mall/goods/hot` GET - 热门推荐
- [ ] 返回格式使用 `Result<T>`
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/controller/GoodsController.java`：

```java
package com.central.mall.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.service.IGoodsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/goods")
@RequiredArgsConstructor
@Tag(name = "商品管理", description = "小程序端商品接口")
public class GoodsController {

    private final IGoodsService goodsService;

    @GetMapping("/categories")
    @Operation(summary = "获取分类树")
    public Result<List<Map<String, Object>>> getCategories() {
        return Result.success(goodsService.getCategoryTree());
    }

    @GetMapping("/list")
    @Operation(summary = "商品列表")
    public Result<IPage<MallGoods>> getGoodsList(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createTime") String sortField,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        IPage<MallGoods> pageResult = goodsService.getGoodsPage(
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, pageSize),
            Map.of("categoryId", categoryId != null ? categoryId : "",
                   "keyword", keyword != null ? keyword : "",
                   "sortField", sortField,
                   "sortOrder", sortOrder)
        );
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    @Operation(summary = "商品详情")
    public Result<Map<String, Object>> getGoodsDetail(@PathVariable Long id) {
        return Result.success(goodsService.getGoodsDetail(id));
    }

    @GetMapping("/hot")
    @Operation(summary = "热门推荐")
    public Result<List<MallGoods>> getHotGoods(@RequestParam(defaultValue = "10") int limit) {
        return Result.success(goodsService.getHotGoods(limit));
    }
}
```
</action>

---

##### Task 5.2: 创建购物车Controller

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\controller\CustomerController.java`
</read_first>

<acceptance_criteria>
- [ ] `CartController.java` 创建于 `com.central.mall.controller`
- [ ] 实现 `POST /api/mall/cart` - 加入购物车
- [ ] 实现 `GET /api/mall/cart/list` - 购物车列表
- [ ] 实现 `PUT /api/mall/cart/{id}` - 修改数量或选中状态
- [ ] 实现 `DELETE /api/mall/cart/{id}` - 删除购物车项
- [ ] 实现 `DELETE /api/mall/cart/clear` - 清空已选中
- [ ] 用户ID从Token获取（暂用模拟值）
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/controller/CartController.java`：

```java
package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.service.ICartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/cart")
@RequiredArgsConstructor
@Tag(name = "购物车管理", description = "小程序端购物车接口")
public class CartController {

    private final ICartService cartService;

    @PostMapping
    @Operation(summary = "加入购物车")
    public Result<Void> addToCart(@RequestBody Map<String, Object> params) {
        // TODO: 从Token获取真实userId，暂时使用模拟值
        Long userId = 1L;
        Long skuId = Long.valueOf(params.get("skuId").toString());
        Integer quantity = Integer.valueOf(params.get("quantity").toString());
        cartService.addToCart(userId, skuId, quantity);
        return Result.success();
    }

    @GetMapping("/list")
    @Operation(summary = "购物车列表")
    public Result<List<Map<String, Object>>> getCartList() {
        Long userId = 1L; // TODO: 从Token获取
        return Result.success(cartService.getCartList(userId));
    }

    @GetMapping("/total")
    @Operation(summary = "购物车总价")
    public Result<BigDecimal> getCartTotal(@RequestParam List<Long> checkedSkuIds) {
        Long userId = 1L; // TODO: 从Token获取
        return Result.success(cartService.calculateTotal(userId, checkedSkuIds));
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改数量或选中状态")
    public Result<Void> updateCart(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        if (params.containsKey("quantity")) {
            cartService.updateQuantity(id, Integer.valueOf(params.get("quantity").toString()));
        }
        if (params.containsKey("checked")) {
            cartService.updateChecked(id, Integer.valueOf(params.get("checked").toString()));
        }
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除购物车项")
    public Result<Void> deleteCartItem(@PathVariable Long id) {
        cartService.deleteCartItem(id);
        return Result.success();
    }

    @DeleteMapping("/clear")
    @Operation(summary = "清空已选中")
    public Result<Void> clearChecked() {
        Long userId = 1L; // TODO: 从Token获取
        cartService.clearChecked(userId);
        return Result.success();
    }
}
```
</action>

---

##### Task 5.3: 创建收货地址Controller

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\controller\CustomerController.java`
</read_first>

<acceptance_criteria>
- [ ] `UserAddressController.java` 创建于 `com.central.mall.controller`
- [ ] 实现 `GET /api/mall/address/list` - 地址列表
- [ ] 实现 `POST /api/mall/address` - 新增地址
- [ ] 实现 `PUT /api/mall/address/{id}` - 修改地址
- [ ] 实现 `DELETE /api/mall/address/{id}` - 删除地址
- [ ] 实现 `PUT /api/mall/address/{id}/default` - 设为默认
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/controller/UserAddressController.java`：

```java
package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.model.entity.MallUserAddress;
import com.central.mall.service.IUserAddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mall/address")
@RequiredArgsConstructor
@Tag(name = "收货地址管理", description = "小程序端收货地址接口")
public class UserAddressController {

    private final IUserAddressService userAddressService;

    @GetMapping("/list")
    @Operation(summary = "地址列表")
    public Result<List<MallUserAddress>> getAddressList() {
        Long userId = 1L; // TODO: 从Token获取
        return Result.success(userAddressService.getByUserId(userId));
    }

    @PostMapping
    @Operation(summary = "新增地址")
    public Result<Void> addAddress(@RequestBody MallUserAddress address) {
        Long userId = 1L; // TODO: 从Token获取
        address.setUserId(userId);
        userAddressService.save(address);
        return Result.success();
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改地址")
    public Result<Void> updateAddress(@PathVariable Long id, @RequestBody MallUserAddress address) {
        address.setId(id);
        userAddressService.updateById(address);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除地址")
    public Result<Void> deleteAddress(@PathVariable Long id) {
        userAddressService.removeById(id);
        return Result.success();
    }

    @PutMapping("/{id}/default")
    @Operation(summary = "设为默认")
    public Result<Void> setDefault(@PathVariable Long id) {
        Long userId = 1L; // TODO: 从Token获取
        userAddressService.setDefault(userId, id);
        return Result.success();
    }
}
```
</action>

---

## Plan 6: 配置类

**Objective:** 创建必要的配置类（WebMvc、MyBatis、租户拦截）

### Wave 1 | Depends on: Plan 1 | Requirements: GOODS-01~04

#### Tasks

##### Task 6.1: 创建配置类

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\config\MyBatisConfig.java`
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\config\WebMvcConfig.java`
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\config\TenantInterceptor.java`
</read_first>

<acceptance_criteria>
- [ ] `WebMvcConfig.java` 创建于 `com.central.mall.config`
- [ ] `MyBatisConfig.java` 创建于 `com.central.mall.config`
- [ ] `TenantInterceptor.java` 创建于 `com.central.mall.config`
- [ ] 租户拦截器从请求头 `x-tenant-header` 提取租户ID
- [ ] 注册 Swagger/OpenAPI 文档路径 `/doc.html`
</acceptance_criteria>

<action>
创建配置类，参考现有服务的实现模式。
</action>

---

## Plan 7: 网关路由配置

**Objective:** 配置网关路由指向 mall-center 服务

### Wave 3 | Depends on: Plan 1~6 | Requirements: ALL Phase 1

#### Tasks

##### Task 7.1: 配置网关路由

<read_first>
- `D:\code\microservices-platform\zlt-gateway\` (网关配置目录)
</read_first>

<acceptance_criteria>
- [ ] 在 Nacos 配置或网关配置文件中添加 `/api/mall/**` 路由
- [ ] 路由目标为 `lb://mall-center`
- [ ] 包含 StripPrefix 过滤器配置
</acceptance_criteria>

<action>
在网关配置中添加路由规则，或在 Nacos 配置中心创建配置：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: mall-center
          uri: lb://mall-center
          predicates:
            - Path=/api/mall/**
          filters:
            - StripPrefix=1
```

说明：StripPrefix=1 会将 `/api/mall/goods/list` 变为 `/goods/list` 转发给 mall-center。
</action>

---

## Plan 8: 用户模块（基础）

**Objective:** 实现用户登录和个人信息接口

### Wave 2 | Depends on: Plan 4 | Requirements: USER-01, USER-03

#### Tasks

##### Task 8.1: 创建用户Controller

<read_first>
- `D:\code\microservices-platform\zlt-business\crm-service\src\main\java\com\central\crm\controller\CustomerController.java`
</read_first>

<acceptance_criteria>
- [ ] `UserController.java` 创建于 `com.central.mall.controller`
- [ ] 实现 `GET /api/mall/user/info` - 获取个人信息
- [ ] 用户ID从Token解析（暂时使用模拟值返回固定用户信息）
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/controller/UserController.java`：

```java
package com.central.mall.controller;

import com.central.common.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/user")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "小程序端用户接口")
public class UserController {

    @GetMapping("/info")
    @Operation(summary = "获取个人信息")
    public Result<Map<String, Object>> getUserInfo() {
        // TODO: 从Token获取真实userId
        Long userId = 1L;
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("userId", userId);
        userInfo.put("nickname", "测试用户");
        userInfo.put("avatar", "/images/avatar/default.jpg");
        userInfo.put("phone", "13800138000");
        return Result.success(userInfo);
    }

    @GetMapping("/address/list")
    @Operation(summary = "获取收货地址列表")
    public Result<Object> getAddressList() {
        // TODO: 实现收货地址列表
        return Result.success(null);
    }
}
```
</action>

---

## Plan 9: 微信登录集成（预留）

**Objective:** 预留微信OAuth2登录接口

### Wave 3 | Depends on: Plan 8 | Requirements: USER-01

#### Tasks

##### Task 9.1: 创建微信登录接口（预留）

<read_first>
- ARCHITECTURE.md 微信登录集成方案
</read_first>

<acceptance_criteria>
- [ ] `AuthController.java` 创建于 `com.central.mall.controller`
- [ ] 实现 `POST /api/mall/auth/login` - 微信登录（接收code）
- [ ] 返回JWT Token（暂时返回模拟Token）
- [ ] 注释说明正式实现需要在zlt-uaa配置微信OAuth2客户端
</acceptance_criteria>

<action>
创建 `zlt-business/mall-center/src/main/java/com/central/mall/controller/AuthController.java`：

```java
package com.central.mall.controller;

import com.central.common.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/auth")
@RequiredArgsConstructor
@Tag(name = "用户认证", description = "小程序端认证接口")
public class AuthController {

    @PostMapping("/login")
    @Operation(summary = "微信授权登录")
    public Result<Map<String, Object>> wxLogin(@RequestBody Map<String, String> params) {
        String code = params.get("code");
        // TODO: 正式实现
        // 1. 调用微信接口用code换取openid
        // 2. 绑定或创建用户记录
        // 3. 生成JWT Token返回
        // 暂时返回模拟数据
        Map<String, Object> result = new HashMap<>();
        result.put("token", "MOCK_TOKEN_" + System.currentTimeMillis());
        result.put("userId", 1L);
        return Result.success(result);
    }
}
```
</action>

---

## Verification Criteria

1. mall-center 服务启动成功，端口 7010
2. Nacos 中可以看到 mall-center 服务注册
3. Swagger 文档可访问：`http://localhost:7010/doc.html`
4. 商品分类接口返回数据
5. 商品列表接口支持分页、筛选、排序
6. 购物车 CRUD 操作正常
7. 收货地址 CRUD 操作正常

---

## Files Modified/Created

```
zlt-business/mall-center/
├── pom.xml
├── src/main/java/com/central/mall/
│   ├── MallCenterApplication.java
│   ├── config/
│   │   ├── WebMvcConfig.java
│   │   ├── MyBatisConfig.java
│   │   └── TenantInterceptor.java
│   ├── controller/
│   │   ├── GoodsController.java
│   │   ├── CartController.java
│   │   ├── UserAddressController.java
│   │   ├── UserController.java
│   │   └── AuthController.java
│   ├── mapper/
│   │   ├── MallCategoryMapper.java
│   │   ├── MallGoodsMapper.java
│   │   ├── MallGoodsSpecMapper.java
│   │   ├── MallGoodsSkuMapper.java
│   │   ├── MallCartMapper.java
│   │   └── MallUserAddressMapper.java
│   ├── model/entity/
│   │   ├── MallCategory.java
│   │   ├── MallGoods.java
│   │   ├── MallGoodsSpec.java
│   │   ├── MallGoodsSku.java
│   │   ├── MallCart.java
│   │   └── MallUserAddress.java
│   └── service/
│       ├── IGoodsService.java
│       ├── ICartService.java
│       ├── IUserAddressService.java
│       └── impl/
│           ├── GoodsServiceImpl.java
│           ├── CartServiceImpl.java
│           └── UserAddressServiceImpl.java
└── src/main/resources/
    └── application.yml

sql/mall-center/
└── mall_center.sql

zlt-business/pom.xml (添加 mall-center 模块)
```

---

## Success Criteria

- [ ] mall-center 服务成功注册到 Nacos，端口 7010
- [ ] 数据库表创建完成
- [ ] 用户可以查看商品分类树
- [ ] 用户可以搜索/筛选/排序商品列表
- [ ] 用户可以查看商品详情（含 SKU 规格）
- [ ] 用户可以加入购物车、修改数量、删除
- [ ] 用户可以管理收货地址
- [ ] 微信登录接口预留完成
- [ ] 网关路由配置完成

---

*Plan created: 2026-05-08*
