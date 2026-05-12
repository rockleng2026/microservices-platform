/**
 * 会员管理页面 - ADMIN-08
 * 左侧会员列表 + 右侧Tab详情（基本信息/积分管理/地址管理）
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Button, Space, message, Modal, Form, Input, Table, Tag, Card,
  Descriptions, Avatar, Tabs, Popconfirm
} from 'antd';
import {
  ReloadOutlined, EditOutlined, PlusOutlined,
  UserOutlined, ManOutlined, WomanOutlined, PhoneOutlined, SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import { request } from '@/utils/request';
import type { MemberAddressDTO, AddressParams } from './services/address';
import { getMemberAddresses, createMemberAddress, updateMemberAddress, deleteMemberAddress } from './services/address';

interface MemberDTO {
  id: number;
  userId: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  nickname?: string;
  avatar?: string;
  phone?: string;
  gender?: number;
  birthday?: string;
  province?: string;
  city?: string;
  wxNickname?: string;
  wxOpenId?: string;
  createTime: string;
  updateTime: string;
}

const calcAge = (birthday?: string): number | null => {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const GenderTag: React.FC<{ gender?: number }> = ({ gender }) => {
  if (gender === 1) return <Tag icon={<ManOutlined />} color="blue">男</Tag>;
  if (gender === 2) return <Tag icon={<WomanOutlined />} color="magenta">女</Tag>;
  return <Tag>未知</Tag>;
};

const MemberPage: React.FC = () => {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [addresses, setAddresses] = useState<MemberAddressDTO[]>([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState<'create' | 'edit'>('create');
  const [editingAddress, setEditingAddress] = useState<MemberAddressDTO | null>(null);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

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

  const fetchAddresses = useCallback(async (userId: number) => {
    try {
      const data = await getMemberAddresses(userId);
      setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    if (selectedMember) {
      fetchAddresses(selectedMember.userId);
    } else {
      setAddresses([]);
    }
  }, [selectedMember, fetchAddresses]);

  // Filtered members by search keyword
  const filteredMembers = members.filter(m => {
    if (!searchText) return true;
    const kw = searchText.toLowerCase();
    return (m.nickname?.toLowerCase().includes(kw)) || (m.phone?.includes(kw));
  });

  const handleSelectMember = (record: MemberDTO) => setSelectedMember(record);

  const handleAdjustPoints = () => {
    if (!selectedMember) return;
    form.setFieldsValue({ points: 0, remark: '' });
    setPointsModalVisible(true);
  };

  const handleSubmitPoints = async () => {
    if (!selectedMember) return;
    try {
      const values = await form.validateFields();
      await request(`/api-mall/api/mall/admin/member/${selectedMember.id}/points`, {
        method: 'PUT',
        params: { points: values.points, remark: values.remark || '' },
      });
      message.success('积分调整成功');
      setPointsModalVisible(false);
      fetchMembers();
    } catch (error) {
      message.error('积分调整失败');
    }
  };

  const handleAddAddress = () => {
    if (!selectedMember) return;
    setAddressModalMode('create');
    setEditingAddress(null);
    form.setFieldsValue({ name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: 0 });
    setAddressModalVisible(true);
  };

  const handleEditAddress = (address: MemberAddressDTO) => {
    setAddressModalMode('edit');
    setEditingAddress(address);
    form.setFieldsValue({
      name: address.name, phone: address.phone,
      province: address.province, city: address.city,
      district: address.district, detail: address.detail, isDefault: address.isDefault,
    });
    setAddressModalVisible(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      await deleteMemberAddress(addressId);
      message.success('删除成功');
      if (selectedMember) fetchAddresses(selectedMember.userId);
    } catch (error) { message.error('删除失败'); }
  };

  const handleSubmitAddress = async () => {
    try {
      const values = await form.validateFields();
      if (addressModalMode === 'create' && selectedMember) {
        await createMemberAddress(selectedMember.userId, values as AddressParams);
        message.success('添加成功');
      } else if (addressModalMode === 'edit' && editingAddress) {
        await updateMemberAddress(editingAddress.id, values as AddressParams);
        message.success('修改成功');
      }
      setAddressModalVisible(false);
      if (selectedMember) fetchAddresses(selectedMember.userId);
    } catch (error) { message.error('操作失败'); }
  };

  const addressColumns: ColumnsType<MemberAddressDTO> = [
    { title: '收货人', dataIndex: 'name', key: 'name', width: 100 },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: '地址', key: 'fullAddress',
      render: (_: unknown, r: MemberAddressDTO) => (
        <span>{[r.province, r.city, r.district, r.detail].filter(Boolean).join(' ')}</span>
      ),
    },
    {
      title: '默认', dataIndex: 'isDefault', key: 'isDefault', width: 70, align: 'center',
      render: (v: number) => v === 1 ? <Tag color="green">是</Tag> : '-',
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, r: MemberAddressDTO) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditAddress(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteAddress(r.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const listColumns: ColumnsType<MemberDTO> = [
    {
      title: '头像', dataIndex: 'avatar', width: 50, align: 'center',
      render: (av?: string) => av ? <Avatar size={32} src={av} /> : <Avatar size={32} icon={<UserOutlined />} />,
    },
    {
      title: '昵称/手机', key: 'nickname',
      render: (_: unknown, r: MemberDTO) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.nickname || '-'}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.phone || '-'}</div>
        </div>
      ),
    },
    {
      title: '积分', dataIndex: 'balance', width: 70, align: 'center',
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
  ];

  // Tab content renderers
  const renderInfoTab = () => {
    if (!selectedMember) return null;
    const m = selectedMember;
    const age = calcAge(m.birthday);
    return (
      <div>
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <Avatar size={80} src={m.avatar} icon={<UserOutlined />} />
            <Descriptions column={2} style={{ flex: 1 }}>
              <Descriptions.Item label="昵称">{m.nickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{m.userId}</Descriptions.Item>
              <Descriptions.Item label="手机号">{m.phone ? <><PhoneOutlined /> {m.phone}</> : '-'}</Descriptions.Item>
              <Descriptions.Item label="性别"><GenderTag gender={m.gender} /></Descriptions.Item>
              <Descriptions.Item label="年龄">{age !== null ? `${age}岁` : '-'}</Descriptions.Item>
              <Descriptions.Item label="生日">{m.birthday || '-'}</Descriptions.Item>
              <Descriptions.Item label="地区">{[m.province, m.city].filter(Boolean).join(' ') || '-'}</Descriptions.Item>
              <Descriptions.Item label="微信昵称">{m.wxNickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="OpenId" span={2}>
                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.wxOpenId || '-'}</span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Card>
        <Card title="积分信息" extra={<Button type="primary" size="small" icon={<EditOutlined />} onClick={handleAdjustPoints}>调整积分</Button>} style={{ marginBottom: 16 }}>
          <Descriptions column={3}>
            <Descriptions.Item label="当前余额"><Tag color="blue" style={{ fontSize: 16 }}>{m.balance}</Tag> 积分</Descriptions.Item>
            <Descriptions.Item label="累计获得">{m.totalEarned} 积分</Descriptions.Item>
            <Descriptions.Item label="累计消耗">{m.totalSpent} 积分</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="收货地址" extra={<Space><Button size="small" icon={<ReloadOutlined />} onClick={() => fetchAddresses(m.userId)}>刷新</Button><Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddAddress}>新增地址</Button></Space>}>
          {addresses.length === 0
            ? <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>暂无收货地址</div>
            : <Table columns={addressColumns} dataSource={addresses} rowKey="id" size="small" pagination={{ pageSize: 5 }} scroll={{ x: true }} />}
        </Card>
      </div>
    );
  };

  const renderPointsTab = () => {
    if (!selectedMember) return null;
    const m = selectedMember;
    return (
      <div>
        <Card title="积分账户" extra={<Button type="primary" icon={<EditOutlined />} onClick={handleAdjustPoints}>调整积分</Button>} style={{ marginBottom: 16 }}>
          <Descriptions column={3}>
            <Descriptions.Item label="当前余额"><Tag color="blue" style={{ fontSize: 16 }}>{m.balance}</Tag> 积分</Descriptions.Item>
            <Descriptions.Item label="累计获得">{m.totalEarned} 积分</Descriptions.Item>
            <Descriptions.Item label="累计消耗">{m.totalSpent} 积分</Descriptions.Item>
            <Descriptions.Item label="昵称">{m.nickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{m.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="用户ID">{m.userId}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="积分调整记录"><div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>积分调整记录功能开发中</div></Card>
      </div>
    );
  };

  const renderAddressTab = () => {
    if (!selectedMember) return null;
    const m = selectedMember;
    return (
      <Card title="收货地址管理" extra={<Space><Button size="small" icon={<ReloadOutlined />} onClick={() => fetchAddresses(m.userId)}>刷新</Button><Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddAddress}>新增地址</Button></Space>}>
        {addresses.length === 0
          ? <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>暂无收货地址</div>
          : <Table columns={addressColumns} dataSource={addresses} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: true }} />}
      </Card>
    );
  };

  const tabItems = [
    { key: 'info', label: '基本信息', children: renderInfoTab() },
    { key: 'points', label: '积分管理', children: renderPointsTab() },
    { key: 'addresses', label: '地址管理', children: renderAddressTab() },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 180px)' }}>
        {/* 左侧：会员列表 + 搜索 */}
        <div style={{ width: 300, background: '#fff', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', borderRadius: '8px 8px 0 0' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>会员列表 ({filteredMembers.length})</div>
            <Input
              prefix={<SearchOutlined style={{ color: '#aaa' }} />}
              placeholder="昵称或手机号搜索"
              allowClear
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              size="small"
            />
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Table
              columns={listColumns}
              dataSource={filteredMembers}
              rowKey="id"
              loading={loading}
              size="small"
              pagination={{ pageSize: 20, size: 'small' }}
              onRow={(record) => ({
                onClick: () => handleSelectMember(record),
                style: { cursor: 'pointer', background: selectedMember?.id === record.id ? '#e6f7ff' : undefined },
              })}
            />
          </div>
        </div>

        {/* 右侧：详情 */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', borderRadius: '8px 8px 0 0' }}>
            {selectedMember ? (
              <Space>
                <Avatar size="small" src={selectedMember.avatar} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>{selectedMember.nickname || `用户${selectedMember.userId}`}</span>
                <Tag>{selectedMember.phone || '-'}</Tag>
                <GenderTag gender={selectedMember.gender} />
                <Tag color="blue">{selectedMember.balance} 积分</Tag>
              </Space>
            ) : <span style={{ color: '#aaa' }}>未选择会员</span>}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {selectedMember ? (
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#aaa' }}>
                <UserOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <p style={{ fontSize: 16 }}>请在左侧选择一位会员</p>
                <p style={{ fontSize: 12 }}>选择后可查看基本信息、积分、地址</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Points Modal */}
      <Modal title="调整会员积分" open={pointsModalVisible} onOk={handleSubmitPoints} onCancel={() => setPointsModalVisible(false)} destroyOnClose>
        {selectedMember && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="用户ID">{selectedMember.userId}</Descriptions.Item>
              <Descriptions.Item label="昵称">{selectedMember.nickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="当前积分"><Tag color="blue">{selectedMember.balance}</Tag></Descriptions.Item>
              <Descriptions.Item label="手机号">{selectedMember.phone || '-'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item name="points" label="调整积分" rules={[{ required: true, message: '请输入调整数量' }]} tooltip="正数增加积分，负数减少积分">
            <Input placeholder="例如: 100 或 -50" />
          </Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea placeholder="可选备注信息" /></Form.Item>
        </Form>
      </Modal>

      {/* Address Modal */}
      <Modal title={addressModalMode === 'create' ? '新增地址' : '编辑地址'} open={addressModalVisible} onOk={handleSubmitAddress} onCancel={() => setAddressModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="收货人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="province" label="省份" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="city" label="城市" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="district" label="区县" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="detail" label="详细地址" rules={[{ required: true }]}><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberPage;
