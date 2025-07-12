import React, { useState, useEffect, useCallback } from 'react';
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
  Empty,
  List,
  Modal,
  Drawer,
  Tag,
  Slider,
  InputNumber as AntInputNumber
} from 'antd';
import {
  PlayCircleOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  ApiOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SettingOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { BreakevenAnalysisV2API } from '@/services/breakevenAnalysisV2';
import { request } from '@/utils/request';
import ChartConfigModal from './components/ChartConfigModal';
import SeriesConfigModal from './components/SeriesConfigModal';
import ChartRenderer from './components/ChartRenderer';

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

// 图表分析模型接口
interface ChartAnalysisModel {
  id: number;
  modelId: number;
  chartName: string;
  chartType: 'line' | 'bar' | 'pie' | 'scatter';
  simulationSteps: number;
  createdAt: string;
  updatedAt: string;
  xAxisName: string;
  xAxisField: string;
  xAxisUnit?: string;
  yAxisName: string;
  yAxisUnit?: string;
  seriesList?: ChartSeries[]; // 添加系列列表
}

// 图表系列配置接口
interface ChartSeries {
  id?: number;
  chartId: number;
  seriesName: string;
  seriesField: string;
  seriesType: 'fixed' | 'variable' | 'formula';
  seriesValue?: string;
  color?: string;
  sortOrder?: number;
}

// 图表数据点接口
interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
  seriesName?: string;
  seriesId?: number; // 新增
  seriesColor?: string; // 新增
  seriesField?: string; // 新增
  [key: string]: any; // 添加索引签名
}

// 图表配置接口
interface ChartConfig {
  chartType: 'line' | 'bar' | 'pie' | 'scatter';
  xAxisName: string;
  xAxisField: string;
  yAxisName: string;
  xAxisUnit?: string;
  yAxisUnit?: string;
  simulationSteps: number;
  series: ChartSeries[];
}

