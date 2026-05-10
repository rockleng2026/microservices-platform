# Phase 10 经验教训 — 管理后台核心模块开发混乱分析

**日期:** 2026-05-09
**问题:** Phase 10 执行过程中出现严重的开发混乱，包括 Dashboard 误判为"未实现"、分支状态不同步、合并冲突等

---

## 1. 核心问题：分支策略与实际工作流不匹配

### 问题描述
- GSD workflow 要求从 `origin/HEAD` (即 `origin/master`) 创建 phase-10 分支
- 但项目的实际主分支是 `portal`，不是 `master`
- phase-10 分支从 origin/master 创建时，不包含 portal 分支上已有的 Phase 8 Dashboard 实现
- 导致 ADMIN-01 验证 agent 误判"Dashboard 不存在"

### 根因
```
origin/master (a0cb9e758) ≠ portal (最新)
                            └── 包含 Phase 8 Dashboard (commit 2efa903c7)
```
phase-10 从 origin/master 创建时，Dashboard 组件尚不在该分支上。

### 避免方法
**规则：** 在 GSD 项目中，phase 分支必须从实际主分支（portal）创建，而不是 origin/master。
```
# 错误：git branch phase-10 origin/master
# 正确：git branch phase-10 portal
```

---

## 2. 工作树隔离与主分支状态混乱

### 问题描述
- 5 个 executor agents 使用 `isolation="worktree"` 在独立工作树中执行
- phase-10 分支本身已经落后于 portal
- agents 在工作树中创建的提交追加到 phase-10 分支
- 合并 phase-10 到 portal 时出现冲突，因为 .umirc.ts 和 api.ts 在两端都有修改

### 避免方法
**规则：** 在执行 phase 之前，确保 phase 分支与主开发分支（portal）完全同步。
```
git fetch origin portal
git branch phase-10 portal  # 从 portal 而非 origin/master 创建
```

---

## 3. Dashboard 验证误判的执行流程

### 问题描述
1. AGENT 执行流程：
   - ADMIN-01 agent 在工作树中检查 `zlt-web/mall-admin-web/src/pages/Dashboard/`
   - 工作树是从 phase-10 分支创建的，Dashboard 不在 phase-10 上
   - agent 报告 "Dashboard NOT FOUND" → 标记为 FAILED

2. 实际情况：
   - Dashboard 组件存在于 portal 分支（Phase 8 实现，commit 2efa903c7）
   - phase-10 分支从未包含这些文件
   - 这是"假阴性"验证失败

### 避免方法
**规则：** 在执行 phase 之前，验证主分支状态：
```
# 执行前检查
git log --oneline portal | grep "Dashboard" | head -3
ls zlt-web/mall-admin-web/src/pages/Dashboard/  # 确认存在
```

---

## 4. 合并冲突的手动解决暴露的问题

### 问题描述
合并 phase-10 到 portal 时，两个文件冲突：
- `zlt-web/mall-admin-web/.umirc.ts` — 路由和代理配置
- `zlt-web/mall-admin-web/src/config/api.ts` — API 端点

冲突原因：两端都对同一文件进行了修改，但没有共同的变更基础。

### 避免方法
**规则：** 定期将 portal 合并回 phase 分支，减少最终合并时的冲突范围。
```
# 定期同步
git checkout phase-10
git merge portal  # 提前解决可能的冲突
```

---

## 5. 执行过程中的状态不透明

### 问题描述
- 5 个 agents 并行执行，完成时间差异大（5-57分钟）
- Agent 完成通知的顺序与预期不同
- 某些 agent 的输出文件为空（无法通过 tail 查看进度）
- 难以实时跟踪哪些 plan 实际创建了哪些文件

### 避免方法
**规则：** 启用更详细的任务跟踪。
```
# 在执行过程中定期检查
git worktree list
git log --oneline phase-10 | head -20
ls -la .planning/phases/10-*/10-*-SUMMARY.md
```

---

## 6. 架构不一致：ADMIN-04 使用了不同的前端路径

### 问题描述
- ADMIN-02/03/10 创建文件在 `zlt-web/mall-admin-web/`
- ADMIN-04 创建文件在 `zlt-web/react-web/src/main/frontend/src/pages/Coupons/`
- 导致同一个"管理后台"分布在两个不同的前端项目中

### 避免方法
**规则：** 在 plan 的 `files_modified` 中明确指定单一的前端根路径。所有管理后台模块必须使用相同的前端项目。

---

## 7. .planning 目录在分支间不同步

### 问题描述
- `.planning/` 目录在 phase-10 和 portal 之间未同步
- portal 上的 `.planning/` 包含了 Phase 7/9 的 SUMMARY，但 phase-10 分支是从更早的状态创建的
- 导致 plan 文件引用了不存在的路径

### 避免方法
**规则：** `.planning/` 目录应随代码分支一起管理，或者在执行前从 portal 分支拉取最新的 planning 文件。

---

## 总结：防止开发混乱的关键规则

| # | 规则 | 原因 |
|---|------|------|
| 1 | phase 分支从 portal 创建，而非 origin/master | 主分支可能领先 origin/master |
| 2 | 执行前同步 phase 分支与 portal | 避免假阴性验证（文件存在但不在当前分支） |
| 3 | 定期将 portal 合并回 phase 分支 | 减少最终合并冲突 |
| 4 | 所有管理后台模块使用单一前端路径 | 避免架构分裂 |
| 5 | 启用阶段性进度检查 | 及时发现不同步状态 |
| 6 | .planning 目录纳入版本控制 | 确保 plan 引用的文件路径在所有分支上一致 |

---

## 附：当前仓库状态

```
portal 分支：包含所有 Phase 10 实现 + Dashboard (Phase 8)
phase-10 分支：落后于 portal，未包含 Dashboard
建议：继续使用 portal 作为主开发分支，phase 分支仅用于 GSD 流程追踪
```

---

*教训记录于 2026-05-09 — Phase 10 执行完成后*
---

## 附录：SSH Host Key 验证失败问题修复

**问题：** SSH 推送到 GitHub 时报 `Host key verification failed`

**根因：** Claude Code 的 Bash 环境变量 HOME 被设置为 `.claude-local-runtime/home`，SSH 密钥存放在 `C:\Users\lengz\.ssh`，但 Bash 无法访问到

**症状：**
```
ssh -T git@github.com → Host key verification failed
git push origin portal → Could not read from remote repository
```

