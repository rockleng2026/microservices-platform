import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  DatePicker,
  Row,
  Col,
  message,
  Divider
} from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface BreakevenAnalysisFormProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

const BreakevenAnalysisForm: React.FC<BreakevenAnalysisFormProps> = ({
  visible,
  mode,
  initialValues,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue({
          ...initialValues,
          analysisPeriod: initialValues.analysisPeriod ? dayjs(initialValues.analysisPeriod) : null
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, mode, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        analysisPeriod: values.analysisPeriod ? values.analysisPeriod.format('YYYY-MM') : null
      };
      await onSubmit(submitData);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={mode === 'create' ? '创建盈亏平衡分析' : '编辑盈亏平衡分析'}
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
          analysisType: 'monthly',
          isRealTime: false,
          autoRecalculation: false
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="analysisName"
              label="分析名称"
              rules={[
                { required: true, message: '请输入分析名称' },
                { max: 100, message: '分析名称不能超过100个字符' }
              ]}
            >
              <Input placeholder="请输入分析名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="analysisType"
              label="分析类型"
              rules={[{ required: true, message: '请选择分析类型' }]}
            >
              <Select placeholder="请选择分析类型">
                <Option value="monthly">月度分析</Option>
                <Option value="quarterly">季度分析</Option>
                <Option value="yearly">年度分析</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="analysisPeriod"
              label="分析期间"
              rules={[{ required: true, message: '请选择分析期间' }]}
            >
              <DatePicker.MonthPicker 
                placeholder="请选择分析期间" 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>基础参数配置</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="totalFixedCost"
              label="总固定成本 (元)"
              rules={[
                { required: true, message: '请输入总固定成本' },
                { type: 'number', min: 0, message: '总固定成本不能为负数' }
              ]}
            >
              <InputNumber
                placeholder="请输入总固定成本"
                style={{ width: '100%' }}
                min={0}
                precision={2}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="variableCostRatio"
              label="变动成本率"
              rules={[
                { required: true, message: '请输入变动成本率' },
                { type: 'number', min: 0, max: 1, message: '变动成本率应在0-1之间' }
              ]}
            >
              <InputNumber
                placeholder="请输入变动成本率"
                style={{ width: '100%' }}
                min={0}
                max={1}
                step={0.01}
                precision={4}
                formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`}
                parser={(value) => Number(value!.replace('%', '')) / 100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isRealTime"
              label="实时计算"
              valuePropName="checked"
            >
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="autoRecalculation"
              label="自动重算"
              valuePropName="checked"
            >
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="分析描述"
        >
          <TextArea
            placeholder="请输入分析描述"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BreakevenAnalysisForm; 