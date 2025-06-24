import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  message,
  Modal,
  Form,
  Row,
  Col,
  Tag,
  Empty,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageContainer } from '@ant-design/pro-components';
import { templateApi } from '@/services/project';
import type {
  ProjectTemplate,
  FormMode,
} from '@/types/project';

const { Search } = Input;

const ProjectTemplatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [templateList, setTemplateList] = useState<ProjectTemplate[]>([]);
  const [modalForm] = Form.useForm();

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<FormMode>('create');
  const [currentTemplate, setCurrentTemplate] = useState<ProjectTemplate | undefined>();

  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('');

  // 获取模板列表
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await templateApi.getTemplates();
      
      if (response.code === 0) {
        setTemplateList(response.data || []);
      } else {
        message.error(response.message || '获取模板列表失败');
      }
    } catch (error) {
      message.error('获取模板列表失败');
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchTemplates();
  }, []);

  // 过滤模板数据
  const getFilteredTemplates = () => {
    if (!searchKeyword) return templateList;
    return templateList.filter(template => 
      template.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      template.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchKeyword.toLowerCase()))
    );
  };

  // 新增模板
  const handleAdd = () => {
    setModalMode('create');
    setCurrentTemplate(undefined);
    modalForm.resetFields();
    modalForm.setFieldsValue({
      participantRoles: ['销售', '技术'], // 默认角色
    });
    setModalVisible(true);
  };

  // 编辑模板
  const handleEdit = (record: ProjectTemplate) => {
    setModalMode('edit');
    setCurrentTemplate(record);
    modalForm.setFieldsValue({
      ...record,
      participantRoles: record.participantRoles || [],
    });
    setModalVisible(true);
  };

  // 查看模板
  const handleView = (record: ProjectTemplate) => {
    setModalMode('view');
    setCurrentTemplate(record);
    modalForm.setFieldsValue({
      ...record,
      participantRoles: record.participantRoles || [],
    });
    setModalVisible(true);
  };

  // 复制模板
  const handleCopy = (record: ProjectTemplate) => {
    setModalMode('create');
    setCurrentTemplate(undefined);
    modalForm.setFieldsValue({
      name: `${record.name}_副本`,
      category: record.category,
      description: record.description,
      participantRoles: record.participantRoles || [],
    });
    setModalVisible(true);
  };

  // 删除模板
  const handleDelete = (record: ProjectTemplate) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模板"${record.name}"吗？此操作不可撤销。`,
      onOk: async () => {
        try {
          const response = await templateApi.deleteTemplate(record.id);
          if (response.code === 0) {
            message.success('删除成功');
            fetchTemplates();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete template:', error);
        }
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await modalForm.validateFields();
      setLoading(true);

      const submitData = {
        ...values,
        templateData: {
          // 模板数据可以包含项目的默认配置
          defaultFields: values,
          createdAt: new Date().toISOString(),
        },
      };

      let response;
      if (modalMode === 'create') {
        response = await templateApi.createTemplate(submitData);
      } else {
        response = await templateApi.updateTemplate(currentTemplate!.id, submitData);
      }

      if (response.code === 0) {
        message.success(modalMode === 'create' ? '创建成功' : '更新成功');
        setModalVisible(false);
        fetchTemplates();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('Failed to submit template:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<ProjectTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '参与角色',
      dataIndex: 'participantRoles',
      key: 'participantRoles',
      width: 200,
      render: (roles: string[]) => (
        <Space wrap>
          {roles?.map((role, index) => (
            <Tag key={index} color="green">
              {role}
            </Tag>
          )) || '-'}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: ProjectTemplate) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}
          >
            复制
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const filteredTemplates = getFilteredTemplates();

  return (
    <PageContainer
      title="项目模板"
      breadcrumb={{
        routes: [
          { path: '/project', breadcrumbName: '项目管理' },
          { path: '/project/template', breadcrumbName: '项目模板' },
        ],
      }}
    >
      <Card>
        {/* 搜索和操作栏 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索模板名称、分类或描述"
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={setSearchKeyword}
            />
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增模板
              </Button>
              <Button onClick={fetchTemplates} loading={loading}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 模板列表 */}
        {filteredTemplates.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredTemplates}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        ) : (
          <Empty
            description={
              searchKeyword
                ? '没有找到匹配的模板'
                : '暂无项目模板'
            }
          />
        )}
      </Card>

      {/* 模板表单弹窗 */}
      <Modal
        title={
          modalMode === 'create' ? '新增项目模板' :
          modalMode === 'edit' ? '编辑项目模板' : '查看项目模板'
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={modalMode === 'view' ? undefined : handleSubmit}
        confirmLoading={loading}
        width={600}
        footer={
          modalMode === 'view' ? (
            <Button onClick={() => setModalVisible(false)}>关闭</Button>
          ) : (
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" loading={loading} onClick={handleSubmit}>
                {modalMode === 'create' ? '创建' : '更新'}
              </Button>
            </Space>
          )
        }
        destroyOnClose
      >
        <Form
          form={modalForm}
          layout="vertical"
          disabled={modalMode === 'view'}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="模板名称"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="请输入模板名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="项目分类"
                rules={[{ required: true, message: '请输入项目分类' }]}
              >
                <Input placeholder="如：党建项目、IDC项目、软件项目" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="participantRoles"
                label="参与角色"
                rules={[{ required: true, message: '请选择参与角色' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择默认的参与角色"
                  options={[
                    { label: '销售', value: '销售' },
                    { label: '技术', value: '技术' },
                    { label: '产品经理', value: '产品经理' },
                    { label: '售前', value: '售前' },
                    { label: '售后', value: '售后' },
                    { label: '运维', value: '运维' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="模板描述"
              >
                <Input.TextArea 
                  placeholder="请输入模板描述和使用说明" 
                  rows={3}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProjectTemplatePage; 