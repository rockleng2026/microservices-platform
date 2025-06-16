import React from 'react'
import { Link } from 'react-router-dom'

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><Link to="/">首页</Link></li>
          <li><Link to="/table-management">表格管理</Link></li>
          <li><Link to="/field-config">字段配置</Link></li>
          <li><Link to="/form-editor">表单编辑器</Link></li>
          <li><Link to="/form-viewer">表单查看器</Link></li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar 