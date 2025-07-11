import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  message,
  Alert,
  Descriptions,
  Typography
} from 'antd';
import {
  PlayCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { BreakevenAnalysisV2API } from '@/services/breakevenAnalysisV2';

const { Title, Paragraph, Text } = Typography;

const ApiTestPageV2: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 测试获取模型列表
  const testGetModels = async () => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getAvailableModels();
      console.log('模型列表API测试结果:', response);
      
      if (response.resp_code === 0) {
        setModels(response.datas || []);
        message.success(`成功获取 ${response.datas?.length || 0} 个模型`);
      } else {
        message.error(response.resp_msg || 'API调用失败');
      }
    } catch (error) {
      console.error('API测试失败:', error);
      message.error('API测试失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试获取变量列表
  const testGetVariables = async () => {
    if (models.length === 0) {
      message.warning('请先获取模型列表');
      return;
    }

    try {
      setLoading(true);
      const modelId = models[0].id;
      const response = await BreakevenAnalysisV2API.getModelVariables(modelId);
      console.log('变量列表API测试结果:', response);
      
      if (response.resp_code === 0) {
        setVariables(response.datas || []);
        message.success(`成功获取 ${response.datas?.length || 0} 个变量`);
      } else {
        message.error(response.resp_msg || 'API调用失败');
      }
    } catch (error) {
      console.error('API测试失败:', error);
      message.error('API测试失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试分析计算
  const testCalculateBreakeven = async () => {
    if (models.length === 0) {
      message.warning('请先获取模型列表');
      return;
    }

    try {
      setLoading(true);
      const modelId = models[0].id;
      
      // 使用测试参数
      const testParams = {
        salary: 50000,
        social_insurance: 15000,
        fixed_cost: 20000,
        revenue: 200000,
        gross_margin: 30,
        variable_cost_rate: 5
      };
      
      const response = await BreakevenAnalysisV2API.calculateBreakeven({
        modelId,
        variableValues: testParams
      });
      
      console.log('分析计算API测试结果:', response);
      
      if (response.resp_code === 0) {
        setAnalysisResult(response.datas);
        message.success('分析计算成功');
      } else {
        message.error(response.resp_msg || 'API调用失败');
      }
    } catch (error) {
      console.error('API测试失败:', error);
      message.error('API测试失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Alert
        message="盈亏平衡分析 V2 API 测试页面"
        description="此页面用于测试新版本的API接口连接和功能"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Title level={2}>API 测试工具</Title>
      
      <Card title="API 测试操作" style={{ marginBottom: 16 }}>
        <Space size="large">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={testGetModels}
            loading={loading}
          >
            测试获取模型列表
          </Button>
          
          <Button
            icon={<PlayCircleOutlined />}
            onClick={testGetVariables}
            loading={loading}
            disabled={models.length === 0}
          >
            测试获取变量列表
          </Button>
          
          <Button
            icon={<PlayCircleOutlined />}
            onClick={testCalculateBreakeven}
            loading={loading}
            disabled={models.length === 0}
          >
            测试分析计算
          </Button>
        </Space>
        
        <Paragraph style={{ marginTop: 16 }}>
          <Text type="secondary">
            请按顺序执行测试：先获取模型列表，再测试其他功能。所有测试结果会在浏览器控制台中显示详细信息。
          </Text>
        </Paragraph>
      </Card>

      {/* 模型列表结果 */}
      {models.length > 0 && (
        <Card title={`模型列表 (${models.length} 个)`} style={{ marginBottom: 16 }}>
          {models.map(model => (
            <Descriptions 
              key={model.id} 
              bordered 
              size="small" 
              style={{ marginBottom: 16 }}
              title={model.modelName}
            >
              <Descriptions.Item label="ID">{model.id}</Descriptions.Item>
              <Descriptions.Item label="编码">{model.modelCode}</Descriptions.Item>
              <Descriptions.Item label="变量数量">{model.variableCount}</Descriptions.Item>
              <Descriptions.Item label="分类">{model.category}</Descriptions.Item>
              <Descriptions.Item label="状态">{model.status}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{model.description}</Descriptions.Item>
            </Descriptions>
          ))}
        </Card>
      )}

      {/* 变量列表结果 */}
      {variables.length > 0 && (
        <Card title={`变量列表 (${variables.length} 个)`} style={{ marginBottom: 16 }}>
          {variables.slice(0, 3).map(variable => (
            <Descriptions 
              key={variable.id} 
              bordered 
              size="small" 
              style={{ marginBottom: 16 }}
              title={variable.variableName}
            >
              <Descriptions.Item label="ID">{variable.id}</Descriptions.Item>
              <Descriptions.Item label="编码">{variable.variableCode}</Descriptions.Item>
              <Descriptions.Item label="类型">{variable.variableType}</Descriptions.Item>
              <Descriptions.Item label="数据类型">{variable.dataType}</Descriptions.Item>
              <Descriptions.Item label="默认值">{variable.defaultValue}</Descriptions.Item>
              <Descriptions.Item label="单位">{variable.unit}</Descriptions.Item>
              <Descriptions.Item label="必填">{variable.isRequired ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{variable.description}</Descriptions.Item>
            </Descriptions>
          ))}
          {variables.length > 3 && (
            <Text>... 还有 {variables.length - 3} 个变量</Text>
          )}
        </Card>
      )}

      {/* 分析结果 */}
      {analysisResult && (
        <Card title="分析结果" style={{ marginBottom: 16 }}>
          <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default ApiTestPageV2; 