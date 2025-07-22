import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  message,
  Divider,
  Card,
  Statistic,
  Table,
} from 'antd';
import { CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import moment from 'moment';
import { projectApi } from '@/services/project';
import type { Project } from '@/types/project';
import { getAccrualConfig } from '@/services/projectAccrual';
import { calculateFinancialModelVariables } from '@/services/soo';

const { TextArea } = Input;

interface ProjectClosureModalProps {
  visible: boolean;
  project?: Project;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProjectClosureModal: React.FC<ProjectClosureModalProps> = ({
  visible,
  project,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [grossProfit, setGrossProfit] = useState<number>(0);
  const [grossProfitRate, setGrossProfitRate] = useState<number>(0);
  const [accrualConfigs, setAccrualConfigs] = useState<any[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setGrossProfit(0);
    setGrossProfitRate(0);
  };

  // 计算毛利润和毛利率
  const calculateProfit = () => {
    const actualAmount = form.getFieldValue('actualAmount') || 0;
    const grossProfitValue = form.getFieldValue('grossProfit') || 0;
    
    // 毛利率 = 毛利润 / 项目实际金额
    const rate = actualAmount > 0 ? (grossProfitValue / actualAmount) * 100 : 0;
    
    setGrossProfit(grossProfitValue);
    setGrossProfitRate(rate);
    
    // 更新表单字段
    form.setFieldsValue({
      grossProfitRate: Number(rate.toFixed(2)),
    });
  };

  // 处理合同金额变化
  const handleContractAmountChange = (value: number | null) => {
    // 合同金额变化不影响毛利润计算
  };

  // 处理实际金额变化
  const handleActualAmountChange = (value: number | null) => {
    setTimeout(calculateProfit, 100);
  };

  // 处理毛利润变化
  const handleGrossProfitChange = (value: number | null) => {
    setTimeout(calculateProfit, 100);
  };

  // 毛利润输入框失去焦点时才计算模型变量
  const handleGrossProfitBlur = () => {
    const instanceId = (project as any)?.financial_model_instance_id;
    if (
      instanceId &&
      grossProfit > 0 &&
      accrualConfigs.length > 0
    ) {
      calculateFinancialModelVariables(
        instanceId,
        [{ variableCode: 'gross_profit', variableValue: grossProfit }]
      ).then(res => {
        const data = res?.datas?.data || {};
        setVariableValues(data);
      });
    } else {
      setVariableValues({});
    }
  };

  // 计算分配额和毛利润占比
  const getConfigWithCalc = () => {
    const gp = Number(grossProfit) || 0;
    return accrualConfigs.map((item: any) => {
      const val = variableValues[String(item.modelVariableCode)] !== undefined ? Number(variableValues[String(item.modelVariableCode)]) : undefined;
      const maxAmount = val || 0;
      const maxRatio = gp > 0 && val !== undefined ? Number(((maxAmount / gp) * 100).toFixed(2)) : 0;
      return {
        ...item,
        _maxAmount: maxAmount,
        _maxRatio: maxRatio,
      };
    });
  };

  // 提交结项
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (!project) {
        message.error('项目信息不存在');
        return;
      }

      // 保存时将分配额和毛利润占比赋值到配置
      const configsToSave = getConfigWithCalc().map(item => ({
        ...item,
        maxAmount: item._maxAmount,
        maxRatio: item._maxRatio,
      }));

      const closureData = {
        ...values,
        closureTime: values.closureTime?.format('YYYY-MM-DD HH:mm:ss'),
        grossProfit,
        grossProfitRate: Number(grossProfitRate.toFixed(2)),
        accrualConfigs: configsToSave,
      };

      const response = await projectApi.completeProjectClosure(project.id, closureData);

      if (response.resp_code === 0) {
        message.success('项目结项成功');
        resetForm();
        onSuccess();
      } else {
        message.error(response.resp_msg || '项目结项失败');
      }
    } catch (error) {
      console.error('Failed to complete project closure:', error);
      message.error('项目结项失败');
    } finally {
      setLoading(false);
    }
  };

  // 模态框关闭处理
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // 监听表单可见性
  useEffect(() => {
    if (visible && project) {
      // 初始化表单
      form.setFieldsValue({
        closureTime: moment(),
        contractAmount: 0,
        actualAmount: 0,
        grossProfit: 0,
        grossProfitRate: 0,
      });
    }
  }, [visible, project]);

  // 获取计提配置
  useEffect(() => {
    if (project?.id) {
      getAccrualConfig(project.id).then(res => setAccrualConfigs(res?.datas || []));
    } else {
      setAccrualConfigs([]);
    }
  }, [project]);

  return (
    <Modal
      title="项目结项"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      {project && (
        <>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <strong>项目名称：</strong>{project.name}
              </Col>
              <Col span={12}>
                <strong>项目分类：</strong>{project.category}
              </Col>
              <Col span={12} style={{ marginTop: 8 }}>
                <strong>客户名称：</strong>{project.customerName}
              </Col>
              <Col span={12} style={{ marginTop: 8 }}>
                <strong>立项时间：</strong>{project.startTime ? moment(project.startTime).format('YYYY-MM-DD') : '-'}
              </Col>
            </Row>
          </Card>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              closureTime: moment(),
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="closureTime"
                  label="结项时间"
                  rules={[{ required: true, message: '请选择结项时间' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="选择结项时间"
                    format="YYYY-MM-DD HH:mm:ss"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contractAmount"
                  label="合同金额（元）"
                  rules={[
                    { required: true, message: '请输入合同金额' },
                    { type: 'number', min: 0, message: '金额不能为负数' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入合同金额"
                    precision={2}
                    formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/¥\s?|(,*)/g, '')) || 0}
                    onChange={handleContractAmountChange}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="actualAmount"
                  label="实际金额（元）"
                  rules={[
                    { required: true, message: '请输入实际金额' },
                    { type: 'number', min: 0, message: '金额不能为负数' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入实际金额"
                    precision={2}
                    formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/¥\s?|(,*)/g, '')) || 0}
                    onChange={handleActualAmountChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="grossProfit"
                  label="毛利润（元）"
                  rules={[
                    { required: true, message: '请输入毛利润' },
                    { type: 'number', message: '请输入有效的金额' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入毛利润"
                    precision={2}
                    formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/¥\s?|(,*)/g, '')) || 0}
                    onChange={handleGrossProfitChange}
                    onBlur={handleGrossProfitBlur}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider>毛利润统计</Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="毛利润"
                    value={grossProfit}
                    precision={2}
                    prefix={<DollarOutlined />}
                    suffix="元"
                    valueStyle={{ 
                      color: grossProfit >= 0 ? '#3f8600' : '#cf1322' 
                    }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="毛利率（毛利润/实际金额）"
                    value={grossProfitRate}
                    precision={2}
                    suffix="%"
                    valueStyle={{ 
                      color: grossProfitRate >= 0 ? '#3f8600' : '#cf1322' 
                    }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="项目运行天数"
                    value={(project as any).daysRunning || 0}
                    prefix={<CalendarOutlined />}
                    suffix="天"
                  />
                </Card>
              </Col>
            </Row>

            <Row style={{ marginTop: 16 }}>
              <Col span={24}>
                <Form.Item
                  name="remarks"
                  label="备注说明"
                >
                  <TextArea
                    rows={3}
                    placeholder="请输入结项备注说明（选填）"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* 新增：项目计提配置及分配额展示 */}
            {accrualConfigs.length > 0 && (
              <>
                <Divider>项目计提配置及分配额</Divider>
                <Table
                  columns={[
                    { title: '分配类型', dataIndex: 'type', width: 120, render: (v: string) => {
                      switch (v) {
                        case 'group': return '集团分配';
                        case 'department': return '部门分配';
                        case 'project_individual': return '项目个人分配';
                        case 'project_team': return '项目团队分配';
                        default: return v;
                      }
                    } },
                    { title: '名称', dataIndex: 'name', width: 180 },
                    { title: '模型变量', dataIndex: 'modelVariableCode', width: 180 },
                    { title: '分配额', dataIndex: '_maxAmount', width: 180, render: (val: number) => val !== undefined ? `¥${val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-' },
                    { title: '毛利润占比', dataIndex: '_maxRatio', width: 140, render: (val: number) => val !== undefined ? `${val.toFixed(2)}%` : '-' },
                  ]}
                  dataSource={getConfigWithCalc()}
                  rowKey={(r: any) => String(r.type) + String(r.modelVariableCode || '')}
                  pagination={false}
                  size="small"
                  style={{ marginTop: 16, marginBottom: 8 }}
                />
              </>
            )}
          </Form>
        </>
      )}
    </Modal>
  );
};

export default ProjectClosureModal; 