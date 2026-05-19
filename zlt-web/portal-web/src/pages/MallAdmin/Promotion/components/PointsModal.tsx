/**
 * 积分调整弹窗 - ADMIN-05
 */
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, message, Alert } from 'antd';
import { adjustPoints, getMemberPoints } from '@/services/mall-admin/promotion';

interface PointsModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PointsModal: React.FC<PointsModalProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number | null>(null);

  // 监听 visible 变化，重置表单
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setCurrentPoints(null);
    }
  }, [visible]);

  // 查询会员当前积分
  const handleQueryPoints = async () => {
    const userId = form.getFieldValue('userId');
    if (!userId) {
      message.warning('请输入用户ID');
      return;
    }

    try {
      const points = await getMemberPoints(userId);
      setCurrentPoints(points);
    } catch (error) {
      console.error('Failed to query points:', error);
      message.error('查询积分失败');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await adjustPoints(values.userId, values.points, values.reason);

      setLoading(false);
      onSuccess();
    } catch (error) {
      setLoading(false);
      console.error('Failed to adjust points:', error);
      message.error('调整失败');
    }
  };

  return (
    <Modal
      title="积分调整"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      width={500}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="userId"
          label="用户ID"
          rules={[{ required: true, message: '请输入用户ID' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入用户ID"
            min={1}
          />
        </Form.Item>

        <Form.Item label="当前积分" style={{ marginBottom: 8 }}>
          {currentPoints !== null ? (
            <Alert
              message={`当前积分: ${currentPoints}`}
              type="info"
              showIcon
            />
          ) : (
            <Alert
              message="点击查询按钮获取用户当前积分"
              type="info"
              showIcon
            />
          )}
        </Form.Item>

        <Form.Item
          name="points"
          label="调整积分"
          rules={[{ required: true, message: '请输入调整积分数量' }]}
          tooltip="正数=增加积分，负数=减少积分"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="正数=增加, 负数=减少"
            step={1}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="操作原因"
          rules={[{ required: true, message: '请输入操作原因' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="请输入积分调整的原因，用于审计"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PointsModal;