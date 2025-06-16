import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ListTable } from '@visactor/vtable'
import type { ListTableConstructorOptions } from '@visactor/vtable'
import type { TableSchema, FieldSchema, RowData } from '@/types'
import './MultiTableEditor.scss'

interface MultiTableEditorProps {
  tableSchema: TableSchema
  data: RowData[]
  onDataChange?: (data: RowData[]) => void
  onFieldChange?: (fields: FieldSchema[]) => void
  className?: string
  height?: number
  width?: number
  readonly?: boolean
}

const MultiTableEditor: React.FC<MultiTableEditorProps> = ({
  tableSchema,
  data,
  onDataChange,
  className,
  height = 600,
  width,
  readonly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tableInstanceRef = useRef<ListTable | null>(null)
  const [loading] = useState(false)

  // 转换字段定义为VTable列配置
  const convertFieldsToColumns = useCallback((fields: FieldSchema[]) => {
    return fields.map(field => {
      const column: any = {
        field: field.id,
        title: field.name,
        width: 120,
        headerType: 'text',
        cellType: 'text'
      }

      // 根据字段类型配置列
      switch (field.type) {
        case 'BOOLEAN':
          column.cellType = 'checkbox'
          break
        case 'NUMBER':
          // 保持文本类型便于编辑
          break
        default:
          // 默认文本类型
          break
      }

      return column
    })
  }, [readonly])

  // 转换数据为VTable格式
  const convertDataToRecords = useCallback((rowData: RowData[]) => {
    return rowData.map(row => ({
      id: row.id,
      ...row.data
    }))
  }, [])

  // 初始化编辑器
  useEffect(() => {
    if (!readonly) {
      // 编辑器将在需要时自动创建
      console.log('表格编辑器模式已启用')
    }
  }, [readonly])

  // 初始化表格
  useEffect(() => {
    if (!containerRef.current || !tableSchema) return

    const columns = convertFieldsToColumns(tableSchema.fields)
    const records = convertDataToRecords(data)

    const options: ListTableConstructorOptions = {
      container: containerRef.current,
      columns,
      records,
      theme: {
        headerStyle: {
          bgColor: '#f8f9fa',
          color: '#333',
          fontSize: 14,
          fontWeight: 500
        },
        bodyStyle: {
          bgColor: '#fff',
          color: '#333',
          fontSize: 13
        },
        frameStyle: {
          borderColor: '#e1e4e8',
          borderLineWidth: 1
        }
      },
      menu: {
        contextMenuItems: readonly ? [] : [
          'copy',
          'paste',
          'delete',
          '|',
          'insert_row_above',
          'insert_row_below',
          '|',
          'hide_column',
          'show_all_columns'
        ]
      },
      select: {
        headerSelectMode: 'inline'
      }
    }

    // 销毁旧实例
    if (tableInstanceRef.current) {
      tableInstanceRef.current.release()
    }

    // 创建新实例
    tableInstanceRef.current = new ListTable(options)

    // 监听数据变更事件
    if (!readonly && onDataChange) {
      tableInstanceRef.current.on('change_cell_value', (args: any) => {
        const { col, row, changedValue } = args
        const updatedRecords = [...tableInstanceRef.current!.records]
        updatedRecords[row] = {
          ...updatedRecords[row],
          [tableSchema.fields[col - 1]?.id]: changedValue
        }
        
        const updatedData = updatedRecords.map(record => ({
          id: record.id || `row_${Date.now()}_${Math.random()}`,
          tableId: tableSchema.id,
          data: { ...record },
          createdBy: 'current_user',
          createdAt: new Date().toISOString(),
          updatedBy: 'current_user',
          updatedAt: new Date().toISOString()
        }))
        
        onDataChange(updatedData)
      })
    }

    return () => {
      if (tableInstanceRef.current) {
        tableInstanceRef.current.release()
        tableInstanceRef.current = null
      }
    }
  }, [tableSchema, data, height, width, readonly, convertFieldsToColumns, convertDataToRecords, onDataChange])

  // 添加行
  const addRow = useCallback(() => {
    if (!tableInstanceRef.current || readonly) return
    
    const newRecord: any = { id: `row_${Date.now()}_${Math.random()}` }
    tableSchema.fields.forEach(field => {
      newRecord[field.id] = ''
    })
    
    tableInstanceRef.current.addRecord(newRecord)
  }, [tableSchema.fields, readonly])

  // 删除选中行
  const deleteSelectedRows = useCallback(() => {
    if (!tableInstanceRef.current || readonly) return
    
    const selectedCells = tableInstanceRef.current.getSelectedCellInfos()
    if (selectedCells && selectedCells.length > 0) {
      const rowsToDelete = new Set(selectedCells.map((cell: any) => cell.row))
      Array.from(rowsToDelete).sort((a: any, b: any) => (b as number) - (a as number)).forEach((rowIndex: any) => {
        tableInstanceRef.current!.deleteRecords([rowIndex as number])
      })
    }
  }, [readonly])

  return (
    <div className={`multi-table-editor ${className || ''}`}>
      {!readonly && (
        <div className="table-toolbar">
          <button 
            className="toolbar-btn"
            onClick={addRow}
            disabled={loading}
          >
            添加行
          </button>
          <button 
            className="toolbar-btn"
            onClick={deleteSelectedRows}
            disabled={loading}
          >
            删除选中行
          </button>
        </div>
      )}
      <div 
        ref={containerRef}
        className="table-container"
        style={{ height: `${height}px`, width: width ? `${width}px` : '100%' }}
      />
    </div>
  )
}

export default MultiTableEditor 