import React, { useState, useEffect } from 'react';
import { Select, Space, Avatar, message } from 'antd';
import { UserOutlined, SwapOutlined } from '@ant-design/icons';
import { WorkPosition } from '../../services/portal';
import { saveCurrentPosition, GlobalUserPosition } from '../../utils/globalState';
import './index.less';

interface PositionSelectorProps {
  currentPosition?: WorkPosition;
  positions?: WorkPosition[];
  onPositionChange?: (position: WorkPosition) => void;
  onMenuUpdate?: () => void;
}

const PositionSelector: React.FC<PositionSelectorProps> = ({
  currentPosition,
  positions: initialPositions,
  onPositionChange,
  onMenuUpdate,
}) => {
  const [positions, setPositions] = useState<WorkPosition[]>(initialPositions || []);
  const [selectedPosition, setSelectedPosition] = useState<WorkPosition | undefined>(currentPosition);
  const [loading, setLoading] = useState(false);

  // 使用传入的岗位列表，不再单独加载
  useEffect(() => {
    if (initialPositions && initialPositions.length > 0) {
      setPositions(initialPositions);
    }
  }, [initialPositions]);

  // 更新当前选中的岗位
  useEffect(() => {
    if (currentPosition) {
      setSelectedPosition(currentPosition);
    }
  }, [currentPosition]);

  // 处理岗位切换
  const handlePositionChange = async (positionId: number) => {
    if (!positionId || positionId === selectedPosition?.id) {
      return;
    }

    const targetPosition = positions.find(p => p.id === positionId);
    if (!targetPosition) {
      message.error('未找到目标岗位信息');
      return;
    }

    setLoading(true);
    try {
      console.log('PositionSelector: 开始切换岗位', positionId);
      
      // 直接调用菜单接口，传入positionId参数
      const { getCurrentUserMenus } = await import('../../services/auth');
      const menuResponse = await getCurrentUserMenus(positionId);
      
      console.log('PositionSelector: 获取岗位菜单响应', menuResponse);
      
      // 兼容新旧两种API响应格式
      const isMenuSuccess = menuResponse && (menuResponse.resp_code === 0 || menuResponse.success === true);
      const menuData = menuResponse?.datas || menuResponse?.data;
      
      if (isMenuSuccess && menuData) {
        setSelectedPosition(targetPosition);
        message.success(`已切换到岗位：${targetPosition.name}`);
        
        // 保存到全局状态，实现跨页面持久化
        const globalPosition: GlobalUserPosition = {
          ...targetPosition,
          id: String(targetPosition.id),
          deptId: targetPosition.deptId ? String(targetPosition.deptId) : undefined,
        };
        saveCurrentPosition(globalPosition);
        
        // 通知父组件岗位已切换
        onPositionChange?.(targetPosition);
        
        // 触发全局岗位切换事件，携带菜单数据
        const event = new CustomEvent('positionChanged', {
          detail: { 
            position: targetPosition,
            menus: menuData,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(event);
        
        // 菜单数据已通过事件传递，不需要单独的onMenuUpdate调用
        
        console.log('PositionSelector: 岗位切换成功，已保存到全局状态并触发全局事件');
      } else {
        const errorMsg = menuResponse?.resp_msg || menuResponse?.message || '岗位切换失败';
        console.error('PositionSelector: 岗位切换失败', menuResponse);
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('PositionSelector: 岗位切换异常:', error);
      message.error('岗位切换失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 调试信息
  console.log('PositionSelector: 渲染状态', {
    selectedPosition: selectedPosition?.name,
    selectedId: selectedPosition?.id,
    selectedDeptName: selectedPosition?.deptName,
    positionsCount: positions.length,
    loading,
    selectedPositionObj: selectedPosition,
    positionsList: positions.map(p => ({ id: p.id, name: p.name, deptName: p.deptName }))
  });

  return (
    <div className="position-selector">
      <Space align="center">
        <SwapOutlined style={{ color: '#666' }} />
        {positions.length > 0 ? (
          <Select
            value={selectedPosition?.id}
            placeholder="选择岗位"
            style={{ minWidth: 160 }}
            loading={loading}
            onChange={handlePositionChange}
            optionLabelProp="label"
            size="small"
            notFoundContent="未找到岗位"
            showSearch={false}
            // 自定义样式，确保选中值显示为黑色
            dropdownStyle={{ zIndex: 1050 }}
          >
            {/* 如果当前岗位不在正式列表中，先添加当前岗位作为选项 */}
            {selectedPosition && !positions.find(p => p.id === selectedPosition.id) && (
              <Select.Option 
                key={selectedPosition.id} 
                value={selectedPosition.id} 
                label={selectedPosition.name}
              >
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{selectedPosition.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{selectedPosition.deptName}</div>
                  </div>
                </Space>
              </Select.Option>
            )}
            {positions.filter(p => p.id !== selectedPosition?.id).map(position => (
              <Select.Option 
                key={position.id} 
                value={position.id} 
                label={position.name}
              >
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{position.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{position.deptName}</div>
                  </div>
                </Space>
              </Select.Option>
            ))}
          </Select>
        ) : (
          // 当岗位列表还没加载时，直接显示当前岗位名称
          <div style={{ 
            minWidth: 160, 
            padding: '4px 8px', 
            fontSize: '14px',
            color: selectedPosition ? '#000' : '#999'
          }}>
            {selectedPosition?.name || (loading ? '正在加载...' : '暂无岗位')}
          </div>
        )}
      </Space>
      {selectedPosition && (
        <div className="current-position-info">
          <div className="position-name">{selectedPosition.name}</div>
          <div className="dept-name">{selectedPosition.deptName}</div>
        </div>
      )}
    </div>
  );
};

export default PositionSelector; 