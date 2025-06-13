import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Input,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  Dropdown,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  CopyOutlined,
  ReloadOutlined,
  SearchOutlined,
  MoreOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  getWorkPositionsByDepartment,
  deleteWorkPosition,
  type WorkPosition 
} from '@/services/organization/position';
import PositionPermissions from '../Positions/PositionPermissions';

const { Title, Text } = Typography;
const { Search } = Input;

interface DepartmentPositionsProps {
  departmentId?: string;
  departmentName?: string;
}

const DepartmentPositions: React.FC<DepartmentPositionsProps> = ({
  departmentId,
  departmentName,
}) => {
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<WorkPosition[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<WorkPosition[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 模态框状态
  const [permissionVisible, setPermissionVisible] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<WorkPosition | null>(null);

  // 加载部门岗位列表
  const loadPositions = async () => {
    if (!departmentId) {
      setPositions([]);
      setFilteredPositions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getWorkPositionsByDepartment(departmentId);
      console.log('部门岗位数据:', response);
      
      if (response.resp_code === 0) {
        const positionList = response.datas || [];
        setPositions(positionList);
        setFilteredPositions(positionList);
      } else {
        message.error(response.resp_msg || '加载岗位列表失败');
      }
    } catch (error) {
      console.error('加载部门岗位失败:', error);
      message.error('加载岗位列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索过滤
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    if (!value.trim()) {
      setFilteredPositions(positions);
    } else {
      const filtered = positions.filter(position =>
        position.name.toLowerCase().includes(value.toLowerCase()) ||
        position.shortName?.toLowerCase().includes(value.toLowerCase()) ||
        position.positionLevelName?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPositions(filtered);
    }
  };

  // 新增岗位
  const handleAdd = () => {
    message.info('新增岗位功能开发中...');
  };

  // 编辑岗位
  const handleEdit = (position: WorkPosition) => {
    message.info('编辑岗位功能开发中...');
  };

  // 复制岗位
  const handleCopy = (position: WorkPosition) => {
    message.info('复制岗位功能开发中...');
  };

  // 删除岗位
  const handleDelete = async (position: WorkPosition) => {
    try {
      const response = await deleteWorkPosition(position.id);
      console.log('删除岗位响应:', response);
      
      if (response.resp_code === 0) {
        message.success('删除成功');
        loadPositions();
        setSelectedRowKeys(selectedRowKeys.filter(key => key !== position.id));
      } else {
        const errorMsg = response.resp_msg || response.msg || response.message || '删除失败';
        console.error('删除失败详情:', { response, errorMsg });
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error('删除岗位异常:', error);
      
      // 解析错误信息
      let errorMessage = '删除失败';
      if (error?.response?.data?.resp_msg) {
        errorMessage = error.response.data.resp_msg;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      message.error(errorMessage);
    }
  };

  // 权限配置
  const handlePermissionConfig = (position: WorkPosition) => {
    setCurrentPosition(position);
    setPermissionVisible(true);
  };

  // 查看详情
  const handleViewDetail = (position: WorkPosition) => {
    message.info('查看详情功能开发中...');
  };

  // 表格列定义
  const columns: ColumnsType<WorkPosition> = [
    {
      title: '岗位名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.shortName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.shortName}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '岗位级别',
      dataIndex: 'positionLevelName',
      key: 'positionLevel',
      width: 100,
      render: (text, record) => (
        <Tag color="blue">{text || '未设置'}</Tag>
      ),
    },
    {
      title: '人员配置',
      key: 'employees',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            <TeamOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            {record.currentEmployees || 0}/{record.maxEmployees || '∞'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.currentEmployees === 0 && '无人员'}
            {record.currentEmployees > 0 && record.maxEmployees && record.currentEmployees >= record.maxEmployees && '已满员'}
            {record.currentEmployees > 0 && (!record.maxEmployees || record.currentEmployees < record.maxEmployees) && '正常'}
          </Text>
        </Space>
      ),
    },
    {
      title: '岗位属性',
      key: 'attributes',
      width: 120,
      render: (_, record) => (
        <Space wrap>
          {record.isManager === 1 && <Tag color="orange">管理岗</Tag>}
          {record.isDirector === 1 && <Tag color="purple">主管岗</Tag>}
          {record.isManager === 0 && record.isDirector === 0 && <Tag color="default">普通岗</Tag>}
        </Space>
      ),
    },
    {
      title: '薪资范围',
      dataIndex: 'salaryRange',
      key: 'salaryRange',
      width: 120,
      render: (text) => text || <Text type="secondary">未设置</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => {
        const actionItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: '查看详情',
            onClick: () => handleViewDetail(record),
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑岗位',
            onClick: () => handleEdit(record),
          },
          {
            key: 'copy',
            icon: <CopyOutlined />,
            label: '复制岗位',
            onClick: () => handleCopy(record),
          },
          {
            key: 'permission',
            icon: <SafetyCertificateOutlined />,
            label: '权限配置',
            onClick: () => handlePermissionConfig(record),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除岗位',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => handlePermissionConfig(record)}
            >
              权限
            </Button>
            <Dropdown menu={{ items: actionItems }} trigger={['click']}>
              <Button
                type="link"
                size="small"
                icon={<MoreOutlined />}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // 监听部门变化
  useEffect(() => {
    loadPositions();
    setSearchKeyword('');
    setSelectedRowKeys([]);
  }, [departmentId]);

  // 如果没有选中部门，显示提示
  if (!departmentId) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <TeamOutlined style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }} />
          <div>请在左侧选择一个部门查看岗位信息</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <span>岗位管理 - {departmentName}</span>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增岗位
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadPositions}
          >
            刷新
          </Button>
        </Space>
      }
    >
      {/* 搜索和统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Space>
            <Text type="secondary">
              共 {filteredPositions.length} 个岗位
            </Text>
            <Divider type="vertical" />
            <Text type="secondary">
              在职人员 {filteredPositions.reduce((sum, pos) => sum + (pos.currentEmployees || 0), 0)} 人
            </Text>
          </Space>
        </Col>
        <Col>
          <Search
            placeholder="搜索岗位名称、简称或级别"
            allowClear
            style={{ width: 300 }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
        </Col>
      </Row>

      {/* 岗位列表 */}
      <Table
        columns={columns}
        dataSource={filteredPositions}
        loading={loading}
        rowKey="id"
        size="middle"
        pagination={{
          total: filteredPositions.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        scroll={{ x: 1000 }}
      />

      {/* 岗位表单弹窗 - 待开发 */}

      {/* 权限配置弹窗 */}
      {permissionVisible && currentPosition && (
        <PositionPermissions
          visible={permissionVisible}
          positionId={currentPosition.id}
          positionName={currentPosition.name}
          onClose={() => setPermissionVisible(false)}
          onSuccess={() => {
            setPermissionVisible(false);
            loadPositions();
          }}
        />
      )}
    </Card>
  );
};

export default DepartmentPositions; 