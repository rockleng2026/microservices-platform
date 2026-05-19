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
import { getCategoryList } from '../../Categories/services/categories';
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
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);
  const [goodsType, setGoodsType] = useState<number>(1);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoryList();
        if (data && data.length > 0) {
          // Flatten tree structure for dropdown
          const flattenCategories = (cats: any[], parentLabel = ''): { label: string; value: number }[] => {
            let result: { label: string; value: number }[] = [];
            for (const cat of cats) {
              const label = parentLabel ? `${parentLabel} / ${cat.name}` : cat.name;
              result.push({ label, value: cat.id });
              if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children, label));
              }
            }
            return result;
          };
          setCategories(flattenCategories(data));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    if (visible) {
      loadCategories();
    }
  }, [visible]);

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
      form.setFieldsValue({ goodsType: 1 });
      setImages([]);
      setSkus([]);
      setGoodsType(1);
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
          options={categories}
        />

        <Form.Item name="goodsType" label="商品类型" rules={[{ required: true, message: '请选择商品类型' }]}>
          <Radio.Group value={goodsType} onChange={(e) => setGoodsType(e.target.value)}>
            <Radio value={1}>实物商品（实体发货）</Radio>
            <Radio value={2}>虚拟商品（无需物流）</Radio>
          </Radio.Group>
        </Form.Item>

        <ProFormDigit
          name="price"
          label="商品价格"
          placeholder="请输入商品价格"
          rules={[{ required: true, message: '请输入商品价格' }]}
          min={0}
          precision={2}
          prefix="¥"
        />

        {goodsType === 1 && (
          <ProFormDigit
            name="stock"
            label="总库存"
            placeholder="请输入总库存（无规格时使用）"
            min={0}
          />
        )}

        {goodsType === 2 && (
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

      <Divider orientation="left">SKU 规格管理（可选）</Divider>
      <div style={{ marginBottom: 8, color: '#888', fontSize: 12 }}>
        添加 SKU 可以设置多规格商品的价格和库存，如颜色、尺寸等组合。无 SKU 时使用商品主价格。
      </div>

      <SkuEditor value={skus} onChange={setSkus} />
    </Modal>
  );
};

export default GoodsModal;