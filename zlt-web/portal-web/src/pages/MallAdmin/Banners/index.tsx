/**
 * Banner List Page - ADMIN-10
 * Drag-sortable Banner list (NOT ProTable)
 * ADMIN-10-01 (create), ADMIN-10-02 (edit), ADMIN-10-03 (delete),
 * ADMIN-10-04 (drag-sort), ADMIN-10-05 (enable/disable toggle)
 * D-13: max 5 banners, D-15: drag-sort
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Space, Typography, message, Alert, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import BannerCard from './components/BannerCard';
import BannerModal from './components/BannerModal';
import {
  getBannerList,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerSort,
  type BannerDTO,
} from './services/banners';
import './index.less';

const { Title, Text } = Typography;

const MAX_BANNERS = 5;

const BannerListPage: React.FC = () => {
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingBanner, setEditingBanner] = useState<BannerDTO | undefined>();
  const [saving, setSaving] = useState(false);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Fetch banners on mount
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBannerList();
      // Sort by sort field
      const sorted = [...data].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      setBanners(sorted);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      message.error('加载 Banner 列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Check if can add more banners
  const canAddBanner = banners.length < MAX_BANNERS;

  // Handle create new banner
  const handleAdd = () => {
    if (!canAddBanner) {
      message.warning(`最多添加 ${MAX_BANNERS} 个 Banner`);
      return;
    }
    setModalMode('create');
    setEditingBanner(undefined);
    setModalVisible(true);
  };

  // Handle edit banner
  const handleEdit = (banner: BannerDTO) => {
    setModalMode('edit');
    setEditingBanner(banner);
    setModalVisible(true);
  };

  // Handle delete banner
  const handleDelete = async (id: number) => {
    try {
      await deleteBanner(id);
      message.success('删除 Banner 成功');
      await fetchBanners();
    } catch (error) {
      console.error('Failed to delete banner:', error);
      message.error('删除 Banner 失败');
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (banner: BannerDTO) => {
    try {
      await updateBanner(banner);
      message.success(`${banner.status === 1 ? '启用' : '禁用'} Banner 成功`);
      await fetchBanners();
    } catch (error) {
      console.error('Failed to toggle banner status:', error);
      message.error('更新 Banner 状态失败');
      // Revert the switch in UI
      await fetchBanners();
    }
  };

  // Handle modal submit
  const handleModalSubmit = async (values: BannerDTO) => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await createBanner(values);
        message.success('创建 Banner 成功');
      } else {
        await updateBanner(values);
        message.success('更新 Banner 成功');
      }
      setModalVisible(false);
      await fetchBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
      message.error(`${modalMode === 'create' ? '创建' : '更新'} Banner 失败`);
    } finally {
      setSaving(false);
    }
  };

  // Drag handlers (HTML5 drag-and-drop API)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set drag image
    const target = e.currentTarget as HTMLElement;
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) {
      setOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setOverIndex(null);
      return;
    }

    // Reorder banners array
    const newBanners = [...banners];
    const [draggedItem] = newBanners.splice(draggedIndex, 1);
    newBanners.splice(dropIndex, 0, draggedItem);

    // Optimistic update
    setBanners(newBanners);

    // Reset drag state
    setDraggedIndex(null);
    setOverIndex(null);

    // Update sort order on server
    try {
      const updates = newBanners.map((banner, idx) => ({
        id: banner.id!,
        sort: idx,
      }));

      // Sequential updates (max 5 banners = max 5 calls, acceptable)
      for (const { id, sort } of updates) {
        await updateBannerSort(id, sort);
      }

      message.success('排序更新成功');
      await fetchBanners();
    } catch (error) {
      console.error('Failed to update banner sort:', error);
      message.error('排序更新失败');
      // Revert to original order
      await fetchBanners();
    }
  };

  return (
    <PageContainer
      header={{
        title: 'Banner 管理',
        subTitle: `共 ${banners.length}/${MAX_BANNERS} 个 Banner`,
      }}
    >
      <div className="banner-list-container">
        {/* Max banner limit warning */}
        {!canAddBanner && (
          <Alert
            message="已达到最大数量限制，无法添加更多 Banner"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Toolbar */}
        <div className="banner-toolbar">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={!canAddBanner}
              title={!canAddBanner ? `最多添加 ${MAX_BANNERS} 个 Banner` : '添加 Banner'}
            >
              添加 Banner
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchBanners}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            最多 {MAX_BANNERS} 张 Banner，建议尺寸 1920x400 或等比例图片
          </Text>
        </div>

        {/* Banner list */}
        <div className="banner-list">
          {loading && banners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : banners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Text type="secondary">暂无 Banner，点击"添加 Banner"创建</Text>
            </div>
          ) : (
            banners.map((banner, index) => (
              <div
                key={banner.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  opacity: draggedIndex === index ? 0.5 : 1,
                  border: overIndex === index ? '2px dashed #1890ff' : '2px solid transparent',
                  borderRadius: 8,
                  transition: 'border-color 0.2s',
                }}
              >
                <BannerCard
                  banner={banner}
                  isDragging={draggedIndex === index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <BannerModal
          visible={modalVisible}
          mode={modalMode}
          initialValues={editingBanner}
          onSubmit={handleModalSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </div>
    </PageContainer>
  );
};

export default BannerListPage;
