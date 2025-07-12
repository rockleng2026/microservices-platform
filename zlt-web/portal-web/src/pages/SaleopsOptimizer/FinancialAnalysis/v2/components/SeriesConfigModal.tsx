import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Space, Divider, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';

const { Text } = Typography;

interface ChartSeries {
  id?: number;
  chartId: number;
  seriesName: string;
  seriesField: string;
  seriesType: 'fixed' | 'variable' | 'formula';
  seriesValue?: string;
  color?: string;
  sortOrder?: number;
}

interface SeriesConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  chartId?: number;
  seriesList: ChartSeries[];
  variables: any[];
}

const SeriesConfigModal: React.FC<SeriesConfigModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  chartId,
  seriesList,
  variables
}) => {
  const [series, setSeries] = useState<ChartSeries[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && seriesList) {
      setSeries([...seriesList]);
    }
  }, [visible, seriesList]);

  const seriesTypeOptions = [
    { label: '固定值', value: 'fixed' },
    { label: '变量', value: 'variable' },
    { label: '公式', value: 'formula' }
  ];

  const presetColors = [
    '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1',
    '#33FFF5', '#FFD633', '#8E33FF', '#FF8E33', '#33FF8E'
  ];

  const variableOptions = variables.map(v => ({
    label: `${v.variableName} [${v.variableCode}]`,
    value: v.variableCode
  }));

  const handleAddSeries = () => {
    const newSeries: ChartSeries = {
      chartId: chartId || 0,
      seriesName: `系列${series.length + 1}`,
      seriesField: '',
      seriesType: 'fixed',
      seriesValue: '',
      color: presetColors[series.length % presetColors.length],
      sortOrder: series.length + 1
    };
    setSeries([...series, newSeries]);
  };

  const handleDeleteSeries = (index: number) => {
    const newSeries = series.filter((_, i) => i !== index);
    setSeries(newSeries);
  };

  const handleUpdateSeries = (index: number, field: string, value: any) => {
    const newSeries = [...series];
    newSeries[index] = { ...newSeries[index], [field]: value };
    setSeries(newSeries);
  };

  const handleSave = async () => {
    if (!chartId) {
      message.error('图表ID不能为空');
      return;
    }

    // 验证必填字段
    for (let i = 0; i < series.length; i++) {
      const s = series[i];
      if (!s.seriesName || !s.seriesField) {
        message.error(`第${i + 1}行的系列名称和字段标识不能为空`);
        return;
      }
    }

    setLoading(true);
    try {
      await request(`/api-soo/api/soo/v2/chart-series/chart/${chartId}`, {
        method: 'POST',
        data: series
      });

      message.success('系列配置保存成功');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('保存系列配置失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="系列配置"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          保存
        </Button>
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

      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {series.map((item, index) => (
          <div key={index} style={{ 
            border: '1px solid #d9d9d9', 
            borderRadius: 6, 
            padding: 16, 
            marginBottom: 12,
            background: '#fafafa'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text strong>系列 {index + 1}</Text>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteSeries(index)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item label="系列名称" style={{ margin: 0 }}>
                <Input
                  value={item.seriesName}
                  onChange={(e) => handleUpdateSeries(index, 'seriesName', e.target.value)}
                  placeholder="请输入系列名称"
                />
              </Form.Item>

              <Form.Item label="字段标识" style={{ margin: 0 }}>
                <Input
                  value={item.seriesField}
                  onChange={(e) => handleUpdateSeries(index, 'seriesField', e.target.value)}
                  placeholder="请输入字段标识"
                />
              </Form.Item>

              <Form.Item label="系列类型" style={{ margin: 0 }}>
                <Select
                  value={item.seriesType}
                  onChange={(value) => handleUpdateSeries(index, 'seriesType', value)}
                  options={seriesTypeOptions}
                />
              </Form.Item>

              <Form.Item label="排序" style={{ margin: 0 }}>
                <Input
                  type="number"
                  value={item.sortOrder}
                  onChange={(e) => handleUpdateSeries(index, 'sortOrder', Number(e.target.value))}
                  placeholder="排序号"
                />
              </Form.Item>

              <Form.Item label="系列值" style={{ margin: 0, gridColumn: 'span 2' }}>
                {item.seriesType === 'variable' ? (
                  <Select
                    value={item.seriesValue}
                    onChange={(value) => handleUpdateSeries(index, 'seriesValue', value)}
                    options={variableOptions}
                    placeholder="请选择变量"
                  />
                ) : (
                  <Input
                    value={item.seriesValue}
                    onChange={(e) => handleUpdateSeries(index, 'seriesValue', e.target.value)}
                    placeholder={
                      item.seriesType === 'fixed' ? '如: 100' : '如: revenue * 0.1 + x * 100'
                    }
                  />
                )}
              </Form.Item>

              <Form.Item label="颜色" style={{ margin: 0 }}>
                <Select
                  value={item.color}
                  onChange={(value) => handleUpdateSeries(index, 'color', value)}
                  placeholder="请选择颜色"
                >
                  {presetColors.map(color => (
                    <Select.Option key={color} value={color}>
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
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        ))}
      </div>

      {series.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          暂无系列配置，请点击上方按钮添加
        </div>
      )}
    </Modal>
  );
};

export default SeriesConfigModal; 