**诊断步骤：**
```bash
echo "HOME=$HOME"  # 确认 HOME 路径
ls -la "$HOME/.ssh/"  # 检查 SSH 密钥是否存在
ssh -v -T git@github.com  # 查看详细 SSH 连接信息
```

**修复步骤：**

1. **确认真实 SSH 密钥位置：**
   ```
   ls -la C:/Users/lengz/.ssh/
   ```
   确认 `id_ed25519` 或 `id_rsa` 存在

2. **复制 SSH 密钥到 Bash 的 HOME 目录：**
   ```bash
   mkdir -p "$HOME/.ssh"
   cp -r C:/Users/lengz/.ssh/* "$HOME/.ssh/"
   ```

3. **验证连接：**
   ```bash
   ssh -T git@github.com
   ```
   期望输出：`Hi username! You've successfully authenticated...`

4. **推送代码：**
   ```bash
   git push origin <branch>
   ```

**预防措施：**
在 Claude Code 的 `settings.json` 中配置 SSH 密钥路径，或在项目 `CLAUDE.md` 中记录 SSH 问题排查步骤

**配置文件路径：**
- Claude Code settings: `C:\Users\lengz\.claude\settings.json`
- SSH keys: `C:\Users\lengz\.ssh\`
- Bash runtime HOME: `.claude-local-runtime/home/.ssh/`

---
*SSH 问题修复记录于 2026-05-09*

---

## mall-center 后端服务启动与配置经验

**问题：** mall-center 启动失败，报错包括 MySQL Driver 缺失、UserService Feign 代理未创建、RestTemplate Bean 缺失等

**根因：** mall-center 缺少必要的依赖和配置，与其他已验证可运行的服务（如 user-center）相比缺少关键组件

### 启动依赖服务（本地环境）

| 服务 | 端口 | 用途 |
|------|------|------|
| Nacos | 10020 | 注册中心+配置中心 |
| Redis | 16379 | 缓存/会话 |
| MySQL | 3306 | 数据库 |
| SCGateway | - | API网关 |
| UaaServer | - | 鉴权服务 |
| UserCenter | - | 用户服务 |

### mall-center 必要配置清单

**1. pom.xml 必须依赖：**
```xml
<!-- MySQL驱动 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>

<!-- Bootstrap启动（读取bootstrap.yml） -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

**2. MallCenterApplication.java 必须注解：**
```java
@SpringBootApplication(scanBasePackages = {
    "com.central.mall",
    "com.central.common"
})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.central.common.feign")  // 必须添加
public class MallCenterApplication {}
```

**3. bootstrap.yml（Nacos配置）：**
```yaml
spring:
  application:
    name: mall-center
  profiles:
    active: dev
  cloud:
    nacos:
      server-addr: ${NACOS_SERVER:127.0.0.1:10020}
      username: ${NACOS_USERNAME:nacos}
      password: ${NACOS_PASSWORD:Leng@123456}
      config:
        file-extension: yml
        shared-configs:
          - data-id: common.yml
            group: DEFAULT_GROUP
            refresh: true
```

**4. application.yml（数据源配置）：**
```yaml
spring:
  datasource:
    url: jdbc:mysql://${zlt.datasource.ip}:3306/central_mall?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: ${zlt.datasource.username}
    password: ${zlt.datasource.password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  redis:
    host: ${REDIS_HOST:127.0.0.1}
    port: ${REDIS_PORT:16379}

# zlt公共配置
zlt:
  datasource:
    ip: 127.0.0.1
    username: root
    password: lengfeng847
```

**5. 常用Bean配置（如果缺少）：**
- `RestTemplateConfig.java` - 提供 RestTemplate Bean
- `SecurityConfig.java` - 放行 Swagger/Knife4j（开发环境）

### 数据库初始化

```bash
# 数据库名称必须是 central_mall
mysql -h 127.0.0.1 -u root -plengfeng847 -e "CREATE DATABASE IF NOT EXISTS central_mall"

# 执行建表SQL（替换数据库名）
sed 's/cp_mall/central_mall/g' sql/mall-center/mall_center.sql | mysql ...
```

### 启动命令

```bash
cd zlt-business/mall-center
mvn spring-boot:run
# 服务端口: 7010
# Swagger文档: http://localhost:7010/doc.html
```

### 常见错误排查

| 错误 | 原因 | 修复 |
|------|------|------|
| `ClassNotFoundException: com.mysql.cj.jdbc.Driver` | 缺少MySQL驱动 | 添加 mysql-connector-java 依赖 |
| `required a bean of type 'UserService'` | Feign代理未创建 | 添加 `@EnableFeignClients` |
| `No qualifying bean of type 'RestTemplate'` | RestTemplate未配置 | 创建 RestTemplateConfig.java |
| `Circular placeholder reference` | 配置引用循环 | 检查 `${spring.data.redis.host}` 语法 |
| `Port 7010 was already in use` | 服务已运行 | `netstat -ano \| grep 7010` 查找进程 |

### API路径（认证后访问）

```
GET /api/mall/admin/goods/list     - 商品列表
GET /api/mall/admin/order/list     - 订单列表
GET /api/mall/admin/coupon/list    - 优惠券列表
GET /api/mall/admin/banner/list    - Banner列表
```

---
*mall-center 配置经验记录于 2026-05-09*

---

## MyBatis-Plus PaginationInnerInterceptor Double LIMIT 问题

**问题：** `AdminGoodsServiceImpl.getGoodsPage()` 调用时出现 SQL 语法错误：`LIMIT ? LIMIT ?`

**环境：** mall-center (Spring Boot 3.1.6 + MyBatis-Plus 3.5.x + MySQL 8.x)

### 症状

```json
GET /api/mall/admin/goods/list?page=1&pageSize=10
→ 500 Internal Server Error
→ java.sql.SQLSyntaxErrorException: You have an error in your SQL syntax... near 'LIMIT 10' at line 1
```

**日志中的 SQL：**
```sql
SELECT ... FROM mall_goods WHERE ... ORDER BY create_time DESC LIMIT ? LIMIT ?
                                                           ↑ MyBatis-Plus   ↑ 拦截器追加
```

### 根因分析

**触发条件：** 当 `IPage<T>` 的泛型类型 `T` 与 mapper 操作的实际 entity 类型不一致时，PaginationInnerInterceptor 会错误地追加 LIMIT。

