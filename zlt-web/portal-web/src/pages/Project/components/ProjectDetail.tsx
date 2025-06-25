import React, { useEffect, useState } from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Space,
  Button,
  Divider,
  Table,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  Project,
  ProjectParticipant,
  ProjectStatus,
  ApprovalStatus,
} from '@/types/project';
import { getEmployeeDetail } from '@/services/organization/employee';
import { getDepartmentDetail } from '@/services/organization/department';
import { projectApi } from '@/services/project';

interface ProjectDetailProps {
  visible: boolean;
  project?: Project;
  onCancel: () => void;
  onEdit: (project: Project) => void;
}

// 项目状态配置
const PROJECT_STATUS_CONFIG = {
  init: { text: '初始化', color: 'default', icon: <ClockCircleOutlined /> },
  running: { text: '进行中', color: 'processing', icon: <ClockCircleOutlined /> },
  closed: { text: '已结项', color: 'success', icon: <CheckCircleOutlined /> },
  rejected: { text: '已拒绝', color: 'error', icon: <CloseCircleOutlined /> },
  closure_pending: { text: '结项待审', color: 'warning', icon: <ClockCircleOutlined /> },
};

// 审批状态配置
const APPROVAL_STATUS_CONFIG = {
  pending: { text: '待审批', color: 'warning' },
  approved: { text: '已通过', color: 'success' },
  rejected: { text: '已拒绝', color: 'error' },
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  visible,
  project,
  onCancel,
  onEdit,
}) => {
  const [leaderName, setLeaderName] = useState<string>('');
  const [participantDetails, setParticipantDetails] = useState<ProjectParticipant[]>([]);
  const [closureInfo, setClosureInfo] = useState<any>(null);
  const [profitDistributionData, setProfitDistributionData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDetails() {
      if (project) {
        // 负责人
        if (project.leaderId && !project.leaderName) {
          try {
            const res = await getEmployeeDetail(Number(project.leaderId));
            if (res && res.data && res.data.name) {
              setLeaderName(res.data.name);
            }
          } catch {}
        } else {
          setLeaderName(project.leaderName || '');
        }
        // 参与人
        let participants: ProjectParticipant[] = [];
        if (project.participantDetails) {
          participants = project.participantDetails;
        } else if (project.participants) {
          try {
            participants = JSON.parse(project.participants) || [];
          } catch {}
        }
        // 批量查详情
        const details = await Promise.all(
          participants.map(async (p: any) => {
            if (!p.participantName && p.participantId) {
              try {
                const res = await getEmployeeDetail(Number(p.participantId));
                if (res && res.resp_code === 0 && res.datas) {
                  return {
                    ...p,
                    participantName: res.datas.name,
                    departmentName: res.datas.departmentName,
                    participantPhone: res.datas.phoneNumber,
                    participantEmail: res.datas.email,
                  };
                }
              } catch {}
            }
            return p;
          })
        );
        setParticipantDetails(details);
        
        // 如果项目已结项，加载结项信息
        if (project.status === 'closed') {
          try {
            const closureResponse = await projectApi.getProjectClosure(project.id);
            if (closureResponse.resp_code === 0 && closureResponse.datas) {
              setClosureInfo(closureResponse.datas);
            }
          } catch (error) {
            console.error('Failed to load closure info:', error);
          }
        }
        
        // 检查是否有提成分配数据
        if (project.hasProfitDistribution && project.profitDistributions) {
          // 为提成分配数据补充部门名称和员工姓名
          const enrichedDistributions = await Promise.all(
            project.profitDistributions.map(async (distribution: any) => {
              const enriched = { ...distribution };
              
              // 获取部门名称
              if (distribution.deptId && !distribution.departmentName) {
                try {
                  const deptRes = await getDepartmentDetail(distribution.deptId);
                  if (deptRes && deptRes.resp_code === 0 && deptRes.datas && deptRes.datas.name) {
                    enriched.departmentName = deptRes.datas.name;
                  }
                } catch (error) {
                  console.error(`Failed to get department ${distribution.deptId}:`, error);
                }
              }
              
              // 获取员工姓名（通过员工ID关联项目参与人）
              if (distribution.employeeId && !distribution.employeeName) {
                // 首先从已加载的参与人详情中查找
                const participant = details.find(p => p.participantId === distribution.employeeId);
                if (participant && participant.participantName) {
                  enriched.employeeName = participant.participantName;
                } else {
                  // 如果参与人详情中没有，直接通过员工API获取
                  try {
                    const empRes = await getEmployeeDetail(Number(distribution.employeeId));
                    if (empRes && empRes.resp_code === 0 && empRes.datas && empRes.datas.name) {
                      enriched.employeeName = empRes.datas.name;
                    }
                  } catch (error) {
                    console.error(`Failed to get employee ${distribution.employeeId}:`, error);
                  }
                }
              }
              
              return enriched;
            })
          );
          
          setProfitDistributionData(enrichedDistributions);
        } else {
          // 清空之前的数据
          setProfitDistributionData([]);
        }
      }
    }
    fetchDetails();
  }, [project]);

  if (!project) return null;

  // 参与人表格列定义
  const participantColumns: ColumnsType<ProjectParticipant> = [
    {
      title: '参与人',
      dataIndex: 'participantName',
      key: 'participantName',
      render: (text: string, record: ProjectParticipant) => (
        <Space>
          <UserOutlined />
          {text || record.participantUsername || record.participantId}
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text: string) => text || '-',
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record: ProjectParticipant) => (
        <div>
          {record.participantEmail && <div>邮箱: {record.participantEmail}</div>}
          {record.participantPhone && <div>电话: {record.participantPhone}</div>}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="项目详情"
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={
        <Space>
          <Button onClick={onCancel}>关闭</Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(project)}
          >
            编辑
          </Button>
        </Space>
      }
    >
      <Card>
        <Descriptions
          title="基本信息"
          bordered
          column={2}
          size="middle"
        >
          <Descriptions.Item label="项目名称" span={2}>
            {project.name}
          </Descriptions.Item>
          
          <Descriptions.Item label="项目分类">
            {project.category ? (
              <Tag color="blue">{project.category}</Tag>
            ) : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="项目负责人">
            {leaderName || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="客户名称">
            {project.customerName || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="客户联系人">
            {project.customerContact || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="立项时间">
            {project.startTime ? dayjs(project.startTime).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="项目状态">
            {(() => {
              const config = PROJECT_STATUS_CONFIG[project.status as ProjectStatus];
              return (
                <Tag color={config?.color} icon={config?.icon}>
                  {config?.text || project.status}
                </Tag>
              );
            })()}
          </Descriptions.Item>
          
          <Descriptions.Item label="审批状态">
            {project.finalStatus ? (() => {
              const config = APPROVAL_STATUS_CONFIG[project.finalStatus as ApprovalStatus];
              return (
                <Tag color={config?.color}>
                  {config?.text || project.finalStatus}
                </Tag>
              );
            })() : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="计提状态">
            {(() => {
              const status = project.profitDistributionStatus;
              if (!status || status === 'not_set') {
                return <Tag color="default">未设置</Tag>;
              }
              const statusMap = {
                awaiting_approval: { text: '待审批', color: 'warning' },
                in_approval: { text: '审批中', color: 'processing' },
                approved: { text: '审批通过', color: 'success' },
                approval_failed: { text: '审批失败', color: 'error' },
                partially_settled: { text: '部分计提', color: 'orange' },
                settled: { text: '已计提完毕', color: 'green' },
              };
              const config = statusMap[status as keyof typeof statusMap];
              return (
                <Tag color={config?.color || 'default'}>
                  {config?.text || status}
                </Tag>
              );
            })()}
          </Descriptions.Item>
          
          <Descriptions.Item label="创建时间">
            {dayjs(project.createdAt).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          
          <Descriptions.Item label="更新时间">
            {dayjs(project.updatedAt).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div style={{ marginTop: 24 }}>
          <h4 style={{ marginBottom: 16 }}>项目参与人</h4>
          {participantDetails.length > 0 ? (
            <Table
              columns={participantColumns}
              dataSource={participantDetails}
              rowKey={(record) => record.id || record.participantId}
              pagination={false}
              size="small"
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
              暂无参与人信息
            </div>
          )}
        </div>

        {project.status === 'closed' && closureInfo && (
          <>
            <Divider />
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 16 }}>项目结项信息</h4>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="合同金额"
                      value={closureInfo.contractAmount || 0}
                      precision={2}
                      prefix={<DollarOutlined />}
                      suffix="元"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="实际金额"
                      value={closureInfo.actualAmount || 0}
                      precision={2}
                      prefix={<DollarOutlined />}
                      suffix="元"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="毛利润"
                      value={closureInfo.grossProfit || 0}
                      precision={2}
                      prefix={<DollarOutlined />}
                      suffix="元"
                      valueStyle={{ 
                        color: (closureInfo.grossProfit || 0) >= 0 ? '#3f8600' : '#cf1322' 
                      }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="毛利率"
                      value={closureInfo.grossProfitRate || 0}
                      precision={2}
                      suffix="%"
                      valueStyle={{ 
                        color: (closureInfo.grossProfitRate || 0) >= 0 ? '#3f8600' : '#cf1322' 
                      }}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="结项时间">
                  {closureInfo.closureTime ? dayjs(closureInfo.closureTime).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="审批状态">
                  {closureInfo.finalStatus ? (
                    <Tag color={closureInfo.finalStatus === 'approved' ? 'success' : 'error'}>
                      {closureInfo.finalStatus === 'approved' ? '已通过' : '已拒绝'}
                    </Tag>
                  ) : (
                    <Tag color="warning">待审批</Tag>
                  )}
                </Descriptions.Item>
                {closureInfo.remarks && (
                  <Descriptions.Item label="备注说明" span={2}>
                    {closureInfo.remarks}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </>
        )}

        {project.processInstanceId && (
          <>
            <Divider />
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 16 }}>审批信息</h4>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="流程实例ID">
                  {project.processInstanceId}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </>
        )}
        
        {/* 项目提成分配信息 */}
        {project.hasProfitDistribution && profitDistributionData.length > 0 && (
          <>
            <Divider />
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 16 }}>项目提成分配</h4>
              
              {(() => {
                // 按角色分组提成分配数据（基于role字段：部门分配、员工分配）
                const departmentDistributions = profitDistributionData.filter(item => item.role === '部门分配');
                const employeeDistributions = profitDistributionData.filter(item => item.role === '员工分配');
                
                // 按部门分组员工数据
                const employeeByDept = employeeDistributions.reduce((acc, emp) => {
                  const deptId = emp.deptId;
                  if (!acc[deptId]) acc[deptId] = [];
                  acc[deptId].push(emp);
                  return acc;
                }, {} as Record<string, any[]>);
                
                return (
                  <>
                    {/* 项目提成概览（从结项信息获取） */}
                    {closureInfo && (
                      <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                          <Card>
                            <Statistic
                              title="项目实际金额"
                              value={closureInfo.actualAmount || 0}
                              precision={2}
                              prefix={<DollarOutlined />}
                              suffix="元"
                              valueStyle={{ color: '#1890ff' }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card>
                            <Statistic
                              title="项目毛利润"
                              value={closureInfo.grossProfit || 0}
                              precision={2}
                              prefix={<DollarOutlined />}
                              suffix="元"
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card>
                            <Statistic
                              title="毛利率"
                              value={closureInfo.grossProfitRate || 0}
                              precision={1}
                              suffix="%"
                              valueStyle={{ color: '#fa8c16' }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card>
                            <Statistic
                              title="提成池总额"
                              value={(closureInfo.grossProfit || 0) * ((project as any).maxDistribution || 0.5)}
                              precision={2}
                              prefix={<DollarOutlined />}
                              suffix="元"
                              valueStyle={{ color: '#eb2f96' }}
                            />
                          </Card>
                        </Col>
                      </Row>
                    )}
                    
                    {/* 部门分配详情 */}
                    {departmentDistributions.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <h5>部门分配详情</h5>
                        <Table
                          columns={[
                            {
                              title: '部门ID',
                              dataIndex: 'deptId',
                              key: 'deptId',
                              width: 100,
                            },
                            {
                              title: '部门名称',
                              dataIndex: 'departmentName',
                              key: 'departmentName',
                              render: (text: string, record: any) => text || `部门${record.deptId}`,
                            },
                            {
                              title: '分配类型',
                              dataIndex: 'distributionType',
                              key: 'distributionType',
                              render: (type: string) => (
                                <Tag color="blue">{type}</Tag>
                              ),
                            },
                            {
                              title: '分配值',
                              dataIndex: 'distributionValue',
                              key: 'distributionValue',
                              render: (value: number, record: any) => {
                                const isAmount = record.distributionType === '金额';
                                return isAmount ? 
                                  `¥${(value || 0).toFixed(2)}` : 
                                  `${(value || 0).toFixed(1)}%`;
                              },
                            },
                            {
                              title: '计算金额',
                              key: 'calculatedAmount',
                              render: (_, record: any) => {
                                if (closureInfo && record.distributionType === '比例') {
                                  const amount = (closureInfo.grossProfit || 0) * ((project as any).maxDistribution || 0.5) * (record.distributionValue / 100);
                                  return `¥${amount.toFixed(2)}`;
                                }
                                return `¥${(record.distributionValue || 0).toFixed(2)}`;
                              },
                            },
                            {
                              title: '状态',
                              dataIndex: 'finalStatus',
                              key: 'finalStatus',
                              render: (status: string) => {
                                if (!status) return <Tag color="warning">待审批</Tag>;
                                const statusConfig = {
                                  'pending': { text: '待审批', color: 'warning' },
                                  'approved': { text: '已通过', color: 'success' },
                                  'rejected': { text: '已拒绝', color: 'error' },
                                };
                                const config = statusConfig[status as keyof typeof statusConfig] || 
                                             { text: status, color: 'default' };
                                return <Tag color={config.color}>{config.text}</Tag>;
                              },
                            },
                          ]}
                          dataSource={departmentDistributions}
                          rowKey={(record) => record.id}
                          pagination={false}
                          size="small"
                          expandable={{
                            expandedRowRender: (record) => {
                              const deptEmployees = employeeByDept[record.deptId] || [];
                              if (deptEmployees.length === 0) {
                                return <div style={{ padding: '8px 0', color: '#999' }}>该部门暂无员工分配</div>;
                              }
                              
                              return (
                                <Table
                                  columns={[
                                    {
                                      title: '员工ID',
                                      dataIndex: 'employeeId',
                                      key: 'employeeId',
                                      width: 100,
                                    },
                                    {
                                      title: '员工姓名',
                                      dataIndex: 'employeeName',
                                      key: 'employeeName',
                                      render: (text: string, empRecord: any) => (
                                        <Space>
                                          <UserOutlined />
                                          {text || `员工${empRecord.employeeId}`}
                                        </Space>
                                      ),
                                    },
                                    {
                                      title: '分配类型',
                                      dataIndex: 'distributionType',
                                      key: 'distributionType',
                                      render: (type: string) => (
                                        <Tag color={type === '金额' ? 'green' : 'blue'}>
                                          {type}
                                        </Tag>
                                      ),
                                    },
                                    {
                                      title: '分配值',
                                      dataIndex: 'distributionValue',
                                      key: 'distributionValue',
                                      render: (value: number, empRecord: any) => {
                                        const isAmount = empRecord.distributionType === '金额';
                                        return isAmount ? 
                                          `¥${(value || 0).toFixed(2)}` : 
                                          `${(value || 0).toFixed(1)}%`;
                                      },
                                    },
                                    {
                                      title: '计算金额',
                                      key: 'calculatedAmount',
                                      render: (_, empRecord: any) => {
                                        if (closureInfo && empRecord.distributionType === '比例') {
                                          const amount = (closureInfo.grossProfit || 0) * ((project as any).maxDistribution || 0.5) * (empRecord.distributionValue / 100);
                                          return `¥${amount.toFixed(2)}`;
                                        }
                                        return `¥${(empRecord.distributionValue || 0).toFixed(2)}`;
                                      },
                                    },
                                    {
                                      title: '状态',
                                      dataIndex: 'finalStatus',
                                      key: 'finalStatus',
                                      render: (status: string) => {
                                        if (!status) return <Tag color="warning">待审批</Tag>;
                                        const statusConfig = {
                                          'pending': { text: '待审批', color: 'warning' },
                                          'approved': { text: '已通过', color: 'success' },
                                          'rejected': { text: '已拒绝', color: 'error' },
                                        };
                                        const config = statusConfig[status as keyof typeof statusConfig] || 
                                                     { text: status, color: 'default' };
                                        return <Tag color={config.color}>{config.text}</Tag>;
                                      },
                                    },
                                  ]}
                                  dataSource={deptEmployees}
                                  rowKey={(empRecord) => empRecord.id}
                                  pagination={false}
                                  size="small"
                                  showHeader={false}
                                />
                              );
                            },
                            rowExpandable: (record) => (employeeByDept[record.deptId] && employeeByDept[record.deptId].length > 0),
                          }}
                        />
                      </div>
                    )}
                    
                    {/* 提成分配汇总 */}
                    <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Statistic
                            title="参与部门数"
                            value={departmentDistributions.length}
                            suffix="个"
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="参与员工数"
                            value={employeeDistributions.length}
                            suffix="人"
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="总权重"
                            value={departmentDistributions.reduce((sum, item) => 
                              sum + (item.distributionType === '比例' ? item.distributionValue : 0), 0
                            )}
                            precision={1}
                            suffix="%"
                          />
                        </Col>
                      </Row>
                    </div>
                  </>
                );
              })()}
            </div>
          </>
        )}
      </Card>
    </Modal>
  );
};

export default ProjectDetail; 