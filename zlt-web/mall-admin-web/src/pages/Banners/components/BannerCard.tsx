/**
 * BannerCard - Single Banner Card with drag handle, thumbnail, status switch
 * ADMIN-10-04 (drag-sort), ADMIN-10-05 (enable/disable toggle)
 */
import React from 'react';
import { Card, Switch, Popconfirm, Typography, Tag, Space } from 'antd';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import type { BannerDTO } from '../services/banners';
import { LINK_TYPE_TEXT, STATUS_TEXT } from '../services/banners';

const { Text } = Typography;

interface BannerCardProps {
  banner: BannerDTO;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onEdit: (banner: BannerDTO) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (banner: BannerDTO) => void;
}

const BannerCard: React.FC<BannerCardProps> = ({
  banner,
  isDragging = false,
  dragHandleProps,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const isEnabled = banner.status === 1;

  return (
    <Card
      size="small"
      hoverable
      style={{
        marginBottom: 12,
        opacity: isDragging ? 0.6 : 1,
        cursor: 'move',
      }}
      bodyStyle={{
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        style={{
          cursor: 'move',
          color: '#999',
          display: 'flex',
          alignItems: 'center',
          fontSize: 18,
        }}
      >
        <DragOutlined />
      </div>

      {/* Thumbnail */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 4,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={banner.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <Text type="secondary">无图片</Text>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 14 }}>
            {banner.title || '未命名 Banner'}
          </Text>
          <Space size={8}>
            <Tag color={banner.linkType === 1 ? 'blue' : 'green'}>
              {banner.linkType === 1 ? '商品' : '外链'}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {banner.linkType === 1
                ? `商品ID: ${banner.goodsId || '-'}`
                : banner.externalUrl || '-'}
            </Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            排序: {banner.sort ?? 0}
          </Text>
        </Space>
      </div>

      {/* Status Switch */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Switch
          checked={isEnabled}
          onChange={(checked) => {
            onToggleStatus({
              ...banner,
              status: checked ? 1 : 0,
            });
          }}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {STATUS_TEXT[banner.status] || '未知'}
        </Text>
      </div>

      {/* Edit Button */}
      <Typography.Link
        onClick={() => onEdit(banner)}
        style={{ marginLeft: 8, marginRight: 8 }}
      >
        编辑
      </Typography.Link>

      {/* Delete Button */}
      <Popconfirm
        title="确定要删除此 Banner 吗？"
        onConfirm={() => onDelete(banner.id!)}
        okText="确定"
        cancelText="取消"
      >
        <DeleteOutlined
          style={{
            color: '#ff4d4f',
            cursor: 'pointer',
            fontSize: 16,
          }}
        />
      </Popconfirm>
    </Card>
  );
};

export default BannerCard;
