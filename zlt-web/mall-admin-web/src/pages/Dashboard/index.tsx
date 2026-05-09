import React, { useEffect, useState } from 'react';
import { Card, Skeleton } from 'antd';
import { useAdminStore } from '@/stores/useStore';
import MetricCards from './components/MetricCards';
import SalesTrendChart from './components/SalesTrendChart';
import StockWarningList from './components/StockWarningList';
import UserStats from './components/UserStats';
import TopProducts from './components/TopProducts';
import './index.less';

const Dashboard: React.FC = () => {
  const {
    statistics,
    salesTrend,
    stockWarnings,
    userAnalysis,
    topProducts,
    loading,
    fetchStatistics,
    fetchSalesTrend,
    fetchStockWarnings,
    fetchUserAnalysis,
    fetchTopProducts,
  } = useAdminStore();

  // 加载所有数据
  useEffect(() => {
    fetchStatistics();
    fetchSalesTrend('day');
    fetchStockWarnings();
    fetchUserAnalysis();
    fetchTopProducts(10);
  }, []);

  // 监听销售趋势类型切换 (ADMIN-01-02 per D-02)
  useEffect(() => {
    const handleSalesTrendTypeChange = (event: CustomEvent) => {
      const { type } = event.detail;
      fetchSalesTrend(type);
    };

    window.addEventListener('salesTrendTypeChange', handleSalesTrendTypeChange as EventListener);
    return () => {
      window.removeEventListener('salesTrendTypeChange', handleSalesTrendTypeChange as EventListener);
    };
  }, []);

  return (
    <div className="dashboard-container">
      {/* 欢迎横幅 */}
      <Card
        className="welcome-banner"
        bodyStyle={{ padding: '32px' }}
      >
        <h1 className="welcome-title">欢迎使用 Mall Admin 管理平台</h1>
        <p className="welcome-desc">
          基于 React + Umi + Ant Design 的商城管理系统，实时掌握经营状况
        </p>
      </Card>

      {/* 4个指标卡片 (ADMIN-01-01 per D-01) */}
      <MetricCards data={statistics} loading={loading.statistics} />

      {/* 销售趋势图 (ADMIN-01-02 per D-02) */}
      <SalesTrendChart data={salesTrend} loading={loading.salesTrend} />

      {/* 库存预警 (ADMIN-01-03) */}
      <StockWarningList data={stockWarnings} loading={loading.stockWarnings} />

      {/* 用户统计 (ADMIN-01-04) + 热销排行 (ADMIN-01-05) */}
      <div className="dashboard-row">
        <div className="dashboard-col">
          <UserStats data={userAnalysis} loading={loading.userAnalysis} />
        </div>
        <div className="dashboard-col">
          <TopProducts data={topProducts} loading={loading.topProducts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;