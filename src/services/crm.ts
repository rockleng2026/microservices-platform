import request from '../utils/request';

// 统一处理响应数据格式兼容性
const handleResponse = (response: any) => {
  // 兼容新旧数据格式
  if (response.resp_code === 0) {
    return {
      success: true,
      data: response.datas || response.data
    };
  } else if (response.success) {
    return response;
  } else {
    return {
      success: false,
      message: response.resp_msg || response.message || '请求失败'
    };
  }
};

// 处理长整型字段精度丢失问题
const convertLongFields = (data: any) => {
  if (!data) return data;
  
  const convert = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(convert);
    }
    
    if (typeof obj === 'object') {
      const converted: any = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        // 对于可能是长整型的字段，转换为字符串
        if (typeof value === 'number' && (
          key.endsWith('Id') || 
          key === 'id' || 
          key === 'customerId' || 
          key === 'ownerId' ||
          key === 'tenantId'
        )) {
          converted[key] = String(value);
        } else {
          converted[key] = convert(value);
        }
      });
      return converted;
    }
    
    return obj;
  };
  
  return convert(data);
};

// ==================== 客户管理相关API ====================

// 分页查询客户列表
export const getCustomerList = (params: any) => {
  return request.post('/crm/customer/page', convertLongFields(params))
    .then(handleResponse);
};

// 获取客户详情
export const getCustomerDetail = (customerId: string) => {
  return request.get(`/crm/customer/${customerId}`);
};

// 创建客户
export const createCustomer = (data: any) => {
  return request.post('/crm/customer/create', convertLongFields(data));
};

// 更新客户
export const updateCustomer = (customerId: string, data: any) => {
  return request.post(`/crm/customer/update/${customerId}`, convertLongFields(data));
};

// 删除客户
export const deleteCustomer = (customerId: string) => {
  return request.delete(`/crm/customer/${customerId}`);
};

// 批量删除客户
export const batchDeleteCustomers = (customerIds: string[]) => {
  return request.post('/crm/customer/batch-delete', { customerIds });
};

// 客户验证
export const validateCustomer = (data: any) => {
  return request.post('/crm/customer/validate', convertLongFields(data));
};

// 批量更新客户状态
export const batchUpdateCustomerStatus = (data: any) => {
  return request.post('/crm/customer/batch-status', convertLongFields(data));
};

// 获取客户统计
export const getCustomerStatistics = (params: any) => {
  return request.post('/crm/customer/statistics', convertLongFields(params));
};

// ==================== 商机管理相关API ====================

// 分页查询商机列表
export const getOpportunityList = (params: any) => {
  return request.post('/crm/opportunity/page', convertLongFields(params));
};

// 获取商机详情
export const getOpportunityDetail = (opportunityId: string) => {
  return request.get(`/crm/opportunity/${opportunityId}`);
};

// 创建商机
export const createOpportunity = (data: any) => {
  return request.post('/crm/opportunity/create', convertLongFields(data));
};

// 更新商机
export const updateOpportunity = (opportunityId: string, data: any) => {
  return request.post(`/crm/opportunity/update/${opportunityId}`, convertLongFields(data));
};

// 删除商机
export const deleteOpportunity = (opportunityId: string) => {
  return request.delete(`/crm/opportunity/${opportunityId}`);
};

// 获取商机统计
export const getOpportunityStatistics = (params: any) => {
  return request.post('/crm/opportunity/statistics', convertLongFields(params));
};

// ==================== 跟进记录相关API ====================

// 分页查询跟进记录列表
export const getFollowRecordList = (params: any) => {
  return request.post('/crm/follow/page', convertLongFields(params));
};

// 获取跟进记录详情
export const getFollowRecordDetail = (followId: string) => {
  return request.get(`/crm/follow/${followId}`);
};

// 创建跟进记录
export const createFollowRecord = (data: any) => {
  return request.post('/crm/follow/create', convertLongFields(data));
};

// 更新跟进记录
export const updateFollowRecord = (followId: string, data: any) => {
  return request.post(`/crm/follow/update/${followId}`, convertLongFields(data));
};

// 删除跟进记录
export const deleteFollowRecord = (followId: string) => {
  return request.delete(`/crm/follow/${followId}`);
};

// 获取待跟进客户
export const getPendingFollowups = (params: any) => {
  return request.post('/crm/follow/pending', convertLongFields(params));
};

// 获取跟进统计
export const getFollowStatistics = (params: any) => {
  return request.post('/crm/follow/statistics', convertLongFields(params));
};

// 获取最近跟进记录
export const getRecentFollowups = (params: any) => {
  return request.post('/crm/follow/recent', convertLongFields(params));
};

// ==================== 客户移交相关API ====================

// 分页查询移交记录列表
export const getTransferList = (params: any) => {
  return request.post('/crm/transfer/page', convertLongFields(params));
};

// 获取移交记录详情
export const getTransferDetail = (transferId: string) => {
  return request.get(`/crm/transfer/${transferId}`);
};

// 创建移交记录
export const createTransfer = (data: any) => {
  return request.post('/crm/transfer/create', convertLongFields(data));
};

