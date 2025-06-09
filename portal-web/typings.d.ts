declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

// 扩展全局变量
declare const API_BASE_URL: string;

// Node.js 环境变量
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  }
}

// 通用API响应类型
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 分页响应类型
interface PageResponse<T = any> {
  list: T[];
  total: number;
  current: number;
  size: number;
}

// 员工相关类型
interface Employee {
  id: number;
  empNo: string;
  name: string;
  nameEn?: string;
  gender?: 1 | 2;
  birthDate?: string;
  idCard?: string;
  mobile?: string;
  email?: string;
  departmentId?: number;
  positionId?: number;
  secondaryPositionIds?: string;
  gradeId?: number;
  employmentType?: 1 | 2 | 3 | 4;
  employmentStatus?: 1 | 2 | 3;
  entryDate?: string;
  probationEndDate?: string;
  leaveDate?: string;
  leaveReason?: string;
  education?: string;
  nation?: string;
  healthStatus?: string;
  height?: string;
  weight?: string;
  maritalStatus?: string;
  birthplace?: string;
  residence?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  specialty?: string;
  avatar?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  createBy?: number;
  updateBy?: number;
  delFlag?: 0 | 1;
  // 关联信息
  departmentName?: string;
  positionName?: string;
  gradeName?: string;
}

// 部门相关类型
interface Department {
  id: number;
  name: string;
  directorId?: number;
  parentId?: number;
  depNo?: string;
  gradeId?: number;
  fiiale?: string;
  filialemark?: string;
  delFlag?: 0 | 1;
  createTime?: string;
  updateTime?: string;
  // 关联信息
  directorName?: string;
  parentName?: string;
  gradeName?: string;
  children?: Department[];
  employeeCount?: number;
}

// 岗位相关类型
interface WorkPosition {
  id: number;
  name: string;
  shortname?: string;
  deptId?: number;
  workgrade?: number;
  workcontent?: string;
  functionIDs?: string;
  permissions?: string;
  parpositionid?: number;
  ispersonman?: number;
  edittime?: string;
  delFlag?: 0 | 1;
  // 关联信息
  deptName?: string;
  parentPositionName?: string;
  employeeCount?: number;
}

// 菜单权限类型
interface MenuItem {
  id: number;
  menuCode: string;
  menuName: string;
  menuType: 'menu' | 'button' | 'api';
  parentId: number;
  menuPath?: string;
  componentPath?: string;
  menuIcon?: string;
  sortOrder: number;
  isVisible: boolean;
  isExternal: boolean;
  menuStatus: boolean;
  perms?: string;
  children?: MenuItem[];
}

// 用户权限信息
interface UserPermissions {
  menus: MenuItem[];
  permissions: string[];
  roles: string[];
}

// 表格查询参数
interface TableSearchParams {
  current?: number;
  pageSize?: number;
  [key: string]: any;
}

// Layout设置类型
interface LayoutSettings {
  navTheme: 'light' | 'dark';
  headerTheme: 'light' | 'dark';
  primaryColor: string;
  layout: 'side' | 'top' | 'mix';
  contentWidth: 'Fluid' | 'Fixed';
  fixedHeader: boolean;
  fixSiderbar: boolean;
  colorWeak: boolean;
}

// Umi类型声明
declare namespace API {
  interface CurrentUser {
    id: number;
    username: string;
    name: string;
    email?: string;
    avatar?: string;
    roles: string[];
    permissions: string[];
    departmentId?: number;
    departmentName?: string;
    positionId?: number;
    positionName?: string;
  }

  interface LoginParams {
    username: string;
    password: string;
    captcha?: string;
  }

  interface LoginResult {
    token: string;
    refreshToken: string;
    user: CurrentUser;
  }
}

// Request选项类型
interface RequestOptionsInit extends RequestInit {
  skipErrorHandler?: boolean;
  interceptors?: boolean;
} 