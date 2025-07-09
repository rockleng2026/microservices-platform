import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Select,
  DatePicker,
  Form,
  InputNumber,
  Input,
  message,
  Spin,
  Alert,
  Tabs,
  Progress
} from 'antd';
import {
  LineChartOutlined,
  FundProjectionScreenOutlined,
  CalculatorOutlined,
  ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import * as breakevenService from '@/services/saleops/breakeven';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface ForecastAnalysisProps {
  visible: boolean;
  analysisId: string | null;
  onCancel: () => void;
}

interface ForecastData {
  id: string;
  forecastModel: string;
  forecastPeriod: string;
  predictedBreakevenPoint: number;
  confidenceInterval: string;
  accuracyScore: number;
  trendDirection: string;
  createdAt: string;
}

const ForecastAnalysis: React.FC<ForecastAnalysisProps> = ({
  visible,
  analysisId,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [trendData, setTrendData] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && analysisId) {
      loadForecastAnalysis();
    }
  }, [visible, analysisId]);

  const loadForecastAnalysis = async () => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      const response = await breakevenService.getForecastAnalysis(analysisId);
      setForecasts(response.data?.forecasts || []);
      setTrendData(response.data?.trendData);
    } catch (error) {
      console.error('加载预测分析失败:', error);
      message.error('加载预测分析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForecast = async (values: any) => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      const submitData = {
        ...values,
        forecastPeriod: values.forecastPeriod?.map((date: any) => date.format('YYYY-MM-DD'))
      };
      
      await breakevenService.createForecast(analysisId, submitData);
      message.success('预测分析已创建，正在计算...');
      setShowCreateForm(false);
      form.resetFields();
      
      // 延迟刷新数据，等待计算完成
      setTimeout(() => {
        loadForecastAnalysis();
      }, 3000);
    } catch (error) {
      console.error('创建预测分析失败:', error);
      message.error('创建预测分析失败');
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'upward': return '#52c41a';
      case 'downward': return '#f5222d';
      case 'stable': return '#1890ff';
      default: return '#666';
    }
  };

  const getTrendText = (direction: string) => {
    switch (direction) {
      case 'upward': return '上升趋势';
      case 'downward': return '下降趋势';
      case 'stable': return '稳定趋势';
      default: return '未知趋势';
    }
  };

  const getAccuracyLevel = (score: number) => {
    if (score >= 0.9) return { level: '非常高', color: '#52c41a' };
    if (score >= 0.8) return { level: '高', color: '#1890ff' };
    if (score >= 0.7) return { level: '中等', color: '#faad14' };
    return { level: '低', color: '#f5222d' };
  };

  const columns: ColumnsType<ForecastData> = [
    {
      title: '预测模型',
      dataIndex: 'forecastModel',
      key: 'forecastModel',
      width: 120
    },
    {
      title: '预测期间',
      dataIndex: 'forecastPeriod',
      key: 'forecastPeriod',
      width: 150
    },
    {
      title: '预测盈亏平衡点',
      dataIndex: 'predictedBreakevenPoint',
      key: 'predictedBreakevenPoint',
      width: 150,
      align: 'right',
      render: (value: number) => `¥${value?.toLocaleString()}`
    },
    {
      title: '置信区间',
      dataIndex: 'confidenceInterval',
      key: 'confidenceInterval',
      width: 120,
      align: 'center'
    },
    {
      title: '准确性得分',
      dataIndex: 'accuracyScore',
      key: 'accuracyScore',
      width: 120,
      align: 'center',
      render: (value: number) => {
        const { level, color } = getAccuracyLevel(value);
        return (
          <div>
            <div style={{ color, fontWeight: 'bold' }}>
              {(value * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: 12, color }}>{level}</div>
          </div>
        );
      }
    },
    {
      title: '趋势方向',
      dataIndex: 'trendDirection',
      key: 'trendDirection',
      width: 100,
      align: 'center',
      render: (value: string) => (
        <span style={{ color: getTrendColor(value) }}>
          {getTrendText(value)}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150
    }
  ];

  return (
    <Modal
      title="预测分析"
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="export" icon={<ExportOutlined />}>
          导出预测报告
        </Button>,
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <Tabs defaultActiveKey="forecasts">
          <TabPane tab="预测结果" key="forecasts">
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 操作按钮 */}
              <Space>
                <Button
                  type="primary"
                  icon={<FundProjectionScreenOutlined />}
                  onClick={() => setShowCreateForm(true)}
                >
                  创建预测
                </Button>
                <Button
                  icon={<LineChartOutlined />}
                  onClick={loadForecastAnalysis}
                >
                  刷新数据
                </Button>
              </Space>

              {/* 预测概要 */}
              {trendData && (
                <Card title="预测概要">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="最新预测值"
                        value={trendData.latestForecast}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="预测变化"
                        value={trendData.forecastChange}
                        precision={2}
                        prefix={trendData.forecastChange >= 0 ? '+¥' : '-¥'}
                        valueStyle={{ 
                          color: trendData.forecastChange >= 0 ? '#52c41a' : '#f5222d' 
                        }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="平均准确率"
                        value={trendData.avgAccuracy * 100}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="预测模型数"
                        value={trendData.modelCount}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                  </Row>

                  {trendData.riskWarning && (
                    <Alert
                      message="预测风险提示"
                      description={trendData.riskWarning}
                      type="warning"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}
                </Card>
              )}

              {/* 预测结果表格 */}
              <Card title="预测历史记录">
                <Table
                  columns={columns}
                  dataSource={forecasts}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </Card>
            </Space>
          </TabPane>

          <TabPane tab="模型对比" key="comparison">
            <Card title="模型准确性对比">
              {forecasts.length > 0 ? (
                <Row gutter={16}>
                  {forecasts.slice(0, 4).map((forecast, index) => (
                    <Col span={6} key={forecast.id}>
                      <Card size="small" title={forecast.forecastModel}>
                        <div style={{ textAlign: 'center' }}>
                          <Progress
                            type="circle"
                            percent={forecast.accuracyScore * 100}
                            size={100 as const}
                            strokeColor={getAccuracyLevel(forecast.accuracyScore).color}
                            format={(percent) => `${percent?.toFixed(0)}%`}
                          />
                          <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              预测值: ¥{forecast.predictedBreakevenPoint?.toLocaleString()}
                            </div>
                            <div style={{ fontSize: 12, color: getTrendColor(forecast.trendDirection) }}>
                              {getTrendText(forecast.trendDirection)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  暂无预测数据，请先创建预测分析
                </div>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Spin>

      {/* 创建预测分析表单 */}
      <Modal
        title="创建预测分析"
        open={showCreateForm}
        onCancel={() => {
          setShowCreateForm(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateForecast}
          initialValues={{
            forecastModel: 'linear',
            confidenceLevel: 0.95
          }}
        >
          <Form.Item
            name="forecastModel"
            label="预测模型"
            rules={[{ required: true, message: '请选择预测模型' }]}
          >
            <Select placeholder="请选择预测模型">
              <Option value="linear">线性回归</Option>
              <Option value="arima">ARIMA模型</Option>
              <Option value="exponential">指数平滑</Option>
              <Option value="neural">神经网络</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="forecastPeriod"
            label="预测期间"
            rules={[{ required: true, message: '请选择预测期间' }]}
          >
            <RangePicker 
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="confidenceLevel"
                label="置信水平"
                rules={[{ required: true, message: '请输入置信水平' }]}
              >
                <InputNumber
                  placeholder="置信水平"
                  style={{ width: '100%' }}
                  min={0.5}
                  max={0.99}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="forecastHorizon"
                label="预测周期(月)"
                rules={[{ required: true, message: '请输入预测周期' }]}
              >
                <InputNumber
                  placeholder="预测周期"
                  style={{ width: '100%' }}
                  min={1}
                  max={24}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="modelParameters"
            label="模型参数配置"
          >
            <Input.TextArea 
              placeholder="JSON格式的模型参数（可选）"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default ForecastAnalysis; 