import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Descriptions,
  Table,
  Space,
  Typography,
  Tag,
  Avatar,
  Progress,
  Statistic,
  Row,
  Col,
  Alert,
  Tabs,
  Button,
  Divider,
} from 'antd';
import {
  ProjectOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  BankOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Project } from '@/types/project';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface ProjectParticipant {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  joinDate: string;
}

interface EmployeeCommissionDetail {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  commissionAmount: number;
  actualCommission: number;
  status: 'approved' | 'pending' | 'paid';
}

interface DepartmentReserveDetail {
  id: string;
  departmentName: string;
  reserveRatio: number;
  reserveAmount: number;
  status: 'approved' | 'pending';
  usedAmount: number;
  remainingAmount: number;
}

interface SalesRevenueProjectDetailModalProps {
  visible: boolean;
  project: Project | null;
  onCancel: () => void;
}

const SalesRevenueProjectDetailModal: React.FC<SalesRevenueProjectDetailModalProps> = ({
  visible,
  project,
  onCancel,
}) => {
  // 项目基本信息
  const [projectBasicInfo] = useState({
    id: 'PRJ001',
    name: '智慧城市管理平台建设项目',
    category: '软件开发',
    status: 'closed',
    leader: '赵六',
    leaderId: '004',
    customerName: '市政府信息化办公室',
    customerContact: '王主任 13800138000',
    startTime: '2024-01-15',
    endTime: '2024-10-30',
    description: '为市政府开发一套智慧城市综合管理平台，包括城市监控、交通管理、环境监测等功能模块。',
    createdAt: '2024-01-10 10:30:00',
    updatedAt: '2024-11-01 16:45:00',
  });

  // 项目参与人信息
  const [participants] = useState<ProjectParticipant[]>([
    {
      id: '001',
      name: '张三',
      role: '销售经理',
      department: '销售部',
      phone: '13800138001',
      email: 'zhangsan@company.com',
      joinDate: '2024-01-15',
    },
    {
      id: '002',
      name: '李四',
      role: '销售助理',
      department: '销售部',
      phone: '13800138002',
      email: 'lisi@company.com',
      joinDate: '2024-01-16',
    },
    {
      id: '003',
      name: '王五',
      role: '运维工程师',
      department: '运维部',
      phone: '13800138003',
      email: 'wangwu@company.com',
      joinDate: '2024-02-01',
    },
    {
      id: '004',
      name: '赵六',
      role: '项目经理',
      department: '技术部',
      phone: '13800138004',
      email: 'zhaoliu@company.com',
      joinDate: '2024-01-15',
    },
    {
      id: '005',
      name: '钱七',
      role: '技术负责人',
      department: '技术部',
      phone: '13800138005',
      email: 'qianqi@company.com',
      joinDate: '2024-01-20',
    },
  ]);

  // 项目结项信息
  const [closureInfo] = useState({
    contractAmount: 1000000, // 合同金额：100万
    actualAmount: 900000,    // 实际金额：90万
    receivedAmount: 800000,  // 已回款金额：80万
    receivedRatio: 88.89,    // 回款比例：88.89%
    cost: 630000,           // 项目成本：63万
    grossProfit: 270000,    // 毛利润：27万
    grossProfitRate: 30,    // 毛利率：30%
    closureTime: '2024-10-30 18:00:00',
    closureBy: '赵六',
    closureRemark: '项目按时完成，客户验收合格，功能达到预期要求。',
    approvalStatus: 'approved',
    approvalTime: '2024-11-01 14:30:00',
    approvalBy: '财务总监',
  });

  // 员工提成分配详情
  const [employeeCommissions] = useState<EmployeeCommissionDetail[]>([
    {
      id: 'comm_001',
      employeeName: '张三',
      role: '销售经理',
      department: '销售部',
      commissionType: 'percentage',
      commissionValue: 5,
      commissionAmount: 45000,
      actualCommission: 40000,
      status: 'paid',
    },
    {
      id: 'comm_002',
      employeeName: '李四',
      role: '销售助理',
      department: '销售部',
      commissionType: 'percentage',
      commissionValue: 1,
      commissionAmount: 9000,
      actualCommission: 8000,
      status: 'paid',
    },
    {
      id: 'comm_003',
      employeeName: '王五',
      role: '运维工程师',
      department: '运维部',
      commissionType: 'fixed',
      commissionValue: 1000,
      commissionAmount: 1000,
      actualCommission: 889,
      status: 'approved',
    },
    {
      id: 'comm_004',
      employeeName: '赵六',
      role: '项目经理',
      department: '技术部',
      commissionType: 'percentage',
      commissionValue: 2,
      commissionAmount: 18000,
      actualCommission: 16000,
      status: 'paid',
    },
    {
      id: 'comm_005',
      employeeName: '钱七',
      role: '技术负责人',
      department: '技术部',
      commissionType: 'percentage',
      commissionValue: 1.5,
      commissionAmount: 13500,
      actualCommission: 12000,
      status: 'approved',
    },
  ]);

  // 部门储备金详情
  const [departmentReserves] = useState<DepartmentReserveDetail[]>([
    {
      id: 'reserve_001',
      departmentName: '销售部',
      reserveRatio: 10,
      reserveAmount: 27000,
      status: 'approved',
      usedAmount: 5000,
      remainingAmount: 22000,
    },
    {
      id: 'reserve_002',
      departmentName: '技术部',
      reserveRatio: 8,
      reserveAmount: 21600,
      status: 'approved',
      usedAmount: 0,
      remainingAmount: 21600,
    },
    {
      id: 'reserve_003',
      departmentName: '运维部',
      reserveRatio: 5,
      reserveAmount: 13500,
      status: 'approved',
      usedAmount: 0,
      remainingAmount: 13500,
    },
  ]);

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      approved: { color: 'success', text: '已审批' },
      pending: { color: 'warning', text: '待审批' },
      paid: { color: 'green', text: '已发放' },
      rejected: { color: 'error', text: '已拒绝' },
      closed: { color: 'success', text: '已结项' },
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 参与人表格列
  const participantColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '加入时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 100,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
  ];

  // 员工提成表格列
  const commissionColumns = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '提成方式',
      dataIndex: 'commissionType',
      key: 'commissionType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'percentage' ? 'purple' : 'orange'}>
          {type === 'percentage' ? '按比例' : '固定金额'}
        </Tag>
      ),
    },
    {
      title: '提成配置',
      dataIndex: 'commissionValue',
      key: 'commissionValue',
      width: 100,
      render: (value: number, record: EmployeeCommissionDetail) => (
        <Text strong>
          {record.commissionType === 'percentage' ? `${value}%` : `¥${value.toLocaleString()}`}
        </Text>
      ),
    },
    {
      title: '应发提成',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      width: 100,
      render: (amount: number) => (
        <Text type="success" strong>
          ¥{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '实际计提',
      dataIndex: 'actualCommission',
      key: 'actualCommission',
      width: 100,
      render: (amount: number) => (
        <Text type="warning" strong>
          ¥{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => getStatusTag(status),
    },
  ];

  // 部门储备金表格列
  const reserveColumns = [
    {
      title: '部门名称',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<TeamOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: '储备金比例',
      dataIndex: 'reserveRatio',
      key: 'reserveRatio',
      width: 100,
      render: (ratio: number) => <Text strong>{ratio}%</Text>,
    },
    {
      title: '储备金总额',
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
      title: '已使用',
      dataIndex: 'usedAmount',
      key: 'usedAmount',
      width: 100,
      render: (amount: number) => (
        <Text type="warning">
          ¥{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '剩余金额',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      render: (amount: number) => (
        <Text type="success" strong>
          ¥{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => getStatusTag(status),
    },
  ];

  const getTotalEmployeeCommission = () => {
    return employeeCommissions.reduce((total, emp) => total + emp.commissionAmount, 0);
  };

  const getTotalActualCommission = () => {
    return employeeCommissions.reduce((total, emp) => total + emp.actualCommission, 0);
  };

  const getTotalDepartmentReserve = () => {
    return departmentReserves.reduce((total, dept) => total + dept.reserveAmount, 0);
  };

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          销售额项目明细示例
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1400}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
      ]}
      destroyOnClose
    >
      <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <Tabs defaultActiveKey="1" type="card">
          {/* 基本信息 */}
          <TabPane
            tab={
              <Space>
                <ProjectOutlined />
                基本信息
              </Space>
            }
            key="1"
          >
            <Card>
              <Descriptions title="项目基本信息" column={2} bordered>
                <Descriptions.Item label="项目编号">
                  <Text strong>{projectBasicInfo.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="项目名称">
                  <Text strong>{projectBasicInfo.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="项目分类">
                  <Tag color="blue">{projectBasicInfo.category}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="项目状态">
                  {getStatusTag(projectBasicInfo.status)}
                </Descriptions.Item>
                <Descriptions.Item label="项目负责人">
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <Text strong>{projectBasicInfo.leader}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="客户名称">
                  <Text strong>{projectBasicInfo.customerName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="客户联系人">
                  {projectBasicInfo.customerContact}
                </Descriptions.Item>
                <Descriptions.Item label="项目开始时间">
                  {dayjs(projectBasicInfo.startTime).format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="项目结束时间">
                  {dayjs(projectBasicInfo.endTime).format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {projectBasicInfo.createdAt}
                </Descriptions.Item>
                <Descriptions.Item label="项目描述" span={2}>
                  {projectBasicInfo.description}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </TabPane>

          {/* 项目参与人 */}
          <TabPane
            tab={
              <Space>
                <TeamOutlined />
                项目参与人
              </Space>
            }
            key="2"
          >
            <Card title={`项目参与人（共${participants.length}人）`}>
              <Table
                dataSource={participants}
                columns={participantColumns}
                pagination={false}
                size="small"
                bordered
                rowKey="id"
              />
            </Card>
          </TabPane>

          {/* 项目结项信息 */}
          <TabPane
            tab={
              <Space>
                <CheckCircleOutlined />
                项目结项信息
              </Space>
            }
            key="3"
          >
            <Card title="项目结项信息">
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Statistic
                    title="合同金额"
                    value={closureInfo.contractAmount}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="实际金额"
                    value={closureInfo.actualAmount}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="已回款金额"
                    value={closureInfo.receivedAmount}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="回款比例"
                    value={closureInfo.receivedRatio}
                    suffix="%"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Statistic
                    title="项目成本"
                    value={closureInfo.cost}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="毛利润"
                    value={closureInfo.grossProfit}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="毛利率"
                    value={closureInfo.grossProfitRate}
                    suffix="%"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Progress
                    type="circle"
                    percent={closureInfo.receivedRatio}
                    size={80}
                    format={() => `${closureInfo.receivedRatio}%`}
                  />
                </Col>
              </Row>

              <Descriptions column={2} bordered>
                <Descriptions.Item label="结项时间">
                  {closureInfo.closureTime}
                </Descriptions.Item>
                <Descriptions.Item label="结项人">
                  {closureInfo.closureBy}
                </Descriptions.Item>
                <Descriptions.Item label="审批状态">
                  {getStatusTag(closureInfo.approvalStatus)}
                </Descriptions.Item>
                <Descriptions.Item label="审批时间">
                  {closureInfo.approvalTime}
                </Descriptions.Item>
                <Descriptions.Item label="审批人">
                  {closureInfo.approvalBy}
                </Descriptions.Item>
                <Descriptions.Item label="结项说明" span={1}>
                  {closureInfo.closureRemark}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </TabPane>

          {/* 项目员工提成分配 */}
          <TabPane
            tab={
              <Space>
                <DollarOutlined />
                员工提成分配
              </Space>
            }
            key="4"
          >
            <Card title="员工提成分配（基于销售额）">
              <Alert
                style={{ marginBottom: 16 }}
                message="销售额提成分配说明"
                description="员工提成基于项目实际金额（销售额90万）按比例或固定金额计算，实际计提按已回款比例（88.89%）执行。"
                type="info"
                showIcon
              />

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Statistic
                    title="应发提成总额"
                    value={getTotalEmployeeCommission()}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="实际计提总额"
                    value={getTotalActualCommission()}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="占销售额比例"
                    value={(getTotalEmployeeCommission() / closureInfo.actualAmount * 100).toFixed(2)}
                    suffix="%"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="已发放人数"
                    value={employeeCommissions.filter(emp => emp.status === 'paid').length}
                    suffix={`/${employeeCommissions.length}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>

              <Table
                dataSource={employeeCommissions}
                columns={commissionColumns}
                pagination={false}
                size="small"
                bordered
                rowKey="id"
              />
            </Card>
          </TabPane>

          {/* 项目部门储备提取分配 */}
          <TabPane
            tab={
              <Space>
                <BankOutlined />
                部门储备金分配
              </Space>
            }
            key="5"
          >
            <Card title="部门储备金分配（基于毛利润）">
              <Alert
                style={{ marginBottom: 16 }}
                message="部门储备金分配说明"
                description="部门储备金基于项目毛利润（27万）按部门设定比例提取，用于部门年度奖金分配。储备金发放需要部门年度绩效达标。"
                type="info"
                showIcon
              />

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Statistic
                    title="项目毛利润"
                    value={closureInfo.grossProfit}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="储备金总额"
                    value={getTotalDepartmentReserve()}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="已使用金额"
                    value={departmentReserves.reduce((total, dept) => total + dept.usedAmount, 0)}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="剩余金额"
                    value={departmentReserves.reduce((total, dept) => total + dept.remainingAmount, 0)}
                    formatter={(value) => `¥${value?.toLocaleString()}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>

              <Table
                dataSource={departmentReserves}
                columns={reserveColumns}
                pagination={false}
                size="small"
                bordered
                rowKey="id"
              />

              <Alert
                style={{ marginTop: 16 }}
                message="储备金使用说明"
                description={
                  <div>
                    <p>• 部门储备金可用于年度奖金、团队建设、培训等支出</p>
                    <p>• 储备金使用需要部门负责人审批</p>
                    <p>• 年度结算时剩余储备金可结转至下一年度</p>
                  </div>
                }
                type="success"
                showIcon
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default SalesRevenueProjectDetailModal;