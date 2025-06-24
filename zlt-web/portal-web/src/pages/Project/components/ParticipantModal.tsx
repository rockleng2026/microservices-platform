import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  Form,
  Select,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { projectApi } from '@/services/project';
import UserSelector from '@/components/UserSelector';
import type {
  Project,
  ProjectParticipant,
} from '@/types/project';

const { Option } = Select;

interface ParticipantModalProps {
  visible: boolean;
  project?: Project;
  onCancel: () => void;
  onSuccess: () => void;
}

const ParticipantModal: React.FC<ParticipantModalProps> = ({
  visible,
  project,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<ProjectParticipant[]>([]);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<ProjectParticipant | null>(null);

  // 初始化参与人列表
  useEffect(() => {
    if (visible && project) {
      loadParticipants();
    }
  }, [visible, project]);

  // 加载参与人列表
  const loadParticipants = () => {
    if (!project) return;

    try {
      if (project.participantDetails) {
        setParticipants(project.participantDetails);
      } else if (project.participants) {
        const participantData = JSON.parse(project.participants) || [];
        setParticipants(participantData);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error('Failed to parse participants:', error);
      setParticipants([]);
    }
  };

  // 添加参与人
  const handleAddParticipant = async () => {
    try {
      const values = await addForm.validateFields();
      setLoading(true);

      if (!project) {
        message.error('项目信息不存在');
        return;
      }

      const response = await projectApi.addProjectParticipant(
        project.id,
        values.participantId,
        values.role
      );

      if (response.resp_code === 0) {
        message.success('添加成功');
        setShowAddForm(false);
        addForm.resetFields();
        onSuccess();
      } else {
        message.error(response.resp_msg || '添加失败');
      }
    } catch (error) {
      console.error('Failed to add participant:', error);
      message.error('添加失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除参与人
  const handleDeleteParticipant = async (participant: ProjectParticipant) => {
    try {
      setLoading(true);

      if (!project) {
        message.error('项目信息不存在');
        return;
      }

      const response = await projectApi.removeProjectParticipant(
        project.id,
        participant.participantId
      );

      if (response.resp_code === 0) {
        message.success('删除成功');
        onSuccess();
      } else {
        message.error(response.resp_msg || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete participant:', error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 编辑参与人角色
  const handleEditRole = (participant: ProjectParticipant) => {
    setEditingParticipant(participant);
    editForm.setFieldsValue({ role: participant.role });
  };

  // 保存角色编辑
  const handleSaveRole = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);

      if (!project || !editingParticipant) {
        message.error('参数错误');
        return;
      }

      const response = await projectApi.updateParticipantRole(
        project.id,
        editingParticipant.participantId,
        values.role
      );

      if (response.resp_code === 0) {
        message.success('更新成功');
        setEditingParticipant(null);
        editForm.resetFields();
        onSuccess();
      } else {
        message.error(response.resp_msg || '更新失败');
      }
    } catch (error) {
      console.error('Failed to update participant role:', error);
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<ProjectParticipant> = [
    {
      title: '参与人',
      dataIndex: 'participantName',
      key: 'participantName',
      render: (text: string, record: ProjectParticipant) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <div>
            <div>{text || record.participantUsername || record.participantId}</div>
            {record.departmentName && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                {record.departmentName}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (text: string, record: ProjectParticipant) => {
        if (editingParticipant?.participantId === record.participantId) {
          return (
            <Form form={editForm} layout="inline">
              <Form.Item name="role" style={{ margin: 0 }}>
                <Select style={{ width: 120 }}>
                  <Option value="销售">销售</Option>
                  <Option value="技术">技术</Option>
                  <Option value="产品经理">产品经理</Option>
                  <Option value="售前">售前</Option>
                  <Option value="售后">售后</Option>
                  <Option value="运维">运维</Option>
                </Select>
              </Form.Item>
            </Form>
          );
        }
        return <span>{text}</span>;
      },
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record: ProjectParticipant) => (
        <div>
          {record.participantEmail && (
            <div style={{ fontSize: '12px' }}>邮箱: {record.participantEmail}</div>
          )}
          {record.participantPhone && (
            <div style={{ fontSize: '12px' }}>电话: {record.participantPhone}</div>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: ProjectParticipant) => {
        if (editingParticipant?.participantId === record.participantId) {
          return (
            <Space>
              <Button
                type="link"
                size="small"
                onClick={handleSaveRole}
                loading={loading}
              >
                保存
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setEditingParticipant(null);
                  editForm.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          );
        }

        return (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除这个参与人吗？"
              onConfirm={() => handleDeleteParticipant(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      title={`管理项目参与人 - ${project?.name}`}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={
        <Button onClick={onCancel}>关闭</Button>
      }
      destroyOnClose
    >
      {/* 添加参与人表单 */}
      {showAddForm && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Form
            form={addForm}
            layout="inline"
            onFinish={handleAddParticipant}
          >
            <Row gutter={16} style={{ width: '100%' }}>
              <Col span={10}>
                <Form.Item
                  name="participantId"
                  rules={[{ required: true, message: '请选择参与人' }]}
                >
                  <UserSelector placeholder="请选择参与人" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="role"
                  rules={[{ required: true, message: '请选择角色' }]}
                >
                  <Select placeholder="请选择角色">
                    <Option value="销售">销售</Option>
                    <Option value="技术">技术</Option>
                    <Option value="产品经理">产品经理</Option>
                    <Option value="售前">售前</Option>
                    <Option value="售后">售后</Option>
                    <Option value="运维">运维</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="small"
                  >
                    添加
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setShowAddForm(false);
                      addForm.resetFields();
                    }}
                  >
                    取消
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {/* 操作栏 */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          添加参与人
        </Button>
      </div>

      {/* 参与人列表 */}
      <Table
        columns={columns}
        dataSource={participants}
        rowKey={(record) => record.id || record.participantId}
        loading={loading}
        pagination={false}
        size="small"
        locale={{
          emptyText: '暂无参与人',
        }}
      />
    </Modal>
  );
};

export default ParticipantModal; 