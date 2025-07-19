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
  Statistic,
  Progress,
  Badge,
  Drawer,
  Tabs,
  Descriptions,
  Alert,
  Upload,
  notification
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BarChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import * as financialModelInstanceAPI from '@/services/financialModelInstance';
import * as financialModelAPI from '@/services/financialModel';
import InstanceForm from './components/InstanceForm';
import InstanceDetail from './components/InstanceDetail';
import VariableEditor from './components/VariableEditor';
import CalculationHistory from './components/CalculationHistory';
import './styles/ModelInstanceManagement.less';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface ModelInstanceManagementProps {
  modelId?: number;
  projectId?: number;
}

const ModelInstanceManagement: React.FC<ModelInstanceManagementProps> = ({ 
  modelId: propModelId, 
  projectId: propProjectId 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // 从URL参数中获取modelId
  const getModelIdFromUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    const urlModelId = urlParams.get('modelId');
    return urlModelId ? parseInt(urlModelId) : propModelId;
  };
  
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<financialModelInstanceAPI.FinancialModelInstance[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState({
    modelId: getModelIdFromUrl(),
    projectId: propProjectId,
    instanceStatus: '',
    keyword: '',
  });
  const [models, setModels] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [selectedInstance, setSelectedInstance] = useState<financialModelInstanceAPI.FinancialModelInstance | null>(null);
  
  // 模态框状态
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [variableEditorVisible, setVariableEditorVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [calculationModalVisible, setCalculationModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState<financialModelInstanceAPI.InstanceFormData | null>(null);
  const [editingInstance, setEditingInstance] = useState<financialModelInstanceAPI.FinancialModelInstance | null>(null);

  // 加载数据
  useEffect(() => {
    loadInstances();
    loadModels();
    loadStatistics();
  }, [currentPage, pageSize, searchParams]);

  // 加载实例列表
  const loadInstances = async () => {
    setLoading(true);
    try {
      const result = await financialModelInstanceAPI.FinancialModelInstanceAPI.getInstances({
        page: currentPage,
        size: pageSize,
        ...searchParams,
      });
      setInstances(result.data);
      setTotal(result.count);
    } catch (error) {
      message.error('加载实例列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载模型列表
  const loadModels = async () => {
    try {
      const modelsData = await financialModelAPI.FinancialModelAPI.getModels({
        current: 1,
        pageSize: 1000,
      });
      setModels(modelsData.data);
    } catch (error) {
      console.error('加载模型列表失败:', error);
    }
  };

  // 加载统计信息
  const loadStatistics = async () => {
    try {
      const stats = await financialModelInstanceAPI.FinancialModelInstanceAPI.getInstanceStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  // 搜索
  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, keyword: value }));
    setCurrentPage(1);
  };

  // 筛选
  const handleFilter = (key: string, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // 创建实例
  const handleCreate = () => {
    setFormData({
      instanceCode: '',
      instanceName: '',
      modelId: getModelIdFromUrl() || 0,
      projectId: propProjectId,
      instanceDescription: '',
      instanceVersion: '1.0.0',
    });
    setEditingInstance(null);
    setFormVisible(true);
  };

  // 编辑实例
  const handleEdit = (record: financialModelInstanceAPI.FinancialModelInstance) => {
    setFormData({
      instanceCode: record.instanceCode,
      instanceName: record.instanceName,
      modelId: record.modelId,
      projectId: record.projectId,
      instanceDescription: record.instanceDescription,
      instanceVersion: record.instanceVersion,
    });
    setEditingInstance(record);
    setFormVisible(true);
  };

  // 查看详情
  const handleViewDetail = async (record: financialModelInstanceAPI.FinancialModelInstance) => {
    try {
      const detail = await financialModelInstanceAPI.FinancialModelInstanceAPI.getInstanceDetail(record.id);
      setSelectedInstance({ ...record, ...detail });
      setDetailVisible(true);
    } catch (error) {
      message.error('获取实例详情失败');
    }
  };

  // 编辑变量
  const handleEditVariables = (record: financialModelInstanceAPI.FinancialModelInstance) => {
    setSelectedInstance(record);
    setVariableEditorVisible(true);
  };

  // 查看计算历史
  const handleViewHistory = (record: financialModelInstanceAPI.FinancialModelInstance) => {
    setSelectedInstance(record);
    setHistoryVisible(true);
  };

  // 执行计算
  const handleCalculate = (record: financialModelInstanceAPI.FinancialModelInstance) => {
    setSelectedInstance(record);
    setCalculationModalVisible(true);
  };

  // 删除实例
  const handleDelete = async (id: number) => {
    try {
      await financialModelInstanceAPI.FinancialModelInstanceAPI.deleteInstance(id);
      message.success('删除成功');
      loadInstances();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 克隆实例
  const handleClone = async (record: financialModelInstanceAPI.FinancialModelInstance) => {
    Modal.confirm({
      title: '克隆实例',
      content: (
        <Form layout="vertical">
          <Form.Item label="新实例编码" required>
            <Input placeholder="请输入新实例编码" />
          </Form.Item>
          <Form.Item label="新实例名称" required>
            <Input placeholder="请输入新实例名称" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const form = document.querySelector('.ant-modal-content form');
          const formData = new FormData(form as HTMLFormElement);
          const newInstanceCode = formData.get('instanceCode') as string;
          const newInstanceName = formData.get('instanceName') as string;
          
          await financialModelInstanceAPI.FinancialModelInstanceAPI.cloneInstance(
            record.id,
            newInstanceCode,
            newInstanceName
          );
          message.success('克隆成功');
          loadInstances();
        } catch (error) {
          message.error('克隆失败');
        }
      },
    });
  };

  // 导出配置
  const handleExport = async (id: number) => {
    try {
      await financialModelInstanceAPI.FinancialModelInstanceAPI.exportInstanceConfig(id);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 导入配置
  const handleImport = () => {
    setImportModalVisible(true);
  };

  // 状态切换
  const handleToggleStatus = async (record: financialModelInstanceAPI.FinancialModelInstance) => {
    try {
      const isActive = record.instanceStatus === 'ACTIVE';
      await financialModelInstanceAPI.FinancialModelInstanceAPI.toggleInstanceStatus(record.id, !isActive);
      message.success('状态更新成功');
      loadInstances();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      DRAFT: { color: 'default', text: '草稿' },
      ACTIVE: { color: 'success', text: '激活' },
      INACTIVE: { color: 'warning', text: '停用' },
      ARCHIVED: { color: 'error', text: '归档' },
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取计算状态标签
  const getCalculationStatusTag = (status: string) => {
    const statusMap = {
      PENDING: { color: 'default', text: '待计算', icon: <ClockCircleOutlined /> },
      CALCULATING: { color: 'processing', text: '计算中', icon: <CalculatorOutlined /> },
      COMPLETED: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      FAILED: { color: 'error', text: '失败', icon: <CloseCircleOutlined /> },
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '实例编码',
      dataIndex: 'instanceCode',
      key: 'instanceCode',
      width: 150,
      render: (text: string, record: financialModelInstanceAPI.FinancialModelInstance) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: '实例名称',
      dataIndex: 'instanceName',
      key: 'instanceName',
      width: 200,
    },
    {
      title: '关联模型',
      dataIndex: 'financialModel',
      key: 'financialModel',
      width: 150,
      render: (model: any) => model?.modelName || '-',
    },
    {
      title: '实例状态',
      dataIndex: 'instanceStatus',
      key: 'instanceStatus',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '计算状态',
      dataIndex: 'calculationStatus',
      key: 'calculationStatus',
      width: 120,
      render: (status: string) => getCalculationStatusTag(status),
    },
    {
      title: '版本',
      dataIndex: 'instanceVersion',
      key: 'instanceVersion',
      width: 100,
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_: any, record: financialModelInstanceAPI.FinancialModelInstance) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="编辑变量">
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => handleEditVariables(record)}
            />
          </Tooltip>
          <Tooltip title="执行计算">
            <Button
              type="link"
              icon={<CalculatorOutlined />}
              onClick={() => handleCalculate(record)}
            />
          </Tooltip>
          <Tooltip title="计算历史">
            <Button
              type="link"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            />
          </Tooltip>
          <Tooltip title="克隆">
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={() => handleClone(record)}
            />
          </Tooltip>
          <Tooltip title="导出">
            <Button
              type="link"
              icon={<ExportOutlined />}
              onClick={() => handleExport(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个实例吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="model-instance-management">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总实例数"
              value={statistics.totalInstances || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="激活实例"
              value={statistics.activeInstances || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待计算"
              value={statistics.pendingCalculations || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="计算失败"
              value={statistics.failedCalculations || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Search
                placeholder="搜索实例编码、名称"
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
              <Select
                placeholder="选择模型"
                style={{ width: 200 }}
                allowClear
                value={searchParams.modelId}
                onChange={(value) => handleFilter('modelId', value)}
              >
                {models.map(model => (
                  <Option key={model.id} value={model.id}>
                    {model.modelName}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="实例状态"
                style={{ width: 120 }}
                allowClear
                value={searchParams.instanceStatus}
                onChange={(value) => handleFilter('instanceStatus', value)}
              >
                <Option value="DRAFT">草稿</Option>
                <Option value="ACTIVE">激活</Option>
                <Option value="INACTIVE">停用</Option>
                <Option value="ARCHIVED">归档</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                新建实例
              </Button>
              <Button
                icon={<ImportOutlined />}
                onClick={handleImport}
              >
                导入
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadInstances}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 实例列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={instances}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 实例表单 */}
      <InstanceForm
        visible={formVisible}
        formData={formData}
        editingInstance={editingInstance}
        models={models}
        onCancel={() => setFormVisible(false)}
        onSuccess={() => {
          setFormVisible(false);
          loadInstances();
        }}
      />

      {/* 实例详情 */}
      <InstanceDetail
        visible={detailVisible}
        instance={selectedInstance}
        onCancel={() => setDetailVisible(false)}
      />

      {/* 变量编辑器 */}
      <VariableEditor
        visible={variableEditorVisible}
        instance={selectedInstance}
        onCancel={() => setVariableEditorVisible(false)}
        onSuccess={() => {
          setVariableEditorVisible(false);
          loadInstances();
        }}
      />

      {/* 计算历史 */}
      <CalculationHistory
        visible={historyVisible}
        instance={selectedInstance}
        onCancel={() => setHistoryVisible(false)}
      />

      {/* 计算模态框 */}
      <Modal
        title="执行计算"
        open={calculationModalVisible}
        onCancel={() => setCalculationModalVisible(false)}
        footer={null}
      >
        <div>
          <p>确定要执行实例 "{selectedInstance?.instanceName}" 的计算吗？</p>
          <Space style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<CalculatorOutlined />}
              onClick={async () => {
                try {
                  await financialModelInstanceAPI.FinancialModelInstanceAPI.executeCalculation({
                    instanceId: selectedInstance!.id,
                    calculationType: 'MANUAL',
                  });
                  message.success('计算已启动');
                  setCalculationModalVisible(false);
                  loadInstances();
                } catch (error) {
                  message.error('启动计算失败');
                }
              }}
            >
              开始计算
            </Button>
            <Button onClick={() => setCalculationModalVisible(false)}>
              取消
            </Button>
          </Space>
        </div>
      </Modal>

      {/* 导入模态框 */}
      <Modal
        title="导入实例配置"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <Upload.Dragger
          accept=".json"
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const configJson = e.target?.result as string;
                await financialModelInstanceAPI.FinancialModelInstanceAPI.importInstanceConfig(configJson);
                message.success('导入成功');
                setImportModalVisible(false);
                loadInstances();
              } catch (error) {
                message.error('导入失败');
              }
            };
            reader.readAsText(file);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持 .json 格式的实例配置文件</p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};

export default ModelInstanceManagement; 