// 审核移交申请
export const approveTransfer = (transferId: string, data: any) => {
  return request.post(`/crm/transfer/approve/${transferId}`, convertLongFields(data));
};

// 拒绝移交申请
export const rejectTransfer = (transferId: string, data: any) => {
  return request.post(`/crm/transfer/reject/${transferId}`, convertLongFields(data));
};

// ==================== 工作台相关API ====================

// 获取工作台统计数据
export const getDashboardStats = (params: any) => {
  return request.post('/api-crm/api/dashboard/overview', convertLongFields(params))
    .then(handleResponse);
};

// 获取销售排行榜
export const getTopPerformers = (params: any) => {
  return request.post('/crm/dashboard/top-performers', convertLongFields(params));
};

// 获取最近活动
export const getRecentActivities = (params: any) => {
  return request.post('/crm/dashboard/recent-activities', convertLongFields(params));
};

// 获取待办任务
export const getPendingTasks = (params: any) => {
  return request.post('/crm/dashboard/pending-tasks', convertLongFields(params));
};

// 获取销售图表数据
export const getSalesChart = (params: any) => {
  return request.post('/crm/dashboard/sales-chart', convertLongFields(params));
};

// 获取即将跟进的客户
export const getUpcomingFollowUps = (params: any) => {
  return request.post('/crm/dashboard/upcoming-followups', convertLongFields(params));
};

// ==================== 员工管理相关API ====================

// 获取员工列表
export const getEmployeeList = (params: any) => {
  return request.post('/crm/employee/list', convertLongFields(params));
};

// 获取员工详情
export const getEmployeeDetail = (employeeId: string) => {
  return request.get(`/crm/employee/${employeeId}`);
};

// ==================== 枚举和常量 ====================

// CRM枚举类定义
export const CRMEnums = {
  // 客户类型
  CustomerType: {
    INDIVIDUAL: { value: 'individual', label: '个人' },
    ENTERPRISE: { value: 'enterprise', label: '企业' },
  },
  
  // 客户状态
  CustomerStatus: {
    POTENTIAL: { value: 'potential', label: '意向' },
    CONFIRMED: { value: 'confirmed', label: '正式' },
    LOST: { value: 'lost', label: '流失' },
  },

  // 商机阶段
  OpportunityStage: {
    QUALIFICATION: { value: 'qualification', label: '资格审查' },
    NEEDS_ANALYSIS: { value: 'needs_analysis', label: '需求分析' },
    PROPOSAL: { value: 'proposal', label: '方案提议' },
    NEGOTIATION: { value: 'negotiation', label: '谈判' },
    CLOSED_WON: { value: 'closed_won', label: '成交' },
    CLOSED_LOST: { value: 'closed_lost', label: '失败' },
  },

  // 跟进方式
  FollowType: {
    PHONE: { value: 'phone', label: '电话' },
    VISIT: { value: 'visit', label: '拜访' },
    EMAIL: { value: 'email', label: '邮件' },
    WECHAT: { value: 'wechat', label: '微信' },
    OTHER: { value: 'other', label: '其他' },
  },

  // 审批状态
  ApprovalStatus: {
    PENDING: { value: 'pending', label: '待审批' },
    APPROVED: { value: 'approved', label: '已通过' },
    REJECTED: { value: 'rejected', label: '已拒绝' },
  },

  // 性别
  Gender: {
    MALE: { value: 'male', label: '男' },
    FEMALE: { value: 'female', label: '女' },
    UNKNOWN: { value: 'unknown', label: '未知' },
  },
  
  // 婚姻状况
  MaritalStatus: {
    SINGLE: { value: 'single', label: '未婚' },
    MARRIED: { value: 'married', label: '已婚' },
    DIVORCED: { value: 'divorced', label: '离异' },
    WIDOWED: { value: 'widowed', label: '丧偶' },
    UNKNOWN: { value: 'unknown', label: '未知' },
  },

  // 教育程度
  Education: {
    PRIMARY: { value: 'primary', label: '小学' },
    JUNIOR: { value: 'junior', label: '初中' },
    SENIOR: { value: 'senior', label: '高中' },
    COLLEGE: { value: 'college', label: '大专' },
    BACHELOR: { value: 'bachelor', label: '本科' },
    MASTER: { value: 'master', label: '硕士' },
    DOCTOR: { value: 'doctor', label: '博士' },
  },
};

// 枚举工具函数
export const EnumUtils = {
  // 根据value获取label
  getLabel: (enumObj: any, value: string): string => {
    const item = Object.values(enumObj).find((item: any) => item.value === value);
    return (item as any)?.label || value;
  },
  
  // 获取枚举选项数组
  getOptions: (enumObj: any): Array<{ value: string; label: string }> => {
    return Object.values(enumObj) as Array<{ value: string; label: string }>;
  },
  
  // 根据label获取value
  getValue: (enumObj: any, label: string): string => {
    const item = Object.values(enumObj).find((item: any) => item.label === label);
    return (item as any)?.value || label;
  },
};