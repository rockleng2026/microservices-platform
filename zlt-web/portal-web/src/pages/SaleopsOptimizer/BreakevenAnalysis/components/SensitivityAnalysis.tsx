import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  Space,
  Select,
  InputNumber,
  Input,
  Form,
  message,
  Spin,
  Alert,
  Divider
} from 'antd';
import {
  CalculatorOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as breakevenService from '@/services/saleops/breakeven';

const { Option } = Select;

interface SensitivityAnalysisProps {
  visible: boolean;
  analysisId: string | null;
  onCancel: () => void;
}

interface SensitivityData {
  id: string;
  parameterName: string;
  currentValue: number;
  testValue: number;
  changePercentage: number;
  resultChange: number;
  sensitivityRank: number;
  sensitivityScore: number;
  updatedAt: string;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  visible,
  analysisId,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [sensitivities, setSensitivities] = useState<SensitivityData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [customAnalysis, setCustomAnalysis] = useState(false);
  
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && analysisId) {
      loadSensitivityAnalysis();
    }
  }, [visible, analysisId]);

  const loadSensitivityAnalysis = async () => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      const response = await breakevenService.getSensitivityAnalysis(analysisId);
      setSensitivities(response.data?.sensitivities || []);
      setSummary(response.data?.summary);
    } catch (error) {
      console.error('加载敏感性分析失败:', error);
      message.error('加载敏感性分析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSensitivityAnalysis = async () => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      await breakevenService.runSensitivityAnalysis(analysisId);
      message.success('敏感性分析已开始运行');
      setTimeout(() => {
        loadSensitivityAnalysis(); // 延迟加载结果
      }, 2000);
    } catch (error) {
      console.error('运行敏感性分析失败:', error);
      message.error('运行敏感性分析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAnalysis = async (values: any) => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      const response = await breakevenService.runCustomSensitivityAnalysis(analysisId, values);
      setSensitivities([...sensitivities, response.data]);
      message.success('自定义敏感性分析完成');
      setCustomAnalysis(false);
      form.resetFields();
    } catch (error) {
      console.error('自定义敏感性分析失败:', error);
      message.error('自定义敏感性分析失败');
    } finally {
      setLoading(false);
    }
  };

  const getSensitivityLevel = (score: number) => {
    if (score >= 0.8) return { level: '高敏感', color: '#f5222d' };
    if (score >= 0.5) return { level: '中敏感', color: '#faad14' };
    return { level: '低敏感', color: '#52c41a' };
  };

  const columns: ColumnsType<SensitivityData> = [
    {
      title: '参数名称',
      dataIndex: 'parameterName',
      key: 'parameterName',
      width: 150
    },
    {
      title: '当前值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toLocaleString()
    },
    {
      title: '测试值',
      dataIndex: 'testValue',
      key: 'testValue',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toLocaleString()
    },
    {
      title: '变化幅度',
      dataIndex: 'changePercentage',
      key: 'changePercentage',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#f5222d' }}>
          {value >= 0 ? '+' : ''}{(value * 100).toFixed(1)}%
        </span>
      )
    },
    {
      title: '结果影响',
      dataIndex: 'resultChange',
      key: 'resultChange',
      width: 120,
      align: 'right',
      render: (value: number) => (
        <span style={{ color: Math.abs(value) > 1000 ? '#f5222d' : '#52c41a' }}>
          ¥{value?.toLocaleString()}
        </span>
      )
    },
    {
      title: '敏感性得分',
      dataIndex: 'sensitivityScore',
      key: 'sensitivityScore',
      width: 120,
      align: 'center',
      render: (value: number) => {
        const { level, color } = getSensitivityLevel(value);
        return (
          <div>
            <div style={{ color, fontWeight: 'bold' }}>
              {(value * 100).toFixed(0)}分
            </div>
            <div style={{ fontSize: 12, color }}>{level}</div>
          </div>
        );
      }
    },
    {
      title: '敏感性排名',
      dataIndex: 'sensitivityRank',
      key: 'sensitivityRank',
      width: 100,
      align: 'center',
      render: (value: number) => (
        <span style={{ 
          fontWeight: 'bold',
          color: value <= 3 ? '#f5222d' : value <= 6 ? '#faad14' : '#52c41a'
        }}>
          #{value}
        </span>
      )
    }
  ];

  return (
    <Modal
      title="敏感性分析"
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 操作按钮 */}
          <Space>
            <Button
              type="primary"
              icon={<ExperimentOutlined />}
              onClick={handleRunSensitivityAnalysis}
            >
              运行敏感性分析
            </Button>
            <Button
              icon={<CalculatorOutlined />}
              onClick={() => setCustomAnalysis(true)}
            >
              自定义分析
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadSensitivityAnalysis}
            >
              刷新
            </Button>
          </Space>

          {/* 分析概要 */}
          {summary && (
            <Card title="敏感性分析概要">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="最敏感参数"
                    value={summary.mostSensitiveParam}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="最大影响值"
                    value={summary.maxImpact}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="平均敏感性"
                    value={summary.avgSensitivity * 100}
                    precision={1}
                    suffix="分"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="分析参数数量"
                    value={summary.parameterCount}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>

              {summary.riskAlert && (
                <Alert
                  message="高敏感性风险提示"
                  description={summary.riskAlert}
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          )}

          {/* 敏感性分析结果表格 */}
          <Card title="参数敏感性排名">
            <Table
              columns={columns}
              dataSource={sensitivities}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>

          {/* 敏感性分布图 */}
          {sensitivities.length > 0 && (
            <Card title="敏感性分布">
              <Row gutter={16}>
                {sensitivities.slice(0, 6).map((item, index) => (
                  <Col span={4} key={item.id}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ marginBottom: 8, fontSize: 12 }}>
                        {item.parameterName}
                      </div>
                      <Progress
                        type="circle"
                        percent={item.sensitivityScore * 100}
                        size={80}
                        strokeColor={getSensitivityLevel(item.sensitivityScore).color}
                        format={(percent) => `${percent?.toFixed(0)}分`}
                      />
                      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                        排名 #{item.sensitivityRank}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </Space>
      </Spin>

      {/* 自定义敏感性分析表单 */}
      <Modal
        title="自定义敏感性分析"
        open={customAnalysis}
        onCancel={() => {
          setCustomAnalysis(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCustomAnalysis}
        >
          <Form.Item
            name="parameterName"
            label="参数名称"
            rules={[{ required: true, message: '请选择参数' }]}
          >
            <Select placeholder="请选择要分析的参数">
              <Option value="totalFixedCost">总固定成本</Option>
              <Option value="variableCostRatio">变动成本率</Option>
              <Option value="expectedRevenue">预期收入</Option>
              <Option value="marketPrice">市场价格</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="currentValue"
                label="当前值"
                rules={[{ required: true, message: '请输入当前值' }]}
              >
                <InputNumber
                  placeholder="请输入当前值"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="testValue"
                label="测试值"
                rules={[{ required: true, message: '请输入测试值' }]}
              >
                <InputNumber
                  placeholder="请输入测试值"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="analysisNote"
            label="分析说明"
          >
            <Input.TextArea 
              placeholder="请输入分析说明"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default SensitivityAnalysis; 