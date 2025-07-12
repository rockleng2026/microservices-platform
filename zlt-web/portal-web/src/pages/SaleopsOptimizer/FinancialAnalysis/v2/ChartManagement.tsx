import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Button, message } from 'antd';
import { useParams, useLocation } from 'umi';
import moment from 'moment';
import { request } from '@/utils/request';
import ChartEditModal from './components/ChartEditModal';
import ChartSeriesModal from './components/ChartSeriesModal';

interface ChartAnalysisModel {
  id: number;
  modelId: number;
  chartName: string;
  chartType: string;
  simulationSteps: number;
  createdAt: string;
  updatedAt: string;
  xAxisName: string;
  xAxisField: string;
  xAxisUnit?: string;
  yAxisName: string;
  yAxisUnit?: string;
}

const ChartManagement: React.FC = () => {
  // 使用 useLocation 获取查询参数
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get('modelId') || useParams<{ modelId: string }>().modelId;
  
  const [charts, setCharts] = useState<ChartAnalysisModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [seriesModalVisible, setSeriesModalVisible] = useState(false);
  const [currentChart, setCurrentChart] = useState<ChartAnalysisModel | null>(null);

  // 获取图表数据
  const fetchCharts = useCallback(async () => {
    if (!modelId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await request(`/api-soo/api/soo/v2/chart-models/model/${modelId}`);
      
      // 适配新旧两种数据结构
      const data = response.datas || response.data || [];
      
      setCharts(data.map((chart: any) => ({
        ...chart,
        // 确保字段名统一
        xAxisName: chart.xAxisName || chart.xaxisName || '',
        xAxisField: chart.xAxisField || chart.xaxisField || '',
        xAxisUnit: chart.xAxisUnit || chart.xaxisUnit || '',
        yAxisName: chart.yAxisName || chart.yaxisName || '',
        yAxisUnit: chart.yAxisUnit || chart.yaxisUnit || '',
      })));
    } catch (error) {
      message.error('获取图表数据失败');
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    if (modelId) {
      fetchCharts();
    } else {
      setLoading(false);
    }
  }, [modelId, fetchCharts]);

  // 处理编辑
  const handleEdit = (record: ChartAnalysisModel) => {
    setCurrentChart(record);
    setModalVisible(true);
  };

  // 处理系列配置
  const handleSeriesConfig = (record: ChartAnalysisModel) => {
    setCurrentChart(record);
    setSeriesModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await request(`/api-soo/api/soo/v2/chart-models/${id}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      fetchCharts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理预览
  const handlePreview = (record: ChartAnalysisModel) => {
    message.info(`预览图表: ${record.chartName}`);
  };

  // 处理保存成功后的刷新
  const handleSaveSuccess = () => {
    fetchCharts(); // 刷新图表列表
  };

  // 表格列定义
  const columns: ProColumns<ChartAnalysisModel>[] = [
    {
      title: '图表名称',
      dataIndex: 'chartName',
      width: 200,
    },
    {
      title: '图表类型',
      dataIndex: 'chartType',
      width: 120,
      render: (text) => {
        const types: Record<string, string> = {
          line: '折线图',
          bar: '柱状图',
          pie: '饼图',
          scatter: '散点图',
        };
        return types[text as string] || text;
      },
    },
    {
      title: 'X轴',
      children: [
        {
          title: '名称',
          dataIndex: 'xAxisName',
          width: 120,
        },
        {
          title: '字段',
          dataIndex: 'xAxisField',
          width: 120,
        },
        {
          title: '单位',
          dataIndex: 'xAxisUnit',
          width: 80,
        },
      ],
    },
    {
      title: 'Y轴',
      children: [
        {
          title: '名称',
          dataIndex: 'yAxisName',
          width: 120,
        },
        {
          title: '单位',
          dataIndex: 'yAxisUnit',
          width: 80,
        },
      ],
    },
    {
      title: '模拟步数',
      dataIndex: 'simulationSteps',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (_, record) => record.createdAt ? moment(record.createdAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 240,
      render: (_, record) => [
        <a key="edit" onClick={() => handleEdit(record)}>编辑</a>,
        <a key="series" onClick={() => handleSeriesConfig(record)}>系列配置</a>,
        <a key="delete" onClick={() => handleDelete(record.id)}>删除</a>,
        <a key="preview" onClick={() => handlePreview(record)}>预览</a>,
      ],
    },
  ];

  // 添加空状态处理
  if (!modelId) {
    return (
      <PageContainer>
        <div style={{ padding: '100px', textAlign: 'center' }}>
          <h2>缺少模型ID</h2>
          <p>请确保URL中包含有效的modelId参数</p>
          <p>例如: /saleops-optimizer/financial-analysis/v2/chart-management?modelId=1</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProTable<ChartAnalysisModel>
        headerTitle="图表管理"
        rowKey="id"
        columns={columns}
        dataSource={charts}
        loading={loading}
        search={false}
        pagination={false}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setCurrentChart(null);
              setModalVisible(true);
            }}
          >
            新增图表
          </Button>,
        ]}
      />
      
      {/* 图表编辑/新增模态框 */}
      {modalVisible && (
        <ChartEditModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSuccess={handleSaveSuccess} // 传递成功回调
          modelId={modelId || ''}
          chartData={currentChart}
        />
      )}
      
      {/* 图表系列配置模态框 */}
      {seriesModalVisible && currentChart && (
        <ChartSeriesModal
          visible={seriesModalVisible}
          onCancel={() => setSeriesModalVisible(false)}
          chartData={currentChart}
        />
      )}
    </PageContainer>
  );
};

export default ChartManagement; 