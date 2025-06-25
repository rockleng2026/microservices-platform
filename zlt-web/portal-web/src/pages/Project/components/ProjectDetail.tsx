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

  // 将缓存提升到组件级别，避免重复创建
  const employeeCacheRef = React.useRef<Map<string, any>>(new Map());
  const departmentCacheRef = React.useRef<Map<string, any>>(new Map());
  
  // 请求去重：存储正在进行的API请求Promise
  const employeeRequestsRef = React.useRef<Map<string, Promise<any>>>(new Map());
  const departmentRequestsRef = React.useRef<Map<string, Promise<any>>>(new Map());
  
  // 缓存统计
  const cacheStatsRef = React.useRef({
    employee: { hits: 0, misses: 0, deduped: 0 },
    department: { hits: 0, misses: 0, deduped: 0 }
  });

  // 获取员工详情的通用函数，带缓存和请求去重
  const getEmployeeWithCache = React.useCallback(async (empId: string) => {
    const cache = employeeCacheRef.current;
    const requests = employeeRequestsRef.current;
    const stats = cacheStatsRef.current.employee;
    
    // 1. 检查缓存
    if (cache.has(empId)) {
      stats.hits++;
      console.log(`📋 从缓存获取员工${empId}:`, cache.get(empId).name, `(命中率: ${((stats.hits / (stats.hits + stats.misses + stats.deduped)) * 100).toFixed(1)}%)`);
      return cache.get(empId);
    }
    
    // 2. 检查是否有正在进行的请求
    if (requests.has(empId)) {
      stats.deduped++;
      console.log(`🔄 等待进行中的员工${empId}请求 (去重: ${stats.deduped})`);
      return await requests.get(empId);
    }
    
    // 3. 发起新的API请求
    stats.misses++;
    const requestPromise = (async () => {
      try {
        const res = await getEmployeeDetail(Number(empId));
        let employeeData = null;
        
        // 适配两种响应格式
        if (res && res.resp_code === 0 && res.datas) {
          employeeData = res.datas;
        } else if (res && res.success && res.data) {
          employeeData = res.data;
        }
        
        if (employeeData) {
          cache.set(empId, employeeData);
          console.log(`✅ API获取员工${empId}详情成功:`, employeeData.name, `(缓存大小: ${cache.size})`);
          return employeeData;
        }
      } catch (error) {
        console.warn(`❌ 获取员工${empId}详情失败:`, error);
      } finally {
        // 请求完成后清理
        requests.delete(empId);
      }
      return null;
    })();
    
    // 存储请求Promise
    requests.set(empId, requestPromise);
    return await requestPromise;
  }, []);

  // 获取部门详情的通用函数，带缓存和请求去重
  const getDepartmentWithCache = React.useCallback(async (deptId: string) => {
    const cache = departmentCacheRef.current;
    const requests = departmentRequestsRef.current;
    const stats = cacheStatsRef.current.department;
    
    // 1. 检查缓存
    if (cache.has(deptId)) {
      stats.hits++;
      console.log(`📋 从缓存获取部门${deptId}:`, cache.get(deptId).name, `(命中率: ${((stats.hits / (stats.hits + stats.misses + stats.deduped)) * 100).toFixed(1)}%)`);
      return cache.get(deptId);
    }
    
    // 2. 检查是否有正在进行的请求
    if (requests.has(deptId)) {
      stats.deduped++;
      console.log(`🔄 等待进行中的部门${deptId}请求 (去重: ${stats.deduped})`);
      return await requests.get(deptId);
    }
    
    // 3. 发起新的API请求
    stats.misses++;
    const requestPromise = (async () => {
      try {
        const res = await getDepartmentDetail(deptId);
        let departmentData = null;
        
        // 适配两种响应格式
        if (res && res.resp_code === 0 && res.datas) {
          departmentData = res.datas;
        } else if (res && res.success && res.data) {
          departmentData = res.data;
        }
        
        if (departmentData) {
          cache.set(deptId, departmentData);
          console.log(`✅ API获取部门${deptId}详情成功:`, departmentData.name, `(缓存大小: ${cache.size})`);
          return departmentData;
        }
      } catch (error) {
        console.warn(`❌ 获取部门${deptId}详情失败:`, error);
      } finally {
        // 请求完成后清理
        requests.delete(deptId);
      }
      return null;
    })();
    
    // 存储请求Promise
    requests.set(deptId, requestPromise);
    return await requestPromise;
  }, []);

  // 清理缓存的函数（可选，在组件卸载时调用）
  React.useEffect(() => {
    return () => {
      // 组件卸载时清理缓存（如果需要的话）
      // employeeCacheRef.current.clear();
      // departmentCacheRef.current.clear();
      console.log('🧹 ProjectDetail组件卸载，保留缓存以供复用');
    };
  }, []);

  useEffect(() => {
    async function fetchDetails() {
      if (project) {
        console.log('🚀 开始加载项目详情数据:', project.id);

        // 1. 处理项目负责人
        if (project.leaderId && !project.leaderName) {
          const leaderData = await getEmployeeWithCache(String(project.leaderId));
          setLeaderName(leaderData?.name || '');
        } else {
          setLeaderName(project.leaderName || '');
        }

        // 2. 处理项目参与人
        let participants: ProjectParticipant[] = [];
        if (project.participantDetails) {
          participants = project.participantDetails;
        } else if (project.participants) {
          try {
            participants = JSON.parse(project.participants) || [];
          } catch {}
        }

        // 批量获取参与人详情
        const details = await Promise.all(
          participants.map(async (p: any) => {
            if (!p.participantName && p.participantId) {
              const empData = await getEmployeeWithCache(String(p.participantId));
              if (empData) {
                return {
                  ...p,
                  participantName: empData.name,
                  departmentName: empData.departmentName,
                  participantPhone: empData.mobile || empData.phoneNumber,
                  participantEmail: empData.email,
                };
              }
            }
            return p;
          })
        );
        setParticipantDetails(details);
        
        // 3. 如果项目已结项，加载结项信息
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
        
        // 4. 处理提成分配数据
        if (project.hasProfitDistribution && project.profitDistributions) {
          console.log('🎯 开始处理提成分配数据，原始数据:', project.profitDistributions);
          
          // 为提成分配数据补充部门名称和员工姓名
          const enrichedDistributions = await Promise.all(
            project.profitDistributions.map(async (distribution: any) => {
              const enriched = { ...distribution };
              
              // 获取部门名称
              if (distribution.deptId && !distribution.departmentName) {
                const deptData = await getDepartmentWithCache(String(distribution.deptId));
                if (deptData) {
                  enriched.departmentName = deptData.name;
                }
              }
              
              // 获取员工姓名
              if (distribution.employeeId && !distribution.employeeName) {
                // 优先从已加载的参与人详情中查找
                const participant = details.find(p => String(p.participantId) === String(distribution.employeeId));
                if (participant && participant.participantName) {
                  enriched.employeeName = participant.participantName;
                  console.log(`👤 从参与人中获取员工${distribution.employeeId}姓名:`, participant.participantName);
                } else {
                  // 如果参与人详情中没有，通过缓存函数获取
                  const empData = await getEmployeeWithCache(String(distribution.employeeId));
                  if (empData) {
                    enriched.employeeName = empData.name;
                    console.log(`👤 从API获取员工${distribution.employeeId}姓名:`, empData.name);
                  }
                }
              }
              
              return enriched;
            })
          );
          
          console.log('🎯 提成分配数据处理完成:', enrichedDistributions);
          setProfitDistributionData(enrichedDistributions);
        } else {
          setProfitDistributionData([]);
        }

        const empStats = cacheStatsRef.current.employee;
        const deptStats = cacheStatsRef.current.department;
        console.log('📊 项目详情数据加载完成, 缓存统计:', {
          员工缓存: {
            大小: employeeCacheRef.current.size,
            命中: empStats.hits,
            未命中: empStats.misses,
            去重: empStats.deduped,
            命中率: empStats.hits + empStats.misses + empStats.deduped > 0 ? `${((empStats.hits / (empStats.hits + empStats.misses + empStats.deduped)) * 100).toFixed(1)}%` : '0%',
            IDs: Array.from(employeeCacheRef.current.keys())
          },
          部门缓存: {
            大小: departmentCacheRef.current.size,
            命中: deptStats.hits,
            未命中: deptStats.misses,
            去重: deptStats.deduped,
            命中率: deptStats.hits + deptStats.misses + deptStats.deduped > 0 ? `${((deptStats.hits / (deptStats.hits + deptStats.misses + deptStats.deduped)) * 100).toFixed(1)}%` : '0%',
            IDs: Array.from(departmentCacheRef.current.keys())
          }
        });
      }
    }
    fetchDetails();
  }, [project, getEmployeeWithCache, getDepartmentWithCache]);

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