import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  Button,
  InputNumber,
  Select,
  message,
  Divider,
  Space,
  Popconfirm,
  Radio,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Table,
  Alert,
  Descriptions,
  Progress,
  Tag,
  Input,
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  DollarOutlined, 
  PercentageOutlined, 
  BankOutlined, 
  UserOutlined,
  InfoCircleOutlined,
  CalculatorOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { Project } from '@/types/project';

const { Text, Title } = Typography;
const { Option } = Select;

interface EmployeeSalesCommission {
  key: string;
  employeeId: string;
  employeeName: string;
  role: string;
  commissionType: 'percentage' | 'fixed'; // percentage: 按比例, fixed: 固定金额
  commissionValue: number; // 比例值（%）或固定金额
  commissionAmount: number; // 实际提成金额
}

interface DepartmentReserve {
  key: string;
  departmentId: string;
  departmentName: string;
  reserveRatio: number; // 储备金比例
  reserveAmount: number; // 储备金金额
}

interface SalesRevenueDistributionEditModalProps {
  visible: boolean;
  project: Project | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const SalesRevenueDistributionEditModal: React.FC<SalesRevenueDistributionEditModalProps> = ({
  visible,
  project,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 项目结项信息（可编辑）
  const [projectInfo, setProjectInfo] = useState({
    projectName: '智慧城市管理平台建设项目',
    contractAmount: 1000000, // 合同金额：100万
    actualAmount: 900000,    // 实际金额：90万
    receivedAmount: 800000,  // 已回款金额：80万
    receivedRatio: 88.89,    // 回款比例：88.89%
    cost: 630000,           // 项目成本：63万
    grossProfit: 270000,    // 毛利润：27万
    grossProfitRate: 30,    // 毛利率：30%
  });
  
  // 员工提成分配（可编辑）
  const [employeeCommissions, setEmployeeCommissions] = useState<EmployeeSalesCommission[]>([
    {
      key: 'emp_001',
      employeeId: '001',
      employeeName: '张三',
      role: '销售经理',
      commissionType: 'percentage',
      commissionValue: 5, // 5%
      commissionAmount: 45000, // 90万 * 5% = 4.5万
    },
    {
      key: 'emp_002',
      employeeId: '002',
      employeeName: '李四',
      role: '销售助理',
      commissionType: 'percentage',
      commissionValue: 1, // 1%
      commissionAmount: 9000, // 90万 * 1% = 0.9万
    },
    {
      key: 'emp_003',
      employeeId: '003',
      employeeName: '王五',
      role: '运维工程师',
      commissionType: 'fixed',
      commissionValue: 1000, // 固定1000元
      commissionAmount: 1000,
    },
  ]);
  
  // 部门储备金分配（可编辑）
  const [departmentReserves, setDepartmentReserves] = useState<DepartmentReserve[]>([
    {
      key: 'dept_001',
      departmentId: '001',
      departmentName: '销售部',
      reserveRatio: 10, // 10%
      reserveAmount: 27000, // 毛利润27万 * 10% = 2.7万
    },
    {
      key: 'dept_002',
      departmentId: '002',
      departmentName: '技术部',
      reserveRatio: 8, // 8%
      reserveAmount: 21600, // 毛利润27万 * 8% = 2.16万
    },
    {
      key: 'dept_003',
      departmentId: '003',
      departmentName: '运维部',
      reserveRatio: 5, // 5%
      reserveAmount: 13500, // 毛利润27万 * 5% = 1.35万
    },
  ]);

  // 动态计算项目信息
  const calculateProjectInfo = useCallback((values: Partial<typeof projectInfo>) => {
    const newInfo = { ...projectInfo, ...values };
    
    // 自动计算毛利率
    if (newInfo.actualAmount > 0 && newInfo.grossProfit !== undefined) {
      newInfo.grossProfitRate = Number(((newInfo.grossProfit / newInfo.actualAmount) * 100).toFixed(2));
    }
    
    // 自动计算回款比例
    if (newInfo.actualAmount > 0 && newInfo.receivedAmount !== undefined) {
      newInfo.receivedRatio = Number(((newInfo.receivedAmount / newInfo.actualAmount) * 100).toFixed(2));
    }
    
    // 如果有成本和实际金额，自动计算毛利润
    if (newInfo.actualAmount > 0 && newInfo.cost !== undefined && values.grossProfit === undefined) {
      newInfo.grossProfit = newInfo.actualAmount - newInfo.cost;
      newInfo.grossProfitRate = Number(((newInfo.grossProfit / newInfo.actualAmount) * 100).toFixed(2));
    }
    
    setProjectInfo(newInfo);
    
    // 重新计算员工提成
    recalculateEmployeeCommissions(newInfo);
    // 重新计算部门储备金
    recalculateDepartmentReserves(newInfo);
  }, [projectInfo]);

  // 重新计算员工提成
  const recalculateEmployeeCommissions = useCallback((info: typeof projectInfo) => {
    setEmployeeCommissions(prev => prev.map(emp => ({
      ...emp,
      commissionAmount: emp.commissionType === 'percentage' 
        ? Math.round(info.actualAmount * emp.commissionValue / 100)
        : emp.commissionValue
    })));
  }, []);

  // 重新计算部门储备金
  const recalculateDepartmentReserves = useCallback((info: typeof projectInfo) => {
    setDepartmentReserves(prev => prev.map(dept => ({
      ...dept,
      reserveAmount: Math.round(info.grossProfit * dept.reserveRatio / 100)
    })));
  }, []);

  // 更新员工提成
  const updateEmployeeCommission = (index: number, field: keyof EmployeeSalesCommission, value: any) => {
    setEmployeeCommissions(prev => {
      const newCommissions = [...prev];
      const emp = { ...newCommissions[index] };
      
      (emp as any)[field] = value;
      
      // 如果修改了提成类型或比例/金额，重新计算提成金额
      if (field === 'commissionType' || field === 'commissionValue') {
        emp.commissionAmount = emp.commissionType === 'percentage' 
          ? Math.round(projectInfo.actualAmount * emp.commissionValue / 100)
          : emp.commissionValue;
      }
      
      newCommissions[index] = emp;
      return newCommissions;
    });
  };

  // 更新部门储备金
  const updateDepartmentReserve = (index: number, field: keyof DepartmentReserve, value: any) => {
    setDepartmentReserves(prev => {
      const newReserves = [...prev];
      const dept = { ...newReserves[index] };
      
      (dept as any)[field] = value;
      
      // 如果修改了储备金比例，重新计算储备金金额
      if (field === 'reserveRatio') {
        dept.reserveAmount = Math.round(projectInfo.grossProfit * dept.reserveRatio / 100);
      }
      
      newReserves[index] = dept;
      return newReserves;
    });
  };

  // 添加员工
  const addEmployee = () => {
    const newKey = `emp_${Date.now()}`;
    setEmployeeCommissions(prev => [...prev, {
      key: newKey,
      employeeId: newKey,
      employeeName: `员工${prev.length + 1}`,
      role: '销售员',
      commissionType: 'percentage',
      commissionValue: 1,
      commissionAmount: Math.round(projectInfo.actualAmount * 1 / 100),
    }]);
  };

  // 删除员工
  const deleteEmployee = (index: number) => {
    setEmployeeCommissions(prev => prev.filter((_, i) => i !== index));
  };

  // 添加部门
  const addDepartment = () => {
    const newKey = `dept_${Date.now()}`;
    setDepartmentReserves(prev => [...prev, {
      key: newKey,
      departmentId: newKey,
      departmentName: `部门${prev.length + 1}`,
      reserveRatio: 5,
      reserveAmount: Math.round(projectInfo.grossProfit * 5 / 100),
    }]);
  };

  // 删除部门
  const deleteDepartment = (index: number) => {
    setDepartmentReserves(prev => prev.filter((_, i) => i !== index));
  };

  // 计算汇总数据
  const getTotalEmployeeCommission = () => {
    return employeeCommissions.reduce((total, emp) => total + emp.commissionAmount, 0);
  };

  const getTotalDepartmentReserve = () => {
    return departmentReserves.reduce((total, dept) => total + dept.reserveAmount, 0);
  };

  const getActualCommissionByReceivedAmount = () => {
    const totalCommission = getTotalEmployeeCommission();
    return Math.round((totalCommission * projectInfo.receivedAmount) / projectInfo.actualAmount);
  };

  // 员工提成表格列（可编辑）
  const employeeColumns = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 120,
      render: (value: string, record: EmployeeSalesCommission, index: number) => (
        <Input
          value={value}
          onChange={(e) => updateEmployeeCommission(index, 'employeeName', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (value: string, record: EmployeeSalesCommission, index: number) => (
        <Select
          value={value}
          onChange={(value) => updateEmployeeCommission(index, 'role', value)}
          size="small"
          style={{ width: '100%' }}
        >
          <Option value="销售经理">销售经理</Option>
          <Option value="销售助理">销售助理</Option>
          <Option value="项目经理">项目经理</Option>
          <Option value="技术负责人">技术负责人</Option>
          <Option value="运维工程师">运维工程师</Option>
        </Select>
      ),
    },
    {
      title: '提成方式',
      dataIndex: 'commissionType',
      key: 'commissionType',
      width: 120,
      render: (value: string, record: EmployeeSalesCommission, index: number) => (
        <Select
          value={value}
          onChange={(value) => updateEmployeeCommission(index, 'commissionType', value)}
          size="small"
          style={{ width: '100%' }}
        >
          <Option value="percentage">按比例</Option>
          <Option value="fixed">固定金额</Option>
        </Select>
      ),
    },
    {
      title: '提成配置',
      dataIndex: 'commissionValue',
      key: 'commissionValue',
      width: 120,
      render: (value: number, record: EmployeeSalesCommission, index: number) => (
        <InputNumber
          value={value}
          onChange={(value) => updateEmployeeCommission(index, 'commissionValue', value || 0)}
          size="small"
          style={{ width: '100%' }}
          min={0}
          step={record.commissionType === 'percentage' ? 0.1 : 100}
          formatter={record.commissionType === 'percentage' ? undefined : (value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={record.commissionType === 'percentage' ? undefined : (value) => value!.replace(/¥\s?|(,*)/g, '')}
          addonAfter={record.commissionType === 'percentage' ? '%' : '元'}
        />
      ),
    },
    {
      title: '应发提成',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      width: 120,
      render: (amount: number) => (
        <Text type="success" strong>
          ¥{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '实际计提',
      key: 'actualCommission',
      width: 120,
      render: (_, record: EmployeeSalesCommission) => {
        const actualAmount = Math.round((record.commissionAmount * projectInfo.receivedAmount) / projectInfo.actualAmount);
        return (
          <Text type="warning" strong>
            ¥{actualAmount.toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record: EmployeeSalesCommission, index: number) => (
        <Popconfirm
          title="确定删除这个员工吗？"
          onConfirm={() => deleteEmployee(index)}
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // 部门储备金表格列（可编辑）
  const departmentColumns = [
    {
      title: '部门名称',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      render: (value: string, record: DepartmentReserve, index: number) => (
        <Input
          value={value}
          onChange={(e) => updateDepartmentReserve(index, 'departmentName', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: '储备金比例',
      dataIndex: 'reserveRatio',
      key: 'reserveRatio',
      width: 120,
      render: (value: number, record: DepartmentReserve, index: number) => (
        <InputNumber
          value={value}
          onChange={(value) => updateDepartmentReserve(index, 'reserveRatio', value || 0)}
          size="small"
          style={{ width: '100%' }}
          min={0}
          max={100}
          step={0.1}
          addonAfter="%"
        />
      ),
    },
    {
      title: '储备金金额',
      dataIndex: 'reserveAmount',
      key: 'reserveAmount',
      width: 120,
      render: (amount: number) => (
        <Text type="success" strong>
          ¥{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record: DepartmentReserve, index: number) => (
        <Popconfirm
          title="确定删除这个部门吗？"
          onConfirm={() => deleteDepartment(index)}
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('销售额提成分配方案保存成功');
      onSuccess();
      onCancel();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProjectInfo({
      projectName: '智慧城市管理平台建设项目',
      contractAmount: 1000000,
      actualAmount: 900000,
      receivedAmount: 800000,
      receivedRatio: 88.89,
      cost: 630000,
      grossProfit: 270000,
      grossProfitRate: 30,
    });
    setEmployeeCommissions([
      {
        key: 'emp_001',
        employeeId: '001',
        employeeName: '张三',
        role: '销售经理',
        commissionType: 'percentage',
        commissionValue: 5,
        commissionAmount: 45000,
      },
      {
        key: 'emp_002',
        employeeId: '002',
        employeeName: '李四',
        role: '销售助理',
        commissionType: 'percentage',
        commissionValue: 1,
        commissionAmount: 9000,
      },
      {
        key: 'emp_003',
        employeeId: '003',
        employeeName: '王五',
        role: '运维工程师',
        commissionType: 'fixed',
        commissionValue: 1000,
        commissionAmount: 1000,
      },
    ]);
    setDepartmentReserves([
      {
        key: 'dept_001',
        departmentId: '001',
        departmentName: '销售部',
        reserveRatio: 10,
        reserveAmount: 27000,
      },
      {
        key: 'dept_002',
        departmentId: '002',
        departmentName: '技术部',
        reserveRatio: 8,
        reserveAmount: 21600,
      },
      {
        key: 'dept_003',
        departmentId: '003',
        departmentName: '运维部',
        reserveRatio: 5,
        reserveAmount: 13500,
      },
    ]);
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          销售额提成编辑分配示例
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1400}
      footer={[
        <Button key="reset" onClick={handleReset}>
          重置
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          保存分配方案
        </Button>,
      ]}
      destroyOnClose
    >
      <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
        {/* 项目结项信息（可编辑） */}
        <Card title="1. 项目结项信息（可编辑）" style={{ marginBottom: 16 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="项目名称"
                  value={projectInfo.projectName}
                  valueStyle={{ fontSize: '14px' }}
                />
                <Input
                  value={projectInfo.projectName}
                  onChange={(e) => calculateProjectInfo({ projectName: e.target.value })}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="合同金额"
                  value={projectInfo.contractAmount}
                  formatter={(value) => `¥${value?.toLocaleString()}`}
                  valueStyle={{ color: '#1890ff' }}
                />
                <InputNumber
                  value={projectInfo.contractAmount}
                  onChange={(value) => calculateProjectInfo({ contractAmount: value || 0 })}
                  style={{ width: '100%', marginTop: 8 }}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="实际金额"
                  value={projectInfo.actualAmount}
                  formatter={(value) => `¥${value?.toLocaleString()}`}
                  valueStyle={{ color: '#3f8600' }}
                />
                <InputNumber
                  value={projectInfo.actualAmount}
                  onChange={(value) => calculateProjectInfo({ actualAmount: value || 0 })}
                  style={{ width: '100%', marginTop: 8 }}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="已回款金额"
                  value={projectInfo.receivedAmount}
                  formatter={(value) => `¥${value?.toLocaleString()}`}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <InputNumber
                  value={projectInfo.receivedAmount}
                  onChange={(value) => calculateProjectInfo({ receivedAmount: value || 0 })}
                  style={{ width: '100%', marginTop: 8 }}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="项目成本"
                  value={projectInfo.cost}
                  formatter={(value) => `¥${value?.toLocaleString()}`}
                  valueStyle={{ color: '#cf1322' }}
                />
                <InputNumber
                  value={projectInfo.cost}
                  onChange={(value) => calculateProjectInfo({ cost: value || 0 })}
                  style={{ width: '100%', marginTop: 8 }}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="毛利润"
                  value={projectInfo.grossProfit}
                  formatter={(value) => `¥${value?.toLocaleString()}`}
                  valueStyle={{ color: '#52c41a' }}
                />
                <InputNumber
                  value={projectInfo.grossProfit}
                  onChange={(value) => calculateProjectInfo({ grossProfit: value || 0 })}
                  style={{ width: '100%', marginTop: 8 }}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="回款比例"
                  value={projectInfo.receivedRatio}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
                <Text type="secondary">自动计算</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="毛利率"
                  value={projectInfo.grossProfitRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary">自动计算</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={projectInfo.receivedRatio}
                  size={80}
                  format={() => `回款${projectInfo.receivedRatio}%`}
                />
              </Card>
            </Col>
          </Row>

          <Alert
            style={{ marginTop: 16 }}
            message="动态试算说明"
            description="修改任何数值会自动重新计算相关数据。毛利率 = 毛利润 / 实际金额，回款比例 = 已回款金额 / 实际金额"
            type="info"
            showIcon
          />
        </Card>

        {/* 员工提成分配（可编辑） */}
        <Card 
          title={
            <Space>
              <UserOutlined />
              2. 员工提成分配（基于销售额，可编辑）
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addEmployee}>
                添加员工
              </Button>
            </Space>
          } 
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic
                title="项目实际金额"
                value={projectInfo.actualAmount}
                formatter={(value) => `¥${value?.toLocaleString()}`}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="员工提成总额"
                value={getTotalEmployeeCommission()}
                formatter={(value) => `¥${value?.toLocaleString()}`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="实际计提总额"
                value={getActualCommissionByReceivedAmount()}
                formatter={(value) => `¥${value?.toLocaleString()}`}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="提成占销售额比例"
                value={(getTotalEmployeeCommission() / projectInfo.actualAmount * 100).toFixed(2)}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>

          <Table
            dataSource={employeeCommissions}
            columns={employeeColumns}
            pagination={false}
            size="small"
            bordered
            rowKey="key"
          />

          <Alert
            style={{ marginTop: 12 }}
            message="提成试算说明"
            description="可以编辑员工姓名、角色、提成方式和比例/金额，系统会自动计算应发提成和实际计提金额。"
            type="success"
            showIcon
          />
        </Card>

        {/* 部门储备金分配（可编辑） */}
        <Card 
          title={
            <Space>
              <BankOutlined />
              3. 部门储备金分配（基于毛利润，可编辑）
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addDepartment}>
                添加部门
              </Button>
            </Space>
          } 
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="项目毛利润"
                value={projectInfo.grossProfit}
                formatter={(value) => `¥${value?.toLocaleString()}`}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="储备金总额"
                value={getTotalDepartmentReserve()}
                formatter={(value) => `¥${value?.toLocaleString()}`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="储备金占毛利比例"
                value={(getTotalDepartmentReserve() / projectInfo.grossProfit * 100).toFixed(2)}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>

          <Table
            dataSource={departmentReserves}
            columns={departmentColumns}
            pagination={false}
            size="small"
            bordered
            rowKey="key"
          />

          <Alert
            style={{ marginTop: 12 }}
            message="储备金试算说明"
            description="可以编辑部门名称和储备金比例，系统会根据毛利润自动计算储备金金额。"
            type="info"
            showIcon
          />
        </Card>

        {/* 分配方案汇总 */}
        <Card title="4. 分配方案汇总" style={{ marginBottom: 16 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="员工提成总计"
                  value={getTotalEmployeeCommission()}
                  formatter={(value) => `¥${value?.toLocaleString()}`}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Text type="secondary">占销售额 {(getTotalEmployeeCommission() / projectInfo.actualAmount * 100).toFixed(2)}%</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="部门储备金总计"
                  value={getTotalDepartmentReserve()}
                  formatter={(value) => `¥${value?.toLocaleString()}`}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary">占毛利润 {(getTotalDepartmentReserve() / projectInfo.grossProfit * 100).toFixed(2)}%</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="分配总计"
                  value={getTotalEmployeeCommission() + getTotalDepartmentReserve()}
                  formatter={(value) => `¥${value?.toLocaleString()}`}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Text type="secondary">占项目毛利润 {((getTotalEmployeeCommission() + getTotalDepartmentReserve()) / projectInfo.grossProfit * 100).toFixed(2)}%</Text>
              </Card>
            </Col>
          </Row>

          {/* 公司盈亏分析 */}
          <Card title="公司盈亏分析" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center', backgroundColor: '#f6ffed' }}>
                  <Statistic
                    title="理论公司收益"
                    value={projectInfo.grossProfit - getTotalEmployeeCommission() - getTotalDepartmentReserve()}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ 
                      color: (projectInfo.grossProfit - getTotalEmployeeCommission() - getTotalDepartmentReserve()) >= 0 ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                  <Text type="secondary">毛利润 - 员工提成 - 部门储备金</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center', backgroundColor: '#fff7e6' }}>
                  <Statistic
                    title="实际公司收益"
                    value={projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ 
                      color: (projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()) >= 0 ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                  <Text type="secondary">毛利润 - 实际员工计提 - 部门储备金</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center', backgroundColor: '#f0f5ff' }}>
                  <Statistic
                    title="公司收益率"
                    value={((projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()) / projectInfo.actualAmount * 100).toFixed(2)}
                    suffix="%"
                    valueStyle={{ 
                      color: ((projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()) / projectInfo.actualAmount * 100) >= 10 ? '#52c41a' : 
                             ((projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()) / projectInfo.actualAmount * 100) >= 5 ? '#fa8c16' : '#ff4d4f'
                    }}
                  />
                  <Text type="secondary">实际公司收益 / 项目销售额</Text>
                </Card>
              </Col>
            </Row>
          </Card>

          <Alert
            style={{ marginTop: 16 }}
            message="动态试算完成"
            description={
              <div>
                <p><strong>当前方案</strong>：员工提成 {getTotalEmployeeCommission().toLocaleString()} 元，部门储备金 {getTotalDepartmentReserve().toLocaleString()} 元</p>
                <p><strong>实际计提</strong>：按回款比例 {projectInfo.receivedRatio}% 计提，员工实际获得 {getActualCommissionByReceivedAmount().toLocaleString()} 元</p>
                <p><strong>公司盈亏</strong>：理论收益 {(projectInfo.grossProfit - getTotalEmployeeCommission() - getTotalDepartmentReserve()).toLocaleString()} 元，实际收益 {(projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()).toLocaleString()} 元</p>
                <p><strong>收益分析</strong>：公司收益率 {((projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()) / projectInfo.actualAmount * 100).toFixed(2)}%，
                  {((projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()) / projectInfo.actualAmount * 100) >= 10 ? '收益良好' : 
                   ((projectInfo.grossProfit - getActualCommissionByReceivedAmount() - getTotalDepartmentReserve()) / projectInfo.actualAmount * 100) >= 5 ? '收益一般' : '收益偏低'}
                </p>
              </div>
            }
            type="success"
            showIcon
          />
        </Card>
      </div>
    </Modal>
  );
};

export default SalesRevenueDistributionEditModal;