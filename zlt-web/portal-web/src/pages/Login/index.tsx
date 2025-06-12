import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, ReloadOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { login, getCaptcha } from '@/services/auth';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaUrl, setCaptchaUrl] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');

  // 生成UUID设备ID - 参照layui-web的Math.uuid()实现
  const generateDeviceId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 刷新验证码 - 参照layui-web的实现方式
  const refreshCaptcha = () => {
    const newDeviceId = generateDeviceId();
    setDeviceId(newDeviceId);
    
    // 直接构建验证码URL，不需要异步调用
    const captchaImageUrl = `http://127.0.0.1:9900/api-uaa/validata/code/${newDeviceId}`;
    setCaptchaUrl(captchaImageUrl);
    
    console.log('刷新验证码，设备ID:', newDeviceId);
    console.log('验证码URL:', captchaImageUrl);
  };

  // 组件加载时获取验证码
  useEffect(() => {
    refreshCaptcha();
  }, []);

  // 验证码图片点击刷新 - 参照layui-web的实现
  const handleCaptchaClick = () => {
    // 添加时间戳刷新，保持当前deviceId不变
    const newUrl = captchaUrl.split('?')[0] + '?t=' + Date.now();
    setCaptchaUrl(newUrl);
    console.log('点击刷新验证码:', newUrl);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // 调用Portal登录接口（密码验证码模式） - 参照layui-web的参数格式
      const loginData = {
        username: values.username,
        password: values.password,
        validCode: values.validCode,
        deviceId: deviceId,
        client_id: 'webApp',
        client_secret: 'webApp',
        account_type: 'portal'
      };
      
      console.log('开始Portal用户登录，参数:', loginData);
      const loginResult = await login(loginData);
      
      // 检查登录结果 - 参照layui-web的响应处理
      if (loginResult && loginResult.resp_code === 0 && loginResult.datas && loginResult.datas.access_token) {
        // 保存token
        localStorage.setItem('access_token', loginResult.datas.access_token);
        localStorage.setItem('refresh_token', loginResult.datas.refresh_token || '');
        
        console.log('Portal用户登录成功，Token:', loginResult.datas.access_token.substring(0, 20) + '...');
        
        message.success('登录成功');
        
        // 跳转到工作台
        history.push('/dashboard');
      } else {
        // 处理登录失败情况
        const errorMessage = loginResult?.resp_msg || '登录失败：未获取到访问令牌';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Portal用户登录失败:', error);
      const errorMessage = error.message || error.error_description || '登录失败，请检查用户名密码和验证码';
      message.error(errorMessage);
      // 登录失败后刷新验证码
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <Card style={{ width: 400, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Portal 3.0</Title>
          <Text type="secondary">现代化企业管理系统</Text>
        </div>
        
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          initialValues={{
            username: 'admin',
            password: 'admin123'
          }}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item
            name="validCode"
            rules={[
              { required: true, message: '请输入验证码' },
            ]}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                prefix={<SafetyOutlined />}
                placeholder="验证码"
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {captchaUrl && (
                  <img
                    src={captchaUrl}
                    alt="验证码"
                    style={{ 
                      height: '32px', 
                      cursor: 'pointer', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      minWidth: '80px'
                    }}
                    onClick={handleCaptchaClick}
                    onError={(e) => {
                      console.error('验证码图片加载失败:', captchaUrl);
                      // 图片加载失败时重新刷新验证码
                      setTimeout(refreshCaptcha, 1000);
                    }}
                  />
                )}
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refreshCaptcha}
                  size="small"
                  title="刷新验证码"
                />
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Checkbox>记住我</Checkbox>
              <a href="#forgot">忘记密码？</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            Portal用户账号: admin / admin123<br/>
            点击验证码图片可刷新<br/>
            验证码URL: {captchaUrl ? '已加载' : '未加载'}<br/>
            设备ID: {deviceId}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login; 