import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Descriptions,
  Tooltip,
  Divider,
  Badge,
  Tree,
  Tabs,
  Drawer,
  Alert,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LeftOutlined,
  SettingOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  NodeIndexOutlined,
  LinkOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { ModelVariableAPI, ModelVariable, VariableFormData } from '@/services/modelVariable';
import { FinancialModelAPI } from '@/services/financialModel';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const VariableManagementV2: React.FC = () => {
  // 从URL获取modelId参数
  const urlParams = new URLSearchParams(window.location.search);
  const modelId = urlParams.get('modelId');

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<ModelVariable[]>([]);
  const [variableTree, setVariableTree] = useState<ModelVariable[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVariable, setEditingVariable] = useState<ModelVariable | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [constraintDrawerVisible, setConstraintDrawerVisible] = useState(false);
  const [selectedParentVariable, setSelectedParentVariable] = useState<ModelVariable | null>(null);
  const [constraintFormula, setConstraintFormula] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  
  // 表单
  const [form] = Form.useForm();
  const [constraintForm] = Form.useForm();
  const firstRenderRef = useRef(true);

  // 变量类型选项
  const variableTypeOptions = [
    { label: '输入', value: 'INPUT' },
    { label: '计算', value: 'CALC' },
    { label: 'API', value: 'API' }
  ];

  // 数据类型选项
  const dataTypeOptions = [
    { label: '数字', value: 'NUMBER' },
    { label: '小数', value: 'DECIMAL' },
    { label: '百分比', value: 'PERCENTAGE' },
    { label: '货币', value: 'CURRENCY' },
    { label: '字符串', value: 'STRING' },
    { label: '布尔值', value: 'BOOLEAN' }
  ];

  // 获取类型显示名称
  const getTypeDisplayName = (options: any[], value: string) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // 初始化数据
  useEffect(() => {
    if (firstRenderRef.current && modelId) {
      firstRenderRef.current = false;
      fetchModelInfo();
      fetchVariables();
      fetchVariableTree();
    }
  }, [modelId]);

  // 获取模型信息
  const fetchModelInfo = async () => {
    if (!modelId) return;
    
    try {
      const response = await FinancialModelAPI.getModelById(parseInt(modelId));
      setModelInfo(response);
    } catch (error) {
      console.error('获取模型信息失败:', error);
    }
  };

  // 获取变量列表
  const fetchVariables = async () => {
    if (!modelId) return;

    try {
      setLoading(true);
      const response = await ModelVariableAPI.getVariablesByModelId(parseInt(modelId));
      setVariables(response || []);
    } catch (error) {
      console.error('获取变量列表失败:', error);
      message.error('获取变量列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取变量树形结构
  const fetchVariableTree = async () => {
    if (!modelId) return;

    try {
      const response = await ModelVariableAPI.getVariableTree(parseInt(modelId));
      setVariableTree(response || []);
      // 设置默认展开所有节点
      const allKeys = getAllKeys(response || []);
      setExpandedKeys(allKeys);
    } catch (error) {
      console.error('获取变量树失败:', error);
      // 如果树形API不存在，使用列表数据构建树形结构
      const response = await ModelVariableAPI.getVariablesByModelId(parseInt(modelId));
      const treeData = buildTreeFromList(response || []);
      setVariableTree(treeData);
      // 设置默认展开所有节点
      const allKeys = getAllKeys(treeData);
      setExpandedKeys(allKeys);
    }
  };

  // 获取所有节点的key
  const getAllKeys = (nodes: ModelVariable[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodeList: ModelVariable[]) => {
      nodeList.forEach(node => {
        keys.push(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return keys;
  };

  // 从列表数据构建树形结构
  const buildTreeFromList = (list: ModelVariable[]): ModelVariable[] => {
    const map = new Map<number, ModelVariable>();
    const roots: ModelVariable[] = [];

    // 创建映射
    list.forEach(item => {
      map.set(item.id, { ...item, children: [], level: 0, isLeaf: true, expanded: false });
    });

    // 构建树形结构
    list.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
        parent.isLeaf = false;
        node.level = (parent.level || 0) + 1;
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // 新增变量
  const handleAdd = (parentId?: number) => {
    setEditingVariable(null);
    form.resetFields();
    form.setFieldsValue({
      variableType: 'INPUT',
      dataType: 'NUMBER',
      isRequired: false,
      displayOrder: variables.length + 1,
      parentId: parentId || null
    });
    setModalVisible(true);
  };

  // 编辑变量
  const handleEdit = (record: ModelVariable) => {
    setEditingVariable(record);
    
    form.setFieldsValue({
      variableCode: record.variableCode,
      variableName: record.variableName,
      variableType: record.variableType,
      dataType: record.dataType,
      defaultValue: record.defaultValue,
      minValue: record.minValue,
      maxValue: record.maxValue,
      unit: record.unit,
      description: record.description,
      isRequired: record.isRequired,
      displayOrder: record.displayOrder,
      calculationFormula: record.calculationFormula,
      apiConfig: record.apiConfig,
      parentId: record.parentId,
      constraintFormula: record.constraintFormula
    });
    setModalVisible(true);
  };

  // 保存变量
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      console.log('表单值:', values);

      // 处理apiConfig字段，确保是有效的JSON
      let processedApiConfig = values.apiConfig;
      if (values.variableType === 'API' && values.apiConfig) {
        try {
          JSON.parse(values.apiConfig);
          processedApiConfig = values.apiConfig;
        } catch (error) {
          processedApiConfig = JSON.stringify({ url: values.apiConfig });
        }
      }

      const formData = {
        modelId: parseInt(modelId!),
        variableCode: values.variableCode,
        variableName: values.variableName,
        variableType: values.variableType,
        dataType: values.dataType,
        defaultValue: values.defaultValue,
        minValue: values.minValue,
        maxValue: values.maxValue,
        unit: values.unit,
        description: values.description,
        isRequired: values.isRequired ?? false,
        displayOrder: values.displayOrder ?? 1,
        isVisible: true,
        calculationFormula: values.calculationFormula,
        apiConfig: processedApiConfig,
        parentId: values.parentId,
        constraintFormula: values.constraintFormula
      };

      console.log('传递给后端的数据:', formData);

      let response;
      if (editingVariable) {
        response = await ModelVariableAPI.updateVariable(editingVariable.id, formData);
      } else {
        response = await ModelVariableAPI.createVariable(formData);
      }

      console.log('后端响应:', response);

      message.success(editingVariable ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchVariables();
      fetchVariableTree();

    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除变量
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await ModelVariableAPI.deleteVariable(id);
      message.success('删除成功');
      fetchVariables();
      fetchVariableTree();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 调整显示顺序
  const handleMoveOrder = async (id: number, direction: 'up' | 'down') => {
    try {
      setLoading(true);
      // 找到当前变量和相邻变量
      const currentIndex = variables.findIndex(v => v.id === id);
      if (currentIndex === -1) return;
      
      const currentVariable = variables[currentIndex];
      let targetVariable: ModelVariable | null = null;
      
      if (direction === 'up' && currentIndex > 0) {
        targetVariable = variables[currentIndex - 1];
      } else if (direction === 'down' && currentIndex < variables.length - 1) {
        targetVariable = variables[currentIndex + 1];
      }
      
      if (!targetVariable) {
        message.warning('无法调整顺序');
        return;
      }
      
      // 交换顺序
      const variablesToUpdate = [
        { id: currentVariable.id, displayOrder: targetVariable.displayOrder },
        { id: targetVariable.id, displayOrder: currentVariable.displayOrder }
      ];
      
      const response = await ModelVariableAPI.updateVariableOrder(variablesToUpdate);
      message.success('顺序调整成功');
      fetchVariables();
    } catch (error) {
      console.error('顺序调整失败:', error);
      message.error('顺序调整失败');
    } finally {
      setLoading(false);
    }
  };

  // 移动变量到新的父级
  const handleMoveVariable = async (id: number, newParentId: number | null) => {
    try {
      setLoading(true);
      const response = await ModelVariableAPI.moveVariable(id, newParentId);
      message.success('移动成功');
      fetchVariables();
      fetchVariableTree();
    } catch (error) {
      console.error('移动失败:', error);
      message.error('移动失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开约束条件设置
  const handleOpenConstraint = (variable: ModelVariable) => {
    setSelectedParentVariable(variable);
    setConstraintFormula(variable.constraintFormula || '');
    constraintForm.setFieldsValue({
      constraintFormula: variable.constraintFormula || ''
    });
    setConstraintDrawerVisible(true);
  };

  // 保存约束条件
  const handleSaveConstraint = async () => {
    try {
      const values = await constraintForm.validateFields();
      setLoading(true);

      if (!selectedParentVariable) return;

      // 更新变量的约束条件
      const formData = {
        modelId: parseInt(modelId!),
        variableCode: selectedParentVariable.variableCode,
        variableName: selectedParentVariable.variableName,
        variableType: selectedParentVariable.variableType,
        dataType: selectedParentVariable.dataType,
        defaultValue: selectedParentVariable.defaultValue,
        minValue: selectedParentVariable.minValue,
        maxValue: selectedParentVariable.maxValue,
        unit: selectedParentVariable.unit,
        description: selectedParentVariable.description,
        isRequired: selectedParentVariable.isRequired,
        displayOrder: selectedParentVariable.displayOrder,
        isVisible: selectedParentVariable.isVisible,
        calculationFormula: selectedParentVariable.calculationFormula,
        apiConfig: selectedParentVariable.apiConfig,
        parentId: selectedParentVariable.parentId,
        constraintFormula: values.constraintFormula
      };

      await ModelVariableAPI.updateVariable(selectedParentVariable.id, formData);
      message.success('约束条件保存成功');
      setConstraintDrawerVisible(false);
      fetchVariables();
      fetchVariableTree();

    } catch (error) {
      console.error('保存约束条件失败:', error);
      message.error('保存约束条件失败');
    } finally {
      setLoading(false);
    }
  };

  // 返回模型管理
  const handleBackToModels = () => {
    window.location.href = '/saleops-optimizer/financial-analysis/v2/financial-models';
  };

  // 将变量数据转换为树形组件数据
  const convertToTreeData = (variables: ModelVariable[]): DataNode[] => {
    return variables.map(variable => ({
      key: variable.id,
      title: (
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between', 
          width: '100%',
          padding: '8px 16px',
          borderBottom: '1px solid #f0f0f0',
          borderRadius: '6px',
          backgroundColor: '#fafafa',
          margin: '2px 0',
          minHeight: '45px'
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '16px', paddingLeft: '8px', paddingTop: '2px' }}>
            {/* 变量类型图标 */}
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: variable.variableType === 'INPUT' ? '#e6f7ff' : 
                              variable.variableType === 'CALC' ? '#f6ffed' : '#fff7e6',
              border: `1px solid ${variable.variableType === 'INPUT' ? '#91d5ff' : 
                                  variable.variableType === 'CALC' ? '#b7eb8f' : '#ffd591'}`
            }}>
              {variable.variableType === 'INPUT' ? <NodeIndexOutlined style={{ color: '#1890ff', fontSize: '14px' }} /> : 
               variable.variableType === 'CALC' ? <BranchesOutlined style={{ color: '#52c41a', fontSize: '14px' }} /> : 
               <ApartmentOutlined style={{ color: '#faad14', fontSize: '14px' }} />}
            </div>
            
            {/* 变量信息 */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: '14px', 
                marginBottom: '6px',
                color: '#262626',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{variable.variableName}</span>
                {variable.parentId && (
                  <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>子变量</Tag>
                )}
                {variable.isRequired && (
                  <Tag color="red" style={{ fontSize: '10px', margin: 0 }}>必填</Tag>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#8c8c8c', 
                  fontFamily: 'monospace',
                  backgroundColor: '#f5f5f5',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  display: 'inline-block'
                }}>
                  {variable.variableCode}
                </div>
                <Tag 
                  color={variable.variableType === 'INPUT' ? 'blue' : 
                         variable.variableType === 'CALC' ? 'green' : 'orange'}
                  style={{ margin: 0, fontSize: '9px', padding: '0 4px' }}
                >
                  {getTypeDisplayName(variableTypeOptions, variable.variableType)}
                </Tag>
                <Tag color="default" style={{ margin: 0, fontSize: '9px', padding: '0 4px' }}>
                  {getTypeDisplayName(dataTypeOptions, variable.dataType)}
                </Tag>
                {variable.constraintFormula && (
                  <Tag color="purple" style={{ margin: 0, fontSize: '9px', padding: '0 4px' }}>有约束</Tag>
                )}
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div style={{ 
            display: 'flex', 
            gap: '4px',
            opacity: 0.6,
            transition: 'opacity 0.2s',
            marginLeft: '20px',
            paddingRight: '8px',
            paddingTop: '2px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
          }}
          >
            <Tooltip title="添加子变量">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(variable.id);
                }}
                style={{ 
                  padding: '1px 3px', 
                  minWidth: '22px',
                  height: '22px'
                }}
              />
            </Tooltip>
            <Tooltip title="编辑变量">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(variable);
                }}
                style={{ 
                  padding: '1px 3px', 
                  minWidth: '22px',
                  height: '22px'
                }}
              />
            </Tooltip>
            <Tooltip title="设置约束条件">
              <Button
                type="text"
                size="small"
                icon={<LinkOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConstraint(variable);
                }}
                style={{ 
                  padding: '1px 3px', 
                  minWidth: '22px',
                  height: '22px'
                }}
              />
            </Tooltip>
            <Popconfirm
              title="确定要删除这个变量吗？"
              onConfirm={() => handleDelete(variable.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除变量">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    padding: '1px 3px', 
                    minWidth: '22px',
                    height: '22px'
                  }}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      ),
      children: variable.children ? convertToTreeData(variable.children) : undefined,
      icon: null // 移除默认图标，使用自定义图标
    }));
  };

  // 表格列定义
  const columns: ColumnsType<ModelVariable> = [
    {
      title: '变量信息',
      key: 'variableInfo',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
            {record.variableName}
            {record.parentId && (
              <Tag color="purple" style={{ marginLeft: 8 }}>子变量</Tag>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            编码: <code>{record.variableCode}</code>
          </div>
          <Space>
            <Tag 
              color={record.variableType === 'INPUT' ? 'blue' : 
                     record.variableType === 'CALC' ? 'green' : 'orange'}
            >
              {getTypeDisplayName(variableTypeOptions, record.variableType)}
            </Tag>
            <Tag color="default">{getTypeDisplayName(dataTypeOptions, record.dataType)}</Tag>
          </Space>
        </div>
      ),
    },
    {
      title: '默认值/公式',
      key: 'valueOrFormula',
      width: 200,
      render: (_, record) => (
        <div>
          {record.variableType === 'CALC' ? (
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                公式表达式:
              </div>
              <code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>
                {record.calculationFormula}
              </code>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                默认值: <strong>{record.defaultValue}</strong>
                {record.unit && <span> {record.unit}</span>}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '约束条件',
      key: 'constraint',
      width: 150,
      render: (_, record) => (
        <div>
          {record.constraintFormula ? (
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                约束公式:
              </div>
              <code style={{ fontSize: '11px', background: '#f0f8ff', padding: '2px 4px', borderRadius: '2px' }}>
                {record.constraintFormula}
              </code>
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: '#999' }}>无约束</span>
          )}
        </div>
      ),
    },
    {
      title: '取值范围',
      key: 'valueRange',
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {record.minValue !== null || record.maxValue !== null ? (
            <div>
              {record.minValue !== null && `最小: ${record.minValue}`}
              {record.minValue !== null && record.maxValue !== null && <br />}
              {record.maxValue !== null && `最大: ${record.maxValue}`}
            </div>
          ) : (
            <span>无限制</span>
          )}
        </div>
      ),
    },
    {
      title: '配置',
      key: 'config',
      width: 100,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            顺序: {record.displayOrder}
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            <Badge
              status={record.isRequired ? 'error' : 'default'}
              text={record.isRequired ? '必填' : '可选'}
            />
          </div>
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 150,
      ellipsis: true,
      render: (description) => description || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="添加子变量">
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleAdd(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="设置约束条件">
            <Button
              type="link"
              size="small"
              icon={<LinkOutlined />}
              onClick={() => handleOpenConstraint(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个变量吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!modelId) {
    return (
      <div className="variable-management-v2">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h3 style={{ color: '#ff4d4f' }}>缺少模型ID参数</h3>
            <p style={{ color: '#666' }}>请从财务模型管理页面进入变量管理</p>
            <Button type="primary" onClick={handleBackToModels}>
              返回模型管理
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="variable-management-v2">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>变量管理 V2</Title>
            <Text type="secondary">
              管理财务模型的输入变量、计算变量和API变量配置，支持树形结构和约束条件
            </Text>
          </div>
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={handleBackToModels}
            >
              返回模型管理
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAdd()}
            >
              新增变量
            </Button>
          </Space>
        </div>

        <Divider />

        {/* 模型信息 */}
        {modelInfo && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions size="small" column={3} bordered>
              <Descriptions.Item label="模型名称">{modelInfo.modelName}</Descriptions.Item>
              <Descriptions.Item label="模型编码">{modelInfo.modelCode}</Descriptions.Item>
              <Descriptions.Item label="分类">{modelInfo.modelCategory}</Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {/* 统计信息 */}
        <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
          <Space size="large">
            <span><SettingOutlined /> 变量总数: <strong>{variables.length}</strong></span>
            <span style={{ color: '#1890ff' }}>输入变量: <strong>{variables.filter(v => v.variableType === 'INPUT').length}</strong></span>
            <span style={{ color: '#52c41a' }}>计算变量: <strong>{variables.filter(v => v.variableType === 'CALC').length}</strong></span>
            <span style={{ color: '#faad14' }}>API变量: <strong>{variables.filter(v => v.variableType === 'API').length}</strong></span>
            <span style={{ color: '#722ed1' }}>树形变量: <strong>{variables.filter(v => v.parentId).length}</strong></span>
          </Space>
        </div>

        {/* 展示模式切换 */}
        <Tabs 
          activeKey={viewMode} 
          onChange={(key) => setViewMode(key as 'list' | 'tree')}
          style={{ marginBottom: 16 }}
        >
          <TabPane tab="列表展示" key="list">
            <Table<ModelVariable>
              columns={columns}
              dataSource={variables}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          <TabPane tab="树形展示" key="tree">
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#fafafa', 
              borderRadius: '8px', 
              minHeight: '400px',
              border: '1px solid #e8e8e8'
            }}>
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px 16px', 
                backgroundColor: '#f0f8ff', 
                borderRadius: '6px',
                border: '1px solid #d6e4ff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">
                    <BranchesOutlined style={{ marginRight: '8px' }} />
                    树形结构展示变量之间的父子关系，支持多层级嵌套和约束条件管理
                  </Text>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
                      <span>总变量: <strong>{variables.length}</strong></span>
                      <span>根变量: <strong>{variableTree.length}</strong></span>
                      <span>子变量: <strong>{variables.filter(v => v.parentId).length}</strong></span>
                      <span>有约束: <strong>{variables.filter(v => v.constraintFormula).length}</strong></span>
                    </div>
                    <Space size="small">
                      <Button
                        size="small"
                        onClick={() => {
                          const allKeys = getAllKeys(variableTree);
                          setExpandedKeys(allKeys);
                          setAutoExpandParent(true);
                        }}
                      >
                        展开全部
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setExpandedKeys([]);
                          setAutoExpandParent(false);
                        }}
                      >
                        折叠全部
                      </Button>
                    </Space>
                  </div>
                </div>
              </div>
              {loading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}>
                    <BranchesOutlined spin />
                  </div>
                  <div style={{ fontSize: '16px', color: '#8c8c8c' }}>
                    正在加载变量数据...
                  </div>
                </div>
              ) : variableTree.length > 0 ? (
                <Tree
                  showLine={{ showLeafIcon: false }}
                  showIcon={false}
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  onExpand={(keys) => {
                    setExpandedKeys(keys);
                    setAutoExpandParent(false);
                  }}
                  treeData={convertToTreeData(variableTree)}
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '20px 40px', 
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                  className="variable-tree"
                />
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}>
                    <BranchesOutlined />
                  </div>
                  <div style={{ fontSize: '16px', color: '#8c8c8c', marginBottom: '8px' }}>
                    暂无变量数据
                  </div>
                  <div style={{ fontSize: '14px', color: '#bfbfbf', marginBottom: '24px' }}>
                    点击"新增变量"按钮开始创建您的第一个变量
                  </div>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAdd()}
                  >
                    新增变量
                  </Button>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingVariable ? '编辑变量' : '新增变量'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="variableCode"
                label="变量编码"
                rules={[
                  { required: true, message: '请输入变量编码' },
                  { pattern: /^[a-z0-9_]+$/, message: '编码只能包含小写字母、数字和下划线' }
                ]}
              >
                <Input placeholder="请输入变量编码，如：fixed_cost" disabled={!!editingVariable} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="variableName"
                label="变量名称"
                rules={[{ required: true, message: '请输入变量名称' }]}
              >
                <Input placeholder="请输入变量名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="variableType"
                label="变量类型"
                rules={[{ required: true, message: '请选择变量类型' }]}
              >
                <Select placeholder="请选择变量类型">
                  {variableTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dataType"
                label="数据类型"
                rules={[{ required: true, message: '请选择数据类型' }]}
              >
                <Select placeholder="请选择数据类型">
                  {dataTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="defaultValue"
                label="默认值"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入默认值"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单位"
              >
                <Input placeholder="如：元、%、件" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="displayOrder"
                label="显示顺序"
                rules={[{ required: true, message: '请输入显示顺序' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="显示顺序"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minValue"
                label="最小值"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="最小值限制"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxValue"
                label="最大值"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="最大值限制"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 父级变量选择 */}
          <Form.Item
            name="parentId"
            label="父级变量"
          >
            <Select
              placeholder="选择父级变量（可选）"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {variables
                .filter(v => v.id !== editingVariable?.id) // 排除自己
                .map(variable => (
                  <Option key={variable.id} value={variable.id}>
                    {variable.variableName} ({variable.variableCode})
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {/* 根据变量类型显示不同的字段 */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.variableType !== currentValues.variableType
            }
          >
            {({ getFieldValue }) => {
              const variableType = getFieldValue('variableType');
              
              if (variableType === 'CALC') {
                return (
                  <Form.Item
                    label="公式表达式"
                    name="calculationFormula"
                    rules={[{ required: true, message: '请输入公式表达式' }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="请输入公式表达式，如: revenue - (fixed_cost + salary + social_insurance)"
                    />
                  </Form.Item>
                );
              } else if (variableType === 'API') {
                return (
                  <Form.Item
                    label="API配置"
                    name="apiConfig"
                    rules={[{ required: true, message: '请输入API配置' }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="请输入API配置JSON，如：{&quot;url&quot;: &quot;https://api.example.com/data&quot;}"
                    />
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>

          {/* 约束条件公式 */}
          <Form.Item
            name="constraintFormula"
            label="约束条件公式"
          >
            <TextArea
              rows={2}
              placeholder="请输入约束条件公式，如: child1 + child2 = parent_value"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              rows={3}
              placeholder="请输入变量的详细描述..."
            />
          </Form.Item>

          <Form.Item
            name="isRequired"
            valuePropName="checked"
          >
            <Space>
              <Switch />
              <span>必填项</span>
            </Space>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingVariable ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 约束条件设置抽屉 */}
      <Drawer
        title="设置约束条件"
        placement="right"
        width={600}
        open={constraintDrawerVisible}
        onClose={() => setConstraintDrawerVisible(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setConstraintDrawerVisible(false)}>
                取消
              </Button>
              <Button type="primary" onClick={handleSaveConstraint} loading={loading}>
                保存约束条件
              </Button>
            </Space>
          </div>
        }
      >
        {selectedParentVariable && (
          <div>
            <Alert
              message="约束条件说明"
              description="约束条件用于定义子变量与父变量之间的关系。例如：子变量1 + 子变量2 = 父变量值"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions title="父变量信息" bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="变量名称">{selectedParentVariable.variableName}</Descriptions.Item>
              <Descriptions.Item label="变量编码">{selectedParentVariable.variableCode}</Descriptions.Item>
              <Descriptions.Item label="数据类型">{getTypeDisplayName(dataTypeOptions, selectedParentVariable.dataType)}</Descriptions.Item>
              <Descriptions.Item label="默认值">{selectedParentVariable.defaultValue} {selectedParentVariable.unit}</Descriptions.Item>
            </Descriptions>

            <Form
              form={constraintForm}
              layout="vertical"
            >
              <Form.Item
                name="constraintFormula"
                label="约束条件公式"
                rules={[{ required: true, message: '请输入约束条件公式' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请输入约束条件公式，例如：
1. 百分比约束：group_ratio + team_ratio = 100
2. 金额约束：group_amount + team_amount + surplus = gross_profit
3. 复杂约束：dept_ratio + employee_ratio = 100 AND dept_amount = team_amount * dept_ratio / 100"
                />
              </Form.Item>
            </Form>

            <Divider />

            <div>
              <Title level={5}>约束条件示例：</Title>
              <ul>
                <li><Text code>group_ratio + team_ratio = 100</Text> - 百分比之和等于100%</li>
                <li><Text code>group_amount + team_amount + surplus = gross_profit</Text> - 金额分配等于毛利润</li>
                <li><Text code>dept_ratio + employee_ratio = 100</Text> - 部门和个人比例之和等于100%</li>
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default VariableManagementV2;

// 添加自定义样式
const styles = `
  .variable-tree .ant-tree-node-content-wrapper {
    padding: 6px 0 !important;
    border-radius: 6px !important;
    transition: all 0.2s ease !important;
    min-height: 45px !important;
    margin-left: 8px !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-node-content-wrapper {
    margin-left: 32px !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-node-content-wrapper {
    margin-left: 48px !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode .ant-tree-node-content-wrapper {
    margin-left: 64px !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode .ant-tree-node-content-wrapper {
    margin-left: 80px !important;
  }
  
  .variable-tree .ant-tree-node-content-wrapper:hover {
    background-color: #f8f9fa !important;
  }
  
  .variable-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background-color: #e6f7ff !important;
  }
  
  .variable-tree .ant-tree-treenode {
    margin-bottom: 8px !important;
    padding: 4px 0 !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode {
    margin-left: 48px !important;
    border-left: 4px solid #f0f0f0 !important;
    padding-left: 32px !important;
    position: relative !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode {
    margin-left: 64px !important;
    border-left: 4px solid #e6f7ff !important;
    padding-left: 40px !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode {
    margin-left: 80px !important;
    border-left: 4px solid #f6ffed !important;
    padding-left: 48px !important;
  }
  
  .variable-tree .ant-tree-treenode:last-child {
    margin-bottom: 0 !important;
  }
  
  .variable-tree .ant-tree-switcher {
    margin-right: 16px !important;
    margin-top: 12px !important;
  }
  
  .variable-tree .ant-tree-line .ant-tree-switcher {
    background: transparent !important;
  }
  
  .variable-tree .ant-tree-line .ant-tree-switcher-leaf {
    display: none !important;
  }
  
  /* 优化树形线条显示 */
  .variable-tree .ant-tree-line .ant-tree-switcher::before {
    content: '' !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    width: 12px !important;
    height: 2px !important;
    background-color: #d9d9d9 !important;
    transform: translate(-50%, -50%) !important;
  }
  
  .variable-tree .ant-tree-line .ant-tree-switcher::after {
    content: '' !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    width: 2px !important;
    height: 12px !important;
    background-color: #d9d9d9 !important;
    transform: translate(-50%, -50%) !important;
  }
  
  .variable-tree .ant-tree-line .ant-tree-treenode-switcher-close .ant-tree-switcher::after {
    display: none !important;
  }
  
  .variable-tree .ant-tree-indent {
    margin-right: 12px !important;
  }
  
  .variable-tree .ant-tree-indent-unit {
    width: 64px !important;
  }
  
  .variable-tree .ant-tree-treenode-switcher-close .ant-tree-switcher,
  .variable-tree .ant-tree-treenode-switcher-open .ant-tree-switcher {
    color: #1890ff !important;
  }
  
  /* 增加层次间的视觉分隔 */
  .variable-tree .ant-tree-treenode:not(:last-child) {
    border-bottom: 1px solid #f5f5f5 !important;
    margin-bottom: 8px !important;
    padding-bottom: 8px !important;
  }
  
  /* 子节点缩进效果 */
  .variable-tree .ant-tree-treenode .ant-tree-treenode {
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.06) 0%, transparent 100%) !important;
    border-radius: 0 8px 8px 0 !important;
    position: relative !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode::before {
    content: '' !important;
    position: absolute !important;
    left: -4px !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 4px !important;
    background: linear-gradient(180deg, #1890ff 0%, #40a9ff 100%) !important;
    border-radius: 2px !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode {
    background: linear-gradient(90deg, rgba(82, 196, 26, 0.06) 0%, transparent 100%) !important;
    border-radius: 0 8px 8px 0 !important;
    position: relative !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode::before {
    content: '' !important;
    position: absolute !important;
    left: -4px !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 4px !important;
    background: linear-gradient(180deg, #52c41a 0%, #73d13d 100%) !important;
    border-radius: 2px !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode {
    background: linear-gradient(90deg, rgba(250, 173, 20, 0.06) 0%, transparent 100%) !important;
    border-radius: 0 8px 8px 0 !important;
    position: relative !important;
  }
  
  .variable-tree .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode .ant-tree-treenode::before {
    content: '' !important;
    position: absolute !important;
    left: -4px !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 4px !important;
    background: linear-gradient(180deg, #faad14 0%, #ffc53d 100%) !important;
    border-radius: 2px !important;
  }
  
  /* 悬停效果增强 */
  .variable-tree .ant-tree-node-content-wrapper:hover {
    background-color: #f8f9fa !important;
    transform: translateX(6px) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    border-left: 3px solid #1890ff !important;
  }
  
  /* 选中状态 */
  .variable-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background-color: #e6f7ff !important;
    border-left: 3px solid #1890ff !important;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2) !important;
  }
`;

// 动态注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
} 