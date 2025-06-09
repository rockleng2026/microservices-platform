import React, { useState, useEffect } from 'react';
import { Modal, Tree, Button, message, Card, Space, Spin } from 'antd';
import { getPermissionMenuTree, updatePositionPermissions, getWorkPositionDetail } from '@/services/organization/position';

interface PositionPermissionsProps {
  visible: boolean;
  positionId: number;
  positionName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MenuNode {
  key: string;
  title: string;
  children?: MenuNode[];
}

const PositionPermissions: React.FC<PositionPermissionsProps> = ({
  visible,
  positionId,
  positionName,
  onClose,
  onSuccess,
}) => {
  const [treeData, setTreeData] = useState<MenuNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // 获取权限菜单树
  const fetchPermissionTree = async () => {
    try {
      setLoading(true);
      const response = await getPermissionMenuTree();
      if (response.success && response.datas) {
        setTreeData(buildTreeData(response.datas));
      }
    } catch (error) {
      console.error('获取权限菜单失败:', error);
      message.error('获取权限菜单失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取岗位当前权限
  const fetchPositionPermissions = async () => {
    try {
      const response = await getWorkPositionDetail(positionId);
      if (response.success && response.datas) {
        const permissions = response.datas.permissions;
        if (permissions) {
          try {
            const permissionArray = JSON.parse(permissions);
            setCheckedKeys(permissionArray);
          } catch (e) {
            setCheckedKeys([]);
          }
        }
      }
    } catch (error) {
      console.error('获取岗位权限失败:', error);
    }
  };

  // 构建树形数据
  const buildTreeData = (data: any[]): MenuNode[] => {
    const nodeMap = new Map();
    const result: MenuNode[] = [];

    // 先创建所有节点
    data.forEach(item => {
      nodeMap.set(item.id, {
        key: item.id.toString(),
        title: item.name,
        children: [],
      });
    });

    // 构建树形结构
    data.forEach(item => {
      const node = nodeMap.get(item.id);
      if (item.parent_id && nodeMap.has(item.parent_id)) {
        const parent = nodeMap.get(item.parent_id);
        parent.children.push(node);
      } else {
        result.push(node);
      }
    });

    return result;
  };

  // 保存权限配置
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      await updatePositionPermissions(positionId, JSON.stringify(checkedKeys));
      message.success('权限配置保存成功');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('保存权限配置失败:', error);
      message.error('保存权限配置失败');
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (visible && positionId) {
      fetchPermissionTree();
      fetchPositionPermissions();
    }
  }, [visible, positionId]);

  return (
    <Modal
      title={`配置岗位权限 - ${positionName}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          loading={saveLoading}
          onClick={handleSave}
        >
          保存
        </Button>,
      ]}
    >
      <Card title="菜单权限" size="small">
        <Spin spinning={loading}>
          <Tree
            checkable
            treeData={treeData}
            checkedKeys={checkedKeys}
            onCheck={(checked: any) => {
              setCheckedKeys(Array.isArray(checked) ? checked : checked.checked);
            }}
            style={{ minHeight: 400 }}
          />
        </Spin>
      </Card>
      
      <div style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
        <p>说明：</p>
        <ul>
          <li>选中的菜单权限将赋予该岗位的所有员工</li>
          <li>员工的最终权限为其岗位权限与个人权限的并集</li>
          <li>修改权限后需要员工重新登录才能生效</li>
        </ul>
      </div>
    </Modal>
  );
};

export default PositionPermissions; 