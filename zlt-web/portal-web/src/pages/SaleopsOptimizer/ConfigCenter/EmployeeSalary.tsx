import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Tooltip, Space, Modal, Form, Input, DatePicker, Switch, message, TreeSelect, Select, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';
import { getApiUrl } from '@/config/api';
import dayjs from 'dayjs';

const EmployeeSalary: React.FC<{ active: boolean }> = ({ active }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [departmentTree, setDepartmentTree] = useState<any[]>([]);
  const [jobLevelList, setJobLevelList] = useState<any[]>([]);
  const [regionList, setRegionList] = useState<any[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  // 搜索条件
  const [searchParams, setSearchParams] = useState({
    employeeName: '',
    employeeNo: '',
    departmentId: null,
    positionId: null,
    salaryStatus: '',
  });

  const loadData = async (page = 1, pageSize = 10, searchConditions = {}) => {
    setLoading(true);
    try {
      const params = {
        pageNum: page,
        pageSize,
        ...searchConditions,
      };
      const res = await request(getApiUrl('/api/soo/employee-salary/page', 'SOO'), { params });
      if (res && res.resp_code === 0) {
        setData(res.datas?.data || []);
        setPagination({ 
          current: page, 
          pageSize, 
          total: res.datas?.count || 0 
        });
      } else {
        message.error(res?.resp_msg || '获取数据失败');
      }
    } catch (e: any) {
      message.error(e.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentTree = async () => {
    try {
      const res = await request(getApiUrl('/api/soo/employee-salary/departments', 'SOO'));
      if (res && res.resp_code === 0) {
        setDepartmentTree(res.datas || []);
      }
    } catch (e) {
      console.error('加载部门树失败:', e);
    }
  };

  const loadJobLevelList = async () => {
    try {
      const res = await request(getApiUrl('/api/soo/employee-salary/job-levels', 'SOO'));
      if (res && res.resp_code === 0) {
        setJobLevelList(res.datas || []);
      }
    } catch (e) {
      console.error('加载职级列表失败:', e);
    }
  };

  const loadRegionList = async () => {
    try {
      const res = await request(getApiUrl('/api/soo/employee-salary/regions', 'SOO'));
      if (res && res.resp_code === 0) {
        setRegionList(res.datas || []);
      }
    } catch (e) {
      console.error('加载地区列表失败:', e);
    }
  };

  useEffect(() => {
    if (active) {
      loadData();
      loadDepartmentTree();
      loadJobLevelList();
      loadRegionList();
    }
  }, [active]);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchParams(values);
    loadData(1, pagination.pageSize, values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      employeeName: '',
      employeeNo: '',
      departmentId: null,
      positionId: null,
      salaryStatus: '',
    });
    loadData(1, pagination.pageSize, {});
  };

  const handleAdd = () => {
    // 新增薪酬配置应该从员工列表中选择未配置的员工
    // 这里暂时禁用，因为应该通过员工列表的"配置"按钮来操作
    message.warning('请从员工列表中选择未配置薪酬的员工进行配置');
  };

  const handleEdit = (record: any) => {
    setEditing(record);
    setModalOpen(true);
    form.resetFields(); // 先重置表单
    setTimeout(() => {
      const salaryConfig = record.salaryConfig || {};
      form.setFieldsValue({
        employeeId: record.employeeId,
        baseSalary: salaryConfig.baseSalary,
        region: salaryConfig.region,
        isSalesIncentive: salaryConfig.isSalesIncentive === 1,
        isTeamIncentive: salaryConfig.isTeamIncentive === 1,
        isDepartmentBonus: salaryConfig.isDepartmentBonus === 1,
        salesIncentiveRatio: salaryConfig.salesIncentiveRatio,
        teamIncentiveRatio: salaryConfig.teamIncentiveRatio,
        remark: salaryConfig.remark,
      });
    }, 100); // 增加延迟确保表单完全重置
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        employeeId: values.employeeId,
        baseSalary: parseFloat(values.baseSalary),
        region: values.region,
        isSalesIncentive: values.isSalesIncentive === true ? 1 : 0,
        isTeamIncentive: values.isTeamIncentive === true ? 1 : 0,
        isDepartmentBonus: values.isDepartmentBonus === true ? 1 : 0,
        salesIncentiveRatio: values.salesIncentiveRatio || 0,
        teamIncentiveRatio: values.teamIncentiveRatio || 0,
        effectiveDate: new Date().toISOString().split('T')[0], // 默认当前日期
        remark: values.remark,
      };

      let res;
      if (editing && editing.salaryConfig?.id) {
        res = await request(getApiUrl(`/api/soo/employee-salary/${editing.salaryConfig.id}`, 'SOO'), { 
          method: 'PUT', 
          data: submitData 
        });
      } else {
        res = await request(getApiUrl('/api/soo/employee-salary', 'SOO'), { 
          method: 'POST', 
          data: submitData 
        });
      }

      if (res && res.resp_code === 0) {
        message.success('保存成功');
        setModalOpen(false);
        setEditing(null);
        loadData(pagination.current, pagination.pageSize, searchParams);
      } else {
        message.error(res?.resp_msg || '保存失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '保存失败');
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (record: any) => {
    if (!record.salaryConfig?.id) {
      message.warning('该员工暂无薪酬配置');
      return;
    }

    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该员工的薪酬配置吗？',
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request(getApiUrl(`/api/soo/employee-salary/${record.salaryConfig.id}`, 'SOO'), { 
            method: 'DELETE' 
          });
          if (res && res.resp_code === 0) {
            message.success('删除成功');
            loadData(pagination.current, pagination.pageSize, searchParams);
          } else {
            message.error(res?.resp_msg || '删除失败');
          }
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  const handleViewHistory = async (record: any) => {
    try {
      const res = await request(getApiUrl(`/api/soo/employee-salary/history/${record.employeeId}`, 'SOO'));
      if (res && res.resp_code === 0) {
        setHistoryData(res.datas || []);
        setHistoryModalOpen(true);
      } else {
        message.error(res?.resp_msg || '获取历史记录失败');
      }
    } catch (e: any) {
      message.error(e.message || '获取历史记录失败');
    }
  };

  const columns = [
    {
      title: '员工信息',
      key: 'employee',
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.employeeName}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.employeeNo} | {record.mobile}
          </div>
        </div>
      ),
    },
    {
      title: '部门/岗位',
      key: 'department',
      render: (record: any) => (
        <div>
          <div>{record.departmentName}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.positionName}</div>
        </div>
      ),
    },
         {
       title: '基础工资下限',
       key: 'baseSalaryMin',
       render: (record: any) => {
         const jobLevel = record.jobLevelInfo;
         return jobLevel?.baseSalaryMin ? `¥${jobLevel.baseSalaryMin}` : <Tag color="orange">未配置</Tag>;
       },
     },
     {
       title: '基础工资上限',
       key: 'baseSalaryMax',
       render: (record: any) => {
         const jobLevel = record.jobLevelInfo;
         return jobLevel?.baseSalaryMax ? `¥${jobLevel.baseSalaryMax}` : <Tag color="orange">未配置</Tag>;
       },
     },
     {
       title: '绩效比例下限',
       key: 'performanceRatioMin',
       render: (record: any) => {
         const jobLevel = record.jobLevelInfo;
         return jobLevel?.performanceRatioMin ? `${(jobLevel.performanceRatioMin * 100).toFixed(2)}%` : <Tag color="orange">未配置</Tag>;
       },
     },
     {
       title: '绩效比例上限',
       key: 'performanceRatioMax',
       render: (record: any) => {
         const jobLevel = record.jobLevelInfo;
         return jobLevel?.performanceRatioMax ? `${(jobLevel.performanceRatioMax * 100).toFixed(2)}%` : <Tag color="orange">未配置</Tag>;
       },
     },
    {
      title: '基础工资',
      key: 'baseSalary',
      render: (record: any) => {
        const salaryConfig = record.salaryConfig;
        if (!salaryConfig) return <Tag color="orange">未配置</Tag>;
        
        const isInRange = salaryConfig.isInRange;
        return (
          <div>
            <span style={{ color: isInRange ? '#000' : '#ff4d4f' }}>
              ¥{salaryConfig.baseSalary}
            </span>
            {!isInRange && (
              <div style={{ fontSize: '12px', color: '#ff4d4f' }}>超出范围</div>
            )}
          </div>
        );
      },
    },
    {
      title: '地区',
      key: 'region',
      render: (record: any) => {
        const salaryConfig = record.salaryConfig;
        return salaryConfig ? salaryConfig.regionName || salaryConfig.region : '-';
      },
    },
    {
      title: '提成配置',
      key: 'incentive',
      render: (record: any) => {
        const salaryConfig = record.salaryConfig;
        if (!salaryConfig) return '-';
        
        const configs = [];
        
        if (salaryConfig.isSalesIncentive) {
          configs.push({
            name: '销售',
            ratio: `${salaryConfig.salesIncentiveRatio || 0}%`
          });
        }
        if (salaryConfig.isTeamIncentive) {
          configs.push({
            name: '团队',
            ratio: `${salaryConfig.teamIncentiveRatio || 0}%`
          });
        }
        if (salaryConfig.isDepartmentBonus) {
          configs.push({
            name: '部门分红',
            ratio: '-'
          });
        }
        
        if (configs.length === 0) return '无';
        
        return (
          <div style={{ display: 'flex', gap: '12px' }}>
            {configs.map((config, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  {config.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {config.ratio}
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: '生效日期',
      key: 'effectiveDate',
      render: (record: any) => {
        const salaryConfig = record.salaryConfig;
        return salaryConfig?.effectiveDate || '-';
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (record: any) => {
        const salaryConfig = record.salaryConfig;
        if (!salaryConfig) return <Tag color="orange">未配置</Tag>;
        
        return salaryConfig.status === 1 ? (
          <Tag color="green">启用</Tag>
        ) : (
          <Tag color="red">禁用</Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <Space size={8}>
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            {record.salaryConfig ? '编辑' : '配置'}
          </Button>
          {record.salaryConfig && (
            <Button 
              size="small" 
              icon={<DeleteOutlined />} 
              danger 
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          )}
          <Button 
            size="small" 
            icon={<HistoryOutlined />} 
            onClick={() => handleViewHistory(record)}
          >
            历史
          </Button>
        </Space>
      ),
    },
  ];

  const renderSearchForm = () => (
    <Card style={{ marginBottom: 16 }}>
      <Form form={searchForm} layout="inline">
        <Form.Item name="employeeName" label="员工姓名">
          <Input placeholder="请输入员工姓名" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="employeeNo" label="员工编号">
          <Input placeholder="请输入员工编号" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="departmentId" label="部门">
          <TreeSelect
            style={{ width: 150 }}
            placeholder="请选择部门"
            allowClear
            treeData={departmentTree}
            fieldNames={{ label: 'name', value: 'id', children: 'children' }}
          />
        </Form.Item>

        <Form.Item name="salaryStatus" label="配置状态">
          <Select style={{ width: 120 }} placeholder="请选择状态" allowClear>
            <Select.Option value="CONFIGURED">已配置</Select.Option>
            <Select.Option value="NOT_CONFIGURED">未配置</Select.Option>
            <Select.Option value="OUT_OF_RANGE">超出范围</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  const renderModalForm = () => (
    <Form form={form} layout="vertical">
      <Form.Item name="employeeId" label="员工" style={{ display: 'none' }}>
        <Input />
      </Form.Item>
      
      <Form.Item name="positionId" label="岗位" style={{ display: 'none' }}>
        <Input />
      </Form.Item>
      
      <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
        <div><strong>员工信息：</strong>{editing?.employeeName} ({editing?.employeeNo})</div>
        <div><strong>部门岗位：</strong>{editing?.departmentName} / {editing?.positionName}</div>
        {editing?.jobLevelInfo && (
          <div>
            <strong>职位职级标准：</strong>
            基础工资 ¥{editing.jobLevelInfo.baseSalaryMin}-{editing.jobLevelInfo.baseSalaryMax}，
            绩效比例 {(editing.jobLevelInfo.performanceRatioMin * 100).toFixed(2)}%-{(editing.jobLevelInfo.performanceRatioMax * 100).toFixed(2)}%
          </div>
        )}
      </div>

      <Form.Item name="baseSalary" label="基础工资" rules={[{ required: true, message: '请输入基础工资' }]}>
        <Input 
          type="number" 
          placeholder="请输入基础工资" 
          addonBefore="¥"
          min={0}
        />
      </Form.Item>

      <Form.Item name="region" label="所在地区" rules={[{ required: true, message: '请选择地区' }]}>
        <Select placeholder="请选择地区" allowClear>
          {regionList.map((item: any) => (
            <Select.Option key={item.code} value={item.code}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Divider orientation="left">提成配置</Divider>

      <Form.Item label="参与销售提成" name="isSalesIncentive" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>

      <Form.Item name="salesIncentiveRatio" label="销售提成比例" style={{ marginLeft: 24 }}>
        <Input 
          type="number" 
          placeholder="0.05" 
          addonAfter="%" 
          min={0} 
          max={1}
          step={0.01}
        />
      </Form.Item>

      <Form.Item label="参与团队提成" name="isTeamIncentive" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>

      <Form.Item name="teamIncentiveRatio" label="团队提成比例" style={{ marginLeft: 24 }}>
        <Input 
          type="number" 
          placeholder="0.02" 
          addonAfter="%" 
          min={0} 
          max={1}
          step={0.01}
        />
      </Form.Item>

      <Form.Item label="参与部门分红" name="isDepartmentBonus" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>

      <Divider orientation="left">其他信息</Divider>

      <Form.Item name="remark" label="备注">
        <Input.TextArea rows={3} placeholder="请输入备注信息" />
      </Form.Item>
    </Form>
  );

  const historyColumns = [
    { title: '基础工资', dataIndex: 'baseSalary', key: 'baseSalary' },
    { title: '地区', dataIndex: 'region', key: 'region' },
    { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
    { title: '失效日期', dataIndex: 'expireDate', key: 'expireDate' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      render: (val: number) => val === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> 
    },
  ];

  return (
    <div>
      {renderSearchForm()}
      
      <Card 
        title="员工薪酬配置" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增薪酬配置
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="employeeId"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              loadData(page, pageSize, searchParams);
            },
          }}
        />
      </Card>

      <Modal
        title={editing ? '编辑员工薪酬配置' : '新增员工薪酬配置'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        destroyOnClose
      >
        {renderModalForm()}
      </Modal>

      <Modal
        title="薪酬配置历史"
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={historyColumns}
          dataSource={historyData}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default EmployeeSalary; 