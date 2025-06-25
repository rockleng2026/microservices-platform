import React, { useState, useEffect } from 'react';
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
} from 'antd';
import { PlusOutlined, DeleteOutlined, DollarOutlined, PercentageOutlined, BankOutlined } from '@ant-design/icons';
import { projectApi } from '@/services/project';
import { getEmployeeDetail } from '@/services/organization/employee';
import { getDepartmentDetail, batchGetEmployeeMainDepartments } from '@/services/organization/department';
import type { Project } from '@/types/project';

const { Text } = Typography;

interface EmployeeDistribution {
  key: string;
  employeeId: string;
  employeeName: string;
  weight: number;
  amount: number;
  isFixedAmount: boolean; // true: 固定金额, false: 按比例
}

interface DepartmentAllocation {
  key: string;
  departmentId: string;
  departmentName: string;
  weight: number; // 部门权重（占总提成的百分比）
  totalAmount: number; // 部门总金额
  reserveRatio: number; // 储备金比例，默认20%
  employeeDistributions: EmployeeDistribution[]; // 员工分配列表
  expanded?: boolean; // 是否展开显示员工
}

type DistributionMode = 'ratio' | 'fixed'; // ratio: 按比例, fixed: 固定金额

interface ProfitDistributionModalProps {
  visible: boolean;
  project: Project | null;
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
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('ratio');
  
  // 项目基础数据
  const [projectActualAmount, setProjectActualAmount] = useState(0); // 项目实际金额
  const [grossProfit, setGrossProfit] = useState(0); // 毛利润
  const [grossProfitRate, setGrossProfitRate] = useState(0); // 毛利率
  
  // 提成分配设置
  const [maxDistributionRatio, setMaxDistributionRatio] = useState(50); // 最大分配比例，默认50%
  const [maxDistributionAmount, setMaxDistributionAmount] = useState(0); // 最大提成金额
  
