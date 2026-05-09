/**
 * BannerModal - Create/Edit Banner Modal
 * ADMIN-10-01 (create), ADMIN-10-02 (edit)
 */
import React, { useEffect } from 'react';
import { Modal, Form, Input, Radio, InputNumber, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { BannerDTO, LINK_TYPE } from '../services/banners';

const { TextArea } = Input;

interface BannerModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: BannerDTO;
  onSubmit: (values: BannerDTO) => Promise<void>;
  onCancel: () => void;
  linkType?: number;
}

const BannerModal: React.FC<BannerModalProps> = ({
  visible,
  mode,
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<BannerDTO>();
  const isCreate = mode === 'create';

  useEffect(() => {
    if (visible) {
      if (isCreate) {
        form.resetFields();
        form.setFieldsValue({
          title: '',
          imageUrl: '',
          linkType: 1,
          goodsId: undefined,
          externalUrl: '',
          sort: 0,
          status: 1,
        });
      } else if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, isCreate, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const linkTypeValue = Form.useWatch('linkType', form) || 1;

  return (
    <Modal
      title={isCreate ? '添加 Banner' : '编辑 Banner'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isCreate ? '创建' : '保存'}
      cancelText="取消"
      width={480}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          linkType: 1,
          status: 1,
          sort: 0,
        }}
      >
        <Form.Item
          name="title"
          label="Banner 标题"
          rules={[
            { required: true, message: '请输入 Banner 标题' },
            { max: 100, message: '标题最多100个字符' },
          ]}
        >
          <Input placeholder="请输入 Banner 标题" maxLength={100} showCount />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="Banner 图片"
          rules={[
            { required: true, message: '请输入 Banner 图片地址' },
            { type: 'url', message: '请输入有效的 URL 地址' },
          ]}
          extra="建议尺寸 1920x400 或等比例图片"
        >
          <Input placeholder="请输入图片 URL" />
        </Form.Item>

        <Form.Item
          name="linkType"
          label="链接类型"
          rules={[{ required: true, message: '请选择链接类型' }]}
        >
          <Radio.Group>
            <Radio value={1}>商品详情页</Radio>
            <Radio value={2}>外部链接</Radio>
          </Radio.Group>
        </Form.Item>

        {linkTypeValue === 1 && (
          <Form.Item
            name="goodsId"
            label="商品 ID"
            rules={[{ required: true, message: '请输入商品 ID' }]}
            extra="关联到商品详情页"
          >
            <InputNumber
              placeholder="请输入商品 ID"
              min={1}
              style={{ width: '100%' }}
              precision={0}
            />
          </Form.Item>
        )}

        {linkTypeValue === 2 && (
          <Form.Item
            name="externalUrl"
            label="外部链接 URL"
            rules={[
              { required: true, message: '请输入外部链接 URL' },
              { type: 'url', message: '请输入有效的 URL 地址' },
            ]}
          >
            <Input placeholder="请输入完整的 URL，如 https://example.com" />
          </Form.Item>
        )}

        <Form.Item
          name="sort"
          label="排序号"
          extra="数字越小越靠前"
        >
          <InputNumber min={0} max={9999} precision={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
        >
          <Radio.Group>
            <Radio value={1}>启用</Radio>
            <Radio value={0}>禁用</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BannerModal;
