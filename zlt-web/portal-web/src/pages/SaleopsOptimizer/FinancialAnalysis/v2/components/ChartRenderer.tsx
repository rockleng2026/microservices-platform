import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, Typography, Space, Tag } from 'antd';

const { Text } = Typography;

interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
  seriesName?: string;
  seriesId?: number;
  seriesColor?: string;
  seriesField?: string;
}

interface ChartRendererProps {
  chartType: 'line' | 'bar' | 'pie' | 'scatter';
  data: ChartDataPoint[];
  xAxisName: string;
  yAxisName: string;
  xAxisUnit?: string;
  yAxisUnit?: string;
  seriesList?: any[];
  chartName?: string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartType,
  data,
  xAxisName,
  yAxisName,
  xAxisUnit,
  yAxisUnit,
  seriesList,
  chartName
}) => {
  // 按系列分组数据
  const seriesData = useMemo(() => {
    if (!seriesList || seriesList.length === 0) {
      // 如果没有系列配置，使用单系列数据
      return [{
        seriesName: chartName || '数据',
        data: data,
        color: '#1890ff'
      }];
    }

    // 按系列分组
    const groupedData: { [key: string]: ChartDataPoint[] } = {};
    data.forEach(point => {
      if (point.seriesName) {
        if (!groupedData[point.seriesName]) {
          groupedData[point.seriesName] = [];
        }
        groupedData[point.seriesName].push(point);
      }
    });

    // 转换为系列数据格式
    return seriesList
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(series => ({
        seriesName: series.seriesName,
        data: groupedData[series.seriesName] || [],
        color: series.color || '#1890ff'
      }))
      .filter(series => series.data.length > 0);
  }, [data, seriesList, chartName]);

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
            {xAxisName}: {label} {xAxisUnit && `(${xAxisUnit})`}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '2px 0', 
              color: entry.color,
              fontSize: '12px'
            }}>
              {entry.name}: {entry.value.toFixed(2)} {yAxisUnit && `(${yAxisUnit})`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 渲染折线图
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          name={xAxisName}
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value) => value.toLocaleString()}
          label={{ value: `${xAxisName}${xAxisUnit ? ` (${xAxisUnit})` : ''}`, position: 'bottom' }}
        />
        <YAxis 
          name={yAxisName}
          type="number"
          tickFormatter={(value) => value.toLocaleString()}
          label={{ 
            value: `${yAxisName}${yAxisUnit ? ` (${yAxisUnit})` : ''}`, 
            angle: -90, 
            position: 'insideLeft' 
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          layout="horizontal"
          verticalAlign="top"
          align="center"
          iconType="line"
          iconSize={12}
        />
        {seriesData.map((series, index) => (
          <Line
            key={series.seriesName}
            type="monotone"
            dataKey="y"
            name={series.seriesName}
            data={series.data}
            stroke={series.color}
            strokeWidth={1}
            dot={{ r: 1, fill: 'white', stroke: series.color, strokeWidth: 1 }}
            activeDot={{ r: 2, fill: 'white', stroke: series.color, strokeWidth: 1 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  // 渲染柱状图
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          name={xAxisName}
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value) => value.toLocaleString()}
          label={{ value: `${xAxisName}${xAxisUnit ? ` (${xAxisUnit})` : ''}`, position: 'bottom' }}
        />
        <YAxis 
          name={yAxisName}
          type="number"
          tickFormatter={(value) => value.toLocaleString()}
          label={{ 
            value: `${yAxisName}${yAxisUnit ? ` (${yAxisUnit})` : ''}`, 
            angle: -90, 
            position: 'insideLeft' 
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          layout="horizontal"
          verticalAlign="top"
          align="center"
          iconType="rect"
          iconSize={12}
        />
        {seriesData.map((series, index) => (
          <Bar
            key={series.seriesName}
            dataKey="y"
            name={series.seriesName}
            data={series.data}
            fill={series.color}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  // 渲染散点图
  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          name={xAxisName}
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value) => value.toLocaleString()}
          label={{ value: `${xAxisName}${xAxisUnit ? ` (${xAxisUnit})` : ''}`, position: 'bottom' }}
        />
        <YAxis 
          name={yAxisName}
          type="number"
          tickFormatter={(value) => value.toLocaleString()}
          label={{ 
            value: `${yAxisName}${yAxisUnit ? ` (${yAxisUnit})` : ''}`, 
            angle: -90, 
            position: 'insideLeft' 
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          layout="horizontal"
          verticalAlign="top"
          align="center"
          iconType="circle"
          iconSize={12}
        />
        {seriesData.map((series, index) => (
          <Scatter
            key={series.seriesName}
            name={series.seriesName}
            data={series.data}
            fill="white"
            stroke={series.color}
            strokeWidth={1}
            shape="circle"
            r={1}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );

  // 渲染饼图（需要特殊处理数据格式）
  const renderPieChart = () => {
    // 饼图需要聚合数据
    const pieData = useMemo(() => {
      const aggregated: { [key: string]: number } = {};
      data.forEach(point => {
        const key = point.seriesName || '数据';
        aggregated[key] = (aggregated[key] || 0) + point.y;
      });
      
      return Object.entries(aggregated).map(([name, value]) => ({
        name,
        value: Math.abs(value) // 饼图通常显示绝对值
      }));
    }, [data]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [value.toFixed(2), yAxisUnit ? `${yAxisUnit}` : '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 根据图表类型渲染
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'scatter':
        return renderScatterChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderLineChart();
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <div style={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <Text type="secondary">暂无图表数据</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card title={chartName} style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Tag color="blue">{chartType === 'line' ? '折线图' : 
                              chartType === 'bar' ? '柱状图' : 
                              chartType === 'pie' ? '饼图' : '散点图'}</Tag>
          <Text type="secondary">数据点: {data.length}</Text>
          <Text type="secondary">系列数: {seriesData.length}</Text>
        </Space>
      </div>
      
      {renderChart()}
      
      {/* 系列图例 */}
      {seriesData.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>系列说明:</Text>
          <Space wrap>
            {seriesData.map((series, index) => (
              <Tag key={series.seriesName} color={series.color}>
                {series.seriesName} ({series.data.length} 点)
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default ChartRenderer; 