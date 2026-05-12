---
phase: 15-管理后台前端UAT测试
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/IUserAddressService.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/UserAddressServiceImpl.java
  - zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts
  - zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx
autonomous: false
gap_closure: true
requirements:
  - ADMIN-08
---

<objective>
Add member address management functionality (Gap 3).

Purpose: Currently member management only has points adjustment. Need to add address management (view, add, edit, delete addresses) to the member page.

Output: Member page includes an "地址管理" tab showing member addresses with CRUD operations.
</objective>

<context>
@zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java (existing admin member controller - will add address endpoints here)
@zlt-business/mall-center/src/main/java/com/central/mall/service/IUserAddressService.java (service interface)
@zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallUserAddress.java (address entity - uses name/phone/detail fields)
@zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx

# Backend address service already exists (IUserAddressService.getByUserId), but NO admin endpoints exist
# Need to add admin address endpoints to AdminMemberController
# Frontend must use correct field names: name, phone, detail (NOT consigneeName, consigneePhone, detailAddress)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add admin address endpoints to AdminMemberController</name>
  <files>zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java</files>
  <read_first>
    - zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java
    - zlt-business/mall-center/src/main/java/com/central/mall/service/IUserAddressService.java
  </read_first>
  <action>
    Add admin address management endpoints to AdminMemberController. These endpoints allow admin to view/edit/delete any user's addresses without ownership checks.

    Add these imports:
    ```java
    import com.central.mall.model.entity.MallUserAddress;
    import com.central.mall.service.IUserAddressService;
    import java.util.List;
    ```

    Add IUserAddressService to constructor injection (add field and constructor param):
    ```java
    private final IUserAddressService userAddressService;
    ```

    Add these new endpoint methods after the existing adjustPoints method (before closing brace):

    ```java
    @GetMapping("/{userId}/addresses")
    @Operation(summary = "获取会员地址列表")
    public Result<List<MallUserAddress>> getMemberAddresses(@PathVariable Long userId) {
        List<MallUserAddress> addresses = userAddressService.getByUserId(userId);
        return Result.succeed(addresses);
    }

    @PostMapping("/{userId}/address")
    @Operation(summary = "新增会员地址")
    public Result<Void> addMemberAddress(@PathVariable Long userId, @RequestBody MallUserAddress address) {
        address.setUserId(userId);
        address.setTenantId(SecurityContextHolder.getTenantId());
        userAddressService.save(address);
        return Result.succeed();
    }

    @PutMapping("/address/{id}")
    @Operation(summary = "修改会员地址")
    public Result<Void> updateMemberAddress(@PathVariable Long id, @RequestBody MallUserAddress address) {
        MallUserAddress existing = userAddressService.getById(id);
        if (existing == null) {
            return Result.failed("地址不存在");
        }
        address.setId(id);
        userAddressService.updateById(address);
        return Result.succeed();
    }

    @DeleteMapping("/address/{id}")
    @Operation(summary = "删除会员地址")
    public Result<Void> deleteMemberAddress(@PathVariable Long id) {
        userAddressService.removeById(id);
        return Result.succeed();
    }
    ```

    Note: These endpoints follow the existing admin pattern at /api/mall/admin/member/{userId}/addresses
  </action>
  <verify>
    <automated>grep -c "getMemberAddresses" zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java</automated>
    <automated>grep -c "POSTMapping.*address" zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java</automated>
  </verify>
  <done>
    AdminMemberController has new endpoints: GET /{userId}/addresses, POST /{userId}/address, PUT /address/{id}, DELETE /address/{id}
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Verify backend address endpoints work</name>
  <what-built>Admin address endpoints added to AdminMemberController</what-built>
  <how-to-verify>
    1. Start the backend service (mall-center)
    2. Test GET /api/mall/admin/member/{userId}/addresses - should return empty array or existing addresses
    3. Test POST /api/mall/admin/member/{userId}/address with JSON body: {"name":"测试","phone":"13800138000","province":"北京","city":"北京市","district":"朝阳区","detail":"测试地址"}
    4. Verify the address was created
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

