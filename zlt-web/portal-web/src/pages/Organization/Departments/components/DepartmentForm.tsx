import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  TreeSelect,
  Button,
  Space,
  message,
} from 'antd';
import { getEmployeePage } from '@/services/organization/employee';

const { Option } = Select;
const { TextArea } = Input;

interface DepartmentFormProps {
  open: boolean;
  title: string;
  type: 'add' | 'edit' | 'copy';
  initialValues?: any;
  parentDeptInfo?: any; // 新增子部门时的父部门信息
  onCancel: () => void;
  onSubmit: (values: any) => void;
  treeData: any[];
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  open,
  title,
  type,
  initialValues,
  parentDeptInfo,
  onCancel,
  onSubmit,
  treeData,
}) => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 转换树数据为TreeSelect格式，显示部门名称
  const convertTreeDataForSelect = (data: any[]): any[] => {
    return data.map(item => ({
      title: item.name, // 显示部门名称
      value: item.id,   // 值是部门ID
      key: item.id,
      children: item.children ? convertTreeDataForSelect(item.children) : undefined,
    }));
  };

  // 获取员工列表
  const loadEmployees = async () => {
    try {
      let departmentId = null;
      
      // 根据操作类型确定要查询的部门
      if (type === 'edit' && initialValues?.id) {
        // 编辑时：获取当前部门的员工
        departmentId = initialValues.id;
      } else if (type === 'add' && parentDeptInfo?.id) {
        // 新增子部门时：获取父部门的员工（但通常应该为空，因为是新部门）
        // 这里暂时不加载员工，因为新部门还没有员工
        setEmployees([]);
        return;
      } else {
        // 其他情况：新增根部门，不应该有员工选择
        setEmployees([]);
        return;
      }
      
      // 这里应该调用按部门获取员工的API
      // const response = await getEmployeesByDepartment(departmentId);
      // 暂时使用模拟数据
      const mockEmployees = [
        { id: '1', name: '张三', workNo: 'E001' },
        { id: '2', name: '李四', workNo: 'E002' },
        { id: '3', name: '王建华', workNo: 'E003' },
        { id: '4', name: '刘华强', workNo: 'E005' },
        { id: '5', name: '孙丽', workNo: 'E008' },
        { id: '6', name: '黄飞鸿', workNo: 'E010' },
      ];
      
      // 只有编辑现有部门时才显示员工列表
      if (type === 'edit') {
        setEmployees(mockEmployees);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('获取员工列表失败:', error);
      setEmployees([]);
    }
    
    // 如果需要使用真实API，可以取消注释以下代码
    /*
    try {
      const response = await getEmployeePage({ 
        page: 1, 
        size: 100, // 获取前100个员工
        status: 1   // 只获取在职员工
      });
      
      // 适配API响应格式
      const isSuccess = response && (
        response.success === true || 
        (response.resp_code !== undefined && response.resp_code === 0)
      );
      
      if (isSuccess) {
        const employeeData = response.data?.records || response.datas || [];
        const formattedEmployees = employeeData.map((emp: any) => ({
          id: emp.id?.toString(),
          name: emp.name,
          workNo: emp.empNo,
        }));
        setEmployees(formattedEmployees);
        console.log('成功获取员工列表:', formattedEmployees.length);
      } else {
        console.error('员工API响应失败:', response?.message || response?.resp_msg);
        setEmployees(mockEmployees);
      }
    } catch (error) {
      console.error('员工API调用异常:', error);
      setEmployees(mockEmployees);
    }
    */
  };

  useEffect(() => {
    if (open) {
      loadEmployees();
      
      // 处理表单初始值
      if (type === 'edit' && initialValues) {
        // 编辑时使用现有数据
        const formValues = {
          ...initialValues,
          status: initialValues.status === 1, // 转换状态为boolean
        };
        form.setFieldsValue(formValues);
      } else if (type === 'add' && parentDeptInfo) {
        // 新增子部门时设置父部门
        form.setFieldsValue({
          parentId: parentDeptInfo.id,
          gradeid: Math.min((parentDeptInfo.gradeid || 1) + 1, 7),
          status: true,
        });
      } else {
        // 其他情况重置表单
        form.resetFields();
      }
    }
  }, [open, initialValues, parentDeptInfo, type, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 转换状态值
      const submitValues = {
        ...values,
        status: values.status ? 1 : 0,
      };
      
      await onSubmit(submitValues);
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      width={600}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          确定
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: true,
          gradeid: 1,
        }}
      >
        {type === 'copy' && (
          <Form.Item
            name="sourceId"
            label="源部门"
            rules={[{ required: true, message: '请选择要复制的部门' }]}
          >
            <TreeSelect
              treeData={convertTreeDataForSelect(treeData)}
              placeholder="请选择要复制的部门"
              allowClear
              showSearch
              treeDefaultExpandAll
            />
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label="部门名称"
          rules={[{ required: true, message: '请输入部门名称' }]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>

        <Form.Item
          name="depNo"
          label="部门编号"
          rules={[{ required: true, message: '请输入部门编号' }]}
        >
          <Input placeholder="请输入部门编号" />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="上级部门"
        >
          <TreeSelect
            treeData={convertTreeDataForSelect(treeData)}
            placeholder="请选择上级部门"
            allowClear
            showSearch
            treeDefaultExpandAll
          />
        </Form.Item>

        <Form.Item
          name="directorId"
          label="部门主管"
        >
          <Select 
            placeholder="请选择部门主管" 
            allowClear
            showSearch
            filterOption={(input, option: any) =>
              option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {employees.map(emp => (
              <Option key={emp.id} value={emp.id}>
                {emp.name} ({emp.workNo})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="gradeid"
          label="部门等级"
          rules={[{ required: true, message: '请选择部门等级' }]}
        >
          <Select placeholder="请选择部门等级">
            <Option value={1}>1级部门</Option>
            <Option value={2}>2级部门</Option>
            <Option value={3}>3级部门</Option>
            <Option value={4}>4级部门</Option>
            <Option value={5}>5级部门</Option>
            <Option value={6}>6级部门</Option>
            <Option value={7}>7级部门</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="tel"
          label="联系电话"
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>

        <Form.Item
          name="address"
          label="办公地址"
        >
          <Input placeholder="请输入办公地址" />
        </Form.Item>

        <Form.Item
          name="description"
          label="部门描述"
        >
          <TextArea rows={4} placeholder="请输入部门描述" />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          valuePropName="checked"
        >
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentForm; 