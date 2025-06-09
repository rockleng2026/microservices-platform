package com.central.organization.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.List;

/**
 * 部门树形结构DTO
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
@Data
@Accessors(chain = true)
public class DepartmentTreeDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 部门ID
     */
    private Long id;
    
    /**
     * 部门名称
     */
    private String name;
    
    /**
     * 部门编码
     */
    private String depNo;
    
    /**
     * 父部门ID
     */
    private Long parentId;
    
    /**
     * 部门级别(1-7级)
     */
    private Integer gradeId;
    
    /**
     * 是否为分公司
     */
    private String fiiale;
    
    /**
     * 部门主管ID
     */
    private Long directorId;
    
    /**
     * 部门主管姓名
     */
    private String directorName;
    
    /**
     * 联系电话
     */
    private String tel;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
    
    /**
     * 员工数量
     */
    private Integer employeeCount;
    
    /**
     * 岗位数量
     */
    private Integer positionCount;
    
    /**
     * 是否有子部门
     */
    private Boolean hasChildren;
    
    /**
     * 部门路径（从根部门到当前部门）
     */
    private String departmentPath;
    
    /**
     * 部门层级深度
     */
    private Integer level;
    
    /**
     * 排序序号
     */
    private Integer sortOrder;
    
    /**
     * 子部门列表
     */
    private List<DepartmentTreeDTO> children;
    
    /**
     * 扩展属性
     */
    private Object extra;
} 