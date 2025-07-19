import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Divider,
  Alert,
  Space,
  Button
} from 'antd';
import * as financialModelInstanceAPI from '@/services/financialModelInstance';
import * as financialModelAPI from '@/services/financialModel';
import * as breakevenAnalysisAPI from '@/services/breakevenAnalysisV2';

const { Option } = Select;
const { TextArea } = Input;

interface InstanceFormProps {
  visible: boolean;
  formData: financialModelInstanceAPI.InstanceFormData | null;
  editingInstance: financialModelInstanceAPI.FinancialModelInstance | null;
  models: any[];
  onCancel: () => void;
  onSuccess: () => void;
}

const InstanceForm: React.FC<InstanceFormProps> = ({
  visible,
  formData,
  editingInstance,
  models,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [modelVariables, setModelVariables] = useState<any[]>([]);

  useEffect(() => {
    if (visible && formData) {
      form.setFieldsValue(formData);
      if (formData.modelId) {
        loadModelVariables(formData.modelId);
      }
    }
  }, [visible, formData, form]);

  // 加载模型变量
  const loadModelVariables = async (modelId: number) => {
    try {
      const response = await breakevenAnalysisAPI.BreakevenAnalysisV2API.getModelVariables(modelId);
      if (response.resp_code === 0) {
        setModelVariables(response.datas);
      }
    } catch (error) {
      console.error('加载模型变量失败:', error);
    }
  };

  // 模型选择变化
  const handleModelChange = (modelId: number) => {
    const model = models.find(m => m.id === modelId);
    setSelectedModel(model);
    loadModelVariables(modelId);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingInstance) {
        // 更新实例
        await financialModelInstanceAPI.FinancialModelInstanceAPI.updateInstance(
          editingInstance.id,
          values
        );
        message.success('更新成功');
      } else {
        // 创建实例
        await financialModelInstanceAPI.FinancialModelInstanceAPI.createInstance(values);
        message.success('创建成功');
      }

      onSuccess();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成实例编码
  const generateInstanceCode = () => {
    const model = models.find(m => m.id === form.getFieldValue('modelId'));
    if (model) {
      const timestamp = Date.now().toString().slice(-6);
      const code = `${model.modelCode}_INST_${timestamp}`;
      form.setFieldsValue({ instanceCode: code });
    }
  };

  return (
    <Modal
      title={editingInstance ? '编辑模型实例' : '新建模型实例'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          instanceVersion: '1.0.0',
          instanceStatus: 'DRAFT',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="关联模型"
              name="modelId"
              rules={[{ required: true, message: '请选择关联模型' }]}
            >
              <Select
                placeholder="请选择模型"
                onChange={handleModelChange}
                disabled={!!editingInstance}
              >
                {models.map(model => (
                  <Option key={model.id} value={model.id}>
                    {model.modelName} ({model.modelCode})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="实例编码"
              name="instanceCode"
              rules={[
                { required: true, message: '请输入实例编码' },
                { pattern: /^[A-Za-z0-9_]+$/, message: '编码只能包含字母、数字和下划线' }
              ]}
            >
              <Input
                placeholder="请输入实例编码"
                addonAfter={
                  <Button type="link" size="small" onClick={generateInstanceCode}>
                    生成
                  </Button>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="实例名称"
              name="instanceName"
              rules={[{ required: true, message: '请输入实例名称' }]}
            >
              <Input placeholder="请输入实例名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="实例版本"
              name="instanceVersion"
              rules={[{ required: true, message: '请输入实例版本' }]}
            >
              <Input placeholder="请输入版本号，如：1.0.0" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="关联项目"
              name="projectId"
            >
              <Select placeholder="请选择关联项目（可选）" allowClear>
                {/* 这里可以添加项目列表 */}
                <Option value={1}>示例项目1</Option>
                <Option value={2}>示例项目2</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="实例状态"
              name="instanceStatus"
            >
              <Select>
                <Option value="DRAFT">草稿</Option>
                <Option value="ACTIVE">激活</Option>
                <Option value="INACTIVE">停用</Option>
                <Option value="ARCHIVED">归档</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="实例描述"
          name="instanceDescription"
        >
          <TextArea
            rows={3}
            placeholder="请输入实例描述"
            maxLength={500}
            showCount
          />
        </Form.Item>

        {selectedModel && (
          <>
            <Divider orientation="left">模型信息</Divider>
            <Alert
              message={`${selectedModel.modelName} (${selectedModel.modelCode})`}
              description={selectedModel.modelDescription || '暂无描述'}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {modelVariables.length > 0 && (
              <>
                <Divider orientation="left">模型变量 ({modelVariables.length})</Divider>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 8, borderRadius: 6 }}>
                  {modelVariables.map(variable => (
                    <div key={variable.id} style={{ marginBottom: 8, padding: 8, backgroundColor: '#fafafa', borderRadius: 4 }}>
                      <Space>
                        <span style={{ fontWeight: 'bold' }}>{variable.variableName}</span>
                        <span style={{ color: '#666' }}>({variable.variableCode})</span>
                        <span style={{ color: '#999' }}>{variable.variableType}</span>
                        {variable.isRequired && <span style={{ color: '#ff4d4f' }}>*</span>}
                      </Space>
                      {variable.description && (
                        <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                          {variable.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default InstanceForm; 