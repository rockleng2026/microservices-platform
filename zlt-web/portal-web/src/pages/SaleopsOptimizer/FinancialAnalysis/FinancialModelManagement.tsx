import React, { useState, useEffect, useRef } from 'react';
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
import { 
  FinancialModelAPI, 
  type FinancialModel, 
  type ModelFormData,
  type PageParams 
} from '@/services/financialModel';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

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
  
  // 标记是否是首次渲染
  const isFirstRender = useRef(true);

  // 模型分类枚举（英文值 -> 中文显示）
  const MODEL_CATEGORIES = {
    BREAKEVEN_ANALYSIS: 'breakeven_analysis',
    COST_BENEFIT: 'cost_benefit', 
    SENSITIVITY_ANALYSIS: 'sensitivity_analysis',
    CASHFLOW_FORECAST: 'cashflow_forecast',
    INVESTMENT_DECISION: 'investment_decision',
    BUDGET_MANAGEMENT: 'budget_management'
  } as const;

  // 分类显示映射（英文值 -> 中文名称）
  const categoryDisplayMap: Record<string, string> = {
    [MODEL_CATEGORIES.BREAKEVEN_ANALYSIS]: '盈亏平衡分析',
    [MODEL_CATEGORIES.COST_BENEFIT]: '成本效益分析',
    [MODEL_CATEGORIES.SENSITIVITY_ANALYSIS]: '敏感性分析', 
    [MODEL_CATEGORIES.CASHFLOW_FORECAST]: '现金流预测',
    [MODEL_CATEGORIES.INVESTMENT_DECISION]: '投资决策',
    [MODEL_CATEGORIES.BUDGET_MANAGEMENT]: '预算管理',
    // 兼容其他可能的值
    'financial_analysis': '财务分析',
    'cost_management': '成本管理',
    'risk_analysis': '风险分析',
    // 兼容旧数据的中文值
    '财务分析': '财务分析',
    '成本管理': '成本管理',
    '风险分析': '风险分析',
    '投资决策': '投资决策',
    '预算管理': '预算管理'
  };

  // 分类选项（用于表单选择）
  const categoryOptions = [
    { value: MODEL_CATEGORIES.BREAKEVEN_ANALYSIS, label: '盈亏平衡分析' },
    { value: MODEL_CATEGORIES.COST_BENEFIT, label: '成本效益分析' },
    { value: MODEL_CATEGORIES.SENSITIVITY_ANALYSIS, label: '敏感性分析' },
    { value: MODEL_CATEGORIES.CASHFLOW_FORECAST, label: '现金流预测' },
    { value: MODEL_CATEGORIES.INVESTMENT_DECISION, label: '投资决策' },
    { value: MODEL_CATEGORIES.BUDGET_MANAGEMENT, label: '预算管理' }
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
          <Badge
            status={record.isActive ? 'success' : 'default'}
            text={record.isActive ? '启用' : '禁用'}
          />
        </div>
      ),
    },
    {
      title: '模型分类',
      dataIndex: 'modelCategory',
      key: 'modelCategory',
      width: 120,
      render: (category) => {
        const categoryConfig: Record<string, { color: string }> = {
          [MODEL_CATEGORIES.BREAKEVEN_ANALYSIS]: { color: 'blue' },
          [MODEL_CATEGORIES.COST_BENEFIT]: { color: 'green' },
          [MODEL_CATEGORIES.SENSITIVITY_ANALYSIS]: { color: 'orange' },
          [MODEL_CATEGORIES.CASHFLOW_FORECAST]: { color: 'purple' },
          [MODEL_CATEGORIES.INVESTMENT_DECISION]: { color: 'cyan' },
          [MODEL_CATEGORIES.BUDGET_MANAGEMENT]: { color: 'magenta' },
          // 兼容其他可能的值
          'financial_analysis': { color: 'blue' },
          'cost_management': { color: 'green' },
          'risk_analysis': { color: 'orange' },
          // 兼容旧数据的中文值
          '财务分析': { color: 'blue' },
          '成本管理': { color: 'green' },
          '风险分析': { color: 'orange' },
          '投资决策': { color: 'cyan' },
          '预算管理': { color: 'magenta' },
        };
        const config = categoryConfig[category] || { color: 'default' };
        return <Tag color={config.color}>{categoryDisplayMap[category] || category}</Tag>;
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
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
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
          <Tooltip title="变量管理">
            <Button 
              type="link" 
              size="small" 
              icon={<SettingOutlined />}
              onClick={() => handleVariableManagement(record)}
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
          <Tooltip title="导出">
            <Button 
              type="link" 
              size="small" 
              icon={<DownloadOutlined />}
              onClick={() => handleExport(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个财务模型吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="link" 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 获取模型列表
  const fetchModels = async () => {
    try {
      setLoading(true);
      
      const params: PageParams = {
        current: currentPage,
        pageSize: pageSize,
        keyword: searchKeyword || undefined,
        category: selectedCategory,
        status: selectedStatus,
      };
      
      const result = await FinancialModelAPI.getModels(params);
      setModels(result.data);
      setTotal(result.count);
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error(error instanceof Error ? error.message : '获取模型列表失败');
      setModels([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
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
      modelDescription: record.modelDescription,
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
    // 跳转到变量管理页面
    window.location.href = `/saleops-optimizer/financial-analysis/variable-management/${record.id}`;
  };

  // 处理复制
  const handleCopy = (record: FinancialModel) => {
    Modal.confirm({
      title: '复制财务模型',
      content: (
        <div>
          <p>确定要复制模型 "{record.modelName}" 吗？</p>
          <Form layout="vertical">
            <Form.Item label="新模型编码" name="newModelCode">
              <Input placeholder="请输入新模型编码" />
            </Form.Item>
            <Form.Item label="新模型名称" name="newModelName">
              <Input placeholder="请输入新模型名称" />
            </Form.Item>
          </Form>
        </div>
      ),
      onOk: async () => {
        try {
          const newModelCode = `${record.modelCode}_COPY_${Date.now()}`;
          const newModelName = `${record.modelName}_副本`;
          
          await FinancialModelAPI.cloneModel(record.id, newModelCode, newModelName, true);
          message.success('模型复制成功');
          fetchModels();
        } catch (error) {
          console.error('复制模型失败:', error);
          message.error(error instanceof Error ? error.message : '复制模型失败');
        }
      },
    });
  };

  // 处理导出
  const handleExport = async (record: FinancialModel) => {
    try {
      const configJson = await FinancialModelAPI.exportModelConfig(record.id);
      
      // 创建下载链接
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${record.modelCode}_config.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success('模型配置导出成功');
    } catch (error) {
      console.error('导出模型配置失败:', error);
      message.error(error instanceof Error ? error.message : '导出模型配置失败');
    }
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await FinancialModelAPI.deleteModel(id);
      message.success('删除成功');
      fetchModels();
    } catch (error) {
      console.error('删除模型失败:', error);
      message.error(error instanceof Error ? error.message : '删除模型失败');
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (values: ModelFormData) => {
    try {
      if (editingModel) {
        await FinancialModelAPI.updateModel(editingModel.id, values);
        message.success('更新成功');
      } else {
        await FinancialModelAPI.createModel(values);
        message.success('创建成功');
      }
      
      setIsModalVisible(false);
      fetchModels();
    } catch (error) {
      console.error('保存模型失败:', error);
      message.error(error instanceof Error ? error.message : '保存模型失败');
    }
  };

  // 处理导入
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          await FinancialModelAPI.importModelConfig(text);
          message.success('导入成功');
          fetchModels();
        } catch (error) {
          console.error('导入模型失败:', error);
          message.error(error instanceof Error ? error.message : '导入模型失败');
        }
      }
    };
    input.click();
  };

  // 处理分页变化
  useEffect(() => {
    fetchModels();
  }, [currentPage, pageSize]);

  // 处理搜索条件变化，重置到第1页
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (currentPage === 1) {
      fetchModels();
    } else {
      setCurrentPage(1);
    }
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
                <Option value={MODEL_CATEGORIES.BREAKEVEN_ANALYSIS}>盈亏平衡分析</Option>
                <Option value={MODEL_CATEGORIES.COST_BENEFIT}>成本效益分析</Option>
                <Option value={MODEL_CATEGORIES.SENSITIVITY_ANALYSIS}>敏感性分析</Option>
                <Option value={MODEL_CATEGORIES.CASHFLOW_FORECAST}>现金流预测</Option>
                <Option value={MODEL_CATEGORIES.INVESTMENT_DECISION}>投资决策</Option>
                <Option value={MODEL_CATEGORIES.BUDGET_MANAGEMENT}>预算管理</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="选择状态"
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
              <Button onClick={handleFilter}>搜索</Button>
            </Col>
          </Row>
        </div>

        {/* 数据表格 */}
        <Table<FinancialModel>
          columns={columns}
          dataSource={models}
          rowKey="id"
          loading={loading}
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
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑模型弹窗 */}
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
                name="modelName"
                label="模型名称"
                rules={[{ required: true, message: '请输入模型名称' }]}
              >
                <Input placeholder="请输入模型名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="modelCode"
                label="模型编码"
                rules={[{ required: true, message: '请输入模型编码' }]}
              >
                <Input placeholder="请输入模型编码" disabled={!!editingModel} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="modelCategory"
            label="模型分类"
            rules={[{ required: true, message: '请选择模型分类' }]}
          >
            <Select placeholder="请选择模型分类">
              <Option value={MODEL_CATEGORIES.BREAKEVEN_ANALYSIS}>盈亏平衡分析</Option>
              <Option value={MODEL_CATEGORIES.COST_BENEFIT}>成本效益分析</Option>
              <Option value={MODEL_CATEGORIES.SENSITIVITY_ANALYSIS}>敏感性分析</Option>
              <Option value={MODEL_CATEGORIES.CASHFLOW_FORECAST}>现金流预测</Option>
              <Option value={MODEL_CATEGORIES.INVESTMENT_DECISION}>投资决策</Option>
              <Option value={MODEL_CATEGORIES.BUDGET_MANAGEMENT}>预算管理</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="modelDescription"
            label="模型描述"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入模型描述（可选）" 
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Space>
              <span>启用模型</span>
            </Space>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
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

      {/* 模型详情弹窗 */}
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
              <Tag color="blue">{categoryDisplayMap[detailModel.modelCategory] || detailModel.modelCategory}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge
                status={detailModel.isActive ? 'success' : 'default'}
                text={detailModel.isActive ? '启用' : '禁用'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="变量数量">
              {detailModel.variableCount}
            </Descriptions.Item>
            <Descriptions.Item label="图表数量">
              {detailModel.chartCount}
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
              {detailModel.modelDescription || '暂无描述'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default FinancialModelManagement; 