import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Empty,
  Divider,
  Row,
  Col
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  LeftOutlined,
  SettingOutlined,
  ExportOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ChartManagementV2: React.FC = () => {
  // 返回财务分析主页
  const handleBack = () => {
    window.location.href = '/saleops-optimizer/financial-analysis/v2/financial-models';
  };

  return (
    <div className="chart-management-v2">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 8 }}>图表管理 V2</h2>
            <span style={{ color: '#666', fontSize: '14px' }}>
              管理财务模型的可视化图表配置和样式
            </span>
          </div>
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={handleBack}
            >
              返回模型管理
            </Button>
          </Space>
        </div>

        <Divider />

        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <BarChartOutlined style={{ fontSize: '72px', color: '#d9d9d9', marginBottom: '24px' }} />
          
          <Title level={3} style={{ color: '#595959' }}>图表管理功能</Title>
          
          <Paragraph style={{ fontSize: '16px', color: '#8c8c8c', marginBottom: '32px' }}>
            图表管理功能正在开发中，即将为您提供强大的可视化配置能力
          </Paragraph>

          <Row gutter={[24, 16]} justify="center" style={{ marginBottom: '32px' }}>
            <Col>
              <Card size="small" style={{ width: 200, textAlign: 'center' }}>
                <BarChartOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                <div style={{ fontWeight: 600 }}>柱状图配置</div>
                <div style={{ fontSize: '12px', color: '#999' }}>数据对比分析</div>
              </Card>
            </Col>
            <Col>
              <Card size="small" style={{ width: 200, textAlign: 'center' }}>
                <LineChartOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
                <div style={{ fontWeight: 600 }}>折线图配置</div>
                <div style={{ fontSize: '12px', color: '#999' }}>趋势变化分析</div>
              </Card>
            </Col>
            <Col>
              <Card size="small" style={{ width: 200, textAlign: 'center' }}>
                <PieChartOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '8px' }} />
                <div style={{ fontWeight: 600 }}>饼图配置</div>
                <div style={{ fontSize: '12px', color: '#999' }}>占比结构分析</div>
              </Card>
            </Col>
          </Row>

          <div style={{ background: '#fafafa', padding: '24px', borderRadius: '8px', textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontWeight: 600, marginBottom: '12px', color: '#262626' }}>
              <SettingOutlined style={{ marginRight: '8px' }} />
              即将支持的功能：
            </div>
            <ul style={{ color: '#595959', lineHeight: '1.8' }}>
              <li>图表类型配置（折线图、柱状图、饼图、散点图等）</li>
              <li>图表样式定制（颜色主题、字体、布局设置）</li>
              <li>数据系列配置（数据源绑定、计算字段）</li>
              <li>交互功能设置（缩放、筛选、钻取）</li>
              <li>图表模板管理（保存、复用、分享）</li>
              <li>导出设置（PNG、PDF、Excel格式）</li>
            </ul>
          </div>

          <Space size="large" style={{ marginTop: '32px' }}>
            <Button type="primary" icon={<BarChartOutlined />} disabled>
              柱状图配置
            </Button>
            <Button icon={<LineChartOutlined />} disabled>
              折线图配置
            </Button>
            <Button icon={<PieChartOutlined />} disabled>
              饼图配置
            </Button>
            <Button icon={<SettingOutlined />} disabled>
              模板管理
            </Button>
            <Button icon={<ExportOutlined />} disabled>
              导出设置
            </Button>
            <Button icon={<EyeOutlined />} disabled>
              预览
            </Button>
          </Space>

          <div style={{ marginTop: '24px', fontSize: '14px', color: '#bfbfbf' }}>
            敬请期待更多精彩功能的发布 🚀
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChartManagementV2; 