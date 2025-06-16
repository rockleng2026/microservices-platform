import React, { useEffect, useState } from 'react'
import { Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import './index.scss'

interface MultiTableEditorProps {
  tableId: string
  tableName: string
  height?: number
}

interface TableData {
  key: string
  [key: string]: any
}

const MultiTableEditor: React.FC<MultiTableEditorProps> = ({
  tableId,
  tableName,
  height = 600
}) => {
  const [loading, setLoading] = useState(true)
  const [tableData, setTableData] = useState<TableData[]>([])
  const [columns, setColumns] = useState<ColumnsType<TableData>>([])

  useEffect(() => {
    initializeTable()
  }, [tableId])

  const initializeTable = async () => {
    try {
      setLoading(true)

      // 模拟从后端获取表格配置和数据
      const { tableColumns, data } = await fetchTableData(tableId)

      setColumns(tableColumns)
      setTableData(data)
    } catch (error) {
      console.error('初始化表格失败:', error)
      message.error('加载表格数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 模拟获取表格数据
  const fetchTableData = async (tableId: string) => {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (tableId === '1') {
      // 员工满意度调查表
      return {
        tableColumns: [
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: true
          },
          {
            title: '填写人',
            dataIndex: 'respondent_name',
            key: 'respondent_name',
            width: 120
          },
          {
            title: '部门',
            dataIndex: 'respondent_dept',
            key: 'respondent_dept',
            width: 100
          },
          {
            title: '职位',
            dataIndex: 'position',
            key: 'position',
            width: 100
          },
          {
            title: '工作年限',
            dataIndex: 'work_years',
            key: 'work_years',
            width: 80
          },
          {
            title: '领导管理满意度',
            dataIndex: 'leadership_satisfaction',
            key: 'leadership_satisfaction',
            width: 120
          },
          {
            title: '同事关系',
            dataIndex: 'colleague_relationship',
            key: 'colleague_relationship',
            width: 100
          },
          {
            title: '工作环境',
            dataIndex: 'work_environment',
            key: 'work_environment',
            width: 100
          },
          {
            title: '薪资满意度',
            dataIndex: 'salary_satisfaction',
            key: 'salary_satisfaction',
            width: 100
          },
          {
            title: '发展机会',
            dataIndex: 'development_opportunity',
            key: 'development_opportunity',
            width: 100
          },
          {
            title: '整体满意度',
            dataIndex: 'overall_satisfaction',
            key: 'overall_satisfaction',
            width: 100
          },
          {
            title: '建议',
            dataIndex: 'suggestions',
            key: 'suggestions',
            width: 200
          },
          {
            title: '提交时间',
            dataIndex: 'submit_time',
            key: 'submit_time',
            width: 150
          }
        ] as ColumnsType<TableData>,
        data: [
          {
            key: '1',
            id: 1,
            respondent_name: '张三',
            respondent_dept: '技术部',
            position: '高级工程师',
            work_years: 5,
            leadership_satisfaction: 4,
            colleague_relationship: '非常融洽',
            work_environment: 4,
            salary_satisfaction: 3,
            development_opportunity: 4,
            overall_satisfaction: 4,
            suggestions: '希望能有更多的技术培训机会',
            submit_time: '2024-06-15 14:30:25'
          },
          {
            key: '2',
            id: 2,
            respondent_name: '李四',
            respondent_dept: '设计部',
            position: 'UI设计师',
            work_years: 3,
            leadership_satisfaction: 5,
            colleague_relationship: '比较和谐',
            work_environment: 5,
            salary_satisfaction: 4,
            development_opportunity: 3,
            overall_satisfaction: 4,
            suggestions: '工作氛围很好，希望薪资能有所提升',
            submit_time: '2024-06-15 15:45:10'
          },
          {
            key: '3',
            id: 3,
            respondent_name: '王五',
            respondent_dept: '财务部',
            position: '财务专员',
            work_years: 2,
            leadership_satisfaction: 3,
            colleague_relationship: '一般',
            work_environment: 3,
            salary_satisfaction: 3,
            development_opportunity: 3,
            overall_satisfaction: 3,
            suggestions: '希望有更清晰的职业发展路径',
            submit_time: '2024-06-16 09:20:15'
          },
          {
            key: '4',
            id: 4,
            respondent_name: '赵六',
            respondent_dept: '市场部',
            position: '市场专员',
            work_years: 1,
            leadership_satisfaction: 4,
            colleague_relationship: '非常融洽',
            work_environment: 4,
            salary_satisfaction: 4,
            development_opportunity: 4,
            overall_satisfaction: 4,
            suggestions: '公司文化很好，希望能参与更多项目',
            submit_time: '2024-06-16 11:15:30'
          },
          {
            key: '5',
            id: 5,
            respondent_name: '钱七',
            respondent_dept: '人事部',
            position: '人事专员',
            work_years: 4,
            leadership_satisfaction: 5,
            colleague_relationship: '比较和谐',
            work_environment: 5,
            salary_satisfaction: 4,
            development_opportunity: 5,
            overall_satisfaction: 5,
            suggestions: '非常满意现在的工作状态',
            submit_time: '2024-06-16 13:40:20'
          }
        ] as TableData[]
      }
    }

    // 默认空表格
    return {
      tableColumns: [
        {
          title: '字段1',
          dataIndex: 'field1',
          key: 'field1',
          width: 120
        },
        {
          title: '字段2',
          dataIndex: 'field2',
          key: 'field2',
          width: 120
        }
      ] as ColumnsType<TableData>,
      data: [] as TableData[]
    }
  }

  return (
    <div className="multi-table-editor">
      <div className="table-header">
        <div className="table-title">
          <h3>{tableName}</h3>
          <div className="table-stats">
            共 {tableData.length} 条记录
          </div>
        </div>
        
        <div className="table-actions">
          <button className="action-btn">
            <span className="icon">+</span>
            添加行
          </button>
          <button className="action-btn">
            <span className="icon">⚙</span>
            配置字段
          </button>
          <button className="action-btn">
            <span className="icon">💾</span>
            保存
          </button>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          scroll={{ x: 'max-content', y: height - 100 }}
          size="small"
          bordered
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
          }}
        />
      </div>
    </div>
  )
}

export default MultiTableEditor 