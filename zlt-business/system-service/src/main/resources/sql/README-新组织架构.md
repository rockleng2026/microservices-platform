# Portal 3.0 组织架构初始化数据说明

## 设计理念

基于 `organization.md` 文档的设计思想，本数据初始化脚本实现了完整的权限体系：

**权限链路**：`用户` → `员工` → `部门/岗位` → `功能页面/功能点`

### 权限模型优势

1. **岗位化权限管理**：从"角色权限"转向"岗位权限"，更贴合企业实际组织结构
2. **精细化控制**：支持到具体功能点的权限控制
3. **动态权限切换**：员工可在多个岗位间切换权限
4. **分管权限体系**：支持岗位分管部门的权限设计

## 数据结构说明

### 1. 组织架构层次

```
Portal科技公司 (总部)
├── 技术研发部
│   ├── 后端开发组
│   ├── 前端开发组  
│   ├── 测试质量组
│   └── 运维支持组
├── 人力行政部
│   ├── 招聘培训组
│   ├── 薪酬绩效组
│   └── 行政后勤组
├── 市场销售部
├── 财务部
```

### 2. 权限设计模式

#### 权限存储方式
- `workposition.menu_ids`: 存储岗位可访问的菜单页面ID（逗号分隔）
- `workposition.menu_func_ids`: 存储岗位可执行的功能点ID（逗号分隔）  
- `workposition_manage_dept`: 岗位分管部门关系表

#### 权限传递链路
```
users (用户表)
  ↓ employee_id
employee (员工表)  
  ↓ position_id
workposition (岗位表)
  ↓ menu_ids, menu_func_ids
menu_page (菜单页面表) & menu_func (功能点表)
```

## 权限配置详情

### 菜单ID对应表
| ID | 菜单名称 | 路径 | 说明 |
|----|----------|------|------|
| 1 | 工作台 | /dashboard | 系统首页 |
| 2 | 组织架构 | /organization | 组织管理入口 |
| 3 | 部门管理 | /organization/department | 部门管理页面 |
| 4 | 员工管理 | /organization/employee | 员工管理页面 |
| 5 | 岗位管理 | /organization/position | 岗位管理页面 |
| 6 | CRM管理 | /crm | CRM管理入口 |
| 7 | 客户管理 | /crm/customer | 客户管理页面 |
| 8 | 产品管理 | /product | 产品管理页面 |
| 9 | 订单管理 | /order | 订单管理页面 |
| 10 | 系统管理 | /system | 系统管理页面 |

### 功能点ID对应表
| ID | 功能代码 | 功能名称 | 所属菜单 |
|----|----------|----------|----------|
| 1 | organization:dept:view | 查看部门 | 部门管理 |
| 2 | organization:dept:add | 新增部门 | 部门管理 |
| 3 | organization:dept:edit | 编辑部门 | 部门管理 |
| 4 | organization:dept:delete | 删除部门 | 部门管理 |
| 5 | organization:emp:view | 查看员工 | 员工管理 |
| 6 | organization:emp:add | 新增员工 | 员工管理 |
| 7 | organization:emp:edit | 编辑员工 | 员工管理 |
| 8 | organization:emp:delete | 删除员工 | 员工管理 |
| 9 | organization:pos:view | 查看岗位 | 岗位管理 |
| 10 | organization:pos:add | 新增岗位 | 岗位管理 |
| 11 | organization:pos:edit | 编辑岗位 | 岗位管理 |
| 12 | organization:pos:delete | 删除岗位 | 岗位管理 |
| 13 | organization:pos:permission | 配置权限 | 岗位管理 |

### 典型岗位权限配置

**总经理 (ID:1)**：
- 菜单权限：`1,2,3,4,5,6,7,8,9,10` (全部菜单)
- 功能权限：`1,2,3,4,5,6,7,8,9,10,11,12,13` (全部功能)

**技术总监 (ID:3)**：
- 菜单权限：`1,2,3,4,5,8,10` (工作台+组织架构+产品管理+系统管理)
- 功能权限：`1,2,3,4,5,6,7,8,9,10,11,12,13` (组织架构完整权限)

**开发经理 (ID:5)**：
- 菜单权限：`1,2,4,5,8` (工作台+员工管理+岗位管理+产品管理)
- 功能权限：`1,5,6,7,9,10,11` (查看部门+员工管理+岗位管理)

**高级开发工程师 (ID:6)**：
- 菜单权限：`1,8` (工作台+产品管理)
- 功能权限：`1,5,9` (查看部门+查看员工+查看岗位)

## 示例账号说明

### 管理层账号
| 用户名 | 密码 | 姓名 | 岗位 | 权限范围 |
|--------|------|------|------|----------|
| admin | 123456 | 张伟强 | 总经理 | 全系统权限 |
| vp001 | 123456 | 李雅芳 | 副总经理 | 大部分管理权限 |

### 技术团队账号  
| 用户名 | 密码 | 姓名 | 岗位 | 权限范围 |
|--------|------|------|------|----------|
| cto001 | 123456 | 王建华 | 技术总监 | 技术部门管理权限 |
| arch001 | 123456 | 陈明亮 | 高级架构师 | 技术查看权限 |
| dev001 | 123456 | 刘华强 | 后端开发经理 | 开发团队管理 |
| dev002 | 123456 | 赵敏 | 高级后端工程师 | 基础开发权限 |
| dev003 | 123456 | 周杰 | 中级后端工程师 | 基础开发权限 |

### HR团队账号
| 用户名 | 密码 | 姓名 | 岗位 | 权限范围 |
|--------|------|------|------|----------|  
| hr001 | 123456 | 林雪梅 | HR总监 | HR完整权限 |
| hr002 | 123456 | 吴佳怡 | 招聘经理 | 招聘管理权限 |
| hr003 | 123456 | 许文静 | 招聘专员 | 招聘执行权限 |

### 销售团队账号
| 用户名 | 密码 | 姓名 | 岗位 | 权限范围 |
|--------|------|------|------|----------|
| sales001 | 123456 | 郑志强 | 销售总监 | 销售管理权限 |
| sales002 | 123456 | 钟辉 | 销售经理 | 销售执行权限 |

### 财务团队账号
| 用户名 | 密码 | 姓名 | 岗位 | 权限范围 |
|--------|------|------|------|----------|
| fin001 | 123456 | 冯建国 | 财务总监 | 财务管理权限 |
| fin002 | 123456 | 邓秀珍 | 财务经理 | 财务核算权限 |

## 权限验证逻辑

### 后端权限验证
```java
// 获取用户当前岗位权限
public boolean hasPermission(Long userId, String permissionCode) {
    // 1. 通过用户ID获取员工信息
    Employee employee = getEmployeeByUserId(userId);
    
    // 2. 获取员工主岗位
    WorkPosition position = getWorkPositionById(employee.getPositionId());
    
    // 3. 检查岗位功能权限
    String[] funcIds = position.getMenuFuncIds().split(",");
    
    // 4. 查询功能点权限代码
    List<MenuFunc> functions = getMenuFuncsByIds(funcIds);
    
    // 5. 验证权限代码
    return functions.stream()
        .anyMatch(func -> func.getPermCode().equals(permissionCode));
}
```

### 前端菜单渲染
```javascript
// 获取用户菜单权限
async function getUserMenus(userId) {
    // 1. 获取用户岗位信息
    const position = await getCurrentUserPosition(userId);
    
    // 2. 解析菜单ID
    const menuIds = position.menuIds.split(',').map(id => parseInt(id));
    
    // 3. 获取可访问的菜单
    const menus = await getMenusByIds(menuIds);
    
    // 4. 构建菜单树
    return buildMenuTree(menus);
}
```

## 分管部门关系

**总经理**：直管所有二级部门 (技术研发部、人力行政部、市场销售部、财务部)

**副总经理**：协管主要业务部门 (技术研发部、人力行政部、市场销售部)

**技术总监**：直管技术子部门 (后端开发组、前端开发组、测试质量组、运维支持组)

**各部门经理**：直管各自负责的部门

## 使用方法

### 1. 执行顺序

```bash
# 1. 先执行基础表结构 (如果还未执行)
source /path/to/organization-module.sql

# 2. 执行组织架构初始化数据
source /path/to/organization-init-data.sql
```

### 2. 验证数据

执行脚本后，会自动显示数据统计：

```sql
-- 组织架构概览
SELECT 
    '=== 组织架构概览 ===' as info,
    部门总数, 岗位总数, 员工总数, 用户总数;

-- 权限配置概览  
SELECT 
    '=== 权限配置概览 ===' as info,
    已配置菜单权限岗位数, 已配置功能权限岗位数, 岗位分管关系数;

-- 管理岗位统计
SELECT 
    '=== 管理岗位统计 ===' as info,
    领导岗位数, 主管岗位数;
```

### 3. 登录测试

推荐测试账号：
- **管理员**：admin / 123456 (全权限)
- **技术管理**：cto001 / 123456 (技术权限)  
- **HR管理**：hr001 / 123456 (HR权限)
- **开发人员**：dev002 / 123456 (基础权限)

## 扩展指南

### 1. 添加新部门

```sql
-- 添加新部门
INSERT INTO department (name, parent_id, dep_no, grade_id, description, tenant_id) 
VALUES ('新部门', 父部门ID, '部门编号', 等级, '部门描述', 'default');
```

### 2. 添加新岗位

```sql  
-- 添加新岗位
INSERT INTO workposition (name, department_id, job_description, menu_ids, menu_func_ids, tenant_id)
VALUES ('新岗位', 部门ID, '岗位描述', '1,2,3', '1,5,9', 'default');
```

### 3. 修改岗位权限

```sql
-- 修改岗位菜单权限
UPDATE workposition 
SET menu_ids = '1,2,3,4', menu_func_ids = '1,2,3,5,6,7,9'
WHERE id = 岗位ID AND tenant_id = 'default';
```

### 4. 添加新员工

```sql
-- 添加员工信息
INSERT INTO employee (emp_no, name, department_id, position_id, ...)
VALUES ('EMP20240XXX', '姓名', 部门ID, 岗位ID, ...);

-- 创建登录账号
INSERT INTO users (username, password, employee_id, tenant_id)
VALUES ('username', '$2a$10$加密密码', 员工ID, 'default');
```

## 数据特点

### 1. 真实性
- 员工信息：真实的中文姓名、合理的年龄分布
- 组织结构：符合中型科技公司的实际组织架构
- 岗位设置：涵盖技术、管理、支持等各类岗位

### 2. 完整性  
- 权限体系：从查看到删除的完整权限点
- 分管关系：体现企业的实际管理层级
- 数据关联：所有关联表数据完整对应

### 3. 可扩展性
- 支持多租户隔离
- 预留扩展字段
- 灵活的权限配置

## 注意事项

1. **密码安全**：所有演示账号密码均为 `123456`，生产环境请及时修改
2. **数据隔离**：所有数据基于 `tenant_id = 'default'` 进行隔离
3. **权限验证**：建议在前端和后端都进行权限验证
4. **审计日志**：所有权限变更操作都应记录审计日志
5. **权限字段**：workposition表中的menu_ids和menu_func_ids字段存储的是逗号分隔的ID字符串

---

**版本**：v1.1  
**创建时间**：2024-12-19  
**维护人员**：系统架构组 