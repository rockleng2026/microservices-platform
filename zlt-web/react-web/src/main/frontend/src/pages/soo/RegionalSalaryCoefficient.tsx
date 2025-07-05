import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Space,
  Modal,
  message,
  Popconfirm,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Tag,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { request } from 'umi';
import moment from 'moment';

// 类型定义
interface RegionalSalaryCoefficient {
  id?: number;
  region: string;
  regionCode: string;
  salaryCoefficient: number;
  costOfLivingIndex?: number;
  effectiveDate: string;
  expireDate?: string;
  status: number;
  sortOrder?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RegionalSalaryCoefficientQuery {
  region?: string;
  regionCode?: string;
  status?: number;
  effectiveDateStart?: string;
  effectiveDateEnd?: string;
  includeExpired?: boolean;
  pageNum?: number;
  pageSize?: number;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const RegionalSalaryCoefficientPage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [copyForm] = Form.useForm();
  const actionRef = useRef<ActionType>();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegionalSalaryCoefficient | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  // API前缀
  const API_PREFIX = '/api-soo/api/soo/regional-salary-coefficient';

  // 分页查询
  const handlePageQuery = async (params: any) => {
    try {
      const queryParams: RegionalSalaryCoefficientQuery = {
        pageNum: params.current,
        pageSize: params.pageSize,
        region: params.region,
        regionCode: params.regionCode,
        status: params.status,
        effectiveDateStart: params.effectiveDateRange?.[0]?.format('YYYY-MM-DD'),
        effectiveDateEnd: params.effectiveDateRange?.[1]?.format('YYYY-MM-DD'),
        includeExpired: params.includeExpired,
      };

      const response = await request(`${API_PREFIX}/page`, {
        method: 'GET',
        params: queryParams,
      });

      if (response.resp_code === 0) {
        return {
          data: response.datas.records,
          total: response.datas.total,
          success: true,
        };
      } else {
        message.error(response.resp_msg || '查询失败');
        return {
          data: [],
          total: 0,
          success: false,
        };
      }
    } catch (error) {
      message.error('查询失败');
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  // 新增/编辑
  const handleSaveOrUpdate = async (values: any) => {
    try {
      setLoading(true);
      const data = {
        ...values,
        effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'),
        expireDate: values.expireDate?.format('YYYY-MM-DD'),
      };

      let response;
      if (editingRecord?.id) {
        response = await request(`${API_PREFIX}/${editingRecord.id}`, {
          method: 'PUT',
          data,
        });
      } else {
        response = await request(API_PREFIX, {
          method: 'POST',
          data,
        });
      }

      if (response.resp_code === 0) {
        message.success(editingRecord?.id ? '更新成功' : '新增成功');
        setModalVisible(false);
        form.resetFields();
        setEditingRecord(undefined);
        actionRef.current?.reload();
      } else {
        message.error(response.resp_msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      const response = await request(`${API_PREFIX}/${id}`, {
        method: 'DELETE',
      });

      if (response.resp_code === 0) {
        message.success('删除成功');
        actionRef.current?.reload();
      } else {
        message.error(response.resp_msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    try {
      const response = await request(`${API_PREFIX}/batch`, {
        method: 'DELETE',
        data: selectedRowKeys,
      });

      if (response.resp_code === 0) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      } else {
        message.error(response.resp_msg || '批量删除失败');
      }
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 批量更新状态
  const handleBatchUpdateStatus = async (status: number) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要更新的记录');
      return;
    }

    try {
      const response = await request(`${API_PREFIX}/batch-status`, {
        method: 'PUT',
        params: {
          ids: selectedRowKeys.join(','),
          status,
        },
      });

      if (response.resp_code === 0) {
        message.success('批量更新状态成功');
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      } else {
        message.error(response.resp_msg || '批量更新状态失败');
      }
    } catch (error) {
      message.error('批量更新状态失败');
    }
  };

  // 复制到新地区
  const handleCopyToNewRegion = async (values: any) => {
    try {
      setLoading(true);
      const response = await request(`${API_PREFIX}/copy-to-new-region`, {
        method: 'POST',
        params: {
          sourceId: editingRecord?.id,
          targetRegion: values.targetRegion,
          targetRegionCode: values.targetRegionCode,
          effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'),
        },
      });

      if (response.resp_code === 0) {
        message.success('复制成功');
        setCopyModalVisible(false);
        copyForm.resetFields();
        setEditingRecord(undefined);
        actionRef.current?.reload();
      } else {
        message.error(response.resp_msg || '复制失败');
      }
    } catch (error) {
      message.error('复制失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开新增/编辑模态框
  const openModal = (record?: RegionalSalaryCoefficient) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        effectiveDate: record.effectiveDate ? moment(record.effectiveDate) : undefined,
        expireDate: record.expireDate ? moment(record.expireDate) : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 1,
        sortOrder: 0,
      });
    }
    setModalVisible(true);
  };

  // 打开复制模态框
  const openCopyModal = (record: RegionalSalaryCoefficient) => {
    setEditingRecord(record);
    copyForm.resetFields();
    copyForm.setFieldsValue({
      sourceRegion: record.region,
      effectiveDate: moment(),
    });
    setCopyModalVisible(true);
  };

  // 表格列定义
  const columns: ProColumns<RegionalSalaryCoefficient>[] = [
    {
      title: '地区',
      dataIndex: 'region',
      width: 120,
      ellipsis: true,
    },
    {
      title: '地区编码',
      dataIndex: 'regionCode',
      width: 120,
      ellipsis: true,
    },
    {
      title: '工资系数',
      dataIndex: 'salaryCoefficient',
      width: 120,
      render: (value) => value?.toFixed(4),
      sorter: true,
    },
    {
      title: '生活成本指数',
      dataIndex: 'costOfLivingIndex',
      width: 130,
      render: (value) => value ? value.toFixed(4) : '-',
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 120,
      sorter: true,
    },
    {
      title: '失效日期',
      dataIndex: 'expireDate',
      width: 120,
      render: (value) => value || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (value) => (
        <Tag color={value === 1 ? 'green' : 'red'}>
          {value === 1 ? '启用' : '禁用'}
        </Tag>
      ),
      valueEnum: {
        1: { text: '启用', status: 'Success' },
        0: { text: '禁用', status: 'Error' },
      },
    },
    {
      title: '排序号',
      dataIndex: 'sortOrder',
      width: 80,
      sorter: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      ellipsis: true,
      render: (value) => value ? (
        <Tooltip title={value}>
          <span>{value}</span>
        </Tooltip>
      ) : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => openCopyModal(record)}
          >
            复制
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <ProTable<RegionalSalaryCoefficient>
          headerTitle="地区工资系数管理"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
          }}
          toolBarRender={() => [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              新增
            </Button>,
            <Button
              key="batchEnable"
              onClick={() => handleBatchUpdateStatus(1)}
              disabled={selectedRowKeys.length === 0}
            >
              批量启用
            </Button>,
            <Button
              key="batchDisable"
              onClick={() => handleBatchUpdateStatus(0)}
              disabled={selectedRowKeys.length === 0}
            >
              批量禁用
            </Button>,
            <Popconfirm
              key="batchDelete"
              title="确定要删除选中的记录吗？"
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button
                danger
                disabled={selectedRowKeys.length === 0}
                icon={<DeleteOutlined />}
              >
                批量删除
              </Button>
            </Popconfirm>,
          ]}
          request={handlePageQuery}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 1400 }}
        />

        {/* 新增/编辑模态框 */}
        <Modal
          title={editingRecord?.id ? '编辑地区工资系数' : '新增地区工资系数'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingRecord(undefined);
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveOrUpdate}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="region"
                  label="地区"
                  rules={[
                    { required: true, message: '请输入地区' },
                    { max: 50, message: '地区长度不能超过50个字符' },
                  ]}
                >
                  <Input placeholder="请输入地区" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="regionCode"
                  label="地区编码"
                  rules={[
                    { required: true, message: '请输入地区编码' },
                    { max: 20, message: '地区编码长度不能超过20个字符' },
                  ]}
                >
                  <Input placeholder="请输入地区编码" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="salaryCoefficient"
                  label="工资系数"
                  rules={[
                    { required: true, message: '请输入工资系数' },
                    { type: 'number', min: 0.0001, max: 9.9999, message: '工资系数范围0.0001-9.9999' },
                  ]}
                >
                  <InputNumber
                    placeholder="请输入工资系数"
                    precision={4}
                    min={0.0001}
                    max={9.9999}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="costOfLivingIndex"
                  label="生活成本指数"
                  rules={[
                    { type: 'number', min: 0.0001, max: 9.9999, message: '生活成本指数范围0.0001-9.9999' },
                  ]}
                >
                  <InputNumber
                    placeholder="请输入生活成本指数"
                    precision={4}
                    min={0.0001}
                    max={9.9999}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="effectiveDate"
                  label="生效日期"
                  rules={[{ required: true, message: '请选择生效日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expireDate"
                  label="失效日期"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="状态"
                  valuePropName="checked"
                  getValueFromEvent={(checked) => checked ? 1 : 0}
                  getValueProps={(value) => ({ checked: value === 1 })}
                >
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sortOrder"
                  label="排序号"
                  rules={[{ type: 'number', min: 0, message: '排序号不能为负数' }]}
                >
                  <InputNumber
                    placeholder="请输入排序号"
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="remark"
              label="备注"
              rules={[{ max: 500, message: '备注长度不能超过500个字符' }]}
            >
              <Input.TextArea
                placeholder="请输入备注"
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingRecord?.id ? '更新' : '新增'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 复制到新地区模态框 */}
        <Modal
          title="复制到新地区"
          open={copyModalVisible}
          onCancel={() => {
            setCopyModalVisible(false);
            copyForm.resetFields();
            setEditingRecord(undefined);
          }}
          footer={null}
          width={500}
        >
          <Form
            form={copyForm}
            layout="vertical"
            onFinish={handleCopyToNewRegion}
          >
            <Form.Item
              name="sourceRegion"
              label="源地区"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="targetRegion"
              label="目标地区"
              rules={[
                { required: true, message: '请输入目标地区' },
                { max: 50, message: '地区长度不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入目标地区" />
            </Form.Item>

            <Form.Item
              name="targetRegionCode"
              label="目标地区编码"
              rules={[
                { required: true, message: '请输入目标地区编码' },
                { max: 20, message: '地区编码长度不能超过20个字符' },
              ]}
            >
              <Input placeholder="请输入目标地区编码" />
            </Form.Item>

            <Form.Item
              name="effectiveDate"
              label="生效日期"
              rules={[{ required: true, message: '请选择生效日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setCopyModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  复制
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default RegionalSalaryCoefficientPage; 