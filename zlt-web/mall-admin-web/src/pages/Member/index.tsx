/**
 * Member Management Page - ADMIN-08
 * User management with statistics, member list, and detail view
 */
import React, { useState, useRef, useCallback } from 'react';
import { Button, Space, Tag, Modal, Descriptions, message, Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionRef, ProColumns } from '@ant-design/pro-components';
import type { MemberDTO, MemberListParams, UserStatisticsDTO } from './services/member';
import {
  getMemberList,
  getMemberDetail,
  getMemberStatistics,
  updateMemberStatus,
  GENDER_OPTIONS,
  STATUS_COLORS,
  STATUS_TEXT,
} from './services/member';

const { confirm } = Modal;

// Format money display
const formatMoney = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `¥${num.toFixed(2)}`;
};

// Format number display
const formatNumber = (num: number): string => {
  return num?.toLocaleString() || '0';
};

interface StatisticsCardsProps {
  data: UserStatisticsDTO | null;
  loading?: boolean;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ data, loading }) => {
  if (!data) {
    return null;
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="总用户数"
            value={formatNumber(data.totalUsers)}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="今日新增"
            value={formatNumber(data.newUsersToday)}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="活跃用户"
            value={formatNumber(data.activeUsers)}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="总订单数"
            value={formatNumber(data.totalOrders)}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

interface MemberDetailModalProps {
  visible: boolean;
  member: MemberDTO | null;
  loading?: boolean;
  onClose: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  visible,
  member,
  loading,
  onClose,
}) => {
  if (!member) {
    return null;
  }

  return (
    <Modal
      title="会员详情"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={640}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="用户ID">{member.userId}</Descriptions.Item>
        <Descriptions.Item label="昵称">{member.nickname}</Descriptions.Item>
        <Descriptions.Item label="手机号">{member.phone}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{member.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="性别">{member.genderDesc}</Descriptions.Item>
        <Descriptions.Item label="生日">{member.birthday || '-'}</Descriptions.Item>
        <Descriptions.Item label="会员等级">
          <Tag color="gold">{member.levelName}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="积分">{formatNumber(member.points)}</Descriptions.Item>
        <Descriptions.Item label="累计订单">{member.totalOrders}</Descriptions.Item>
        <Descriptions.Item label="累计消费">{formatMoney(member.totalAmount)}</Descriptions.Item>
        <Descriptions.Item label="最后登录">{member.lastLoginTime}</Descriptions.Item>
        <Descriptions.Item label="注册时间">{member.createTime}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={STATUS_COLORS[member.status] || 'default'}>
            {STATUS_TEXT[member.status] || '未知'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

const MemberListPage: React.FC = () => {
  const actionRef = useRef<ActionRef>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statistics, setStatistics] = useState<UserStatisticsDTO | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch statistics on mount
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getMemberStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      message.error('加载统计数据失败');
      setStatistics({
        totalUsers: 0,
        newUsersToday: 0,
        activeUsers: 0,
        totalOrders: 0,
        totalAmount: '0',
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch member list data
  const fetchMemberList = useCallback(async (params: MemberListParams) => {
    try {
      const data = await getMemberList({
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        keyword: params.keyword,
        status: params.status,
        startTime: params.startTime,
        endTime: params.endTime,
      });

      return {
        data: data.records || [],
        total: data.total || 0,
        success: true,
      };
    } catch (error) {
      console.error('Failed to fetch member list:', error);
      message.error('加载会员列表失败');
      return { data: [], total: 0, success: false };
    }
  }, []);

  // Handle view detail - fetch full details from API
  const handleViewDetail = async (member: MemberDTO) => {
    setDetailLoading(true);
    setDetailVisible(true);

    try {
      const detail = await getMemberDetail(member.id);
      if (detail) {
        setSelectedMember(detail);
      } else {
        message.error('获取会员详情失败');
        setDetailVisible(false);
      }
    } catch (error) {
      console.error('Failed to fetch member detail:', error);
      message.error('获取会员详情失败');
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle status toggle
  const handleToggleStatus = (member: MemberDTO) => {
    const newStatus = member.status === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? '启用' : '禁用';

    confirm({
      title: `确认${actionText}`,
      content: `确定要${actionText}会员「${member.nickname}」吗？`,
      async onOk() {
        try {
          await updateMemberStatus(member.id, newStatus);
          message.success(`${actionText}成功`);
          actionRef.current?.reload();
          fetchStats();
        } catch (error) {
          console.error('Status update failed:', error);
          message.error(`${actionText}失败`);
        }
      },
    });
  };

  // Handle modal close
  const handleDetailClose = () => {
    setDetailVisible(false);
    setSelectedMember(null);
  };

  // ProTable columns
  const columns: ProColumns<MemberDTO>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      align: 'center',
      search: false,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      align: 'center',
      search: false,
    },
    {
      title: '会员等级',
      dataIndex: 'levelName',
      key: 'levelName',
      width: 100,
      align: 'center',
      search: false,
      render: (levelName: string) => (
        <Tag color="gold">{levelName}</Tag>
      ),
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      align: 'right',
      search: false,
    },
    {
      title: '累计订单',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      width: 100,
      align: 'center',
      search: false,
    },
    {
      title: '累计消费',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      search: false,
      render: (amount: string) => formatMoney(amount),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 160,
      align: 'center',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      valueType: 'select',
      valueEnum: {
        1: { text: '正常', status: 'Success' },
        0: { text: '已禁用', status: 'Error' },
      },
      render: (_: unknown, record: MemberDTO) => (
        <Tag color={STATUS_COLORS[record.status] || 'default'}>
          {STATUS_TEXT[record.status] || '未知'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      search: false,
      render: (_: unknown, record: MemberDTO) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<SearchOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            danger={record.status === 1}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics Cards Row */}
      <StatisticsCards data={statistics} loading={statsLoading} />

      {/* Member List ProTable */}
      <ProTable<MemberDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={fetchMemberList}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
        }}
        search={{
          labelWidth: 'auto',
          filterType: 'query',
        }}
        scroll={{ x: 1200 }}
        toolBarRender={() => [
          <Space key="info" style={{ color: '#888', fontSize: 12 }}>
            会员管理
          </Space>,
        ]}
      />

      {/* Member Detail Modal */}
      <MemberDetailModal
        visible={detailVisible}
        member={selectedMember}
        loading={detailLoading}
        onClose={handleDetailClose}
      />
    </div>
  );
};

export default MemberListPage;
