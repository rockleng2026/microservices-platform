---
phase: "10"
plan: "ADMIN-02"
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/mall-admin-web/src/pages/Goods/index.tsx
  - zlt-web/mall-admin-web/src/pages/Goods/components/GoodsModal.tsx
  - zlt-web/mall-admin-web/src/pages/Goods/components/ImageUploader.tsx
  - zlt-web/mall-admin-web/src/pages/Goods/components/SkuEditor.tsx
  - zlt-web/mall-admin-web/src/pages/Goods/services/goods.ts
  - zlt-web/mall-admin-web/src/pages/Categories/index.tsx
  - zlt-web/mall-admin-web/src/pages/Categories/services/categories.ts
  - zlt-web/mall-admin-web/src/stores/useStore.ts
  - zlt-web/mall-admin-web/src/config/api.ts
autonomous: true
requirements:
  - ADMIN-02-01
  - ADMIN-02-02
  - ADMIN-02-03
  - ADMIN-02-04
  - ADMIN-02-05
  - ADMIN-02-06
  - ADMIN-02-07
  - ADMIN-02-08
  - ADMIN-02-09
  - ADMIN-02-10
user_setup: []
must_haves:
  truths:
    - "Admin can view paginated product list with search/filter by category/status"
    - "Admin can create a new product with name, description, price, stock, category, images, and type"
    - "Admin can edit existing product details in a Modal without page navigation"
    - "Admin can batch publish or unpublish selected products with confirmation"
    - "Admin can manage product categories with create/edit/delete/sort"
    - "Admin can upload up to 5 product images with drag-sort ordering"
    - "Admin can manage SKU specifications inline within the product edit Modal"
  artifacts:
    - path: "zlt-web/mall-admin-web/src/pages/Goods/index.tsx"
      provides: "Product ProTable list with search, filter, pagination, batch operations"
      min_lines: 200
    - path: "zlt-web/mall-admin-web/src/pages/Goods/components/GoodsModal.tsx"
      provides: "Product create/edit Modal with form, images, and SKU editor"
      min_lines: 300
    - path: "zlt-web/mall-admin-web/src/pages/Goods/components/ImageUploader.tsx"
      provides: "Multi-image uploader with max 5 files and drag-sort"
      min_lines: 150
    - path: "zlt-web/mall-admin-web/src/pages/Goods/components/SkuEditor.tsx"
      provides: "Inline SKU/spec editor within product Modal"
      min_lines: 150
    - path: "zlt-web/mall-admin-web/src/pages/Categories/index.tsx"
      provides: "Category ProTable with CRUD and drag-sort"
      min_lines: 150
    - path: "zlt-web/mall-admin-web/src/pages/Goods/services/goods.ts"
      provides: "Product API service layer with all CRUD operations"
      min_lines: 80
  key_links:
    - from: "zlt-web/mall-admin-web/src/pages/Goods/index.tsx"
      to: "zlt-web/mall-admin-web/src/pages/Goods/components/GoodsModal.tsx"
      via: "Button onClick opens Modal"
    - from: "zlt-web/mall-admin-web/src/pages/Goods/components/GoodsModal.tsx"
      to: "zlt-web/mall-admin-web/src/pages/Goods/components/ImageUploader.tsx"
      via: "import ImageUploader, pass maxFiles=5"
    - from: "zlt-web/mall-admin-web/src/pages/Goods/components/GoodsModal.tsx"
      to: "zlt-web/mall-admin-web/src/pages/Goods/components/SkuEditor.tsx"
      via: "import SkuEditor, embed in Modal form"
    - from: "zlt-web/mall-admin-web/src/pages/Goods/index.tsx"
      to: "/api/mall/admin/goods/batch/status"
      via: "PUT request on batch publish/unpublish"
---

<objective>
实现商品管理模块（ADMIN-02）：ProTable 列表页、Modal 新增/编辑商品（含多图上传和SKU规格管理）、批量上下架操作、分类管理、商品详情页。

Purpose: 为商城系统提供完整的商品管理功能，满足 ADMIN-02-01~10 共10个需求。
Output: 商品列表页（含搜索/筛选/分页）、商品新增/编辑 Modal（含图片上传和规格管理）、分类管理、批量操作。
</objective>

<context>
@.planning/REQUIREMENTS.md (ADMIN-02 requirements)
@.planning/phases/10-管理后台核心模块/10-RESEARCH.md
@.planning/phases/10-管理后台核心模块/10-CONTEXT.md
@zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx (参考 ProTable 模式)
@zlt-web/mall-admin-web/src/stores/useStore.ts (Zustand store 模式)
@zlt-web/mall-admin-web/src/config/api.ts (API 配置)
@zlt-web/mall-admin-web/src/services/admin/statistics.ts (service 层模式)

