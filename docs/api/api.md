# API 接口文档

## 1. 获取当前用户菜单权限

### 接口概述

获取当前登录用户的菜单权限信息，返回用户可访问的菜单列表及其层级结构。

### 请求信息

#### 基本信息

| 项目 | 说明 |
|------|------|
| 请求URL | `{{BASE_URL}}/api-portal/menus/current` |
| 请求方法 | `GET` |
| 内容类型 | `application/json` |

#### 请求头部

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | 用户认证token信息 |
| x-tenant-header | string | 是 | 租户信息 |

#### 请求参数

无

### 响应信息

#### 成功响应

**HTTP状态码:** 200

**响应格式:**

```json
{
    "datas": [
        {
            "path": "/dashboard",
            "component": "/dashboard",
            "visible": true,
            "functions": [],
            "children": [],
            "sortOrder": 1,
            "name": "工作台",
            "icon": "dashboard",
            "tenantId": "default",
            "id": 1,
            "parentId": 0,
            "enabled": true
        }
    ],
    "resp_code": 0,
    "resp_msg": "获取菜单权限成功"
}
```

#### 响应字段说明

##### 根级字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| datas | array | 菜单数据列表 |
| resp_code | integer | 响应状态码，0表示成功 |
| resp_msg | string | 响应消息 |

##### 菜单对象字段（datas数组元素）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 菜单唯一标识 |
| parentId | integer | 父菜单ID，0表示顶级菜单 |
| name | string | 菜单名称 |
| path | string | 菜单路径 |
| component | string | 菜单对应的组件路径 |
| icon | string | 菜单图标 |
| sortOrder | integer | 排序号 |
| visible | boolean | 是否可见 |
| enabled | boolean | 是否启用 |
| tenantId | string | 租户ID |
| functions | array | 功能权限列表 |
| children | array | 子菜单列表，结构与父菜单相同 |

#### 完整响应示例

```json
{
    "datas": [
        {
            "path": "/dashboard",
            "component": "/dashboard",
            "visible": true,
            "functions": [],
            "children": [],
            "sortOrder": 1,
            "name": "工作台",
            "icon": "dashboard",
            "tenantId": "default",
            "id": 1,
            "parentId": 0,
            "enabled": true
        },
        {
            "path": "/organization",
            "component": "/organization",
            "visible": true,
            "functions": [],
            "children": [
                {
                    "path": "/organization/department",
                    "component": "/organization/department",
                    "visible": true,
                    "functions": [],
                    "children": [],
                    "sortOrder": 1,
                    "name": "部门管理",
                    "icon": "apartment",
                    "tenantId": "default",
                    "id": 3,
                    "parentId": 2,
                    "enabled": true
                },
                {
                    "path": "/organization/employee",
                    "component": "/organization/employee",
                    "visible": true,
                    "functions": [],
                    "children": [],
                    "sortOrder": 2,
                    "name": "员工管理",
                    "icon": "user",
                    "tenantId": "default",
                    "id": 4,
                    "parentId": 2,
                    "enabled": true
                },
                {
                    "path": "/organization/position",
                    "component": "/organization/position",
                    "visible": true,
                    "functions": [],
                    "children": [],
                    "sortOrder": 3,
                    "name": "岗位管理",
                    "icon": "contacts",
                    "tenantId": "default",
                    "id": 5,
                    "parentId": 2,
                    "enabled": true
                }
            ],
            "sortOrder": 2,
            "name": "组织架构",
            "icon": "team",
            "tenantId": "default",
            "id": 2,
            "parentId": 0,
            "enabled": true
        },
        {
            "path": "/crm",
            "component": "/crm",
            "visible": true,
            "functions": [],
            "children": [
                {
                    "path": "/crm/customer",
                    "component": "/crm/customer",
                    "visible": true,
                    "functions": [],
                    "children": [],
                    "sortOrder": 1,
                    "name": "客户管理",
                    "icon": "contacts",
                    "tenantId": "default",
                    "id": 7,
                    "parentId": 6,
                    "enabled": true
                }
            ],
            "sortOrder": 3,
            "name": "CRM管理",
            "icon": "user-group",
            "tenantId": "default",
            "id": 6,
            "parentId": 0,
            "enabled": true
        },
        {
            "path": "/product",
            "component": "/product",
            "visible": true,
            "functions": [],
            "children": [],
            "sortOrder": 4,
            "name": "产品管理",
            "icon": "box",
            "tenantId": "default",
            "id": 8,
            "parentId": 0,
            "enabled": true
        },
        {
            "path": "/order",
            "component": "/order",
            "visible": true,
            "functions": [],
            "children": [],
            "sortOrder": 5,
            "name": "订单管理",
            "icon": "file-text",
            "tenantId": "default",
            "id": 9,
            "parentId": 0,
            "enabled": true
        },
        {
            "path": "/system",
            "component": "/system",
            "visible": true,
            "functions": [],
            "children": [],
            "sortOrder": 6,
            "name": "系统管理",
            "icon": "settings",
            "tenantId": "default",
            "id": 10,
            "parentId": 0,
            "enabled": true
        }
    ],
    "resp_code": 0,
    "resp_msg": "获取菜单权限成功"
}
```

