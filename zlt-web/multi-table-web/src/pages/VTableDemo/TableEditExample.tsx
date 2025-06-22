import React, { useEffect, useRef, useState } from 'react'
import { Card, message } from 'antd'
import * as VTable from '@visactor/vtable'

// 注意：需要安装 @visactor/vtable-editors 包
// 这里模拟编辑器，实际使用时需要导入真实的编辑器
import * as VTable_editors from '@visactor/vtable-editors'

const TableEditExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tableInstance, setTableInstance] = useState<VTable.ListTable | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      initEditableTable()
    }
    return () => {
      if (tableInstance) {
        tableInstance.release()
      }
    }
  }, [])

  // 生成随机字符串
  const generateRandomString = (length: number) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  // 生成随机爱好
  const generateRandomHobbies = () => {
    const hobbies = [
      'Reading books',
      'Playing video games',
      'Watching movies',
      'Cooking',
      'Hiking',
      'Traveling',
      'Photography',
      'Playing musical instruments',
      'Gardening',
      'Painting',
      'Writing',
      'Swimming'
    ]

    const numHobbies = Math.floor(Math.random() * 3) + 1
    const selectedHobbies = []

    for (let i = 0; i < numHobbies; i++) {
      const randomIndex = Math.floor(Math.random() * hobbies.length)
      const hobby = hobbies[randomIndex]
      selectedHobbies.push(hobby)
      hobbies.splice(randomIndex, 1)
    }

    return selectedHobbies.join(', ')
  }

  // 生成随机生日
  const generateRandomBirthday = () => {
    const start = new Date('1970-01-01')
    const end = new Date('2000-12-31')
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    const year = randomDate.getFullYear()
    const month = randomDate.getMonth() + 1
    const day = randomDate.getDate()
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
  }

  // 生成随机电话号码
  const generateRandomPhoneNumber = () => {
    const areaCode = [
      '130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
      '150', '151', '152', '153', '155', '156', '157', '158', '159',
      '170', '176', '177', '178',
      '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'
    ]
    const prefix = areaCode[Math.floor(Math.random() * areaCode.length)]
    const suffix = String(Math.random()).substr(2, 8)
    return prefix + suffix
  }

  // 生成人员数据
  const generatePersons = (count: number) => {
    return Array.from(new Array(count)).map((_, i) => {
      const first = generateRandomString(10)
      const last = generateRandomString(4)
      return {
        id: i + 1,
        email1: `${first}_${last}@xxx.com`,
        name: first,
        lastName: last,
        hobbies: generateRandomHobbies(),
        birthday: generateRandomBirthday(),
        tel: generateRandomPhoneNumber(),
        address: `No.${i + 100} ${generateRandomString(10)} ${generateRandomString(5)}\n${generateRandomString(5)}`,
        sex: i % 2 === 0 ? 'boy' : 'girl',
        work: i % 2 === 0 ? 'back-end engineer' : 'front-end engineer',
        city: 'beijing'
      }
    })
  }

  const initEditableTable = () => {
    if (!containerRef.current) return

    // 销毁旧实例
    if (tableInstance) {
      tableInstance.release()
    }

    try {
      // 尝试注册内置编辑器
      try {
        // 使用VTable内置的编辑器
        const InputEditor = (VTable as any).editors?.InputEditor || 
                           (VTable as any).InputEditor ||
                           class MockInputEditor {
                             startEditing() { console.log('Start editing with input editor') }
                             endEditing() { console.log('End editing') }
                           }
        
        const DateInputEditor = (VTable as any).editors?.DateInputEditor || 
                               (VTable as any).DateInputEditor ||
                               class MockDateEditor {
                                 startEditing() { console.log('Start editing with date editor') }
                                 endEditing() { console.log('End editing') }
                               }
        
        const ListEditor = (VTable as any).editors?.ListEditor || 
                          (VTable as any).ListEditor ||
                          class MockListEditor {
                            constructor(options: any) {}
                            startEditing() { console.log('Start editing with list editor') }
                            endEditing() { console.log('End editing') }
                          }
        
        const TextAreaEditor = (VTable as any).editors?.TextAreaEditor || 
                              (VTable as any).TextAreaEditor ||
                              class MockTextAreaEditor {
                                constructor(options: any) {}
                                startEditing() { console.log('Start editing with textarea editor') }
                                endEditing() { console.log('End editing') }
                              }

        const input_editor = new InputEditor()
        const date_input_editor = new DateInputEditor()
        const list_editor = new ListEditor({ values: ['boy', 'girl'] })
        const textArea_editor = new TextAreaEditor({ readonly: false })
        
        // 注册编辑器
        if (VTable.register && VTable.register.editor) {
          VTable.register.editor('input-editor', input_editor)
          VTable.register.editor('date-input-editor', date_input_editor)
          VTable.register.editor('list-editor', list_editor)
          VTable.register.editor('textArea-editor', textArea_editor)
          console.log('编辑器注册成功')
        } else {
          console.warn('VTable.register.editor 不可用')
        }
      } catch (editorError) {
        console.warn('编辑器注册失败:', editorError)
      }

      const records = generatePersons(10)

      const columns = [
        {
          field: 'id',
          title: 'ID',
          width: 80,
          sort: true
        },
        {
          field: 'name',
          title: 'First Name\n(input editor)',
          width: 120,
          editor: 'input-editor'
        },
        {
          field: 'lastName',
          title: 'Last Name\n(input editor)',
          width: 120,
          editor: 'input-editor'
        },
        {
          field: 'birthday',
          title: 'birthday\n(date editor)',
          width: 120,
          editor: 'date-input-editor'
        },
        {
          field: 'sex',
          title: 'sex\n(list editor)',
          width: 100,
          editor: 'list-editor'
        },
        {
          field: 'address',
          title: 'address\n(textArea editor)',
          width: 300,
          editor: 'textArea-editor'
        },
        {
          field: 'tel',
          title: 'telephone',
          width: 150
        },
        {
          field: 'work',
          title: 'job',
          width: 200
        },
        {
          field: 'city',
          title: 'city',
          width: 150
        }
      ]

      const option = {
        records,
        columns,
        enableLineBreak: true,
        autoWrapText: true,
        limitMaxAutoWidth: 600,
        heightMode: 'autoHeight' as const,
        editCellTrigger: 'doubleclick' as const,
        keyboardOptions: {
          copySelected: true,
          pasteValueToCell: true,
          selectAllOnCtrlA: true
        },
        excelOptions: {
          fillHandle: true
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
          }
        }
      }

      const instance = new VTable.ListTable(containerRef.current, option)
      
      // 监听单元格值变化事件
      instance.on('change_cell_value', (arg: any) => {
        console.log('Cell value changed:', arg)
        message.success(`单元格值已更改: ${arg.field} = ${arg.value}`)
      })

              // 监听单元格双击事件，启用编辑
        instance.on('dblclick_cell', (arg: any) => {
          const { col, row } = arg
          const cellValue = instance.getCellValue(col, row)
          const field = String(instance.getHeaderField(col, row))
          
          console.log('Double click cell:', { col, row, field, cellValue })
          
          // 可编辑字段
          const editableFields = ['name', 'lastName', 'birthday', 'sex', 'address']
          if (editableFields.includes(field)) {
            // 这里可以添加自定义编辑逻辑
            console.log(`字段 ${field} 可编辑`)
            message.info(`双击编辑字段: ${field}`)
          }
        })

        // 监听单元格点击事件
        instance.on('click_cell', (arg: any) => {
          const { col, row } = arg
          const field = String(instance.getHeaderField(col, row))
          const editableFields = ['name', 'lastName', 'birthday', 'sex', 'address']
          
          if (editableFields.includes(field)) {
            message.info(`点击可编辑字段: ${field}，双击可编辑`)
          }
        })

      setTableInstance(instance)
      
      // 调试用
      ;(window as any).tableInstance = instance

    } catch (error) {
      console.error('初始化编辑表格失败:', error)
      message.error('表格初始化失败，请检查是否安装了 @visactor/vtable-editors 包')
    }
  }

  return (
    <div className="demo-content">
      <div className="demo-header">
        <h2>单元格编辑示例</h2>
        <p>展示VTable的单元格编辑功能，支持多种编辑器类型</p>
      </div>
      
      <Card style={{ marginBottom: 24 }}>
                 <div style={{ marginBottom: 16 }}>
           <h3>功能说明</h3>
           <ul>
             <li><strong>输入编辑器</strong>：支持文本输入，用于姓名字段</li>
             <li><strong>日期编辑器</strong>：支持日期选择，用于生日字段</li>
             <li><strong>列表编辑器</strong>：支持下拉选择，用于性别字段</li>
             <li><strong>文本区域编辑器</strong>：支持多行文本，用于地址字段</li>
             <li><strong>键盘操作</strong>：支持Ctrl+C复制、Ctrl+V粘贴、Ctrl+A全选</li>
           </ul>
           <p style={{ color: '#52c41a', marginTop: 12 }}>
             操作：双击可编辑单元格开始编辑，按回车确认，按ESC取消。
           </p>
           <p style={{ color: '#1890ff', marginTop: 8 }}>
             提示：已尝试注册内置编辑器，如编辑功能不完整请安装 <code>@visactor/vtable-editors</code> 包。
           </p>
         </div>
      </Card>
      
      <div className="vtable-container" ref={containerRef} />
    </div>
  )
}

export default TableEditExample 