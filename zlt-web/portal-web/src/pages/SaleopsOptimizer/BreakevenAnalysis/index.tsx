import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Tooltip,
  Tag,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Progress,
  Dropdown,
  MenuProps
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalculatorOutlined,
  ExportOutlined,
  CopyOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageContainer } from '@ant-design/pro-layout';
import BreakevenAnalysisForm from './components/BreakevenAnalysisForm';
import BreakevenAnalysisDetail from './components/BreakevenAnalysisDetail';
import ScenarioAnalysis from './components/ScenarioAnalysis';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import ForecastAnalysis from './components/ForecastAnalysis';
import * as breakevenService from '@/services/saleops/breakeven';
import styles from './index.module.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 分析状态配置
const statusConfig = {
  active: { color: 'green', text: '活跃' },
  draft: { color: 'blue', text: '草稿' },
  archived: { color: 'default', text: '已归档' },
  calculating: { color: 'orange', text: '计算中' }
};

// 分析类型配置
const analysisTypeConfig = {
  monthly: { text: '月度分析', color: 'blue' },
  quarterly: { text: '季度分析', color: 'green' },
  yearly: { text: '年度分析', color: 'purple' }
};

interface BreakevenAnalysisData {
  id: number;
  analysisId: string;
  analysisName: string;
  analysisType: string;
  analysisPeriod: string;
  creatorName: string;
  breakevenPoint: number;
  marginSafetyRatio: number;
  reasonabilityScore: number;
  status: string;
  isRealTime: boolean;
  autoRecalculation: boolean;
  createdAt: string;
  lastRecalculation?: string;
}

