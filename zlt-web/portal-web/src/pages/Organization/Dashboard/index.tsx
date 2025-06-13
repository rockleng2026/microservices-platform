import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { 
  Card, Row, Col, Statistic, List, Avatar, Tag, Timeline, Progress, 
  Spin, Empty, Button, Space, Table, Tooltip, Badge 
} from 'antd';
import { 
  UserOutlined, TeamOutlined, BankOutlined, CalendarOutlined,
  TrophyOutlined, RiseOutlined, ClockCircleOutlined, BookOutlined,
  BarChartOutlined, PieChartOutlined
} from '@ant-design/icons';
import { 
  getEmployeeStatistics, 
  getExpiringProbationEmployees,
  getBirthdayEmployees 
} from '@/services/organization/employee';
import { getDepartmentTree } from '@/services/organization/department';
import type { EmployeeStatistics } from '@/services/organization/employee';

// 类型定义
interface DepartmentStats {
  name: string;
  employeeCount: number;
  percentage: number;
}

interface RecentEmployee {
  id: number;
  name: string;
  departmentName: string;
  positionName: string;
  hireDate: string;
  avatar?: string;
}

const OrganizationDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<EmployeeStatistics>({
    totalCount: 0,
    onJobCount: 0,
    probationCount: 0,
    leaveCount: 0,
    maleCount: 0,
    femaleCount: 0,
    averageAge: 0,
    educationDistribution: {
      bachelor: 0,
      master: 0,
      doctor: 0,
      other: 0,
    },
    employmentTypeDistribution: {
      fullTime: 0,
      partTime: 0,
      intern: 0,
      contractor: 0,
    },
  });
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [expiringProbationEmployees, setExpiringProbationEmployees] = useState<any[]>([]);
  const [birthdayEmployees, setBirthdayEmployees] = useState<any[]>([]);

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const response = await getEmployeeStatistics();
      if (response && response.resp_code === 0) {
        setStatistics(response.datas || response.data);
      } else {
        console.warn('Dashboard: 统计数据加载失败:', response);
        // 保持默认值，不显示错误提示，避免影响用户体验
      }
    } catch (error) {
      console.error('Dashboard: 加载统计数据失败:', error);
      // 保持默认值，不显示错误提示，避免影响用户体验
    }
  };

  // 加载部门统计
  const loadDepartmentStats = async () => {
    try {
      const response = await getDepartmentTree();
      if (response && response.resp_code === 0) {
        const departments = response.datas || response.data || [];
        // 这里可以根据实际情况计算部门员工统计
        const stats = departments.slice(0, 5).map((dept: any, index: number) => ({
          name: dept.name,
          employeeCount: Math.floor(Math.random() * 50) + 10, // 模拟数据
          percentage: Math.floor(Math.random() * 30) + 10,
        }));
        setDepartmentStats(stats);
      }
    } catch (error) {
      console.error('加载部门统计失败:', error);
    }
  };

  // 加载即将到期试用期员工
  const loadExpiringProbationEmployees = async () => {
    try {
      const response = await getExpiringProbationEmployees(7);
      if (response && response.resp_code === 0) {
        setExpiringProbationEmployees(response.datas || response.data || []);
      } else {
        console.warn('Dashboard: 加载即将到期试用期员工失败:', response);
      }
    } catch (error) {
      console.error('Dashboard: 加载即将到期试用期员工失败:', error);
    }
  };

  // 加载生日员工
  const loadBirthdayEmployees = async () => {
    try {
      const today = new Date();
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const response = await getBirthdayEmployees(
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      if (response && response.resp_code === 0) {
        setBirthdayEmployees(response.datas || response.data || []);
      } else {
        console.warn('Dashboard: 加载生日员工失败:', response);
      }
    } catch (error) {
      console.error('Dashboard: 加载生日员工失败:', error);
    }
  };

  // 初始化数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadStatistics(),
        loadDepartmentStats(),
        loadExpiringProbationEmployees(),
        loadBirthdayEmployees(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={{
        title: '组织架构概览',
        breadcrumb: {},
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总员工数"
              value={statistics.totalCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在职员工"
              value={statistics.onJobCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="试用期员工"
              value={statistics.probationCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均年龄"
              value={statistics.averageAge}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="岁"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 性别分布 */}
        <Col span={8}>
          <Card 
            title={
              <Space>
                <PieChartOutlined />
                性别分布
              </Space>
            }
            extra={<Button type="link">查看详情</Button>}
          >
            <div style={{ textAlign: 'center' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="男性"
                    value={statistics.maleCount}
                    valueStyle={{ color: '#1890ff' }}
                    suffix="人"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="女性"
                    value={statistics.femaleCount}
                    valueStyle={{ color: '#eb2f96' }}
                    suffix="人"
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                <Progress
                  percent={Math.round((statistics.maleCount / (statistics.maleCount + statistics.femaleCount)) * 100)}
                  status="active"
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#eb2f96',
                  }}
                />
              </div>
            </div>
          </Card>
        </Col>

        {/* 学历分布 */}
        <Col span={8}>
          <Card 
            title={
              <Space>
                <BookOutlined />
                学历分布
              </Space>
            }
            extra={<Button type="link">查看详情</Button>}
          >
            <List
              size="small"
              dataSource={[
                { label: '博士', value: statistics.educationDistribution.doctor, color: '#f50' },
                { label: '硕士', value: statistics.educationDistribution.master, color: '#2db7f5' },
                { label: '本科', value: statistics.educationDistribution.bachelor, color: '#87d068' },
                { label: '其他', value: statistics.educationDistribution.other, color: '#108ee9' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Badge color={item.color} />
                      <span>{item.label}</span>
                    </Space>
                    <span style={{ fontWeight: 'bold' }}>{item.value}人</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 雇佣类型分布 */}
        <Col span={8}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                雇佣类型分布
              </Space>
            }
            extra={<Button type="link">查看详情</Button>}
          >
            <List
              size="small"
              dataSource={[
                { label: '全职', value: statistics.employmentTypeDistribution.fullTime, color: '#52c41a' },
                { label: '兼职', value: statistics.employmentTypeDistribution.partTime, color: '#faad14' },
                { label: '实习', value: statistics.employmentTypeDistribution.intern, color: '#1890ff' },
                { label: '合同工', value: statistics.employmentTypeDistribution.contractor, color: '#722ed1' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Badge color={item.color} />
                      <span>{item.label}</span>
                    </Space>
                    <span style={{ fontWeight: 'bold' }}>{item.value}人</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 部门员工统计 */}
        <Col span={12}>
          <Card 
            title={
              <Space>
                <BankOutlined />
                部门员工分布
              </Space>
            }
            extra={<Button type="link">查看详情</Button>}
          >
            <Table
              size="small"
              dataSource={departmentStats}
              pagination={false}
              columns={[
                {
                  title: '部门名称',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: '员工数量',
                  dataIndex: 'employeeCount',
                  key: 'employeeCount',
                  render: (count) => `${count}人`,
                },
                {
                  title: '占比',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (percentage) => (
                    <div style={{ width: 100 }}>
                      <Progress percent={percentage} size="small" showInfo={false} />
                      <span style={{ fontSize: 12 }}>{percentage}%</span>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 提醒事项 */}
        <Col span={12}>
          <Card 
            title={
              <Space>
                <TrophyOutlined />
                重要提醒
              </Space>
            }
          >
            <Timeline>
              {expiringProbationEmployees.length > 0 && (
                <Timeline.Item color="orange" dot={<ClockCircleOutlined />}>
                  <div>
                    <strong>即将转正提醒</strong>
                    <div style={{ marginTop: 4 }}>
                      {expiringProbationEmployees.slice(0, 3).map((emp, index) => (
                        <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
                          {emp.name} - {emp.departmentName}
                        </Tag>
                      ))}
                      {expiringProbationEmployees.length > 3 && (
                        <span>等{expiringProbationEmployees.length}人</span>
                      )}
                    </div>
                  </div>
                </Timeline.Item>
              )}
              
              {birthdayEmployees.length > 0 && (
                <Timeline.Item color="green" dot={<CalendarOutlined />}>
                  <div>
                    <strong>本周生日</strong>
                    <div style={{ marginTop: 4 }}>
                      {birthdayEmployees.slice(0, 3).map((emp, index) => (
                        <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                          {emp.name} - {emp.departmentName}
                        </Tag>
                      ))}
                      {birthdayEmployees.length > 3 && (
                        <span>等{birthdayEmployees.length}人</span>
                      )}
                    </div>
                  </div>
                </Timeline.Item>
              )}

              <Timeline.Item color="blue" dot={<RiseOutlined />}>
                <div>
                  <strong>月度招聘目标</strong>
                  <div style={{ marginTop: 4 }}>
                    <Progress percent={75} size="small" />
                    <span style={{ fontSize: 12 }}>已完成 75% (15/20)</span>
                  </div>
                </div>
              </Timeline.Item>
            </Timeline>

            {expiringProbationEmployees.length === 0 && birthdayEmployees.length === 0 && (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无重要提醒"
              />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default OrganizationDashboard; 