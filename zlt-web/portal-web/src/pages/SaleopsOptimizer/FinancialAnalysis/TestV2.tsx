import React from 'react';
import { Alert, Button, message } from 'antd';
import { BreakevenAnalysisV2API } from '@/services/breakevenAnalysisV2';

const TestV2: React.FC = () => {
  const testAPI = async () => {
    try {
      const response = await BreakevenAnalysisV2API.getAvailableModels();
      console.log('API测试结果:', response);
      message.success('API测试成功，请查看控制台');
    } catch (error) {
      console.error('API测试失败:', error);
      message.error('API测试失败');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Alert
        message="盈亏平衡分析V2 API测试页面"
        description="此页面用于测试V2版本的API连接"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Button type="primary" onClick={testAPI}>
        测试获取模型列表API
      </Button>
    </div>
  );
};

export default TestV2; 