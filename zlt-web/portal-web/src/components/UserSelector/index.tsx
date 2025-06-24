import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';

const { Option } = Select;

interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  departmentName?: string;
}

interface UserSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  allowClear?: boolean;
  mode?: 'multiple' | undefined;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  value,
  onChange,
  placeholder = '请选择用户',
  style,
  disabled = false,
  allowClear = true,
  mode,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 获取用户列表
  const fetchUsers = async (keyword?: string) => {
    setLoading(true);
    try {
      const response = await request('/api/user-center/users/list', {
        method: 'GET',
        params: {
          keyword: keyword || '',
          page: 1,
          size: 100,
        },
      });

      if (response.resp_code === 0) {
        setUsers(response.datas || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 搜索用户
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword) {
      fetchUsers(keyword);
    } else {
      fetchUsers();
    }
  };

  // 渲染选项
  const renderOption = (user: User) => (
    <Option key={user.id} value={user.id}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        <div>
          <div>{user.name} ({user.username})</div>
          {user.departmentName && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              {user.departmentName}
            </div>
          )}
        </div>
      </div>
    </Option>
  );

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      disabled={disabled}
      allowClear={allowClear}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={loading ? <Spin size="small" /> : '暂无数据'}
      mode={mode}
    >
      {users.map(renderOption)}
    </Select>
  );
};

export default UserSelector; 