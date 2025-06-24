import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  message,
  Divider,
  Card,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectApi } from '@/services/project';
import UserSelector from '@/components/UserSelector';
import type {
  Project,
  ProjectSaveParams,
  ProjectParticipantInput,
  FormMode,
} from '@/types/project';
import { getEmployeeBatchDetail } from '@/services/organization/employee';

const { Option } = Select;
const { TextArea } = Input;

interface ProjectFormProps {
  visible: boolean;
  mode: FormMode;
  project?: Project;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  visible,
  mode,
  project,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<ProjectParticipantInput[]>([]);

  // 批量查详情
  const fetchParticipantsDetail = async (rawList: ProjectParticipantInput[], employeeMap?: Map<string, any>) => {
    const ids = rawList.map(p => p.participantId).filter(Boolean);
    if (ids.length === 0) {
      setParticipants(rawList);
      return;
    }
    try {
      let detailMap = employeeMap;
      
      // 如果没有传入employeeMap，则进行批量查询
      if (!detailMap) {
        const res = await getEmployeeBatchDetail(ids);
        detailMap = new Map();
        if (res && res.data) {
          res.data.forEach((emp: any) => {
            detailMap!.set(String(emp.id), emp);
          });
        }
      }
      
      const merged = rawList.map(p => {
        const emp = detailMap!.get(String(p.participantId));
        return emp ? {
          ...p,
          participantName: emp.name,
          participantUsername: emp.username,
          participantEmail: emp.email,
          participantPhone: emp.mobile,
          departmentName: emp.departmentName,
        } : p;
      });
      setParticipants(merged);
    } catch (error) {
      console.error('Failed to fetch participants detail:', error);
      setParticipants(rawList);
    }
  };

  // 初始化表单数据
  useEffect(() => {
    async function fetchLeaderAndParticipants() {
      if (visible && project && mode !== 'create') {
        const formData = {
          ...project,
          startTime: project.startTime ? dayjs(project.startTime) : undefined,
          leaderId: project.leaderId ? String(project.leaderId) : undefined,
        };
        
        // 收集所有需要查询的员工ID
        const employeeIds: (string|number)[] = [];
        
        // 添加项目负责人ID
        if (project.leaderId && !project.leaderName) {
          employeeIds.push(Number(project.leaderId));
        }
        
        // 添加参与人ID
        if (project.participantDetails && project.participantDetails.length > 0) {
          project.participantDetails.forEach(detail => {
            if (detail.participantId) {
              employeeIds.push(Number(detail.participantId));
            }
          });
        }
        
        console.log('最终查询的员工ID列表:', employeeIds);
        
        // 批量查询员工信息
        if (employeeIds.length > 0) {
          try {
            const res = await getEmployeeBatchDetail(employeeIds);
            if (res && res.data) {
              const employeeMap = new Map();
              res.data.forEach((emp: any) => {
                employeeMap.set(String(emp.id), emp);
              });
              
              // 设置负责人姓名
              if (project.leaderId && employeeMap.has(String(project.leaderId))) {
                const leader = employeeMap.get(String(project.leaderId));
                formData.leaderName = leader.name;
              }
              
              // 设置参与人详情
              if (project.participantDetails && project.participantDetails.length > 0) {
                const participantData = project.participantDetails.map(detail => ({
                  participantId: String(detail.participantId),
                  role: detail.role
                }));
                fetchParticipantsDetail(participantData, employeeMap);
              } else {
                setParticipants([]);
              }
            }
          } catch (error) {
            console.error('Failed to fetch employee details:', error);
            // 批量查询失败时，直接使用原有数据，不进行单个查询
            // 保持负责人ID，前端UserSelector会自动显示
            if (project.participantDetails && project.participantDetails.length > 0) {
              const participantData = project.participantDetails.map(detail => ({
                participantId: String(detail.participantId),
                role: detail.role
              }));
              setParticipants(participantData);
            } else {
              setParticipants([]);
            }
          }
        } else {
          // 处理参与人（无需额外查询员工信息）
          if (project.participantDetails && project.participantDetails.length > 0) {
            const participantData = project.participantDetails.map(detail => ({
              participantId: String(detail.participantId),
              role: detail.role
            }));
            fetchParticipantsDetail(participantData);
          } else {
            setParticipants([]);
          }
        }
        
        console.log('设置表单数据:', formData);
        form.setFieldsValue(formData);
      } else if (visible && mode === 'create') {
        form.resetFields();
        setParticipants([]);
      }
    }
    fetchLeaderAndParticipants();
  }, [visible, project, mode, form]);

