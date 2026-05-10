/**
 * 商品新增/编辑 Modal - ADMIN-02-01, ADMIN-02-02, ADMIN-02-08
 * Product create/edit modal with form, images, and SKU editor
 */
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Radio, message, Divider } from 'antd';
import { ProForm, ProFormText, ProFormSelect, ProFormRadio, ProFormDigit } from '@ant-design/pro-components';
import type { ModalProps } from 'antd';
import {
  createGoods,
  updateGoods,
  getGoodsDetail,
  AdminGoodsDTO,
  GOODS_TYPE,
  GOODS_TYPE_TEXT,
} from '../services/goods';
import ImageUploader from './ImageUploader';
import SkuEditor, { SkuDTO } from './SkuEditor';

const { TextArea } = Input;

interface GoodsModalProps extends ModalProps {
  goods?: AdminGoodsDTO | null;  // If provided, it's edit mode
  onSuccess?: () => void;         // Called when save succeeds
}

/**
 * Parse images JSON string to array
 */
const parseImages = (imagesStr?: string): string[] => {
  if (!imagesStr) return [];
  try {
    return JSON.parse(imagesStr);
  } catch {
    return [];
  }
};

/**
 * Stringify images array to JSON
 */
const stringifyImages = (images: string[]): string => {
  return JSON.stringify(images);
};

const GoodsModal: React.FC<GoodsModalProps> = ({
  visible,
  goods,
  onSuccess,
  onClose,
  ...modalProps
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [skus, setSkus] = useState<SkuDTO[]>([]);
  const [goodsType, setGoodsType] = useState<number>(GOODS_TYPE.PHYSICAL);

  // Determine mode
  const isEdit = !!goods?.id;

  // Load goods data when editing
  useEffect(() => {
    if (visible && goods?.id) {
      // Load full goods detail for editing
      getGoodsDetail(goods.id)
        .then((detail) => {
          form.setFieldsValue({
            name: detail.name,
            subTitle: detail.subTitle,
            categoryId: detail.categoryId,
            goodsType: detail.goodsType,
            price: detail.price,
            stock: detail.stock,
            virtualUrl: detail.virtualUrl,
            detail: detail.detail,
          });
          setImages(parseImages(detail.images));
          setSkus(detail.skus || []);
          setGoodsType(detail.goodsType);
        })
        .catch((err) => {
          console.error('Failed to load goods detail:', err);
          message.error('加载商品详情失败');
        });
    } else if (visible && !goods?.id) {
      // Reset form for create mode
      form.resetFields();
      setImages([]);
      setSkus([]);
      setGoodsType(GOODS_TYPE.PHYSICAL);
    }
  }, [visible, goods, form]);

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      // Build goods data
      const goodsData: Partial<AdminGoodsDTO> = {
        name: values.name,
        subTitle: values.subTitle,
        categoryId: values.categoryId,
        goodsType: values.goodsType,
        price: values.price,
        stock: values.stock,
        virtualUrl: values.virtualUrl,
        images: stringifyImages(images),
        detail: values.detail,
        skus: skus,
      };

      let success = false;

      if (isEdit && goods?.id) {
        // Update existing goods
        goodsData.id = goods.id;
        success = await updateGoods(goodsData);
      } else {
        // Create new goods
        success = await createGoods(goodsData);
      }

      if (success) {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Submit failed:', error);
      message.error('保存失败，请检查表单');
    } finally {
      setLoading(false);
    }
  };

  // Handle goods type change
  const handleGoodsTypeChange = (type: number) => {
    setGoodsType(type);
    form.setFieldValue('goodsType', type);
  };

  return (
    <Modal
      title={isEdit ? '编辑商品' : '新建商品'}
      visible={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={720}
      destroyOnClose
      {...modalProps}
    >
      <ProForm
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        submitter={false}
      >
        {/* Basic info section */}
        <ProFormText
          name="name"
          label="商品名称"
          placeholder="请输入商品名称"
          rules={[{ required: true, message: '请输入商品名称' }]}
        />

        <ProFormText
          name="subTitle"
          label="副标题"
          placeholder="请输入商品副标题"
        />

        <ProFormSelect
          name="categoryId"
          label="商品分类"
          placeholder="请选择商品分类"
          rules={[{ required: true, message: '请选择商品分类' }]}
          options={[
            // TODO: Load from category API
            { label: '服装', value: 1 },
            { label: '电子产品', value: 2 },
          ]}
        />

        <ProFormRadio
          name="goodsType"
          label="商品类型"
          options={[
            { label: '实物商品', value: GOODS_TYPE.PHYSICAL },
            { label: '虚拟商品', value: GOODS_TYPE.VIRTUAL },
          ]}
          value={goodsType}
          onChange={(e) => handleGoodsTypeChange(e.target.value)}
        />

        <ProFormDigit
          name="price"
          label="商品价格"
          placeholder="请输入商品价格"
          rules={[{ required: true, message: '请输入商品价格' }]}
          min={0}
          precision={2}
          prefix="¥"
        />

        {goodsType === GOODS_TYPE.PHYSICAL && (
          <ProFormDigit
            name="stock"
            label="总库存"
            placeholder="请输入总库存（无规格时使用）"
            min={0}
          />
        )}

        {goodsType === GOODS_TYPE.VIRTUAL && (
          <ProFormText
            name="virtualUrl"
            label="虚拟商品链接"
            placeholder="请输入虚拟商品访问链接或兑换码"
          />
        )}

        <Form.Item name="images" label="商品图片">
          <ImageUploader value={images} onChange={setImages} maxFiles={5} />
        </Form.Item>

        <Form.Item name="detail" label="商品详情">
          <TextArea rows={4} placeholder="请输入商品详情描述" />
        </Form.Item>
      </ProForm>

      <Divider orientation="left">SKU 规格管理</Divider>

      <SkuEditor value={skus} onChange={setSkus} />
    </Modal>
  );
};

export default GoodsModal;