# Locked Decisions (MUST implement)
- D-01: ProTable 组件用于所有列表页
- D-02: 批量操作：顶部工具栏 + Modal 确认
- D-03: 数字分页（1 2 3 ... 10）
- D-04: 商品编辑用 Modal 弹窗（右侧滑出或居中弹出）
- D-05: 规格管理与商品同表单（一个弹窗内完成所有编辑）
- D-06: 多图上传（最多5张，支持拖拽排序）
</context>

<interfaces>
<!-- Key types from mall-center backend (per RESEARCH.md) -->

AdminGoodsDTO (from GET /api/mall/admin/goods/{id}):
```typescript
interface AdminGoodsDTO {
  id: Long;
  categoryId: Long;
  name: string;
  subTitle: string;
  mainImage: string;
  images: string;           // JSON array as string: "[\"url1\",\"url2\"]"
  detail: string;
  price: BigDecimal;
  goodsType: Integer;      // 1=physical, 2=virtual
  virtualUrl: string;
  virtualFileId: Long;
  virtualExpire: LocalDateTime;
  skus: SkuDTO[];
  status: Integer;         // 0=下架, 1=上架
  sort: Integer;
}
```

SkuDTO:
```typescript
interface SkuDTO {
  id: Long;
  skuCode: string;
  specs: string;           // JSON: "{\"颜色\":\"红色\",\"尺寸\":\"XL\"}"
  price: BigDecimal;
  stock: Integer;
  image: string;
  status: Integer;
}
```

AdminCategoryDTO (from GET /api/mall/admin/category/list):
```typescript
interface AdminCategoryDTO {
  id: Long;
  name: string;
  parentId: Long;
  sort: Integer;
  children?: AdminCategoryDTO[];
}
```

SpecDTO (from GET /api/mall/admin/spec/list):
```typescript
interface SpecDTO {
  id: Long;
  specName: string;
  values: SpecValueDTO[];
}
```

