import React, { useRef, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Space, Table, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// 岗位类型定义
interface PositionType {
  id: number;
  name: string;
  shortname?: string;
  deptId?: number;
  deptName?: string;
  workgrade?: number;
  workcontent?: string;
  parpositionid?: number;
  parentPositionName?: string;
  employeeCount?: number;
  status?: 1 | 2;
  createTime?: string;
}

const Positions: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PositionType | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // 模拟岗位数据
  const mockPositions: PositionType[] = [
    {
      id: 1,
      name: '高级软件工程师',
      shortname: '高级工程师',
      deptId: 1,
      deptName: '技术部',
      workgrade: 8,
      workcontent: '负责系统架构设计、核心模块开发、技术难题攻关',
      employeeCount: 8,
      status: 1,
      createTime: '2023-01-15 09:00:00',
    },
    {
      id: 2,
      name: '销售经理',
      shortname: '销售经理',
      deptId: 2,
      deptName: '销售部',
      workgrade: 7,
      workcontent: '负责客户关系维护、销售目标达成、团队管理',
      employeeCount: 5,
      status: 1,
      createTime: '2023-02-01 09:00:00',
    },
    {
      id: 3,
      name: '前端开发工程师',
      shortname: '前端工程师',
      deptId: 1,
      deptName: '技术部',
      workgrade: 6,
      workcontent: '负责前端页面开发、用户体验优化、前端框架维护',
      employeeCount: 12,
      status: 1,
      createTime: '2023-03-01 09:00:00',
    },
    {
      id: 4,
      name: '人事专员',
      shortname: '人事专员',
      deptId: 3,
      deptName: '人事部',
      workgrade: 5,
      workcontent: '负责招聘管理、员工关系维护、薪酬福利管理',
      employeeCount: 3,
      status: 1,
      createTime: '2023-04-01 09:00:00',
    },
    {
      id: 5,
      name: '财务分析师',
      shortname: '财务分析师',
      deptId: 4,
      deptName: '财务部',
      workgrade: 6,
      workcontent: '负责财务数据分析、预算编制、成本控制',
      employeeCount: 2,
      status: 1,
      createTime: '2023-05-01 09:00:00',
    },
  ];

  const columns = [
    {
      title: '岗位名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: PositionType) =>
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        (record.shortname && record.shortname.toLowerCase().includes(value.toLowerCase())),
      render: (text: string, record: PositionType) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.shortname && (
            <div style={{ fontSize: '12px', color: '#666' }}>简称：{record.shortname}</div>
          )}
        </div>
      ),
    },
    {
      title: '所属部门',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 120,
    },
    {
      title: '职级',
      dataIndex: 'workgrade',
      key: 'workgrade',
      width: 80,
      render: (grade: number) => (
        <Tag color={grade >= 8 ? 'red' : grade >= 6 ? 'orange' : 'blue'}>
          P{grade}
        </Tag>
      ),
    },
    {
      title: '在岗人数',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 100,
      render: (count: number) => (
        <span style={{ color: count > 10 ? '#f5222d' : count > 5 ? '#fa8c16' : '#52c41a' }}>
          {count}人
        </span>
      ),
    },
    {
      title: '岗位职责',
      dataIndex: 'workcontent',
      key: 'workcontent',
      ellipsis: true,
      render: (text: string) => (
        <span title={text}>
          {text && text.length > 30 ? `${text.substring(0, 30)}...` : text}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (time: string) => time ? time.split(' ')[0] : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as any,
      render: (_: any, record: PositionType) => (
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
            title="确定要删除这个岗位吗？"
            description="删除后该岗位下的员工需要重新分配岗位"
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

  const handleEdit = (record: PositionType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      message.success('删除成功');
      // 这里应该调用API删除
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        message.success('更新成功');
      } else {
        message.success('新增成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '新增失败');
    }
  };

  const filteredData = searchText
    ? mockPositions.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.shortname && item.shortname.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.deptName && item.deptName.toLowerCase().includes(searchText.toLowerCase()))
      )
    : mockPositions;

  return (
    <div>
      <h2>岗位管理</h2>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input
            placeholder="搜索岗位名称、部门..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增岗位
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑岗位' : '新增岗位'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="岗位名称"
            rules={[{ required: true, message: '请输入岗位名称' }]}
          >
            <Input placeholder="请输入岗位名称" />
          </Form.Item>

          <Form.Item
            name="shortname"
            label="岗位简称"
          >
            <Input placeholder="请输入岗位简称（可选）" />
          </Form.Item>

          <Form.Item
            name="deptId"
            label="所属部门"
            rules={[{ required: true, message: '请选择所属部门' }]}
          >
            <Select placeholder="请选择所属部门">
              <Select.Option value={1}>技术部</Select.Option>
              <Select.Option value={2}>销售部</Select.Option>
              <Select.Option value={3}>人事部</Select.Option>
              <Select.Option value={4}>财务部</Select.Option>
              <Select.Option value={5}>市场部</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="workgrade"
            label="职级等级"
            rules={[{ required: true, message: '请选择职级等级' }]}
          >
            <Select placeholder="请选择职级等级">
              <Select.Option value={3}>P3 - 初级</Select.Option>
              <Select.Option value={4}>P4 - 中级</Select.Option>
              <Select.Option value={5}>P5 - 中高级</Select.Option>
              <Select.Option value={6}>P6 - 高级</Select.Option>
              <Select.Option value={7}>P7 - 资深</Select.Option>
              <Select.Option value={8}>P8 - 专家</Select.Option>
              <Select.Option value={9}>P9 - 首席</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="parpositionid"
            label="上级岗位"
          >
            <Select placeholder="请选择上级岗位（可选）" allowClear>
              {mockPositions.map(pos => (
                <Select.Option key={pos.id} value={pos.id}>
                  {pos.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="workcontent"
            label="岗位职责"
            rules={[{ required: true, message: '请输入岗位职责' }]}
          >
            <Input.TextArea 
              placeholder="请输入岗位职责和工作内容" 
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue={1}
          >
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={2}>禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRecord ? '更新' : '新增'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Positions; 