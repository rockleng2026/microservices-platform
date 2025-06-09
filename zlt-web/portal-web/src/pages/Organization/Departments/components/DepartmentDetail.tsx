import React from 'react';
import { Card, Descriptions, Tag, Avatar, Space, Button } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

interface DepartmentDetailProps {
  department: any;
  onRefresh: () => void;
}

const DepartmentDetail: React.FC<DepartmentDetailProps> = ({ department, onRefresh }) => {
  if (!department) {
    return (
      <Card>
        <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
          请选择一个部门查看详情
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="部门详情"
      size="small"
      extra={
        <Button size="small" onClick={onRefresh}>
          刷新
        </Button>
      }
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item label="部门名称" span={2}>
          <Space>
            <strong style={{ fontSize: 16 }}>{department.name}</strong>
            <Tag color={department.status === 1 ? 'green' : 'red'}>
              {department.status === 1 ? '正常' : '禁用'}
            </Tag>
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="部门编号">
          {department.depNo || '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="部门等级">
          {department.gradeName || '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="上级部门">
          {department.parentName || '无'}
        </Descriptions.Item>
        
        <Descriptions.Item label="部门主管">
          {department.directorName ? (
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              {department.directorName}
            </Space>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        
        <Descriptions.Item label="员工数量">
          <Tag color="blue">{department.employeeCount || 0}人</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="岗位数量">
          <Tag color="cyan">{department.positionCount || 0}个</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="联系电话">
          {department.tel ? (
            <Space>
              <PhoneOutlined style={{ color: '#1890ff' }} />
              {department.tel}
            </Space>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        
        <Descriptions.Item label="办公地址" span={2}>
          {department.address ? (
            <Space>
              <EnvironmentOutlined style={{ color: '#52c41a' }} />
              {department.address}
            </Space>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        
        <Descriptions.Item label="部门路径" span={2}>
          {department.path || '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="部门描述" span={2}>
          {department.description || '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="创建时间">
          {department.createdAt || '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="更新时间">
          {department.updatedAt || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default DepartmentDetail; 