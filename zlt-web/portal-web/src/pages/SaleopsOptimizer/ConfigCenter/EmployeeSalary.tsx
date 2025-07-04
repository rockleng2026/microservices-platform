import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Tooltip, Space, Modal, Form, Input, DatePicker, Switch, message, TreeSelect, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';
import { getApiUrl } from '@/config/api';
import dayjs from 'dayjs';

const EmployeeSalary: React.FC<{ active: boolean }> = ({ active }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [departmentTree, setDepartmentTree] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  const loadData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await request(getApiUrl('/api/soo/employee-salary-config/page', 'SOO'), { params: { pageNum: page, pageSize } });
      if (res && res.resp_code === 0) {
        setData(res.datas.records || []);
        setPagination({ current: page, pageSize, total: res.datas.total || 0 });
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
  const loadEmployeeList = async () => {
    try {
      const res = await request(getApiUrl('/api/organization/employees/list', 'PORTAL'));
      if (res && (res.data || res.datas)) {
        if (Array.isArray(res.data)) {
          setEmployeeList(res.data);
        } else if (Array.isArray(res.datas)) {
          setEmployeeList(res.datas);
        } else {
          setEmployeeList([]);
        }
      } else {
        setEmployeeList([]);
      }
    } catch (e) {
      setEmployeeList([]);
    }
  };
  useEffect(() => {
    if (active) {
      loadData();
      loadDepartmentTree();
      loadEmployeeList();
    }
  }, [active]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
    form.resetFields();
    loadDepartmentTree();
    loadEmployeeList();
  };
  const handleEdit = (record: any) => {
    setEditing(record);
    setModalOpen(true);
    loadDepartmentTree();
    loadEmployeeList();
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        departmentId: record.departmentId ? String(record.departmentId) : undefined,
        employeeId: record.employeeId ? String(record.employeeId) : undefined,
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
        res = await request(getApiUrl(`/api/soo/employee-salary-config/${editing.id}`, 'SOO'), { method: 'PUT', data: submitData });
      } else {
        res = await request(getApiUrl('/api/soo/employee-salary-config', 'SOO'), { method: 'POST', data: submitData });
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
          const res = await request(getApiUrl(`/api/soo/employee-salary-config/${record.id}`, 'SOO'), { method: 'DELETE' });
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
    { title: '员工姓名', dataIndex: 'employeeName', key: 'employeeName' },
    { title: '部门', dataIndex: 'departmentName', key: 'departmentName' },
    { title: '岗位', dataIndex: 'positionName', key: 'positionName' },
    { title: '基础工资', dataIndex: 'baseSalary', key: 'baseSalary' },
    { title: '绩效工资', dataIndex: 'performanceSalary', key: 'performanceSalary' },
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
      <Form.Item name="departmentId" label="部门" rules={[{ required: true, message: '请选择部门' }]}> 
        <TreeSelect
          key={departmentTree.length}
          treeData={departmentTree}
          fieldNames={{ label: 'name', value: 'id', children: 'children' }}
          placeholder="请选择部门"
          allowClear
          showSearch
          treeDefaultExpandAll
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item name="employeeId" label="员工" rules={[{ required: true, message: '请选择员工' }]}> 
        <Select
          showSearch
          placeholder="请选择员工"
          optionFilterProp="children"
          filterOption={(input, option) => (option?.children as string).toLowerCase().includes(input.toLowerCase())}
        >
          {employeeList.map((item: any) => (
            <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="baseSalary" label="基础工资" rules={[{ required: true, message: '请输入基础工资' }]}> 
        <Input type="number" min={0} />
      </Form.Item>
      <Form.Item name="performanceSalary" label="绩效工资" rules={[{ required: true, message: '请输入绩效工资' }]}> 
        <Input type="number" min={0} />
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
      title="员工薪酬配置"
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
        title={editing ? '编辑员工薪酬配置' : '新增员工薪酬配置'}
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

export default EmployeeSalary; 