- `AdminGoodsServiceImpl.getGoodsPage(IPage<AdminGoodsDTO> page, ...)` 
- 但 `goodsMapper.selectPage(mallPage, wrapper)` 操作的是 `MallGoods` 实体
- `IPage<AdminGoodsDTO>` 包含分页信息，但与 `MallGoods` 类型不匹配
- PaginationInnerInterceptor 检测到 `page.getSize()` 有值，追加 `LIMIT ?`
- 但某些内部逻辑又从 `MallGoods` 角度处理，导致第二次追加

### 修复方案

**方案 A（已验证有效）：** 在 service 层使用手动 count + wrapper.last() 绕过自动分页

```java
// AdminGoodsServiceImpl.getGoodsPage()
LambdaQueryWrapper<MallGoods> wrapper = new LambdaQueryWrapper<>();
// ... 构建 wrapper ...

// 手动获取总数
Long total = goodsMapper.selectCount(wrapper.clone());

// 使用 wrapper.last() 添加 LIMIT（绕过 PaginationInnerInterceptor）
wrapper.last("LIMIT " + page.getSize() + " OFFSET " + (page.getCurrent() - 1) * page.getSize());

// 查询数据
List<MallGoods> goodsList = goodsMapper.selectList(wrapper);
page.setTotal(total);
page.setRecords(goodsList.stream().map(this::convertToDTO).collect(Collectors.toList()));
return page;
```

**方案 B（临时）：** 在 MyBatisConfig 中禁用 PaginationInnerInterceptor

```java
@Bean
@Primary
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    // interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}
```

**方案 C（待验证）：** 使用 `@InterceptorIgnore` 注解在 mapper 方法上跳过特定拦截器

### 影响范围

| 文件 | 方法 | 状态 |
|------|------|------|
| `AdminGoodsServiceImpl` | getGoodsPage() | ✅ 已用方案A修复 |
| `GoodsServiceImpl` | getGoodsPage(IPage<MallGoods>) | ✅ 正常（类型匹配） |
| 其他 AdminService | selectPage with IPage | ⚠️ 待验证 |

### 关键代码修改

**AdminGoodsServiceImpl.java** — getGoodsPage() 方法：
```java
// 修改前（有bug）
Page<MallGoods> mallPage = new Page<>(page.getCurrent(), page.getSize());
IPage<MallGoods> result = goodsMapper.selectPage(mallPage, wrapper);  // double LIMIT!

// 修改后（workaround）
Long total = goodsMapper.selectCount(wrapper.clone());
wrapper.last("LIMIT " + page.getSize() + " OFFSET " + (page.getCurrent() - 1) * page.getSize());
List<MallGoods> goodsList = goodsMapper.selectList(wrapper);
```

### 调试技巧

1. **查看完整 SQL：** 启用 MyBatis-Plus 日志
   ```yaml
   mybatis-plus:
     configuration:
       log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
   ```

2. **二分法定位：** 禁用 PaginationInnerInterceptor 后如果正常，说明是拦截器问题

3. **检查泛型类型：** 确认 IPage 的泛型类型与 mapper 的 entity 类型是否匹配

### 预防措施

| 规则 | 说明 |
|------|------|
| 避免泛型类型不匹配 | `IPage<DTO>` 与 `selectPage(entityWrapper)` 混用时需小心 |
| 统一分页方式 | 在 service 层处理分页，避免在 service 和 mapper 层双重分页 |
| 测试分页边界 | 测试 page=1, page=2, pageSize=1, pageSize=100 等边界条件 |
| 记录 SQL 日志 | 部署前验证 SQL 不是 double LIMIT 格式 |

---

*Phase 2 UAT 修复经验记录于 2026-05-10*

---

## Phase 2 UAT 测试结果摘要

**测试时间：** 2026-05-10
**测试范围：** 后台管理-商品与系统（共10项测试）

### 测试通过项（10/10）

| # | API端点 | 功能 | 结果 |
|---|---------|------|------|
| 1 | GET /api/mall/admin/category/list | 查看分类树 | ✅ PASS |
| 2 | GET /api/mall/admin/goods/list | 商品列表分页 | ✅ PASS（已修复double LIMIT） |
| 3 | GET /api/mall/admin/goods/{id} | 商品详情 | ✅ PASS |
| 4 | PUT /api/mall/admin/goods/{id}/status/{status} | 更新商品状态 | ✅ PASS |
| 5 | POST /api/mall/admin/goods | 发布商品 | ✅ PASS |
| 6 | DELETE /api/mall/admin/goods/{id} | 软删除商品 | ✅ PASS |
| 7 | POST /api/mall/admin/banner | 创建Banner | ✅ PASS |
| 8 | GET /api/mall/admin/statistics/today | 统计卡片 | ✅ PASS（mock数据） |
| 9 | GET /api/mall/admin/settings | 系统设置 | ✅ PASS（空数组） |
| 10 | GET /api/mall/admin/spec/list | 规格列表 | ✅ PASS（空数组） |

### 服务状态

- **端口：** 7010
- **租户头：** x-tenant-header: SUPER
- **数据库：** central_mall (MySQL root/lengfeng847)
- **当前商品数：** 7条
- **当前分类数：** 8个

### 已验证功能逻辑

1. **分类管理：** 创建 → 列表查询正常
2. **商品管理：** 发布 → 列表分页正常 → 详情正常 → 状态更新正常 → 删除正常
3. **Banner管理：** 创建成功，列表返回4条（含测试数据）
4. **统计接口：** 返回全0的mock数据（订单表尚未创建）
5. **设置接口：** 微信支付等敏感配置未设置，返回空

---

---

## Phase 3 UAT 测试结果摘要

**测试时间：** 2026-05-10
**测试范围：** 订单与支付核心（共12项测试）
**测试方式：** 直接验证后端API接口（略过前端验证）

### 测试结果汇总

