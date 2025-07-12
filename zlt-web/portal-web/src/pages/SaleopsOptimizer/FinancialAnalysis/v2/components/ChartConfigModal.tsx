import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd';
import { request } from '@/utils/request';

interface ChartConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  modelId?: number;
  variables: any[];
}

const ChartConfigModal: React.FC<ChartConfigModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  modelId,
  variables
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const chartData = {
        modelId,
        chartName: values.chartName,
        chartType: values.chartType,
        simulationSteps: values.simulationSteps,
        xAxisField: values.xAxisField,
        yAxisField: values.yAxisField,
        xAxisUnit: values.xAxisUnit,
        yAxisUnit: values.yAxisUnit
      };

      await request('/api-soo/api/soo/v2/chart-models', {
        method: 'POST',
        data: chartData
      });

      message.success('图表配置创建成功');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('创建图表配置失败:', error);
      message.error('创建失败');
    } finally {
      setLoading(false);
    }
  };

  const chartTypeOptions = [
    { label: '折线图', value: 'line' },
    { label: '柱状图', value: 'bar' },
    { label: '饼图', value: 'pie' },
    { label: '散点图', value: 'scatter' }
  ];

  const variableOptions = variables.map(v => ({
    label: `${v.variableName} [${v.variableCode}]`,
    value: v.variableCode
  }));

  return (
    <Modal
      title="创建图表配置"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          chartType: 'line',
          simulationSteps: 10
        }}
      >
        <Form.Item
          name="chartName"
          label="图表名称"
          rules={[{ required: true, message: '请输入图表名称' }]}
        >
          <Input placeholder="请输入图表名称" />
        </Form.Item>

        <Form.Item
          name="chartType"
          label="图表类型"
          rules={[{ required: true, message: '请选择图表类型' }]}
        >
          <Select options={chartTypeOptions} placeholder="请选择图表类型" />
        </Form.Item>

        <Form.Item
          name="simulationSteps"
          label="模拟步数"
          rules={[{ required: true, message: '请输入模拟步数' }]}
        >
          <InputNumber
            min={1}
            max={100}
            style={{ width: '100%' }}
            placeholder="请输入模拟步数"
          />
        </Form.Item>

        <Form.Item
          name="xAxisField"
          label="X轴字段"
          rules={[{ required: true, message: '请选择X轴字段' }]}
        >
          <Select options={variableOptions} placeholder="请选择X轴字段" />
        </Form.Item>

        <Form.Item
          name="yAxisField"
          label="Y轴字段"
          rules={[{ required: true, message: '请选择Y轴字段' }]}
        >
          <Select options={variableOptions} placeholder="请选择Y轴字段" />
        </Form.Item>

        <Form.Item name="xAxisUnit" label="X轴单位">
          <Input placeholder="如：万元、个、%等" />
        </Form.Item>

        <Form.Item name="yAxisUnit" label="Y轴单位">
          <Input placeholder="如：万元、个、%等" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChartConfigModal; 