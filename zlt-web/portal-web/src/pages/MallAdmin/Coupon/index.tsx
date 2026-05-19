/**
 * 优惠券管理页面 - ADMIN-07
 * Coupon template management (create, edit, publish, offline)
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button, Space, message, Modal, Form, Input, Select, InputNumber, Tag, Table, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, SendOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import { request } from '@/utils/request';

interface CouponTemplateDTO {
  id?: string;
  name: string;
  type: number;
  faceValue?: number;
  discountRate?: number;
  minAmount?: number;
  maxDiscount?: number;
  totalCount: number;
  remainCount: number;
  perUserLimit: number;
  validType: number;
  startTime?: string;
  endTime?: string;
  validDays?: number;
  status: number;
  createTime?: string;
}

const COUPON_TYPE_TEXT: Record<number, string> = {
  1: '满减券',
  2: '折扣券',
  3: '无门槛券',
};

const COUPON_STATUS_TEXT: Record<number, string> = {
  0: '未发布',
  1: '已发布',
  2: '已下架',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'default',
  1: 'success',
  2: 'orange',
};

/** 格式化日期显示 yyyy-MM-dd */
const formatDateForDisplay = (dateStr?: string): string => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10); // "2026-05-19T00:00:00" -> "2026-05-19"
};

/** 解析日期用于提交，自动补全时间 */
const parseDateForSubmit = (dateStr: string, isStartTime: boolean): string => {
  if (!dateStr) return '';
  const dateOnly = dateStr.substring(0, 10); // 提取 yyyy-MM-dd 部分
  return isStartTime ? `${dateOnly}T00:00:00` : `${dateOnly}T23:59:59`;
};

