# Portal多租户业务系统登录和权限菜单模块PRD

## 1. 项目概述

### 1.1 项目背景
基于microservices-platform微服务框架，开发一个支持多租户的Portal业务系统，实现企业级的用户登录认证和基于岗位的权限菜单管理系统。

### 1.2 核心目标
- 支持多租户隔离的用户登录体系
- 实现基于岗位的权限控制（RBAC + 岗位权限）
- 提供动态菜单权限展示
- 支持用户岗位切换功能
- 保证数据安全和租户数据隔离

### 1.3 技术架构
- **前端**: portal-web (Vue.js/LayUI)
- **后端**: organization-service (Spring Boot微服务)
- **认证**: zlt-uaa (OAuth2 + JWT)
- **数据库**: MySQL 8.0 (central_organization)
- **网关**: zlt-gateway
- **注册中心**: Nacos

## 2. 需求分析与优化

### 2.1 原需求分析
基于原始需求文档 `loginprd.md`，核心需求包括：
1. Portal类型用户登录 (ACCOUNT_TYPE=portal)
2. 多租户支持和数据隔离
3. 基于岗位的权限控制
4. 动态菜单展示
5. 岗位切换功能

### 2.2 需求完善和优化

#### 2.2.1 增强用户体验
- **单点登录**: 支持多应用间的单点登录
- **记住登录**: 支持用户登录状态保持
- **密码策略**: 密码复杂度要求和定期更换
- **多因子认证**: 支持短信验证码等二次验证

#### 2.2.2 完善权限模型
- **数据权限**: 细化到字段级别的数据权限控制
- **时间权限**: 支持权限的时效性控制
- **审批权限**: 支持权限申请和审批流程
- **继承权限**: 支持权限的继承和委托机制

#### 2.2.3 优化系统架构
- **缓存策略**: Redis缓存提升性能
- **负载均衡**: 支持多实例部署
- **容错机制**: 服务降级和熔断保护
- **监控告警**: 完善的系统监控体系

## 3. 用户角色与权限模型

### 3.1 用户类型定义

#### 3.1.1 Portal用户特征
- **账户类型**: ACCOUNT_TYPE = "portal"
- **数据来源**: central_organization.users表
- **认证方式**: 用户名密码登录
- **权限基础**: 基于员工岗位的权限控制

#### 3.1.2 租户体系设计
```
租户层级结构:
├── 集团租户 (总公司)
│   ├── 子公司租户A  
│   ├── 子公司租户B
│   └── 分支机构租户C
```

### 3.2 权限模型设计

#### 3.2.1 RBAC + 岗位权限模型
```
权限控制层次:
用户 (User) 
  ↓ 
员工 (Employee)
  ↓
岗位 (WorkPosition) → 权限 (Permissions)
  ↓                    ↓
部门 (Department)      菜单权限 (Menu)
  ↓                    ↓  
租户 (Tenant)          功能权限 (Function)
                       ↓
                       数据权限 (Data)
```

#### 3.2.2 岗位权限类型
- **主管岗位**: 管理所属部门及下级部门
- **分管岗位**: 管理指定的分管部门  
- **专业岗位**: 特定业务领域的权限
- **普通岗位**: 基础操作权限

## 4. 功能需求详述

### 4.1 用户登录模块

#### 4.1.1 登录页面功能
- **登录方式**: 用户名密码登录
- **验证码**: 图形验证码防护
- **租户选择**: 支持多租户用户选择
- **记住登录**: 支持登录状态保持
- **密码找回**: 支持密码重置功能

#### 4.1.2 登录安全机制
- **登录限制**: 连续失败5次锁定账户
- **IP白名单**: 支持IP访问限制
- **设备绑定**: 支持设备授权管理
- **异地登录**: 异地登录安全提醒

