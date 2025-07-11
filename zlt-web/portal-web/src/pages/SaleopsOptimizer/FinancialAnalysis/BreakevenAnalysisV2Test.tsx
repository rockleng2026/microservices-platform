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
  Table,
  Typography
} from 'antd';
import {
  PlayCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { BreakevenAnalysisV2API } from '@/services/breakevenAnalysisV2';

const { Option } = Select;
const { Title, Paragraph } = Typography;

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

const BreakevenAnalysisV2Test: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [models, setModels] = useState<FinancialModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();
  const [variables, setVariables] = useState<ModelVariable[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // 表单
  const [form] = Form.useForm();

  // 初始化：获取模型列表
  useEffect(() => {
    fetchModels();
  }, []);

  // 获取模型列表
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getAvailableModels();
      console.log('获取模型列表响应:', response);
      
      if (response.resp_code === 0) {
        const modelData = response.datas || [];
        setModels(modelData);
        message.success(`获取到 ${modelData.length} 个模型`);
      } else {
        message.error(response.resp_msg || '获取模型列表失败');
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // 获取模型变量
  const fetchModelVariables = async (modelId: number) => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getModelVariables(modelId);
      console.log('获取模型变量响应:', response);
      
      if (response.resp_code === 0) {
        const variableData = response.datas || [];
        setVariables(variableData);
        
        // 设置表单默认值
        const defaultValues: Record<string, any> = {};
        variableData.forEach((variable: ModelVariable) => {
          if (variable.defaultValue !== undefined && variable.defaultValue !== null) {
            defaultValues[variable.variableCode] = variable.defaultValue;
          }
        });
        form.setFieldsValue(defaultValues);
        message.success(`获取到 ${variableData.length} 个变量`);
      } else {
        message.error(response.resp_msg || '获取模型变量失败');
      }
    } catch (error) {
      console.error('获取模型变量失败:', error);
      message.error('获取模型变量失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // 模型选择改变
  const handleModelChange = (modelId: number) => {
    setSelectedModelId(modelId);
    setAnalysisResult(null);
    form.resetFields();
    
    if (modelId) {
      fetchModelVariables(modelId);
    }
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
      
      console.log('分析参数:', {
        modelId: selectedModelId,
        variableValues: formValues
      });
      
      const response = await BreakevenAnalysisV2API.calculateBreakeven({
        modelId: selectedModelId,
        variableValues: formValues
      });
      
      console.log('分析结果:', response);
      
      if (response.resp_code === 0) {
        const resultData = response.datas;
        setAnalysisResult(resultData);
        message.success('分析计算完成');
      } else {
        message.error(response.resp_msg || '分析计算失败');
      }
    } catch (error) {
      console.error('分析计算失败:', error);
      message.error('分析计算失败: ' + error);
    } finally {
      setAnalyzing(false);
    }
  };

  // 渲染变量输入表单
  const renderVariableInputs = () => {
    const inputVariables = variables.filter(v => v.variableType === 'INPUT');
    
    return inputVariables
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(variable => {
        const rules: any[] = [
          { required: variable.isRequired, message: `请输入${variable.variableName}` }
        ];
        
        if (variable.minValue !== undefined) {
          rules.push({ 
            validator: (_: any, value: number) => {
              if (value !== undefined && value < variable.minValue!) {
                return Promise.reject(new Error(`最小值为 ${variable.minValue}`));
              }
              return Promise.resolve();
            }
          });
        }
        
        if (variable.maxValue !== undefined) {
          rules.push({ 
            validator: (_: any, value: number) => {
              if (value !== undefined && value > variable.maxValue!) {
                return Promise.reject(new Error(`最大值为 ${variable.maxValue}`));
              }
              return Promise.resolve();
            }
          });
        }

        return (
          <Col span={12} key={variable.id}>
            <Form.Item
              label={`${variable.variableName} ${variable.unit ? `(${variable.unit})` : ''}`}
              name={variable.variableCode}
              rules={rules}
              extra={variable.description}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder={`请输入${variable.variableName}`}
                min={variable.minValue}
                max={variable.maxValue}
                precision={variable.dataType === 'DECIMAL' || variable.dataType === 'PERCENTAGE' || variable.dataType === 'CURRENCY' ? 2 : 0}
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
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>盈亏平衡分析 V2 测试</Title>
      <Paragraph>
        这是盈亏平衡分析v2版本的测试页面，用于验证与后端API的连接和基本功能。
      </Paragraph>

      <Card title="模型选择" loading={loading}>
        <Row gutter={16}>
          <Col span={12}>
            <Select
              placeholder="请选择财务模型"
              style={{ width: '100%' }}
              value={selectedModelId}
              onChange={handleModelChange}
              disabled={loading}
            >
              {models.map(model => (
                <Option key={model.id} value={model.id}>
                  {model.modelName} ({model.variableCount} 个变量)
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchModels}
              disabled={loading}
            >
              刷新模型列表
            </Button>
          </Col>
        </Row>

        {selectedModelId && (
          <div style={{ marginTop: 16 }}>
            <Paragraph>
              <strong>变量数量:</strong> {variables.length} 个
              <br />
              <strong>输入变量:</strong> {variables.filter(v => v.variableType === 'INPUT').length} 个
              <br />
              <strong>计算变量:</strong> {variables.filter(v => v.variableType === 'CALC').length} 个
            </Paragraph>
          </div>
        )}
      </Card>

      {variables.length > 0 && (
        <Card title="参数设置" style={{ marginTop: 16 }}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              {renderVariableInputs()}
            </Row>
            
            <Divider />
            
            <Row justify="center">
              <Col>
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
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {renderAnalysisResult()}
    </div>
  );
};

export default BreakevenAnalysisV2Test; 