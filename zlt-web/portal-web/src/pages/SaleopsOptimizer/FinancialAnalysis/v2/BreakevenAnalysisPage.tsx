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
  Typography,
  Space,
  Input,
  Table,
  Tooltip,
  Spin,
  Empty
} from 'antd';
import {
  PlayCircleOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  ApiOutlined,
  BarChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { BreakevenAnalysisV2API } from '@/services/breakevenAnalysisV2';

const { Option } = Select;
const { Title, Text } = Typography;

// 金额转中文函数
const numberToChinese = (num: number): string => {
  if (num === 0) return '零元';
  
  const units = ['', '万', '亿', '万亿'];
  const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  
  const parts = [];
  let unitIndex = 0;
  
  while (num > 0 && unitIndex < units.length) {
    const part = num % 10000;
    if (part > 0) {
      const partStr = convertPartToChinese(part, nums);
      parts.unshift(partStr + units[unitIndex]);
    }
    num = Math.floor(num / 10000);
    unitIndex++;
  }
  
  return parts.join('') + '元';
};

const convertPartToChinese = (num: number, nums: string[]): string => {
  if (num === 0) return '';
  
  const thousands = Math.floor(num / 1000);
  const hundreds = Math.floor((num % 1000) / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;
  
  let result = '';
  
  if (thousands > 0) result += nums[thousands] + '千';
  if (hundreds > 0) result += nums[hundreds] + '百';
  else if (thousands > 0 && (tens > 0 || ones > 0)) result += '零';
  
  if (tens > 0) result += nums[tens] + '十';
  else if (hundreds > 0 && ones > 0) result += '零';
  
  if (ones > 0) result += nums[ones];
  
  return result;
};

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
  calculationFormula?: string;
  apiUrl?: string;
}

interface BreakevenResult {
  totalFixedCost: number;
  monthlyNetProfit: number;
  breakevenRevenue: {
    monthly: number;
    quarterly: number;
    halfYear: number;
    annual: number;
  };
  additionalMetrics?: Record<string, any>;
}

// 计算引擎类
class CalculatorEngine {
  // 将变量值根据数据类型转换为数值
  private convertToNumber(value: any, dataType: string): number {
    switch (dataType) {
      case 'NUMBER':
      case 'DECIMAL':
      case 'CURRENCY':
        return Number(value) || 0;
      case 'PERCENTAGE':
        return (Number(value) || 0) / 100;
      case 'BOOLEAN':
        return value === true || value === 'true' ? 1 : 0;
      case 'STRING':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          throw new Error(`无法将字符串 "${value}" 转换为数字`);
        }
        return numValue;
      default:
        return Number(value) || 0;
    }
  }

  // 词法分析器 - 将表达式分解为token
  private tokenize(expression: string): string[] {
    // 匹配数字、变量名、运算符、括号、逗号等
    const regex = /(\d+\.?\d*)|([a-zA-Z_][a-zA-Z0-9_]*)|([+\-*/()])|,|\s+/g;
    const tokens: string[] = [];
    let match;
    
    while ((match = regex.exec(expression)) !== null) {
      const token = match[0];
      if (token.trim()) { // 跳过空白
        tokens.push(token);
      }
    }
    
    return tokens;
  }

  // 解析函数调用
  private parseFunction(tokens: string[], index: number, context: Record<string, {value: any, type: string}>): {result: number, newIndex: number} {
    const funcName = tokens[index];
    
    if (tokens[index + 1] !== '(') {
      throw new Error(`函数 ${funcName} 缺少左括号`);
    }
    
    const args: number[] = [];
    let i = index + 2; // 跳过函数名和左括号
    let parenCount = 1;
    let currentExpr = '';
    
    while (i < tokens.length && parenCount > 0) {
      const token = tokens[i];
      
      if (token === '(') {
        parenCount++;
        currentExpr += token;
      } else if (token === ')') {
        parenCount--;
        if (parenCount === 0) {
          // 结束了，处理最后一个参数
          if (currentExpr.trim()) {
            args.push(this.evaluateExpression(currentExpr, context));
          }
        } else {
          currentExpr += token;
        }
      } else if (token === ',' && parenCount === 1) {
        // 参数分隔符
        if (currentExpr.trim()) {
          args.push(this.evaluateExpression(currentExpr, context));
        }
        currentExpr = '';
      } else {
        currentExpr += token;
      }
      
      i++;
    }
    
    // 执行函数
    let result: number;
    switch (funcName.toUpperCase()) {
      case 'SUM':
        result = args.reduce((sum, val) => sum + val, 0);
        break;
      case 'AVG':
        result = args.length > 0 ? args.reduce((sum, val) => sum + val, 0) / args.length : 0;
        break;
      case 'MAX':
        result = args.length > 0 ? Math.max(...args) : 0;
        break;
      case 'MIN':
        result = args.length > 0 ? Math.min(...args) : 0;
        break;
      default:
        throw new Error(`不支持的函数: ${funcName}`);
    }
    
    return {result, newIndex: i};
  }

  // 计算表达式
  private evaluateExpression(expression: string, context: Record<string, {value: any, type: string}>): number {
    if (!expression.trim()) return 0;
    
    // 处理括号
    while (expression.includes('(')) {
      const start = expression.lastIndexOf('(');
      let end = start;
      let count = 1;
      
      for (let i = start + 1; i < expression.length; i++) {
        if (expression[i] === '(') count++;
        else if (expression[i] === ')') count--;
        
        if (count === 0) {
          end = i;
          break;
        }
      }
      
      const innerExpr = expression.substring(start + 1, end);
      const result = this.evaluateExpression(innerExpr, context);
      expression = expression.substring(0, start) + result.toString() + expression.substring(end + 1);
    }
    
    const tokens = this.tokenize(expression);
    
    // 处理函数调用
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      
      if (nextToken === '(' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
        // 这是一个函数调用
        const funcResult = this.parseFunction(tokens, i, context);
        
        // 替换token
        tokens.splice(i, funcResult.newIndex - i, funcResult.result.toString());
        i--; // 重新检查当前位置
      }
    }
    
    // 替换变量
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token) && context[token]) {
        const variable = context[token];
        const numValue = this.convertToNumber(variable.value, variable.type);
        tokens[i] = numValue.toString();
      }
    }
    
    // 计算表达式 (简单的左到右计算，支持运算符优先级)
    return this.calculateTokens(tokens);
  }

  // 计算token数组
  private calculateTokens(tokens: string[]): number {
    // 先处理乘除法
    for (let i = 1; i < tokens.length - 1; i++) {
      if (tokens[i] === '*' || tokens[i] === '/') {
        const left = Number(tokens[i - 1]);
        const right = Number(tokens[i + 1]);
        let result: number;
        
        if (tokens[i] === '*') {
          result = left * right;
        } else {
          if (right === 0) {
            throw new Error('除数不能为0');
          }
          result = left / right;
        }
        
        tokens.splice(i - 1, 3, result.toString());
        i--; // 重新检查当前位置
      }
    }
    
    // 再处理加减法
    for (let i = 1; i < tokens.length - 1; i++) {
      if (tokens[i] === '+' || tokens[i] === '-') {
        const left = Number(tokens[i - 1]);
        const right = Number(tokens[i + 1]);
        let result: number;
        
        if (tokens[i] === '+') {
          result = left + right;
        } else {
          result = left - right;
        }
        
        tokens.splice(i - 1, 3, result.toString());
        i--; // 重新检查当前位置
      }
    }
    
    return tokens.length === 1 ? Number(tokens[0]) : 0;
  }

  // 主要计算方法
  public evaluate(expression: string, context: Record<string, {value: any, type: string}>): number {
    try {
      if (!expression || !expression.trim()) return 0;
      
      return this.evaluateExpression(expression.trim(), context);
    } catch (error) {
      console.error('计算表达式时出错:', error);
      return 0;
    }
  }
}

