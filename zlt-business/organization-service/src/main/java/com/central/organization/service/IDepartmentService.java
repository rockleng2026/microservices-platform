package com.central.organization.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.organization.model.Department;
import com.central.organization.model.dto.DepartmentQueryDTO;
import com.central.organization.model.dto.DepartmentSaveDTO;
import com.central.organization.model.vo.DepartmentTreeVO;

import java.util.List;

/**
 * 部门服务接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
public interface IDepartmentService extends IService<Department> {
    
    /**
     * 获取部门树形结构
     * @param query 查询条件
     * @return 部门树
     */
    List<DepartmentTreeVO> getDepartmentTree(DepartmentQueryDTO query);
    
    /**
     * 根据父部门ID获取子部门树
     * @param parentId 父部门ID
     * @param includeDisabled 是否包含禁用的部门
     * @return 子部门树
     */
    List<DepartmentTreeVO> getChildDepartmentTree(Long parentId, Boolean includeDisabled);
    
    /**
     * 保存部门（新增或修改）
     * @param saveDTO 部门保存数据
     * @return 保存后的部门信息
     */
    Department saveDepartment(DepartmentSaveDTO saveDTO);
    
    /**
     * 根据ID获取部门详情
     * @param id 部门ID
     * @return 部门详情
     */
    Department getDepartmentById(Long id);
    
    /**
     * 删除部门（软删除）
     * @param id 部门ID
     * @return 是否成功
     */
    Boolean deleteDepartment(Long id);
    
    /**
     * 批量删除部门
     * @param ids 部门ID列表
     * @return 是否成功
     */
    Boolean batchDeleteDepartments(List<Long> ids);
    
    /**
     * 启用/禁用部门
     * @param id 部门ID
     * @param status 状态(1启用,0禁用)
     * @return 是否成功
     */
    Boolean updateDepartmentStatus(Long id, Integer status);
    
    /**
     * 移动部门（修改父部门）
     * @param id 部门ID
     * @param newParentId 新的父部门ID
     * @return 是否成功
     */
    Boolean moveDepartment(Long id, Long newParentId);
    
    /**
     * 检查部门编号是否存在
     * @param depNo 部门编号
     * @param excludeId 排除的部门ID
     * @return 是否存在
     */
    Boolean existsByDepNo(String depNo, Long excludeId);
    
    /**
     * 检查部门名称在同级部门中是否存在
     * @param name 部门名称
     * @param parentId 父部门ID
     * @param excludeId 排除的部门ID
     * @return 是否存在
     */
    Boolean existsByNameAndParentId(String name, Long parentId, Long excludeId);
    
    /**
     * 获取部门路径
     * @param departmentId 部门ID
     * @return 部门路径字符串
     */
    String getDepartmentPath(Long departmentId);
    
    /**
     * 获取部门及其所有下级部门ID
     * @param departmentId 部门ID
     * @return 部门ID列表
     */
    List<Long> getDepartmentAndChildrenIds(Long departmentId);
    
    /**
     * 统计部门下的员工数量
     * @param departmentId 部门ID
     * @param includeChildren 是否包含子部门员工
     * @return 员工数量
     */
    Integer countEmployeesByDepartment(Long departmentId, Boolean includeChildren);
    
    /**
     * 复制部门结构
     * @param sourceDeptId 源部门ID
     * @param targetParentId 目标父部门ID
     * @return 是否成功
     */
    Boolean copyDepartmentStructure(Long sourceDeptId, Long targetParentId);
    
    /**
     * 获取部门层级深度
     * @param departmentId 部门ID
     * @return 层级深度
     */
    Integer getDepartmentLevel(Long departmentId);
    
    /**
     * 排序部门
     * @param departmentIds 部门ID列表（按顺序）
     * @return 是否成功
     */
    Boolean sortDepartments(List<Long> departmentIds);
} 