AdminGoodsDTO for list response (IPage):
```typescript
interface IPage<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: 商品列表页 ProTable（ADMIN-02-04）</name>
  <files>zlt-web/mall-admin-web/src/pages/Goods/index.tsx, zlt-web/mall-admin-web/src/pages/Goods/services/goods.ts</files>
  <action>
    创建商品列表页（ProTable + 搜索/筛选/批量操作）：

    1. src/pages/Goods/services/goods.ts（API 服务层）：
       - GET /api/mall/admin/goods/list (page, pageSize, keyword?, categoryId?, status?, goodsType?)
         返回: IPage<AdminGoodsDTO>
       - GET /api/mall/admin/goods/{id} 返回 AdminGoodsDTO（含 skus）
       - POST /api/mall/admin/goods (publish) 接受 AdminGoodsDTO
       - PUT /api/mall/admin/goods (update) 接受 AdminGoodsDTO
       - DELETE /api/mall/admin/goods/{id}
       - PUT /api/mall/admin/goods/batch/status 接受 {goodsIds: Long[], status: Integer}
       - GET /api/mall/admin/goods/detail/{id} 返回 AdminGoodsDTO

    2. src/pages/Goods/index.tsx（商品列表页）：
       - 使用 ProTable 组件，columns 包括：
         - dataIndex: id (key)
         - dataIndex: name (商品名称，copyable)
         - dataIndex: categoryId (分类，valueType: 'select')
         - dataIndex: price (价格，valueType: 'money')
         - dataIndex: goodsType (类型: 实物/虚拟，valueEnum)
         - dataIndex: status (状态: 上架/下架，valueEnum: {0: {text: '下架', status: 'Default'}, 1: {text: '上架', status: 'Success'}})
         - dataIndex: sort (排序号)
         - dataIndex: createTime (创建时间)
       - 搜索栏：keyword 关键词搜索、categoryId 下拉筛选、status 下拉筛选（全部/上架/下架）、goodsType 下拉筛选（实物/虚拟）
       - 工具栏（rowSelection + selectedRowKeys）：
         - "新建商品" 按钮 → 打开 GoodsModal
         - "批量上架" 按钮（选中时启用）→ Modal.confirm 确认后 PUT /batch/status {status: 1}
         - "批量下架" 按钮（选中时启用）→ Modal.confirm 确认后 PUT /batch/status {status: 0}
       - 分页：pageSize: 20，showSizeChanger: false
       - 行操作：编辑按钮（打开 GoodsModal）、删除按钮（Modal.confirm 后 DELETE）
       - rowKey="id"

    3. 更新 src/config/api.ts 添加商品相关 API 常量
    4. 更新 src/stores/useStore.ts 添加 goods 状态和 fetchGoodsList、publishGoods 等方法
  </action>
  <verify>
    <automated>grep -l "ProTable" zlt-web/mall-admin-web/src/pages/Goods/index.tsx && grep -c "valueEnum" zlt-web/mall-admin-web/src/pages/Goods/index.tsx</automated>
  </verify>
  <done>商品列表页 ProTable 完成，支持搜索/筛选/分页/批量操作，ADMIN-02-04 满足</done>
</task>

<task type="auto">
  <name>Task 2: 商品新增/编辑 Modal（ADMIN-02-01, ADMIN-02-02, ADMIN-02-08）</name>
  <files>zlt-web/mall-admin-web/src/pages/Goods/components/GoodsModal.tsx, zlt-web/mall-admin-web/src/pages/Goods/components/ImageUploader.tsx</files>
  <action>
    创建商品新增/编辑 Modal（ProForm + 多图上传 + SKU规格管理）：

    1. src/pages/Goods/components/GoodsModal.tsx：
       - 使用 antd Modal + ProForm
       - 宽度：720px（右侧滑出 Drawer 也可）
       - 模式：create（新建）| edit（编辑，传入 goodsDTO）
       - 表单字段：
         - name (商品名称，必填)
         - subTitle (副标题)
         - categoryId (分类，Select 加载分类树)
         - goodsType (商品类型：实物=1/虚拟=2，Radio)
         - price (价格，InputNumber，必填)
         - stock (总库存，当无规格时使用，InputNumber)
         - virtualUrl (虚拟商品URL，当 goodsType=2 时显示)
         - images (多图上传，见 ImageUploader 组件)
         - detail (商品详情，RichText 或 TextArea)
       - 保存逻辑：
         - create 模式：POST /api/mall/admin/goods
         - edit 模式：PUT /api/mall/admin/goods
         - 提交前解析 images 数组为 JSON 字符串
         - 成功后关闭 Modal，刷新 ProTable

    2. src/pages/Goods/components/ImageUploader.tsx（多图上传，支持拖拽排序）：
       - 使用 antd Upload + Draggable 列表
       - maxFiles: 5（超过5张时禁用上传）
       - 拖拽排序：使用 @dnd-kit/sortable 或 react-sortable-hoc
       - 显示已上传图片缩略图（80x80），带删除按钮
       - 上传接口：/file-center/api/upload（接收文件，返回 {datas: {url: string}}）
       - 已上传 URL 数组通过 onChange 回调传回父组件
       - 预览：大图预览（Image 组件）

    3. 分类数据加载：调用 GET /api/mall/admin/category/list 渲染级联选择或 Select
  </action>
  <verify>
    <automated>grep -l "ImageUploader" zlt-web/mall-admin-web/src/pages/Goods/components/GoodsModal.tsx && grep -c "maxFiles.*5" zlt-web/mall-admin-web/src/pages/Goods/components/ImageUploader.tsx</automated>
  </verify>
  <done>商品新增/编辑 Modal 完成，支持多图上传（最多5张，拖拽排序），ADMIN-02-01/02/08 满足</done>
</task>

<task type="auto">
  <name>Task 3: SKU规格编辑器（ADMIN-02-09, ADMIN-02-05/06 batch context）</name>
  <files>zlt-web/mall-admin-web/src/pages/Goods/components/SkuEditor.tsx</files>
  <action>
    创建 SKU 规格编辑器（与商品同表单 D-05）：

    1. src/pages/Goods/components/SkuEditor.tsx：
       - 显示规格选择后的 SKU 列表表格
       - 每行：规格组合（specs JSON 解析显示）、价格（InputNumber 可编辑）、库存（InputNumber 可编辑）、状态（开关）
       - 新增 SKU：点击"添加 SKU"按钮，打开 SKU 编辑行
       - 删除 SKU：行内删除按钮
       - 规格选择：当用户在 GoodsModal 中选择了规格模板（来自 GET /api/mall/admin/spec/list），生成 SKU 行
       - SkuDTO fields: specs (JSON string), price, stock, status, image
       - 规格组合展示：解析 specs JSON 为 "颜色:红色,尺寸:XL" 格式
       - 编辑模式下：从 goodsDTO.skus 加载已有 SKU 列表

    2. 规格模板选择（AdminSpecController）：
       - 调用 GET /api/mall/admin/spec/list 获取规格列表
       - 选中规格后，生成规格值矩阵，组合生成 SKU 行

    3. 批量上下架说明：batch 操作在列表页 toolbar 实现，不在 Modal 内
  </action>
  <verify>
    <automated>grep -l "SkuEditor" zlt-web/mall-admin-web/src/pages/Goods/components/GoodsModal.tsx && grep -c "specs" zlt-web/mall-admin-web/src/pages/Goods/components/SkuEditor.tsx</automated>
  </verify>
  <done>SKU 规格编辑器完成，与商品同表单，支持多规格组合，ADMIN-02-09 满足</done>
</task>

<task type="auto">
  <name>Task 4: 分类管理页面（ADMIN-02-07）</name>
  <files>zlt-web/mall-admin-web/src/pages/Categories/index.tsx, zlt-web/mall-admin-web/src/pages/Categories/services/categories.ts</files>
  <action>
    创建分类管理页面（ProTable + CRUD + 排序）：

    1. src/pages/Categories/services/categories.ts：
       - GET /api/mall/admin/category/list 返回 AdminCategoryDTO[]
       - POST /api/mall/admin/category 接受 {name, parentId?, sort?}
       - PUT /api/mall/admin/category 接受 {id, name, parentId?, sort?}
       - DELETE /api/mall/admin/category/{id}
       - PUT /api/mall/admin/category/sort 接受 List<Long>（排序后的 ID 数组）

    2. src/pages/Categories/index.tsx：
       - ProTable，columns: id, name, sort, parentId
       - 行操作：编辑（打开 Modal）、删除
       - 工具栏："新建分类" 按钮
       - 排序：拖拽排序（使用 @dnd-kit/sortable），拖拽结束后调用 PUT /sort
       - 显示树形结构：parentId 显示父分类名称，顶级显示 "顶级"
       - 支持新增顶级分类（parentId = null）和子分类（parentId = 父分类 id）
  </action>
  <verify>
    <automated>grep -l "category" zlt-web/mall-admin-web/src/pages/Categories/services/categories.ts && grep -c "sort" zlt-web/mall-admin-web/src/pages/Categories/index.tsx</automated>
  </verify>
  <done>分类管理页面完成，支持 CRUD 和拖拽排序，ADMIN-02-07 满足</done>
</task>

<task type="auto">
  <name>Task 5: 商品详情页（ADMIN-02-10）</name>
  <files>zlt-web/mall-admin-web/src/pages/Goods/detail.tsx</files>
  <action>
    创建商品详情页（只读查看）：

    1. src/pages/Goods/detail.tsx（商品详情页）：
       - 路由：/goods/detail/:id（需要在 .umirc.ts 中配置）
       - 调用 GET /api/mall/admin/goods/{id} 获取完整商品信息
       - 展示：
         - 商品基本信息（名称、副标题、分类、价格、类型）
         - 商品图片（主图 + 轮播图展示）
         - 商品详情（detail 字段渲染）
         - SKU 列表：规格组合、价格、库存、状态表格
       - 操作按钮：
         - "编辑" 按钮 → 打开 GoodsModal（预填充数据）
         - "上架" / "下架" 切换按钮 → 调用 PUT /{id}/status/{status}
         - "返回" 按钮 → history.back()
  </action>
  <verify>
    <automated>grep -l "goodsDetail" zlt-web/mall-admin-web/src/pages/Goods/detail.tsx && grep -c "skus" zlt-web/mall-admin-web/src/pages/Goods/detail.tsx</automated>
  </verify>
  <done>商品详情页完成，显示完整商品信息和 SKU 列表，ADMIN-02-10 满足</done>
</task>

</tasks>

<verification>
1. 商品列表页 ProTable 可加载商品数据，支持搜索/筛选/分页
2. 新建商品 Modal 可正常提交，商品出现在列表
3. 编辑商品 Modal 可修改并保存
4. 多图上传支持最多5张图片，拖拽排序生效
5. SKU 规格编辑在 Modal 内完成，支持多规格组合
6. 批量选中商品后可执行批量上架/下架操作
7. 分类管理支持 CRUD 和拖拽排序
8. 商品详情页正确显示商品完整信息和 SKU 列表
</verification>

<success_criteria>
| Requirement | What constitutes done |
|-------------|----------------------|
| ADMIN-02-01 | Create product modal submits POST /publish with all fields including images and skus |
| ADMIN-02-02 | Edit product modal pre-fills existing data and submits PUT /update |
| ADMIN-02-03 | Delete product triggers DELETE /{id} and removes from list |
| ADMIN-02-04 | ProTable list loads with pagination, keyword search, category/status filters |
| ADMIN-02-05 | Batch publish selects items and PUT /batch/status {status: 1} |
| ADMIN-02-06 | Batch unpublish selects items and PUT /batch/status {status: 0} |
| ADMIN-02-07 | Category ProTable supports create/edit/delete/sort |
| ADMIN-02-08 | Image uploader accepts up to 5 images with drag-sort |
| ADMIN-02-09 | SKU editor in same modal allows spec combinations with price/stock |
| ADMIN-02-10 | Product detail page shows full info and skus in read-only view |
</success_criteria>

<output>
After completion, create `.planning/phases/10-管理后台核心模块/10-ADMIN-02-SUMMARY.md`
</output>