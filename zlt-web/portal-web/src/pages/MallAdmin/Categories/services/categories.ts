/**
 * 分类管理 API 服务层
 */
import { request } from '@/utils/request';

// API 常量 - 通过网关访问
const API_BASE = '/api-mall/api/mall/admin/category';

/**
 * 分类 DTO
 */
export interface AdminCategoryDTO {
  id: number;
  name: string;
  parentId: number | null;
  sort?: number;
  children?: AdminCategoryDTO[];
}

/**
 * 获取分类列表（树形结构）
 */
export async function getCategoryList(): Promise<AdminCategoryDTO[]> {
  try {
    const response = await request<any>(`${API_BASE}/list`, {
      method: 'GET',
    });
    // Handle error response
    if (response.resp_code && response.resp_code !== 0) {
      console.warn('Category API error:', response.resp_msg);
      return [];
    }
    // Handle wrapped response or direct array
    if (Array.isArray(response)) return response;
    return response.datas || [];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

/**
 * 创建分类
 * @param category { name, parentId?, sort? }
 */
export async function createCategory(category: {
  name: string;
  parentId?: number | null;
  sort?: number;
}): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}`, {
    method: 'POST',
    data: category,
  });
  return response.datas || false;
}

/**
 * 更新分类
 * @param category { id, name, parentId?, sort? }
 */
export async function updateCategory(category: {
  id: number;
  name: string;
  parentId?: number | null;
  sort?: number;
}): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}`, {
    method: 'PUT',
    data: category,
  });
  return response.datas || false;
}

/**
 * 删除分类
 * @param id 分类 ID
 */
export async function deleteCategory(id: number): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return response.datas || false;
}

/**
 * 批量更新分类排序
 * @param ids 排序后的分类 ID 数组
 */
export async function updateCategorySort(ids: number[]): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/sort`, {
    method: 'PUT',
    data: ids,
  });
  return response.datas || false;
}