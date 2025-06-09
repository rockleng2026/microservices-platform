import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tree,
  Button,
  Space,
  Input,
  Table,
  Tag,
  message,
  Popconfirm,
  Upload,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  CopyOutlined,
  DragOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import { 
  getDepartmentTree, 
  getDepartmentPage,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentDetail,
  exportDepartments,
  importDepartments,
  updateDepartmentStatus,
  moveDepartment,
  copyDepartmentStructure,
  validateDepartmentLevel
} from '@/services/organization/department';

import DepartmentForm from './components/DepartmentForm';
import DepartmentDetail from './components/DepartmentDetail';
import DepartmentStatistics from './components/DepartmentStatistics';

const { Search } = Input;

interface DepartmentNode extends DataNode {
  id: number;
  name: string;
  parentId: number;
  depNo: string;
  directorId?: number;
  directorName?: string;
  employeeCount: number;
  positionCount: number;
  status: number;
  gradeid: number;
  gradeName: string;
  children?: DepartmentNode[];
}

interface Department {
  id: number;
  name: string;
  parentId: number;
  depNo: string;
  directorId?: number;
  gradeid: number;
  tel?: string;
  address?: string;
  description?: string;
  status: number;
  employeeCount: number;
  positionCount: number;
  gradeName: string;
  directorName?: string;
  parentName?: string;
  path?: string;
  createdAt: string;
  updatedAt: string;
}

