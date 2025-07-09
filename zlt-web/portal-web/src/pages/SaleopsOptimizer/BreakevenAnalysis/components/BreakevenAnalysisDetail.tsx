import React, { useState, useEffect } from 'react';
import {
  Modal,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Divider,
  Alert,
  Spin,
  Button,
  Space
} from 'antd';
import { 
  CalculatorOutlined, 
  BarChartOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import * as breakevenService from '@/services/saleops/breakeven';

interface BreakevenAnalysisDetailProps {
  visible: boolean;
  analysisId: string | null;
  onCancel: () => void;
}

const BreakevenAnalysisDetail: React.FC<BreakevenAnalysisDetailProps> = ({
  visible,
  analysisId,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (visible && analysisId) {
      loadAnalysisDetail();
    }
  }, [visible, analysisId]);

  const loadAnalysisDetail = async () => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      const response = await breakevenService.getAnalysisDetail(analysisId);
      setData(response.data);
    } catch (error) {
      console.error('加载分析详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      await breakevenService.recalculateAnalysis(analysisId);
      await loadAnalysisDetail(); // 重新加载数据
    } catch (error) {
      console.error('重新计算失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const config = {
      active: { color: 'green', text: '活跃' },
      draft: { color: 'blue', text: '草稿' },
      archived: { color: 'default', text: '已归档' },
      calculating: { color: 'orange', text: '计算中' }
    };
    const { color, text } = config[status as keyof typeof config] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const getReasonabilityColor = (score: number) => {
    if (score >= 0.8) return '#52c41a';
    if (score >= 0.6) return '#faad14';
    return '#f5222d';
  };

  return (
    <Modal
      title="盈亏平衡分析详情"
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="recalculate" icon={<ReloadOutlined />} onClick={handleRecalculate} loading={loading}>
          重新计算
        </Button>,
        <Button key="export" icon={<ExportOutlined />}>
          导出报告
        </Button>,
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        {data ? (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <Descriptions column={3}>
                <Descriptions.Item label="分析名称">{data.analysisName}</Descriptions.Item>
                <Descriptions.Item label="分析ID">{data.analysisId}</Descriptions.Item>
                <Descriptions.Item label="状态">{getStatusTag(data.status)}</Descriptions.Item>
                <Descriptions.Item label="分析类型">{data.analysisType}</Descriptions.Item>
                <Descriptions.Item label="分析期间">{data.analysisPeriod}</Descriptions.Item>
                <Descriptions.Item label="创建人">{data.creatorName}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{data.createdAt}</Descriptions.Item>
                <Descriptions.Item label="最后计算">{data.lastRecalculation || '未计算'}</Descriptions.Item>
                <Descriptions.Item label="实时计算">{data.isRealTime ? '开启' : '关闭'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 核心指标 */}
            <Card title="核心分析指标" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="盈亏平衡点"
                    value={data.breakevenPoint}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="总固定成本"
                    value={data.totalFixedCost}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="变动成本率"
                    value={data.variableCostRatio * 100}
                    precision={2}
                    suffix="%"
                    valueStyle={{ color: '#eb2f96' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="安全边际"
                    value={data.marginSafety}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* 比率分析 */}
            <Card title="比率分析" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8 }}>安全边际率</div>
                    <Progress
                      percent={data.marginSafetyRatio * 100}
                      strokeColor={data.marginSafetyRatio >= 0.3 ? '#52c41a' : data.marginSafetyRatio >= 0.2 ? '#faad14' : '#f5222d'}
                      format={(percent) => `${percent?.toFixed(1)}%`}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8 }}>合理性评分</div>
                    <Progress
                      percent={data.reasonabilityScore * 100}
                      strokeColor={getReasonabilityColor(data.reasonabilityScore)}
                      format={(percent) => `${percent?.toFixed(0)}分`}
                    />
                  </div>
                </Col>
              </Row>

              {/* 合理性提示 */}
              {data.reasonabilityScore < 0.6 && (
                <Alert
                  message="合理性评分较低"
                  description="当前分析的合理性评分低于60分，建议检查参数设置或重新评估业务假设。"
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>

            {/* 计算参数 */}
            <Card title="计算参数" style={{ marginBottom: 16 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="计算引擎版本">{data.calculationEngineVersion}</Descriptions.Item>
                <Descriptions.Item label="计算耗时">{data.calculationDuration}ms</Descriptions.Item>
                <Descriptions.Item label="计算触发方式">{data.calculationTrigger}</Descriptions.Item>
                <Descriptions.Item label="自动重算">{data.autoRecalculation ? '开启' : '关闭'}</Descriptions.Item>
              </Descriptions>
              
              {data.currentParameters && (
                <div style={{ marginTop: 16 }}>
                  <Divider>当前参数配置</Divider>
                  <pre style={{ 
                    background: '#f6f8fa', 
                    padding: 16, 
                    borderRadius: 6,
                    fontSize: 12,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(JSON.parse(data.currentParameters), null, 2)}
                  </pre>
                </div>
              )}
            </Card>

            {/* 约束违规提示 */}
            {data.constraintViolations && (
              <Card title="约束违规提示">
                <Alert
                  message="发现约束违规"
                  description={data.constraintViolations}
                  type="error"
                  showIcon
                />
              </Card>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ color: '#999' }}>暂无数据</div>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default BreakevenAnalysisDetail; 