  const [departmentAllocations, setDepartmentAllocations] = useState<DepartmentAllocation[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Array<{label: string, value: string, name: string}>>([]);
  const [employeeDepartmentMap, setEmployeeDepartmentMap] = useState<Map<number, {id: string, name: string}>>(new Map());
  const [projectDetailData, setProjectDetailData] = useState<any>(null);

  useEffect(() => {
    if (visible && project) {
      form.resetFields();
      setDepartmentAllocations([]);
      initializeProjectData();
      extractDepartmentsFromProject();
    }
  }, [visible, project]);

  // 初始化项目数据
  const initializeProjectData = () => {
    if (!project) return;

    // 假设项目有这些字段，实际需要根据Project类型调整
    const actualAmount = (project as any).actualAmount || (project as any).totalAmount || 100000;
    const projectGrossProfit = (project as any).grossProfit || actualAmount * 0.3; // 假设30%毛利率
    
    setProjectActualAmount(actualAmount);
    setGrossProfit(projectGrossProfit);
    
    // 计算毛利率
    const profitRate = actualAmount > 0 ? (projectGrossProfit / actualAmount) * 100 : 0;
    setGrossProfitRate(profitRate);
    
    // 设置最大提成金额
    const maxAmount = (projectGrossProfit * maxDistributionRatio) / 100;
    setMaxDistributionAmount(maxAmount);
  };

  // 动态计算关联数据
  useEffect(() => {
    // 毛利率 = 毛利润 / 项目实际金额
    if (projectActualAmount > 0) {
      const profitRate = (grossProfit / projectActualAmount) * 100;
      setGrossProfitRate(profitRate);
    }
  }, [grossProfit, projectActualAmount]);

  useEffect(() => {
    // 最大提成金额 = 毛利润 * 最大分配比例
    const maxAmount = (grossProfit * maxDistributionRatio) / 100;
    setMaxDistributionAmount(maxAmount);
  }, [grossProfit, maxDistributionRatio]);

  // 从项目参与人中提取部门信息
  const extractDepartmentsFromProject = async () => {
    if (!project) {
      return;
    }

    console.log('开始提取项目部门信息...');
    setLoading(true);

    try {
      // 第一步：获取项目完整详情（包含参与人信息）
      console.log('获取项目详情...');
      const projectDetailResponse = await projectApi.getProjectById(project.id);
      
      if (projectDetailResponse.resp_code !== 0 || !projectDetailResponse.datas) {
        throw new Error('获取项目详情失败');
      }

      const projectDetail = projectDetailResponse.datas;
      console.log('项目详情:', projectDetail);

      // 第二步：收集所有员工ID（去重）
      const employeeIdSet = new Set<string>();
      
      // 添加项目负责人
      if (projectDetail.leaderId) {
        employeeIdSet.add(String(projectDetail.leaderId));
      }
      
      // 添加项目参与人
      if (projectDetail.participantDetails && projectDetail.participantDetails.length > 0) {
        projectDetail.participantDetails.forEach(participant => {
          if (participant.participantId) {
            employeeIdSet.add(String(participant.participantId));
          }
        });
      }

      const employeeIds = Array.from(employeeIdSet);
      console.log('需要查询的员工ID:', employeeIds);

      if (employeeIds.length === 0) {
        throw new Error('未找到项目参与人员');
      }

      // 第三步：批量查询员工所属大部门
      console.log('批量查询员工所属大部门...');
      const batchResponse = await batchGetEmployeeMainDepartments(employeeIds);
      
      if (!batchResponse || batchResponse.resp_code !== 0 || !batchResponse.datas) {
        throw new Error('批量查询员工大部门失败');
      }

      const batchResult = batchResponse.datas;
      console.log('批量查询结果:', batchResult);

      const employeeDepartmentMap = new Map<number, {id: string, name: string}>();
      const departmentOptions: Array<{label: string, value: string, name: string}> = [];

      // 处理查询结果
      if (batchResult.employeeDepartmentMap) {
        Object.entries(batchResult.employeeDepartmentMap).forEach(([empId, deptInfo]: [string, any]) => {
          employeeDepartmentMap.set(Number(empId), {
            id: deptInfo.id,
            name: deptInfo.name
          });
        });
      }

      if (batchResult.departments) {
        batchResult.departments.forEach((dept: any) => {
          departmentOptions.push({
            label: dept.name,
            value: dept.id,
            name: dept.name
          });
        });
      }

      console.log('员工与大部门映射关系:', employeeDepartmentMap);
      console.log('大部门选项:', departmentOptions);

      if (departmentOptions.length === 0) {
        throw new Error('未找到任何有效的大部门信息');
      }

      // 第四步：获取员工详情（逐个查询）
      console.log('获取员工详情...');
      const employeeDetailsMap = new Map<string, any>();
      
      for (const empId of employeeIds) {
        try {
          const empResponse = await getEmployeeDetail(Number(empId));
          if (empResponse && empResponse.data) {
            employeeDetailsMap.set(empId, empResponse.data);
          }
        } catch (error) {
          console.warn(`获取员工${empId}详情失败:`, error);
        }
      }

      // 第五步：设置数据并初始化分配
      setAvailableDepartments(departmentOptions);
      setEmployeeDepartmentMap(employeeDepartmentMap);
      setProjectDetailData(projectDetail);

      // 初始化部门分配，包含员工信息
      const initialAllocations = await initializeDepartmentAllocations(
        departmentOptions, 
        employeeDepartmentMap, 
        employeeDetailsMap, 
        projectDetail
      );

      console.log('初始化部门分配:', initialAllocations);
      setDepartmentAllocations(initialAllocations);
      
      message.success(`成功识别到${departmentOptions.length}个参与部门`);

    } catch (error) {
      console.error('提取部门信息失败:', error);
      message.error('提取部门信息失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // 初始化部门分配数据
  const initializeDepartmentAllocations = async (
    departments: Array<{label: string, value: string, name: string}>,
    empDeptMap: Map<number, {id: string, name: string}>,
    employeeDetailsMap: Map<string, any>,
    projectDetail: any
  ): Promise<DepartmentAllocation[]> => {
    
    // 按部门分组员工
    const departmentEmployeesMap = new Map<string, Array<{id: string, name: string}>>();
    
    // 初始化部门员工列表
    departments.forEach(dept => {
      departmentEmployeesMap.set(dept.value, []);
    });

    // 分配员工到对应部门
    empDeptMap.forEach((deptInfo, empId) => {
      const employee = employeeDetailsMap.get(String(empId));
      if (employee && departmentEmployeesMap.has(deptInfo.id)) {
        departmentEmployeesMap.get(deptInfo.id)!.push({
          id: String(empId),
          name: employee.name
        });
      }
    });

    // 创建部门分配数据
    const averageWeight = Math.floor(100 / departments.length); // 总共100%分配给各部门
    const remainder = 100 - (averageWeight * departments.length);
    
    return departments.map((dept, index) => {
      const employees = departmentEmployeesMap.get(dept.value) || [];
      const departmentWeight = index === 0 ? averageWeight + remainder : averageWeight;
      
      // 为每个员工初始化权重（平均分配给员工）
      const employeeCount = employees.length;
      const avgEmployeeWeight = employeeCount > 0 ? 80 / employeeCount : 0; // 假设80%分配给员工
      
      const employeeDistributions: EmployeeDistribution[] = employees.map((emp) => ({
        key: `emp_${dept.value}_${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        weight: Number(avgEmployeeWeight.toFixed(2)),
        amount: 0,
        isFixedAmount: false
      }));

      return {
        key: `dept_${dept.value}`,
        departmentId: dept.value,
        departmentName: dept.name,
        weight: departmentWeight,
        totalAmount: 0,
        reserveRatio: 20, // 默认20%储备金（现在是动态计算的）
        employeeDistributions,
        expanded: true
      };
    });
  };

  // 计算金额 - 根据权重动态分配
  const calculateAmounts = () => {
    const updatedAllocations = departmentAllocations.map(dept => {
      // 1. 计算部门分配金额 = 毛利润 * 最大分配比例 * 部门权重比例
      // 例如：毛利润10万 * 最大分配比例50% * 技术部权重20% = 1万
      const deptAmount = (grossProfit * maxDistributionRatio / 100) * (dept.weight / 100);
      
      // 2. 计算员工分配金额 - 基于最大分配比例作为基准
      const updatedEmployees = dept.employeeDistributions.map(emp => {
        if (emp.isFixedAmount) {
          // 固定金额员工保持原金额
          return { ...emp };
        } else {
          // 按权重分配的员工：毛利润 * 最大分配比例 * 员工权重比例
          // 例如：毛利润10万 * 最大分配比例50% * 员工权重5% = 2500元
          const amount = (grossProfit * maxDistributionRatio / 100) * (emp.weight / 100);
          return { ...emp, amount: Math.max(0, amount) };
        }
      });

      return {
        ...dept,
        totalAmount: deptAmount,
        employeeDistributions: updatedEmployees
      };
    });

    setDepartmentAllocations(updatedAllocations);
  };

  // 监听相关数据变化，触发重新计算
  useEffect(() => {
    if (departmentAllocations.length > 0) {
      calculateAmounts();
    }
  }, [grossProfit, maxDistributionRatio]);

  // 监听部门分配数据变化，触发重新计算
  useEffect(() => {
    if (departmentAllocations.length > 0) {
      const timeoutId = setTimeout(() => {
        calculateAmounts();
      }, 100); // 防抖，避免频繁计算
      
      return () => clearTimeout(timeoutId);
    }
  }, [departmentAllocations]);

  // 更新部门信息
  const updateDepartment = (key: string, field: string, value: any) => {
    const updatedAllocations = departmentAllocations.map(dept => {
      if (dept.key === key) {
        return { ...dept, [field]: value };
      }
      return dept;
    });
    setDepartmentAllocations(updatedAllocations);
  };

  // 更新员工信息
  const updateEmployee = (deptKey: string, empKey: string, field: string, value: any) => {
    const updatedAllocations = departmentAllocations.map(dept => {
      if (dept.key === deptKey) {
        const updatedEmployees = dept.employeeDistributions.map(emp => {
          if (emp.key === empKey) {
            return { ...emp, [field]: value };
          }
          return emp;
        });
        return { ...dept, employeeDistributions: updatedEmployees };
      }
      return dept;
    });
    setDepartmentAllocations(updatedAllocations);
  };

  // 添加部门
  const addDepartment = () => {
    const newDept: DepartmentAllocation = {
      key: `dept_new_${Date.now()}`,
      departmentId: '',
      departmentName: '',
      weight: 0,
      totalAmount: 0,
      reserveRatio: 20,
      employeeDistributions: [],
      expanded: true
    };
    setDepartmentAllocations([...departmentAllocations, newDept]);
  };

  // 删除部门
  const deleteDepartment = (key: string) => {
    setDepartmentAllocations(departmentAllocations.filter(dept => dept.key !== key));
  };

  // 添加员工到部门
  const addEmployeeToDepartment = (deptKey: string) => {
    const dept = departmentAllocations.find(d => d.key === deptKey);
    if (!dept) return;

    // 计算当前员工权重总和
    const currentEmployeeWeightSum = dept.employeeDistributions.reduce((sum, emp) => {
      return emp.isFixedAmount ? sum : sum + emp.weight;
    }, 0);
    
    // 计算固定金额员工占用的权重等值
    const fixedAmountTotal = dept.employeeDistributions.reduce((sum, emp) => {
      return emp.isFixedAmount ? sum + emp.amount : sum;
    }, 0);
    const maxDistributionTotal = (grossProfit * maxDistributionRatio / 100);
    const fixedAmountWeight = maxDistributionTotal > 0 ? (fixedAmountTotal / maxDistributionTotal) * 100 : 0;
    
    // 可分配的剩余权重
    const remainingWeight = Math.max(0, dept.weight - currentEmployeeWeightSum - fixedAmountWeight);
    
    // 默认权重：取剩余权重的30-50%，但不超过部门权重的10%
    const defaultWeight = Math.min(
      remainingWeight * 0.4, // 剩余权重的40%
      dept.weight * 0.1,     // 部门权重的10%
      5                      // 最大不超过5%
    );

    const newEmployee: EmployeeDistribution = {
      key: `emp_${Date.now()}_${Math.random()}`,
      employeeId: '',
      employeeName: '',
      weight: Math.max(1, defaultWeight), // 最小1%
      amount: 0,
      isFixedAmount: false
    };

    setDepartmentAllocations(prev =>
      prev.map(dept =>
        dept.key === deptKey
          ? {
              ...dept,
              employeeDistributions: [...dept.employeeDistributions, newEmployee],
              expanded: true
            }
          : dept
      )
    );
  };

  // 删除员工
  const deleteEmployee = (deptKey: string, empKey: string) => {
    const updatedAllocations = departmentAllocations.map(dept => {
      if (dept.key === deptKey) {
        return {
          ...dept,
          employeeDistributions: dept.employeeDistributions.filter(emp => emp.key !== empKey)
        };
      }
      return dept;
    });
    setDepartmentAllocations(updatedAllocations);
  };

  // 切换部门展开状态
  const toggleDepartmentExpanded = (key: string) => {
    const updatedAllocations = departmentAllocations.map(dept => {
      if (dept.key === key) {
        return { ...dept, expanded: !dept.expanded };
      }
      return dept;
    });
    setDepartmentAllocations(updatedAllocations);
  };

  // 验证权重
  const validateWeights = (): boolean => {
    // 验证所有部门权重之和不超过100%（基于最大分配比例）
    const totalDeptWeight = departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0);
    if (totalDeptWeight > 100) {
      message.error('所有部门权重之和不能超过100%');
      return false;
    }

    // 验证每个部门下员工权重之和不超过部门权重
    for (const dept of departmentAllocations) {
      const deptWeight = dept.weight;
      
      // 计算员工权重总和（按权重分配的员工）
      const totalEmpWeight = dept.employeeDistributions.reduce((sum, emp) => {
        return emp.isFixedAmount ? sum : sum + emp.weight;
      }, 0);
      
      // 计算固定金额员工占用的权重等值
      const fixedAmountTotal = dept.employeeDistributions.reduce((sum, emp) => {
        return emp.isFixedAmount ? sum + emp.amount : sum;
      }, 0);
      
      const maxDistributionTotal = (grossProfit * maxDistributionRatio / 100);
      const fixedAmountWeight = maxDistributionTotal > 0 ? (fixedAmountTotal / maxDistributionTotal) * 100 : 0;
      
      const totalUsedWeight = totalEmpWeight + fixedAmountWeight;
      
      if (totalUsedWeight > deptWeight) {
        message.error(`部门"${dept.departmentName}"员工权重总和(${totalUsedWeight.toFixed(2)}%)超过部门权重(${deptWeight.toFixed(2)}%)`);
        return false;
      }
    }

    return true;
  };

  // 保存提成分配
  const handleSave = async () => {
    if (!validateWeights()) {
      return;
    }

    try {
      setLoading(true);
      
      const distributionData = {
        projectId: project?.id,
        distributionMode,
        projectActualAmount,
        grossProfit,
        grossProfitRate,
        maxDistributionRatio,
        maxDistributionAmount,
        totalDistributionAmount: departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0),
        departmentAllocations
      };

      console.log('保存提成分配数据:', distributionData);
      
      // 临时使用现有API，实际需要新增saveProfitDistribution方法
      message.success('提成分配功能演示完成');
      onSuccess();
      onCancel();
      
    } catch (error) {
      console.error('保存提成分配失败:', error);
      message.error('保存失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // 渲染员工行
  const renderEmployeeRows = (dept: DepartmentAllocation) => {
    if (!dept.expanded) return null;

    return dept.employeeDistributions.map(emp => (
      <tr key={emp.key} style={{ backgroundColor: '#fafafa' }}>
        <td style={{ paddingLeft: '40px', borderRight: '1px solid #d9d9d9' }}>
          <Space>
            <span>└─</span>
            {emp.employeeId ? (
              <span>{emp.employeeName}</span>
            ) : (
              <Select
                value={emp.employeeId || undefined}
                onChange={(value) => {
                  updateEmployee(dept.key, emp.key, 'employeeId', value);
                  updateEmployee(dept.key, emp.key, 'employeeName', `员工${value}`);
                }}
                placeholder="选择员工"
                style={{ width: '150px' }}
              >
                {Array.from(employeeDepartmentMap.entries())
                  .filter(([empId, deptInfo]) => deptInfo.id === dept.departmentId)
                  .map(([empId, deptInfo]) => (
                    <Select.Option key={empId} value={String(empId)}>
                      员工{empId}
                    </Select.Option>
                  ))}
              </Select>
            )}
          </Space>
        </td>
        <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
          {emp.isFixedAmount ? (
            <InputNumber
              value={emp.amount}
              onChange={(value) => updateEmployee(dept.key, emp.key, 'amount', value || 0)}
              min={0}
              precision={2}
              formatter={value => `¥ ${String(value || '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(String(value || '').replace(/¥\s?|(,*)/g, ''))}
              style={{ width: '120px' }}
            />
          ) : (
            <div>
              <InputNumber
                value={emp.weight}
                onChange={(value) => updateEmployee(dept.key, emp.key, 'weight', value || 0)}
                min={0}
                max={100}
                precision={2}
                formatter={value => `${String(value || '')}%`}
                parser={value => Number(String(value || '').replace('%', ''))}
                style={{ width: '100px' }}
              />
              {/* 显示权重约束提示 */}
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                {(() => {
                  // 计算当前部门员工权重使用情况
                  const currentEmpWeightSum = dept.employeeDistributions.reduce((sum, e) => {
                    return e.isFixedAmount ? sum : sum + e.weight;
                  }, 0);
                  
                  // 计算固定金额占用的权重
                  const fixedTotal = dept.employeeDistributions.reduce((sum, e) => {
                    return e.isFixedAmount ? sum + e.amount : sum;
                  }, 0);
                  const maxTotal = (grossProfit * maxDistributionRatio / 100);
                  const fixedWeight = maxTotal > 0 ? (fixedTotal / maxTotal) * 100 : 0;
                  
                  const totalUsed = currentEmpWeightSum + fixedWeight;
                  const remaining = Math.max(0, dept.weight - totalUsed);
                  
                  const isOverLimit = totalUsed > dept.weight;
                  
                                                   return (
                                   <span style={{ color: isOverLimit ? '#ff4d4f' : '#52c41a' }}>
                                     已用:{totalUsed.toFixed(1)}% / 部门:{dept.weight.toFixed(1)}%
                                     {isOverLimit && <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>超限!</span>}
                                   </span>
                                 );
                })()}
              </div>
            </div>
          )}
        </td>
        <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
          ¥{emp.amount.toFixed(2)}
        </td>
        <td style={{ padding: '12px' }}>
          <Space>
            <Radio.Group
              value={emp.isFixedAmount ? 'fixed' : 'ratio'}
              onChange={(e) => updateEmployee(dept.key, emp.key, 'isFixedAmount', e.target.value === 'fixed')}
              size="small"
            >
              <Radio.Button value="ratio">比例</Radio.Button>
              <Radio.Button value="fixed">固定</Radio.Button>
            </Radio.Group>
            <Popconfirm
              title="确定删除这个员工吗？"
              onConfirm={() => deleteEmployee(dept.key, emp.key)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        </td>
      </tr>
    ));
  };

  return (
    <Modal
      title={`项目提成分配 - ${project?.name}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      width={1200}
      confirmLoading={loading}
      destroyOnClose
    >
      {/* 项目基础信息和提成设置 */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="项目实际金额"
                value={projectActualAmount}
                precision={2}
                prefix={<DollarOutlined />}
                formatter={(value) => `¥ ${value?.toLocaleString() || 0}`}
              />
              <div style={{ marginTop: 8 }}>
                <InputNumber
                  value={projectActualAmount}
                  onChange={(value) => setProjectActualAmount(value || 0)}
                  min={0}
                  precision={2}
                  formatter={value => `¥ ${String(value || '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(String(value || '').replace(/¥\s?|(,*)/g, ''))}
                  style={{ width: '100%' }}
                  size="small"
                />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="毛利润"
                value={grossProfit}
                precision={2}
                prefix={<BankOutlined />}
                formatter={(value) => `¥ ${value?.toLocaleString() || 0}`}
              />
              <div style={{ marginTop: 8 }}>
                <InputNumber
                  value={grossProfit}
                  onChange={(value) => setGrossProfit(value || 0)}
                  min={0}
                  precision={2}
                  formatter={value => `¥ ${String(value || '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(String(value || '').replace(/¥\s?|(,*)/g, ''))}
                  style={{ width: '100%' }}
                  size="small"
                />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="毛利率"
                value={grossProfitRate}
                precision={2}
                suffix="%"
                prefix={<PercentageOutlined />}
                valueStyle={{ color: grossProfitRate >= 30 ? '#3f8600' : grossProfitRate >= 15 ? '#faad14' : '#cf1322' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                自动计算：毛利润 ÷ 实际金额
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="最大分配比例"
                value={maxDistributionRatio}
                precision={0}
                suffix="%"
                prefix={<PercentageOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <InputNumber
                  value={maxDistributionRatio}
                  onChange={(value) => setMaxDistributionRatio(value || 50)}
                  min={0}
                  max={100}
                  precision={0}
                  formatter={value => `${String(value || '')}%`}
                  parser={value => Number(String(value || '').replace('%', ''))}
                  style={{ width: '100%' }}
                  size="small"
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="最大提成金额"
                value={maxDistributionAmount}
                precision={2}
                prefix={<BankOutlined />}
                formatter={(value) => `¥ ${value?.toLocaleString() || 0}`}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                自动计算：毛利润 × 最大分配比例
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="实际分配金额"
                value={departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0)}
                precision={2}
                prefix={<BankOutlined />}
                formatter={(value) => `¥ ${value?.toLocaleString() || 0}`}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                基于部门权重自动计算
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="分配利用率"
                value={maxDistributionAmount > 0 ? 
                  ((departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0) / maxDistributionAmount) * 100) : 0}
                precision={1}
                suffix="%"
                prefix={<PercentageOutlined />}
                valueStyle={{ 
                  color: departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0) / maxDistributionAmount > 0.8 ? '#52c41a' : '#faad14' 
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                实际分配 ÷ 最大可分配
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider>部门提成分配</Divider>

      <Form form={form} layout="vertical">
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={addDepartment}>
              添加部门
            </Button>
            <span style={{ color: '#666' }}>
              权重约束：所有部门权重之和 ≤ 100%（基于最大分配比例），员工权重之和 ≤ 部门权重
            </span>
            <Text type="secondary">
              最大可分配：¥{maxDistributionAmount.toLocaleString()}
            </Text>
          </Space>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d9d9d9' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #d9d9d9' }}>部门/员工</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #d9d9d9' }}>权重/金额</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #d9d9d9' }}>分配金额</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #d9d9d9' }}>部门储备金</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {departmentAllocations.map(dept => {
              // 计算部门实际储备金情况
              const deptTotalAmount = dept.totalAmount;
              const employeeTotalAmount = dept.employeeDistributions.reduce((sum, emp) => sum + emp.amount, 0);
              const actualReserveAmount = deptTotalAmount - employeeTotalAmount;
              const actualReserveRatio = deptTotalAmount > 0 ? (actualReserveAmount / deptTotalAmount) * 100 : 0;
              
              return (
                <React.Fragment key={dept.key}>
                  {/* 部门行 */}
                  <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                    <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                      <Space>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => toggleDepartmentExpanded(dept.key)}
                        >
                          {dept.expanded ? '▼' : '▶'}
                        </Button>
                        <Select
                          value={dept.departmentId || undefined}
                          onChange={(value) => {
                            const selectedDept = availableDepartments.find(d => d.value === value);
                            updateDepartment(dept.key, 'departmentId', value);
                            updateDepartment(dept.key, 'departmentName', selectedDept?.name || '');
                          }}
                          placeholder="选择部门"
                          style={{ width: '200px' }}
                        >
                          {availableDepartments.map(option => (
                            <Select.Option key={option.value} value={option.value}>
                              {option.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Space>
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                      <InputNumber
                        value={dept.weight}
                        onChange={(value) => updateDepartment(dept.key, 'weight', value || 0)}
                        min={0}
                        max={100}
                        precision={2}
                        formatter={value => `${String(value || '')}%`}
                        parser={value => Number(String(value || '').replace('%', ''))}
                        style={{ width: '100px' }}
                      />
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                      ¥{dept.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: '#666' }}>比例：</span>
                          <span style={{ fontWeight: 'bold', color: actualReserveRatio > 30 ? '#ff4d4f' : '#52c41a' }}>
                            {actualReserveRatio.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: '#666' }}>金额：</span>
                          <span style={{ fontWeight: 'bold' }}>
                            ¥{actualReserveAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Space>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => addEmployeeToDepartment(dept.key)}
                          size="small"
                        >
                          添加员工
                        </Button>
                        <Popconfirm
                          title="确定删除这个部门吗？"
                          onConfirm={() => deleteDepartment(dept.key)}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                      </Space>
                    </td>
                  </tr>
                  {/* 员工行 */}
                  {dept.expanded && dept.employeeDistributions.map(emp => (
                    <tr key={emp.key} style={{ backgroundColor: '#fafafa' }}>
                      <td style={{ paddingLeft: '40px', borderRight: '1px solid #d9d9d9' }}>
                        <Space>
                          <span>└─</span>
                          {emp.employeeId ? (
                            <span>{emp.employeeName}</span>
                          ) : (
                            <Select
                              value={emp.employeeId || undefined}
                              onChange={(value) => {
                                updateEmployee(dept.key, emp.key, 'employeeId', value);
                                updateEmployee(dept.key, emp.key, 'employeeName', `员工${value}`);
                              }}
                              placeholder="选择员工"
                              style={{ width: '150px' }}
                            >
                              {Array.from(employeeDepartmentMap.entries())
                                .filter(([empId, deptInfo]) => deptInfo.id === dept.departmentId)
                                .map(([empId, deptInfo]) => (
                                  <Select.Option key={empId} value={String(empId)}>
                                    员工{empId}
                                  </Select.Option>
                                ))}
                            </Select>
                          )}
                        </Space>
                      </td>
                      <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                        {emp.isFixedAmount ? (
                          <InputNumber
                            value={emp.amount}
                            onChange={(value) => updateEmployee(dept.key, emp.key, 'amount', value || 0)}
                            min={0}
                            precision={2}
                            formatter={value => `¥ ${String(value || '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => Number(String(value || '').replace(/¥\s?|(,*)/g, ''))}
                            style={{ width: '120px' }}
                          />
                        ) : (
                          <div>
                            <InputNumber
                              value={emp.weight}
                              onChange={(value) => updateEmployee(dept.key, emp.key, 'weight', value || 0)}
                              min={0}
                              max={100}
                              precision={2}
                              formatter={value => `${String(value || '')}%`}
                              parser={value => Number(String(value || '').replace('%', ''))}
                              style={{ width: '100px' }}
                            />
                            {/* 显示权重约束提示 */}
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                              {(() => {
                                // 计算当前部门员工权重使用情况
                                const currentEmpWeightSum = dept.employeeDistributions.reduce((sum, e) => {
                                  return e.isFixedAmount ? sum : sum + e.weight;
                                }, 0);
                                
                                // 计算固定金额占用的权重
                                const fixedTotal = dept.employeeDistributions.reduce((sum, e) => {
                                  return e.isFixedAmount ? sum + e.amount : sum;
                                }, 0);
                                const maxTotal = (grossProfit * maxDistributionRatio / 100);
                                const fixedWeight = maxTotal > 0 ? (fixedTotal / maxTotal) * 100 : 0;
                                
                                const totalUsed = currentEmpWeightSum + fixedWeight;
                                const remaining = Math.max(0, dept.weight - totalUsed);
                                
                                const isOverLimit = totalUsed > dept.weight;
                                
                                return (
                                  <span style={{ color: isOverLimit ? '#ff4d4f' : '#52c41a' }}>
                                    已用:{totalUsed.toFixed(1)}% / 部门:{dept.weight.toFixed(1)}%
                                    {isOverLimit && <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>超限!</span>}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                        ¥{emp.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                        {/* 员工行不显示储备金信息 */}
                        <span style={{ color: '#ccc' }}>—</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Space>
                          <Radio.Group
                            value={emp.isFixedAmount ? 'fixed' : 'ratio'}
                            onChange={(e) => updateEmployee(dept.key, emp.key, 'isFixedAmount', e.target.value === 'fixed')}
                            size="small"
                          >
                            <Radio.Button value="ratio">比例</Radio.Button>
                            <Radio.Button value="fixed">固定</Radio.Button>
                          </Radio.Group>
                          <Popconfirm
                            title="确定删除这个员工吗？"
                            onConfirm={() => deleteEmployee(dept.key, emp.key)}
                          >
                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                          </Popconfirm>
                        </Space>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            {/* 汇总行 */}
            <tr style={{ backgroundColor: '#f0f2f5', borderTop: '2px solid #d9d9d9', fontWeight: 'bold' }}>
              <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                <Text strong>汇总</Text>
              </td>
              <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                <Text strong style={{ 
                  color: departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0) > 100 ? '#ff4d4f' : '#52c41a' 
                }}>
                  {departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0).toFixed(2)}%
                </Text>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                  / 100%
                </Text>
              </td>
              <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                <Text strong>
                  ¥{departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0).toFixed(2)}
                </Text>
              </td>
              <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                <Text strong>
                  ¥{departmentAllocations.reduce((sum, dept) => {
                    const employeeTotal = dept.employeeDistributions.reduce((empSum, emp) => empSum + emp.amount, 0);
                    return sum + (dept.totalAmount - employeeTotal);
                  }, 0).toFixed(2)}
                </Text>
              </td>
              <td style={{ padding: '12px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  剩余：¥{(maxDistributionAmount - departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0)).toLocaleString()}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 分配详情汇总 */}
        <div style={{ marginTop: 16, padding: 16, backgroundColor: '#fafafa', borderRadius: 6 }}>
          <Row gutter={16}>
            <Col span={5}>
              <Text type="secondary">总权重使用：</Text>
              <Text strong style={{ 
                color: departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0) > 100 ? '#ff4d4f' : '#52c41a',
                marginLeft: 8 
              }}>
                {departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0).toFixed(2)}% / 100%
              </Text>
            </Col>
            <Col span={5}>
              <Text type="secondary">员工分配：</Text>
              <Text strong style={{ marginLeft: 8 }}>
                ¥{departmentAllocations.reduce((sum, dept) => {
                  const employeeTotal = dept.employeeDistributions.reduce((empSum, emp) => empSum + emp.amount, 0);
                  return sum + employeeTotal;
                }, 0).toLocaleString()}
              </Text>
            </Col>
            <Col span={5}>
              <Text type="secondary">储备金总额：</Text>
              <Text strong style={{ marginLeft: 8 }}>
                ¥{departmentAllocations.reduce((sum, dept) => {
                  const employeeTotal = dept.employeeDistributions.reduce((empSum, emp) => empSum + emp.amount, 0);
                  return sum + (dept.totalAmount - employeeTotal);
                }, 0).toLocaleString()}
              </Text>
            </Col>
            <Col span={5}>
              <Text type="secondary">剩余可分配：</Text>
              <Text strong style={{ marginLeft: 8 }}>
                ¥{(maxDistributionAmount - departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0)).toLocaleString()}
              </Text>
            </Col>
            <Col span={4}>
              <Text type="secondary">分配利用率：</Text>
              <Text strong style={{ marginLeft: 8 }}>
                {maxDistributionAmount > 0 ? 
                  ((departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0) / maxDistributionAmount) * 100).toFixed(1) 
                  : '0'}%
              </Text>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default ProfitDistributionModal; 