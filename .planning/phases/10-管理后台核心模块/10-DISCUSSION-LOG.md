# Phase 10: 管理后台核心模块 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-09
**Phase:** 10-管理后台核心模块
**Areas discussed:** 表格交互模式, 商品编辑形态, 订单价格修改, 优惠券发放方式, Banner图片上传

---

## 表格交互模式

| Option | Description | Selected |
|--------|-------------|----------|
| ProTable（推荐） | 内置搜索、筛选、分页、批量操作，开箱即用，一致性高 | ✓ |
| 普通 Table + 分页 | 更灵活，但需要自己实现搜索/筛选UI | |
| List + Card 混排 | 每行展示更多字段，卡片式浏览 | |

**User's choice:** ProTable
**Notes:** 一致性高，与 Ant Design Pro 生态集成好

---

| Option | Description | Selected |
|--------|-------------|----------|
| 表格顶部工具栏 | 批量上架/下架/删除在工具栏，勾选后激活（推荐） | ✓ |
| 行内多选 + 底部浮动 | 勾选后底部弹出操作栏 | |
| 右键上下文菜单 | 选中行右键弹出（隐蔽，高级用户） | |

**User's choice:** 表格顶部工具栏

---

| Option | Description | Selected |
|--------|-------------|----------|
| Modal 弹窗确认 | 确定要上架选中的15件商品？（推荐，有明确提示） | ✓ |
| Inline 行内确认 | 直接在工具栏展开输入/确认 | |
| Toast 倒计时确认 | 操作后3秒可撤回 | |

**User's choice:** Modal 弹窗确认

---

| Option | Description | Selected |
|--------|-------------|----------|
| 数字分页（1 2 3 ... 10） | 经典设计，跳转到任意页（推荐） | ✓ |
| 加载更多（Load More） | 无固定页数，适合数据流式加载 | |
| 无限滚动 + 回到顶部 | 无刷新感，但定位困难 | |

**User's choice:** 数字分页

---

## 商品编辑形态

| Option | Description | Selected |
|--------|-------------|----------|
| Modal 弹窗编辑 | 右侧滑出或居中弹出，无需跳页（推荐） | ✓ |
| 独立页面（Page） | 完整页面路由，适合复杂表单 | |
| Drawer 抽屉编辑 | 类似 Modal 但从右侧滑出，可更大 | |

**User's choice:** Let Claude decide → Modal 弹窗编辑
**Notes:** 与 Ant Design Pro 生态集成好，同一页面操作不打断工作流

---

| Option | Description | Selected |
|--------|-------------|----------|
| 规格与商品同表单 | 一个弹窗内搞定，规格行内编辑（推荐） | ✓ |
| 独立规格管理子页面 | 先保存商品基本信息，再跳转管理规格 | |
| Tab 分页 | 弹窗内 Tab 切换：基础信息 \| 规格管理 \| 图片管理 | |

**User's choice:** 规格与商品同表单

---

| Option | Description | Selected |
|--------|-------------|----------|
| 单图上传（仅一张主图） | 简单直接 | |
| 多图上传（最多5张，支持拖拽排序） | 电商常见，图片质量影响转化（推荐） | ✓ |
| 图片裁剪 + 水印 | 上传后自动处理 | |

**User's choice:** 多图上传

---

## 订单价格修改

| Option | Description | Selected |
|--------|-------------|----------|
| 输入框直接修改 | 订单详情页金额旁显示可编辑输入框（推荐） | ✓ |
| Dialog 弹窗修改 | 点击改价弹出 Modal，填写金额+原因 | |
| 滑动条微调 | 金额范围有限时用，比如九折改价 | |

**User's choice:** 输入框直接修改

---

| Option | Description | Selected |
|--------|-------------|----------|
| 必须填写原因 + 确认 | 改价必须输入原因，含审计日志（推荐） | |
| 可选原因 + 确认 | 原因可填可不填 | ✓ |
| 直接修改无需确认 | 输入即生效，事后可查日志 | |

**User's choice:** 可选原因 + 确认

---

| Option | Description | Selected |
|--------|-------------|----------|
| 不允许改价低于成本价 | 系统校验，禁止亏本（推荐） | ✓ |
| 允许任意金额 | 自由改价，平台信任管理员 | |
| 允许下调不超过原价20% | 折中方案 | |

**User's choice:** 不允许改价低于成本价

---

## 优惠券发放方式

| Option | Description | Selected |
|--------|-------------|----------|
| 仅手动发放 | 管理员输入用户ID/手机号精确发放（推荐） | |
| 生成领取链接/码 + 手动发放 | 两种都支持（更多玩法） | ✓ |
| 仅公开领取 | 生成领取入口，用户自主领取 | |

**User's choice:** 生成领取链接/码 + 手动发放

---

| Option | Description | Selected |
|--------|-------------|----------|
| 一次性链接/码 | 每个码只能用一次，用完失效（推荐） | |
| 永久领取链接 | 可重复使用，适合公开推广 | |
| 限时领取链接 | 设定时间段内可领取，过期失效 | ✓ |

**User's choice:** 限时领取链接

---

| Option | Description | Selected |
|--------|-------------|----------|
| 不通知 | 用户自己查，主动权在平台 | |
| 站内信/通知 | 有新优惠时通知用户（推荐） | ✓ |
| 微信服务号模板消息 | 需配置模板ID，更主动 | |

**User's choice:** 站内信/通知

---

## Banner 图片上传

| Option | Description | Selected |
|--------|-------------|----------|
| 单 Banner 管理 | 首页顶部只显示一张轮播图（简单） | |
| 多 Banner 管理（最多5张，可排序） | 多张轮播，支持拖拽排序（推荐） | ✓ |
| 分组管理 | 多位置各有多张 Banner | |

**User's choice:** 多 Banner 管理

---

| Option | Description | Selected |
|--------|-------------|----------|
| 仅支持商品详情页跳转 | 输入商品ID，落地到商品页 | |
| 支持商品 + 分类页跳转 | 链接类型选择商品或分类（推荐） | ✓ |
| 支持任意页面路径跳转 | 可输入任意页面路径（最灵活但风险高） | |

**User's choice:** 支持商品 + 分类页跳转

---

| Option | Description | Selected |
|--------|-------------|----------|
| 拖拽排序 | 鼠标拖动调整顺序（推荐） | ✓ |
| 上下箭头按钮 | 点击箭头移动位置 | |
| 输入排序权重值 | 每个 Banner 设排序值 | |

**User's choice:** 拖拽排序

---

## Claude's Discretion

- 商品列表搜索：ProTable 内置搜索栏，支持关键词搜索
- 订单列表状态筛选：5个Tab + 日期范围筛选
- 优惠券有效期配置：创建时设置生效时间/失效时间
- 商品编辑形态：Modal 弹窗编辑（用户选择 Let Claude decide）

## Deferred Ideas

- 商品列表高级搜索（多条件组合筛选）— Phase 11+
- 订单导出功能（Excel/CSV）— Phase 11+
- 管理员权限控制 UI — 后端复用平台用户体系，前端暂不实现 RBAC UI