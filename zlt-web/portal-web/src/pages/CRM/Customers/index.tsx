import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Space, Table, Tag, Popconfirm, Row, Col, Statistic, Spin, DatePicker, Steps, Tabs, AutoComplete } from 'antd';
import moment from 'moment';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PhoneOutlined, UserOutlined, BankOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCustomerPage, getCustomerDetail, createCustomer, updateCustomer, deleteCustomer, getCustomerStatistics, CRMEnums, EnumUtils } from '@/services/crm';
import { request } from '@/utils/request';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const Customers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [customers, setCustomers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [statistics, setStatistics] = useState<any>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [customerType, setCustomerType] = useState<string>('individual');
  
  // 使用useRef缓存数据，避免重复API调用
  const cacheRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    loadCustomers();
    loadStatistics();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter, typeFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // 生成缓存key
      const cacheKey = `customers_${pagination.current}_${pagination.pageSize}_${searchText}_${statusFilter}_${typeFilter}`;
      
      // 检查缓存
      if (cacheRef.current.has(cacheKey)) {
        const cachedData = cacheRef.current.get(cacheKey);
        setCustomers(cachedData.records || []);
        setPagination(prev => ({ ...prev, total: cachedData.total || 0 }));
        return;
      }
      
      // 转换中文枚举值为英文（如果需要）
      let convertedStatus = statusFilter === 'all' ? undefined : statusFilter;
      let convertedType = typeFilter === 'all' ? undefined : typeFilter;
      
      // 如果状态是中文，转换为英文
      if (convertedStatus) {
        convertedStatus = EnumUtils.getValue(CRMEnums.CustomerStatus, convertedStatus) || convertedStatus;
      }
      
      // 如果类型是中文，转换为英文  
      if (convertedType) {
        convertedType = EnumUtils.getValue(CRMEnums.CustomerType, convertedType) || convertedType;
      }

      const response = await getCustomerPage({
        page: pagination.current,
        size: pagination.pageSize,
        customerName: searchText || undefined,
        customerStatus: convertedStatus,
        customerType: convertedType,
      });
      
      console.log('客户管理 - API响应:', response);
      
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        const records = data?.records || data?.content || data || [];
        const total = data?.total || data?.totalElements || records.length;
        
        setCustomers(records);
        setPagination(prev => ({ ...prev, total }));
        
        // 缓存数据
        cacheRef.current.set(cacheKey, { records, total });
      } else {
        message.error(response.message || '获取客户列表失败');
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
      message.error('获取客户列表失败，请检查网络连接和后端服务');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await getCustomerStatistics({});
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        setStatistics(data || {});
      }
    } catch (error) {
      console.error('获取客户统计失败:', error);
    }
  };

  // 动态加载员工列表，用于表单选择，使用统一的请求方法
  const loadEmployees = async (keyword?: string) => {
    try {
      setEmployeeLoading(true);
      // 检查员工列表缓存
      const cacheKey = `employees_${keyword || ''}`;
      if (cacheRef.current.has(cacheKey)) {
        setEmployees(cacheRef.current.get(cacheKey));
        return;
      }
      // 使用统一的请求方法调用组织模块的员工列表接口
      const response = await request(`/api-portal/api/organization/employee/page`, {
        method: 'GET',
        params: {
          keyword: keyword || '',
          page: 1,
          size: 100
        }
      });
      // 适配新分页结构
      let employeeList: any[] = [];
      if (response && (response.success || response.resp_code === 0 || response.code === 0)) {
        employeeList = response.data ?? [];
      }
      setEmployees(employeeList);
      // 缓存员工列表
      cacheRef.current.set(cacheKey, employeeList);
    } catch (error) {
      console.error('获取员工列表失败:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleSearch = () => {
    // 清空缓存
    cacheRef.current.clear();
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setCurrentStep(0);
    setCustomerType('individual');
    
    // 加载员工列表并设置默认值
    loadEmployees().then(() => {
      // 设置默认值 - 默认选择当前用户作为负责人
      form.setFieldsValue({
        customerType: 'individual',
        customerStatus: 'potential',
        ownerEmployeeId: '1', // 默认选择第一个员工（如张伟强）
      });
    });
    
    setModalVisible(true);
  };

  const handleEdit = async (record: any) => {
    try {
      setEditingRecord(record);
      setCurrentStep(0);
      setModalVisible(true);
      
      // 先获取完整的客户信息（包括扩展数据）
      const customerDetail = await getCustomerDetail(record.customerId);
      const fullRecord = customerDetail.datas || customerDetail.data || customerDetail;
      
      const currentCustomerType = fullRecord.customerType || 'individual';
      setCustomerType(currentCustomerType);
      
      // 根据数据库字段映射表单字段
      const formData = {
        customerName: fullRecord.customerName,
        customerType: currentCustomerType,
        customerStatus: fullRecord.customerStatus,
        customerSource: fullRecord.customerSource,
        ownerEmployeeId: fullRecord.ownerEmployeeId,
        contactPhone: fullRecord.contactPhone,
        contactEmail: fullRecord.contactEmail,
        contactAddress: fullRecord.contactAddress,
        industry: fullRecord.industry,
        companyScale: fullRecord.companyScale,
        annualRevenue: fullRecord.annualRevenue,
        website: fullRecord.website,
        description: fullRecord.description,
        // 根据客户类型处理不同的字段
        ...(currentCustomerType === 'individual' && fullRecord.individualCustomer ? {
          realName: fullRecord.individualCustomer.realName,
          idCard: fullRecord.individualCustomer.idCard,
          gender: fullRecord.individualCustomer.gender,
          birthDate: fullRecord.individualCustomer.birthDate ? moment(fullRecord.individualCustomer.birthDate) : null,
          maritalStatus: fullRecord.individualCustomer.maritalStatus,
          education: fullRecord.individualCustomer.education,
          occupation: fullRecord.individualCustomer.occupation,
          annualIncome: fullRecord.individualCustomer.annualIncome,
          homeAddress: fullRecord.individualCustomer.homeAddress,
          workCompany: fullRecord.individualCustomer.workCompany,
          workAddress: fullRecord.individualCustomer.workAddress,
          hobbies: fullRecord.individualCustomer.hobbies,
          wechat: fullRecord.individualCustomer.wechat,
          qq: fullRecord.individualCustomer.qq,
          emergencyContact: fullRecord.individualCustomer.emergencyContact,
          emergencyPhone: fullRecord.individualCustomer.emergencyPhone,
        } : {}),
        ...(currentCustomerType === 'enterprise' && fullRecord.corporateCustomer ? {
          companyFullName: fullRecord.corporateCustomer.companyFullName,
          creditCode: fullRecord.corporateCustomer.creditCode,
          legalPerson: fullRecord.corporateCustomer.legalPerson,
          registeredCapital: fullRecord.corporateCustomer.registeredCapital,
          establishmentDate: fullRecord.corporateCustomer.establishmentDate ? moment(fullRecord.corporateCustomer.establishmentDate) : null,
          businessScope: fullRecord.corporateCustomer.businessScope,
          companyNature: fullRecord.corporateCustomer.companyNature,
          employeeCount: fullRecord.corporateCustomer.employeeCount,
          mainProducts: fullRecord.corporateCustomer.mainProducts,
          targetCustomers: fullRecord.corporateCustomer.targetCustomers,
          officialWebsite: fullRecord.corporateCustomer.officialWebsite,
          officeAddress: fullRecord.corporateCustomer.officeAddress,
          registeredAddress: fullRecord.corporateCustomer.registeredAddress,
          bankAccount: fullRecord.corporateCustomer.bankAccount,
          bankName: fullRecord.corporateCustomer.bankName,
          taxNumber: fullRecord.corporateCustomer.taxNumber,
          mainContact: fullRecord.corporateCustomer.mainContact,
          contactPosition: fullRecord.corporateCustomer.contactPosition,
          decisionMaker: fullRecord.corporateCustomer.decisionMaker,
          purchaseProcess: fullRecord.corporateCustomer.purchaseProcess,
          paymentMethod: fullRecord.corporateCustomer.paymentMethod,
          creditRating: fullRecord.corporateCustomer.creditRating,
        } : {})
      };
      
      form.setFieldsValue(formData);
      // 加载员工列表用于选择
      loadEmployees();
    } catch (error) {
      message.error('获取客户详情失败');
      console.error('获取客户详情失败:', error);
    }
  };

  const handleDelete = async (customerId: number) => {
    try {
      const response = await deleteCustomer(customerId);
      if (response.success || response.resp_code === 0) {
        message.success('删除成功');
        // 清空缓存并重新加载
        cacheRef.current.clear();
        loadCustomers();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('Received form values:', values);
      
      // 处理日期格式
      const formatDate = (date: any) => {
        if (!date) return null;
        if (date._isAMomentObject) {
          return date.format('YYYY-MM-DD');
        }
        return date;
      };
      
      // 基本信息
      const baseData = {
        customerName: values.customerName,
        customerType: values.customerType || 'individual',
        customerStatus: values.customerStatus || 'potential',
        customerSource: values.customerSource,
        ownerEmployeeId: values.ownerEmployeeId,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        contactAddress: values.contactAddress,
        industry: values.industry,
        companyScale: values.companyScale,
        annualRevenue: values.annualRevenue,
        website: values.website,
        description: values.description,
      };
      
       // 根据客户类型添加对应的扩展字段
       let submitData: any = { ...baseData };
       
       if (values.customerType === 'individual') {
         // 个人客户：将扩展信息作为嵌套对象
         submitData.individualCustomer = {
           realName: values.realName,
           idCard: values.idCard,
           gender: values.gender,
           birthDate: formatDate(values.birthDate),
           maritalStatus: values.maritalStatus,
           education: values.education,
           occupation: values.occupation,
           annualIncome: values.annualIncome,
           homeAddress: values.homeAddress,
           workCompany: values.workCompany,
           workAddress: values.workAddress,
           hobbies: values.hobbies,
           wechat: values.wechat,
           qq: values.qq,
           emergencyContact: values.emergencyContact,
           emergencyPhone: values.emergencyPhone,
         };
       } else if (values.customerType === 'enterprise') {
         // 企业客户：将扩展信息作为嵌套对象
         submitData.corporateCustomer = {
           companyFullName: values.companyFullName,
           creditCode: values.creditCode,
           legalPerson: values.legalPerson,
           registeredCapital: values.registeredCapital,
           establishmentDate: formatDate(values.establishmentDate),
           businessScope: values.businessScope,
           companyNature: values.companyNature,
           employeeCount: values.employeeCount,
           mainProducts: values.mainProducts,
           targetCustomers: values.targetCustomers,
           officialWebsite: values.officialWebsite,
           officeAddress: values.officeAddress,
           registeredAddress: values.registeredAddress,
           bankAccount: values.bankAccount,
           bankName: values.bankName,
           taxNumber: values.taxNumber,
           mainContact: values.mainContact,
           contactPosition: values.contactPosition,
           decisionMaker: values.decisionMaker,
           purchaseProcess: values.purchaseProcess,
           paymentMethod: values.paymentMethod,
           creditRating: values.creditRating,
         };
       }

      console.log('Final submit data:', submitData);

      let response;
      if (editingRecord) {
        response = await updateCustomer(editingRecord.customerId, submitData);
      } else {
        response = await createCustomer(submitData);
      }

      if (response.success || response.resp_code === 0) {
        message.success(editingRecord ? '更新成功' : '新增成功');
        setModalVisible(false);
        form.resetFields();
        setCurrentStep(0);
        // 清空缓存并重新加载
        cacheRef.current.clear();
        loadCustomers();
        loadStatistics();
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  // 处理客户类型变化的联动效果
  const handleCustomerTypeChange = (value: string) => {
    setCustomerType(value);
    form.setFieldsValue({ customerType: value });
    // 清空客户类型相关的字段
    if (value === 'individual') {
      // 清空企业相关字段
      form.resetFields([
        'companyFullName', 'creditCode', 'legalPerson', 'registeredCapital',
        'establishmentDate', 'businessScope', 'companyNature', 'employeeCount',
        'mainProducts', 'targetCustomers', 'officialWebsite', 'officeAddress',
        'registeredAddress', 'bankAccount', 'bankName', 'taxNumber',
        'mainContact', 'contactPosition', 'decisionMaker', 'purchaseProcess',
        'paymentMethod', 'creditRating'
      ]);
    } else {
      // 清空个人相关字段
      form.resetFields([
        'realName', 'idCard', 'gender', 'birthDate', 'maritalStatus',
        'education', 'occupation', 'homeAddress', 'workCompany',
        'workAddress', 'hobbies', 'wechat', 'qq', 'emergencyContact', 'emergencyPhone'
      ]);
    }
  };

  // 步骤配置
  const steps = [
    {
      title: '基本信息',
      content: 'basic-info',
    },
    {
      title: customerType === 'individual' ? '个人详情' : '企业详情',
      content: 'detail-info',
    },
    {
      title: '其他信息',
      content: 'other-info',
    },
  ];

  const next = async () => {
    try {
      // 根据当前步骤验证对应的字段
      let fieldsToValidate: string[] = [];
      
      if (currentStep === 0) {
        // 第一步：基本信息
        fieldsToValidate = ['customerType', 'customerName', 'customerStatus', 'ownerEmployeeId'];
      } else if (currentStep === 1) {
        // 第二步：详细信息
        const currentType = form.getFieldValue('customerType');
        if (currentType === 'individual') {
          fieldsToValidate = ['realName'];
        } else if (currentType === 'enterprise') {
          fieldsToValidate = ['companyFullName', 'legalPerson', 'mainContact'];
        }
      }
      
      if (fieldsToValidate.length > 0) {
        await form.validateFields(fieldsToValidate);
      }
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.log('Validation failed:', error);
      message.error('请完善当前步骤的必填信息');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const columns = [
    {
      title: '客户信息',
      key: 'customer',
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.customerType === 'individual' ? <UserOutlined style={{ marginRight: 4 }} /> : <BankOutlined style={{ marginRight: 4 }} />}
            {record.customerName}
          </div>
          {record.contactPhone && <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {record.contactPhone || record.mobilePhone}
          </div>}
        </div>
      ),
    },
    {
      title: '客户类型',
      dataIndex: 'customerType',
      render: (type: string) => {
        const label = EnumUtils.getLabel(CRMEnums.CustomerType, type);
        return (
          <Tag color={type === 'individual' ? 'blue' : 'green'}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'customerStatus',
      render: (status: string) => {
        const label = EnumUtils.getLabel(CRMEnums.CustomerStatus, status);
        const statusColorMap: any = {
          'potential': 'orange',
          'confirmed': 'green', 
          'lost': 'red',
        };
        const color = statusColorMap[status] || 'default';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '负责人',
      dataIndex: 'ownerEmployeeName',
      render: (ownerName: string, record: any) => {
        // 使用后端返回的员工信息
        return ownerName || '-';
      },
    },
    {
      title: '来源',
      dataIndex: 'customerSource',
      render: (source: string) => source || '-',
    },
    {
      title: '等级',
      dataIndex: 'customerLevel',
      render: (level: string) => level ? <Tag color="blue">{level}级</Tag> : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.customerId)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderCustomerForm = () => {
    // 基本信息步骤
    const renderBasicInfo = () => (
      <div>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="customerType" label="客户类型" rules={[{ required: true }]}>
              <Select onChange={handleCustomerTypeChange}>
                {EnumUtils.getOptions(CRMEnums.CustomerType).map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="customerStatus" label="客户状态" rules={[{ required: true }]}>
              <Select>
                {EnumUtils.getOptions(CRMEnums.CustomerStatus).map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="ownerEmployeeId" label="负责人" rules={[{ required: true, message: '请选择负责人' }]}>
              <Select 
                placeholder="请选择负责人" 
                showSearch
                loading={employeeLoading}
                onSearch={loadEmployees}
                filterOption={false}
                onFocus={() => loadEmployees()}
                allowClear
              >
                {employees.map(employee => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.departmentName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="customerName" label="客户名称" rules={[{ required: true }]}>
          <Input placeholder={customerType === 'individual' ? '请输入客户姓名' : '请输入企业名称'} />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="contactPhone" label="联系电话">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="contactEmail" label="联系邮箱">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="industry" label="所属行业">
              <AutoComplete
                placeholder="请选择或输入所属行业"
                allowClear
                options={[
                  { value: '互联网' },
                  { value: '金融保险' },
                  { value: '房地产建筑' },
                  { value: '制造业' },
                  { value: '教育培训' },
                  { value: '医疗健康' },
                  { value: '零售电商' },
                  { value: '物流运输' },
                  { value: '能源化工' },
                  { value: '文化传媒' },
                  { value: '旅游餐饮' },
                  { value: '农业林业' },
                  { value: '政府机关' },
                  { value: '咨询服务' },
                  { value: '其他' }
                ]}
                filterOption={(inputValue, option) =>
                  option!.value.toString().toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="contactAddress" label="联系地址">
          <Input />
        </Form.Item>
      </div>
    );

    // 个人客户详情步骤
    const renderIndividualDetail = () => (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="realName" label="真实姓名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="idCard" label="身份证号">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="gender" label="性别">
              <Select>
                <Option value="male">男</Option>
                <Option value="female">女</Option>
                <Option value="unknown">未知</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="birthDate" label="出生日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="maritalStatus" label="婚姻状况">
              <Select>
                <Option value="single">未婚</Option>
                <Option value="married">已婚</Option>
                <Option value="divorced">离异</Option>
                <Option value="widowed">丧偶</Option>
                <Option value="unknown">未知</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="education" label="教育程度">
              <Select>
                <Option value="primary">小学</Option>
                <Option value="junior">初中</Option>
                <Option value="senior">高中</Option>
                <Option value="college">大专</Option>
                <Option value="bachelor">本科</Option>
                <Option value="master">硕士</Option>
                <Option value="doctor">博士</Option>
                <Option value="other">其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="occupation" label="职业">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="annualRevenue" label="年收入">
              <Input type="number" addonAfter="元" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="homeAddress" label="家庭地址">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="workCompany" label="工作单位">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="workAddress" label="工作地址">
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="wechat" label="微信号">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="qq" label="QQ号">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hobbies" label="兴趣爱好">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="emergencyContact" label="紧急联系人">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="emergencyPhone" label="紧急联系电话">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );

    // 企业客户详情步骤
    const renderCorporateDetail = () => (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="companyFullName" label="企业全称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="creditCode" label="统一社会信用代码">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="legalPerson" label="法定代表人" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="registeredCapital" label="注册资本">
              <Input type="number" addonAfter="万元" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="establishmentDate" label="成立日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="companyNature" label="企业性质">
              <Select>
                <Option value="state_owned">国有企业</Option>
                <Option value="private">民营企业</Option>
                <Option value="foreign">外资企业</Option>
                <Option value="joint_venture">合资企业</Option>
                <Option value="other">其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="employeeCount" label="员工人数">
              <Select>
                <Option value="1-10">1-10人</Option>
                <Option value="11-50">11-50人</Option>
                <Option value="51-100">51-100人</Option>
                <Option value="101-500">101-500人</Option>
                <Option value="501-1000">501-1000人</Option>
                <Option value="1000+">1000人以上</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="annualRevenue" label="年营业额">
              <Input type="number" addonAfter="万元" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="businessScope" label="经营范围">
          <TextArea rows={2} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="officeAddress" label="办公地址">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="registeredAddress" label="注册地址">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="mainContact" label="主要联系人" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="contactPosition" label="联系人职位">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="mainProducts" label="主要产品/服务">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="targetCustomers" label="目标客户群体">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="bankName" label="开户银行">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bankAccount" label="银行账号">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="taxNumber" label="税号">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="decisionMaker" label="决策人">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paymentMethod" label="付款方式">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="creditRating" label="信用等级">
              <Select>
                <Option value="AAA">AAA</Option>
                <Option value="AA">AA</Option>
                <Option value="A">A</Option>
                <Option value="BBB">BBB</Option>
                <Option value="BB">BB</Option>
                <Option value="B">B</Option>
                <Option value="CCC">CCC</Option>
                <Option value="CC">CC</Option>
                <Option value="C">C</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="purchaseProcess" label="采购流程">
          <TextArea rows={2} />
        </Form.Item>
      </div>
    );

    // 其他信息步骤
    const renderOtherInfo = () => (
      <div>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="customerSource" label="客户来源">
              <Select allowClear>
                <Option value="网络推广">网络推广</Option>
                <Option value="展会获取">展会获取</Option>
                <Option value="客户介绍">客户介绍</Option>
                <Option value="电话营销">电话营销</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="companyScale" label="规模等级">
              <Select allowClear>
                <Option value="小微">小微</Option>
                <Option value="中小">中小</Option>
                <Option value="大型">大型</Option>
                <Option value="集团">集团</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="website" label="网站地址">
              <Input placeholder="https://" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="description" label="客户描述">
          <TextArea rows={4} placeholder="请输入客户的详细描述信息，包括业务需求、合作意向等" />
        </Form.Item>
      </div>
    );


    
    return (
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        
        <div style={{ minHeight: '400px', paddingBottom: '60px' }}>
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            {renderBasicInfo()}
          </div>
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            {customerType === 'individual' ? renderIndividualDetail() : renderCorporateDetail()}
          </div>
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            {renderOtherInfo()}
          </div>
        </div>
      </Form>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>客户管理</h2>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="客户总数" 
              value={statistics.totalCustomers || customers.length} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="正式客户" 
              value={statistics.confirmedCustomers || customers.filter(c => c.customerStatus === '正式').length} 
              prefix={<BankOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="意向客户" 
              value={statistics.potentialCustomers || customers.filter(c => c.customerStatus === '意向').length} 
              prefix={<PhoneOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="企业客户" 
              value={statistics.enterpriseCustomers || customers.filter(c => c.customerType === '企业').length} 
              prefix={<BankOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="搜索客户名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="客户状态"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="意向">意向客户</Option>
              <Option value="正式">正式客户</Option>
              <Option value="流失">流失客户</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="客户类型"
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="all">全部类型</Option>
              <Option value="个人">个人客户</Option>
              <Option value="企业">企业客户</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => {
                setSearchText('');
                setStatusFilter('all');
                setTypeFilter('all');
                cacheRef.current.clear();
                loadCustomers();
              }}>
                重置
              </Button>
            </Space>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增客户
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 客户列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={customers}
          loading={loading}
          rowKey="customerId"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderCustomerForm()}
        <div style={{ textAlign: 'right', marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Space>
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            {currentStep > 0 && (
              <Button onClick={prev}>上一步</Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={next}>下一步</Button>
            ) : (
              <Button type="primary" onClick={async () => {
                try {
                  // 获取所有表单字段的值，不只是验证当前可见的
                  const values = form.getFieldsValue();
                  console.log('Form values before submit:', values);
                  await handleSubmit(values);
                } catch (error) {
                  console.error('Form validation failed:', error);
                }
              }}>
                {editingRecord ? '保存' : '完成'}
              </Button>
            )}
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;

