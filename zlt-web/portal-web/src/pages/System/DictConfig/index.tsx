import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Card,
  Tree,
  Button,
  Space,
  Input,
  message,
  Spin,
  Empty,
  Tooltip,
  Popconfirm,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  BookOutlined,
} from '@ant-design/icons';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { DictCategory, getDictCategories, deleteDictCategory, updateDictCategoryStatus } from '@/services/system';
import CategoryModal from './components/CategoryModal';
import ItemManager from './components/ItemManager';
import './index.less';

const { Sider, Content } = Layout;
const { Search } = Input;

interface CategoryTreeNode extends DataNode {
  category: DictCategory;
  isLeaf: true;
}

/**
 * 通用字典配置页面
 */
const DictConfig: React.FC = () => {
  // 状态管理
  const [categories, setCategories] = useState<DictCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DictCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DictCategory | null>(null);
  
  // 缓存引用
  const categoriesCache = useRef<Map<string, DictCategory>>(new Map());

  // 加载类目列表
  const loadCategories = async (search?: string) => {
    setLoading(true);
    try {
      const response = await getDictCategories({
        page: 1,
        size: 1000,
        categoryName: search,
      });
      
      const categoryList: any[] = response.data || [];
      
      // 转换字段名称以匹配前端接口
      const mappedCategoryList = categoryList.map((item: any) => ({
        id: item.id.toString(),
        categoryCode: item.code || item.categoryCode,
        categoryName: item.name || item.categoryName,
        description: item.description,
        sort: item.sortOrder || item.sort || 0,
        enabled: item.status === 1 || item.enabled === true,
        extendSchema: item.extendFields || item.extendSchema || [],
        createTime: item.createTime || item.createdAt,
        updateTime: item.updateTime || item.updatedAt,
      }));
      
      setCategories(mappedCategoryList);
      
      // 更新缓存
      categoriesCache.current.clear();
      mappedCategoryList.forEach((cat: any) => {
        categoriesCache.current.set(cat.id.toString(), cat);
      });
      
      // 如果当前选中的类目被删除了，清空选中状态
      if (selectedCategory && !mappedCategoryList.find((c: any) => c.id === selectedCategory.id)) {
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('加载字典类目失败:', error);
      message.error('加载字典类目失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadCategories();
  }, []);

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    loadCategories(value);
  };

  // 转换为树节点
  const buildTreeData = (): CategoryTreeNode[] => {
    return categories
      .filter(category => 
        !searchKeyword || 
        category.categoryName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        category.categoryCode.toLowerCase().includes(searchKeyword.toLowerCase())
      )
      .sort((a, b) => a.sort - b.sort)
      .map(category => ({
        key: category.id.toString(),
        title: (
          <div className="category-tree-node">
            <div className="node-content">
              <BookOutlined className="node-icon" />
              <div className="node-text">
                <div className="node-name">{category.categoryName}</div>
                <div className="node-code">{category.categoryCode}</div>
              </div>
            </div>
            <div className="node-actions">
              <Space size="small">
                <Badge 
                  status={category.enabled ? 'success' : 'default'} 
                  title={category.enabled ? '已启用' : '已禁用'}
                />
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category);
                    }}
                  />
                </Tooltip>
                <Tooltip title={category.enabled ? '禁用' : '启用'}>
                  <Button
                    type="text"
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCategoryStatus(category);
                    }}
                  />
                </Tooltip>
                <Popconfirm
                  title="确认删除此类目吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDeleteCategory(category);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </Space>
            </div>
          </div>
        ),
        category,
        isLeaf: true,
      }));
  };

  // 处理树节点选择
  const handleTreeSelect: TreeProps['onSelect'] = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      const key = selectedKeys[0] as string;
      const cat = categoriesCache.current.get(key);
      if (cat) {
        setSelectedCategory(cat);
      }
    }
  };

  // 新建类目
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryModalVisible(true);
  };

  // 编辑类目
  const handleEditCategory = (category: DictCategory) => {
    setEditingCategory(category);
    setCategoryModalVisible(true);
  };

  // 删除类目
  const handleDeleteCategory = async (category: DictCategory) => {
    try {
      await deleteDictCategory(category.id);
      message.success('删除成功');
      loadCategories();
    } catch (error) {
      console.error('删除类目失败:', error);
      message.error('删除失败');
    }
  };

  // 切换类目状态
  const handleToggleCategoryStatus = async (category: DictCategory) => {
    try {
      await updateDictCategoryStatus(category.id, !category.enabled);
      message.success(`${!category.enabled ? '启用' : '禁用'}成功`);
      loadCategories();
    } catch (error) {
      console.error('更新状态失败:', error);
      message.error('更新状态失败');
    }
  };

  // 类目保存成功回调
  const handleCategorySaved = () => {
    setCategoryModalVisible(false);
    setEditingCategory(null);
    loadCategories();
  };

  return (
    <div className="dict-config">
      <Layout className="dict-layout">
        {/* 左侧类目导航 */}
        <Sider width={320} className="dict-sider" theme="light">
          <Card 
            title={
              <div className="sider-header">
                <BookOutlined style={{ marginRight: 8 }} />
                字典类目
                <Badge 
                  count={categories.length} 
                  style={{ backgroundColor: '#1890ff', marginLeft: 8 }}
                />
              </div>
            }
            extra={
              <Space>
                <Tooltip title="刷新">
                  <Button 
                    type="text" 
                    icon={<ReloadOutlined />} 
                    onClick={() => loadCategories()}
                    loading={loading}
                  />
                </Tooltip>
                <Tooltip title="新建类目">
                  <Button 
                    type="text" 
                    icon={<PlusOutlined />} 
                    onClick={handleCreateCategory}
                  />
                </Tooltip>
              </Space>
            }
            className="category-card"
            bodyStyle={{ padding: '12px 0' }}
          >
            <div className="category-search">
              <Search
                placeholder="搜索类目名称或编码"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
                allowClear
              />
            </div>
            
            <div className="category-tree">
              <Spin spinning={loading}>
                {categories.length === 0 ? (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无字典类目"
                    style={{ margin: '40px 0' }}
                  >
                    <Button type="primary" onClick={handleCreateCategory}>
                      新建类目
                    </Button>
                  </Empty>
                ) : (
                  <Tree
                    treeData={buildTreeData()}
                    showLine
                    selectedKeys={selectedCategory ? [selectedCategory.id.toString()] : []}
                    onSelect={handleTreeSelect}
                  />
                )}
              </Spin>
            </div>
          </Card>
        </Sider>

        {/* 右侧内容区 */}
        <Content className="dict-content">
          {selectedCategory ? (
            <ItemManager 
              category={selectedCategory}
              onCategoryUpdate={() => loadCategories()}
            />
          ) : (
            <Card className="welcome-card">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <p>请在左侧选择一个字典类目</p>
                    <p style={{ color: '#999', fontSize: '14px' }}>
                      选择后可以查看和管理该类目下的字典明细项
                    </p>
                  </div>
                }
              >
                <Button type="primary" onClick={handleCreateCategory}>
                  新建字典类目
                </Button>
              </Empty>
            </Card>
          )}
        </Content>
      </Layout>

      {/* 类目编辑弹窗 */}
      <CategoryModal
        visible={categoryModalVisible}
        category={editingCategory}
        onSave={handleCategorySaved}
        onCancel={() => {
          setCategoryModalVisible(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
};

export default DictConfig; 