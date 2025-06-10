import React, { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Row,
  Col,
  Select,
  InputNumber,
  Switch,
  Typography,
  Divider,
  Badge,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  MenuOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import './index.less';

const { Title, Text } = Typography;
const { Option } = Select;

interface MenuNode {
  id: string;
  parentId?: string;
  name: string;
  code: string;
  path?: string;
  icon?: string;
  type: 'MENU' | 'BUTTON' | 'API';
  sortOrder: number;
  visible: boolean;
  enabled: boolean;
  children?: MenuNode[];
  functions?: MenuFunction[];
}

interface MenuFunction {
  id: string;
  menuId: string;
  name: string;
  code: string;
  type: string;
  enabled: boolean;
}

/**
 * 系统菜单管理页面
 */
const SystemMenu: React.FC = () => {
  const [form] = Form.useForm();
  const [functionForm] = Form.useForm();
  const [treeData, setTreeData] = useState<MenuNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuNode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [functionModalVisible, setFunctionModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuNode | null>(null);
  const [editingFunction, setEditingFunction] = useState<MenuFunction | null>(null);
  const [loading, setLoading] = useState(false);

  // 菜单类型枚举
  const menuTypeMap = {
    'MENU': { text: '菜单', color: 'blue', icon: <MenuOutlined /> },
    'BUTTON': { text: '按钮', color: 'green', icon: <SettingOutlined /> },
    'API': { text: '接口', color: 'orange', icon: <LinkOutlined /> }
  };

  // 加载菜单树数据
  const loadMenuTree = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockData: MenuNode[] = [
        {
          id: '1',
          name: '系统管理',
          code: 'system',
          path: '/system',
          icon: 'SettingOutlined',
          type: 'MENU',
          sortOrder: 1,
          visible: true,
          enabled: true,
          children: [
            {
              id: '11',
              parentId: '1',
              name: '用户管理',
              code: 'system:user',
              path: '/system/user',
              icon: 'UserOutlined',
              type: 'MENU',
              sortOrder: 1,
              visible: true,
              enabled: true,
              functions: [
                {
                  id: '111',
                  menuId: '11',
                  name: '查看用户',
                  code: 'system:user:view',
                  type: 'BUTTON',
                  enabled: true
                }
              ]
            }
          ]
        }
      ];

      setTreeData(mockData);
      setExpandedKeys(mockData.map(item => item.id));
      
    } catch (error) {
      message.error('加载菜单数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuTree();
  }, []);

  // 查找菜单节点
  const findMenuNode = (nodes: MenuNode[], id: string): MenuNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = findMenuNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 树节点选择
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0] as string;
    setSelectedKeys([key]);
    
    if (key) {
      const menu = findMenuNode(treeData, key);
      setSelectedMenu(menu);
    } else {
      setSelectedMenu(null);
    }
  };

  // 新增菜单
  const handleAddMenu = (parentMenu?: MenuNode) => {
    setEditingMenu(null);
    form.resetFields();
    
    if (parentMenu) {
      form.setFieldsValue({
        parentId: parentMenu.id,
        type: 'MENU'
      });
    }
    
    setModalVisible(true);
  };

  // 保存菜单
  const handleSaveMenu = async () => {
    try {
      const values = await form.validateFields();
      console.log('Saving menu:', values);
      
      message.success(editingMenu ? '更新成功' : '创建成功');
      setModalVisible(false);
      loadMenuTree();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <PageContainer
      header={{
        title: '菜单管理',
        breadcrumb: {
          routes: [
            { path: '/system', breadcrumbName: '系统管理' },
            { path: '/system/menu', breadcrumbName: '菜单管理' }
          ]
        }
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title="菜单结构" 
            extra={
              <Space>
                <Button 
                  size="small" 
                  icon={<PlusOutlined />} 
                  type="primary"
                  onClick={() => handleAddMenu()}
                >
                  新增根菜单
                </Button>
                <Button 
                  size="small" 
                  icon={<ReloadOutlined />}
                  onClick={loadMenuTree}
                >
                  刷新
                </Button>
              </Space>
            }
          >
            {treeData.length > 0 ? (
              <div>菜单树展示</div>
            ) : (
              <Empty 
                description="暂无菜单数据" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card title="菜单详情">
            {selectedMenu ? (
              <div>菜单详情</div>
            ) : (
              <Empty 
                description="请选择菜单查看详情" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 菜单编辑弹窗 */}
      <Modal
        title={editingMenu ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onOk={handleSaveMenu}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="menuForm"
        >
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SystemMenu; 