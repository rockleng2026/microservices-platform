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
import { ListTable } from '@visactor/vtable'
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
  const [, setTables] = useState<TableData[]>([])
  const [views, setViews] = useState<ViewData[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<string | null>(null)
  const [, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [tableColumns, setTableColumns] = useState<any[]>([])
  
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const vtableRef = useRef<ListTable | null>(null)

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
    if (selectedTable) {
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
        setSelectedTable(firstTable.id)
        setSearchParams({ table: firstTable.id })
      }
    } catch (error) {
      console.error('加载表格列表失败:', error)
      setTables(mockTables)
      setViews(mockViews)
    }
  }

  const loadTableData = async () => {
    try {
      // 这里应该调用获取表格数据的API
      // 暂时使用模拟数据
      setTableColumns(mockTableColumns)
      setTableData(mockTableData)
      
      // 初始化VTable
      setTimeout(() => {
        initVTable()
      }, 100)
    } catch (error) {
      console.error('加载表格数据失败:', error)
    }
  }

  const initVTable = () => {
    if (!tableContainerRef.current) return

    // 销毁之前的实例
    if (vtableRef.current) {
      vtableRef.current.release()
    }

    const option = {
      records: tableData,
      columns: tableColumns,
      widthMode: 'standard' as const,
      heightMode: 'autoHeight' as const,
      autoWrapText: true,
      hover: {
        highlightMode: 'row' as const
      },
      select: {
        highlightMode: 'row' as const
      },
      theme: {
        underlayBackgroundColor: '#fff',
        scrollStyle: {
          visible: 'always' as const,
          scrollSliderColor: 'rgba(0,0,0,0.2)',
          scrollRailColor: 'rgba(0,0,0,0.1)'
        }
      }
    }

    vtableRef.current = new ListTable(tableContainerRef.current, option)
  }

  // 模拟数据
  const mockAppSpace: AppSpace = {
    id: 1,
    uniCode: appSpaceCode || '',
    name: '员工满意度调查应用',
    description: '2024年第一季度员工满意度调查应用空间',
    icon: '📊',
    color: '#4CAF50',
    tableCount: 1,
    viewCount: 3
  }

  const mockTables: TableData[] = [
    {
      id: 'tbl001',
      name: '员工满意度调查问卷',
      description: '公司年度员工满意度调查问卷',
      tableId: 'tbl001'
    }
  ]

  const mockViews: ViewData[] = [
    {
      id: 'view001',
      name: '问卷结果汇总',
      type: 'grid',
      config: {},
      isDefault: true
    },
    {
      id: 'view002',
      name: '满意度统计看板',
      type: 'kanban',
      config: {},
      isDefault: false
    },
    {
      id: 'view003',
      name: '问卷填写表单',
      type: 'form',
      config: {},
      isDefault: false
    }
  ]

  const mockTableColumns = [
    {
      field: 'respondent_name',
      title: '填写人',
      width: 120,
      cellType: 'text'
    },
    {
      field: 'respondent_dept',
      title: '填写人部门',
      width: 150,
      cellType: 'text'
    },
    {
      field: 'submit_time',
      title: '提交时间',
      width: 160,
      cellType: 'text'
    },
    {
      field: 'leadership_satisfaction',
      title: '公司的领导和管理满意度如何',
      width: 200,
      cellType: 'text'
    },
    {
      field: 'colleague_relationship',
      title: '您觉得同事之间的关系',
      width: 180,
      cellType: 'text'
    },
    {
      field: 'superior_communication',
      title: '您觉得与上级领导的沟通',
      width: 180,
      cellType: 'text'
    },
    {
      field: 'work_pressure',
      title: '您认为自己的工作压力',
      width: 160,
      cellType: 'text'
    },
    {
      field: 'overall_rating',
      title: '综合评分',
      width: 100,
      cellType: 'text'
    }
  ]

  const mockTableData = [
    {
      respondent_name: '张三',
      respondent_dept: '技术部',
      submit_time: '2024-06-16 17:11:15',
      leadership_satisfaction: '4星',
      colleague_relationship: '比较和谐',
      superior_communication: '非常顺畅',
      work_pressure: '压力适中，能够承受',
      overall_rating: '8.0'
    },
    {
      respondent_name: '李四',
      respondent_dept: '设计部',
      submit_time: '2024-06-16 17:11:15',
      leadership_satisfaction: '5星',
      colleague_relationship: '非常融洽',
      superior_communication: '比较顺畅',
      work_pressure: '压力很小，工作轻松',
      overall_rating: '9.0'
    },
    {
      respondent_name: '王五',
      respondent_dept: '技术部',
      submit_time: '2024-06-16 17:11:15',
      leadership_satisfaction: '3星',
      colleague_relationship: '一般',
      superior_communication: '有时存在障碍',
      work_pressure: '压力较大，有些吃力',
      overall_rating: '6.0'
    },
    {
      respondent_name: '赵六',
      respondent_dept: '财务部',
      submit_time: '2024-06-16 17:11:15',
      leadership_satisfaction: '4星',
      colleague_relationship: '比较和谐',
      superior_communication: '比较顺畅',
      work_pressure: '压力适中，能够承受',
      overall_rating: '7.5'
    },
    {
      respondent_name: '钱七',
      respondent_dept: '运营部',
      submit_time: '2024-06-16 17:11:15',
      leadership_satisfaction: '5星',
      colleague_relationship: '非常融洽',
      superior_communication: '非常顺畅',
      work_pressure: '压力很小，工作轻松',
      overall_rating: '8.5'
    }
  ]

  // const handleTableSelect = (tableId: string) => {
  //   setSelectedTable(tableId)
  //   setSearchParams({ table: tableId, ...(selectedView && { view: selectedView }) })
  // }

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

  // const currentTable = tables.find(t => t.id === selectedTable)
  // const currentView = views.find(v => v.id === selectedView)

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
          <div className="table-header">
            <div className="table-title">
              <span className="table-icon" style={{ backgroundColor: appSpace?.color }}>
                {appSpace?.icon || '📊'}
              </span>
              {appSpace?.name}
            </div>
            <div className="table-description">{appSpace?.description}</div>
          </div>

          <div className="view-tabs">
            {views.map(view => (
              <div
                key={view.id}
                className={`view-tab ${selectedView === view.id ? 'active' : ''}`}
                onClick={() => handleViewSelect(view.id)}
              >
                <TableOutlined />
                {view.name}
              </div>
            ))}
          </div>

          <div className="tools-panel">
            <div className="tool-section">
              <div className="tool-title">视图</div>
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

          <div className="table-container" ref={tableContainerRef} style={{ flex: 1, overflow: 'hidden' }}>
            {/* VTable 将在这里渲染 */}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppSpaceDetail 