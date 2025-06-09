import React, { useRef, useState } from 'react';
import { PageContainer, ProTable, ProForm, ProFormText, ProFormSelect, ProFormDatePicker } from '@ant-design/pro-components';
import { Button, Modal, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { 
  getEmployeePage, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getEmployeesByDepartment,
  generateEmpNo 
} from '@/services/organization/employee';

// 员工类型定义
interface EmployeeType {
  id: number;
  empNo: string;
  name: string;
  gender?: 1 | 2;
  mobile?: string;
  email?: string;
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  employmentStatus?: 1 | 2 | 3;
  entryDate?: string;
  createTime?: string;
}

const Employees: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmployeeType | null>(null);
  const [form] = ProForm.useForm();

  // 模拟数据
  const mockEmployees: EmployeeType[] = [
    {
      id: 1,
      empNo: 'EMP001',
      name: '张三',
      gender: 1,
      mobile: '13800138001',
      email: 'zhangsan@example.com',
      departmentId: 1,
      departmentName: '技术部',
      positionId: 1,
      positionName: '高级工程师',
      employmentStatus: 1,
      entryDate: '2023-01-15',
      createTime: '2023-01-15 09:00:00',
    },
    {
      id: 2,
      empNo: 'EMP002',
      name: '李四',
      gender: 2,
      mobile: '13800138002',
      email: 'lisi@example.com',
      departmentId: 2,
      departmentName: '销售部',
      positionId: 2,
      positionName: '销售经理',
      employmentStatus: 1,
      entryDate: '2023-02-01',
      createTime: '2023-02-01 09:00:00',
    },
    {
      id: 3,
      empNo: 'EMP003',
      name: '王五',
      gender: 1,
      mobile: '13800138003',
      email: 'wangwu@example.com',
      departmentId: 1,
      departmentName: '技术部',
      positionId: 3,
      positionName: '前端工程师',
      employmentStatus: 1,
      entryDate: '2023-03-01',
      createTime: '2023-03-01 09:00:00',
    },
  ];

  const columns: ProColumns<EmployeeType>[] = [
    {
      title: '工号',
      dataIndex: 'empNo',
      width: 100,
      copyable: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.gender === 1 ? <Tag color="blue">男</Tag> : <Tag color="pink">女</Tag>}
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 130,
      copyable: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      copyable: true,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      width: 120,
    },
    {
      title: '岗位',
      dataIndex: 'positionName',
      width: 120,
    },
    {
      title: '在职状态',
      dataIndex: 'employmentStatus',
      width: 100,
      valueEnum: {
        1: { text: '在职', status: 'Success' },
        2: { text: '离职', status: 'Default' },
        3: { text: '试用期', status: 'Processing' },
      },
    },
    {
      title: '入职日期',
      dataIndex: 'entryDate',
      width: 120,
      valueType: 'date',
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个员工吗？"
            onConfirm={() => handleDelete(record.id)}
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

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: EmployeeType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEmployee(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除员工失败:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        // 更新员工
        await updateEmployee(editingRecord.id, values);
        message.success('更新成功');
      } else {
        // 新增员工
        await createEmployee(values);
        message.success('新增成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('保存员工失败:', error);
      message.error(editingRecord ? '更新失败' : '新增失败');
    }
  };

  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  const handleImport = () => {
    message.info('导入功能开发中...');
  };

  return (
    <PageContainer
      header={{
        title: '员工管理',
        breadcrumb: {},
      }}
    >
      <ProTable<EmployeeType>
        headerTitle="员工列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>,
          <Button
            key="import"
            icon={<ImportOutlined />}
            onClick={handleImport}
          >
            导入
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增员工
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getEmployeePage({
              page: params.current,
              size: params.pageSize,
              keyword: params.keyword,
              departmentId: params.departmentId,
              positionId: params.positionId,
              status: params.employmentStatus,
            });
            
            if (response.datas && response.success) {
              return {
                data: response.datas.records || [],
                success: true,
                total: response.datas.total || 0,
              };
            }
            return {
              data: [],
              success: false,
              total: 0,
            };
          } catch (error) {
            console.error('获取员工列表失败:', error);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingRecord ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProForm
          form={form}
          onFinish={handleSubmit}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <ProForm.Group>
            <ProFormText
              name="empNo"
              label="工号"
              placeholder="请输入工号"
              rules={[{ required: true, message: '请输入工号' }]}
              width="md"
            />
            <ProFormText
              name="name"
              label="姓名"
              placeholder="请输入姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
              width="md"
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormSelect
              name="gender"
              label="性别"
              placeholder="请选择性别"
              options={[
                { label: '男', value: 1 },
                { label: '女', value: 2 },
              ]}
              width="md"
            />
            <ProFormText
              name="mobile"
              label="手机号"
              placeholder="请输入手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
              ]}
              width="md"
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormText
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              rules={[
                { type: 'email', message: '请输入正确的邮箱格式' },
              ]}
              width="md"
            />
            <ProFormSelect
              name="departmentId"
              label="部门"
              placeholder="请选择部门"
              options={[
                { label: '技术部', value: 1 },
                { label: '销售部', value: 2 },
                { label: '人事部', value: 3 },
                { label: '财务部', value: 4 },
              ]}
              width="md"
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormSelect
              name="positionId"
              label="岗位"
              placeholder="请选择岗位"
              options={[
                { label: '高级工程师', value: 1 },
                { label: '销售经理', value: 2 },
                { label: '前端工程师', value: 3 },
                { label: '后端工程师', value: 4 },
              ]}
              width="md"
            />
            <ProFormSelect
              name="employmentStatus"
              label="在职状态"
              placeholder="请选择在职状态"
              options={[
                { label: '在职', value: 1 },
                { label: '离职', value: 2 },
                { label: '试用期', value: 3 },
              ]}
              width="md"
            />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormDatePicker
              name="entryDate"
              label="入职日期"
              placeholder="请选择入职日期"
              width="md"
            />
          </ProForm.Group>

          <ProForm.Group>
            <Button type="primary" htmlType="submit">
              {editingRecord ? '更新' : '新增'}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setModalVisible(false)}>
              取消
            </Button>
          </ProForm.Group>
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default Employees; 