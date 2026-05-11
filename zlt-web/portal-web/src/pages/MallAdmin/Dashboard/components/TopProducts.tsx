import React from 'react';
import { Card, List, Avatar, Badge } from 'antd';

interface TopProductItem {
  id: number;
  name: string;
  mainImage?: string;
  price?: number;
  sales?: number;
}

interface TopProductsProps {
  data: TopProductItem[];
  loading?: boolean;
}

// 排名颜色徽章 (ADMIN-01-05)
const getRankBadge = (rank: number) => {
  const colors: { [key: number]: string } = {
    1: '#faad14', // 金色
    2: '#8c8c8c', // 银色
    3: '#d4a574', // 铜色
  };
  return colors[rank] || '#1890ff';
};

const TopProducts: React.FC<TopProductsProps> = ({ data, loading }) => {
  return (
    <Card
      title="热销排行 (ADMIN-01-05)"
      style={{ marginTop: 16, height: '100%' }}
    >
      <List
        loading={loading}
        dataSource={data?.slice(0, 10) || []}
        renderItem={(item: TopProductItem, index: number) => (
          <List.Item
            key={item.id}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = `/goods/detail/${item.id}`;
              }
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  count={index + 1}
                  style={{
                    backgroundColor: getRankBadge(index + 1),
                    fontSize: 12,
                    minWidth: 24,
                    height: 24,
                    lineHeight: '24px',
                  }}
                  showZero
                >
                  <Avatar
                    shape="square"
                    size={40}
                    src={item.mainImage}
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </Badge>
              }
              title={item.name}
              description={`销量: ${item.sales?.toLocaleString() || 0}`}
            />
            <div style={{ color: '#cf1322', fontWeight: 600 }}>
              ¥{item.price?.toLocaleString() || 0}
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TopProducts;