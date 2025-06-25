import { request } from '@/utils/request';
import type {
  Project,
  ProjectQueryParams,
  ProjectSaveParams,
  ProjectStatistics,
  ProductProfitDistributionGuide,
  ProfitGuideQueryParams,
  ProfitGuideSaveParams,
  ProjectTemplate,
  ApprovalRecord,
  ApiResponse,
  PageResult,
} from '@/types/project';

const API_PREFIX = '/api-project/api/project';

/**
 * 项目管理API服务
 */
export const projectApi = {
  // 分页查询项目列表
  getProjectPage: (params: ProjectQueryParams): Promise<ApiResponse<PageResult<Project>>> => {
    return request(`${API_PREFIX}/projects/page`, {
      method: 'GET',
      params,
    });
  },

  // 根据ID查询项目详情
  getProjectById: (id: string): Promise<ApiResponse<Project>> => {
    return request(`${API_PREFIX}/projects/${id}`, {
      method: 'GET',
    });
  },

  // 新增项目
  createProject: (data: ProjectSaveParams): Promise<ApiResponse<Project>> => {
    return request(`${API_PREFIX}/projects`, {
      method: 'POST',
      data,
    });
  },

  // 修改项目
  updateProject: (id: string, data: ProjectSaveParams): Promise<ApiResponse<Project>> => {
    return request(`${API_PREFIX}/projects/${id}`, {
      method: 'PUT',
      data,
    });
  },

  // 删除项目
  deleteProject: (id: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // 批量删除项目
  batchDeleteProjects: (ids: string[]): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/batch`, {
      method: 'DELETE',
      data: ids,
    });
  },

  // 更新项目状态
  updateProjectStatus: (id: string, status: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${id}/status`, {
      method: 'PUT',
      params: { status },
    });
  },

  // 批量更新项目状态
  batchUpdateProjectStatus: (ids: string[], status: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/status/batch`, {
      method: 'PUT',
      data: { ids, status },
    });
  },

  // 根据负责人查询项目
  getProjectsByLeader: (leaderId: string): Promise<ApiResponse<Project[]>> => {
    return request(`${API_PREFIX}/projects/leader/${leaderId}`, {
      method: 'GET',
    });
  },

  // 根据参与人查询项目
  getProjectsByParticipant: (participantId: string): Promise<ApiResponse<Project[]>> => {
    return request(`${API_PREFIX}/projects/participant/${participantId}`, {
      method: 'GET',
    });
  },

  // 根据状态查询项目
  getProjectsByStatus: (status: string): Promise<ApiResponse<Project[]>> => {
    return request(`${API_PREFIX}/projects/status/${status}`, {
      method: 'GET',
    });
  },

  // 根据分类查询项目
  getProjectsByCategory: (category: string): Promise<ApiResponse<Project[]>> => {
    return request(`${API_PREFIX}/projects/category/${category}`, {
      method: 'GET',
    });
  },

  // 项目立项审批
  approveProjectEstablishment: (id: string, approved: boolean, reason?: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${id}/approval/establishment`, {
      method: 'POST',
      data: { approved, reason },
    });
  },

  // 申请项目结项
  applyProjectClosure: (id: string, closureData: any): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${id}/closure/apply`, {
      method: 'POST',
      data: closureData,
    });
  },

  // 项目结项审批
  approveProjectClosure: (id: string, approved: boolean, reason?: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${id}/approval/closure`, {
      method: 'POST',
      data: { approved, reason },
    });
  },

  // 获取项目统计数据
  getProjectStatistics: (): Promise<ApiResponse<ProjectStatistics>> => {
    return request(`${API_PREFIX}/projects/statistics`, {
      method: 'GET',
    });
  },

  // 根据日期范围查询项目
  getProjectsByDateRange: (startDate: string, endDate: string): Promise<ApiResponse<Project[]>> => {
    return request(`${API_PREFIX}/projects/date-range`, {
      method: 'GET',
      params: { startDate, endDate },
    });
  },

  // 查询即将到期的项目
  getExpiringProjects: (days?: number): Promise<ApiResponse<Project[]>> => {
    return request(`${API_PREFIX}/projects/expiring`, {
      method: 'GET',
      params: { days },
    });
  },

  // 检查项目名称是否存在
  checkProjectNameExists: (name: string, excludeId?: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/check-name`, {
      method: 'GET',
      params: { name, excludeId },
    });
  },

  // 添加项目参与人
  addProjectParticipant: (projectId: string, participantId: string, role: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${projectId}/participants`, {
      method: 'POST',
      data: { participantId, role },
    });
  },

  // 移除项目参与人
  removeProjectParticipant: (projectId: string, participantId: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${projectId}/participants/${participantId}`, {
      method: 'DELETE',
    });
  },

  // 更新参与人角色
  updateParticipantRole: (projectId: string, participantId: string, role: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${projectId}/participants/${participantId}/role`, {
      method: 'PUT',
      data: { role },
    });
  },

  // 项目结项完成
  completeProjectClosure: (id: string, closureData: any): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${id}/closure/complete`, {
      method: 'POST',
      data: closureData,
    });
  },

  // 查询项目结项信息
  getProjectClosure: (id: string): Promise<ApiResponse<any>> => {
    return request(`${API_PREFIX}/projects/${id}/closure`, {
      method: 'GET',
    });
  },

  // 创建项目提成分配方案
  createProfitDistribution: (id: string, distributions: any[]): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${id}/profit-distribution`, {
      method: 'POST',
      data: distributions,
    });
  },

  // 查询项目提成分配列表
  getProfitDistribution: (id: string): Promise<ApiResponse<any[]>> => {
    return request(`${API_PREFIX}/projects/${id}/profit-distribution`, {
      method: 'GET',
    });
  },

  // 审批项目提成分配
  approveProfitDistribution: (id: string, approved: boolean, reason?: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/projects/${id}/profit-distribution/approve`, {
      method: 'POST',
      data: { approved, reason },
    });
  },
};

/**
 * 产品毛利分配指导API服务
 */
export const profitGuideApi = {
  // 分页查询分配指导列表
  getProfitGuidePage: (params: ProfitGuideQueryParams): Promise<ApiResponse<PageResult<ProductProfitDistributionGuide>>> => {
    return request(`${API_PREFIX}/profit-guide/page`, {
      method: 'GET',
      params,
    });
  },

  // 根据ID查询分配指导详情
  getProfitGuideById: (id: string): Promise<ApiResponse<ProductProfitDistributionGuide>> => {
    return request(`${API_PREFIX}/profit-guide/${id}`, {
      method: 'GET',
    });
  },

  // 新增分配指导
  createProfitGuide: (data: ProfitGuideSaveParams): Promise<ApiResponse<ProductProfitDistributionGuide>> => {
    return request(`${API_PREFIX}/profit-guide`, {
      method: 'POST',
      data,
    });
  },

  // 修改分配指导
  updateProfitGuide: (id: string, data: ProfitGuideSaveParams): Promise<ApiResponse<ProductProfitDistributionGuide>> => {
    return request(`${API_PREFIX}/profit-guide/${id}`, {
      method: 'PUT',
      data,
    });
  },

  // 删除分配指导
  deleteProfitGuide: (id: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/profit-guide/${id}`, {
      method: 'DELETE',
    });
  },

  // 批量删除分配指导
  batchDeleteProfitGuides: (ids: string[]): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/profit-guide/batch`, {
      method: 'DELETE',
      data: ids,
    });
  },

  // 更新分配指导状态
  updateProfitGuideStatus: (id: string, status: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/profit-guide/${id}/status`, {
      method: 'PUT',
      params: { status },
    });
  },

  // 根据产品查询有效的分配指导
  getActiveProfitGuideByProduct: (productName: string, role: string): Promise<ApiResponse<ProductProfitDistributionGuide>> => {
    return request(`${API_PREFIX}/profit-guide/active`, {
      method: 'GET',
      params: { productName, role },
    });
  },

  // 根据产品名称查询分配指导列表
  getProfitGuidesByProductName: (productName: string): Promise<ApiResponse<ProductProfitDistributionGuide[]>> => {
    return request(`${API_PREFIX}/profit-guide/product/${productName}`, {
      method: 'GET',
    });
  },

  // 查询所有有效的分配指导
  getAllActiveProfitGuides: (): Promise<ApiResponse<ProductProfitDistributionGuide[]>> => {
    return request(`${API_PREFIX}/profit-guide/active/all`, {
      method: 'GET',
    });
  },

  // 查询产品名称列表
  getProductNames: (): Promise<ApiResponse<string[]>> => {
    return request(`${API_PREFIX}/profit-guide/products`, {
      method: 'GET',
    });
  },

  // 查询角色列表
  getRoles: (): Promise<ApiResponse<string[]>> => {
    return request(`${API_PREFIX}/profit-guide/roles`, {
      method: 'GET',
    });
  },

  // 根据角色查询分配指导列表
  getProfitGuidesByRole: (role: string): Promise<ApiResponse<ProductProfitDistributionGuide[]>> => {
    return request(`${API_PREFIX}/profit-guide/role/${role}`, {
      method: 'GET',
    });
  },
};

