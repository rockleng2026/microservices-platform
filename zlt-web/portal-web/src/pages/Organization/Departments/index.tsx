import React, { useState } from 'react';
import { Card, Tree, Button, Modal, Form, Input, Select, message, Space, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd/es/tree';

// 部门类型定义
interface DepartmentType {
  id: number;
  name: string;
  parentId?: number;
  directorId?: number;
  directorName?: string;
  employeeCount?: number;
  children?: DepartmentType[];
}

const Departments: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<DepartmentType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DepartmentType | null>(null);
  const [form] = Form.useForm();

  // 模拟部门数据
  const mockDepartments: DepartmentType[] = [
    {
      id: 1,
      name: '总经理办公室',
      directorName: '张总',
      employeeCount: 3,
      children: [
        {
          id: 2,
          name: '行政部',
          parentId: 1,
          directorName: '王主任',
          employeeCount: 5,
        },
      ],
    },
    {
      id: 3,
      name: '技术中心',
      directorName: '李总监',
      employeeCount: 25,
      children: [
        {
          id: 4,
          name: '前端开发部',
          parentId: 3,
          directorName: '赵经理',
          employeeCount: 8,
        },
        {
          id: 5,
          name: '后端开发部',
          parentId: 3,
          directorName: '钱经理',
          employeeCount: 12,
        },
        {
          id: 6,
          name: '测试部',
          parentId: 3,
          directorName: '孙经理',
          employeeCount: 5,
        },
      ],
    },
    {
      id: 7,
      name: '销售中心',
      directorName: '周总监',
      employeeCount: 18,
      children: [
        {
          id: 8,
          name: '华北销售部',
          parentId: 7,
          directorName: '吴经理',
          employeeCount: 8,
        },
        {
          id: 9,
          name: '华南销售部',
          parentId: 7,
          directorName: '郑经理',
          employeeCount: 10,
        },
      ],
    },
    {
      id: 10,
      name: '人力资源部',
      directorName: '陈主任',
      employeeCount: 6,
    },
    {
      id: 11,
      name: '财务部',
      directorName: '刘主任',
      employeeCount: 4,
    },
  ];

  // 转换数据为Tree组件需要的格式
  const convertToTreeData = (data: DepartmentType[]) => {
    return data.map(item => ({
      key: item.id,
      title: (
        <Space>
          <TeamOutlined />
          <span>{item.name}</span>
          <span style={{ color: '#999', fontSize: '12px' }}>
            ({item.employeeCount}人)
          </span>
        </Space>
      ),
      children: item.children ? convertToTreeData(item.children) : undefined,
      data: item,
    }));
  };

  const treeData = convertToTreeData(mockDepartments);

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    if (selectedKeys.length > 0) {
      setSelectedDept(info.node.data as DepartmentType);
    }
  };

  const handleAdd = (parentId?: number) => {
    setEditingRecord(null);
    form.resetFields();
    if (parentId) {
      form.setFieldValue('parentId', parentId);
    }
    setModalVisible(true);
  };

  const handleEdit = (record: DepartmentType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record: DepartmentType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门"${record.name}"吗？删除后该部门下的子部门和员工将需要重新分配。`,
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = (values: any) => {
    if (editingRecord) {
      message.success('更新成功');
    } else {
      message.success('新增成功');
    }
    setModalVisible(false);
    form.resetFields();
  };

  const flattenDepartments = (depts: DepartmentType[]): DepartmentType[] => {
    let result: DepartmentType[] = [];
    for (const dept of depts) {
      result.push(dept);
      if (dept.children) {
        result = result.concat(flattenDepartments(dept.children));
      }
    }
    return result;
  };

  const allDepartments = flattenDepartments(mockDepartments);

  return (
    <div>
      <h2>部门管理</h2>
      <Row gutter={24}>
        <Col span={12}>
          <Card 
            title="部门架构" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => handleAdd()}
              >
                新增部门
              </Button>
            }
          >
            <Tree
              showLine
              defaultExpandAll
              onSelect={onSelect}
              treeData={treeData}
              style={{ minHeight: '400px' }}
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="部门详情">
            {selectedDept ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <h3>{selectedDept.name}</h3>
                  <Space direction="vertical" size="small">
                    <div><strong>部门负责人：</strong>{selectedDept.directorName || '未设置'}</div>
                    <div><strong>员工数量：</strong>{selectedDept.employeeCount}人</div>
                    <div><strong>部门ID：</strong>{selectedDept.id}</div>
                    {selectedDept.parentId && (
                      <div><strong>上级部门：</strong>
                        {allDepartments.find(d => d.id === selectedDept.parentId)?.name}
                      </div>
                    )}
                  </Space>
                </div>
                
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => handleAdd(selectedDept.id)}
                  >
                    添加子部门
                  </Button>
                  <Button 
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(selectedDept)}
                  >
                    编辑部门
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(selectedDept)}
                  >
                    删除部门
                  </Button>
                </Space>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                请在左侧选择一个部门查看详情
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingRecord ? '编辑部门' : '新增部门'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="上级部门"
          >
            <Select placeholder="请选择上级部门（可选）" allowClear>
              {allDepartments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="directorName"
            label="部门负责人"
          >
            <Input placeholder="请输入部门负责人姓名" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRecord ? '更新' : '新增'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Departments; 