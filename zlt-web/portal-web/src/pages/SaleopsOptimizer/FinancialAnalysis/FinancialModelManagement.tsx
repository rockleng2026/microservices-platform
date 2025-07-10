import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Modal,
  Form,
  Row,
  Col,
  Tag,
  Tooltip,
  Divider,
  Popconfirm,
  Badge,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SettingOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface FinancialModel {
  id: number;
  modelName: string;
  modelCode: string;
  modelCategory: string;
  modelType: string;
  description?: string;
  isActive: boolean;
  variableCount: number;
  chartCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ModelFormData {
  modelName: string;
  modelCode: string;
  modelCategory: string;
  modelType: string;
  description?: string;
  isActive: boolean;
}

const FinancialModelManagement: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<FinancialModel[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // 查询条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  
  // 弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<FinancialModel | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailModel, setDetailModel] = useState<FinancialModel | null>(null);
  
  // 表单
  const [form] = Form.useForm();

  // 模拟数据
  const mockData: FinancialModel[] = [
    {
      id: 1,
      modelName: '盈亏平衡分析模型',
      modelCode: 'BREAKEVEN_001',
      modelCategory: '财务分析',
      modelType: 'breakeven',
      description: '用于计算企业盈亏平衡点的财务分析模型',
      isActive: true,
      variableCount: 8,
      chartCount: 3,
      createdAt: '2024-01-15 10:30:00',
      updatedAt: '2024-01-15 14:20:00',
      createdBy: '张三'
    },
    {
      id: 2,
      modelName: '成本分析模型',
      modelCode: 'COST_001',
      modelCategory: '成本管理',
      modelType: 'cost',
      description: '企业成本结构分析和优化模型',
      isActive: true,
      variableCount: 12,
      chartCount: 5,
      createdAt: '2024-01-14 09:15:00',
      updatedAt: '2024-01-15 11:30:00',
      createdBy: '李四'
    },
    {
      id: 3,
      modelName: '敏感性分析模型',
      modelCode: 'SENSITIVITY_001',
      modelCategory: '风险分析',
      modelType: 'sensitivity',
      description: '分析关键参数变化对财务指标的影响',
      isActive: false,
      variableCount: 6,
      chartCount: 2,
      createdAt: '2024-01-13 16:45:00',
      updatedAt: '2024-01-14 10:20:00',
      createdBy: '王五'
    }
  ];

  // 表格列配置
  const columns: ColumnsType<FinancialModel> = [
    {
      title: '模型信息',
      key: 'modelInfo',
      width: 280,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
            {record.modelName}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            编码: {record.modelCode}
          </div>
          <Space>
            <Tag color="blue">{record.modelCategory}</Tag>
            <Badge
              status={record.isActive ? 'success' : 'default'}
              text={record.isActive ? '启用' : '禁用'}
            />
          </Space>
        </div>
      ),
    },
    {
      title: '模型类型',
      dataIndex: 'modelType',
      key: 'modelType',
      width: 120,
      render: (type) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          breakeven: { color: 'green', text: '盈亏平衡' },
          cost: { color: 'blue', text: '成本分析' },
          sensitivity: { color: 'orange', text: '敏感性分析' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '配置统计',
      key: 'statistics',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            变量: <span style={{ color: '#1890ff', fontWeight: 600 }}>{record.variableCount}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            图表: <span style={{ color: '#52c41a', fontWeight: 600 }}>{record.chartCount}</span>
          </div>
        </div>
      ),
    },
    {
      title: '更新信息',
      key: 'updateInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            更新时间: {record.updatedAt}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            创建人: {record.createdBy}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑模型">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="变量管理">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleVariableManagement(record)}
            />
          </Tooltip>
          <Tooltip title="复制模型">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title="导出配置">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleExport(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个财务模型吗？"
            description="删除后将无法恢复，相关的图表配置也会被删除。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 获取模型列表
  const fetchModels = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      let filteredData = [...mockData];
      
      if (searchKeyword) {
        filteredData = filteredData.filter(
          item => 
            item.modelName.includes(searchKeyword) ||
            item.modelCode.includes(searchKeyword) ||
            item.description?.includes(searchKeyword)
        );
      }
      
      if (selectedCategory) {
        filteredData = filteredData.filter(item => item.modelCategory === selectedCategory);
      }
      
      if (selectedStatus !== undefined) {
        const isActive = selectedStatus === 'active';
        filteredData = filteredData.filter(item => item.isActive === isActive);
      }
      
      setModels(filteredData);
      setTotal(filteredData.length);
      setLoading(false);
    }, 800);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  // 处理筛选
  const handleFilter = () => {
    setCurrentPage(1);
    fetchModels();
  };

  // 处理分页
  const handleTableChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // 处理新增
  const handleAdd = () => {
    setEditingModel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: FinancialModel) => {
    setEditingModel(record);
    form.setFieldsValue({
      modelName: record.modelName,
      modelCode: record.modelCode,
      modelCategory: record.modelCategory,
      modelType: record.modelType,
      description: record.description,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  // 处理查看详情
  const handleViewDetail = (record: FinancialModel) => {
    setDetailModel(record);
    setIsDetailVisible(true);
  };

  // 处理变量管理
  const handleVariableManagement = (record: FinancialModel) => {
    message.info(`打开模型 ${record.modelName} 的变量管理页面`);
    // TODO: 跳转到变量管理页面
  };

  // 处理复制
  const handleCopy = (record: FinancialModel) => {
    Modal.confirm({
      title: '复制财务模型',
      content: `确定要复制模型 "${record.modelName}" 吗？`,
      onOk: () => {
        message.success('模型复制成功');
        fetchModels();
      },
    });
  };

  // 处理导出
  const handleExport = (record: FinancialModel) => {
    message.info(`导出模型 ${record.modelName} 的配置`);
    // TODO: 实现导出功能
  };

  // 处理删除
  const handleDelete = (id: number) => {
    message.success('删除成功');
    fetchModels();
  };

  // 处理表单提交
  const handleFormSubmit = (values: ModelFormData) => {
    console.log('表单数据:', values);
    
    if (editingModel) {
      message.success('更新成功');
    } else {
      message.success('创建成功');
    }
    
    setIsModalVisible(false);
    fetchModels();
  };

  // 处理导入
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        message.success('导入成功');
        fetchModels();
      }
    };
    input.click();
  };

  // 初始化
  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    fetchModels();
  }, [searchKeyword, selectedCategory, selectedStatus]);

  return (
    <div className="financial-model-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 8 }}>财务模型管理</h2>
            <span style={{ color: '#666', fontSize: '14px' }}>
              管理盈亏平衡分析、成本分析等财务模型
            </span>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增模型
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={handleImport}
            >
              导入模型
            </Button>
          </Space>
        </div>

        <Divider />

        {/* 查询条件 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="搜索模型名称、编码、描述"
                allowClear
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="选择分类"
                allowClear
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                <Option value="财务分析">财务分析</Option>
                <Option value="成本管理">成本管理</Option>
                <Option value="风险分析">风险分析</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={handleFilter}>
                查询
              </Button>
            </Col>
          </Row>
        </div>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={models}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingModel ? '编辑财务模型' : '新增财务模型'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模型名称"
                name="modelName"
                rules={[{ required: true, message: '请输入模型名称' }]}
              >
                <Input placeholder="请输入模型名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="模型编码"
                name="modelCode"
                rules={[
                  { required: true, message: '请输入模型编码' },
                  { pattern: /^[A-Z0-9_]+$/, message: '编码只能包含大写字母、数字和下划线' }
                ]}
              >
                <Input placeholder="请输入模型编码" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模型分类"
                name="modelCategory"
                rules={[{ required: true, message: '请选择模型分类' }]}
              >
                <Select placeholder="请选择模型分类">
                  <Option value="财务分析">财务分析</Option>
                  <Option value="成本管理">成本管理</Option>
                  <Option value="风险分析">风险分析</Option>
                  <Option value="投资决策">投资决策</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="模型类型"
                name="modelType"
                rules={[{ required: true, message: '请选择模型类型' }]}
              >
                <Select placeholder="请选择模型类型">
                  <Option value="breakeven">盈亏平衡</Option>
                  <Option value="cost">成本分析</Option>
                  <Option value="sensitivity">敏感性分析</Option>
                  <Option value="roi">投资回报</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="模型描述"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="请输入模型描述"
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Select>
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingModel ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="财务模型详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {detailModel && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="模型名称" span={2}>
              {detailModel.modelName}
            </Descriptions.Item>
            <Descriptions.Item label="模型编码">
              {detailModel.modelCode}
            </Descriptions.Item>
            <Descriptions.Item label="模型分类">
              <Tag color="blue">{detailModel.modelCategory}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="模型类型">
              <Tag color="green">{detailModel.modelType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge
                status={detailModel.isActive ? 'success' : 'default'}
                text={detailModel.isActive ? '启用' : '禁用'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="变量数量">
              {detailModel.variableCount} 个
            </Descriptions.Item>
            <Descriptions.Item label="图表数量">
              {detailModel.chartCount} 个
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {detailModel.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {detailModel.updatedAt}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">
              {detailModel.createdBy}
            </Descriptions.Item>
            <Descriptions.Item label="模型描述" span={2}>
              {detailModel.description || '暂无描述'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default FinancialModelManagement; 