#### 错误响应

暂无具体错误响应示例。

### 使用说明

1. 该接口需要用户已登录并提供有效的认证token
2. 租户信息必须在请求头中提供
3. 返回的菜单数据按照 `sortOrder` 字段进行排序
4. 菜单具有层级结构，通过 `parentId` 和 `children` 字段体现父子关系
5. `visible` 和 `enabled` 字段控制菜单的显示和可用状态

### 注意事项

- 所有请求必须携带有效的 Authorization 头部
- 租户信息（x-tenant-header）是必需的，用于多租户环境下的数据隔离
- 菜单权限基于当前登录用户的角色和权限设置

---

## 2. 获取当前用户信息

### 接口概述

获取当前登录用户的详细信息，包括用户基本信息、员工信息、职位信息、个人配置和租户信息。

### 请求信息

#### 基本信息

| 项目 | 说明 |
|------|------|
| 请求URL | `{{BASE_URL}}/api-portal/users/current` |
| 请求方法 | `GET` |
| 内容类型 | `application/json` |

#### 请求头部

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | 用户认证token信息 |
| x-tenant-header | string | 是 | 租户信息 |

#### 请求参数

无

### 响应信息

#### 成功响应

**HTTP状态码:** 200

**响应格式:**

```json
{
    "datas": {
        "id": 1,
        "username": "admin",
        "nickname": "张总",
        "mobile": "13800001001",
        "sex": 1,
        "enabled": true,
        "type": "portal",
        "employeeId": 1,
        "tenantId": "default",
        "employee": {
            "id": "1",
            "empNo": "EMP20240001",
            "name": "张伟强",
            "departmentName": "Portal科技公司",
            "positionName": "总经理"
        },
        "tenant": {
            "code": "PORTAL",
            "name": "Portal企业",
            "id": "default"
        }
    },
    "resp_code": 0,
    "resp_msg": "获取用户信息成功"
}
```

#### 响应字段说明

##### 根级字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| datas | object | 用户数据对象 |
| resp_code | integer | 响应状态码，0表示成功 |
| resp_msg | string | 响应消息 |

##### 用户对象字段（datas）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 用户唯一标识 |
| createTime | string | 创建时间 |
| updateTime | string | 更新时间 |
| username | string | 用户名 |
| password | string | 加密后的密码 |
| nickname | string | 用户昵称 |
| headImgUrl | string | 头像URL |
| mobile | string | 手机号码 |
| sex | integer | 性别（1-男，0-女） |
| enabled | boolean | 是否启用 |
| type | string | 用户类型 |
| openId | string | 第三方openId |
| creatorId | integer | 创建人ID |
| employeeId | integer | 员工ID |
| tenantId | string | 租户ID |
| employee | object | 员工信息对象 |
| positions | array | 职位列表 |
| currentPosition | object | 当前职位信息 |
| personalConfig | object | 个人配置信息 |
| tenant | object | 租户信息 |
| del | boolean | 是否删除 |

##### 员工对象字段（employee）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 员工ID |
| empNo | string | 员工编号 |
| name | string | 员工姓名 |
| nameEn | string | 英文姓名 |
| birthDate | string | 出生日期 |
| gender | integer | 性别（1-男，0-女） |
| idCard | string | 身份证号 |
| mobile | string | 手机号 |
| email | string | 邮箱 |
| departmentId | string | 部门ID |
| departmentName | string | 部门名称 |
| positionId | string | 职位ID |
| positionName | string | 职位名称 |
| gradeId | string | 级别ID |
| employmentType | integer | 雇佣类型 |
| employmentStatus | integer | 雇佣状态 |
| entryDate | string | 入职日期 |
| education | string | 学历 |
| leaveDate | string | 离职日期 |
| leaveReason | string | 离职原因 |
| probation | boolean | 是否试用期 |
| active | boolean | 是否活跃 |

##### 职位对象字段（positions数组元素/currentPosition）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 职位ID |
| name | string | 职位名称 |
| shortName | string | 职位简称 |
| departmentId | integer | 部门ID |
| positionLevel | integer | 职位级别 |
| jobDescription | string | 职位描述 |
| requirements | string | 职位要求 |
| salaryRange | string | 薪资范围 |
| maxEmployees | integer | 最大员工数 |
| menuIds | string | 菜单权限ID列表 |
| menuFuncIds | string | 菜单功能权限ID列表 |
| isManager | boolean | 是否管理岗 |
| isDirector | boolean | 是否主管岗 |
| sortOrder | integer | 排序号 |

##### 个人配置对象字段（personalConfig）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 配置ID |
| userId | integer | 用户ID |
| defaultPositionId | integer | 默认职位ID |
| theme | string | 主题设置 |
| layoutConfig | string | 布局配置（JSON字符串） |
| language | string | 语言设置 |
| timezone | string | 时区设置 |
| homePage | string | 首页路径 |
| notificationConfig | string | 通知配置（JSON字符串） |
| extendConfig | string | 扩展配置（JSON字符串） |
| enabled | boolean | 是否启用 |

