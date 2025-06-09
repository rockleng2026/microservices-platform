import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
  Modal,
  Form,
  TreeSelect,
  InputNumber,
  Switch,
  Tooltip,
  Progress,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getWorkPositionPage,
  getWorkPositionDetail,
  createWorkPosition,
  updateWorkPosition,
  deleteWorkPosition,
  deleteWorkPositions,
  updateWorkPositionStatus,
  copyWorkPosition,
  getWorkPositionsByDepartment,
  getAvailableWorkPositions,
  checkPositionNameAvailable,
  checkPositionCodeAvailable,
  generatePositionCode,
  WorkPosition,
  WorkPositionDetail,
  WorkPositionPageParams
} from '@/services/organization/position';
import { getDepartmentTree } from '@/services/organization/department';
import PositionPermissions from './PositionPermissions';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const WorkPositionManagement: React.FC = () => {
  const [positions, setPositions] = useState<WorkPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // 过滤条件
  const [filters, setFilters] = useState({
    departmentId: undefined,
    level: undefined,
    status: undefined,
  });

  // 分页参数
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 表单相关状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'copy' | 'view'>('add');
  const [selectedPosition, setSelectedPosition] = useState<WorkPosition | null>(null);
  const [form] = Form.useForm();

  // 详情模态框
  const [detailVisible, setDetailVisible] = useState(false);
  const [positionDetail, setPositionDetail] = useState<WorkPositionDetail | null>(null);

  // 权限配置模态框
  const [permissionVisible, setPermissionVisible] = useState(false);
  const [permissionPosition, setPermissionPosition] = useState<{ id: number; name: string } | null>(null);

  // 表格列配置
  const columns: ColumnsType<WorkPosition> = [
    {
      title: '岗位信息',
      key: 'positionInfo',
      width: 250,
      render: (_, record: WorkPosition) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {record.name}
            {record.isManager && (
              <Tag color="red" style={{ marginLeft: 8, fontSize: '12px' }}>
                管理岗
              </Tag>
            )}
          </div>
          <div style={{ color: '#666', fontSize: 12 }}>
            编号：{record.positionCode}
          </div>
          <div style={{ color: '#666', fontSize: 12 }}>
            级别：{record.level}
          </div>
        </div>
      ),
    },
    {
      title: '所属部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      render: (departmentName: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: 4, color: '#52c41a' }} />
          <span>{departmentName}</span>
        </div>
      ),
    },
    {
      title: '人员配置',
      key: 'headcount',
      width: 150,
      render: (_, record: WorkPosition) => {
        const ratio = record.maxHeadcount > 0 ? (record.currentHeadcount / record.maxHeadcount) * 100 : 0;
        const color = ratio >= 100 ? '#f5222d' : ratio >= 80 ? '#faad14' : '#52c41a';
        
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {record.currentHeadcount} / {record.maxHeadcount || '无限制'}
            </div>
            {record.maxHeadcount > 0 && (
              <Progress 
                percent={Math.min(ratio, 100)} 
                size="small" 
                strokeColor={color}
                showInfo={false}
              />
            )}
          </div>
        );
      },
    },
    {
      title: '薪资范围',
      dataIndex: 'salaryRange',
      key: 'salaryRange',
      width: 120,
      render: (salaryRange: string) => (
        <Tag color="blue">{salaryRange || '面议'}</Tag>
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
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <span style={{ fontSize: 12 }}>{date?.split(' ')[0]}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: WorkPosition) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title="权限配置">
            <Button
              type="link"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handlePermissionConfig(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个岗位吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 加载岗位列表
  const loadWorkPositions = async () => {
    setLoading(true);
    try {
      const params: WorkPositionPageParams = {
        page: pagination.current,
        size: pagination.pageSize,
        keyword: searchValue,
        ...filters
      };
      
      const response = await getWorkPositionPage(params);
      if (response.success) {
        setPositions(response.data.list);
        setPagination({
          ...pagination,
          total: response.data.total,
        });
      } else {
        message.error(response.message || '加载岗位列表失败');
      }
    } catch (error) {
      message.error('加载岗位列表失败');
      console.error('Load work positions error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载部门树
  const loadDepartments = async () => {
    try {
      const response = await getDepartmentTree({ includeDisabled: false });
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Load departments error:', error);
    }
  };

  // 查看详情
  const handleViewDetail = async (position: WorkPosition) => {
    try {
      const response = await getWorkPositionDetail(position.id);
      if (response.success) {
        setPositionDetail(response.data);
        setDetailVisible(true);
      } else {
        message.error('获取岗位详情失败');
      }
    } catch (error) {
      message.error('获取岗位详情失败');
    }
  };

  // 新增岗位
  const handleAdd = () => {
    setSelectedPosition(null);
    setModalType('add');
    setModalVisible(true);
    form.resetFields();
  };

  // 编辑岗位
  const handleEdit = (position: WorkPosition) => {
    setSelectedPosition(position);
    setModalType('edit');
    setModalVisible(true);
    form.setFieldsValue(position);
  };

  // 复制岗位
  const handleCopy = (position: WorkPosition) => {
    setSelectedPosition(position);
    setModalType('copy');
    setModalVisible(true);
    form.setFieldsValue({
      ...position,
      name: position.name + '_副本',
      positionCode: '',
    });
  };

  // 权限配置
  const handlePermissionConfig = (position: WorkPosition) => {
    setPermissionPosition({
      id: position.id,
      name: position.name
    });
    setPermissionVisible(true);
  };

  // 删除岗位
  const handleDelete = async (id: number) => {
    try {
      const response = await deleteWorkPosition(id);
      if (response.success) {
        message.success('删除成功');
        await loadWorkPositions();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的岗位');
      return;
    }
    
    try {
      const response = await deleteWorkPositions(selectedRowKeys as number[]);
      if (response.success) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        await loadWorkPositions();
      } else {
        message.error(response.message || '批量删除失败');
      }
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 表单提交
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      let response;
      
      if (modalType === 'add') {
        response = await createWorkPosition(values);
      } else if (modalType === 'edit') {
        response = await updateWorkPosition(selectedPosition!.id, values);
      } else if (modalType === 'copy') {
        response = await createWorkPosition(values);
      }
      
      if (response?.success) {
        message.success(modalType === 'add' ? '新增成功' : modalType === 'edit' ? '编辑成功' : '复制成功');
        setModalVisible(false);
        await loadWorkPositions();
      } else {
        message.error(response?.message || '操作失败');
      }
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  // 生成岗位编号
  const handleGenerateCode = async () => {
    const departmentId = form.getFieldValue('departmentId');
    if (!departmentId) {
      message.warning('请先选择部门');
      return;
    }
    
    try {
      const response = await generatePositionCode(departmentId);
      if (response.success) {
        form.setFieldsValue({ positionCode: response.data });
      }
    } catch (error) {
      message.error('生成岗位编号失败');
    }
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  // 分页配置
  const paginationConfig = {
    ...pagination,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    onChange: (page: number, pageSize: number) => {
      setPagination({ ...pagination, current: page, pageSize });
    },
  };

  // 转换部门树数据为TreeSelect格式
  const convertDepartmentTreeData = (departments: any[]): any[] => {
    return departments.map(dept => ({
      title: dept.name,
      value: dept.id,
      children: dept.children ? convertDepartmentTreeData(dept.children) : undefined,
    }));
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadWorkPositions();
  }, [pagination.current, pagination.pageSize, searchValue, filters]);

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>岗位管理</h1>
      
      <Card>
        {/* 搜索和过滤区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索岗位名称、编号"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={loadWorkPositions}
              allowClear
            />
          </Col>
          <Col span={4}>
            <TreeSelect
              placeholder="选择部门"
              value={filters.departmentId}
              onChange={(value) => setFilters({ ...filters, departmentId: value })}
              treeData={convertDepartmentTreeData(departments)}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="岗位级别"
              value={filters.level}
              onChange={(value) => setFilters({ ...filters, level: value })}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="初级">初级</Option>
              <Option value="中级">中级</Option>
              <Option value="高级">高级</Option>
              <Option value="专家">专家</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="状态"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Button icon={<SearchOutlined />} onClick={loadWorkPositions}>
              搜索
            </Button>
          </Col>
        </Row>

        {/* 操作工具栏 */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增岗位
              </Button>
              <Popconfirm
                title="确定要删除选中的岗位吗？"
                onConfirm={handleBatchDelete}
              >
                <Button 
                  icon={<DeleteOutlined />} 
                  danger 
                  disabled={selectedRowKeys.length === 0}
                >
                  批量删除
                </Button>
              </Popconfirm>
              <Button icon={<ReloadOutlined />} onClick={loadWorkPositions}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 岗位表格 */}
        <Table<WorkPosition>
          columns={columns}
          dataSource={positions}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={paginationConfig}
          loading={loading}
          scroll={{ x: 1200, y: 600 }}
          size="small"
        />
      </Card>

      {/* 岗位表单弹窗 */}
      <Modal
        title={
          modalType === 'add' ? '新增岗位' : 
          modalType === 'edit' ? '编辑岗位' : '复制岗位'
        }
        open={modalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 1,
            isManager: false,
            maxHeadcount: 1,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="岗位名称"
                name="name"
                rules={[{ required: true, message: '请输入岗位名称' }]}
              >
                <Input placeholder="请输入岗位名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="岗位编号"
                name="positionCode"
                rules={[{ required: true, message: '请输入岗位编号' }]}
              >
                <Input 
                  placeholder="请输入岗位编号"
                  addonAfter={
                    <Button size="small" onClick={handleGenerateCode}>
                      生成
                    </Button>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="所属部门"
                name="departmentId"
                rules={[{ required: true, message: '请选择所属部门' }]}
              >
                <TreeSelect
                  placeholder="请选择所属部门"
                  treeData={convertDepartmentTreeData(departments)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="岗位级别"
                name="level"
                rules={[{ required: true, message: '请选择岗位级别' }]}
              >
                <Select placeholder="请选择岗位级别">
                  <Option value="初级">初级</Option>
                  <Option value="中级">中级</Option>
                  <Option value="高级">高级</Option>
                  <Option value="专家">专家</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="薪资范围" name="salaryRange">
                <Input placeholder="如：8K-15K" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="最大人数" name="maxHeadcount">
                <InputNumber min={0} placeholder="0表示无限制" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="管理岗位" name="isManager" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="岗位职责" name="responsibilities">
            <TextArea rows={3} placeholder="请输入岗位职责" />
          </Form.Item>

          <Form.Item label="任职要求" name="requirements">
            <TextArea rows={3} placeholder="请输入任职要求" />
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Select>
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 岗位详情弹窗 */}
      <Modal
        title="岗位详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {positionDetail && (
          <div>
            <h3>基本信息</h3>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>岗位名称：</strong>{positionDetail.name}</p>
                <p><strong>岗位编号：</strong>{positionDetail.positionCode}</p>
                <p><strong>所属部门：</strong>{positionDetail.departmentName}</p>
                <p><strong>岗位级别：</strong>{positionDetail.level}</p>
              </Col>
              <Col span={12}>
                <p><strong>薪资范围：</strong>{positionDetail.salaryRange || '面议'}</p>
                <p><strong>人员配置：</strong>{positionDetail.currentHeadcount} / {positionDetail.maxHeadcount || '无限制'}</p>
                <p><strong>管理岗位：</strong>{positionDetail.isManager ? '是' : '否'}</p>
                <p><strong>状态：</strong>
                  <Tag color={positionDetail.status === 1 ? 'green' : 'red'}>
                    {positionDetail.status === 1 ? '启用' : '禁用'}
                  </Tag>
                </p>
              </Col>
            </Row>
            
            {positionDetail.responsibilities && (
              <>
                <h3>岗位职责</h3>
                <p>{positionDetail.responsibilities}</p>
              </>
            )}
            
            {positionDetail.requirements && (
              <>
                <h3>任职要求</h3>
                <p>{positionDetail.requirements}</p>
              </>
            )}
            
            <h3>在岗员工</h3>
            {positionDetail.employees && positionDetail.employees.length > 0 ? (
              <Table
                dataSource={positionDetail.employees}
                columns={[
                  { title: '姓名', dataIndex: 'name', key: 'name' },
                  { title: '工号', dataIndex: 'empNo', key: 'empNo' },
                  { 
                    title: '状态', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: number) => (
                      <Tag color={status === 1 ? 'green' : status === 2 ? 'orange' : 'red'}>
                        {status === 1 ? '在职' : status === 2 ? '试用期' : '离职'}
                      </Tag>
                    )
                  },
                ]}
                pagination={false}
                size="small"
              />
            ) : (
              <p>暂无在岗员工</p>
            )}
          </div>
        )}
      </Modal>

      {/* 权限配置弹窗 */}
      {permissionPosition && (
        <PositionPermissions
          visible={permissionVisible}
          positionId={permissionPosition.id}
          positionName={permissionPosition.name}
          onClose={() => setPermissionVisible(false)}
          onSuccess={() => {
            message.success('权限配置成功');
            setPermissionVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default WorkPositionManagement; 