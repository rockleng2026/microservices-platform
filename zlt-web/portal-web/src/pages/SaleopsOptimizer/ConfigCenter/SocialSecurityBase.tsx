import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message, 
  Popconfirm, 
  Space,
  Row,
  Col,
  Card,
  Divider,
  InputNumber,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { request } from '@/utils/request';
import { getApiUrl } from '@/config/api';
import dayjs from 'dayjs';

const { Option } = Select;

interface SocialSecurityBase {
  id?: number;
  region: string;
  year: number;
  socialSecurityBaseUpper: number;
  socialSecurityBaseLower: number;
  housingFundBaseUpper: number;
  housingFundBaseLower: number;
  pensionPersonalRatio: number;
  medicalPersonalRatio: number;
  unemploymentPersonalRatio: number;
  housingFundPersonalRatio: number;
  pensionCompanyRatio: number;
  medicalCompanyRatio: number;
  unemploymentCompanyRatio: number;
  maternityCompanyRatio: number;
  injuryCompanyRatio: number;
  housingFundCompanyRatio: number;
  effectiveDate: string;
  expireDate?: string;
  status: number;
  remark?: string;
}

const SocialSecurityBase: React.FC<{ active: boolean }> = ({ active }) => {
  const [data, setData] = useState<SocialSecurityBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [editing, setEditing] = useState<SocialSecurityBase | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchParams, setSearchParams] = useState<any>({});
  const [regionList, setRegionList] = useState<any[]>([]);
  const [yearList, setYearList] = useState<number[]>([]);

  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [copyForm] = Form.useForm();

  const loadData = async (page = 1, pageSize = 10, searchConditions = {}) => {
    setLoading(true);
    try {
      const params = {
        pageNum: page,
        pageSize,
        ...searchConditions,
      };
      const res = await request(getApiUrl('/api/soo/social-security-base/page', 'SOO'), { params });
      if (res && res.resp_code === 0) {
        setData(res.data || []);
        setPagination({
          current: page,
          pageSize,
          total: res.count || 0,
        });
      }
    } catch (e: any) {
      message.error(e.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRegionList = async () => {
    try {
      const res = await request(getApiUrl('/api/soo/social-security-base/regions', 'SOO'));
      if (res && res.resp_code === 0) {
        setRegionList(res.datas || []);
      }
    } catch (e) {
      console.error('加载地区列表失败:', e);
    }
  };

  const loadYearList = async () => {
    try {
      const res = await request(getApiUrl('/api/soo/social-security-base/years', 'SOO'));
      if (res && res.resp_code === 0) {
        setYearList(res.datas || []);
      }
    } catch (e) {
      console.error('加载年度列表失败:', e);
    }
  };

  useEffect(() => {
    if (active) {
      loadData();
      loadRegionList();
      loadYearList();
    }
  }, [active]);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchParams(values);
    loadData(1, pagination.pageSize, values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({});
    loadData(1, pagination.pageSize, {});
  };

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      year: new Date().getFullYear(),
      status: 1,
      effectiveDate: dayjs().startOf('year'),
    });
  };

  const handleEdit = (record: SocialSecurityBase) => {
    setEditing(record);
    setModalOpen(true);
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
        expireDate: values.expireDate ? values.expireDate.format('YYYY-MM-DD') : undefined,
      };

      let res;
      if (editing) {
        res = await request(getApiUrl(`/api/soo/social-security-base/${editing.id}`, 'SOO'), { 
          method: 'PUT', 
          data: submitData 
        });
      } else {
        res = await request(getApiUrl('/api/soo/social-security-base', 'SOO'), { 
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

  const handleDelete = async (record: SocialSecurityBase) => {
    try {
      const res = await request(getApiUrl(`/api/soo/social-security-base/${record.id}`, 'SOO'), { 
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
  };

  const handleCopy = () => {
    setCopyModalOpen(true);
    copyForm.resetFields();
  };

  const handleCopyOk = async () => {
    try {
      const values = await copyForm.validateFields();
      const res = await request(getApiUrl('/api/soo/social-security-base/copy-from-previous-year', 'SOO'), {
        method: 'POST',
        params: values,
      });

      if (res && res.resp_code === 0) {
        message.success(res.resp_msg || '复制成功');
        setCopyModalOpen(false);
        loadData(pagination.current, pagination.pageSize, searchParams);
      } else {
        message.error(res?.resp_msg || '复制失败');
      }
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || '复制失败');
    }
  };

  const getRegionName = (regionCode: string) => {
    const region = regionList.find(r => r.code === regionCode);
    return region ? region.name : regionCode;
  };

  const columns = [
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      render: (region: string) => getRegionName(region),
    },
    {
      title: '年度',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: '社保基数',
      key: 'socialSecurityBase',
      render: (record: SocialSecurityBase) => (
        <div>
          <div>上限: ¥{record.socialSecurityBaseUpper?.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            下限: ¥{record.socialSecurityBaseLower?.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '公积金基数',
      key: 'housingFundBase',
      render: (record: SocialSecurityBase) => (
        <div>
          <div>上限: ¥{record.housingFundBaseUpper?.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            下限: ¥{record.housingFundBaseLower?.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '个人缴费比例',
      key: 'personalRatio',
      render: (record: SocialSecurityBase) => (
        <div>
          <div>养老: {record.pensionPersonalRatio}%</div>
          <div>医疗: {record.medicalPersonalRatio}%</div>
          <div>失业: {record.unemploymentPersonalRatio}%</div>
          <div>公积金: {record.housingFundPersonalRatio}%</div>
        </div>
      ),
    },
    {
      title: '公司缴费比例',
      key: 'companyRatio',
      render: (record: SocialSecurityBase) => (
        <div>
          <div>养老: {record.pensionCompanyRatio}%</div>
          <div>医疗: {record.medicalCompanyRatio}%</div>
          <div>失业: {record.unemploymentCompanyRatio}%</div>
          <div>生育: {record.maternityCompanyRatio}%</div>
          <div>工伤: {record.injuryCompanyRatio}%</div>
          <div>公积金: {record.housingFundCompanyRatio}%</div>
        </div>
      ),
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: SocialSecurityBase) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条配置吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
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
      ),
    },
  ];

  const renderSearchForm = () => (
    <Card style={{ marginBottom: 16 }}>
      <Form form={searchForm} layout="inline">
        <Form.Item name="region" label="地区">
          <Select placeholder="请选择地区" style={{ width: 120 }} allowClear>
            {regionList.map(region => (
              <Option key={region.code} value={region.code}>{region.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="year" label="年度">
          <Select placeholder="请选择年度" style={{ width: 120 }} allowClear>
            {yearList.map(year => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
            <Option value={1}>启用</Option>
            <Option value={0}>禁用</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  const renderModalForm = () => (
    <Modal
      title={editing ? '编辑社保公积金基数配置' : '新增社保公积金基数配置'}
      open={modalOpen}
      onOk={handleModalOk}
      onCancel={handleModalCancel}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="region" label="地区" rules={[{ required: true, message: '请选择地区' }]}>
              <Select placeholder="请选择地区">
                {regionList.map(region => (
                  <Option key={region.code} value={region.code}>{region.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="year" label="年度" rules={[{ required: true, message: '请选择年度' }]}>
              <Select placeholder="请选择年度">
                {yearList.map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">基数设置</Divider>
        
                 <Row gutter={16}>
           <Col span={12}>
             <Form.Item name="socialSecurityBaseUpper" label="社保基数上限" rules={[{ required: true, message: '请输入社保基数上限' }]}>
               <InputNumber
                 style={{ width: '100%' }}
                 placeholder="请输入社保基数上限"
                 min={0}
                 precision={2}
                 addonBefore="¥"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item name="socialSecurityBaseLower" label="社保基数下限" rules={[{ required: true, message: '请输入社保基数下限' }]}>
               <InputNumber
                 style={{ width: '100%' }}
                 placeholder="请输入社保基数下限"
                 min={0}
                 precision={2}
                 addonBefore="¥"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item name="housingFundBaseUpper" label="公积金基数上限" rules={[{ required: true, message: '请输入公积金基数上限' }]}>
               <InputNumber
                 style={{ width: '100%' }}
                 placeholder="请输入公积金基数上限"
                 min={0}
                 precision={2}
                 addonBefore="¥"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item name="housingFundBaseLower" label="公积金基数下限" rules={[{ required: true, message: '请输入公积金基数下限' }]}>
               <InputNumber
                 style={{ width: '100%' }}
                 placeholder="请输入公积金基数下限"
                 min={0}
                 precision={2}
                 addonBefore="¥"
               />
             </Form.Item>
           </Col>
         </Row>

        <Divider orientation="left">个人缴费比例（%）</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="pensionPersonalRatio" label="养老保险个人比例" rules={[{ required: true, message: '请输入养老保险个人比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如8表示8%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="medicalPersonalRatio" label="医疗保险个人比例" rules={[{ required: true, message: '请输入医疗保险个人比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如2表示2%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="unemploymentPersonalRatio" label="失业保险个人比例" rules={[{ required: true, message: '请输入失业保险个人比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如0.5表示0.5%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="housingFundPersonalRatio" label="公积金个人比例" rules={[{ required: true, message: '请输入公积金个人比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如12表示12%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">公司缴费比例（%）</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="pensionCompanyRatio" label="养老保险公司比例" rules={[{ required: true, message: '请输入养老保险公司比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如16表示16%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="medicalCompanyRatio" label="医疗保险公司比例" rules={[{ required: true, message: '请输入医疗保险公司比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如10表示10%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="unemploymentCompanyRatio" label="失业保险公司比例" rules={[{ required: true, message: '请输入失业保险公司比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如1表示1%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="maternityCompanyRatio" label="生育保险公司比例" rules={[{ required: true, message: '请输入生育保险公司比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如0.8表示0.8%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="injuryCompanyRatio" label="工伤保险公司比例" rules={[{ required: true, message: '请输入工伤保险公司比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如0.5表示0.5%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="housingFundCompanyRatio" label="公积金公司比例" rules={[{ required: true, message: '请输入公积金公司比例' }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入比例，如12表示12%"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select placeholder="请选择状态">
                <Option value={1}>启用</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">其他信息</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="expireDate" label="失效日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );

  const renderCopyModal = () => (
    <Modal
      title="复制上一年度配置"
      open={copyModalOpen}
      onOk={handleCopyOk}
      onCancel={() => setCopyModalOpen(false)}
      width={500}
    >
      <Form form={copyForm} layout="vertical">
        <Form.Item name="sourceYear" label="源年度" rules={[{ required: true, message: '请选择源年度' }]}>
          <Select placeholder="请选择要复制的年度">
            {yearList.map(year => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="targetYear" label="目标年度" rules={[{ required: true, message: '请选择目标年度' }]}>
          <Select placeholder="请选择复制到的年度">
            {yearList.map(year => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="regions" label="地区（可选）">
          <Select mode="multiple" placeholder="选择要复制的地区，不选则复制所有地区" allowClear>
            {regionList.map(region => (
              <Option key={region.code} value={region.code}>{region.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div style={{ padding: 24 }}>
      {renderSearchForm()}
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增配置
            </Button>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              复制上一年度
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              loadData(page, pageSize, searchParams);
            },
          }}
        />
      </Card>

      {renderModalForm()}
      {renderCopyModal()}
    </div>
  );
};

export default SocialSecurityBase; 