// 计算引擎类
class CalculatorEngine {
  // 将变量值根据数据类型转换为数值
  private convertToNumber(value: any, dataType: string, varName?: string, context?: any): number {
    if (value === undefined || value === null || value === '') {
      console.error(`变量值缺失: 变量名=${varName}, 类型=${dataType}, 当前上下文=`, context);
      throw new Error(`变量值缺失，无法转换为数字，变量名: ${varName}, 类型: ${dataType}`);
    }
    switch (dataType) {
      case 'NUMBER':
      case 'DECIMAL':
      case 'CURRENCY': {
        const num = Number(value);
        if (isNaN(num)) throw new Error(`变量值 ${value} 不是有效数字, 变量名: ${varName}`);
        return num;
      }
      case 'PERCENTAGE': {
        const num = Number(value);
        if (isNaN(num)) throw new Error(`百分比变量值 ${value} 不是有效数字, 变量名: ${varName}`);
        return num / 100;
      }
      case 'BOOLEAN':
        return value === true || value === 'true' ? 1 : 0;
      case 'STRING': {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          throw new Error(`无法将字符串 "${value}" 转换为数字, 变量名: ${varName}`);
        }
        return numValue;
      }
      default: {
        const num = Number(value);
        if (isNaN(num)) throw new Error(`变量值 ${value} 不是有效数字, 变量名: ${varName}`);
        return num;
      }
    }
  }

  // 词法分析器 - 将表达式分解为token
  private tokenize(expression: string): string[] {
    // 匹配数字、变量名（包含下划线）、运算符、括号、逗号等
    const regex = /(\d+\.?\d*)|([a-zA-Z_][a-zA-Z0-9_]*)|([+\-*/()])|,|\s+/g;
    const tokens: string[] = [];
    let match;
    
    while ((match = regex.exec(expression)) !== null) {
      const token = match[0];
      if (token.trim()) { // 跳过空白
        tokens.push(token.trim());
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
    console.log('【表达式解析】原始:', expression, 'tokens:', [...tokens], 'context:', context);
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
    console.log('【表达式解析】函数处理后 tokens:', [...tokens]);
    // 替换变量
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
        if (!context[token]) {
          throw new Error(`表达式中变量 ${token} 未定义`);
        }
        // 查找变量定义
        const variableDef = (this as any).variablesArray?.find?.((v: any) => v.variableCode === token);
        if (variableDef && variableDef.variableType === 'CALC' && variableDef.calculationFormula) {
          // 递归计算
          const calcValue = this.evaluate(variableDef.calculationFormula, context);
          tokens[i] = calcValue.toString();
        } else {
          const variable = context[token];
          const numValue = this.convertToNumber(variable.value, variable.type, token, context);
          if (isNaN(numValue)) {
            throw new Error(`变量 ${token} 的值无法转换为数字: ${variable.value}`);
          }
          tokens[i] = numValue.toString();
        }
      }
    }
    console.log('【表达式解析】变量替换后 tokens:', [...tokens]);
    // 计算表达式 (简单的左到右计算，支持运算符优先级)
    return this.calculateTokens(tokens);
  }

  // 计算token数组
  private calculateTokens(tokens: string[]): number {
    console.log('【表达式求值】计算前 tokens:', [...tokens]);
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
        console.log('【表达式求值】乘除处理后 tokens:', [...tokens]);
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
        console.log('【表达式求值】加减处理后 tokens:', [...tokens]);
      }
    }
    console.log('【表达式求值】最终结果 tokens:', [...tokens]);
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
  
  // 图表相关状态
  const [charts, setCharts] = useState<ChartAnalysisModel[]>([]);
  const [selectedChart, setSelectedChart] = useState<ChartAnalysisModel | null>(null);
  const [chartSeries, setChartSeries] = useState<ChartSeries[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartConfigVisible, setChartConfigVisible] = useState(false);
  const [seriesConfigVisible, setSeriesConfigVisible] = useState(false);
  const [currentChartType, setCurrentChartType] = useState<'line' | 'bar' | 'pie' | 'scatter'>('line');
  const [chartMaxX, setChartMaxX] = useState<number>(1000);
  const [chartTotalPoints, setChartTotalPoints] = useState<number>(100);
  
  // 表单
  const [form] = Form.useForm();

  // 计算变量值
  const calculateVariable = useCallback((variable: any, currentValues: Record<string, any>) => {
    if (variable.variableType !== 'CALC' || !variable.calculationFormula) {
      return variable.defaultValue || '';
    }

    try {
      // 构建计算上下文
      const context: Record<string, {value: any, type: string}> = {};
      
      // 添加所有变量到上下文
      variables.forEach(v => {
        let value = currentValues[v.variableCode];
        if (value === undefined || value === null || value === '') {
          value = v.defaultValue !== undefined && v.defaultValue !== null && v.defaultValue !== '' ? v.defaultValue : 0;
        }
        context[v.variableCode] = {
          value: value,
          type: v.dataType // 始终用变量定义的类型
        };
      });
      console.log('构建的 context:', context);

      // 让计算引擎能访问变量定义
      (calculatorEngine as any).variablesArray = variables;
      // 使用计算引擎计算
      const result = calculatorEngine.evaluate(variable.calculationFormula, context);
      
      return result;
    } catch (error) {
      console.error('计算失败:', error);
      return 0;
    }
  }, [variables]);

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
            // 构建 context，保证 type 字段
            const context: Record<string, {value: any, type: string}> = {};
            variables.forEach(v => {
              let value = allValues[v.variableCode];
              if (value === undefined || value === null || value === '') {
                value = v.defaultValue !== undefined && v.defaultValue !== null && v.defaultValue !== '' ? v.defaultValue : 0;
              }
              context[v.variableCode] = {
                value: value,
                type: v.dataType
              };
            });
            console.log('handleFormValuesChange context:', context);
            // 让计算引擎能访问变量定义
            (calculatorEngine as any).variablesArray = variables;
            // 解析计算公式并计算结果
            const result = calculatorEngine.evaluate(variable.calculationFormula, context);
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
              // 构建 context，保证 type 字段
              const context: Record<string, {value: any, type: string}> = {};
              variables.forEach(v => {
                let value = allValues[v.variableCode];
                if (value === undefined || value === null || value === '') {
                  value = v.defaultValue !== undefined && v.defaultValue !== null && v.defaultValue !== '' ? v.defaultValue : 0;
                }
                context[v.variableCode] = {
                  value: value,
                  type: v.dataType
                };
              });
              console.log('handleFormValuesChange context:', context);
              // 让计算引擎能访问变量定义
              (calculatorEngine as any).variablesArray = variables;
              const result = calculatorEngine.evaluate(dynamicFormula, context);
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
      
      // 为计算类型变量创建公式（如果没有的话）
      const formulaMap: Record<string, string> = {
        'total_fixed_cost': 'salary + social_insurance + fixed_cost',
        'net_profits': 'revenue * gross_margin - total_fixed_cost - revenue * variable_cost_rate', 
        'break_even_revenue': 'total_fixed_cost / (gross_margin - variable_cost_rate)'
      };

      const processedVariables = variableData.map((variable: any) => ({
        ...variable,
        calculationFormula: variable.calculationFormula || formulaMap[variable.variableCode] || ''
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
      
      // 分析完成后自动加载图表
      await fetchCharts();
      
      // 如果有图表，自动选择第一个并生成数据
      if (charts.length > 0) {
        const firstChart = charts[0];
        await generateChartData(firstChart);
      }
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

  // 获取图表列表
  const fetchCharts = async () => {
    if (!selectedModelId) return;
    
    setChartLoading(true);
    try {
      // 使用新的完整配置接口
      const response = await request(`/api-soo/api/soo/v2/chart-models/model/${selectedModelId}/complete`);
      const data = response.datas || response.data || [];
      
      // 处理完整配置数据
      const chartsWithSeries = data.map((item: any) => ({
        ...item.chartModel,
        seriesList: item.seriesList || []
      }));
      
      setCharts(chartsWithSeries);
      
      // 如果有图表，自动选择第一个并生成数据
      if (chartsWithSeries.length > 0 && breakevenResult) {
        const firstChart = chartsWithSeries[0];
        await generateChartData(firstChart);
      }
    } catch (error) {
      console.error('获取图表列表失败:', error);
      message.error('获取图表列表失败');
    } finally {
      setChartLoading(false);
    }
  };

  // 获取图表系列配置
  const fetchChartSeries = async (chartId: number) => {
    try {
      const response = await request(`/api-soo/api/soo/v2/chart-series/chart/${chartId}`);
      const data = response.datas || response.data || [];
      setChartSeries(data);
    } catch (error) {
      console.error('获取图表系列配置失败:', error);
      message.error('获取图表系列配置失败');
    }
  };

  // 生成图表数据
  const generateChartData = async (chart: ChartAnalysisModel) => {
    if (!chart) return;
    
    setChartLoading(true);
    try {
      // 获取所有变量的值（包括INPUT、CALC、API类型）
      const allVariableValues: Record<string, number> = {};
      
      // 从表单获取所有变量的当前值
      const formValues = form.getFieldsValue();
      
      variables.forEach(variable => {
        let value = formValues[variable.variableCode];
        
        // 如果表单中没有值，使用默认值或计算值
        if (value === undefined || value === null || value === '') {
          if (variable.variableType === 'CALC') {
            value = calculatedValues[variable.variableCode] || 0;
          } else {
            value = variable.defaultValue || 0;
          }
        }
        
        // 转换为数字
        const numValue = Number(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
          allVariableValues[variable.variableCode] = numValue;
        } else {
          allVariableValues[variable.variableCode] = 0;
        }
      });
      
      console.log('所有变量值:', allVariableValues);
      
      // 计算默认X轴最大值
      let defaultMaxX = chartMaxX;
      if (chart.xAxisField && allVariableValues[chart.xAxisField] !== undefined) {
        const xAxisValue = allVariableValues[chart.xAxisField];
        defaultMaxX = Math.max(xAxisValue * 3, 100); // 改为3倍
        // 更新chartMaxX状态
        setChartMaxX(defaultMaxX);
      }
      
      // 调用后端API生成图表数据
      const response = await request(`/api-soo/api/soo/v2/chart-models/${chart.id}/generate-data`, {
        method: 'POST',
        data: {
          variableValues: allVariableValues,
          maxX: defaultMaxX,
          totalPoints: chartTotalPoints
        }
      });
      
      const result = response.datas || response.data || response;
      console.log('后端图表数据生成结果:', result);
      
      if (result.data && Array.isArray(result.data)) {
        // 转换数据格式
        const data: ChartDataPoint[] = result.data.map((item: any) => ({
          x: item.x,
          y: item.y,
          label: item.label,
          seriesName: item.seriesName,
          seriesId: item.seriesId,
          seriesColor: item.seriesColor,
          seriesField: item.seriesField
        }));
        
        setChartData(data);
        setSelectedChart(chart);
        setCurrentChartType(chart.chartType);
        
        console.log(`图表数据生成完成: ${data.length} 个数据点, X轴范围: 0-${result.maxX}`);
        message.success(`图表数据生成成功，共 ${data.length} 个数据点`);
      } else {
        throw new Error('后端返回的数据格式不正确');
      }
    } catch (error) {
      console.error('生成图表数据失败:', error);
      message.error('生成图表数据失败');
      
      // 如果后端API失败，使用前端计算作为备选方案
      console.log('使用前端计算作为备选方案');
      await generateChartDataFallback(chart);
    } finally {
      setChartLoading(false);
    }
  };

  // 前端备选计算方案
  const generateChartDataFallback = async (chart: ChartAnalysisModel) => {
    if (!chart) return;
    
    try {
      // 获取所有变量的值（包括INPUT、CALC、API类型）
      const allVariableValues: Record<string, number> = {};
      
      // 从表单获取所有变量的当前值
      const formValues = form.getFieldsValue();
      
      variables.forEach(variable => {
        let value = formValues[variable.variableCode];
        
        // 如果表单中没有值，使用默认值或计算值
        if (value === undefined || value === null || value === '') {
          if (variable.variableType === 'CALC') {
            value = calculatedValues[variable.variableCode] || 0;
          } else {
            value = variable.defaultValue || 0;
          }
        }
        
        // 转换为数字
        const numValue = Number(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
          allVariableValues[variable.variableCode] = numValue;
        } else {
          allVariableValues[variable.variableCode] = 0;
        }
      });
      
      console.log('前端备选方案 - 所有变量值:', allVariableValues);
      
      // 计算X轴最大值：当前X轴字段变量值的3倍
      let maxX = 1000; // 默认值
      if (chart.xAxisField && allVariableValues[chart.xAxisField] !== undefined) {
        const xAxisValue = allVariableValues[chart.xAxisField];
        maxX = Math.max(xAxisValue * 3, 100); // 改为3倍
        console.log(`X轴字段 ${chart.xAxisField} 当前值: ${xAxisValue}, 计算最大X值: ${maxX}`);
      }
      
      // 使用状态中的数据点数量
      const totalPoints = chartTotalPoints;
      const stepSize = maxX / totalPoints; // 使用浮点数步长，避免取整导致的精度问题
      
      const data: ChartDataPoint[] = [];
      
      // 如果有系列配置，为每个系列生成数据
      if (chart.seriesList && chart.seriesList.length > 0) {
        for (let i = 0; i <= totalPoints; i++) {
          const xValue = i * stepSize; // X轴值
          
          // 为每个系列计算Y值
          chart.seriesList.forEach((series, seriesIndex) => {
            const yValue = calculateSeriesValue(series, xValue, allVariableValues, variables);
            
            data.push({
              x: xValue,
              y: yValue,
              label: `${xValue.toFixed(2)}`,
              seriesName: series.seriesName,
              seriesId: series.id,
              seriesColor: series.color,
              seriesField: series.seriesField
            });
          });
        }
      } else {
        // 默认计算方式
        for (let i = 0; i <= totalPoints; i++) {
          const xValue = i * stepSize; // X轴值
          let yValue = 0;
          
          // 根据Y轴字段计算值
          if (chart.yAxisName && allVariableValues[chart.yAxisName] !== undefined) {
            yValue = allVariableValues[chart.yAxisName];
          } else {
            // 尝试从常见字段获取值
            yValue = allVariableValues.net_profits || allVariableValues.revenue || 0;
          }
          
          // 添加一些变化以模拟趋势
          yValue = yValue * (1 + (i * 0.001));
          
          data.push({
            x: xValue,
            y: yValue,
            label: `${xValue.toFixed(2)}`,
            seriesName: chart.chartName
          });
        }
      }
      
      setChartData(data);
      setSelectedChart(chart);
      setCurrentChartType(chart.chartType);
      
      console.log(`前端备选方案图表数据生成完成: ${data.length} 个数据点, X轴范围: 0-${maxX.toFixed(2)}`);
    } catch (error) {
      console.error('前端备选方案生成图表数据失败:', error);
      message.error('图表数据生成失败');
    }
  };

  // 根据X轴最大值生成图表数据
  const generateChartDataWithMaxX = async (chart: ChartAnalysisModel, maxX: number) => {
    if (!chart) return;
    
    setChartLoading(true);
    try {
      // 获取所有变量的值（包括INPUT、CALC、API类型）
      const allVariableValues: Record<string, number> = {};
      
      // 从表单获取所有变量的当前值
      const formValues = form.getFieldsValue();
      
      variables.forEach(variable => {
        let value = formValues[variable.variableCode];
        
        // 如果表单中没有值，使用默认值或计算值
        if (value === undefined || value === null || value === '') {
          if (variable.variableType === 'CALC') {
            value = calculatedValues[variable.variableCode] || 0;
          } else {
            value = variable.defaultValue || 0;
          }
        }
        
        // 转换为数字
        const numValue = Number(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
          allVariableValues[variable.variableCode] = numValue;
        } else {
          allVariableValues[variable.variableCode] = 0;
        }
      });
      
      console.log('generateChartDataWithMaxX - 所有变量值:', allVariableValues);
      
      // 更新chartMaxX状态
      setChartMaxX(maxX);
      
      // 调用后端API生成图表数据
      const response = await request(`/api-soo/api/soo/v2/chart-models/${chart.id}/generate-data`, {
        method: 'POST',
        data: {
          variableValues: allVariableValues,
          maxX: maxX,
          totalPoints: chartTotalPoints
        }
      });
      
      const result = response.datas || response.data || response;
      console.log('后端图表数据生成结果:', result);
      
      if (result.data && Array.isArray(result.data)) {
        // 转换数据格式
        const data: ChartDataPoint[] = result.data.map((item: any) => ({
          x: item.x,
          y: item.y,
          label: item.label,
          seriesName: item.seriesName,
          seriesId: item.seriesId,
          seriesColor: item.seriesColor,
          seriesField: item.seriesField
        }));
        
        setChartData(data);
        setSelectedChart(chart);
        setCurrentChartType(chart.chartType);
        
        console.log(`图表数据生成完成: ${data.length} 个数据点, X轴范围: 0-${result.maxX}`);
        message.success(`图表数据生成成功，共 ${data.length} 个数据点`);
      } else {
        throw new Error('后端返回的数据格式不正确');
      }
    } catch (error) {
      console.error('生成图表数据失败:', error);
      message.error('生成图表数据失败');
      
      // 如果后端API失败，使用前端计算作为备选方案
      console.log('使用前端计算作为备选方案');
      await generateChartDataWithMaxXFallback(chart, maxX);
    } finally {
      setChartLoading(false);
    }
  };

  // 前端备选计算方案 - 指定最大X值
  const generateChartDataWithMaxXFallback = async (chart: ChartAnalysisModel, maxX: number) => {
    if (!chart) return;
    
    try {
      // 获取所有变量的值（包括INPUT、CALC、API类型）
      const allVariableValues: Record<string, number> = {};
      
      // 从表单获取所有变量的当前值
      const formValues = form.getFieldsValue();
      
      variables.forEach(variable => {
        let value = formValues[variable.variableCode];
        
        // 如果表单中没有值，使用默认值或计算值
        if (value === undefined || value === null || value === '') {
          if (variable.variableType === 'CALC') {
            value = calculatedValues[variable.variableCode] || 0;
          } else {
            value = variable.defaultValue || 0;
          }
        }
        
        // 转换为数字
        const numValue = Number(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
          allVariableValues[variable.variableCode] = numValue;
        } else {
          allVariableValues[variable.variableCode] = 0;
        }
      });
      
      console.log('generateChartDataWithMaxXFallback - 所有变量值:', allVariableValues);
      
      const totalPoints = chartTotalPoints; // 使用状态中的数据点数量
      const stepSize = maxX / totalPoints; // 使用浮点数步长
      
      const data: ChartDataPoint[] = [];
      
      for (let i = 0; i <= totalPoints; i++) {
        const xValue = i * stepSize; // X轴值
        
        // 根据系列配置计算Y值
        if (chart.seriesList && chart.seriesList.length > 0) {
          // 为每个系列计算Y值
          chart.seriesList.forEach((series, seriesIndex) => {
            const yValue = calculateSeriesValue(series, xValue, allVariableValues, variables);
            
            data.push({
              x: xValue,
              y: yValue,
              label: `${xValue.toFixed(2)}`,
              seriesName: series.seriesName,
              seriesId: series.id,
              seriesColor: series.color,
              seriesField: series.seriesField
            });
          });
        } else {
          // 默认计算方式
          let yValue = 0;
          if (chart.yAxisName && allVariableValues[chart.yAxisName] !== undefined) {
            yValue = allVariableValues[chart.yAxisName];
          } else {
            yValue = allVariableValues.net_profits || allVariableValues.revenue || 0;
          }
          
          // 添加一些变化以模拟趋势
          yValue = yValue * (1 + (i * 0.001));
          
          data.push({
            x: xValue,
            y: yValue,
            label: `${xValue.toFixed(2)}`,
            seriesName: chart.chartName
          });
        }
      }
      
      setChartData(data);
      setSelectedChart(chart);
      setCurrentChartType(chart.chartType);
    } catch (error) {
      console.error('前端备选方案生成图表数据失败:', error);
      message.error('图表数据生成失败');
    }
  };

  // 计算系列值 - 完善的图表序列计算引擎
  const calculateSeriesValue = (
    series: ChartSeries, 
    xValue: number, 
    context: Record<string, number>,
    allVariables: ModelVariable[]
  ): number => {
    try {
      console.log(`计算系列值: ${series.seriesName}, 类型: ${series.seriesType}, 值: ${series.seriesValue}, X值: ${xValue}`);
      
      if (series.seriesType === 'fixed') {
        // 固定值：直接返回数值
        const fixedValue = Number(series.seriesValue);
        console.log(`固定值计算结果: ${fixedValue}`);
        return isNaN(fixedValue) ? 0 : fixedValue;
        
      } else if (series.seriesType === 'variable') {
        // 变量值：从上下文中获取变量值
        const variableCode = series.seriesValue;
        if (variableCode && context[variableCode] !== undefined) {
          console.log(`变量值计算结果: ${context[variableCode]}`);
          return context[variableCode];
        }
        console.log(`变量 ${variableCode} 未找到，返回0`);
        return 0;
        
      } else if (series.seriesType === 'formula') {
        // 公式计算：支持包含x变量的表达式
        if (series.seriesValue) {
          // 构建计算上下文，包含所有变量和X轴值
          const formulaContext: Record<string, {value: any, type: string}> = {};
          
          // 添加所有模型变量到上下文
          allVariables.forEach(variable => {
            let value = context[variable.variableCode];
            if (value === undefined || value === null) {
              value = variable.defaultValue !== undefined ? Number(variable.defaultValue) : 0;
            }
            formulaContext[variable.variableCode] = {
              value: value,
              type: variable.dataType
            };
          });
          
          // 添加X轴变量（特殊变量x）
          formulaContext['x'] = { value: xValue, type: 'NUMBER' };
          
          // 检查series_value是否包含x变量
          const containsX = series.seriesValue.includes('x');
          if (containsX) {
            console.log(`公式包含X变量，X值: ${xValue}`);
            // 如果包含x，说明这个系列与X轴联动
            // 将X轴字段的值设置为当前X值
            if (selectedChart?.xAxisField) {
              formulaContext[selectedChart.xAxisField] = { value: xValue, type: 'NUMBER' };
            }
          } else {
            console.log(`公式不包含X变量，使用固定值计算`);
            // 如果不包含x，说明这个系列是常量，与X轴无关
          }
          
          console.log(`公式计算上下文:`, formulaContext);
          console.log(`计算公式: ${series.seriesValue}`);
          
          // 让计算引擎能访问变量定义
          (calculatorEngine as any).variablesArray = allVariables;
          
          const result = calculatorEngine.evaluate(series.seriesValue, formulaContext);
          console.log(`公式计算结果: ${result}`);
          return result;
        }
        return 0;
      }
      
      return 0;
    } catch (error) {
      console.error(`计算系列值失败: ${series.seriesName}`, error);
      return 0;
    }
  };

  // 处理图表类型切换
  const handleChartTypeChange = (type: 'line' | 'bar' | 'pie' | 'scatter') => {
    setCurrentChartType(type);
    if (selectedChart) {
      generateChartData({ ...selectedChart, chartType: type });
    }
  };

  // 处理图表配置
  const handleChartConfig = () => {
    setChartConfigVisible(true);
  };

  // 处理系列配置
  const handleSeriesConfig = () => {
    if (!selectedChart) {
      message.warning('请先选择图表');
      return;
    }
    setSeriesConfigVisible(true);
  };

  // 保存图表配置
  const handleSaveChartConfig = async (config: ChartConfig) => {
    try {
      const chartData = {
        modelId: selectedModelId,
        chartName: `盈亏平衡分析图表`,
        chartType: config.chartType,
        simulationSteps: config.simulationSteps,
        xAxisName: config.xAxisName,
        xAxisField: config.xAxisField,
        yAxisName: config.yAxisName,
        xAxisUnit: config.xAxisUnit,
        yAxisUnit: config.yAxisUnit
      };
      
      const response = await request('/api-soo/api/soo/v2/chart-models', {
        method: 'POST',
        data: chartData
      });
      
      message.success('图表配置保存成功');
      setChartConfigVisible(false);
      fetchCharts();
    } catch (error) {
      console.error('保存图表配置失败:', error);
      message.error('保存图表配置失败');
    }
  };

  // 保存系列配置
  const handleSaveSeriesConfig = async (series: ChartSeries[]) => {
    if (!selectedChart) return;
    
    try {
      await request(`/api-soo/api/soo/v2/chart-series/chart/${selectedChart.id}`, {
        method: 'POST',
        data: series
      });
      
      message.success('系列配置保存成功');
      setSeriesConfigVisible(false);
      fetchChartSeries(selectedChart.id);
    } catch (error) {
      console.error('保存系列配置失败:', error);
      message.error('保存系列配置失败');
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
                value={calculatedValue !== undefined ? formatNumber(calculatedValue) : ''}
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
                  formatter={(value) => {
                    if (variable.dataType === 'CURRENCY') {
                      return `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }
                    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
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

  // 格式化数字为千分位显示
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // 盈亏平衡试算表格数据
  const breakevenTableData = calculatedValues ? [
    {
      key: 'fixedCost',
      indicator: '总固定成本',
      monthly: formatNumber(calculatedValues.total_fixed_cost),
      quarterly: formatNumber(calculatedValues.total_fixed_cost !== undefined ? calculatedValues.total_fixed_cost * 3 : undefined),
      halfYear: formatNumber(calculatedValues.total_fixed_cost !== undefined ? calculatedValues.total_fixed_cost * 6 : undefined),
      annual: formatNumber(calculatedValues.total_fixed_cost !== undefined ? calculatedValues.total_fixed_cost * 12 : undefined)
    },
    {
      key: 'netProfit',
      indicator: '当月净利润',
      monthly: formatNumber(calculatedValues.net_profits),
      quarterly: formatNumber(calculatedValues.net_profits !== undefined ? calculatedValues.net_profits * 3 : undefined),
      halfYear: formatNumber(calculatedValues.net_profits !== undefined ? calculatedValues.net_profits * 6 : undefined),
      annual: formatNumber(calculatedValues.net_profits !== undefined ? calculatedValues.net_profits * 12 : undefined)
    },
    {
      key: 'breakevenRevenue',
      indicator: '盈亏平衡点 (营业额)',
      monthly: formatNumber(calculatedValues.break_even_revenue),
      quarterly: formatNumber(calculatedValues.break_even_revenue !== undefined ? calculatedValues.break_even_revenue * 3 : undefined),
      halfYear: formatNumber(calculatedValues.break_even_revenue !== undefined ? calculatedValues.break_even_revenue * 6 : undefined),
      annual: formatNumber(calculatedValues.break_even_revenue !== undefined ? calculatedValues.break_even_revenue * 12 : undefined)
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
      align: 'right' as const,
      render: (text: string) => text === 'N/A' ? text : `¥ ${text}`
    },
    {
      title: '当季',
      dataIndex: 'quarterly',
      key: 'quarterly',
      align: 'right' as const,
      render: (text: string) => text === 'N/A' ? text : `¥ ${text}`
    },
    {
      title: '半年',
      dataIndex: 'halfYear',
      key: 'halfYear',
      align: 'right' as const,
      render: (text: string) => text === 'N/A' ? text : `¥ ${text}`
    },
    {
      title: '年度',
      dataIndex: 'annual',
      key: 'annual',
      align: 'right' as const,
      render: (text: string) => text === 'N/A' ? text : `¥ ${text}`
    }
  ];

  // 渲染图表
  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return <Empty description="暂无图表数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const xAxisName = selectedChart?.xAxisName || selectedChart?.xAxisField || 'x';
    const yAxisName = selectedChart?.yAxisName || selectedChart?.yAxisField || 'y';
    const xAxisUnit = selectedChart?.xAxisUnit || '';
    const yAxisUnit = selectedChart?.yAxisUnit || '';

    return (
      <div style={{ padding: 20 }}>
        {/* 图表配置区域 */}
        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: 6, 
          padding: 16, 
          background: '#f8f9fa',
          marginBottom: 16
        }}>
          <Text strong style={{ marginBottom: 12, display: 'block' }}>图表配置:</Text>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <div>
              <Text style={{ fontSize: 12 }}>数据点数:</Text>
              <InputNumber
                min={10}
                max={1000}
                value={chartTotalPoints}
                onChange={(value) => {
                  if (value && value >= 10 && value <= 1000) {
                    setChartTotalPoints(value);
                  }
                }}
                style={{ width: 80, marginLeft: 8 }}
              />
            </div>
            <div>
              <Text style={{ fontSize: 12 }}>步长:</Text>
              <Text strong style={{ marginLeft: 8 }}>
                {chartData.length > 0 ? (Math.max(...chartData.map(d => d.x)) / 1000).toFixed(2) : 1}
              </Text>
            </div>
            <div>
              <Text style={{ fontSize: 12 }}>X轴最大值:</Text>
              <InputNumber
                min={1}
                value={chartMaxX}
                onChange={(value) => {
                  if (value && selectedChart) {
                    generateChartDataWithMaxX(selectedChart, value);
                  }
                }}
                style={{ width: 120, marginLeft: 8 }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </div>
            <div>
              <Text style={{ fontSize: 12 }}>当前X轴变量值:</Text>
              <Text strong style={{ marginLeft: 8 }}>
                {selectedChart?.xAxisField && (() => {
                  // 从表单获取当前值
                  const formValues = form.getFieldsValue();
                  let value = formValues[selectedChart.xAxisField];
                  
                  // 如果表单中没有值，使用默认值或计算值
                  if (value === undefined || value === null || value === '') {
                    const variable = variables.find(v => v.variableCode === selectedChart.xAxisField);
                    if (variable?.variableType === 'CALC') {
                      value = calculatedValues[selectedChart.xAxisField] || 0;
                    } else {
                      value = variable?.defaultValue || 0;
                    }
                  }
                  
                  return Number(value).toFixed(2);
                })()}
              </Text>
            </div>
            <Button 
              size="small" 
              type="primary"
              onClick={() => {
                if (selectedChart) {
                  // 重置为默认值（X轴变量值的10倍）
                  const formValues = form.getFieldsValue();
                  let xAxisValue = formValues[selectedChart.xAxisField];
                  
                  // 如果表单中没有值，使用默认值或计算值
                  if (xAxisValue === undefined || xAxisValue === null || xAxisValue === '') {
                    const variable = variables.find(v => v.variableCode === selectedChart.xAxisField);
                    if (variable?.variableType === 'CALC') {
                      xAxisValue = calculatedValues[selectedChart.xAxisField] || 0;
                    } else {
                      xAxisValue = variable?.defaultValue || 0;
                    }
                  }
                  
                  if (xAxisValue) {
                    const defaultMaxX = Math.max(Number(xAxisValue) * 3, 100);
                    generateChartDataWithMaxX(selectedChart, defaultMaxX);
                  } else {
                    generateChartData(selectedChart);
                  }
                }
              }}
            >
              重置为默认值
            </Button>
            <Button 
              size="small" 
              onClick={() => {
                if (selectedChart) {
                  generateChartData(selectedChart);
                }
              }}
            >
              重新生成
            </Button>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <Text>说明: X轴最大值默认为"{selectedChart?.xAxisField}"变量值的3倍，可手动调整</Text>
          </div>
        </div>

        {/* 使用ChartRenderer组件渲染图表 */}
        <ChartRenderer
          chartType={currentChartType}
          data={chartData}
          xAxisName={xAxisName}
          yAxisName={yAxisName}
          xAxisUnit={xAxisUnit}
          yAxisUnit={yAxisUnit}
          seriesList={selectedChart?.seriesList}
          chartName={selectedChart?.chartName}
        />
        
        {/* 数据点详情 */}
        <div style={{ marginTop: 16 }}>
          <Text strong>数据点详情:</Text>
          {selectedChart?.seriesList && selectedChart.seriesList.length > 0 ? (
            // 多系列数据
            selectedChart.seriesList
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((series, seriesIndex) => {
                const seriesData = chartData.filter(d => d.seriesId === series.id).slice(0, 5); // 每个系列显示前5个
                return (
                  <div key={series.id || seriesIndex} style={{ marginBottom: 16 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: 8,
                      padding: '8px 12px',
                      background: '#f5f5f5',
                      borderRadius: 4
                    }}>
                      {series.color && (
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: series.color,
                            marginRight: 8,
                            border: '1px solid #d9d9d9',
                            borderRadius: 2,
                          }}
                        />
                      )}
                      <Text strong>{series.seriesName} (前5个数据点)</Text>
                    </div>
                    <List
                      size="small"
                      dataSource={seriesData}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>X: {item.x.toFixed(2)}</Text>
                          <Text>Y: {item.y.toFixed(2)}</Text>
                          <Text type="secondary">{item.label}</Text>
                        </List.Item>
                      )}
                    />
                  </div>
                );
              })
          ) : (
            // 单系列数据
            <List
              size="small"
              dataSource={chartData.slice(0, 10)} // 只显示前10个
              renderItem={(item) => (
                <List.Item>
                  <Text>X: {item.x.toFixed(2)}</Text>
                  <Text>Y: {item.y.toFixed(2)}</Text>
                  <Text type="secondary">{item.label}</Text>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    );
  };

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
                      {charts.length > 0 && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ({charts.length} 个图表)
                        </Text>
                      )}
                    </Space>
                  }
                  extra={
                    <Space>
                      <Select
                        placeholder="选择图表"
                        style={{ width: 200 }}
                        value={selectedChart?.id}
                        onChange={(chartId) => {
                          const chart = charts.find(c => c.id === chartId);
                          if (chart) {
                            generateChartData(chart);
                          }
                        }}
                        loading={chartLoading}
                      >
                        {charts.map(chart => (
                          <Option key={chart.id} value={chart.id}>
                            {chart.chartName}
                          </Option>
                        ))}
                      </Select>
                      <Button 
                        size="small" 
                        type={currentChartType === 'line' ? 'primary' : 'default'}
                        icon={<LineChartOutlined />}
                        onClick={() => handleChartTypeChange('line')}
                      >
                        折线图
                      </Button>
                      <Button 
                        size="small" 
                        type={currentChartType === 'bar' ? 'primary' : 'default'}
                        icon={<BarChartOutlined />}
                        onClick={() => handleChartTypeChange('bar')}
                      >
                        柱状图
                      </Button>
                      <Button 
                        size="small" 
                        type={currentChartType === 'pie' ? 'primary' : 'default'}
                        icon={<PieChartOutlined />}
                        onClick={() => handleChartTypeChange('pie')}
                      >
                        饼图
                      </Button>
                      <Button 
                        size="small" 
                        icon={<SettingOutlined />}
                        onClick={handleChartConfig}
                      >
                        配置
                      </Button>
                    </Space>
                  }
                  style={{ height: '100%' }}
                  bodyStyle={{ height: 'calc(100% - 57px)', padding: 0 }}
                >
                  <Spin spinning={chartLoading}>
                    {selectedChart ? (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* 图表渲染区域 */}
                        <div style={{ flex: 1, padding: 20 }}>
                          {renderChart()}
                        </div>
                        
                        {/* 系列配置区域 */}
                        {selectedChart.seriesList && selectedChart.seriesList.length > 0 && (
                          <div style={{ 
                            borderTop: '1px solid #f0f0f0', 
                            padding: 16, 
                            background: '#fafafa',
                            maxHeight: 200,
                            overflow: 'auto'
                          }}>
                            <div style={{ marginBottom: 12 }}>
                              <Text strong>系列配置</Text>
                              <Button 
                                size="small" 
                                icon={<EditOutlined />}
                                onClick={handleSeriesConfig}
                                style={{ marginLeft: 8 }}
                              >
                                编辑
                              </Button>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                              {selectedChart.seriesList.map((series, index) => (
                                <div 
                                  key={series.id || index}
                                  style={{ 
                                    padding: 8, 
                                    border: '1px solid #d9d9d9', 
                                    borderRadius: 4,
                                    background: '#fff',
                                    minWidth: 150
                                  }}
                                >
                                  <div style={{ marginBottom: 4 }}>
                                    <Text strong>{series.seriesName}</Text>
                                  </div>
                                  <div style={{ fontSize: 12, color: '#666' }}>
                                    <div>字段: {series.seriesField}</div>
                                    <div>类型: {
                                      series.seriesType === 'fixed' ? '固定值' :
                                      series.seriesType === 'variable' ? '变量' : '公式'
                                    }</div>
                                    {series.seriesValue && (
                                      <div>值: {series.seriesValue}</div>
                                    )}
                                    {series.color && (
                                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                                        <span>颜色: </span>
                                        <div
                                          style={{
                                            width: 16,
                                            height: 16,
                                            backgroundColor: series.color,
                                            marginLeft: 4,
                                            border: '1px solid #d9d9d9',
                                            borderRadius: 2,
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : charts.length > 0 ? (
                      <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}>
                        <BarChartOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                        <Text type="secondary">请从上方选择要显示的图表</Text>
                      </div>
                    ) : (
                      <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}>
                        <BarChartOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                        <Text type="secondary">暂无图表配置</Text>
                        <Button 
                          type="primary" 
                          size="small" 
                          onClick={handleChartConfig}
                          style={{ marginTop: 8 }}
                        >
                          创建图表
                        </Button>
                      </div>
                    )}
                  </Spin>
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
      
      {/* 图表配置模态框 */}
      <ChartConfigModal
        visible={chartConfigVisible}
        onCancel={() => setChartConfigVisible(false)}
        onSuccess={() => {
          fetchCharts();
          setChartConfigVisible(false);
        }}
        modelId={selectedModelId}
        variables={variables}
      />
      
      {/* 系列配置模态框 */}
      <SeriesConfigModal
        visible={seriesConfigVisible}
        onCancel={() => setSeriesConfigVisible(false)}
        onSuccess={() => {
          if (selectedChart) {
            fetchChartSeries(selectedChart.id);
            generateChartData(selectedChart);
          }
          setSeriesConfigVisible(false);
        }}
        chartId={selectedChart?.id}
        variables={variables}
        existingSeries={selectedChart?.seriesList || []}
      />
    </div>
  );
};

export default BreakevenAnalysisPageV2; 