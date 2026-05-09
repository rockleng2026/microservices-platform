---
phase: "10"
plan: "ADMIN-10"
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/mall-admin-web/src/pages/Banners/index.tsx
  - zlt-web/mall-admin-web/src/pages/Banners/components/BannerCard.tsx
  - zlt-web/mall-admin-web/src/pages/Banners/components/BannerModal.tsx
  - zlt-web/mall-admin-web/src/pages/Banners/services/banners.ts
  - zlt-web/mall-admin-web/src/stores/useStore.ts
  - zlt-web/mall-admin-web/src/config/api.ts
autonomous: true
requirements:
  - ADMIN-10-01
  - ADMIN-10-02
  - ADMIN-10-03
  - ADMIN-10-04
  - ADMIN-10-05
user_setup: []
must_haves:
  truths:
    - "Admin can view banner list with drag-sort reordering"
    - "Admin can create a new banner with title, image, link type, and sort order"
    - "Admin can edit an existing banner"
    - "Admin can delete a banner with confirmation"
    - "Admin can enable or disable a banner with a toggle switch"
    - "Admin cannot add more than 5 banners (UI-level enforcement)"
  artifacts:
    - path: "zlt-web/mall-admin-web/src/pages/Banners/index.tsx"
      provides: "Banner list with drag-sort, max 5 limit, enable/disable toggle"
      min_lines: 200
    - path: "zlt-web/mall-admin-web/src/pages/Banners/components/BannerModal.tsx"
      provides: "Banner create/edit Modal with link type selection"
      min_lines: 150
    - path: "zlt-web/mall-admin-web/src/pages/Banners/components/BannerCard.tsx"
      provides: "Banner card with drag handle, thumbnail, status switch"
      min_lines: 80
    - path: "zlt-web/mall-admin-web/src/pages/Banners/services/banners.ts"
      provides: "Banner API service layer"
      min_lines: 60
  key_links:
    - from: "zlt-web/mall-admin-web/src/pages/Banners/index.tsx"
      to: "zlt-web/mall-admin-web/src/pages/Banners/components/BannerModal.tsx"
      via: "Button onClick opens create/edit Modal"
    - from: "zlt-web/mall-admin-web/src/pages/Banners/index.tsx"
      to: "/api/mall/admin/banner/{id}/sort/{sort}"
      via: "PUT on drag-sort reorder"
    - from: "zlt-web/mall-admin-web/src/pages/Banners/index.tsx"
      to: "/api/mall/admin/banner"
      via: "PUT to update banner status via toggle"
---

<objective>
实现轮播图管理模块（ADMIN-10）：可拖拽排序的 Banner 列表、创建/编辑 Banner Modal、状态启用/禁用、最多5张限制。

Purpose: 为商城系统提供 Banner 管理功能，满足 ADMIN-10-01~05 共5个需求。
Output: Banner 列表页（拖拽排序）、创建/编辑 Modal、启用/禁用切换、最多5张限制。
</objective>

<context>
@.planning/REQUIREMENTS.md (ADMIN-10 requirements)
@.planning/phases/10-管理后台核心模块/10-RESEARCH.md (Backend API analysis for AdminBannerController)
@.planning/phases/10-管理后台核心模块/10-CONTEXT.md
@zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx (参考模式)

# Locked Decisions (MUST implement)
- D-13: Banner 数量：多Banner管理（最多5张），可排序
- D-14: Banner 链接：支持商品详情页 + 分类页两种跳转类型
- D-15: Banner 排序：拖拽排序
</context>

<interfaces>
<!-- Key types from mall-center backend (per RESEARCH.md) -->

BannerDTO (from GET /api/mall/admin/banner/list):
```typescript
interface BannerDTO {
  id: Long;
  title: string;
  imageUrl: string;
  linkType: Integer;      // 1=goods, 2=external
  goodsId: Long;          // linkType=1
  externalUrl: string;   // linkType=2
  sort: Integer;
  status: Integer;        // 0=禁用, 1=启用
}
```

