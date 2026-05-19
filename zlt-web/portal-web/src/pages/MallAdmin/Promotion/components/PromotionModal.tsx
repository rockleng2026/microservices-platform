/**
 * 促销活动新建/编辑弹窗 - ADMIN-05
 */
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import dayjs from 'dayjs';
import {
  PromotionDTO,
  PromotionType,
  createPromotion,
  updatePromotion,
} from '@/services/mall-admin/promotion';

const { TextArea } = Input;

interface PromotionModalProps {
  visible: boolean;
  record: PromotionDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 格式化日期显示 yyyy-MM-dd
 */
const formatDateForDisplay = (dateStr?: string): string => {
  if (!dateStr) return '';
  return datejs(dateStr).format('YYYY-MM-DD');
};

/**
 * 解析日期用于提交，自动补全时间
 */
const parseDateForSubmit = (dateStr: string, isStartTime: boolean): string => {
  if (!dateStr) return '';
  const dateOnly = dateStr.substring(0, 10);
  return isStartTime ? `${dateOnly}T00:00:00` : `${dateOnly}T23:59:59`;
};

const PromotionModal: React.FC<PromotionModalProps> = ({ visible, record, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // 监听 visible 变化，重置表单
  useEffect(() => {
    if (visible) {
      if (record) {
        // 编辑模式
        form.setFieldsValue({
          name: record.name,
          type: record.type,
          startTime: record.startTime ? dayjs(record.startTime) : undefined,
          endTime: record.endTime ? dayjs(record.endTime) : undefined,
          discountRate: record.discountRate,
          rules: record.rules,
          goodsScope: record.goodsScope,
        });
      } else {
        // 新建模式
        form.resetFields();
        form.setFieldsValue({
          type: PromotionType.DISCOUNT,
        });
      }
    }
  }, [visible, record]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload: Partial<PromotionDTO> = {
        name: values.name,
        type: values.type,
        startTime: values.startTime ? parseDateForSubmit(values.startTime.format('YYYY-MM-DD'), true) : undefined,
        endTime: values.endTime ? parseDateForSubmit(values.endTime.format('YYYY-MM-DD'), false) : undefined,
        discountRate: values.discountRate,
        rules: values.rules,
        goodsScope: values.goodsScope,
      };

      if (record?.id) {
        // 更新
        await updatePromotion(record.id, payload);
        message.success('更新成功');
      } else {
        // 新建
        await createPromotion(payload);
        message.success('创建成功');
      }

      setLoading(false);
      onSuccess();
    } catch (error) {
      setLoading(false);
      console.error('Failed to save promotion:', error);
      message.error('保存失败');
    }
  };

  return (
    <Modal
      title={record ? '编辑促销活动' : '新建促销活动'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      width={600}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="活动名称"
          rules={[{ required: true, message: '请输入活动名称' }]}
        >
          <Input placeholder="例如: 618年中大促" />
        </Form.Item>

        <Form.Item
          name="type"
          label="活动类型"
          rules={[{ required: true, message: '请选择活动类型' }]}
        >
          <Select>
            <Select.Option value={PromotionType.DISCOUNT}>折扣</Select.Option>
            <Select.Option value={PromotionType.GIFT}>赠品</Select.Option>
            <Select.Option value={PromotionType.BUNDLE}>套餐</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="startTime"
          label="开始时间"
          rules={[{ required: true, message: '请选择开始时间' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="结束时间"
          rules={[{ required: true, message: '请选择结束时间' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        {/* 折扣类型额外字段 */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
          {({ getFieldValue }) => (
            <>
              {getFieldValue('type') === PromotionType.DISCOUNT && (
                <Form.Item
                  name="discountRate"
                  label="折扣率"
                  tooltip="例如: 0.85 表示85折"
                >
                  <InputNumber min={0.01} max={1} step={0.01} style={{ width: '100%' }} placeholder="0.85" />
                </Form.Item>
              )}
            </>
          )}
        </Form.Item>

        <Form.Item
          name="goodsScope"
          label="适用商品范围"
          tooltip="JSON格式，指定参与活动的商品ID列表"
        >
          <TextArea rows={3} placeholder='例如: {"goodsIds": [1, 2, 3]}' />
        </Form.Item>

        <Form.Item
          name="rules"
          label="活动规则"
          tooltip="JSON格式的活动规则配置"
        >
          <TextArea rows={4} placeholder='例如: {"minAmount": 100, "maxDiscount": 50}' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PromotionModal;