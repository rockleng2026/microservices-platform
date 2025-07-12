import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Button, 
  message, 
  Space, 
  Card,
  Divider,
  Typography
} from 'antd';

import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';

const { Option } = Select;
const { Text } = Typography;

interface SeriesConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  chartId?: number;
  variables: any[];
  existingSeries?: any[];
}

interface SeriesFormData {
  seriesName: string;
  seriesField: string;
  seriesType: 'fixed' | 'variable' | 'formula';
  seriesValue?: string;
  color?: string;
  sortOrder: number;
}

const SeriesConfigModal: React.FC<SeriesConfigModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  chartId,
  variables,
  existingSeries = []
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [seriesList, setSeriesList] = useState<SeriesFormData[]>([]);

  useEffect(() => {
    if (visible) {
      // 初始化系列列表
      if (existingSeries.length > 0) {
        setSeriesList(existingSeries.map(series => ({
          seriesName: series.seriesName,
          seriesField: series.seriesField,
          seriesType: series.seriesType,
          seriesValue: series.seriesValue,
          color: series.color,
          sortOrder: series.sortOrder || 0
        })));
      } else {
        // 默认添加一个系列
        setSeriesList([{
          seriesName: '系列1',
          seriesField: 'net_profits',
          seriesType: 'formula',
          seriesValue: 'x * 0.1 - total_fixed_cost',
          color: '#1890ff',
          sortOrder: 0
        }]);
      }
    }
  }, [visible, existingSeries]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // 验证系列列表
      if (seriesList.length === 0) {
        message.error('请至少添加一个系列');
        return;
      }

      // 构建提交数据
      const submitData = seriesList.map((series, index) => ({
        chartId,
        seriesName: series.seriesName,
        seriesField: series.seriesField,
        seriesType: series.seriesType,
        seriesValue: series.seriesValue,
        color: series.color,
        sortOrder: series.sortOrder || index
      }));

      await request(`/api-soo/api/soo/v2/chart-series/chart/${chartId}`, {
        method: 'POST',
        data: submitData
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

  const addSeries = () => {
    const newSeries: SeriesFormData = {
      seriesName: `系列${seriesList.length + 1}`,
      seriesField: 'net_profits',
      seriesType: 'formula',
      seriesValue: 'x * 0.1 - total_fixed_cost',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      sortOrder: seriesList.length
    };
    setSeriesList([...seriesList, newSeries]);
  };

  const removeSeries = (index: number) => {
    const newList = seriesList.filter((_, i) => i !== index);
    setSeriesList(newList);
  };

  const updateSeries = (index: number, field: keyof SeriesFormData, value: any) => {
    const newList = [...seriesList];
    newList[index] = { ...newList[index], [field]: value };
    setSeriesList(newList);
  };

  const seriesTypeOptions = [
    { label: '固定值', value: 'fixed', description: '固定数值，与X轴无关' },
    { label: '变量值', value: 'variable', description: '使用模型变量的值' },
    { label: '公式计算', value: 'formula', description: '基于公式动态计算，支持x变量' }
  ];

  const variableOptions = variables.map(v => ({
    label: `${v.variableName} [${v.variableCode}]`,
    value: v.variableCode
  }));

  const renderSeriesForm = (series: SeriesFormData, index: number) => (
    <Card 
      key={index} 
      size="small" 
      style={{ marginBottom: 16 }}
      title={`系列 ${index + 1}`}
      extra={
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => removeSeries(index)}
          disabled={seriesList.length === 1}
        />
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item label="系列名称" required>
          <Input
            value={series.seriesName}
            onChange={(e) => updateSeries(index, 'seriesName', e.target.value)}
            placeholder="请输入系列名称"
          />
        </Form.Item>

        <Form.Item label="系列字段" required>
          <Select
            value={series.seriesField}
            onChange={(value) => updateSeries(index, 'seriesField', value)}
            placeholder="请选择系列字段"
            options={variableOptions}
          />
        </Form.Item>

        <Form.Item label="系列类型" required>
          <Select
            value={series.seriesType}
            onChange={(value) => updateSeries(index, 'seriesType', value)}
            placeholder="请选择系列类型"
            options={seriesTypeOptions}
          />
        </Form.Item>

        <Form.Item label="系列颜色">
          <Input
            value={series.color}
            onChange={(e) => updateSeries(index, 'color', e.target.value)}
            placeholder="#1890ff"
            addonBefore={
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: series.color || '#1890ff',
                  border: '1px solid #d9d9d9',
                  borderRadius: 2,
                }}
              />
            }
          />
        </Form.Item>

        <Form.Item label="排序">
          <InputNumber
            value={series.sortOrder}
            onChange={(value) => updateSeries(index, 'sortOrder', value)}
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </div>

      <Form.Item label="系列值" required>
        {series.seriesType === 'fixed' && (
          <InputNumber
            value={series.seriesValue}
            onChange={(value) => updateSeries(index, 'seriesValue', value?.toString())}
            placeholder="请输入固定数值"
            style={{ width: '100%' }}
          />
        )}
        
        {series.seriesType === 'variable' && (
          <Select
            value={series.seriesValue}
            onChange={(value) => updateSeries(index, 'seriesValue', value)}
            placeholder="请选择变量"
            options={variableOptions}
            style={{ width: '100%' }}
          />
        )}
        
        {series.seriesType === 'formula' && (
          <div>
            <Input.TextArea
              value={series.seriesValue}
              onChange={(e) => updateSeries(index, 'seriesValue', e.target.value)}
              placeholder="请输入计算公式，支持x变量"
              rows={3}
              style={{ marginBottom: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              支持变量: x(当前X轴值), {variables.map(v => v.variableCode).join(', ')}
              <br />
              示例: x * 0.1 - total_fixed_cost (X轴值乘以0.1减去固定成本)
            </Text>
          </div>
        )}
      </Form.Item>
    </Card>
  );

  return (
    <Modal
      title="配置图表系列"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          配置图表的系列数据。每个系列代表图表中的一条线或一组数据。
        </Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={addSeries}
          style={{ width: '100%' }}
        >
          添加系列
        </Button>
      </div>

      {seriesList.map((series, index) => renderSeriesForm(series, index))}

      <Divider />

      <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
        <Text strong>配置说明:</Text>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li><Text>固定值: 在图表中显示为水平直线</Text></li>
          <li><Text>变量值: 使用模型变量的当前值</Text></li>
          <li><Text>公式计算: 支持包含x变量的表达式，x代表当前X轴值</Text></li>
          <li><Text>系列颜色: 用于区分不同的数据系列</Text></li>
          <li><Text>排序: 控制系列在图例中的显示顺序</Text></li>
        </ul>
      </div>
    </Modal>
  );
};

export default SeriesConfigModal; 