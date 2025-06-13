import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  TreeSelect,
  message,
  Spin,
} from 'antd';
import { 
  createWorkPosition,
  updateWorkPosition,
  copyWorkPosition,
  type WorkPosition,
  type WorkPositionSaveDTO 
} from '@/services/organization/position';
import { getDepartmentTree } from '@/services/organization/department';

const { Option } = Select;
const { TextArea } = Input;

interface PositionFormProps {
  visible: boolean;
  mode: 'add' | 'edit' | 'copy';
  position?: WorkPosition | null;
  defaultDepartmentId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const PositionForm: React.FC<PositionFormProps> = ({
  visible,
  mode,
  position,
  defaultDepartmentId,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  // 加载部门数据
  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartmentTree();
      if (response.resp_code === 0) {
        setDepartments(response.datas || []);
      } else {
        message.error('加载部门数据失败');
      }
    } catch (error) {
      console.error('加载部门数据失败:', error);
      message.error('加载部门数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 转换部门树数据
  const convertDepartmentTreeData = (departments: any[]): any[] => {
    return departments.map(dept => ({
      title: dept.name,
      value: dept.id,
      key: dept.id,
      children: dept.children ? convertDepartmentTreeData(dept.children) : undefined,
    }));
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const submitData: WorkPositionSaveDTO = {
        ...values,
        isManager: values.isManager ? 1 : 0,
        isDirector: values.isDirector ? 1 : 0,
        status: values.status ? 1 : 0,
      };

      let response;
      
      if (mode === 'edit' && position) {
        // 编辑模式
        submitData.id = position.id;
        response = await updateWorkPosition(position.id, submitData);
      } else if (mode === 'copy' && position) {
        // 复制模式
        response = await copyWorkPosition(
          position.id,
          values.departmentId,
          values.name
        );
      } else {
        // 新增模式
        response = await createWorkPosition(submitData);
      }

      // 处理响应
      if (response.resp_code === 0) {
        message.success(`${mode === 'edit' ? '更新' : mode === 'copy' ? '复制' : '新增'}成功`);
        onSuccess();
      } else {
        const errorMsg = response.resp_msg || response.msg || response.message || '操作失败';
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error('表单提交失败:', error);
      
      // 解析错误信息
      let errorMessage = '操作失败';
      if (error?.response?.data?.resp_msg) {
        errorMessage = error.response.data.resp_msg;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // 获取模态框标题
  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return '新增岗位';
      case 'edit':
        return '编辑岗位';
      case 'copy':
        return '复制岗位';
      default:
        return '岗位信息';
    }
  };

  // 初始化表单
  useEffect(() => {
    if (visible) {
      loadDepartments();
      
      if (mode === 'edit' && position) {
        // 编辑模式：填充现有数据
        form.setFieldsValue({
          ...position,
          isManager: position.isManager === 1,
          isDirector: position.isDirector === 1,
          status: position.status === 1,
        });
      } else if (mode === 'copy' && position) {
        // 复制模式：填充部分数据，名称需要修改
        form.setFieldsValue({
          ...position,
          name: `${position.name}_副本`,
          isManager: position.isManager === 1,
          isDirector: position.isDirector === 1,
          status: position.status === 1,
          departmentId: defaultDepartmentId || position.departmentId,
        });
      } else {
        // 新增模式：设置默认值
        form.setFieldsValue({
          departmentId: defaultDepartmentId,
          positionLevel: 1,
          maxEmployees: 1,
          isManager: false,
          isDirector: false,
          status: true,
          sortOrder: 1,
        });
      }
    } else {
      form.resetFields();
    }
  }, [visible, mode, position, defaultDepartmentId, form]);

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            positionLevel: 1,
            maxEmployees: 1,
            isManager: false,
            isDirector: false,
            status: true,
            sortOrder: 1,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="岗位名称"
                rules={[
                  { required: true, message: '请输入岗位名称' },
                  { max: 50, message: '岗位名称不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入岗位名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="shortName"
                label="岗位简称"
                rules={[
                  { max: 20, message: '岗位简称不能超过20个字符' },
                ]}
              >
                <Input placeholder="请输入岗位简称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label="所属部门"
                rules={[{ required: true, message: '请选择所属部门' }]}
              >
                <TreeSelect
                  placeholder="请选择所属部门"
                  treeData={convertDepartmentTreeData(departments)}
                  showSearch
                  treeDefaultExpandAll
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="positionLevel"
                label="岗位级别"
                rules={[{ required: true, message: '请选择岗位级别' }]}
              >
                <Select placeholder="请选择岗位级别">
                  <Option value={1}>初级</Option>
                  <Option value={2}>中级</Option>
                  <Option value={3}>高级</Option>
                  <Option value={4}>专家级</Option>
                  <Option value={5}>首席</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="maxEmployees"
                label="最大任职人数"
                rules={[
                  { required: true, message: '请输入最大任职人数' },
                  { type: 'number', min: 1, max: 1000, message: '人数必须在1-1000之间' },
                ]}
              >
                <InputNumber
                  placeholder="最大任职人数"
                  min={1}
                  max={1000}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sortOrder"
                label="排序序号"
                rules={[
                  { type: 'number', min: 0, max: 9999, message: '排序序号必须在0-9999之间' },
                ]}
              >
                <InputNumber
                  placeholder="排序序号"
                  min={0}
                  max={9999}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isManager" label="管理岗位" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isDirector" label="主管岗位" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="salaryRange"
            label="薪资范围"
            rules={[
              { max: 50, message: '薪资范围不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入薪资范围，如：8K-15K" />
          </Form.Item>

          <Form.Item
            name="jobDescription"
            label="岗位职责"
            rules={[
              { max: 500, message: '岗位职责不能超过500个字符' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="请输入岗位职责描述"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="任职要求"
            rules={[
              { max: 500, message: '任职要求不能超过500个字符' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="请输入任职要求"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default PositionForm; 