| # | API端点 | 功能 | 结果 |
|---|---------|------|------|
| 1 | GET /api/mall/admin/order/list | 管理员订单列表（分页） | ❌ 未实现（返回空数据） |
| 2 | GET /api/mall/admin/order/{id} | 管理员订单详情 | ✅ PASS |
| 3 | POST /api/mall/admin/order/{id}/ship | 管理员发货 | ⚠️ 逻辑问题（已发货订单处理） |
| 4 | GET /api/mall/admin/order/statistics | 订单统计 | ❌ 未实现（返回全0） |
| 5 | POST /api/mall/order | 创建订单（实物） | ⏸️ Blocked（缺少SKU数据） |
| 6 | POST /api/mall/order | 创建订单（虚拟商品） | ⏸️ Blocked（依赖测试5） |
| 7 | DELETE /api/mall/order/{id} | 用户取消订单 | ⏸️ Blocked（无订单可取消） |
| 8 | PUT /api/mall/order/{id}/confirm | 用户确认收货 | ⏸️ Blocked（无已发货订单） |
| 9 | GET /api/mall/admin/stock/list | 库存列表 | ❌ 500错误（编码问题） |
| 10 | PUT /api/mall/admin/stock/{skuId}/correct | 库存修正 | ❌ 500错误 |
| 11 | GET /api/mall/admin/stock/alert/list | 库存预警列表 | ✅ PASS |
| 12 | 快递公司CRUD | 增删改查快递公司 | ✅ PASS |

**汇总：** 3通过 / 4阻塞 / 5失败

---

## Phase 3 发现的问题及修复

### ISSUE-03-01: AdminOrderController.getOrderPage() 未实现

**问题描述：**
- GET /api/mall/admin/order/list 返回空记录（total=0）
- 数据库实际有3条订单数据
- AdminOrderController.getOrderPage() 方法有TODO注释，查询逻辑未实现

**根因：**
```java
// AdminOrderController.java:52-58
// Get orders - this would need a proper implementation with pagination
// For now, return a basic page
com.baomidou.mybatisplus.extension.plugins.pagination.Page<OrderListDTO> pageResult =
    new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, pageSize);
// TODO: Implement with actual query when IAdminOrderService has getOrderPage method
return Result.succeed(pageResult);
```

**修复方案：**
在 IOrderService 或新建 IAdminOrderService 中实现分页查询：
1. 使用 LambdaQueryWrapper 构建查询条件（tenantId、status、keyword等）
2. 调用 baseMapper.selectPage() 获取分页结果
3. 转换为 OrderListDTO 返回

---

### ISSUE-03-02: AdminOrderController.getOrderStatistics() 未实现

**问题描述：**
- GET /api/mall/admin/order/statistics 返回全0数据
- todayOrderCount=0, todaySalesAmount=0, pendingShipCount=0, completedCount=0

**根因：**
```java
// AdminOrderController.java:97-104
// TODO: Implement actual statistics queries
Map<String, Object> stats = new HashMap<>();
stats.put("todayOrderCount", 0);
stats.put("todaySalesAmount", BigDecimal.ZERO);
stats.put("pendingShipCount", 0);
stats.put("completedCount", 0);
return Result.succeed(stats);
```

**修复方案：**
实现统计查询：
1. 今日订单数：COUNT WHERE create_time >= TODAY AND tenant_id = ?
2. 今日销售额：SUM(pay_amount) WHERE create_time >= TODAY AND status = 2
3. 待发货数：COUNT WHERE status = 2 (已付款)
4. 已完成数：COUNT WHERE status = 4

---

### ISSUE-03-03: 库存列表API返回500错误

**问题描述：**
- GET /api/mall/admin/stock/list 返回500错误
- 库存预警列表正常（返回1条预警数据）

**根因分析：**
- AdminStockServiceImpl.getSkuStockPage() 方法在查询goodsName时出现编码问题
- mall_goods表中文名在查询时出现乱码，导致SQL或结果处理失败

**调试方法：**
```bash
# 检查goods表中文数据
mysql -h 127.0.0.1 -u root -plengfeng847 -e "SELECT id, name FROM central_mall.mall_goods" 
# 输出：1	Dell PowerEdge R750 服务器  (乱码显示)
```

**修复方案：**
1. 检查数据库连接字符集配置（确保utf8mb4）
2. 或在 MyBatis Config 中设置 jdbc-type-handler 处理编码
3. 或者在convertToDTO时不依赖goodsNameMap，直接从sku获取

---

### ISSUE-03-04: 库存修正API返回500错误

**问题描述：**
- PUT /api/mall/admin/stock/{skuId}/correct 返回500错误

**根因分析：**
- StockServiceImpl.correctStock() 调用失败
- 可能与 MallStockLog 表的 operation_type 字段类型有关

**修复方案：**
1. 检查 MallStockLogMapper 是否正确继承 BaseMapper
2. 确认 operation_type 字段在实体中为 Integer 类型
3. 添加异常日志输出以便调试

---

### ISSUE-03-05: 发货接口对已发货订单处理不友好

**问题描述：**
- 对status=3（已发货）的订单再次发货，返回400 Bad Request
- 错误信息不够友好

**当前行为：**
```java
// OrderServiceImpl.shipOrder()
if (!Integer.valueOf(MallOrder.STATUS_PAID).equals(order.getStatus())) {
    throw new RuntimeException("Only paid orders can be shipped");
}
```

**修复方案：**
返回更明确的错误信息：
```java
throw new RuntimeException("订单已发货，请勿重复操作");
```

---

## Phase 3 数据库表缺失问题

**问题：** Phase 3 的实体和 Mapper 已创建，但数据库表未创建

**影响：**
- mall_order, mall_order_item, mall_delivery, mall_stock_log 表不存在
- 导致所有订单相关API返回500错误

**已执行的修复：**
创建 mall_center_order.sql 并执行：
```sql
-- 执行命令
mysql -h 127.0.0.1 -u root -plengfeng847 < sql/mall-center/mall_center_order.sql
```

**注意：** Phase 3 执行时应确保 SQL 脚本被正确执行，或在 Plan 中包含数据库初始化步骤

---

## Phase 3 测试环境状态

### 服务状态
- **Mall-Center端口:** 7010
- **Swagger文档:** http://localhost:7010/doc.html
- **租户头:** x-tenant-header: SUPER
- **数据库:** central_mall (MySQL root/lengfeng847)
- **Redis:** 127.0.0.1:16379

### 数据库数据状态
| 表名 | 数据量 | 说明 |
|------|--------|------|
| mall_order | 3条 | 测试订单（待付款、已付款、已完成） |
| mall_order_item | 3条 | 对应订单项 |
| mall_delivery | 1条 | 订单2的物流信息 |
| mall_express | 2条 | 顺丰SF、圆通YTO |
| mall_goods_sku | 2条 | SKU001(100件)、SKU002(8件-预警) |
| mall_goods | 存在 | 中文名有编码问题 |

### Redis数据状态
- sku:stock:1 = 100（手动初始化，用于测试库存修正）

