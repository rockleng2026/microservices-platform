import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Table,
  Tag,
  Space,
  Button,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Timeline,
  Alert,
  Descriptions,
  Divider
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalculatorOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import * as financialModelInstanceAPI from '@/services/financialModelInstance';

interface CalculationHistoryProps {
  visible: boolean;
  instance: financialModelInstanceAPI.FinancialModelInstance | null;
  onCancel: () => void;
}

// 计算历史记录接口
interface CalculationHistoryRecord {
  id: number;
  instanceId: number;
  calculationVersion: string;
  calculationType: 'MANUAL' | 'AUTO' | 'SCHEDULED';
  calculationStatus: 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  inputData?: string;
  outputData?: string;
  errorMessage?: string;
  executionTime?: number;
  triggeredBy: number;
  triggeredByName?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

const CalculationHistory: React.FC<CalculationHistoryProps> = ({
  visible,
  instance,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<CalculationHistoryRecord[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [selectedRecord, setSelectedRecord] = useState<CalculationHistoryRecord | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    if (visible && instance) {
      loadCalculationHistory();
      loadStatistics();
    }
  }, [visible, instance]);

  // 加载计算历史
  const loadCalculationHistory = async () => {
    if (!instance) return;
    
    setLoading(true);
    try {
      // 这里需要调用计算历史API
      // const historyData = await financialModelInstanceAPI.FinancialModelInstanceAPI.getCalculationHistory(instance.id);
      // setHistory(historyData);
      
      // 模拟数据
      const mockHistory: CalculationHistoryRecord[] = [
        {
          id: 1,
          instanceId: instance.id,
          calculationVersion: '1.0.0',
          calculationType: 'MANUAL',
          calculationStatus: 'COMPLETED',
          inputData: JSON.stringify({ revenue: 1000000, cost: 600000 }),
          outputData: JSON.stringify({ profit: 400000, margin: 0.4 }),
          executionTime: 1250,
          triggeredBy: 1,
          triggeredByName: '张三',
          startedAt: '2024-12-19 10:30:00',
          completedAt: '2024-12-19 10:30:01',
          createdAt: '2024-12-19 10:30:00',
        },
        {
          id: 2,
          instanceId: instance.id,
          calculationVersion: '1.0.0',
          calculationType: 'AUTO',
          calculationStatus: 'FAILED',
          inputData: JSON.stringify({ revenue: 1000000 }),
          errorMessage: '变量 cost 未定义',
          executionTime: 500,
          triggeredBy: 1,
          triggeredByName: '系统',
          startedAt: '2024-12-19 09:15:00',
          completedAt: '2024-12-19 09:15:00',
          createdAt: '2024-12-19 09:15:00',
        },
      ];
      setHistory(mockHistory);
    } catch (error) {
      message.error('加载计算历史失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计信息
  const loadStatistics = async () => {
    if (!instance) return;
    
    try {
      // 这里需要调用统计API
      // const stats = await financialModelInstanceAPI.FinancialModelInstanceAPI.getCalculationStatistics(instance.id);
      // setStatistics(stats);
      
      // 模拟数据
      setStatistics({
        totalCalculations: 15,
        successfulCalculations: 12,
        failedCalculations: 3,
        averageExecutionTime: 1200,
        lastCalculationTime: '2024-12-19 10:30:00',
      });
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  // 查看详情
  const handleViewDetail = (record: CalculationHistoryRecord) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  // 获取计算类型标签
  const getCalculationTypeTag = (type: string) => {
    const typeMap = {
      MANUAL: { color: 'blue', text: '手动' },
      AUTO: { color: 'green', text: '自动' },
      SCHEDULED: { color: 'orange', text: '定时' },
    };
    const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取计算状态标签
  const getCalculationStatusTag = (status: string) => {
    const statusMap = {
      STARTED: { color: 'processing', text: '开始', icon: <ClockCircleOutlined /> },
      PROCESSING: { color: 'processing', text: '处理中', icon: <CalculatorOutlined /> },
      COMPLETED: { color: 'success', text: '完成', icon: <CheckCircleOutlined /> },
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
      title: '计算版本',
      dataIndex: 'calculationVersion',
      key: 'calculationVersion',
      width: 100,
    },
    {
      title: '计算类型',
      dataIndex: 'calculationType',
      key: 'calculationType',
      width: 100,
      render: (type: string) => getCalculationTypeTag(type),
    },
    {
      title: '计算状态',
      dataIndex: 'calculationStatus',
      key: 'calculationStatus',
      width: 120,
      render: (status: string) => getCalculationStatusTag(status),
    },
    {
      title: '执行时间',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: 120,
      render: (time: number) => time ? `${time}ms` : '-',
    },
    {
      title: '触发人',
      dataIndex: 'triggeredByName',
      key: 'triggeredByName',
      width: 100,
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 180,
      render: (text: string) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: CalculationHistoryRecord) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  if (!instance) return null;

  return (
    <>
      <Drawer
        title={`计算历史 - ${instance.instanceName}`}
        placement="right"
        width={1200}
        open={visible}
        onClose={onCancel}
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadCalculationHistory}>
            刷新
          </Button>
        }
      >
        <div style={{ paddingBottom: 20 }}>
          {/* 统计信息 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总计算次数"
                  value={statistics.totalCalculations || 0}
                  prefix={<CalculatorOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="成功次数"
                  value={statistics.successfulCalculations || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="失败次数"
                  value={statistics.failedCalculations || 0}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均执行时间"
                  value={statistics.averageExecutionTime || 0}
                  suffix="ms"
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* 计算历史表格 */}
          <Card title="计算历史记录">
            <Table
              columns={columns}
              dataSource={history}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>

          {/* 提示信息 */}
          <Alert
            message="计算历史说明"
            description="显示该实例的所有计算历史记录，包括手动计算、自动计算和定时计算。可以查看每次计算的详细信息和结果。"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      </Drawer>

      {/* 计算详情 */}
      <Drawer
        title="计算详情"
        placement="right"
        width={800}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        extra={
          <Button icon={<DownloadOutlined />}>
            导出结果
          </Button>
        }
      >
        {selectedRecord && (
          <div style={{ paddingBottom: 20 }}>
            {/* 基本信息 */}
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="计算版本">{selectedRecord.calculationVersion}</Descriptions.Item>
                <Descriptions.Item label="计算类型">{getCalculationTypeTag(selectedRecord.calculationType)}</Descriptions.Item>
                <Descriptions.Item label="计算状态">{getCalculationStatusTag(selectedRecord.calculationStatus)}</Descriptions.Item>
                <Descriptions.Item label="执行时间">{selectedRecord.executionTime}ms</Descriptions.Item>
                <Descriptions.Item label="触发人">{selectedRecord.triggeredByName}</Descriptions.Item>
                <Descriptions.Item label="开始时间">{new Date(selectedRecord.startedAt).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="完成时间">
                  {selectedRecord.completedAt ? new Date(selectedRecord.completedAt).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">{new Date(selectedRecord.createdAt).toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 输入数据 */}
            {selectedRecord.inputData && (
              <Card title="输入数据" style={{ marginBottom: 16 }}>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 6, 
                  maxHeight: 200, 
                  overflow: 'auto' 
                }}>
                  {JSON.stringify(JSON.parse(selectedRecord.inputData), null, 2)}
                </pre>
              </Card>
            )}

            {/* 输出数据 */}
            {selectedRecord.outputData && (
              <Card title="输出数据" style={{ marginBottom: 16 }}>
                <pre style={{ 
                  backgroundColor: '#f0f9ff', 
                  padding: 12, 
                  borderRadius: 6, 
                  maxHeight: 200, 
                  overflow: 'auto' 
                }}>
                  {JSON.stringify(JSON.parse(selectedRecord.outputData), null, 2)}
                </pre>
              </Card>
            )}

            {/* 错误信息 */}
            {selectedRecord.errorMessage && (
              <Card title="错误信息" style={{ marginBottom: 16 }}>
                <Alert
                  message="计算失败"
                  description={selectedRecord.errorMessage}
                  type="error"
                  showIcon
                />
              </Card>
            )}

            {/* 时间线 */}
            <Card title="执行时间线">
              <Timeline>
                <Timeline.Item dot={<UserOutlined style={{ fontSize: '16px' }} />}>
                  <p>触发计算</p>
                  <p style={{ color: '#666', fontSize: 12 }}>
                    {new Date(selectedRecord.startedAt).toLocaleString()} - {selectedRecord.triggeredByName}
                  </p>
                </Timeline.Item>
                <Timeline.Item dot={<CalculatorOutlined style={{ fontSize: '16px' }} />}>
                  <p>开始计算</p>
                  <p style={{ color: '#666', fontSize: 12 }}>
                    {new Date(selectedRecord.startedAt).toLocaleString()}
                  </p>
                </Timeline.Item>
                {selectedRecord.completedAt && (
                  <Timeline.Item dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}>
                    <p>计算完成</p>
                    <p style={{ color: '#666', fontSize: 12 }}>
                      {new Date(selectedRecord.completedAt).toLocaleString()}
                    </p>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default CalculationHistory; 