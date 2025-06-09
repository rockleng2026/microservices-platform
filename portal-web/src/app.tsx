// 全局初始化数据配置
export async function getInitialState() {
  // 检查登录状态
  const token = localStorage.getItem('access_token');
  
  return {
    currentUser: token ? { name: '演示用户', username: 'admin' } : undefined,
  };
}

// 请求配置
export const request = {
  timeout: 10000,
}; 