#### 4.1.3 登录流程优化
```
登录流程:
1. 用户输入凭证 → 2. 基础验证 → 3. 账户检查 → 4. 权限加载
   ↓                ↓             ↓             ↓
   用户名/密码        验证码验证      账户状态       岗位权限
   租户选择          防暴力破解      租户权限       菜单权限
                                              ↓
5. Token生成 → 6. 登录成功 → 7. 跳转首页
   ↓             ↓             ↓
   JWT Token     用户信息缓存    权限菜单展示
```

### 4.2 权限菜单模块

#### 4.2.1 菜单权限计算
**权限计算逻辑**:
1. 获取用户员工信息 (employee_id)
2. 查询员工当前岗位 (position_id)  
3. 获取岗位配置权限 (menu_ids, menu_func_ids)
4. 查询岗位分管部门 (workposition_manage_dept)
5. 合并计算最终权限集合
6. 生成权限菜单树结构

#### 4.2.2 动态菜单展示
**菜单结构示例**:
```json
{
  "menus": [
    {
      "id": 1,
      "name": "组织管理",
      "path": "/organization", 
      "icon": "el-icon-office-building",
      "sort": 1,
      "children": [
        {
          "id": 11,
          "name": "部门管理",
          "path": "/organization/department",
          "icon": "el-icon-coordinate",
          "functions": ["view", "add", "edit", "delete"]
        },
        {
          "id": 12, 
          "name": "员工管理",
          "path": "/organization/employee", 
          "icon": "el-icon-user",
          "functions": ["view", "add", "edit"]
        }
      ]
    }
  ]
}
```

### 4.3 岗位切换功能

#### 4.3.1 切换场景
- **多岗位用户**: 一个员工可能担任多个岗位
- **代理岗位**: 临时代理其他岗位工作
- **权限变更**: 岗位调整后权限实时更新

#### 4.3.2 切换流程
```
岗位切换流程:
1. 查询可切换岗位 → 2. 选择目标岗位 → 3. 权限重新计算
   ↓                  ↓                ↓
   主岗位+副岗位        岗位验证          菜单权限
   代理岗位            权限检查          功能权限
                                      数据权限
                     ↓
4. 更新Token → 5. 刷新前端 → 6. 切换完成
   ↓            ↓             ↓
   新的岗位信息   菜单重新加载    操作日志记录
```

## 5. 核心接口设计

### 5.1 认证接口

#### 5.1.1 用户登录
```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&username=admin
&password=admin123  
&client_id=portal-web
&client_secret=portal-secret
&account_type=portal
&tenant_id=default
```

#### 5.1.2 获取用户信息
```http
GET /api-portal-org/user/current
Authorization: Bearer {access_token}

Response:
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "系统管理员",
    "employee": {
      "id": 1,
      "name": "张三",
      "empNo": "E001",
      "department": {"id": 1, "name": "技术部"},
      "currentPosition": {"id": 1, "name": "系统管理员"},
      "availablePositions": [
        {"id": 1, "name": "系统管理员", "current": true},
        {"id": 2, "name": "技术经理", "current": false}
      ]
    },
    "tenant": {
      "id": "default", 
      "name": "示例企业",
      "code": "DEMO"
    }
  }
}
```

### 5.2 权限菜单接口  

#### 5.2.1 获取当前用户菜单
```http
GET /api-portal-org/menus/current
Authorization: Bearer {access_token}

Response:
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "组织管理",
      "path": "/organization",
      "icon": "organization", 
      "sort": 1,
      "type": "menu",
      "children": [
        {
          "id": 11,
          "name": "部门管理",
          "path": "/organization/department", 
          "icon": "department",
          "sort": 1,
          "type": "page",
          "functions": [
            {"code": "view", "name": "查看"},
            {"code": "add", "name": "新增"},
            {"code": "edit", "name": "编辑"}, 
            {"code": "delete", "name": "删除"}
          ]
        }
      ]
    }
  ]
}
```

#### 5.2.2 岗位切换
```http
POST /api-portal-org/user/switch-position
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "positionId": 2,
  "reason": "临时代理工作"
}

Response: 
{
  "code": 200,
  "message": "岗位切换成功",
  "data": {
    "newAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "position": {
      "id": 2,
      "name": "技术经理", 
      "department": {"id": 1, "name": "技术部"}
    },
    "menus": [...] // 新的菜单权限
  }
}
```

