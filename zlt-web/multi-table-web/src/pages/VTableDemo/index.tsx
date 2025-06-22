import React, { useState } from 'react'
import { Button, Layout, Menu } from 'antd'
import { 
  TableOutlined, 
  CodeOutlined,
  EditOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import VTableExamplePage from './VTableExample'
import ReactExamplePage from './ReactExample'
import TableEditExample from './TableEditExample'
import './index.scss'

const { Sider, Content, Header } = Layout

interface DemoItem {
  key: string
  label: string
  icon: React.ReactNode
  component: React.ReactNode
}

const VTableDemo: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDemo, setSelectedDemo] = useState('vtable-demo')

  // 示例菜单配置
  const demoItems: DemoItem[] = [
    {
      key: 'vtable-demo',
      label: 'VTable示例',
      icon: <TableOutlined />,
      component: <VTableExamplePage />
    },
    {
      key: 'react-demo',
      label: 'React示例',
      icon: <CodeOutlined />,
      component: <ReactExamplePage />
    },
    {
      key: 'table-edit',
      label: '单元格编辑示例',
      icon: <EditOutlined />,
      component: <TableEditExample />
    }
  ]

  const menuItems = demoItems.map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.label
  }))

  const getCurrentDemo = () => {
    const demo = demoItems.find(item => item.key === selectedDemo)
    return demo?.component || <VTableExamplePage />
  }

  return (
    <Layout className="vtable-demo">
      <Header className="demo-header">
        <div className="header-left">
          <Button 
            type="text" 
            icon={<HomeOutlined />} 
            onClick={() => navigate('/base')}
            className="back-btn"
          >
            返回首页
          </Button>
          <div className="header-title">
            <h1>VTable 功能演示</h1>
            <p>基于 @visactor/vtable 的功能展示和示例</p>
          </div>
        </div>
      </Header>
      
      <Layout>
        <Sider width={260} className="demo-sidebar">
          <div className="sidebar-header">
            <h3>示例列表</h3>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedDemo]}
            items={menuItems}
            onSelect={({ key }) => setSelectedDemo(key)}
            className="demo-menu"
          />
        </Sider>
        
        <Content className="demo-main-content">
          {getCurrentDemo()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default VTableDemo 