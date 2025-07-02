import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Empty,
  Spin,
  Typography,
  Avatar,
  Progress,
  Dropdown,
  Menu,
  Table
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FundOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  MoreOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  getOpportunityList,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityFunnelStatistics,
  getOpportunityWinStatistics,
  getCustomerList,
  CRMEnums,
  EnumUtils
} from '@/services/crm';
import { getEmployeeList } from '@/services/organization';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Opportunity {
  opportunityId: string;
  opportunityName: string;
  customerId?: string;
  customerName?: string;
  stage: string;
  probability?: number;
  expectedAmount?: number;
  closeDate?: string;
  ownerEmployeeId: string;
  ownerEmployeeName?: string;
  opportunitySource?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface FunnelStage {
  stage: string;
  stageName: string;
  count: number;
  totalAmount: number;
  opportunities: Opportunity[];
}

const OpportunityList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [statistics, setStatistics] = useState({
    totalOpportunities: 0,
    totalAmount: 0,
    winRate: 0,
    avgDealSize: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'funnel' | 'list'>('funnel');
  
  const [form] = Form.useForm();

  // 定义商机阶段配置
  const stageConfig = [
    { stage: 'potential', name: '潜在客户', color: '#f0f0f0', tagColor: 'default' },
    { stage: 'initial_contact', name: '初步接触', color: '#e6f7ff', tagColor: 'blue' },
    { stage: 'requirement_confirmed', name: '需求确认', color: '#fff2e6', tagColor: 'orange' },
    { stage: 'solution_demo', name: '方案演示', color: '#f6ffed', tagColor: 'cyan' },
    { stage: 'business_negotiation', name: '商务谈判', color: '#fff0f6', tagColor: 'purple' },
    { stage: 'contract_signed', name: '合同签署', color: '#f9f0ff', tagColor: 'magenta' },
    { stage: 'won', name: '已成交', color: '#f6ffed', tagColor: 'green' },
    { stage: 'lost', name: '已失败', color: '#fff2f0', tagColor: 'red' }
  ];

  useEffect(() => {
    loadData();
    loadCustomers();
    loadEmployees();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadOpportunities(),
      loadFunnelStatistics()
    ]);
  };

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getOpportunityList({ page: 1, size: 100 });
      if (response.success || response.resp_code === 0) {
        const pageData = response.data || response.datas || response;
        const opportunityData = pageData.records || pageData.list || pageData;
        const ops = Array.isArray(opportunityData) ? opportunityData : [];
        setOpportunities(ops);
        
        // 组织漏斗数据
        organizeFunnelData(ops);
        
        // 计算统计数据
        calculateStatistics(ops);
      }
    } catch (error) {
      console.error('获取商机列表失败:', error);
      message.error('获取商机列表失败');
    } finally {
      setLoading(false);
    }
  };

  const organizeFunnelData = (ops: Opportunity[]) => {
    const funnelStages = stageConfig.map(config => ({
      stage: config.stage,
      stageName: config.name,
      count: 0,
      totalAmount: 0,
      opportunities: [] as Opportunity[]
    }));

    ops.forEach(opp => {
      const stageIndex = funnelStages.findIndex(stage => stage.stage === opp.stage);
      if (stageIndex >= 0) {
        funnelStages[stageIndex].opportunities.push(opp);
        funnelStages[stageIndex].count++;
        funnelStages[stageIndex].totalAmount += opp.expectedAmount || 0;
      }
    });

    setFunnelData(funnelStages);
  };

  const calculateStatistics = (ops: Opportunity[]) => {
    const total = ops.length;
    const totalAmount = ops.reduce((sum, opp) => sum + (opp.expectedAmount || 0), 0);
    const wonCount = ops.filter(opp => opp.stage === 'won').length;
    const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;
    const avgDealSize = total > 0 ? Math.round(totalAmount / total) : 0;

    setStatistics({
      totalOpportunities: total,
      totalAmount,
      winRate,
      avgDealSize
    });
  };

  const loadFunnelStatistics = async () => {
    try {
      setFunnelLoading(true);
      // 这里可以调用专门的漏斗统计接口
    } catch (error) {
      console.error('获取漏斗统计失败:', error);
    } finally {
      setFunnelLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomerList({ page: 1, size: 100 });
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        setCustomerList(data.records || data.list || []);
      }
    } catch (error) {
      console.error('客户列表加载错误:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await getEmployeeList();
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        // organization服务直接返回数组，不是分页结构
        setEmployeeList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('员工列表加载错误:', error);
    }
  };

  const handleAdd = () => {
    setEditingOpportunity(null);
    setModalVisible(true);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      stage: 'potential',
      probability: 10,
      ownerEmployeeId: getCurrentUserId(), // 默认当前用户
    });
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setModalVisible(true);
    // 处理长整型ID的转换，确保正确填充表单
    const formData = {
      ...opportunity,
      customerId: opportunity.customerId ? String(opportunity.customerId) : undefined,
      ownerEmployeeId: opportunity.ownerEmployeeId ? String(opportunity.ownerEmployeeId) : undefined,
      closeDate: opportunity.closeDate ? dayjs(opportunity.closeDate) : undefined,
    };
    form.setFieldsValue(formData);
  };

  // 获取当前用户ID（这里需要从登录状态中获取，先mock一个值）
  const getCurrentUserId = () => {
    // TODO: 从用户上下文或localStorage中获取当前用户ID
    return '1'; // 临时mock值
  };

  const handleDelete = async (opportunityId: string) => {
    try {
      await deleteOpportunity(opportunityId);
      message.success('删除成功');
      loadOpportunities();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        // 处理长整型ID字段
        customerId: values.customerId ? String(values.customerId) : undefined,
        ownerEmployeeId: values.ownerEmployeeId ? String(values.ownerEmployeeId) : undefined,
        closeDate: values.closeDate?.format('YYYY-MM-DD')
      };

      if (editingOpportunity) {
        await updateOpportunity(editingOpportunity.opportunityId, formData);
        message.success('更新成功');
      } else {
        await createOpportunity(formData);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadOpportunities();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(editingOpportunity ? '更新失败' : '创建失败');
    }
  };

  const getStageColor = (stage: string) => {
    return stageConfig.find(config => config.stage === stage)?.color || '#f0f0f0';
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `¥${(amount / 10000).toFixed(1)}万`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  const getActionMenu = (opportunity: Opportunity) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(opportunity)}>
        编辑
      </Menu.Item>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        danger
        onClick={() => handleDelete(opportunity.opportunityId)}
      >
        删除
      </Menu.Item>
    </Menu>
  );

  const renderOpportunityCard = (opportunity: Opportunity) => (
    <Card
      key={opportunity.opportunityId}
      size="small"
      style={{ marginBottom: 8, cursor: 'pointer' }}
      bodyStyle={{ padding: 12 }}
      hoverable
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Title 
          level={5} 
          style={{ 
            margin: 0, 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#1890ff', 
            cursor: 'pointer'
          }}
          onClick={() => window.open(`/crm/opportunities/${opportunity.opportunityId}`, '_blank')}
        >
          {opportunity.opportunityName}
        </Title>
        <Dropdown overlay={getActionMenu(opportunity)} trigger={['click']}>
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      </div>
      
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        {opportunity.customerName}
      </Text>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fa8c16', fontWeight: 600, fontSize: 14 }}>
          {opportunity.expectedAmount ? formatAmount(opportunity.expectedAmount) : '-'}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {opportunity.ownerEmployeeName || '未分配'}
        </Text>
      </div>
      
      {opportunity.probability && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>成交概率</Text>
            <Text style={{ fontSize: 12 }}>{opportunity.probability}%</Text>
          </div>
          <Progress 
            percent={opportunity.probability} 
            size="small" 
            showInfo={false}
            strokeColor={opportunity.probability > 70 ? '#52c41a' : opportunity.probability > 30 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      )}
    </Card>
  );

  const renderFunnelStage = (stage: FunnelStage) => (
    <Col xs={24} sm={12} md={8} lg={6} xl={4} key={stage.stage}>
      <Card
        style={{ 
          background: getStageColor(stage.stage),
          borderRadius: 8,
          minHeight: 400
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ 
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{ fontWeight: 600, color: '#333' }}>{stage.stageName}</Text>
          <Badge count={stage.count} style={{ backgroundColor: '#1890ff' }} />
        </div>
        
        <div style={{ padding: 12 }}>
          {stage.opportunities.length > 0 ? (
            stage.opportunities.map(opportunity => renderOpportunityCard(opportunity))
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="暂无商机" 
              style={{ margin: '20px 0' }}
            />
          )}
        </div>
        
        {stage.totalAmount > 0 && (
          <div style={{ 
            padding: '8px 20px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderTop: '1px solid #e8e8e8',
            textAlign: 'center'
          }}>
            <Text style={{ fontSize: 12, color: '#666' }}>
              总金额: <Text style={{ color: '#fa8c16', fontWeight: 600 }}>
                {formatAmount(stage.totalAmount)}
              </Text>
            </Text>
          </div>
        )}
      </Card>
    </Col>
  );

  // 列表视图表格配置
  const tableColumns = [
    {
      title: '商机名称',
      dataIndex: 'opportunityName',
      key: 'opportunityName',
      width: 200,
      ellipsis: true,
      render: (name: string, record: Opportunity) => (
        <a 
          style={{ color: '#1890ff' }}
          onClick={() => window.open(`/crm/opportunities/${record.opportunityId}`, '_blank')}
        >
          {name}
        </a>
      )
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      ellipsis: true
    },
    {
      title: '当前阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 120,
      render: (stage: string) => {
        const config = stageConfig.find(s => s.stage === stage);
        return (
          <Tag color={config?.tagColor || 'default'} style={{ borderRadius: 4 }}>
            {config?.name || stage}
          </Tag>
        );
      }
    },
    {
      title: '成交概率',
      dataIndex: 'probability',
      key: 'probability',
      width: 100,
      render: (probability: number) => (
        probability ? (
          <div>
            <div style={{ marginBottom: 4 }}>{probability}%</div>
            <Progress 
              percent={probability} 
              size="small" 
              showInfo={false}
              strokeColor={probability > 70 ? '#52c41a' : probability > 30 ? '#faad14' : '#ff4d4f'}
            />
          </div>
        ) : '-'
      )
    },
    {
      title: '预期金额',
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      width: 120,
      render: (amount: number) => amount ? formatAmount(amount) : '-',
      sorter: (a: Opportunity, b: Opportunity) => (a.expectedAmount || 0) - (b.expectedAmount || 0)
    },
    {
      title: '负责人',
      dataIndex: 'ownerEmployeeName',
      key: 'ownerEmployeeName',
      width: 100,
      render: (name: string) => name || '未分配'
    },
    {
      title: '预计成交日期',
      dataIndex: 'closeDate',
      key: 'closeDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Opportunity) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.opportunityId)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面头部 - 渐变色背景 */}
      <div style={{
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <Title level={2} style={{ 
          color: 'white', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          🎯 商机管理
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
          管理销售商机全生命周期，跟踪销售漏斗和业绩表现
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="商机总数"
              value={statistics.totalOpportunities}
              prefix={<FundOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总金额"
              value={statistics.totalAmount}
              formatter={(value) => formatAmount(Number(value))}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成单率"
              value={statistics.winRate}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均订单"
              value={statistics.avgDealSize}
              formatter={(value) => formatAmount(Number(value))}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作工具栏 */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button 
              type={viewMode === 'funnel' ? 'primary' : 'default'}
              onClick={() => setViewMode('funnel')}
            >
              漏斗视图
            </Button>
            <Button 
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            >
              列表视图
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
          </Space>
          
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建商机
          </Button>
        </div>
      </Card>

      {/* 商机展示区域 */}
      <Spin spinning={loading}>
        {viewMode === 'funnel' ? (
          <Row gutter={[16, 16]}>
            {funnelData.map(stage => renderFunnelStage(stage))}
          </Row>
        ) : (
          <Card style={{ borderRadius: 12 }}>
            <Table
              columns={tableColumns}
              dataSource={opportunities}
              rowKey="opportunityId"
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }}
            />
          </Card>
        )}
      </Spin>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingOpportunity ? '编辑商机' : '新建商机'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="opportunityName"
                label="商机名称"
                rules={[{ required: true, message: '请输入商机名称' }]}
              >
                <Input placeholder="请输入商机名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="关联客户"
              >
                <Select placeholder="请选择客户（可选）" allowClear showSearch>
                  {customerList.map((customer: any) => (
                    <Option key={customer.customerId} value={customer.customerId}>
                      {customer.customerName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="opportunitySource"
                label="商机来源"
                rules={[{ required: true, message: '请选择或输入商机来源' }]}
              >
                <Select
                  placeholder="请选择或输入商机来源"
                  showSearch
                  allowClear
                >
                  <Option value="客户介绍">客户介绍</Option>
                  <Option value="老客户">老客户</Option>
                  <Option value="展会获取">展会获取</Option>
                  <Option value="网络推广">网络推广</Option>
                  <Option value="电话营销">电话营销</Option>
                  <Option value="门店访问">门店访问</Option>
                  <Option value="社交媒体">社交媒体</Option>
                  <Option value="合作伙伴">合作伙伴</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="ownerEmployeeId" 
                label="负责人"
                rules={[{ required: true, message: '请选择负责人' }]}
              >
                <Select 
                  placeholder="请选择负责人" 
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {employeeList.map((employee: any) => (
                    <Option key={employee.id} value={employee.id}>
                      {employee.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stage"
                label="当前阶段"
                rules={[{ required: true, message: '请选择阶段' }]}
              >
                <Select placeholder="请选择阶段">
                  {EnumUtils.getOptions(CRMEnums.OpportunityStage).map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="probability" label="成交概率(%)">
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="0-100"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

                    <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expectedAmount" label="预期金额">
                <InputNumber
                  min={0}
                  placeholder="请输入金额"
                  style={{ width: '100%' }}
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="closeDate" label="预计成交日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="商机描述">
            <TextArea
              rows={4}
              placeholder="请描述商机详情、客户需求等..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OpportunityList;
