package com.central.project.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;

/**
 * 项目提成分配保存DTO
 * 
 * @author Central Team
 * @since 2024-12-25
 */
@Data
public class ProjectProfitDistributionSaveDTO {
    
    /**
     * 项目ID
     */
    @NotNull(message = "项目ID不能为空")
    private Long projectId;
    
    /**
     * 分配模式（ratio: 按比例, fixed: 固定金额）
     */
    private String distributionMode;
    
    /**
     * 项目实际金额
     */
    private BigDecimal projectActualAmount;
    
    /**
     * 毛利润
     */
    private BigDecimal grossProfit;
    
    /**
     * 毛利率
     */
    private BigDecimal grossProfitRate;
    
    /**
     * 最大分配比例
     */
    private BigDecimal maxDistributionRatio;
    
    /**
     * 最大分配金额
     */
    private BigDecimal maxDistributionAmount;
    
    /**
     * 总分配金额
     */
    private BigDecimal totalDistributionAmount;
    
    /**
     * 部门分配列表
     */
    @NotEmpty(message = "部门分配列表不能为空")
    @Valid
    private List<DepartmentAllocationDTO> departmentAllocations;
    
    /**
     * 部门分配DTO
     */
    @Data
    public static class DepartmentAllocationDTO {
        
        /**
         * 部门ID
         */
        @NotNull(message = "部门ID不能为空")
        private Long departmentId;
        
        /**
         * 部门名称
         */
        private String departmentName;
        
        /**
         * 部门权重（基于最大分配比例的百分比）
         */
        @NotNull(message = "部门权重不能为空")
        private BigDecimal weight;
        
        /**
         * 部门总分配金额
         */
        private BigDecimal totalAmount;
        
        /**
         * 员工分配列表
         */
        @Valid
        private List<EmployeeDistributionDTO> employeeDistributions;
    }
    
    /**
     * 员工分配DTO
     */
    @Data
    public static class EmployeeDistributionDTO {
        
        /**
         * 员工ID
         */
        @NotNull(message = "员工ID不能为空")
        private Long employeeId;
        
        /**
         * 员工姓名
         */
        private String employeeName;
        
        /**
         * 员工权重（基于最大分配比例的百分比）
         */
        private BigDecimal weight;
        
        /**
         * 员工分配金额
         */
        private BigDecimal amount;
        
        /**
         * 是否固定金额（true: 固定金额, false: 按权重比例）
         */
        private Boolean isFixedAmount;
    }
} 