import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, Tabs, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, Select, Switch, message, Layout, TreeSelect } from 'antd';
import {
  SettingOutlined,
  ApartmentOutlined,
  UserOutlined,
  ContactsOutlined,
  SafetyOutlined,
  GlobalOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './index.less';
import { request } from '@/utils/request';
import { getDepartmentBonusList, addDepartmentBonus, updateDepartmentBonus, deleteDepartmentBonus } from '@/services/soo';
import { getDepartmentTree } from '@/services/organization';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;

const tabItems = [
  { key: 'department', label: '部门分红配置' },
  { key: 'jobLevel', label: '职级薪资标准' },
  { key: 'employee', label: '员工薪酬配置' },
  { key: 'social', label: '社保公积金基数' },
  { key: 'region', label: '地区工资系数' },
];

// 部门分红配置表格列
const departmentColumns = (onEdit: (record: any) => void, onDelete: (record: any) => void) => [
  { title: '部门名称', dataIndex: 'departmentName', key: 'departmentName' },
  { title: '分红权重(%)', dataIndex: 'bonusWeight', key: 'bonusWeight' },
  { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (val: number) => val === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
  {
    title: '操作', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>编辑</Button>
        <Button size="small" icon={<DeleteOutlined />} danger onClick={() => onDelete(record)}>删除</Button>
      </Space>
    ),
  },
];

const BaseConfig: React.FC = () => {
  // 权限点变量
  const canAdd = true;
  const canEdit = true;
  const canDelete = true;

  // 部门分红配置
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentPagination, setDepartmentPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [deleteRecord, setDeleteRecord] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [departmentTree, setDepartmentTree] = useState<any[]>([]);

  // 岗位薪资配置
  const [jobLevelData, setJobLevelData] = useState<any[]>([]);
  const [jobLevelLoading, setJobLevelLoading] = useState(false);
  const [jobLevelModalOpen, setJobLevelModalOpen] = useState(false);
  const [jobLevelEditing, setJobLevelEditing] = useState<any | null>(null);
  const [jobLevelForm] = Form.useForm();
  const [jobLevelDepartmentTree, setJobLevelDepartmentTree] = useState<any[]>([]);
  const [jobLevelPositionList, setJobLevelPositionList] = useState<any[]>([]);

  // 员工薪资配置
  const [employeeSalaryData, setEmployeeSalaryData] = useState<any[]>([]);
  const [employeeSalaryLoading, setEmployeeSalaryLoading] = useState(false);
  const [employeeSalaryModalOpen, setEmployeeSalaryModalOpen] = useState(false);
  const [employeeSalaryEditing, setEmployeeSalaryEditing] = useState<any | null>(null);
  const [employeeSalaryForm] = Form.useForm();
  const [employeeSalaryDepartmentTree, setEmployeeSalaryDepartmentTree] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState('department');

  // 加载部门分红配置数据
  const loadDepartmentData = async (page = 1, pageSize = 10, keyword = '') => {
    setDepartmentLoading(true);
    try {
      const res = await getDepartmentBonusList({
        pageNum: page,
        pageSize,
        departmentName: keyword || undefined,
      });
      if (res && res.success) {
        setDepartmentData(res.data.list || []);
        setDepartmentPagination({ current: page, pageSize, total: res.data.total || 0 });
      } else {
        message.error(res?.message || '获取数据失败');
      }
    } catch (e: any) {
      message.error(e.message || '获取数据失败');
    } finally {
      setDepartmentLoading(false);
    }
  };

  // 加载部门树
  const loadDepartmentTree = async () => {
    try {
      const res = await getDepartmentTree();
      console.log('部门树接口完整返回', res);
      console.log('res.datas:', res.datas, Array.isArray(res.datas));
      if (res && (res.data || res.datas)) {
        if (Array.isArray(res.data)) {
          setDepartmentTree(res.data);
        } else if (Array.isArray(res.datas)) {
          setDepartmentTree(res.datas);
        } else {
          setDepartmentTree([]);
        }
      } else {
        setDepartmentTree([]);
      }
    } catch (e) {
      setDepartmentTree([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'department') {
      loadDepartmentData();
    }
    loadDepartmentTree();
  }, [activeTab]);

  // 搜索
  const handleDepartmentSearch = (value: string) => {
    setDepartmentSearch(value);
    loadDepartmentData(1, departmentPagination.pageSize, value);
  };
  // 分页
  const handleDepartmentTableChange = (pag: any) => {
    loadDepartmentData(pag.current, pag.pageSize, departmentSearch);
  };
  // 新增
  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
    loadDepartmentTree();
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };
  // 编辑
  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setModalOpen(true);
    loadDepartmentTree();
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        departmentId: record.departmentId ? String(record.departmentId) : undefined,
        effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      });
    }, 0);
  };
  // 保存
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
        status: values.status ? 1 : 0,
      };
      let res;
      if (editingRecord) {
        res = await updateDepartmentBonus(editingRecord.id, submitData);
      } else {
        res = await addDepartmentBonus(submitData);
      }
      if (res && res.success) {
        message.success('保存成功');
        setModalOpen(false);
        loadDepartmentData(departmentPagination.current, departmentPagination.pageSize, departmentSearch);
      } else {
        message.error(res?.message || '保存失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '保存失败');
    }
  };
  // 取消弹窗
  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingRecord(null);
  };
  // 删除
  const handleDelete = (record: any) => {
    setDeleteRecord(record);
  };
  const handleDeleteOk = async () => {
    if (!deleteRecord) return;
    setDeleteLoading(true);
    try {
      const res = await deleteDepartmentBonus(deleteRecord.id);
      if (res && res.success) {
        message.success('删除成功');
        setDeleteRecord(null);
        loadDepartmentData(departmentPagination.current, departmentPagination.pageSize, departmentSearch);
      } else {
        message.error(res?.message || '删除失败');
      }
    } catch (e: any) {
      message.error(e.message || '删除失败');
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteRecord(null);
  };

  // 弹窗表单
  const renderModalForm = () => (
    <>
      <Form.Item name="departmentId" label="部门名称" rules={[{ required: true, message: '请选择部门' }]}> 
        <TreeSelect
          key={departmentTree.length}
          treeData={departmentTree}
          fieldNames={{ label: 'name', value: 'id', children: 'children' }}
          placeholder="请选择部门"
          allowClear
          showSearch
          treeDefaultExpandAll
          style={{ width: '100%' }}
          disabled={!!editingRecord}
        />
      </Form.Item>
      <Form.Item name="bonusWeight" label="分红权重(%)" rules={[{ required: true, message: '请输入分红权重' }]}> 
        <Input type="number" min={0} max={100} />
      </Form.Item>
      <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}> 
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="status" label="状态" valuePropName="checked"> 
        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
      </Form.Item>
    </>
  );

  // Tab内容渲染
  const renderTabContent = () => {
    if (activeTab === 'department') {
      return (
        <Card
          className="config-card"
          title="部门分红配置"
          extra={
            <Space>
              <Input.Search
                allowClear
                placeholder="搜索部门"
                style={{ width: 200 }}
                onSearch={handleDepartmentSearch}
              />
              {canAdd && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新增配置
                </Button>
              )}
            </Space>
          }
          bordered={false}
        >
          <Table
            columns={departmentColumns(handleEdit, handleDelete)}
            dataSource={departmentData}
            loading={departmentLoading}
            rowKey="id"
            pagination={departmentPagination}
            onChange={handleDepartmentTableChange}
            className="config-table"
          />
          <Modal
            open={modalOpen}
            title={editingRecord ? '编辑' : '新增'}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            destroyOnClose
            confirmLoading={departmentLoading}
          >
            <Form form={form} layout="vertical">
              {renderModalForm()}
            </Form>
          </Modal>
          <Modal
            open={!!deleteRecord}
            title="确认删除"
            onOk={handleDeleteOk}
            onCancel={handleDeleteCancel}
            okText="删除"
            okButtonProps={{ danger: true, loading: deleteLoading }}
          >
            <div>确定要删除该条数据吗？</div>
          </Modal>
        </Card>
      );
    }
    // 其他Tab保留原结构
    return (
      <Card className="config-card" bordered={false}>
        <div style={{ textAlign: 'center', color: '#999', padding: 48 }}>
          暂无数据
        </div>
      </Card>
    );
  };

  return (
    <Layout className="base-config-layout">
      <Layout>
        <Header className="base-config-header">
          <div className="breadcrumb">
            <span>盈策通决策平台</span>
            <span style={{ margin: '0 8px', color: '#d9d9d9' }}>/</span>
            <span>基础配置</span>
          </div>
          <div className="header-actions">
            <span>管理员</span>
          </div>
        </Header>
        <Content className="base-config-content">
          <div className="page-header">
            <Title level={3} style={{ margin: 0 }}>
              <SettingOutlined style={{ color: '#1890ff', marginRight: 12 }} />
              基础配置
            </Title>
          </div>
          <Tabs
            className="config-tabs"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems.map(tab => ({
              key: tab.key,
              label: (
                <>
                  {tab.key === 'department' && <ApartmentOutlined />}
                  {tab.key === 'jobLevel' && <UserOutlined />}
                  {tab.key === 'employee' && <ContactsOutlined />}
                  {tab.key === 'social' && <SafetyOutlined />}
                  {tab.key === 'region' && <GlobalOutlined />}
                  {tab.label}
                </>
              ),
            }))}
            tabBarGutter={2}
            tabBarStyle={{
              background: '#fff',
              borderRadius: 8,
              padding: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: 24,
            }}
          />
          <div className="config-content">{renderTabContent()}</div>
        </Content>
        <Footer className="base-config-footer">
          © 2024 Portal 3.0 - 企业管理平台. All rights reserved.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default BaseConfig; 