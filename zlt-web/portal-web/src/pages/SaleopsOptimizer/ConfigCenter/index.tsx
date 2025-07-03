import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, Tabs, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, Select, Switch, message, Layout } from 'antd';
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

// 部门分红配置
const departmentOptions = [
  '销售部', '产品研发部', '市场运营部', '采购部', '行政部', '人事部',
];
const initialDepartmentData = [
  { departmentName: '销售部', bonusWeight: '30.0', effectiveDate: '2024-01-01', status: true },
  { departmentName: '产品研发部', bonusWeight: '25.0', effectiveDate: '2024-01-01', status: true },
];
const departmentColumns = (onEdit: (record: any) => void, onDelete: (record: any) => void) => [
  { title: '部门名称', dataIndex: 'departmentName', key: 'departmentName' },
  { title: '分红权重(%)', dataIndex: 'bonusWeight', key: 'bonusWeight' },
  { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (val: boolean) => val ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
  {
    title: '操作', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button size="small" onClick={() => onEdit(record)}>编辑</Button>
        <Button size="small" danger onClick={() => onDelete(record)}>删除</Button>
      </Space>
    ),
  },
];

// 职级薪资标准
const jobLevelOptions = ['销售总监', '销售经理', '销售专员', '产品总监', '高级工程师'];
const initialJobLevelData = [
  { jobLevelName: '销售总监', departmentName: '销售部', salaryRange: '20000-30000', performanceRange: '30-120', status: true },
  { jobLevelName: '产品总监', departmentName: '产品研发部', salaryRange: '25000-35000', performanceRange: '30-100', status: true },
];
const jobLevelColumns = (onEdit: (record: any) => void, onDelete: (record: any) => void) => [
  { title: '职级名称', dataIndex: 'jobLevelName', key: 'jobLevelName' },
  { title: '所属部门', dataIndex: 'departmentName', key: 'departmentName' },
  { title: '基础工资范围', dataIndex: 'salaryRange', key: 'salaryRange', render: (val: string) => `¥${val}` },
  { title: '绩效比例范围', dataIndex: 'performanceRange', key: 'performanceRange', render: (val: string) => `${val}%` },
  { title: '状态', dataIndex: 'status', key: 'status', render: (val: boolean) => val ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
  {
    title: '操作', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button size="small" onClick={() => onEdit(record)}>编辑</Button>
        <Button size="small" danger onClick={() => onDelete(record)}>删除</Button>
      </Space>
    ),
  },
];

// 员工薪酬配置
const employeeOptions = ['张三', '李四', '王五', '赵六'];
const initialEmployeeData = [
  { employeeName: '张三', departmentName: '销售部', positionName: '销售经理', baseSalary: '12000', performanceRatio: '80', status: true },
  { employeeName: '李四', departmentName: '产品研发部', positionName: '高级工程师', baseSalary: '18000', performanceRatio: '100', status: true },
];
const employeeColumns = (onEdit: (record: any) => void, onDelete: (record: any) => void) => [
  { title: '员工姓名', dataIndex: 'employeeName', key: 'employeeName' },
  { title: '所属部门', dataIndex: 'departmentName', key: 'departmentName' },
  { title: '岗位', dataIndex: 'positionName', key: 'positionName' },
  { title: '基础工资', dataIndex: 'baseSalary', key: 'baseSalary', render: (val: string) => `¥${val}` },
  { title: '绩效比例(%)', dataIndex: 'performanceRatio', key: 'performanceRatio', render: (val: string) => `${val}%` },
  { title: '状态', dataIndex: 'status', key: 'status', render: (val: boolean) => val ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
  {
    title: '操作', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button size="small" onClick={() => onEdit(record)}>编辑</Button>
        <Button size="small" danger onClick={() => onDelete(record)}>删除</Button>
      </Space>
    ),
  },
];

