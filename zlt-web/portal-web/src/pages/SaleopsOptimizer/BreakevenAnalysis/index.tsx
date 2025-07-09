import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Slider, InputNumber, Button, Select, Spin, message, Tabs, Table, Modal, Form, Input } from 'antd';
import { SaveOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, SettingOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import styles from './index.module.less';
import { 
  adjustParameterRealtime, 
  batchUpdateParameters, 
  getRealTimeResults,
  runSensitivityAnalysis,
  createForecast,
  getScenarios,
  createRealtimeConnection,
  sendRealtimeParameterChange,
  saveAnalysisTemplate,
  exportAnalysisReport,
  createAnalysis
} from '@/services/saleops/breakeven';

const { Option } = Select;
const { TabPane } = Tabs;

interface BreakevenParameters {
  currentRevenue: number;
  grossMargin: number;
  fixedCost: number;
  variableCost: number;
  totalEmployees: number;
  avgSalary: number;
  avgPerformanceRatio: number;
  targetProfit: number;
}

interface CalculationResults {
  breakevenPoint: number;
  totalFixedCost: number;
  variableCostRatio: number;
  marginSafety: number;
  marginSafetyRatio: number;
  scenarios: ScenarioResult[];
  calculationTime?: number;
  reasonabilityScore?: number;
}

interface ScenarioResult {
  name: string;
  grossMargin: number;
  breakevenPoint: number;
  feasibilityScore: number;
  riskLevel: string;
  marginSafety: number;
  marginSafetyRatio: number;
}

interface SensitivityItem {
  parameterName: string;
  parameterLabel: string;
  sensitivityCoefficient: number;
  sensitivityLevel: string;
  impactDirection: string;
}

const BreakevenAnalysis: React.FC = () => {
  const [parameters, setParameters] = useState<BreakevenParameters>({
    currentRevenue: 5000000,
    grossMargin: 0.35,
    fixedCost: 800000,
    variableCost: 200000,
    totalEmployees: 150,
    avgSalary: 12000,
    avgPerformanceRatio: 0.8,
    targetProfit: 500000
  });

  const [results, setResults] = useState<CalculationResults>({
    breakevenPoint: 0,
    totalFixedCost: 0,
    variableCostRatio: 0,
    marginSafety: 0,
    marginSafetyRatio: 0,
    scenarios: []
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string>('');
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [sensitivityData, setSensitivityData] = useState<SensitivityItem[]>([]);
  const [forecastData, setForecastData] = useState<any>(null);
  
  // Charts refs
  const breakevenChartRef = useRef<HTMLDivElement>(null);
  const sensitivityChartRef = useRef<HTMLDivElement>(null);
  const forecastChartRef = useRef<HTMLDivElement>(null);
  const scenarioChartRef = useRef<HTMLDivElement>(null);
  
  // WebSocket ref for real-time updates
  const wsRef = useRef<WebSocket | null>(null);
  
  // Form refs
  const [templateForm] = Form.useForm();
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);

  // ==================== 实时计算和联动逻辑 ====================

  // 参数变化处理 - 实现联动计算
  const handleParameterChange = useCallback(async (paramName: keyof BreakevenParameters, value: number) => {
    const newParameters = { ...parameters, [paramName]: value };
    setParameters(newParameters);

    if (realTimeMode && currentAnalysisId) {
      try {
        setIsCalculating(true);
        
        // 发送实时参数调整请求
        const response = await adjustParameterRealtime(currentAnalysisId, paramName, value);
        
        if (response.success) {
          // 更新计算结果
          const { cascadeResults, newForecast, calculationTime } = response.data;
          
          setResults(prev => ({
            ...prev,
            ...cascadeResults.recalculatedValues,
            calculationTime
          }));

          // 更新预测数据
          if (newForecast) {
            setForecastData(newForecast);
            updateForecastChart(newForecast);
          }

          // 更新场景数据
          await refreshScenarios();
          
          message.success(`参数 ${paramName} 已更新，耗时 ${calculationTime}ms`);
        }
      } catch (error) {
        console.error('实时计算失败:', error);
        message.error('实时计算失败，请检查网络连接');
      } finally {
        setIsCalculating(false);
      }
    } else {
      // 本地快速计算模式
      const quickResults = calculateQuickResults(newParameters);
      setResults(quickResults);
    }
  }, [parameters, realTimeMode, currentAnalysisId]);

  // 快速本地计算（当实时模式关闭时）
  const calculateQuickResults = (params: BreakevenParameters): CalculationResults => {
    const totalFixedCost = params.fixedCost + (params.totalEmployees * params.avgSalary * params.avgPerformanceRatio);
    const variableCostRatio = params.variableCost / params.currentRevenue;
    const breakevenPoint = totalFixedCost / (params.grossMargin - variableCostRatio);
    const marginSafety = params.currentRevenue - breakevenPoint;
    const marginSafetyRatio = marginSafety / params.currentRevenue;

    const scenarios: ScenarioResult[] = [
      {
        name: '保守场景',
        grossMargin: 0.1,
        breakevenPoint: totalFixedCost / (0.1 - variableCostRatio),
        feasibilityScore: 0.2,
        riskLevel: '高',
        marginSafety: params.currentRevenue - (totalFixedCost / (0.1 - variableCostRatio)),
        marginSafetyRatio: (params.currentRevenue - (totalFixedCost / (0.1 - variableCostRatio))) / params.currentRevenue
      },
      {
        name: '基准场景',
        grossMargin: 0.3,
        breakevenPoint: totalFixedCost / (0.3 - variableCostRatio),
        feasibilityScore: 0.75,
        riskLevel: '中',
        marginSafety: params.currentRevenue - (totalFixedCost / (0.3 - variableCostRatio)),
        marginSafetyRatio: (params.currentRevenue - (totalFixedCost / (0.3 - variableCostRatio))) / params.currentRevenue
      },
      {
        name: '乐观场景',
        grossMargin: 0.65,
        breakevenPoint: totalFixedCost / (0.65 - variableCostRatio),
        feasibilityScore: 0.9,
        riskLevel: '低',
        marginSafety: params.currentRevenue - (totalFixedCost / (0.65 - variableCostRatio)),
        marginSafetyRatio: (params.currentRevenue - (totalFixedCost / (0.65 - variableCostRatio))) / params.currentRevenue
      }
    ];

    return {
      breakevenPoint,
      totalFixedCost,
      variableCostRatio,
      marginSafety,
      marginSafetyRatio,
      scenarios
    };
  };

  // 批量参数更新
  const handleBatchParameterUpdate = async (newParameters: Partial<BreakevenParameters>) => {
    const updatedParameters = { ...parameters, ...newParameters };
    setParameters(updatedParameters);

    if (realTimeMode && currentAnalysisId) {
      try {
        setIsCalculating(true);
        const response = await batchUpdateParameters(currentAnalysisId, newParameters);
        
        if (response.success) {
          setResults(prev => ({
            ...prev,
            ...response.data.cascadeResults
          }));
          
          await refreshScenarios();
          message.success('批量参数更新成功');
        }
      } catch (error) {
        message.error('批量更新失败');
      } finally {
        setIsCalculating(false);
      }
    }
  };

  // ==================== 场景分析功能 ====================

  const refreshScenarios = async () => {
    if (!currentAnalysisId) return;
    
    try {
      const response = await getScenarios(currentAnalysisId);
      if (response.success) {
        setScenarios(response.data);
        updateScenarioChart(response.data);
      }
    } catch (error) {
      console.error('获取场景数据失败:', error);
    }
  };

  // ==================== 敏感性分析功能 ====================

  const runSensitivityAnalysisAction = async () => {
    if (!currentAnalysisId) {
      message.warning('请先创建分析');
      return;
    }

    try {
      setIsCalculating(true);
      const response = await runSensitivityAnalysis(currentAnalysisId, {
        parameters: ['currentRevenue', 'grossMargin', 'fixedCost', 'variableCost', 'totalEmployees', 'avgSalary'],
        variationRange: 0.1,
        stepSize: 0.01
      });

      if (response.success) {
        setSensitivityData(response.data);
        updateSensitivityChart(response.data);
        message.success('敏感性分析完成');
      }
    } catch (error) {
      message.error('敏感性分析失败');
    } finally {
      setIsCalculating(false);
    }
  };

  // ==================== 预测分析功能 ====================

  const createForecastAnalysis = async () => {
    if (!currentAnalysisId) {
      message.warning('请先创建分析');
      return;
    }

    try {
      setIsCalculating(true);
      const response = await createForecast(currentAnalysisId, {
        name: '未来12个月盈亏平衡预测',
        type: 'short_term',
        period: '12',
        model: 'linear_regression'
      });

      if (response.success) {
        setForecastData(response.data);
        updateForecastChart(response.data);
        message.success('预测分析创建成功');
      }
    } catch (error) {
      message.error('预测分析创建失败');
    } finally {
      setIsCalculating(false);
    }
  };

  // ==================== 图表更新函数 ====================

  const updateBreakevenChart = () => {
    if (!breakevenChartRef.current) return;

    const chart = echarts.init(breakevenChartRef.current);
    const revenueData = [];
    const fixedCostData = [];
    const totalCostData = [];
    
    for (let revenue = 0; revenue <= parameters.currentRevenue * 2; revenue += 500000) {
      revenueData.push(revenue);
      fixedCostData.push(results.totalFixedCost);
      totalCostData.push(results.totalFixedCost + revenue * results.variableCostRatio);
    }

    const option = {
      title: { text: '盈亏平衡分析图', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['营业收入', '固定成本', '总成本'], bottom: 0 },
      xAxis: {
        type: 'category',
        data: revenueData.map(r => (r / 10000).toFixed(0) + '万'),
        name: '营业收入(万元)'
      },
      yAxis: { type: 'value', name: '金额(元)' },
      series: [
        {
          name: '营业收入',
          type: 'line',
          data: revenueData,
          lineStyle: { color: '#1890ff' }
        },
        {
          name: '固定成本',
          type: 'line',
          data: fixedCostData,
          lineStyle: { color: '#52c41a' }
        },
        {
          name: '总成本',
          type: 'line',
          data: totalCostData,
          lineStyle: { color: '#f5222d' }
        }
      ],
      grid: { bottom: 60 }
    };

    chart.setOption(option);
  };

  const updateSensitivityChart = (data: SensitivityItem[]) => {
    if (!sensitivityChartRef.current || !data.length) return;

    const chart = echarts.init(sensitivityChartRef.current);
    const option = {
      title: { text: '敏感性分析', left: 'center' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'value',
        name: '敏感度系数'
      },
      yAxis: {
        type: 'category',
        data: data.map(item => item.parameterLabel)
      },
      series: [{
        type: 'bar',
        data: data.map(item => ({
          value: Math.abs(item.sensitivityCoefficient),
          itemStyle: {
            color: item.sensitivityLevel === 'high' ? '#f5222d' :
                   item.sensitivityLevel === 'medium' ? '#fa8c16' : '#52c41a'
          }
        }))
      }]
    };

    chart.setOption(option);
  };

  const updateForecastChart = (data: any) => {
    if (!forecastChartRef.current || !data) return;

    const chart = echarts.init(forecastChartRef.current);
    const option = {
      title: { text: '预测分析', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['乐观预测', '基准预测', '悲观预测'], bottom: 0 },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: { type: 'value', name: '营业收入(万元)' },
      series: [
        {
          name: '乐观预测',
          type: 'line',
          data: data.scenarios?.optimistic?.revenue || [],
          lineStyle: { color: '#52c41a' }
        },
        {
          name: '基准预测',
          type: 'line',
          data: data.scenarios?.baseline?.revenue || [],
          lineStyle: { color: '#1890ff' }
        },
        {
          name: '悲观预测',
          type: 'line',
          data: data.scenarios?.pessimistic?.revenue || [],
          lineStyle: { color: '#f5222d' }
        }
      ]
    };

    chart.setOption(option);
  };

  const updateScenarioChart = (data: ScenarioResult[]) => {
    if (!scenarioChartRef.current || !data.length) return;

    const chart = echarts.init(scenarioChartRef.current);
    const option = {
      title: { text: '场景对比分析', left: 'center' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['盈亏平衡点', '安全边际'], bottom: 0 },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name)
      },
      yAxis: { type: 'value', name: '金额(万元)' },
      series: [
        {
          name: '盈亏平衡点',
          type: 'bar',
          data: data.map(item => (item.breakevenPoint / 10000).toFixed(2))
        },
        {
          name: '安全边际',
          type: 'bar',
          data: data.map(item => (item.marginSafety / 10000).toFixed(2))
        }
      ]
    };

    chart.setOption(option);
  };

  // ==================== 模板和导出功能 ====================

  const saveTemplate = async () => {
    const values = await templateForm.validateFields();
    
    try {
      const response = await saveAnalysisTemplate(values.templateName, {
        templateType: 'custom',
        parameters,
        description: values.description
      });

      if (response.success) {
        message.success('模板保存成功');
        setIsTemplateModalVisible(false);
        templateForm.resetFields();
      }
    } catch (error) {
      message.error('模板保存失败');
    }
  };

  const exportReport = async () => {
    if (!currentAnalysisId) {
      message.warning('请先创建分析');
      return;
    }

    try {
      const response = await exportAnalysisReport(currentAnalysisId, 'excel');
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `盈亏平衡分析报告_${new Date().getTime()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      message.success('报告导出成功');
    } catch (error) {
      message.error('报告导出失败');
    }
  };

  // ==================== 初始化和生命周期 ====================

  useEffect(() => {
    // 创建初始分析
    const initializeAnalysis = async () => {
      try {
        const response = await createAnalysis({
          analysisName: `盈亏平衡分析_${new Date().getTime()}`,
          analysisType: 'monthly',
          analysisPeriod: new Date().toISOString().slice(0, 7),
          ...parameters
        });

        if (response.success) {
          setCurrentAnalysisId(response.data.analysisId);
          setResults(response.data.results);
          setScenarios(response.data.results.scenarios || []);
        }
      } catch (error) {
        console.error('初始化分析失败:', error);
      }
    };

    initializeAnalysis();
  }, []);

  // 图表初始化
  useEffect(() => {
    if (results.breakevenPoint > 0) {
      updateBreakevenChart();
      updateScenarioChart(scenarios);
    }
  }, [results, scenarios]);

  // 实时连接设置
  useEffect(() => {
    if (realTimeMode && currentAnalysisId) {
      wsRef.current = createRealtimeConnection(currentAnalysisId, (data) => {
        if (data.type === 'calculation_complete') {
          setResults(prev => ({ ...prev, ...data.results }));
          setIsCalculating(false);
        }
      });

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [realTimeMode, currentAnalysisId]);

  // ==================== 渲染组件 ====================

  return (
    <div className={`${styles.breakevenAnalysis} ${styles.fadeIn}`}>
      <Row gutter={24}>
        {/* 左侧参数控制面板 */}
        <Col span={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>参数设置</span>
                <div className={`${styles.realtimeIndicator} ${realTimeMode ? styles.active : styles.inactive}`}>
                  {realTimeMode ? '实时' : '离线'}
                </div>
              </div>
            }
            className={`${styles.parametersCard} ${styles.slideInLeft} ${styles.hoverLift}`}
            extra={
              <div className={styles.controlButtons}>
                <Button 
                  type={realTimeMode ? "primary" : "default"}
                  icon={realTimeMode ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={() => setRealTimeMode(!realTimeMode)}
                  size="small"
                  className={styles.clickScale}
                >
                  {realTimeMode ? '暂停实时' : '启用实时'}
                </Button>
                <Button 
                  icon={<SettingOutlined />}
                  onClick={() => setIsTemplateModalVisible(true)}
                  size="small"
                  className={styles.clickScale}
                >
                  保存模板
                </Button>
              </div>
            }
          >
            <Spin spinning={isCalculating}>
              {/* 基础参数 */}
              <div className={styles.parameterSection}>
                <h4>基础参数</h4>
                
                <div className={styles.parameterItem}>
                  <label>当前营业收入(万元):</label>
                  <Row gutter={8}>
                    <Col span={16}>
                      <Slider
                        min={100}
                        max={2000}
                        step={10}
                        value={parameters.currentRevenue / 10000}
                        onChange={(value) => handleParameterChange('currentRevenue', value * 10000)}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={100}
                        max={2000}
                        step={10}
                        value={parameters.currentRevenue / 10000}
                        onChange={(value) => handleParameterChange('currentRevenue', (value || 0) * 10000)}
                      />
                    </Col>
                  </Row>
                </div>

                <div className={styles.parameterItem}>
                  <label>综合毛利率(%):</label>
                  <Row gutter={8}>
                    <Col span={16}>
                      <Slider
                        min={5}
                        max={80}
                        step={1}
                        value={parameters.grossMargin * 100}
                        onChange={(value) => handleParameterChange('grossMargin', value / 100)}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={5}
                        max={80}
                        step={1}
                        value={parameters.grossMargin * 100}
                        onChange={(value) => handleParameterChange('grossMargin', (value || 0) / 100)}
                        formatter={value => `${value}%`}
                        parser={value => value?.replace('%', '') || '0'}
                      />
                    </Col>
                  </Row>
                </div>

                <div className={styles.parameterItem}>
                  <label>目标利润(万元):</label>
                  <Row gutter={8}>
                    <Col span={16}>
                      <Slider
                        min={10}
                        max={200}
                        step={5}
                        value={parameters.targetProfit / 10000}
                        onChange={(value) => handleParameterChange('targetProfit', value * 10000)}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={10}
                        max={200}
                        step={5}
                        value={parameters.targetProfit / 10000}
                        onChange={(value) => handleParameterChange('targetProfit', (value || 0) * 10000)}
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              {/* 成本结构 */}
              <div className={styles.parameterSection}>
                <h4>成本结构</h4>

                <div className={styles.parameterItem}>
                  <label>固定运营成本(万元):</label>
                  <Row gutter={8}>
                    <Col span={16}>
                      <Slider
                        min={10}
                        max={200}
                        step={5}
                        value={parameters.fixedCost / 10000}
                        onChange={(value) => handleParameterChange('fixedCost', value * 10000)}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={10}
                        max={200}
                        step={5}
                        value={parameters.fixedCost / 10000}
                        onChange={(value) => handleParameterChange('fixedCost', (value || 0) * 10000)}
                      />
                    </Col>
                  </Row>
                </div>

                <div className={styles.parameterItem}>
                  <label>变动运营成本(万元):</label>
                  <Row gutter={8}>
                    <Col span={16}>
                      <Slider
                        min={5}
                        max={100}
                        step={2}
                        value={parameters.variableCost / 10000}
                        onChange={(value) => handleParameterChange('variableCost', value * 10000)}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={5}
                        max={100}
                        step={2}
                        value={parameters.variableCost / 10000}
                        onChange={(value) => handleParameterChange('variableCost', (value || 0) * 10000)}
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              {/* 人员配置 */}
              <div className={styles.parameterSection}>
                <h4>人员配置</h4>

                <div className={styles.parameterItem}>
                  <label>总员工数(人):</label>
                  <Row gutter={8}>
                    <Col span={16}>
                      <Slider
                        min={10}
                        max={500}
                        step={5}
                        value={parameters.totalEmployees}
                        onChange={(value) => handleParameterChange('totalEmployees', value)}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={10}
                        max={500}
                        step={5}
                        value={parameters.totalEmployees}
                        onChange={(value) => handleParameterChange('totalEmployees', value || 0)}
                      />
                    </Col>
                  </Row>
                </div>

                <div className={styles.parameterItem}>
                  <label>平均薪资(元):</label>
                  <Row gutter={8}>
                    <Col span={16}>
                      <Slider
                        min={5000}
                        max={30000}
                        step={500}
                        value={parameters.avgSalary}
                        onChange={(value) => handleParameterChange('avgSalary', value)}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={5000}
                        max={30000}
                        step={500}
                        value={parameters.avgSalary}
                        onChange={(value) => handleParameterChange('avgSalary', value || 0)}
                      />
                    </Col>
                  </Row>
                </div>

                <div className={styles.parameterItem}>
                  <label>平均绩效系数:</label>
                  <Row gutter={8}>
                    <Col span={16}>
                      <Slider
                        min={0.5}
                        max={1.5}
                        step={0.1}
                        value={parameters.avgPerformanceRatio}
                        onChange={(value) => handleParameterChange('avgPerformanceRatio', value)}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={0.5}
                        max={1.5}
                        step={0.1}
                        value={parameters.avgPerformanceRatio}
                        onChange={(value) => handleParameterChange('avgPerformanceRatio', value || 0)}
                        formatter={value => `${value}x`}
                        parser={value => value?.replace('x', '') || '0'}
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              {/* 快捷操作 */}
              <div className={styles.quickActions}>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />}
                  onClick={runSensitivityAnalysisAction}
                  loading={isCalculating}
                  block
                >
                  重新计算
                </Button>
                <Button 
                  icon={<CloudDownloadOutlined />}
                  onClick={exportReport}
                  block
                  style={{ marginTop: 8 }}
                >
                  导出报告
                </Button>
              </div>
            </Spin>
          </Card>
        </Col>

        {/* 右侧结果展示区域 */}
        <Col span={16} className={styles.slideInRight}>
          {/* 关键指标卡片 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card className={`${styles.metricCard} ${styles.hoverLift} ${styles.clickScale}`}>
                <div className={styles.metricValue}>
                  {(results.breakevenPoint / 10000).toLocaleString()}万
                </div>
                <div className={styles.metricLabel}>盈亏平衡点</div>
                <div className={styles.metricChange}>
                  {results.calculationTime && `${results.calculationTime}ms`}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.metricCard}>
                <div className={styles.metricValue}>
                  {(results.marginSafety / 10000).toLocaleString()}万
                </div>
                <div className={styles.metricLabel}>安全边际</div>
                <div className={styles.metricChange}>
                  {(results.marginSafetyRatio * 100).toFixed(1)}%
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.metricCard}>
                <div className={styles.metricValue}>
                  {(results.totalFixedCost / 10000).toLocaleString()}万
                </div>
                <div className={styles.metricLabel}>总固定成本</div>
                <div className={styles.metricChange}>
                  固定成本
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.metricCard}>
                <div className={styles.metricValue}>
                  {(results.variableCostRatio * 100).toFixed(1)}%
                </div>
                <div className={styles.metricLabel}>变动成本率</div>
                <div className={styles.metricChange}>
                  {results.reasonabilityScore && `评分: ${(results.reasonabilityScore * 100).toFixed(0)}`}
                </div>
              </Card>
            </Col>
          </Row>

          {/* 图表和分析结果 */}
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="盈亏平衡分析" key="1">
                <div ref={breakevenChartRef} style={{ width: '100%', height: '400px' }} />
              </TabPane>
              
              <TabPane tab="场景对比" key="2">
                <div style={{ marginBottom: 16 }}>
                  <Table
                    dataSource={scenarios}
                    columns={[
                      { title: '场景名称', dataIndex: 'name', key: 'name' },
                      { title: '毛利率', dataIndex: 'grossMargin', key: 'grossMargin', render: (val) => `${(val * 100).toFixed(1)}%` },
                      { title: '盈亏平衡点(万)', dataIndex: 'breakevenPoint', key: 'breakevenPoint', render: (val) => (val / 10000).toFixed(2) },
                      { title: '可行性评分', dataIndex: 'feasibilityScore', key: 'feasibilityScore', render: (val) => (val * 100).toFixed(0) },
                      { title: '风险等级', dataIndex: 'riskLevel', key: 'riskLevel' }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </div>
                <div ref={scenarioChartRef} style={{ width: '100%', height: '300px' }} />
              </TabPane>

              <TabPane tab="敏感性分析" key="3">
                <div style={{ marginBottom: 16 }}>
                  <Button onClick={runSensitivityAnalysisAction} loading={isCalculating}>
                    运行敏感性分析
                  </Button>
                </div>
                {sensitivityData.length > 0 && (
                  <>
                    <Table
                      dataSource={sensitivityData}
                      columns={[
                        { title: '参数名称', dataIndex: 'parameterLabel', key: 'parameterLabel' },
                        { title: '敏感度系数', dataIndex: 'sensitivityCoefficient', key: 'sensitivityCoefficient', render: (val) => val.toFixed(4) },
                        { title: '敏感度等级', dataIndex: 'sensitivityLevel', key: 'sensitivityLevel' },
                        { title: '影响方向', dataIndex: 'impactDirection', key: 'impactDirection' }
                      ]}
                      pagination={false}
                      size="small"
                    />
                    <div ref={sensitivityChartRef} style={{ width: '100%', height: '300px' }} />
                  </>
                )}
              </TabPane>

              <TabPane tab="预测分析" key="4">
                <div style={{ marginBottom: 16 }}>
                  <Button onClick={createForecastAnalysis} loading={isCalculating}>
                    生成预测分析
                  </Button>
                </div>
                {forecastData && (
                  <div ref={forecastChartRef} style={{ width: '100%', height: '400px' }} />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* 模板保存弹窗 */}
      <Modal
        title="保存为模板"
        visible={isTemplateModalVisible}
        onOk={saveTemplate}
        onCancel={() => setIsTemplateModalVisible(false)}
      >
        <Form form={templateForm} layout="vertical">
          <Form.Item
            name="templateName"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="模板描述"
          >
            <Input.TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BreakevenAnalysis; 