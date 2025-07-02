import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Space, Table, Tag, Popconfirm, Row, Col, Statistic, Spin, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PhoneOutlined, UserOutlined, BankOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCustomerPage, createCustomer, updateCustomer, deleteCustomer, getCustomerStatistics, CRMEnums, EnumUtils } from '@/services/crm';
import { getEmployeeList } from '@/services/organization/employee';

const { Option } = Select;
const { RangePicker } = DatePicker;

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
  
  // 使用useRef缓存数据，避免重复API调用
  const cacheRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    loadCustomers();
    loadStatistics();
    loadEmployees(); // 仍需要加载员工列表用于表单选择
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
        search: searchText || undefined,
        status: convertedStatus,
        type: convertedType,
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

  const loadEmployees = async () => {
    try {
      // 检查员工列表缓存
      if (cacheRef.current.has('employees')) {
        setEmployees(cacheRef.current.get('employees'));
        return;
      }
      
      const response = await getEmployeeList({ size: 200 }); // 获取足够多的员工供选择
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        // 处理员工数据结构
        let employeeList: any[] = [];
        if (Array.isArray(data)) {
          employeeList = data;
        } else if (data?.content) {
          employeeList = data.content;
        } else if (data?.records) {
          employeeList = data.records;
        } else if (data) {
          employeeList = [data];
        }
        
        setEmployees(employeeList);
        
        // 缓存员工列表
        cacheRef.current.set('employees', employeeList);
      }
    } catch (error) {
      console.error('获取员工列表失败:', error);
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
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    // 根据数据库字段映射表单字段
    const formData = {
      customerName: record.customerName,
      customerType: record.customerType,
      customerStatus: record.customerStatus,
      customerSource: record.customerSource,
      customerLevel: record.customerLevel,
      ownerEmployeeId: record.ownerEmployeeId, // 添加负责人ID
      // 根据客户类型处理不同的字段
      ...(record.customerType === '个人' ? {
        realName: record.realName,
        mobilePhone: record.mobilePhone,
        email: record.email,
        idCard: record.idCard,
      } : {
        businessLicense: record.businessLicense,
        companyAddress: record.companyAddress,
        companyPhone: record.companyPhone,
        legalRepresentative: record.legalRepresentative,
        businessContact: record.businessContact,
        contactPhone: record.contactPhone,
        companyScale: record.companyScale,
      })
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
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
      const submitData = {
        customerName: values.customerName,
        customerType: values.customerType || '个人',
        customerStatus: values.customerStatus || '意向',
        customerSource: values.customerSource,
        customerLevel: values.customerLevel,
        ownerEmployeeId: values.ownerEmployeeId || 1, // 使用选择的负责人ID
        // 根据客户类型提交不同的数据结构
        ...(values.customerType === '个人' ? {
          realName: values.realName,
          mobilePhone: values.mobilePhone,
          email: values.email,
          idCard: values.idCard,
        } : {
          businessLicense: values.businessLicense,
          companyAddress: values.companyAddress,
          companyPhone: values.companyPhone,
          legalRepresentative: values.legalRepresentative,
          businessContact: values.businessContact,
          contactPhone: values.contactPhone,
          companyScale: values.companyScale,
        })
      };

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
        // 清空缓存并重新加载
        cacheRef.current.clear();
        // 保留员工列表缓存
        const employeeCache = employees;
        cacheRef.current.set('employees', employeeCache);
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

  const columns = [
    {
      title: '客户信息',
      key: 'customer',
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.customerType === '个人' ? <UserOutlined style={{ marginRight: 4 }} /> : <BankOutlined style={{ marginRight: 4 }} />}
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
    const customerType = form.getFieldValue('customerType') || '个人';
    
    return (
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="customerType" label="客户类型" rules={[{ required: true }]}>
              <Select>
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
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {employees.map(employee => (
                  <Option key={employee.id || employee.employeeId} value={employee.id || employee.employeeId}>
                    {employee.name} - {employee.departmentName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="customerName" label="客户名称" rules={[{ required: true }]}>
          <Input placeholder={customerType === '个人' ? '请输入客户姓名' : '请输入企业名称'} />
        </Form.Item>
        
        {customerType === '个人' ? (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="realName" label="真实姓名">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="mobilePhone" label="手机号" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="email" label="邮箱">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="idCard" label="身份证号">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="businessLicense" label="营业执照号" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="companyScale" label="公司规模">
                  <Select>
                    <Option value="小微">小微企业</Option>
                    <Option value="中小">中小企业</Option>
                    <Option value="大型">大型企业</Option>
                    <Option value="集团">集团企业</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="companyAddress" label="公司地址" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="legalRepresentative" label="法定代表人" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="businessContact" label="业务联系人" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="companyPhone" label="公司电话" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="contactPhone" label="联系人电话" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="customerSource" label="客户来源">
              <Select allowClear>
                <Option value="线上">线上获取</Option>
                <Option value="展会">展会获取</Option>
                <Option value="转介绍">客户转介绍</Option>
                <Option value="电话营销">电话营销</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customerLevel" label="客户等级">
              <Select allowClear>
                <Option value="A">A级客户</Option>
                <Option value="B">B级客户</Option>
                <Option value="C">C级客户</Option>
                <Option value="D">D级客户</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
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
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" onClick={() => form.submit()}>确定</Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;

