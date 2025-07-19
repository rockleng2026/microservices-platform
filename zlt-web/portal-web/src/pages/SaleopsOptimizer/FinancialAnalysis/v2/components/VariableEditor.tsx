import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Space,
  message,
  Card,
  Row,
  Col,
  Divider,
  Alert,
  Tag,
  Tooltip,
  Table
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import * as financialModelInstanceAPI from '@/services/financialModelInstance';

const { Option } = Select;
const { TextArea } = Input;

interface VariableEditorProps {
  visible: boolean;
  instance: financialModelInstanceAPI.FinancialModelInstance | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const VariableEditor: React.FC<VariableEditorProps> = ({
  visible,
  instance,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<financialModelInstanceAPI.ModelInstanceVariable[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && instance) {
      loadInstanceVariables();
    }
  }, [visible, instance]);

  // 加载实例变量
  const loadInstanceVariables = async () => {
    if (!instance) return;
    
    setLoading(true);
    try {
      const variablesData = await financialModelInstanceAPI.FinancialModelInstanceAPI.getInstanceVariables(instance.id);
      setVariables(variablesData);
      
      // 设置表单初始值
      const initialValues: any = {};
      variablesData.forEach(variable => {
        initialValues[`variable_${variable.variableId}`] = variable.variableValue;
      });
      form.setFieldsValue(initialValues);
    } catch (error) {
      message.error('加载变量失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存变量值
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // 构建变量更新数据
      const updatedVariables = variables.map(variable => ({
        ...variable,
        variableValue: values[`variable_${variable.variableId}`] || variable.variableValue,
      }));

      await financialModelInstanceAPI.FinancialModelInstanceAPI.updateInstanceVariables(
        instance!.id,
        updatedVariables
      );

      message.success('保存成功');
      onSuccess();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 重置变量值
  const handleReset = () => {
    form.resetFields();
    loadInstanceVariables();
  };

  // 验证变量
  const handleValidate = () => {
    form.validateFields().then(() => {
      message.success('变量验证通过');
    }).catch(() => {
      message.error('变量验证失败，请检查必填项');
    });
  };

  // 获取变量类型输入组件
  const getVariableInput = (variable: financialModelInstanceAPI.ModelInstanceVariable) => {
    const { dataType, isRequired, unit } = variable;
    const fieldName = `variable_${variable.variableId}`;

    switch (dataType) {
      case 'DECIMAL':
      case 'INTEGER':
        return (
          <Form.Item
            name={fieldName}
            rules={[
              { required: isRequired, message: '请输入变量值' },
              { type: 'number', message: '请输入有效的数字' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={`请输入${variable.variableName}`}
              addonAfter={unit}
              precision={dataType === 'DECIMAL' ? 2 : 0}
            />
          </Form.Item>
        );
      
      case 'BOOLEAN':
        return (
          <Form.Item
            name={fieldName}
            valuePropName="checked"
            rules={[{ required: isRequired, message: '请选择变量值' }]}
          >
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
            />
          </Form.Item>
        );
      
      case 'TEXT':
        return (
          <Form.Item
            name={fieldName}
            rules={[
              { required: isRequired, message: '请输入变量值' },
              { max: 1000, message: '文本长度不能超过1000字符' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder={`请输入${variable.variableName}`}
              maxLength={1000}
              showCount
            />
          </Form.Item>
        );
      
      default:
        return (
          <Form.Item
            name={fieldName}
            rules={[
              { required: isRequired, message: '请输入变量值' },
              { max: 200, message: '文本长度不能超过200字符' }
            ]}
          >
            <Input
              placeholder={`请输入${variable.variableName}`}
              addonAfter={unit}
              maxLength={200}
            />
          </Form.Item>
        );
    }
  };

  // 获取变量状态标签
  const getVariableStatusTag = (variable: financialModelInstanceAPI.ModelInstanceVariable) => {
    if (variable.isCalculated) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>已计算</Tag>;
    }
    if (variable.calculationError) {
      return <Tag color="error" icon={<CloseCircleOutlined />}>计算错误</Tag>;
    }
    return <Tag color="default">未计算</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '变量名称',
      dataIndex: 'variableName',
      key: 'variableName',
      width: 150,
      render: (text: string, record: financialModelInstanceAPI.ModelInstanceVariable) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.variableCode}</div>
        </div>
      ),
    },
    {
      title: '变量类型',
      dataIndex: 'variableType',
      key: 'variableType',
      width: 100,
      render: (text: string) => (
        <Tag color={text === 'INPUT' ? 'blue' : text === 'CALCULATED' ? 'green' : 'orange'}>
          {text === 'INPUT' ? '输入' : text === 'CALCULATED' ? '计算' : '常量'}
        </Tag>
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
    },
    {
      title: '变量值',
      key: 'variableValue',
      render: (text: string, record: financialModelInstanceAPI.ModelInstanceVariable) => (
        <div style={{ width: 200 }}>
          {getVariableInput(record)}
        </div>
      ),
    },
    {
      title: '计算值',
      dataIndex: 'calculatedValue',
      key: 'calculatedValue',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (text: string, record: financialModelInstanceAPI.ModelInstanceVariable) => 
        getVariableStatusTag(record),
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 60,
      render: (required: boolean) => 
        required ? <Tag color="red">必填</Tag> : <Tag color="default">可选</Tag>,
    },
  ];

  if (!instance) return null;

  return (
    <Drawer
      title={`编辑变量 - ${instance.instanceName}`}
      placement="right"
      width={1000}
      open={visible}
      onClose={onCancel}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button icon={<CalculatorOutlined />} onClick={handleValidate}>
            验证
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            保存
          </Button>
        </Space>
      }
    >
      <div style={{ paddingBottom: 20 }}>
        {/* 实例信息 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div><strong>实例编码：</strong>{instance.instanceCode}</div>
            </Col>
            <Col span={8}>
              <div><strong>关联模型：</strong>{instance.financialModel?.modelName}</div>
            </Col>
            <Col span={8}>
              <div><strong>变量数量：</strong>{variables.length}</div>
            </Col>
          </Row>
        </Card>

        {/* 变量列表 */}
        <Card title="变量配置">
          <Form form={form} layout="vertical">
            <Table
              columns={columns}
              dataSource={variables}
              rowKey="variableId"
              loading={loading}
              pagination={false}
              scroll={{ y: 400 }}
              size="small"
            />
          </Form>
        </Card>

        {/* 提示信息 */}
        <Alert
          message="变量编辑说明"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>输入变量：需要手动输入值的变量</li>
              <li>计算变量：根据公式自动计算的变量</li>
              <li>常量变量：固定值的变量</li>
              <li>必填变量：必须填写值的变量</li>
              <li>保存后可以执行计算来验证变量配置</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    </Drawer>
  );
};

export default VariableEditor; 