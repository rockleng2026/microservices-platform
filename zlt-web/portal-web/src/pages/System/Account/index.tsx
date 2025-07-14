import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import AccountTable from './AccountTable';

const AccountPage: React.FC = () => (
  <PageContainer
    header={{
      title: '账号管理',
      breadcrumb: {
        routes: [
          { path: '/system', breadcrumbName: '系统管理' },
          { path: '/system/account', breadcrumbName: '账号管理' },
        ],
      },
    }}
  >
    <AccountTable />
  </PageContainer>
);

export default AccountPage; 