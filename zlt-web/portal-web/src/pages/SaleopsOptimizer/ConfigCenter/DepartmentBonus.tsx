import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Tooltip, Space, Modal, Form, Input, DatePicker, Switch, message, TreeSelect } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';
import { getApiUrl } from '@/config/api';
import dayjs from 'dayjs';

const DepartmentBonus: React.FC<{ active: boolean }> = ({ active }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [departmentTree, setDepartmentTree] = useState<any[]>([]);
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [remarkEditingRecord, setRemarkEditingRecord] = useState<any | null>(null);
  const [remarkForm] = Form.useForm();

  const loadData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await request(getApiUrl('/api/soo/department-bonus-config/page', 'SOO'), { params: { pageNum: page, pageSize } });
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
  const loadDepartmentTree = async () => {
    try {
      const res = await request(getApiUrl('/api/organization/departments/tree', 'PORTAL'));
      if (res && (res.data || res.datas)) {
        if (Array.isArray(res.data)) {
          setDepartmentTree(res.data);
        } else if (Array.isArray(res.datas)) {
          setDepartmentTree(res.datas);
        } else {
          setDepartmentTree([]);
        }
      } else {
        setDepartmentTree([]);
      }
    } catch (e) {
      setDepartmentTree([]);
    }
  };
  useEffect(() => {
    if (active) {
      loadData();
      loadDepartmentTree();
    }
  }, [active]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
    form.resetFields();
    loadDepartmentTree();
  };
  const handleEdit = (record: any) => {
    setEditing(record);
    setModalOpen(true);
    loadDepartmentTree();
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        departmentId: record.departmentId ? String(record.departmentId) : undefined,
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
        res = await request(getApiUrl(`/api/soo/department-bonus-config/${editing.id}`, 'SOO'), { method: 'PUT', data: submitData });
      } else {
        res = await request(getApiUrl('/api/soo/department-bonus-config', 'SOO'), { method: 'POST', data: submitData });
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
          const res = await request(getApiUrl(`/api/soo/department-bonus-config/${record.id}`, 'SOO'), { method: 'DELETE' });
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
  // 备注弹窗相关
  const handleRemark = (record: any) => {
    setRemarkEditingRecord(record);
    setRemarkModalOpen(true);
    remarkForm.setFieldsValue({ remark: record.remark || '' });
  };
  const handleRemarkOk = async () => {
    try {
      const values = await remarkForm.validateFields();
      const res = await request(getApiUrl(`/api/soo/department-bonus-config/${remarkEditingRecord.id}`, 'SOO'), { method: 'PUT', data: { remark: values.remark } });
      if (res && res.resp_code === 0) {
        message.success('备注保存成功');
        setRemarkModalOpen(false);
        setRemarkEditingRecord(null);
        loadData(pagination.current, pagination.pageSize);
      } else {
        message.error(res?.resp_msg || '备注保存失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '备注保存失败');
    }
  };
  const handleRemarkCancel = () => {
    setRemarkModalOpen(false);
    setRemarkEditingRecord(null);
  };
  const columns = [
    { title: '部门名称', dataIndex: 'departmentName', key: 'departmentName' },
    { title: '分红权重(%)', dataIndex: 'bonusWeight', key: 'bonusWeight' },
    { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (val: number) => val === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (val: string) => val ? (
        <Tooltip title={val}><span style={{ cursor: 'pointer', color: '#1890ff' }}>备注</span></Tooltip>
      ) : <span>-</span>
    },
    {
      title: '操作', key: 'action', render: (_: any, record: any) => (
        <Space size={8}>
          <Button size="small" icon={<EditOutlined />} style={{ minWidth: 64, height: 32 }} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="small" icon={<DeleteOutlined />} danger style={{ minWidth: 64, height: 32 }} onClick={() => handleDelete(record)}>
            删除
          </Button>
          <Button size="small" icon={<MessageOutlined />} style={{ minWidth: 64, height: 32 }} onClick={() => handleRemark(record)}>
            备注
          </Button>
        </Space>
      ),
    },
  ];
  const renderModalForm = () => (
    <Form form={form} layout="vertical">
      <Form.Item name="departmentId" label="部门名称" rules={[{ required: true, message: '请选择部门' }]}> 
        <TreeSelect
          key={departmentTree.length}
          treeData={departmentTree}
          fieldNames={{ label: 'name', value: 'id', children: 'children' }}
          placeholder="请选择部门"
          allowClear
          showSearch
          treeDefaultExpandAll
          style={{ width: '100%' }}
          disabled={!!editing}
        />
      </Form.Item>
      <Form.Item name="bonusWeight" label="分红权重(%)" rules={[{ required: true, message: '请输入分红权重' }]}> 
        <Input type="number" min={0} max={100} />
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
      title="部门分红配置"
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
        title={editing ? '编辑部门分红配置' : '新增部门分红配置'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        cancelText="取消"
        confirmLoading={loading}
      >
        {renderModalForm()}
      </Modal>
      <Modal
        title="备注"
        open={remarkModalOpen}
        onOk={handleRemarkOk}
        onCancel={handleRemarkCancel}
        okText="保存"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={remarkForm} layout="vertical">
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={4} maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DepartmentBonus; 