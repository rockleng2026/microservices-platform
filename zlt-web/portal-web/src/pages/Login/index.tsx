import React from 'react';
import { Card, Form, Input, Button, Checkbox, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { login, getCurrentUser, getCurrentUserMenus } from '@/services/auth';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // 调用Portal登录接口
      const loginData = {
        grant_type: 'password',
        username: values.username,
        password: values.password,
        client_id: 'portal-web',
        client_secret: 'portal-secret',
        account_type: 'portal'
      };
      
      console.log('开始Portal用户登录，用户名:', values.username);
      const loginResult = await login(loginData);
      
      if (loginResult.access_token) {
        // 保存token
        localStorage.setItem('access_token', loginResult.access_token);
        localStorage.setItem('refresh_token', loginResult.refresh_token || '');
        
        console.log('Portal用户登录成功，Token:', loginResult.access_token.substring(0, 20) + '...');
        
        // 获取用户信息
        try {
          const userInfo = await getCurrentUser();
          console.log('获取用户信息:', userInfo);
          localStorage.setItem('user_info', JSON.stringify(userInfo));
        } catch (userError) {
          console.warn('获取用户信息失败:', userError);
        }
        
        // 获取菜单权限
        try {
          const menus = await getCurrentUserMenus();
          console.log('获取菜单权限:', menus);
          localStorage.setItem('user_menus', JSON.stringify(menus));
        } catch (menuError) {
          console.warn('获取菜单权限失败:', menuError);
        }
        
        message.success('登录成功');
        
        // 跳转到工作台
        history.push('/dashboard');
      } else {
        throw new Error('登录失败：未获取到访问令牌');
      }
    } catch (error: any) {
      console.error('Portal用户登录失败:', error);
      const errorMessage = error.message || error.error_description || '登录失败，请检查用户名和密码';
      message.error(errorMessage);
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
            Portal用户账号: admin / admin123
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login; 