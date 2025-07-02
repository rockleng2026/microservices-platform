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
  Typography,
  Divider,
  Timeline,
  Progress,
  Spin,
  Badge,
  Avatar,
  Descriptions,
  Tooltip,
  Dropdown,
  Menu
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  MoreOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import {
  getOpportunityDetail,
  updateOpportunity,
  getFollowRecords,
  createFollowRecord,
  getCustomerDetail,
  CRMEnums,
  EnumUtils
} from '@/services/crm';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface OpportunityDetail {
  opportunityId: string;
  opportunityName: string;
  customerId: string;
  customerName: string;
  stage: string;
  probability?: number;
  expectedAmount?: number;
  closeDate?: string;
  ownerEmployeeId: string;
  ownerEmployeeName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerInfo {
  customerId: string;
  customerName: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  companyAddress?: string;
  industry?: string;
}

interface FollowRecord {
  followId: string;
  followType: string;
  followTime: string;
  content: string;
  employeeName: string;
  nextFollowTime?: string;
}

const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [followRecords, setFollowRecords] = useState<FollowRecord[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [followModalVisible, setFollowModalVisible] = useState(false);
  
  const [editForm] = Form.useForm();
  const [followForm] = Form.useForm();

  // 阶段配置
  const stageConfig = [
    { stage: 'potential', name: '潜在客户', tagColor: 'default' },
    { stage: 'initial_contact', name: '初步接触', tagColor: 'blue' },
    { stage: 'requirement_confirmed', name: '需求确认', tagColor: 'orange' },
    { stage: 'solution_demo', name: '方案演示', tagColor: 'cyan' },
    { stage: 'business_negotiation', name: '商务谈判', tagColor: 'purple' },
    { stage: 'contract_signed', name: '合同签署', tagColor: 'magenta' },
    { stage: 'won', name: '已成交', tagColor: 'green' },
    { stage: 'lost', name: '已失败', tagColor: 'red' }
  ];

  useEffect(() => {
    if (id) {
      loadOpportunityDetail();
    }
  }, [id]);

  const loadOpportunityDetail = async () => {
    try {
      setLoading(true);
      
      // 并行加载商机详情、跟进记录
      const [oppResponse, followResponse] = await Promise.all([
        getOpportunityDetail(id!),
        getFollowRecords({ page: 1, size: 100, opportunityId: id })
      ]);

      if (oppResponse.success || oppResponse.resp_code === 0) {
        const oppData = oppResponse.data || oppResponse.datas;
        setOpportunity(oppData);
        
        // 加载客户信息
        if (oppData.customerId) {
          loadCustomerInfo(oppData.customerId);
        }
      }

      if (followResponse.success || followResponse.resp_code === 0) {
        const followData = followResponse.data || followResponse.datas;
        setFollowRecords(followData.records || followData.list || []);
      }
    } catch (error) {
      console.error('加载商机详情失败:', error);
      message.error('加载商机详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerInfo = async (customerId: string) => {
    try {
      const response = await getCustomerDetail(customerId);
      if (response.success || response.resp_code === 0) {
        const customerData = response.data || response.datas;
        setCustomer(customerData);
      }
    } catch (error) {
      console.error('加载客户信息失败:', error);
    }
  };

  const getCurrentStageIndex = () => {
    if (!opportunity) return 0;
    return stageConfig.findIndex(stage => stage.stage === opportunity.stage);
  };

  const getStageConfig = (stage: string) => {
    return stageConfig.find(config => config.stage === stage);
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `¥${(amount / 10000).toFixed(1)}万`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  const handleEdit = () => {
    if (!opportunity) return;
    
    setEditModalVisible(true);
    editForm.setFieldsValue({
      ...opportunity,
      closeDate: opportunity.closeDate ? dayjs(opportunity.closeDate) : undefined
    });
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      const formData = {
        ...values,
        closeDate: values.closeDate?.format('YYYY-MM-DD')
      };

      await updateOpportunity(opportunity!.opportunityId, formData);
      message.success('更新成功');
      setEditModalVisible(false);
      loadOpportunityDetail();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error('更新失败');
    }
  };

  const handleAddFollow = () => {
    setFollowModalVisible(true);
    followForm.resetFields();
    followForm.setFieldsValue({
      opportunityId: opportunity?.opportunityId,
      customerId: opportunity?.customerId,
      followTime: dayjs()
    });
  };

  const handleFollowOk = async () => {
    try {
      const values = await followForm.validateFields();
      const formData = {
        ...values,
        followTime: values.followTime?.format('YYYY-MM-DD HH:mm:ss'),
        nextFollowTime: values.nextFollowTime?.format('YYYY-MM-DD HH:mm:ss')
      };

      await createFollowRecord(formData);
      message.success('添加跟进记录成功');
      setFollowModalVisible(false);
      loadOpportunityDetail();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error('添加跟进记录失败');
    }
  };

  const handleStageAdvance = async () => {
    if (!opportunity) return;
    
    const currentIndex = getCurrentStageIndex();
    if (currentIndex >= 0 && currentIndex < stageConfig.length - 1) {
      const nextStage = stageConfig[currentIndex + 1];
      
      try {
        await updateOpportunity(opportunity.opportunityId, {
          stage: nextStage.stage
        });
        message.success(`商机已推进至${nextStage.name}阶段`);
        loadOpportunityDetail();
      } catch (error) {
        message.error('推进阶段失败');
      }
    }
  };

  const getFollowTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'phone': <PhoneOutlined />,
      'visit': <EnvironmentOutlined />,
      'email': <MailOutlined />,
      'meeting': <UserOutlined />,
      'other': <HistoryOutlined />
    };
    return icons[type] || <HistoryOutlined />;
  };

  const getTimelineColor = (type: string) => {
    const colors: Record<string, string> = {
      'phone': 'blue',
      'visit': 'green', 
      'email': 'orange',
      'meeting': 'purple',
      'other': 'gray'
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>商机信息不存在</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 返回按钮 */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      {/* 商机头部 */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={2} style={{ margin: '0 0 8px 0' }}>
            {opportunity.opportunityName}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {opportunity.customerName}
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <Tag color={getStageConfig(opportunity.stage)?.tagColor} style={{ borderRadius: 16 }}>
            {getStageConfig(opportunity.stage)?.name}
          </Tag>
          {opportunity.expectedAmount && (
            <Tag color="orange" style={{ borderRadius: 16 }}>
              {formatAmount(opportunity.expectedAmount)}
            </Tag>
          )}
          {opportunity.probability && (
            <Tag color="green" style={{ borderRadius: 16 }}>
              成交概率 {opportunity.probability}%
            </Tag>
          )}
        </div>

        {/* 阶段进度条 */}
        <div style={{ marginBottom: 20 }}>
          <Text style={{ marginBottom: 8, display: 'block' }}>销售进度</Text>
          <Progress 
            percent={((getCurrentStageIndex() + 1) / stageConfig.length) * 100}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            format={() => `${getCurrentStageIndex() + 1}/${stageConfig.length}`}
          />
        </div>

        <Space>
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            编辑
          </Button>
          <Button icon={<PlusOutlined />} onClick={handleAddFollow}>
            添加跟进
          </Button>
          {getCurrentStageIndex() < stageConfig.length - 2 && (
            <Button 
              type="primary" 
              icon={<ArrowRightOutlined />} 
              onClick={handleStageAdvance}
            >
              推进阶段
            </Button>
          )}
        </Space>
      </Card>

      {/* 主要内容区域 */}
      <Row gutter={[24, 24]}>
        {/* 左侧主要内容 */}
        <Col span={16}>
          {/* 基本信息 */}
          <Card 
            title="📋 基本信息" 
            extra={<Button size="small" icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>}
            style={{ marginBottom: 24, borderRadius: 12 }}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="商机名称">{opportunity.opportunityName}</Descriptions.Item>
              <Descriptions.Item label="预期金额">
                {opportunity.expectedAmount ? formatAmount(opportunity.expectedAmount) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="销售阶段">{getStageConfig(opportunity.stage)?.name}</Descriptions.Item>
              <Descriptions.Item label="负责人">{opportunity.ownerEmployeeName || '未分配'}</Descriptions.Item>
              <Descriptions.Item label="成交概率">
                {opportunity.probability ? `${opportunity.probability}%` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="预计成交日期">
                {opportunity.closeDate ? dayjs(opportunity.closeDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {dayjs(opportunity.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              {opportunity.description && (
                <Descriptions.Item label="商机描述" span={2}>
                  {opportunity.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* 跟进记录 */}
          <Card 
            title="🕒 跟进记录" 
            extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddFollow}>添加跟进</Button>}
            style={{ borderRadius: 12 }}
          >
            {followRecords.length > 0 ? (
              <Timeline>
                {followRecords.map((record, index) => (
                  <Timeline.Item
                    key={record.followId}
                    color={getTimelineColor(record.followType)}
                    dot={getFollowTypeIcon(record.followType)}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Space>
                        <Text strong>{EnumUtils.getLabel(CRMEnums.FollowType, record.followType)}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(record.followTime).format('YYYY-MM-DD HH:mm')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {record.employeeName}
                        </Text>
                      </Space>
                    </div>
                    <Paragraph style={{ color: '#666', marginBottom: 0 }}>
                      {record.content}
                    </Paragraph>
                    {record.nextFollowTime && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        下次跟进: {dayjs(record.nextFollowTime).format('YYYY-MM-DD HH:mm')}
                      </Text>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无跟进记录
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧客户信息 */}
        <Col span={8}>
          <Card 
            title="👤 客户信息" 
            extra={<Button size="small">查看详情</Button>}
            style={{ borderRadius: 12 }}
          >
            {customer ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="公司名称">{customer.customerName}</Descriptions.Item>
                <Descriptions.Item label="联系人">{customer.contactPerson || '-'}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{customer.contactPhone || '-'}</Descriptions.Item>
                <Descriptions.Item label="联系邮箱">{customer.contactEmail || '-'}</Descriptions.Item>
                <Descriptions.Item label="公司地址">{customer.companyAddress || '-'}</Descriptions.Item>
                <Descriptions.Item label="所属行业">{customer.industry || '-'}</Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                客户信息加载中...
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 编辑商机模态框 */}
      <Modal
        title="编辑商机"
        open={editModalVisible}
        onOk={handleEditOk}
        onCancel={() => setEditModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="opportunityName" label="商机名称" rules={[{ required: true, message: '请输入商机名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stage" label="销售阶段" rules={[{ required: true, message: '请选择阶段' }]}>
                <Select>
                  {stageConfig.map(stage => (
                    <Select.Option key={stage.stage} value={stage.stage}>
                      {stage.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="expectedAmount" label="预期金额">
                <InputNumber style={{ width: '100%' }} addonBefore="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="probability" label="成交概率(%)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="closeDate" label="预计成交日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="商机描述">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加跟进记录模态框 */}
      <Modal
        title="添加跟进记录"
        open={followModalVisible}
        onOk={handleFollowOk}
        onCancel={() => setFollowModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={followForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="followType" label="跟进方式" rules={[{ required: true, message: '请选择跟进方式' }]}>
                <Select>
                  {EnumUtils.getOptions(CRMEnums.FollowType).map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="followTime" label="跟进时间" rules={[{ required: true, message: '请选择跟进时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="跟进内容" rules={[{ required: true, message: '请输入跟进内容' }]}>
            <TextArea rows={4} placeholder="请详细描述本次跟进情况..." />
          </Form.Item>
          <Form.Item name="nextFollowTime" label="下次跟进时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OpportunityDetail; 