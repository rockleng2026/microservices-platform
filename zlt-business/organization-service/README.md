# 组织管理服务 (Organization Service)

## 概述

组织管理服务是一个基于Spring Boot的微服务，提供完整的企业组织架构管理功能，包括部门管理、员工管理、岗位管理等核心功能。支持多租户架构，可以灵活适配不同企业的组织架构需求。

## 核心功能

### 1. 部门管理 (Department Management)
- **树形结构管理**：支持无限层级的部门树形结构
- **部门信息维护**：部门名称、编号、负责人、联系方式等
- **部门级别管理**：支持设置部门级别，实现规范化管理
- **部门状态控制**：支持启用/禁用部门
- **批量操作**：支持批量删除、状态修改等
- **部门统计**：员工数量、岗位数量、性别比例、学历分布等
- **导入导出**：支持Excel批量导入导出
- **部门调整**：支持部门移动、复制结构等

### 2. 员工管理 (Employee Management)
- **完整个人信息**：基本信息、联系方式、教育背景、紧急联系人等
- **员工状态管理**：在职、试用期、离职等状态
- **员工生命周期**：入职、试用期管理、转正、调动、离职
- **雇佣类型管理**：全职、兼职、实习、外包等
- **统计分析**：员工分布统计、生日提醒、试用期到期提醒
- **批量操作**：批量导入、导出、删除等
- **数据验证**：工号、身份证、手机号、邮箱唯一性验证

### 3. 岗位管理 (Work Position Management)
- **岗位信息管理**：岗位名称、编号、级别、职责、要求等
- **人员配置管理**：最大人数限制、当前在岗人数统计
- **岗位级别体系**：初级、中级、高级、专家等级别
- **管理岗位标识**：区分管理岗位和普通岗位
- **薪资范围配置**：支持设置岗位薪资范围
- **岗位复制**：支持跨部门复制岗位配置
- **权限管理**：岗位权限配置（可扩展）

## 技术架构

### 后端技术栈
- **Spring Boot 2.7+**：微服务框架
- **MyBatis-Plus**：数据库ORM框架
- **MySQL 8.0+**：主数据库
- **Redis**：缓存和会话存储
- **Nacos**：服务注册与配置管理
- **Swagger**：API文档生成

### 数据库设计
- **多租户支持**：所有表都支持tenant_id字段
- **软删除机制**：使用deleted字段实现软删除
- **审计字段**：创建人、创建时间、更新人、更新时间
- **乐观锁**：使用version字段防止并发更新冲突

### 项目结构
```
organization-service/
├── src/main/java/com/central/organization/
│   ├── controller/          # REST API控制器
│   │   ├── DepartmentController.java
│   │   ├── EmployeeController.java
│   │   └── WorkPositionController.java
│   ├── service/            # 业务服务层
│   │   ├── DepartmentService.java
│   │   ├── EmployeeService.java
│   │   ├── WorkPositionService.java
│   │   └── impl/           # 服务实现类
│   ├── mapper/             # 数据访问层
│   │   ├── DepartmentMapper.java
│   │   ├── EmployeeMapper.java
│   │   └── WorkPositionMapper.java
│   ├── model/              # 实体类
│   │   ├── Department.java
│   │   ├── Employee.java
│   │   └── WorkPosition.java
│   ├── dto/                # 数据传输对象
│   └── OrganizationServiceApplication.java
├── src/main/resources/
│   ├── mapper/             # MyBatis XML映射文件
│   ├── application.yml     # 配置文件
│   └── bootstrap.yml       # 启动配置
└── README.md
```

## 配置说明

### 数据库配置
```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/central_organization
    username: root
    password: lengfeng847
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### Redis配置
```yaml
spring:
  redis:
    host: 127.0.0.1
    port: 6379
    password: 
    database: 0
```

### Nacos配置
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: public
      config:
        server-addr: 127.0.0.1:8848
        namespace: public
        file-extension: yml
```

## API文档

服务启动后，可以通过以下地址访问API文档：
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v2/api-docs

### 主要API端点

#### 部门管理
- `GET /api/organization/departments/tree` - 获取部门树
- `GET /api/organization/departments/page` - 分页查询部门
- `POST /api/organization/departments` - 创建部门
- `PUT /api/organization/departments/{id}` - 更新部门
- `DELETE /api/organization/departments/{id}` - 删除部门

#### 员工管理
- `GET /api/organization/employees/page` - 分页查询员工
- `GET /api/organization/employees/{id}` - 获取员工详情
- `POST /api/organization/employees` - 创建员工
- `PUT /api/organization/employees/{id}` - 更新员工
- `DELETE /api/organization/employees/{id}` - 删除员工

#### 岗位管理
- `GET /api/organization/positions/page` - 分页查询岗位
- `GET /api/organization/positions/{id}` - 获取岗位详情
- `POST /api/organization/positions` - 创建岗位
- `PUT /api/organization/positions/{id}` - 更新岗位
- `DELETE /api/organization/positions/{id}` - 删除岗位

## 权限控制

服务使用基于注解的权限控制：

### 部门权限
- `organization:department:view` - 查看部门
- `organization:department:add` - 新增部门
- `organization:department:edit` - 编辑部门
- `organization:department:delete` - 删除部门

### 员工权限
- `organization:employee:view` - 查看员工
- `organization:employee:add` - 新增员工
- `organization:employee:edit` - 编辑员工
- `organization:employee:delete` - 删除员工
- `organization:employee:transfer` - 员工调动
- `organization:employee:confirm` - 员工转正
- `organization:employee:resign` - 员工离职

### 岗位权限
- `organization:position:view` - 查看岗位
- `organization:position:add` - 新增岗位
- `organization:position:edit` - 编辑岗位
- `organization:position:delete` - 删除岗位

## 部署说明

### 1. 环境要求
- JDK 8+
- MySQL 8.0+
- Redis 3.0+
- Nacos 2.0+

### 2. 数据库初始化
执行SQL脚本初始化数据库：
```sql
-- 创建数据库
CREATE DATABASE central_organization DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 导入表结构和初始数据
source organization-module.sql;
```

### 3. 启动服务
```bash
# 编译打包
mvn clean package -DskipTests

# 启动服务
java -jar target/organization-service-1.0.jar

# 或使用Spring Boot Maven插件
mvn spring-boot:run
```

## 扩展功能

### 1. 待开发功能
- **Excel导入导出**：完善批量导入导出功能
- **组织架构图**：可视化组织架构展示
- **权限管理**：细粒度的功能权限管理
- **审计日志**：操作记录和审计追踪
- **数据同步**：与第三方HR系统数据同步

### 2. 性能优化
- **缓存策略**：Redis缓存热点数据
- **分页优化**：大数据量分页查询优化
- **索引优化**：数据库索引优化
- **异步处理**：批量操作异步处理

## 注意事项

1. **数据一致性**：部门、员工、岗位之间的关联关系需要保持一致性
2. **软删除**：删除操作均为软删除，便于数据恢复和审计
3. **权限验证**：所有API都需要进行权限验证
4. **多租户**：确保数据隔离，避免跨租户数据访问
5. **事务管理**：涉及多表操作的业务需要使用事务保证一致性

## 技术支持

如有问题或需要技术支持，请联系开发团队。 