import React from 'react';
import { message } from 'antd';
import 'antd/dist/antd.css'; // Ant Design 4.x 样式
import './global.less'; // 全局样式

// 配置全局消息提示
message.config({
  top: 60,
  duration: 3,
  maxCount: 3,
});

// 应用初始化配置
export const initialStateConfig = {
  loading: <div>加载中...</div>,
};

// 全局初始状态
export async function getInitialState(): Promise<{
  name: string;
  avatar?: string;
  userid?: string;
}> {
  return {
    name: 'Portal 3.0',
    userid: '',
  };
}

// 应用布局配置
export const layout = {
  title: 'Portal 3.0',
  logo: null,
  menu: {
    type: 'group',
  },
};

// 导出默认配置
export default {
  // 应用配置
}; 