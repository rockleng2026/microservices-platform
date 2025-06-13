import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tree,
  Button,
  Space,
  Input,
  Tooltip,
  Tag,
  Divider,
  message,
  Popconfirm,
  Badge,
  Spin,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  UserOutlined,
  SettingOutlined,
  CopyOutlined,
  ExpandOutlined,
  CompressOutlined,
  TeamOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { 
  getDepartmentTree, 
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentDetail,
  updateDepartmentStatus,
  copyDepartmentStructure
} from '@/services/organization/department';

import DepartmentForm from './components/DepartmentForm';
import DepartmentDetail from './components/DepartmentDetail';


const { Search } = Input;

// 添加CSS样式
const treeNodeStyle = `
.tree-item-content:hover .tree-actions {
  display: flex !important;
}

.tree-item-content {
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tree-item-content:hover {
  background-color: #f5f5f5;
}

.ant-tree-node-content-wrapper:hover {
  background-color: transparent !important;
}

.dept-tree-panel .ant-tree .ant-tree-treenode {
  padding: 2px 0;
}

.dept-tree-panel .ant-tree .ant-tree-node-content-wrapper {
  border-radius: 4px;
  padding: 4px 8px;
  transition: all 0.2s;
}

.dept-tree-panel .ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
  background-color: rgba(24, 144, 255, 0.1) !important;
}
`;

interface DepartmentNode extends DataNode {
  id: string;
  name: string;
  parentId: string;
  depNo: string;
  directorId?: string;
  directorName?: string;
  employeeCount: number;
  positionCount: number;
  status: number;
  gradeId: number;
  gradeName: string;
  children?: DepartmentNode[];
}

interface Department {
  id: string;
  name: string;
  parentId: string;
  depNo: string;
  directorId?: string;
  gradeId: number;
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

  // 生成等级名称的工具函数
  const getGradeName = (gradeId: number | null | undefined, level: number | null | undefined): string => {
    // 优先使用gradeId，其次使用level，最后默认1
    const grade = gradeId ?? level ?? 1;
    console.log(`生成等级名称: gradeId=${gradeId}, level=${level}, 最终等级=${grade}`);
    return `${grade}级部门`;
  };

