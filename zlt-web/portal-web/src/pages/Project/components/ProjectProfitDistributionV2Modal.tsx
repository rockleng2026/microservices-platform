import React, { useState, useEffect } from 'react';
import { Modal, Card, Row, Col, Table, Button, InputNumber, message, Divider, Statistic, Tooltip, Popconfirm, Select } from 'antd';
import type { Project } from '@/types/project';
import { getAccrualConfig, saveAccrualDetailV2 } from '@/services/projectAccrual';
import { projectApi } from '@/services/project';
import { request } from '@/utils/request';

const { Option } = Select;

interface ProjectProfitDistributionV2ModalProps {
  visible: boolean;
  project: Project | null;
  onCancel: () => void;
  onSuccess: () => void;
}

// 假设部门和员工数据可通过project对象获取，实际可根据业务调整
const mockDepartments = [
  { id: 'd1', name: '销售部' },
  { id: 'd2', name: '技术部' },
  { id: 'd3', name: '运维部' },
  { id: 'd4', name: '财务部' },
];
const mockEmployees = [
  { id: 'u1', name: '张三' },
  { id: 'u2', name: '李四' },
  { id: 'u3', name: '王五' },
  { id: 'u4', name: '赵六' },
];

const TYPE_LABELS: Record<string, string> = {
  group: '集团分配',
  department: '部门分配',
  project_individual: '项目个人分配',
  project_team: '项目团队分配',
};

const getDefaultWeight = (count: number) => count > 0 ? Number((100 / count).toFixed(2)) : 0;

