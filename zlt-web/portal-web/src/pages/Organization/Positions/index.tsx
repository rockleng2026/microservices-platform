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
  Badge,
  Drawer,
  Descriptions,
  Typography,
  Divider,
  Upload,
  Dropdown,
  Spin,
  Alert,
  Empty
} from 'antd';
import type { MenuProps } from 'antd';
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
  UserOutlined,
  DownOutlined,
  ExportOutlined,
  ImportOutlined,
  MoreOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getDepartmentTree } from '@/services/organization/department';
import {
  getWorkPositionPage,
  getWorkPositionDetail,
  createWorkPosition,
  updateWorkPosition,
  deleteWorkPosition,
  deleteWorkPositions,
  updateWorkPositionStatus,
  copyWorkPosition,
  checkPositionNameAvailable,
  type WorkPosition,
  type WorkPositionPageParams,
  type WorkPositionSaveDTO
} from '@/services/organization/position';
import PositionPermissions from './PositionPermissions';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const WorkPositionManagement: React.FC = () => {
  const [positions, setPositions] = useState<WorkPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // 查询参数
  const [queryParams, setQueryParams] = useState<WorkPositionPageParams>({
    current: 1,
    size: 20
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

  // 详情抽屉
  const [detailVisible, setDetailVisible] = useState(false);
  const [positionDetail, setPositionDetail] = useState<WorkPosition | null>(null);

  // 权限配置模态框
  const [permissionVisible, setPermissionVisible] = useState(false);
  const [permissionPosition, setPermissionPosition] = useState<{ id: string; name: string } | null>(null);

  // 复制模态框
  const [copyVisible, setCopyVisible] = useState(false);
  const [copyForm] = Form.useForm();

  // 初始化
  useEffect(() => {
    loadDepartments();
  }, []);

  // 岗位级别选项
  const levelOptions = [
    { value: 1, label: '成员级', color: '#52c41a' },
    { value: 2, label: '组长级', color: '#1890ff' },
    { value: 3, label: '主管级', color: '#fa8c16' },
    { value: 4, label: '总经理级', color: '#eb2f96' },
    { value: 5, label: '高级经理级', color: '#722ed1' }
  ];

  // 表格列配置
  const columns: ColumnsType<WorkPosition> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => pagination.pageSize * (pagination.current - 1) + index + 1,
    },
    {
      title: '岗位信息',
      key: 'positionInfo',
      width: 280,
      render: (_, record: WorkPosition) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
            <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span style={{ marginRight: 8 }}>{record.name}</span>
            {record.isManager === 1 && (
              <Tag color="red">管理岗</Tag>
            )}
            {record.isDirector === 1 && (
              <Tag color="purple">主管岗</Tag>
            )}
          </div>
          {record.shortName && (
            <div style={{ color: '#666', fontSize: 12, marginBottom: 2 }}>
              简称：{record.shortName}
            </div>
          )}
          <div style={{ color: '#666', fontSize: 12 }}>
            级别：
            <Tag 
              color={levelOptions.find(item => item.value === record.positionLevel)?.color || 'default'}
            >
              {record.positionLevelName}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: '所属部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 180,
      render: (departmentName: string, record: WorkPosition) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TeamOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            <span>{departmentName}</span>
          </div>
          {record.departmentPath && (
            <div style={{ color: '#999', fontSize: 11, marginTop: 2 }}>
              {record.departmentPath}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '人员配置',
      key: 'headcount',
      width: 140,
      render: (_, record: WorkPosition) => {
        const maxEmployees = record.maxEmployees || 0;
        const currentEmployees = record.currentEmployees || 0;
        const ratio = maxEmployees > 0 ? (currentEmployees / maxEmployees) * 100 : 0;
        const color = ratio >= 100 ? '#f5222d' : ratio >= 80 ? '#faad14' : '#52c41a';
        
        return (
          <div>
            <div style={{ marginBottom: 4, fontSize: 12 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {currentEmployees} / {maxEmployees || '无限制'}
            </div>
            {maxEmployees > 0 && (
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
      filters: [
        { text: '启用', value: 1 },
        { text: '禁用', value: 0 }
      ],
      render: (status: number) => (
        <Badge 
          status={status === 1 ? 'success' : 'error'} 
          text={status === 1 ? '启用' : '禁用'} 
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      render: (sortOrder: number) => sortOrder || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: true,
      render: (date: string) => (
        <span style={{ fontSize: 12 }}>{date?.split(' ')[0]}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
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
              icon={<SafetyCertificateOutlined />}
              onClick={() => handlePermissionConfig(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个岗位吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 更多操作菜单
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'export',
      label: '导出数据',
      icon: <ExportOutlined />,
      onClick: handleExport,
    },
    {
      key: 'import',
      label: '导入数据',
      icon: <ImportOutlined />,
      onClick: handleImport,
    },
    {
      type: 'divider',
    },
    {
      key: 'batchEnable',
      label: '批量启用',
      icon: <CheckOutlined />,
      onClick: () => handleBatchUpdateStatus(1),
    },
    {
      key: 'batchDisable',
      label: '批量禁用',
      icon: <CloseOutlined />,
      onClick: () => handleBatchUpdateStatus(0),
    },
  ];

  // 加载岗位列表
  const loadWorkPositions = async () => {
    setLoading(true);
    try {
      const response = await getWorkPositionPage(queryParams);
      
      // 处理不同的返回格式
      let success = false;
      let data: any[] = [];
      let total = 0;
      let errorMsg = '';

      if (response.resp_code === 0 && response.datas) {
        // 新格式: { resp_code: 0, datas: { code: 0, data: [...], count: 23 } }
        success = response.datas.code === 0;
        data = response.datas.data || [];
        total = response.datas.count || 0;
        errorMsg = response.resp_msg || response.datas.msg || '';
      } else if (response.code === 0) {
        // 旧格式: { code: 0, data: { data: [...], count: 23 } }
        success = true;
        data = response.data?.data || response.data || [];
        total = response.data?.count || 0;
        errorMsg = response.msg || '';
      }
      
      if (success) {
        setPositions(data);
        setPagination({
          current: queryParams.current || 1,
          pageSize: queryParams.size || 20,
          total: total,
        });
      } else {
        message.error(errorMsg || '加载数据失败');
      }
    } catch (error) {
      console.error('加载岗位数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载部门树
  const loadDepartments = async () => {
    try {
      const response = await getDepartmentTree({});
      
      // 处理不同的返回格式
      let departmentData = [];
      if (response && response.success && response.data) {
        departmentData = Array.isArray(response.data) ? response.data : [];
      } else if (response && response.code === 0 && response.data) {
        departmentData = Array.isArray(response.data) ? response.data : [];
      } else if (response && response.resp_code === 0 && response.datas) {
        departmentData = Array.isArray(response.datas) ? response.datas : [];
      } else if (Array.isArray(response)) {
        departmentData = response;
      }
      
      setDepartments(departmentData);
    } catch (error) {
      console.error('加载部门数据失败:', error);
      message.error('加载部门数据失败');
      setDepartments([]); // 确保设置为空数组
    }
  };

  // 查看详情
  const handleViewDetail = async (position: WorkPosition) => {
    try {
      const response = await getWorkPositionDetail(position.id);
      
      // 处理不同的返回格式
      let success = false;
      let data = null;
      let errorMsg = '';

      if (response.resp_code === 0 && response.datas) {
        // 直接使用datas作为数据，因为这种格式下datas就是实际数据
        success = true;
        data = response.datas;
        errorMsg = response.resp_msg || '';
      } else if (response.code === 0) {
        success = true;
        data = response.data;
        errorMsg = response.msg || '';
      }
      
      if (success && data) {
        setPositionDetail(data);
        setDetailVisible(true);
      } else {
        message.error(errorMsg || '获取详情失败');
      }
    } catch (error) {
      console.error('获取岗位详情失败:', error);
      message.error('获取详情失败');
    }
  };

  // 新增岗位
  const handleAdd = () => {
    setModalType('add');
    setSelectedPosition(null);
    setModalVisible(true);
    form.resetFields();
  };

  // 编辑岗位
  const handleEdit = (position: WorkPosition) => {
    setModalType('edit');
    setSelectedPosition(position);
    setModalVisible(true);
    form.setFieldsValue({
      name: position.name,
      shortName: position.shortName,
      departmentId: position.departmentId,
      positionLevel: position.positionLevel,
      jobDescription: position.jobDescription,
      requirements: position.requirements,
      salaryRange: position.salaryRange,
      maxEmployees: position.maxEmployees,
      isManager: position.isManager === 1,
      isDirector: position.isDirector === 1,
      sortOrder: position.sortOrder,
      status: position.status === 1,
    });
  };

  // 复制岗位
  const handleCopy = (position: WorkPosition) => {
    setSelectedPosition(position);
    setCopyVisible(true);
    copyForm.setFieldsValue({
      sourceId: position.id,
      newName: `${position.name}(复制)`,
      targetDepartmentId: position.departmentId,
    });
  };

  // 权限配置
  const handlePermissionConfig = (position: WorkPosition) => {
    setPermissionPosition({ id: position.id, name: position.name });
    setPermissionVisible(true);
  };

  // 删除岗位
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteWorkPosition(id);
      console.log('删除岗位响应:', response);
      
      // 处理不同的返回格式
      let success = false;
      let errorMsg = '';

      if (response.resp_code === 0) {
        success = true;
        errorMsg = response.resp_msg || '';
      } else if (response.code === 0) {
        success = true;
        errorMsg = response.msg || '';
      } else {
        success = false;
        errorMsg = response.resp_msg || response.msg || response.message || '删除失败';
      }
      
      if (success) {
        message.success('删除成功');
        loadWorkPositions();
        setSelectedRowKeys(selectedRowKeys.filter(key => key !== id));
      } else {
        console.error('删除失败详情:', { response, errorMsg });
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error('删除岗位异常:', error);
      
      // 解析错误信息
      let errorMessage = '删除失败';
      if (error?.response?.data?.resp_msg) {
        errorMessage = error.response.data.resp_msg;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      message.error(errorMessage);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的岗位');
      return;
    }

    try {
      const response = await deleteWorkPositions(selectedRowKeys as string[]);
      console.log('批量删除岗位响应:', response);
      
      // 处理不同的返回格式
      let success = false;
      let errorMsg = '';

      if (response.resp_code === 0) {
        success = true;
        errorMsg = response.resp_msg || '';
      } else if (response.code === 0) {
        success = true;
        errorMsg = response.msg || '';
      } else {
        success = false;
        errorMsg = response.resp_msg || response.msg || response.message || '批量删除失败';
      }
      
      if (success) {
        message.success('批量删除成功');
        loadWorkPositions();
        setSelectedRowKeys([]);
      } else {
        console.error('批量删除失败详情:', { response, errorMsg });
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error('批量删除异常:', error);
      
      // 解析错误信息
      let errorMessage = '批量删除失败';
      if (error?.response?.data?.resp_msg) {
        errorMessage = error.response.data.resp_msg;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      message.error(errorMessage);
    }
  };

  // 批量更新状态
  const handleBatchUpdateStatus = async (status: number) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的岗位');
      return;
    }

    try {
      const response = await updateWorkPositionStatus(selectedRowKeys as string[], status);
      
      // 处理不同的返回格式
      let success = false;
      let errorMsg = '';

      if (response.resp_code === 0) {
        success = response.datas?.code === 0 || true;
        errorMsg = response.resp_msg || response.datas?.msg || '';
      } else if (response.code === 0) {
        success = true;
        errorMsg = response.msg || '';
      }
      
      if (success) {
        message.success(`批量${status === 1 ? '启用' : '禁用'}成功`);
        loadWorkPositions();
        setSelectedRowKeys([]);
      } else {
        message.error(errorMsg || `批量${status === 1 ? '启用' : '禁用'}失败`);
      }
    } catch (error) {
      console.error('批量更新状态失败:', error);
      message.error('操作失败');
    }
  };

  // 表单提交
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData: WorkPositionSaveDTO = {
        ...values,
        isManager: values.isManager ? 1 : 0,
        isDirector: values.isDirector ? 1 : 0,
        status: values.status ? 1 : 0,
      };

      if (modalType === 'edit' && selectedPosition) {
        submitData.id = selectedPosition.id;
      }

      const response = modalType === 'edit' 
        ? await updateWorkPosition(selectedPosition!.id, submitData)
        : await createWorkPosition(submitData);
      
      // 处理不同的返回格式
      let success = false;
      let errorMsg = '';

      if (response.resp_code === 0) {
        success = response.datas?.code === 0 || true;
        errorMsg = response.resp_msg || response.datas?.msg || '';
      } else if (response.code === 0) {
        success = true;
        errorMsg = response.msg || '';
      }
      
      if (success) {
        message.success(`${modalType === 'edit' ? '更新' : '新增'}成功`);
        setModalVisible(false);
        loadWorkPositions();
      } else {
        message.error(errorMsg || `${modalType === 'edit' ? '更新' : '新增'}失败`);
      }
    } catch (error) {
      console.error('提交表单失败:', error);
      message.error('操作失败');
    }
  };

  // 复制表单提交
  const handleCopySubmit = async () => {
    try {
      const values = await copyForm.validateFields();
      
      const response = await copyWorkPosition(
        values.sourceId,
        values.targetDepartmentId,
        values.newName
      );
      
      // 处理不同的返回格式
      let success = false;
      let errorMsg = '';

      if (response.resp_code === 0) {
        success = response.datas?.code === 0 || true;
        errorMsg = response.resp_msg || response.datas?.msg || '';
      } else if (response.code === 0) {
        success = true;
        errorMsg = response.msg || '';
      }
      
      if (success) {
        message.success('复制成功');
        setCopyVisible(false);
        loadWorkPositions();
      } else {
        message.error(errorMsg || '复制失败');
      }
    } catch (error) {
      console.error('复制岗位失败:', error);
      message.error('复制失败');
    }
  };

  // 导出数据
  function handleExport() {
    message.info('导出功能开发中...');
  }

  // 导入数据
  function handleImport() {
    message.info('导入功能开发中...');
  }

  // 搜索处理
  const handleSearch = (value: string) => {
    setQueryParams(prev => ({ ...prev, keyword: value, current: 1 }));
  };

  // 刷新数据
  const handleRefresh = () => {
    setQueryParams(prev => ({ ...prev, current: 1 }));
    loadWorkPositions();
  };

  // 表格变化处理
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const { current, pageSize } = pagination;
    let sortField: string | undefined, sortOrder: string | undefined;
    
    if (sorter && sorter.order) {
      sortField = sorter.field;
      sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    setQueryParams(prev => ({
      ...prev,
      current,
      size: pageSize,
      sortField,
      sortOrder,
      status: filters.status?.[0],
    }));
  };

  // 数据变化时重新加载
  useEffect(() => {
    loadWorkPositions();
  }, [queryParams.current, queryParams.size, queryParams.name, queryParams.shortName, queryParams.departmentId, queryParams.positionLevel, queryParams.isManager, queryParams.isDirector, queryParams.status, queryParams.keyword, queryParams.sortField, queryParams.sortOrder]);

  // 转换部门树数据（用于TreeSelect）
  const convertDepartmentTreeData = (departments: any[]): any[] => {
    return departments.map(dept => ({
      title: dept.name,
      value: dept.id,
      key: dept.id,
      children: dept.children ? convertDepartmentTreeData(dept.children) : [],
    }));
  };

  // 展开部门树为平级列表（用于普通Select）
  const flattenDepartments = (departments: any[], level = 0): any[] => {
    let result: any[] = [];
    departments.forEach(dept => {
      const indent = '　'.repeat(level); // 使用全角空格作为缩进
      result.push({
        id: dept.id,
        name: `${indent}${dept.name}`,
        level: level
      });
      if (dept.children && dept.children.length > 0) {
        result = result.concat(flattenDepartments(dept.children, level + 1));
      }
    });
    return result;
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        {/* 头部操作区 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="搜索岗位名称或简称"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="选择部门"
              allowClear
              style={{ width: '100%' }}
              value={queryParams.departmentId}
              onChange={(value) => setQueryParams(prev => ({ ...prev, departmentId: value, current: 1 }))}
              showSearch
              filterOption={(input, option) => {
                const label = option?.label || option?.value || '';
                return String(label).toLowerCase().includes(input.toLowerCase());
              }}
            >
              {flattenDepartments(departments).map(dept => (
                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="选择级别"
              allowClear
              style={{ width: '100%' }}
              value={queryParams.positionLevel}
              onChange={(value) => setQueryParams(prev => ({ ...prev, positionLevel: value, current: 1 }))}
            >
              {levelOptions.map(level => (
                <Option key={level.value} value={level.value}>{level.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: '100%' }}
              value={queryParams.status}
              onChange={(value) => setQueryParams(prev => ({ ...prev, status: value, current: 1 }))}
            >
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Col>
        </Row>

        {/* 工具栏 */}
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增岗位
              </Button>
              <Popconfirm
                title="确定要删除选中的岗位吗？"
                onConfirm={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
              >
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量删除
                </Button>
              </Popconfirm>
              <Dropdown menu={{ items: moreMenuItems }} placement="bottomLeft">
                <Button icon={<MoreOutlined />}>
                  更多操作 <DownOutlined />
                </Button>
              </Dropdown>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 选中统计 */}
        {selectedRowKeys.length > 0 && (
          <Alert
            message={`已选择 ${selectedRowKeys.length} 个岗位`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={() => setSelectedRowKeys([])}>
                取消选择
              </Button>
            }
          />
        )}

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={positions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="small"
        />

        {/* 新增/编辑模态框 */}
        <Modal
          title={modalType === 'add' ? '新增岗位' : '编辑岗位'}
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
              status: true,
              isManager: false,
              isDirector: false,
              sortOrder: 0,
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
                  label="岗位简称"
                  name="shortName"
                >
                  <Input placeholder="请输入岗位简称" />
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
                    allowClear
                    showSearch
                    treeNodeFilterProp="title"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeDefaultExpandAll
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="岗位级别"
                  name="positionLevel"
                >
                  <Select placeholder="请选择岗位级别">
                    {levelOptions.map(level => (
                      <Option key={level.value} value={level.value}>{level.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="薪资范围"
                  name="salaryRange"
                >
                  <Input placeholder="如：8000-12000" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="最大人数"
                  name="maxEmployees"
                >
                  <InputNumber 
                    placeholder="最大任职人数" 
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="排序序号"
                  name="sortOrder"
                >
                  <InputNumber 
                    placeholder="排序序号" 
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="岗位属性">
                  <Space>
                    <Form.Item name="isManager" valuePropName="checked" noStyle>
                      <Switch checkedChildren="管理岗" unCheckedChildren="非管理岗" />
                    </Form.Item>
                    <Form.Item name="isDirector" valuePropName="checked" noStyle>
                      <Switch checkedChildren="主管岗" unCheckedChildren="非主管岗" />
                    </Form.Item>
                    <Form.Item name="status" valuePropName="checked" noStyle>
                      <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                    </Form.Item>
                  </Space>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="岗位职责"
              name="jobDescription"
            >
              <TextArea 
                placeholder="请输入岗位职责描述"
                rows={4}
              />
            </Form.Item>

            <Form.Item
              label="任职要求"
              name="requirements"
            >
              <TextArea 
                placeholder="请输入任职要求"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 复制模态框 */}
        <Modal
          title="复制岗位"
          open={copyVisible}
          onOk={handleCopySubmit}
          onCancel={() => setCopyVisible(false)}
          width={600}
          destroyOnClose
        >
          <Form
            form={copyForm}
            layout="vertical"
          >
            <Form.Item name="sourceId" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              label="新岗位名称"
              name="newName"
              rules={[{ required: true, message: '请输入新岗位名称' }]}
            >
              <Input placeholder="请输入新岗位名称" />
            </Form.Item>
            <Form.Item
              label="目标部门"
              name="targetDepartmentId"
              rules={[{ required: true, message: '请选择目标部门' }]}
            >
              <TreeSelect
                placeholder="请选择目标部门"
                treeData={convertDepartmentTreeData(departments)}
                allowClear
                showSearch
                treeNodeFilterProp="title"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeDefaultExpandAll
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 详情抽屉 */}
        <Drawer
          title="岗位详情"
          open={detailVisible}
          onClose={() => setDetailVisible(false)}
          width={600}
        >
          {positionDetail && (
            <div>
              <Descriptions title="基本信息" bordered column={1}>
                <Descriptions.Item label="岗位名称">
                  {positionDetail.name}
                  {positionDetail.isManager === 1 && (
                    <Tag color="red" style={{ marginLeft: 8 }}>管理岗</Tag>
                  )}
                  {positionDetail.isDirector === 1 && (
                    <Tag color="purple" style={{ marginLeft: 8 }}>主管岗</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="岗位简称">
                  {positionDetail.shortName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="所属部门">
                  {positionDetail.departmentName}
                </Descriptions.Item>
                <Descriptions.Item label="岗位级别">
                  <Tag color={levelOptions.find(item => item.value === positionDetail.positionLevel)?.color || 'default'}>
                    {positionDetail.positionLevelName}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="薪资范围">
                  {positionDetail.salaryRange || '面议'}
                </Descriptions.Item>
                <Descriptions.Item label="人员配置">
                  {positionDetail.currentEmployees} / {positionDetail.maxEmployees || '无限制'}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Badge 
                    status={positionDetail.status === 1 ? 'success' : 'error'} 
                    text={positionDetail.status === 1 ? '启用' : '禁用'} 
                  />
                </Descriptions.Item>
                <Descriptions.Item label="排序序号">
                  {positionDetail.sortOrder || 0}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions title="详细信息" bordered column={1}>
                <Descriptions.Item label="岗位职责">
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {positionDetail.jobDescription || '-'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="任职要求">
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {positionDetail.requirements || '-'}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions title="系统信息" bordered column={1}>
                <Descriptions.Item label="创建时间">
                  {positionDetail.createdAt}
                </Descriptions.Item>
                <Descriptions.Item label="创建人">
                  {positionDetail.createdByName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {positionDetail.updatedAt}
                </Descriptions.Item>
                <Descriptions.Item label="更新人">
                  {positionDetail.updatedByName || '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Drawer>

        {/* 权限配置组件 */}
        {permissionPosition && (
          <PositionPermissions
            visible={permissionVisible}
            positionId={permissionPosition.id}
            positionName={permissionPosition.name}
            onClose={() => {
              setPermissionVisible(false);
              setPermissionPosition(null);
            }}
            onSuccess={() => {
              message.success('权限配置成功');
              setPermissionVisible(false);
              setPermissionPosition(null);
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default WorkPositionManagement; 