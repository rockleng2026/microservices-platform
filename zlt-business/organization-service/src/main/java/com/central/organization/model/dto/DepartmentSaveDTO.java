package com.central.organization.model.dto;

import com.central.organization.utils.IdUtils;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 部门保存DTO
 * 用于新增和修改部门
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class DepartmentSaveDTO {
    
    /**
     * 部门ID（新增时为空，修改时必填）
     */
    @IdUtils.LongToString
    private Long id;
    
    /**
     * 部门名称
     */
    @NotBlank(message = "部门名称不能为空")
    private String name;
    
    /**
     * 部门编号
     */
    private String depNo;
    
    /**
     * 父部门ID（0表示根部门）
     */
    @NotNull(message = "父部门ID不能为空")
    @IdUtils.LongToString
    private Long parentId;
    
    /**
     * 部门主管ID
     */
    @IdUtils.LongToString
    private Long directorId;
    
    /**
     * 部门等级(1-7级)
     */
    private Integer gradeid;
    
    /**
     * 部门级别
     */
    private Integer islevel;
    
    /**
     * 是否为分公司(1是,空否)
     */
    private String fiiale;
    
    /**
     * 分公司标识
     */
    private String filialemark;
    
    /**
     * 电话
     */
    private String tel;
    
    /**
     * 办公地址
     */
    private String address;
    
    /**
     * 部门描述
     */
    private String description;
    
    /**
     * 排序号
     */
    private Integer sortOrder;
    
    /**
     * 状态(1启用,0禁用)
     */
    private Integer status = 1;
} 