import React, { useState, useEffect, useRef } from 'react';
import {
  PageContainer,
  ProTable,
  ProColumns,
} from '@ant-design/pro-components';
import {
  Card,
  Tree,
  Row,
  Col,
  Button,
  Space,
  Input,
  message,
  Spin,
  Tag,
  Badge,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  ExpandAltOutlined,
  CompressOutlined,
  SearchOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { useLocation } from 'umi';
import * as departmentApi from '@/services/organization/department';
import DepartmentPositions from '../department/DepartmentPositions';
import './index.less';

const { Search } = Input;
const { Text } = Typography;

// 部门树节点接口
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

const DepartmentPositionsPage: React.FC = () => {
  const location = useLocation();
  const [treeData, setTreeData] = useState<DepartmentTreeNode[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const treeRef = useRef<any>(null);

  // 获取URL参数
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      deptId: searchParams.get('deptId'),
      deptName: searchParams.get('deptName'),
    };
  };

  // 加载部门树数据
  const loadDepartmentTree = async () => {
    setLoading(true);
    try {
      const response = await departmentApi.getDepartmentTree();
      console.log('部门树响应:', response);
      
      // 适配实际API响应格式：{datas: [...], resp_code: 0, resp_msg: ""}
      const isSuccess = response && (
        response.success === true || 
        (response.resp_code !== undefined && response.resp_code === 0)
      );
      
      if (isSuccess) {
        // 兼容两种数据格式
        const departments = response.data || response.datas || [];
        console.log('部门数据:', departments);
        
        const treeNodes = convertToTreeData(departments);
        console.log('转换后的树节点:', treeNodes);
        
        setTreeData(treeNodes);
        
        // 默认展开前两级
        const defaultExpandedKeys = getDefaultExpandedKeys(treeNodes, 2);
        setExpandedKeys(defaultExpandedKeys);
        
        // 检查URL参数，自动选中指定部门
        const { deptId } = getUrlParams();
        if (deptId) {
          // 延迟执行，确保树组件已渲染
          setTimeout(() => {
            autoSelectDepartment(deptId, treeNodes);
          }, 100);
        }
        
        if (departments.length === 0) {
          message.info('暂无部门数据');
        } else {
          message.success(`成功加载 ${departments.length} 个部门`);
        }
      } else {
        const errorMsg = response?.message || response?.resp_msg || '加载部门树失败';
        console.error('部门树响应错误:', errorMsg);
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('加载部门树失败:', error);
      message.error('加载部门树失败');
    } finally {
      setLoading(false);
    }
  };

  // 转换数据格式
  const convertToTreeData = (departments: any[]): DepartmentTreeNode[] => {
    return departments.map(dept => ({
      key: dept.id,
      id: dept.id,
      parentId: dept.parentId || '0',
      name: dept.name,
      depNo: dept.depNo,
      directorId: dept.directorId,
      directorName: dept.directorName,
      employeeCount: dept.employeeCount || 0,
      childrenCount: dept.children?.length || 0,
      isFiliale: dept.isFiliale,
      isHalfLevel: dept.isHalfLevel,
      status: dept.status,
      title: renderTreeNodeTitle(dept),
      children: dept.children ? convertToTreeData(dept.children) : undefined,
    }));
  };

  // 渲染树节点标题
  const renderTreeNodeTitle = (dept: any) => (
    <div className="tree-node-title">
      <div className="dept-info">
        <Text strong>{dept.name}</Text>
        {dept.depNo && (
          <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
            [{dept.depNo}]
          </Text>
        )}
      </div>
      <div className="dept-meta">
        {dept.directorName && (
          <Tag color="blue">
            负责人: {dept.directorName}
          </Tag>
        )}
        <Badge count={dept.employeeCount || 0} showZero color="#52c41a" />
        {dept.status === 0 && <Tag color="red">禁用</Tag>}
      </div>
    </div>
  );

  // 获取默认展开的节点
  const getDefaultExpandedKeys = (treeData: DepartmentTreeNode[], maxLevel: number): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodes: DepartmentTreeNode[], level: number) => {
      if (level >= maxLevel) return;
      nodes.forEach(node => {
        keys.push(node.key);
        if (node.children) {
          traverse(node.children, level + 1);
        }
      });
    };
    traverse(treeData, 0);
    return keys;
  };

  // 处理树节点展开
  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  // 处理树节点选择
  const onSelect = (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);
    console.log('选中部门:', selectedKeys, info);
  };

  // 处理搜索
  const onSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      const matchedKeys = searchTree(treeData, value);
      setExpandedKeys(matchedKeys);
      setAutoExpandParent(true);
    }
  };

  // 搜索树节点
  const searchTree = (tree: DepartmentTreeNode[], searchValue: string): React.Key[] => {
    const expandedKeys: React.Key[] = [];
    const traverse = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach(node => {
        if (node.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            node.depNo?.toLowerCase().includes(searchValue.toLowerCase())) {
          expandedKeys.push(node.key);
          // 展开父节点
          let parent = getParentKey(node.key, tree);
          while (parent) {
            expandedKeys.push(parent);
            parent = getParentKey(parent, tree);
          }
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(tree);
    return expandedKeys;
  };

  // 获取父节点key
  const getParentKey = (key: React.Key, tree: DepartmentTreeNode[]): React.Key => {
    let parentKey: React.Key = '';
    const traverse = (nodes: DepartmentTreeNode[], parent?: DepartmentTreeNode) => {
      nodes.forEach(node => {
        if (node.key === key && parent) {
          parentKey = parent.key;
          return;
        }
        if (node.children) {
          traverse(node.children, node);
        }
      });
    };
    traverse(tree);
    return parentKey;
  };

  // 处理全部展开
  const handleExpandAll = () => {
    const getAllKeys = (nodes: DepartmentTreeNode[]): React.Key[] => {
      let keys: React.Key[] = [];
      nodes.forEach(node => {
        keys.push(node.key);
        if (node.children) {
          keys = keys.concat(getAllKeys(node.children));
        }
      });
      return keys;
    };
    setExpandedKeys(getAllKeys(treeData));
  };

  // 处理全部折叠
  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };

  // 自动选中指定部门并展开路径
  const autoSelectDepartment = (deptId: string, treeNodes: DepartmentTreeNode[]) => {
    if (!deptId || !treeNodes.length) return;

    // 找到目标部门
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

    const targetDept = findDept(treeNodes, deptId);
    if (!targetDept) {
      console.warn('未找到指定部门:', deptId);
      return;
    }

    // 获取从根节点到目标节点的路径
    const getPathToNode = (nodes: DepartmentTreeNode[], targetId: string, path: React.Key[] = []): React.Key[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.key];
        if (node.id === targetId) {
          return currentPath;
        }
        if (node.children) {
          const result = getPathToNode(node.children, targetId, currentPath);
          if (result) return result;
        }
      }
      return null;
    };

    const pathToTarget = getPathToNode(treeNodes, deptId);
    if (pathToTarget) {
      // 展开路径上的所有节点（除了目标节点本身）
      const expandKeys = pathToTarget.slice(0, -1);
      setExpandedKeys(prev => [...new Set([...prev, ...expandKeys])]);
      
      // 选中目标节点
      setSelectedKeys([deptId]);
      setAutoExpandParent(true);

      console.log('自动选中部门:', targetDept.name, '路径:', pathToTarget);
      message.success(`已定位到部门：${targetDept.name}`);
    }
  };

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

  // 初始化加载
  useEffect(() => {
    loadDepartmentTree();
  }, []);

  // 获取页面标题
  const getPageTitle = () => {
    const { deptName } = getUrlParams();
    if (deptName) {
      return `部门岗位管理 - ${decodeURIComponent(deptName)}`;
    }
    return "部门岗位管理";
  };

  return (
    <PageContainer
      title={getPageTitle()}
      content="统一管理各部门的岗位配置，支持岗位的增删改查和权限配置"
    >
      <Row gutter={16} style={{ height: 'calc(100vh - 200px)' }}>
        {/* 左侧：部门树 */}
        <Col span={8}>
          <Card 
            title="部门结构" 
            size="small"
            style={{ height: '100%' }}
            bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
            extra={
              <Space size="small">
                <Tooltip title="刷新">
                  <Button size="small" icon={<ReloadOutlined />} onClick={loadDepartmentTree} />
                </Tooltip>
                <Tooltip title="全部展开">
                  <Button size="small" icon={<ExpandAltOutlined />} onClick={handleExpandAll} />
                </Tooltip>
                <Tooltip title="全部折叠">
                  <Button size="small" icon={<CompressOutlined />} onClick={handleCollapseAll} />
                </Tooltip>
              </Space>
            }
          >
            {/* 搜索框 */}
            <Search
              placeholder="搜索部门名称或编号"
              allowClear
              size="small"
              style={{ marginBottom: 16 }}
              onSearch={onSearch}
              prefix={<SearchOutlined />}
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
          {selectedDepartment ? (
            <DepartmentPositions
              departmentId={selectedDepartment.id}
              departmentName={selectedDepartment.name}
            />
          ) : (
            <Card style={{ height: '100%' }}>
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                <ApartmentOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <Text type="secondary" style={{ fontSize: 16 }}>
                  请从左侧选择部门查看岗位信息
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DepartmentPositionsPage; 