// HomePage组件 - 暂时使用简化版本避免依赖问题
const HomePage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>多维表格系统</h1>
      <p>基于VTable的现代化表格解决方案</p>
      
      <div style={{ 
        border: '1px solid #e1e4e8', 
        borderRadius: '8px', 
        padding: '16px',
        marginTop: '20px'
      }}>
        <h3>功能特性</h3>
        <ul>
          <li>高性能虚拟滚动表格</li>
          <li>丰富的字段类型支持</li>
          <li>实时数据编辑</li>
          <li>响应式设计</li>
          <li>自定义编辑器</li>
        </ul>
      </div>

      <div style={{ 
        border: '1px solid #e1e4e8', 
        borderRadius: '8px', 
        padding: '16px',
        marginTop: '20px'
      }}>
        <h3>快速开始</h3>
        <p>1. 安装依赖：npm install</p>
        <p>2. 启动开发：npm run dev</p>
        <p>3. 访问页面：http://localhost:3000</p>
      </div>
    </div>
  )
}

export default HomePage 