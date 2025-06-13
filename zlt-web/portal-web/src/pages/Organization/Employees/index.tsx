import React, { useRef, useState, useEffect } from 'react';
import { PageContainer, ProTable, ProForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Modal, message, Popconfirm, Tag, Space, Card, Row, Col, Statistic, Badge, Upload, Avatar, Drawer, Descriptions, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, ImportOutlined, UserOutlined, TeamOutlined, 
         PhoneOutlined, MailOutlined, BankOutlined, CalendarOutlined, SwapOutlined, CheckCircleOutlined, 
         CloseCircleOutlined, EyeOutlined, UploadOutlined, DownloadOutlined, SearchOutlined, ReloadOutlined, 
         FileImageOutlined, HomeOutlined, IdcardOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { 
  getEmployeePage, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  generateEmpNo,
  getEmployeeDetail,
  getEmployeeStatistics,
  transferEmployee,
  confirmEmployee,
  resignEmployee,
  importEmployees,
  exportEmployees,
  downloadEmployeeTemplate,
  checkEmpNoAvailable,
  checkPhoneNumberAvailable,
  checkEmailAvailable
} from '@/services/organization/employee';
import { getDepartmentTree } from '@/services/organization/department';
import { getWorkPositionPage } from '@/services/organization/position';
import './index.less';

const { TabPane } = Tabs;

// 员工类型定义
interface EmployeeType {
  id: number;
  empNo: string;
  name: string;
  nameEn?: string;
  gender?: number;
  mobile?: string;
  phoneNumber?: string;
  email?: string;
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  employmentStatus?: number;
  status?: number;
  entryDate?: string;
  hireDate?: string;
  createTime?: string;
  birthDate?: string;
  age?: number;
  idCard?: string;
  address?: string;
  education?: string;
  employmentType?: string;
  avatar?: string;
  nation?: string;
  maritalStatus?: string;
  birthplace?: string;
  residence?: string;
  healthStatus?: string;
  height?: string;
  weight?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  specialty?: string;
  probationEndDate?: string;
  leaveDate?: string;
  leaveReason?: string;
  remark?: string;
  loginAccountFlag?: number;
}

// 员工统计信息
interface EmployeeStats {
  totalCount: number;
  onJobCount: number;
  probationCount: number;
  leaveCount: number;
  maleCount: number;
  femaleCount: number;
  averageAge?: number;
}

const Employees: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmployeeType | null>(null);
  const [form] = ProForm.useForm();
  
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(null);
  const [transferVisible, setTransferVisible] = useState(false);
  const [transferForm] = ProForm.useForm();
  const [resignVisible, setResignVisible] = useState(false);
  const [resignForm] = ProForm.useForm();
  const [importVisible, setImportVisible] = useState(false);
  const [statistics, setStatistics] = useState<EmployeeStats>({
    totalCount: 0,
    onJobCount: 0,
    probationCount: 0,
    leaveCount: 0,
    maleCount: 0,
    femaleCount: 0,
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [currentStep, setCurrentStep] = useState(1);
  
  // 动态列表数据
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [educationHistory, setEducationHistory] = useState<any[]>([]);
  const [workExperience, setWorkExperience] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
    loadDepartments();
    loadPositions();
  }, []);

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const response = await getEmployeeStatistics();
      if (response && response.resp_code === 0) {
        setStatistics(response.datas || response.data);
      } else {
        setStatistics({
          totalCount: 0,
          onJobCount: 0,
          probationCount: 0,
          leaveCount: 0,
          maleCount: 0,
          femaleCount: 0,
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      setStatistics({
        totalCount: 0,
        onJobCount: 0,
        probationCount: 0,
        leaveCount: 0,
        maleCount: 0,
        femaleCount: 0,
      });
    }
  };

  // 加载部门列表
  const loadDepartments = async () => {
    try {
      const response = await getDepartmentTree();
      if (response && response.resp_code === 0) {
        const departments = response.datas || response.data || [];
        setDepartments(convertDepartmentTreeToOptions(departments));
      }
    } catch (error) {
      console.error('加载部门列表失败:', error);
    }
  };

  // 加载岗位列表
  const loadPositions = async () => {
    try {
      const response = await getWorkPositionPage({ current: 1, size: 1000 });
      if (response && response.resp_code === 0) {
        const positions = response.datas?.records || response.data?.records || [];
        setPositions(positions);
      }
    } catch (error) {
      console.error('加载岗位列表失败:', error);
    }
  };

  // 转换部门树为选项
  const convertDepartmentTreeToOptions = (tree: any[]): any[] => {
    const options: any[] = [];
    const traverse = (nodes: any[], prefix = '') => {
      nodes.forEach(node => {
        options.push({
          label: prefix + node.name,
          value: node.id,
        });
        if (node.children && node.children.length > 0) {
          traverse(node.children, prefix + '  ');
        }
      });
    };
    traverse(tree);
    return options;
  };

  // 新增员工
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setCurrentStep(1);
    setFamilyMembers([]);
    setEducationHistory([]);
    setWorkExperience([]);
    setModalVisible(true);
  };

  // 生成工号
  const handleGenerateEmpNo = async (departmentId?: number) => {
    try {
      const response = await generateEmpNo(departmentId || 0);
      if (response && response.resp_code === 0) {
        const empNo = response.datas || response.data;
        form.setFieldsValue({ empNo });
        message.success('工号生成成功');
      } else {
        message.error('工号生成失败');
      }
    } catch (error) {
      console.error('生成工号失败:', error);
      message.error('工号生成失败');
    }
  };

  // 编辑员工
  const handleEdit = (record: EmployeeType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setCurrentStep(1);
    setModalVisible(true);
  };

  // 删除员工
  const handleDelete = async (id: number) => {
    try {
      const response = await deleteEmployee(id);
      if (response && response.resp_code === 0) {
        message.success('删除成功');
        actionRef.current?.reload();
        loadStatistics();
      } else {
        message.error(response?.resp_msg || '删除失败');
      }
    } catch (error: any) {
      console.error('删除员工失败:', error);
      message.error(error?.response?.data?.resp_msg || '删除失败');
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const submitData = {
        ...values,
        phoneNumber: values.mobile || values.phoneNumber,
        hireDate: values.entryDate || values.hireDate,
        status: values.employmentStatus || values.status || 1,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        entryDate: values.entryDate ? values.entryDate.format('YYYY-MM-DD') : null,
        probationEndDate: values.probationEndDate ? values.probationEndDate.format('YYYY-MM-DD') : null,
      };

      delete submitData.mobile;
      delete submitData.hireDate;

      let response;
      if (editingRecord) {
        response = await updateEmployee(editingRecord.id, submitData);
        if (response && response.resp_code === 0) {
          message.success('员工信息更新成功');
          setModalVisible(false);
          form.resetFields();
          actionRef.current?.reload();
          loadStatistics();
        } else {
          message.error(response?.resp_msg || '更新失败');
        }
      } else {
        if (values.empNo) {
          const checkResponse = await checkEmpNoAvailable(values.empNo);
          if (checkResponse && checkResponse.resp_code !== 0) {
            message.error('工号已存在，请使用其他工号');
            setLoading(false);
            return;
          }
        }
        
        if (values.mobile || values.phoneNumber) {
          const phoneCheckResponse = await checkPhoneNumberAvailable(values.mobile || values.phoneNumber);
          if (phoneCheckResponse && phoneCheckResponse.resp_code !== 0) {
            message.error('手机号已存在，请使用其他手机号');
            setLoading(false);
            return;
          }
        }
        
        if (values.email) {
          const emailCheckResponse = await checkEmailAvailable(values.email);
          if (emailCheckResponse && emailCheckResponse.resp_code !== 0) {
            message.error('邮箱已存在，请使用其他邮箱');
            setLoading(false);
            return;
          }
        }
        
        response = await createEmployee(submitData);
        if (response && response.resp_code === 0) {
          message.success('员工添加成功');
          setModalVisible(false);
          form.resetFields();
          actionRef.current?.reload();
          loadStatistics();
        } else {
          message.error(response?.resp_msg || '添加失败');
        }
      }
    } catch (error: any) {
      console.error('提交员工信息失败:', error);
      
      let errorMessage = editingRecord ? '更新失败' : '添加失败';
      if (error?.response?.data?.resp_msg) {
        errorMessage = error.response.data.resp_msg;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 导出员工
  const handleExport = async () => {
    try {
      await exportEmployees();
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      await downloadEmployeeTemplate();
      message.success('模板下载成功');
    } catch (error) {
      console.error('下载模板失败:', error);
      message.error('下载模板失败');
    }
  };

  // 导入员工
  const handleImport = () => {
    setImportVisible(true);
  };

  // 查看详情
  const handleViewDetail = async (record: EmployeeType) => {
    try {
      const response = await getEmployeeDetail(record.id);
      if (response && response.resp_code === 0) {
        setSelectedEmployee(response.datas || response.data || record);
      } else {
        setSelectedEmployee(record);
      }
      setDetailVisible(true);
      setActiveTab('basic');
    } catch (error) {
      console.error('获取员工详情失败:', error);
      setSelectedEmployee(record);
      setDetailVisible(true);
      setActiveTab('basic');
    }
  };

  // 员工调动
  const handleTransfer = (record: EmployeeType) => {
    setSelectedEmployee(record);
    transferForm.setFieldsValue({
      employeeName: record.name,
      currentDepartment: record.departmentName,
      currentPosition: record.positionName,
    });
    setTransferVisible(true);
  };

  // 确认转正
  const handleConfirm = async (record: EmployeeType) => {
    try {
      await confirmEmployee(record.id);
      message.success('转正成功');
      actionRef.current?.reload();
      loadStatistics();
    } catch (error) {
      console.error('转正失败:', error);
      message.error('转正失败');
    }
  };

  // 员工离职
  const handleResign = (record: EmployeeType) => {
    setSelectedEmployee(record);
    resignForm.setFieldsValue({
      employeeName: record.name,
      department: record.departmentName,
      position: record.positionName,
    });
    setResignVisible(true);
  };

  // 动态列表操作函数
  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, {
      id: Date.now(),
      name: '',
      relation: '',
      position: '',
      company: ''
    }]);
  };

  const removeFamilyMember = (id: number) => {
    setFamilyMembers(familyMembers.filter(item => item.id !== id));
  };

  const updateFamilyMember = (id: number, field: string, value: string) => {
    setFamilyMembers(familyMembers.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addEducationHistory = () => {
    setEducationHistory([...educationHistory, {
      id: Date.now(),
      school: '',
      major: '',
      startDate: '',
      endDate: '',
      degree: '',
      referee: ''
    }]);
  };

  const removeEducationHistory = (id: number) => {
    setEducationHistory(educationHistory.filter(item => item.id !== id));
  };

  const updateEducationHistory = (id: number, field: string, value: string) => {
    setEducationHistory(educationHistory.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addWorkExperience = () => {
    setWorkExperience([...workExperience, {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      salary: '',
      leaveReason: '',
      referee: '',
      refereePhone: ''
    }]);
  };

  const removeWorkExperience = (id: number) => {
    setWorkExperience(workExperience.filter(item => item.id !== id));
  };

  const updateWorkExperience = (id: number, field: string, value: string) => {
    setWorkExperience(workExperience.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 表格列定义
  const columns: ProColumns<EmployeeType>[] = [
    {
      title: '工号',
      dataIndex: 'empNo',
      width: 120,
      fixed: 'left',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar size="small" src={record.avatar} icon={<UserOutlined />} />
          <span>{record.name}</span>
        </Space>
      ),
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      hideInSearch: true,
      render: (_, record) => {
        const gender = record.gender;
        if (gender === 1) return <Tag color="blue">男</Tag>;
        if (gender === 2) return <Tag color="pink">女</Tag>;
        return '-';
      },
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      width: 150,
      render: (_, record) => (
        <Space>
          <BankOutlined />
          <span>{record.departmentName}</span>
        </Space>
      ),
    },
    {
      title: '岗位',
      dataIndex: 'positionName',
      width: 150,
      render: (_, record) => (
        <Space>
          <TeamOutlined />
          <span>{record.positionName}</span>
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 130,
      render: (_, record) => (
        <Space>
          <PhoneOutlined />
          <span>{record.mobile || record.phoneNumber || '-'}</span>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      hideInSearch: true,
      render: (_, record) => {
        const email = record.email;
        return email ? (
          <Space>
            <MailOutlined />
            <span>{email}</span>
          </Space>
        ) : '-';
      },
    },
    {
      title: '在职状态',
      dataIndex: 'employmentStatus',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '在职', status: 'Success' },
        2: { text: '试用', status: 'Processing' },
        3: { text: '离职', status: 'Default' },
      },
      render: (_, record) => {
        const status = record.employmentStatus || record.status;
        if (status === 1) return <Badge status="success" text="在职" />;
        if (status === 2) return <Badge status="processing" text="试用" />;
        if (status === 3) return <Badge status="default" text="离职" />;
        return <Badge status="default" text="未知" />;
      },
    },
    {
      title: '入职日期',
      dataIndex: 'entryDate',
      width: 120,
      valueType: 'date',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <CalendarOutlined />
          <span>{record.entryDate || record.hireDate || '-'}</span>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'option',
      width: 200,
      fixed: 'right',
      hideInSearch: true,
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        record.employmentStatus === 2 && (
          <Button
            key="confirm"
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleConfirm(record)}
          >
            转正
          </Button>
        ),
        <Button
          key="transfer"
          type="link"
          size="small"
          icon={<SwapOutlined />}
          onClick={() => handleTransfer(record)}
        >
          调动
        </Button>,
        record.employmentStatus !== 3 && (
          <Button
            key="resign"
            type="link"
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleResign(record)}
          >
            离职
          </Button>
        ),
        <Popconfirm
          key="delete"
          title="确定要删除这个员工吗？"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="员工总数"
              value={statistics.totalCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在职人数"
              value={statistics.onJobCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="试用期人数"
              value={statistics.probationCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="离职人数"
              value={statistics.leaveCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 员工列表 */}
      <ProTable<EmployeeType>
        headerTitle="员工管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 1600 }}
        toolBarRender={() => [
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
          >
            下载模板
          </Button>,
          <Button
            key="import"
            icon={<ImportOutlined />}
            onClick={handleImport}
          >
            导入员工
          </Button>,
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增员工
          </Button>,
        ]}
        request={async (params) => {
          try {
            console.log('员工列表请求参数:', params);
            const response = await getEmployeePage({
              page: params.current,
              size: params.pageSize,
              keyword: params.keyword || params.name,
              departmentId: params.departmentId ? Number(params.departmentId) : undefined,
              positionId: params.positionId ? Number(params.positionId) : undefined,
              status: params.employmentStatus || params.status ? Number(params.employmentStatus || params.status) : undefined,
              employmentType: params.employmentType,
            });
            
            console.log('员工列表响应:', response);
            
            if (response && response.resp_code === 0) {
              const records = response.datas?.records || response.datas?.data || response.data?.records || response.data || [];
              const total = response.datas?.total || response.datas?.count || response.data?.total || 0;
              
              if (records.length > 0) {
                const firstRecord = records[0];
                if (firstRecord.shortName || firstRecord.jobDescription || firstRecord.salaryRange) {
                  console.warn('接口返回的是岗位数据，不是员工数据');
                  message.warning('当前没有员工数据，请先添加员工');
                  return {
                    data: [],
                    success: true,
                    total: 0,
                  };
                }
              }
              
              return {
                data: records,
                success: true,
                total: total,
              };
            }
            
            console.warn('员工列表响应格式不正确:', response);
            return {
              data: [],
              success: true,
              total: 0,
            };
          } catch (error) {
            console.error('获取员工列表失败:', error);
            return {
              data: [],
              success: true,
              total: 0,
            };
          }
        }}
        columns={columns}
      />

      {/* 新增/编辑员工Modal - 步骤化表单 */}
      <Modal
        title={editingRecord ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
        className="employee-form-modal"
      >
        <div className="step-form">
          {/* 步骤导航 */}
          <div className="step-header">
            <div className="step-nav">
              <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-title">基本信息</div>
              </div>
              <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-title">组织信息</div>
              </div>
              <div className={`step-item ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-title">个人详情</div>
              </div>
              <div className={`step-item ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-title">家庭成员</div>
              </div>
              <div className={`step-item ${currentStep >= 5 ? 'active' : ''} ${currentStep > 5 ? 'completed' : ''}`}>
                <div className="step-number">5</div>
                <div className="step-title">教育经历</div>
              </div>
              <div className={`step-item ${currentStep >= 6 ? 'active' : ''} ${currentStep > 6 ? 'completed' : ''}`}>
                <div className="step-number">6</div>
                <div className="step-title">工作经验</div>
              </div>
              <div className={`step-item ${currentStep >= 7 ? 'active' : ''} ${currentStep > 7 ? 'completed' : ''}`}>
                <div className="step-number">7</div>
                <div className="step-title">确认信息</div>
              </div>
            </div>
          </div>

          {/* 表单内容 */}
          <div className="step-content">
            <ProForm
              form={form}
              onFinish={handleSubmit}
              layout="horizontal"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              submitter={false}
            >
              {/* 第一步：基本信息 */}
              {currentStep === 1 && (
                <div>
                  <h3 style={{ marginBottom: 24, color: '#333', fontSize: '18px', fontWeight: 600 }}>基本信息</h3>
                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormText
                        name="empNo"
                        label="工号"
                        placeholder="请输入工号或点击生成"
                        rules={[{ required: true, message: '请输入工号' }]}
                        fieldProps={{
                          addonAfter: !editingRecord ? (
                            <Button
                              size="small"
                              type="link"
                              onClick={() => {
                                const departmentId = form.getFieldValue('departmentId');
                                handleGenerateEmpNo(departmentId);
                              }}
                            >
                              生成
                            </Button>
                          ) : null,
                        }}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="name"
                        label="姓名"
                        placeholder="请输入姓名"
                        rules={[{ required: true, message: '请输入姓名' }]}
                      />
                    </Col>
                  </Row>
                  
                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormText
                        name="nameEn"
                        label="英文姓名"
                        placeholder="请输入英文姓名"
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormSelect
                        name="gender"
                        label="性别"
                        placeholder="请选择性别"
                        options={[
                          { label: '男', value: 1 },
                          { label: '女', value: 2 },
                        ]}
                        rules={[{ required: true, message: '请选择性别' }]}
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormDatePicker
                        name="birthDate"
                        label="出生日期"
                        placeholder="请选择出生日期"
                        fieldProps={{
                          style: { width: '100%' },
                        }}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="idCard"
                        label="身份证号"
                        placeholder="请输入身份证号"
                        rules={[
                          { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号' }
                        ]}
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormText
                        name="mobile"
                        label="手机号"
                        placeholder="请输入手机号"
                        rules={[
                          { required: true, message: '请输入手机号' },
                          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                        ]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="email"
                        label="邮箱"
                        placeholder="请输入邮箱"
                        rules={[
                          { type: 'email', message: '请输入正确的邮箱格式' }
                        ]}
                      />
                    </Col>
                  </Row>
                </div>
              )}

              {/* 第二步：组织信息 */}
              {currentStep === 2 && (
                <div>
                  <h3 style={{ marginBottom: 24, color: '#333', fontSize: '18px', fontWeight: 600 }}>组织信息</h3>
                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormSelect
                        name="departmentId"
                        label="所属部门"
                        placeholder="请选择部门"
                        options={departments}
                        rules={[{ required: true, message: '请选择部门' }]}
                        fieldProps={{
                          showSearch: true,
                          optionLabelProp: 'label',
                          onChange: (value) => {
                            if (!editingRecord) {
                              form.setFieldValue('empNo', '');
                            }
                          },
                        }}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormSelect
                        name="positionId"
                        label="主岗位"
                        placeholder="请选择主岗位"
                        options={positions.map(pos => ({ label: pos.name, value: pos.id }))}
                        rules={[{ required: true, message: '请选择主岗位' }]}
                        fieldProps={{
                          showSearch: true,
                          optionLabelProp: 'label',
                        }}
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormSelect
                        name="employmentType"
                        label="用工类型"
                        placeholder="请选择用工类型"
                        options={[
                          { label: '正式员工', value: 1 },
                          { label: '实习生', value: 2 },
                          { label: '外包员工', value: 3 },
                          { label: '劳务员工', value: 4 },
                        ]}
                        rules={[{ required: true, message: '请选择用工类型' }]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormSelect
                        name="employmentStatus"
                        label="在职状态"
                        placeholder="请选择在职状态"
                        options={[
                          { label: '在职', value: 1 },
                          { label: '试用', value: 2 },
                          { label: '离职', value: 3 },
                        ]}
                        rules={[{ required: true, message: '请选择在职状态' }]}
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormDatePicker
                        name="entryDate"
                        label="入职日期"
                        placeholder="请选择入职日期"
                        rules={[{ required: true, message: '请选择入职日期' }]}
                        fieldProps={{
                          style: { width: '100%' },
                        }}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormDatePicker
                        name="probationEndDate"
                        label="试用期结束日期"
                        placeholder="请选择试用期结束日期"
                        fieldProps={{
                          style: { width: '100%' },
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              )}

              {/* 第三步：个人详情 */}
              {currentStep === 3 && (
                <div>
                  <h3 style={{ marginBottom: 24, color: '#333', fontSize: '18px', fontWeight: 600 }}>个人详情</h3>
                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormSelect
                        name="education"
                        label="学历"
                        placeholder="请选择学历"
                        options={[
                          { label: '小学', value: '小学' },
                          { label: '初中', value: '初中' },
                          { label: '高中', value: '高中' },
                          { label: '中专', value: '中专' },
                          { label: '大专', value: '大专' },
                          { label: '本科', value: '本科' },
                          { label: '硕士', value: '硕士' },
                          { label: '博士', value: '博士' },
                        ]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="nation"
                        label="民族"
                        placeholder="请输入民族"
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormSelect
                        name="healthStatus"
                        label="健康状况"
                        placeholder="请选择健康状况"
                        options={[
                          { label: '健康', value: '健康' },
                          { label: '良好', value: '良好' },
                          { label: '一般', value: '一般' },
                          { label: '较差', value: '较差' },
                        ]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormSelect
                        name="maritalStatus"
                        label="婚姻状况"
                        placeholder="请选择婚姻状况"
                        options={[
                          { label: '未婚', value: '未婚' },
                          { label: '已婚', value: '已婚' },
                          { label: '离异', value: '离异' },
                          { label: '丧偶', value: '丧偶' },
                        ]}
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormText
                        name="height"
                        label="身高(cm)"
                        placeholder="请输入身高"
                        fieldProps={{
                          type: 'number',
                          min: 100,
                          max: 250,
                        }}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="weight"
                        label="体重(kg)"
                        placeholder="请输入体重"
                        fieldProps={{
                          type: 'number',
                          min: 20,
                          max: 200,
                        }}
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormText
                        name="birthplace"
                        label="籍贯"
                        placeholder="请输入籍贯"
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="residence"
                        label="现居住地"
                        placeholder="请输入现居住地址"
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormText
                        name="emergencyContact"
                        label="紧急联系人"
                        placeholder="请输入紧急联系人姓名"
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="emergencyPhone"
                        label="紧急联系电话"
                        placeholder="请输入紧急联系电话"
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={24}>
                      <ProFormTextArea
                        name="specialty"
                        label="专业技能"
                        placeholder="请描述专业技能和特长"
                        fieldProps={{
                          rows: 3,
                        }}
                      />
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={24}>
                      <ProFormTextArea
                        name="remark"
                        label="备注"
                        placeholder="请输入备注信息"
                        fieldProps={{
                          rows: 3,
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              )}

              {/* 第四步：家庭成员 */}
              {currentStep === 4 && (
                <div>
                  <h3 style={{ marginBottom: 24, color: '#333', fontSize: '18px', fontWeight: 600 }}>家庭成员</h3>
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ background: '#fafafa', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#333' }}>家庭成员信息</span>
                      <Button type="primary" size="small" onClick={addFamilyMember}>
                        + 添加成员
                      </Button>
                    </div>
                    {familyMembers.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                        暂无家庭成员信息，点击"添加成员"开始添加
                      </div>
                    ) : (
                      familyMembers.map((member, index) => (
                        <div key={member.id} style={{ borderBottom: index < familyMembers.length - 1 ? '1px solid #f0f0f0' : 'none', padding: 16, position: 'relative' }}>
                          <Button
                            type="text"
                            danger
                            size="small"
                            style={{ position: 'absolute', top: 12, right: 12 }}
                            onClick={() => removeFamilyMember(member.id)}
                          >
                            删除
                          </Button>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  姓名 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="请输入姓名"
                                  value={member.name}
                                  onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  关系 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <select
                                  value={member.relation}
                                  onChange={(e) => updateFamilyMember(member.id, 'relation', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                >
                                  <option value="">请选择关系</option>
                                  <option value="父亲">父亲</option>
                                  <option value="母亲">母亲</option>
                                  <option value="配偶">配偶</option>
                                  <option value="子女">子女</option>
                                  <option value="兄弟姐妹">兄弟姐妹</option>
                                  <option value="其他">其他</option>
                                </select>
                              </div>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>职位</label>
                                <input
                                  type="text"
                                  placeholder="请输入职位"
                                  value={member.position}
                                  onChange={(e) => updateFamilyMember(member.id, 'position', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>工作单位</label>
                                <input
                                  type="text"
                                  placeholder="请输入工作单位"
                                  value={member.company}
                                  onChange={(e) => updateFamilyMember(member.id, 'company', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 第五步：教育经历 */}
              {currentStep === 5 && (
                <div>
                  <h3 style={{ marginBottom: 24, color: '#333', fontSize: '18px', fontWeight: 600 }}>教育经历</h3>
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ background: '#fafafa', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#333' }}>教育经历信息</span>
                      <Button type="primary" size="small" onClick={addEducationHistory}>
                        + 添加经历
                      </Button>
                    </div>
                    {educationHistory.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                        暂无教育经历信息，点击"添加经历"开始添加
                      </div>
                    ) : (
                      educationHistory.map((edu, index) => (
                        <div key={edu.id} style={{ borderBottom: index < educationHistory.length - 1 ? '1px solid #f0f0f0' : 'none', padding: 16, position: 'relative' }}>
                          <Button
                            type="text"
                            danger
                            size="small"
                            style={{ position: 'absolute', top: 12, right: 12 }}
                            onClick={() => removeEducationHistory(edu.id)}
                          >
                            删除
                          </Button>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  毕业院校 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="请输入毕业院校"
                                  value={edu.school}
                                  onChange={(e) => updateEducationHistory(edu.id, 'school', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  专业 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="请输入专业"
                                  value={edu.major}
                                  onChange={(e) => updateEducationHistory(edu.id, 'major', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  开始时间 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="date"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducationHistory(edu.id, 'startDate', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  结束时间 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="date"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducationHistory(edu.id, 'endDate', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>学位/证书</label>
                                <input
                                  type="text"
                                  placeholder="请输入学位或证书"
                                  value={edu.degree}
                                  onChange={(e) => updateEducationHistory(edu.id, 'degree', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>证明人</label>
                                <input
                                  type="text"
                                  placeholder="请输入证明人"
                                  value={edu.referee}
                                  onChange={(e) => updateEducationHistory(edu.id, 'referee', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 第六步：工作经验 */}
              {currentStep === 6 && (
                <div>
                  <h3 style={{ marginBottom: 24, color: '#333', fontSize: '18px', fontWeight: 600 }}>工作经验</h3>
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ background: '#fafafa', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#333' }}>工作经验信息</span>
                      <Button type="primary" size="small" onClick={addWorkExperience}>
                        + 添加经验
                      </Button>
                    </div>
                    {workExperience.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                        暂无工作经验信息，点击"添加经验"开始添加
                      </div>
                    ) : (
                      workExperience.map((work, index) => (
                        <div key={work.id} style={{ borderBottom: index < workExperience.length - 1 ? '1px solid #f0f0f0' : 'none', padding: 16, position: 'relative' }}>
                          <Button
                            type="text"
                            danger
                            size="small"
                            style={{ position: 'absolute', top: 12, right: 12 }}
                            onClick={() => removeWorkExperience(work.id)}
                          >
                            删除
                          </Button>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  公司 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="请输入公司名称"
                                  value={work.company}
                                  onChange={(e) => updateWorkExperience(work.id, 'company', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  职务 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="请输入职务"
                                  value={work.position}
                                  onChange={(e) => updateWorkExperience(work.id, 'position', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  开始时间 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="date"
                                  value={work.startDate}
                                  onChange={(e) => updateWorkExperience(work.id, 'startDate', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>
                                  结束时间 <span style={{ color: '#ff4d4f' }}>*</span>
                                </label>
                                <input
                                  type="date"
                                  value={work.endDate}
                                  onChange={(e) => updateWorkExperience(work.id, 'endDate', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>收入</label>
                                <input
                                  type="number"
                                  placeholder="请输入收入"
                                  value={work.salary}
                                  onChange={(e) => updateWorkExperience(work.id, 'salary', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>离职原因</label>
                                <input
                                  type="text"
                                  placeholder="请输入离职原因"
                                  value={work.leaveReason}
                                  onChange={(e) => updateWorkExperience(work.id, 'leaveReason', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>证明人</label>
                                <input
                                  type="text"
                                  placeholder="请输入证明人"
                                  value={work.referee}
                                  onChange={(e) => updateWorkExperience(work.id, 'referee', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500 }}>证明人电话</label>
                                <input
                                  type="tel"
                                  placeholder="请输入证明人电话"
                                  value={work.refereePhone}
                                  onChange={(e) => updateWorkExperience(work.id, 'refereePhone', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 第七步：确认信息 */}
              {currentStep === 7 && (
                <div>
                  <h3 style={{ marginBottom: 24, color: '#333', fontSize: '18px', fontWeight: 600 }}>确认信息</h3>
                  <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="工号">{form.getFieldValue('empNo')}</Descriptions.Item>
                      <Descriptions.Item label="姓名">{form.getFieldValue('name')}</Descriptions.Item>
                      <Descriptions.Item label="英文姓名">{form.getFieldValue('nameEn') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="性别">
                        {form.getFieldValue('gender') === 1 ? '男' : form.getFieldValue('gender') === 2 ? '女' : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="出生日期">{form.getFieldValue('birthDate')?.format('YYYY-MM-DD') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="身份证号">{form.getFieldValue('idCard') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="手机号">{form.getFieldValue('mobile')}</Descriptions.Item>
                      <Descriptions.Item label="邮箱">{form.getFieldValue('email') || '-'}</Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card title="组织信息" size="small" style={{ marginBottom: 16 }}>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="所属部门">
                        {departments.find(d => d.value === form.getFieldValue('departmentId'))?.label || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="主岗位">
                        {positions.find(p => p.id === form.getFieldValue('positionId'))?.name || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="用工类型">
                        {
                          form.getFieldValue('employmentType') === 1 ? '正式员工' :
                          form.getFieldValue('employmentType') === 2 ? '实习生' :
                          form.getFieldValue('employmentType') === 3 ? '外包员工' :
                          form.getFieldValue('employmentType') === 4 ? '劳务员工' : '-'
                        }
                      </Descriptions.Item>
                      <Descriptions.Item label="在职状态">
                        {
                          form.getFieldValue('employmentStatus') === 1 ? '在职' :
                          form.getFieldValue('employmentStatus') === 2 ? '试用' :
                          form.getFieldValue('employmentStatus') === 3 ? '离职' : '-'
                        }
                      </Descriptions.Item>
                      <Descriptions.Item label="入职日期">{form.getFieldValue('entryDate')?.format('YYYY-MM-DD') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="试用期结束日期">{form.getFieldValue('probationEndDate')?.format('YYYY-MM-DD') || '-'}</Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card title="个人详情" size="small">
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="学历">{form.getFieldValue('education') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="民族">{form.getFieldValue('nation') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="健康状况">{form.getFieldValue('healthStatus') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="婚姻状况">{form.getFieldValue('maritalStatus') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="身高">{form.getFieldValue('height') ? `${form.getFieldValue('height')}cm` : '-'}</Descriptions.Item>
                      <Descriptions.Item label="体重">{form.getFieldValue('weight') ? `${form.getFieldValue('weight')}kg` : '-'}</Descriptions.Item>
                      <Descriptions.Item label="籍贯">{form.getFieldValue('birthplace') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="现居住地">{form.getFieldValue('residence') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="紧急联系人">{form.getFieldValue('emergencyContact') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="紧急联系电话">{form.getFieldValue('emergencyPhone') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="专业技能" span={2}>{form.getFieldValue('specialty') || '-'}</Descriptions.Item>
                      <Descriptions.Item label="备注" span={2}>{form.getFieldValue('remark') || '-'}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              )}
            </ProForm>
          </div>

          {/* 步骤操作按钮 */}
          <div className="step-actions">
            <div>
              {currentStep > 1 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  上一步
                </Button>
              )}
            </div>
            <div>
              {currentStep < 7 ? (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  下一步
                </Button>
              ) : (
                <Space>
                  <Button onClick={() => setModalVisible(false)}>
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    loading={loading}
                    onClick={() => form.submit()}
                  >
                    {editingRecord ? '更新' : '提交'}
                  </Button>
                </Space>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* 其他Modal组件 */}
      {/* 员工详情抽屉 */}
      <Drawer
        title="员工详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={800}
      >
        {selectedEmployee && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar
                      size={100}
                      src={selectedEmployee.avatar}
                      icon={<UserOutlined />}
                      style={{ marginBottom: 12, border: '4px solid #f0f0f0' }}
                    />
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#333' }}>
                      {selectedEmployee.name}
                    </div>
                    <div style={{ color: '#999', fontSize: '14px', marginBottom: 8 }}>
                      {selectedEmployee.empNo}
                    </div>
                    <Space>
                      <Tag color="blue">{selectedEmployee.departmentName}</Tag>
                      <Tag color="green">{selectedEmployee.positionName}</Tag>
                    </Space>
                  </div>
                </Col>
                <Col span={18}>
                  <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="基本信息" key="basic">
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="姓名">{selectedEmployee.name || '-'}</Descriptions.Item>
                        <Descriptions.Item label="英文姓名">{selectedEmployee.nameEn || '-'}</Descriptions.Item>
                        <Descriptions.Item label="性别">
                          {selectedEmployee.gender === 1 ? '男' : selectedEmployee.gender === 2 ? '女' : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="出生日期">{selectedEmployee.birthDate || '-'}</Descriptions.Item>
                        <Descriptions.Item label="身份证号">{selectedEmployee.idCard || '-'}</Descriptions.Item>
                        <Descriptions.Item label="手机号">{selectedEmployee.mobile || selectedEmployee.phoneNumber || '-'}</Descriptions.Item>
                        <Descriptions.Item label="邮箱">{selectedEmployee.email || '-'}</Descriptions.Item>
                        <Descriptions.Item label="民族">{selectedEmployee.nation || '-'}</Descriptions.Item>
                        <Descriptions.Item label="婚姻状况">{selectedEmployee.maritalStatus || '-'}</Descriptions.Item>
                      </Descriptions>
                    </TabPane>
                    
                    <TabPane tab="职业信息" key="career">
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="部门">{selectedEmployee.departmentName || '-'}</Descriptions.Item>
                        <Descriptions.Item label="主岗位">{selectedEmployee.positionName || '-'}</Descriptions.Item>
                        <Descriptions.Item label="在职状态">
                          <Badge 
                            status={
                              selectedEmployee.employmentStatus === 1 ? 'success' :
                              selectedEmployee.employmentStatus === 2 ? 'processing' :
                              selectedEmployee.employmentStatus === 3 ? 'default' : 'default'
                            }
                            text={
                              selectedEmployee.employmentStatus === 1 ? '在职' : 
                              selectedEmployee.employmentStatus === 2 ? '试用' :
                              selectedEmployee.employmentStatus === 3 ? '离职' : '-'
                            }
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="入职日期">{selectedEmployee.entryDate || selectedEmployee.hireDate || '-'}</Descriptions.Item>
                        <Descriptions.Item label="试用期结束日期">{selectedEmployee.probationEndDate || '-'}</Descriptions.Item>
                        <Descriptions.Item label="离职日期">{selectedEmployee.leaveDate || '-'}</Descriptions.Item>
                      </Descriptions>
                    </TabPane>
                  </Tabs>
                </Col>
              </Row>
            </Card>

            {selectedEmployee.remark && (
              <Card title="备注信息">
                <div style={{ padding: 16, background: '#fafafa', borderRadius: 6 }}>
                  {selectedEmployee.remark}
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 员工调动Modal */}
      <Modal
        title="员工调动"
        open={transferVisible}
        onCancel={() => setTransferVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          form={transferForm}
          onFinish={async (values) => {
            try {
              if (!selectedEmployee) return;
              await transferEmployee(selectedEmployee.id, values.newDepartmentId, values.newPositionId);
              message.success('调动成功');
              setTransferVisible(false);
              actionRef.current?.reload();
              loadStatistics();
            } catch (error) {
              console.error('调动失败:', error);
              message.error('调动失败');
            }
          }}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <ProFormText
            name="employeeName"
            label="员工姓名"
            disabled
            width="md"
          />
          <ProFormText
            name="currentDepartment"
            label="当前部门"
            disabled
            width="md"
          />
          <ProFormText
            name="currentPosition"
            label="当前岗位"
            disabled
            width="md"
          />
          <ProFormSelect
            name="newDepartmentId"
            label="调往部门"
            placeholder="请选择新部门"
            options={departments}
            rules={[{ required: true, message: '请选择新部门' }]}
            width="md"
            fieldProps={{
              showSearch: true,
              filterOption: (input: string, option: any) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }}
          />
          <ProFormSelect
            name="newPositionId"
            label="调往岗位"
            placeholder="请选择新岗位"
            options={positions.map(pos => ({ label: pos.name, value: pos.id }))}
            width="md"
            fieldProps={{
              showSearch: true,
              filterOption: (input: string, option: any) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }}
          />
        </ProForm>
      </Modal>

      {/* 员工离职Modal */}
      <Modal
        title="员工离职"
        open={resignVisible}
        onCancel={() => setResignVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          form={resignForm}
          onFinish={async (values) => {
            try {
              if (!selectedEmployee) return;
              await resignEmployee(selectedEmployee.id, values.leaveDate, values.leaveReason);
              message.success('离职办理成功');
              setResignVisible(false);
              actionRef.current?.reload();
              loadStatistics();
            } catch (error) {
              console.error('离职办理失败:', error);
              message.error('离职办理失败');
            }
          }}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <ProFormText
            name="employeeName"
            label="员工姓名"
            disabled
            width="md"
          />
          <ProFormText
            name="department"
            label="所属部门"
            disabled
            width="md"
          />
          <ProFormText
            name="position"
            label="当前岗位"
            disabled
            width="md"
          />
          <ProFormDatePicker
            name="leaveDate"
            label="离职日期"
            placeholder="请选择离职日期"
            rules={[{ required: true, message: '请选择离职日期' }]}
            width="md"
          />
          <ProFormTextArea
            name="leaveReason"
            label="离职原因"
            placeholder="请输入离职原因"
            rules={[{ required: true, message: '请输入离职原因' }]}
            width="xl"
          />
        </ProForm>
      </Modal>

      {/* 导入Modal */}
      <Modal
        title="导入员工"
        open={importVisible}
        onCancel={() => setImportVisible(false)}
        footer={null}
        width={600}
      >
        <Upload.Dragger
          name="file"
          multiple={false}
          accept=".xlsx,.xls"
          beforeUpload={(file) => {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                          file.type === 'application/vnd.ms-excel';
            if (!isExcel) {
              message.error('只能上传Excel文件！');
              return false;
            }
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
              message.error('文件大小不能超过10MB！');
              return false;
            }
            return false;
          }}
          customRequest={async ({ file }) => {
            try {
              setLoading(true);
              const response = await importEmployees(file as File);
              if (response && response.resp_code === 0) {
                const result = response.datas || response.data;
                message.success(`导入成功！成功：${result.successCount}，失败：${result.failedCount}`);
                if (result.errors && result.errors.length > 0) {
                  console.warn('导入错误详情:', result.errors);
                }
                setImportVisible(false);
                actionRef.current?.reload();
                loadStatistics();
              } else {
                message.error(response?.resp_msg || '导入失败');
              }
            } catch (error) {
              console.error('导入失败:', error);
              message.error('导入失败');
            } finally {
              setLoading(false);
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个Excel文件上传，文件大小不超过10MB
          </p>
        </Upload.Dragger>
      </Modal>
    </PageContainer>
  );
};

export default Employees; 