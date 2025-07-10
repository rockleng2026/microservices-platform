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
  Switch,
  InputNumber,
  Tabs,
  Timeline,
  Badge,
  List,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HistoryOutlined,
  LineChartOutlined,
  BarChartOutlined,
  DotChartOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  CopyOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface ChartModel {
  id: number;
  modelId: number;
  chartName: string;
  chartType: 'line' | 'bar' | 'scatter';
  xAxisField: string;
  xAxisUnit?: string;
  yAxisField: string;
  yAxisUnit?: string;
  simulationSteps: number;
  description?: string;
  seriesCount: number;
  isActive: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  financialModel?: {
    modelName: string;
    modelCode: string;
  };
}

interface ChartSeries {
  id: number;
  chartModelId: number;
  seriesName: string;
  formulaExpression: string;
  seriesColor: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  isVisible: boolean;
}

interface ChartVersion {
  id: number;
  chartModelId: number;
  version: string;
  changeLog: string;
  createdAt: string;
  createdBy: string;
}

interface FinancialModel {
  id: number;
  modelName: string;
  modelCode: string;
}

const ChartManagement: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [chartModels, setChartModels] = useState<ChartModel[]>([]);
  const [models, setModels] = useState<FinancialModel[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // 查询条件
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedChartType, setSelectedChartType] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  
  // 弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVersionVisible, setIsVersionVisible] = useState(false);
  const [isSeriesVisible, setIsSeriesVisible] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartModel | null>(null);
  const [selectedChart, setSelectedChart] = useState<ChartModel | null>(null);
  const [chartVersions, setChartVersions] = useState<ChartVersion[]>([]);
  const [chartSeries, setChartSeries] = useState<ChartSeries[]>([]);
  
  // 表单
  const [form] = Form.useForm();

  // 模拟数据
  const mockModels: FinancialModel[] = [
    { id: 1, modelName: '盈亏平衡分析模型', modelCode: 'BREAKEVEN_001' },
    { id: 2, modelName: '成本分析模型', modelCode: 'COST_001' },
    { id: 3, modelName: '敏感性分析模型', modelCode: 'SENSITIVITY_001' }
  ];

  const mockChartModels: ChartModel[] = [
    {
      id: 1,
      modelId: 1,
      chartName: '盈亏平衡分析图',
      chartType: 'line',
      xAxisField: 'sales_volume',
      xAxisUnit: '件',
      yAxisField: 'profit',
      yAxisUnit: '元',
      simulationSteps: 100,
      description: '展示销售数量与利润的关系曲线',
      seriesCount: 3,
      isActive: true,
      version: 'v1.2.0',
      createdAt: '2024-01-15 10:30:00',
      updatedAt: '2024-01-15 14:20:00',
      createdBy: '张三',
      financialModel: {
        modelName: '盈亏平衡分析模型',
        modelCode: 'BREAKEVEN_001'
      }
    },
    {
      id: 2,
      modelId: 1,
      chartName: '成本结构分析图',
      chartType: 'bar',
      xAxisField: 'cost_category',
      yAxisField: 'cost_amount',
      yAxisUnit: '元',
      simulationSteps: 50,
      description: '分析各项成本的构成比例',
      seriesCount: 2,
      isActive: true,
      version: 'v1.0.0',
      createdAt: '2024-01-14 15:20:00',
      updatedAt: '2024-01-15 09:15:00',
      createdBy: '李四',
      financialModel: {
        modelName: '盈亏平衡分析模型',
        modelCode: 'BREAKEVEN_001'
      }
    },
    {
      id: 3,
      modelId: 2,
      chartName: '敏感性分析散点图',
      chartType: 'scatter',
      xAxisField: 'parameter_change',
      xAxisUnit: '%',
      yAxisField: 'impact_value',
      yAxisUnit: '元',
      simulationSteps: 200,
      description: '显示参数变化对关键指标的影响',
      seriesCount: 1,
      isActive: false,
      version: 'v0.9.0',
      createdAt: '2024-01-13 11:10:00',
      updatedAt: '2024-01-14 16:30:00',
      createdBy: '王五',
      financialModel: {
        modelName: '成本分析模型',
        modelCode: 'COST_001'
      }
    }
  ];

  const mockVersions: ChartVersion[] = [
    {
      id: 1,
      chartModelId: 1,
      version: 'v1.2.0',
      changeLog: '优化利润计算公式，增加税费考虑',
      createdAt: '2024-01-15 14:20:00',
      createdBy: '张三'
    },
    {
      id: 2,
      chartModelId: 1,
      version: 'v1.1.0',
      changeLog: '新增盈亏平衡线显示',
      createdAt: '2024-01-15 10:30:00',
      createdBy: '张三'
    },
    {
      id: 3,
      chartModelId: 1,
      version: 'v1.0.0',
      changeLog: '初始版本创建',
      createdAt: '2024-01-10 09:00:00',
      createdBy: '张三'
    }
  ];

  const mockSeries: ChartSeries[] = [
    {
      id: 1,
      chartModelId: 1,
      seriesName: '利润线',
      formulaExpression: 'sales_volume * unit_price - fixed_cost - sales_volume * variable_cost',
      seriesColor: '#1890ff',
      lineStyle: 'solid',
      isVisible: true
    },
    {
      id: 2,
      chartModelId: 1,
      seriesName: '总收入',
      formulaExpression: 'sales_volume * unit_price',
      seriesColor: '#52c41a',
      lineStyle: 'solid',
      isVisible: true
    },
    {
      id: 3,
      chartModelId: 1,
      seriesName: '盈亏平衡线',
      formulaExpression: '0',
      seriesColor: '#ff4d4f',
      lineStyle: 'dashed',
      isVisible: true
    }
  ];

  // 图表类型图标映射
  const chartTypeIcons = {
    line: <LineChartOutlined />,
    bar: <BarChartOutlined />,
    scatter: <DotChartOutlined />
  };

  // 表格列配置
  const columns: ColumnsType<ChartModel> = [
    {
      title: '图表信息',
      key: 'chartInfo',
      width: 280,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px', fontSize: '16px', color: '#1890ff' }}>
              {chartTypeIcons[record.chartType]}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>
                {record.chartName}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                版本: {record.version}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            关联模型: {record.financialModel?.modelName}
          </div>
          <Space>
            <Tag color="blue">{record.chartType}</Tag>
            <Badge
              status={record.isActive ? 'success' : 'default'}
              text={record.isActive ? '启用' : '禁用'}
            />
          </Space>
        </div>
      ),
    },
    {
      title: '坐标轴配置',
      key: 'axisConfig',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>
            <strong>X轴:</strong> {record.xAxisField}
            {record.xAxisUnit && <span> ({record.xAxisUnit})</span>}
          </div>
          <div style={{ fontSize: '12px' }}>
            <strong>Y轴:</strong> {record.yAxisField}
            {record.yAxisUnit && <span> ({record.yAxisUnit})</span>}
          </div>
        </div>
      ),
    },
    {
      title: '配置统计',
      key: 'statistics',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            系列: <span style={{ color: '#1890ff', fontWeight: 600 }}>{record.seriesCount}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            步数: <span style={{ color: '#52c41a', fontWeight: 600 }}>{record.simulationSteps}</span>
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
            更新: {record.updatedAt}
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
      width: 300,
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
          <Tooltip title="编辑图表">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="系列管理">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleSeriesManagement(record)}
            />
          </Tooltip>
          <Tooltip title="版本历史">
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleVersionHistory(record)}
            />
          </Tooltip>
          <Tooltip title="数据模拟">
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleSimulation(record)}
            />
          </Tooltip>
          <Tooltip title="复制图表">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个图表配置吗？删除后将无法恢复。"
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

  // 获取图表模型列表
  const fetchChartModels = () => {
    setLoading(true);
    setTimeout(() => {
      let filteredData = [...mockChartModels];
      
      if (selectedModelId) {
        filteredData = filteredData.filter(item => item.modelId === selectedModelId);
      }
      
      if (searchKeyword) {
        filteredData = filteredData.filter(
          item => 
            item.chartName.includes(searchKeyword) ||
            item.description?.includes(searchKeyword) ||
            item.financialModel?.modelName.includes(searchKeyword)
        );
      }
      
      if (selectedChartType) {
        filteredData = filteredData.filter(item => item.chartType === selectedChartType);
      }
      
      if (selectedStatus !== undefined) {
        const isActive = selectedStatus === 'active';
        filteredData = filteredData.filter(item => item.isActive === isActive);
      }
      
      setChartModels(filteredData);
      setTotal(filteredData.length);
      setLoading(false);
    }, 500);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  // 处理筛选
  const handleFilter = () => {
    setCurrentPage(1);
    fetchChartModels();
  };

  // 处理分页
  const handleTableChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // 处理新增
  const handleAdd = () => {
    setEditingChart(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      simulationSteps: 100,
      chartType: 'line'
    });
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: ChartModel) => {
    setEditingChart(record);
    form.setFieldsValue({
      modelId: record.modelId,
      chartName: record.chartName,
      chartType: record.chartType,
      xAxisField: record.xAxisField,
      xAxisUnit: record.xAxisUnit,
      yAxisField: record.yAxisField,
      yAxisUnit: record.yAxisUnit,
      simulationSteps: record.simulationSteps,
      description: record.description,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  // 处理查看详情
  const handleViewDetail = (record: ChartModel) => {
    message.info(`查看图表 ${record.chartName} 的详细信息`);
  };

  // 处理系列管理
  const handleSeriesManagement = (record: ChartModel) => {
    setSelectedChart(record);
    setChartSeries(mockSeries.filter(s => s.chartModelId === record.id));
    setIsSeriesVisible(true);
  };

  // 处理版本历史
  const handleVersionHistory = (record: ChartModel) => {
    setSelectedChart(record);
    setChartVersions(mockVersions.filter(v => v.chartModelId === record.id));
    setIsVersionVisible(true);
  };

  // 处理数据模拟
  const handleSimulation = (record: ChartModel) => {
    message.info(`开始模拟图表 ${record.chartName} 的数据`);
    // TODO: 跳转到数据模拟页面或弹窗
  };

  // 处理复制
  const handleCopy = (record: ChartModel) => {
    Modal.confirm({
      title: '复制图表配置',
      content: `确定要复制图表 "${record.chartName}" 吗？`,
      onOk: () => {
        message.success('图表复制成功');
        fetchChartModels();
      },
    });
  };

  // 处理删除
  const handleDelete = (id: number) => {
    message.success('删除成功');
    fetchChartModels();
  };

  // 处理表单提交
  const handleFormSubmit = (values: any) => {
    console.log('表单数据:', values);
    
    if (editingChart) {
      message.success('更新成功');
    } else {
      message.success('创建成功');
    }
    
    setIsModalVisible(false);
    fetchChartModels();
  };

  // 初始化
  useEffect(() => {
    setModels(mockModels);
  }, []);

  useEffect(() => {
    fetchChartModels();
  }, [selectedModelId, searchKeyword, selectedChartType, selectedStatus]);

  return (
    <div className="chart-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 8 }}>模型图表管理</h2>
            <span style={{ color: '#666', fontSize: '14px' }}>
              管理财务模型的图表配置、系列设置和版本历史
            </span>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增图表
            </Button>
          </Space>
        </div>

        <Divider />

        {/* 查询条件 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={5}>
              <Select
                placeholder="选择财务模型"
                allowClear
                style={{ width: '100%' }}
                value={selectedModelId}
                onChange={setSelectedModelId}
              >
                {models.map(model => (
                  <Option key={model.id} value={model.id}>
                    {model.modelName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={5}>
              <Search
                placeholder="搜索图表名称、描述"
                allowClear
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>
            <Col span={3}>
              <Select
                placeholder="图表类型"
                allowClear
                style={{ width: '100%' }}
                value={selectedChartType}
                onChange={setSelectedChartType}
              >
                <Option value="line">线性图</Option>
                <Option value="bar">柱状图</Option>
                <Option value="scatter">散点图</Option>
              </Select>
            </Col>
            <Col span={3}>
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
            <Col span={3}>
              <Button type="primary" onClick={handleFilter}>
                查询
              </Button>
            </Col>
          </Row>
        </div>

        {/* 统计信息 */}
        <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1890ff' }}>
                  {chartModels.filter(c => c.chartType === 'line').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>线性图</div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#52c41a' }}>
                  {chartModels.filter(c => c.chartType === 'bar').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>柱状图</div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#faad14' }}>
                  {chartModels.filter(c => c.chartType === 'scatter').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>散点图</div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#f5222d' }}>
                  {chartModels.filter(c => c.isActive).length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>启用中</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={chartModels}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1300 }}
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
        title={editingChart ? '编辑图表配置' : '新增图表配置'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="关联模型"
                name="modelId"
                rules={[{ required: true, message: '请选择关联模型' }]}
              >
                <Select placeholder="请选择财务模型">
                  {models.map(model => (
                    <Option key={model.id} value={model.id}>
                      {model.modelName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="图表名称"
                name="chartName"
                rules={[{ required: true, message: '请输入图表名称' }]}
              >
                <Input placeholder="请输入图表名称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="图表类型"
                name="chartType"
                rules={[{ required: true, message: '请选择图表类型' }]}
              >
                <Select placeholder="请选择图表类型">
                  <Option value="line">线性图</Option>
                  <Option value="bar">柱状图</Option>
                  <Option value="scatter">散点图</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="模拟步数"
                name="simulationSteps"
                rules={[{ required: true, message: '请输入模拟步数' }]}
              >
                <InputNumber min={10} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="状态"
                name="isActive"
                valuePropName="checked"
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="X轴字段"
                name="xAxisField"
                rules={[{ required: true, message: '请输入X轴字段' }]}
              >
                <Input placeholder="请输入X轴字段" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="X轴单位"
                name="xAxisUnit"
              >
                <Input placeholder="请输入X轴单位" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Y轴字段"
                name="yAxisField"
                rules={[{ required: true, message: '请输入Y轴字段' }]}
              >
                <Input placeholder="请输入Y轴字段" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Y轴单位"
                name="yAxisUnit"
              >
                <Input placeholder="请输入Y轴单位" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="图表描述"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="请输入图表描述"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingChart ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 版本历史弹窗 */}
      <Modal
        title={`图表版本历史 - ${selectedChart?.chartName}`}
        open={isVersionVisible}
        onCancel={() => setIsVersionVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsVersionVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        <Timeline mode="left">
          {chartVersions.map((version, index) => (
            <Timeline.Item
              key={version.id}
              color={index === 0 ? 'green' : 'blue'}
              label={version.createdAt}
            >
              <div style={{ marginBottom: '8px' }}>
                <Tag color={index === 0 ? 'green' : 'blue'}>
                  {version.version}
                </Tag>
                <span style={{ marginLeft: '8px', color: '#666' }}>
                  by {version.createdBy}
                </span>
              </div>
              <div style={{ fontSize: '14px' }}>
                {version.changeLog}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal>

      {/* 系列管理弹窗 */}
      <Modal
        title={`图表系列管理 - ${selectedChart?.chartName}`}
        open={isSeriesVisible}
        onCancel={() => setIsSeriesVisible(false)}
        footer={[
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            新增系列
          </Button>,
          <Button key="close" onClick={() => setIsSeriesVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <List
          dataSource={chartSeries}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="edit" size="small" icon={<EditOutlined />}>
                  编辑
                </Button>,
                <Button key="delete" size="small" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{ backgroundColor: item.seriesColor }}
                    icon={chartTypeIcons[selectedChart?.chartType || 'line']}
                  />
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{item.seriesName}</span>
                    <Tag
                      color={item.isVisible ? 'green' : 'default'}
                      style={{ marginLeft: '8px' }}
                    >
                      {item.isVisible ? '显示' : '隐藏'}
                    </Tag>
                    <Tag color="blue" style={{ marginLeft: '4px' }}>
                      {item.lineStyle}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      公式: <code>{item.formulaExpression}</code>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      颜色: <span style={{ color: item.seriesColor }}>{item.seriesColor}</span>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default ChartManagement; 