// 社保公积金基数
const regionOptions = ['北京', '上海', '广州', '深圳'];
const initialSocialData = [
  { region: '北京', socialBase: '8000', fundBase: '7000', effectiveDate: '2024-01-01', status: true },
  { region: '上海', socialBase: '9000', fundBase: '8000', effectiveDate: '2024-01-01', status: true },
];
const socialColumns = (onEdit: (record: any) => void, onDelete: (record: any) => void) => [
  { title: '地区', dataIndex: 'region', key: 'region' },
  { title: '社保基数', dataIndex: 'socialBase', key: 'socialBase', render: (val: string) => `¥${val}` },
  { title: '公积金基数', dataIndex: 'fundBase', key: 'fundBase', render: (val: string) => `¥${val}` },
  { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (val: boolean) => val ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
  {
    title: '操作', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button size="small" onClick={() => onEdit(record)}>编辑</Button>
        <Button size="small" danger onClick={() => onDelete(record)}>删除</Button>
      </Space>
    ),
  },
];

// 地区工资系数
const initialRegionData = [
  { region: '北京', wageRatio: '1.2', effectiveDate: '2024-01-01', status: true },
  { region: '上海', wageRatio: '1.1', effectiveDate: '2024-01-01', status: true },
];
const regionColumns = (onEdit: (record: any) => void, onDelete: (record: any) => void) => [
  { title: '地区', dataIndex: 'region', key: 'region' },
  { title: '工资系数', dataIndex: 'wageRatio', key: 'wageRatio' },
  { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (val: boolean) => val ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
  {
    title: '操作', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button size="small" onClick={() => onEdit(record)}>编辑</Button>
        <Button size="small" danger onClick={() => onDelete(record)}>删除</Button>
      </Space>
    ),
  },
];

// 1. 增加权限点变量
const canAdd = true; // 后续可由权限系统动态控制
const canEdit = true;
const canDelete = true;
const canBatch = true;

// 2. 统一数据请求与表单提交结构（模拟）
interface TableFetchParams {
  keyword?: string;
  current?: number;
  pageSize?: number;
}

type TabKey = 'department' | 'jobLevel' | 'employee' | 'social' | 'region';

const fetchTableData = (tab: TabKey, params: TableFetchParams) => {
  let data: any[] = [];
  let total = 0;
  switch(tab) {
    case 'department':
      data = initialDepartmentData.filter(item => !params.keyword || item.departmentName.includes(params.keyword));
      total = data.length;
      break;
    case 'jobLevel':
      data = initialJobLevelData.filter(item => !params.keyword || item.jobLevelName.includes(params.keyword));
      total = data.length;
      break;
    case 'employee':
      data = initialEmployeeData.filter(item => !params.keyword || item.employeeName.includes(params.keyword));
      total = data.length;
      break;
    case 'social':
      data = initialSocialData.filter(item => !params.keyword || item.region.includes(params.keyword));
      total = data.length;
      break;
    case 'region':
      data = initialRegionData.filter(item => !params.keyword || item.region.includes(params.keyword));
      total = data.length;
      break;
    default:
      break;
  }
  const { current = 1, pageSize = 10 } = params;
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  return { data: data.slice(start, end), total };
};

const BaseConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('department');
  // 各Tab数据
  const [departmentData, setDepartmentData] = useState(initialDepartmentData);
  const [jobLevelData, setJobLevelData] = useState(initialJobLevelData);
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);
  const [socialData, setSocialData] = useState(initialSocialData);
  const [regionData, setRegionData] = useState(initialRegionData);

  // 弹窗与表单状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('department');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [deleteRecord, setDeleteRecord] = useState<any>(null);
  const [deleteTab, setDeleteTab] = useState('department');

  // 3. 主组件内状态扩展
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableTotal, setTableTotal] = useState(0);

  // 4. 数据加载函数
  const loadTable = (tab = activeTab, keyword = searchKeyword, page = pagination.current, size = pagination.pageSize) => {
    const { data, total } = fetchTableData(tab, { keyword, current: page, pageSize: size });
    setTableData(data);
    setTableTotal(total);
    setSelectedRowKeys([]);
  };

  useEffect(() => {
    loadTable();
    // eslint-disable-next-line
  }, [activeTab, searchKeyword, pagination.current, pagination.pageSize]);

  // 5. 搜索栏与分页事件
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPagination({ ...pagination, current: 1 });
  };
  const handleTableChange = (pag: any) => {
    setPagination({ ...pagination, current: pag.current, pageSize: pag.pageSize });
  };

  // 6. 批量操作
  const handleBatchDelete = () => {
    if (!selectedRowKeys.length) return message.warning('请先选择要删除的数据');
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的${selectedRowKeys.length}条数据吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => {
        message.success('批量删除成功（模拟）');
        loadTable();
      },
    });
  };
  const handleBatchImport = () => {
    message.info('批量导入功能开发中...');
  };
  const handleBatchExport = () => {
    message.info('批量导出功能开发中...');
  };

  // 7. rowSelection
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // 新增/编辑弹窗
  const handleAdd = (tab: string) => {
    setEditingRecord(null);
    setModalTab(tab);
    form.resetFields();
    setModalOpen(true);
  };
  const handleEdit = (tab: TabKey, record: any) => {
    setEditingRecord(record);
    setModalTab(tab);
    let fields = { ...record };
    if (tab === 'department' || tab === 'social' || tab === 'region') {
      fields.effectiveDate = dayjs(record.effectiveDate);
    }
    form.setFieldsValue(fields);
    setModalOpen(true);
  };
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let newData = { ...values };
      if (modalTab === 'department' || modalTab === 'social' || modalTab === 'region') {
        newData.effectiveDate = values.effectiveDate.format('YYYY-MM-DD');
      }
      if (editingRecord) {
        // 编辑
        const update = (arr: any[], key: string) => arr.map(item => item === editingRecord ? { ...editingRecord, ...newData } : item);
        if (modalTab === 'department') setDepartmentData(update(departmentData, 'departmentName'));
        if (modalTab === 'jobLevel') setJobLevelData(update(jobLevelData, 'jobLevelName'));
        if (modalTab === 'employee') setEmployeeData(update(employeeData, 'employeeName'));
        if (modalTab === 'social') setSocialData(update(socialData, 'region'));
        if (modalTab === 'region') setRegionData(update(regionData, 'region'));
        message.success('编辑成功');
      } else {
        // 新增
        if (modalTab === 'department') setDepartmentData([...departmentData, newData]);
        if (modalTab === 'jobLevel') setJobLevelData([...jobLevelData, newData]);
        if (modalTab === 'employee') setEmployeeData([...employeeData, newData]);
        if (modalTab === 'social') setSocialData([...socialData, newData]);
        if (modalTab === 'region') setRegionData([...regionData, newData]);
        message.success('新增成功');
      }
      setModalOpen(false);
    } catch (e) {}
  };
  const handleModalCancel = () => {
    setModalOpen(false);
  };

  // 删除操作
  const handleDelete = (tab: TabKey, record: any) => {
    setDeleteRecord(record);
    setDeleteTab(tab);
  };
  const handleDeleteOk = () => {
    const remove = (arr: any[]) => arr.filter(item => item !== deleteRecord);
    if (deleteTab === 'department') setDepartmentData(remove(departmentData));
    if (deleteTab === 'jobLevel') setJobLevelData(remove(jobLevelData));
    if (deleteTab === 'employee') setEmployeeData(remove(employeeData));
    if (deleteTab === 'social') setSocialData(remove(socialData));
    if (deleteTab === 'region') setRegionData(remove(regionData));
    setDeleteRecord(null);
    message.success('删除成功');
  };
  const handleDeleteCancel = () => {
    setDeleteRecord(null);
  };

  // 各Tab表单内容
  const renderModalForm = () => {
    switch (modalTab) {
      case 'department':
        return (
          <>
            <Form.Item name="departmentName" label="部门" rules={[{ required: true, message: '请选择部门' }]}> 
              <Select placeholder="请选择部门">
                {departmentOptions.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="bonusWeight" label="分红权重(%)" rules={[{ required: true, message: '请输入分红权重' }]}> 
              <Input type="number" min={0} max={100} suffix="%" placeholder="如：30" />
            </Form.Item>
            <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}> 
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}> 
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </>
        );
      case 'jobLevel':
        return (
          <>
            <Form.Item name="jobLevelName" label="职级名称" rules={[{ required: true, message: '请输入职级名称' }]}> 
              <Input placeholder="如：销售经理" />
            </Form.Item>
            <Form.Item name="departmentName" label="所属部门" rules={[{ required: true, message: '请选择部门' }]}> 
              <Select placeholder="请选择部门">
                {departmentOptions.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="salaryRange" label="基础工资范围" rules={[{ required: true, message: '请输入工资范围' }]}> 
              <Input placeholder="如：12000-18000" />
            </Form.Item>
            <Form.Item name="performanceRange" label="绩效比例范围" rules={[{ required: true, message: '请输入绩效比例范围' }]}> 
              <Input placeholder="如：30-100" />
            </Form.Item>
            <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}> 
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </>
        );
      case 'employee':
        return (
          <>
            <Form.Item name="employeeName" label="员工姓名" rules={[{ required: true, message: '请输入员工姓名' }]}> 
              <Select placeholder="请选择员工">
                {employeeOptions.map(emp => <Option key={emp} value={emp}>{emp}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="departmentName" label="所属部门" rules={[{ required: true, message: '请选择部门' }]}> 
              <Select placeholder="请选择部门">
                {departmentOptions.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="positionName" label="岗位" rules={[{ required: true, message: '请输入岗位名称' }]}> 
              <Input placeholder="如：销售经理" />
            </Form.Item>
            <Form.Item name="baseSalary" label="基础工资" rules={[{ required: true, message: '请输入基础工资' }]}> 
              <Input type="number" min={0} placeholder="如：12000" />
            </Form.Item>
            <Form.Item name="performanceRatio" label="绩效比例(%)" rules={[{ required: true, message: '请输入绩效比例' }]}> 
              <Input type="number" min={0} max={200} placeholder="如：80" />
            </Form.Item>
            <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}> 
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </>
        );
      case 'social':
        return (
          <>
            <Form.Item name="region" label="地区" rules={[{ required: true, message: '请选择地区' }]}> 
              <Select placeholder="请选择地区">
                {regionOptions.map(region => <Option key={region} value={region}>{region}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="socialBase" label="社保基数" rules={[{ required: true, message: '请输入社保基数' }]}> 
              <Input type="number" min={0} placeholder="如：8000" />
            </Form.Item>
            <Form.Item name="fundBase" label="公积金基数" rules={[{ required: true, message: '请输入公积金基数' }]}> 
              <Input type="number" min={0} placeholder="如：7000" />
            </Form.Item>
            <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}> 
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}> 
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </>
        );
      case 'region':
        return (
          <>
            <Form.Item name="region" label="地区" rules={[{ required: true, message: '请选择地区' }]}> 
              <Select placeholder="请选择地区">
                {regionOptions.map(region => <Option key={region} value={region}>{region}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="wageRatio" label="工资系数" rules={[{ required: true, message: '请输入工资系数' }]}> 
              <Input type="number" min={0} max={10} step={0.01} placeholder="如：1.2" />
            </Form.Item>
            <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}> 
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}> 
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  // 各Tab内容
  const renderTabContent = () => {
    const columnsMap: Record<TabKey, (onEdit: (r: any) => void, onDelete: (r: any) => void) => any[]> = {
      department: departmentColumns,
      jobLevel: jobLevelColumns,
      employee: employeeColumns,
      social: socialColumns,
      region: regionColumns,
    };
    const columns = columnsMap[activeTab]((r: any) => handleEdit(activeTab, r), (r: any) => handleDelete(activeTab, r));
    return (
      <>
        {/* 搜索栏与批量操作区 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16, gap: 8 }}>
          <Space style={{ flex: 1, minWidth: 220 }}>
            <Input.Search
              allowClear
              placeholder="请输入关键字搜索"
              style={{ width: 220 }}
              onSearch={handleSearch}
              enterButton
            />
          </Space>
          <Space wrap>
            {canBatch && <Button disabled={!selectedRowKeys.length} danger onClick={handleBatchDelete}>批量删除</Button>}
            {canBatch && <Button onClick={handleBatchImport}>批量导入</Button>}
            {canBatch && <Button onClick={handleBatchExport}>批量导出</Button>}
            {canAdd && <Button type="primary" onClick={() => handleAdd(activeTab)}>新增</Button>}
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey={activeTab === 'employee' ? 'employeeName' : activeTab === 'jobLevel' ? 'jobLevelName' : activeTab === 'region' ? 'region' : 'departmentName'}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: tableTotal,
            showSizeChanger: true,
            showTotal: (t) => `共${t}条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          style={{ minHeight: 320 }}
        />
      </>
    );
  };

  return (
    <Layout className="base-config-layout">
      {/* 侧边栏可集成Portal统一导航 */}
      {/* <Sider width={240} className="base-config-sider">侧边栏</Sider> */}
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
            onChange={(key) => setActiveTab(key as TabKey)}
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