import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Space, Popconfirm, Checkbox, TreeSelect } from 'antd';
import { getMonthlyPerformanceList, addMonthlyPerformance, updateMonthlyPerformance, deleteMonthlyPerformance, batchSaveMonthlyPerformance, getDepartmentTree, getEmployeesByDepartment, getEmployeePage } from '@/services/soo';
import { MonthlyPerformance } from '@/types/monthlyPerformance';
import dayjs from 'dayjs';

const { Option } = Select;

const defaultPageSize = 10;

// 员工信息接口
interface EmployeeInfo {
  id: string;
  name: string;
  empNo?: string;
  mobile?: string;
  email?: string;
  departmentName?: string;
  departmentId?: string;
}

// 部门信息接口
interface DepartmentInfo {
  id: string;
  name: string;
  children?: DepartmentInfo[];
}

const MonthlyPerformancePage: React.FC = () => {
  const [data, setData] = useState<MonthlyPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: defaultPageSize, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MonthlyPerformance | null>(null);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchList, setBatchList] = useState<MonthlyPerformance[]>([]);

  // 筛选条件
  const [searchMonth, setSearchMonth] = useState<string | undefined>(undefined);
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(undefined);
  const [searchDepartment, setSearchDepartment] = useState<string | undefined>(undefined);
  const [includeSubDept, setIncludeSubDept] = useState<boolean>(false);

  // 部门树形数据
  const [departmentTree, setDepartmentTree] = useState<DepartmentInfo[]>([]);
  
  // 员工列表
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  // 转换部门树形数据为TreeSelect格式
  const transformDepartmentTree = (departments: any[]): any[] => {
    return departments.map(dept => ({
      title: dept.name,
      value: dept.id,
      key: dept.id,
      children: dept.children ? transformDepartmentTree(dept.children) : undefined,
    }));
  };

  // 加载部门树
  const loadDepartmentTree = async () => {
    try {
      console.log('开始加载部门树...');
      const response = await getDepartmentTree();
      console.log('部门树加载响应:', response);
      if (response.success && response.data) {
        setDepartmentTree(response.data);
        console.log('部门树设置成功:', response.data);
      } else {
        console.warn('部门树加载失败:', response.message);
        message.warning('获取部门列表失败：' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('获取部门树失败:', error);
      message.error('获取部门列表失败，请检查网络连接');
    }
  };

  // 加载员工列表
  const loadEmployees = async () => {
    setEmployeeLoading(true);
    try {
      console.log('开始加载员工列表...');
      const response = await getEmployeePage({
        pageNum: 1,
        pageSize: 1000, // 获取所有员工
        status: 1, // 在职员工
      });
      console.log('员工列表加载响应:', response);
      if (response.success && response.data) {
        // 兼容不同的响应结构
        let employeeList = [];
        if (response.data.list) {
          employeeList = response.data.list;
        } else if (response.data.data) {
          employeeList = response.data.data;
        } else if (Array.isArray(response.data)) {
          employeeList = response.data;
        }
        
        console.log('员工原始列表:', employeeList);
        const formattedEmployees = employeeList.map((emp: any) => ({
          id: emp.id?.toString() || emp.id,
          name: emp.name || emp.username || '',
          empNo: emp.empNo || emp.empNumber || '',
          mobile: emp.mobile || emp.phone || '',
          email: emp.email || '',
          departmentName: emp.departmentName || emp.deptName || '',
          departmentId: emp.departmentId?.toString() || emp.deptId?.toString() || '',
        }));
        
        setEmployees(formattedEmployees);
        console.log('员工列表设置成功:', formattedEmployees);
      } else {
        console.warn('员工列表加载失败:', response.message);
        message.warning('获取员工列表失败：' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('获取员工列表失败:', error);
      message.error('获取员工列表失败，请检查网络连接');
    } finally {
      setEmployeeLoading(false);
    }
  };

  // 处理员工选择
  const handleEmployeeChange = (employeeId: string) => {
    console.log('选择员工:', employeeId);
    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    console.log('找到的员工信息:', selectedEmployee);
    if (selectedEmployee) {
      form.setFieldsValue({
        employeeName: selectedEmployee.name,
        departmentId: selectedEmployee.departmentId,
        departmentName: selectedEmployee.departmentName,
      });
      console.log('表单字段已更新');
    }
  };

  const loadData = async (page = 1, pageSize = defaultPageSize) => {
    setLoading(true);
    try {
      console.log('加载绩效数据:', {
        pageNum: page,
        pageSize,
        month: searchMonth,
        employeeName: searchEmployee,
        departmentId: searchDepartment,
        includeSubDept: includeSubDept,
      });
      
      const res = await getMonthlyPerformanceList({
        pageNum: page,
        pageSize,
        month: searchMonth,
        employeeName: searchEmployee,
        departmentId: searchDepartment,
        includeSubDept: includeSubDept,
      });
      
      console.log('绩效数据加载响应:', res);
      if (res && res.success) {
        const list = res.data.list || res.data.data || [];
        setData(list);
        setPagination({ current: page, pageSize, total: res.data.total || 0 });
        console.log('绩效数据设置成功:', list);
      } else {
        message.error(res?.message || '获取数据失败');
      }
    } catch (e: any) {
      console.error('获取绩效数据失败:', e);
      message.error(e.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('组件初始化，加载基础数据...');
    loadDepartmentTree();
    loadEmployees();
  }, []);

  useEffect(() => {
    console.log('筛选条件变化，重新加载数据...');
    loadData();
    // eslint-disable-next-line
  }, [searchMonth, searchEmployee, searchDepartment, includeSubDept]);

  const handleTableChange = (pag: any) => {
    loadData(pag.current, pag.pageSize);
  };

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
    setTimeout(() => form.resetFields(), 0);
  };

  const handleEdit = (record: MonthlyPerformance) => {
    console.log('编辑记录:', record);
    setEditing(record);
    setModalOpen(true);
    setTimeout(() => form.setFieldsValue({
      ...record,
      month: record.month ? dayjs(record.month) : undefined,
      employeeId: record.employeeId?.toString(),
    }), 0);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMonthlyPerformance(String(id));
      message.success('删除成功');
      loadData(pagination.current, pagination.pageSize);
    } catch (e: any) {
      message.error(e.message || '删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单验证成功，原始值:', values);
      
      if (editing) {
        // 编辑模式：使用现有的员工信息，不允许修改员工
        const submitData = {
          ...values,
          employeeId: editing.employeeId,
          employeeName: editing.employeeName,
          departmentId: editing.departmentId,
          departmentName: editing.departmentName,
          month: editing.month, // 编辑时月份不变
        };
        
        console.log('编辑模式提交数据:', submitData);
        await updateMonthlyPerformance(String(editing.id), submitData);
        message.success('更新成功');
      } else {
        // 新增模式：获取选中员工的完整信息
        const selectedEmployee = employees.find(emp => emp.id === values.employeeId);
        if (!selectedEmployee) {
          message.error('请选择有效的员工');
          return;
        }

        console.log('选中的员工信息:', selectedEmployee);

        // 构建提交数据
        const submitData = {
          ...values,
          employeeId: Number(selectedEmployee.id),
          employeeName: selectedEmployee.name,
          departmentId: Number(selectedEmployee.departmentId),
          departmentName: selectedEmployee.departmentName, // 确保包含部门名称
          month: values.month?.format('YYYY-MM'),
        };

        console.log('新增模式提交数据:', submitData);
        await addMonthlyPerformance(submitData);
        message.success('新增成功');
      }
      
      setModalOpen(false);
      loadData(pagination.current, pagination.pageSize);
    } catch (e: any) {
      console.log('提交异常:', e);
      if (e && e.errorFields && e.errorFields.length > 0) {
        e.errorFields.forEach((field: any) => {
          console.log('校验失败字段:', field.name, '错误:', field.errors);
        });
        message.error('请检查所有必填项和输入格式');
      } else if (e && e.message) {
        message.error('操作失败: ' + e.message);
      } else {
        message.error('操作失败');
      }
    }
  };

  // 批量录入
  const handleBatchAdd = () => {
    setBatchList([]);
    setBatchModalOpen(true);
  };
  const handleBatchSave = async () => {
    try {
      await batchSaveMonthlyPerformance(batchList);
      message.success('批量保存成功');
      setBatchModalOpen(false);
      loadData(pagination.current, pagination.pageSize);
    } catch (e: any) {
      message.error(e.message || '批量保存失败');
    }
  };

  const columns = [
    { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
    { title: '员工姓名', dataIndex: 'employeeName', key: 'employeeName', width: 120 },
    { title: '部门名称', dataIndex: 'departmentName', key: 'departmentName', width: 150 },
    { title: '绩效得分', dataIndex: 'performanceScore', key: 'performanceScore', width: 100 },
    { title: '个人项目营业额', dataIndex: 'personalProjectRevenue', key: 'personalProjectRevenue', width: 130 },
    { title: '个人项目毛利率', dataIndex: 'personalProjectMargin', key: 'personalProjectMargin', width: 130 },
    { title: '团队项目营业额', dataIndex: 'teamProjectRevenue', key: 'teamProjectRevenue', width: 130 },
    { title: '团队项目毛利率', dataIndex: 'teamProjectMargin', key: 'teamProjectMargin', width: 130 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (val: number) => val === 1 ? '有效' : '无效' },
    {
      title: '操作', 
      key: 'action', 
      width: 120, 
      fixed: 'right' as const, 
      render: (_: any, record: MonthlyPerformance) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id!)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <DatePicker.MonthPicker
          placeholder="选择月份"
          onChange={(_, dateStr) => setSearchMonth(dateStr || undefined)}
          allowClear
        />
        <Input
          placeholder="员工姓名"
          style={{ width: 160 }}
          onChange={e => setSearchEmployee(e.target.value || undefined)}
        />
        <TreeSelect
          placeholder="选择部门"
          style={{ width: 200 }}
          value={searchDepartment}
          onChange={setSearchDepartment}
          treeData={transformDepartmentTree(departmentTree)}
          allowClear
        />
        <Checkbox 
          checked={includeSubDept} 
          onChange={e => setIncludeSubDept(e.target.checked)}
        >
          包含子级部门
        </Checkbox>
        <Button type="primary" onClick={handleAdd}>新增</Button>
        <Button onClick={handleBatchAdd}>批量录入</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        scroll={{ x: 1200 }}
      />
      <Modal
        open={modalOpen}
        title={editing ? '编辑绩效' : '新增绩效'}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        destroyOnClose
        width={600}
      >
        <Form
          key={modalOpen ? String(editing?.id || 'add') : 'closed'}
          form={form}
          layout="vertical"
          initialValues={{
            status: 1,
            ...editing,
            month: editing?.month ? dayjs(editing.month) : undefined,
          }}
        >
          <Form.Item name="month" label="月份" rules={[{ required: true, message: '请选择月份' }]}> 
            <DatePicker.MonthPicker 
              style={{ width: '100%' }} 
              disabled={!!editing} // 编辑时禁用月份选择
            />
          </Form.Item>
          <Form.Item name="employeeId" label="员工" rules={[{ required: true, message: '请选择员工' }]}> 
            {editing ? (
              <>
                <Input 
                  value={`${editing.employeeName} - ${editing.departmentName}`}
                  disabled
                  style={{ width: '100%' }}
                />
                {/* 隐藏字段保存employeeId */}
                <Input type="hidden" value={editing.employeeId} />
              </>
            ) : (
              <Select 
                placeholder="选择员工"
                loading={employeeLoading}
                showSearch
                filterOption={(input, option) => {
                  const employee = employees.find(emp => emp.id === option?.value);
                  if (!employee) return false;
                  const searchText = input.toLowerCase();
                  return (employee.name?.toLowerCase().includes(searchText) || false) || 
                         (employee.empNo?.toLowerCase().includes(searchText) || false) ||
                         (employee.departmentName?.toLowerCase().includes(searchText) || false);
                }}
                onChange={handleEmployeeChange}
              >
                {employees.map(employee => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.empNo}) - {employee.departmentName}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          
          {/* 隐藏字段，用于存储员工姓名和部门信息 */}
          <Form.Item name="employeeName" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="departmentId" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="departmentName" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          
          <Form.Item name="performanceScore" label="绩效得分" rules={[{ required: true, message: '请输入绩效得分' }, { type: 'number', min: 0, max: 100, message: '绩效得分范围0-100' }]}> 
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="personalProjectRevenue" label="个人项目营业额" rules={[{ type: 'number', min: 0, message: '不能为负数' }]}> 
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="personalProjectMargin" label="个人项目毛利率" rules={[{ type: 'number', min: 0, max: 1, message: '范围0-1' }]}> 
            <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="teamProjectRevenue" label="团队项目营业额" rules={[{ type: 'number', min: 0, message: '不能为负数' }]}> 
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="teamProjectMargin" label="团队项目毛利率" rules={[{ type: 'number', min: 0, max: 1, message: '范围0-1' }]}> 
            <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}> 
            <Select><Option value={1}>有效</Option><Option value={0}>无效</Option></Select> 
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={batchModalOpen}
        title="批量录入绩效"
        onCancel={() => setBatchModalOpen(false)}
        onOk={handleBatchSave}
        destroyOnClose
      >
        <p>请在此处实现批量录入表单（可用Excel导入或多行录入，示例略）</p>
      </Modal>
    </div>
  );
};

export default MonthlyPerformancePage; 