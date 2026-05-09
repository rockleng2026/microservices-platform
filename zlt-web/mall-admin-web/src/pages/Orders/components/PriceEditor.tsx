/**
 * 改价组件 - ADMIN-03-03
 * Direct price input with decrease-only validation
 */
import React, { useState, useEffect } from 'react';
import { Modal, InputNumber, Alert, Space, message } from 'antd';
import { adjustOrderPrice } from '../services/orders';

interface PriceEditorProps {
  visible: boolean;
  orderId: number;
  currentAmount: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const PriceEditor: React.FC<PriceEditorProps> = ({
  visible,
  orderId,
  currentAmount,
  onCancel,
  onSuccess,
}) => {
  const [newAmount, setNewAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Current amount as number
  const current = parseFloat(currentAmount);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setNewAmount(current);
      setReason('');
      setError(null);
    }
  }, [visible, currentAmount, current]);

  // Calculate delta
  const delta = newAmount - current;
  const deltaText = delta >= 0 ? `+¥${delta.toFixed(2)}` : `-¥${Math.abs(delta).toFixed(2)}`;

  // Validate price change
  const validate = (): boolean => {
    if (newAmount < 0) {
      setError('金额不能为负数');
      return false;
    }
    if (newAmount >= current) {
      setError('改价只能是减少金额');
      return false;
    }
    setError(null);
    return true;
  };

  // Handle amount change
  const handleAmountChange = (value: number | null) => {
    if (value === null) return;
    setNewAmount(value);
    // Validate on change
    if (value < 0) {
      setError('金额不能为负数');
    } else if (value >= current) {
      setError('改价只能是减少金额');
    } else {
      setError(null);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      // adjustAmount must be negative (reducing the price)
      const adjustAmount = newAmount - current;
      const success = await adjustOrderPrice({
        orderId,
        adjustAmount,
        reason: reason.trim() || undefined,
      });

      if (success) {
        message.success('改价成功');
        onSuccess();
      } else {
        message.error('改价失败，请重试');
      }
    } catch (error) {
      console.error('Failed to adjust price:', error);
      message.error('改价失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="修改订单价格"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="确认改价"
      cancelText="取消"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Current amount */}
        <div>
          <div style={{ marginBottom: 8, color: '#888' }}>当前实付金额</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
            ¥{current.toFixed(2)}
          </div>
        </div>

        {/* New amount input */}
        <div>
          <div style={{ marginBottom: 8, color: '#888' }}>
            新实付金额 <span style={{ color: '#ff4d4f' }}>（只能减少）</span>
          </div>
          <InputNumber
            style={{ width: '100%' }}
            value={newAmount}
            onChange={handleAmountChange}
            min={0}
            precision={2}
            prefix="¥"
            placeholder="输入新金额"
          />
        </div>

        {/* Price change preview */}
        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 4 }}>
          <div style={{ fontSize: 16 }}>
            调价: <span style={{ color: delta >= 0 ? '#f5222d' : '#52c41a' }}>{deltaText}</span>
          </div>
          <div style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
            ¥{current.toFixed(2)} → ¥{newAmount.toFixed(2)}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Alert type="error" message={error} showIcon />
        )}

        {/* Warning for D-09 */}
        <Alert
          type="warning"
          message="注意：改价只能是减少金额"
          description="由于成本价字段不可用，前端仅做减价校验，实际成本价校验由后端处理。"
          showIcon
        />

        {/* Optional reason */}
        <div>
          <div style={{ marginBottom: 8, color: '#888' }}>改价原因（可选）</div>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="输入改价原因..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #d9d9d9',
              resize: 'none',
            }}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default PriceEditor;