const CouponPage: React.FC = () => {
  const [templates, setTemplates] = useState<CouponTemplateDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CouponTemplateDTO | null>(null);
  const [form] = Form.useForm();

  // Fetch template list
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request<{ datas?: CouponTemplateDTO[] }>('/api-mall/api/mall/admin/coupon/template/list', {
        method: 'GET',
      });
      setTemplates(response.datas || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      message.error('加载优惠券模板失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Handle create
  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    form.setFieldsValue({
      type: 1,
      faceValue: 10,
      minAmount: 100,
      totalCount: 100,
      perUserLimit: 1,
      validType: 1,
    });
    setModalVisible(true);
  };

  // Handle edit
  const handleEdit = (template: CouponTemplateDTO) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      name: template.name,
      type: template.type,
      faceValue: template.faceValue,
      discountRate: template.discountRate,
      minAmount: template.minAmount,
      maxDiscount: template.maxDiscount,
      totalCount: template.totalCount,
      perUserLimit: template.perUserLimit,
      validType: template.validType,
      startTime: formatDateForDisplay(template.startTime),
      endTime: formatDateForDisplay(template.endTime),
      validDays: template.validDays,
    });
    setModalVisible(true);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        totalCount: values.totalCount,
        remainCount: editingTemplate?.id ? undefined : values.totalCount, // Only set on create
        // 格式化日期提交
        startTime: values.startTime ? parseDateForSubmit(values.startTime, true) : undefined,
        endTime: values.endTime ? parseDateForSubmit(values.endTime, false) : undefined,
      };

      if (editingTemplate?.id) {
        await request(`/api-mall/api/mall/admin/coupon/template/${editingTemplate.id}`, {
          method: 'PUT',
          data: payload,
        });
        message.success('更新成功');
      } else {
        await request('/api-mall/api/mall/admin/coupon/template', {
          method: 'POST',
          data: payload,
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      message.error('保存失败');
    }
  };

  // Handle publish
  const handlePublish = async (id: string) => {
    try {
      await request(`/api-mall/api/mall/admin/coupon/template/${id}/publish`, {
        method: 'POST',
      });
      message.success('发布成功');
      fetchTemplates();
    } catch (error) {
      console.error('Failed to publish:', error);
      message.error('发布失败');
    }
  };

  // Handle offline
  const handleOffline = async (id: string) => {
    try {
      await request(`/api-mall/api/mall/admin/coupon/template/${id}/offline`, {
        method: 'POST',
      });
      message.success('下架成功');
      fetchTemplates();
    } catch (error) {
      console.error('Failed to offline:', error);
      message.error('下架失败');
    }
  };

  // Table columns
  const columns: ColumnsType<CouponTemplateDTO> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '优惠券名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: number) => COUPON_TYPE_TEXT[type] || '未知',
    },
    {
      title: '面额/折扣',
      dataIndex: 'faceValue',
      key: 'faceValue',
      width: 120,
      align: 'center',
      render: (_: unknown, record: CouponTemplateDTO) => {
        if (record.type === 2) {
          return record.discountRate ? `${(record.discountRate * 100).toFixed(0)}折` : '-';
        }
        return record.faceValue ? `¥${record.faceValue}` : '-';
      },
    },
    {
      title: '最低消费',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 100,
      align: 'center',
      render: (minAmount: number) => minAmount ? `¥${minAmount}` : '-',
    },
    {
      title: '剩余/总量',
      dataIndex: 'remainCount',
      key: 'remainCount',
      width: 120,
      align: 'center',
      render: (_: unknown, record: CouponTemplateDTO) => `${record.remainCount}/${record.totalCount}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
          {COUPON_STATUS_TEXT[status] || '未知'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_: unknown, record: CouponTemplateDTO) => (
        <Space size="small">
          {record.status === 0 && (
            <>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                编辑
              </Button>
              <Button type="link" size="small" icon={<SendOutlined />} onClick={() => handlePublish(record.id!)}>
                发布
              </Button>
            </>
          )}
          {record.status === 1 && (
            <Button type="link" size="small" danger icon={<StopOutlined />} onClick={() => handleOffline(record.id!)}>
              下架
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建优惠券
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchTemplates} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={templates}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingTemplate ? '编辑优惠券' : '新建优惠券'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="优惠券名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如: 满100减10" />
          </Form.Item>

          <Form.Item name="type" label="优惠券类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>满减券</Select.Option>
              <Select.Option value={2}>折扣券</Select.Option>
              <Select.Option value={3}>无门槛券</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => (
              <>
                {getFieldValue('type') === 1 && (
                  <>
                    <Form.Item name="faceValue" label="面额" rules={[{ required: true }]}>
                      <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="minAmount" label="最低消费金额">
                      <InputNumber min={0} step={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="maxDiscount" label="最高优惠金额">
                      <InputNumber min={0} step={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </>
                )}
                {getFieldValue('type') === 2 && (
                  <>
                    <Form.Item name="discountRate" label="折扣率" rules={[{ required: true }]} tooltip="例如: 0.85 表示85折">
                      <InputNumber min={0.01} max={1} step={0.01} style={{ width: '100%' }} placeholder="0.85" />
                    </Form.Item>
                    <Form.Item name="minAmount" label="最低消费金额">
                      <InputNumber min={0} step={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </>
                )}
              </>
            )}
          </Form.Item>

          <Form.Item name="totalCount" label="总数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="perUserLimit" label="每人限领" rules={[{ required: true }]}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="validType" label="有效期类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>固定日期</Select.Option>
              <Select.Option value={2}>领取后N天</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.validType !== curr.validType}>
            {({ getFieldValue }) => (
              <>
                {getFieldValue('validType') === 1 && (
                  <>
                    <Form.Item name="startTime" label="开始时间">
                      <Input placeholder="格式: 2026-05-01" />
                    </Form.Item>
                    <Form.Item name="endTime" label="结束时间">
                      <Input placeholder="格式: 2026-05-31" />
                    </Form.Item>
                  </>
                )}
                {getFieldValue('validType') === 2 && (
                  <Form.Item name="validDays" label="领取后有效天数">
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                )}
              </>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponPage;