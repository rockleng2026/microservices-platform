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