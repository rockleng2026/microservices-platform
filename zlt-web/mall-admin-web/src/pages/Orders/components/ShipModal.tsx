/**
 * 发货组件 - ADMIN-03-03
 * Express delivery input modal
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { shipOrder } from '../services/orders';

interface ShipModalProps {
  visible: boolean;
  orderId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const ShipModal: React.FC<ShipModalProps> = ({
  visible,
  orderId,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      try {
        const success = await shipOrder(orderId, {
          expressCode: values.expressCode,
          expressName: values.expressName,
          waybillNo: values.waybillNo,
        });

        if (success) {
          message.success('发货成功');
          onSuccess();
        } else {
          message.error('发货失败，请重试');
        }
      } catch (error) {
        console.error('Failed to ship order:', error);
        message.error('发货失败，请重试');
      } finally {
        setSubmitting(false);
      }
    } catch (error) {
      // Form validation failed
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Modal
      title="订单发货"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="确认发货"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          expressCode: '',
          expressName: '',
          waybillNo: '',
        }}
      >
        <Form.Item
          name="expressName"
          label="快递公司"
          rules={[{ required: true, message: '请输入快递公司名称' }]}
        >
          <Input placeholder="请输入快递公司名称，如：顺丰速运、圆通快递" />
        </Form.Item>

        <Form.Item
          name="expressCode"
          label="快递编码"
          rules={[{ required: true, message: '请输入快递编码' }]}
        >
          <Input placeholder="请输入快递编码，如：SF、YT" />
        </Form.Item>

        <Form.Item
          name="waybillNo"
          label="运单号"
          rules={[{ required: true, message: '请输入运单号' }]}
        >
          <Input placeholder="请输入运单号" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ShipModal;
