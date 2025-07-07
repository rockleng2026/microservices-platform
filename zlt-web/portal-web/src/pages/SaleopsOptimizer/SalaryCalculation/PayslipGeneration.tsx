import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Space,
  Modal,
  DatePicker,
  Input,
  Row,
  Col,
  message,
  Upload,
  Switch,
  Radio,
  Checkbox,
  Progress,
  Tag,
  Divider,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  MailOutlined,
  EyeOutlined,
  UploadOutlined,
  PrinterOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { sooApi } from '../../../services/soo';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title } = Typography;

interface PayslipTemplate {
  id: number;
  templateName: string;
  templateType: string;
  isDefault: boolean;
  previewUrl: string;
  createdAt: string;
}

interface PayslipGeneration {
  id: number;
  month: string;
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  departmentName: string;
  templateId: number;
  templateName: string;
  generationStatus: string;
  sendStatus: string;
  sendMethod: string;
  recipientEmail: string;
  generatedAt: string;
  sentAt: string;
  downloadCount: number;
  fileUrl: string;
}

interface PayslipBatchTask {
  id: number;
  taskName: string;
  month: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  taskStatus: string;
  templateId: number;
  sendMethod: string;
  startTime: string;
  endTime: string;
}

const PayslipGeneration: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [payslips, setPayslips] = useState<PayslipGeneration[]>([]);
  const [batchTasks, setBatchTasks] = useState<PayslipBatchTask[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [currentTask, setCurrentTask] = useState<PayslipBatchTask | null>(null);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadTemplates();
    loadDepartments();
    loadEmployees();
    loadPayslips();
    loadBatchTasks();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await sooApi.getPayslipTemplates();
      if (response.success) {
        setTemplates(response.data || []);
        // 设置默认模板
        const defaultTemplate = response.data?.find((t: PayslipTemplate) => t.isDefault);
        if (defaultTemplate) {
          form.setFieldValue('templateId', defaultTemplate.id);
        }
      }
    } catch (error) {
      console.error('加载工资条模板失败:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await sooApi.getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error('加载部门列表失败:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await sooApi.getEmployees();
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch (error) {
      console.error('加载员工列表失败:', error);
    }
  };

  const loadPayslips = async (page = 1) => {
    try {
      setLoading(true);
      const response = await sooApi.getPayslips({
        page,
        size: pagination.pageSize,
      });
      if (response.success) {
        setPayslips(response.data.list || []);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.total || 0,
        });
      }
    } catch (error) {
      console.error('加载工资条列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBatchTasks = async () => {
    try {
      const response = await sooApi.getPayslipBatchTasks();
      if (response.success) {
        setBatchTasks(response.data || []);
      }
    } catch (error) {
      console.error('加载批量任务失败:', error);
    }
  };

  const handleBatchGenerate = async (values: any) => {
    try {
      setLoading(true);
      const response = await sooApi.createPayslipBatchTask({
        month: values.month,
        templateId: values.templateId,
        scope: values.scope || 'all',
        departmentIds: values.scope === 'department' ? values.departmentIds : [],
        employeeIds: values.scope === 'employee' ? values.employeeIds : [],
        sendMethod: values.sendMethod,
        autoSend: values.autoSend || false,
      });

      if (response.success) {
        message.success('批量生成任务创建成功');
        setCurrentTask(response.data);
        setShowBatchModal(true);
        loadBatchTasks();
        
        // 开始执行任务
        executeGenerationTask(response.data.id);
      }
    } catch (error) {
      message.error('创建批量生成任务失败');
    } finally {
      setLoading(false);
    }
  };

  const executeGenerationTask = async (taskId: number) => {
    try {
      await sooApi.executePayslipGenerationTask(taskId);
      
      // 轮询任务状态
      const pollInterval = setInterval(async () => {
        try {
          const response = await sooApi.getPayslipTaskStatus(taskId);
          if (response.success) {
            setCurrentTask(response.data);
            
            if (response.data.taskStatus === 'completed' || response.data.taskStatus === 'failed') {
              clearInterval(pollInterval);
              loadBatchTasks();
              loadPayslips();
              
              if (response.data.taskStatus === 'completed') {
                message.success('工资条生成完成');
              } else {
                message.error('工资条生成失败');
              }
            }
          }
        } catch (error) {
          clearInterval(pollInterval);
          console.error('轮询任务状态失败:', error);
        }
      }, 2000);

      // 30秒后停止轮询
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 30000);

    } catch (error) {
      message.error('执行生成任务失败');
    }
  };

  const handlePreviewTemplate = (template: PayslipTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDownloadPayslip = async (payslipId: number, employeeName: string, month: string) => {
    try {
      const response = await sooApi.downloadPayslip(payslipId);
      
      // 创建下载链接
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `工资条_${employeeName}_${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('下载成功');
    } catch (error) {
      message.error('下载失败');
    }
  };

  const handleSendPayslip = async (payslipId: number, sendMethod: string) => {
    try {
      await sooApi.sendPayslip(payslipId, { sendMethod });
      message.success('发送成功');
      loadPayslips(pagination.current);
    } catch (error) {
      message.error('发送失败');
    }
  };

  const handleBatchSend = async (payslipIds: number[], sendMethod: string) => {
    try {
      setLoading(true);
      await sooApi.batchSendPayslips({
        payslipIds,
        sendMethod,
      });
      message.success('批量发送成功');
      loadPayslips(pagination.current);
    } catch (error) {
      message.error('批量发送失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'default', icon: <ClockCircleOutlined />, text: '待生成' },
      generating: { color: 'processing', icon: <ClockCircleOutlined />, text: '生成中' },
      generated: { color: 'success', icon: <CheckCircleOutlined />, text: '已生成' },
      failed: { color: 'error', icon: <CloseCircleOutlined />, text: '生成失败' },
      sent: { color: 'success', icon: <CheckCircleOutlined />, text: '已发送' },
      send_failed: { color: 'error', icon: <CloseCircleOutlined />, text: '发送失败' },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const payslipColumns: ColumnsType<PayslipGeneration> = [
    {
      title: '员工信息',
      key: 'employee',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{record.employeeName}</span>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.employeeNo}
          </span>
        </Space>
      ),
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 80,
    },
    {
      title: '模板',
      dataIndex: 'templateName',
      key: 'templateName',
      width: 120,
    },
    {
      title: '生成状态',
      dataIndex: 'generationStatus',
      key: 'generationStatus',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '发送状态',
      dataIndex: 'sendStatus',
      key: 'sendStatus',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '发送方式',
      dataIndex: 'sendMethod',
      key: 'sendMethod',
      width: 100,
      render: (method) => {
        const methodMap: { [key: string]: string } = {
          email: '邮件',
          sms: '短信',
          wechat: '微信',
          download: '下载',
        };
        return methodMap[method] || method;
      },
    },
    {
      title: '生成时间',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      width: 120,
      render: (time) => time ? dayjs(time).format('MM-DD HH:mm') : '-',
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.generationStatus === 'generated' && (
            <>
              <Button 
                type="link" 
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadPayslip(record.id, record.employeeName, record.month)}
              >
                下载
              </Button>
              {record.sendStatus !== 'sent' && (
                <Button 
                  type="link" 
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => handleSendPayslip(record.id, 'email')}
                >
                  发送
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  const taskColumns: ColumnsType<PayslipBatchTask> = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 80,
    },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '进度',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const progress = record.totalCount > 0 
          ? Math.round(((record.successCount + record.failedCount) / record.totalCount) * 100)
          : 0;
        
        return (
          <Progress 
            percent={progress} 
            size="small"
            status={record.taskStatus === 'failed' ? 'exception' : 'normal'}
          />
        );
      },
    },
    {
      title: '处理结果',
      key: 'result',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>总数: {record.totalCount}</span>
          <span style={{ color: '#52c41a' }}>成功: {record.successCount}</span>
          <span style={{ color: '#ff4d4f' }}>失败: {record.failedCount}</span>
        </Space>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (time) => time ? dayjs(time).format('MM-DD HH:mm') : '-',
    },
    {
      title: '完成时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      render: (time) => time ? dayjs(time).format('MM-DD HH:mm') : '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 批量生成工资条 */}
      <Card title="批量生成工资条" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleBatchGenerate}
        >
          <Form.Item
            name="month"
            label="选择月份"
            rules={[{ required: true, message: '请选择月份' }]}
          >
            <DatePicker picker="month" format="YYYY-MM" />
          </Form.Item>
          
          <Form.Item
            name="templateId"
            label="工资条模板"
            rules={[{ required: true, message: '请选择模板' }]}
          >
            <Select style={{ width: 200 }} placeholder="请选择模板">
              {templates.map(template => (
                <Option key={template.id} value={template.id}>
                  {template.templateName}
                  {template.isDefault && <Tag color="blue" style={{ marginLeft: 8 }}>默认</Tag>}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="scope" label="生成范围" initialValue="all">
            <Radio.Group>
              <Radio value="all">全公司</Radio>
              <Radio value="department">指定部门</Radio>
              <Radio value="employee">指定员工</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.scope !== currentValues.scope
            }
          >
            {({ getFieldValue }) => {
              const scope = getFieldValue('scope');
              if (scope === 'department') {
                return (
                  <Form.Item
                    name="departmentIds"
                    label="选择部门"
                    rules={[{ required: true, message: '请选择部门' }]}
                  >
                    <Select 
                      mode="multiple" 
                      style={{ width: 300 }} 
                      placeholder="请选择部门"
                    >
                      {departments.map(dept => (
                        <Option key={dept.id} value={dept.id}>
                          {dept.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              } else if (scope === 'employee') {
                return (
                  <Form.Item
                    name="employeeIds"
                    label="选择员工"
                    rules={[{ required: true, message: '请选择员工' }]}
                  >
                    <Select 
                      mode="multiple" 
                      style={{ width: 300 }} 
                      placeholder="请选择员工"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {employees.map(emp => (
                        <Option key={emp.id} value={emp.id}>
                          {emp.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item name="sendMethod" label="发送方式" initialValue="download">
            <Select style={{ width: 120 }}>
              <Option value="download">仅生成</Option>
              <Option value="email">邮件发送</Option>
              <Option value="sms">短信发送</Option>
              <Option value="wechat">微信发送</Option>
            </Select>
          </Form.Item>

          <Form.Item name="autoSend" valuePropName="checked">
            <Checkbox>生成后自动发送</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<FileTextOutlined />}
              loading={loading}
            >
              批量生成
            </Button>
          </Form.Item>
        </Form>

        {/* 模板管理 */}
        <Divider />
        <Space>
          <Text strong>工资条模板：</Text>
          {templates.map(template => (
            <Button
              key={template.id}
              type={template.isDefault ? 'primary' : 'default'}
              size="small"
              onClick={() => handlePreviewTemplate(template)}
            >
              {template.templateName}
              {template.isDefault && <Tag color="blue" size="small">默认</Tag>}
            </Button>
          ))}
          <Button type="dashed" size="small" onClick={() => setShowTemplateModal(true)}>
            管理模板
          </Button>
        </Space>
      </Card>

      {/* 批量任务列表 */}
      <Card title="批量生成任务" style={{ marginBottom: '24px' }}>
        <Table
          columns={taskColumns}
          dataSource={batchTasks}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 工资条列表 */}
      <Card title="工资条列表">
        <Table
          columns={payslipColumns}
          dataSource={payslips}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            onChange: loadPayslips,
          }}
        />
      </Card>

      {/* 任务进度模态框 */}
      <Modal
        title="生成任务进度"
        open={showBatchModal}
        onCancel={() => setShowBatchModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowBatchModal(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentTask && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>任务名称：</strong>{currentTask.taskName}
            </div>
            <div>
              <strong>生成月份：</strong>{currentTask.month}
            </div>
            <div>
              <strong>任务状态：</strong>{getStatusTag(currentTask.taskStatus)}
            </div>
            <div>
              <strong>生成进度：</strong>
              <Progress 
                percent={currentTask.totalCount > 0 
                  ? Math.round(((currentTask.successCount + currentTask.failedCount) / currentTask.totalCount) * 100)
                  : 0}
                status={currentTask.taskStatus === 'failed' ? 'exception' : 'normal'}
              />
            </div>
            <div>
              <strong>处理统计：</strong>
              总数 {currentTask.totalCount}，
              成功 {currentTask.successCount}，
              失败 {currentTask.failedCount}
            </div>
            {currentTask.startTime && (
              <div>
                <strong>开始时间：</strong>{dayjs(currentTask.startTime).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            )}
            {currentTask.endTime && (
              <div>
                <strong>完成时间：</strong>{dayjs(currentTask.endTime).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            )}
          </Space>
        )}
      </Modal>

      {/* 模板预览模态框 */}
      <Modal
        title="工资条模板预览"
        open={showPreviewModal}
        onCancel={() => setShowPreviewModal(false)}
        footer={null}
        width={800}
      >
        {selectedTemplate && (
          <div style={{ textAlign: 'center' }}>
            <Title level={4}>{selectedTemplate.templateName}</Title>
            <img 
              src={selectedTemplate.previewUrl} 
              alt="模板预览"
              style={{ maxWidth: '100%', maxHeight: '600px' }}
            />
          </div>
        )}
      </Modal>

      {/* 模板管理模态框 */}
      <Modal
        title="工资条模板管理"
        open={showTemplateModal}
        onCancel={() => setShowTemplateModal(false)}
        footer={null}
        width={1000}
      >
        <div>
          <Space style={{ marginBottom: '16px' }}>
            <Upload>
              <Button icon={<UploadOutlined />}>上传新模板</Button>
            </Upload>
            <Button type="primary">创建模板</Button>
          </Space>
          
          <Table
            dataSource={templates}
            rowKey="id"
            size="small"
            columns={[
              {
                title: '模板名称',
                dataIndex: 'templateName',
                key: 'templateName',
              },
              {
                title: '模板类型',
                dataIndex: 'templateType',
                key: 'templateType',
              },
              {
                title: '是否默认',
                dataIndex: 'isDefault',
                key: 'isDefault',
                render: (isDefault) => isDefault ? <Tag color="blue">默认</Tag> : '-',
              },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (time) => dayjs(time).format('YYYY-MM-DD'),
              },
              {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                  <Space>
                    <Button type="link" size="small" onClick={() => handlePreviewTemplate(record)}>
                      预览
                    </Button>
                    <Button type="link" size="small">
                      编辑
                    </Button>
                    {!record.isDefault && (
                      <Button type="link" size="small">
                        设为默认
                      </Button>
                    )}
                    <Button type="link" size="small" danger>
                      删除
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PayslipGeneration; 