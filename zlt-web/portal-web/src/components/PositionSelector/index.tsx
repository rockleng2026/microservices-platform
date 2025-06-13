import React, { useState, useEffect } from 'react';
import { Select, Space, Avatar, message } from 'antd';
import { UserOutlined, SwapOutlined } from '@ant-design/icons';
import { WorkPosition } from '../../services/portal';
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
      
      if (menuResponse && menuResponse.resp_code === 0) {
        setSelectedPosition(targetPosition);
        message.success(`已切换到岗位：${targetPosition.name}`);
        
        // 通知父组件岗位已切换
        onPositionChange?.(targetPosition);
        
        // 触发全局岗位切换事件，携带菜单数据
        const event = new CustomEvent('positionChanged', {
          detail: { 
            position: targetPosition,
            menus: menuResponse.datas,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(event);
        
        // 菜单数据已通过事件传递，不需要单独的onMenuUpdate调用
        
        console.log('PositionSelector: 岗位切换成功，已触发全局事件');
      } else {
        const errorMsg = menuResponse?.resp_msg || '岗位切换失败';
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

  // 生成岗位选项
  const positionOptions = positions.map(position => ({
    label: (
      <Space>
        <Avatar size="small" icon={<UserOutlined />} />
        <div>
          <div style={{ fontWeight: 500 }}>{position.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{position.deptName}</div>
        </div>
      </Space>
    ),
    value: position.id,
    position,
  }));



  return (
    <div className="position-selector">
      <Space align="center">
        <SwapOutlined style={{ color: '#666' }} />
        <Select
          value={selectedPosition?.id}
          placeholder="选择岗位"
          style={{ minWidth: 160 }}
          loading={loading}
          onChange={handlePositionChange}
          optionLabelProp="children"
          size="small"
        >
          {positionOptions.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
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