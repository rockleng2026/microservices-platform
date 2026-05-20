import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Space } from 'antd';
import * as echarts from 'echarts';

interface SalesTrendDTO {
  date: string;
  orderCount: number;
  salesAmount: number;
}

interface SalesTrendChartProps {
  data: SalesTrendDTO[];
  loading?: boolean;
}

type TrendType = 'day' | 'week' | 'month';

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, loading }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [activeType, setActiveType] = useState<TrendType>('day');

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  // 更新图表数据
  useEffect(() => {
    if (!chartInstance.current || !data || data.length === 0) return;

    const dates = data.map(item => item.date);
    const salesData = data.map(item => item.salesAmount);
    const orderData = data.map(item => item.orderCount);

    const option = {
      title: {
        text: '销售趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['销售额', '订单数'],
        top: 30,
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额',
          position: 'left',
          axisLabel: {
            formatter: (value: number) => {
              if (value >= 10000) {
                return `${(value / 10000).toFixed(1)}万`;
              }
              return value.toString();
            },
          },
        },
        {
          type: 'value',
          name: '订单数',
          position: 'right',
          axisLabel: {
            formatter: (value: number) => value.toString(),
          },
        },
      ],
      series: [
        {
          name: '销售额',
          type: 'line',
          data: salesData,
          itemStyle: { color: '#1890ff' },
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ]),
          },
        },
        {
          name: '订单数',
          type: 'line',
          yAxisIndex: 1,
          data: orderData,
          itemStyle: { color: '#52c41a' },
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);
  }, [data]);

  // 窗口resize时重新调整图表
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 切换日/周/月 (ADMIN-01-02 per D-02)
  const handleTypeChange = (type: TrendType) => {
    setActiveType(type);
    // 触发父组件重新获取数据
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('salesTrendTypeChange', { detail: { type } }));
    }
  };

  return (
    <Card
      loading={loading}
      style={{ height: 400 }}
      title="销售趋势"
      extra={
        <Space>
          <Button
            type={activeType === 'day' ? 'primary' : 'default'}
            size="small"
            onClick={() => handleTypeChange('day')}
          >
            日
          </Button>
          <Button
            type={activeType === 'week' ? 'primary' : 'default'}
            size="small"
            onClick={() => handleTypeChange('week')}
          >
            周
          </Button>
          <Button
            type={activeType === 'month' ? 'primary' : 'default'}
            size="small"
            onClick={() => handleTypeChange('month')}
          >
            月
          </Button>
        </Space>
      }
    >
      <div ref={chartRef} style={{ width: '100%', height: 300 }} />
    </Card>
  );
};

export default SalesTrendChart;