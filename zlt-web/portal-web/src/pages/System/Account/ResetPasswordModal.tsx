import React from 'react';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import type { AccountItem } from './types';
import { resetPassword } from './service';

interface Props {
  visible: boolean;
  current: AccountItem | null;
  onCancel: () => void;
  onOk: () => void;
}

const ResetPasswordModal: React.FC<Props> = ({ visible, current, onCancel, onOk }) => {
  return (
    <ModalForm
      title="重置密码"
      open={visible}
      onFinish={async (values) => {
        if (current) {
          await resetPassword(current.id, values.newPassword);
        }
        onOk();
        return true;
      }}
      modalProps={{ onCancel }}
    >
      <ProFormText.Password name="newPassword" label="新密码" rules={[{ required: true }]} />
      <ProFormText.Password name="confirmPassword" label="确认密码" dependencies={["newPassword"]} rules={[
        { required: true },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('newPassword') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('两次输入的密码不一致!'));
          },
        }),
      ]} />
    </ModalForm>
  );
};

export default ResetPasswordModal; 