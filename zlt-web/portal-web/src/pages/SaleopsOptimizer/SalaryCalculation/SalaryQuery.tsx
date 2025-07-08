import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Space,
  Modal,
  DatePicker,
  Input,
  Row,
  Col,
  Statistic,
  Descriptions,
  Tag,
  Tooltip,
  Drawer,
  Progress,
  message, // 添加 message 导入
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
// 移除 recharts 依赖，使用简化的图表展示
import { sooApi } from '../../../services/soo';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface PayrollResult {
  id: number;
  taskId: string;
  taskName: string;
  calculationVersion: number;
  month: string;
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  departmentId: number;
  departmentName: string;
  positionId: number;
  positionName: string;
  jobLevelCode: string;
  region: string;
  baseSalary: number;
  regionCoefficient: number;
  adjustedBaseSalary: number;
  performanceScore: number;
  performanceRatio: number;
  performancePay: number;
  personalProjectProfit: number;
  personalCommissionRate: number;
  personalCommission: number;
  teamProjectProfit: number;
  teamCommissionRate: number;
  teamCommission: number;
  departmentBonus: number;
  otherAllowance: number;
  otherDeduction: number;
  grossPay: number;
  // 个人社保公积金明细
  personalPension: number;
  personalMedical: number;
  personalUnemployment: number;
  personalHousingFund: number;
  personalSocialTotal: number;
  taxableIncome: number;
  personalIncomeTax: number;
  netPay: number;
  // 公司社保公积金明细
  companyPension: number;
  companyMedical: number;
  companyUnemployment: number;
  companyMaternity: number;
  companyInjury: number;
  companyHousingFund: number;
  companySocialTotal: number;
  totalCompanyCost: number;
  calculationRuleSnapshot: any;
  calculationDetails: any;
  calculationLog: any;
  calculationStatus: string;
  errorMessage: string;
  isCurrentVersion: boolean;
  isFinal: boolean;
  confirmedBy: number;
  confirmedAt: string;
  approvalStatus: string;
  approvedBy: number;
  approvedAt: string;
  approvalRemark: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  tenantId: string;
  delflag: boolean;
}

interface SalaryStatistics {
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalCompanyCost: number;
  averageGrossPay: number;
  averageNetPay: number;
  departmentStats: Array<{
    departmentName: string;
    employeeCount: number;
    totalCompanyCost: number;
    averageSalary: number;
  }>;
}

