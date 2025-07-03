import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, Tabs, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, Select, Switch, message } from 'antd';
import dayjs from 'dayjs';

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

const ConfigCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('department');
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

  // 新增/编辑弹窗
  const handleAdd = (tab: string) => {
    setEditingRecord(null);
    setModalTab(tab);
    form.resetFields();
    setModalOpen(true);
  };
  const handleEdit = (tab: string, record: any) => {
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
  const handleDelete = (tab: string, record: any) => {
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
    switch (activeTab) {
      case 'department':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>部门分红配置</span>
              <Space>
                <Button>导入</Button>
                <Button>导出</Button>
                <Button type="primary" onClick={() => handleAdd('department')}>新增配置</Button>
              </Space>
            </div>
            <Table columns={departmentColumns((r) => handleEdit('department', r), (r) => handleDelete('department', r))} dataSource={departmentData} rowKey="departmentName" pagination={false} />
          </>
        );
      case 'jobLevel':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>职级薪资标准</span>
              <Space>
                <Button>导入</Button>
                <Button>导出</Button>
                <Button type="primary" onClick={() => handleAdd('jobLevel')}>新增标准</Button>
              </Space>
            </div>
            <Table columns={jobLevelColumns((r) => handleEdit('jobLevel', r), (r) => handleDelete('jobLevel', r))} dataSource={jobLevelData} rowKey="jobLevelName" pagination={false} />
          </>
        );
      case 'employee':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>员工薪酬配置</span>
              <Space>
                <Button>导入</Button>
                <Button>导出</Button>
                <Button type="primary" onClick={() => handleAdd('employee')}>新增配置</Button>
              </Space>
            </div>
            <Table columns={employeeColumns((r) => handleEdit('employee', r), (r) => handleDelete('employee', r))} dataSource={employeeData} rowKey="employeeName" pagination={false} />
          </>
        );
      case 'social':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>社保公积金基数</span>
              <Space>
                <Button>导入</Button>
                <Button>导出</Button>
                <Button type="primary" onClick={() => handleAdd('social')}>新增配置</Button>
              </Space>
            </div>
            <Table columns={socialColumns((r) => handleEdit('social', r), (r) => handleDelete('social', r))} dataSource={socialData} rowKey="region" pagination={false} />
          </>
        );
      case 'region':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>地区工资系数</span>
              <Space>
                <Button>导入</Button>
                <Button>导出</Button>
                <Button type="primary" onClick={() => handleAdd('region')}>新增配置</Button>
              </Space>
            </div>
            <Table columns={regionColumns((r) => handleEdit('region', r), (r) => handleDelete('region', r))} dataSource={regionData} rowKey="region" pagination={false} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Card bordered={false} style={{ minHeight: 600 }}>
        <Title level={3} style={{ marginBottom: 24 }}>配置中心</Title>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(tab => ({ key: tab.key, label: tab.label }))}
          style={{ marginBottom: 24 }}
        />
        <div>{renderTabContent()}</div>
        <Modal
          open={modalOpen}
          title={editingRecord ? '编辑' : '新增'}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          destroyOnClose
        >
          <Form form={form} layout="vertical" preserve={false}>
            {renderModalForm()}
          </Form>
        </Modal>
        <Modal
          open={!!deleteRecord}
          title="确认删除"
          onOk={handleDeleteOk}
          onCancel={handleDeleteCancel}
          okText="删除"
          okButtonProps={{ danger: true }}
        >
          <div>确定要删除该条数据吗？</div>
        </Modal>
      </Card>
    </PageContainer>
  );
};

export default ConfigCenter; 