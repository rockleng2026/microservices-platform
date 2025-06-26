import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getEmployeeDetail, getEmployeePage } from '@/services/organization/employee';

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 根据ID获取用户信息
  const fetchUserById = async (userId: string) => {
    if (!userId) return null;
    
    try {
      const response = await getEmployeeDetail(parseInt(userId));

      if (response.success && response.data) {
        return response.data;
      } else if (response.resp_code === 0 && response.datas) {
        return response.datas;
      }
    } catch (error) {
      console.error('Failed to fetch user by id:', error);
    }
    return null;
  };

  // 获取用户列表
  const fetchUsers = async (keyword?: string) => {
    setLoading(true);
    try {
      const response = await getEmployeePage({
        keyword: keyword || '',
        page: 1,
        size: 100,
      });

      let userList = [];
      // 适配不同的返回格式
      if (response.success && response.data) {
        if (response.data.records) {
          userList = response.data.records;
        } else if (Array.isArray(response.data)) {
          userList = response.data;
        }
      } else if (response.resp_code === 0) {
        if (response.datas && response.datas.records) {
          userList = response.datas.records;
        } else if (Array.isArray(response.datas)) {
          userList = response.datas;
        }
      }
      
      setUsers(userList);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取用户列表
  useEffect(() => {
    fetchUsers();
  }, []);

  // 当value变化时，获取对应的用户信息
  useEffect(() => {
    if (value) {
      fetchUserById(value).then(user => {
        if (user) {
          setSelectedUser(user);
          // 如果当前用户列表中没有该用户，添加到列表中
          setUsers(prevUsers => {
            const exists = prevUsers.some(u => String(u.id) === String(user.id));
            if (!exists) {
              return [user, ...prevUsers];
            }
            return prevUsers;
          });
        }
      });
    } else {
      setSelectedUser(null);
    }
  }, [value]);

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
  const renderOption = (user: any) => (
    <Option key={String(user.id)} value={String(user.id)}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        <div>
          <div>{user.name}{user.username ? ` (${user.username})` : ''}</div>
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
      optionLabelProp="children"
    >
      {users.map(renderOption)}
    </Select>
  );
};

export default UserSelector; 