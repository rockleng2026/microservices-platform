import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tree,
  Spin,
  message,
  Row,
  Col,
  Card,
  Tabs,
  Space,
  Button,
  Typography,
  Divider,
  Checkbox,
  Alert,
  Tag
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  MenuOutlined,
  SafetyCertificateOutlined,
  CheckOutlined,
  CloseOutlined,
  FolderOutlined,
  FileOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface PositionPermissionsProps {
  visible: boolean;
  positionId: string;
  positionName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface MenuNode {
  id: string;
  name: string;
  parentId: string;
  type: 'menu' | 'button';
  path?: string;
  icon?: string;
  sort: number;
  status: number;
  children?: MenuNode[];
  functions?: FunctionNode[];
}

interface FunctionNode {
  id: string;
  name: string;
  menuId: string;
  code: string;
  type: string;
  sort: number;
  status: number;
}

interface PermissionConfig {
  menuIds: string[];
  menuFuncIds: string[];
}

const PositionPermissions: React.FC<PositionPermissionsProps> = ({
  visible,
  positionId,
  positionName,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [halfCheckedMenus, setHalfCheckedMenus] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('menu');

  // 初始化数据
  useEffect(() => {
    if (visible && positionId) {
      loadMenuTree();
      loadPositionPermissions();
    }
  }, [visible, positionId]);

  // 加载菜单树
  const loadMenuTree = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/menu/tree', {
        headers: {
          'x-tenant-header': 'default',
        },
      });
      const result = await response.json();
      
      if (result.code === 0) {
        setMenuTree(result.data || []);
      } else {
        message.error(result.msg || '加载菜单树失败');
      }
    } catch (error) {
      console.error('加载菜单树失败:', error);
      message.error('加载菜单树失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载岗位权限配置
  const loadPositionPermissions = async () => {
    try {
      const response = await fetch(`/api/workposition/${positionId}/permissions`, {
        headers: {
          'x-tenant-header': 'default',
        },
      });
      const result = await response.json();
      
      if (result.code === 0 && result.data) {
        const { menuIds, menuFuncIds } = result.data;
        setSelectedMenus(menuIds ? menuIds.split(',').filter(Boolean) : []);
        setSelectedFunctions(menuFuncIds ? menuFuncIds.split(',').filter(Boolean) : []);
      }
    } catch (error) {
      console.error('加载岗位权限失败:', error);
      message.error('加载权限配置失败');
    }
  };

  // 转换菜单树数据为Tree组件需要的格式
  const convertMenuTreeData = (menus: MenuNode[]): DataNode[] => {
    return menus.map(menu => ({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {menu.type === 'menu' ? <FolderOutlined /> : <FileOutlined />}
            <span style={{ marginLeft: 8 }}>{menu.name}</span>
            <Tag color={menu.type === 'menu' ? 'blue' : 'green'} size="small" style={{ marginLeft: 8 }}>
              {menu.type === 'menu' ? '菜单' : '按钮'}
            </Tag>
          </div>
          {menu.status === 0 && (
            <Tag color="red" size="small">禁用</Tag>
          )}
        </div>
      ),
      key: menu.id,
      disabled: menu.status === 0,
      children: menu.children ? convertMenuTreeData(menu.children) : undefined,
    }));
  };

  // 获取所有菜单ID（包含子级）
  const getAllMenuIds = (menus: MenuNode[]): string[] => {
    let ids: string[] = [];
    menus.forEach(menu => {
      ids.push(menu.id);
      if (menu.children && menu.children.length > 0) {
        ids = ids.concat(getAllMenuIds(menu.children));
      }
    });
    return ids;
  };

  // 获取所有功能按钮ID
  const getAllFunctionIds = (menus: MenuNode[]): string[] => {
    let ids: string[] = [];
    menus.forEach(menu => {
      if (menu.functions && menu.functions.length > 0) {
        ids = ids.concat(menu.functions.map(func => func.id));
      }
      if (menu.children && menu.children.length > 0) {
        ids = ids.concat(getAllFunctionIds(menu.children));
      }
    });
    return ids;
  };

  // 菜单选择变化处理
  const handleMenuCheck = (checkedKeys: any, info: any) => {
    setSelectedMenus(checkedKeys.checked || checkedKeys);
    setHalfCheckedMenus(info.halfCheckedKeys || []);
  };

  // 全选/全不选菜单
  const handleSelectAllMenus = (checked: boolean) => {
    if (checked) {
      const allIds = getAllMenuIds(menuTree);
      setSelectedMenus(allIds);
      setHalfCheckedMenus([]);
    } else {
      setSelectedMenus([]);
      setHalfCheckedMenus([]);
    }
  };

  // 全选/全不选功能按钮
  const handleSelectAllFunctions = (checked: boolean) => {
    if (checked) {
      const allIds = getAllFunctionIds(menuTree);
      setSelectedFunctions(allIds);
    } else {
      setSelectedFunctions([]);
    }
  };

  // 保存权限配置
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/workposition/${positionId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-header': 'default',
        },
        body: JSON.stringify({
          menuIds: selectedMenus.join(','),
          menuFuncIds: selectedFunctions.join(','),
        }),
      });
      const result = await response.json();
      
      if (result.code === 0) {
        message.success('权限配置保存成功');
        onSuccess();
      } else {
        message.error(result.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存权限配置失败:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 渲染功能按钮权限
  const renderFunctionPermissions = (menus: MenuNode[]) => {
    const renderMenuFunctions = (menu: MenuNode) => {
      const hasFunctions = menu.functions && menu.functions.length > 0;
      
      return (
        <div key={menu.id} style={{ marginBottom: 16 }}>
          {hasFunctions && (
            <Card
              size="small"
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MenuOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  {menu.name}
                </div>
              }
              style={{ marginBottom: 8 }}
            >
              <Checkbox.Group
                value={selectedFunctions}
                onChange={setSelectedFunctions}
              >
                <Row gutter={[16, 8]}>
                  {menu.functions!.map(func => (
                    <Col key={func.id} span={8}>
                      <Checkbox
                        value={func.id}
                        disabled={func.status === 0}
                      >
                        <span style={{ fontSize: 12 }}>
                          {func.name}
                          {func.status === 0 && (
                            <Tag color="red" size="small" style={{ marginLeft: 4 }}>禁用</Tag>
                          )}
                        </span>
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Card>
          )}
          
          {menu.children && menu.children.map(child => renderMenuFunctions(child))}
        </div>
      );
    };

    return menus.map(menu => renderMenuFunctions(menu));
  };

  const allMenuIds = getAllMenuIds(menuTree);
  const allFunctionIds = getAllFunctionIds(menuTree);
  const isAllMenusSelected = allMenuIds.length > 0 && selectedMenus.length === allMenuIds.length;
  const isAllFunctionsSelected = allFunctionIds.length > 0 && selectedFunctions.length === allFunctionIds.length;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SafetyCertificateOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>岗位权限配置 - {positionName}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" loading={saving} onClick={handleSave}>
          保存配置
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Alert
          message="权限配置说明"
          description="为岗位配置菜单权限和功能权限，配置后该岗位下的所有用户将获得相应权限。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <MenuOutlined />
                菜单权限
                {selectedMenus.length > 0 && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {selectedMenus.length}
                  </Tag>
                )}
              </span>
            }
            key="menu"
          >
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  size="small"
                  type={isAllMenusSelected ? 'default' : 'primary'}
                  icon={<CheckOutlined />}
                  onClick={() => handleSelectAllMenus(!isAllMenusSelected)}
                >
                  {isAllMenusSelected ? '取消全选' : '全选'}
                </Button>
                <Text type="secondary">
                  已选择 {selectedMenus.length} / {allMenuIds.length} 项
                </Text>
              </Space>
            </div>

            <div style={{ 
              maxHeight: 400, 
              overflow: 'auto',
              border: '1px solid #d9d9d9',
              padding: 16,
              borderRadius: 6
            }}>
              <Tree
                checkable
                checkedKeys={{
                  checked: selectedMenus,
                  halfChecked: halfCheckedMenus,
                }}
                onCheck={handleMenuCheck}
                treeData={convertMenuTreeData(menuTree)}
                height={350}
                titleRender={(nodeData) => nodeData.title}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SafetyCertificateOutlined />
                功能权限
                {selectedFunctions.length > 0 && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    {selectedFunctions.length}
                  </Tag>
                )}
              </span>
            }
            key="function"
          >
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  size="small"
                  type={isAllFunctionsSelected ? 'default' : 'primary'}
                  icon={<CheckOutlined />}
                  onClick={() => handleSelectAllFunctions(!isAllFunctionsSelected)}
                >
                  {isAllFunctionsSelected ? '取消全选' : '全选'}
                </Button>
                <Text type="secondary">
                  已选择 {selectedFunctions.length} / {allFunctionIds.length} 项
                </Text>
              </Space>
            </div>

            <div style={{ 
              maxHeight: 400, 
              overflow: 'auto',
              border: '1px solid #d9d9d9',
              padding: 16,
              borderRadius: 6
            }}>
              {renderFunctionPermissions(menuTree)}
            </div>
          </TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default PositionPermissions; 