/**
 * 促销管理页面 - ADMIN-05
 * 包含: 促销活动 CRUD + 会员积分管理
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, Button, Space, message } from 'antd';
import { PlusOutlined, ReloadOutlined, GiftOutlined } from '@ant-design/icons';
import PromotionTable from './components/PromotionTable';
import PointsModal from './components/PointsModal';
import { getPromotionList, togglePromotion, deletePromotion, PromotionDTO } from '@/services/mall-admin/promotion';

const { TabPane } = Tabs;

const PromotionPage: React.FC = () => {
  // 状态
  const [activeTab, setActiveTab] = useState<string>('promotion');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);

  // 刷新列表
  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // 切换标签页
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div style={{ padding: 24 }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="line"
        tabBarExtraContent={
          <Space>
            {activeTab === 'promotion' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setRefreshKey((k) => k + 1)}>
                新建活动
              </Button>
            )}
            {activeTab === 'points' && (
              <Button type="primary" icon={<GiftOutlined />} onClick={() => setPointsModalVisible(true)}>
                积分调整
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
          </Space>
        }
      >
        <TabPane tab="促销活动" key="promotion">
          <PromotionTable
            refreshKey={refreshKey}
            onToggle={async (id, enabled) => {
              try {
                await togglePromotion(id, enabled);
                message.success(enabled ? '活动已启用' : '活动已禁用');
                handleRefresh();
              } catch (error) {
                console.error('Failed to toggle promotion:', error);
                message.error('操作失败');
              }
            }}
            onDelete={async (id) => {
              try {
                await deletePromotion(id);
                message.success('删除成功');
                handleRefresh();
              } catch (error) {
                console.error('Failed to delete promotion:', error);
                message.error('删除失败');
              }
            }}
          />
        </TabPane>
        <TabPane tab="会员积分" key="points">
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
            <p>会员积分管理 - 点击"积分调整"按钮为用户调整积分</p>
          </div>
        </TabPane>
      </Tabs>

      {/* 积分调整弹窗 */}
      <PointsModal
        visible={pointsModalVisible}
        onClose={() => setPointsModalVisible(false)}
        onSuccess={() => {
          message.success('积分调整成功');
          setPointsModalVisible(false);
        }}
      />
    </div>
  );
};

export default PromotionPage;