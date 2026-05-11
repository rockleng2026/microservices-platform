/**
 * 会员管理页面 - ADMIN-06
 * Member list with points management
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Button, Space, message, Modal, Form, Input, Table, Tag, Card, Descriptions } from 'antd';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import { request } from '@/utils/request';

interface MemberDTO {
  id: number;
  userId: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  createTime: string;
  updateTime: string;
}

interface PointsLogDTO {
  id: number;
  userId: number;
  type: number;
  points: number;
  balanceAfter: number;
  source: string;
  remark: string;
  createTime: string;
}

const MemberPage: React.FC = () => {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch member list
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request<{ datas?: MemberDTO[] }>('/api-mall/api/mall/admin/member/list', {
        method: 'GET',
      });
      setMembers(response.datas || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      message.error('加载会员列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle points adjustment
  const handleAdjustPoints = (member: MemberDTO) => {
    setSelectedMember(member);
    form.setFieldsValue({ points: 0, remark: '' });
    setPointsModalVisible(true);
  };

  // Submit points adjustment
  const handleSubmitPoints = async () => {
    if (!selectedMember) return;
    try {
      const values = await form.validateFields();
      await request(`/api-mall/api/mall/admin/member/${selectedMember.id}/points`, {
        method: 'PUT',
        params: {
          points: values.points,
          remark: values.remark || '',
        },
      });
      message.success('积分调整成功');
      setPointsModalVisible(false);
      fetchMembers();
    } catch (error) {
      console.error('Failed to adjust points:', error);
      message.error('积分调整失败');
    }
  };

  // Table columns
  const columns: ColumnsType<MemberDTO> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      align: 'center',
    },
    {
      title: '当前积分',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      align: 'center',
      render: (balance: number) => (
        <Tag color="blue">{balance}</Tag>
      ),
    },
    {
      title: '累计获得',
      dataIndex: 'totalEarned',
      key: 'totalEarned',
      width: 120,
      align: 'center',
    },
    {
      title: '累计消耗',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 120,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_: unknown, record: MemberDTO) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleAdjustPoints(record)}
        >
          调整积分
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchMembers} loading={loading}>
          刷新
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Points Adjustment Modal */}
      <Modal
        title="调整会员积分"
        open={pointsModalVisible}
        onOk={handleSubmitPoints}
        onCancel={() => setPointsModalVisible(false)}
        destroyOnClose
      >
        {selectedMember && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="用户ID">{selectedMember.userId}</Descriptions.Item>
              <Descriptions.Item label="当前积分">
                <Tag color="blue">{selectedMember.balance}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="累计获得">{selectedMember.totalEarned}</Descriptions.Item>
              <Descriptions.Item label="累计消耗">{selectedMember.totalSpent}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="points"
            label="调整积分"
            rules={[{ required: true, message: '请输入调整数量' }]}
            tooltip="输入正数增加积分，负数减少积分"
          >
            <Input placeholder="例如: 100 或 -50" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="可选备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberPage;