/**
 * 关单组件 - ADMIN-03-05
 * Close order with reason selection
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import { closeOrder, CLOSE_ORDER_REASONS } from '../services/orders';

interface CloseModalProps {
  visible: boolean;
  orderId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const CloseModal: React.FC<CloseModalProps> = ({
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
        const success = await closeOrder(orderId, values.reason);

        if (success) {
          message.success('关单成功');
          onSuccess();
        } else {
          message.error('关单失败，请重试');
        }
      } catch (error) {
        console.error('Failed to close order:', error);
        message.error('关单失败，请重试');
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
      title="关闭订单"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="确认关单"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          reason: '',
          reasonDetail: '',
        }}
      >
        <Form.Item
          name="reason"
          label="关单原因"
          rules={[{ required: true, message: '请选择关单原因' }]}
        >
          <Select placeholder="请选择关单原因">
            {CLOSE_ORDER_REASONS.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="reasonDetail"
          label="补充说明（可选）"
        >
          <Input.TextArea
            rows={3}
            placeholder="如选择'其他'原因，请在此补充说明..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CloseModal;
