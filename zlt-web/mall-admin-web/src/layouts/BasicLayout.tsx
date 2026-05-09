import React, { useState } from 'react';
import { Layout, Button, Input, Badge } from 'antd';
import { Outlet, useLocation } from 'umi';
import {
  SearchOutlined,
  BellOutlined,
  MenuOutlined
} from '@ant-design/icons';
import './BasicLayout.less';

const { Header, Sider, Content, Footer } = Layout;

// 简化版菜单数据（后续 Phase 10+ 再对接动态菜单）
const menuItems = [
  { path: '/dashboard', name: '工作台' },
  { path: '/goods', name: '商品管理' },
  { path: '/orders', name: '订单管理' },
];

const BasicLayout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // 获取当前页面标题
  const getCurrentPageTitle = () => {
    const pathTitleMap: { [key: string]: string } = {
      '/dashboard': '工作台',
      '/goods': '商品管理',
      '/orders': '订单管理',
    };
    return pathTitleMap[location.pathname] || '工作台';
  };

  return (
    <div className="app-layout">
      {/* 左侧导航 */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">Mall Admin</span>
          </div>
        </div>
        <div className="sidebar-menu">
          {menuItems.map(item => (
            <div
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => window.location.href = item.path}
            >
              {item.name}
            </div>
          ))}
        </div>
      </aside>

      {/* 头部区域 */}
      <header className="app-header">
        <div className="header-left">
          <button className="mobile-menu-toggle" onClick={() => setCollapsed(!collapsed)}>
            <MenuOutlined />
          </button>
          <div className="breadcrumb">
            <span className="breadcrumb-item">Mall Admin</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item">{getCurrentPageTitle()}</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <Input
              className="search-input"
              placeholder="搜索..."
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

          {/* 简化版 UserMenu（后续 Phase 10+ 再对接用户中心） */}
          <div className="user-menu">
            <span className="user-name">Admin</span>
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
          <span>© 2024 Mall Admin 管理平台</span>
          <span>|</span>
          <span>技术支持</span>
        </div>
      </footer>
    </div>
  );
};

export default BasicLayout;