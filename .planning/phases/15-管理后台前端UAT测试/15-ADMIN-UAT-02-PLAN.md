---
phase: 15-管理后台前端UAT测试
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts
  - zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx
autonomous: true
gap_closure: true
requirements:
  - ADMIN-03-02
---

<objective>
Fix order detail page blank issue (Gap 1) and add shipment functionality (Gap 2).

Purpose: Order detail page shows blank because frontend service layer expects flat OrderDetailDTO but backend returns nested Map. Shipment button missing from both order list and detail pages.

Output: Order detail displays correctly with order info, address, items, payment and shipping. Shipment button appears for PAID orders.
</objective>

<context>
@zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts
@zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx
@zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx
@zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java (lines 203-231)

# Backend getOrderDetail returns Map with keys: order, items, delivery, address
# Frontend OrderDetailDTO expects flat structure with orderNo, statusDesc, etc.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix order detail data parsing in frontend service</name>
  <files>zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts</files>
  <read_first>
    - zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts (lines 166-172 for getOrderDetail implementation)
    - zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts (lines 75-101 for OrderDetailDTO type definition)
  </read_first>
  <action>
    The backend returns `{order: MallOrder, items: [...], delivery: {...}, address: {...}}` as `datas` in Result wrapper. The current `getOrderDetail` returns this Map directly instead of transforming it to flat `OrderDetailDTO`.

    Update `getOrderDetail` function to transform the nested Map response into flat `OrderDetailDTO`:

    ```typescript
    export async function getOrderDetail(id: number): Promise<OrderDetailDTO | null> {
      const response = await request<{ datas?: any }>(`/api-mall/api/mall/admin/order/${id}`, {
        method: 'GET',
      });
      const raw = response?.datas || response?.data || response;
      if (!raw || !raw.order) return null;

      const order = raw.order;
      return {
        id: order.id,
        orderNo: order.orderNo,
        userId: order.userId,
        goodsType: order.goodsType,
        goodsTypeDesc: order.goodsTypeName || (order.goodsType === 1 ? '实物商品' : '虚拟商品'),
        totalAmount: order.totalAmount,
        freightAmount: order.freightAmount || '0',
        payAmount: order.payAmount,
        status: order.status,
        statusDesc: order.statusName || ORDER_STATUS_TEXT[order.status] || '未知',
        remark: order.remark || '',
        payTime: order.payTime || '',
        shipTime: order.shipTime || '',
        completeTime: order.completeTime || '',
        createTime: order.createTime,
        // Address (physical goods)
        addressId: raw.address?.id || order.addressId || 0,
        addressName: raw.address?.consigneeName || order.consigneeName || '',
        addressPhone: raw.address?.consigneePhone || order.consigneePhone || '',
        addressDetail: raw.address?.detailAddress || order.detailAddress || '',
        // Items
        items: (raw.items || []).map((item: any) => ({
          id: item.id,
          goodsId: item.goodsId,
          goodsName: item.goodsName,
          skuId: item.skuId,
          specs: item.specs || '{}',
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          image: item.image || '',
        })),
        // Delivery
        delivery: raw.delivery ? {
          expressCode: raw.delivery.expressCode || '',
          expressName: raw.delivery.expressName || '',
          waybillNo: raw.delivery.waybillNo || '',
          createTime: raw.delivery.createTime || '',
        } : null,
      };
    }
    ```

    Keep all other existing exports unchanged (ORDER_STATUS, ORDER_STATUS_TEXT, getOrderList, adjustOrderPrice, addAdminRemark, closeOrder, shipOrder, etc.).
  </action>
  <verify>
    <automated>grep -c "return {" zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts</automated>
    <automated>grep -c "raw.order" zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts</automated>
  </verify>
  <done>
    getOrderDetail transforms backend nested Map to flat OrderDetailDTO. Order detail page can render order info, items, address, delivery data.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add shipment button to order list page for PAID orders</name>
  <files>zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx</files>
  <read_first>
    - zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx (lines 113-129 for operation column definition)
    - zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts (lines 218-229 for shipOrder API)
  </read_first>
  <action>
    The order list page operation column only has "查看详情" button. Add shipment button for PAID (status=2) orders.

    Import shipment related items at top of file:
    ```typescript
    import { ShoppingCartOutlined } from '@ant-design/icons';
    ```

    Modify the operation column render function (lines 118-127) to add shipment button:

    ```typescript
    render: (_: unknown, record: OrderListDTO) => (
      <Space size="small">
        {record.status === ORDER_STATUS.PAID && (
          <Button
            type="link"
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleShipOrder(record)}
          >
            发货
          </Button>
        )}
        <Button
          type="link"
          size="small"
          icon={<FileTextOutlined />}
          onClick={() => navigate(`/mall-admin/orders/detail/${record.id}`)}
        >
          查看详情
        </Button>
      </Space>
    ),
    ```

    Add handler function before the return statement:

    ```typescript
    // Handle ship order click - navigate to detail page with shipment modal
    const handleShipOrder = (record: OrderListDTO) => {
      navigate(`/mall-admin/orders/detail/${record.id}?action=ship`);
    };
    ```
  </action>
  <verify>
    <automated>grep -c "handleShipOrder" zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx</automated>
    <automated>grep -c "ShoppingCartOutlined" zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx</automated>
    <automated>grep -c "ORDER_STATUS.PAID" zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx</automated>
  </verify>
  <done>
    Order list page shows "发货" button for PAID orders. Clicking navigates to order detail page.
  </done>
