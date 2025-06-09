import React from 'react';
import { Layout, Menu, Button, Input, Badge } from 'antd';
import { Outlet, Link, useLocation } from 'umi';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  CustomerServiceOutlined, 
  LogoutOutlined,
  SearchOutlined,
  BellOutlined,
  MenuOutlined
} from '@ant-design/icons';
import './BasicLayout.less';

const { Header, Sider, Content, Footer } = Layout;

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

  // 获取当前页面标题
  const getCurrentPageTitle = () => {
    const pathTitleMap: { [key: string]: string } = {
      '/dashboard': '工作台',
      '/organization/departments': '部门管理',
      '/organization/employees': '员工管理',
      '/organization/positions': '岗位管理',
      '/crm/customers': '客户管理',
    };
    return pathTitleMap[location.pathname] || '工作台';
  };

  return (
    <div className="app-layout">
      {/* 左侧导航 */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏢</span>
            <span className="logo-text">Portal 3.0</span>
          </div>
        </div>
        <div className="sidebar-menu">
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['/organization', '/crm']}
            items={menuItems}
            style={{ border: 'none' }}
          />
        </div>
      </aside>

      {/* 头部区域 */}
      <header className="app-header">
        <div className="header-left">
          <button className="mobile-menu-toggle">
            <MenuOutlined />
          </button>
          <div className="breadcrumb">
            <span className="breadcrumb-item">Portal 3.0</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item">{getCurrentPageTitle()}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <Input
              className="search-input"
              placeholder="搜索功能..."
              prefix={<SearchOutlined className="search-icon" />}
              style={{ width: 200 }}
            />
          </div>
          
          <Badge count={5} size="small">
            <Button 
              className="notification-btn"
              type="text" 
              icon={<BellOutlined />}
            />
          </Badge>
          
          <div className="user-menu">
            <div className="user-avatar">管</div>
            <span className="user-name">管理员</span>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-btn"
            >
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* 底部页脚 */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>© 2024 Portal 3.0 企业管理平台</span>
          <span>|</span>
          <span>技术支持</span>
        </div>
      </footer>
    </div>
  );
};

export default BasicLayout; 