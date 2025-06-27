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
} from '@ant-design/icons';
import type { Project } from '@/types/project';

const { Text, Title } = Typography;

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

interface SalesRevenueDistributionModalProps {
  visible: boolean;
  project: Project | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const SalesRevenueDistributionModal: React.FC<SalesRevenueDistributionModalProps> = ({
  visible,
  project,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 项目结项信息
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
  
  // 员工提成分配（按销售额）
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
    {
      key: 'emp_004',
      employeeId: '004',
      employeeName: '赵六',
      role: '项目经理',
      commissionType: 'percentage',
      commissionValue: 2, // 2%
      commissionAmount: 18000, // 90万 * 2% = 1.8万
    },
  ]);
  
  // 部门储备金分配
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

  // 员工提成表格列
  const employeeColumns = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
    },
    {
      title: '提成方式',
      dataIndex: 'commissionType',
      key: 'commissionType',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'percentage' ? 'blue' : 'green'}>
          {type === 'percentage' ? '按比例' : '固定金额'}
        </Tag>
      ),
    },
    {
      title: '提成配置',
      dataIndex: 'commissionValue',
      key: 'commissionValue',
      width: 120,
      render: (value: number, record: EmployeeSalesCommission) => (
        <Text strong>
          {record.commissionType === 'percentage' ? `${value}%` : `¥${value.toLocaleString()}`}
        </Text>
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
  ];

  // 部门储备金表格列
  const departmentColumns = [
    {
      title: '部门名称',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
    },
    {
      title: '储备金比例',
      dataIndex: 'reserveRatio',
      key: 'reserveRatio',
      width: 120,
      render: (ratio: number) => (
        <Text strong>{ratio}%</Text>
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

  return (
    <Modal
      title={
        <Space>
          <CalculatorOutlined />
          销售额提成分配示例
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          保存分配方案
        </Button>,
      ]}
      destroyOnClose
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* 项目结项信息 */}
        <Card title="1. 项目结项信息" style={{ marginBottom: 16 }}>
          <Descriptions column={3} bordered size="small">
            <Descriptions.Item label="项目名称" span={3}>
              <Text strong>{projectInfo.projectName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="合同金额">
              <Text strong>¥{projectInfo.contractAmount.toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="实际金额">
              <Text type="success" strong>¥{projectInfo.actualAmount.toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="已回款金额">
              <Text type="warning" strong>¥{projectInfo.receivedAmount.toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="回款比例">
              <Progress 
                percent={projectInfo.receivedRatio} 
                size="small" 
                format={() => `${projectInfo.receivedRatio}%`}
              />
            </Descriptions.Item>
            <Descriptions.Item label="项目成本">
              <Text>¥{projectInfo.cost.toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="毛利润">
              <Text type="success" strong>¥{projectInfo.grossProfit.toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="毛利率">
              <Text strong>{projectInfo.grossProfitRate}%</Text>
            </Descriptions.Item>
            <Descriptions.Item label="说明" span={1}>
              <Text type="secondary">按已回款比例计提</Text>
            </Descriptions.Item>
          </Descriptions>

          <Alert
            style={{ marginTop: 16 }}
            message="销售额提成说明"
            description={
              <div>
                <p>• <strong>员工提成</strong>：基于项目实际金额（销售额）按比例或固定金额计算</p>
                <p>• <strong>实际计提</strong>：按已回款金额比例进行计提发放（{projectInfo.receivedRatio}%）</p>
                <p>• <strong>部门储备金</strong>：基于毛利润按部门设定比例提取，逻辑保持不变</p>
              </div>
            }
            type="info"
            showIcon
          />
        </Card>

        {/* 员工提成分配 */}
        <Card 
          title={
            <Space>
              <UserOutlined />
              2. 员工提成分配（基于销售额）
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
          />

          <Alert
            style={{ marginTop: 12 }}
            message="提成计算说明"
            description={
              <div>
                <p>• <strong>张三（销售经理）</strong>：90万 × 5% = 4.5万，实际计提：4.5万 × 88.89% = 4万</p>
                <p>• <strong>李四（销售助理）</strong>：90万 × 1% = 0.9万，实际计提：0.9万 × 88.89% = 0.8万</p>
                <p>• <strong>王五（运维工程师）</strong>：固定1000元，实际计提：1000 × 88.89% = 889元</p>
                <p>• <strong>赵六（项目经理）</strong>：90万 × 2% = 1.8万，实际计提：1.8万 × 88.89% = 1.6万</p>
              </div>
            }
            type="success"
            showIcon
          />
        </Card>

        {/* 部门储备金分配 */}
        <Card 
          title={
            <Space>
              <BankOutlined />
              3. 部门储备金分配（基于毛利润）
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
          />

          <Alert
            style={{ marginTop: 12 }}
            message="储备金分配说明"
            description="部门储备金基于项目毛利润按部门设定比例提取，用于部门年度奖金分配。储备金发放需要部门年度绩效达标。"
            type="info"
            showIcon
          />
        </Card>

        {/* 分配方案汇总 */}
        <Card title="4. 分配方案汇总" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
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
        </Card>
      </div>
    </Modal>
  );
};

export default SalesRevenueDistributionModal;