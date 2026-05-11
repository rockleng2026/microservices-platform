import React from 'react';
import { Card, Table, Empty } from 'antd';
import { StockWarningDTO } from '@/services/admin/statistics';

interface StockWarningListProps {
  data: StockWarningDTO[];
  loading?: boolean;
}

const StockWarningList: React.FC<StockWarningListProps> = ({ data, loading }) => {
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'SKU规格',
      dataIndex: 'skuName',
      key: 'skuName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '当前库存',
      dataIndex: 'realStock',
      key: 'realStock',
      width: 100,
      align: 'right' as const,
    },
    {
      title: '预警阈值',
      dataIndex: 'warningStock',
      key: 'warningStock',
      width: 100,
      align: 'right' as const,
    },
    {
      title: '今日销售',
      dataIndex: 'soldToday',
      key: 'soldToday',
      width: 100,
      align: 'right' as const,
    },
  ];

  // 判断是否需要标红（库存低于预警阈值）
  const rowClassName = (record: StockWarningDTO) => {
    return record.realStock < record.warningStock ? 'stock-warning-row' : '';
  };

  return (
    <Card title="库存预警 (ADMIN-01-03)" style={{ marginTop: 16 }}>
      {data && data.length > 0 ? (
        <Table
          columns={columns}
          dataSource={data.slice(0, 10)}
          rowKey={(record: StockWarningDTO) => `${record.goodsId}-${record.skuId}`}
          pagination={false}
          rowClassName={rowClassName}
          size="small"
        />
      ) : (
        <Empty description="暂无预警商品" />
      )}
    </Card>
  );
};

export default StockWarningList;