## 6. 技术实现要点

### 6.1 后端实现关键点

#### 6.1.1 PortalUserDetailServiceImpl
```java
@Service  
public class PortalUserDetailServiceImpl implements ZltUserDetailsService {
    private static final String ACCOUNT_TYPE = "portal";
    
    @Override
    public boolean supports(String accountType) {
        return ACCOUNT_TYPE.equals(accountType);
    }
    
    @Override 
    public UserDetails loadUserByUsername(String username) {
        // 1. 从central_organization库查询用户
        // 2. 获取员工和岗位信息
        // 3. 计算权限集合
        // 4. 构建UserDetails对象
    }
}
```

#### 6.1.2 权限计算核心逻辑
```java
@Service
public class MenuPermissionService {
    
    /**
     * 获取用户菜单权限
     */
    public List<MenuVO> getCurrentUserMenus(Long userId) {
        // 1. 获取用户员工信息
        Employee employee = employeeService.getByUserId(userId);
        
        // 2. 获取当前岗位权限
        WorkPosition position = positionService.getById(employee.getPositionId());
        Set<Long> menuIds = parseMenuIds(position.getMenuIds());
        
        // 3. 获取分管部门权限
        List<Long> manageDeptIds = positionManageDeptService.getManagedDeptIds(position.getId());
        
        // 4. 合并权限并构建菜单树
        return buildMenuTree(menuIds);
    }
}
```

### 6.2 前端实现关键点

#### 6.2.1 权限路由守卫
```javascript
// router/index.js
router.beforeEach(async (to, from, next) => {
  const hasToken = getToken()
  
  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const hasPermission = await store.dispatch('permission/generateRoutes')
      if (hasPermission) {
        next()
      } else {
        next('/401')
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
    }
  }
})
```

#### 6.2.2 动态菜单组件
```vue
<!-- components/Sidebar/index.vue -->
<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    mode="vertical"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
  >
    <sidebar-item
      v-for="route in permission_routes"
      :key="route.path"
      :item="route"
      :base-path="route.path"
    />
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem },
  computed: {
    ...mapGetters(['permission_routes']),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    }
  }
}
</script>
```

## 7. 部署配置

### 7.1 数据库配置
```yaml
# organization-service application.yml
spring:
  datasource:
    dynamic:
      primary: organization
      datasource:
        organization:
          url: jdbc:mysql://127.0.0.1:3306/central_organization?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
          username: root
          password: lengfeng847
          driver-class-name: com.mysql.cj.jdbc.Driver
```

### 7.2 网关路由配置
```yaml
# zlt-gateway application.yml
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

## 8. 开发计划

### 8.1 第一阶段 (Week 1-2)
- [ ] 完成数据库设计和初始化
- [ ] 实现PortalUserDetailServiceImpl
- [ ] 完成基础认证功能

### 8.2 第二阶段 (Week 3-4)
- [ ] 实现权限菜单获取接口
- [ ] 完成前端登录页面
- [ ] 实现基础权限控制

### 8.3 第三阶段 (Week 5-6)
- [ ] 实现岗位切换功能
- [ ] 完成动态菜单展示
- [ ] 完成权限验证

### 8.4 第四阶段 (Week 7-8)
- [ ] 完善安全机制
- [ ] 完成测试用例
- [ ] 优化性能和体验

## 9. 总结

本PRD文档基于原始需求进行了全面的分析、完善和优化，主要改进包括：

1. **完善了业务逻辑**: 补充了登录安全、权限继承、审计日志等重要功能
2. **优化了技术架构**: 采用微服务架构，支持高并发和扩展性
3. **规范了接口设计**: 统一的API规范和数据格式
4. **强化了安全机制**: 多层次的安全防护和权限控制
5. **明确了实现方案**: 详细的技术实现要点和代码示例

通过本PRD的指导，可以高质量地完成Portal多租户业务系统的开发工作。 