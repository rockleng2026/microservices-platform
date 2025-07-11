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
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LeftOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ModelVariableAPI, ModelVariable, VariableFormData } from '@/services/modelVariable';
import { FinancialModelAPI } from '@/services/financialModel';

const { Option } = Select;
const { TextArea } = Input;

const VariableManagementV2: React.FC = () => {
  // 从URL获取modelId参数
  const urlParams = new URLSearchParams(window.location.search);
  const modelId = urlParams.get('modelId');

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<ModelVariable[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVariable, setEditingVariable] = useState<ModelVariable | null>(null);
  
  // 表单
  const [form] = Form.useForm();
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
    }
  }, [modelId]);

  // 获取模型信息
  const fetchModelInfo = async () => {
    if (!modelId) return;
    
    try {
      const response = await FinancialModelAPI.getModelById(parseInt(modelId));
      // 直接使用response，API已经处理了错误情况
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
      
      // 直接使用response，API已经处理了错误情况
      setVariables(response || []);
    } catch (error) {
      console.error('获取变量列表失败:', error);
      message.error('获取变量列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 新增变量
  const handleAdd = () => {
    setEditingVariable(null);
    form.resetFields();
    form.setFieldsValue({
      variableType: 'INPUT',
      dataType: 'NUMBER',
      isRequired: false,
      displayOrder: variables.length + 1
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
      calculationFormula: record.calculationFormula, // 直接使用后端字段名
      apiConfig: record.apiConfig // 直接使用后端字段名
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
          // 检查是否已经是有效的JSON
          JSON.parse(values.apiConfig);
          // 如果是有效JSON，直接使用
          processedApiConfig = values.apiConfig;
        } catch (error) {
          // 如果不是有效JSON，包装为{url: "用户输入的值"}格式
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
        apiConfig: processedApiConfig
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
      
      // 直接使用response，API已经处理了错误情况
      message.success('删除成功');
      fetchVariables();
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
      const response = await ModelVariableAPI.updateVariableOrder(id, direction);
      
      // 直接使用response，API已经处理了错误情况
      message.success('顺序调整成功');
      fetchVariables();
    } catch (error) {
      console.error('顺序调整失败:', error);
      message.error('顺序调整失败');
    } finally {
      setLoading(false);
    }
  };

  // 返回模型管理
  const handleBackToModels = () => {
    window.location.href = '/saleops-optimizer/financial-analysis/v2/financial-models';
  };

  // 表格列定义 - 参考V1版本的优雅设计
  const columns: ColumnsType<ModelVariable> = [
    {
      title: '变量信息',
      key: 'variableInfo',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
            {record.variableName}
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
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
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
            <h2 style={{ margin: 0, marginBottom: 8 }}>变量管理 V2</h2>
            <span style={{ color: '#666', fontSize: '14px' }}>
              管理财务模型的输入变量、计算变量和API变量配置
            </span>
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
              onClick={handleAdd}
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
          </Space>
        </div>

        {/* 数据表格 */}
        <Table<ModelVariable>
          columns={columns}
          dataSource={variables}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingVariable ? '编辑变量' : '新增变量'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
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
    </div>
  );
};

export default VariableManagementV2; 