package com.central.organization.model.vo;

import com.central.organization.utils.IdUtils;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 部门树形结构VO
 * 用于前端展示部门树
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class DepartmentTreeVO {
    
    /**
     * 部门ID
     */
    @IdUtils.LongToString
    private Long id;
    
    /**
     * 部门名称
     */
    private String name;
    
    /**
     * 部门编号
     */
    private String depNo;
    
    /**
     * 父部门ID
     */
    @IdUtils.LongToString
    private Long parentId;
    
    /**
     * 部门主管ID
     */
    @IdUtils.LongToString
    private Long directorId;
    
    /**
     * 部门主管姓名
     */
    private String directorName;
    
    /**
     * 部门等级(1-7)
     */
    private Integer gradeid;
    
    /**
     * 部门级别
     */
    private Integer islevel;
    
    /**
     * 是否为分公司
     */
    private Boolean isFiliale;
    
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
    private Integer status;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    /**
     * 子部门列表
     */
    private List<DepartmentTreeVO> children;
    
    /**
     * 父部门名称
     */
    private String parentName;
    
    /**
     * 部门层级深度
     */
    private Integer level;
    
    /**
     * 部门路径
     */
    private String departmentPath;
    
    /**
     * 员工总数
     */
    private Integer employeeCount;
    
    /**
     * 子部门数量
     */
    private Integer childrenCount;
    
    /**
     * 是否叶子节点
     */
    private Boolean isLeaf;
    
    /**
     * 是否展开
     */
    private Boolean expanded;
    
    /**
     * 是否半级部门
     */
    private Boolean isHalfLevel;
    
    /**
     * 节点类型(department)
     */
    private String nodeType = "department";
    
    /**
     * 节点图标
     */
    private String icon;
    
    /**
     * 节点样式类
     */
    private String nodeClass;
    
    /**
     * 是否可选择
     */
    private Boolean selectable = true;
    
    /**
     * 是否可拖拽
     */
    private Boolean draggable = true;
    
    /**
     * 是否禁用
     */
    private Boolean disabled = false;
} 