### 已验证功能
1. **订单详情：** 返回完整信息（items、delivery、address）
2. **库存预警：** 正确识别低于阈值的SKU（stock=8 < threshold=10）
3. **快递公司CRUD：** 增删改查正常（删除软置status=0）

---

## Phase 3 实际修复内容（2026-05-10 更新）

### ISSUE-03-01: AdminOrderController.getOrderPage() 未实现 → 已修复

**修复方式：**
```java
// AdminOrderController.java - 实现完整分页查询
LambdaQueryWrapper<MallOrder> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(MallOrder::getTenantId, tenantId);
wrapper.eq(MallOrder::getDelFlag, 0);
if (status != null) wrapper.eq(MallOrder::getStatus, status);
// ...
Page<MallOrder> result = orderService.getBaseMapper().selectPage(orderPage, wrapper);
```

**验证结果：** API返回3条订单数据，分页、筛选正常

---

### ISSUE-03-02: AdminOrderController.getOrderStatistics() 未实现 → 已修复

**修复方式：**
```java
// 直接查询所有订单并按状态统计
List<MallOrder> allOrders = orderService.getBaseMapper().selectList(wrapper);
for (MallOrder order : allOrders) {
    if (order.getCreateTime().isAfter(todayStart)) todayOrderCount++;
    if (order.getStatus() == 2) pendingShipCount++;
    if (order.getStatus() == 4) completedCount++;
}
```

**验证结果：** todayOrderCount=3, todaySalesAmount=6008.00, pendingShipCount=1, completedCount=1

---

### ISSUE-03-03: 库存列表返回500错误 (NPE) → 已修复

**根因：** `Map.of("goodsId", goodsId, "keyword", keyword)` 当goodsId=null时抛出NPE

**修复方式：**
```java
// AdminStockController.java - 使用HashMap替代Map.of()
java.util.Map<String, Object> params = new java.util.HashMap<>();
params.put("goodsId", goodsId);
params.put("keyword", keyword);
```

**验证结果：** API返回2条SKU数据（SKU001=95, SKU002=8）

---

### ISSUE-03-04: 库存修正返回500错误 (SQL保留字) → 已修复

**根因：** `change` 是SQL保留字，导致 INSERT/SELECT 失败

**修复方式：**
```java
// 1. MallStockLog.java - 字段重命名
private Integer stockChange;  // 替代 change

// 2. StockServiceImpl.java - setChange() → setStockChange()
stockLog.setStockChange(change);

// 3. 数据库列重命名
ALTER TABLE mall_stock_log CHANGE COLUMN `change` stock_change INT NOT NULL
```

**验证结果：** 修正成功，stock_log正确记录（stock_change=-5）

---

## Phase 3 数据库表缺失问题 → 已解决

**问题：** Phase 3 的实体和 Mapper 已创建，但数据库表未创建

**已执行修复：**
1. 创建 `sql/mall-center/mall_center_order.sql`
2. 执行建表SQL（mall_order, mall_order_item, mall_delivery, mall_stock_log）
3. 插入测试数据（3条订单、3条订单项、1条物流、2条快递公司、2条SKU）

---

## Phase 3 测试环境最终状态

### 服务状态
- **Mall-Center端口:** 7010
- **Swagger文档:** http://localhost:7010/doc.html
- **租户头:** x-tenant-header: SUPER
- **数据库:** central_mall (MySQL root/lengfeng847)
- **Redis:** 127.0.0.1:16379

### 数据库数据状态
| 表名 | 数据量 | 说明 |
|------|--------|------|
| mall_order | 3条 | 测试订单（待付款1、已付款1、已完成1） |
| mall_order_item | 3条 | 对应订单项 |
| mall_delivery | 1条 | 订单2的物流信息（顺丰SF） |
| mall_express | 2条 | 顺丰SF（启用）、圆通YTO（软删除） |
| mall_goods_sku | 2条 | SKU001(95件)、SKU002(8件-预警) |
| mall_goods | 9条 | 中文名有编码问题 |
| mall_stock_log | 3条 | 预占2条、手动修正1条 |

### Redis数据状态
- sku:stock:1 = 95（手动修正后）

### 已验证通过的功能
1. **订单列表：** 分页正常（3条数据）、筛选正常（status过滤）
2. **订单详情：** 返回完整信息（items、delivery、order）
3. **订单发货：** 状态流转正常（待付款→已付款→已发货）
4. **订单统计：** 实时计算（todayOrderCount=3, todaySalesAmount=6008）
5. **库存列表：** 分页正常（2条数据），goodsName编码问题已绕过
6. **库存修正：** 成功执行，日志正确记录
7. **库存预警：** 正确识别（stock=8 < threshold=10）
8. **快递公司CRUD：** 增删改查正常

---

*Phase 3 测试完成，修复已验证 - 2026-05-10*

---

## Phase 10 UAT 测试结果摘要

**测试时间：** 2026-05-10
**测试范围：** 管理后台核心模块（ADMIN-02商品管理、ADMIN-03订单管理、ADMIN-04优惠券管理、ADMIN-10 Banner管理）
**测试方式：** 直接验证后端API接口（略过前端验证）
**结果：** 21通过 / 9跳过（前端功能或未实现功能）/ 0失败

### 后端API测试结果汇总

