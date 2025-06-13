import React, { useState } from 'react';
import { Layout, Button, Input, Badge } from 'antd';
import { Outlet, useLocation } from 'umi';
import { 
  SearchOutlined,
  BellOutlined,
  MenuOutlined
} from '@ant-design/icons';
import UserMenu from '../components/UserMenu';
import DynamicMenu from '../components/DynamicMenu';
import { MenuPermission } from '../services/portal';
import './BasicLayout.less';

const { Header, Sider, Content, Footer } = Layout;

const BasicLayout: React.FC = () => {
  const location = useLocation();
  const [menus, setMenus] = useState<MenuPermission[]>([]);

  // 处理菜单更新
  const handleMenuUpdate = (newMenus: any[]) => {
    console.log('BasicLayout: 接收到菜单数据:', newMenus);
    setMenus(newMenus);
  };

  // 获取当前页面标题
  const getCurrentPageTitle = () => {
    const pathTitleMap: { [key: string]: string } = {
      '/dashboard': '工作台',
      '/organization/departments': '部门管理',
      '/organization/employees': '员工管理',
      '/organization/positions': '岗位管理',
      '/organization/departments/positions': '部门岗位',
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
          <DynamicMenu
            menus={menus}
            theme="light"
            mode="inline"
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
          
          <UserMenu onMenuUpdate={handleMenuUpdate} />
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