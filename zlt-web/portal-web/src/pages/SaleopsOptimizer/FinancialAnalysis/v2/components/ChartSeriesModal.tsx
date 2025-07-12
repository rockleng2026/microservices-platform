import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Table, message, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';

interface ChartSeries {
  id?: number;
  chartId: number;
  seriesName: string;
  seriesField: string;
  seriesType: string;
  seriesValue?: string;
  color?: string;
  sortOrder?: number;
}

interface ChartData {
  id: number;
  chartName: string;
  chartType: string;
}

interface ChartSeriesModalProps {
  visible: boolean;
  onCancel: () => void;
  chartData: ChartData;
}

const ChartSeriesModal: React.FC<ChartSeriesModalProps> = ({
  visible,
  onCancel,
  chartData,
}) => {
  const [form] = Form.useForm();
  const [seriesList, setSeriesList] = useState<ChartSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 系列类型选项
  const seriesTypeOptions = [
    { label: '固定值', value: 'fixed' },
    { label: '变量', value: 'variable' },
    { label: '公式', value: 'formula' },
  ];

  // 预设颜色
  const presetColors = [
    '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1',
    '#33FFF5', '#FFD633', '#8E33FF', '#FF8E33', '#33FF8E'
  ];

  // 颜色选项
  const colorOptions = presetColors.map(color => ({
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: 16,
            height: 16,
            backgroundColor: color,
            marginRight: 8,
            border: '1px solid #d9d9d9',
            borderRadius: 2,
          }}
        />
        {color}
      </div>
    ),
    value: color,
  }));

  // 获取系列数据
  const fetchSeries = async () => {
    if (!chartData.id) return;
    
    setLoading(true);
    try {
      const response = await request(`/api-soo/api/soo/v2/chart-series/chart/${chartData.id}`);
      const data = response.datas || response.data || [];
      setSeriesList(data);
    } catch (error) {
      message.error('获取系列配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && chartData.id) {
      fetchSeries();
    }
  }, [visible, chartData.id]);

  // 添加新系列
  const handleAddSeries = () => {
    const newSeries: ChartSeries = {
      chartId: chartData.id,
      seriesName: `系列${seriesList.length + 1}`,
      seriesField: '',
      seriesType: 'fixed',
      seriesValue: '',
      color: presetColors[seriesList.length % presetColors.length],
      sortOrder: seriesList.length + 1,
    };
    setSeriesList([...seriesList, newSeries]);
  };

  // 删除系列
  const handleDeleteSeries = (index: number) => {
    const newList = seriesList.filter((_, i) => i !== index);
    setSeriesList(newList);
  };

  // 更新系列数据
  const handleUpdateSeries = (index: number, field: string, value: any) => {
    const newList = [...seriesList];
    newList[index] = { ...newList[index], [field]: value };
    setSeriesList(newList);
  };

  // 保存系列配置
  const handleSave = async () => {
    setSaving(true);
    try {
      // 验证必填字段
      for (let i = 0; i < seriesList.length; i++) {
        const series = seriesList[i];
        if (!series.seriesName || !series.seriesField) {
          message.error(`第${i + 1}行的系列名称和字段标识不能为空`);
          setSaving(false);
          return;
        }
      }

      await request(`/api-soo/api/soo/v2/chart-series/chart/${chartData.id}`, {
        method: 'POST',
        data: seriesList,
      });

      message.success('保存成功');
      onCancel();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '系列名称',
      dataIndex: 'seriesName',
      width: 150,
      render: (text: string, record: ChartSeries, index: number) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateSeries(index, 'seriesName', e.target.value)}
          placeholder="请输入系列名称"
        />
      ),
    },
    {
      title: '字段标识',
      dataIndex: 'seriesField',
      width: 150,
      render: (text: string, record: ChartSeries, index: number) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateSeries(index, 'seriesField', e.target.value)}
          placeholder="请输入字段标识"
        />
      ),
    },
    {
      title: '系列类型',
      dataIndex: 'seriesType',
      width: 120,
      render: (text: string, record: ChartSeries, index: number) => (
        <Select
          value={text}
          onChange={(value) => handleUpdateSeries(index, 'seriesType', value)}
          options={seriesTypeOptions}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '系列值',
      dataIndex: 'seriesValue',
      width: 150,
      render: (text: string, record: ChartSeries, index: number) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateSeries(index, 'seriesValue', e.target.value)}
          placeholder={
            record.seriesType === 'fixed' ? '如: 100' :
            record.seriesType === 'variable' ? '如: 0.10' : '如: base*1.1'
          }
        />
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      width: 120,
      render: (text: string, record: ChartSeries, index: number) => (
        <Select
          value={text}
          onChange={(value) => handleUpdateSeries(index, 'color', value)}
          options={colorOptions}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 80,
      render: (text: number, record: ChartSeries, index: number) => (
        <Input
          type="number"
          value={text}
          onChange={(e) => handleUpdateSeries(index, 'sortOrder', parseInt(e.target.value) || 0)}
          style={{ width: 60 }}
        />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (text: any, record: ChartSeries, index: number) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteSeries(index)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={`图表系列配置 - ${chartData.chartName}`}
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" loading={saving} onClick={handleSave}>
          保存
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddSeries}
          style={{ width: '100%' }}
        >
          添加系列
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={seriesList}
        rowKey={(record, index) => `${record.id || 'new'}_${index}`}
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
      />

      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        <h4>说明：</h4>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>固定值</strong>: 系列值为固定数值，如 100</li>
          <li><strong>变量</strong>: 系列值为变量值，如 0.10 表示 10%</li>
          <li><strong>公式</strong>: 系列值为计算公式，如 base*1.1 表示基础值的110%</li>
        </ul>
      </div>
    </Modal>
  );
};

export default ChartSeriesModal; 