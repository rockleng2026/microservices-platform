import React, { useState, useEffect } from 'react';
import { Dropdown, Space, Avatar, Button, Menu, message } from 'antd';
import { UserOutlined, DownOutlined, SettingOutlined, LogoutOutlined, SwapOutlined } from '@ant-design/icons';
import { getCurrentUser, getCurrentUserMenus } from '../../services/auth';
import LogoutConfirm from '../LogoutConfirm';
import './index.less';

interface UserMenuProps {
  onMenuUpdate?: (menus: any[]) => void;
}

interface UserInfo {
  user?: any;
  employee?: any;
  positions?: any[];
  currentPosition?: any;
}

const UserMenu: React.FC<UserMenuProps> = ({ onMenuUpdate }) => {
  console.log('UserMenu: 组件被渲染, onMenuUpdate:', onMenuUpdate);
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

    // 加载用户信息和菜单权限
  const loadUserData = async () => {
    if (initialized) {
      console.log('UserMenu: 已初始化，跳过重复调用');
      return; // 防止重复调用
    }
    
    console.log('UserMenu: 开始加载用户数据...');
    setLoading(true);
    try {
      // 获取用户信息
      const userResponse = await getCurrentUser();
      console.log('UserMenu: 获取用户信息响应:', userResponse);
      
      // 获取菜单权限  
      const menuResponse = await getCurrentUserMenus();
      console.log('UserMenu: 获取菜单权限响应:', menuResponse);
      
      if (userResponse && userResponse.resp_code === 0) {
        console.log('UserMenu: 设置用户信息:', userResponse.datas);
        setUserInfo(userResponse.datas);
        setInitialized(true);
        
        // 通知父组件更新菜单
        if (menuResponse && menuResponse.resp_code === 0) {
          console.log('UserMenu: 准备传递菜单数据给父组件:', menuResponse.datas);
          console.log('UserMenu: onMenuUpdate回调函数存在:', !!onMenuUpdate);
          if (onMenuUpdate) {
            onMenuUpdate(menuResponse.datas);
            console.log('UserMenu: 已调用onMenuUpdate');
          } else {
            console.log('UserMenu: onMenuUpdate回调函数为空');
          }
        } else {
          console.log('UserMenu: 菜单数据为空或获取失败', menuResponse);
        }
      } else {
        console.log('UserMenu: 用户信息获取失败', userResponse);
        message.error(userResponse?.resp_msg || '获取用户信息失败');
      }
    } catch (error) {
      console.error('UserMenu: 加载用户数据失败:', error);
      message.error('加载用户数据失败，请重试');
    } finally {
      console.log('UserMenu: 设置loading为false');
      setLoading(false);
    }
  };

  // 组件初始化时加载用户信息
  useEffect(() => {
    console.log('UserMenu: useEffect被调用, initialized:', initialized, 'loading:', loading);
    // 只要没有初始化就加载数据
    if (!initialized) {
      console.log('UserMenu: 调用loadUserData');
      loadUserData();
    }
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 生成用户头像
  const getUserAvatar = () => {
    if (userInfo?.user?.avatar) {
      return <Avatar src={userInfo.user.avatar} size={32} />;
    }
    
    const displayName = userInfo?.user?.nickname || userInfo?.employee?.name || userInfo?.user?.username || '';
    return (
      <Avatar size={32} style={{ backgroundColor: '#1890ff' }}>
        {displayName.charAt(0).toUpperCase()}
      </Avatar>
    );
  };

  // 用户下拉菜单
  const userDropdownMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人资料
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        个人设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        <LogoutConfirm 
          buttonType="text" 
          buttonText="退出登录"
          onLogoutSuccess={() => {
            message.success('已成功退出登录');
          }}
          onLogoutError={(error: any) => {
            console.error('退出登录失败:', error);
            message.error('退出登录失败，请重试');
          }}
        />
      </Menu.Item>
    </Menu>
  );

  if (loading) {
    return (
      <div className="user-menu loading">
        <Space>
          <Avatar size={32} icon={<UserOutlined />} />
          <span>加载中...</span>
        </Space>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="user-menu error">
        <Button type="link" onClick={() => {
          setInitialized(false);
          loadUserData();
        }}>
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <div className="user-menu">
      <Space size={16}>
        {/* 简化的岗位显示 - 暂时不支持切换 */}
        {userInfo.currentPosition && (
          <Space>
            <SwapOutlined style={{ color: '#666' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {userInfo.currentPosition.name}
            </span>
          </Space>
        )}
        
        {/* 用户信息下拉菜单 */}
        <Dropdown overlay={userDropdownMenu} placement="bottomRight">
          <div className="user-info" style={{ cursor: 'pointer' }}>
            <Space>
              {getUserAvatar()}
              <div className="user-details">
                <div className="user-name">
                  {userInfo.user?.nickname || userInfo.employee?.name || userInfo.user?.username}
                </div>
                <div className="user-position">
                  {userInfo.currentPosition?.name}
                </div>
              </div>
              <DownOutlined style={{ fontSize: 12, color: '#999' }} />
            </Space>
          </div>
        </Dropdown>
      </Space>
    </div>
  );
};

export default UserMenu; 