import React, { useEffect, useRef } from 'react'
import * as VTable from '@visactor/vtable'
import './index.scss'

const VTableDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      initTable()
    }
  }, [])

  const initTable = () => {
    if (!containerRef.current) return

    // 示例数据 - 参考官方demo
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
        'Quantity': '3',
        'Sales': '3.024',
        'Profit': '-0.605'
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
        'Quantity': '2',
        'Sales': '20.72',
        'Profit': '6.475'
      },
      {
        'Order ID': 'CA-2018-140151',
        'Customer ID': 'KB-16585',
        'Product Name': 'Staple envelope',
        'Category': 'Office Supplies',
        'Sub-Category': 'Fasteners',
        'Region': 'West',
        'City': 'San Francisco',
        'Order Date': '2018-12-30',
        'Quantity': '3',
        'Sales': '15.55',
        'Profit': '5.44'
      },
      {
        'Order ID': 'CA-2018-111682',
        'Customer ID': 'RH-19495',
        'Product Name': 'File folders',
        'Category': 'Office Supplies',
        'Sub-Category': 'Storage',
        'Region': 'West',
        'City': 'Seattle',
        'Order Date': '2018-12-30',
        'Quantity': '2',
        'Sales': '13.42',
        'Profit': '4.33'
      }
    ]

    // 列配置 - 参考官方demo
    const columns = [
      {
        field: 'Order ID',
        title: 'Order ID',
        width: 140
      },
      {
        field: 'Customer ID',
        title: 'Customer ID',
        width: 120
      },
      {
        field: 'Product Name',
        title: 'Product Name',
        width: 180
      },
      {
        field: 'Category',
        title: 'Category',
        width: 140
      },
      {
        field: 'Sub-Category',
        title: 'Sub-Category',
        width: 140
      },
      {
        field: 'Region',
        title: 'Region',
        width: 100
      },
      {
        field: 'City',
        title: 'City',
        width: 120
      },
      {
        field: 'Order Date',
        title: 'Order Date',
        width: 120
      },
      {
        field: 'Quantity',
        title: 'Quantity',
        width: 100
      },
      {
        field: 'Sales',
        title: 'Sales',
        width: 100
      },
      {
        field: 'Profit',
        title: 'Profit',
        width: 100
      }
    ]

    const option = {
      records,
      columns,
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
    const tableInstance = new VTable.ListTable(containerRef.current, option)
    
    // 可选：将实例存储到window对象中，方便调试
    // @ts-ignore
    window.tableInstance = tableInstance
  }

  return (
    <div className="vtable-demo">
      <div className="demo-header">
        <h1>VTable 基础列表演示</h1>
        <p>这是一个基于 @visactor/vtable 的基础列表表格演示</p>
      </div>
      
      <div className="demo-content">
        <div 
          ref={containerRef} 
          id="tableContainer"
          className="vtable-container"
        />
      </div>
    </div>
  )
}

export default VTableDemo 