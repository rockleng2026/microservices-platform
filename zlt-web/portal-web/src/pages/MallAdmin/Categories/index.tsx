/**
 * 分类管理页面 - ADMIN-02-07
 * Tree display with parent-child hierarchy
 */
import React, { useState, useRef, useCallback } from 'react';
import { Button, message, Modal, Form, Input, Select, Space, Tree } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  AdminCategoryDTO,
} from './services/categories';

const { confirm } = Modal;

const CategoriesPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryDTO | null>(null);
  const [form] = Form.useForm();
  const [categoryData, setCategoryData] = useState<AdminCategoryDTO[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategoryDTO | null>(null);

  // Convert flat list to tree structure
  const buildTree = (categories: AdminCategoryDTO[]): DataNode[] => {
    return categories.map(cat => ({
      key: cat.id,
      title: cat.name,
      data: cat,
      children: cat.children && cat.children.length > 0 ? buildTree(cat.children) : undefined,
    }));
  };

  // Fetch category list
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategoryList();
      setCategoryData(data || []);
      // Auto expand first level
      const firstLevelKeys = (data || []).filter(c => c.parentId === 0 || c.parentId === null).map(c => c.id);
      setExpandedKeys(firstLevelKeys.map(k => String(k)));
      return data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('加载分类列表失败');
      return [];
    }
  }, []);

  // Load categories on mount
  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle tree node click
  const handleNodeClick = (selectedKeys: React.Key[], info: { node: DataNode }) => {
    const data = info.node.data as AdminCategoryDTO;
    setSelectedCategory(data);
  };

  // Handle create - select parent from tree or default to top-level
  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    // Default to no parent (top-level)
    form.setFieldsValue({ parentId: 0 });
    setModalVisible(true);
  };

  // Handle edit
  const handleEdit = () => {
    if (!selectedCategory) {
      message.warning('请先选择要编辑的分类');
      return;
    }
    setEditingCategory(selectedCategory);
    form.setFieldsValue({
      name: selectedCategory.name,
      parentId: selectedCategory.parentId || 0,
      sort: selectedCategory.sort,
    });
    setModalVisible(true);
  };

  // Handle delete
  const handleDelete = () => {
    if (!selectedCategory) {
      message.warning('请先选择要删除的分类');
      return;
    }
    confirm({
      title: '确认删除',
      content: `确定要删除分类「${selectedCategory.name}」吗？${selectedCategory.children && selectedCategory.children.length > 0 ? '（包含子分类，将一并删除）' : ''}`,
      async onOk() {
        try {
          await deleteCategory(selectedCategory!.id);
          message.success('删除成功');
          fetchCategories();
          setSelectedCategory(null);
        } catch (error) {
          console.error('Delete failed:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const isEdit = !!editingCategory?.id;
      // Convert 0 parentId to null for top-level
      const parentId = values.parentId === 0 ? null : values.parentId;

      let success = false;
      if (isEdit && editingCategory) {
        success = await updateCategory({
          id: editingCategory.id,
          name: values.name,
          parentId: parentId,
          sort: values.sort,
        });
      } else {
        success = await createCategory({
          name: values.name,
          parentId: parentId,
          sort: values.sort,
        });
      }

      if (success) {
        message.success(isEdit ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  // Get parent options for select (exclude current editing node and its children)
  const getParentOptions = (): { label: string; value: number }[] => {
    const options: { label: string; value: number }[] = [
      { label: '顶级分类（无父分类）', value: 0 },
    ];

    const addOptions = (categories: AdminCategoryDTO[], depth = 0) => {
      for (const cat of categories) {
        // Skip current editing category
        if (editingCategory && cat.id === editingCategory.id) continue;
        const prefix = depth > 0 ? '└─ '.padStart(depth * 2 + 3, '　') : '';
        options.push({ label: `${prefix}${cat.name}`, value: cat.id });
        if (cat.children && cat.children.length > 0) {
          addOptions(cat.children, depth + 1);
        }
      }
    };

    addOptions(categoryData);
    return options;
  };

  // Build tree data
  const treeData = buildTree(categoryData);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建分类
          </Button>
          <Button icon={<EditOutlined />} onClick={handleEdit} disabled={!selectedCategory}>
            编辑
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete} disabled={!selectedCategory}>
            删除
          </Button>
        </Space>
        {selectedCategory && (
          <span style={{ marginLeft: 16, color: '#666' }}>
            当前选中: <strong>{selectedCategory.name}</strong>
            {selectedCategory.parentId ? ` (子分类)` : ` (顶级分类)`}
          </span>
        )}
      </div>

      <Tree
        treeData={treeData}
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys)}
        onSelect={handleNodeClick}
        selectedKeys={selectedCategory ? [String(selectedCategory.id)] : []}
        showLine={{ showLeafIcon: false }}
        style={{ background: '#fff', minHeight: 400, padding: 16 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="父分类"
            tooltip="选择上级分类，留在顶级分类则创建顶级分类"
          >
            <Select
              placeholder="选择父分类（默认顶级分类）"
              options={getParentOptions()}
            />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序号"
          >
            <Input type="number" placeholder="数值越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;