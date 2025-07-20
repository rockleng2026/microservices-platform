import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Row,
  Col,
  Tag,
  Empty,
  Spin,
  Typography,
  Alert,
  Modal,
  Form,
  InputNumber,
  Switch,
  Divider
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  FilterOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import * as financialModelInstanceAPI from '@/services/financialModelInstance';
import * as financialModelAPI from '@/services/financialModel';
import './styles/ModelInstanceVariableManagement.less';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface ModelInstanceVariableManagementProps {
  modelId?: number;
  projectId?: number;
}

interface ModelVariable {
  id: number;
  variableCode: string;
  variableName: string;
  variableType: 'INPUT' | 'CALC' | 'API' | 'CALC_FACTORS';
  dataType: 'NUMBER' | 'DECIMAL' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN' | 'STRING';
  unit?: string;
  defaultValue?: string;
  constraintFormula?: string;
  calculationFormula?: string;
  isRequired: boolean;
  description?: string;
}

const ModelInstanceVariableManagement: React.FC<ModelInstanceVariableManagementProps> = ({ 
  modelId: propModelId, 
  projectId: propProjectId 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // 从URL参数中获取modelId和instanceId
  const getModelIdFromUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    const urlModelId = urlParams.get('modelId');
    return urlModelId ? parseInt(urlModelId) : propModelId;
  };

  const getInstanceIdFromUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    const urlInstanceId = urlParams.get('instanceId');
    return urlInstanceId ? parseInt(urlInstanceId) : null;
  };
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<financialModelInstanceAPI.FinancialModelInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<financialModelInstanceAPI.FinancialModelInstance | null>(null);
  const [variables, setVariables] = useState<any[]>([]);
  const [variablesLoading, setVariablesLoading] = useState(false);
  
  // 创建变量实例相关状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [modelVariables, setModelVariables] = useState<ModelVariable[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [variableForm] = Form.useForm();

  // 加载实例列表
  const loadInstances = async () => {
    setLoading(true);
    try {
      const result = await financialModelInstanceAPI.FinancialModelInstanceAPI.getInstances({
        page: 1,
        size: 1000,
        modelId: getModelIdFromUrl(),
      });
      setInstances(result.data);
      
      // 如果有指定的instanceId，自动选择
      const instanceId = getInstanceIdFromUrl();
      if (instanceId) {
        const targetInstance = result.data.find(instance => instance.id === instanceId);
        if (targetInstance) {
          setSelectedInstance(targetInstance);
          await loadInstanceVariables(targetInstance.id);
        }
      }
    } catch (error) {
      message.error('加载实例列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载实例变量
  const loadInstanceVariables = async (instanceId: number) => {
    setVariablesLoading(true);
    try {
      const instanceVars = await financialModelInstanceAPI.FinancialModelInstanceAPI.getInstanceVariables(instanceId);
      setVariables(instanceVars);
    } catch (error) {
      message.error('加载实例变量失败');
      setVariables([]);
    } finally {
      setVariablesLoading(false);
    }
  };

  // 加载模型变量
  const loadModelVariables = async (modelId: number) => {
    try {
      const modelVars = await financialModelAPI.FinancialModelAPI.getModelVariables(modelId);
      setModelVariables(modelVars);
    } catch (error) {
      message.error('加载模型变量失败');
      setModelVariables([]);
    }
  };

  // 选择实例
  const handleSelectInstance = async (instance: financialModelInstanceAPI.FinancialModelInstance) => {
    setSelectedInstance(instance);
    await loadInstanceVariables(instance.id);
  };

  // 创建变量实例弹窗逻辑修正
  const handleCreateVariableInstance = async () => {
    if (!selectedInstance) {
      message.warning('请先选择一个模型实例');
      return;
    }
    // 加载模型变量
    const modelVars = await financialModelAPI.FinancialModelAPI.getModelVariables(selectedInstance.modelId);
    setModelVariables(modelVars);
    setCreateModalVisible(true);
    // 等待弹窗渲染和modelVariables加载
    setTimeout(() => {
      variableForm.resetFields();
      // 生成所有类型的默认值
      const defaultValues: any = {};
      
      console.log('=== 开始处理默认值 ===');
      console.log('modelVars:', modelVars);
      
      modelVars.forEach(variable => {
        console.log(`处理变量: ${variable.variableCode}, 类型: ${variable.variableType}, 默认值: ${variable.defaultValue}, 类型: ${typeof variable.defaultValue}`);
        
        if (variable.defaultValue !== undefined && variable.defaultValue !== null && variable.defaultValue !== '') {
          console.log(`设置默认值: ${variable.variableCode} = ${variable.defaultValue}`);
          
          switch (variable.dataType) {
            case 'NUMBER':
            case 'DECIMAL':
            case 'PERCENTAGE':
            case 'CURRENCY':
              const numValue = parseFloat(variable.defaultValue) || 0;
              defaultValues[variable.variableCode] = numValue;
              console.log(`数字转换: ${variable.variableCode} = ${numValue}`);
              break;
            case 'BOOLEAN':
              const boolValue = String(variable.defaultValue) === 'true' || String(variable.defaultValue) === '1' || variable.defaultValue === true || variable.defaultValue === 1;
              defaultValues[variable.variableCode] = boolValue;
              console.log(`布尔转换: ${variable.variableCode} = ${boolValue}`);
              break;
            default:
              defaultValues[variable.variableCode] = variable.defaultValue;
              console.log(`字符串保持: ${variable.variableCode} = ${variable.defaultValue}`);
          }
        } else {
          console.log(`跳过变量: ${variable.variableCode} (无默认值)`);
        }
      });
      
      console.log('=== 默认值处理结果 ===');
      console.log('defaultValues:', defaultValues);
      
      // 计算CALC类型变量
      const finalValues = handleCalculateVariablesWithData(defaultValues, modelVars);
      console.log('=== 最终值 ===');
      console.log('finalValues:', finalValues);
      
      // 设置表单值
      variableForm.setFieldsValue(finalValues);
      
      // 验证设置是否成功
      setTimeout(() => {
        const currentValues = variableForm.getFieldsValue();
        console.log('=== 表单当前值 ===');
        console.log('currentValues:', currentValues);
        
        // 检查关键字段
        ['gross_profit', 'group_reserve_ratio', 'team_reserve_ratio'].forEach(fieldName => {
          const fieldValue = variableForm.getFieldValue(fieldName);
          console.log(`字段 ${fieldName}: 期望=${finalValues[fieldName]}, 实际=${fieldValue}`);
        });
      }, 100);
    }, 200);
  };

  // 保存变量实例
  const handleSaveVariableInstance = async (values: any) => {
    setCreateLoading(true);
    try {
      // 只保存CALC_FACTORS类型的变量值
      const variableData = {
        instanceId: selectedInstance!.id,
        variables: modelVariables
          .filter(variable => variable.variableType === 'CALC_FACTORS') // 只保存CALC_FACTORS类型
          .map(variable => ({
            instanceId: selectedInstance!.id,
            variableId: variable.id,
            variableValue: values[variable.variableCode] || variable.defaultValue || '',
          }))
      };
      
      console.log('Saving CALC_FACTORS variables:', variableData);
      
      await financialModelInstanceAPI.FinancialModelInstanceAPI.createInstanceVariables(variableData);
      message.success('变量实例创建成功');
      setCreateModalVisible(false);
      await loadInstanceVariables(selectedInstance!.id);
    } catch (error) {
      message.error('创建变量实例失败');
    } finally {
      setCreateLoading(false);
    }
  };

  // 保存变量
  const handleSaveVariables = () => {
    message.info('保存变量功能开发中...');
  };

  // 计算表达式函数
  const calculateFormula = (formula: string, variableValues: any): number => {
    try {
      // 创建一个安全的计算环境
      const context = { ...variableValues };
      
      // 处理包含赋值语句的表达式（提取等号右边的计算部分）
      let processedFormula = formula.trim();
      let targetVariable = '';
      
      // 如果包含等号，提取等号右边的部分作为计算表达式，左边作为目标变量
      if (processedFormula.includes('=')) {
        const parts = processedFormula.split('=');
        if (parts.length >= 2) {
          targetVariable = parts[0].trim(); // 等号左边是目标变量
          processedFormula = parts[1].trim(); // 等号右边是计算表达式
        }
      }
      
      console.log('Original formula:', formula);
      console.log('Target variable:', targetVariable);
      console.log('Calculation expression:', processedFormula);
      
      // 替换变量编码为实际值
      Object.keys(context).forEach(varCode => {
        const value = context[varCode];
        // 确保数值类型，如果值为undefined或null，使用0
        const numValue = (value !== undefined && value !== null) ? (typeof value === 'number' ? value : parseFloat(value) || 0) : 0;
        processedFormula = processedFormula.replace(new RegExp(varCode, 'g'), numValue.toString());
      });
      
      // 检查是否还有未替换的变量（以字母开头的标识符）
      const remainingVars = processedFormula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
      if (remainingVars) {
        // 将未定义的变量替换为0
        remainingVars.forEach(varName => {
          // 跳过数学函数和常量
          const mathFunctions = ['Math', 'sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs', 'floor', 'ceil', 'round'];
          const constants = ['PI', 'E'];
          if (!mathFunctions.includes(varName) && !constants.includes(varName)) {
            processedFormula = processedFormula.replace(new RegExp('\\b' + varName + '\\b', 'g'), '0');
          }
        });
      }
      
      console.log('Processed formula:', processedFormula);
      
      // 使用Function构造函数创建安全的计算函数
      const calculateFunction = new Function('return ' + processedFormula);
      const result = calculateFunction();
      
      // 确保返回有效的数字
      const finalResult = (typeof result === 'number' && !isNaN(result)) ? result : 0;
      console.log('Formula result:', formula, '=', finalResult);
      
      return finalResult;
    } catch (error) {
      console.error('计算表达式错误:', error, 'Formula:', formula, 'Values:', variableValues);
      return 0;
    }
  };

  // 处理计算类型变量的自动计算（使用传入的变量数据）
  const handleCalculateVariablesWithData = (inputValues: any, variables: ModelVariable[]): any => {
    // 先清洗所有数值类型字段
    const cleanedValues: any = { ...inputValues };
    variables.forEach(variable => {
      if ([
        'NUMBER', 'DECIMAL', 'CURRENCY', 'PERCENTAGE'
      ].includes(variable.dataType)) {
        const raw = cleanedValues[variable.variableCode];
        cleanedValues[variable.variableCode] =
          raw === undefined || raw === null
            ? 0
            : typeof raw === 'number'
            ? raw
            : parseFloat(String(raw).replace(/,/g, '')) || 0;
      }
    });
    // 后续用 cleanedValues 参与计算
    const calculatedValues = { ...cleanedValues };
    // 按依赖关系排序计算变量
    const calcVariables = variables.filter(v => v.variableType === 'CALC');
    calcVariables.forEach(variable => {
      if (variable.calculationFormula) {
        console.log(`Calculating ${variable.variableCode} using calculation_formula: ${variable.calculationFormula}`);
        const calculatedValue = calculateFormula(variable.calculationFormula, calculatedValues);
        calculatedValues[variable.variableCode] = calculatedValue;
        console.log(`Calculated value for ${variable.variableCode}: ${calculatedValue}`);
      }
    });
    return calculatedValues;
  };

  const handleCalculateVariables = (inputValues: any): any => {
    // 先清洗所有数值类型字段
    const cleanedValues: any = { ...inputValues };
    modelVariables.forEach(variable => {
      if ([
        'NUMBER', 'DECIMAL', 'CURRENCY', 'PERCENTAGE'
      ].includes(variable.dataType)) {
        const raw = cleanedValues[variable.variableCode];
        cleanedValues[variable.variableCode] =
          raw === undefined || raw === null
            ? 0
            : typeof raw === 'number'
            ? raw
            : parseFloat(String(raw).replace(/,/g, '')) || 0;
      }
    });
    // 后续用 cleanedValues 参与计算
    const calculatedValues = { ...cleanedValues };
    const calcVariables = modelVariables.filter(v => v.variableType === 'CALC');
    calcVariables.forEach(variable => {
      if (variable.calculationFormula) {
        console.log(`Calculating ${variable.variableCode} using calculation_formula: ${variable.calculationFormula}`);
        const calculatedValue = calculateFormula(variable.calculationFormula, calculatedValues);
        calculatedValues[variable.variableCode] = calculatedValue;
        console.log(`Calculated value for ${variable.variableCode}: ${calculatedValue}`);
      }
    });
    return calculatedValues;
  };

  // 处理表单值变化，实时计算
  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    console.log('=== handleFormValuesChange 触发 ===');
    console.log('changedValues:', changedValues);
    console.log('allValues:', allValues);
    
    // 只要有INPUT、API、CALC_FACTORS类型变量变化就触发
    const inputVariables = modelVariables.filter(v => v.variableType === 'INPUT' || v.variableType === 'API' || v.variableType === 'CALC_FACTORS');
    const hasInputChange = Object.keys(changedValues).some(key => 
      inputVariables.some(v => v.variableCode === key)
    );
    
    console.log('inputVariables:', inputVariables.map(v => v.variableCode));
    console.log('hasInputChange:', hasInputChange);
    
    if (hasInputChange) {
      console.log('=== 开始重新计算CALC类型变量 ===');
      // 重新计算所有CALC类型变量
      const calculatedValues = handleCalculateVariables(allValues);
      console.log('calculatedValues:', calculatedValues);
      
      // 只更新CALC类型变量
      const calcUpdates: any = {};
      modelVariables.forEach(variable => {
        if (variable.variableType === 'CALC' && calculatedValues[variable.variableCode] !== undefined) {
          calcUpdates[variable.variableCode] = calculatedValues[variable.variableCode];
          console.log(`准备更新 ${variable.variableCode}: ${calculatedValues[variable.variableCode]}`);
        }
      });
      
      console.log('=== 准备setFieldsValue ===');
      console.log('calcUpdates:', calcUpdates);
      
      if (Object.keys(calcUpdates).length > 0) {
        console.log('执行 setFieldsValue...');
        variableForm.setFieldsValue(calcUpdates);
        
        // 验证更新是否成功
        setTimeout(() => {
          const currentFormValues = variableForm.getFieldsValue();
          console.log('=== setFieldsValue 后的表单值 ===');
          console.log('currentFormValues:', currentFormValues);
          
          // 检查关键CALC字段是否更新
          Object.keys(calcUpdates).forEach(fieldName => {
            const fieldValue = variableForm.getFieldValue(fieldName);
            console.log(`字段 ${fieldName}: 期望=${calcUpdates[fieldName]}, 实际=${fieldValue}`);
          });
        }, 50);
      } else {
        console.log('没有CALC类型变量需要更新');
      }
    }
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      'DRAFT': { color: 'default', text: '草稿' },
      'ACTIVE': { color: 'success', text: '激活' },
      'INACTIVE': { color: 'warning', text: '停用' },
      'ARCHIVED': { color: 'error', text: '归档' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取变量类型标签
  const getVariableTypeTag = (type: string) => {
    const typeMap = {
      'INPUT': { color: 'blue', text: '输入' },
      'CALC': { color: 'green', text: '计算' },
      'CALC_FACTORS': { color: 'purple', text: '计算因子' },
      'API': { color: 'orange', text: 'API' }
    };
    const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取数据类型标签
  const getDataTypeTag = (type: string) => {
    const typeMap = {
      'NUMBER': { color: 'cyan', text: '数字' },
      'DECIMAL': { color: 'blue', text: '小数' },
      'PERCENTAGE': { color: 'orange', text: '百分比' },
      'CURRENCY': { color: 'gold', text: '货币' },
      'BOOLEAN': { color: 'purple', text: '布尔' },
      'STRING': { color: 'green', text: '文本' }
    };
    const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 渲染变量输入组件
  const renderVariableInput = (variable: ModelVariable) => {
    const { dataType, unit, variableType, constraintFormula, calculationFormula } = variable;
    const calculationDisplay = calculationFormula ? `计算表达式: ${calculationFormula}` : '';
    const constraintDisplay = constraintFormula ? `约束表达式: ${constraintFormula}` : '';

    // CALC类型变量：只读，使用Form.Item绑定确保UI更新
    if (variableType === 'CALC') {
      switch (dataType) {
        case 'NUMBER':
        case 'DECIMAL':
        case 'PERCENTAGE':
        case 'CURRENCY':
          return (
            <div>
              <Form.Item name={variable.variableCode} noStyle>
                <InputNumber
                  style={{ width: '100%' }}
                  disabled
                  addonAfter={unit || (dataType === 'PERCENTAGE' ? '%' : dataType === 'CURRENCY' ? '元' : undefined)}
                />
              </Form.Item>
              {calculationDisplay && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{calculationDisplay}</div>
              )}
              {constraintDisplay && (
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{constraintDisplay}</div>
              )}
            </div>
          );
        case 'BOOLEAN':
          return (
            <div>
              <Form.Item name={variable.variableCode} noStyle>
                <Switch
                  disabled
                  checkedChildren="是"
                  unCheckedChildren="否"
                />
              </Form.Item>
              {calculationDisplay && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{calculationDisplay}</div>
              )}
              {constraintDisplay && (
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{constraintDisplay}</div>
              )}
            </div>
          );
        default:
          return (
            <div>
              <Form.Item name={variable.variableCode} noStyle>
                <Input
                  disabled
                  addonAfter={unit}
                />
              </Form.Item>
              {calculationDisplay && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{calculationDisplay}</div>
              )}
              {constraintDisplay && (
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{constraintDisplay}</div>
              )}
            </div>
          );
      }
    }

    // 其他类型变量：可编辑，使用Form.Item绑定
    switch (dataType) {
      case 'NUMBER':
      case 'DECIMAL':
        return (
          <div>
            <Form.Item name={variable.variableCode} noStyle>
              <InputNumber
                style={{ width: '100%' }}
                placeholder={`请输入${variable.variableName}`}
                precision={dataType === 'DECIMAL' ? 2 : 0}
                addonAfter={unit}
              />
            </Form.Item>
            {constraintDisplay && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{constraintDisplay}</div>
            )}
          </div>
        );
      case 'PERCENTAGE':
        return (
          <div>
            <Form.Item name={variable.variableCode} noStyle>
              <InputNumber
                style={{ width: '100%' }}
                placeholder={`请输入${variable.variableName}`}
                precision={2}
                addonAfter="%"
                min={0}
                max={100}
              />
            </Form.Item>
            {constraintDisplay && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{constraintDisplay}</div>
            )}
          </div>
        );
      case 'CURRENCY':
        return (
          <div>
            <Form.Item name={variable.variableCode} noStyle>
              <InputNumber
                style={{ width: '100%' }}
                placeholder={`请输入${variable.variableName}`}
                precision={2}
                addonAfter="元"
                formatter={(value) => {
                  if (value === null || value === undefined || value === '') return '';
                  const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
                  if (isNaN(numValue)) return '';
                  return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                }}
                parser={(value) => {
                  if (!value) return 0;
                  // 移除所有逗号，然后转换为数字
                  const cleanValue = value.replace(/,/g, '');
                  const numValue = parseFloat(cleanValue);
                  return isNaN(numValue) ? 0 : numValue;
                }}
              />
            </Form.Item>
            {constraintDisplay && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{constraintDisplay}</div>
            )}
          </div>
        );
      case 'BOOLEAN':
        return (
          <div>
            <Form.Item name={variable.variableCode} noStyle>
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
              />
            </Form.Item>
            {constraintDisplay && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{constraintDisplay}</div>
            )}
          </div>
        );
      default:
        return (
          <div>
            <Form.Item name={variable.variableCode} noStyle>
              <Input
                placeholder={`请输入${variable.variableName}`}
                addonAfter={unit}
              />
            </Form.Item>
            {constraintDisplay && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{constraintDisplay}</div>
            )}
          </div>
        );
    }
  };

  // 实例列表列定义
  const instanceColumns = [
    {
      title: '实例编码',
      dataIndex: 'instanceCode',
      key: 'instanceCode',
      width: 120,
    },
    {
      title: '实例名称',
      dataIndex: 'instanceName',
      key: 'instanceName',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'instanceStatus',
      key: 'instanceStatus',
      width: 80,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '版本',
      dataIndex: 'instanceVersion',
      key: 'instanceVersion',
      width: 80,
    },
  ];

  // 变量列表列定义
  const variableColumns = [
    {
      title: '变量名称',
      dataIndex: 'variableName',
      key: 'variableName',
      width: 150,
    },
    {
      title: '变量编码',
      dataIndex: 'variableCode',
      key: 'variableCode',
      width: 120,
    },
    {
      title: '变量值',
      dataIndex: 'variableValue',
      key: 'variableValue',
      width: 120,
    },
    {
      title: '计算值',
      dataIndex: 'calculatedValue',
      key: 'calculatedValue',
      width: 120,
    },
    {
      title: '是否已计算',
      dataIndex: 'isCalculated',
      key: 'isCalculated',
      width: 100,
      render: (isCalculated: number) => (
        <Tag color={isCalculated ? 'success' : 'default'}>
          {isCalculated ? '已计算' : '未计算'}
        </Tag>
      ),
    },
  ];

  // 加载数据
  useEffect(() => {
    loadInstances();
  }, []);

  return (
    <div className="model-instance-variable-management">
      <Row gutter={16} style={{ height: 'calc(100vh - 120px)' }}>
        {/* 左侧实例列表 */}
        <Col span={8}>
          <Card 
            title="模型实例列表" 
            extra={
              <Search
                placeholder="搜索实例编码或名称"
                style={{ width: 200 }}
              />
            }
            bodyStyle={{ padding: 0, height: 'calc(100vh - 180px)', overflow: 'auto' }}
          >
            <Table
              columns={instanceColumns}
              dataSource={instances}
              loading={loading}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => handleSelectInstance(record),
                className: selectedInstance?.id === record.id ? 'ant-table-row-selected' : '',
              })}
              size="small"
            />
          </Card>
        </Col>

        {/* 右侧变量管理 */}
        <Col span={16}>
          <Card 
            title={
              <Space>
                <span>实例变量管理</span>
                {selectedInstance && (
                  <Tag color="blue">{selectedInstance.instanceName}</Tag>
                )}
              </Space>
            }
            extra={
              selectedInstance && (
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateVariableInstance}
                  >
                    创建变量实例
                  </Button>
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSaveVariables}
                  >
                    保存所有变量
                  </Button>
                </Space>
              )
            }
            bodyStyle={{ padding: 0, height: 'calc(100vh - 180px)', overflow: 'auto' }}
          >
            {!selectedInstance ? (
              <Empty
                description="请选择左侧的模型实例来管理变量"
                style={{ marginTop: 100 }}
              />
            ) : variablesLoading ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>加载变量中...</div>
              </div>
            ) : variables.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Empty
                  description="该实例暂无变量配置"
                />
                <div style={{ marginTop: 16 }}>
                  <Button type="primary" onClick={handleCreateVariableInstance}>
                    创建变量实例
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ padding: 16 }}>
                <Alert
                  message="变量管理功能"
                  description="这是新的左右分栏变量管理页面，支持实时编辑和批量保存功能。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  columns={variableColumns}
                  dataSource={variables}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 创建变量实例模态框 */}
      <Modal
        title="创建变量实例"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={variableForm}
          layout="vertical"
          onFinish={handleSaveVariableInstance}
          onValuesChange={handleFormValuesChange}
        >
          <Alert
            message="提示"
            description="将为选中的模型实例创建所有模型变量的实例配置。所有变量都可以填写，但只有CALC_FACTORS类型为必填项。保存时只保存CALC_FACTORS类型的变量值。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          {modelVariables.map((variable) => (
            <Form.Item
              key={variable.id}
              label={
                <Space>
                  <span>{variable.variableName}</span>
                  {variable.variableType === 'CALC_FACTORS' && <Text type="danger">*</Text>}
                  {getVariableTypeTag(variable.variableType)}
                  {getDataTypeTag(variable.dataType)}
                </Space>
              }
              name={variable.variableCode}
              rules={variable.variableType === 'CALC_FACTORS' ? [{ required: true, message: `请输入${variable.variableName}` }] : []}
              extra={variable.description}
            >
              {renderVariableInput(variable)}
            </Form.Item>
          ))}
          
          <Divider />
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={createLoading}>
                创建变量实例
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelInstanceVariableManagement; 