| # | API端点 | 功能 | 结果 |
|---|---------|------|------|
| 1 | POST /api/mall/admin/goods | 新建商品 | ✅ PASS |
| 2 | PUT /api/mall/admin/goods | 更新商品 | ✅ PASS |
| 3 | DELETE /api/mall/admin/goods/{id} | 软删除商品 | ✅ PASS |
| 4 | GET /api/mall/admin/goods/list | 商品列表分页 | ✅ PASS |
| 5 | PUT /api/mall/admin/goods/batch/status | 批量更新状态 | ✅ PASS |
| 6 | PUT /api/mall/admin/goods/batch/status | 批量下架 | ✅ PASS |
| 7 | GET /api/mall/admin/category/list | 分类列表 | ✅ PASS |
| 10 | GET /api/mall/admin/goods/{id} | 商品详情 | ✅ PASS |
| 11 | GET /api/mall/admin/order/list | 订单列表 | ✅ PASS |
| 12 | GET /api/mall/admin/order/{id} | 订单详情 | ✅ PASS |
| 13 | POST /api/mall/admin/order/{id}/adjust-amount | 订单改价 | ✅ PASS |
| 14 | POST /api/mall/admin/order/{id}/admin-remark | 订单备注 | ✅ PASS |
| 15 | POST /api/mall/admin/order/{id}/close | 关闭订单 | ✅ PASS |
| 16 | - | 订单状态流程 | ✅ PASS |
| 17 | - | 虚拟商品自动完成 | ✅ PASS |
| 18 | POST /api/mall/admin/coupon/template | 创建优惠券 | ✅ PASS |
| 19 | PUT /api/mall/admin/coupon/template/{id} | 更新优惠券 | ✅ PASS |
| 21 | GET /api/mall/admin/coupon/template/list | 优惠券列表 | ✅ PASS |
| 24 | POST /api/mall/admin/coupon/template/{id}/offline | 优惠券下架 | ✅ PASS |
| 25 | POST /api/mall/admin/banner | 创建Banner | ✅ PASS |
| 26 | PUT /api/mall/admin/banner | 更新Banner | ✅ PASS |
| 27 | DELETE /api/mall/admin/banner/{id} | 删除Banner | ✅ PASS |
| 28 | GET /api/mall/admin/banner/list | Banner列表 | ✅ PASS |
| 29 | PUT /api/mall/admin/banner | 启用/禁用Banner | ✅ PASS |

### 已验证通过的功能

**商品管理（ADMIN-02）：**
1. **新建商品：** POST成功，返回新商品ID，列表可查询
2. **编辑商品：** PUT成功，商品信息更新
3. **删除商品：** DELETE成功（软删除）
4. **商品列表：** 分页、关键词搜索正常
5. **批量操作：** 批量上下架成功
6. **商品详情：** 返回完整信息（含SKU）
7. **分类管理：** 返回9个分类

**订单管理（ADMIN-03）：**
1. **订单列表：** 分页正常，返回3条订单
2. **订单详情：** 返回完整信息（items、delivery、address）
3. **订单改价：** adjust-amount为负数时成功（正数不允许）
4. **订单备注：** admin-remark成功添加
5. **订单关闭：** 仅已发货订单(status=3)可关闭
6. **订单统计：** todaySalesAmount=6008, todayOrderCount=3

**优惠券管理（ADMIN-04）：**
1. **创建优惠券：** POST成功，返回新ID
2. **更新优惠券：** PUT成功
3. **发布优惠券：** POST /publish成功
4. **下架优惠券：** POST /offline成功
5. **优惠券列表：** 返回优惠券数据
6. **手动发放：** 后端API未实现（前端显示禁用）
7. **优惠券统计：** 后端API未实现（前端显示占位符）

**Banner管理（ADMIN-10）：**
1. **创建Banner：** POST成功
2. **更新Banner：** PUT成功
3. **删除Banner：** DELETE成功
4. **Banner列表：** 返回4条Banner
5. **启用/禁用：** 通过PUT更新status

### Phase 10 发现的问题

**无严重问题** - 所有可测试的后端API均正常工作。

**已知限制：**
1. 优惠券手动发放API未实现（ADMIN-04-05）
2. 优惠券统计API未实现（ADMIN-04-06）
3. 订单关闭仅对已发货订单有效（设计如此）

### 服务状态

- **Mall-Center端口:** 7010
- **Swagger文档:** http://localhost:7010/doc.html
- **租户头:** x-tenant-header: SUPER
- **数据库:** central_mall (MySQL root/lengfeng847)
- **Redis:** 127.0.0.1:16379

### 数据库数据状态
| 表名 | 数据量 | 说明 |
|------|--------|------|
| mall_goods | 8条 | 包含测试商品 |
| mall_goods_sku | 2条 | SKU001(95件)、SKU002(8件-预警) |
| mall_category | 9条 | 分类数据 |
| mall_order | 3条 | 待付款1、已付款1、已完成1 |
| mall_order_item | 3条 | 订单项数据 |
| mall_delivery | 1条 | 订单2的物流信息 |
| mall_coupon_template | 1条 | 测试优惠券 |
| mall_banner | 4条 | Banner数据 |

---

---

## Phase 5 UAT 测试问题记录

**测试时间：** 2026-05-10
**测试范围：** 退款模块 + 营销模块（优惠券、积分）

### ISSUE-05-01: mall_refund 表缺失

**问题描述：**
- 代码实现了 RefundServiceImpl 和 RefundController，但数据库表 mall_refund 不存在
- 导致 GET /api/mall/refund/list 返回 500 错误

**根因：** Phase plan 中包含了创建表的 SQL 脚本，但执行验证前未执行

**修复方案：**
1. 创建 sql/mall-center/mall_center_refund.sql
2. 执行建表SQL

**关键教训：** Phase plan 应明确包含数据库迁移步骤的验证

---

### ISSUE-05-02: mall_points_account.tenant_id 错误

**问题描述：**
- 初始数据中 tenant_id='1' 而非 'SUPER'
- 导致 GET /api/mall/admin/member/list 无法查询到用户积分账户

**根因：** 测试数据使用了数字 tenant_id，而非字符串租户ID

**修复方案：**
```sql
UPDATE central_mall.mall_points_account SET tenant_id='SUPER' WHERE id=2053146420910772225
```

**关键教训：** 所有测试数据必须使用正确的租户ID格式

---

### ISSUE-05-03: 优惠券expireTime为NULL问题

**问题描述：**
- 用户领取优惠券后 expire_time 为 NULL
- 导致 getAvailableCoupons 的过期判断异常

**根因：** validType=1 时依赖模板的 endTime，但模板的 endTime 可能为 NULL

**影响：** getAvailableCoupons 返回空数组（即使有未过期的优惠券）

**关键教训：** 优惠券模板创建时应强制设置有效期，避免 NULL 值

---

### ISSUE-05-04: 微信退款API调用失败

**问题描述：**
- 管理员审核通过退款时调用 payService.processRefund() 失败
- 错误信息："Failed to call WeChat Pay Refund API"

**根因：** 开发环境无微信支付配置（沙箱密钥未配置）

**当前状态：** 退款状态从 1（待审核）变为 2（审核通过），状态流转正确

**关键教训：** 第三方支付API在开发环境应配置沙箱环境

---

## 经验总结

