import React from 'react';
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { AccountItem } from './types';
import { createAccount, updateAccount } from './service';
import { getEmployeePage, getEmployeeDetail } from '@/services/organization/employee';

interface Props {
  visible: boolean;
  current: AccountItem | null;
  onCancel: () => void;
  onOk: () => void;
}

const AccountFormModal: React.FC<Props> = ({ visible, current, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [employeeOptions, setEmployeeOptions] = React.useState<any[]>([]);

  // 选择员工后自动填充账号、手机号、邮箱（直接用下拉选项数据）
  const handleEmployeeChange = (employeeId: number) => {
    const emp = employeeOptions.find(e => e.value === employeeId)?.origin;
    if (emp) {
      form.setFieldsValue({
        username: emp.empNo,
        mobile: emp.phoneNumber || emp.mobile,
        email: emp.email,
      });
    }
  };

  return (
    <ModalForm<AccountItem>
      title={current ? '编辑账号' : '开通账号'}
      open={visible}
      initialValues={current || {}}
      form={form}
      onFinish={async (values) => {
        if (current) {
          await updateAccount(current.userId, values);
        } else {
          await createAccount(values);
        }
        onOk();
        return true;
      }}
      modalProps={{ onCancel }}
    >
      <ProFormSelect
        name="employeeId"
        label="员工"
        showSearch
        debounceTime={300}
        request={async (params) => {
          const res = await getEmployeePage({ page: 1, size: 20, keyword: params.keyWords });
          const options = (res.data || []).map((emp: any) => ({
            label: `${emp.name}（${emp.empNo}）`,
            value: emp.id,
            origin: emp,
          }));
          setEmployeeOptions(options);
          return options;
        }}
        fieldProps={{
          onChange: handleEmployeeChange,
          disabled: !!current,
        }}
        rules={[{ required: true, message: '请选择员工' }]}
      />
      <ProFormText name="username" label="账号名" rules={[{ required: true }]} />
      <ProFormText name="mobile" label="手机号" rules={[{ required: true }]} />
      <ProFormText name="email" label="邮箱" />
      {!current && <ProFormText.Password name="password" label="初始密码" rules={[{ required: true }]} />}
    </ModalForm>
  );
};

export default AccountFormModal; 