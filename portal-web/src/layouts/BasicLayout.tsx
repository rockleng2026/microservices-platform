import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Outlet, Link, useLocation } from 'umi';
import { DashboardOutlined, TeamOutlined, CustomerServiceOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const BasicLayout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">工作台</Link>,
    },
    {
      key: '/organization',
      icon: <TeamOutlined />,
      label: '组织架构',
      children: [
        {
          key: '/organization/departments',
          label: <Link to="/organization/departments">部门管理</Link>,
        },
        {
          key: '/organization/employees',
          label: <Link to="/organization/employees">员工管理</Link>,
        },
        {
          key: '/organization/positions',
          label: <Link to="/organization/positions">岗位管理</Link>,
        },
      ],
    },
    {
      key: '/crm',
      icon: <CustomerServiceOutlined />,
      label: 'CRM管理',
      children: [
        {
          key: '/crm/customers',
          label: <Link to="/crm/customers">客户管理</Link>,
        },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ 
          height: 64, 
          padding: '16px', 
          color: 'white', 
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Portal 3.0
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/organization', '/crm']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            现代化企业管理系统
          </div>
          <Button 
            type="primary" 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout; 