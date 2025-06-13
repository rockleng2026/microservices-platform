import React, { useState, useEffect, useRef } from 'react';
import {
  Tree,
  Card,
  Button,
  Space,
  Input,
  Dropdown,
  Menu,
  Modal,
  Form,
  Select,
  InputNumber,
  Switch,
  message,
  Spin,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ExpandAltOutlined,
  CompressOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SettingOutlined,
  CopyOutlined,
  DragOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { TreeProps, DataNode } from 'antd/es/tree';
import { PageContainer } from '@ant-design/pro-components';
import * as departmentApi from '@/services/organization/department';
import DepartmentPositions from './DepartmentPositions';
import styles from './index.less';

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

interface DepartmentTreeNode extends DataNode {
  id: string;
  parentId: string;
  name: string;
  depNo?: string;
  directorId?: string;
  directorName?: string;
  employeeCount?: number;
  childrenCount?: number;
  isFiliale?: boolean;
  isHalfLevel?: boolean;
  status?: number;
  children?: DepartmentTreeNode[];
}

interface DepartmentFormData {
  id?: string;
  name: string;
  parentId: string;
  depNo?: string;
  directorId?: string;
  gradeId?: number;
  islevel?: number;
  fiiale?: string;
  filialemark?: string;
  tel?: string;
  address?: string;
  description?: string;
  sortOrder?: number;
  status: number;
}

const DepartmentManagement: React.FC = () => {
  const [treeData, setTreeData] = useState<DepartmentTreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentDepartment, setCurrentDepartment] = useState<DepartmentTreeNode | null>(null);
  
  const [form] = Form.useForm();
  const treeRef = useRef<any>(null);

  // 加载部门树数据
  const loadDepartmentTree = async () => {
    setLoading(true);
    try {
      const response = await departmentApi.getDepartmentTree({});
      if (response.code === 0) {
        const treeData = convertToTreeData(response.data);
        setTreeData(treeData);
        
        // 默认展开前两级
        const defaultExpandedKeys = getDefaultExpandedKeys(treeData, 2);
        setExpandedKeys(defaultExpandedKeys);
      } else {
        message.error(response.msg || '加载部门树失败');
      }
    } catch (error) {
      message.error('加载部门树失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 转换为Tree组件需要的数据格式
  const convertToTreeData = (departments: any[]): DepartmentTreeNode[] => {
    return departments.map(dept => ({
      key: dept.id,
      id: dept.id,
      parentId: dept.parentId,
      title: renderTreeNodeTitle(dept),
      name: dept.name,
      depNo: dept.depNo,
      directorId: dept.directorId,
      directorName: dept.directorName,
      employeeCount: dept.employeeCount,
      childrenCount: dept.childrenCount,
      isFiliale: dept.isFiliale,
      isHalfLevel: dept.isHalfLevel,
      status: dept.status,
      children: dept.children ? convertToTreeData(dept.children) : undefined,
    }));
  };

  // 渲染树节点标题
  const renderTreeNodeTitle = (dept: any) => {
    const getIcon = () => {
      if (dept.isFiliale) return '🏢';
      if (dept.isHalfLevel) return '🏬';
      if (!dept.children || dept.children.length === 0) return '📁';
      return '📂';
    };

    return (
      <div className={styles.treeNodeTitle}>
        <span className={styles.nodeIcon}>{getIcon()}</span>
        <span className={styles.nodeName}>
          {dept.name}
          {dept.isHalfLevel && <span className={styles.halfLevelMark}>*</span>}
        </span>
        {dept.depNo && (
          <Tag size="small" color="blue" className={styles.nodeTag}>
            {dept.depNo}
          </Tag>
        )}
        {dept.directorName && (
          <Tag size="small" color="green" className={styles.nodeTag}>
            {dept.directorName}
          </Tag>
        )}
        <span className={styles.nodeStats}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dept.employeeCount || 0}人
          </Text>
        </span>
        <div className={styles.nodeActions}>
          <Dropdown
            menu={{ items: renderActionMenuItems(dept) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" size="small" icon={<SettingOutlined />} />
          </Dropdown>
        </div>
      </div>
    );
  };

  // 渲染操作菜单项
  const renderActionMenuItems = (dept: any) => [
    {
      key: 'add',
      icon: <PlusOutlined />,
      label: '新增子部门',
      onClick: () => handleAddChild(dept),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑部门',
      onClick: () => handleEdit(dept),
    },
    {
      key: 'employees',
      icon: <TeamOutlined />,
      label: '员工管理',
    },
    {
      type: 'divider',
    },
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: '复制结构',
      onClick: () => handleCopy(dept),
    },
    {
      key: 'move',
      icon: <DragOutlined />,
      label: '移动部门',
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除部门',
      danger: true,
      onClick: () => handleDelete(dept),
    },
  ];

  // 获取默认展开的节点
  const getDefaultExpandedKeys = (treeData: DepartmentTreeNode[], maxLevel: number): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodes: DepartmentTreeNode[], level: number) => {
      if (level > maxLevel) return;
      
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          keys.push(node.key!);
          traverse(node.children, level + 1);
        }
      });
    };
    
    traverse(treeData, 1);
    return keys;
  };

  // 搜索过滤
  const getParentKey = (key: React.Key, tree: DepartmentTreeNode[]): React.Key => {
    let parentKey: React.Key = '';
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.key === key)) {
          parentKey = node.key!;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  const onSearch = (value: string) => {
    const expandedKeys = searchTree(treeData, value);
    setExpandedKeys(expandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const searchTree = (tree: DepartmentTreeNode[], searchValue: string): React.Key[] => {
    const expandedKeys: React.Key[] = [];
    const traverse = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach(node => {
        if (node.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            (node.depNo && node.depNo.toLowerCase().includes(searchValue.toLowerCase()))) {
          expandedKeys.push(node.key!);
          // 展开所有父节点
          let parentKey = getParentKey(node.key!, treeData);
          while (parentKey) {
            expandedKeys.push(parentKey);
            parentKey = getParentKey(parentKey, treeData);
          }
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    
    if (searchValue) {
      traverse(tree);
    }
    return expandedKeys;
  };

  // 处理新增根部门
  const handleAddRoot = () => {
    setCurrentDepartment(null);
    setModalTitle('新增根部门');
    form.resetFields();
    form.setFieldsValue({
      parentId: '0',
      status: 1,
      gradeid: 1,
    });
    setModalVisible(true);
  };

  // 处理新增子部门
  const handleAddChild = (parent: DepartmentTreeNode) => {
    setCurrentDepartment(parent);
    setModalTitle(`新增子部门 - ${parent.name}`);
    form.resetFields();
    form.setFieldsValue({
      parentId: parent.id,
      status: 1,
      gradeid: (parent as any).gradeid ? (parent as any).gradeid + 1 : 2,
    });
    setModalVisible(true);
  };

  // 处理编辑
  const handleEdit = async (dept: DepartmentTreeNode) => {
    setLoading(true);
    try {
      const response = await departmentApi.getDepartmentById(dept.id);
      if (response.code === 0) {
        setCurrentDepartment(dept);
        setModalTitle(`编辑部门 - ${dept.name}`);
        form.setFieldsValue(response.data);
        setModalVisible(true);
      } else {
        message.error(response.msg || '获取部门详情失败');
      }
    } catch (error) {
      message.error('获取部门详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 处理删除
  const handleDelete = (dept: DepartmentTreeNode) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门"${dept.name}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await departmentApi.deleteDepartment(dept.id);
          console.log('删除部门响应:', response);
          
          if (response.code === 0 || response.resp_code === 0) {
            message.success('删除成功');
            loadDepartmentTree();
          } else {
            const errorMsg = response.msg || response.resp_msg || response.message || '删除失败';
            console.error('删除部门失败详情:', { response, errorMsg });
            message.error(errorMsg);
          }
        } catch (error: any) {
          console.error('删除部门异常:', error);
          
          // 解析错误信息
          let errorMessage = '删除失败';
          if (error?.response?.data?.resp_msg) {
            errorMessage = error.response.data.resp_msg;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.response?.data?.msg) {
            errorMessage = error.response.data.msg;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          message.error(errorMessage);
        }
      },
    });
  };

  // 处理复制
  const handleCopy = (dept: DepartmentTreeNode) => {
    // TODO: 实现复制功能
    message.info('复制功能开发中...');
  };

  // 处理保存
  const handleSave = async (values: DepartmentFormData) => {
    try {
      const response = await departmentApi.saveDepartment(values);
      if (response.code === 0) {
        message.success('保存成功');
        setModalVisible(false);
        loadDepartmentTree();
      } else {
        message.error(response.msg || '保存失败');
      }
    } catch (error) {
      message.error('保存失败');
      console.error(error);
    }
  };

  // 展开/折叠所有节点
  const handleExpandAll = () => {
    const allKeys = getAllKeys(treeData);
    setExpandedKeys(allKeys);
  };

  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };

  const getAllKeys = (tree: DepartmentTreeNode[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach(node => {
        keys.push(node.key!);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(tree);
    return keys;
  };

  // Tree事件处理
  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);
    console.log('选中部门:', selectedKeys, info);
  };

  useEffect(() => {
    loadDepartmentTree();
  }, []);

  // 获取选中部门信息
  const getSelectedDepartment = () => {
    if (selectedKeys.length === 0) return null;
    
    const findDept = (nodes: DepartmentTreeNode[], id: string): DepartmentTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findDept(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findDept(treeData, selectedKeys[0] as string);
  };

  const selectedDepartment = getSelectedDepartment();

  return (
    <PageContainer
      title="部门管理"
      content="管理企业组织架构，支持多级部门结构和灵活的权限配置"
    >
      <Row gutter={16} style={{ height: 'calc(100vh - 200px)' }}>
        {/* 左侧：部门树 */}
        <Col span={8}>
          <Card 
            title="部门结构" 
            size="small"
            style={{ height: '100%' }}
            bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            {/* 工具栏 */}
            <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space size="small">
                  <Button size="small" type="primary" icon={<PlusOutlined />} onClick={handleAddRoot}>
                    新增根部门
                  </Button>
                  <Button size="small" icon={<ExpandAltOutlined />} onClick={handleExpandAll}>
                    全部展开
                  </Button>
                  <Button size="small" icon={<CompressOutlined />} onClick={handleCollapseAll}>
                    全部折叠
                  </Button>
                  <Button size="small" icon={<ReloadOutlined />} onClick={loadDepartmentTree}>
                    刷新
                  </Button>
                </Space>
              </Col>
            </Row>
            
            {/* 搜索框 */}
            <Search
              placeholder="搜索部门名称或编号"
              allowClear
              size="small"
              style={{ marginBottom: 16 }}
              onSearch={onSearch}
            />

            {/* 部门树 */}
            <Spin spinning={loading}>
              <Tree
                ref={treeRef}
                showLine
                showIcon={false}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                selectedKeys={selectedKeys}
                treeData={treeData}
                onExpand={onExpand}
                onSelect={onSelect}
                style={{ minHeight: 400 }}
              />
            </Spin>
          </Card>
        </Col>

        {/* 右侧：部门岗位管理 */}
        <Col span={16}>
          <DepartmentPositions
            departmentId={selectedDepartment?.id}
            departmentName={selectedDepartment?.name}
          />
        </Col>
      </Row>

        {/* 编辑弹窗 */}
        <Modal
          title={modalTitle}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
          width={600}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="parentId" hidden>
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="部门名称"
                  rules={[{ required: true, message: '请输入部门名称' }]}
                >
                  <Input placeholder="请输入部门名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="depNo" label="部门编号">
                  <Input placeholder="系统自动生成" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gradeId" label="部门等级">
                  <Select placeholder="请选择部门等级">
                    <Option value={1}>一级部门</Option>
                    <Option value={2}>二级部门</Option>
                    <Option value={3}>三级部门</Option>
                    <Option value={4}>四级部门</Option>
                    <Option value={5}>五级部门</Option>
                    <Option value={6}>六级部门</Option>
                    <Option value={7}>七级部门</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="状态" valuePropName="checked">
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="fiiale" label="分公司标识">
                  <Select placeholder="请选择">
                    <Option value="">否</Option>
                    <Option value="1">是</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="islevel" label="部门级别">
                  <Select placeholder="请选择部门级别">
                    <Option value={0}>普通部门</Option>
                    <Option value={1}>半级部门</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="tel" label="联系电话">
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="sortOrder" label="排序号">
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="排序号" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="address" label="办公地址">
              <Input placeholder="请输入办公地址" />
            </Form.Item>

            <Form.Item name="description" label="部门描述">
              <Input.TextArea rows={3} placeholder="请输入部门描述" />
            </Form.Item>
          </Form>
        </Modal>
    </PageContainer>
  );
};

export default DepartmentManagement; 