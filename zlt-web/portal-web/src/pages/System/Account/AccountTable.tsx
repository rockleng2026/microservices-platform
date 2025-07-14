import React, { useState, useRef } from 'react';
import { ProTable, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Dropdown, Menu, message } from 'antd';
import { PlusOutlined, EditOutlined, KeyOutlined, StopOutlined, CheckOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import AccountFormModal from './AccountFormModal';
import ResetPasswordModal from './ResetPasswordModal';
import { getAccountList, disableAccount, enableAccount, cancelAccount, batchCancelAccount } from './service';
import type { AccountItem } from './types';

const statusMap = {
  1: <Tag color="blue">正常</Tag>,
  0: <Tag color="orange">停用</Tag>,
  2: <Tag color="red">注销</Tag>,
};

const AccountTable: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [resetPwdVisible, setResetPwdVisible] = useState(false);
  const [current, setCurrent] = useState<AccountItem | null>(null);
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleDisable = async (id: number) => {
    await disableAccount(id);
    message.success('账号已停用');
    actionRef.current?.reload();
  };
  const handleEnable = async (id: number) => {
    await enableAccount(id);
    message.success('账号已启用');
    actionRef.current?.reload();
  };
  const handleCancel = async (id: number) => {
    await cancelAccount(id);
    message.success('账号已注销');
    actionRef.current?.reload();
  };

  const handleBatchCancel = async () => {
    if (selectedRowKeys.length === 0) return;
    await batchCancelAccount(selectedRowKeys as string[]);
    message.success('批量注销成功');
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  };

  return (
    <>
      <ProTable<AccountItem>
        actionRef={actionRef}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={[
          { title: '员工姓名', dataIndex: 'employeeName', width: 120 },
          { title: '账号', dataIndex: 'username', width: 120 },
          { title: '手机号', dataIndex: 'mobile', width: 120 },
          { title: '邮箱', dataIndex: 'email', width: 180 },
          { title: '状态', dataIndex: 'status', width: 80, render: (_, r) => statusMap[r.status] },
          { title: '创建时间', dataIndex: 'createdAt', width: 160 },
          {
            title: '操作', valueType: 'option', width: 200, render: (_, record) => (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item icon={<EditOutlined />} onClick={() => { setCurrent(record); setModalVisible(true); }}>编辑</Menu.Item>
                    <Menu.Item icon={<KeyOutlined />} onClick={() => { setCurrent(record); setResetPwdVisible(true); }}>重置密码</Menu.Item>
                    {record.status === 1
                      ? <Menu.Item icon={<StopOutlined />} onClick={() => handleDisable(record.id)}>停用</Menu.Item>
                      : <Menu.Item icon={<CheckOutlined />} onClick={() => handleEnable(record.id)}>启用</Menu.Item>
                    }
                    <Menu.Item icon={<DeleteOutlined />} danger onClick={() => handleCancel(record.id)}>注销</Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            )
          }
        ]}
        search={{ labelWidth: 80, span: 6 }}
        toolBarRender={() => [
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); setModalVisible(true); }}>开通账号</Button>,
          <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBatchCancel}>批量注销</Button>,
        ]}
        request={async (params) => {
          const res = await getAccountList(params);
          return {
            data: res.data,
            success: true,
            total: res.count,
          };
        }}
        pagination={{ pageSize: 20 }}
      />
      <AccountFormModal visible={modalVisible} current={current} onCancel={() => setModalVisible(false)} onOk={() => actionRef.current?.reload()} />
      <ResetPasswordModal visible={resetPwdVisible} current={current} onCancel={() => setResetPwdVisible(false)} onOk={() => actionRef.current?.reload()} />
    </>
  );
};

export default AccountTable; 