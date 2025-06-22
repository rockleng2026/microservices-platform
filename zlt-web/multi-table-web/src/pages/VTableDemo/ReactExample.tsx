import React from 'react'
import { Card } from 'antd'
import { ListTable } from '@visactor/react-vtable'

const ReactExamplePage: React.FC = () => {
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
        <div style={{ marginBottom: 16 }}>
          <h3>简单的React VTable示例</h3>
          <p>这是一个使用React VTable组件的简单示例，展示了1000行数据的渲染性能。</p>
          <p>数据包含：姓名、年龄、性别、爱好等字段，通过数组形式传递数据。</p>
        </div>
        <div className="react-vtable-container">
          <ListTable option={reactVTableOption} height={'500px'} />
        </div>
      </Card>
    </div>
  )
}

export default ReactExamplePage 