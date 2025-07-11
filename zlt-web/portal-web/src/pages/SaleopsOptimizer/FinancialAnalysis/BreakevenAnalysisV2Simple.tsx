import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Select,
  message,
  Spin,
  Typography,
  Space,
  Descriptions
} from 'antd';
import {
  ReloadOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { BreakevenAnalysisV2API } from '@/services/breakevenAnalysisV2';

const { Option } = Select;
const { Title, Text } = Typography;

const BreakevenAnalysisV2Simple: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();
  const [variables, setVariables] = useState<any[]>([]);

  // 获取模型列表
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getAvailableModels();
      console.log('API响应:', response);
      
      if (response.resp_code === 0) {
        setModels(response.datas || []);
        message.success(`获取到 ${response.datas?.length || 0} 个模型`);
      } else {
        message.error(response.resp_msg || '获取模型列表失败');
      }
    } catch (error) {
      console.error('请求失败:', error);
      message.error('请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取模型变量
  const fetchVariables = async (modelId: number) => {
    try {
      setLoading(true);
      const response = await BreakevenAnalysisV2API.getModelVariables(modelId);
      console.log('变量响应:', response);
      
      if (response.resp_code === 0) {
        setVariables(response.datas || []);
        message.success(`获取到 ${response.datas?.length || 0} 个变量`);
      } else {
        message.error(response.resp_msg || '获取变量失败');
      }
    } catch (error) {
      console.error('请求失败:', error);
      message.error('请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 执行测试分析
  const testAnalysis = async () => {
    if (!selectedModelId) {
      message.warning('请先选择模型');
      return;
    }

    try {
      setLoading(true);
      
      // 使用模拟参数进行测试
      const testParams = {
        fixed_cost: 10000,
        unit_price: 100,
        variable_cost: 50,
        target_profit: 5000
      };
      
      const response = await BreakevenAnalysisV2API.calculateBreakeven({
        modelId: selectedModelId,
        variableValues: testParams
      });
      
      console.log('分析结果:', response);
      
      if (response.resp_code === 0) {
        message.success('分析完成！请查看控制台结果');
      } else {
        message.error(response.resp_msg || '分析失败');
      }
    } catch (error) {
      console.error('分析失败:', error);
      message.error('分析失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>盈亏平衡分析V2 API测试</Title>
      
      <Card title="API连接测试" loading={loading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* 模型列表测试 */}
          <div>
            <Text strong>1. 模型列表测试</Text>
            <div style={{ marginTop: 8 }}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchModels}
                disabled={loading}
              >
                获取模型列表
              </Button>
              <Text style={{ marginLeft: 16 }}>
                {models.length > 0 ? `已获取 ${models.length} 个模型` : '暂无模型数据'}
              </Text>
            </div>
            
            {models.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Select
                  placeholder="选择测试模型"
                  style={{ width: 300 }}
                  value={selectedModelId}
                  onChange={(value) => {
                    setSelectedModelId(value);
                    setVariables([]);
                  }}
                >
                  {models.map(model => (
                    <Option key={model.id} value={model.id}>
                      {model.modelName} (ID: {model.id})
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* 变量列表测试 */}
          {selectedModelId && (
            <div>
              <Text strong>2. 变量列表测试</Text>
              <div style={{ marginTop: 8 }}>
                <Button 
                  onClick={() => fetchVariables(selectedModelId)}
                  disabled={loading}
                >
                  获取模型变量
                </Button>
                <Text style={{ marginLeft: 16 }}>
                  {variables.length > 0 ? `已获取 ${variables.length} 个变量` : '暂无变量数据'}
                </Text>
              </div>
            </div>
          )}

          {/* 分析计算测试 */}
          {selectedModelId && (
            <div>
              <Text strong>3. 分析计算测试</Text>
              <div style={{ marginTop: 8 }}>
                <Button 
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={testAnalysis}
                  disabled={loading}
                >
                  执行测试分析
                </Button>
                <Text style={{ marginLeft: 16, color: '#666' }}>
                  将使用模拟参数进行测试计算
                </Text>
              </div>
            </div>
          )}

        </Space>
      </Card>

      {/* 模型信息显示 */}
      {models.length > 0 && (
        <Card title="模型信息" style={{ marginTop: 16 }}>
          {models.map(model => (
            <Descriptions 
              key={model.id} 
              bordered 
              size="small" 
              style={{ marginBottom: 16 }}
              title={model.modelName}
            >
              <Descriptions.Item label="模型ID">{model.id}</Descriptions.Item>
              <Descriptions.Item label="模型编码">{model.modelCode}</Descriptions.Item>
              <Descriptions.Item label="变量数量">{model.variableCount}</Descriptions.Item>
              <Descriptions.Item label="分类">{model.category}</Descriptions.Item>
              <Descriptions.Item label="状态">{model.status}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{model.description}</Descriptions.Item>
            </Descriptions>
          ))}
        </Card>
      )}

      {/* 变量信息显示 */}
      {variables.length > 0 && (
        <Card title="变量信息" style={{ marginTop: 16 }}>
          {variables.slice(0, 5).map(variable => (
            <Descriptions 
              key={variable.id} 
              bordered 
              size="small" 
              style={{ marginBottom: 16 }}
              title={variable.variableName}
            >
              <Descriptions.Item label="变量ID">{variable.id}</Descriptions.Item>
              <Descriptions.Item label="变量编码">{variable.variableCode}</Descriptions.Item>
              <Descriptions.Item label="类型">{variable.variableType}</Descriptions.Item>
              <Descriptions.Item label="数据类型">{variable.dataType}</Descriptions.Item>
              <Descriptions.Item label="默认值">{variable.defaultValue}</Descriptions.Item>
              <Descriptions.Item label="单位">{variable.unit}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{variable.description}</Descriptions.Item>
            </Descriptions>
          ))}
          {variables.length > 5 && (
            <Text>... 还有 {variables.length - 5} 个变量</Text>
          )}
        </Card>
      )}

    </div>
  );
};

export default BreakevenAnalysisV2Simple; 