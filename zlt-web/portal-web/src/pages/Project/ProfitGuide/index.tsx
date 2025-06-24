import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Modal,
  Form,
  Row,
  Col,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageContainer } from '@ant-design/pro-components';
import { profitGuideApi } from '@/services/project';
import type {
  ProductProfitDistributionGuide,
  ProfitGuideQueryParams,
  ProfitGuideSaveParams,
  FormMode,
} from '@/types/project';

const { Search } = Input;
const { Option } = Select;

const ProfitGuidePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [profitGuideList, setProfitGuideList] = useState<ProductProfitDistributionGuide[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<FormMode>('create');
  const [currentGuide, setCurrentGuide] = useState<ProductProfitDistributionGuide | undefined>();

  // 搜索条件
  const [searchParams, setSearchParams] = useState<Partial<ProfitGuideQueryParams>>({});

  // 获取分配指导列表
  const fetchProfitGuides = async (params?: Partial<ProfitGuideQueryParams>) => {
    setLoading(true);
    try {
      const queryParams: ProfitGuideQueryParams = {
        page: current,
        size: pageSize,
        ...searchParams,
        ...params,
      };

      const response = await profitGuideApi.getProfitGuidePage(queryParams);
      
      if (response.code === 0) {
        setProfitGuideList(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      message.error('获取数据失败');
      console.error('Failed to fetch profit guides:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchProfitGuides();
  }, [current, pageSize]);

  // 搜索处理
  const handleSearch = (values: any) => {
    setSearchParams(values);
    setCurrent(1);
    fetchProfitGuides(values);
  };

  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    setSearchParams({});
    setCurrent(1);
    fetchProfitGuides({});
  };

  // 新增分配指导
  const handleAdd = () => {
    setModalMode('create');
    setCurrentGuide(undefined);
    modalForm.resetFields();
    setModalVisible(true);
  };

  // 编辑分配指导
  const handleEdit = (record: ProductProfitDistributionGuide) => {
    setModalMode('edit');
    setCurrentGuide(record);
    modalForm.setFieldsValue(record);
    setModalVisible(true);
  };

  // 删除分配指导
  const handleDelete = (record: ProductProfitDistributionGuide) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除产品"${record.productName}"的角色"${record.role}"的分配指导吗？`,
      onOk: async () => {
        try {
          const response = await profitGuideApi.deleteProfitGuide(record.id);
          if (response.code === 0) {
            message.success('删除成功');
            fetchProfitGuides();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete profit guide:', error);
        }
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await modalForm.validateFields();
      setLoading(true);

      const submitData: ProfitGuideSaveParams = values;

      let response;
      if (modalMode === 'create') {
        response = await profitGuideApi.createProfitGuide(submitData);
      } else {
        response = await profitGuideApi.updateProfitGuide(currentGuide!.id, submitData);
      }

      if (response.code === 0) {
        message.success(modalMode === 'create' ? '创建成功' : '更新成功');
        setModalVisible(false);
        fetchProfitGuides();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('Failed to submit profit guide:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<ProductProfitDistributionGuide> = [
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '提成类型',
      dataIndex: 'commissionType',
      key: 'commissionType',
      width: 100,
      render: (text: string) => (
        <Tag color={text === 'ratio' ? 'green' : 'orange'}>
          {text === 'ratio' ? '比例' : '金额'}
        </Tag>
      ),
    },
    {
      title: '数值范围',
      dataIndex: 'valueRange',
      key: 'valueRange',
      width: 120,
      render: (text: string, record: ProductProfitDistributionGuide) => {
        if (!text) return '-';
        const suffix = record.commissionType === 'ratio' ? '%' : '元';
        return `${text}${suffix}`;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-',
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
      width: 150,
      fixed: 'right',
      render: (_, record: ProductProfitDistributionGuide) => (
        <Space size="small">
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

  // 表格分页配置
  const pagination = {
    current,
    pageSize,
    total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    onChange: (page: number, size: number) => {
      setCurrent(page);
      setPageSize(size);
    },
  };

  return (
    <PageContainer
      title="产品毛利配置"
      breadcrumb={{
        routes: [
          { path: '/project', breadcrumbName: '项目管理' },
          { path: '/project/profit-guide', breadcrumbName: '产品毛利配置' },
        ],
      }}
    >
      <Card>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="productName" label="产品名称">
                <Input placeholder="请输入产品名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="role" label="角色">
                <Select placeholder="请选择角色" allowClear>
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
              <Form.Item name="commissionType" label="提成类型">
                <Select placeholder="请选择提成类型" allowClear>
                  <Option value="ratio">比例</Option>
                  <Option value="amount">金额</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  查询
                </Button>
                <Button onClick={handleResetSearch} icon={<ReloadOutlined />}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        {/* 操作栏 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增配置
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchProfitGuides()}>
              刷新
            </Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={profitGuideList}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* 表单弹窗 */}
      <Modal
        title={modalMode === 'create' ? '新增毛利配置' : '编辑毛利配置'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form
          form={modalForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="productName"
                label="产品名称"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Select placeholder="请选择或输入产品名称" showSearch allowClear>
                  <Option value="党建项目">党建项目</Option>
                  <Option value="IDC项目">IDC项目</Option>
                  <Option value="软件项目">软件项目</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
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
            <Col span={12}>
              <Form.Item
                name="commissionType"
                label="提成类型"
                rules={[{ required: true, message: '请选择提成类型' }]}
              >
                <Select placeholder="请选择提成类型">
                  <Option value="ratio">比例 (%)</Option>
                  <Option value="amount">金额 (元)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="valueRange"
                label="数值范围"
                rules={[{ required: true, message: '请输入数值范围' }]}
              >
                <Input placeholder="例如：3-5 或 500-2000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="remark"
                label="备注"
              >
                <Input.TextArea 
                  placeholder="请输入备注信息" 
                  rows={3}
                  maxLength={255}
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

export default ProfitGuidePage; 