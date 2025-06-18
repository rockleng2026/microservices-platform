import React, { useState, useEffect, useRef } from 'react'
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

  message,
  Modal,
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
  AppstoreOutlined,
  FileTextOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAppSpaceList, createAppSpace, createAppSpaceWithDefaults, AppSpace, AppSpaceListResponse } from '../../services/appspace'
import MultiTableEditor from '../../components/MultiTableEditor'
import type { CurrentUserInfo } from '../../services/auth'
import './index.scss'

const { Header, Sider, Content } = Layout
// const { Option } = Select

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null)
  const [appSpaces, setAppSpaces] = useState<AppSpace[]>([])
  const [selectedAppSpace, setSelectedAppSpace] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // const [createModalVisible, setCreateModalVisible] = useState(false)
  const initializingRef = useRef(false)
  // const [form] = Form.useForm()
  const navigate = useNavigate()

  // 初始化用户信息和应用空间数据
  useEffect(() => {
    if (!initializingRef.current) {
      initializingRef.current = true
      initializeData()
    }
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
      const storedUserInfo = localStorage.getItem('currentUser')
      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo) as CurrentUserInfo
        setUserInfo(parsedUserInfo)
        console.log('已加载用户信息:', parsedUserInfo)
      }

      // 获取应用空间列表
      await loadAppSpaces()
    } catch (error) {
      console.error('初始化失败:', error)
      message.error('初始化失败，请重新登录')
      handleLogout()
    } finally {
      setLoading(false)
    }
  }

  const loadAppSpaces = async () => {
    try {
      console.log('开始加载应用空间列表...')
      const response: AppSpaceListResponse = await getAppSpaceList()

      console.log('应用空间列表响应:', response)

      if (response.resp_code === 0) {
        setAppSpaces(response.datas || [])
        message.success('应用空间列表加载成功')
      } else {
        console.warn('应用空间列表响应异常:', response.resp_code)
        // 如果后端还没有数据，使用模拟数据
        setAppSpaces(mockAppSpaces)
        message.info('使用模拟数据')
      }
    } catch (error) {
      console.error('加载应用空间失败:', error)
      // 使用模拟数据
      setAppSpaces(mockAppSpaces)
      message.warning('应用空间服务连接失败，使用模拟数据')
    }
  }

  // 模拟应用空间数据
  const mockAppSpaces: AppSpace[] = [
    {
      id: 1,
      uniCode: 'Q4Aub0W40axbTusDZ34cBIEEnAf',
      name: '员工满意度调查应用',
      description: '2024年第一季度员工满意度调查应用空间',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-06-16 14:25:00',
      createdBy: 1,
      tableCount: 3,
      viewCount: 8,
      icon: '📊',
      color: '#4CAF50'
    },
    {
      id: 2, 
      uniCode: 'B5Bvb1X41bycVvtEA45dCJFEoGg',
      name: '产品需求分析应用',
      description: '新产品功能需求收集和分析应用空间',
      createTime: '2024-02-20 09:15:00',
      updateTime: '2024-06-15 16:45:00',
      createdBy: 1,
      tableCount: 2,
      viewCount: 5,
      icon: '📋',
      color: '#2196F3'
    },
    {
      id: 3,
      uniCode: 'C6Cwc2Y52czdWwuFA56eDKGFpHh',
      name: '项目进度跟踪应用', 
      description: '各项目进度和里程碑跟踪应用空间',
      createTime: '2024-03-10 11:00:00',
      updateTime: '2024-06-10 13:20:00',
      createdBy: 1,
      tableCount: 4,
      viewCount: 12,
      icon: '📈',
      color: '#FF9800'
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

  const handleCreateAppSpace = async () => {
    try {
      setLoading(true)
      
      // 获取用户信息
      if (!userInfo) {
        message.error('用户信息不存在，请重新登录')
        return
      }
      
      console.log('开始创建应用空间（包含默认表格）...')
      const response = await createAppSpaceWithDefaults(
        userInfo.tenantId || 'default',
        userInfo.currentPosition?.departmentId || 101,
        userInfo.id
      )
      
      console.log('创建应用空间响应:', response)
      
      if (response.resp_code === 0) {
        // 重新加载应用空间列表
        await loadAppSpaces()
        message.success('应用空间创建成功！')
        
        // 自动跳转到新创建的应用空间
        if (response.datas?.uniCode) {
          navigate(`/base/${response.datas.uniCode}`)
        }
      } else {
        message.error(response.resp_msg || '创建应用空间失败')
      }
    } catch (error) {
      console.error('创建应用空间失败:', error)
      message.error('创建应用空间失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAppSpaceSelect = (appSpaceCode: string) => {
    setSelectedAppSpace(appSpaceCode)
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
      key: 'appspaces',
      icon: <AppstoreOutlined />,
      label: '我的应用空间'
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

  const appSpaceColumns = [
    {
      title: '应用空间名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AppSpace) => (
        <div className="table-name-cell" onClick={() => navigate(`/base/${record.uniCode}`)} style={{ cursor: 'pointer' }}>
          <span className="app-space-icon" style={{ backgroundColor: record.color }}>
            {record.icon || '📁'}
          </span>
          <div>
            <div className="table-title">{text}</div>
            <div className="table-description">{record.description}</div>
          </div>
        </div>
      )
    },
    {
      title: '表格数',
      dataIndex: 'tableCount',
      key: 'tableCount',
      width: 80,
      align: 'center' as const
    },
    {
      title: '视图数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      align: 'center' as const
    },
    {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
      align: 'center' as const
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
      render: (_: any, record: AppSpace) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/base/${record.uniCode}`)}
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

  const currentAppSpace = appSpaces.find(app => app.uniCode === selectedAppSpace)

  return (
    <Layout className="dashboard">
      <Header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <AppstoreOutlined className="logo-icon" />
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
            placeholder="搜索应用空间..."
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
                <Avatar 
                  size="small" 
                  src={userInfo?.employee?.avatar || userInfo?.headImgUrl}
                  icon={<UserOutlined />} 
                />
                <span className="username">
                  {userInfo?.employee?.name || userInfo?.nickname || userInfo?.username || '用户'}
                </span>
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
                onClick={handleCreateAppSpace}
                className="create-btn"
                loading={loading}
              >
                {!collapsed && '新建应用空间'}
              </Button>
            </div>

            <Menu
              mode="inline"
              defaultSelectedKeys={['appspaces']}
              items={sidebarMenuItems}
              className="sidebar-menu"
            />

            {!collapsed && (
              <div className="table-list">
                <div className="section-title">最近使用</div>
                {appSpaces.slice(0, 5).map(appSpace => (
                  <div
                    key={appSpace.id}
                    className={`table-item ${selectedAppSpace === appSpace.uniCode ? 'active' : ''}`}
                    onClick={() => handleAppSpaceSelect(appSpace.uniCode!)}
                  >
                    <span className="app-space-icon" style={{ backgroundColor: appSpace.color }}>
                      {appSpace.icon || '📁'}
                    </span>
                    <div className="table-info">
                      <div className="table-name">{appSpace.name}</div>
                      <div className="table-meta">
                        {appSpace.tableCount}表格 · {appSpace.viewCount}视图
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Sider>

        <Content className="dashboard-content">
          {selectedAppSpace && currentAppSpace ? (
            <div className="table-workspace">
              <div className="workspace-header">
                <div className="table-info">
                  <h2>{currentAppSpace.name}</h2>
                  <p>{currentAppSpace.description}</p>
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
                  tableId={selectedAppSpace}
                  tableName={currentAppSpace.name}
                />
              </div>
            </div>
          ) : (
            <div className="overview-content">
              <div className="overview-header">
                <h1>我的应用空间</h1>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateAppSpace}
                  loading={loading}
                >
                  新建应用空间
                </Button>
              </div>

              <div className="stats-cards">
                <Card className="stat-card">
                  <div className="stat-number">{appSpaces.length}</div>
                  <div className="stat-label">应用空间数</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">{appSpaces.reduce((sum, app) => sum + (app.tableCount || 0), 0)}</div>
                  <div className="stat-label">总表格数</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">{appSpaces.reduce((sum, app) => sum + (app.viewCount || 0), 0)}</div>
                  <div className="stat-label">总视图数</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">数据完整性</div>
                </Card>
              </div>

              <Card title="应用空间列表" className="tables-card">
                <Table
                  columns={appSpaceColumns}
                  dataSource={appSpaces}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 个应用空间`
                  }}
                />
              </Card>
            </div>
          )}
        </Content>
      </Layout>

      {/* Modal已移除，现在直接创建应用空间 */}
    </Layout>
  )
}

export default Dashboard 