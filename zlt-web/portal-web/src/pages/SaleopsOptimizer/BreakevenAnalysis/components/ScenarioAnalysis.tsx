import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  Card,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Statistic,
  Divider,
  message,
  Spin,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  BarChartOutlined,
  SwapOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as breakevenService from '@/services/saleops/breakeven';

interface ScenarioAnalysisProps {
  visible: boolean;
  analysisId: string | null;
  onCancel: () => void;
}

interface ScenarioData {
  id: string;
  scenarioName: string;
  scenarioType: string;
  fixedCost: number;
  variableCostRatio: number;
  breakevenPoint: number;
  marginSafety: number;
  createdAt: string;
}

const ScenarioAnalysis: React.FC<ScenarioAnalysisProps> = ({
  visible,
  analysisId,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && analysisId) {
      loadScenarios();
    }
  }, [visible, analysisId]);

  const loadScenarios = async () => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      const response = await breakevenService.getScenarios(analysisId);
      setScenarios(response.data || []);
    } catch (error) {
      console.error('加载场景失败:', error);
      message.error('加载场景失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScenario = async (values: any) => {
    if (!analysisId) return;
    
    try {
      await breakevenService.addScenario(analysisId, values);
      message.success('场景添加成功');
      setShowAddForm(false);
      form.resetFields();
      loadScenarios();
    } catch (error) {
      console.error('添加场景失败:', error);
      message.error('添加场景失败');
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      await breakevenService.deleteScenario(scenarioId);
      message.success('场景删除成功');
      loadScenarios();
    } catch (error) {
      console.error('删除场景失败:', error);
      message.error('删除场景失败');
    }
  };

  const handleCompareScenarios = async () => {
    if (selectedScenarios.length < 2) {
      message.warning('请至少选择2个场景进行对比');
      return;
    }

    setLoading(true);
    try {
      const response = await breakevenService.compareScenarios(selectedScenarios);
      setComparisonData(response.data);
    } catch (error) {
      console.error('场景对比失败:', error);
      message.error('场景对比失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ScenarioData> = [
    {
      title: '场景名称',
      dataIndex: 'scenarioName',
      key: 'scenarioName',
      width: 150
    },
    {
      title: '场景类型',
      dataIndex: 'scenarioType',
      key: 'scenarioType',
      width: 100
    },
    {
      title: '固定成本',
      dataIndex: 'fixedCost',
      key: 'fixedCost',
      width: 120,
      align: 'right',
      render: (value: number) => `¥${value?.toLocaleString()}`
    },
    {
      title: '变动成本率',
      dataIndex: 'variableCostRatio',
      key: 'variableCostRatio',
      width: 120,
      align: 'right',
      render: (value: number) => `${(value * 100).toFixed(2)}%`
    },
    {
      title: '盈亏平衡点',
      dataIndex: 'breakevenPoint',
      key: 'breakevenPoint',
      width: 120,
      align: 'right',
      render: (value: number) => `¥${value?.toLocaleString()}`
    },
    {
      title: '安全边际',
      dataIndex: 'marginSafety',
      key: 'marginSafety',
      width: 120,
      align: 'right',
      render: (value: number) => `¥${value?.toLocaleString()}`
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定删除此场景？"
          onConfirm={() => handleDeleteScenario(record.id)}
        >
          <Button 
            type="text" 
            danger 
            size="small"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedScenarios,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedScenarios(selectedRowKeys as string[]);
    }
  };

  return (
    <Modal
      title="场景分析"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 操作按钮 */}
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddForm(true)}
            >
              添加场景
            </Button>
            <Button
              icon={<SwapOutlined />}
              onClick={handleCompareScenarios}
              disabled={selectedScenarios.length < 2}
            >
              场景对比 ({selectedScenarios.length})
            </Button>
          </Space>

          {/* 场景列表 */}
          <Table
            columns={columns}
            dataSource={scenarios}
            rowKey="id"
            rowSelection={rowSelection}
            pagination={false}
            size="small"
          />

          {/* 场景对比结果 */}
          {comparisonData && (
            <Card title="场景对比结果" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                {comparisonData.scenarios?.map((scenario: any, index: number) => (
                  <Col span={8} key={scenario.id}>
                    <Card size="small" title={scenario.scenarioName}>
                      <Statistic
                        title="盈亏平衡点"
                        value={scenario.breakevenPoint}
                        precision={2}
                        prefix="¥"
                      />
                      <Statistic
                        title="安全边际"
                        value={scenario.marginSafety}
                        precision={2}
                        prefix="¥"
                        style={{ marginTop: 16 }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
              
              {comparisonData.summary && (
                <div style={{ marginTop: 16 }}>
                  <Divider>对比总结</Divider>
                  <div>{comparisonData.summary}</div>
                </div>
              )}
            </Card>
          )}
        </Space>
      </Spin>

      {/* 添加场景表单 */}
      <Modal
        title="添加场景"
        open={showAddForm}
        onCancel={() => {
          setShowAddForm(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddScenario}
        >
          <Form.Item
            name="scenarioName"
            label="场景名称"
            rules={[{ required: true, message: '请输入场景名称' }]}
          >
            <Input placeholder="请输入场景名称" />
          </Form.Item>

          <Form.Item
            name="scenarioType"
            label="场景类型"
            rules={[{ required: true, message: '请输入场景类型' }]}
          >
            <Input placeholder="如：保守、基准、乐观" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fixedCost"
                label="固定成本"
                rules={[{ required: true, message: '请输入固定成本' }]}
              >
                <InputNumber
                  placeholder="请输入固定成本"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="variableCostRatio"
                label="变动成本率"
                rules={[{ required: true, message: '请输入变动成本率' }]}
              >
                <InputNumber
                  placeholder="请输入变动成本率"
                  style={{ width: '100%' }}
                  min={0}
                  max={1}
                  step={0.01}
                  precision={4}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="场景描述"
          >
            <Input.TextArea 
              placeholder="请输入场景描述"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default ScenarioAnalysis; 