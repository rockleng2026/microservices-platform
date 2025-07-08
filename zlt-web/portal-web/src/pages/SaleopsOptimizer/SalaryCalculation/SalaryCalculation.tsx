import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Space,
  Modal,
  Progress,
  message,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  DatePicker,
  Divider,
  TreeSelect,
  Checkbox,
  Input,
} from 'antd';
import {
  CalculatorOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getSalaryCalculationTasks,
  createSalaryCalculationTask,
  executeSalaryCalculationTask,
  getSalaryTaskProgress,
  getSalaryTaskStatistics,
  confirmSalaryTask,
  cancelSalaryTask,
  getDepartmentOptions,
  getEmployeeOptions,
  validateCalculationData,
  getSalarySummary,
} from '../../../services/soo';

const { Option } = Select;

// 薪酬计算任务接口
interface SalaryCalculationTask {
  taskId: string;
  taskName: string;
  calculationMonth: string;
  calculationType: 'FULL' | 'DEPARTMENT' | 'EMPLOYEE';
  taskStatus: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progressPercent: number;
  totalEmployeeCount: number;
  processedEmployeeCount: number;
  successEmployeeCount: number;
  failedEmployeeCount: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalCompanyCost: number;
  startTime: string;
  endTime: string;
  executionDuration: number;
  errorMessage?: string;
  isFinal: boolean;
  confirmedBy?: number;
  confirmedAt?: string;
  createdAt: string;
  remark?: string;
}

// 任务进度接口
interface TaskProgress {
  taskId: string;
  taskStatus: string;
  progressPercent: number;
  totalEmployeeCount: number;
  processedEmployeeCount: number;
  successEmployeeCount: number;
  failedEmployeeCount: number;
  currentStep: string;
  estimatedTimeRemaining?: string;
}

// 部门选项接口
interface DepartmentOption {
  id: number;
  name: string;
  parentId?: number;
  children?: DepartmentOption[];
}

// 员工选项接口
interface EmployeeOption {
  id: number;
  name: string;
  employeeNo: string;
  departmentId: number;
  departmentName: string;
}

// 薪酬统计汇总接口
interface SalarySummary {
  id: number;
  taskId: string;
  summaryType: 'TOTAL' | 'DEPARTMENT';
  month: string;
  departmentId?: number;
  departmentName?: string;
  totalEmployeeCount: number;
  calculationEmployeeCount: number;
  totalBaseSalary: number;
  totalPerformancePay: number;
  totalCommission: number;
  totalBonus: number;
  totalAllowance: number;
  totalGrossPay: number;
  totalDeduction: number; // 后端返回的字段名
  totalNetPay: number;
  totalPersonalSocial: number; // 后端返回的字段名
  totalCompanySocial: number; // 后端返回的字段名
  totalPersonalTax: number; // 后端返回的字段名
  totalCompanyCost: number;
  avgGrossPay: number;
  avgNetPay: number;
  avgCompanyCost: number;
  createdAt: string;
}

