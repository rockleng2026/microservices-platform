import React, { useEffect, useRef, useState } from 'react'
import { Button, Space, Switch, Select, message, Layout, Menu, Card } from 'antd'
import { 
  TableOutlined, 
  CodeOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ListTable } from '@visactor/react-vtable'
import * as VTable from '@visactor/vtable'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [tableInstance, setTableInstance] = useState<VTable.ListTable | null>(null)
  const [selectedDemo, setSelectedDemo] = useState('vtable-demo')
  const [canResizeColumn, setCanResizeColumn] = useState(true)
  const [canResizeRow, setCanResizeRow] = useState(false)
  const [canDragHeader, setCanDragHeader] = useState(true)
  const [frozenCols, setFrozenCols] = useState(0)
  const [frozenRows, setFrozenRows] = useState(0)

  // VTable 示例组件
  const VTableDemoComponent: React.FC = () => {
    useEffect(() => {
      if (containerRef.current) {
        initBasicTable()
      }
    }, [canResizeColumn, canResizeRow, canDragHeader, frozenCols, frozenRows])

    const initBasicTable = () => {
      if (!containerRef.current) return

      // 销毁旧实例
      if (tableInstance) {
        tableInstance.release()
      }

      // 示例数据
      const records = [
        {
          'Order ID': 'CA-2018-156720',
          'Customer ID': 'JM-15580',
          'Product Name': 'Bagged Rubber Bands',
          'Category': 'Office Supplies',
          'Sub-Category': 'Fasteners',
          'Region': 'West',
          'City': 'Loveland',
          'Order Date': '2018-12-30',
          'Quantity': 3,
          'Sales': 3.024,
          'Profit': -0.605
        },
        {
          'Order ID': 'CA-2018-115427',
          'Customer ID': 'EB-13975',
          'Product Name': 'GBC Binding covers',
          'Category': 'Office Supplies',
          'Sub-Category': 'Binders',
          'Region': 'West',
          'City': 'Fairfield',
          'Order Date': '2018-12-30',
          'Quantity': 2,
          'Sales': 20.72,
          'Profit': 6.475
        },
        // 添加更多数据...
        ...Array.from({ length: 20 }, (_, i) => ({
          'Order ID': `US-2018-${108966 + i}`,
          'Customer ID': `SO-${20335 + i}`,
          'Product Name': `Product ${i + 1}`,
          'Category': ['Office Supplies', 'Furniture', 'Technology'][i % 3],
          'Sub-Category': ['Art', 'Storage', 'Accessories'][i % 3],
          'Region': ['Central', 'East', 'West', 'South'][i % 4],
          'City': ['Fort Lauderdale', 'New York', 'Seattle', 'Miami'][i % 4],
          'Order Date': `2018-12-${String(i % 30 + 1).padStart(2, '0')}`,
          'Quantity': Math.floor(Math.random() * 10) + 1,
          'Sales': Math.round((Math.random() * 100 + 10) * 100) / 100,
          'Profit': Math.round((Math.random() * 20 - 5) * 100) / 100
        }))
      ]

      const columns = [
        { field: 'Order ID', title: 'Order ID', width: 140, sort: true },
        { field: 'Customer ID', title: 'Customer ID', width: 120, sort: true },
        { field: 'Product Name', title: 'Product Name', width: 180, sort: true },
        { field: 'Category', title: 'Category', width: 140, sort: true },
        { field: 'Sub-Category', title: 'Sub-Category', width: 140, sort: true },
        { field: 'Region', title: 'Region', width: 100, sort: true },
        { field: 'City', title: 'City', width: 120, sort: true },
        { field: 'Order Date', title: 'Order Date', width: 120, sort: true },
        { field: 'Quantity', title: 'Quantity', width: 100, sort: true },
        { field: 'Sales', title: 'Sales', width: 100, sort: true },
        { field: 'Profit', title: 'Profit', width: 100, sort: true }
      ]

      const option = {
        records,
        columns,
        widthMode: 'standard' as const,
        heightMode: 'adaptive' as const,
        autoWrapText: true,
        stripe: true,
        defaultRowHeight: 32,
        frozenColCount: frozenCols,
        frozenRowCount: frozenRows,
        allowFrozenColCount: 5,
        columnResizeMode: canResizeColumn ? 'all' as const : 'none' as const,
        rowResizeMode: canResizeRow ? 'all' as const : 'none' as const,
        dragHeaderMode: canDragHeader ? 'all' as const : 'none' as const,
        hover: {
          highlightMode: 'cell' as const,
          disableRowHover: false,
          disableColumnHover: false
        },
        select: {
          headerSelectMode: 'inline' as const,
          highlightMode: 'row' as const
        },
        theme: {
          underlayBackgroundColor: '#f8f9fa',
          defaultStyle: {
            borderLineWidth: 1,
            borderColor: '#e8eaed',
            fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'
          },
          headerStyle: {
            bgColor: '#f8f9fa',
            color: '#202124',
            fontSize: 14,
            fontWeight: 500,
            borderColor: '#e8eaed',
            borderLineWidth: 1
          },
          bodyStyle: {
            bgColor: '#ffffff',
            color: '#202124',
            fontSize: 14,
            borderColor: '#e8eaed',
            borderLineWidth: 1
          },
          frameStyle: {
            borderLineWidth: 1,
            borderColor: '#e8eaed',
            shadowBlur: 0,
            shadowColor: 'rgba(0,0,0,0)'
          },
          selectionStyle: {
            cellBgColor: 'rgba(66, 133, 244, 0.1)',
            cellBorderColor: '#4285f4',
            cellBorderLineWidth: 2
          },
          scrollStyle: {
            visible: 'always' as const,
            scrollSliderColor: 'rgba(0,0,0,0.2)',
            scrollRailColor: 'rgba(0,0,0,0.05)',
            scrollSliderCornerRadius: 4,
            width: 8
          }
        }
      }

      const instance = new VTable.ListTable(containerRef.current, option)
      setTableInstance(instance)
    }

    const handleSort = (field: string, order: 'asc' | 'desc') => {
      if (!tableInstance) return
      try {
        tableInstance.updateSortState([{ field, order }])
        message.success(`已按 ${field} 进行${order === 'asc' ? '升序' : '降序'}排序`)
      } catch (error) {
        console.error('排序失败:', error)
      }
    }

    const clearSort = () => {
      if (!tableInstance) return
      try {
        tableInstance.updateSortState([])
        message.success('已清除排序')
      } catch (error) {
        console.error('清除排序失败:', error)
      }
    }

    return (
      <div className="demo-content">
        <div className="demo-header">
          <h2>VTable示例</h2>
          <p>展示VTable的基础功能，包括排序、冻结、调整等</p>
        </div>
        
        <div className="demo-controls">
          <div className="control-section">
            <h3>排序功能</h3>
            <Space wrap>
              <Button onClick={() => handleSort('Sales', 'asc')}>销售额升序</Button>
              <Button onClick={() => handleSort('Sales', 'desc')}>销售额降序</Button>
              <Button onClick={() => handleSort('Profit', 'asc')}>利润升序</Button>
              <Button onClick={() => handleSort('Profit', 'desc')}>利润降序</Button>
              <Button onClick={clearSort}>清除排序</Button>
            </Space>
          </div>

          <div className="control-section">
            <h3>冻结设置</h3>
            <Space wrap>
              <span>冻结列数：</span>
              <Select
                value={frozenCols}
                onChange={setFrozenCols}
                style={{ width: 100 }}
                options={[
                  { label: '0', value: 0 },
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 }
                ]}
              />
              <span>冻结行数：</span>
              <Select
                value={frozenRows}
                onChange={setFrozenRows}
                style={{ width: 100 }}
                options={[
                  { label: '0', value: 0 },
                  { label: '1', value: 1 },
                  { label: '2', value: 2 }
                ]}
              />
            </Space>
          </div>

          <div className="control-section">
            <h3>交互功能</h3>
            <Space wrap>
              <span>列宽调整：</span>
              <Switch checked={canResizeColumn} onChange={setCanResizeColumn} />
              <span>行高调整：</span>
              <Switch checked={canResizeRow} onChange={setCanResizeRow} />
              <span>拖拽表头：</span>
              <Switch checked={canDragHeader} onChange={setCanDragHeader} />
            </Space>
          </div>
        </div>
        
        <div className="vtable-container" ref={containerRef} />
      </div>
    )
  }

  // React VTable 示例组件
  const ReactVTableDemo: React.FC = () => {
    const reactVTableOption = {
      columns: [
        {
          field: '0',
          title: 'name'
        },
        {
          field: '1',
          title: 'age'
        },
        {
          field: '2',
          title: 'gender'
        },
        {
          field: '3',
          title: 'hobby'
        }
      ],
      records: new Array(1000).fill(['John', 18, 'male', '🏀'])
    }

    return (
      <div className="demo-content">
        <div className="demo-header">
          <h2>React示例</h2>
          <p>使用 @visactor/react-vtable 组件的React集成示例</p>
        </div>
        <Card>
          <p>这是一个使用React VTable组件的简单示例，展示了1000行数据的渲染性能。</p>
          <div className="react-vtable-container">
            <ListTable option={reactVTableOption} height={'500px'} />
          </div>
        </Card>
      </div>
    )
  }

  // 示例菜单配置
  const demoItems: DemoItem[] = [
    {
      key: 'vtable-demo',
      label: 'VTable示例',
      icon: <TableOutlined />,
      component: <VTableDemoComponent />
    },
    {
      key: 'react-demo',
      label: 'React示例',
      icon: <CodeOutlined />,
      component: <ReactVTableDemo />
    }
  ]

  const menuItems = demoItems.map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.label
  }))

  const getCurrentDemo = () => {
    const demo = demoItems.find(item => item.key === selectedDemo)
    return demo?.component || <VTableDemoComponent />
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