const SalaryQuery: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [payrollResults, setPayrollResults] = useState<PayrollResult[]>([]);
  const [salaryStats, setSalaryStats] = useState<SalaryStatistics | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PayrollResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTrendDrawer, setShowTrendDrawer] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadDepartments();
    loadEmployees();
    handleSearch(1);
  }, []);

  // 展开部门树为平级列表（与岗位管理页面保持一致）
  const flattenDepartments = (departments: any[], level = 0): any[] => {
    let result: any[] = [];
    departments.forEach(dept => {
      const indent = '　'.repeat(level); // 使用全角空格作为缩进
      result.push({
        id: dept.id,
        name: `${indent}${dept.name}`,
        level: level
      });
      if (dept.children && dept.children.length > 0) {
        result = result.concat(flattenDepartments(dept.children, level + 1));
      }
    });
    return result;
  };

  const loadDepartments = async () => {
    try {
      const response = await sooApi.getDepartmentOptions();
      if (response.success) {
        setDepartments(flattenDepartments(response.data || []));
      }
    } catch (error) {
      console.error('加载部门列表失败:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await sooApi.getEmployeeOptions({
        page: 1,
        size: 1000, // 获取更多员工数据用于下拉选择
      });
      if (response.success && Array.isArray(response.data?.list)) {
        setEmployees(response.data.list);
      } else if (response.success && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('加载员工列表失败:', error);
      setEmployees([]); // 确保在出错时也设置为空数组
    }
  };

  const handleSearch = async (page = 1) => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      
      // 构建查询参数
      const searchParams: any = {
        page,
        size: pagination.pageSize,
      };

      // 添加搜索条件
      if (values.taskName) {
        searchParams.taskName = values.taskName;
      }
      
      if (values.monthRange && values.monthRange.length === 2) {
        searchParams.startMonth = values.monthRange[0].format('YYYY-MM');
        searchParams.endMonth = values.monthRange[1].format('YYYY-MM');
      }
      
      if (values.departmentId) {
        searchParams.departmentIds = [values.departmentId];
      }
      
      if (values.employeeId) {
        searchParams.employeeIds = [values.employeeId];
      }
      
      if (values.employeeName) {
        searchParams.employeeName = values.employeeName;
      }
      
      if (values.isFinal !== undefined) {
        searchParams.isFinal = values.isFinal;
      }

      const response = await sooApi.getPayrollResults(searchParams);

      if (response.success) {
        setPayrollResults(response.data.list || []);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.total || 0,
        });
        
        // 加载统计数据（如果有对应API）
        // loadSalaryStatistics(values);
      }
    } catch (error) {
      console.error('查询工资数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 移除有问题的统计数据加载函数
  // const loadSalaryStatistics = async (filters: any) => {
  //   try {
  //     const response = await sooApi.getSalaryStatistics(filters);
  //     if (response.success) {
  //       setSalaryStats(response.data);
  //     }
  //   } catch (error) {
  //     console.error('加载统计数据失败:', error);
  //   }
  // };

  const handleViewDetail = (record: PayrollResult) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleViewTrend = async (employeeId: number) => {
    try {
      setLoading(true);
      const response = await sooApi.getSalaryTrend({
        employeeIds: [employeeId], // 修复参数名
        startMonth: dayjs().subtract(11, 'month').format('YYYY-MM'),
        endMonth: dayjs().format('YYYY-MM'),
      });
      
      if (response.success) {
        setTrendData(response.data || []);
        setShowTrendDrawer(true);
      }
    } catch (error) {
      console.error('加载薪资趋势失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      
      // 构建导出参数
      const exportParams: any = {
        exportType: 'EXCEL',
        includeDetails: true, // 包含详细信息
      };

      // 添加搜索条件进行全量导出
      if (values.taskName) {
        exportParams.taskName = values.taskName;
      }
      
      if (values.monthRange && values.monthRange.length === 2) {
        exportParams.startMonth = values.monthRange[0].format('YYYY-MM');
        exportParams.endMonth = values.monthRange[1].format('YYYY-MM');
      } else if (values.month) {
        exportParams.month = values.month;
      }
      
      if (values.departmentId) {
        exportParams.departmentIds = [values.departmentId];
      }
      
      if (values.employeeId) {
        exportParams.employeeIds = [values.employeeId];
      }
      
      if (values.employeeName) {
        exportParams.employeeName = values.employeeName;
      }
      
      if (values.isFinal !== undefined) {
        exportParams.isFinal = values.isFinal;
      }

      console.log('导出API请求参数:', exportParams);
      const response = await sooApi.exportPayrollResults(exportParams);
      
      console.log('导出API响应结果:', response);
      
      // 处理blob响应
      if (response instanceof Blob) {
        // 直接是blob类型
        const fileName = `工资查询结果_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        message.success('导出成功！');
      } else if (response && response.data instanceof Blob) {
        // response.data是blob类型
        const fileName = `工资查询结果_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        message.success('导出成功！');
      } else {
        console.error('导出失败，响应数据格式不正确:', response);
        throw new Error('导出失败，响应数据格式不正确');
      }
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<PayrollResult> = [
    {
      title: '员工信息',
      key: 'employee',
      fixed: 'left',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{record.employeeName}</span>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.employeeNo}
          </span>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.positionName}
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
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 80,
    },
    {
      title: '基础工资',
      key: 'baseSalary',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>基础: ¥{record.baseSalary?.toLocaleString() || 0}</span>
          <span style={{ fontSize: '12px', color: '#1890ff' }}>
            调整后: ¥{record.adjustedBaseSalary?.toLocaleString() || 0}
          </span>
        </Space>
      ),
    },
    {
      title: '绩效工资',
      key: 'performance',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>¥{record.performancePay?.toLocaleString() || 0}</span>
          <Progress
            percent={Math.round((record.performanceRatio || 0) * 100)}
            size="small"
            showInfo={false}
            strokeColor="#52c41a"
          />
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {Math.round((record.performanceRatio || 0) * 100)}% 
            (得分: {record.performanceScore || 0})
          </span>
        </Space>
      ),
    },
    {
      title: '提成奖金',
      key: 'commission',
      width: 120,
      render: (_, record) => {
        const totalCommission = (record.personalCommission || 0) + 
                               (record.teamCommission || 0) + 
                               (record.departmentBonus || 0);
        return (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 'bold', color: '#f5222d' }}>
              ¥{totalCommission.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              个人: ¥{(record.personalCommission || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              团队: ¥{(record.teamCommission || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              分红: ¥{(record.departmentBonus || 0).toLocaleString()}
            </span>
          </Space>
        );
      },
    },
    {
      title: '应发工资',
      dataIndex: 'grossPay',
      key: 'grossPay',
      width: 120,
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '14px' }}>
          ¥{value?.toLocaleString() || 0}
        </span>
      ),
      sorter: (a, b) => (a.grossPay || 0) - (b.grossPay || 0),
    },
    {
      title: '扣除明细',
      key: 'deductions',
      width: 160,
      render: (_, record) => {
        const totalDeductions = (record.personalSocialTotal || 0) + 
                               (record.personalIncomeTax || 0) +
                               (record.otherDeduction || 0);
        return (
          <Space direction="vertical" size={0}>
            <span style={{ color: '#ff7875', fontWeight: 'bold' }}>
              -¥{totalDeductions.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              养老: ¥{(record.personalPension || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              医疗: ¥{(record.personalMedical || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              失业: ¥{(record.personalUnemployment || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              公积金: ¥{(record.personalHousingFund || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              个税: ¥{(record.personalIncomeTax || 0).toLocaleString()}
            </span>
            {record.otherDeduction > 0 && (
              <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
                其他: ¥{(record.otherDeduction || 0).toLocaleString()}
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: '实发工资',
      dataIndex: 'netPay',
      key: 'netPay',
      width: 120,
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '14px' }}>
          ¥{value?.toLocaleString() || 0}
        </span>
      ),
      sorter: (a, b) => (a.netPay || 0) - (b.netPay || 0),
    },
    {
      title: '公司成本明细',
      key: 'companyCost',
      width: 160,
      render: (_, record) => {
        return (
          <Space direction="vertical" size={0}>
            <span style={{ color: '#722ed1', fontWeight: 'bold' }}>
              ¥{(record.totalCompanyCost || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              养老: ¥{(record.companyPension || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              医疗: ¥{(record.companyMedical || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              失业: ¥{(record.companyUnemployment || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              生育: ¥{(record.companyMaternity || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              工伤: ¥{(record.companyInjury || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
              公积金: ¥{(record.companyHousingFund || 0).toLocaleString()}
            </span>
          </Space>
        );
      },
      sorter: (a, b) => (a.totalCompanyCost || 0) - (b.totalCompanyCost || 0),
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
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="趋势分析">
            <Button 
              type="link" 
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => handleViewTrend(record.employeeId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      {salaryStats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="员工总数"
                value={salaryStats.totalEmployees}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="应发工资总额"
                value={salaryStats.totalGrossPay}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="实发工资总额"
                value={salaryStats.totalNetPay}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="公司总成本"
                value={salaryStats.totalCompanyCost}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 查询条件 */}
      <Card title="查询条件" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="inline"
          onFinish={() => handleSearch(1)}
        >
          <Form.Item name="taskName" label="任务名称">
            <Input 
              style={{ width: 200 }} 
              placeholder="请输入任务名称" 
              allowClear
            />
          </Form.Item>

          <Form.Item name="monthRange" label="月份范围">
            <RangePicker picker="month" format="YYYY-MM" />
          </Form.Item>
          
          <Form.Item name="departmentId" label="部门">
            <Select style={{ width: 150 }} placeholder="请选择部门" allowClear>
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="employeeId" label="员工">
            <Select 
              style={{ width: 150 }} 
              placeholder="请选择员工" 
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {(employees || []).map(emp => (
                <Option key={emp.id} value={emp.id}>
                  {emp.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="employeeName" label="员工姓名">
            <Input placeholder="请输入员工姓名" allowClear />
          </Form.Item>

          <Form.Item name="isFinal" label="确认状态">
            <Select style={{ width: 120 }} placeholder="请选择状态" allowClear>
              <Option value={true}>已确认</Option>
              <Option value={false}>待确认</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
                loading={loading}
              >
                查询
              </Button>
              <Button onClick={() => form.resetFields()}>
                重置
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={loading}
              >
                导出Excel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 工资结果表格 */}
      <Card title="工资查询结果">
        <Table
          columns={columns}
          dataSource={payrollResults}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            onChange: (page) => handleSearch(page),
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="工资详情"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions title="基本信息" bordered size="small" column={2}>
              <Descriptions.Item label="员工姓名">
                {selectedRecord.employeeName}
              </Descriptions.Item>
              <Descriptions.Item label="员工编号">
                {selectedRecord.employeeNo}
              </Descriptions.Item>
              <Descriptions.Item label="部门">
                {selectedRecord.departmentName}
              </Descriptions.Item>
              <Descriptions.Item label="岗位">
                {selectedRecord.positionName}
              </Descriptions.Item>
              <Descriptions.Item label="职级">
                {selectedRecord.jobLevelCode}
              </Descriptions.Item>
              <Descriptions.Item label="地区">
                {selectedRecord.region}
              </Descriptions.Item>
              <Descriptions.Item label="计算月份">
                {selectedRecord.month}
              </Descriptions.Item>
              <Descriptions.Item label="确认状态">
                {selectedRecord.isFinal ? 
                  <Tag color="success">已确认</Tag> : 
                  <Tag color="warning">待确认</Tag>
                }
              </Descriptions.Item>
            </Descriptions>

            <Descriptions 
              title="薪酬构成" 
              bordered 
              size="small" 
              column={2} 
              style={{ marginTop: '16px' }}
            >
              <Descriptions.Item label="基础工资">
                ¥{selectedRecord.baseSalary?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="地区系数">
                {selectedRecord.regionCoefficient || 1.0}
              </Descriptions.Item>
              <Descriptions.Item label="调整后基础工资">
                ¥{selectedRecord.adjustedBaseSalary?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="绩效得分">
                {selectedRecord.performanceScore || 0}分 
                ({Math.round((selectedRecord.performanceRatio || 0) * 100)}%)
              </Descriptions.Item>
              <Descriptions.Item label="绩效工资">
                ¥{selectedRecord.performancePay?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="个人项目利润">
                ¥{selectedRecord.personalProjectProfit?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="个人提成比例">
                {((selectedRecord.personalCommissionRate || 0) * 100).toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label="个人项目提成">
                ¥{selectedRecord.personalCommission?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="团队项目利润">
                ¥{selectedRecord.teamProjectProfit?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="团队提成比例">
                {((selectedRecord.teamCommissionRate || 0) * 100).toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label="团队项目提成">
                ¥{selectedRecord.teamCommission?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="部门分红">
                ¥{selectedRecord.departmentBonus?.toLocaleString() || 0}
              </Descriptions.Item>
              {selectedRecord.otherAllowance > 0 && (
                <Descriptions.Item label="其他补贴">
                  ¥{selectedRecord.otherAllowance?.toLocaleString() || 0}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="应发工资合计" span={selectedRecord.otherAllowance > 0 ? 1 : 2}>
                <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
                  ¥{selectedRecord.grossPay?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions 
              title="扣除明细" 
              bordered 
              size="small" 
              column={2} 
              style={{ marginTop: '16px' }}
            >
              <Descriptions.Item label="个人养老保险">
                ¥{selectedRecord.personalPension?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="个人医疗保险">
                ¥{selectedRecord.personalMedical?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="个人失业保险">
                ¥{selectedRecord.personalUnemployment?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="个人住房公积金">
                ¥{selectedRecord.personalHousingFund?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="个人社保公积金合计">
                <span style={{ color: '#ff7875', fontWeight: 'bold' }}>
                  ¥{selectedRecord.personalSocialTotal?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="应纳税所得额">
                ¥{selectedRecord.taxableIncome?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="个人所得税">
                <span style={{ color: '#ff7875' }}>
                  ¥{selectedRecord.personalIncomeTax?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>
              {selectedRecord.otherDeduction > 0 && (
                <Descriptions.Item label="其他扣除">
                  <span style={{ color: '#ff7875' }}>
                    ¥{selectedRecord.otherDeduction?.toLocaleString() || 0}
                  </span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="实发工资" span={2}>
                <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '16px' }}>
                  ¥{selectedRecord.netPay?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions 
              title="公司成本明细" 
              bordered 
              size="small" 
              column={2} 
              style={{ marginTop: '16px' }}
            >
              <Descriptions.Item label="公司养老保险">
                ¥{selectedRecord.companyPension?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="公司医疗保险">
                ¥{selectedRecord.companyMedical?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="公司失业保险">
                ¥{selectedRecord.companyUnemployment?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="公司生育保险">
                ¥{selectedRecord.companyMaternity?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="公司工伤保险">
                ¥{selectedRecord.companyInjury?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="公司住房公积金">
                ¥{selectedRecord.companyHousingFund?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="公司社保公积金合计">
                <span style={{ color: '#722ed1', fontWeight: 'bold' }}>
                  ¥{selectedRecord.companySocialTotal?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="公司总成本">
                <span style={{ fontWeight: 'bold', color: '#722ed1', fontSize: '16px' }}>
                  ¥{selectedRecord.totalCompanyCost?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 趋势分析抽屉 */}
      <Drawer
        title="薪资趋势分析"
        placement="right"
        width={600}
        open={showTrendDrawer}
        onClose={() => setShowTrendDrawer(false)}
      >
        {trendData.length > 0 && (
          <div>
            <h4>薪资趋势数据</h4>
            <div style={{ marginTop: '16px' }}>
              {trendData.map((item, index) => (
                <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="月份"
                        value={item.month}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="应发工资"
                        value={item.grossPay}
                        precision={0}
                        prefix="¥"
                        valueStyle={{ fontSize: '14px', color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="实发工资"
                        value={item.netPay}
                        precision={0}
                        prefix="¥"
                        valueStyle={{ fontSize: '14px', color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="公司成本"
                        value={item.totalCompanyCost}
                        precision={0}
                        prefix="¥"
                        valueStyle={{ fontSize: '14px', color: '#722ed1' }}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SalaryQuery; 