const SalaryCalculation: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<SalaryCalculationTask[]>([]);
  const [currentTask, setCurrentTask] = useState<SalaryCalculationTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [progressPolling, setProgressPolling] = useState<NodeJS.Timeout | null>(null);
  
  // 薪酬统计汇总相关状态
  const [salarySummary, setSalarySummary] = useState<SalarySummary[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // 统计数据
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    runningTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    thisMonthTasks: 0,
    lastMonthTasks: 0,
    avgExecutionTime: '0分钟',
    successRate: 0,
  });

  useEffect(() => {
    loadTasks();
    loadDepartments();
    loadTaskStats();
    
    return () => {
      if (progressPolling) {
        clearInterval(progressPolling);
      }
    };
  }, []);

  // 加载计算任务列表
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await getSalaryCalculationTasks({
        page: 1,
        size: 20,
      });
      
      console.log('任务列表API响应:', response);
      
      // 适配不同的响应格式
      if ((response.resp_code === 0 || response.success) && response.data) {
        // 后端返回的是PageResult格式，data字段直接包含任务数组
        const taskList = Array.isArray(response.data) ? response.data : response.data.records || response.data;
        setTasks(taskList);
      } else {
        message.error('加载计算任务失败');
      }
    } catch (error) {
      console.error('加载计算任务失败:', error);
      message.error('加载计算任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载部门列表
  const loadDepartments = async () => {
    try {
      const response = await getDepartmentOptions();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error('加载部门列表失败:', error);
    }
  };

  // 加载员工列表
  const loadEmployees = async (departmentId?: number) => {
    try {
      const response = await getEmployeeOptions({
        departmentId,
        page: 1,
        size: 1000,
      });
      if (response.success) {
        setEmployees(response.data.records || []);
      }
    } catch (error) {
      console.error('加载员工列表失败:', error);
    }
  };

  // 加载任务统计
  const loadTaskStats = async () => {
    try {
      const response = await getSalaryTaskStatistics();
      if (response.success && response.data) {
        setTaskStats(response.data);
      } else if (response.resp_code === 0 && response.data) {
        setTaskStats(response.data);
      } else {
        console.error('加载统计数据失败:', response);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 创建薪酬计算任务
  const handleCreateCalculationTask = async (values: any) => {
    try {
      setLoading(true);
      
      // 数据验证
      if (values.calculationType === 'DEPARTMENT' && !values.targetDepartmentIds?.length) {
        message.error('请选择目标部门');
        return;
      }
      
      if (values.calculationType === 'EMPLOYEE' && !values.targetEmployeeIds?.length) {
        message.error('请选择目标员工');
        return;
      }

      const params = {
        taskName: values.taskName || `${dayjs(values.calculationMonth).format('YYYY-MM')}月薪酬计算`,
        calculationMonth: dayjs(values.calculationMonth).format('YYYY-MM'),
        calculationType: values.calculationType,
        targetDepartmentIds: values.targetDepartmentIds,
        targetEmployeeIds: values.targetEmployeeIds,
        excludeEmployeeIds: values.excludeEmployeeIds,
        remark: values.remark,
        calculationRules: {
          baseCalculation: values.baseCalculation !== false,
          performanceCalculation: values.performanceCalculation !== false,
          commissionCalculation: values.commissionCalculation !== false,
          socialSecurityCalculation: values.socialSecurityCalculation !== false,
          taxCalculation: values.taxCalculation !== false,
        },
      };

      const response = await createSalaryCalculationTask(params);

      if (response.success) {
        message.success('薪酬计算任务创建成功');
        setCurrentTask(response.data);
        form.resetFields();
        form.setFieldsValue({
          calculationMonth: dayjs(),
          calculationType: 'FULL',
          baseCalculation: true,
          performanceCalculation: true,
          commissionCalculation: true,
          socialSecurityCalculation: true,
          taxCalculation: true,
        });
        loadTasks();
        loadTaskStats();
        
        // 询问是否立即执行
        Modal.confirm({
          title: '任务创建成功',
          content: '是否立即执行该计算任务？',
          onOk: () => executeTask(response.data.taskId),
        });
      }
    } catch (error) {
      console.error('创建计算任务失败:', error);
      message.error('创建计算任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 执行计算任务
  const executeTask = async (taskId: string) => {
    try {
      setLoading(true);
      
      // 先验证数据完整性
      const validationResponse = await validateCalculationData(taskId);
      console.log('数据验证响应:', validationResponse);
      
      if (!validationResponse.success) {
        message.error('数据验证失败，无法执行计算');
        return;
      }
      
      // 检查具体的验证结果
      if (!validationResponse.data?.isValid) {
        const failedChecks = validationResponse.data?.failedChecks || 0;
        const validationResults = validationResponse.data?.validationResults || [];
        message.error(`数据验证失败：${failedChecks} 项检查未通过`);
        console.error('验证失败详情:', validationResults);
        return;
      }

      const response = await executeSalaryCalculationTask(taskId);
      if (response.success) {
        message.success('任务开始执行');
        
        // 找到对应的任务并更新状态
        const task = tasks.find(t => t.taskId === taskId);
        if (task) {
          setCurrentTask({ ...task, taskStatus: 'RUNNING' });
          setShowProgressModal(true);
          startProgressPolling(taskId);
        }
        
        loadTasks();
      }
    } catch (error) {
      console.error('执行计算任务失败:', error);
      message.error('执行计算任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 开始轮询任务进度
  const startProgressPolling = (taskId: string) => {
    if (progressPolling) {
      clearInterval(progressPolling);
    }
    
    const interval = setInterval(async () => {
      try {
        const response = await getSalaryTaskProgress(taskId);
        if (response.success) {
          setTaskProgress(response.data);
          
          // 任务完成时停止轮询
          if (response.data.taskStatus === 'COMPLETED' || 
              response.data.taskStatus === 'FAILED' || 
              response.data.taskStatus === 'CANCELLED') {
            clearInterval(interval);
            setProgressPolling(null);
            
            // 更新任务列表
            loadTasks();
            loadTaskStats();
            
            if (response.data.taskStatus === 'COMPLETED') {
              message.success('薪酬计算完成');
            } else if (response.data.taskStatus === 'FAILED') {
              message.error('薪酬计算失败');
            }
          }
        }
      } catch (error) {
        console.error('获取任务进度失败:', error);
      }
    }, 2000); // 每2秒轮询一次
    
    setProgressPolling(interval);
  };

  // 取消任务
  const handleCancelTask = async (taskId: string) => {
    try {
      const response = await cancelSalaryTask(taskId);
      if (response.success) {
        message.success('任务已取消');
        loadTasks();
        
        if (progressPolling) {
          clearInterval(progressPolling);
          setProgressPolling(null);
        }
        setShowProgressModal(false);
      }
    } catch (error) {
      console.error('取消任务失败:', error);
      message.error('取消任务失败');
    }
  };

  // 确认任务结果
  const handleConfirmTask = async (taskId: string) => {
    try {
      const response = await confirmSalaryTask(taskId);
      if (response.success) {
        message.success('任务结果已确认');
        loadTasks();
      }
    } catch (error) {
      console.error('确认任务失败:', error);
      message.error('确认任务失败');
    }
  };

  // 查看任务详情
  const handleViewTaskDetail = (task: SalaryCalculationTask) => {
    setCurrentTask(task);
    setShowTaskModal(true);
  };

  // 查看薪酬统计汇总
  const handleViewSalarySummary = async (task: SalaryCalculationTask) => {
    try {
      setSummaryLoading(true);
      const response = await getSalarySummary(task.taskId);
      
      console.log('薪酬统计汇总API响应:', response);
      
      // 适配不同的响应格式
      let summaryData = [];
      if (response.success && response.data) {
        summaryData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (response.resp_code === 0 && response.datas) {
        summaryData = Array.isArray(response.datas) ? response.datas : [response.datas];
      } else {
        message.error('获取薪酬统计汇总失败');
        return;
      }
      
      setSalarySummary(summaryData);
      setCurrentTask(task);
      setShowSummaryModal(true);
    } catch (error) {
      console.error('获取薪酬统计汇总失败:', error);
      message.error('获取薪酬统计汇总失败');
    } finally {
      setSummaryLoading(false);
    }
  };

  // 表单计算类型变化处理
  const handleCalculationTypeChange = (value: string) => {
    form.setFieldsValue({
      targetDepartmentIds: undefined,
      targetEmployeeIds: undefined,
    });
    
    if (value === 'DEPARTMENT' || value === 'EMPLOYEE') {
      loadEmployees();
    }
  };

  // 部门选择变化处理
  const handleDepartmentChange = (departmentIds: number[]) => {
    form.setFieldsValue({ targetEmployeeIds: undefined });
    if (departmentIds.length > 0) {
      loadEmployees(departmentIds[0]);
    }
  };

  // 获取任务状态标签
  const getTaskStatusTag = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'default', icon: <ClockCircleOutlined />, text: '待执行' },
      RUNNING: { color: 'processing', icon: <ClockCircleOutlined />, text: '执行中' },
      COMPLETED: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
      FAILED: { color: 'error', icon: <CloseCircleOutlined />, text: '执行失败' },
      CANCELLED: { color: 'default', icon: <ExclamationCircleOutlined />, text: '已取消' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 格式化执行时间
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`;
  };

  // 任务列表表格列定义
  const taskColumns: ColumnsType<SalaryCalculationTask> = [
    {
      title: '任务ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 150,
      ellipsis: true,
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      ellipsis: true,
    },
    {
      title: '计算月份',
      dataIndex: 'calculationMonth',
      key: 'calculationMonth',
      width: 100,
    },
    {
      title: '计算类型',
      dataIndex: 'calculationType',
      key: 'calculationType',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          FULL: '全员',
          DEPARTMENT: '部门',
          EMPLOYEE: '指定员工',
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      width: 100,
      render: (status: string) => getTaskStatusTag(status),
    },
    {
      title: '进度',
      dataIndex: 'progressPercent',
      key: 'progressPercent',
      width: 120,
      render: (percent: number, record: SalaryCalculationTask) => (
        <div>
          <Progress 
            percent={percent} 
            size="small" 
            status={record.taskStatus === 'FAILED' ? 'exception' : undefined}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.processedEmployeeCount}/{record.totalEmployeeCount}
          </div>
        </div>
      ),
    },
    {
      title: '工资总额',
      dataIndex: 'totalGrossPay',
      key: 'totalGrossPay',
      width: 120,
      render: (amount: number) => amount ? formatAmount(amount) : '-',
    },
    {
      title: '实发总额',
      dataIndex: 'totalNetPay',
      key: 'totalNetPay',
      width: 120,
      render: (amount: number) => amount ? formatAmount(amount) : '-',
    },
    {
      title: '公司成本',
      dataIndex: 'totalCompanyCost',
      key: 'totalCompanyCost',
      width: 120,
      render: (amount: number) => amount ? formatAmount(amount) : '-',
    },
    {
      title: '执行时间',
      dataIndex: 'executionDuration',
      key: 'executionDuration',
      width: 100,
      render: (duration: number) => duration ? formatDuration(duration) : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: SalaryCalculationTask) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewTaskDetail(record)}
            />
          </Tooltip>
          
          {record.taskStatus === 'COMPLETED' && (
            <Tooltip title="查看薪酬统计汇总">
              <Button 
                type="text" 
                icon={<BarChartOutlined />} 
                onClick={() => handleViewSalarySummary(record)}
                loading={summaryLoading}
              />
            </Tooltip>
          )}
          
          {record.taskStatus === 'PENDING' && (
            <Tooltip title="执行任务">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                onClick={() => executeTask(record.taskId)}
              />
            </Tooltip>
          )}
          
          {record.taskStatus === 'RUNNING' && (
            <Tooltip title="取消任务">
              <Button 
                type="text" 
                danger
                icon={<PauseCircleOutlined />} 
                onClick={() => handleCancelTask(record.taskId)}
              />
            </Tooltip>
          )}
          
          {record.taskStatus === 'COMPLETED' && !record.isFinal && (
            <Tooltip title="确认结果">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handleConfirmTask(record.taskId)}
              />
            </Tooltip>
          )}
          
          <Tooltip title="重新执行">
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={() => executeTask(record.taskId)}
              disabled={record.taskStatus === 'RUNNING'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={taskStats.totalTasks}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行中"
              value={taskStats.runningTasks}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={taskStats.completedTasks}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败任务"
              value={taskStats.failedTasks}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 创建计算任务表单 */}
      <Card title="创建薪酬计算任务" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="inline"
          initialValues={{
            calculationMonth: dayjs(),
            calculationType: 'FULL',
            baseCalculation: true,
            performanceCalculation: true,
            commissionCalculation: true,
            socialSecurityCalculation: true,
            taxCalculation: true,
          }}
          onFinish={handleCreateCalculationTask}
        >
          <Form.Item
            name="taskName"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" style={{ width: 200 }} />
          </Form.Item>
          
          <Form.Item
            name="calculationMonth"
            label="计算月份"
            rules={[{ required: true, message: '请选择计算月份' }]}
          >
            <DatePicker
              picker="month"
              format="YYYY-MM"
              placeholder="选择月份"
            />
          </Form.Item>
          
          <Form.Item
            name="calculationType"
            label="计算类型"
            rules={[{ required: true, message: '请选择计算类型' }]}
          >
            <Select style={{ width: 120 }} onChange={handleCalculationTypeChange}>
              <Option value="FULL">全员计算</Option>
              <Option value="DEPARTMENT">部门计算</Option>
              <Option value="EMPLOYEE">指定员工</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.calculationType !== currentValues.calculationType
            }
          >
            {({ getFieldValue }) => {
              const calculationType = getFieldValue('calculationType');
              
              if (calculationType === 'DEPARTMENT') {
                return (
                  <Form.Item
                    name="targetDepartmentIds"
                    label="目标部门"
                    rules={[{ required: true, message: '请选择目标部门' }]}
                  >
                    <TreeSelect
                      style={{ width: 200 }}
                      placeholder="选择部门"
                      multiple
                      treeData={departments}
                      fieldNames={{ label: 'name', value: 'id' }}
                      onChange={handleDepartmentChange}
                    />
                  </Form.Item>
                );
              }
              
              if (calculationType === 'EMPLOYEE') {
                return (
                  <Form.Item
                    name="targetEmployeeIds"
                    label="目标员工"
                    rules={[{ required: true, message: '请选择目标员工' }]}
                  >
                    <Select
                      style={{ width: 200 }}
                      placeholder="选择员工"
                      mode="multiple"
                      showSearch
                      optionFilterProp="children"
                    >
                      {employees.map(emp => (
                        <Option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employeeNo})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input placeholder="备注信息" style={{ width: 200 }} />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CalculatorOutlined />}
            >
              创建任务
            </Button>
          </Form.Item>

          <Form.Item>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Form.Item>
        </Form>

        {/* 计算规则配置 */}
        <Divider />
        <div style={{ marginTop: 16 }}>
          <span style={{ marginRight: 16, fontWeight: 500 }}>计算规则：</span>
          <Form.Item name="baseCalculation" valuePropName="checked" style={{ display: 'inline-block', marginRight: 16 }}>
            <Checkbox>基础工资计算</Checkbox>
          </Form.Item>
          <Form.Item name="performanceCalculation" valuePropName="checked" style={{ display: 'inline-block', marginRight: 16 }}>
            <Checkbox>绩效工资计算</Checkbox>
          </Form.Item>
          <Form.Item name="commissionCalculation" valuePropName="checked" style={{ display: 'inline-block', marginRight: 16 }}>
            <Checkbox>提成计算</Checkbox>
          </Form.Item>
          <Form.Item name="socialSecurityCalculation" valuePropName="checked" style={{ display: 'inline-block', marginRight: 16 }}>
            <Checkbox>社保公积金计算</Checkbox>
          </Form.Item>
          <Form.Item name="taxCalculation" valuePropName="checked" style={{ display: 'inline-block' }}>
            <Checkbox>个人所得税计算</Checkbox>
          </Form.Item>
        </div>
      </Card>

      {/* 计算任务列表 */}
      <Card 
        title="薪酬计算任务列表" 
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadTasks}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={taskColumns}
          dataSource={tasks}
          rowKey="taskId"
          loading={loading}
          pagination={{
            total: tasks.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* 任务详情模态框 */}
      <Modal
        title="任务详情"
        open={showTaskModal}
        onCancel={() => setShowTaskModal(false)}
        footer={null}
        width={800}
      >
        {currentTask && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <div><strong>任务ID：</strong>{currentTask.taskId}</div>
              </Col>
              <Col span={12}>
                <div><strong>任务名称：</strong>{currentTask.taskName}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <div><strong>计算月份：</strong>{currentTask.calculationMonth}</div>
              </Col>
              <Col span={12}>
                <div><strong>计算类型：</strong>{
                  currentTask.calculationType === 'FULL' ? '全员' :
                  currentTask.calculationType === 'DEPARTMENT' ? '部门' : '指定员工'
                }</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <div><strong>任务状态：</strong>{getTaskStatusTag(currentTask.taskStatus)}</div>
              </Col>
              <Col span={12}>
                <div><strong>进度：</strong>{currentTask.progressPercent}%</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <div><strong>总人数：</strong>{currentTask.totalEmployeeCount}</div>
              </Col>
              <Col span={8}>
                <div><strong>已处理：</strong>{currentTask.processedEmployeeCount}</div>
              </Col>
              <Col span={8}>
                <div><strong>成功：</strong>{currentTask.successEmployeeCount}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <div><strong>工资总额：</strong>{formatAmount(currentTask.totalGrossPay)}</div>
              </Col>
              <Col span={8}>
                <div><strong>实发总额：</strong>{formatAmount(currentTask.totalNetPay)}</div>
              </Col>
              <Col span={8}>
                <div><strong>公司成本：</strong>{formatAmount(currentTask.totalCompanyCost)}</div>
              </Col>
            </Row>
            {currentTask.executionDuration && (
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <div><strong>执行时间：</strong>{formatDuration(currentTask.executionDuration)}</div>
                </Col>
              </Row>
            )}
            {currentTask.remark && (
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <div><strong>备注：</strong>{currentTask.remark}</div>
                </Col>
              </Row>
            )}
            {currentTask.errorMessage && (
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <div><strong>错误信息：</strong><span style={{ color: '#ff4d4f' }}>{currentTask.errorMessage}</span></div>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>

      {/* 任务进度模态框 */}
      <Modal
        title="任务执行进度"
        open={showProgressModal}
        onCancel={() => {
          setShowProgressModal(false);
          if (progressPolling) {
            clearInterval(progressPolling);
            setProgressPolling(null);
          }
        }}
        footer={
          taskProgress?.taskStatus === 'RUNNING' ? [
            <Button key="cancel" onClick={() => handleCancelTask(taskProgress.taskId)}>
              取消任务
            </Button>
          ] : [
            <Button key="close" onClick={() => setShowProgressModal(false)}>
              关闭
            </Button>
          ]
        }
        closable={false}
        maskClosable={false}
      >
        {taskProgress && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Progress
                type="circle"
                percent={taskProgress.progressPercent}
                status={taskProgress.taskStatus === 'FAILED' ? 'exception' : undefined}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>当前步骤：</strong>{taskProgress.currentStep}
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <div><strong>总员工数：</strong>{taskProgress.totalEmployeeCount}</div>
              </Col>
              <Col span={12}>
                <div><strong>已处理：</strong>{taskProgress.processedEmployeeCount}</div>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <div><strong>成功：</strong><span style={{ color: '#52c41a' }}>{taskProgress.successEmployeeCount}</span></div>
              </Col>
              <Col span={12}>
                <div><strong>失败：</strong><span style={{ color: '#ff4d4f' }}>{taskProgress.failedEmployeeCount}</span></div>
              </Col>
            </Row>
            
            {taskProgress.estimatedTimeRemaining && (
              <div style={{ marginTop: 16 }}>
                <strong>预计剩余时间：</strong>{taskProgress.estimatedTimeRemaining}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 薪酬统计汇总模态框 */}
      <Modal
        title={`薪酬统计汇总 - ${currentTask?.taskName}`}
        open={showSummaryModal}
        onCancel={() => setShowSummaryModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowSummaryModal(false)}>
            关闭
          </Button>
        ]}
        width={1200}
      >
        {salarySummary.length > 0 && (
          <div>
            {/* 全公司汇总 */}
            {salarySummary.filter(s => s.summaryType === 'TOTAL').map(summary => (
              <Card key={summary.id} title="全公司薪酬汇总" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="总员工数"
                      value={summary.totalEmployeeCount}
                      suffix="人"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="参与计算员工数"
                      value={summary.calculationEmployeeCount}
                      suffix="人"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="应发工资总额"
                      value={summary.totalGrossPay}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="实发工资总额"
                      value={summary.totalNetPay}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={4}>
                    <Statistic
                      title="基础工资"
                      value={summary.totalBaseSalary}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="绩效工资"
                      value={summary.totalPerformancePay}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="提成"
                      value={summary.totalCommission}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="奖金"
                      value={summary.totalBonus}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="补贴"
                      value={summary.totalAllowance}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="总扣除"
                      value={summary.totalDeduction}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="个人社保公积金"
                      value={summary.totalPersonalSocial}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="个人所得税"
                      value={summary.totalPersonalTax}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="公司社保公积金"
                      value={summary.totalCompanySocial}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="公司总成本"
                      value={summary.totalCompanyCost}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="人均应发工资"
                      value={summary.avgGrossPay}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="人均实发工资"
                      value={summary.avgNetPay}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="人均公司成本"
                      value={summary.avgCompanyCost}
                      precision={2}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="计算参与率"
                      value={((summary.calculationEmployeeCount / summary.totalEmployeeCount) * 100).toFixed(1)}
                      suffix="%"
                    />
                  </Col>
                </Row>
              </Card>
            ))}

            {/* 部门汇总 */}
            {salarySummary.filter(s => s.summaryType === 'DEPARTMENT').length > 0 && (
              <Card title="部门薪酬汇总">
                <Table
                  columns={[
                    {
                      title: '部门名称',
                      dataIndex: 'departmentName',
                      key: 'departmentName',
                      width: 120,
                    },
                    {
                      title: '员工数',
                      dataIndex: 'calculationEmployeeCount',
                      key: 'calculationEmployeeCount',
                      width: 80,
                      render: (count) => `${count}人`,
                    },
                    {
                      title: '应发工资',
                      dataIndex: 'totalGrossPay',
                      key: 'totalGrossPay',
                      width: 120,
                      render: (amount) => formatAmount(amount),
                    },
                    {
                      title: '实发工资',
                      dataIndex: 'totalNetPay',
                      key: 'totalNetPay',
                      width: 120,
                      render: (amount) => formatAmount(amount),
                    },
                    {
                      title: '公司成本',
                      dataIndex: 'totalCompanyCost',
                      key: 'totalCompanyCost',
                      width: 120,
                      render: (amount) => formatAmount(amount),
                    },
                    {
                      title: '人均应发',
                      dataIndex: 'avgGrossPay',
                      key: 'avgGrossPay',
                      width: 120,
                      render: (amount) => formatAmount(amount),
                    },
                    {
                      title: '人均实发',
                      dataIndex: 'avgNetPay',
                      key: 'avgNetPay',
                      width: 120,
                      render: (amount) => formatAmount(amount),
                    },
                    {
                      title: '人均成本',
                      dataIndex: 'avgCompanyCost',
                      key: 'avgCompanyCost',
                      width: 120,
                      render: (amount) => formatAmount(amount),
                    },
                  ]}
                  dataSource={salarySummary.filter(s => s.summaryType === 'DEPARTMENT')}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalaryCalculation; 