Banner API (AdminBannerController):
- GET /api/mall/admin/banner/list — returns BannerDTO[] (no pagination, max 5 enforced at service layer)
- POST /api/mall/admin/banner — accepts BannerDTO (without id for create)
- PUT /api/mall/admin/banner — accepts BannerDTO (with id for update)
- DELETE /api/mall/admin/banner/{id}
- PUT /api/mall/admin/banner/{id}/sort/{sort} — single item sort update

# Banner count enforcement
Backend does NOT enforce max 5 at DB level — frontend MUST enforce UI-level.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Banner 列表页（拖拽排序）</name>
  <files>zlt-web/mall-admin-web/src/pages/Banners/index.tsx, zlt-web/mall-admin-web/src/pages/Banners/services/banners.ts</files>
  <action>
    创建 Banner 列表页（NOT ProTable — 使用拖拽排序列表）：

    1. src/pages/Banners/services/banners.ts（API 服务层）：
       - GET /api/mall/admin/banner/list 返回 BannerDTO[]
       - POST /api/mall/admin/banner 接受 BannerDTO
       - PUT /api/mall/admin/banner 接受 BannerDTO (with id)
       - DELETE /api/mall/admin/banner/{id}
       - PUT /api/mall/admin/banner/{id}/sort/{sort} 更新单个排序

    2. src/pages/Banners/index.tsx（Banner 列表页）：
       - NOT ProTable — 使用 @dnd-kit/sortable 或 react-sortable-hoc 实现拖拽排序
       - 使用 antd Card 或 List 展示 Banner 列表
       - 每行显示：
         - 拖拽手柄（DragHandle 图标，左侧）
         - 缩略图（80x80）
         - 标题
         - 链接类型（商品/外部链接）
         - 排序号
         - 状态（启用/禁用，Switch 切换）
       - 工具栏："添加 Banner" 按钮 → 打开 BannerModal
       - 最大数量限制：最多5张
         - 如果已有5张 Banner，"添加 Banner" 按钮 disabled
         - 提示："最多添加5张Banner"
       - 拖拽排序结束：
         - 提取新排序的 Banner ID 数组
         - 依次调用 PUT /{id}/sort/{newSort} 更新每个 Banner 的排序
         - 顺序调用（5个Banner最多5次调用，可接受）

    3. 更新 src/config/api.ts 添加 Banner 相关 API 常量
    4. 更新 src/stores/useStore.ts 添加 banners 状态和 fetchBanners、updateSort 等方法
  </action>
  <verify>
    <automated>grep -l "Sortable" zlt-web/mall-admin-web/src/pages/Banners/index.tsx && grep -c "max.*5" zlt-web/mall-admin-web/src/pages/Banners/index.tsx</automated>
  </verify>
  <done>Banner 列表页完成，支持拖拽排序，ADMIN-10-04 满足</done>
</task>

<task type="auto">
  <name>Task 2: 创建/编辑 Banner Modal</name>
  <files>zlt-web/mall-admin-web/src/pages/Banners/components/BannerModal.tsx</files>
  <action>
    创建 Banner 创建/编辑 Modal：

    1. src/pages/Banners/components/BannerModal.tsx：
       - 使用 antd Modal + Form
       - 模式：create（新建）| edit（编辑，传入 BannerDTO）
       - 宽度：480px
       - 表单字段：
         - title (Banner 标题，Input，必填)
         - imageUrl (Banner 图片，Upload 或 Input URL)
           - 使用 ImageUploader 组件（参考 Goods 的多图上传，限制1张）
         - linkType (链接类型：Radio，1=商品 2=外部链接)
         - goodsId (商品ID，InputNumber，linkType=1 时显示)
           - 需调用商品搜索接口或简单输入
         - externalUrl (外部链接URL，Input，linkType=2 时显示)
       - 保存逻辑：
         - create 模式：POST /api/mall/admin/banner
         - edit 模式：PUT /api/mall/admin/banner
         - 成功后关闭 Modal，刷新列表

    2. BannerCard 组件（可选，抽取单个 Banner 卡片逻辑）：
       - src/pages/Banners/components/BannerCard.tsx
       - 显示拖拽手柄、图片缩略图、标题、链接类型、状态开关
  </action>
  <verify>
    <automated>grep -l "BannerModal" zlt-web/mall-admin-web/src/pages/Banners/index.tsx && grep -c "linkType" zlt-web/mall-admin-web/src/pages/Banners/components/BannerModal.tsx</automated>
  </verify>
  <done>创建/编辑 Banner Modal 完成，ADMIN-10-01/02 满足</done>
