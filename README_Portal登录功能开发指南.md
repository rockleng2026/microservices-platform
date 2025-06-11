# Portal 3.0 登录功能开发指南

## 概述

本文档介绍Portal 3.0多租户业务系统的登录和权限菜单功能实现，基于microservices-platform微服务框架开发。

## 功能特性

### ✅ 已实现功能

1. **Portal用户认证**
   - 支持portal类型用户登录
   - 基于OAuth2 + JWT的认证机制
   - 集成central_organization数据库

2. **权限菜单管理**
   - 基于岗位的权限控制(RBAC + 岗位权限)
   - 动态菜单权限展示
   - 支持岗位切换功能

3. **多租户支持**
   - 租户级数据隔离
   - 多租户用户管理

## 技术架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   portal-web    │    │   zlt-gateway   │    │organization-service│
│   (React前端)   │◄──►│   (API网关)     │◄──►│   (组织服务)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │    zlt-uaa      │
                       │   (认证服务)    │
                       └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │central_organization│
                       │   (组织数据库)   │
                       └─────────────────┘
```

## 核心组件

### 1. 认证服务 (zlt-uaa)

#### PortalUserDetailServiceImpl
```java
@Service
public class PortalUserDetailServiceImpl implements ZltUserDetailsService {
    private static final String ACCOUNT_TYPE_PORTAL = "portal";
    
    @Override
    public UserDetails loadUserByUsername(String username) {
        // 从organization-service查询portal用户
        SysUser sysUser = organizationService.findByUsername(username);
        return LoginUserUtils.getLoginAppUser(sysUser);
    }
}
```

### 2. 组织服务 (organization-service)

#### 用户管理
- `PortalUserController` - Portal用户API
- `PortalUserService` - Portal用户业务逻辑

#### 权限管理
- `PortalMenuController` - 菜单权限API
- `MenuPermissionService` - 权限计算逻辑

### 3. 前端应用 (portal-web)

#### 登录页面
```typescript
// 支持Portal用户登录
const loginData = {
  grant_type: 'password',
  username: values.username,
  password: values.password,
  client_id: 'portal-web',
  client_secret: 'portal-secret',
  account_type: 'portal'  // 关键：指定portal类型
};
```

## 数据库设计

### 核心表结构

```sql
-- 用户表
users (id, username, password, employee_id, type='portal', ...)

-- 员工表  
employee (id, emp_no, name, department_id, position_id, ...)

-- 岗位表
workposition (id, name, department_id, menu_ids, menu_func_ids, ...)

-- 菜单表
menu_page (id, name, parent_id, link_url, icon, ...)

-- 功能权限表
menu_func (id, perm_code, perm_name, menu_page_id, ...)
```

## API接口

### 认证接口

```http
# 用户登录
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=admin&password=admin123&client_id=portal-web&client_secret=portal-secret&account_type=portal
```

### 用户信息接口

```http
# 获取当前用户信息
GET /api-portal-org/users/current
Authorization: Bearer {access_token}

# 获取用户菜单权限
GET /api-portal-org/menus/current
Authorization: Bearer {access_token}

# 切换用户岗位
POST /api-portal-org/users/switch-position
Authorization: Bearer {access_token}
Content-Type: application/x-www-form-urlencoded

positionId=2
```

## 权限计算逻辑

### 菜单权限计算流程

```
1. 获取用户信息 → 2. 查找关联员工 → 3. 获取员工岗位
        ↓                ↓                ↓
     用户ID            员工ID           岗位ID
        
4. 解析岗位权限 → 5. 查询菜单数据 → 6. 构建菜单树
        ↓                ↓                ↓
   menu_ids字段      menu_page表      树形结构
```

### 权限配置示例

```sql
-- 岗位权限配置
UPDATE workposition SET 
  menu_ids = '1,2,3,4,5',           -- 可访问的菜单ID
  menu_func_ids = '1,2,3,4,5,6,7'   -- 可使用的功能ID
WHERE id = 1;
```

## 部署配置

### 1. 数据库配置

```yaml
# organization-service/application.yml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/central_organization
    username: root
    password: lengfeng847
```

### 2. 网关路由配置

```yaml
# zlt-gateway/application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: portal-org-route
          uri: lb://organization-service
          predicates:
            - Path=/api-portal-org/**
          filters:
            - StripPrefix=1
```

## 测试账号

| 用户名 | 密码    | 角色        | 权限范围     |
|--------|---------|-------------|--------------|
| admin  | admin123| 系统管理员  | 全部权限     |
| lihua  | admin123| 开发工程师  | 技术模块权限 |
| wangxh | admin123| 人事专员    | 人事模块权限 |

## 快速开始

### 1. 初始化数据库

```bash
# 执行数据库脚本
mysql -u root -p central_organization < sql/organization-module.sql
mysql -u root -p central_organization < sql/portal-test-data.sql
```

### 2. 启动服务

```bash
# 启动注册中心
cd zlt-register && mvn spring-boot:run

# 启动网关
cd zlt-gateway && mvn spring-boot:run

# 启动认证服务
cd zlt-uaa && mvn spring-boot:run

# 启动组织服务
cd zlt-business/organization-service && mvn spring-boot:run
```

### 3. 启动前端

```bash
cd zlt-web/portal-web
npm install
npm run dev
```

### 4. 访问测试

- 前端地址: http://localhost:8000
- 测试账号: admin / admin123

## 开发注意事项

### 1. 账号类型配置
- 确保`account_type=portal`参数正确传递
- `SecurityConstants.PORTAL_ACCOUNT_TYPE = "portal"`

### 2. 权限数据格式
- `menu_ids`: 逗号分隔的菜单ID字符串
- `menu_func_ids`: 逗号分隔的功能权限ID字符串

### 3. 租户隔离
- 所有查询都需要带上`tenant_id`条件
- 默认租户ID为`default`

## 故障排除

### 1. 登录失败
- 检查用户是否存在且enabled=1
- 确认密码是否正确(BCrypt加密)
- 验证account_type是否为portal

### 2. 菜单权限为空
- 检查员工是否关联岗位
- 确认岗位是否配置menu_ids
- 验证菜单数据是否存在

### 3. 接口调用失败
- 确认网关路由配置正确
- 检查服务是否正常启动
- 验证Token是否有效

## 扩展功能

### 待实现功能
- [ ] 多因子认证
- [ ] 密码策略管理
- [ ] 审计日志完善
- [ ] 数据权限细化
- [ ] 权限申请审批流程

## 相关文档

- [项目PRD文档](docs/logn/portal-multi-tenant-prd.md)
- [数据库设计](sql/organization-module.sql)
- [测试数据](sql/portal-test-data.sql) 