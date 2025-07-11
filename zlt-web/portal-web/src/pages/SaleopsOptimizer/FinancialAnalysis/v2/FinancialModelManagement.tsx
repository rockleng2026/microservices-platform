import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Tooltip,
  Divider,
  Badge,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  BarChartOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { FinancialModelAPI, FinancialModel, ModelFormData, PageParams } from '@/services/financialModel';

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const FinancialModelManagementV2: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<FinancialModel[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<FinancialModel | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailModel, setDetailModel] = useState<FinancialModel | null>(null);
  
  // 表单和缓存
  const [form] = Form.useForm();
  const firstRenderRef = useRef(true);

  // 分类选项
  const categoryOptions = [
    { label: '盈亏平衡分析', value: 'breakeven_analysis' },
    { label: '成本分析', value: 'cost_analysis' },
    { label: '利润分析', value: 'profit_analysis' },
    { label: '预测分析', value: 'forecast_analysis' },
    { label: '自定义', value: 'custom' }
  ];

  // 获取分类显示名称
  const getCategoryDisplayName = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  // 初始化数据
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      fetchModels();
    }
  }, []);

  // 参数变化时重新获取数据 (排除首次渲染)
  useEffect(() => {
    if (!firstRenderRef.current) {
      fetchModels();
    }
  }, [current, pageSize, searchKeyword, selectedCategory, selectedStatus]);

  // 获取模型列表
  const fetchModels = async () => {
    try {
      setLoading(true);
      console.log('获取模型列表，参数:', { current, pageSize, searchKeyword, selectedCategory, selectedStatus });
      
      const params: PageParams = {
        current: current,
        pageSize: pageSize,
        keyword: searchKeyword || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined
      };

      const response = await FinancialModelAPI.getModels(params);
      console.log('API响应:', response);
      
      // API已经处理了错误情况，直接使用返回的数据
      setModels(response.data || []);
      setTotal(response.count || 0);
      
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error(`获取模型列表失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrent(1);
  };

  // 处理分页变化
  const handleTableChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
  };

  // 新增模型
  const handleAdd = () => {
    setEditingModel(null);
    form.resetFields();
    form.setFieldsValue({
      modelCategory: 'breakeven_analysis',
      isActive: true
    });
    setModalVisible(true);
  };

  // 编辑模型
  const handleEdit = (record: FinancialModel) => {
    setEditingModel(record);
    form.setFieldsValue({
      modelCode: record.modelCode,
      modelName: record.modelName,
      modelCategory: record.modelCategory,
      modelDescription: record.modelDescription,
      isActive: record.isActive
    });
    setModalVisible(true);
  };

  // 查看详情
  const handleViewDetail = (record: FinancialModel) => {
    setDetailModel(record);
    setIsDetailVisible(true);
  };

  // 变量管理
  const handleVariableManagement = (record: FinancialModel) => {
    window.open(`/saleops-optimizer/financial-analysis/v2/variable-management?modelId=${record.id}`, '_blank');
  };

  // 图表配置
  const handleChartManagement = (record: FinancialModel) => {
    window.open(`/saleops-optimizer/financial-analysis/v2/chart-management?modelId=${record.id}`, '_blank');
  };

  // 保存模型
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData: ModelFormData = {
        modelCode: values.modelCode,
        modelName: values.modelName,
        modelCategory: values.modelCategory,
        modelDescription: values.modelDescription,
        isActive: values.isActive ?? true
      };

      let response;
      if (editingModel) {
        response = await FinancialModelAPI.updateModel(editingModel.id, formData);
      } else {
        response = await FinancialModelAPI.createModel(formData);
      }

      message.success(editingModel ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchModels();
      
    } catch (error) {
      console.error('保存失败:', error);
      message.error(`保存失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 删除模型
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await FinancialModelAPI.deleteModel(id);
      message.success('删除成功');
      fetchModels();
    } catch (error) {
      console.error('删除失败:', error);
      message.error(`删除失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 复制模型
  const handleCopy = async (record: FinancialModel) => {
    try {
      setLoading(true);
      const newModelCode = `${record.modelCode}_COPY_${Date.now()}`;
      const newModelName = `${record.modelName} - 副本`;
      
      await FinancialModelAPI.cloneModel(
        record.id,
        newModelCode,
        newModelName,
        true
      );

      message.success('复制成功');
      fetchModels();
    } catch (error) {
      console.error('复制失败:', error);
      message.error(`复制失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 启用/禁用模型
  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      setLoading(true);
      await FinancialModelAPI.toggleModelStatus(id, isActive);
      message.success(isActive ? '启用成功' : '禁用成功');
      fetchModels();
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error(`状态更新失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 导出模型配置
  const handleExport = async (record: FinancialModel) => {
    try {
      setLoading(true);
      const configJson = await FinancialModelAPI.exportModelConfig(record.id);
      
      // 创建下载链接
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${record.modelCode}_config.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error(`导出失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 导入配置
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
          message.error('导入模型失败');
        }
      }
    };
    input.click();
  };

  // 表格列定义 - 参考V1版本的优雅设计
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
          'breakeven_analysis': { color: 'blue' },
          'cost_analysis': { color: 'green' },
          'profit_analysis': { color: 'orange' },
          'forecast_analysis': { color: 'purple' },
          'custom': { color: 'cyan' }
        };
        const config = categoryConfig[category] || { color: 'default' };
        return <Tag color={config.color}>{getCategoryDisplayName(category)}</Tag>;
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
            变量: <span style={{ color: '#1890ff', fontWeight: 600 }}>{record.variableCount || 0}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            图表: <span style={{ color: '#52c41a', fontWeight: 600 }}>{record.chartCount || 0}</span>
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
            更新时间: {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '-'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            创建人: {record.createdBy || '-'}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
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
          <Tooltip title="图表配置">
            <Button 
              type="link" 
              size="small" 
              icon={<BarChartOutlined />}
              onClick={() => handleChartManagement(record)}
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

  return (
    <div className="financial-model-management-v2">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 8 }}>财务模型管理 V2</h2>
            <span style={{ color: '#666', fontSize: '14px' }}>
              管理盈亏平衡分析、成本分析等各类财务模型的定义和配置
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
                {categoryOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
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
          </Row>
        </div>

        {/* 数据表格 */}
        <Table<FinancialModel>
          columns={columns}
          dataSource={models}
          rowKey="id"
          loading={loading}
          pagination={{
            current: current,
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

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingModel ? '编辑财务模型' : '新增财务模型'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
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
              {categoryOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
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
              <Switch />
              <span>启用模型</span>
            </Space>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
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
              <Tag color="blue">{getCategoryDisplayName(detailModel.modelCategory)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge
                status={detailModel.isActive ? 'success' : 'default'}
                text={detailModel.isActive ? '启用' : '禁用'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="变量数量">
              {detailModel.variableCount || 0}
            </Descriptions.Item>
            <Descriptions.Item label="图表数量">
              {detailModel.chartCount || 0}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {detailModel.createdAt ? new Date(detailModel.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {detailModel.updatedAt ? new Date(detailModel.updatedAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">
              {detailModel.createdBy || '-'}
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

export default FinancialModelManagementV2; 