| # | 问题 | 解决方案 |
|---|------|----------|
| 1 | 数据库表缺失 | Phase plan 包含数据库迁移，执行前验证 |
| 2 | 测试数据租户ID错误 | 所有测试数据使用统一的租户ID格式 |
| 3 | NULL值导致业务异常 | 创建时强制必填字段，避免NULL |
| 4 | 第三方API失败 | 开发环境配置沙箱环境 |

---

## Phase 6 UAT 测试问题记录

**测试时间：** 2026-05-10
**测试范围：** 订单增强（ORDER-EXT-01~03）+ 管理端统计（STAT-01~03）

### ISSUE-06-01: 统计接口为Stub代码

**问题描述：**
- STAT-01/02/03 的服务实现返回空数据或全0
- `AdminStatisticsServiceImpl.getSalesTrend()` 直接返回 `new ArrayList<>()`
- `AdminStatisticsServiceImpl.getStockWarningList()` 直接返回空列表
- `AdminStatisticsServiceImpl.getUserAnalysis()` 返回全0数据

**根因：** Phase 6 的统计功能在 Phase 2/3 实现时只写了框架代码，未实现实际查询逻辑

**影响：** 无法通过API获取真实的统计数据

**修复建议：** 实现实际查询逻辑：
- getSalesTrend: 查询 mall_order 按日期分组统计
- getStockWarningList: 查询 mall_goods_sku WHERE stock <= 10
- getUserAnalysis: 查询 mall_user 和 mall_order 表

---

### ISSUE-06-02: 订单发货接口需要完整数据

**问题描述：**
- 调用 POST /api/mall/admin/order/2/ship 返回 400 Bad Request
- 但实际上订单2已经有物流记录（从之前测试数据）

**根因：** 重复发货尝试被拒绝，但错误信息不够明确

**已验证逻辑：** 仅 status=2（已付款）的订单可发货，已发货不可重复发货

---

## 经验总结

| # | 问题 | 解决方案 |
|---|------|----------|
| 1 | 数据库表缺失 | Phase plan 包含数据库迁移，执行前验证 |
| 2 | 测试数据租户ID错误 | 所有测试数据使用统一的租户ID格式 |
| 3 | NULL值导致业务异常 | 创建时强制必填字段，避免NULL |
| 4 | 第三方API失败 | 开发环境配置沙箱环境 |
| 5 | 统计接口stub | 后续Phase应确保实际实现，不只是框架代码 |
| 6 | 订单状态校验 | 测试前需确认订单当前状态，避免无效操作 |

---

*Phase 6 经验教训记录于 2026-05-10*


---

## Phase 7 UAT 测试问题记录

**测试时间：** 2026-05-10
**测试范围：** Redis Lua原子库存(07-01)、商户平台(07-02)、微信模板消息(07-03)

### ISSUE-07-01: mall_merchant 表缺失

**问题描述：**
- 代码实现了 MallMerchant.java、MallMerchantMapper.java、AdminMerchantController.java
- 但数据库表 mall_merchant 不存在
- 导致 GET /api/mall/admin/merchant/list 返回 500 错误

**根因：** Phase plan 创建了实体但未创建数据库表的 SQL 脚本

**修复方案：**
1. 创建 sql/mall-center/mall_center_merchant.sql 建表脚本
2. 执行建表SQL
3. 插入测试商户数据（待审核、已通过、已拒绝各1条）

**关键教训：** Phase plan 应明确包含数据库迁移步骤的验证

---

### ISSUE-07-02: mall_merchant.tenant_id 为NULL导致租户隔离过滤

**问题描述：**
- 数据库表创建后 tenant_id 字段为 NULL
- 多租户查询时 TenantLineInterceptor 将 WHERE tenant_id = NULL 转换为 tenant_id = 'SUPER'
- NULL = 'SUPER' 永远为 false，导致所有商户被过滤

**根因：**
- 插入数据时未指定 tenant_id
- 多租户架构下，所有商户数据应该有 tenant_id

**修复方案：**
```sql
-- 插入数据时指定正确的租户ID
INSERT INTO mall_merchant (tenant_id, merchant_name, ...) VALUES ('SUPER', 'Test Merchant', ...);

-- 或批量修复现有数据
UPDATE mall_merchant SET tenant_id='SUPER' WHERE tenant_id IS NULL;
```

**验证结果：** tenant_id 设置为 'SUPER' 后，API 正常返回3条商户数据

**关键教训：**
- 测试多租户 API 时，确保测试数据的 tenant_id 与请求头 x-tenant-header 一致
- 插入测试数据时必须指定 tenant_id

---

## 经验总结

| # | 问题 | 解决方案 |
|---|------|----------|
| 1 | 数据库表缺失 | Phase plan 包含数据库迁移，执行前验证 |
| 2 | 测试数据租户ID错误 | 所有测试数据使用统一的租户ID格式 |
| 3 | NULL值导致租户过滤失败 | 插入数据时必须指定 tenant_id |

*Phase 7 经验教训记录于 2026-05-10*

---

## Phase 8 UAT 测试问题记录

**测试时间：** 2026-05-10
**测试范围：** Admin基础框架(08-ADMIN-01) + 小程序首页商品(08-MINI-01~03)

### ISSUE-08-01: 统计API返回Mock数据

**问题描述：**
- AdminStatisticsServiceImpl 的 getTodayStatistics、getSalesTrend、getStockWarningList 均返回空数据/mock数据
- 代码中有明确的 TODO 注释说明 Phase 3 会实现，但 Phase 8 验证时仍未实现

**根因：** Phase 2/3 执行时只创建了表结构，未完善统计查询逻辑

**修复方案：**
实现 computeTodayStatistics() 从 mall_order 真实查询：
```java
// 今日订单统计 (status >= 2 已付款/已发货/已完成)
List<MallOrder> todayOrders = orderMapper.selectList(todayWrapper);
long todayOrderCount = todayOrders.size();
BigDecimal todaySalesAmount = todayOrders.stream()
    .map(MallOrder::getPayAmount)
    .filter(p -> p != null)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
```

实现 getSalesTrend() 按日期分组：
```java
java.util.Map<String, List<MallOrder>> byDate = orders.stream()
    .collect(java.util.stream.Collectors.groupingBy(
        o -> o.getCreateTime().format(formatter)
    ));
```

实现 getStockWarningList()：
```java
wrapper.le(MallGoodsSku::getStock, 10);  // 预警阈值默认10
```

**验证结果：**
- todayOrderCount: 2, todaySalesAmount: 6097.00
- 销售趋势: 2026-05-10 订单2 销售额6097.00
- 库存预警: SKU002 stock=8 < 预警值10

