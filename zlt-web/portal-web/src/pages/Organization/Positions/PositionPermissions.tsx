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
import { 
  getMenuTree, 
  configWorkPositionPermissions, 
  getWorkPositionPermissions 
} from '@/services/organization/position';

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
  id: number;
  name: string;
  parentId: number;
  type: 'menu' | 'button';
  path?: string;
  icon?: string;
  sortOrder: number;
  status: boolean;
  children?: MenuNode[];
  functions?: FunctionNode[];
}

interface FunctionNode {
  id: number;
  name: string;
  menuId: number;
  code: string;
  type?: string;
  sortOrder: number;
  enabled: number;
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
      const result = await getMenuTree();
      console.log('权限配置 - 菜单树数据:', result);
      
      // 兼容不同的响应格式
      let menuData = [];
      if (result && typeof result === 'object') {
        if (result.resp_code === 0 || result.success === true) {
          // 支持两种格式：{resp_code: 0, datas: []} 和 {success: true, data: []}
          menuData = result.datas || result.data || [];
        } else if (Array.isArray(result)) {
          // 直接返回数组格式
          menuData = result;
        } else {
          const errorMsg = result.resp_msg || result.message || '加载菜单树失败';
          message.error(errorMsg);
          return;
        }
      } else {
        message.error('菜单数据格式异常');
        return;
      }
      
      console.log('权限配置 - 设置菜单树数据:', menuData);
      setMenuTree(menuData);
    } catch (error) {
      console.error('加载菜单树失败:', error);
      
      // 根据错误类型给出更友好的提示
      let errorMessage = '加载菜单树失败';
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        errorMessage = '服务器返回数据格式错误，请检查后端服务是否正常运行';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '无法连接到服务器，请检查网络连接';
      } else if (error instanceof Error && error.message) {
        errorMessage = `加载失败: ${error.message}`;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 加载岗位权限配置
  const loadPositionPermissions = async () => {
    try {
      const result = await getWorkPositionPermissions(positionId);
      console.log('权限配置 - 后端返回的权限数据:', result);
      
      if (result.resp_code === 0 && result.datas) {
        const { menuIds, menuFuncIds } = result.datas;
        console.log('权限配置 - 原始menuIds:', menuIds);
        console.log('权限配置 - 原始menuFuncIds:', menuFuncIds);
        
        const selectedMenuIds = menuIds ? menuIds.split(',').filter(Boolean) : [];
        const selectedFuncIds = menuFuncIds ? menuFuncIds.split(',').filter(Boolean) : [];
        
        console.log('权限配置 - 解析后的菜单ID:', selectedMenuIds);
        console.log('权限配置 - 解析后的功能ID:', selectedFuncIds);
        
        // 确保加载的权限数据包含完整的父子关系
        // 注意：这里不需要再次添加父级菜单，因为后端保存的数据应该已经是完整的
        // 如果后端保存的数据不完整，那么显示时Tree组件会自动处理父子关系
        setSelectedMenus(selectedMenuIds);
        setSelectedFunctions(selectedFuncIds);
      } else {
        console.log('权限配置 - 没有权限数据或请求失败:', result);
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
            <Tag color={menu.type === 'menu' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
              {menu.type === 'menu' ? '菜单' : '按钮'}
            </Tag>
          </div>
          {!menu.status && (
            <Tag color="red">禁用</Tag>
          )}
        </div>
      ),
      key: String(menu.id), // 确保key是字符串类型
      disabled: !menu.status,
      children: menu.children ? convertMenuTreeData(menu.children) : undefined,
    }));
  };

  // 获取所有菜单ID（包含子级）
  const getAllMenuIds = (menus: MenuNode[]): string[] => {
    let ids: string[] = [];
    menus.forEach(menu => {
      ids.push(String(menu.id)); // 确保返回字符串类型
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
        ids = ids.concat(menu.functions.map(func => String(func.id))); // 确保返回字符串类型
      }
      if (menu.children && menu.children.length > 0) {
        ids = ids.concat(getAllFunctionIds(menu.children));
      }
    });
    return ids;
  };



  // 菜单选择变化处理  
  const handleMenuCheck = (checkedKeys: any, info: any) => {
    // 获取当前操作的实际选中状态
    const currentCheckedKeys = Array.isArray(checkedKeys) ? checkedKeys : (checkedKeys.checked || []);
    const currentHalfCheckedKeys = info.halfCheckedKeys || [];
    
    console.log('权限配置 - 菜单选择变化:', {
      Tree组件返回的选中菜单: currentCheckedKeys,
      Tree组件返回的半选中菜单: currentHalfCheckedKeys,
      之前选中的菜单: selectedMenus,
      操作信息: info
    });

    // 直接使用 Tree 组件计算好的选中状态
    // Tree 组件已经自动处理了父子关系的联动
    // selectedMenus 只保存完全选中的菜单，halfCheckedMenus 保存半选中的
    // 这样 Tree 组件能正确显示选中状态
    setSelectedMenus(currentCheckedKeys);
    setHalfCheckedMenus(currentHalfCheckedKeys);
    
    console.log('权限配置 - 设置菜单状态:', {
      完全选中: currentCheckedKeys,
      半选中: currentHalfCheckedKeys
    });
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
      // 合并完全选中和半选中的菜单，确保权限结构完整
      const allSelectedMenus = [...selectedMenus];
      halfCheckedMenus.forEach(menuId => {
        if (!allSelectedMenus.includes(menuId)) {
          allSelectedMenus.push(menuId);
        }
      });
      
      console.log('权限配置 - 准备保存权限:', {
        岗位ID: positionId,
        完全选中的菜单: selectedMenus,
        半选中的菜单: halfCheckedMenus,
        最终保存的菜单: allSelectedMenus,
        选中的功能: selectedFunctions,
        菜单权限字符串: allSelectedMenus.join(','),
        功能权限字符串: selectedFunctions.join(',')
      });
      
      const result = await configWorkPositionPermissions(
        positionId,
        allSelectedMenus.join(','),
        selectedFunctions.join(',')
      );
      
      if (result.resp_code === 0) {
        message.success('权限配置保存成功');
        console.log('权限配置 - 保存成功:', result);
        onSuccess();
      } else {
        message.error(result.resp_msg || '保存失败');
        console.error('权限配置 - 保存失败:', result);
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
              <Row gutter={[16, 8]}>
                {menu.functions!.map(func => (
                  <Col key={func.id} span={8}>
                    <Checkbox
                      checked={selectedFunctions.includes(String(func.id))}
                      disabled={func.enabled === 0}
                      onChange={(e) => {
                        const funcId = String(func.id);
                        if (e.target.checked) {
                          // 添加到选中列表
                          if (!selectedFunctions.includes(funcId)) {
                            setSelectedFunctions([...selectedFunctions, funcId]);
                          }
                        } else {
                          // 从选中列表中移除
                          setSelectedFunctions(selectedFunctions.filter(id => id !== funcId));
                        }
                      }}
                    >
                      <span style={{ fontSize: 12 }}>
                        {func.name}
                        {func.enabled === 0 && (
                          <Tag color="red" style={{ marginLeft: 4 }}>禁用</Tag>
                        )}
                      </span>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
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
          description="为岗位配置菜单权限和功能权限，配置后该岗位下的所有用户将获得相应权限。选中子菜单时，系统会自动选中其父级菜单，确保权限结构完整。"
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