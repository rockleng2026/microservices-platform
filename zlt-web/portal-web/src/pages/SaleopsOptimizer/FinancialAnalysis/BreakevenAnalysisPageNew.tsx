import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  InputNumber,
  Button,
  Select,
  message,
  Divider,
  Statistic,
  Spin,
  Typography,
  Space,
  Alert
} from 'antd';
import {
  PlayCircleOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { BreakevenAnalysisV2API } from '@/services/breakevenAnalysisV2';

const { Option } = Select;
const { Title, Text } = Typography;

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
  displayOrder: number;
  minValue?: number;
  maxValue?: number;
}

const BreakevenAnalysisPageNew: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [models, setModels] = useState<FinancialModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();
  const [selectedModel, setSelectedModel] = useState<FinancialModel | null>(null);
  const [variables, setVariables] = useState<ModelVariable[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // 表单
  const [form] = Form.useForm();

  // 初始化
  useEffect(() => {
    fetchModels();
  }, []);

  // 获取模型列表
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getAvailableModels();
      
      if (response.resp_code === 0) {
        setModels(response.datas || []);
        message.success(`获取到 ${response.datas?.length || 0} 个模型`);
      } else {
        message.error(response.resp_msg || '获取模型列表失败');
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 解析验证规则
  const parseValidationRules = (validationRules?: string) => {
    if (!validationRules) return { minValue: undefined, maxValue: undefined };
    
    try {
      const rules = JSON.parse(validationRules);
      return {
        minValue: rules.min ? parseFloat(rules.min) : undefined,
        maxValue: rules.max ? parseFloat(rules.max) : undefined
      };
    } catch (error) {
      console.warn('解析验证规则失败:', validationRules, error);
      return { minValue: undefined, maxValue: undefined };
    }
  };

  // 获取模型变量
  const fetchModelVariables = async (modelId: number) => {
    try {
      console.log('fetchModelVariables 开始，modelId:', modelId);
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getModelVariables(modelId);
      console.log('获取变量API响应:', response);
      
      if (response.resp_code === 0) {
        // 处理变量数据，解析验证规则
        const processedVariables = (response.datas || []).map((variable: any) => {
          const { minValue, maxValue } = parseValidationRules(variable.validationRules);
          return {
            ...variable,
            minValue: minValue ?? variable.minValue,
            maxValue: maxValue ?? variable.maxValue
          };
        });
        
        console.log('处理后的变量数据:', processedVariables);
        setVariables(processedVariables);
        
        // 设置表单默认值
        const defaultValues: Record<string, any> = {};
        processedVariables.forEach((variable: ModelVariable) => {
          if (variable.defaultValue !== undefined && variable.defaultValue !== null) {
            defaultValues[variable.variableCode] = variable.defaultValue;
          }
        });
        console.log('默认值:', defaultValues);
        form.setFieldsValue(defaultValues);
        
        const inputCount = processedVariables.filter(v => v.variableType === 'INPUT').length;
        const calcCount = processedVariables.filter(v => v.variableType === 'CALC').length;
        console.log('变量统计:', { total: processedVariables.length, input: inputCount, calc: calcCount });
        message.success(`获取到 ${processedVariables.length} 个变量 (${inputCount} 个输入变量, ${calcCount} 个计算变量)`);
      } else {
        console.error('API返回错误:', response.resp_msg);
        message.error(response.resp_msg || '获取模型变量失败');
      }
    } catch (error) {
      console.error('获取模型变量失败:', error);
      message.error('获取模型变量失败');
    } finally {
      setLoading(false);
    }
  };

  // 模型选择改变
  const handleModelChange = (modelId: number) => {
    console.log('选择模型:', modelId);
    setSelectedModelId(modelId);
    const model = models.find(m => m.id === modelId);
    setSelectedModel(model || null);
    
    if (model) {
      console.log('开始获取模型变量:', model);
      fetchModelVariables(modelId);
    }
    
    // 清空之前的分析结果
    setAnalysisResult(null);
    form.resetFields();
  };

  // 执行分析
  const handleAnalyze = async () => {
    if (!selectedModelId) {
      message.warning('请先选择财务模型');
      return;
    }

    try {
      const formValues = await form.validateFields();
      setAnalyzing(true);
      
      const response = await BreakevenAnalysisV2API.calculateBreakeven({
        modelId: selectedModelId,
        variableValues: formValues
      });
      
      if (response.resp_code === 0) {
        setAnalysisResult(response.datas);
        message.success('分析计算完成');
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

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setAnalysisResult(null);
  };

  // 渲染变量输入表单
  const renderVariableInputs = () => {
    const inputVariables = variables.filter(v => v.variableType === 'INPUT');
    
    return inputVariables
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(variable => {
        // 根据数据类型确定精度和格式
        let precision = 0;
        let step = 1;
        let formatter = undefined;
        let parser = undefined;
        
        switch (variable.dataType) {
          case 'CURRENCY':
            precision = 2;
            step = 0.01;
            formatter = (value?: string | number) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
            parser = (value?: string) => value?.replace(/,/g, '') || '';
            break;
          case 'PERCENTAGE':
            precision = 2;
            step = 0.01;
            formatter = (value?: string | number) => value ? `${value}%` : '';
            parser = (value?: string) => value?.replace('%', '') || '';
            break;
          case 'DECIMAL':
            precision = 2;
            step = 0.01;
            break;
          case 'NUMBER':
            precision = 0;
            step = 1;
            break;
        }

        return (
          <Col span={12} key={variable.id}>
            <Form.Item
              label={
                <div>
                  <Text strong>{variable.variableName}</Text>
                  {variable.unit && <Text type="secondary"> ({variable.unit})</Text>}
                  {!variable.isRequired && <Text type="secondary" style={{ fontSize: '12px' }}> (可选)</Text>}
                </div>
              }
              name={variable.variableCode}
              rules={[
                { required: variable.isRequired, message: `请输入${variable.variableName}` }
              ]}
              extra={variable.description}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder={`请输入${variable.variableName}`}
                min={variable.minValue}
                max={variable.maxValue}
                precision={precision}
                step={step}
                formatter={formatter}
                parser={parser}
              />
            </Form.Item>
          </Col>
        );
      });
  };

  // 渲染分析结果
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <Card title="分析结果" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="盈亏平衡点"
              value={analysisResult.breakevenQuantity || 0}
              suffix="件"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="盈亏平衡收入"
              value={analysisResult.breakevenRevenue || 0}
              suffix="元"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="单位边际贡献"
              value={analysisResult.unitContribution || 0}
              suffix="元"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="边际贡献率"
              value={analysisResult.contributionMargin || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>

        {analysisResult.summary && (
          <>
            <Divider>参数摘要</Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="固定成本" value={analysisResult.summary.fixedCost} suffix="元" />
              </Col>
              <Col span={6}>
                <Statistic title="单价" value={analysisResult.summary.unitPrice} suffix="元" />
              </Col>
              <Col span={6}>
                <Statistic title="变动成本" value={analysisResult.summary.variableCost} suffix="元" />
              </Col>
              <Col span={6}>
                <Statistic title="安全边际" value={analysisResult.safetyMargin || 0} suffix="%" precision={1} />
              </Col>
            </Row>
          </>
        )}

        <Divider>分析结论</Divider>
        <Alert
          message="盈亏平衡分析结果"
          description={
            <div>
              <p>
                根据当前参数设置，企业需要销售 <strong>{analysisResult.breakevenQuantity || 0}</strong> 件产品才能达到盈亏平衡点，
                对应的营业收入为 <strong>{(analysisResult.breakevenRevenue || 0).toLocaleString()}</strong> 元。
              </p>
              <p>
                边际贡献率为 <strong>{(analysisResult.contributionMargin || 0).toFixed(1)}%</strong>，
                表明每销售1元产品可贡献 <strong>{(analysisResult.contributionMargin / 100 || 0).toFixed(2)}</strong> 元用于覆盖固定成本和创造利润。
              </p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    );
  };

  // 渲染计算变量显示
  const renderCalculatedVariables = () => {
    const calcVariables = variables.filter(v => v.variableType === 'CALC');
    if (calcVariables.length === 0 || !analysisResult) return null;
    
    return (
      <Card title="计算变量" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {calcVariables
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(variable => {
              const value = analysisResult[variable.variableCode] || 0;
              let displayValue = value;
              let suffix = variable.unit || '';
              
              // 格式化显示值
              if (variable.dataType === 'CURRENCY') {
                displayValue = parseFloat(value).toFixed(2);
                suffix = variable.unit || '元';
              } else if (variable.dataType === 'PERCENTAGE') {
                displayValue = parseFloat(value).toFixed(2);
                suffix = '%';
              }
              
              return (
                <Col span={8} key={variable.id}>
                  <Statistic
                    title={variable.variableName}
                    value={displayValue}
                    suffix={suffix}
                    precision={variable.dataType === 'CURRENCY' || variable.dataType === 'PERCENTAGE' ? 2 : 0}
                    valueStyle={{ 
                      color: value >= 0 ? '#52c41a' : '#f5222d',
                      fontSize: '16px'
                    }}
                  />
                  {variable.description && (
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                      {variable.description}
                    </Text>
                  )}
                </Col>
              );
            })}
        </Row>
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Alert
        message="当前页面: BreakevenAnalysisPageNew.tsx (V2新版本)"
        description="如果您看到这个提示，说明您正在使用新版本的盈亏平衡分析页面"
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>盈亏平衡分析</Title>
      
      {/* 模型选择 */}
      <Card title="模型选择" loading={loading}>
        <Row gutter={16}>
          <Col span={16}>
            <Select
              placeholder="请选择财务模型"
              style={{ width: '100%' }}
              value={selectedModelId}
              onChange={handleModelChange}
              disabled={loading}
            >
              {models.map(model => (
                <Option key={model.id} value={model.id}>
                  <div>
                    <Text strong>{model.modelName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {model.modelCode} | {model.variableCount} 个变量
                    </Text>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchModels}
                disabled={loading}
              >
                刷新模型
              </Button>
            </Space>
          </Col>
        </Row>

        {selectedModel && (
          <div style={{ marginTop: 16 }}>
            <Alert
              style={{ marginBottom: 16 }}
              message={selectedModel.modelName}
              description={selectedModel.description}
              type="info"
              showIcon
            />
            {/* 调试信息 */}
            <Alert
              message="调试信息"
              description={
                <div>
                  <p>变量数组长度: {variables.length}</p>
                  <p>输入变量数量: {variables.filter(v => v.variableType === 'INPUT').length}</p>
                  <p>计算变量数量: {variables.filter(v => v.variableType === 'CALC').length}</p>
                  {variables.length > 0 && (
                    <p>变量示例: {variables[0]?.variableName || '无'}</p>
                  )}
                </div>
              }
              type="warning"
              showIcon
            />
          </div>
        )}
      </Card>

      {/* 参数设置 */}
      {variables.length > 0 && (
        <Card title={`参数设置 (共${variables.length}个变量)`} style={{ marginTop: 16 }}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              {renderVariableInputs()}
            </Row>
            
            {variables.filter(v => v.variableType === 'INPUT').length === 0 && (
              <Alert
                message="提示"
                description="当前模型没有可配置的输入变量"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            
            <Divider />
            
            <Row justify="center">
              <Col>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={handleAnalyze}
                    loading={analyzing}
                    disabled={!selectedModelId}
                  >
                    {analyzing ? '分析中...' : '开始分析'}
                  </Button>
                  <Button
                    size="large"
                    onClick={handleReset}
                    disabled={analyzing}
                  >
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {/* 分析结果 */}
      {renderAnalysisResult()}
      
      {/* 计算变量 */}
      {renderCalculatedVariables()}
    </div>
  );
};

export default BreakevenAnalysisPageNew; 