const BreakevenAnalysisPage: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BreakevenAnalysisData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条记录`
  });

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    analysisType: '',
    status: '',
    analysisPeriod: '',
    createdTimeRange: null as any,
    creatorName: ''
  });

  // 弹窗控制
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [scenarioModalVisible, setScenarioModalVisible] = useState(false);
  const [sensitivityModalVisible, setSensitivityModalVisible] = useState(false);
  const [forecastModalVisible, setForecastModalVisible] = useState(false);

  // 当前操作的记录
  const [currentRecord, setCurrentRecord] = useState<BreakevenAnalysisData | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');

  // 选中的记录
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<BreakevenAnalysisData[]>([]);

  // 统计数据
  const [statistics, setStatistics] = useState({
    totalCount: 0,
    activeCount: 0,
    avgMarginSafety: 0,
    avgReasonabilityScore: 0
  });

  // 缓存用于员工信息
  const employeeCache = useRef(new Map());

  // 表格列定义
  const columns: ColumnsType<BreakevenAnalysisData> = [
    {
      title: '分析名称',
      dataIndex: 'analysisName',
      key: 'analysisName',
      width: 200,
      ellipsis: true,
      render: (text: string, record: BreakevenAnalysisData) => (
        <div>
          <div className={styles.analysisName}>{text}</div>
          <div className={styles.analysisId}>ID: {record.analysisId}</div>
        </div>
      )
    },
    {
      title: '分析类型',
      dataIndex: 'analysisType',
      key: 'analysisType',
      width: 100,
      render: (type: string) => {
        const config = analysisTypeConfig[type as keyof typeof analysisTypeConfig];
        return <Tag color={config?.color}>{config?.text || type}</Tag>;
      }
    },
    {
      title: '分析期间',
      dataIndex: 'analysisPeriod',
      key: 'analysisPeriod',
      width: 100
    },
    {
      title: '盈亏平衡点',
      dataIndex: 'breakevenPoint',
      key: 'breakevenPoint',
      width: 120,
      align: 'right',
      render: (value: number) => (
        <span className={styles.moneyValue}>
          ¥{value?.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      title: '安全边际率',
      dataIndex: 'marginSafetyRatio',
      key: 'marginSafetyRatio',
      width: 120,
      render: (value: number) => (
        <div className={styles.progressContainer}>
          <Progress
            percent={value * 100}
            size="small"
            strokeColor={value >= 0.3 ? '#52c41a' : value >= 0.2 ? '#faad14' : '#f5222d'}
            showInfo={false}
          />
          <span className={styles.progressText}>{(value * 100).toFixed(1)}%</span>
        </div>
      )
    },
    {
      title: '合理性评分',
      dataIndex: 'reasonabilityScore',
      key: 'reasonabilityScore',
      width: 100,
      render: (value: number) => (
        <Tag color={value >= 0.8 ? 'green' : value >= 0.6 ? 'orange' : 'red'}>
          {(value * 100).toFixed(0)}分
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string, record: BreakevenAnalysisData) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <div>
            <Tag color={config?.color}>{config?.text || status}</Tag>
            {record.autoRecalculation && (
              <Tooltip title="自动重算已启用">
                <ReloadOutlined className={styles.autoIcon} />
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: 100,
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: BreakevenAnalysisData) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="重新计算">
            <Button
              type="text"
              size="small"
              icon={<CalculatorOutlined />}
              onClick={() => handleRecalculate(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: getActionMenuItems(record),
              onClick: ({ key }) => handleActionMenuClick(key, record)
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<SettingOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  // 获取操作菜单项
  const getActionMenuItems = (record: BreakevenAnalysisData): MenuProps['items'] => [
    {
      key: 'scenario',
      icon: <BarChartOutlined />,
      label: '场景分析'
    },
    {
      key: 'sensitivity',
      icon: <LineChartOutlined />,
      label: '敏感性分析'
    },
    {
      key: 'forecast',
      icon: <LineChartOutlined />,
      label: '预测分析'
    },
    { type: 'divider' },
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: '复制分析'
    },
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: '导出报告'
    },
    { type: 'divider' },
    {
      key: 'archive',
      icon: <FileTextOutlined />,
      label: '归档',
      disabled: record.status === 'archived'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true
    }
  ];

  // 处理操作菜单点击
  const handleActionMenuClick = (key: string, record: BreakevenAnalysisData) => {
    switch (key) {
      case 'scenario':
        setCurrentRecord(record);
        setScenarioModalVisible(true);
        break;
      case 'sensitivity':
        setCurrentRecord(record);
        setSensitivityModalVisible(true);
        break;
      case 'forecast':
        setCurrentRecord(record);
        setForecastModalVisible(true);
        break;
      case 'copy':
        handleCopy(record);
        break;
      case 'export':
        handleExport(record);
        break;
      case 'archive':
        handleArchive(record);
        break;
      case 'delete':
        handleDelete(record);
        break;
      default:
        break;
    }
  };

  // 加载数据
  const loadData = async (params?: any) => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.current,
        size: pagination.pageSize,
        ...searchParams,
        ...params
      };

      // 处理时间范围
      if (queryParams.createdTimeRange?.length === 2) {
        queryParams.createdStart = dayjs(queryParams.createdTimeRange[0]).format('YYYY-MM-DD HH:mm:ss');
        queryParams.createdEnd = dayjs(queryParams.createdTimeRange[1]).format('YYYY-MM-DD HH:mm:ss');
        delete queryParams.createdTimeRange;
      }

      const response = await breakevenService.getAnalysisList(queryParams);
      
      if (response.success) {
        setDataSource(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.count || 0,
          current: params?.page || prev.current
        }));
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const response = await breakevenService.getAnalysisStatistics({});
      if (response.success && response.data) {
        setStatistics({
          totalCount: response.data.totalCount || 0,
          activeCount: response.data.activeCount || 0,
          avgMarginSafety: response.data.avgMarginSafety || 0,
          avgReasonabilityScore: response.data.avgReasonabilityScore || 0
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData({ page: 1 });
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchParams({
      keyword: '',
      analysisType: '',
      status: '',
      analysisPeriod: '',
      createdTimeRange: null,
      creatorName: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData({ page: 1 });
  };

  // 表格分页处理
  const handleTableChange = (paginationConfig: any) => {
    const { current, pageSize } = paginationConfig;
    setPagination(prev => ({ ...prev, current, pageSize }));
    loadData({ page: current, size: pageSize });
  };

  // 行选择
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: BreakevenAnalysisData[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    }
  };

  // 创建新分析
  const handleCreate = () => {
    setCurrentRecord(null);
    setEditMode('create');
    setFormModalVisible(true);
  };

  // 编辑分析
  const handleEdit = (record: BreakevenAnalysisData) => {
    setCurrentRecord(record);
    setEditMode('edit');
    setFormModalVisible(true);
  };

  // 查看详情
  const handleViewDetail = (record: BreakevenAnalysisData) => {
    setCurrentRecord(record);
    setDetailModalVisible(true);
  };

  // 重新计算
  const handleRecalculate = async (record: BreakevenAnalysisData) => {
    try {
      setLoading(true);
      const response = await breakevenService.recalculateAnalysis(record.analysisId);
      if (response.success) {
        message.success('重新计算成功');
        loadData();
      } else {
        message.error(response.message || '重新计算失败');
      }
    } catch (error) {
      console.error('重新计算失败:', error);
      message.error('重新计算失败');
    } finally {
      setLoading(false);
    }
  };

  // 复制分析
  const handleCopy = (record: BreakevenAnalysisData) => {
    Modal.confirm({
      title: '复制分析',
      content: '请输入新分析的名称',
      okText: '确认复制',
      cancelText: '取消',
      onOk: async (close) => {
        // 这里应该有一个输入框让用户输入新名称
        const newName = `${record.analysisName}_副本_${dayjs().format('MMDD')}`;
        try {
          const response = await breakevenService.copyAnalysis(record.analysisId, newName);
          if (response.success) {
            message.success('复制成功');
            loadData();
          } else {
            message.error(response.message || '复制失败');
          }
        } catch (error) {
          console.error('复制失败:', error);
          message.error('复制失败');
        }
        close();
      }
    });
  };

  // 导出报告
  const handleExport = async (record: BreakevenAnalysisData) => {
    try {
      setLoading(true);
      await breakevenService.exportAnalysisReport(record.analysisId, 'excel');
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 归档分析
  const handleArchive = async (record: BreakevenAnalysisData) => {
    try {
      const response = await breakevenService.archiveAnalysis(record.analysisId);
      if (response.success) {
        message.success('归档成功');
        loadData();
      } else {
        message.error(response.message || '归档失败');
      }
    } catch (error) {
      console.error('归档失败:', error);
      message.error('归档失败');
    }
  };

  // 删除分析
  const handleDelete = (record: BreakevenAnalysisData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分析"${record.analysisName}"吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await breakevenService.deleteAnalysis(record.analysisId);
          if (response.success) {
            message.success('删除成功');
            loadData();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const analysisIds = selectedRows.map(row => row.analysisId);
          const response = await breakevenService.batchDeleteAnalysis(analysisIds);
          if (response.success) {
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            setSelectedRows([]);
            loadData();
          } else {
            message.error(response.message || '批量删除失败');
          }
        } catch (error) {
          console.error('批量删除失败:', error);
          message.error('批量删除失败');
        }
      }
    });
  };

  // 批量导出
  const handleBatchExport = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要导出的记录');
      return;
    }

    try {
      setLoading(true);
      const queryParams = {
        analysisIds: selectedRows.map(row => row.analysisId)
      };
      await breakevenService.exportAnalysisData(queryParams, 'excel');
      message.success('导出成功');
    } catch (error) {
      console.error('批量导出失败:', error);
      message.error('批量导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setFormModalVisible(false);
    setCurrentRecord(null);
    loadData();
    loadStatistics();
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
    loadStatistics();
  }, []);

  return (
    <PageContainer
      title="盈亏平衡分析"
      content="通过盈亏平衡分析，帮助企业确定实现盈亏平衡所需的最低销售额或销售量，为经营决策提供科学依据。"
      extra={[
        <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建分析
        </Button>
      ]}
    >
      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statisticsRow}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总分析数"
              value={statistics.totalCount}
              prefix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃分析"
              value={statistics.activeCount}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均安全边际率"
              value={statistics.avgMarginSafety}
              suffix="%"
              precision={1}
              valueStyle={{ color: statistics.avgMarginSafety >= 30 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均合理性评分"
              value={statistics.avgReasonabilityScore}
              suffix="分"
              precision={0}
              valueStyle={{ color: statistics.avgReasonabilityScore >= 80 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 查询表单 */}
      <Card className={styles.searchCard}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Input
              placeholder="搜索分析名称、ID、创建人"
              prefix={<SearchOutlined />}
              value={searchParams.keyword}
              onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="分析类型"
              value={searchParams.analysisType}
              onChange={(value) => setSearchParams(prev => ({ ...prev, analysisType: value }))}
              allowClear
            >
              <Option value="monthly">月度分析</Option>
              <Option value="quarterly">季度分析</Option>
              <Option value="yearly">年度分析</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态"
              value={searchParams.status}
              onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
              allowClear
            >
              <Option value="active">活跃</Option>
              <Option value="draft">草稿</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始时间', '结束时间']}
              value={searchParams.createdTimeRange}
              onChange={(dates) => setSearchParams(prev => ({ ...prev, createdTimeRange: dates }))}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleResetSearch}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 操作栏 */}
      {selectedRowKeys.length > 0 && (
        <Card className={styles.batchActionCard}>
          <Space>
            <span>已选择 {selectedRowKeys.length} 项</span>
            <Button icon={<ExportOutlined />} onClick={handleBatchExport}>
              批量导出
            </Button>
            <Popconfirm
              title="确定要删除选中的记录吗？"
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                批量删除
              </Button>
            </Popconfirm>
          </Space>
        </Card>
      )}

      {/* 数据表格 */}
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          rowSelection={rowSelection}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
          size="middle"
        />
      </Card>

      {/* 创建/编辑表单弹窗 */}
      <BreakevenAnalysisForm
        visible={formModalVisible}
        mode={editMode}
        initialValues={currentRecord}
        onCancel={() => setFormModalVisible(false)}
        onSuccess={handleFormSuccess}
      />

      {/* 详情弹窗 */}
      <BreakevenAnalysisDetail
        visible={detailModalVisible}
        analysisId={currentRecord?.analysisId}
        onCancel={() => setDetailModalVisible(false)}
      />

      {/* 场景分析弹窗 */}
      <ScenarioAnalysis
        visible={scenarioModalVisible}
        analysisId={currentRecord?.analysisId}
        onCancel={() => setScenarioModalVisible(false)}
      />

      {/* 敏感性分析弹窗 */}
      <SensitivityAnalysis
        visible={sensitivityModalVisible}
        analysisId={currentRecord?.analysisId}
        onCancel={() => setSensitivityModalVisible(false)}
      />

      {/* 预测分析弹窗 */}
      <ForecastAnalysis
        visible={forecastModalVisible}
        analysisId={currentRecord?.analysisId}
        onCancel={() => setForecastModalVisible(false)}
      />
    </PageContainer>
  );
};

export default BreakevenAnalysisPage; 