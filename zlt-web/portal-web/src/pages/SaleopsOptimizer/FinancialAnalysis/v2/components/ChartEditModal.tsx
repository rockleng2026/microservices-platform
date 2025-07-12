import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { request } from '@/utils/request';

const { Option } = Select;

interface ChartEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void; // 新增成功回调
  modelId: string;
  chartData?: any;
}

const ChartEditModal: React.FC<ChartEditModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  modelId,
  chartData,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (chartData) {
        form.setFieldsValue(chartData);
      }
    }
  }, [visible, chartData, form]);

  // 新增保存处理函数
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      // 准备API请求数据
      const requestData = {
        ...values,
        modelId: parseInt(modelId, 10),
      };

      // 根据是新增还是编辑调用不同API
      const url = chartData 
        ? `/api-soo/api/soo/v2/chart-models/${chartData.id}`
        : '/api-soo/api/soo/v2/chart-models';
      const method = chartData ? 'PUT' : 'POST';

      // 调用API
      const response = await request(url, {
        method,
        data: requestData,
      });

      if (response.resp_code === 0) {
        message.success(chartData ? '图表更新成功' : '图表创建成功');
        onSuccess(); // 触发成功回调
        onCancel();
      } else {
        message.error(response.resp_msg || '操作失败');
      }
    } catch (error) {
      console.error('保存图表失败:', error);
      message.error('保存失败，请检查表单');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title={chartData ? "编辑图表" : "新增图表"}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSave} // 绑定保存处理函数
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
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
          <Select placeholder="请选择图表类型">
            <Option value="line">折线图</Option>
            <Option value="bar">柱状图</Option>
            <Option value="pie">饼图</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="simulationSteps"
          label="模拟步数"
          rules={[{ required: true, message: '请输入模拟步数' }]}
        >
          <InputNumber min={1} max={1000} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="xaxisField"
          label="X轴字段"
          rules={[{ required: true, message: '请输入X轴字段' }]}
        >
          <Input placeholder="请输入X轴字段" />
        </Form.Item>
        <Form.Item
          name="xaxisUnit"
          label="X轴单位"
        >
          <Input placeholder="请输入X轴单位" />
        </Form.Item>
        <Form.Item
          name="yaxisField"
          label="Y轴字段"
          rules={[{ required: true, message: '请输入Y轴字段' }]}
        >
          <Input placeholder="请输入Y轴字段" />
        </Form.Item>
        <Form.Item
          name="yaxisUnit"
          label="Y轴单位"
        >
          <Input placeholder="请输入Y轴单位" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChartEditModal;
