import request from '../utils/request';

// 统一处理响应数据格式兼容性
const handleResponse = (response: any) => {
  // 兼容新旧数据格式
  if (response.resp_code === 0) {
    // 处理分页数据格式
    if (response.datas && response.datas.records) {
      // 映射字段名以兼容前端期望的格式
      const mappedRecords = response.datas.records.map((record: any) => ({
        ...record,
        id: record.opportunityId || record.id,
        ownerId: record.ownerEmployeeId || record.ownerId,
        ownerName: record.ownerEmployeeName || record.ownerName,
        amount: record.expectedAmount || record.amount,
        createTime: record.createdAt || record.createTime,
        updateTime: record.updatedAt || record.updateTime
      }));
      
      return {
        success: true,
        data: {
          list: mappedRecords,
          total: response.datas.total,
          current: response.datas.current,
          size: response.datas.size
        }
      };
    } else {
      return {
        success: true,
        data: response.datas || response.data
      };
    }
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

// ==================== 商机管理相关API ====================

// 分页查询商机列表
export const getOpportunityList = (params: any) => {
  return request.post('/api-crm/api/opportunity/page', convertLongFields(params))
    .then(handleResponse);
};

// 获取商机详情
export const getOpportunityDetail = (opportunityId: string) => {
  return request.get(`/api-crm/api/opportunity/${opportunityId}`)
    .then(handleResponse);
};

// 创建商机
export const createOpportunity = (data: any) => {
  return request.post('/api-crm/api/opportunity', convertLongFields(data))
    .then(handleResponse);
};

// 更新商机
export const updateOpportunity = (opportunityId: string, data: any) => {
  return request.put(`/api-crm/api/opportunity/${opportunityId}`, convertLongFields(data))
    .then(handleResponse);
};

// 删除商机
export const deleteOpportunity = (opportunityId: string) => {
  return request.delete(`/api-crm/api/opportunity/${opportunityId}`)
    .then(handleResponse);
};

// 获取商机统计
export const getOpportunityStatistics = (params: any) => {
  return request.post('/api-crm/api/opportunity/statistics', convertLongFields(params))
    .then(handleResponse);
};

// ==================== 员工管理相关API ====================

// 获取员工列表
export const getEmployeeList = (params: any) => {
  return request.post('/api-organization/employee/page', convertLongFields(params))
    .then(handleResponse);
};

// ==================== 客户管理相关API ====================

// 获取客户列表
export const getCustomerList = (params: any) => {
  return request.post('/api-crm/api/customer/page', convertLongFields(params))
    .then(handleResponse);
}; 