<task type="auto">
  <name>Task 3: Create member address service layer (frontend)</name>
  <files>zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts</files>
  <read_first>
    - zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx (to understand existing service patterns)
  </read_first>
  <action>
    Create new service file at `zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts` with correct backend API endpoints and field names.

    IMPORTANT: Backend uses MallUserAddress entity fields: name, phone, detail (NOT consigneeName, consigneePhone, detailAddress)

    Create the service file:
    ```typescript
    /**
     * Member Address API Service - ADMIN-08
     * Address management for members in admin panel
     * Backend endpoint: /api-mall/api/mall/admin/member/{userId}/addresses
     */
    import { request } from '@/utils/request';

    // Address DTO - matches MallUserAddress entity
    export interface MemberAddressDTO {
      id: number;
      userId: number;
      name: string;
      phone: string;
      province: string;
      city: string;
      district: string;
      detail: string;
      isDefault: number;
      createTime: string;
      updateTime: string;
    }

    // Create/Update address params - matches MallUserAddress entity fields
    export interface AddressParams {
      name: string;
      phone: string;
      province: string;
      city: string;
      district: string;
      detail: string;
      isDefault?: number;
    }

    export interface ApiResponse<T> {
      code: number;
      msg?: string;
      datas?: T;
      data?: T;
    }

    /**
     * Get addresses for a specific user
     * Endpoint: GET /api-mall/api/mall/admin/member/{userId}/addresses
     */
    export async function getMemberAddresses(userId: number): Promise<MemberAddressDTO[]> {
      const response = await request<ApiResponse<MemberAddressDTO[]>>(
        `/api-mall/api/mall/admin/member/${userId}/addresses`,
        { method: 'GET' }
      );
      return response?.datas || response?.data || [];
    }

    /**
     * Create address for member
     * Endpoint: POST /api-mall/api/mall/admin/member/{userId}/address
     */
    export async function createMemberAddress(userId: number, params: AddressParams): Promise<boolean> {
      const response = await request<ApiResponse<boolean>>(
        `/api-mall/api/mall/admin/member/${userId}/address`,
        {
          method: 'POST',
          data: params,
        }
      );
      return response?.datas || response?.data || false;
    }

    /**
     * Update member address
     * Endpoint: PUT /api-mall/api/mall/admin/member/address/{id}
     */
    export async function updateMemberAddress(addressId: number, params: AddressParams): Promise<boolean> {
      const response = await request<ApiResponse<boolean>>(
        `/api-mall/api/mall/admin/member/address/${addressId}`,
        {
          method: 'PUT',
          data: params,
        }
      );
      return response?.datas || response?.data || false;
    }

    /**
     * Delete member address
     * Endpoint: DELETE /api-mall/api/mall/admin/member/address/{id}
     */
    export async function deleteMemberAddress(addressId: number): Promise<boolean> {
      const response = await request<ApiResponse<boolean>>(
        `/api-mall/api/mall/admin/member/address/${addressId}`,
        { method: 'DELETE' }
      );
      return response?.datas || response?.data || false;
    }
    ```
  </action>
  <verify>
    <automated>test -f zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts && echo "EXISTS" || echo "MISSING"</automated>
    <automated>grep -c "getMemberAddresses" zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts</automated>
    <automated>grep -c "name.*phone.*detail" zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts</automated>
  </verify>
  <done>
    Address service file created with getMemberAddresses, createMemberAddress, updateMemberAddress, deleteMemberAddress functions. Uses correct field names (name, phone, detail).
  </done>
</task>

<task type="auto">
  <name>Task 4: Add address management tab to member page</name>
  <files>zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx</files>
  <read_first>
    - zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx (full file - to understand current structure)
  </read_first>
  <action>
    The member page currently only shows member list with points adjustment. Add a Tabs component with two tabs:
    - "积分管理" (existing points adjustment - renamed)
    - "地址管理" (new tab)

    First, add new imports:
    ```typescript
    import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
    import type { MemberAddressDTO, AddressParams } from './services/address';
    import { getMemberAddresses, createMemberAddress, updateMemberAddress, deleteMemberAddress } from './services/address';
    ```

    Add state for address management after existing state:
    ```typescript
    const [activeTab, setActiveTab] = useState('points');
    const [addresses, setAddresses] = useState<MemberAddressDTO[]>([]);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [addressModalMode, setAddressModalMode] = useState<'create' | 'edit'>('create');
    const [editingAddress, setEditingAddress] = useState<MemberAddressDTO | null>(null);
    const [form] = Form.useForm();
    ```

    Add fetch addresses function:
    ```typescript
    const fetchAddresses = useCallback(async (userId: number) => {
      try {
        const data = await getMemberAddresses(userId);
        setAddresses(data);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    }, []);
    ```

    Add functions for address CRUD:
    ```typescript
    const handleAddAddress = (member: MemberDTO) => {
      setSelectedMember(member);
      setAddressModalMode('create');
      form.setFieldsValue({ name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: 0 });
      setAddressModalVisible(true);
    };

    const handleEditAddress = (address: MemberAddressDTO) => {
      setAddressModalMode('edit');
      setEditingAddress(address);
      form.setFieldsValue({
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        isDefault: address.isDefault,
      });
      setAddressModalVisible(true);
    };

    const handleDeleteAddress = async (addressId: number) => {
      try {
        await deleteMemberAddress(addressId);
        message.success('删除成功');
        if (selectedMember) fetchAddresses(selectedMember.userId);
      } catch (error) {
        message.error('删除失败');
      }
    };

    const handleSubmitAddress = async () => {
      try {
        const values = await form.validateFields();
        if (addressModalMode === 'create' && selectedMember) {
          await createMemberAddress(selectedMember.userId, values as AddressParams);
          message.success('添加成功');
        } else if (addressModalMode === 'edit' && editingAddress) {
          await updateMemberAddress(editingAddress.id, values as AddressParams);
          message.success('修改成功');
        }
        setAddressModalVisible(false);
        if (selectedMember) fetchAddresses(selectedMember.userId);
      } catch (error) {
        message.error('操作失败');
      }
    };
    ```

    Change the outer component to use Tabs. Replace the current return content with:
    ```typescript
    return (
      <div style={{ padding: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="积分管理" key="points">
            {/* Existing points management content */}
            <div style={{ marginBottom: 16 }}>
              <Button icon={<ReloadOutlined />} onClick={fetchMembers} loading={loading}>
                刷新
              </Button>
            </div>
            <Table ... (existing table content) />
            {/* Points Modal (existing) */}
          </Tabs.TabPane>
          <Tabs.TabPane tab="地址管理" key="addresses">
            {selectedMember ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => fetchAddresses(selectedMember.userId)}>
                      刷新
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddAddress(selectedMember)}>
                      新增地址
                    </Button>
                    <Text>用户ID: {selectedMember.userId}</Text>
                  </Space>
                </div>
                <Table
                  columns={addressColumns}
                  dataSource={addresses}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
                {/* Address Modal */}
                <Modal
                  title={addressModalMode === 'create' ? '新增地址' : '编辑地址'}
                  open={addressModalVisible}
                  onOk={handleSubmitAddress}
                  onCancel={() => setAddressModalVisible(false)}
                  destroyOnClose
                >
                  <Form form={form} layout="vertical">
                    <Form.Item name="name" label="收货人" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="province" label="省份" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="city" label="城市" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="district" label="区县" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="detail" label="详细地址" rules={[{ required: true }]}>
                      <Input.TextArea />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                请先在会员列表选择一个会员
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
    ```

    Add addressColumns definition (include columns for address table):
    ```typescript
    const addressColumns: ColumnsType<MemberAddressDTO> = [
      {
        title: '收货人',
        dataIndex: 'name',
        key: 'name',
        width: 120,
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
        width: 150,
      },
      {
        title: '地址',
        key: 'fullAddress',
        render: (_: unknown, record: MemberAddressDTO) => (
          `${record.province}${record.city}${record.district}${record.detail}`
        ),
      },
      {
        title: '默认',
        dataIndex: 'isDefault',
        key: 'isDefault',
        width: 80,
        align: 'center',
        render: (isDefault: number) => isDefault === 1 ? <Tag color="green">是</Tag> : '-',
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        render: (_: unknown, record: MemberAddressDTO) => (
          <Space size="small">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditAddress(record)}>
              编辑
            </Button>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAddress(record.id)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];
    ```

    Important: Keep all existing imports (Table, Tag, Card, Descriptions, etc.) and existing functionality intact. Note: Form fields use `name`, `phone`, `detail` to match backend MallUserAddress entity.
  </action>
  <verify>
    <automated>grep -c "addressColumns" zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx</automated>
    <automated>grep -c "getMemberAddresses" zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx</automated>
    <automated>grep -c "地址管理" zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx</automated>
  </verify>
  <done>
    Member page has Tabs with "积分管理" and "地址管理" tabs. Address management tab shows address list with add/edit/delete for selected member. Uses correct field names (name, phone, detail).
  </done>
</task>

</tasks>

<must_haves>
  truths:
    - "客户地址管理：管理后台能看到并管理客户的收货地址（新增、编辑、删除）"
  artifacts:
    - path: "zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMemberController.java"
      provides: "Admin address API endpoints"
      contains: "getMemberAddresses, addMemberAddress, updateMemberAddress, deleteMemberAddress"
    - path: "zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts"
      provides: "Address CRUD API functions"
    - path: "zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx"
      provides: "Address management tab with full CRUD"
  key_links:
    - from: "zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts"
      to: "/api-mall/api/mall/admin/member/{userId}/addresses"
      via: "HTTP GET/POST/PUT/DELETE calls"
    - from: "zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx"
      to: "zlt-web/portal-web/src/pages/MallAdmin/Member/services/address.ts"
      via: "imports getMemberAddresses, createMemberAddress, etc."
</must_haves>

<verification>
1. Backend has admin address endpoints at /api/mall/admin/member/{userId}/addresses
2. Member page shows two tabs: "积分管理" and "地址管理"
3. Selecting a member in the list, then switching to "地址管理" tab shows address list
4. "新增地址" button opens modal with form fields: name, phone, province, city, district, detail
5. Address table shows: 收货人, 联系电话, 完整地址, 默认, 操作(编辑/删除)
6. Delete address shows confirmation and deletes via API
</verification>

<success_criteria>
- Backend admin address endpoints exist and work
- Member page displays with two tabs
- Address management tab shows addresses for selected member
- Add/Edit/Delete address operations work
- Backend API calls made to correct endpoints (name/phone/detail fields)
</success_criteria>

<output>
After completion, create `.planning/phases/15-管理后台前端UAT测试/15-ADMIN-UAT-03-SUMMARY.md`
</output>
