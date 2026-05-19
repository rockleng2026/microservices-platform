/**
 * 优惠券创建/编辑页面
 *
 * ADMIN-04-01 创建优惠券
 * ADMIN-04-02 编辑优惠券
 *
 * 路由:
 * - /coupons/create (新建)
 * - /coupons/edit/:id (编辑)
 */

import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ProForm, ProFormDateRangePicker, ProFormDigit, ProFormGroup, ProFormRadio, ProFormText } from '@ant-design/pro-form';
import { Card, Button, message, Typography, Divider, RadioChangeEvent } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useParams } from 'umi';
import dayjs from 'dayjs';
import { CouponTemplateParams, createCouponTemplate, getCouponTemplateList, updateCouponTemplate } from './services/coupons';

const { Text } = Typography;

const CouponCreatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [validType, setValidType] = useState<number>(1);

  /** 有效期类型切换 */
  const handleValidTypeChange = (value: number) => {
    setValidType(value);
  };

  /** 表单提交 */
  const handleFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      // 固定日期：开始时间 00:00:00，结束时间下一天减1秒
      let startTime: string | undefined;
      let endTime: string | undefined;
      if (values.validType === 1 && values.validTime) {
        const [startDate, endDate] = values.validTime as [dayjs.Dayjs, dayjs.Dayjs];
        startTime = startDate.format('yyyy-MM-dd 00:00:00');
        // 结束时间为选择日期的下一天减1秒
        endTime = endDate.add(1, 'day').subtract(1, 'second').format('yyyy-MM-dd HH:mm:ss');
      }
      const params: CouponTemplateParams = {
        name: values.name as string,
        type: values.type as 1 | 2,
        faceValue: values.faceValue as string,
        discountRate: values.discountRate as string,
        minAmount: values.minAmount as string,
        maxDiscount: values.maxDiscount as string,
        totalCount: values.totalCount as number,
        perUserLimit: values.perUserLimit as number,
        validType: values.validType as 1 | 2,
        startTime,
        endTime,
        validDays: values.validDays as number,
      };

      if (isEdit && id) {
        await updateCouponTemplate(parseInt(id), params);
        message.success('优惠券已更新');
      } else {
        await createCouponTemplate(params);
        message.success('优惠券已创建');
      }
      history.push('/coupons');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title={isEdit ? '编辑优惠券' : '创建优惠券'}
      onBack={() => history.push('/coupons')}
      backIcon={<ArrowLeftOutlined />}
    >
      <Card>
        <ProForm
          onFinish={handleFinish}
          submitter={{
            searchConfig: {
              submitText: '保存',
              resetText: '取消',
            },
            render: (_, dom) => [
              <Button key="cancel" onClick={() => history.push('/coupons')}>
                取消
              </Button>,
              <Button key="submit" type="primary" loading={loading} htmlType="submit">
                <SaveOutlined /> {isEdit ? '保存修改' : '创建优惠券'}
              </Button>,
            ],
          }}
        >
          <Divider>基本信息</Divider>

          <ProFormText
            name="name"
            label="优惠券名称"
            placeholder="请输入优惠券名称"
            rules={[{ required: true, message: '请输入优惠券名称' }]}
            fieldProps={{ maxLength: 50 }}
          />

          <ProFormRadio.Group
            name="type"
            label="优惠券类型"
            options={[
              { label: '满减券', value: 1 },
              { label: '折扣券', value: 2 },
            ]}
            rules={[{ required: true, message: '请选择优惠券类型' }]}
          />

          <ProFormGroup>
            <ProFormDigit
              name="faceValue"
              label="满减金额"
              placeholder="请输入减免金额"
              tooltip="type=1 满减券时必填，如输入 100 表示满减 100 元"
              min={0}
              fieldProps={{ precision: 2 }}
              width="sm"
              rules={[{ required: true, message: '请输入满减金额' }]}
            />
            <ProFormDigit
              name="discountRate"
              label="折扣率"
              placeholder="如 0.8 表示 8 折"
              tooltip="type=2 折扣券时必填，0-1 之间，如 0.8 表示 8 折"
              min={0}
              max={1}
              fieldProps={{ precision: 2 }}
              width="sm"
            />
          </ProFormGroup>

          <ProFormGroup>
            <ProFormDigit
              name="minAmount"
              label="最低消费金额"
              placeholder="请输入最低消费金额"
              tooltip="订单需达到此金额才能使用优惠券"
              min={0}
              fieldProps={{ precision: 2 }}
              width="sm"
              rules={[{ required: true, message: '请输入最低消费金额' }]}
            />
            <ProFormDigit
              name="maxDiscount"
              label="最高优惠"
              placeholder="请输入最高优惠金额"
              tooltip="type=2 折扣券时设置最高优惠上限，如 50 表示最多优惠 50 元"
              min={0}
              fieldProps={{ precision: 2 }}
              width="sm"
            />
          </ProFormGroup>

          <Divider>发放设置</Divider>

          <ProFormGroup>
            <ProFormDigit
              name="totalCount"
              label="总数量"
              placeholder="请输入总数量"
              tooltip="优惠券的总发行数量"
              min={1}
              width="sm"
              rules={[{ required: true, message: '请输入总数量' }]}
            />
            <ProFormDigit
              name="perUserLimit"
              label="每人限领"
              placeholder="请输入每人限领数量"
              tooltip="每个用户最多能领取的数量，1 表示每人只能领 1 张"
              min={1}
              width="sm"
              rules={[{ required: true, message: '请输入每人限领数量' }]}
            />
          </ProFormGroup>

          <Divider>有效期设置</Divider>

          <ProFormRadio.Group
            name="validType"
            label="有效期类型"
            options={[
              { label: '固定时间', value: 1 },
              { label: '领券后N天', value: 2 },
            ]}
            rules={[{ required: true, message: '请选择有效期类型' }]}
            fieldProps={{
              onChange: (e: RadioChangeEvent) => handleValidTypeChange(e.target.value),
            }}
          />

          {/* 固定日期：使用 ProFormDateRangePicker */}
          <ProForm.Group>
            <ProFormDateRangePicker
              name="validTime"
              label="固定有效期"
              disabled={validType === 2}
              fieldProps={{
                format: 'YYYY-MM-DD',
                placeholder: ['开始日期', '结束日期'],
              }}
              rules={[{ required: validType === 1, message: '请选择固定有效期' }]}
            />
          </ProForm.Group>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            固定日期：开始时间为选择日 00:00:00，结束时间为下一天 00:00:00 减1秒（即 23:59:59）
          </Text>

          <ProFormDigit
            name="validDays"
            label="有效天数"
            placeholder="请输入有效天数"
            tooltip="领券后多少天内有效，如输入 7 表示领券后 7 天内有效"
            min={1}
            width="sm"
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default CouponCreatePage;