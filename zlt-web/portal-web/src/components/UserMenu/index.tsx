import React, { useState, useEffect } from 'react';
import { Dropdown, Space, Avatar, Button, Menu, message } from 'antd';
import { UserOutlined, DownOutlined, SettingOutlined, LogoutOutlined, SwapOutlined } from '@ant-design/icons';
import { getCurrentUser, getCurrentUserMenus } from '../../services/auth';
import { WorkPosition } from '../../services/portal';
import PositionSelector from '../PositionSelector';
import LogoutConfirm from '../LogoutConfirm';
import './index.less';

interface UserMenuProps {
  onMenuUpdate?: (menus: any[]) => void;
}

interface UserInfo {
  id?: number;
  user?: any;
  employee?: any;
  positions?: any[];
  currentPosition?: any;
}

// 使用portal.ts中的WorkPosition类型，并扩展支持岗位类型

const UserMenu: React.FC<UserMenuProps> = ({ onMenuUpdate }) => {
  console.log('UserMenu: 组件被渲染, onMenuUpdate:', onMenuUpdate);
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [positions, setPositions] = useState<WorkPosition[]>([]);
  const [currentPosition, setCurrentPosition] = useState<WorkPosition | null>(null);
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
      
      if (userResponse && userResponse.resp_code === 0) {
        console.log('UserMenu: 设置用户信息:', userResponse.datas);
        setUserInfo(userResponse.datas);
        
        // 从用户信息中提取岗位信息
        extractPositionsFromUserInfo(userResponse.datas);
        
        setInitialized(true);
      } else {
        console.log('UserMenu: 用户信息获取失败', userResponse);
        message.error(userResponse?.resp_msg || '获取用户信息失败');
      }
      
      // 获取菜单权限  
      await loadUserMenus();
    } catch (error: any) {
      console.error('UserMenu: 加载用户数据失败:', error);
      
      // 如果是登录失效错误，不显示错误提示，因为已经跳转到登录页面
      if (!error.message || !error.message.includes('登录已失效')) {
        message.error('加载用户数据失败，请重试');
      }
    } finally {
      console.log('UserMenu: 设置loading为false');
      setLoading(false);
    }
  };

  // 从用户信息中提取岗位信息
  const extractPositionsFromUserInfo = (userInfo: UserInfo) => {
    try {
      console.log('UserMenu: 从用户信息中提取岗位信息:', userInfo);
      
      // 检查用户信息中是否包含岗位列表
      const userPositions = userInfo.positions || [];
      
      if (userPositions.length > 0) {
        // 为岗位添加类型标识
        const enhancedPositions = userPositions.map((pos: any, index: number) => ({
          ...pos,
          type: index === 0 ? 'MAIN' : 'SUB', // 第一个岗位为主岗位，其余为分管岗位
          isMain: index === 0
        }));
        
        setPositions(enhancedPositions);
        console.log('UserMenu: 设置岗位列表（含主岗位和分管岗位）:', enhancedPositions);
        
        // 设置当前岗位（如果用户信息中有当前岗位，使用它；否则使用第一个岗位）
        const current = userInfo.currentPosition || enhancedPositions[0];
        if (current) {
          setCurrentPosition(current);
          console.log('UserMenu: 设置当前岗位:', current);
        }
      } else {
        console.log('UserMenu: 用户无岗位信息');
        setPositions([]);
      }
    } catch (error) {
      console.error('UserMenu: 提取岗位信息失败:', error);
    }
  };

  // 加载用户菜单权限
  const loadUserMenus = async () => {
    try {
      const menuResponse = await getCurrentUserMenus();
      console.log('UserMenu: 获取菜单权限响应:', menuResponse);
      
      if (menuResponse && menuResponse.resp_code === 0) {
        console.log('UserMenu: 准备传递菜单数据给父组件:', menuResponse.datas);
        if (onMenuUpdate) {
          onMenuUpdate(menuResponse.datas);
          console.log('UserMenu: 已调用onMenuUpdate');
        }
      } else {
        console.log('UserMenu: 菜单数据为空或获取失败', menuResponse);
      }
    } catch (error) {
      console.error('UserMenu: 加载菜单权限失败:', error);
    }
  };

  // 岗位切换处理
  const handlePositionChange = async (newPosition: WorkPosition) => {
    console.log('UserMenu: 接收到岗位切换请求:', newPosition);
    setCurrentPosition(newPosition);
    
    // 更新用户信息中的当前岗位
    if (userInfo) {
      setUserInfo({
        ...userInfo,
        currentPosition: newPosition
      });
    }
    
    // 不在这里显示成功提示，避免重复提示
    // 成功提示由PositionSelector组件负责
  };

  // 监听全局岗位切换事件
  useEffect(() => {
    const handleGlobalPositionChange = (event: any) => {
      console.log('UserMenu: 接收到全局岗位切换事件:', event.detail);
      if (event.detail?.position) {
        setCurrentPosition(event.detail.position);
        
        // 如果事件中包含菜单数据，直接使用，避免重复请求
        if (event.detail?.menus && onMenuUpdate) {
          console.log('UserMenu: 使用事件中的菜单数据:', event.detail.menus);
          onMenuUpdate(event.detail.menus);
        }
      }
    };

    window.addEventListener('positionChanged', handleGlobalPositionChange);
    return () => {
      window.removeEventListener('positionChanged', handleGlobalPositionChange);
    };
  }, [onMenuUpdate]);

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

  // 用户下拉菜单项
  const userDropdownMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: (
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
      ),
    },
  ];

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
        {/* 完整的岗位选择器 - 支持多岗位切换 */}
        {positions.length > 0 && (
          <PositionSelector
            positions={positions}
            currentPosition={currentPosition || undefined}
            onPositionChange={handlePositionChange}
            onMenuUpdate={() => loadUserMenus()}
          />
        )}
        
        {/* 用户信息下拉菜单 */}
        <Dropdown menu={{ items: userDropdownMenuItems }} placement="bottomRight">
          <div className="user-info" style={{ cursor: 'pointer' }}>
            <Space>
              {getUserAvatar()}
              <div className="user-details">
                <div className="user-name">
                  {userInfo.user?.nickname || userInfo.employee?.name || userInfo.user?.username}
                </div>
                <div className="user-position" style={{ fontSize: '12px', color: '#666' }}>
                  {currentPosition?.name || '未分配岗位'}
                  {currentPosition?.deptName && (
                    <span style={{ marginLeft: 4, color: '#999' }}>- {currentPosition.deptName}</span>
                  )}
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