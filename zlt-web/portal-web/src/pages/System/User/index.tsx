import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Popconfirm,
  Row,
  Col,
  Typography,
  Badge
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  LockOutlined,
  ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import './index.less';

const { Title } = Typography;
const { Option } = Select;

interface UserItem {
  id: string;
  username: string;
  nickname?: string;
  employeeName?: string;
  departmentName?: string;
  mobile?: string;
  email?: string;
  enabled: number;
  type: string;
  createTime: string;
  lastLoginTime?: string;
}

/**
 * 系统用户管理页面
 */
const SystemUser: React.FC = () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 用户状态枚举
  const userStatusMap: Record<number, { text: string; color: string }> = {
    1: { text: '正常', color: 'success' },
    0: { text: '禁用', color: 'error' }
  };

  // 用户类型枚举
  const userTypeMap: Record<string, { text: string; color: string }> = {
    'ADMIN': { text: '管理员', color: 'red' },
    'NORMAL': { text: '普通用户', color: 'blue' },
    'GUEST': { text: '访客', color: 'default' }
  };

  // 表格列定义
  const columns: ProColumns<UserItem>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '用户类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      valueEnum: userTypeMap,
      render: (_, record) => {
        const typeInfo = userTypeMap[record.type] || { text: record.type, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      valueEnum: userStatusMap,
      render: (_, record) => {
        const statusInfo = userStatusMap[record.enabled];
        return (
          <Badge 
            status={record.enabled === 1 ? 'success' : 'error'} 
            text={statusInfo.text} 
          />
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      hideInSearch: true,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<LockOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Popconfirm
            title="确定删除这个用户吗？"
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

  // 获取用户列表数据
  const fetchUserList = async (params: any) => {
    try {
      // 这里应该调用实际的API
      console.log('Fetching users with params:', params);
      
      // 模拟数据
      const mockData = {
        data: [
          {
            id: '1',
            username: 'admin',
            nickname: '系统管理员',
            employeeName: '张三',
            departmentName: '技术部',
            mobile: '13800138000',
            email: 'admin@example.com',
            enabled: 1,
            type: 'ADMIN',
            createTime: '2024-01-01 10:00:00',
            lastLoginTime: '2024-12-19 14:30:00'
          },
          {
            id: '2',
            username: 'user001',
            nickname: '普通用户',
            employeeName: '李四',
            departmentName: '产品部',
            mobile: '13800138001',
            email: 'user001@example.com',
            enabled: 1,
            type: 'NORMAL',
            createTime: '2024-01-02 09:00:00',
            lastLoginTime: '2024-12-19 11:20:00'
          }
        ],
        total: 2,
        success: true
      };

      return {
        data: mockData.data,
        total: mockData.total,
        success: mockData.success
      };
    } catch (error) {
      message.error('获取用户列表失败');
      return { data: [], total: 0, success: false };
    }
  };

  // 新增用户
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑用户
  const handleEdit = (record: UserItem) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      nickname: record.nickname,
      mobile: record.mobile,
      enabled: record.enabled,
      type: record.type
    });
    setModalVisible(true);
  };

  // 删除用户
  const handleDelete = async (id: string) => {
    try {
      // 这里应该调用删除API
      console.log('Deleting user:', id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 重置密码
  const handleResetPassword = async (record: UserItem) => {
    Modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 "${record.username}" 的密码吗？重置后密码将变为 123456`,
      onOk: async () => {
        try {
          // 这里应该调用重置密码API
          console.log('Resetting password for user:', record.id);
          message.success('密码重置成功，新密码为：123456');
        } catch (error) {
          message.error('密码重置失败');
        }
      }
    });
  };

  // 批量操作
  const handleBatchAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的用户');
      return;
    }

    Modal.confirm({
      title: `批量${action}`,
      content: `确定要${action}选中的 ${selectedRowKeys.length} 个用户吗？`,
      onOk: async () => {
        try {
          // 这里应该调用批量操作API
          console.log(`Batch ${action} users:`, selectedRowKeys);
          message.success(`批量${action}成功`);
          setSelectedRowKeys([]);
          actionRef.current?.reload();
        } catch (error) {
          message.error(`批量${action}失败`);
        }
      }
    });
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 这里应该调用保存API
      console.log('Saving user:', values);
      
      message.success(editingUser ? '更新成功' : '创建成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  return (
    <PageContainer
      header={{
        title: '用户管理',
        breadcrumb: {
          routes: [
            { path: '/system', breadcrumbName: '系统管理' },
            { path: '/system/user', breadcrumbName: '用户管理' }
          ]
        }
      }}
    >
      <Card>
        <ProTable<UserItem>
          headerTitle="用户列表"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 120,
          }}
          toolBarRender={() => [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增用户
            </Button>,
            <Button
              key="export"
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>,
          ]}
          request={fetchUserList}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          tableAlertRender={({ selectedRowKeys }) => (
            <Space size={24}>
              <span>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
              </span>
            </Space>
          )}
          tableAlertOptionRender={() => (
            <Space size={16}>
              <Button size="small" onClick={() => handleBatchAction('启用')}>
                批量启用
              </Button>
              <Button size="small" onClick={() => handleBatchAction('禁用')}>
                批量禁用
              </Button>
              <Button size="small" danger onClick={() => handleBatchAction('删除')}>
                批量删除
              </Button>
            </Space>
          )}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* 用户编辑/新增弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nickname"
                label="昵称"
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mobile"
                label="手机号"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { type: 'email', message: '请输入正确的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="用户类型"
                rules={[{ required: true, message: '请选择用户类型' }]}
              >
                <Select placeholder="请选择用户类型">
                  <Option value="ADMIN">管理员</Option>
                  <Option value="NORMAL">普通用户</Option>
                  <Option value="GUEST">访客</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="enabled"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value={1}>启用</Option>
                  <Option value={0}>禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度至少6位' }
                  ]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="请再次输入密码" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SystemUser; 