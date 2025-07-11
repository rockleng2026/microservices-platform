import React, { useState } from 'react';
import { Card, Button, Space, message, Typography, Divider } from 'antd';
import { FinancialModelAPI } from '@/services/financialModel';

const { Title, Text, Paragraph } = Typography;

const ApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const addTestResult = (test: string, success: boolean, data?: any, error?: any) => {
    const result = {
      test,
      success,
      data,
      error,
      time: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const testGetModels = async () => {
    try {
      setLoading(true);
      const result = await FinancialModelAPI.getModels({
        current: 1,
        pageSize: 10
      });
      addTestResult('获取模型列表', true, result);
      message.success('获取模型列表成功');
    } catch (error) {
      addTestResult('获取模型列表', false, null, error);
      message.error('获取模型列表失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testCreateModel = async () => {
    try {
      setLoading(true);
      const testModel = {
        modelName: '测试模型_' + Date.now(),
        modelCode: 'TEST_' + Date.now(),
        modelCategory: 'breakeven_analysis',
        modelDescription: '这是一个API测试模型',
        isActive: true
      };
      
      const result = await FinancialModelAPI.createModel(testModel);
      addTestResult('创建模型', true, result);
      message.success('创建模型成功');
    } catch (error) {
      addTestResult('创建模型', false, null, error);
      message.error('创建模型失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>财务模型 API 连接测试</Title>
        <Paragraph>
          这个页面用于测试财务模型管理API的连接状态。点击下面的按钮来测试不同的API接口。
        </Paragraph>
        
        <Space wrap>
          <Button 
            type="primary" 
            loading={loading} 
            onClick={testGetModels}
          >
            测试获取模型列表
          </Button>
          <Button 
            loading={loading} 
            onClick={testCreateModel}
          >
            测试创建模型
          </Button>
          <Button 
            danger 
            onClick={clearResults}
          >
            清空结果
          </Button>
        </Space>

        <Divider />

        <Title level={4}>测试结果</Title>
        {testResults.length === 0 ? (
          <Text type="secondary">暂无测试结果</Text>
        ) : (
          <div>
            {testResults.map((result, index) => (
              <Card 
                key={index} 
                size="small" 
                style={{ marginBottom: '8px' }}
                title={
                  <Space>
                    <Text strong>{result.test}</Text>
                    <Text type={result.success ? 'success' : 'danger'}>
                      {result.success ? '✅ 成功' : '❌ 失败'}
                    </Text>
                    <Text type="secondary">{result.time}</Text>
                  </Space>
                }
              >
                {result.success ? (
                  <div>
                    <Text strong>返回数据:</Text>
                    <pre style={{ 
                      background: '#f6f8fa', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <Text strong type="danger">错误信息:</Text>
                    <pre style={{ 
                      background: '#fff2f0', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#ff4d4f'
                    }}>
                      {result.error?.message || JSON.stringify(result.error, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApiTest; 