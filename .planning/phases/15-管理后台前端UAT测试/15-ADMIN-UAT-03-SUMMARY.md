---
phase: 15-管理后台前端UAT测试
plan: 03
status: complete
started: 2026-05-12
completed: 2026-05-12
type: execute
wave: 1
gap_closure: true
source: 15-ADMIN-UAT-01-UAT.md (Gap 3)
---

## Summary

为会员管理页面添加地址管理功能（Gap 3）。

**Gap 3 根因：** 会员管理页面只有积分调整操作，缺少客户地址管理模块（新增/编辑/删除地址）。

## Changes Made

### 1. `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java`

新增 4 个管理员地址管理端点：

```java
@GetMapping("/{userId}/addresses")
@Operation(summary = "获取会员地址列表")
// 返回该用户所有地址

@PostMapping("/{userId}/address")
@Operation(summary = "新增会员地址")
// body: MallUserAddress (setTenantId, save)

@PutMapping("/address/{id}")
@Operation(summary = "修改会员地址")
// body: MallUserAddress (updateById)

@DeleteMapping("/address/{id}")
@Operation(summary = "删除会员地址")
// removeById
```

### 2. `zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts` (新建)

前端地址服务层，字段名与 MallUserAddress 实体一致（name/phone/detail）：

```typescript
export interface MemberAddressDTO {
  id, userId, name, phone, province, city, district, detail, isDefault, createTime, updateTime
}
export async function getMemberAddresses(userId): Promise<MemberAddressDTO[]>
export async function createMemberAddress(userId, params): Promise<boolean>
export async function updateMemberAddress(addressId, params): Promise<boolean>
export async function deleteMemberAddress(addressId): Promise<boolean>
```

### 3. `zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx`

将页面改为 Tabs 布局（积分管理 + 地址管理），地址管理 Tab 包含：

```typescript
// 状态：activeTab, addresses, addressModalVisible, addressModalMode, editingAddress
// 地址列表 Table（name, phone, 完整地址, isDefault, 操作）
// 新增/编辑 Modal（name, phone, province, city, district, detail）
// 支持选中会员后加载其地址列表
```

## Verification

- ✅ 会员页面显示两个 Tab：积分管理、地址管理
- ✅ 选择会员后切换到地址管理 Tab 显示该用户地址列表
- ✅ 可新增、编辑、删除地址
- ✅ 字段名与后端 MallUserAddress 一致（name/phone/detail）

## Files Modified

- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java`
- `zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts` (新建)
- `zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx`

## Commit

已合并到 Phase 15 批量提交 (e161fcf03)
