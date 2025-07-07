import React, { useEffect, useState, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  message,
  Popconfirm,
  InputNumber,
  TreeSelect,
  Checkbox,
  Upload,
  Progress,
  Alert,
  Divider,
  Typography,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  getMonthlyPerformanceList,
  addMonthlyPerformance,
  updateMonthlyPerformance,
  deleteMonthlyPerformance,
  batchSaveMonthlyPerformance,
  downloadImportTemplate,
  importMonthlyPerformance,
  getDepartmentTree,
  getEmployeesByDepartment,
  getEmployeePage,
} from '@/services/soo';
import type { MonthlyPerformance } from '@/types/monthlyPerformance';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title } = Typography;

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchList, setBatchList] = useState<any[]>([]);

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

  // 批量导入相关状态
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [errorData, setErrorData] = useState<any[]>([]);
  const [showErrors, setShowErrors] = useState(false);

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
      
      // 适配后端数据格式：检查 resp_code 或 code 字段，或者直接有data
      const res = response as any;
      if ((res.resp_code === 0 || res.code === 0 || res.success) && res.data) {
        setDepartmentTree(res.data);
        console.log('部门树设置成功:', res.data);
      } else if (Array.isArray(response)) {
        // 如果直接返回数组
        setDepartmentTree(response);
        console.log('部门树设置成功(数组格式):', response);
      } else {
        console.warn('部门树加载失败:', res.message || res.resp_msg);
        message.warning('获取部门列表失败：' + (res.message || res.resp_msg || '未知错误'));
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
      
      // 适配后端数据格式：检查 resp_code 或 code 字段
      const res = response as any;
      if ((res.resp_code === 0 || res.code === 0 || res.success) && res.data) {
        // 兼容不同的响应结构
        let employeeList = [];
        if (res.data.list) {
          employeeList = res.data.list;
        } else if (res.data.data) {
          employeeList = res.data.data;
        } else if (Array.isArray(res.data)) {
          employeeList = res.data;
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
        console.warn('员工列表加载失败:', res.message || res.resp_msg);
        message.warning('获取员工列表失败：' + (res.message || res.resp_msg || '未知错误'));
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
      
      // 适配后端数据格式：检查 resp_code 或 code 字段
      if (res && (res.resp_code === 0 || res.code === 0)) {
        // 后端返回的数据直接在 data 数组中
        const list = res.data || [];
        const total = res.count || 0;
        
        setData(list);
        setPagination({ 
          current: page, 
          pageSize, 
          total: total 
        });
        console.log('绩效数据设置成功:', { list, total });
      } else {
        console.error('数据格式异常:', res);
        message.error(res?.resp_msg || res?.message || '获取数据失败');
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
    // 重置批量导入相关状态
    setImportResult(null);
    setErrorData([]);
    setShowErrors(false);
    setImportProgress(0);
    setUploading(false);
  };

  const handleCloseBatchModal = () => {
    setBatchModalOpen(false);
    // 重置相关状态
    setImportResult(null);
    setErrorData([]);
    setShowErrors(false);
    setImportProgress(0);
    setUploading(false);
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

  // 批量导入方法
  const handleImportClick = () => {
    setImportModalOpen(true);
    setImportResult(null);
    setErrorData([]);
    setShowErrors(false);
    setImportProgress(0);
  };

  const handleDownloadTemplate = async () => {
    try {
      console.log('开始下载模板...');
      const response = await downloadImportTemplate();
      console.log('模板下载响应:', response);
      
      // 检查响应是否为blob
      let blob;
      if (response instanceof Blob) {
        blob = response;
      } else if (response instanceof ArrayBuffer) {
        blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
      } else {
        // 如果响应是其他格式，尝试转换
        blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
      }
      
      console.log('创建的blob:', blob, '大小:', blob.size);
      
      // 检查blob是否有效
      if (blob.size === 0) {
        throw new Error('下载的文件为空');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '月度绩效导入模板.xlsx';
      
      // 确保链接被添加到DOM中
      document.body.appendChild(link);
      
      console.log('触发下载...');
      link.click();
      
      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('模板下载成功');
    } catch (error: any) {
      console.error('模板下载失败:', error);
      message.error(`模板下载失败: ${error.message || '未知错误'}`);
    }
  };

  const handleImportUpload = async (file: File) => {
    setUploading(true);
    setImportProgress(10);
    
    try {
      console.log('开始上传文件:', file.name, '大小:', file.size);
      
      // 检查认证信息
      const token = localStorage.getItem('access_token');
      const tenantId = localStorage.getItem('tenant_id');
      console.log('认证信息检查:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        tenantId 
      });
      
      // 模拟上传进度
      const progressTimer = setInterval(() => {
        setImportProgress(prev => {
          if (prev < 80) return prev + 10;
          return prev;
        });
      }, 200);

      const result = await importMonthlyPerformance(file);
      
      clearInterval(progressTimer);
      setImportProgress(100);
      
      console.log('导入原始结果:', result);
      
      // 解析后端返回的数据结构
      let importData;
      if (result.datas) {
        // 如果有 datas 字段，使用 datas 中的数据
        importData = result.datas;
      } else {
        // 否则直接使用 result
        importData = result;
      }
      
      console.log('解析后的导入数据:', importData);
      
      // 检查导入是否成功
      if (importData.success || (result.resp_code === 0)) {
        setImportResult({
          success: true,
          successCount: importData.successCount || 0,
          message: '导入成功'
        });
        message.success(`导入成功！共导入 ${importData.successCount || 0} 条数据`);
        loadData(pagination.current, pagination.pageSize);
      } else {
        // 导入失败，处理错误数据
        const errorData = importData.errorData || [];
        const errorCount = importData.errorCount || errorData.length;
        
        console.log('错误数据:', errorData);
        
        setImportResult({
          success: false,
          message: importData.message || result.resp_msg || '导入失败',
          errorCount: errorCount,
          errorData: errorData
        });
        
        setErrorData(errorData);
        setShowErrors(true);
        
        message.error(`导入失败！共 ${errorCount} 条数据存在错误`);
      }
    } catch (error: any) {
      console.error('导入错误:', error);
      message.error(error.message || '导入失败');
      setImportResult({
        success: false,
        message: error.message || '导入失败'
      });
    } finally {
      setUploading(false);
    }
    
    return false; // 阻止默认上传行为
  };

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
    setImportResult(null);
    setErrorData([]);
    setShowErrors(false);
    setImportProgress(0);
    setUploading(false);
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
        <Button icon={<UploadOutlined />} onClick={handleImportClick}>批量导入</Button>
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
        onCancel={handleCloseBatchModal}
        footer={[
          <Button key="cancel" onClick={handleCloseBatchModal}>
            取消
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        <div>
          {/* 上半部分：模板下载 */}
          <div style={{ marginBottom: 24 }}>
            <Alert
              message="操作说明"
              description="请先下载模板，按模板格式填写数据后上传"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
              type="primary"
              size="large"
              block
            >
              下载Excel模板
            </Button>
          </div>

          <Divider>文件上传</Divider>

          {/* 下半部分：文件上传 */}
          <div>
            <Upload.Dragger
              name="file"
              multiple={false}
              accept=".xlsx,.xls"
              beforeUpload={handleImportUpload}
              disabled={uploading}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: uploading ? '#ccc' : '#1890ff' }} />
              </p>
              <p className="ant-upload-text">
                {uploading ? '正在上传...' : '拖拽文件到这里 或 点击上传'}
              </p>
              <p className="ant-upload-hint">
                支持.xlsx和.xls格式的Excel文件，最大10MB
              </p>
            </Upload.Dragger>

            {/* 上传进度 */}
            {uploading && (
              <div style={{ marginTop: 16 }}>
                <Progress percent={importProgress} status="active" />
                <Text type="secondary">正在处理上传文件...</Text>
              </div>
            )}

            {/* 导入结果 */}
            {importResult && (
              <div style={{ marginTop: 16 }}>
                {importResult.success ? (
                  <Alert
                    message="导入成功"
                    description={`成功导入 ${importResult.successCount || 0} 条数据`}
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    action={
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => {
                          handleCloseBatchModal();
                          loadData(pagination.current, pagination.pageSize);
                        }}
                      >
                        确认
                      </Button>
                    }
                  />
                ) : (
                  <Alert
                    message="导入失败"
                    description={importResult.message}
                    type="error"
                    showIcon
                    icon={<CloseCircleOutlined />}
                    action={
                      errorData.length > 0 && (
                        <Button 
                          size="small" 
                          onClick={() => setShowErrors(!showErrors)}
                        >
                          {showErrors ? '隐藏' : '查看'}错误详情
                        </Button>
                      )
                    }
                  />
                )}
              </div>
            )}

            {/* 错误详情 */}
            {showErrors && errorData.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>错误详情</Title>
                <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #f0f0f0', padding: 8, borderRadius: 4 }}>
                  {errorData.map((error, index) => (
                    <div key={index} style={{ marginBottom: 12, padding: 12, backgroundColor: '#fff2f0', borderRadius: 4, border: '1px solid #ffccc7' }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ color: '#cf1322' }}>第 {error.rowNum} 行数据错误</Text>
                      </div>
                      
                      {/* 显示数据信息 */}
                      <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#fafafa', borderRadius: 4 }}>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          月份: {error.month || '未填写'} | 
                          员工: {error.employeeName || '未知'} | 
                          部门: {error.departmentName || '未知'} | 
                          绩效得分: {error.performanceScore || '未填写'}
                        </Text>
                      </div>
                      
                      {/* 显示具体错误列表 */}
                      <div>
                        <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>错误详情：</Text>
                        {error.errors && error.errors.length > 0 ? (
                          <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                            {error.errors.map((err: string, errIndex: number) => (
                              <li key={errIndex} style={{ color: '#cf1322', fontSize: '12px', marginBottom: '2px' }}>
                                {err}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px' }}>
                            {error.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
      
      {/* 批量导入模态框 */}
      <Modal
        open={importModalOpen}
        title="批量导入月度绩效"
        onCancel={handleCloseImportModal}
        footer={[
          <Button key="cancel" onClick={handleCloseImportModal}>
            关闭
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        <div>
          {/* 操作说明 */}
          <Alert
            message="导入说明"
            description={
              <div>
                <p>1. 请先下载导入模板，按模板格式填写数据</p>
                <p>2. 支持.xlsx和.xls格式的Excel文件</p>
                <p>3. 带*号的字段为必填项</p>
                <p>4. 月份格式：YYYY-MM（如：2024-01）</p>
                <p>5. 绩效得分范围：0-100</p>
                <p>6. 毛利率范围：0-1（如：0.2表示20%）</p>
                <p>7. 状态：1表示有效，0表示无效</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* 模板下载 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleDownloadTemplate}
                type="dashed"
                block
              >
                下载导入模板
              </Button>
            </Col>
          </Row>

          <Divider>文件上传</Divider>

          {/* 文件上传 */}
          <Upload.Dragger
            name="file"
            multiple={false}
            accept=".xlsx,.xls"
            beforeUpload={handleImportUpload}
            disabled={uploading}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: uploading ? '#ccc' : '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              {uploading ? '正在上传...' : '点击或拖拽文件到此区域上传'}
            </p>
            <p className="ant-upload-hint">
              支持.xlsx和.xls格式的Excel文件
            </p>
          </Upload.Dragger>

          {/* 上传进度 */}
          {uploading && (
            <div style={{ marginTop: 16 }}>
              <Progress percent={importProgress} status="active" />
              <Text type="secondary">正在处理上传文件...</Text>
            </div>
          )}

          {/* 导入结果 */}
          {importResult && (
            <div style={{ marginTop: 16 }}>
              {importResult.success ? (
                <Alert
                  message="导入成功"
                  description={`成功导入 ${importResult.successCount || 0} 条数据`}
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />
              ) : (
                <Alert
                  message="导入失败"
                  description={importResult.message}
                  type="error"
                  showIcon
                  icon={<CloseCircleOutlined />}
                  action={
                    errorData.length > 0 && (
                      <Button 
                        size="small" 
                        onClick={() => setShowErrors(!showErrors)}
                      >
                        {showErrors ? '隐藏' : '查看'}错误详情
                      </Button>
                    )
                  }
                />
              )}
            </div>
          )}

          {/* 错误详情 */}
          {showErrors && errorData.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Title level={5}>错误详情</Title>
              <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #f0f0f0', padding: 8, borderRadius: 4 }}>
                {errorData.map((error, index) => (
                  <div key={index} style={{ marginBottom: 12, padding: 12, backgroundColor: '#fff2f0', borderRadius: 4, border: '1px solid #ffccc7' }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ color: '#cf1322' }}>第 {error.rowNum} 行数据错误</Text>
                    </div>
                    
                    {/* 显示数据信息 */}
                    <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#fafafa', borderRadius: 4 }}>
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        月份: {error.month || '未填写'} | 
                        员工: {error.employeeName || '未知'} | 
                        部门: {error.departmentName || '未知'} | 
                        绩效得分: {error.performanceScore || '未填写'}
                      </Text>
                    </div>
                    
                    {/* 显示具体错误列表 */}
                    <div>
                      <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>错误详情：</Text>
                      {error.errors && error.errors.length > 0 ? (
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                          {error.errors.map((err: string, errIndex: number) => (
                            <li key={errIndex} style={{ color: '#cf1322', fontSize: '12px', marginBottom: '2px' }}>
                              {err}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={{ color: '#cf1322', fontSize: '12px', marginTop: '4px' }}>
                          {error.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MonthlyPerformancePage; 