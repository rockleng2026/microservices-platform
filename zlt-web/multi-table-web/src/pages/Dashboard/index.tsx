import React, { useState, useEffect } from 'react'
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Input,
  Badge,
  Space,
  Card,
  Table,
  Tag,
  message,
  Modal,
  Form,
  Select,
  Tooltip
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  PlusOutlined,
  TableOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import MultiTableEditor from '../../components/MultiTableEditor'
import './index.scss'

const { Header, Sider, Content } = Layout
const { Option } = Select

interface UserInfo {
  id: string
  username: string
  nickname: string
  roles: string[]
}

interface TableInfo {
  id: string
  name: string
  description: string
  fieldCount: number
  rowCount: number
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  // 初始化用户信息和表格数据
  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      // 检查登录状态
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      // 获取用户信息
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo))
      }

      // 获取表格列表
      await loadTables()
    } catch (error) {
      console.error('初始化失败:', error)
      message.error('初始化失败，请重新登录')
      handleLogout()
    } finally {
      setLoading(false)
    }
  }

  const loadTables = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('/api/multi-table/tables', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setTables(response.data.data || [])
      } else {
        // 如果后端还没有数据，使用模拟数据
        setTables(mockTables)
      }
    } catch (error) {
      console.error('加载表格失败:', error)
      // 使用模拟数据
      setTables(mockTables)
    }
  }

  // 模拟表格数据
  const mockTables: TableInfo[] = [
    {
      id: '1',
      name: '员工满意度调查',
      description: '2024年第一季度员工满意度调查表',
      fieldCount: 12,
      rowCount: 156,
      status: 'active',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-06-16 14:25:00'
    },
    {
      id: '2',
      name: '产品需求分析',
      description: '新产品功能需求收集和分析',
      fieldCount: 8,
      rowCount: 89,
      status: 'active',
      createTime: '2024-02-20 09:15:00',
      updateTime: '2024-06-15 16:45:00'
    },
    {
      id: '3',
      name: '项目进度跟踪',
      description: '各项目进度和里程碑跟踪表',
      fieldCount: 15,
      rowCount: 45,
      status: 'inactive',
      createTime: '2024-03-10 11:00:00',
      updateTime: '2024-06-10 13:20:00'
    }
  ]

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: () => {
        localStorage.clear()
        message.success('已退出登录')
        navigate('/login')
      }
    })
  }

  const handleCreateTable = async (values: any) => {
    try {
      setLoading(true)
      
      // 这里应该调用后端API创建表格
      // const response = await axios.post('/api/multi-table/tables', values)
      
      // 模拟创建成功
      const newTable: TableInfo = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        fieldCount: 0,
        rowCount: 0,
        status: 'active',
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString()
      }
      
      setTables(prev => [newTable, ...prev])
      setCreateModalVisible(false)
      form.resetFields()
      message.success('表格创建成功！')
    } catch (error) {
      console.error('创建表格失败:', error)
      message.error('创建表格失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId)
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const sidebarMenuItems = [
    {
      key: 'overview',
      icon: <AppstoreOutlined />,
      label: '概览'
    },
    {
      key: 'tables',
      icon: <TableOutlined />,
      label: '我的表格'
    },
    {
      key: 'templates',
      icon: <FileTextOutlined />,
      label: '模板库'
    },
    {
      key: 'database',
      icon: <DatabaseOutlined />,
      label: '数据源'
    }
  ]

  const tableColumns = [
    {
      title: '表格名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TableInfo) => (
        <div className="table-name-cell">
          <TableOutlined className="table-icon" />
          <div>
            <div className="table-title">{text}</div>
            <div className="table-description">{record.description}</div>
          </div>
        </div>
      )
    },
    {
      title: '字段数',
      dataIndex: 'fieldCount',
      key: 'fieldCount',
      width: 80,
      align: 'center' as const
    },
    {
      title: '记录数',
      dataIndex: 'rowCount',
      key: 'rowCount',
      width: 80,
      align: 'center' as const
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '活跃' : '非活跃'}
        </Tag>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      align: 'center' as const,
             render: (_: any, record: TableInfo) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleTableSelect(record.id)}
          >
            打开
          </Button>
          <Button size="small">
            编辑
          </Button>
        </Space>
      )
    }
  ]

  const currentTable = tables.find(t => t.id === selectedTable)

  return (
    <Layout className="dashboard">
      <Header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <TableOutlined className="logo-icon" />
            <span className="logo-text">多维表格</span>
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-btn"
          />
        </div>

        <div className="header-center">
          <Input
            placeholder="搜索表格、字段、数据..."
            prefix={<SearchOutlined />}
            className="search-input"
            allowClear
          />
        </div>

        <div className="header-right">
          <Space size="large">
            <Tooltip title="通知">
              <Badge count={3} size="small">
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
            </Tooltip>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="username">{userInfo?.nickname || userInfo?.username || '用户'}</span>
              </div>
            </Dropdown>
          </Space>
        </div>
      </Header>

      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="dashboard-sidebar"
          width={240}
        >
          <div className="sidebar-content">
            <div className="create-section">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                onClick={() => setCreateModalVisible(true)}
                className="create-btn"
              >
                {!collapsed && '新建表格'}
              </Button>
            </div>

            <Menu
              mode="inline"
              defaultSelectedKeys={['tables']}
              items={sidebarMenuItems}
              className="sidebar-menu"
            />

            {!collapsed && (
              <div className="table-list">
                <div className="section-title">最近使用</div>
                {tables.slice(0, 5).map(table => (
                  <div
                    key={table.id}
                    className={`table-item ${selectedTable === table.id ? 'active' : ''}`}
                    onClick={() => handleTableSelect(table.id)}
                  >
                    <TableOutlined className="table-icon" />
                    <div className="table-info">
                      <div className="table-name">{table.name}</div>
                      <div className="table-meta">
                        {table.fieldCount}字段 · {table.rowCount}记录
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Sider>

        <Content className="dashboard-content">
          {selectedTable && currentTable ? (
            <div className="table-workspace">
              <div className="workspace-header">
                <div className="table-info">
                  <h2>{currentTable.name}</h2>
                  <p>{currentTable.description}</p>
                </div>
                <div className="workspace-actions">
                  <Space>
                    <Button>分享</Button>
                    <Button>导出</Button>
                    <Button type="primary">保存</Button>
                  </Space>
                </div>
              </div>
              
              <div className="table-editor">
                <MultiTableEditor
                  tableId={selectedTable}
                  tableName={currentTable.name}
                />
              </div>
            </div>
          ) : (
            <div className="overview-content">
              <div className="overview-header">
                <h1>我的表格</h1>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  新建表格
                </Button>
              </div>

              <div className="stats-cards">
                <Card className="stat-card">
                  <div className="stat-number">12</div>
                  <div className="stat-label">总表格数</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">1.2K</div>
                  <div className="stat-label">总记录数</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">156</div>
                  <div className="stat-label">总字段数</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">数据完整性</div>
                </Card>
              </div>

              <Card title="表格列表" className="tables-card">
                <Table
                  columns={tableColumns}
                  dataSource={tables}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 个表格`
                  }}
                />
              </Card>
            </div>
          )}
        </Content>
      </Layout>

      <Modal
        title="新建表格"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTable}
        >
          <Form.Item
            label="表格名称"
            name="name"
            rules={[
              { required: true, message: '请输入表格名称' },
              { max: 50, message: '表格名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入表格名称" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[
              { max: 200, message: '描述不能超过200个字符' }
            ]}
          >
            <Input.TextArea 
              placeholder="请输入表格描述"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="模板"
            name="template"
          >
            <Select placeholder="选择模板（可选）">
              <Option value="blank">空白表格</Option>
              <Option value="survey">调查问卷</Option>
              <Option value="project">项目管理</Option>
              <Option value="inventory">库存管理</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default Dashboard 