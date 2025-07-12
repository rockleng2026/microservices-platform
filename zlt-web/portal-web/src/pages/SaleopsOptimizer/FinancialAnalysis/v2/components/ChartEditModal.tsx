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
      
      // 准备API请求数据，确保字段名正确
      const requestData = {
        chartName: values.chartName,
        chartType: values.chartType,
        simulationSteps: values.simulationSteps || 1000, // 确保字段名正确
        xAxisName: values.xAxisName,
        xAxisField: values.xAxisField,
        xAxisUnit: values.xAxisUnit,
        yAxisName: values.yAxisName,
        yAxisUnit: values.yAxisUnit,
        modelId: parseInt(modelId, 10),
      };

      console.log('发送的请求数据:', requestData);

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

      console.log('API响应:', response);

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
      width={600}
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
            <Option value="scatter">散点图</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="simulationSteps"
          label="模拟步数"
          rules={[{ required: true, message: '请输入模拟步数' }]}
        >
          <InputNumber min={1} max={1000} style={{ width: '100%' }} placeholder="默认1000" />
        </Form.Item>
        
        {/* X轴配置 */}
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16, marginBottom: 16 }}>
          <h4 style={{ marginBottom: 16, color: '#1890ff' }}>X轴配置</h4>
          <Form.Item
            name="xAxisName"
            label="X轴名称"
            rules={[{ required: true, message: '请输入X轴名称' }]}
          >
            <Input placeholder="如：时间、月份、销售量" />
          </Form.Item>
          
          <Form.Item
            name="xAxisField"
            label="X轴字段"
            rules={[{ required: true, message: '请输入X轴字段' }]}
          >
            <Input placeholder="如：time、month、sales_volume" />
          </Form.Item>
          
          <Form.Item
            name="xAxisUnit"
            label="X轴单位"
          >
            <Input placeholder="如：月、件、%" />
          </Form.Item>
        </div>
        
        {/* Y轴配置 */}
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}>
          <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Y轴配置</h4>
          <Form.Item
            name="yAxisName"
            label="Y轴名称"
            rules={[{ required: true, message: '请输入Y轴名称' }]}
          >
            <Input placeholder="如：营业额、净利润、成本" />
          </Form.Item>
          
          <Form.Item
            name="yAxisUnit"
            label="Y轴单位"
          >
            <Input placeholder="如：万元、元、%" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ChartEditModal;
