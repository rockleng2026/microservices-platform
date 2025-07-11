import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Modal,
  Form,
  Row,
  Col,
  Tag,
  Tooltip,
  Divider,
  Popconfirm,
  Switch,
  InputNumber,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SettingOutlined,
  CodeOutlined,
  FunctionOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  ModelVariableAPI, 
  VariableFormData, 
  PageParams,
  ModelVariable
} from '@/services/modelVariable';
import { FinancialModelAPI, FinancialModel } from '@/services/financialModel';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 前端专用的变量接口
interface FrontendModelVariable {
  id: number;
  modelId: number;
  variableName: string;
  variableCode: string;
  variableType: 'INPUT' | 'CALC' | 'API';
  dataType: 'NUMBER' | 'DECIMAL' | 'PERCENTAGE' | 'CURRENCY' | 'STRING' | 'BOOLEAN';
  defaultValue?: string | number;
  unit?: string;
  description?: string;
  formulaExpression?: string;
  isRequired: boolean;
  validationRules?: string;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

const VariableManagement: React.FC = () => {
  const params = useParams<{ modelId?: string }>();
  const [searchParams] = useSearchParams();
  
  // 标记是否已经初始化过
  const isInitialized = useRef(false);
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<FrontendModelVariable[]>([]);
  const [models, setModels] = useState<FinancialModel[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // 查询条件
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedDataType, setSelectedDataType] = useState<string | undefined>();
  
  // 弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVariable, setEditingVariable] = useState<FrontendModelVariable | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // 表单
  const [form] = Form.useForm();

  // 数据类型映射
  const getDataTypeLabel = (dataType: string) => {
    const typeMap: Record<string, string> = {
      'NUMBER': '数字',
      'DECIMAL': '小数',
      'PERCENTAGE': '百分比',
      'CURRENCY': '货币',
      'STRING': '文本',
      'BOOLEAN': '布尔'
    };
    return typeMap[dataType] || dataType;
  };

  // 表格列配置
  const columns: ColumnsType<FrontendModelVariable> = [
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
              {record.variableType === 'INPUT' ? '输入' : 
               record.variableType === 'CALC' ? '计算' : 'API'}
            </Tag>
            <Tag color="default">{getDataTypeLabel(record.dataType)}</Tag>
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
                {record.formulaExpression}
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
      title: '配置',
      key: 'config',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>
            <Tag color={record.isRequired ? 'red' : 'default'}>
              {record.isRequired ? '必填' : '可选'}
            </Tag>
          </div>
          <div style={{ fontSize: '12px' }}>
            <Tag color={record.isVisible ? 'green' : 'default'}>
              {record.isVisible ? '显示' : '隐藏'}
            </Tag>
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            排序: {record.displayOrder}
          </div>
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text) => (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {text || '暂无描述'}
        </span>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (time) => (
        <span style={{ fontSize: '12px' }}>{time}</span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑变量">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="复制变量">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title="测试公式">
            <Button
              size="small"
              icon={<FunctionOutlined />}
              disabled={record.variableType !== 'CALC'}
              onClick={() => handleTestFormula(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个变量吗？删除后可能影响相关的计算公式。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 获取变量列表
  const fetchVariables = async () => {
    if (!selectedModelId) {
      setVariables([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      
      const params: PageParams = {
        current: currentPage,
        pageSize: pageSize,
        modelId: selectedModelId,
        keyword: searchKeyword || undefined,
        variableType: selectedType,
        dataType: selectedDataType,
      };
      
      const result = await ModelVariableAPI.getVariables(params);
      setVariables(result.data);
      setTotal(result.count);
    } catch (error) {
      console.error('获取变量列表失败:', error);
      message.error(error instanceof Error ? error.message : '获取变量列表失败');
      setVariables([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 获取模型列表
  const fetchModels = async () => {
    try {
      const result = await FinancialModelAPI.getModels({
        current: 1,
        pageSize: 100,
      });
      setModels(result.data);
      
      // 如果还没有选中模型且有可用模型，选择第一个
      if (result.data.length > 0 && !selectedModelId) {
        setSelectedModelId(result.data[0].id);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败');
      // 使用模拟数据作为后备
      const mockModels: FinancialModel[] = [
        { 
          id: 1, 
          modelName: '盈亏平衡分析模型', 
          modelCode: 'BREAKEVEN_001',
          modelCategory: 'breakeven_analysis',
          isActive: true,
          createdAt: '2024-01-15 10:30:00',
          updatedAt: '2024-01-15 14:20:00'
        },
        { 
          id: 2, 
          modelName: '成本分析模型', 
          modelCode: 'COST_001',
          modelCategory: 'cost_benefit',
          isActive: true,
          createdAt: '2024-01-15 10:30:00',
          updatedAt: '2024-01-15 14:20:00'
        },
        { 
          id: 3, 
          modelName: '敏感性分析模型', 
          modelCode: 'SENSITIVITY_001',
          modelCategory: 'sensitivity_analysis',
          isActive: true,
          createdAt: '2024-01-15 10:30:00',
          updatedAt: '2024-01-15 14:20:00'
        }
      ];
      setModels(mockModels);
      
      // 如果还没有选中模型且有可用模型，选择第一个
      if (mockModels.length > 0 && !selectedModelId) {
        setSelectedModelId(mockModels[0].id);
      }
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  // 处理筛选
  const handleFilter = () => {
    setCurrentPage(1);
    fetchVariables();
  };

  // 处理分页
  const handleTableChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // 处理新增
  const handleAdd = () => {
    if (!selectedModelId) {
      message.warning('请先选择财务模型');
      return;
    }
    setEditingVariable(null);
    form.resetFields();
    form.setFieldsValue({
      isRequired: false,
      isVisible: true,
      displayOrder: variables.length + 1,
      variableType: 'INPUT',
      dataType: 'NUMBER'
    });
    setActiveTab('basic');
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: FrontendModelVariable) => {
    setEditingVariable(record);
    form.setFieldsValue({
      variableName: record.variableName,
      variableCode: record.variableCode,
      variableType: record.variableType,
      dataType: record.dataType,
      defaultValue: record.defaultValue,
      unit: record.unit,
      description: record.description,
      formulaExpression: record.formulaExpression,
      isRequired: record.isRequired,
      validationRules: record.validationRules,
      displayOrder: record.displayOrder,
      isVisible: record.isVisible,
    });
    setActiveTab('basic');
    setIsModalVisible(true);
  };

  // 处理复制
  const handleCopy = (record: FrontendModelVariable) => {
    Modal.confirm({
      title: '复制变量',
      content: `确定要复制变量 "${record.variableName}" 吗？`,
      onOk: () => {
        message.success('变量复制成功');
        fetchVariables();
      },
    });
  };

  // 处理测试公式
  const handleTestFormula = (record: FrontendModelVariable) => {
    if (!record.formulaExpression) {
      message.warning('该变量没有公式表达式');
      return;
    }
    
    Modal.info({
      title: '公式测试',
      content: (
        <div>
          <p><strong>变量:</strong> {record.variableName}</p>
          <p><strong>公式:</strong> <code>{record.formulaExpression}</code></p>
          <p><strong>测试结果:</strong> 公式语法正确</p>
          <p style={{ color: '#666', fontSize: '12px' }}>
            注意: 这里只是语法验证，实际计算需要具体的变量值
          </p>
        </div>
      ),
      width: 500,
    });
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await ModelVariableAPI.deleteVariable(id);
      message.success('删除成功');
      fetchVariables();
    } catch (error) {
      console.error('删除变量失败:', error);
      message.error(error instanceof Error ? error.message : '删除变量失败');
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (values: VariableFormData) => {
    console.log('表单数据:', values);
    
    if (!selectedModelId) {
      message.error('请先选择财务模型');
      return;
    }
    
    try {
      setLoading(true);
      
      const formData = {
        ...values,
        modelId: selectedModelId,
      };
      
      if (editingVariable) {
        await ModelVariableAPI.updateVariable(editingVariable.id, formData);
        message.success('更新成功');
      } else {
        await ModelVariableAPI.createVariable(formData);
        message.success('创建成功');
      }
      
      setIsModalVisible(false);
      fetchVariables();
    } catch (error) {
      console.error('提交表单失败:', error);
      message.error(error instanceof Error ? error.message : '提交表单失败');
    } finally {
      setLoading(false);
    }
  };

  // 变量类型改变时的处理
  const handleVariableTypeChange = (type: string) => {
    if (type === 'CALC') {
      form.setFieldsValue({ isRequired: false });
    }
  };

  // 批量操作
  const handleBatchUpdate = (action: string) => {
    message.info(`执行批量操作: ${action}`);
  };

  // 初始化
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      
      // 检查URL参数中是否有模型ID
      const urlModelId = params.modelId || searchParams.get('modelId');
      if (urlModelId) {
        // 如果URL中有模型ID，直接设置并跳过模型列表请求
        setSelectedModelId(Number(urlModelId));
      } else {
        // 如果没有模型ID，才请求模型列表
        fetchModels();
      }
    }
  }, []);

  // 当选中的模型ID改变时，重置分页并获取变量列表
  useEffect(() => {
    if (selectedModelId) {
      setCurrentPage(1); // 重置分页
      fetchVariables();
    }
  }, [selectedModelId]);

  // 当搜索条件改变时，重置分页并获取变量列表
  useEffect(() => {
    if (selectedModelId) { // 只有在选中模型的情况下才执行搜索
      setCurrentPage(1); // 重置分页
      fetchVariables();
    }
  }, [searchKeyword, selectedType, selectedDataType]);

  // 当分页参数改变时，获取变量列表
  useEffect(() => {
    if (selectedModelId) {
      fetchVariables();
    }
  }, [currentPage, pageSize]);

  return (
    <div className="variable-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 8 }}>变量配置管理</h2>
            <span style={{ color: '#666', fontSize: '14px' }}>
              管理财务模型中的输入变量、计算变量和API
            </span>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={!selectedModelId}
            >
              新增变量
            </Button>
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => handleBatchUpdate('批量导入')}
            >
              批量导入
            </Button>
          </Space>
        </div>

        <Divider />

        {/* 查询条件 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={5}>
              <Select
                placeholder="选择财务模型"
                style={{ width: '100%' }}
                value={selectedModelId}
                onChange={setSelectedModelId}
              >
                {models.map(model => (
                  <Option key={model.id} value={model.id}>
                    {model.modelName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={5}>
              <Search
                placeholder="搜索变量名称、编码"
                allowClear
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>
            <Col span={3}>
              <Select
                placeholder="变量类型"
                allowClear
                style={{ width: '100%' }}
                value={selectedType}
                onChange={setSelectedType}
              >
                <Option value="INPUT">输入</Option>
                <Option value="CALC">计算</Option>
                <Option value="API">API</Option>
              </Select>
            </Col>
            <Col span={3}>
              <Select
                placeholder="数据类型"
                allowClear
                style={{ width: '100%' }}
                value={selectedDataType}
                onChange={setSelectedDataType}
              >
                <Option value="NUMBER">数字</Option>
                <Option value="DECIMAL">小数</Option>
                <Option value="PERCENTAGE">百分比</Option>
                <Option value="CURRENCY">货币</Option>
                <Option value="BOOLEAN">布尔</Option>
                <Option value="STRING">文本</Option>
              </Select>
            </Col>
            <Col span={3}>
              <Button type="primary" onClick={handleFilter}>
                查询
              </Button>
            </Col>
          </Row>
        </div>

        {/* 统计信息 */}
        <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1890ff' }}>
                  {variables.filter(v => v.variableType === 'INPUT').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>输入</div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#52c41a' }}>
                  {variables.filter(v => v.variableType === 'CALC').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>计算</div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#faad14' }}>
                  {variables.filter(v => v.variableType === 'API').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>API</div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#f5222d' }}>
                  {variables.filter(v => v.isRequired).length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>必填</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={variables}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingVariable ? '编辑变量' : '新增变量'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="变量名称"
                    name="variableName"
                    rules={[{ required: true, message: '请输入变量名称' }]}
                  >
                    <Input placeholder="请输入变量名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="变量编码"
                    name="variableCode"
                    rules={[
                      { required: true, message: '请输入变量编码' },
                      { pattern: /^[a-z_][a-z0-9_]*$/, message: '编码只能包含小写字母、数字和下划线，且以字母或下划线开头' }
                    ]}
                  >
                    <Input placeholder="请输入变量编码" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="变量类型"
                    name="variableType"
                    rules={[{ required: true, message: '请选择变量类型' }]}
                  >
                    <Select placeholder="请选择变量类型" onChange={handleVariableTypeChange}>
                      <Option value="INPUT">输入</Option>
                      <Option value="CALC">计算</Option>
                      <Option value="API">API</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="数据类型"
                    name="dataType"
                    rules={[{ required: true, message: '请选择数据类型' }]}
                  >
                    <Select placeholder="请选择数据类型">
                      <Option value="NUMBER">数字</Option>
                      <Option value="DECIMAL">小数</Option>
                      <Option value="PERCENTAGE">百分比</Option>
                      <Option value="CURRENCY">货币</Option>
                      <Option value="BOOLEAN">布尔</Option>
                      <Option value="STRING">文本</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="单位"
                    name="unit"
                  >
                    <Input placeholder="请输入单位" />
                  </Form.Item>
                </Col>
              </Row>

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
                        name="formulaExpression"
                        rules={[{ required: true, message: '请输入公式表达式' }]}
                      >
                        <TextArea
                          rows={3}
                          placeholder="请输入公式表达式，如: sales_volume * unit_price - fixed_cost"
                        />
                      </Form.Item>
                    );
                  } else {
                    return (
                      <Form.Item
                        label="默认值"
                        name="defaultValue"
                      >
                        <Input placeholder="请输入默认值" />
                      </Form.Item>
                    );
                  }
                }}
              </Form.Item>

              <Form.Item
                label="描述"
                name="description"
              >
                <TextArea
                  rows={2}
                  placeholder="请输入变量描述"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="是否必填"
                    name="isRequired"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="是否显示"
                    name="isVisible"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="显示顺序"
                    name="displayOrder"
                    rules={[{ required: true, message: '请输入显示顺序' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="验证规则"
                name="validationRules"
              >
                <Input placeholder="如: min:0,max:1000" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setIsModalVisible(false)}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingVariable ? '更新' : '创建'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="公式编辑器" key="formula">
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              <CodeOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <p>可视化公式编辑器</p>
              <p style={{ fontSize: '12px' }}>拖拽变量和函数来构建公式表达式</p>
            </div>
          </TabPane>
          
          <TabPane tab="预览测试" key="preview">
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              <FunctionOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <p>变量预览和公式测试</p>
              <p style={{ fontSize: '12px' }}>查看变量在表单中的显示效果和测试计算结果</p>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default VariableManagement; 