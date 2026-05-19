/**
 * 微信支付配置页面 - ADMIN-11
 * 提供微信支付参数配置和测试功能
 * ADMIN-11-01: 配置表单
 * ADMIN-11-02: 测试连接
 * ADMIN-11-03: 状态显示
 */
import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  message,
  Alert,
  Divider,
  Spin,
} from 'antd';
import { SaveOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAdminStore } from '@/stores/mallAdminStore';
import type { WeChatConfig } from '@/services/mall-admin/wechatConfig';
import './index.less';

const { Title, Text } = Typography;
const { Password } = Input;

// 状态配置
const STATUS_CONFIG = {
  unconfigured: { color: 'error', text: '未配置', icon: <CloseCircleOutlined /> },
  configured: { color: 'success', text: '已配置', icon: <CheckCircleOutlined /> },
  testing: { color: 'processing', text: '测试中...', icon: <Spin size="small" /> },
  success: { color: 'success', text: '配置正常', icon: <CheckCircleOutlined /> },
  failed: { color: 'warning', text: '配置异常', icon: <ExclamationCircleOutlined /> },
};

const WeChatConfigPage: React.FC = () => {
  const [form] = Form.useForm<WeChatConfig>();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const {
    wechatConfig,
    wechatConfigStatus,
    wechatConfigLoading,
    fetchWeChatConfig,
    updateWeChatConfig,
    testWeChatConfig,
  } = useAdminStore();

  // 加载配置
  useEffect(() => {
    fetchWeChatConfig();
  }, []);

  // 表单赋值
  useEffect(() => {
    if (wechatConfig) {
      form.setFieldsValue({
        appId: wechatConfig.appId || '',
        mchId: wechatConfig.mchId || '',
        apiKey: wechatConfig.apiKey || '',
        certPath: wechatConfig.certPath || '',
      });
    }
  }, [wechatConfig, form]);

  // 状态标签
  const statusInfo = STATUS_CONFIG[wechatConfigStatus] || STATUS_CONFIG.unconfigured;

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const success = await updateWeChatConfig(values);

      if (success) {
        message.success('微信支付配置保存成功');
      } else {
        message.error('保存失败，请重试');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error('表单验证失败，请检查输入');
    } finally {
      setSaving(false);
    }
  };

  // 测试连接
  const handleTest = async () => {
    try {
      const values = await form.validateFields();
      setTesting(true);

      // 先保存当前表单值（确保测试的是最新配置）
      await updateWeChatConfig(values);

      // 然后测试连接
      const result = await testWeChatConfig();

      if (result.success) {
        message.success(result.message);
      } else {
        message.warning(result.message);
      }
    } catch (error) {
      console.error('Failed to test config:', error);
      message.error('测试连接失败，请检查配置');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="wechat-config-page">
      <Card>
        {/* 页面标题 */}
        <div className="page-header">
          <Title level={4}>微信支付配置</Title>
          <Text type="secondary">配置微信支付参数，用于小程序支付功能</Text>
        </div>

        {/* 状态提示 */}
        <Alert
          message={
            <Space>
              {statusInfo.icon}
              <span>配置状态：</span>
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            </Space>
          }
          type={wechatConfigStatus === 'failed' ? 'warning' : 'info'}
          showIcon
          icon={wechatConfigStatus === 'unconfigured' || wechatConfigStatus === 'failed' ? <ExclamationCircleOutlined /> : undefined}
          style={{ marginBottom: 24 }}
        />

        {wechatConfigLoading && wechatConfigStatus === 'unconfigured' ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">加载配置中...</Text>
            </div>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              appId: '',
              mchId: '',
              apiKey: '',
              certPath: '',
            }}
          >
            <Divider orientation="left">支付参数</Divider>

            <Form.Item
              name="appId"
              label="AppID"
              rules={[
                { required: true, message: '请输入微信支付AppID' },
              ]}
              help="微信支付分配的公众账号ID（示例：wx1234567890abcdef）"
            >
              <Input placeholder="请输入微信支付AppID" />
            </Form.Item>

            <Form.Item
              name="mchId"
              label="商户号（MCH_ID）"
              rules={[
                { required: true, message: '请输入商户号' },
                { pattern: /^\d+$/, message: '商户号必须为纯数字' },
              ]}
              help="微信支付分配的商户号（示例：1234567890）"
            >
              <Input placeholder="请输入微信支付商户号" />
            </Form.Item>

            <Form.Item
              name="apiKey"
              label="API密钥（API_KEY）"
              rules={[
                { required: true, message: '请输入API密钥' },
              ]}
              help="微信支付API密钥，需在商户平台设置32位密钥"
            >
              <Password placeholder="请输入API密钥（32位）" />
            </Form.Item>

            <Form.Item
              name="certPath"
              label="证书路径（CERT_PATH）"
              rules={[
                { required: true, message: '请输入证书路径' },
              ]}
              help="微信支付证书路径（apiclient_cert.p12），用于JSAPI退款"
            >
              <Input placeholder="请输入证书路径或上传证书文件" />
            </Form.Item>

            <Divider />

            <Form.Item>
              <Space size="large">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                >
                  保存配置
                </Button>
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={handleTest}
                  loading={testing}
                >
                  测试连接
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}

        {/* 帮助说明 */}
        <Divider orientation="left">配置说明</Divider>
        <div className="config-help">
          <ul>
            <li><Text type="secondary">AppID：微信公众平台获取，用于标识公众号或小程序的唯一身份</Text></li>
            <li><Text type="secondary">商户号：微信支付商户平台获取，用于识别商户身份</Text></li>
            <li><Text type="secondary">API密钥：商户平台 -> API安全 -> 设置API密钥（32位）</Text></li>
            <li><Text type="secondary">证书路径：商户平台 -> API安全 -> 申请退款证书，下载后部署到服务器</Text></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default WeChatConfigPage;