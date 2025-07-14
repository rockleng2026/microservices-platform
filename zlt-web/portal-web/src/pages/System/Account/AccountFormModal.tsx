import React from 'react';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import type { AccountItem } from './types';
import { createAccount, updateAccount } from './service';

interface Props {
  visible: boolean;
  current: AccountItem | null;
  onCancel: () => void;
  onOk: () => void;
}

const AccountFormModal: React.FC<Props> = ({ visible, current, onCancel, onOk }) => {
  return (
    <ModalForm<AccountItem>
      title={current ? '编辑账号' : '开通账号'}
      open={visible}
      initialValues={current || {}}
      onFinish={async (values) => {
        if (current) {
          await updateAccount(current.id, values);
        } else {
          await createAccount(values);
        }
        onOk();
        return true;
      }}
      modalProps={{ onCancel }}
    >
      <ProFormText name="employeeName" label="员工姓名" disabled={!!current} rules={[{ required: true }]} />
      <ProFormText name="username" label="账号名" disabled={!!current} rules={[{ required: true }]} />
      <ProFormText name="mobile" label="手机号" rules={[{ required: true }]} />
      <ProFormText name="email" label="邮箱" />
      {!current && <ProFormText.Password name="password" label="初始密码" rules={[{ required: true }]} />}
    </ModalForm>
  );
};

export default AccountFormModal; 