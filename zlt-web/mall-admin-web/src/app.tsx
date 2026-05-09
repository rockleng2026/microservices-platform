import React from 'react';
import { message } from 'antd';
import 'antd/dist/antd.css';
import './global.less';

// dayjs 配置
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import weekday from 'dayjs/plugin/weekday';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.extend(weekday);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('zh-cn');

// 配置全局消息提示
message.config({
  top: 60,
  duration: 3,
  maxCount: 3,
});

export const initialStateConfig = {
  loading: <div>加载中...</div>,
};

export async function getInitialState(): Promise<{
  name: string;
  avatar?: string;
  userid?: string;
}> {
  return {
    name: 'Mall Admin',
    userid: '',
  };
}

export const layout = {
  title: 'Mall Admin',
  logo: null,
  menu: {
    type: 'group',
  },
};

export default {};