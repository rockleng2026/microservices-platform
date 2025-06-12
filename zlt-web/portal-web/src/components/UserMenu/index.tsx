import React, { useState, useEffect } from 'react';
import { Dropdown, Space, Avatar, Button, Menu, message } from 'antd';
import { UserOutlined, DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { PortalUser, WorkPosition, getCurrentUserInfo } from '../../services/portal';
import PositionSelector from '../PositionSelector';
import LogoutConfirm from '../LogoutConfirm';
import './index.less';

interface UserMenuProps {
  onMenuUpdate?: (menus: any[]) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onMenuUpdate }) => {
  const [userInfo, setUserInfo] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载用户信息
  const loadUserInfo = async () => {
    setLoading(true);
    try {
      const response = await getCurrentUserInfo();
      if (response.success && response.data) {
        setUserInfo(response.data);
        // 通知父组件更新菜单
        onMenuUpdate?.(response.data.menus);
      } else {
        message.error(response.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      message.error('获取用户信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件初始化时加载用户信息
  useEffect(() => {
    loadUserInfo();
  }, []);

  // 处理岗位切换
  const handlePositionChange = (position: WorkPosition) => {
    if (userInfo) {
      const updatedUserInfo = {
        ...userInfo,
        currentPosition: position,
        employee: {
          ...userInfo.employee,
          positionId: position.id,
          positionName: position.name,
        },
      };
      setUserInfo(updatedUserInfo);
    }
  };

  // 处理菜单更新
  const handleMenuUpdate = () => {
    // 重新加载用户信息以获取最新的菜单权限
    loadUserInfo();
  };

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
          onLogoutError={(error) => {
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
        <Button type="link" onClick={loadUserInfo}>
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <div className="user-menu">
      <Space size={16}>
        {/* 岗位选择器 */}
        <PositionSelector
          currentPosition={userInfo.currentPosition}
          positions={userInfo.positions}
          onPositionChange={handlePositionChange}
          onMenuUpdate={handleMenuUpdate}
        />
        
        {/* 用户信息下拉菜单 */}
        <Dropdown overlay={userDropdownMenu} placement="bottomRight">
          <div className="user-info" style={{ cursor: 'pointer' }}>
            <Space>
              {getUserAvatar()}
              <div className="user-details">
                <div className="user-name">
                  {userInfo.user.nickname || userInfo.employee.name || userInfo.user.username}
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