/**
 * 项目模板API服务
 */
export const templateApi = {
  // 查询项目模板列表
  getTemplates: (): Promise<ApiResponse<ProjectTemplate[]>> => {
    return request(`${API_PREFIX}/templates`, {
      method: 'GET',
    });
  },

  // 根据ID查询模板详情
  getTemplateById: (id: string): Promise<ApiResponse<ProjectTemplate>> => {
    return request(`${API_PREFIX}/templates/${id}`, {
      method: 'GET',
    });
  },

  // 新增项目模板
  createTemplate: (data: Partial<ProjectTemplate>): Promise<ApiResponse<ProjectTemplate>> => {
    return request(`${API_PREFIX}/templates`, {
      method: 'POST',
      data,
    });
  },

  // 修改项目模板
  updateTemplate: (id: string, data: Partial<ProjectTemplate>): Promise<ApiResponse<ProjectTemplate>> => {
    return request(`${API_PREFIX}/templates/${id}`, {
      method: 'PUT',
      data,
    });
  },

  // 删除项目模板
  deleteTemplate: (id: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/templates/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * 审批流程API服务
 */
export const approvalApi = {
  // 查询待审批列表
  getPendingApprovals: (): Promise<ApiResponse<ApprovalRecord[]>> => {
    return request(`${API_PREFIX}/approvals/pending`, {
      method: 'GET',
    });
  },

  // 查询审批历史
  getApprovalHistory: (bizType: string, bizId: string): Promise<ApiResponse<ApprovalRecord[]>> => {
    return request(`${API_PREFIX}/approvals/history`, {
      method: 'GET',
      params: { bizType, bizId },
    });
  },

  // 审批操作
  approve: (processInstanceId: string, approved: boolean, comment?: string): Promise<ApiResponse<boolean>> => {
    return request(`${API_PREFIX}/approvals/${processInstanceId}/approve`, {
      method: 'POST',
      data: { approved, comment },
    });
  },
};

/**
 * 保存项目提成分配
 */
export function saveProfitDistribution(data: any) {
  return request('/api/project-manager/projects/profit-distribution', {
    method: 'POST',
    data,
  });
} 