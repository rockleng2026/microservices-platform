/**
 * 优惠券发放弹窗 (BLOCKED 骨架)
 *
 * ADMIN-04-05 手动发放优惠券给指定用户
 *
 * BLOCKED: 后端 AdminCouponController 无 /issue 接口
 * 需后端实现 POST /coupon/template/{id}/issue {userId} 后方可使用
 */

import { Button, Form, Input, InputNumber, Modal, Tooltip, Typography } from 'antd';
import React from 'react';
import { MallCouponTemplate } from '../services/coupons';

const { Text } = Typography;

interface IssueModalProps {
  visible: boolean;
  coupon: MallCouponTemplate | null;
  onClose: () => void;
}

/**
 * 发放给用户 Modal (BLOCKED 骨架)
 *
 * 功能说明:
 * - 输入用户ID或手机号定向发放优惠券
 * - 当前无后端 API，UI 为禁用状态
 *
 * TODO: 后端实现后替换为实际 API 调用
 *   POST /api-mall/admin/coupon/template/{templateId}/issue
 *   Request: { userId: number } 或 { phone: string }
 */
const IssueModal: React.FC<IssueModalProps> = ({ visible, coupon, onClose }) => {
  const [form] = Form.useForm();

  const handleIssue = () => {
    // BLOCKED: 无后端 API，暂不实现
    Modal.info({
      title: '功能暂未开放',
      content: '后端 API 暂未实现，敬请期待。\n\nADMIN-04-05: 手动发放优惠券给指定用户\nBLOCKED: 后端 AdminCouponController 无 /issue 接口',
      okText: '知道了',
    });
  };

  return (
    <Modal
      title="发放优惠券"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginBottom: 16, padding: 12, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4 }}>
        <Text type="secondary">
          <strong>BLOCKED 状态</strong> — 后端 API 暂未实现
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          ADMIN-04-05: 手动发放优惠券给指定用户
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          需后端实现 POST /coupon/template/{coupon?.id}/issue {userId} 后方可使用
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        disabled={true}
      >
        <Form.Item
          label="优惠券"
          name="couponName"
          initialValue={coupon?.name}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="用户ID"
          name="userId"
          rules={[{ required: true, message: '请输入用户ID' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入用户ID" />
        </Form.Item>

        <Form.Item
          label="手机号（可选）"
          name="phone"
        >
          <Input placeholder="可通过手机号查询用户ID" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Tooltip title="后端 API 暂未实现">
            <Button type="primary" disabled block onClick={handleIssue}>
              发放
            </Button>
          </Tooltip>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IssueModal;