const DepartmentManagement: React.FC = () => {
  const [treeData, setTreeData] = useState<DepartmentNode[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<Department[]>([]);
  const [showTable, setShowTable] = useState(false);
  
  // 表单相关状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState<'add' | 'edit' | 'copy'>('add');

  // 加载部门树
  const loadDepartmentTree = async (includeDisabled = false) => {
    setLoading(true);
    try {
      const response = await getDepartmentTree({ includeDisabled });
      if (response.success) {
        const treeNodes = convertToTreeNodes(response.data);
        setTreeData(treeNodes);
        // 默认展开第一级
        if (treeNodes.length > 0) {
          setExpandedKeys(treeNodes.map(node => node.key));
        }
      } else {
        message.error(response.message || '加载部门树失败');
      }
    } catch (error) {
      message.error('加载部门树失败');
      console.error('Load department tree error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 转换为Tree组件需要的数据格式
  const convertToTreeNodes = (departments: any[]): DepartmentNode[] => {
    return departments.map(dept => ({
      key: dept.id,
      title: renderTreeNodeTitle(dept),
      id: dept.id,
      name: dept.name,
      parentId: dept.parentId,
      depNo: dept.depNo,
      directorId: dept.directorId,
      directorName: dept.directorName,
      employeeCount: dept.employeeCount || 0,
      positionCount: dept.positionCount || 0,
      status: dept.status,
      gradeid: dept.gradeid,
      gradeName: dept.gradeName,
      children: dept.children ? convertToTreeNodes(dept.children) : undefined,
      isLeaf: !dept.children || dept.children.length === 0
    }));
  };

  // 渲染树节点标题
  const renderTreeNodeTitle = (dept: any) => (
    <div className="tree-node-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <ApartmentOutlined style={{ marginRight: 4, color: '#1890ff' }} />
        <span style={{ marginRight: 8, fontWeight: 500 }}>{dept.name}</span>
        <Tag color={dept.status === 1 ? 'green' : 'red'}>
          {dept.status === 1 ? '正常' : '禁用'}
        </Tag>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Badge count={dept.employeeCount} size="small" color="#52c41a" title="员工数量">
          <UserOutlined style={{ fontSize: 12, color: '#666' }} />
        </Badge>
        <Badge count={dept.positionCount} size="small" color="#1890ff" title="岗位数量">
          <SettingOutlined style={{ fontSize: 12, color: '#666' }} />
        </Badge>
      </div>
    </div>
  );

  // 树节点选择
  const onSelectTreeNode = async (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);
    if (selectedKeys.length > 0) {
      const deptId = selectedKeys[0] as number;
      await loadDepartmentDetail(deptId);
    } else {
      setSelectedDept(null);
    }
  };

  // 加载部门详情
  const loadDepartmentDetail = async (id: number) => {
    try {
      const response = await getDepartmentDetail(id);
      if (response.success) {
        setSelectedDept(response.data);
      } else {
        message.error(response.message || '获取部门详情失败');
      }
    } catch (error) {
      message.error('获取部门详情失败');
      console.error('Load department detail error:', error);
    }
  };

  // 新增部门
  const handleAdd = () => {
    const parentId = selectedKeys.length > 0 ? selectedKeys[0] as number : 0;
    setModalType('add');
    setModalTitle('新增部门');
    setModalVisible(true);
  };

  // 编辑部门
  const handleEdit = () => {
    if (!selectedDept) {
      message.warning('请选择要编辑的部门');
      return;
    }
    setModalType('edit');
    setModalTitle('编辑部门');
    setModalVisible(true);
  };

  // 删除部门
  const handleDelete = async () => {
    if (!selectedDept) {
      message.warning('请选择要删除的部门');
      return;
    }
    
    try {
      const response = await deleteDepartment(selectedDept.id);
      if (response.success) {
        message.success('删除成功');
        await loadDepartmentTree();
        setSelectedDept(null);
        setSelectedKeys([]);
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
      console.error('Delete department error:', error);
    }
  };

  // 表单提交
  const handleFormSubmit = async (values: any) => {
    try {
      let response;
      
      if (modalType === 'add') {
        response = await createDepartment(values);
      } else if (modalType === 'edit') {
        response = await updateDepartment(selectedDept!.id, values);
      }
      
      if (response?.success) {
        message.success(modalType === 'add' ? '新增成功' : '编辑成功');
        setModalVisible(false);
        await loadDepartmentTree();
        
        if (modalType === 'edit' && selectedDept) {
          await loadDepartmentDetail(selectedDept.id);
        }
      } else {
        message.error(response?.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error('Form submit error:', error);
    }
  };

  // 表格列配置
  const tableColumns: ColumnsType<Department> = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Department) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ApartmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '部门编号',
      dataIndex: 'depNo',
      key: 'depNo',
      width: 120,
    },
    {
      title: '上级部门',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 150,
    },
    {
      title: '部门级别',
      dataIndex: 'gradeName',
      key: 'gradeName',
      width: 100,
    },
    {
      title: '员工数',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 80,
      render: (count: number) => <Badge count={count} showZero />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Department) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => loadDepartmentDetail(record.id)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedDept(record);
              handleEdit();
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个部门吗？"
            onConfirm={() => {
              setSelectedDept(record);
              handleDelete();
            }}
          >
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 组件挂载时加载数据
  useEffect(() => {
    loadDepartmentTree();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>部门管理</h1>
      
      <Row gutter={[16, 16]}>
        {/* 左侧部门树 */}
        <Col span={showTable ? 0 : 8}>
          <Card
            title="部门架构"
            size="small"
            extra={
              <Space size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => loadDepartmentTree()}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<DragOutlined />}
                  onClick={() => setShowTable(!showTable)}
                />
              </Space>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Search
                placeholder="搜索部门"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <Tree
              showLine={{ showLeafIcon: false }}
              selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              onSelect={onSelectTreeNode}
              onExpand={setExpandedKeys}
              treeData={treeData}
              height={600}
            />
          </Card>
        </Col>

        {/* 右侧内容区域 */}
        <Col span={showTable ? 24 : 16}>
          {showTable ? (
            /* 表格视图 */
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Button icon={<ApartmentOutlined />} onClick={() => setShowTable(false)}>
                    切换到树形视图
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增部门
                  </Button>
                </Space>
              </div>
              
              <Table<Department>
                columns={tableColumns}
                dataSource={tableData}
                rowKey="id"
                pagination={{
                  defaultPageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                scroll={{ x: 1200 }}
              />
            </Card>
          ) : (
            /* 详情视图 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 操作工具栏 */}
              <Card size="small">
                <Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增部门
                  </Button>
                  <Button icon={<EditOutlined />} onClick={handleEdit} disabled={!selectedDept}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定要删除这个部门吗？"
                    onConfirm={handleDelete}
                    disabled={!selectedDept}
                  >
                    <Button icon={<DeleteOutlined />} disabled={!selectedDept} danger>
                      删除
                    </Button>
                  </Popconfirm>
                  <Button icon={<DragOutlined />} onClick={() => setShowTable(true)}>
                    表格视图
                  </Button>
                </Space>
              </Card>

              {/* 部门详情 */}
              {selectedDept && (
                <DepartmentDetail
                  department={selectedDept}
                  onRefresh={() => loadDepartmentDetail(selectedDept.id)}
                />
              )}

              {/* 部门统计 */}
              {selectedDept && (
                <DepartmentStatistics departmentId={selectedDept.id} />
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* 部门表单弹窗 */}
      <DepartmentForm
        visible={modalVisible}
        title={modalTitle}
        type={modalType}
        initialValues={selectedDept}
        onCancel={() => {
          setModalVisible(false);
        }}
        onSubmit={handleFormSubmit}
        treeData={treeData}
      />
    </div>
  );
};

export default DepartmentManagement; 