##### 租户对象字段（tenant）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 租户ID |
| code | string | 租户代码 |
| name | string | 租户名称 |

#### 完整响应示例

```json
{
    "datas": {
        "id": 1,
        "createTime": "2025-06-10T06:58:46.000+00:00",
        "updateTime": "2025-06-10T06:58:46.000+00:00",
        "username": "admin",
        "password": "{bcrypt}$2a$10$TtxVJn2ut/IlJqbmkkuR0uoYoqeQX0wVF2t5MDrh.OiACzDymTuxi",
        "nickname": "张总",
        "headImgUrl": null,
        "mobile": "13800001001",
        "sex": 1,
        "enabled": true,
        "type": "portal",
        "openId": null,
        "creatorId": null,
        "roles": null,
        "roleId": null,
        "oldPassword": null,
        "newPassword": null,
        "permissions": null,
        "employeeId": 1,
        "tenantId": "default",
        "company": null,
        "employee": {
            "id": "1",
            "empNo": "EMP20240001",
            "name": "张伟强",
            "nameEn": "Zhang Weiqiang",
            "birthDate": "1975-03-14",
            "gender": 1,
            "idCard": "110101197503156789",
            "mobile": "13800001001",
            "email": "zhangwq@portal.com",
            "departmentId": "1",
            "departmentName": "Portal科技公司",
            "positionId": "1",
            "positionName": "总经理",
            "gradeId": "10",
            "employmentType": 1,
            "employmentStatus": 1,
            "entryDate": "2019-12-31",
            "education": "硕士",
            "delflag": 0,
            "leaveDate": null,
            "leaveReason": null,
            "tenantId": "default",
            "createdAt": "2025-06-10 14:58:46",
            "updatedAt": "2025-06-10 14:58:46",
            "createdBy": null,
            "updatedBy": null,
            "probation": false,
            "employmentTypeName": "正式员工",
            "employmentStatusName": "在职",
            "genderName": "男",
            "active": true
        },
        "positions": [
            {
                "id": 1,
                "name": "总经理",
                "shortName": "总经理",
                "departmentId": 1,
                "positionLevel": 1,
                "jobDescription": "负责公司整体战略规划和经营管理",
                "requirements": "10年以上管理经验，具备战略思维",
                "salaryRange": "面议",
                "maxEmployees": 1,
                "menuIds": "1,2,3,4,5,6,7,8,9,10",
                "menuFuncIds": "1,2,3,4,5,6,7,8,9,10,11,12,13",
                "isManager": true,
                "isDirector": true,
                "sortOrder": 1,
                "tenantId": "default",
                "createdAt": "2025-06-10 14:58:46",
                "updatedAt": "2025-06-10 14:58:46",
                "createdBy": null,
                "updatedBy": null
            }
        ],
        "currentPosition": {
            "id": 1,
            "name": "总经理",
            "shortName": "总经理",
            "departmentId": 1,
            "positionLevel": 1,
            "jobDescription": "负责公司整体战略规划和经营管理",
            "requirements": "10年以上管理经验，具备战略思维",
            "salaryRange": "面议",
            "maxEmployees": 1,
            "menuIds": "1,2,3,4,5,6,7,8,9,10",
            "menuFuncIds": "1,2,3,4,5,6,7,8,9,10,11,12,13",
            "isManager": true,
            "isDirector": true,
            "sortOrder": 1,
            "tenantId": "default",
            "createdAt": "2025-06-10 14:58:46",
            "updatedAt": "2025-06-10 14:58:46",
            "createdBy": null,
            "updatedBy": null
        },        
        "personalConfig": {
            "id": 1,
            "userId": 1,
            "defaultPositionId": 1,
            "theme": "light",
            "layoutConfig": "{\"sidebarCollapsed\": false, \"showBreadcrumb\": true}",
            "language": "zh-CN",
            "timezone": "Asia/Shanghai",
            "homePage": "/dashboard",
            "notificationConfig": "{\"email\": true, \"push\": true, \"sms\": false}",
            "extendConfig": "{}",
            "enabled": true,
            "tenantId": "default",
            "createdAt": "2025-06-11 23:19:13",
            "updatedAt": "2025-06-11 23:19:13",
            "createdBy": 1,
            "updatedBy": 1
        },
        "tenant": {
            "code": "PORTAL",
            "name": "Portal企业",
            "id": "default"
        },
        "del": false
    },
    "resp_code": 0,
    "resp_msg": "获取用户信息成功"
}
```

#### 错误响应

暂无具体错误响应示例。

### 使用说明

1. 该接口需要用户已登录并提供有效的认证token
2. 租户信息必须在请求头中提供
3. 返回的用户信息包含完整的员工档案、职位权限和个人配置
4. 密码字段已加密，不会返回明文密码
5. 个人配置中的 `layoutConfig`、`notificationConfig`、`extendConfig` 字段为JSON字符串格式

### 注意事项

- 所有请求必须携带有效的 Authorization 头部
- 租户信息（x-tenant-header）是必需的，用于多租户环境下的数据隔离
- 用户信息基于当前登录用户的session获取
- 敏感信息（如密码）已进行加密处理
- 员工信息包含完整的组织架构关系 