import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Tooltip, Space, Modal, Form, Input, DatePicker, Switch, message, Layout, Tree, Select, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDepartmentTree } from '@/services/organization/department';
import { getWorkPositionsByDepartment } from '@/services/organization/position';
import { request } from '@/utils/request';
import { getApiUrl } from '@/config/api';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;
const { Option } = Select;

// Mock 职级下拉接口（建议后端提供真实接口）
const fetchJobLevels = async () => {
  try {
    const res = await request('/api-portal/api/organization/dict/item/category-code/JOB_LEVEL', {
      method: 'GET',
    });
    if (res && (res.data || res.datas)) {
      const items = res.data || res.datas || [];
      return items.map((item: any) => ({ code: item.itemCode, name: item.itemName }));
    }
    return [];
  } catch {
    return [];
  }
};

const JobLevelSalary: React.FC<{ active: boolean }> = ({ active }) => {
  // 部门树
  const [departmentTree, setDepartmentTree] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);

  // 岗位列表
  const [positions, setPositions] = useState<any[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionsLoaded, setPositionsLoaded] = useState(false);

  // 薪资标准数据
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 职级下拉
  const [jobLevels, setJobLevels] = useState<any[]>([]);

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();

  // 新增
  const [adding, setAdding] = useState(false);
  const [addForm] = Form.useForm();

  // 加载部门树
  const loadDepartmentTree = async () => {
    setTreeLoading(true);
    try {
      const res = await getDepartmentTree();
      const tree = res.data || res.datas || [];
      setDepartmentTree(tree);
      if (tree.length > 0 && !selectedDeptId) {
        setSelectedDeptId(tree[0].id?.toString() || null);
      }
    } catch (e) {
      setDepartmentTree([]);
    } finally {
      setTreeLoading(false);
    }
  };

  // 加载岗位列表
  const loadPositions = async (deptId: string) => {
    setPositionsLoading(true);
    try {
      const res = await getWorkPositionsByDepartment(deptId);
      setPositions(res.data || res.datas || []);
    } catch (e) {
      setPositions([]);
    } finally {
      setPositionsLoading(false);
    }
  };

  // 加载职级下拉
  const loadJobLevels = async () => {
    const levels = await fetchJobLevels();
    setJobLevels(levels);
  };

  // 加载薪资标准数据
  const loadSalaryData = async (page = 1, pageSize = 10) => {
    if (!selectedDeptId) return;
    setSalaryLoading(true);
    try {
      const res = await request(getApiUrl('/api/soo/job-level-salary/page', 'SOO'), {
        params: { pageNum: page, pageSize, departmentId: selectedDeptId },
      });
      if (res && res.resp_code === 0) {
        setSalaryData(res.datas.records || []);
        setPagination({ current: page, pageSize, total: res.datas.total || 0 });
      } else {
        message.error(res?.resp_msg || '获取数据失败');
      }
    } catch (e: any) {
      message.error(e.message || '获取数据失败');
    } finally {
      setSalaryLoading(false);
    }
  };

  // 监听Tab激活、部门切换
  useEffect(() => {
    if (active) {
      loadDepartmentTree();
      loadJobLevels();
    }
  }, [active]);
  useEffect(() => {
    if (selectedDeptId) {
      setPositionsLoading(true);
      setPositionsLoaded(false);
      getWorkPositionsByDepartment(selectedDeptId).then(res => {
        setPositions(res.data || res.datas || []);
        setPositionsLoaded(true);
      }).finally(() => {
        setPositionsLoading(false);
      });
    }
    // eslint-disable-next-line
  }, [selectedDeptId]);

  useEffect(() => {
    if (positionsLoaded) {
      loadSalaryData(1, pagination.pageSize);
    }
    // eslint-disable-next-line
  }, [positionsLoaded]);

  // 部门树选择
  const handleDeptSelect = (selectedKeys: any) => {
    setSelectedDeptId(selectedKeys[0]);
  };

  // 新增
  const handleAdd = () => {
    loadJobLevels();
    setAdding(true);
    addForm.resetFields();
  };
  // 编辑
  const handleEdit = (record: any) => {
    setEditing(record);
    setModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      });
    }, 0);
  };
  // 保存
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        departmentId: selectedDeptId,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
        status: values.status ? 1 : 0,
      };
      let res;
      if (editing) {
        res = await request(getApiUrl(`/api/soo/job-level-salary/${editing.id}`, 'SOO'), { method: 'PUT', data: submitData });
      } else {
        res = await request(getApiUrl('/api/soo/job-level-salary', 'SOO'), { method: 'POST', data: submitData });
      }
      if (res && res.resp_code === 0) {
        message.success('保存成功');
        setModalOpen(false);
        setEditing(null);
        loadSalaryData(pagination.current, pagination.pageSize);
      } else {
        message.error(res?.resp_msg || '保存失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '保存失败');
    }
  };
  // 取消
  const handleModalCancel = () => {
    setModalOpen(false);
    setEditing(null);
  };
  // 删除
  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该条数据吗？',
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request(getApiUrl(`/api/soo/job-level-salary/${record.id}`, 'SOO'), { method: 'DELETE' });
          if (res && res.resp_code === 0) {
            message.success('删除成功');
            loadSalaryData(pagination.current, pagination.pageSize);
          } else {
            message.error(res?.resp_msg || '删除失败');
          }
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  // 新增保存
  const handleAddSave = async () => {
    try {
      const values = await addForm.validateFields();
      const submitData = {
        ...values,
        departmentId: selectedDeptId,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
        status: values.status ? 1 : 0,
      };
      const res = await request(getApiUrl('/api/soo/job-level-salary', 'SOO'), { method: 'POST', data: submitData });
      if (res && res.resp_code === 0) {
        message.success('保存成功');
        setAdding(false);
        loadSalaryData(1, pagination.pageSize);
      } else {
        message.error(res?.resp_msg || '保存失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '保存失败');
    }
  };
  const handleAddCancel = () => {
    setAdding(false);
  };

  // 表格列
  const columns = [
    {
      title: '部门', dataIndex: 'departmentId', key: 'departmentId',
      render: (_val: any, record: any) => {
        if (record.isAdd) {
          // 新增行编辑框
          return null;
        }
        const pos = positions.find((p: any) => String(p.id) === String(record.positionId));
        return pos ? pos.departmentName || '-' : '-';
      }
    },
    {
      title: '岗位', dataIndex: 'positionId', key: 'positionId',
      render: (val: any, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="positionId" rules={[{ required: true, message: '请选择岗位' }]} style={{ margin: 0 }}>
              <Select placeholder="岗位" style={{ minWidth: 120 }}>
                {positions.map((p: any) => (
                  <Option key={p.id} value={p.id}>{p.name}</Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        const pos = positions.find((p: any) => String(p.id) === String(val));
        return pos ? pos.name : '-';
      }
    },
    {
      title: '职级', dataIndex: 'jobLevelCode', key: 'jobLevelCode',
      render: (val: any, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="jobLevelCode" rules={[{ required: true, message: '请选择职级' }]} style={{ margin: 0 }}>
              <Select placeholder="职级" style={{ minWidth: 100 }}>
                {jobLevels.map((j: any) => (
                  <Option key={j.code} value={j.code}>{j.name}</Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return jobLevels.find((j: any) => j.code === val)?.name || '-';
      }
    },
    {
      title: '基础工资下限', dataIndex: 'baseSalaryMin', key: 'baseSalaryMin',
      render: (val: any, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="baseSalaryMin" rules={[{ required: true, message: '请输入下限' }]} style={{ margin: 0 }}>
              <Input type="number" min={0} style={{ minWidth: 80 }} />
            </Form.Item>
          );
        }
        return val;
      }
    },
    {
      title: '基础工资上限', dataIndex: 'baseSalaryMax', key: 'baseSalaryMax',
      render: (val: any, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="baseSalaryMax" rules={[{ required: true, message: '请输入上限' }]} style={{ margin: 0 }}>
              <Input type="number" min={0} style={{ minWidth: 80 }} />
            </Form.Item>
          );
        }
        return val;
      }
    },
    {
      title: '绩效比例下限', dataIndex: 'performanceRatioMin', key: 'performanceRatioMin',
      render: (val: any, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="performanceRatioMin" rules={[{ required: true, message: '请输入下限' }]} style={{ margin: 0 }}>
              <Input type="number" min={0} max={2} step={0.01} style={{ minWidth: 80 }} />
            </Form.Item>
          );
        }
        return val;
      }
    },
    {
      title: '绩效比例上限', dataIndex: 'performanceRatioMax', key: 'performanceRatioMax',
      render: (val: any, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="performanceRatioMax" rules={[{ required: true, message: '请输入上限' }]} style={{ margin: 0 }}>
              <Input type="number" min={0} max={2} step={0.01} style={{ minWidth: 80 }} />
            </Form.Item>
          );
        }
        return val;
      }
    },
    {
      title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate',
      render: (val: any, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="effectiveDate" rules={[{ required: true, message: '请选择生效日期' }]} style={{ margin: 0 }}>
              <DatePicker style={{ minWidth: 120 }} />
            </Form.Item>
          );
        }
        return val;
      }
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (val: any, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="status" valuePropName="checked" style={{ margin: 0 }}>
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          );
        }
        return val === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>;
      }
    },
    {
      title: '备注', dataIndex: 'remark', key: 'remark',
      render: (val: string, record: any) => {
        if (record.isAdd) {
          return (
            <Form.Item name="remark" style={{ margin: 0 }}>
              <Input.TextArea rows={1} maxLength={200} showCount style={{ minWidth: 100 }} />
            </Form.Item>
          );
        }
        return val ? (<Tooltip title={val}><span style={{ cursor: 'pointer', color: '#1890ff' }}>备注</span></Tooltip>) : <span>-</span>;
      }
    },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => {
        if (record.isAdd) {
          return (
            <Space size={8}>
              <Button size="small" type="primary" onClick={handleAddSave}>保存</Button>
              <Button size="small" onClick={handleAddCancel}>取消</Button>
            </Space>
          );
        }
        return (
          <Space size={8}>
            <Button size="small" icon={<EditOutlined />} style={{ minWidth: 64, height: 32 }} onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Button size="small" icon={<DeleteOutlined />} danger style={{ minWidth: 64, height: 32 }} onClick={() => handleDelete(record)}>
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  // 弹窗表单
  const renderModalForm = () => (
    <Form form={form} layout="vertical">
      <Form.Item name="positionId" label="岗位" rules={[{ required: true, message: '请选择岗位' }]}> 
        <Select placeholder="请选择岗位">
          {positions.map((p: any) => (
            <Option key={p.id} value={p.id}>{p.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="jobLevelCode" label="职级" rules={[{ required: true, message: '请选择职级' }]}> 
        <Select placeholder="请选择职级">
          {jobLevels.map((j: any) => (
            <Option key={j.code} value={j.code}>{j.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="baseSalaryMin" label="基础工资下限" rules={[{ required: true, message: '请输入下限' }]}> <Input type="number" min={0} /> </Form.Item>
      <Form.Item name="baseSalaryMax" label="基础工资上限" rules={[{ required: true, message: '请输入上限' }]}> <Input type="number" min={0} /> </Form.Item>
      <Form.Item name="performanceRatioMin" label="绩效比例下限" rules={[{ required: true, message: '请输入下限' }]}> <Input type="number" min={0} max={2} step={0.01} /> </Form.Item>
      <Form.Item name="performanceRatioMax" label="绩效比例上限" rules={[{ required: true, message: '请输入上限' }]}> <Input type="number" min={0} max={2} step={0.01} /> </Form.Item>
      <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
      <Form.Item name="status" label="状态" valuePropName="checked"> <Switch checkedChildren="启用" unCheckedChildren="禁用" /> </Form.Item>
      <Form.Item name="remark" label="备注"> <Input.TextArea rows={2} maxLength={200} showCount /> </Form.Item>
    </Form>
  );

  return (
    <Layout style={{ background: '#fff', minHeight: 500 }}>
      <Sider width={260} style={{ background: '#f7f8fa', borderRight: '1px solid #eee', padding: '16px 0' }}>
        <Spin spinning={treeLoading}>
          <Tree
            treeData={departmentTree}
            fieldNames={{ title: 'name', key: 'id', children: 'children' }}
            selectedKeys={selectedDeptId ? [selectedDeptId] : []}
            onSelect={handleDeptSelect}
            defaultExpandAll
            style={{ minHeight: 400 }}
          />
        </Spin>
      </Sider>
      <Content style={{ padding: 24 }}>
        <Card
          className="config-card"
          title="职级薪资标准"
          extra={!adding && <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>}
        >
          {positionsLoaded && (
            <Form form={addForm} component={false}>
              <Table
                columns={columns}
                dataSource={adding ? [{ isAdd: true, key: 'add' }, ...salaryData] : salaryData}
                loading={salaryLoading}
                rowKey={record => record.id || record.key}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: (page, pageSize) => loadSalaryData(page, pageSize),
                }}
              />
            </Form>
          )}
          <Modal
            title={editing ? '编辑职级薪资标准' : '新增职级薪资标准'}
            open={modalOpen}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okText="保存"
            cancelText="取消"
            confirmLoading={salaryLoading}
          >
            {renderModalForm()}
          </Modal>
        </Card>
      </Content>
    </Layout>
  );
};

export default JobLevelSalary; 