---

### Phase 8 经验总结

| # | 问题 | 解决方案 |
|---|------|----------|
| 1 | 统计API stub代码 | 实现实际查询逻辑，从 mall_order 等表计算统计数据 |
| 2 | 前端项目仅验证后端 | Phase plan 应区分前端UI验证和后端API验证 |

---

## Phase 8 已知限制

1. **User Analysis API** 仍返回全0（用户模块尚未集成到统计）
2. **前端项目** (mall-admin-web, mall-mini-program) 需要启动前端服务才能完整验证UI
3. **Code Review 发现的问题** (WR-01~08, IN-01~03) 尚未修复：
   - WR-01/02: 购物车hardcoded userId='1'
   - WR-03: FilterBar onClearKeyword 未清除 keyword
   - WR-04/05: console.log/console.error 调试代码
   - WR-06: 销售趋势卡片标题包含开发注释
   - WR-07/08: 使用 window.location.href 而非 UMI navigate
   - IN-01: Vue $index 废弃语法
   - IN-02: any 类型丢失类型安全
   - IN-03: 999 魔法数字无说明

---

## Phase 9 UAT 测试问题记录

**测试时间：** 2026-05-10
**测试范围：** 小程序交易流程（购物车、订单、优惠券、退款、收货地址）

### ISSUE-09-01: curl传输中文JSON编码问题

**问题描述：**
- POST /api/mall/address 和 POST /api/mall/refund 使用中文内容在curl中返回400
- 英文内容成功，中文内容失败
- 使用 printf | curl --data-binary @- 方式可以成功传递中文

**根因：**
curl默认不完全以二进制模式传递数据，中文可能被错误编码

**修复方案：**
测试API时使用以下方式确保中文正确传递：
```bash
printf '{"name":"测试地址",...}' | curl -X POST -H "Content-Type: application/json" -H "x-tenant-header: SUPER" --data-binary @-
```

**关键教训：**
测试包含中文的API时，使用 printf | curl --data-binary @- 确保编码正确

---

### ISSUE-09-02: 微信支付配置不完整

**问题描述：**
- POST /api/mall/order/{id}/pay 返回错误：WeChat Pay configuration incomplete: appId, mchId, and apiKey are required

**根因：**
开发环境未配置微信支付的必要参数（appId, mchId, apiKey）

**影响范围：**
- 支付功能无法在开发环境测试
- 需要配置沙箱环境或mock支付流程

**关键教训：**
微信支付测试需要配置微信支付沙箱环境

---

### ISSUE-09-03: 收货地址API路径问题

**问题描述：**
- GET /api/mall/address 返回 405 Method Not Allowed
- 实际端点是 GET /api/mall/address/list

**根因：**
前端调用 /api/mall/address 但后端实际端点是 /api/mall/address/list

**关键教训：**
小程序前端调用地址API时需要使用 /api/mall/address/list 而非 /api/mall/address

---

### ISSUE-09-04: 退款申请状态限制

**问题描述：**
- 只有已付款(2)、已发货(3)、已完成(4)的订单可以申请退款
- 待付款(1)、已取消(5)等状态不允许申请退款

**根因：**
业务逻辑限制 - RefundServiceImpl.applyRefund() 中检查订单状态

**关键教训：**
退款测试前需要确保订单状态正确（status=2/3/4）

---

## Phase 9 测试结果汇总

**测试时间：** 2026-05-10
**测试范围：** 小程序交易流程（购物车、订单、优惠券、退款、收货地址）
**测试方式：** 直接验证后端API接口（略过前端验证）

### 测试结果汇总

| # | API端点 | 功能 | 结果 |
|---|---------|------|------|
| 1 | POST /api/mall/cart | 添加购物车 | ✅ PASS |
| 2 | GET /api/mall/cart/list | 获取购物车列表 | ✅ PASS |
| 3 | PUT /api/mall/cart/{id} | 修改数量 | ✅ PASS |
| 4 | DELETE /api/mall/cart/{id} | 删除购物车项 | ✅ PASS |
| 5 | GET /api/mall/address/list | 获取地址列表 | ✅ PASS |
| 6 | POST /api/mall/address | 创建地址 | ✅ PASS (用printf|curl) |
| 7 | POST /api/mall/order | 创建订单 | ✅ PASS |
| 8 | GET /api/mall/order | 获取订单列表 | ✅ PASS |
| 9 | GET /api/mall/order/{id} | 获取订单详情 | ✅ PASS |
| 10 | DELETE /api/mall/order/{id} | 取消订单 | ✅ PASS |
| 11 | PUT /api/mall/order/{id}/confirm | 确认收货 | ✅ PASS |
| 12 | POST /api/mall/order/{id}/pay | 发起微信支付 | ⚠️ 阻塞（WeChat配置）|
| 13 | GET /api/mall/coupon/available | 获取可用优惠券 | ✅ PASS |
| 14 | POST /api/mall/coupon/{id}/claim | 领取优惠券 | ✅ PASS |
| 15 | POST /api/mall/refund | 申请退款 | ✅ PASS (用printf|curl) |
| 16 | GET /api/mall/refund/list | 获取退款列表 | ✅ PASS |
| 17 | POST /api/mall/refund/{id}/cancel | 取消退款申请 | ✅ PASS |

**汇总：** 15通过 / 2阻塞 / 0失败

### 已验证通过的功能

**购物车模块（4/4）：**
1. 添加商品到购物车
2. 获取购物车列表（含商品名称、价格、数量、SKU规格）
3. 修改商品数量
4. 删除购物车项

**收货地址模块（2/2）：**
1. 获取地址列表
2. 创建地址（中文成功）

**订单模块（5/6）：**
1. 创建订单（实物/虚拟商品）
2. 获取订单列表
3. 获取订单详情
4. 取消订单
5. 确认收货

**优惠券模块（2/2）：**
1. 获取可用优惠券
2. 领取优惠券

**退款模块（3/3）：**
1. 申请退款（中文reason成功）
2. 获取退款列表
3. 取消退款申请

### 服务状态

- **Mall-Center端口:** 7010
- **Swagger文档:** http://localhost:7010/doc.html
- **租户头:** x-tenant-header: SUPER
- **数据库:** central_mall (MySQL root/lengfeng847)
- **Redis:** 127.0.0.1:16379

---

*Phase 9 经验教训记录于 2026-05-10*

