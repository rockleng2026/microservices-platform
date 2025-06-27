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

// 配置全局被动事件监听器，修复wheel事件警告
if (typeof window !== 'undefined') {
  // 添加被动wheel事件监听器支持
  const passiveSupported = (() => {
    let passiveSupported = false;
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        }
      };
      window.addEventListener('test', null as any, options);
      window.removeEventListener('test', null as any);
    } catch (err) {
      passiveSupported = false;
    }
    return passiveSupported;
  })();

  // 重写addEventListener以默认支持passive选项
  if (passiveSupported) {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      const passiveEvents = ['wheel', 'touchstart', 'touchmove', 'touchend'];
      if (passiveEvents.includes(type) && typeof options !== 'object') {
        options = { passive: true };
      } else if (typeof options === 'object' && passiveEvents.includes(type) && options.passive === undefined) {
        options.passive = true;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
}

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