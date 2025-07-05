import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, Tabs, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, Select, Switch, message, Layout, TreeSelect, Tooltip } from 'antd';
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
  MessageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './index.less';
import { request } from '@/utils/request';
import { getDepartmentBonusList, addDepartmentBonus, updateDepartmentBonus, deleteDepartmentBonus } from '@/services/soo';
import { getDepartmentTree } from '@/services/organization';
import { getApiUrl } from '@/config/api';
import JobLevelSalary from './JobLevelSalary';
import DepartmentBonus from './DepartmentBonus';
import EmployeeSalary from './EmployeeSalary';
import SocialSecurityBase from './SocialSecurityBase';
import RegionSalaryFactor from './RegionSalaryFactor';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const tabItems = [
  { key: 'departmentBonus', label: '部门分红配置' },
  { key: 'jobLevelSalary', label: '职级薪资标准' },
  { key: 'employeeSalary', label: '员工薪酬配置' },
  { key: 'socialSecurityBase', label: '社保公积金基数' },
  { key: 'regionSalaryFactor', label: '地区工资系数' },
];

// 部门分红配置表格列
const departmentColumns = (onEdit: (record: any) => void, onDelete: (record: any) => void, onRemark: (record: any) => void) => [
  { title: '部门名称', dataIndex: 'departmentName', key: 'departmentName' },
  { title: '分红权重(%)', dataIndex: 'bonusWeight', key: 'bonusWeight' },
  { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (val: number) => val === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    render: (val: string) => val ? (
      <Tooltip title={val}><span style={{ cursor: 'pointer', color: '#1890ff' }}>备注</span></Tooltip>
    ) : <span>-</span>
  },
  {
    title: '操作', key: 'action', render: (_: any, record: any) => (
      <Space size={8}>
        <Button size="small" icon={<EditOutlined />} style={{ minWidth: 64, height: 32 }} onClick={() => onEdit(record)}>
          编辑
        </Button>
        <Button size="small" icon={<DeleteOutlined />} danger style={{ minWidth: 64, height: 32 }} onClick={() => onDelete(record)}>
          删除
        </Button>
        <Button size="small" icon={<MessageOutlined />} style={{ minWidth: 64, height: 32 }} onClick={() => onRemark(record)}>
          备注
        </Button>
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
  const [jobLevelPagination, setJobLevelPagination] = useState({ current: 1, pageSize: 10, total: 0 });
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

  const [activeTab, setActiveTab] = useState('departmentBonus');

  // 备注弹窗相关
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [remarkEditingRecord, setRemarkEditingRecord] = useState<any | null>(null);
  const [remarkForm] = Form.useForm();

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

  // 备注弹窗相关
  const handleRemark = (record: any) => {
    setRemarkEditingRecord(record);
    setRemarkModalOpen(true);
    remarkForm.setFieldsValue({ remark: record.remark || '' });
  };
  const handleRemarkOk = async () => {
    try {
      const values = await remarkForm.validateFields();
      // 假设有updateDepartmentBonus接口
      const res = await updateDepartmentBonus(remarkEditingRecord.id, { remark: values.remark });
      if (res && res.success) {
        message.success('备注保存成功');
        setRemarkModalOpen(false);
        setRemarkEditingRecord(null);
        loadDepartmentData(departmentPagination.current, departmentPagination.pageSize, departmentSearch);
      } else {
        message.error(res?.message || '备注保存失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '备注保存失败');
    }
  };
  const handleRemarkCancel = () => {
    setRemarkModalOpen(false);
    setRemarkEditingRecord(null);
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

  // 加载职级薪资标准数据
  const loadJobLevelData = async (page = 1, pageSize = 10) => {
    setJobLevelLoading(true);
    try {
      const res = await request(getApiUrl('/api/soo/job-level-salary/page', 'SOO'), { params: { pageNum: page, pageSize } });
      if (res && res.resp_code === 0) {
        setJobLevelData(res.datas.records || []);
        setJobLevelPagination({ current: page, pageSize, total: res.datas.total || 0 });
      } else {
        message.error(res?.resp_msg || '获取数据失败');
      }
    } catch (e: any) {
      message.error(e.message || '获取数据失败');
    } finally {
      setJobLevelLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'jobLevel') {
      loadJobLevelData();
    }
  }, [activeTab]);

  const handleJobLevelAdd = () => {
    setJobLevelEditing(null);
    setJobLevelModalOpen(true);
    jobLevelForm.resetFields();
  };
  const handleJobLevelEdit = (record: any) => {
    setJobLevelEditing(record);
    setJobLevelModalOpen(true);
    setTimeout(() => {
      jobLevelForm.setFieldsValue({
        ...record,
        effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      });
    }, 0);
  };
  const handleJobLevelModalOk = async () => {
    try {
      const values = await jobLevelForm.validateFields();
      const submitData = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
        status: values.status ? 1 : 0,
      };
      let res;
      if (jobLevelEditing) {
        res = await request(getApiUrl(`/api/soo/job-level-salary/${jobLevelEditing.id}`, 'SOO'), { method: 'PUT', data: submitData });
      } else {
        res = await request(getApiUrl('/api/soo/job-level-salary', 'SOO'), { method: 'POST', data: submitData });
      }
      if (res && res.resp_code === 0) {
        message.success('保存成功');
        setJobLevelModalOpen(false);
        setJobLevelEditing(null);
        loadJobLevelData(jobLevelPagination.current, jobLevelPagination.pageSize);
      } else {
        message.error(res?.resp_msg || '保存失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '保存失败');
    }
  };
  const handleJobLevelModalCancel = () => {
    setJobLevelModalOpen(false);
    setJobLevelEditing(null);
  };
  const handleJobLevelDelete = async (record: any) => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该条数据吗？',
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request(getApiUrl(`/api/soo/job-level-salary/${record.id}`, 'SOO'), { method: 'DELETE' });
          if (res && res.resp_code === 0) {
            message.success('删除成功');
            loadJobLevelData(jobLevelPagination.current, jobLevelPagination.pageSize);
          } else {
            message.error(res?.resp_msg || '删除失败');
          }
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };
  // 职级薪资标准表格列
  const jobLevelColumns = [
    { title: '部门', dataIndex: 'departmentName', key: 'departmentName' },
    { title: '岗位等级', dataIndex: 'jobLevelName', key: 'jobLevelName' },
    { title: '基础工资下限', dataIndex: 'baseSalaryMin', key: 'baseSalaryMin' },
    { title: '基础工资上限', dataIndex: 'baseSalaryMax', key: 'baseSalaryMax' },
    { title: '绩效比例下限', dataIndex: 'performanceRatioMin', key: 'performanceRatioMin' },
    { title: '绩效比例上限', dataIndex: 'performanceRatioMax', key: 'performanceRatioMax' },
    { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (val: number) => val === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (val: string) => val ? (<Tooltip title={val}><span style={{ cursor: 'pointer', color: '#1890ff' }}>备注</span></Tooltip>) : <span>-</span> },
    {
      title: '操作', key: 'action', render: (_: any, record: any) => (
        <Space size={8}>
          <Button size="small" icon={<EditOutlined />} style={{ minWidth: 64, height: 32 }} onClick={() => handleJobLevelEdit(record)}>
            编辑
          </Button>
          <Button size="small" icon={<DeleteOutlined />} danger style={{ minWidth: 64, height: 32 }} onClick={() => handleJobLevelDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];
  // 职级薪资标准弹窗表单
  const renderJobLevelModalForm = () => (
    <Form form={jobLevelForm} layout="vertical">
      <Form.Item name="departmentName" label="部门" rules={[{ required: true, message: '请输入部门' }]}> <Input /> </Form.Item>
      <Form.Item name="jobLevelName" label="岗位等级" rules={[{ required: true, message: '请输入岗位等级' }]}> <Input /> </Form.Item>
      <Form.Item name="baseSalaryMin" label="基础工资下限" rules={[{ required: true, message: '请输入下限' }]}> <Input type="number" min={0} /> </Form.Item>
      <Form.Item name="baseSalaryMax" label="基础工资上限" rules={[{ required: true, message: '请输入上限' }]}> <Input type="number" min={0} /> </Form.Item>
      <Form.Item name="performanceRatioMin" label="绩效比例下限" rules={[{ required: true, message: '请输入下限' }]}> <Input type="number" min={0} max={2} step={0.01} /> </Form.Item>
      <Form.Item name="performanceRatioMax" label="绩效比例上限" rules={[{ required: true, message: '请输入上限' }]}> <Input type="number" min={0} max={2} step={0.01} /> </Form.Item>
      <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
      <Form.Item name="status" label="状态" valuePropName="checked"> <Switch checkedChildren="启用" unCheckedChildren="禁用" /> </Form.Item>
      <Form.Item name="remark" label="备注"> <Input.TextArea rows={2} maxLength={200} showCount /> </Form.Item>
    </Form>
    );

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
            tabBarGutter={2}
            tabBarStyle={{
              background: '#fff',
              borderRadius: 8,
              padding: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: 24,
            }}
          >
            <TabPane tab={<><ApartmentOutlined /> 部门分红配置</>} key="departmentBonus">
              <DepartmentBonus active={activeTab === 'departmentBonus'} />
            </TabPane>
            <TabPane tab={<><UserOutlined /> 职级薪资标准</>} key="jobLevelSalary">
              <JobLevelSalary active={activeTab === 'jobLevelSalary'} />
            </TabPane>
            <TabPane tab={<><ContactsOutlined /> 员工薪酬配置</>} key="employeeSalary">
              <EmployeeSalary active={activeTab === 'employeeSalary'} />
            </TabPane>
            <TabPane tab={<><SafetyOutlined /> 社保公积金基数</>} key="socialSecurityBase">
              <SocialSecurityBase active={activeTab === 'socialSecurityBase'} />
            </TabPane>
            <TabPane tab={<><GlobalOutlined /> 地区工资系数</>} key="regionSalaryFactor">
              <RegionSalaryFactor active={activeTab === 'regionSalaryFactor'} />
            </TabPane>
          </Tabs>
        </Content>
        <Footer className="base-config-footer">
          © 2024 Portal 3.0 - 企业管理平台. All rights reserved.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default BaseConfig; 