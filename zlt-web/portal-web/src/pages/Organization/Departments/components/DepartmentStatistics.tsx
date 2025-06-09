import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin, Tag } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  BankOutlined, 
  RiseOutlined,
  FallOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { getDepartmentStatistics } from '@/services/organization/department';

interface DepartmentStatisticsProps {
  departmentId: number;
}

interface StatisticsData {
  employeeCount: number;
  positionCount: number;
  childDepartmentCount: number;
  totalEmployeeCount: number;
  onJobEmployeeCount: number;
  probationEmployeeCount: number;
  leaveEmployeeCount: number;
  managerCount: number;
  averageAge: number;
  maleRatio: number;
  femaleRatio: number;
  educationDistribution: {
    bachelor: number;
    master: number;
    doctor: number;
    other: number;
  };
  positionDistribution: {
    manager: number;
    senior: number;
    intermediate: number;
    junior: number;
  };
}

const DepartmentStatistics: React.FC<DepartmentStatisticsProps> = ({ departmentId }) => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await getDepartmentStatistics(departmentId);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Load statistics error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      loadStatistics();
    }
  }, [departmentId]);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <Card title="部门统计" size="small">
      <Row gutter={[16, 16]}>
        {/* 基础统计 */}
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="部门员工"
              value={statistics.employeeCount}
              prefix={<UserOutlined />}
              suffix="人"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="下属部门"
              value={statistics.childDepartmentCount}
              prefix={<BankOutlined />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="设置岗位"
              value={statistics.positionCount}
              prefix={<TeamOutlined />}
              suffix="个"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="管理人员"
              value={statistics.managerCount}
              prefix={<RiseOutlined />}
              suffix="人"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>

        {/* 员工状态分布 */}
        <Col span={12}>
          <Card title="员工状态分布" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="在职"
                  value={statistics.onJobEmployeeCount}
                  suffix="人"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="试用期"
                  value={statistics.probationEmployeeCount}
                  suffix="人"
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="已离职"
                  value={statistics.leaveEmployeeCount}
                  suffix="人"
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 性别比例 */}
        <Col span={12}>
          <Card title="性别比例" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>
                  <span>男性比例</span>
                  <Tag color="blue" style={{ float: 'right' }}>
                    {statistics.maleRatio}%
                  </Tag>
                </div>
                <Progress 
                  percent={statistics.maleRatio} 
                  strokeColor="#1890ff"
                  size="small"
                />
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>
                  <span>女性比例</span>
                  <Tag color="pink" style={{ float: 'right' }}>
                    {statistics.femaleRatio}%
                  </Tag>
                </div>
                <Progress 
                  percent={statistics.femaleRatio} 
                  strokeColor="#eb2f96"
                  size="small"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 学历分布 */}
        <Col span={12}>
          <Card title="学历分布" size="small">
            <div style={{ marginBottom: 12 }}>
              <span>博士</span>
              <Tag color="red" style={{ float: 'right' }}>
                {statistics.educationDistribution.doctor}人
              </Tag>
            </div>
            <Progress 
              percent={(statistics.educationDistribution.doctor / statistics.employeeCount) * 100} 
              strokeColor="#f5222d"
              size="small"
              showInfo={false}
            />
            
            <div style={{ marginBottom: 12, marginTop: 12 }}>
              <span>硕士</span>
              <Tag color="orange" style={{ float: 'right' }}>
                {statistics.educationDistribution.master}人
              </Tag>
            </div>
            <Progress 
              percent={(statistics.educationDistribution.master / statistics.employeeCount) * 100} 
              strokeColor="#fa8c16"
              size="small"
              showInfo={false}
            />
            
            <div style={{ marginBottom: 12, marginTop: 12 }}>
              <span>本科</span>
              <Tag color="green" style={{ float: 'right' }}>
                {statistics.educationDistribution.bachelor}人
              </Tag>
            </div>
            <Progress 
              percent={(statistics.educationDistribution.bachelor / statistics.employeeCount) * 100} 
              strokeColor="#52c41a"
              size="small"
              showInfo={false}
            />
            
            <div style={{ marginBottom: 12, marginTop: 12 }}>
              <span>其他</span>
              <Tag color="blue" style={{ float: 'right' }}>
                {statistics.educationDistribution.other}人
              </Tag>
            </div>
            <Progress 
              percent={(statistics.educationDistribution.other / statistics.employeeCount) * 100} 
              strokeColor="#1890ff"
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>

        {/* 岗位层级分布 */}
        <Col span={12}>
          <Card title="岗位层级分布" size="small">
            <div style={{ marginBottom: 12 }}>
              <span>管理层</span>
              <Tag color="red" style={{ float: 'right' }}>
                {statistics.positionDistribution.manager}人
              </Tag>
            </div>
            <Progress 
              percent={(statistics.positionDistribution.manager / statistics.employeeCount) * 100} 
              strokeColor="#f5222d"
              size="small"
              showInfo={false}
            />
            
            <div style={{ marginBottom: 12, marginTop: 12 }}>
              <span>高级</span>
              <Tag color="orange" style={{ float: 'right' }}>
                {statistics.positionDistribution.senior}人
              </Tag>
            </div>
            <Progress 
              percent={(statistics.positionDistribution.senior / statistics.employeeCount) * 100} 
              strokeColor="#fa8c16"
              size="small"
              showInfo={false}
            />
            
            <div style={{ marginBottom: 12, marginTop: 12 }}>
              <span>中级</span>
              <Tag color="blue" style={{ float: 'right' }}>
                {statistics.positionDistribution.intermediate}人
              </Tag>
            </div>
            <Progress 
              percent={(statistics.positionDistribution.intermediate / statistics.employeeCount) * 100} 
              strokeColor="#1890ff"
              size="small"
              showInfo={false}
            />
            
            <div style={{ marginBottom: 12, marginTop: 12 }}>
              <span>初级</span>
              <Tag color="green" style={{ float: 'right' }}>
                {statistics.positionDistribution.junior}人
              </Tag>
            </div>
            <Progress 
              percent={(statistics.positionDistribution.junior / statistics.employeeCount) * 100} 
              strokeColor="#52c41a"
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>

        {/* 平均年龄 */}
        <Col span={24}>
          <Card size="small">
            <Statistic
              title="平均年龄"
              value={statistics.averageAge}
              precision={1}
              suffix="岁"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default DepartmentStatistics; 