const ProjectProfitDistributionV2Modal: React.FC<ProjectProfitDistributionV2ModalProps> = ({
  visible,
  project,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [accrualConfigs, setAccrualConfigs] = useState<any[]>([]);
  // 分配明细结构：{configId, type, targetId, targetName, weight, amount, profitRatio}
  const [details, setDetails] = useState<any>({}); // { configId: [detail, ...] }
  const [projectDetail, setProjectDetail] = useState<Project | null>(null);
  const [employeeDeptMap, setEmployeeDeptMap] = useState<Record<string, { id: string, name: string }>>({});

  // 1. 获取项目信息（优先 closure）
  const getProjectAmountInfo = () => {
    if (!projectDetail) return { actualAmount: '', grossProfit: '', grossProfitRate: '' };
    const closure = projectDetail.closure || {};
    return {
      actualAmount: closure.actualAmount || projectDetail.actualAmount || '',
      grossProfit: closure.grossProfit || projectDetail.grossProfit || '',
      grossProfitRate: closure.grossProfitRate || projectDetail.grossProfitRate || '',
    };
  };
  const projectAmountInfo = getProjectAmountInfo();

  // 2. 动态获取部门和员工
  const [dynamicDepartments, setDynamicDepartments] = useState<{ id: string, name: string }[]>([]);
  const [dynamicEmployees, setDynamicEmployees] = useState<{ id: string, name: string }[]>([]);

  // 获取参与人和负责人ID集合
  const getAllUserIds = () => {
    const ids = new Set<string>();
    if (projectDetail?.leaderId) ids.add(String(projectDetail.leaderId));
    if (projectDetail?.participantDetails && Array.isArray(projectDetail.participantDetails)) {
      projectDetail.participantDetails.forEach((p: any) => {
        if (p.participantId) ids.add(String(p.participantId));
      });
    }
    return Array.from(ids);
  };

  // 批量获取部门和员工信息，只在projectDetail.id变化时请求
  useEffect(() => {
    if (visible && projectDetail && projectDetail.id) {
      const userIds = getAllUserIds();
      if (userIds.length > 0) {
        // 避免重复请求
        let cancelled = false;
        request('/api-portal/api/organization/departments/batch-main-departments', {
          method: 'POST',
          data: userIds,
        }).then(res => {
          if (!cancelled) {
            setDynamicDepartments((res?.datas?.departments) || []);
            setEmployeeDeptMap(res?.datas?.employeeDepartmentMap || {});
          }
        });
        request('/api-portal/api/organization/employee/batch-detail', {
          method: 'POST',
          data: userIds,
        }).then(res => {
          if (!cancelled) {
            setDynamicEmployees((res?.datas?.employeeList) || res?.datas || []);
          }
        });
        return () => { cancelled = true; };
      }
    }
  }, [visible, projectDetail?.id]);

  // 动态获取部门和员工
  const getDepartmentsAndEmployees = () => {
    return {
      departments: dynamicDepartments.length > 0 ? dynamicDepartments : [],
      employees: dynamicEmployees.length > 0 ? dynamicEmployees : [],
      employeeDeptMap,
    };
  };

  // 只在visible/project变化时请求详情
  useEffect(() => {
    if (visible && project?.id) {
      let needFetch = false;
      if (!project.actualAmount || !project.grossProfit) needFetch = true;
      if (needFetch) {
        projectApi.getProjectById(String(project.id)).then(res => {
          // 只取项目主数据，不合并closure，id始终为项目ID
          setProjectDetail(res?.datas || res?.data || project);
        });
      } else {
        setProjectDetail(project);
      }
    }
  }, [visible, project]);

  // 关闭弹窗时重置 details
  useEffect(() => {
    if (!visible) {
      setDetails({});
    }
  }, [visible]);

  // 初始化分配明细，只在所有数据都准备好且details为空时执行
  useEffect(() => {
    if (
      visible &&
      projectDetail &&
      projectDetail.id &&
      dynamicDepartments.length > 0 &&
      dynamicEmployees.length > 0 &&
      Object.keys(details).length === 0
    ) {
      getAccrualConfig(projectDetail.id).then(res => {
        setAccrualConfigs(res?.datas || []);
        const init: any = {};
        (res?.datas || []).forEach((cfg: any) => {
          if (cfg.type === 'group') {
            init[cfg.id] = [{
              configId: cfg.id,
              type: 'group',
              targetId: 'group',
              targetName: '集团',
              weight: 100,
              amount: cfg.maxAmount || 0,
              profitRatio: cfg.maxAmount && (projectDetail.closure?.grossProfit || projectDetail.grossProfit) ? Number(((cfg.maxAmount / (projectDetail.closure?.grossProfit || projectDetail.grossProfit)) * 100).toFixed(2)) : 0,
            }];
          } else if (cfg.type === 'department') {
            const count = dynamicDepartments.length || 1;
            init[cfg.id] = dynamicDepartments.map(dep => ({
              configId: cfg.id,
              type: 'department',
              targetId: dep.id,
              targetName: dep.name,
              weight: getDefaultWeight(count),
              amount: cfg.maxAmount ? Number(((cfg.maxAmount * getDefaultWeight(count)) / 100).toFixed(2)) : 0,
              profitRatio: cfg.maxAmount && (projectDetail.closure?.grossProfit || projectDetail.grossProfit) ? Number((((cfg.maxAmount * getDefaultWeight(count) / 100) / (projectDetail.closure?.grossProfit || projectDetail.grossProfit)) * 100).toFixed(2)) : 0,
            }));
          } else if (cfg.type === 'project_individual' || cfg.type === 'project_team') {
            const count = dynamicEmployees.length || 1;
            init[cfg.id] = dynamicEmployees.map(emp => ({
              configId: cfg.id,
              type: cfg.type,
              targetId: emp.id,
              targetName: emp.name,
              weight: getDefaultWeight(count),
              amount: cfg.maxAmount ? Number(((cfg.maxAmount * getDefaultWeight(count)) / 100).toFixed(2)) : 0,
              profitRatio: cfg.maxAmount && (projectDetail.closure?.grossProfit || projectDetail.grossProfit) ? Number((((cfg.maxAmount * getDefaultWeight(count) / 100) / (projectDetail.closure?.grossProfit || projectDetail.grossProfit)) * 100).toFixed(2)) : 0,
              departmentName: employeeDeptMap[emp.id]?.name || '',
            }));
          }
        });
        setDetails(init);
      });
    }
  }, [visible, projectDetail?.id, dynamicDepartments, dynamicEmployees, details]);

  // 权重/金额/占比联动
  const updateDetail = (configId: string, idx: number, field: string, value: number) => {
    setDetails(prev => {
      const arr = [...(prev[configId] || [])];
      arr[idx][field] = value;
      // 重新计算金额和占比
      const cfg = accrualConfigs.find((c: any) => String(c.id) === String(configId));
      if (cfg) {
        arr.forEach(item => {
          item.amount = Number(((cfg.maxAmount || 0) * item.weight / 100).toFixed(2));
          item.profitRatio = (cfg.maxAmount && (projectDetail?.closure?.grossProfit || projectDetail?.grossProfit))
            ? Number(((item.amount / (projectDetail.closure?.grossProfit || projectDetail.grossProfit)) * 100).toFixed(2))
            : 0;
        });
      }
      return { ...prev, [configId]: arr };
    });
  };

  // 添加/删除分配对象
  const addDetail = (configId: string, type: string) => {
    setDetails(prev => {
      const arr = [...(prev[configId] || [])];
      if (type === 'department') {
        arr.push({
          configId,
          type,
          targetId: '',
          targetName: '',
          weight: 0,
          amount: 0,
          profitRatio: 0,
        });
      } else {
        arr.push({
          configId,
          type,
          targetId: '',
          targetName: '',
          weight: 0,
          amount: 0,
          profitRatio: 0,
        });
      }
      return { ...prev, [configId]: arr };
    });
  };
  const removeDetail = (configId: string, idx: number) => {
    setDetails(prev => {
      const arr = [...(prev[configId] || [])];
      arr.splice(idx, 1);
      return { ...prev, [configId]: arr };
    });
  };

  // 平均分配权重
  const averageWeight = (configId: string) => {
    setDetails(prev => {
      const arr = [...(prev[configId] || [])];
      const count = arr.length;
      arr.forEach(item => { item.weight = getDefaultWeight(count); });
      // 重新计算金额和占比
      const cfg = accrualConfigs.find((c: any) => String(c.id) === String(configId));
      arr.forEach(item => {
        item.amount = Number(((cfg.maxAmount || 0) * item.weight / 100).toFixed(2));
        item.profitRatio = projectDetail?.grossProfit ? Number(((item.amount / projectDetail.grossProfit) * 100).toFixed(2)) : 0;
      });
      return { ...prev, [configId]: arr };
    });
  };

  // 保存
  const handleSave = async () => {
    if (!projectDetail?.id) return;
    // 校验：每组分配总和必须等于上级maxAmount
    for (const cfg of accrualConfigs) {
      const arr = details[cfg.id] || [];
      const total = arr.reduce((sum: number, cur: any) => sum + (cur.amount || 0), 0);
      if (Math.abs(total - (cfg.maxAmount || 0)) > 0.01) {
        message.error(`${cfg.name}分配总额必须等于计提配置金额`);
        return;
      }
    }
    // 组装明细
    const allDetails = Object.values(details).flat();
    setLoading(true);
    try {
      await saveAccrualDetailV2(projectDetail.id, allDetails);
      message.success('保存成功');
      onSuccess();
    } catch (e) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染分配明细表格
  const renderDetailTable = (cfg: any) => {
    const arr = details[cfg.id] || [];
    let options: any[] = [];
    if (cfg.type === 'department') options = dynamicDepartments;
    if (cfg.type === 'project_individual' || cfg.type === 'project_team') options = dynamicEmployees;
    // 汇总
    const totalAmount = arr.reduce((sum: number, cur: any) => sum + (cur.amount || 0), 0);
    const grossProfit = projectDetail?.closure?.grossProfit || projectDetail?.grossProfit || 0;
    const totalProfitRatio = grossProfit > 0 ? Number(((totalAmount / grossProfit) * 100).toFixed(2)) : 0;
    const totalWeight = arr.reduce((sum: number, cur: any) => sum + (cur.weight || 0), 0);
    let weightColor = '#faad14', weightIcon = null, weightTip = '';
    if (totalWeight > 100) {
      weightColor = '#cf1322'; weightIcon = <span style={{fontWeight:700,marginRight:4}}>!</span>; weightTip = '（超出100%）';
    } else if (totalWeight === 100) {
      weightColor = '#3f8600'; weightIcon = <span style={{fontWeight:700,marginRight:4}}>✔</span>; weightTip = '（已满额）';
    } else {
      weightColor = '#faad14'; weightIcon = <span style={{fontWeight:700,marginRight:4}}>!</span>; weightTip = '（未满额）';
    }
    return (
      <>
        <Table
          columns={[
            { title: '对象', dataIndex: 'targetId', width: 160, render: (v, r, i) => (
              <Select
                value={r.targetId}
                style={{ width: 140 }}
                onChange={val => {
                  const name = options.find(opt => opt.id === val)?.name || val;
                  setDetails(prev => {
                    const arr = [...(prev[cfg.id] || [])];
                    arr[i].targetId = val;
                    arr[i].targetName = name;
                    if (cfg.type === 'project_individual' || cfg.type === 'project_team') {
                      arr[i].departmentName = employeeDeptMap[val]?.name || '';
                    }
                    return { ...prev, [cfg.id]: arr };
                  });
                }}
                showSearch
                optionFilterProp="children"
              >
                {options.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>)}
              </Select>
            ) },
            { title: '权重(%)', dataIndex: 'weight', width: 100, render: (v, r, i) => (
              <InputNumber min={0} max={100} value={v} onChange={val => updateDetail(cfg.id, i, 'weight', val || 0)} />
            ) },
            { title: '分配金额', dataIndex: 'amount', width: 120, render: (v) => `¥${v}` },
            { title: '毛利润占比', dataIndex: 'profitRatio', width: 120, render: (v) => `${v}%` },
            ...(cfg.type === 'project_individual' || cfg.type === 'project_team' ? [{ title: '部门', dataIndex: 'departmentName', width: 120 }] : []),
            { title: '操作', dataIndex: 'action', width: 80, render: (_, __, i) => (
              <Popconfirm title="确定删除？" onConfirm={() => removeDetail(cfg.id, i)}><Button size="small" danger>删除</Button></Popconfirm>
            ) },
          ]}
          dataSource={arr}
          rowKey={(_, i) => String(i)}
          pagination={false}
          size="small"
          footer={() => (
            <>
              <div style={{ fontWeight: 500, color: '#3f8600', marginBottom: 8 }}>
                汇总：分配金额总数 <span style={{ color: '#1890ff' }}>¥{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                ，毛利润总数占比 <span style={{ color: '#faad14' }}>{totalProfitRatio}%</span>
                ，当前分配项权重之和 <span style={{ color: weightColor, fontWeight: 700, fontSize: 16 }}>{weightIcon}{totalWeight}%{weightTip}</span>
              </div>
              <Button size="small" onClick={() => addDetail(cfg.id, cfg.type)}>添加{TYPE_LABELS[cfg.type] || ''}对象</Button>
              <Button size="small" style={{ marginLeft: 8 }} onClick={() => averageWeight(cfg.id)}>平均分配</Button>
            </>
          )}
        />
      </>
    );
  };

  return (
    <Modal
      title="项目提成V2分配"
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={loading}
      width={1100}
      destroyOnClose
    >
      {projectDetail && (
        <>
          {/* 项目信息 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}><Statistic title="项目名称" value={projectDetail.name} /></Col>
              <Col span={6}><Statistic title="实际金额" value={projectAmountInfo.actualAmount} prefix="¥" /></Col>
              <Col span={6}><Statistic title="毛利润" value={projectAmountInfo.grossProfit} prefix="¥" /></Col>
              <Col span={6}><Statistic title="毛利润率" value={projectAmountInfo.grossProfitRate} suffix="%" /></Col>
            </Row>
          </Card>
          <Divider>项目分配配置方案</Divider>
          <Table
            columns={[
              { title: '分配类型', dataIndex: 'type', width: 120, render: (v: string) => TYPE_LABELS[v] || v },
              { title: '名称', dataIndex: 'name', width: 180 },
              { title: '分配上限', dataIndex: 'maxAmount', width: 140, render: (v: number) => v !== undefined ? `¥${v}` : '-' },
              { title: '毛利润占比', dataIndex: 'maxRatio', width: 120, render: (v: number) => v !== undefined ? `${v}%` : '-' },
            ]}
            dataSource={accrualConfigs}
            rowKey={r => r.id}
            pagination={false}
            size="small"
          />
          <Divider>具体分配方案</Divider>
          {accrualConfigs.map(cfg => (
            <Card key={cfg.id} size="small" style={{ marginBottom: 16 }} title={TYPE_LABELS[cfg.type] || cfg.type}>
              {renderDetailTable(cfg)}
            </Card>
          ))}
        </>
      )}
    </Modal>
  );
};

export default ProjectProfitDistributionV2Modal; 