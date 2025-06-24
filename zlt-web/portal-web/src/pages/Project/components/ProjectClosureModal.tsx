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
} from 'antd';
import { CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectApi } from '@/services/project';
import type { Project } from '@/types/project';

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

  // 提交结项
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (!project) {
        message.error('项目信息不存在');
        return;
      }

      const closureData = {
        ...values,
        closureTime: values.closureTime?.format('YYYY-MM-DD HH:mm:ss'),
        grossProfit,
        grossProfitRate: Number(grossProfitRate.toFixed(2)),
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
        closureTime: dayjs(),
        contractAmount: 0,
        actualAmount: 0,
        grossProfit: 0,
        grossProfitRate: 0,
      });
    }
  }, [visible, project]);

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
                <strong>立项时间：</strong>{project.startTime ? dayjs(project.startTime).format('YYYY-MM-DD') : '-'}
              </Col>
            </Row>
          </Card>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              closureTime: dayjs(),
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
          </Form>
        </>
      )}
    </Modal>
  );
};

export default ProjectClosureModal; 