/**
 * 优惠券发放弹窗 (ADMIN-04-05)
 * 向指定用户发放优惠券
 */
import { Button, Form, InputNumber, Modal, message, Typography } from 'antd';
import React, { useState } from 'react';
import { CouponTemplateDTO, issueCoupon } from '../services/coupons';

const { Text } = Typography;

interface IssueModalProps {
  visible: boolean;
  coupon: CouponTemplateDTO | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const IssueModal: React.FC<IssueModalProps> = ({ visible, coupon, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleIssue = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await issueCoupon(coupon!.id!, values.userId);
      message.success('发放成功');
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error?.message || '发放失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="发放优惠券"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
        <Text type="secondary">
          向指定用户发放优惠券，该用户可直接获得此券
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ userId: undefined }}
      >
        <Form.Item
          label="优惠券"
          name="couponName"
          initialValue={coupon?.name}
        >
          <InputNumber style={{ width: '100%' }} disabled />
        </Form.Item>

        <Form.Item
          label="用户ID"
          name="userId"
          rules={[{ required: true, message: '请输入用户ID' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入用户ID" min={1} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" loading={loading} block onClick={handleIssue}>
            发放
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IssueModal;