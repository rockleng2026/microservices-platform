如何新增一个服务
一、说明
二、新服务应该加在那个目录下？
三、参考那个工程最合适？
四、pom应该依赖哪些jar？
4.1. 基础依赖（必需）
4.2. 数据库依赖（可选）
4.3. 缓存依赖（可选）
4.4. 服务调用依赖（可选）
4.5. 限流、降级、熔断依赖（可选）
4.6. 服务监控依赖（可选）
五、配置文件要怎么弄？
5.1. bootstrap.yml
5.2. application.yml
六、哪些代码必需的？
6.1. 启动类增加的注解
6.2. 配置类
一、说明
相信大家已经清楚应该怎样修改基础配置，与必要的模块能正常启动了，如果还不清楚请参阅 部署教程；


这篇主要是给大家解答需要新增一个服务应该要注意些什么，主要围绕 统一配置、数据库、缓存、swagger、获取当前登录人、租户 等基础常用功能的进行说明。

 

二、新服务应该加在那个目录下？
zlt-business 目录下主要是放与业务功能相关的服务或者工程，所以推荐在该目录下新建。

 

三、参考那个工程最合适？
建议参照 user-center 服务，因为这个工程已经基本上集成了实际业务所需要的功能，包括数据库、缓存、swagger等。

 

四、pom应该依赖哪些jar？
4.1. 基础依赖（必需）
<!-- 统一配置 -->
<dependency>
    <groupId>com.zlt</groupId>
    <artifactId>zlt-config</artifactId>
</dependency>
<!-- 公共通用组件 -->
<dependency>
    <groupId>com.zlt</groupId>
    <artifactId>zlt-common-spring-boot-starter</artifactId>
</dependency>
<!-- swagger -->
<dependency>
    <groupId>com.zlt</groupId>
    <artifactId>zlt-swagger2-spring-boot-starter</artifactId>
</dependency>
<!-- web依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- nacos服务注册发现 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
 

4.2. 数据库依赖（可选）
<!-- 数据库通用组件 -->
<dependency>
    <groupId>com.zlt</groupId>
    <artifactId>zlt-db-spring-boot-starter</artifactId>
</dependency>
<!-- mysql驱动 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
 

4.3. 缓存依赖（可选）
<!-- redis通用组件 -->
<dependency>
    <groupId>com.zlt</groupId>
    <artifactId>zlt-redis-spring-boot-starter</artifactId>
</dependency>
 

4.4. 服务调用依赖（可选）
<!-- 负载均衡通用组件(loadbalancer/feign) -->
<dependency>
    <groupId>com.zlt</groupId>
    <artifactId>zlt-loadbalancer-spring-boot-starter</artifactId>
</dependency>
 

4.5. 限流、降级、熔断依赖（可选）
<!-- 集成sentinel -->
<dependency>
    <groupId>com.zlt</groupId>
    <artifactId>zlt-sentinel-spring-boot-starter</artifactId>
</dependency>
 

4.6. 服务监控依赖（可选）
<!-- 暴露监控端点 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<!-- 集成prometheus -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
 

五、配置文件要怎么弄？
5.1. bootstrap.yml
在 src\main\resources 目录下新增一个 bootstrap.yml 文件：

server:
  port: {web端口}

spring:
  application:
    name: {服务名}
修改 web端口 与 服务名

 

5.2. application.yml
在 src\main\resources 目录下新增一个 application.yml 文件：

spring:
  #数据库配置
  datasource:
    url: jdbc:mysql://${zlt.datasource.ip}:3306/{数据库名}?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&useSSL=false&zeroDateTimeBehavior=convertToNull&serverTimezone=Asia/Shanghai
    username: ${zlt.datasource.username}
    password: ${zlt.datasource.password}
    driver-class-name: com.mysql.cj.jdbc.Driver

#mybatis-plus配置
mybatis-plus:
  mapper-locations: classpath:/mapper/*Mapper.xml
  typeAliasesPackage: {实体类model的包路径}

zlt:
  #多租户配置
  tenant:
    enable: true

#swagger配置
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
  api-docs:
    path: /v3/api-docs
  group-configs:
    - group: 'default'
      paths-to-match: '/**'
      packages-to-scan: {controller的包路径}
  default-flat-param-object: true

knife4j:
  enable: true
  setting:
    language: zh_cn
    swagger-model-name: {文档名称}
上面的配置样例为集成了 数据库、swagger、多租户功能。

数据库：数据库的相关配置取的统一配置的变量，需要修改 数据库名。
mybatis：确保 src\main\resources\mapper 文件夹存在，用于存放 mybatis 的 mapper 文件，需要修改 实体类model的包路径。
swagger：需要修改 文档名称、controller包路径。
多租户：默认关闭，关于多租户更多的配置项可参阅 TenantProperties.java 类；想了解架构设计与实现原理可参阅 多租户(应用隔离)。
 

六、哪些代码必需的？
6.1. 启动类增加的注解
@EnableDiscoveryClient
@EnableFeignInterceptor
@EnableFeignClients(basePackages = "com.central")
@SpringBootApplication
public class XXXApp {
    public static void main(String[] args) {
        SpringApplication.run(XXXApp.class, args);
    }
}
@EnableDiscoveryClient：开启服务注册发现
@EnableFeignInterceptor：开启 feign 拦截器，用于服务间参数传递
@EnableFeignClients：如果需要使用 feign 调用其他服务，则必需添加，并通过 basePackages 属性指定 feign 服务的包路径
@SpringBootApplication：Spring Boot 应用必需
 

6.2. 配置类
统一异常处理

@ControllerAdvice
public class ExceptionAdvice extends DefaultExceptionAdvice {
}