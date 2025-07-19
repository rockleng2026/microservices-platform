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
  variableType: 'INPUT' | 'CALC' | 'API';
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

  // 创建变量实例
  const handleCreateVariableInstance = async () => {
    if (!selectedInstance) {
      message.warning('请先选择一个模型实例');
      return;
    }
    
    // 加载模型变量
    await loadModelVariables(selectedInstance.modelId);
    
    // 重置表单
    variableForm.resetFields();
    
    // 设置默认值 - 只为输入类型的变量设置默认值
    const defaultValues: any = {};
    modelVariables.forEach(variable => {
      if (variable.variableType === 'INPUT' && variable.defaultValue) {
        // 根据数据类型转换默认值
        let convertedValue: any = variable.defaultValue;
        
        switch (variable.dataType) {
          case 'NUMBER':
          case 'DECIMAL':
            convertedValue = parseFloat(variable.defaultValue) || 0;
            break;
          case 'PERCENTAGE':
            convertedValue = parseFloat(variable.defaultValue) || 0;
            break;
          case 'CURRENCY':
            convertedValue = parseFloat(variable.defaultValue) || 0;
            break;
          case 'BOOLEAN':
            convertedValue = variable.defaultValue.toLowerCase() === 'true' || variable.defaultValue === '1';
            break;
          default:
            convertedValue = variable.defaultValue;
        }
        
        defaultValues[variable.variableCode] = convertedValue;
      }
    });
    
    // 处理计算类型变量的自动计算
    const finalValues = handleCalculateVariables(defaultValues);
    variableForm.setFieldsValue(finalValues);
    
    setCreateModalVisible(true);
  };

  // 保存变量实例
  const handleSaveVariableInstance = async (values: any) => {
    setCreateLoading(true);
    try {
      const variableData = {
        instanceId: selectedInstance!.id,
        variables: modelVariables.map(variable => ({
          instanceId: selectedInstance!.id,
          variableId: variable.id,
          variableValue: values[variable.variableCode] || variable.defaultValue || '',
        }))
      };
      
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
      
      // 替换变量编码为实际值
      let processedFormula = formula;
      Object.keys(context).forEach(varCode => {
        const value = context[varCode];
        // 确保数值类型
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        processedFormula = processedFormula.replace(new RegExp(varCode, 'g'), numValue.toString());
      });
      
      // 使用Function构造函数创建安全的计算函数
      const calculateFunction = new Function('return ' + processedFormula);
      const result = calculateFunction();
      
      return typeof result === 'number' ? result : parseFloat(result) || 0;
    } catch (error) {
      console.error('计算表达式错误:', error);
      return 0;
    }
  };

  // 处理计算类型变量的自动计算
  const handleCalculateVariables = (inputValues: any): any => {
    const calculatedValues = { ...inputValues };
    
    // 按依赖关系排序计算变量
    const calcVariables = modelVariables.filter(v => v.variableType === 'CALC');
    
    // 简单的依赖排序（这里可以根据实际需求优化）
    calcVariables.forEach(variable => {
      if (variable.constraintFormula || variable.calculationFormula) {
        const formula = variable.constraintFormula || variable.calculationFormula;
        if (formula) {
          const calculatedValue = calculateFormula(formula, calculatedValues);
          calculatedValues[variable.variableCode] = calculatedValue;
        }
      }
    });
    
    return calculatedValues;
  };

  // 处理表单值变化，实时计算
  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    // 只处理输入类型变量的变化
    const inputVariables = modelVariables.filter(v => v.variableType === 'INPUT');
    const hasInputChange = Object.keys(changedValues).some(key => 
      inputVariables.some(v => v.variableCode === key)
    );
    
    if (hasInputChange) {
      // 重新计算计算类型变量
      const calculatedValues = handleCalculateVariables(allValues);
      
      // 只更新计算类型变量的值
      const calcUpdates: any = {};
      modelVariables.forEach(variable => {
        if (variable.variableType === 'CALC' && calculatedValues[variable.variableCode] !== undefined) {
          calcUpdates[variable.variableCode] = calculatedValues[variable.variableCode];
        }
      });
      
      // 批量更新表单值
      if (Object.keys(calcUpdates).length > 0) {
        variableForm.setFieldsValue(calcUpdates);
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
      'API': { color: 'purple', text: 'API' }
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
    const { dataType, unit, isRequired, defaultValue, variableType, constraintFormula, calculationFormula } = variable;
    
    // 如果是计算类型，显示只读的计算结果
    if (variableType === 'CALC') {
      const formula = constraintFormula || calculationFormula;
      const formulaDisplay = formula ? `公式: ${formula}` : '无计算公式';
      
      switch (dataType) {
        case 'NUMBER':
        case 'DECIMAL':
          return (
            <div>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="计算结果"
                precision={dataType === 'DECIMAL' ? 2 : 0}
                addonAfter={unit}
                readOnly
                disabled
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {formulaDisplay}
              </div>
            </div>
          );
        case 'PERCENTAGE':
          return (
            <div>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="计算结果"
                precision={2}
                addonAfter="%"
                readOnly
                disabled
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {formulaDisplay}
              </div>
            </div>
          );
        case 'CURRENCY':
          return (
            <div>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="计算结果"
                precision={2}
                addonAfter="元"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                readOnly
                disabled
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {formulaDisplay}
              </div>
            </div>
          );
        case 'BOOLEAN':
          return (
            <div>
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                disabled
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {formulaDisplay}
              </div>
            </div>
          );
        default:
          return (
            <div>
              <Input
                placeholder="计算结果"
                addonAfter={unit}
                readOnly
                disabled
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {formulaDisplay}
              </div>
            </div>
          );
      }
    }
    
    // 输入类型的变量处理（保持原有逻辑）
    const getConvertedDefaultValue = () => {
      if (!defaultValue) return undefined;
      
      switch (dataType) {
        case 'NUMBER':
        case 'DECIMAL':
          return parseFloat(defaultValue) || 0;
        case 'PERCENTAGE':
          return parseFloat(defaultValue) || 0;
        case 'CURRENCY':
          return parseFloat(defaultValue) || 0;
        case 'BOOLEAN':
          return defaultValue.toLowerCase() === 'true' || defaultValue === '1';
        default:
          return defaultValue;
      }
    };
    
    const convertedDefaultValue = getConvertedDefaultValue();
    
    switch (dataType) {
      case 'NUMBER':
      case 'DECIMAL':
        return (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={`请输入${variable.variableName}`}
            precision={dataType === 'DECIMAL' ? 2 : 0}
            addonAfter={unit}
            defaultValue={convertedDefaultValue}
          />
        );
      case 'PERCENTAGE':
        return (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={`请输入${variable.variableName}`}
            precision={2}
            addonAfter="%"
            min={0}
            max={100}
            defaultValue={convertedDefaultValue}
          />
        );
      case 'CURRENCY':
        return (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={`请输入${variable.variableName}`}
            precision={2}
            addonAfter="元"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            defaultValue={convertedDefaultValue}
          />
        );
      case 'BOOLEAN':
        return (
          <Switch
            checkedChildren="是"
            unCheckedChildren="否"
            defaultChecked={convertedDefaultValue}
          />
        );
      default:
        return (
          <Input
            placeholder={`请输入${variable.variableName}`}
            addonAfter={unit}
            defaultValue={convertedDefaultValue}
          />
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
            description="将为选中的模型实例创建所有模型变量的实例配置，请填写初始值。"
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
                  {variable.isRequired && <Text type="danger">*</Text>}
                  {getVariableTypeTag(variable.variableType)}
                  {getDataTypeTag(variable.dataType)}
                </Space>
              }
              name={variable.variableCode}
              rules={variable.isRequired ? [{ required: true, message: `请输入${variable.variableName}` }] : []}
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