import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Layout,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Space,
  message,
  Breadcrumb,
  Tooltip
} from 'antd'
import {
  HomeOutlined,
  TableOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  GroupOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import * as VTable from '@visactor/vtable'
import { getAppSpaceByCode, AppSpace } from '../../services/appspace'
import type { CurrentUserInfo } from '../../services/auth'
import './index.scss'

const { Header, Sider, Content } = Layout

interface TableData {
  id: string
  name: string
  description?: string
  tableId: string
  viewId?: string
}

interface ViewData {
  id: string
  name: string
  type: string
  config: any
  isDefault: boolean
}

const AppSpaceDetail: React.FC = () => {
  const { appSpaceCode } = useParams<{ appSpaceCode: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [appSpace, setAppSpace] = useState<AppSpace | null>(null)
  const [tables, setTables] = useState<TableData[]>([])
  const [views, setViews] = useState<ViewData[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<string | null>(null)
  const [, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null)
  
  const tableContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (appSpaceCode) {
      initializeAppSpace()
    }
  }, [appSpaceCode])

  useEffect(() => {
    // 从URL参数获取table和view
    const tableParam = searchParams.get('table')
    const viewParam = searchParams.get('view')
    
    if (tableParam) {
      setSelectedTable(tableParam)
    }
    if (viewParam) {
      setSelectedView(viewParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedTable && tableContainerRef.current) {
      loadTableData()
    }
  }, [selectedTable, selectedView])

  const initializeAppSpace = async () => {
    try {
      setLoading(true)
      
      // 获取用户信息
      const storedUserInfo = localStorage.getItem('currentUser')
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo))
      }

      // 获取应用空间信息
      const appSpaceResponse = await getAppSpaceByCode(appSpaceCode!)
      if (appSpaceResponse.resp_code === 0) {
        setAppSpace(appSpaceResponse.datas)
        
        // 加载应用空间下的表格列表
        await loadTables()
      } else {
        message.error('应用空间不存在或已删除')
        navigate('/base')
      }
    } catch (error) {
      console.error('加载应用空间失败:', error)
      message.error('加载应用空间失败')
      // 使用模拟数据
      setAppSpace(mockAppSpace)
      setTables(mockTables)
      setViews(mockViews)
    } finally {
      setLoading(false)
    }
  }

  const loadTables = async () => {
    try {
      // 这里应该调用获取应用空间下表格的API
      // 暂时使用模拟数据
      setTables(mockTables)
      setViews(mockViews)
      
      // 如果URL没有指定table，默认选择第一个
      if (!selectedTable && mockTables.length > 0) {
        const firstTable = mockTables[0]
        const firstView = mockViews.length > 0 ? mockViews[0] : null
        setSelectedTable(firstTable.id)
        if (firstView) {
          setSelectedView(firstView.id)
          setSearchParams({ table: firstTable.id, view: firstView.id })
        } else {
          setSearchParams({ table: firstTable.id })
        }
      }
    } catch (error) {
      console.error('加载表格列表失败:', error)
      setTables(mockTables)
      setViews(mockViews)
    }
  }

  const loadTableData = async () => {
    try {
      if (!tableContainerRef.current) return
      
      // 创建VTable实例
      const option = {
        records: mockTableData,
        columns: mockTableColumns,
        widthMode: 'standard' as const,
        heightMode: 'adaptive' as const,
        autoWrapText: true,
        stripe: true,
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

      // 创建VTable实例
      const tableInstance = new VTable.ListTable(tableContainerRef.current, option)
      
      // 可选：将实例存储到window对象中，方便调试
      // @ts-ignore
      window.tableInstance = tableInstance
      
    } catch (error) {
      console.error('加载表格数据失败:', error)
    }
  }

  // 模拟数据
  const mockAppSpace: AppSpace = {
    id: 1,
    uniCode: appSpaceCode || '',
    name: '未命名',
    description: '新建的应用空间',
    icon: '📊',
    color: '#4CAF50',
    tableCount: 1,
    viewCount: 1
  }

  const mockTables: TableData[] = [
    {
      id: 'tbl001',
      name: '未命名',
      description: '默认创建的表格',
      tableId: 'tbl001'
    }
  ]

  const mockViews: ViewData[] = [
    {
      id: 'view001',
      name: '表格视图',
      type: 'grid',
      config: {},
      isDefault: true
    }
  ]

  const mockTableColumns = [
    {
      field: 'col_1',
      title: 'col_1',
      width: 200,
      style: {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 14
      }
    },
    {
      field: 'col_2',
      title: 'col_2',
      width: 150,
      style: {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 14
      }
    },
    {
      field: 'col_3',
      title: 'col_3',
      width: 150,
      style: {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 14
      }
    },
    {
      field: 'col_4',
      title: 'col_4',
      width: 150,
      style: {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: 14
      }
    }
  ]

  const mockTableData = [
    {
      col_1: '示例文本数据',
      col_2: '选项1',
      col_3: '2024-06-17',
      col_4: '文档.pdf'
    },
    {
      col_1: '另一个文本',
      col_2: '选项2',
      col_3: '2024-06-18',
      col_4: '图片.jpg'
    },
    {
      col_1: '第三行文本',
      col_2: '选项1',
      col_3: '2024-06-19',
      col_4: '表格.xlsx'
    },
    {
      col_1: '',
      col_2: '',
      col_3: '',
      col_4: ''
    },
    {
      col_1: '',
      col_2: '',
      col_3: '',
      col_4: ''
    }
  ]

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId)
    setSearchParams({ table: tableId, ...(selectedView && { view: selectedView }) })
  }

  const handleViewSelect = (viewId: string) => {
    setSelectedView(viewId)
    setSearchParams({ ...(selectedTable && { table: selectedTable }), view: viewId })
  }

  const handleLogout = () => {
    localStorage.clear()
    message.success('已退出登录')
    navigate('/login')
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

  const currentTable = tables.find(t => t.id === selectedTable)
  const currentView = views.find(v => v.id === selectedView)

  return (
    <Layout className="app-space-detail">
      <Header className="app-space-header">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('/base')}>
            <div className="logo-icon">MT</div>
            <span className="logo-text">多维表格</span>
          </div>
          
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item>
              <HomeOutlined onClick={() => navigate('/base')} style={{ cursor: 'pointer' }} />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span onClick={() => navigate('/base')} style={{ cursor: 'pointer' }}>
                应用空间
              </span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{appSpace?.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="header-right">
          <Space size="large">
            <Button icon={<ShareAltOutlined />}>分享</Button>
            <Button icon={<DownloadOutlined />}>导出</Button>
            
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
        <Sider width={260} className="app-space-sidebar">
          <div className="workspace-header">
            <div className="workspace-title">
              <span className="workspace-icon" style={{ backgroundColor: appSpace?.color }}>
                {appSpace?.icon || '📊'}
              </span>
              {appSpace?.name}
            </div>
            <div className="workspace-description">{appSpace?.description}</div>
          </div>

          {/* 表格列表 */}
          <div className="tables-section">
            <div className="section-title">表格</div>
            <div className="tables-list">
              {tables.map(table => (
                <div
                  key={table.id}
                  className={`table-item ${selectedTable === table.id ? 'active' : ''}`}
                  onClick={() => handleTableSelect(table.id)}
                >
                  <span className="table-icon">📋</span>
                  <span className="table-name">{table.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 视图列表 */}
          {selectedTable && (
            <div className="views-section">
              <div className="section-title">视图</div>
              <div className="views-list">
                {views.map(view => (
                  <div
                    key={view.id}
                    className={`view-item ${selectedView === view.id ? 'active' : ''}`}
                    onClick={() => handleViewSelect(view.id)}
                  >
                    <TableOutlined />
                    {view.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tools-panel">
            <div className="tool-section">
              <div className="tool-title">筛选与排序</div>
              <button className="tool-btn">
                <FilterOutlined /> 筛选
              </button>
              <button className="tool-btn">
                <SortAscendingOutlined /> 排序
              </button>
              <button className="tool-btn">
                <GroupOutlined /> 分组
              </button>
            </div>

            <div className="tool-section">
              <div className="tool-title">操作</div>
              <button className="tool-btn">
                <PlusOutlined /> 添加记录
              </button>
            </div>
          </div>
        </Sider>

        <Content className="app-space-content">
          <div className="content-header">
            <div className="table-info">
              <h2>{currentTable?.name || '未选择表格'}</h2>
              <span className="view-name">
                {currentView?.name ? `${currentView.name}` : ''}
              </span>
            </div>
            
            <div className="toolbar">
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  size="small"
                >
                  添加记录
                </Button>
                <Button icon={<FilterOutlined />} size="small">筛选</Button>
                <Button icon={<SortAscendingOutlined />} size="small">排序</Button>
                <Button icon={<GroupOutlined />} size="small">分组</Button>
              </Space>
            </div>
          </div>

          <div className="table-container" ref={tableContainerRef} style={{ flex: 1, overflow: 'hidden' }}>
            {/* VTable 将在这里渲染 */}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppSpaceDetail 