import React, { useMemo } from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'umi';
import {
  DashboardOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  PictureOutlined,
  BoxPlotOutlined,
} from '@ant-design/icons';
import { MenuPermission } from '../../services/portal';

interface DynamicMenuProps {
  menus: any[]; // 改为any[]以适配后端数据格式
  mode?: 'inline' | 'horizontal' | 'vertical';
  theme?: 'light' | 'dark';
  collapsed?: boolean;
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  team: <TeamOutlined />,
  'customer-service': <CustomerServiceOutlined />,
  appstore: <AppstoreOutlined />,
  shopping: <ShoppingOutlined />,
  'file-text': <FileTextOutlined />,
  'bar-chart': <BarChartOutlined />,
  setting: <SettingOutlined />,
  // 根据实际菜单图标扩展
  apartment: <TeamOutlined />,
  user: <TeamOutlined />,
  contacts: <CustomerServiceOutlined />,
  'user-group': <CustomerServiceOutlined />,
  box: <BoxPlotOutlined />,
  picture: <PictureOutlined />,
};

const DynamicMenu: React.FC<DynamicMenuProps> = ({
  menus,
  mode = 'inline',
  theme = 'light',
  collapsed = false
}) => {
  const location = useLocation();

  // 将菜单权限转换为Antd Menu所需的格式 - 适配后端数据格式
  const convertMenusToAntdMenus = (menuList: any[]): any[] => {
    return menuList
      .filter(menu => menu.visible !== false && menu.enabled !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(menu => {
        const menuItem: any = {
          key: menu.path || `menu-${menu.id}`,
          icon: iconMap[menu.icon || ''] || <AppstoreOutlined />,
          label: menu.path ? (
            <Link to={menu.path}>{menu.name}</Link>
          ) : (
            menu.name
          ),
        };

        // 处理子菜单
        if (menu.children && menu.children.length > 0) {
          menuItem.children = convertMenusToAntdMenus(menu.children);
        }

        return menuItem;
      });
  };

  // 生成菜单项
  const menuItems = useMemo(() => {
    console.log('DynamicMenu: 原始菜单数据:', menus);
    
    if (!menus || menus.length === 0) {
      console.log('DynamicMenu: 使用默认菜单');
      // 默认菜单结构（当没有权限菜单时）
      return [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: <Link to="/dashboard">工作台</Link>,
        },
      ];
    }
    
    const convertedMenus = convertMenusToAntdMenus(menus);
    console.log('DynamicMenu: 转换后的菜单:', convertedMenus);
    return convertedMenus;
  }, [menus]);

  // 获取当前选中的菜单keys
  const selectedKeys = useMemo(() => {
    const pathname = location.pathname;
    // 查找匹配的菜单路径
    const findMatchingMenuKey = (items: any[]): string[] => {
      for (const item of items) {
        if (item.key === pathname) {
          return [item.key];
        }
        if (item.children) {
          const childMatch = findMatchingMenuKey(item.children);
          if (childMatch.length > 0) {
            return childMatch;
          }
        }
      }
      return [];
    };

    return findMatchingMenuKey(menuItems);
  }, [location.pathname, menuItems]);

  // 获取默认展开的菜单keys
  const defaultOpenKeys = useMemo(() => {
    const openKeys: string[] = [];
    const pathname = location.pathname;
    
    const findParentKeys = (items: any[], targetPath: string, parentKeys: string[] = []): string[] => {
      for (const item of items) {
        const currentPath = [...parentKeys, item.key];
        
        if (item.key === targetPath) {
          return parentKeys;
        }
        
        if (item.children) {
          const found = findParentKeys(item.children, targetPath, currentPath);
          if (found.length > 0) {
            return found;
          }
        }
      }
      return [];
    };

    return findParentKeys(menuItems, pathname);
  }, [location.pathname, menuItems]);

  return (
    <Menu
      mode={mode}
      theme={theme}
      selectedKeys={selectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      items={menuItems}
      style={{ border: 'none' }}
      inlineCollapsed={collapsed}
    />
  );
};

export default DynamicMenu; 