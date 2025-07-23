import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Descriptions, Table, Card, Divider, Spin, Tag, Statistic, Row, Col, Button } from 'antd';
import { request } from '@/utils/request';
import { UserOutlined, DollarOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
// @ts-ignore
// eslint-disable-next-line
declare module 'file-saver';

interface ProjectDetailV2ModalProps {
  visible: boolean;
  projectId: string | null;
  onCancel: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  group: '集团分配',
  department: '部门分配',
  project_individual: '项目个人分配',
  project_team: '项目团队分配',
};

const ProjectDetailV2Modal: React.FC<ProjectDetailV2ModalProps> = ({ visible, projectId, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [employeeMap, setEmployeeMap] = useState<Record<string, any>>({});
  const [departmentMap, setDepartmentMap] = useState<Record<string, any>>({});

  // 批量查员工/部门
  useEffect(() => {
    if (visible && projectId) {
      setLoading(true);
      request(`/api-project/api/v2/project/${projectId}/accrual-detail/v2`).then(async res => {
        const d = res?.datas || {};
        setData(d);
        // 收集所有员工ID和部门ID
        const empIds = new Set<string>();
        const deptIds = new Set<string>();
        // 参与人
        (d.participants || []).forEach((p: any) => {
          if (p.participantId) empIds.add(String(p.participantId));
          if (p.departmentId) deptIds.add(String(p.departmentId));
        });
        // 负责人
        if (d.project?.leaderId) empIds.add(String(d.project.leaderId));
        // 分配明细
        (d.accrualDetails || []).forEach((item: any) => {
          if (item.type === 'department' && item.targetId) deptIds.add(String(item.targetId));
          if ((item.type === 'project_individual' || item.type === 'project_team') && item.targetId) empIds.add(String(item.targetId));
        });
        // 分配规则
        (d.accrualConfigs || []).forEach((cfg: any) => {
          if (cfg.type === 'department' && cfg.targetId) deptIds.add(String(cfg.targetId));
        });
        // 批量查员工
        let empMap: Record<string, any> = {};
        if (empIds.size > 0) {
          const empRes = await request('/api-portal/api/organization/employee/batch-detail', { method: 'POST', data: Array.from(empIds) });
          const list = empRes?.datas || empRes?.data || [];
          list.forEach((emp: any) => { empMap[emp.id] = emp; });
        }
        setEmployeeMap(empMap);
        // 批量查部门
        let deptMap: Record<string, any> = {};
        if (deptIds.size > 0) {
          const deptRes = await request('/api-portal/api/organization/departments/batch-main-departments', { method: 'POST', data: Array.from(deptIds) });
          const list = deptRes?.datas?.departments || deptRes?.datas || [];
          list.forEach((dep: any) => { deptMap[dep.id] = dep; });
        }
        setDepartmentMap(deptMap);
      }).finally(() => setLoading(false));
    }
    if (!visible) setData({});
  }, [visible, projectId]);

  const project = data.project || {};
  const participants = useMemo(() => (data.participants || []).map((p: any) => ({
    ...p,
    participantName: employeeMap[p.participantId]?.name || p.participantName || p.participantId,
    departmentName: departmentMap[p.departmentId]?.name || p.departmentName || p.departmentId,
    participantPhone: employeeMap[p.participantId]?.mobile || p.participantPhone,
    participantEmail: employeeMap[p.participantId]?.email || p.participantEmail,
  })), [data.participants, employeeMap, departmentMap]);
  const closure = data.closure || {};
  const accrualConfigs = data.accrualConfigs || [];
  // configId->中文名映射
  const configId2Label = useMemo(() => {
    const map: Record<string, string> = {};
    (accrualConfigs as any[]).forEach((cfg: any) => { map[cfg.id] = TYPE_LABELS[cfg.type] || cfg.type; });
    return map;
  }, [accrualConfigs]);
  // 明细映射
  const accrualDetails = useMemo(() => (data.accrualDetails || []).map((item: any) => {
    let targetName = item.targetName;
    if (item.type === 'department') targetName = departmentMap[item.targetId]?.name || item.targetName || item.targetId;
    if (item.type === 'project_individual' || item.type === 'project_team') targetName = employeeMap[item.targetId]?.name || item.targetName || item.targetId;
    return {
      ...item,
      typeLabel: configId2Label[item.configId] || TYPE_LABELS[item.type] || item.type,
      targetName,
    };
  }), [data.accrualDetails, employeeMap, departmentMap, configId2Label]);

  // exceljs美观导出Excel
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('项目明细', {
      properties: { defaultColWidth: 18 }
    });

    // 分块样式
    const blockTitleStyle = {
      font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } }
    };
    const headerStyle = {
      font: { bold: true, color: { argb: '1F4E78' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } },
      border: {
        top: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        right: { style: 'thin', color: { argb: 'FFAAAAAA' } }
      }
    };
    const cellStyle = {
      font: { color: { argb: 'FF333333' } },
      alignment: { vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        right: { style: 'thin', color: { argb: 'FFAAAAAA' } }
      }
    };

    let rowIdx = 1;

    // 分块工具函数
    const addBlock = (title: string, header: string[], rows: any[][]) => {
      // 空行
      if (rowIdx > 1) rowIdx += 2;
      // 标题
      sheet.mergeCells(rowIdx, 1, rowIdx, 7);
      const titleCell = sheet.getCell(rowIdx, 1);
      titleCell.value = title;
      Object.assign(titleCell, { style: blockTitleStyle });
      rowIdx++;
      // 表头
      header.forEach((h, i) => {
        const cell = sheet.getCell(rowIdx, i + 1);
        cell.value = h;
        Object.assign(cell, { style: headerStyle });
      });
      rowIdx++;
      // 内容
      rows.forEach(row => {
        row.forEach((v, i) => {
          const cell = sheet.getCell(rowIdx, i + 1);
          cell.value = v;
          Object.assign(cell, { style: cellStyle });
        });
        rowIdx++;
      });
    };

    // 基本信息
    sheet.mergeCells(rowIdx, 1, rowIdx, 7);
    const baseTitleCell = sheet.getCell(rowIdx, 1);
    baseTitleCell.value = '【基本信息】';
    Object.assign(baseTitleCell, { style: blockTitleStyle });
    rowIdx++;
    [
      ['项目名称', project.name, '项目类别', project.category],
      ['项目负责人', employeeMap[project.leaderId]?.name || project.leaderName || project.leaderId, '客户名称', project.customerName],
      ['客户联系人', project.customerContact, '立项时间', project.startTime],
      ['项目状态', project.status, '审批状态', project.finalStatus],
      ['计提状态', project.profitDistributionStatus, '创建时间', project.createdAt],
      ['更新时间', project.updatedAt, '', ''],
    ].forEach(row => {
      row.forEach((v, i) => {
        const cell = sheet.getCell(rowIdx, i + 1);
        cell.value = v;
        Object.assign(cell, { style: cellStyle });
      });
      rowIdx++;
    });

    // 参与人
    addBlock('【项目参与人】', ['姓名', '角色', '部门', '电话', '邮箱'],
      participants.map((p: any) => [p.participantName, p.role, p.departmentName, p.participantPhone, p.participantEmail])
    );

    // 结项信息
    addBlock('【项目结项信息】', ['合同金额', '实际金额', '毛利润', '毛利率', '结项时间', '审批状态', '备注'],
      [[closure.contractAmount || 0, closure.actualAmount || 0, closure.grossProfit || 0, closure.grossProfitRate || 0, closure.closureTime, closure.finalStatus, closure.remarks]]
    );

    // 分配规则
    addBlock('【项目提成分配规则】', ['类型', '名称', '分配上限', '毛利润占比'],
      accrualConfigs.map((cfg: any) => [TYPE_LABELS[cfg.type] || cfg.type, cfg.name, cfg.maxAmount, cfg.maxRatio])
    );

    // 分配明细
    addBlock('【项目提成分配明细】', ['类型', '对象', '分配金额', '当前分配占比', '总毛利润占比'],
      accrualDetails.map((item: any) => [item.typeLabel, item.targetName, item.amount, item.ratio, item.totalRatio])
    );

    // 设置列宽
    [1,2,3,4,5,6,7].forEach(i => {
      sheet.getColumn(i).width = 18;
    });

    // 导出
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${project.name || '项目'}_明细.xlsx`);
  };

  return (
    <Modal
      title={<span>项目V2详情 <Button onClick={handleExportExcel} type="primary" size="small" style={{ float: 'right' }}>导出Excel</Button></span>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
            <Descriptions.Item label="项目类别">{project.category}</Descriptions.Item>
            <Descriptions.Item label="项目负责人">{employeeMap[project.leaderId]?.name || project.leaderName || project.leaderId}</Descriptions.Item>
            <Descriptions.Item label="客户名称">{project.customerName}</Descriptions.Item>
            <Descriptions.Item label="客户联系人">{project.customerContact}</Descriptions.Item>
            <Descriptions.Item label="立项时间">{project.startTime}</Descriptions.Item>
            <Descriptions.Item label="项目状态">{project.status}</Descriptions.Item>
            <Descriptions.Item label="审批状态">{project.finalStatus}</Descriptions.Item>
            <Descriptions.Item label="计提状态">{project.profitDistributionStatus}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{project.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{project.updatedAt}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="项目参与人" size="small" style={{ marginBottom: 16 }}>
          <Table
            columns={[
              { title: '姓名', dataIndex: 'participantName' },
              { title: '角色', dataIndex: 'role' },
              { title: '部门', dataIndex: 'departmentName' },
              { title: '电话', dataIndex: 'participantPhone' },
              { title: '邮箱', dataIndex: 'participantEmail' },
            ]}
            dataSource={participants}
            rowKey={r => r.id || r.participantId}
            size="small"
            pagination={false}
          />
        </Card>
        <Card title="项目结项信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}><Statistic title="合同金额" value={closure.contractAmount || 0} prefix={<DollarOutlined />} precision={2} suffix="元" /></Col>
            <Col span={6}><Statistic title="实际金额" value={closure.actualAmount || 0} prefix={<DollarOutlined />} precision={2} suffix="元" /></Col>
            <Col span={6}><Statistic title="毛利润" value={closure.grossProfit || 0} prefix={<DollarOutlined />} precision={2} suffix="元" /></Col>
            <Col span={6}><Statistic title="毛利率" value={closure.grossProfitRate || 0} precision={2} suffix="%" /></Col>
          </Row>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="结项时间">{closure.closureTime}</Descriptions.Item>
            <Descriptions.Item label="审批状态">{closure.finalStatus}</Descriptions.Item>
            <Descriptions.Item label="备注">{closure.remarks}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Divider>项目提成分配规则</Divider>
        <Table
          columns={[
            { title: '类型', dataIndex: 'type', render: (v: string) => TYPE_LABELS[v] || v },
            { title: '名称', dataIndex: 'name' },
            { title: '分配上限', dataIndex: 'maxAmount' },
            { title: '毛利润占比', dataIndex: 'maxRatio' },
          ]}
          dataSource={accrualConfigs}
          rowKey={r => r.id}
          size="small"
          pagination={false}
        />
        <Divider>项目提成分配明细</Divider>
        <Table
          columns={[
            { title: '类型', dataIndex: 'typeLabel' },
            { title: '对象', dataIndex: 'targetName' },
            { title: '分配金额', dataIndex: 'amount' },
            { title: '当前分配占比', dataIndex: 'ratio' },
            { title: '总毛利润占比', dataIndex: 'totalRatio' },
          ]}
          dataSource={accrualDetails}
          rowKey={r => r.id}
          size="small"
          pagination={false}
        />
      </Spin>
    </Modal>
  );
};

export default ProjectDetailV2Modal; 