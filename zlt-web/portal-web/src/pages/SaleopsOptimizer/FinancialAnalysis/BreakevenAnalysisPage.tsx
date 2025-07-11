import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Table,
  Space,
  message,
  Divider,
  Statistic,
  Alert,
  Spin,
  Tabs,
  Tag,
  Progress
} from 'antd';
import {
  PlayCircleOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  DownloadOutlined,
  ReloadOutlined,
  RiseOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { BreakevenAnalysisV2API } from '@/services/breakevenAnalysisV2';

const { Option } = Select;
const { TabPane } = Tabs;

interface FinancialModel {
  id: number;
  modelName: string;
  modelCode: string;
  category: string;
  description: string;
  status: string;
  variableCount: number;
}

interface ModelVariable {
  id: number;
  variableName: string;
  variableCode: string;
  variableType: 'INPUT' | 'CALC' | 'API';
  dataType: 'NUMBER' | 'DECIMAL' | 'PERCENTAGE' | 'CURRENCY' | 'STRING' | 'BOOLEAN';
  defaultValue?: string | number;
  unit?: string;
  description?: string;
  isRequired: boolean;
  validationRules?: string;
  displayOrder: number;
  minValue?: number;
  maxValue?: number;
}

interface AnalysisResult {
  // 关键指标
  breakevenQuantity: number;
  breakevenRevenue: number;
  targetQuantity: number;
  targetRevenue: number;
  unitContribution: number;
  contributionMargin: number;
  safetyMargin: number;
  
  // 图表数据
  chartData: ChartDataPoint[];
  
  // 汇总信息
  summary: {
    fixedCost: number;
    unitPrice: number;
    variableCost: number;
    unitContribution: number;
    breakevenPoint: number;
    breakevenRevenue: number;
  };
}

interface ChartDataPoint {
  quantity: number;
  revenue: number;
  totalCost: number;
  profit: number;
  fixedCost: number;
  variableCost: number;
}

interface ChartConfig {
  title: string;
  type: 'line' | 'bar' | 'scatter';
  series: SeriesConfig[];
}

interface SeriesConfig {
  name: string;
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  visible: boolean;
}

const BreakevenAnalysisPage: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [models, setModels] = useState<FinancialModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();
  const [selectedModel, setSelectedModel] = useState<FinancialModel | null>(null);
  const [variables, setVariables] = useState<ModelVariable[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [activeTab, setActiveTab] = useState('analysis');
  
  // 图表引用
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  // 表单
  const [form] = Form.useForm();

  // 模拟数据
  const mockModels: FinancialModel[] = [
    {
      id: 1,
      modelName: '盈亏平衡分析模型',
      modelCode: 'BREAKEVEN_001',
      variables: [
        {
          id: 1,
          variableName: '销售数量',
          variableCode: 'sales_volume',
          variableType: 'input',
          dataType: 'number',
          defaultValue: 0,
          unit: '件',
          description: '产品销售数量',
          isRequired: true,
          displayOrder: 1,
          isVisible: true
        },
        {
          id: 2,
          variableName: '单价',
          variableCode: 'unit_price',
          variableType: 'input',
          dataType: 'number',
          defaultValue: 100,
          unit: '元',
          description: '产品单位售价',
          isRequired: true,
          displayOrder: 2,
          isVisible: true
        },
        {
          id: 3,
          variableName: '固定成本',
          variableCode: 'fixed_cost',
          variableType: 'input',
          dataType: 'number',
          defaultValue: 10000,
          unit: '元',
          description: '固定成本总额',
          isRequired: true,
          displayOrder: 3,
          isVisible: true
        },
        {
          id: 4,
          variableName: '变动成本',
          variableCode: 'variable_cost',
          variableType: 'input',
          dataType: 'number',
          defaultValue: 50,
          unit: '元',
          description: '单位变动成本',
          isRequired: true,
          displayOrder: 4,
          isVisible: true
        },
        {
          id: 5,
          variableName: '税率',
          variableCode: 'tax_rate',
          variableType: 'input',
          dataType: 'number',
          defaultValue: 0.25,
          unit: '%',
          description: '所得税率',
          isRequired: false,
          displayOrder: 5,
          isVisible: true
        }
      ]
    }
  ];

  // 模拟分析结果
  const mockAnalysisResult: AnalysisResult = {
    breakevenPoint: 200,
    breakevenRevenue: 20000,
    maxProfit: 15000,
    marginRate: 0.5,
    safetyMargin: 300,
    periods: {
      monthly: {
        totalFixedCost: 3084378.74,
        netProfit: -807378.74,
        breakevenRevenue: 13410342.34
      },
      quarterly: {
        totalFixedCost: 9253136.22,
        netProfit: -2422136.22,
        breakevenRevenue: 40231027.03
      },
      halfYear: {
        totalFixedCost: 18506272.44,
        netProfit: -4844272.44,
        breakevenRevenue: 80462054.05
      },
      yearly: {
        totalFixedCost: 37012544.88,
        netProfit: -9688544.88,
        breakevenRevenue: 160924108.11
      }
    },
    chartData: []
  };

  // 获取模型列表
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getAvailableModels();
      if (response.resp_code === 0) {
        setModels(response.datas);
      } else {
        message.error('获取模型列表失败');
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取模型变量
  const fetchModelVariables = async (modelId: number) => {
    try {
      const response = await BreakevenAnalysisV2API.getModelVariables(modelId);
      if (response.resp_code === 0) {
        setVariables(response.datas);
        
        // 设置表单默认值
        const defaultValues: Record<string, any> = {};
        response.datas.forEach((variable: ModelVariable) => {
          if (variable.defaultValue !== undefined && variable.defaultValue !== null) {
            defaultValues[variable.variableCode] = variable.defaultValue;
          }
        });
        setFormValues(defaultValues);
        form.setFieldsValue(defaultValues);
      } else {
        message.error('获取模型变量失败');
      }
    } catch (error) {
      console.error('获取模型变量失败:', error);
      message.error('获取模型变量失败');
    }
  };

  // 模型选择改变
  const handleModelChange = (modelId: number) => {
    setSelectedModelId(modelId);
    const model = models.find(m => m.id === modelId);
    setSelectedModel(model || null);
    
    if (model) {
      fetchModelVariables(modelId);
    }
    
    // 清空之前的分析结果
    setAnalysisResult(null);
    setFormValues({});
    form.resetFields();
  };

  // 表单值改变
  const handleValuesChange = (changedValues: any, allValues: any) => {
    setFormValues(allValues);
  };

  // 执行分析
  const handleAnalyze = async () => {
    if (!selectedModelId) {
      message.warning('请先选择财务模型');
      return;
    }

    try {
      setAnalyzing(true);
      const response = await BreakevenAnalysisV2API.calculateBreakeven({
        modelId: selectedModelId,
        variableValues: formValues
      });
      
      if (response.resp_code === 0) {
        setAnalysisResult(response.datas);
        message.success('分析计算完成');
        
        // 更新图表
        if (response.datas.chartData) {
          updateChart(response.datas.chartData, response.datas.breakevenQuantity);
        }
      } else {
        message.error(response.resp_msg || '分析计算失败');
      }
    } catch (error) {
      console.error('分析计算失败:', error);
      message.error('分析计算失败');
    } finally {
      setAnalyzing(false);
    }
  };

  // 计算盈亏平衡分析
  const calculateBreakeven = (values: Record<string, any>): AnalysisResult => {
    const unitPrice = Number(values.unit_price) || 100;
    const fixedCost = Number(values.fixed_cost) || 10000;
    const variableCost = Number(values.variable_cost) || 50;
    const taxRate = Number(values.tax_rate) || 0.25;
    
    // 盈亏平衡点
    const breakevenPoint = fixedCost / (unitPrice - variableCost);
    const breakevenRevenue = breakevenPoint * unitPrice;
    
    // 边际贡献率
    const marginRate = (unitPrice - variableCost) / unitPrice;
    
    // 生成图表数据
    const chartData: ChartDataPoint[] = [];
    for (let volume = 0; volume <= breakevenPoint * 2; volume += 10) {
      const revenue = volume * unitPrice;
      const totalVariableCost = volume * variableCost;
      const totalCost = fixedCost + totalVariableCost;
      const profit = revenue - totalCost;
      
      chartData.push({
        salesVolume: volume,
        revenue,
        totalCost,
        profit,
        fixedCost,
        variableCost: totalVariableCost
      });
    }
    
    return {
      breakevenPoint: Math.round(breakevenPoint),
      breakevenRevenue: Math.round(breakevenRevenue),
      maxProfit: Math.round(chartData[chartData.length - 1].profit),
      marginRate: Math.round(marginRate * 100) / 100,
      safetyMargin: Math.round(breakevenPoint * 1.5 - breakevenPoint),
      periods: mockAnalysisResult.periods,
      chartData
    };
  };

  // 生成图表数据
  const generateChartData = (values: Record<string, any>) => {
    if (!chartRef.current) return;
    
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    
    const result = calculateBreakeven(values);
    
    const option: EChartsOption = {
      title: {
        text: '盈亏平衡分析图',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function(params: any) {
          const salesVolume = params[0].data[0];
          let html = `<strong>销售数量: ${salesVolume} 件</strong><br/>`;
          params.forEach((param: any) => {
            html += `${param.marker}${param.seriesName}: ${param.data[1].toLocaleString()} 元<br/>`;
          });
          return html;
        }
      },
      legend: {
        top: 30,
        data: ['利润', '总收入', '总成本', '盈亏平衡线']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '销售数量 (件)',
        nameLocation: 'middle',
        nameGap: 25
      },
      yAxis: {
        type: 'value',
        name: '金额 (元)',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: function(value: number) {
            return value >= 0 ? value.toLocaleString() : '-' + Math.abs(value).toLocaleString();
          }
        }
      },
      series: [
        {
          name: '利润',
          type: 'line',
          data: result.chartData.map(d => [d.salesVolume, d.profit]),
          lineStyle: {
            color: '#1890ff',
            width: 3
          },
          symbol: 'none'
        },
        {
          name: '总收入',
          type: 'line',
          data: result.chartData.map(d => [d.salesVolume, d.revenue]),
          lineStyle: {
            color: '#52c41a',
            width: 2
          },
          symbol: 'none'
        },
        {
          name: '总成本',
          type: 'line',
          data: result.chartData.map(d => [d.salesVolume, d.totalCost]),
          lineStyle: {
            color: '#faad14',
            width: 2
          },
          symbol: 'none'
        },
        {
          name: '盈亏平衡线',
          type: 'line',
          data: [[0, 0], [result.breakevenPoint * 2, 0]],
          lineStyle: {
            color: '#ff4d4f',
            width: 2,
            type: 'dashed'
          },
          symbol: 'none'
        },
        {
          name: '盈亏平衡点',
          type: 'scatter',
          data: [[result.breakevenPoint, 0]],
          symbolSize: 10,
          itemStyle: {
            color: '#ff4d4f'
          },
          label: {
            show: true,
            position: 'top',
            formatter: `盈亏平衡点\n${result.breakevenPoint} 件`
          }
        }
      ]
    };
    
    chartInstance.current.setOption(option);
  };

  // 导出报告
  const handleExportReport = () => {
    message.info('导出分析报告');
  };

  // 重置分析
  const handleReset = () => {
    form.resetFields();
    setAnalysisResult(null);
    setActiveTab('analysis');
    
    if (selectedModel) {
      const defaultValues: Record<string, any> = {};
      selectedModel.variables
        .filter(v => v.variableType === 'input' && v.isVisible)
        .forEach(variable => {
          defaultValues[variable.variableCode] = variable.defaultValue;
        });
      form.setFieldsValue(defaultValues);
      setFormValues(defaultValues);
    }
  };

  // 周期分析表格列
  const periodColumns = [
    {
      title: '指标',
      dataIndex: 'indicator',
      key: 'indicator',
      width: 150,
    },
    {
      title: '当月',
      dataIndex: 'monthly',
      key: 'monthly',
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 'N/A'
    },
    {
      title: '当季',
      dataIndex: 'quarterly',
      key: 'quarterly',
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 'N/A'
    },
    {
      title: '半年',
      dataIndex: 'halfYear',
      key: 'halfYear',
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 'N/A'
    },
    {
      title: '年度',
      dataIndex: 'yearly',
      key: 'yearly',
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 'N/A'
    }
  ];

  const periodData = analysisResult ? [
    {
      key: 'fixedCost',
      indicator: '总固定成本',
      monthly: analysisResult.periods.monthly.totalFixedCost,
      quarterly: analysisResult.periods.quarterly.totalFixedCost,
      halfYear: analysisResult.periods.halfYear.totalFixedCost,
      yearly: analysisResult.periods.yearly.totalFixedCost
    },
    {
      key: 'netProfit',
      indicator: '当月净利润',
      monthly: analysisResult.periods.monthly.netProfit,
      quarterly: null,
      halfYear: null,
      yearly: null
    },
    {
      key: 'breakevenRevenue',
      indicator: '盈亏平衡点 (营业额)',
      monthly: analysisResult.periods.monthly.breakevenRevenue,
      quarterly: analysisResult.periods.quarterly.breakevenRevenue,
      halfYear: analysisResult.periods.halfYear.breakevenRevenue,
      yearly: analysisResult.periods.yearly.breakevenRevenue
    }
  ] : [];

  // 初始化数据获取
  useEffect(() => {
    fetchModels();
  }, []);

  // 图表响应式调整
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 清理图表实例
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  return (
    <div className="breakeven-analysis-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 8 }}>盈亏平衡分析</h2>
            <span style={{ color: '#666', fontSize: '14px' }}>
              加载模型、填写参数、立即分析企业盈亏平衡状况
            </span>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExportReport}
              disabled={!analysisResult}
            >
              导出报告
            </Button>
          </Space>
        </div>

        <Divider />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                参数配置
              </span>
            } 
            key="analysis"
          >
            <Row gutter={24}>
              <Col span={12}>
                <Card title="模型选择与参数设置" size="small">
                  <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={handleValuesChange}
                  >
                    <Form.Item
                      label="选择财务模型"
                      name="modelId"
                      rules={[{ required: true, message: '请选择财务模型' }]}
                    >
                      <Select
                        placeholder="请选择财务模型"
                        value={selectedModelId}
                        onChange={(value) => {
                          setSelectedModelId(value);
                          handleModelChange(value);
                        }}
                      >
                        {models.map(model => (
                          <Option key={model.id} value={model.id}>
                            {model.modelName} ({model.modelCode})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {selectedModel && (
                      <>
                        <Divider orientation="left">模型参数</Divider>
                        {variables
                          .filter(v => v.variableType === 'input' && v.isVisible)
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map(variable => (
                            <Form.Item
                              key={variable.id}
                              label={
                                <span>
                                  {variable.variableName}
                                  {variable.unit && <span style={{ color: '#666' }}> ({variable.unit})</span>}
                                  {variable.isRequired && <span style={{ color: 'red' }}> *</span>}
                                </span>
                              }
                              name={variable.variableCode}
                              rules={[
                                { 
                                  required: variable.isRequired, 
                                  message: `请输入${variable.variableName}` 
                                }
                              ]}
                              tooltip={variable.description}
                            >
                              <InputNumber
                                style={{ width: '100%' }}
                                placeholder={`请输入${variable.variableName}`}
                                min={0}
                                precision={2}
                              />
                            </Form.Item>
                          ))}
                        
                        <Form.Item>
                          <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            onClick={handleAnalyze}
                            loading={analyzing}
                            block
                          >
                            {analyzing ? '分析中...' : '开始分析'}
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="分析说明" size="small">
                  <Alert
                    message="盈亏平衡分析说明"
                    description={
                      <div>
                        <p>盈亏平衡分析是企业财务管理的重要工具，用于确定企业在何种销售水平下能够实现收支平衡。</p>
                        <p><strong>关键指标：</strong></p>
                        <ul>
                          <li><strong>盈亏平衡点：</strong>固定成本 ÷ (单价 - 变动成本)</li>
                          <li><strong>边际贡献率：</strong>(单价 - 变动成本) ÷ 单价</li>
                          <li><strong>安全边际：</strong>实际销量 - 盈亏平衡点</li>
                        </ul>
                        <p><strong>应用场景：</strong></p>
                        <ul>
                          <li>产品定价决策</li>
                          <li>销售目标制定</li>
                          <li>成本控制分析</li>
                          <li>投资项目评估</li>
                        </ul>
                      </div>
                    }
                    type="info"
                    showIcon
                  />
                  
                  {analyzing && (
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 16 }}>
                        <Progress 
                          percent={60} 
                          status="active" 
                          format={() => '分析中...'}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <RiseOutlined />
                分析结果
                {analysisResult && <Tag color="green" style={{ marginLeft: 8 }}>已完成</Tag>}
              </span>
            } 
            key="result"
            disabled={!analysisResult}
          >
            {analysisResult && (
              <>
                {/* 关键指标 */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="盈亏平衡点"
                        value={analysisResult.breakevenQuantity}
                        suffix="件"
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<BarChartOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="最大利润"
                        value={analysisResult.maxProfit}
                        suffix="元"
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<RiseOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="边际贡献率"
                        value={analysisResult.contributionMargin * 100}
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="安全边际"
                        value={analysisResult.safetyMargin}
                        suffix="件"
                        valueStyle={{ color: '#f5222d' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 周期分析表格 */}
                <Card title="周期分析" style={{ marginBottom: 24 }}>
                  <Table
                    columns={periodColumns}
                    dataSource={periodData}
                    pagination={false}
                    size="small"
                  />
                </Card>

                {/* 图表展示 */}
                <Card title="盈亏平衡分析图">
                  <div
                    ref={chartRef}
                    style={{ width: '100%', height: '400px' }}
                  />
                </Card>
              </>
            )}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                详细报告
              </span>
            } 
            key="report"
            disabled={!analysisResult}
          >
            {analysisResult && (
              <Card title="分析报告">
                <div style={{ lineHeight: '1.8' }}>
                  <h3>一、分析概要</h3>
                  <p>
                    基于您提供的参数，本次盈亏平衡分析结果显示：
                    企业需要销售 <strong>{analysisResult.breakevenQuantity}</strong> 件产品才能达到盈亏平衡点，
                    对应的营业收入为 <strong>{analysisResult.breakevenRevenue.toLocaleString()}</strong> 元。
                  </p>
                  
                  <h3>二、关键发现</h3>
                  <ul>
                    <li>边际贡献率为 {(analysisResult.contributionMargin * 100).toFixed(1)}%，表明每销售1元产品可贡献 {(analysisResult.contributionMargin).toFixed(2)} 元用于覆盖固定成本和创造利润。</li>
                    <li>安全边际为 {analysisResult.safetyMargin} 件，说明企业在达到预期销量后还有一定的安全缓冲。</li>
                    <li>当前成本结构下，固定成本占比较高，建议关注成本控制。</li>
                  </ul>
                  
                  <h3>三、管理建议</h3>
                  <ol>
                    <li><strong>销售策略：</strong>制定不低于盈亏平衡点的销售目标，确保企业基本盈利能力。</li>
                    <li><strong>成本控制：</strong>重点关注固定成本的优化，提高资源使用效率。</li>
                    <li><strong>价格策略：</strong>在市场允许的情况下，适当提高产品价格以改善边际贡献率。</li>
                    <li><strong>风险管理：</strong>建立安全边际监控机制，及时预警业务风险。</li>
                  </ol>
                  
                  <h3>四、注意事项</h3>
                  <p>
                    本分析基于线性成本假设，实际经营中可能存在规模效应、成本阶梯等因素。
                    建议结合企业实际情况和市场环境进行综合判断。
                  </p>
                </div>
              </Card>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default BreakevenAnalysisPage; 