  // 添加参与人
  const addParticipant = () => {
    const newList = [...participants, { participantId: '', role: '' }];
    fetchParticipantsDetail(newList);
  };

  // 删除参与人
  const removeParticipant = (index: number) => {
    const newList = participants.filter((_, i) => i !== index);
    fetchParticipantsDetail(newList);
  };

  // 更新参与人
  const updateParticipant = (index: number, field: string, value: string) => {
    const newList = [...participants];
    newList[index] = { ...newList[index], [field]: value };
    fetchParticipantsDetail(newList);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const startTime = values.startTime ? values.startTime.format('YYYY-MM-DD') : undefined;

      const submitData: ProjectSaveParams = {
        ...values,
        startTime,
        participants: participants,
      };

      let response;
      if (mode === 'create') {
        response = await projectApi.createProject(submitData);
      } else {
        response = await projectApi.updateProject(project!.id, submitData);
      }

      if (response.resp_code === 0) {
        message.success(mode === 'create' ? '创建成功' : '更新成功');
        onSuccess();
      } else {
        message.error(response.resp_msg || '操作失败');
      }
    } catch (error) {
      console.error('Failed to submit project:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取标题
  const getTitle = () => {
    switch (mode) {
      case 'create':
        return '新增项目';
      case 'edit':
        return '编辑项目';
      case 'view':
        return '查看项目';
      default:
        return '项目信息';
    }
  };

  return (
    <Modal
      title={getTitle()}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={
        mode === 'view' ? (
          <Button onClick={onCancel}>关闭</Button>
        ) : (
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              {mode === 'create' ? '创建' : '更新'}
            </Button>
          </Space>
        )
      }
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        disabled={mode === 'view'}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category"
              label="项目分类"
              rules={[{ required: true, message: '请选择项目分类' }]}
            >
              <Select placeholder="请选择项目分类">
                <Option value="党建项目">党建项目</Option>
                <Option value="IDC项目">IDC项目</Option>
                <Option value="软件项目">软件项目</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="leaderId"
              label="项目负责人"
              rules={[{ required: true, message: '请选择项目负责人' }]}
            >
              <UserSelector placeholder="请选择项目负责人" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerName"
              label="客户名称"
            >
              <Input placeholder="请输入客户名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customerContact"
              label="客户联系人"
            >
              <Input placeholder="请输入客户联系人" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="立项时间"
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择立项时间"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>项目参与人</Divider>

        <Card size="small" style={{ marginBottom: 16 }}>
          {participants.map((participant, index) => (
            <Row key={index} gutter={16} style={{ marginBottom: 8 }}>
              <Col span={10}>
                <UserSelector
                  placeholder="请选择参与人"
                  value={participant.participantId}
                  onChange={(value) => updateParticipant(index, 'participantId', value)}
                />
              </Col>
              <Col span={10}>
                <Select
                  placeholder="请选择角色"
                  value={participant.role}
                  onChange={(value) => updateParticipant(index, 'role', value)}
                  style={{ width: '100%' }}
                >
                  <Option value="销售">销售</Option>
                  <Option value="技术">技术</Option>
                  <Option value="产品经理">产品经理</Option>
                  <Option value="售前">售前</Option>
                  <Option value="售后">售后</Option>
                  <Option value="运维">运维</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeParticipant(index)}
                />
              </Col>
            </Row>
          ))}
          
          {mode !== 'view' && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addParticipant}
              style={{ width: '100%' }}
            >
              添加参与人
            </Button>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default ProjectForm; 