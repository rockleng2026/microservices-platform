import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Table,
  Button,
  InputNumber,
  Select,
  Row,
  Col,
  message,
  Divider,
  Card,
  Statistic,
  Space,
  Typography,
  Tag,
  Steps,
  Alert,
} from 'antd';
import { PlusOutlined, DeleteOutlined, DollarOutlined, TeamOutlined, BankOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { projectApi } from '@/services/project';
import type { Project } from '@/types/project';

const { Option } = Select;
const { Text } = Typography;
const { Step } = Steps;

interface DepartmentAllocation {
  key: string;
  departmentName: string;
  weight: number; // 权重百分比
  totalAmount: number; // 部门总分配金额
  employeeAmount: number; // 员工分配金额 (80%)
  reserveAmount: number; // 储备金金额 (20%)
  employeeDistributions: EmployeeDistribution[];
}

interface EmployeeDistribution {
  key: string;
  employeeId: string;
  employeeName: string;
  role: string;
  percentage: number; // 在部门内的分配比例
  amount: number; // 分配金额
}

interface ProfitDistributionModalProps {
  visible: boolean;
  project?: Project;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProfitDistributionModal: React.FC<ProfitDistributionModalProps> = ({
  visible,
  project,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [grossProfit, setGrossProfit] = useState<number>(0);
  const [profitPool, setProfitPool] = useState<number>(0); // 50%提成池
  const [departmentAllocations, setDepartmentAllocations] = useState<DepartmentAllocation[]>([]);
  const [totalWeight, setTotalWeight] = useState<number>(0);

  // 大部门选项
  const departmentOptions = [
    { label: '销售部', value: '销售部' },
    { label: '技术部', value: '技术部' },
    { label: '财务部', value: '财务部' },
    { label: '运维部', value: '运维部' },
    { label: '产品部', value: '产品部' },
    { label: '市场部', value: '市场部' },
  ];

  // 角色选项
  const roleOptions = [
    { label: '销售', value: '销售' },
    { label: '技术', value: '技术' },
    { label: '产品经理', value: '产品经理' },
    { label: '售前', value: '售前' },
    { label: '售后', value: '售后' },
    { label: '运维', value: '运维' },
    { label: '财务', value: '财务' },
  ];

  // 重置数据
  const resetData = () => {
    setCurrentStep(0);
    setDepartmentAllocations([]);
    setTotalWeight(0);
    setGrossProfit(0);
    setProfitPool(0);
  };

  // 加载项目结项信息
  const loadProjectClosure = async () => {
    if (!project) return;
    
    try {
      const response = await projectApi.getProjectClosure(project.id);
      if (response.resp_code === 0 && response.datas) {
        const profit = response.datas.grossProfit || 0;
        setGrossProfit(profit);
        // 计算50%提成池
        setProfitPool(profit * 0.5);
      } else {
        message.warning('未找到项目结项信息，请先完成项目结项');
      }
    } catch (error) {
      console.error('Failed to load project closure:', error);
      message.error('加载项目结项信息失败');
    }
  };

  // 计算部门分配金额
  const calculateDepartmentAmounts = () => {
    const updated = departmentAllocations.map(dept => {
      const totalAmount = profitPool * (dept.weight / 100);
      const employeeAmount = totalAmount * 0.8; // 80%给员工
      const reserveAmount = totalAmount * 0.2; // 20%给储备金
      
      return {
        ...dept,
        totalAmount,
        employeeAmount,
        reserveAmount,
      };
    });
    
    setDepartmentAllocations(updated);
    
    // 计算总权重
    const total = updated.reduce((sum, dept) => sum + dept.weight, 0);
    setTotalWeight(total);
  };

  // 添加部门分配
  const addDepartment = () => {
    const newDept: DepartmentAllocation = {
      key: Date.now().toString(),
      departmentName: '',
      weight: 0,
      totalAmount: 0,
      employeeAmount: 0,
      reserveAmount: 0,
      employeeDistributions: [],
    };
    setDepartmentAllocations([...departmentAllocations, newDept]);
  };

  // 删除部门分配
  const removeDepartment = (key: string) => {
    setDepartmentAllocations(departmentAllocations.filter(dept => dept.key !== key));
  };

  // 更新部门信息
  const updateDepartment = (key: string, field: string, value: any) => {
    const updated = departmentAllocations.map(dept => {
      if (dept.key === key) {
        return { ...dept, [field]: value };
      }
      return dept;
    });
    setDepartmentAllocations(updated);
  };

  // 添加员工分配
  const addEmployee = (deptKey: string) => {
    const updated = departmentAllocations.map(dept => {
      if (dept.key === deptKey) {
        const newEmployee: EmployeeDistribution = {
          key: Date.now().toString(),
          employeeId: '',
          employeeName: '',
          role: '',
          percentage: 0,
          amount: 0,
        };
        return {
          ...dept,
          employeeDistributions: [...dept.employeeDistributions, newEmployee],
        };
      }
      return dept;
    });
    setDepartmentAllocations(updated);
  };

  // 删除员工分配
  const removeEmployee = (deptKey: string, empKey: string) => {
    const updated = departmentAllocations.map(dept => {
      if (dept.key === deptKey) {
        return {
          ...dept,
          employeeDistributions: dept.employeeDistributions.filter(emp => emp.key !== empKey),
        };
      }
      return dept;
    });
    setDepartmentAllocations(updated);
  };

  // 更新员工信息
  const updateEmployee = (deptKey: string, empKey: string, field: string, value: any) => {
    const updated = departmentAllocations.map(dept => {
      if (dept.key === deptKey) {
        const updatedEmployees = dept.employeeDistributions.map(emp => {
          if (emp.key === empKey) {
            const newEmp = { ...emp, [field]: value };
            // 如果更新了百分比，重新计算金额
            if (field === 'percentage') {
              newEmp.amount = dept.employeeAmount * (value / 100);
            }
            return newEmp;
          }
          return emp;
        });
        return { ...dept, employeeDistributions: updatedEmployees };
      }
      return dept;
    });
    setDepartmentAllocations(updated);
  };

  // 步骤切换
  const nextStep = () => {
    if (currentStep === 0) {
      // 验证部门分配
      if (departmentAllocations.length === 0) {
        message.error('请至少添加一个部门分配');
        return;
      }
      if (totalWeight !== 100) {
        message.error('部门权重总和必须等于100%');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // 提交分配方案
  const handleSubmit = async () => {
    try {
      // 验证数据完整性
      for (const dept of departmentAllocations) {
        if (!dept.departmentName || dept.weight <= 0) {
          message.error(`请完善${dept.departmentName || '未命名'}部门的信息`);
          return;
        }
        
        // 验证员工分配
        const totalEmployeePercentage = dept.employeeDistributions.reduce((sum, emp) => sum + emp.percentage, 0);
        if (Math.abs(totalEmployeePercentage - 100) > 0.01) {
          message.error(`${dept.departmentName}的员工分配比例总和必须等于100%`);
          return;
        }
        
        for (const emp of dept.employeeDistributions) {
          if (!emp.employeeId || !emp.role || emp.percentage <= 0) {
            message.error(`请完善${dept.departmentName}中所有员工的信息`);
            return;
          }
        }
      }

      setLoading(true);

      if (!project) {
        message.error('项目信息不存在');
        return;
      }

      // 构造提交数据
      const distributionData = {
        projectId: project.id,
        grossProfit,
        profitPool,
        departmentAllocations: departmentAllocations.map(dept => ({
          departmentName: dept.departmentName,
          weight: dept.weight,
          totalAmount: dept.totalAmount,
          employeeAmount: dept.employeeAmount,
          reserveAmount: dept.reserveAmount,
          employees: dept.employeeDistributions.map(emp => ({
            employeeId: emp.employeeId,
            role: emp.role,
            percentage: emp.percentage,
            amount: emp.amount,
          })),
        })),
      };

      const response = await projectApi.createProfitDistribution(project.id, [distributionData]);

      if (response.resp_code === 0) {
        message.success('项目提成分配方案创建成功');
        resetData();
        onSuccess();
      } else {
        message.error(response.resp_msg || '提成分配方案创建失败');
      }
    } catch (error) {
      console.error('Failed to create profit distribution:', error);
      message.error('提成分配方案创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 监听权重变化，重新计算
  useEffect(() => {
    if (profitPool > 0) {
      calculateDepartmentAmounts();
    }
  }, [departmentAllocations, profitPool]);

  // 初始化数据
  useEffect(() => {
    if (visible && project) {
      loadProjectClosure();
    }
  }, [visible, project]);

  // 部门分配表格列
  const departmentColumns: ColumnsType<DepartmentAllocation> = [
    {
      title: '部门',
      dataIndex: 'departmentName',
      width: 120,
      render: (value: string, record: DepartmentAllocation) => (
        <Select
          style={{ width: '100%' }}
          placeholder="选择部门"
          value={value}
          onChange={(val) => updateDepartment(record.key, 'departmentName', val)}
        >
          {departmentOptions.map(dept => (
            <Option key={dept.value} value={dept.value}>
              {dept.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: '权重(%)',
      dataIndex: 'weight',
      width: 100,
      render: (value: number, record: DepartmentAllocation) => (
        <InputNumber
          style={{ width: '100%' }}
          placeholder="权重"
          value={value}
          min={0}
          max={100}
          precision={2}
          onChange={(val) => updateDepartment(record.key, 'weight', val || 0)}
        />
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      width: 120,
      render: (value: number) => (
        <Text type="primary">¥{(value || 0).toLocaleString()}</Text>
      ),
    },
    {
      title: '员工分配(80%)',
      dataIndex: 'employeeAmount',
      width: 120,
      render: (value: number) => (
        <Text style={{ color: '#52c41a' }}>¥{(value || 0).toLocaleString()}</Text>
      ),
    },
    {
      title: '储备金(20%)',
      dataIndex: 'reserveAmount',
      width: 120,
      render: (value: number) => (
        <Text style={{ color: '#faad14' }}>¥{(value || 0).toLocaleString()}</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record: DepartmentAllocation) => (
        <Button
          type="link"
          icon={<DeleteOutlined />}
          danger
          onClick={() => removeDepartment(record.key)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="项目提成分配"
      open={visible}
      onOk={currentStep === 1 ? handleSubmit : nextStep}
      onCancel={() => {
        resetData();
        onCancel();
      }}
      confirmLoading={loading}
      width={1200}
      destroyOnClose
      okText={currentStep === 1 ? '提交分配方案' : '下一步'}
      cancelText={currentStep === 0 ? '取消' : '上一步'}
      footer={[
        <Button key="cancel" onClick={currentStep === 0 ? () => { resetData(); onCancel(); } : prevStep}>
          {currentStep === 0 ? '取消' : '上一步'}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={currentStep === 1 ? handleSubmit : nextStep}>
          {currentStep === 1 ? '提交分配方案' : '下一步'}
        </Button>,
      ]}
    >
      {project && (
        <>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <strong>项目名称：</strong>{project.name}
              </Col>
              <Col span={8}>
                <strong>项目分类：</strong>{project.category}
              </Col>
              <Col span={8}>
                <strong>客户名称：</strong>{project.customerName}
              </Col>
            </Row>
          </Card>

          <Steps current={currentStep} style={{ marginBottom: 24 }}>
            <Step title="部门分配" description="设置各部门权重分配" />
            <Step title="员工分配" description="设置部门内员工分配" />
          </Steps>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="项目毛利润"
                  value={grossProfit}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="元"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="提成池(50%)"
                  value={profitPool}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="元"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="部门权重"
                  value={totalWeight}
                  precision={2}
                  suffix="%"
                  valueStyle={{ 
                    color: totalWeight === 100 ? '#3f8600' : '#cf1322' 
                  }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="参与部门"
                  value={departmentAllocations.length}
                  prefix={<BankOutlined />}
                  suffix="个"
                />
              </Card>
            </Col>
          </Row>

          {currentStep === 0 && (
            <>
              <Alert
                message="提成分配规则"
                description="项目毛利润的50%作为提成池，按部门权重分配。每个部门80%分配给员工个人，20%进入部门储备金账户。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Row style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={addDepartment}
                    >
                      添加部门
                    </Button>
                    {totalWeight !== 100 && (
                      <Tag color="error">
                        部门权重总和必须等于100%，当前：{totalWeight}%
                      </Tag>
                    )}
                  </Space>
                </Col>
              </Row>

              <Table
                columns={departmentColumns}
                dataSource={departmentAllocations}
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
                locale={{ emptyText: '暂无部门分配，请点击"添加部门"按钮添加' }}
              />
            </>
          )}

          {currentStep === 1 && (
            <>
              <Alert
                message="员工分配设置"
                description="为每个部门的员工设置分配比例，部门内员工分配比例总和必须等于100%。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              {departmentAllocations.map(dept => (
                <Card key={dept.key} title={`${dept.departmentName} - 员工分配`} style={{ marginBottom: 16 }}>
                  <Row gutter={16} style={{ marginBottom: 12 }}>
                    <Col span={8}>
                      <Text>可分配金额：<Text type="success">¥{dept.employeeAmount.toLocaleString()}</Text></Text>
                    </Col>
                    <Col span={8}>
                      <Text>储备金：<Text type="warning">¥{dept.reserveAmount.toLocaleString()}</Text></Text>
                    </Col>
                    <Col span={8}>
                      <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => addEmployee(dept.key)}
                      >
                        添加员工
                      </Button>
                    </Col>
                  </Row>
                  
                  {dept.employeeDistributions.map(emp => (
                    <Row key={emp.key} gutter={8} style={{ marginBottom: 8 }}>
                      <Col span={6}>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="选择员工"
                          value={emp.employeeId}
                          onChange={(val) => updateEmployee(dept.key, emp.key, 'employeeId', val)}
                        >
                          {/* TODO: 从员工API获取选项 */}
                          <Option value="1">张三</Option>
                          <Option value="2">李四</Option>
                          <Option value="3">王五</Option>
                        </Select>
                      </Col>
                      <Col span={5}>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="角色"
                          value={emp.role}
                          onChange={(val) => updateEmployee(dept.key, emp.key, 'role', val)}
                        >
                          {roleOptions.map(role => (
                            <Option key={role.value} value={role.value}>
                              {role.label}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={5}>
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="分配比例%"
                          value={emp.percentage}
                          min={0}
                          max={100}
                          precision={2}
                          onChange={(val) => updateEmployee(dept.key, emp.key, 'percentage', val || 0)}
                        />
                      </Col>
                      <Col span={6}>
                        <Text type="success">¥{emp.amount.toLocaleString()}</Text>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => removeEmployee(dept.key, emp.key)}
                        />
                      </Col>
                    </Row>
                  ))}
                  
                  {dept.employeeDistributions.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                      暂无员工分配，请点击"添加员工"按钮
                    </div>
                  )}
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default ProfitDistributionModal; 