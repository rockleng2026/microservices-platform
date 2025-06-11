import React from 'react';
import { Card, Space, Divider, Typography, Button } from 'antd';
import { PoweroffOutlined, UserOutlined } from '@ant-design/icons';
import LogoutConfirm from '../../components/LogoutConfirm';

const { Title, Paragraph, Text } = Typography;

/**
 * 退出功能测试页面
 * 展示LogoutConfirm组件的各种使用方式
 */
const LogoutTestPage: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>退出登录功能测试</Title>
      
      <Paragraph>
        这个页面展示了Portal Web退出登录功能的各种使用方式，参考了layui-web和react-web的最佳实践。
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 基本使用 */}
        <Card title="基本使用" bordered={false}>
          <Space size="middle">
            <LogoutConfirm />
            <LogoutConfirm buttonText="登出" />
            <LogoutConfirm buttonText="安全退出" showIcon={false} />
          </Space>
          <Divider />
          <Text type="secondary">
            默认配置：文本按钮、显示图标、确认对话框
          </Text>
        </Card>

        {/* 不同按钮类型 */}
        <Card title="不同按钮类型" bordered={false}>
          <Space size="middle" wrap>
            <LogoutConfirm buttonType="default" buttonText="默认按钮" />
            <LogoutConfirm buttonType="primary" buttonText="主要按钮" />
            <LogoutConfirm buttonType="dashed" buttonText="虚线按钮" />
            <LogoutConfirm buttonType="link" buttonText="链接按钮" />
            <LogoutConfirm buttonType="text" buttonText="文本按钮" />
          </Space>
          <Divider />
          <Text type="secondary">
            支持Ant Design的所有按钮类型
          </Text>
        </Card>

        {/* 自定义渲染 */}
        <Card title="自定义渲染" bordered={false}>
          <Space size="middle" wrap>
            <LogoutConfirm
              renderButton={(onClick, loading) => (
                <Button 
                  type="primary" 
                  danger 
                  icon={<PoweroffOutlined />}
                  onClick={onClick}
                  loading={loading}
                  size="large"
                >
                  立即退出
                </Button>
              )}
            />
            
            <LogoutConfirm
              renderButton={(onClick, loading) => (
                <Button 
                  type="ghost" 
                  icon={<UserOutlined />}
                  onClick={onClick}
                  loading={loading}
                  style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}
                >
                  {loading ? '退出中...' : '用户退出'}
                </Button>
              )}
            />
          </Space>
          <Divider />
          <Text type="secondary">
            使用renderButton属性可以完全自定义按钮外观和行为
          </Text>
        </Card>

        {/* 带回调函数 */}
        <Card title="带回调函数" bordered={false}>
          <Space size="middle">
            <LogoutConfirm
              buttonText="退出前确认"
              beforeLogout={async () => {
                console.log('执行退出前的检查...');
                return confirm('您有未保存的数据，确定要退出吗？');
              }}
              onLogoutSuccess={() => {
                console.log('退出成功回调');
              }}
              onLogoutError={(error) => {
                console.error('退出失败回调:', error);
              }}
            />
          </Space>
          <Divider />
          <Text type="secondary">
            支持退出前确认、成功和失败回调函数
          </Text>
        </Card>

        {/* 使用说明 */}
        <Card title="功能特性" bordered={false}>
          <Space direction="vertical" size="small">
            <Text>✅ 参考layui-web的确认对话框交互</Text>
            <Text>✅ 参考react-web的异步处理和错误恢复</Text>
            <Text>✅ 自动调用后端退出接口</Text>
            <Text>✅ 智能的本地存储清理</Text>
            <Text>✅ 网络异常时的强制退出选项</Text>
            <Text>✅ 完整的加载状态和用户反馈</Text>
            <Text>✅ 支持退出前的数据保存确认</Text>
            <Text>✅ 灵活的自定义渲染选项</Text>
          </Space>
        </Card>

        {/* 技术实现 */}
        <Card title="技术实现" bordered={false}>
          <Space direction="vertical" size="small">
            <Text><Text code>logout()</Text> - 标准退出流程，调用后端接口</Text>
            <Text><Text code>quickLogout()</Text> - 快速退出，仅清理本地数据</Text>
            <Text><Text code>isLoggedIn()</Text> - 检查登录状态和token有效性</Text>
            <Text><Text code>clearLocalStorage()</Text> - 清理所有相关的本地存储</Text>
            <Text><Text code>redirectToLogin()</Text> - 智能跳转到登录页面</Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default LogoutTestPage; 