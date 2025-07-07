import React, { useEffect, useRef, useState } from 'react';
import { Table, Button, Input, Select, Form, Modal, message, DatePicker, Space, Statistic, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getMonthlyPerformancePage, batchSaveMonthlyPerformance } from './services/monthly-performance';
import type { MonthlyPerformance, MonthlyPerformanceQuery, MonthlyPerformancePageResult } from './types/monthly-performance';
import dayjs from 'dayjs';

const { Option } = Select;

const defaultQuery: MonthlyPerformanceQuery = {
  pageNum: 1,
  pageSize: 10,
  month: dayjs().format('YYYY-MM'),
  departmentId: undefined,
  employeeName: '',
};

const MonthlyPerformancePage: React.FC = () => {
  const [query, setQuery] = useState<MonthlyPerformanceQuery>(defaultQuery);
  const [data, setData] = useState<MonthlyPerformance[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editRows, setEditRows] = useState<Record<number, Partial<MonthlyPerformance>>>({});
  const [stats, setStats] = useState({ avgScore: 0, totalRevenue: 0, avgMargin: 0, completeRate: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: MonthlyPerformancePageResult = await getMonthlyPerformancePage(query);
      setData(res.data || []);
      setTotal(res.count || 0);
      // 统计区数据
      if (res.data && res.data.length > 0) {
        const avgScore = res.data.reduce((sum, d) => sum + (d.performanceScore || 0), 0) / res.data.length;
        const totalRevenue = res.data.reduce((sum, d) => sum + (Number(d.personalProjectRevenue || 0) + Number(d.teamProjectRevenue || 0)), 0);
        const avgMargin = res.data.reduce((sum, d) => sum + (Number(d.personalProjectMargin || 0) + Number(d.teamProjectMargin || 0)), 0) / (2 * res.data.length);
        const completeRate = (res.data.filter(d => d.status === 1).length / res.data.length) * 100;
        setStats({ avgScore, totalRevenue, avgMargin, completeRate });
      } else {
        setStats({ avgScore: 0, totalRevenue: 0, avgMargin: 0, completeRate: 0 });
      }
    } catch (e: any) {
      message.error(e?.resp_msg || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [query]);

  const handleSave = async () => {
    const rows = Object.values(editRows).filter(Boolean) as MonthlyPerformance[];
    if (rows.length === 0) {
      message.info('没有需要保存的数据');
      return;
    }
    try {
      await batchSaveMonthlyPerformance(rows);
      message.success('批量保存成功');
      setEditRows({});
      fetchData();
    } catch (e: any) {
      message.error(e?.resp_msg || '保存失败');
    }
  };

  const columns: ColumnsType<MonthlyPerformance> = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      editable: false,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      editable: false,
    },
    {
      title: '绩效得分',
      dataIndex: 'performanceScore',
      render: (text, record) => (
        <Input
          type="number"
          min={0}
          max={100}
          value={editRows[record.id]?.performanceScore ?? record.performanceScore}
          onChange={e => setEditRows(r => ({ ...r, [record.id]: { ...r[record.id], performanceScore: Number(e.target.value) } }))}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '个人项目营业额',
      dataIndex: 'personalProjectRevenue',
      render: (text, record) => (
        <Input
          type="number"
          min={0}
          value={editRows[record.id]?.personalProjectRevenue ?? record.personalProjectRevenue}
          onChange={e => setEditRows(r => ({ ...r, [record.id]: { ...r[record.id], personalProjectRevenue: Number(e.target.value) } }))}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: '团队项目营业额',
      dataIndex: 'teamProjectRevenue',
      render: (text, record) => (
        <Input
          type="number"
          min={0}
          value={editRows[record.id]?.teamProjectRevenue ?? record.teamProjectRevenue}
          onChange={e => setEditRows(r => ({ ...r, [record.id]: { ...r[record.id], teamProjectRevenue: Number(e.target.value) } }))}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: '毛利率',
      dataIndex: 'personalProjectMargin',
      render: (text, record) => (
        <Input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={editRows[record.id]?.personalProjectMargin ?? record.personalProjectMargin}
          onChange={e => setEditRows(r => ({ ...r, [record.id]: { ...r[record.id], personalProjectMargin: Number(e.target.value) } }))}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (text, record) => (record.status === 1 ? <span style={{ color: '#52c41a' }}>已保存</span> : <span style={{ color: '#faad14' }}>待保存</span>),
    },
  ];

  return (
    <div>
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="月份">
          <DatePicker
            picker="month"
            value={query.month ? dayjs(query.month) : undefined}
            onChange={d => setQuery(q => ({ ...q, month: d ? d.format('YYYY-MM') : '' }))}
            allowClear={false}
          />
        </Form.Item>
        <Form.Item label="部门">
          <Select
            style={{ width: 160 }}
            value={query.departmentId}
            onChange={v => setQuery(q => ({ ...q, departmentId: v }))}
            allowClear
          >
            <Option value="">全部</Option>
            <Option value={1}>销售部</Option>
            <Option value={2}>产品研发部</Option>
            <Option value={3}>市场运营部</Option>
          </Select>
        </Form.Item>
        <Form.Item label="员工姓名">
          <Input
            value={query.employeeName}
            onChange={e => setQuery(q => ({ ...q, employeeName: e.target.value }))}
            placeholder="输入员工姓名"
            style={{ width: 160 }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => setQuery({ ...query, pageNum: 1 })}>查询</Button>
        </Form.Item>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: query.pageNum,
          pageSize: query.pageSize,
          total,
          onChange: (page, pageSize) => setQuery(q => ({ ...q, pageNum: page, pageSize })),
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />
      <Space style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleSave}>批量保存</Button>
      </Space>
      <Row gutter={24} style={{ marginTop: 32 }}>
        <Col span={6}><Statistic title="平均绩效得分" value={stats.avgScore.toFixed(2)} /></Col>
        <Col span={6}><Statistic title="总营业额" value={stats.totalRevenue.toFixed(2)} /></Col>
        <Col span={6}><Statistic title="平均毛利率" value={(stats.avgMargin * 100).toFixed(2) + '%'} /></Col>
        <Col span={6}><Statistic title="完成录入率" value={stats.completeRate.toFixed(2) + '%'} /></Col>
      </Row>
    </div>
  );
};

export default MonthlyPerformancePage; 