</task>

<task type="auto">
  <name>Task 3: 启用/禁用切换（ADMIN-10-05）</name>
  <files>zlt-web/mall-admin-web/src/pages/Banners/index.tsx</files>
  <action>
    实现 Banner 启用/禁用切换：

    1. 在 Banner 列表每行显示 Switch 组件（status 状态）：
       - status=1（启用）：Switch checked
       - status=0（禁用）：Switch unchecked
       - 切换时调用 PUT /api/mall/admin/banner（更新整个 BannerDTO，包含 status）

    2. 删除功能：
       - 每行显示删除按钮（Icon 或 TextButton）
       - 点击后 Modal.confirm 确认："确定要删除此 Banner 吗？"
       - 确认后调用 DELETE /api/mall/admin/banner/{id}
       - 成功后刷新列表
       - ADMIN-10-03 满足

    3. 确保删除后能再次添加 Banner（不超过5张限制）
  </action>
  <verify>
    <automated>grep -l "Switch" zlt-web/mall-admin-web/src/pages/Banners/index.tsx && grep -l "delete" zlt-web/mall-admin-web/src/pages/Banners/index.tsx</automated>
  </verify>
  <done>启用/禁用切换和删除功能完成，ADMIN-10-03/05 满足</done>
</task>

<task type="auto">
  <name>Task 4: 最多5张 Banner 限制（UI级强制）</name>
  <files>zlt-web/mall-admin-web/src/pages/Banners/index.tsx</files>
  <action>
    实现最多5张 Banner 的 UI 级限制：

    1. 在列表页顶部显示 Banner 数量提示：
       - "当前 {count}/5 个 Banner"
       - count >= 5 时："已达到最大数量限制，无法添加更多"

    2. "添加 Banner" 按钮逻辑：
       - banners.length >= 5 时，按钮 disabled
       - Tooltip 提示："最多添加5张Banner"

    3. 提示文案：
       - "最多5张Banner，建议尺寸 1920x400 或等比例图片"
  </action>
  <verify>
    <automated>grep -c "5" zlt-web/mall-admin-web/src/pages/Banners/index.tsx | head -3</automated>
  </verify>
  <done>最多5张 Banner 限制实现完成，D-13 满足</done>
</task>

</tasks>

<verification>
1. Banner 列表页可加载 Banner 数据
2. 拖拽排序后保存成功，顺序更新
3. 创建 Banner Modal 可正常提交
4. 编辑 Banner Modal 可修改并保存
5. Switch 切换启用/禁用状态成功
6. 删除 Banner 成功
7. 达到5张后无法继续添加
</verification>

<success_criteria>
| Requirement | What constitutes done |
|-------------|----------------------|
| ADMIN-10-01 | Create banner Modal submits via POST /banner |
| ADMIN-10-02 | Edit banner Modal pre-fills data and submits PUT /banner |
| ADMIN-10-03 | Delete banner calls DELETE /{id} |
| ADMIN-10-04 | Banner list uses drag-sortable (NOT ProTable) with @dnd-kit/sortable |
| ADMIN-10-05 | Enable/disable toggle uses Switch and PUT /banner |
</success_criteria>

<output>
After completion, create `.planning/phases/10-管理后台核心模块/10-ADMIN-10-SUMMARY.md`
</output>