// 创建计算引擎实例
const calculatorEngine = new CalculatorEngine();

const BreakevenAnalysisPageV2: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [models, setModels] = useState<FinancialModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();
  const [selectedModel, setSelectedModel] = useState<FinancialModel | null>(null);
  const [variables, setVariables] = useState<ModelVariable[]>([]);
  const [breakevenResult, setBreakevenResult] = useState<BreakevenResult | null>(null);
  const [calculatedValues, setCalculatedValues] = useState<Record<string, number>>({});
  
  // 表单
  const [form] = Form.useForm();

  // 监听表单值变化，实时计算
  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    console.log('表单值变化:', changedValues, allValues);
    
    // 计算所有CALC类型变量的值
    const newCalculatedValues: Record<string, number> = {};
    
    variables.forEach(variable => {
      if (variable.variableType === 'CALC') {
        console.log('处理计算变量:', variable.variableCode, variable.calculationFormula);
        
        if (variable.calculationFormula) {
          try {
            // 解析计算公式并计算结果
            const result = calculatorEngine.evaluate(variable.calculationFormula, allValues);
            console.log(`计算结果 ${variable.variableCode}:`, result);
            
            if (!isNaN(result) && isFinite(result)) {
              newCalculatedValues[variable.variableCode] = result;
            }
          } catch (error) {
            console.warn(`计算变量 ${variable.variableCode} 失败:`, error);
          }
        } else {
          // 如果没有公式，尝试生成基于实际变量的公式
          const dynamicFormula = generateDynamicFormula(variable.variableCode, variables, allValues);
          if (dynamicFormula) {
            console.log(`生成动态公式 ${variable.variableCode}:`, dynamicFormula);
            try {
              const result = calculatorEngine.evaluate(dynamicFormula, allValues);
              console.log(`动态计算结果 ${variable.variableCode}:`, result);
              
              if (!isNaN(result) && isFinite(result)) {
                newCalculatedValues[variable.variableCode] = result;
              }
            } catch (error) {
              console.warn(`动态计算变量 ${variable.variableCode} 失败:`, error);
            }
          }
        }
      }
    });
    
    console.log('新计算值:', newCalculatedValues);
    setCalculatedValues(newCalculatedValues);
    
    // 更新表单中的计算字段
    const formUpdates: Record<string, any> = {};
    Object.entries(newCalculatedValues).forEach(([code, value]) => {
      formUpdates[code] = value;
    });
    
    if (Object.keys(formUpdates).length > 0) {
      console.log('更新表单字段:', formUpdates);
      form.setFieldsValue(formUpdates);
    }
  };

  // 生成动态计算公式
  const generateDynamicFormula = (
    targetVariableCode: string, 
    allVariables: ModelVariable[], 
    values: Record<string, any>
  ): string | null => {
    // 获取所有输入变量的代码
    const inputVariables = allVariables
      .filter(v => v.variableType === 'INPUT' || v.variableType === 'API')
      .map(v => v.variableCode);
    
    console.log('输入变量列表:', inputVariables);
    console.log('目标计算变量:', targetVariableCode);
    
    // 基于变量名生成常见的盈亏平衡计算公式
    const formulaMap: Record<string, string> = {
      // 总成本相关
      'total_cost': 'fixed_cost + salary + social_insurance',
      'total_fixed_cost': 'fixed_cost + salary + social_insurance',
      
      // 利润相关
      'gross_profit': 'revenue * (gross_margin / 100)',
      'net_profit': 'revenue - (fixed_cost + salary + social_insurance)',
      'profit': 'revenue - (fixed_cost + salary + social_insurance)',
      'monthly_net_profit': 'revenue - (fixed_cost + salary + social_insurance)',
      
      // 盈亏平衡点（根据常见公式：固定成本 / 边际贡献率）
      'breakeven_point': 'revenue > 0 ? (fixed_cost + salary + social_insurance) / (1 - ((fixed_cost + salary + social_insurance) / revenue)) : 0',
      'breakeven_revenue': '(fixed_cost + salary + social_insurance) / (gross_margin / 100)',
      'breakeven_quantity': 'unit_price > 0 ? (fixed_cost + salary + social_insurance) / (unit_price * (gross_margin / 100)) : 0',
      
      // 边际贡献
      'contribution_margin': 'revenue * (gross_margin / 100)',
      'unit_contribution': 'unit_price * (gross_margin / 100)',
      
      // 安全边际
      'safety_margin': 'revenue - (fixed_cost + salary + social_insurance) / (gross_margin / 100)',
      'safety_margin_rate': 'revenue > 0 ? ((revenue - (fixed_cost + salary + social_insurance) / (gross_margin / 100)) / revenue) * 100 : 0'
    };
    
    // 查找匹配的公式
    const formula = formulaMap[targetVariableCode];
    if (formula) {
      // 验证公式中的变量是否都存在
      const formulaVariables = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
      const availableVariables = allVariables.map(v => v.variableCode);
      
      const missingVariables = formulaVariables.filter(v => 
        !availableVariables.includes(v) && 
        !['100'].includes(v) // 排除常数
      );
      
      if (missingVariables.length === 0) {
        return formula;
      } else {
        console.warn(`公式 ${formula} 中缺少变量:`, missingVariables);
      }
    }
    
    return null;
  };

  // 初始化
  useEffect(() => {
    fetchModels();
  }, []);

  // 获取模型列表
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getAvailableModels();
      console.log('获取模型列表响应:', response);
      
      const modelData = Array.isArray(response) ? response : (response?.datas || []);
      setModels(modelData);
      message.success(`获取到 ${modelData.length} 个模型`);
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取模型变量
  const fetchModelVariables = async (modelId: number) => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getModelVariables(modelId);
      console.log('获取变量响应:', response);
      
      const variableData = Array.isArray(response) ? response : (response?.datas || []);
      
      // 为CALC类型变量添加示例公式（如果没有的话）
      const exampleFormulas = getExampleFormulas();
      const processedVariables = variableData.map((variable: any) => ({
        ...variable,
        calculationFormula: variable.calculationFormula || exampleFormulas[variable.variableCode] || ''
      }));
      
      // 按显示顺序排序
      const sortedVariables = processedVariables.sort((a: ModelVariable, b: ModelVariable) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      
      setVariables(sortedVariables);
      
      // 设置表单默认值
      const defaultValues: Record<string, any> = {};
      sortedVariables.forEach((variable: ModelVariable) => {
        if (variable.defaultValue !== undefined && variable.defaultValue !== null) {
          defaultValues[variable.variableCode] = variable.defaultValue;
        }
      });
      form.setFieldsValue(defaultValues);
      
      // 初始计算一次
      handleFormValuesChange({}, defaultValues);
      
      message.success(`获取到 ${sortedVariables.length} 个变量`);
    } catch (error) {
      console.error('获取模型变量失败:', error);
      message.error('获取模型变量失败');
      setVariables([]);
    } finally {
      setLoading(false);
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
    setBreakevenResult(null);
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
      
      console.log('分析结果:', response);
      
      const resultData = response?.datas || response;
      setBreakevenResult(resultData);
      message.success('分析计算完成');
    } catch (error) {
      console.error('分析计算失败:', error);
      message.error('分析计算失败');
    } finally {
      setAnalyzing(false);
    }
  };

  // 重新计算
  const handleRecalculate = () => {
    handleAnalyze();
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setBreakevenResult(null);
    
    // 重新设置默认值
    const defaultValues: Record<string, any> = {};
    variables.forEach((variable: ModelVariable) => {
      if (variable.defaultValue !== undefined && variable.defaultValue !== null) {
        defaultValues[variable.variableCode] = variable.defaultValue;
      }
    });
    form.setFieldsValue(defaultValues);
  };

  // 调用API获取变量值
  const handleApiCall = async (variable: ModelVariable) => {
    if (!variable.apiUrl) {
      message.warning('该变量未配置API地址');
      return;
    }

    try {
      // 这里应该调用实际的API，目前先模拟
      message.info('正在调用API获取数据...');
      
      // 模拟API调用
      setTimeout(() => {
        const mockValue = Math.random() * 10000;
        form.setFieldValue(variable.variableCode, mockValue);
        message.success('API数据获取成功');
      }, 1000);
    } catch (error) {
      console.error('API调用失败:', error);
      message.error('API调用失败');
    }
  };

  // 渲染变量输入项
  const renderVariableItem = (variable: ModelVariable) => {
    const isInput = variable.variableType === 'INPUT';
    const isApi = variable.variableType === 'API';
    const isCalc = variable.variableType === 'CALC';
    const calculatedValue = calculatedValues[variable.variableCode];
    const currentValue = form.getFieldValue(variable.variableCode) || 0;

    return (
      <div key={variable.id} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <Text strong style={{ marginRight: 8 }}>
              {variable.variableName}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              [{variable.variableCode}]
              {variable.unit && ` (${variable.unit})`}
            </Text>
          </div>
          {variable.isRequired && (
            <Text type="danger" style={{ marginLeft: 4 }}>*</Text>
          )}
          {isCalc && variable.calculationFormula && (
            <Tooltip title={`计算公式: ${variable.calculationFormula}`}>
              <CalculatorOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
            </Tooltip>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isCalc ? (
            <>
              <Input
                value={calculatedValue !== undefined ? calculatedValue.toFixed(2) : ''}
                disabled
                style={{ 
                  backgroundColor: '#f5f5f5',
                  color: '#1890ff',
                  fontWeight: 600,
                  width: 180
                }}
                placeholder="由其他变量计算生成"
                suffix={<CalculatorOutlined style={{ color: '#1890ff' }} />}
              />
              {variable.dataType === 'CURRENCY' && calculatedValue && calculatedValue > 0 && (
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  {numberToChinese(calculatedValue)}
                </Text>
              )}
            </>
          ) : (
            <>
              <Form.Item
                name={variable.variableCode}
                style={{ margin: 0, width: 180 }}
                rules={[
                  {
                    required: variable.isRequired,
                    message: `请输入${variable.variableName}`
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={`请输入${variable.variableName}`}
                  precision={variable.dataType === 'DECIMAL' ? 2 : 0}
                  formatter={variable.dataType === 'CURRENCY' ? (value) => `¥ ${value}` : undefined}
                  parser={variable.dataType === 'CURRENCY' ? (value) => value!.replace(/¥\s?|(,*)/g, '') : undefined}
                />
              </Form.Item>
              {variable.dataType === 'CURRENCY' && currentValue > 0 && (
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  {numberToChinese(currentValue)}
                </Text>
              )}
            </>
          )}
          
          {isApi && (
            <Tooltip title="点击调用API获取数据">
              <Button
                icon={<ApiOutlined />}
                size="small"
                onClick={() => handleApiCall(variable)}
              />
            </Tooltip>
          )}
        </div>
        
        {variable.description && (
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            {variable.description}
          </Text>
        )}
        
        {isCalc && variable.calculationFormula && (
          <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic', display: 'block', marginTop: 4 }}>
            公式: {variable.calculationFormula}
          </Text>
        )}
      </div>
    );
  };

  // 盈亏平衡试算表格数据
  const breakevenTableData = breakevenResult ? [
    {
      key: 'fixedCost',
      indicator: '总固定成本',
      monthly: breakevenResult.totalFixedCost?.toFixed(2) || 'N/A',
      quarterly: 'N/A',
      halfYear: 'N/A',
      annual: 'N/A'
    },
    {
      key: 'netProfit',
      indicator: '当月净利润',
      monthly: breakevenResult.monthlyNetProfit?.toFixed(2) || 'N/A',
      quarterly: 'N/A',
      halfYear: 'N/A',
      annual: 'N/A'
    },
    {
      key: 'breakevenRevenue',
      indicator: '盈亏平衡点 (营业额)',
      monthly: breakevenResult.breakevenRevenue?.monthly?.toFixed(2) || 'N/A',
      quarterly: breakevenResult.breakevenRevenue?.quarterly?.toFixed(2) || 'N/A',
      halfYear: breakevenResult.breakevenRevenue?.halfYear?.toFixed(2) || 'N/A',
      annual: breakevenResult.breakevenRevenue?.annual?.toFixed(2) || 'N/A'
    }
  ] : [];

  const breakevenTableColumns = [
    {
      title: '指标',
      dataIndex: 'indicator',
      key: 'indicator',
      width: 150,
      fixed: 'left' as const
    },
    {
      title: '当月',
      dataIndex: 'monthly',
      key: 'monthly',
      align: 'right' as const
    },
    {
      title: '当季',
      dataIndex: 'quarterly',
      key: 'quarterly',
      align: 'right' as const
    },
    {
      title: '半年',
      dataIndex: 'halfYear',
      key: 'halfYear',
      align: 'right' as const
    },
    {
      title: '年度',
      dataIndex: 'annual',
      key: 'annual',
      align: 'right' as const
    }
  ];

  return (
    <div className="breakeven-analysis-v2" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* 页面标题 */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
        <Title level={4} style={{ margin: 0 }}>盈亏平衡分析 V2</Title>
        <Text type="secondary">基于财务模型进行盈亏平衡点计算和分析</Text>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {/* 左侧配置区 */}
        <div style={{ 
          width: 400, 
          borderRight: '1px solid #f0f0f0', 
          display: 'flex', 
          flexDirection: 'column',
          background: '#fff'
        }}>
          {/* 模型选择 */}
          <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong>选择模型</Text>
            </div>
            <Select
              placeholder="请选择财务模型"
              value={selectedModelId}
              onChange={handleModelChange}
              loading={loading}
              style={{ width: '100%' }}
              size="large"
            >
              {models.map(model => (
                <Option key={model.id} value={model.id}>
                  {model.modelName}
                </Option>
              ))}
            </Select>
          </div>

          {/* 变量配置区 */}
          <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
            {selectedModelId ? (
              <Spin spinning={loading}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>模型变量</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({variables.length} 个变量)
                  </Text>
                </div>
                
                <Form 
                  form={form} 
                  layout="vertical"
                  onValuesChange={handleFormValuesChange}
                >
                  {variables.map(renderVariableItem)}
                </Form>
              </Spin>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                <CalculatorOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>请先选择财务模型</div>
              </div>
            )}
          </div>

          {/* 操作按钮区 */}
          {selectedModelId && (
            <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
              <Space style={{ width: '100%' }} direction="vertical">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleAnalyze}
                  loading={analyzing}
                  style={{ width: '100%' }}
                  size="large"
                >
                  执行分析
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRecalculate}
                  style={{ width: '100%' }}
                  disabled={!breakevenResult}
                >
                  重新计算
                </Button>
              </Space>
            </div>
          )}
        </div>

        {/* 右侧结果展示区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
          {breakevenResult ? (
            <>
              {/* 盈亏平衡试算表格 */}
              <div style={{ padding: 24, background: '#fff', margin: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Title level={5} style={{ marginBottom: 16 }}>盈亏平衡试算结果</Title>
                <Table
                  columns={breakevenTableColumns}
                  dataSource={breakevenTableData}
                  pagination={false}
                  size="small"
                  bordered
                  scroll={{ x: 500 }}
                />
              </div>

              {/* 图表展示区 */}
              <div style={{ flex: 1, padding: '0 16px 16px' }}>
                <Card
                  title={
                    <Space>
                      <BarChartOutlined />
                      <span>图表分析</span>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button size="small" icon={<BarChartOutlined />}>柱状图</Button>
                      <Button size="small" icon={<LineChartOutlined />}>趋势图</Button>
                    </Space>
                  }
                  style={{ height: '100%' }}
                  bodyStyle={{ height: 'calc(100% - 57px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Empty 
                    description="图表功能开发中"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#999' }}>
                <BarChartOutlined style={{ fontSize: 72, marginBottom: 24 }} />
                <div style={{ fontSize: 16 }}>执行分析后查看结果</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>选择模型并配置参数，然后点击"执行分析"</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakevenAnalysisPageV2; 