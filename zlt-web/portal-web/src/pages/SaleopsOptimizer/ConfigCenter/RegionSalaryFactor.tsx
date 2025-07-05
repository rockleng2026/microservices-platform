import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';
import { getApiUrl } from '@/config/api';
import dayjs from 'dayjs';

const RegionSalaryFactor: React.FC<{ active: boolean }> = ({ active }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();

  const loadData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await request(getApiUrl('/api/soo/region-salary-factor/page', 'SOO'), { params: { pageNum: page, pageSize } });
      if (res && res.resp_code === 0) {
        setData(res.data || []);
        setPagination({ current: page, pageSize, total: res.count || 0 });
      } else {
        message.error(res?.resp_msg || '获取数据失败');
      }
    } catch (e: any) {
      message.error(e.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (active) {
      loadData();
    }
  }, [active]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
    form.resetFields();
  };
  const handleEdit = (record: any) => {
    setEditing(record);
    setModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      });
    }, 0);
  };
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
        status: values.status ? 1 : 0,
      };
      let res;
      if (editing) {
        res = await request(getApiUrl(`/api/soo/region-salary-factor/${editing.id}`, 'SOO'), { method: 'PUT', data: submitData });
      } else {
        res = await request(getApiUrl('/api/soo/region-salary-factor', 'SOO'), { method: 'POST', data: submitData });
      }
      if (res && res.resp_code === 0) {
        message.success('保存成功');
        setModalOpen(false);
        setEditing(null);
        loadData(pagination.current, pagination.pageSize);
      } else {
        message.error(res?.resp_msg || '保存失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '保存失败');
    }
  };
  const handleModalCancel = () => {
    setModalOpen(false);
    setEditing(null);
  };
  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该条数据吗？',
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request(getApiUrl(`/api/soo/region-salary-factor/${record.id}`, 'SOO'), { method: 'DELETE' });
          if (res && res.resp_code === 0) {
            message.success('删除成功');
            loadData(pagination.current, pagination.pageSize);
          } else {
            message.error(res?.resp_msg || '删除失败');
          }
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };
  const columns = [
    { title: '地区', dataIndex: 'region', key: 'region' },
    { title: '工资系数', dataIndex: 'salaryCoefficient', key: 'salaryCoefficient' },
    { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (val: number) => val === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    {
      title: '操作', key: 'action', render: (_: any, record: any) => (
        <Space size={8}>
          <Button size="small" icon={<EditOutlined />} style={{ minWidth: 64, height: 32 }} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="small" icon={<DeleteOutlined />} danger style={{ minWidth: 64, height: 32 }} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const renderModalForm = () => (
    <Form form={form} layout="vertical">
      <Form.Item name="region" label="地区" rules={[{ required: true, message: '请输入地区' }]}> 
        <Input />
      </Form.Item>
      <Form.Item name="salaryCoefficient" label="工资系数" rules={[{ required: true, message: '请输入工资系数' }]}> 
        <Input type="number" min={0} step={0.01} />
      </Form.Item>
      <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}> 
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="status" label="状态" valuePropName="checked"> 
        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
      </Form.Item>
    </Form>
  );
  return (
    <Card
      className="config-card"
      title="地区工资系数"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => loadData(page, pageSize),
        }}
      />
      <Modal
        title={editing ? '编辑地区工资系数' : '新增地区工资系数'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        cancelText="取消"
        confirmLoading={loading}
      >
        {renderModalForm()}
      </Modal>
    </Card>
  );
};

export default RegionSalaryFactor; 