</task>

<task type="auto">
  <name>Task 3: Add shipment modal to order detail page</name>
  <files>zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx</files>
  <read_first>
    - zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx (lines 143-265 for return JSX structure)
    - zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts (lines 218-229 for shipOrder API)
    - zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts (lines 120-125 for ShipOrderParams type)
  </read_first>
  <action>
    The order detail page only has "返回" button. Add shipment button and modal for PAID orders. Check URL query param `?action=ship` to auto-open modal.

    Add to imports at top:
    ```typescript
    import { ShoppingCartOutlined, CheckCircleFilled } from '@ant-design/icons';
    import { Modal, Form, Input, Select } from 'antd';
    import { shipOrder } from '../services/orders';
    ```

    Add state and form for shipment modal after existing state declarations:
    ```typescript
    const [shipModalVisible, setShipModalVisible] = useState(false);
    const [shipping, setShipping] = useState(false);
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();
    ```

    Add effect to check for ship action on mount:
    ```typescript
    useEffect(() => {
      if (searchParams.get('action') === 'ship' && order?.status === ORDER_STATUS.PAID) {
        setShipModalVisible(true);
      }
    }, [searchParams, order]);
    ```

    Add shipment button after the back button in the Space:
    ```typescript
    {order.status === ORDER_STATUS.PAID && !order.shipTime && (
      <Button
        type="primary"
        icon={<ShoppingCartOutlined />}
        onClick={() => {
          form.setFieldsValue({ expressCode: '', expressName: '', waybillNo: '' });
          setShipModalVisible(true);
        }}
      >
        发货
      </Button>
    )}
    ```

    Add shipment Modal before the closing </div> of main container:
    ```typescript
    <Modal
      title="订单发货"
      open={shipModalVisible}
      onOk={async () => {
        try {
          const values = await form.validateFields();
          setShipping(true);
          await shipOrder(order!.id, {
            expressCode: values.expressCode,
            expressName: values.expressName,
            waybillNo: values.waybillNo,
          });
          message.success('发货成功');
          setShipModalVisible(false);
          // Refresh order detail
          const data = await getOrderDetail(order!.id);
          if (data) setOrder(data);
        } catch (error) {
          console.error('Failed to ship order:', error);
          message.error('发货失败');
        } finally {
          setShipping(false);
        }
      }}
      onCancel={() => setShipModalVisible(false)}
      confirmLoading={shipping}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="expressCode"
          label="快递公司编码"
          rules={[{ required: true, message: '请输入快递公司编码' }]}
        >
          <Input placeholder="例如: yto, zto, sf" />
        </Form.Item>
        <Form.Item
          name="expressName"
          label="快递公司名称"
          rules={[{ required: true, message: '请输入快递公司名称' }]}
        >
          <Input placeholder="例如: 圆通速递, 中通快递, 顺丰速运" />
        </Form.Item>
        <Form.Item
          name="waybillNo"
          label="运单号"
          rules={[{ required: true, message: '请输入运单号' }]}
        >
          <Input placeholder="请输入运单号" />
        </Form.Item>
      </Form>
    </Modal>
    ```

    Note: Keep existing imports (Button, Space already imported), don't duplicate imports.
  </action>
  <verify>
    <automated>grep -c "shipModalVisible" zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx</automated>
    <automated>grep -c "shipOrder" zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx</automated>
    <automated>grep -c "expressCode" zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx</automated>
  </verify>
  <done>
    Order detail page shows "发货" button for PAID orders without shipping info. Modal allows input of express code, name, and waybill number.
  </done>
</task>

</tasks>

<must_haves>
  truths:
    - "订单详情页显示完整订单信息（基本信息、收货地址、商品清单、支付信息、物流信息）"
    - "订单发货功能：可对已付款订单填写物流信息（快递公司、编码、运单号）并提交"
  artifacts:
    - path: "zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts"
      provides: "getOrderDetail transforms nested Map to flat DTO"
    - path: "zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx"
      provides: "Order detail display + shipment modal for PAID orders"
    - path: "zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx"
      provides: "发货 button for PAID orders in list page"
  key_links:
    - from: "zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts"
      to: "zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx"
      via: "getOrderDetail() return value used as OrderDetailDTO"
    - from: "zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx"
      to: "zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx"
      via: "navigate with ?action=ship query param"
</must_haves>

<verification>
1. Order detail page loads and displays: orderNo, status, totalAmount, payAmount, createTime
2. For physical goods orders: shows 收货地址 card with name, phone, detail address
3. Shows 订单商品 card with items table (goodsName, specs, price, quantity, subtotal)
4. For paid orders: shows "发货" button
5. Clicking 发货 opens modal with expressCode, expressName, waybillNo fields
6. Submitting shipment form calls shipOrder API and refreshes detail
</verification>

<success_criteria>
- Order detail page displays all order information (not blank)
- Shipment button visible in list page for PAID orders
- Shipment button visible in detail page for PAID orders without shipping
- Shipment modal allows input and submission of logistics info
- API call to /api-mall/api/mall/admin/order/{id}/ship with correct payload
</success_criteria>

<output>
After completion, create `.planning/phases/15-管理后台前端UAT测试/15-ADMIN-UAT-02-SUMMARY.md`
</output>
