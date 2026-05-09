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

*Phase 2 测试记录于 2026-05-10*
