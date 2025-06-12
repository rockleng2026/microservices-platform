package com.central.organization.model.dto;

import com.central.organization.utils.IdUtils;
import lombok.Data;

/**
 * 部门查询DTO
 * 用于部门查询条件
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class DepartmentQueryDTO {
    
    /**
     * 部门ID
     */
    @IdUtils.LongToString
    private Long id;
    
    /**
     * 父部门ID
     */
    @IdUtils.LongToString
    private Long parentId;
    
    /**
     * 部门名称（模糊查询）
     */
    private String name;
    
    /**
     * 部门编号
     */
    private String depNo;
    
    /**
     * 部门主管ID
     */
    @IdUtils.LongToString
    private Long directorId;
    
    /**
     * 部门等级
     */
    private Integer gradeId;
    
    /**
     * 是否为分公司
     */
    private String fiiale;
    
    /**
     * 状态(1启用,0禁用)
     */
    private Integer status;
    
    /**
     * 是否包含禁用的部门
     */
    private Boolean includeDisabled = false;
    
    /**
     * 是否包含删除的部门
     */
    private Boolean includeDeleted = false;
    
    /**
     * 关键词（搜索部门名称、编号、描述）
     */
    private String keyword;
    
    /**
     * 是否只查询根部门
     */
    private Boolean rootOnly = false;
    
    /**
     * 最大层级深度
     */
    private Integer maxLevel;
} 