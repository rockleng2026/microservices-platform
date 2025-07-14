import React, { useState, useRef } from 'react';
import { ProTable, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Dropdown, Menu, message } from 'antd';
import { PlusOutlined, EditOutlined, KeyOutlined, StopOutlined, CheckOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import AccountFormModal from './AccountFormModal';
import ResetPasswordModal from './ResetPasswordModal';
import { getAccountList, disableAccount, enableAccount, cancelAccount, batchCancelAccount } from './service';
import type { AccountItem } from './types';

const statusMap: Record<number, React.ReactNode> = {
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
        search={{
          labelWidth: 0,
          span: 6,
          optionRender: (searchConfig, formProps, dom) => [
            <Button type="primary" key="search" htmlType="submit" style={{ marginLeft: 8 }}>
              搜索
            </Button>,
            <Button key="reset" onClick={() => {
              formProps?.form?.resetFields?.();
              (actionRef.current as ActionType | undefined)?.reset?.(); // 类型断言，防止类型报错
            }} style={{ marginLeft: 8 }}>
              重置
            </Button>
          ],
          filterType: 'query',
          searchText: '搜索',
          resetText: '重置',
          defaultCollapsed: false,
          style: { marginBottom: 16 },
        }}
        form={{
          syncToUrl: false,
          layout: 'inline',
          style: { display: 'flex', alignItems: 'center', gap: 0 },
        }}
        columns={[
          {
            title: '',
            dataIndex: 'keyword',
            hideInTable: true,
            order: 1,
            fieldProps: {
              placeholder: '请输入用户名、姓名、手机号或工号进行搜索',
              allowClear: true,
              style: { width: 320, verticalAlign: 'middle' },
            },
          },
          { title: '员工姓名', dataIndex: 'employeeName', width: 120, search: false },
          { title: '账号', dataIndex: 'username', width: 120, search: false },
          { title: '账号手机号', dataIndex: 'userMobile', width: 120, search: false },
          { title: '账号邮箱', dataIndex: 'userEmail', width: 180, search: false },
          { title: '员工手机号', dataIndex: 'employeeMobile', width: 120, search: false },
          { title: '员工邮箱', dataIndex: 'employeeEmail', width: 180, search: false },
          { title: '部门', dataIndex: 'departmentName', width: 120, search: false },
          { title: '状态', dataIndex: 'enabled', width: 80, render: (_, r) => statusMap[r.enabled], search: false },
          { title: '创建时间', dataIndex: 'createTime', width: 160, search: false },
          {
            title: '操作', valueType: 'option', width: 200, search: false, render: (_, record) => (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item icon={<EditOutlined />} onClick={() => { setCurrent(record); setModalVisible(true); }}>编辑</Menu.Item>
                    <Menu.Item icon={<KeyOutlined />} onClick={() => { setCurrent(record); setResetPwdVisible(true); }}>重置密码</Menu.Item>
                    {record.enabled === 1
                      ? <Menu.Item icon={<StopOutlined />} onClick={() => handleDisable(record.userId)}>停用</Menu.Item>
                      : <Menu.Item icon={<CheckOutlined />} onClick={() => handleEnable(record.userId)}>启用</Menu.Item>
                    }
                    <Menu.Item icon={<DeleteOutlined />} danger onClick={() => handleCancel(record.userId)}>注销</Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            )
          }
        ]}
        toolBarRender={() => [
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCurrent(null); setModalVisible(true); }}>开通账号</Button>,
          <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBatchCancel}>批量注销</Button>,
        ]}
        request={async (params) => {
          // 适配查询参数
          const keyword = params.keyword || '';
          const query = {
            keyword,
            status: params.enabled,
            page: params.current || 1,
            size: params.pageSize || 20,
          };
          const res = await getAccountList(query);
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