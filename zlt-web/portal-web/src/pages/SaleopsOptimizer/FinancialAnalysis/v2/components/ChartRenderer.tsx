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
  Cell,
  ReferenceLine
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
  isBreakevenPoint?: boolean; // Added for breakeven point
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
  // 调试信息：检查盈亏平衡点数据
  console.log('ChartRenderer接收到的数据:', data);
  console.log('ChartRenderer中的盈亏平衡点:', data.filter(d => d.isBreakevenPoint));
  console.log('盈亏平衡点数据格式检查:', data.filter(d => d.isBreakevenPoint).map(d => ({
    x: d.x,
    y: d.y,
    isBreakevenPoint: d.isBreakevenPoint,
    seriesName: d.seriesName,
    label: d.label
  })));
  
  // 按系列分组数据
  const seriesData = useMemo(() => {
    if (!seriesList || seriesList.length === 0) {
      // 如果没有系列配置，使用单系列数据
      // 对于柱状图，需要过滤掉盈亏平衡点数据
      const regularData = data.filter(d => !d.isBreakevenPoint);
      return [{
        seriesName: chartName || '数据',
        data: regularData,
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

  // 饼图数据聚合
  const pieData = useMemo(() => {
    const aggregated: { [key: string]: number } = {};
    
    // 按系列聚合数据
    seriesData.forEach(series => {
      const seriesTotal = series.data.reduce((sum, point) => sum + point.y, 0);
      aggregated[series.seriesName] = seriesTotal;
    });
    
    // 如果没有系列数据，则按单个数据点聚合
    if (Object.keys(aggregated).length === 0) {
      data.forEach(point => {
        const key = point.seriesName || '数据';
        aggregated[key] = (aggregated[key] || 0) + point.y;
      });
    }
    
    return Object.entries(aggregated).map(([name, value]) => ({
      name,
      value: Math.abs(value) // 饼图通常显示绝对值
    }));
  }, [data, seriesData]);

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
  const renderLineChart = () => {
    // 盈亏平衡点数据
    const breakevenPoints = data.filter(d => d.isBreakevenPoint);
    console.log('折线图中的盈亏平衡点:', breakevenPoints);
    console.log('盈亏平衡点详细数据:', JSON.stringify(breakevenPoints, null, 2));
    return (
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
            xAxisId={0}
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
            yAxisId={0}
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
          {/* 盈亏平衡点高亮 */}
          {breakevenPoints.length > 0 && (
            <>
              <Scatter
                data={breakevenPoints}
                dataKey="y"
                xAxisId={0}
                yAxisId={0}
                shape="circle"
                r={8}
                fill="white"
                stroke="red"
                strokeWidth={3}
                name="盈亏平衡点"
                isAnimationActive={false}
              />
              {/* 添加垂直参考线标记盈亏平衡点 */}
              {breakevenPoints.map((point, index) => {
                // 智能选择标签位置，避免与图例重叠
                const maxX = Math.max(...data.map(d => d.x));
                const minY = Math.min(...data.map(d => d.y));
                const maxY = Math.max(...data.map(d => d.y));
                const yRange = maxY - minY;
                
                // 根据位置选择标签位置
                let labelPosition: 'insideBottom' | 'insideTop' = 'insideBottom';
                let labelOffset = 10;
                
                if (point.x > maxX * 0.8) {
                  // 右侧位置，标签放在下方
                  labelPosition = 'insideBottom';
                  labelOffset = 15;
                } else if (point.x < maxX * 0.2) {
                  // 左侧位置，标签放在上方
                  labelPosition = 'insideTop';
                  labelOffset = 15;
                } else {
                  // 中间位置，根据Y值选择
                  const yRatio = (point.y - minY) / yRange;
                  if (yRatio > 0.7) {
                    labelPosition = 'insideBottom';
                  } else {
                    labelPosition = 'insideTop';
                  }
                  labelOffset = 12;
                }
                
                return (
                  <ReferenceLine
                    key={`breakeven-${index}`}
                    x={point.x}
                    stroke="red"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                    label={{ 
                      value: '盈亏平衡点', 
                      position: labelPosition, 
                      offset: labelOffset,
                      fill: 'red',
                      fontSize: 11,
                      fontWeight: 'bold',
                      textAnchor: 'middle'
                    }}
                  />
                );
              })}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // 渲染柱状图
  const renderBarChart = () => {
    // 验证X轴坐标数量，柱状图建议控制在8个坐标内
    const uniqueXValues = [...new Set(data.filter(d => !d.isBreakevenPoint).map(d => d.x))];
    console.log('柱状图调试信息:', {
      totalDataPoints: data.length,
      regularDataPoints: data.filter(d => !d.isBreakevenPoint).length,
      breakevenPoints: data.filter(d => d.isBreakevenPoint).length,
      uniqueXValues: uniqueXValues.length,
      seriesData: seriesData,
      seriesDataLength: seriesData.length,
      seriesDataDetails: seriesData.map(s => ({
        name: s.seriesName,
        dataLength: s.data.length,
        firstFewData: s.data.slice(0, 3)
      }))
    });
    
    if (uniqueXValues.length > 8) {
      return (
        <div style={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <Text type="warning" style={{ fontSize: 16, marginBottom: 8 }}>
            ⚠️ X轴坐标过多
          </Text>
          <Text type="secondary" style={{ textAlign: 'center' }}>
            柱状图建议控制在8个X轴坐标以内，当前有 {uniqueXValues.length} 个坐标<br/>
            请切换到折线图或散点图以获得更好的显示效果
          </Text>
        </div>
      );
    }

    // 为柱状图准备数据 - 按X轴值分组，只使用普通数据点
    const regularData = data.filter(d => !d.isBreakevenPoint);
    const groupedByX = regularData.reduce((acc, point) => {
      if (!acc[point.x]) acc[point.x] = {};
      acc[point.x][point.seriesName || 'default'] = point.y;
      return acc;
    }, {} as { [key: number]: { [key: string]: number } });
    let barChartData: Array<Record<string, any>> = Object.keys(groupedByX).map(x => ({
      x: parseFloat(x),
      ...groupedByX[parseFloat(x)]
    }));

    // 插入盈亏平衡点分组
    const breakevenPoints = data.filter(d => d.isBreakevenPoint);
    if (breakevenPoints.length > 0) {
      const breakevenGroup: Record<string, any> = { x: breakevenPoints[0].x, isBreakevenPoint: true };
      breakevenPoints.forEach(point => {
        breakevenGroup[point.seriesName || 'default'] = point.y;
      });
      if (!barChartData.some(d => d.x === breakevenGroup.x)) {
        barChartData.push(breakevenGroup);
        barChartData = barChartData.sort((a, b) => a.x - b.x);
      }
    }

    console.log('柱状图数据:', barChartData);

    // 自定义shape实现盈亏平衡点高亮
    const getBarShape = (breakevenX: number, color: string) => (props: any) => {
      const { x, y, width, height, payload } = props;
      const isBreakeven = payload && payload.x === breakevenX && payload.isBreakevenPoint;
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={isBreakeven ? '#ff4d4f' : color}
          stroke={isBreakeven ? '#d9d9d9' : undefined}
          strokeWidth={isBreakeven ? 2 : 0}
          rx={isBreakeven ? 3 : 0}
        />
      );
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          data={barChartData}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="x" 
            name={xAxisName}
            type="number"
            domain={[
              Math.min(
                ...barChartData.map(d => d.x),
                ...data.filter(d => d.isBreakevenPoint).map(d => d.x)
              ),
              Math.max(
                ...barChartData.map(d => d.x),
                ...data.filter(d => d.isBreakevenPoint).map(d => d.x)
              )
            ]}
            tickFormatter={(value) => value.toLocaleString()}
            label={{ value: `${xAxisName}${xAxisUnit ? ` (${xAxisUnit})` : ''}`, position: 'bottom' }}
            xAxisId={0}
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
            yAxisId={0}
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
              dataKey={series.seriesName}
              name={series.seriesName}
              fill={series.color}
              xAxisId={0}
              yAxisId={0}
              shape={getBarShape(breakevenPoints[0]?.x, series.color)}
            />
          ))}
          {/* 盈亏平衡点标记 */}
          {data.some(d => d.isBreakevenPoint) && (() => {
            const breakevenPoints = data.filter(d => d.isBreakevenPoint);
            console.log('柱状图中渲染盈亏平衡点:', breakevenPoints);
            
            return (
              <>
                {/* 垂直参考线 */}
                {breakevenPoints.map((point, index) => (
                  <ReferenceLine
                    key={`breakeven-line-${index}`}
                    x={point.x}
                    stroke="red"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                  />
                ))}
                {/* 盈亏平衡点散点标记 */}
                <Scatter
                  data={breakevenPoints}
                  dataKey="y"
                  xAxisId={0}
                  yAxisId={0}
                  shape="diamond"
                  r={8}
                  fill="red"
                  stroke="white"
                  strokeWidth={3}
                  name="盈亏平衡点"
                  isAnimationActive={false}
                />
                {/* 盈亏平衡点标签 */}
                {breakevenPoints.map((point, index) => {
                  const maxY = Math.max(...barChartData.map(d => Math.max(...Object.values(d).filter(v => typeof v === 'number'))));
                  const labelPosition = point.y > maxY * 0.7 ? 'insideBottom' : 'insideTop';
                  const labelOffset = point.y > maxY * 0.7 ? 25 : -25;
                  
                  return (
                    <ReferenceLine
                      key={`breakeven-label-${index}`}
                      x={point.x}
                      stroke="transparent"
                      label={{ 
                        value: '盈亏平衡点', 
                        position: labelPosition, 
                        offset: labelOffset,
                        fill: 'red',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textAnchor: 'middle'
                      }}
                    />
                  );
                })}
              </>
            );
          })()}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 渲染散点图
  const renderScatterChart = () => {
    const breakevenPoints = data.filter(d => d.isBreakevenPoint);
    console.log('散点图中的盈亏平衡点:', breakevenPoints);
    return (
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
            xAxisId={0}
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
            yAxisId={0}
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
          {/* 盈亏平衡点高亮 */}
          {breakevenPoints.length > 0 && (
            <>
              <Scatter
                data={breakevenPoints}
                dataKey="y"
                xAxisId={0}
                yAxisId={0}
                shape="circle"
                r={8}
                fill="white"
                stroke="red"
                strokeWidth={3}
                name="盈亏平衡点"
                isAnimationActive={false}
              />
              {/* 添加垂直参考线标记盈亏平衡点 */}
              {breakevenPoints.map((point, index) => {
                // 智能选择标签位置，避免与图例重叠
                const maxX = Math.max(...data.map(d => d.x));
                const minY = Math.min(...data.map(d => d.y));
                const maxY = Math.max(...data.map(d => d.y));
                const yRange = maxY - minY;
                
                // 根据位置选择标签位置
                let labelPosition: 'insideBottom' | 'insideTop' = 'insideBottom';
                let labelOffset = 10;
                
                if (point.x > maxX * 0.8) {
                  // 右侧位置，标签放在下方
                  labelPosition = 'insideBottom';
                  labelOffset = 15;
                } else if (point.x < maxX * 0.2) {
                  // 左侧位置，标签放在上方
                  labelPosition = 'insideTop';
                  labelOffset = 15;
                } else {
                  // 中间位置，根据Y值选择
                  const yRatio = (point.y - minY) / yRange;
                  if (yRatio > 0.7) {
                    labelPosition = 'insideBottom';
                  } else {
                    labelPosition = 'insideTop';
                  }
                  labelOffset = 12;
                }
                
                return (
                  <ReferenceLine
                    key={`breakeven-${index}`}
                    x={point.x}
                    stroke="red"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                    label={{ 
                      value: '盈亏平衡点', 
                      position: labelPosition, 
                      offset: labelOffset,
                      fill: 'red',
                      fontSize: 11,
                      fontWeight: 'bold',
                      textAnchor: 'middle'
                    }}
                  />
                );
              })}
            </>
          )}
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  // 渲染饼图（需要特殊处理数据格式）
  const renderPieChart = () => {
    console.log('饼图聚合数据:', pieData);

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
          {data.length > 20 && (
            <Tag color="orange">建议使用折线图或散点图</Tag>
          )}
          {chartType === 'bar' && [...new Set(data.filter(d => !d.isBreakevenPoint).map(d => d.x))].length > 8 && (
            <Tag color="red">X轴坐标过多，建议切换图表类型</Tag>
          )}
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