  const DepartmentManagement: React.FC = () => {
  const [treeData, setTreeData] = useState<DepartmentNode[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 表单相关状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState<'add' | 'edit' | 'copy'>('add');
  const [showEditForm, setShowEditForm] = useState(false);
  const [addParentDept, setAddParentDept] = useState<DepartmentNode | null>(null); // 新增时的父部门信息


  // 加载部门树
  const loadDepartmentTree = async (includeDisabled = false) => {
    setLoading(true);
    try {
      console.log('开始加载部门树...');
      const response = await getDepartmentTree({ includeDisabled });
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
        
        const treeNodes = convertToTreeNodes(departments);
        console.log('转换后的树节点:', treeNodes);
        
        setTreeData(treeNodes);
        
        // 默认展开第一级
        if (treeNodes.length > 0) {
          setExpandedKeys(treeNodes.map(node => node.key));
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
      console.error('加载部门树异常:', error);
      message.error('网络请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 转换为Tree组件需要的数据格式
  const convertToTreeNodes = (departments: any[]): DepartmentNode[] => {
    return departments.map(dept => {
      // 确保ID作为字符串处理，防止精度丢失
      const deptId = typeof dept.id === 'string' ? dept.id : String(dept.id);
      const parentId = dept.parentId ? (typeof dept.parentId === 'string' ? dept.parentId : String(dept.parentId)) : '0';
      const directorId = dept.directorId ? (typeof dept.directorId === 'string' ? dept.directorId : String(dept.directorId)) : undefined;
      
      // 调试等级信息
      console.log(`转换部门 ${dept.name}: gradeId=${dept.gradeId}, level=${dept.level}`);
      
      return {
        key: deptId,
        title: renderTreeNodeTitle(dept),
        id: deptId,
        name: dept.name,
        parentId: parentId,
        depNo: dept.depNo,
        directorId: directorId,
        directorName: dept.directorName,
                  employeeCount: dept.employeeCount || 0,
          positionCount: dept.positionCount || 0,
          status: dept.status,
          gradeId: dept.gradeId ?? dept.level ?? 1,
                      gradeName: getGradeName(dept.gradeId, dept.level),
        children: dept.children ? convertToTreeNodes(dept.children) : undefined,
        isLeaf: !dept.children || dept.children.length === 0
      };
    });
  };

  // 渲染树节点标题 - 按照原型设计
  const renderTreeNodeTitle = (dept: any) => (
    <div className="tree-item-content" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      width: '100%',
      padding: '4px 8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <ApartmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        <span style={{ fontWeight: 500, marginRight: 8 }}>{dept.name}</span>
        <Tag color={dept.status === 1 ? 'green' : 'red'}>
          {dept.status === 1 ? '正常' : '禁用'}
        </Tag>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#999' }}>({dept.employeeCount}人)</span>
        <div className="tree-actions" style={{ display: 'none', gap: 4 }}>
          <Tooltip title="新增子部门">
            <Button 
              type="text" 
              size="small" 
              icon={<PlusOutlined />}
              onClick={(e) => handleAddSubDept(dept.id, e)}
            />
          </Tooltip>
          <Tooltip title="编辑部门">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={(e) => handleEditFromTree(dept.id, e)}
            />
          </Tooltip>
          <Tooltip title="删除部门">
            <Popconfirm
              title="确定要删除这个部门吗？"
              onConfirm={() => handleDeleteFromTree(dept.id, undefined)}
            >
              <Button 
                type="text" 
                size="small" 
                icon={<DeleteOutlined />}
                danger
                onClick={(e: any) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  // 树节点选择
  const onSelectTreeNode = async (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);
    setShowEditForm(false); // 切换选择时隐藏编辑表单
    setModalType('add'); // 重置为新增模式
    if (selectedKeys.length > 0) {
      const deptId = selectedKeys[0] as string;
      await loadDepartmentDetail(deptId);
    } else {
      setSelectedDept(null);
    }
  };

  // 加载部门详情
  const loadDepartmentDetail = async (id: string) => {
    try {
      const response = await getDepartmentDetail(id);
      
      // 适配实际API响应格式
      const isSuccess = response && (
        response.success === true || 
        (response.resp_code !== undefined && response.resp_code === 0)
      );
      
      if (isSuccess) {
        // 兼容两种数据格式
        const departmentData = response.data || response.datas;
        
        // 补充缺失的字段，确保ID精度不丢失
        const deptId = typeof departmentData.id === 'string' ? departmentData.id : String(departmentData.id);
        const parentId = departmentData.parentId ? (typeof departmentData.parentId === 'string' ? departmentData.parentId : String(departmentData.parentId)) : '0';
        const directorId = departmentData.directorId ? (typeof departmentData.directorId === 'string' ? departmentData.directorId : String(departmentData.directorId)) : undefined;
        
        const dept = {
          ...departmentData,
          id: deptId,
          parentId: parentId,
          directorId: directorId,
          gradeId: departmentData.gradeId ?? departmentData.level ?? 1,
                      gradeName: getGradeName(departmentData.gradeId, departmentData.level),
          employeeCount: departmentData.employeeCount || 0,
          positionCount: departmentData.positionCount || 0,
          parentName: departmentData.parentName || (departmentData.parentId === 0 ? '无' : ''),
          path: departmentData.departmentPath || departmentData.name,
          createdAt: departmentData.createdAt,
          updatedAt: departmentData.updatedAt
        };
        
        setSelectedDept(dept);
      } else {
        const errorMsg = response?.message || response?.resp_msg || '获取部门详情失败';
        message.error(errorMsg);
      }
    } catch (error) {
      message.error('获取部门详情失败');
      console.error('Load department detail error:', error);
    }
  };

  // 处理新增（树节点操作）
  const handleAddSubDept = (parentId: string, e: any) => {
    e.stopPropagation();
    
    // 找到父部门信息
    const findDeptById = (nodes: DepartmentNode[], id: string): DepartmentNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findDeptById(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const parentDept = findDeptById(treeData, parentId);
    setModalType('add');
    setModalTitle(`新增子部门 - 上级：${parentDept?.name || '未知'}`);
    setAddParentDept(parentDept); // 保存父部门信息
    setModalVisible(true);
  };

  // 处理编辑（树节点操作）
  const handleEditFromTree = (deptId: string, e: any) => {
    e.stopPropagation();
    // 设置为编辑模式并显示编辑表单
    setModalType('edit');
    setShowEditForm(true);
    console.log('从树节点编辑部门，设置modalType为edit');
  };

  // 处理删除（树节点操作）
  const handleDeleteFromTree = async (deptId: string, e: any) => {
    e?.stopPropagation();
    try {
      console.log('开始删除部门 - ID:', deptId);
      const response = await deleteDepartment(deptId);
      console.log('删除部门API响应:', response);
      
      // 适配API响应格式：{datas: boolean, resp_code: 0, resp_msg: ""}
      const isSuccess = response && (
        response.success === true || 
        (response.resp_code !== undefined && response.resp_code === 0)
      );
      
      if (isSuccess) {
        message.success('删除成功');
        loadDepartmentTree();
        if (selectedDept?.id === deptId) {
          setSelectedDept(null);
          setSelectedKeys([]);
        }
      } else {
        const errorMsg = response?.message || response?.resp_msg || '删除失败';
        console.error('删除失败原因:', errorMsg);
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('删除部门异常:', error);
      message.error('删除失败：网络请求异常');
    }
  };

  // 处理新增（详情面板操作）
  const handleAdd = () => {
    setModalType('add');
    setModalTitle('新增部门');
    setAddParentDept(null); // 清空父部门信息
    setModalVisible(true);
  };

  // 处理编辑（详情面板操作）
  const handleEdit = () => {
    // 设置为编辑模式并显示编辑表单
    setModalType('edit');
    setShowEditForm(true);
    console.log('从详情面板编辑部门，设置modalType为edit');
  };

  // 处理岗位管理
  const handleManagePositions = () => {
    if (!selectedDept) {
      message.warning('请先选择部门');
      return;
    }
    // 跳转到部门岗位页面，并传递部门ID参数
    window.location.href = `/organization/departments/positions?deptId=${selectedDept.id}&deptName=${encodeURIComponent(selectedDept.name)}`;
  };

  // 处理人员管理
  const handleManagePersonnel = () => {
    message.info('人员管理功能开发中');
  };

  // 处理状态切换
  const handleToggleStatus = async (status: number) => {
    if (!selectedDept) {
      message.warning('请先选择部门');
      return;
    }
    
    try {
      const response = await updateDepartmentStatus(selectedDept.id, status);
      if (response.success) {
        message.success(`${status === 1 ? '启用' : '禁用'}成功`);
        loadDepartmentTree();
        loadDepartmentDetail(selectedDept.id);
      } else {
        message.error(response.message || `${status === 1 ? '启用' : '禁用'}失败`);
      }
    } catch (error) {
      message.error(`${status === 1 ? '启用' : '禁用'}失败`);
      console.error('Toggle status error:', error);
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (values: any) => {
    try {
      let response;
      
              console.log('提交表单数据:', { modalType, values, selectedDept });
        console.log('当前操作类型:', modalType === 'edit' ? '编辑现有部门' : '新增部门');
      
              const submitData = {
          ...values,
          status: values.status || 0  // 确保状态值正确传递
        };
        
        // 根据modalType设置正确的操作类型
        if (modalType === 'edit' && selectedDept) {
          // 编辑操作 - 保持ID为字符串格式避免精度丢失
          submitData.id = selectedDept.id; // 直接使用字符串ID，不转换为数字
          submitData.operationType = 'edit'; // 明确标识这是编辑操作
          console.log('编辑部门，传递ID:', submitData.id, '(字符串格式)', '操作类型:', submitData.operationType);
        } else {
          // 新增或复制操作都视为新增
          submitData.operationType = 'add'; // 明确标识这是新增操作
          console.log('新增/复制部门，操作类型:', submitData.operationType);
        }
        
        // 再次确认操作类型设置正确
        console.log('最终提交数据:', {
          modalType,
          operationType: submitData.operationType,
          id: submitData.id,
          name: submitData.name,
          depNo: submitData.depNo
        });
        
        if (modalType === 'copy') {
          response = await copyDepartmentStructure(values.sourceId, values.parentId || '0');
        } else if (modalType === 'add') {
          response = await createDepartment(submitData);
        } else if (modalType === 'edit') {
          response = await updateDepartment(submitData);
        }
      
      console.log('API响应:', response);
      
      // 适配API响应格式
      const isSuccess = response && (
        response.success === true || 
        (response.resp_code !== undefined && response.resp_code === 0)
      );
      
      if (isSuccess) {
        const actionText = modalType === 'add' ? '新增' : modalType === 'edit' ? '更新' : '复制';
        message.success(`${actionText}成功`);
        setModalVisible(false);
        setShowEditForm(false);
        setModalType('add'); // 重置为新增模式
        loadDepartmentTree();
        if (modalType === 'edit' && selectedDept) {
          loadDepartmentDetail(selectedDept.id);
        }
      } else {
        const errorMsg = response?.message || response?.resp_msg;
        console.error('API调用失败:', errorMsg);
        
        // 特殊处理部门编号重复的情况
        if (modalType === 'edit' && errorMsg && errorMsg.includes('部门编号已存在')) {
          message.warning({
            content: (
              <div>
                <div>部门编号验证异常：后端可能未正确排除当前部门</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  建议：1) 联系系统管理员修复验证逻辑，或 2) 临时修改部门编号
                </div>
              </div>
            ),
            duration: 6
          });
        } else if (modalType === 'edit') {
          message.error('部门编辑失败：' + (errorMsg || '未知错误'));
        } else {
          const actionText = modalType === 'add' ? '新增' : '复制';
          message.error(`${actionText}失败：` + (errorMsg || '未知错误'));
        }
      }
    } catch (error) {
      console.error('Form submit error:', error);
      if (modalType === 'edit') {
        message.error('部门编辑失败：网络请求异常');
      } else {
        const actionText = modalType === 'add' ? '新增' : '复制';
        message.error(`${actionText}失败：网络请求异常`);
      }
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      message.info('搜索功能开发中');
    } else {
      loadDepartmentTree();
    }
  };

  // 展开/折叠所有
  const handleExpandAll = () => {
    const getAllKeys = (nodes: DepartmentNode[]): React.Key[] => {
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

  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };



  // 初始化加载
  useEffect(() => {
    loadDepartmentTree();
  }, []);

  return (
    <>
      {/* 注入CSS样式 */}
      <style dangerouslySetInnerHTML={{ __html: treeNodeStyle }} />
      
      <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>部门管理</h2>
          <div style={{ color: '#666', fontSize: '14px', marginTop: 4 }}>
            组织管理 / 部门管理
          </div>
        </div>

        {/* 主要内容区域 - 左右分栏布局 */}
        <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 120px)' }}>
          {/* 左侧部门树面板 */}
          <div className="dept-tree-panel" style={{ width: 400, background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {/* 树面板标题和操作 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>部门结构</h3>
              <Space>
                <Tooltip title="刷新">
                  <Button size="small" icon={<ReloadOutlined />} onClick={() => loadDepartmentTree()} />
                </Tooltip>
                <Tooltip title="展开全部">
                  <Button size="small" icon={<ExpandOutlined />} onClick={handleExpandAll} />
                </Tooltip>
                <Tooltip title="折叠全部">
                  <Button size="small" icon={<CompressOutlined />} onClick={handleCollapseAll} />
                </Tooltip>
                <Button size="small" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新增
                </Button>
              </Space>
            </div>

            {/* 搜索框 */}
            <div style={{ marginBottom: 16 }}>
              <Search
                placeholder="搜索部门"
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </div>
            
            {/* 部门树 */}
            <div style={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
              <Spin spinning={loading}>
                <Tree
                  treeData={treeData}
                  selectedKeys={selectedKeys}
                  expandedKeys={expandedKeys}
                  onSelect={onSelectTreeNode}
                  onExpand={setExpandedKeys}
                  showLine={{ showLeafIcon: false }}
                  blockNode
                  style={{
                    backgroundColor: 'transparent'
                  }}
                />
              </Spin>
            </div>
          </div>
          
          {/* 右侧详情面板 */}
          <div style={{ flex: 1, background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {selectedDept ? (
              <>
                {!showEditForm ? (
                  /* 部门详情视图 */
                  <>
                    {/* 详情面板标题和操作 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>{selectedDept.name}</h3>
                      <Space>
                        <Button icon={<EditOutlined />} onClick={handleEdit}>
                          编辑
                        </Button>
                        <Button icon={<TeamOutlined />} onClick={handleManagePositions}>
                          岗位管理
                        </Button>
                        <Button icon={<UsergroupAddOutlined />} onClick={handleManagePersonnel}>
                          人员管理
                        </Button>
                        <Button 
                          type={selectedDept.status === 1 ? 'default' : 'primary'}
                          onClick={() => handleToggleStatus(selectedDept.status === 1 ? 0 : 1)}
                        >
                          {selectedDept.status === 1 ? '禁用' : '启用'}
                        </Button>
                      </Space>
                    </div>

                    {/* 统计卡片 */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="在职员工"
                            value={selectedDept.employeeCount}
                            suffix="人"
                            valueStyle={{ color: '#3f8600' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="岗位数量"
                            value={selectedDept.positionCount}
                            suffix="个"
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="部门等级"
                            value={selectedDept.gradeId}
                            suffix="级"
                            valueStyle={{ color: '#722ed1' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="状态"
                            value={selectedDept.status === 1 ? '正常' : '禁用'}
                            valueStyle={{ color: selectedDept.status === 1 ? '#3f8600' : '#cf1322' }}
                          />
                        </Card>
                      </Col>
                    </Row>

                    {/* 部门详情组件 */}
                    <DepartmentDetail 
                      department={selectedDept}
                      onRefresh={() => loadDepartmentDetail(selectedDept.id)}
                    />
                  </>
                ) : (
                  /* 部门编辑表单 */
                  <DepartmentForm
                    open={true}
                    title="编辑部门"
                    type="edit"
                    initialValues={selectedDept}
                    onCancel={() => {
            setShowEditForm(false);
            setModalType('add'); // 重置为新增模式
          }}
                    onSubmit={handleFormSubmit}
                    treeData={treeData}
                  />
                )}
              </>
            ) : (
              /* 空状态 */
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                <ApartmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>请从左侧选择部门查看详情</div>
              </div>
            )}
          </div>
        </div>

        {/* 部门表单弹窗 */}
        <DepartmentForm
          open={modalVisible}
          title={modalTitle}
          type={modalType}
          initialValues={modalType === 'edit' ? selectedDept : undefined}
          parentDeptInfo={modalType === 'add' ? addParentDept : undefined}
          onCancel={() => {
            setModalVisible(false);
            setAddParentDept(null); // 清空父部门信息
          }}
          onSubmit={handleFormSubmit}
          treeData={treeData}
        />
      </div>
    </>
  );
};

export default DepartmentManagement; 