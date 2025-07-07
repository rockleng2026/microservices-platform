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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { sooApi } from '../../../services/soo';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface SalaryCalculationTask {
  id: number;
  taskName: string;
  calculationMonth: string;
  taskType: string;
  taskStatus: string;
  totalEmployees: number;
  processedEmployees: number;
  successCount: number;
  errorCount: number;
  startTime: string;
  endTime: string;
  createdBy: string;
  createdAt: string;
}

interface PayrollResult {
  id: number;
  month: string;
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  departmentName: string;
  adjustedBaseSalary: number;
  performancePay: number;
  personalCommission: number;
  teamCommission: number;
  departmentBonus: number;
  grossPay: number;
  personalSocialTotal: number;
  personalIncomeTax: number;
  netPay: number;
  totalCost: number;
  isFinal: boolean;
  confirmedAt: string;
}

const SalaryCalculation: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<SalaryCalculationTask[]>([]);
  const [payrollResults, setPayrollResults] = useState<PayrollResult[]>([]);
  const [currentTask, setCurrentTask] = useState<SalaryCalculationTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'));
  const [departments, setDepartments] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });

  useEffect(() => {
    loadTasks();
    loadDepartments();
    loadTaskStats();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await sooApi.getSalaryCalculationTasks({
        page: 1,
        size: 10,
      });
      if (response.success) {
        setTasks(response.data.list || []);
      }
    } catch (error) {
      message.error('加载计算任务失败');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await sooApi.getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error('加载部门列表失败:', error);
    }
  };

  const loadTaskStats = async () => {
    try {
      const response = await sooApi.getSalaryCalculationStats();
      if (response.success) {
        setTaskStats(response.data || taskStats);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const loadPayrollResults = async (month: string, departmentId?: number) => {
    try {
      setLoading(true);
      const response = await sooApi.getPayrollResults({
        month,
        departmentId,
        page: 1,
        size: 100,
      });
      if (response.success) {
        setPayrollResults(response.data.list || []);
      }
    } catch (error) {
      message.error('加载工资计算结果失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalculationTask = async (values: any) => {
    try {
      setLoading(true);
      const response = await sooApi.createSalaryCalculationTask({
        taskName: `${values.month}月度工资计算`,
        calculationMonth: values.month,
        taskType: 'monthly',
        employeeScope: values.scope || 'all',
        scopeValues: values.departmentId ? [values.departmentId] : [],
      });

      if (response.success) {
        message.success('工资计算任务创建成功');
        setCurrentTask(response.data);
        setShowTaskModal(true);
        loadTasks();
        
        // 开始执行任务
        executeCalculationTask(response.data.id);
      }
    } catch (error) {
      message.error('创建计算任务失败');
    } finally {
      setLoading(false);
    }
  };

  const executeCalculationTask = async (taskId: number) => {
    try {
      await sooApi.executeCalculationTask(taskId);
      
      // 轮询任务状态
      const pollInterval = setInterval(async () => {
        try {
          const response = await sooApi.getTaskStatus(taskId);
          if (response.success) {
            setCurrentTask(response.data);
            
            if (response.data.taskStatus === 'completed' || response.data.taskStatus === 'failed') {
              clearInterval(pollInterval);
              loadTasks();
              loadTaskStats();
              
              if (response.data.taskStatus === 'completed') {
                message.success('工资计算完成');
                loadPayrollResults(response.data.calculationMonth);
              } else {
                message.error('工资计算失败');
              }
            }
          }
        } catch (error) {
          clearInterval(pollInterval);
          console.error('轮询任务状态失败:', error);
        }
      }, 2000);

      // 30秒后停止轮询
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 30000);

    } catch (error) {
      message.error('执行计算任务失败');
    }
  };

  const handleViewResults = (month: string) => {
    setSelectedMonth(month);
    loadPayrollResults(month);
    setShowResultModal(true);
  };

  const handleRecalculate = async (taskId: number) => {
    Modal.confirm({
      title: '确认重新计算',
      content: '重新计算将覆盖现有结果，是否继续？',
      onOk: async () => {
        try {
          await sooApi.recalculateSalary([taskId]);
          message.success('重新计算已开始');
          loadTasks();
        } catch (error) {
          message.error('重新计算失败');
        }
      },
    });
  };

  const handleExportResults = async (month: string) => {
    try {
      const response = await sooApi.exportPayrollData(month);
      
      // 创建下载链接
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `工资计算结果_${month}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  const getTaskStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'default', icon: <ClockCircleOutlined />, text: '待处理' },
      running: { color: 'processing', icon: <ClockCircleOutlined />, text: '计算中' },
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
      failed: { color: 'error', icon: <CloseCircleOutlined />, text: '失败' },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const taskColumns: ColumnsType<SalaryCalculationTask> = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '计算月份',
      dataIndex: 'calculationMonth',
      key: 'calculationMonth',
    },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      render: (status) => getTaskStatusTag(status),
    },
    {
      title: '进度',
      key: 'progress',
      render: (_, record) => {
        const progress = record.totalEmployees > 0 
          ? Math.round((record.processedEmployees / record.totalEmployees) * 100)
          : 0;
        
        return (
          <Progress 
            percent={progress} 
            size="small"
            status={record.taskStatus === 'failed' ? 'exception' : 'normal'}
          />
        );
      },
    },
    {
      title: '处理结果',
      key: 'result',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>成功: {record.successCount}</span>
          <span>失败: {record.errorCount}</span>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看结果">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleViewResults(record.calculationMonth)}
            />
          </Tooltip>
          <Tooltip title="重新计算">
            <Button 
              type="link" 
              icon={<ReloadOutlined />}
              onClick={() => handleRecalculate(record.id)}
              disabled={record.taskStatus === 'running'}
            />
          </Tooltip>
          <Tooltip title="导出结果">
            <Button 
              type="link" 
              icon={<DownloadOutlined />}
              onClick={() => handleExportResults(record.calculationMonth)}
              disabled={record.taskStatus !== 'completed'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const payrollColumns: ColumnsType<PayrollResult> = [
    {
      title: '员工信息',
      key: 'employee',
      fixed: 'left',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.employeeName}</span>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.employeeNo}
          </span>
        </Space>
      ),
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 100,
    },
    {
      title: '基础工资',
      dataIndex: 'adjustedBaseSalary',
      key: 'adjustedBaseSalary',
      width: 100,
      render: (value) => `¥${value?.toLocaleString() || 0}`,
    },
    {
      title: '绩效工资',
      dataIndex: 'performancePay',
      key: 'performancePay',
      width: 100,
      render: (value) => `¥${value?.toLocaleString() || 0}`,
    },
    {
      title: '个人提成',
      dataIndex: 'personalCommission',
      key: 'personalCommission',
      width: 100,
      render: (value) => `¥${value?.toLocaleString() || 0}`,
    },
    {
      title: '团队提成',
      dataIndex: 'teamCommission',
      key: 'teamCommission',
      width: 100,
      render: (value) => `¥${value?.toLocaleString() || 0}`,
    },
    {
      title: '部门分红',
      dataIndex: 'departmentBonus',
      key: 'departmentBonus',
      width: 100,
      render: (value) => `¥${value?.toLocaleString() || 0}`,
    },
    {
      title: '应发工资',
      dataIndex: 'grossPay',
      key: 'grossPay',
      width: 120,
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ¥{value?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: '个税社保',
      key: 'deductions',
      width: 120,
      render: (_, record) => {
        const total = (record.personalSocialTotal || 0) + (record.personalIncomeTax || 0);
        return `¥${total.toLocaleString()}`;
      },
    },
    {
      title: '实发工资',
      dataIndex: 'netPay',
      key: 'netPay',
      width: 120,
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ¥{value?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: '公司成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      render: (value) => `¥${value?.toLocaleString() || 0}`,
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_, record) => (
        record.isFinal ? 
          <Tag color="success">已确认</Tag> : 
          <Tag color="warning">待确认</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={taskStats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行中"
              value={taskStats.running}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={taskStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败"
              value={taskStats.failed}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 创建计算任务 */}
      <Card title="创建工资计算任务" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleCreateCalculationTask}
        >
          <Form.Item
            name="month"
            label="计算月份"
            rules={[{ required: true, message: '请选择计算月份' }]}
            initialValue={dayjs().format('YYYY-MM')}
          >
            <DatePicker picker="month" format="YYYY-MM" />
          </Form.Item>
          
          <Form.Item name="scope" label="计算范围" initialValue="all">
            <Select style={{ width: 120 }}>
              <Option value="all">全公司</Option>
              <Option value="department">指定部门</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.scope !== currentValues.scope
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('scope') === 'department' ? (
                <Form.Item
                  name="departmentId"
                  label="选择部门"
                  rules={[{ required: true, message: '请选择部门' }]}
                >
                  <Select style={{ width: 200 }} placeholder="请选择部门">
                    {departments.map(dept => (
                      <Option key={dept.id} value={dept.id}>
                        {dept.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<CalculatorOutlined />}
              loading={loading}
            >
              开始计算
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadTasks}
            >
              刷新任务
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 计算任务列表 */}
      <Card title="计算任务列表">
        <Table
          columns={taskColumns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 任务进度模态框 */}
      <Modal
        title="计算任务进度"
        open={showTaskModal}
        onCancel={() => setShowTaskModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowTaskModal(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentTask && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>任务名称：</strong>{currentTask.taskName}
            </div>
            <div>
              <strong>计算月份：</strong>{currentTask.calculationMonth}
            </div>
            <div>
              <strong>任务状态：</strong>{getTaskStatusTag(currentTask.taskStatus)}
            </div>
            <div>
              <strong>计算进度：</strong>
              <Progress 
                percent={currentTask.totalEmployees > 0 
                  ? Math.round((currentTask.processedEmployees / currentTask.totalEmployees) * 100)
                  : 0}
                status={currentTask.taskStatus === 'failed' ? 'exception' : 'normal'}
              />
            </div>
            <div>
              <strong>处理统计：</strong>
              总数 {currentTask.totalEmployees}，
              已处理 {currentTask.processedEmployees}，
              成功 {currentTask.successCount}，
              失败 {currentTask.errorCount}
            </div>
            {currentTask.startTime && (
              <div>
                <strong>开始时间：</strong>{dayjs(currentTask.startTime).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            )}
            {currentTask.endTime && (
              <div>
                <strong>结束时间：</strong>{dayjs(currentTask.endTime).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            )}
          </Space>
        )}
      </Modal>

      {/* 计算结果模态框 */}
      <Modal
        title={`${selectedMonth} 工资计算结果`}
        open={showResultModal}
        onCancel={() => setShowResultModal(false)}
        footer={[
          <Button 
            key="export" 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleExportResults(selectedMonth)}
          >
            导出结果
          </Button>,
          <Button key="close" onClick={() => setShowResultModal(false)}>
            关闭
          </Button>,
        ]}
        width={1400}
        styles={{ body: { maxHeight: '600px', overflowY: 'auto' } }}
      >
        <Table
          columns={payrollColumns}
          dataSource={payrollResults}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Modal>
    </div>
  );
};

export default SalaryCalculation; 