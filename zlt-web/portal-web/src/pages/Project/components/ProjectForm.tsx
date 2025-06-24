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

  // 初始化表单数据
  useEffect(() => {
    if (visible && project && mode !== 'create') {
      const formData = {
        ...project,
        startTime: project.startTime ? dayjs(project.startTime) : undefined,
      };
      form.setFieldsValue(formData);
      
      // 解析参与人信息
      if (project.participants) {
        try {
          const participantData = JSON.parse(project.participants);
          setParticipants(participantData || []);
        } catch (error) {
          console.error('Failed to parse participants:', error);
          setParticipants([]);
        }
      } else {
        setParticipants([]);
      }
    } else if (visible && mode === 'create') {
      form.resetFields();
      setParticipants([]);
    }
  }, [visible, project, mode, form]);

  // 添加参与人
  const addParticipant = () => {
    setParticipants([...participants, { participantId: '', role: '' }]);
  };

  // 删除参与人
  const removeParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
  };

  // 更新参与人
  const updateParticipant = (index: number, field: string, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const submitData: ProjectSaveParams = {
        ...values,
        startTime: values.startTime ? values.startTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
        participants: participants.length > 0 ? participants : undefined,
      };

      let response;
      if (mode === 'create') {
        response = await projectApi.createProject(submitData);
      } else {
        response = await projectApi.updateProject(project!.id, submitData);
      }

      if (response.code === 0) {
        message.success(mode === 'create' ? '创建成功' : '更新成功');
        onSuccess();
      } else {
        message.error(response.message || '操作失败');
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
                showTime
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