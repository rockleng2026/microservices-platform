import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Divider,
  Alert,
  Space,
  Button,
  Timeline,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import * as financialModelInstanceAPI from '@/services/financialModelInstance';

interface InstanceDetailProps {
  visible: boolean;
  instance: financialModelInstanceAPI.FinancialModelInstance | null;
  onCancel: () => void;
}

const InstanceDetail: React.FC<InstanceDetailProps> = ({
  visible,
  instance,
  onCancel,
}) => {
  if (!instance) return null;

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      DRAFT: { color: 'default', text: '草稿' },
      ACTIVE: { color: 'success', text: '激活' },
      INACTIVE: { color: 'warning', text: '停用' },
      ARCHIVED: { color: 'error', text: '归档' },
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取计算状态标签
  const getCalculationStatusTag = (status: string) => {
    const statusMap = {
      PENDING: { color: 'default', text: '待计算', icon: <ClockCircleOutlined /> },
      CALCULATING: { color: 'processing', text: '计算中', icon: <CalculatorOutlined /> },
      COMPLETED: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      FAILED: { color: 'error', text: '失败', icon: <CloseCircleOutlined /> },
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  return (
    <Drawer
      title="模型实例详情"
      placement="right"
      width={800}
      open={visible}
      onClose={onCancel}
      extra={
        <Space>
          <Button icon={<FileTextOutlined />}>导出配置</Button>
        </Space>
      }
    >
      <div style={{ paddingBottom: 20 }}>
        {/* 基本信息 */}
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="实例编码">{instance.instanceCode}</Descriptions.Item>
            <Descriptions.Item label="实例名称">{instance.instanceName}</Descriptions.Item>
            <Descriptions.Item label="关联模型">
              {instance.financialModel?.modelName} ({instance.financialModel?.modelCode})
            </Descriptions.Item>
            <Descriptions.Item label="关联项目">{instance.projectName || '-'}</Descriptions.Item>
            <Descriptions.Item label="实例状态">{getStatusTag(instance.instanceStatus)}</Descriptions.Item>
            <Descriptions.Item label="实例版本">{instance.instanceVersion}</Descriptions.Item>
            <Descriptions.Item label="创建人">{instance.creatorName || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(instance.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{new Date(instance.updatedAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="租户ID">{instance.tenantId}</Descriptions.Item>
          </Descriptions>
          
          {instance.instanceDescription && (
            <>
              <Divider orientation="left">实例描述</Divider>
              <p>{instance.instanceDescription}</p>
            </>
          )}
        </Card>

        {/* 计算状态 */}
        <Card title="计算状态" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>计算状态</div>
                {getCalculationStatusTag(instance.calculationStatus)}
              </div>
            </Col>
            <Col span={8}>
              <Statistic
                title="最后计算时间"
                value={instance.lastCalculatedAt ? new Date(instance.lastCalculatedAt).toLocaleString() : '未计算'}
                prefix={<CalendarOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="计算次数"
                value={0} // 这里可以从计算历史中获取
                prefix={<FileTextOutlined />}
              />
            </Col>
          </Row>

          {instance.calculationStatus === 'FAILED' && (
            <Alert
              message="计算失败"
              description="最后一次计算失败，请检查变量配置或重新执行计算"
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* 配置信息 */}
        {instance.instanceConfig && (
          <Card title="实例配置" style={{ marginBottom: 16 }}>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: 12, 
              borderRadius: 6, 
              maxHeight: 200, 
              overflow: 'auto' 
            }}>
              {JSON.stringify(JSON.parse(instance.instanceConfig), null, 2)}
            </pre>
          </Card>
        )}

        {/* 计算结果 */}
        {instance.calculationResult && (
          <Card title="计算结果" style={{ marginBottom: 16 }}>
            <pre style={{ 
              backgroundColor: '#f0f9ff', 
              padding: 12, 
              borderRadius: 6, 
              maxHeight: 200, 
              overflow: 'auto' 
            }}>
              {JSON.stringify(JSON.parse(instance.calculationResult), null, 2)}
            </pre>
          </Card>
        )}

        {/* 操作历史 */}
        <Card title="操作历史">
          <Timeline>
            <Timeline.Item dot={<UserOutlined style={{ fontSize: '16px' }} />}>
              <p>创建实例</p>
              <p style={{ color: '#666', fontSize: 12 }}>
                {new Date(instance.createdAt).toLocaleString()} - {instance.creatorName || '系统'}
              </p>
            </Timeline.Item>
            {instance.lastCalculatedAt && (
              <Timeline.Item dot={<CalculatorOutlined style={{ fontSize: '16px' }} />}>
                <p>执行计算</p>
                <p style={{ color: '#666', fontSize: 12 }}>
                  {new Date(instance.lastCalculatedAt).toLocaleString()}
                </p>
              </Timeline.Item>
            )}
            <Timeline.Item dot={<FileTextOutlined style={{ fontSize: '16px' }} />}>
              <p>更新实例</p>
              <p style={{ color: '#666', fontSize: 12 }}>
                {new Date(instance.updatedAt).toLocaleString()}
              </p>
            </Timeline.Item>
          </Timeline>
        </Card>
      </div>
    </Drawer>
  );
};

export default InstanceDetail; 