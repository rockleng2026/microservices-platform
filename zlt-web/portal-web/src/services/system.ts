import { request } from '@/utils/request';
import { getApiUrl } from '@/config/api';

/**
 * 系统字典管理API
 */

// 获取字典类目列表
export async function getDictCategories(params?: DictCategoryQueryParams) {
  return request<PageResult<DictCategory>>(
    getApiUrl('/api/organization/dict/category/page', 'PORTAL'),
    {
      method: 'GET',
      params,
    }
  );
}

// 获取字典类目详情
export async function getDictCategoryById(id: number) {
  return request<ApiResponse<DictCategory>>(
    getApiUrl(`/api/organization/dict/category/${id}`, 'PORTAL'),
    {
      method: 'GET',
    }
  );
}

// 创建字典类目
export async function createDictCategory(data: DictCategorySaveParams) {
  return request<ApiResponse<DictCategory>>(
    getApiUrl('/api/organization/dict/category/save', 'PORTAL'),
    {
      method: 'POST',
      data,
    }
  );
}

// 更新字典类目
export async function updateDictCategory(id: number, data: DictCategorySaveParams) {
  return request<ApiResponse<DictCategory>>(
    getApiUrl('/api/organization/dict/category/save', 'PORTAL'),
    {
      method: 'POST',
      data: { ...data, id },
    }
  );
}

// 删除字典类目
export async function deleteDictCategory(id: number) {
  return request<ApiResponse<void>>(
    getApiUrl(`/api/organization/dict/category/${id}`, 'PORTAL'),
    {
      method: 'DELETE',
    }
  );
}

// 更新字典类目状态
export async function updateDictCategoryStatus(id: number, enabled: boolean) {
  return request<ApiResponse<void>>(
    getApiUrl(`/api/organization/dict/category/${id}/status`, 'PORTAL'),
    {
      method: 'POST',
      params: { status: enabled ? 1 : 0 },
    }
  );
}

// 获取字典明细项列表
export async function getDictItems(params?: DictItemQueryParams) {
  return request<PageResult<DictItem>>(
    getApiUrl('/api/organization/dict/item/page', 'PORTAL'),
    {
      method: 'GET',
      params,
    }
  );
}

// 批量保存字典明细项
export async function batchSaveDictItems(data: DictItemSaveParams[]) {
  return request<ApiResponse<DictItem[]>>(
    getApiUrl('/api/organization/dict/item/batch-save', 'PORTAL'),
    {
      method: 'POST',
      data: {
        categoryId: data[0]?.categoryId,
        items: data,
      },
    }
  );
}

// 批量删除字典明细项
export async function batchDeleteDictItems(ids: number[]) {
  return request<ApiResponse<void>>(
    getApiUrl('/api/organization/dict/item/batch', 'PORTAL'),
    {
      method: 'DELETE',
      data: ids.map(id => id.toString()),
    }
  );
}

// 检查字典项编码唯一性
export async function checkDictItemCode(categoryId: number, code: string, excludeId?: number) {
  return request<ApiResponse<boolean>>(
    getApiUrl('/api/organization/dict/item/check-code', 'PORTAL'),
    {
      method: 'GET',
      params: { 
        categoryId: categoryId.toString(), 
        itemCode: code, 
        excludeId: excludeId?.toString() 
      },
    }
  );
}

// 根据类目编码获取字典项
export async function getDictItemsByCategory(categoryCode: string) {
  return request<ApiResponse<DictItem[]>>(
    getApiUrl(`/api/organization/dict/item/category-code/${categoryCode}`, 'PORTAL'),
    {
      method: 'GET',
    }
  );
}

// 类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  resp_code?: number;
  resp_msg?: string;
  datas?: T;
}

export interface PageResult<T> {
  count: number;
  code: number;
  resp_code: number;
  page: number;
  size: number;
  pages: number;
  data: T[];
}

export interface DictCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  description?: string;
  sort: number;
  enabled: boolean;
  extendSchema?: ExtendField[];
  createTime?: string;
  updateTime?: string;
  createBy?: string;
  updateBy?: string;
}

export interface DictItem {
  id: number;
  categoryId: number;
  itemCode: string;
  itemName: string;
  itemValue?: string;
  description?: string;
  sort: number;
  enabled: boolean;
  extendData?: Record<string, any>;
  createTime?: string;
  updateTime?: string;
  createBy?: string;
  updateBy?: string;
}

export interface ExtendField {
  fieldCode: string;
  fieldName: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT';
  defaultValue?: string;
  required: boolean;
  sort: number;
  selectOptions?: string[];
}

export interface DictCategoryQueryParams {
  page?: number;
  size?: number;
  categoryCode?: string;
  categoryName?: string;
  enabled?: boolean;
  createBy?: string;
  startTime?: string;
  endTime?: string;
}

export interface DictCategorySaveParams {
  categoryCode: string;
  categoryName: string;
  description?: string;
  sort: number;
  enabled: boolean;
  extendSchema?: ExtendField[];
}

export interface DictItemQueryParams {
  page?: number;
  size?: number;
  categoryId?: number;
  itemCode?: string;
  itemName?: string;
  enabled?: boolean;
}

export interface DictItemSaveParams {
  id?: number;
  categoryId: number;
  itemCode: string;
  itemName: string;
  itemValue?: string;
  description?: string;
  sort: number;
  enabled: boolean;
  extendData?: Record<string, any>;
} 