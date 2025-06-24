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
                if (res && res.data) {
                  return {
                    ...p,
                    participantName: res.data.name,
                    departmentName: res.data.departmentName,
                    participantPhone: res.data.phoneNumber,
                    participantEmail: res.data.email,
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
      </Card>
    </Modal>
  );
};

export default ProjectDetail; 