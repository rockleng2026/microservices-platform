package com.central.project.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

/**
 * 产品毛利分配指导保存DTO
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class ProductProfitDistributionGuideSaveDTO {
    
    /**
     * 分配指导ID（更新时需要）
     */
    private Long id;
    
    /**
     * 产品名称
     */
    @NotBlank(message = "产品名称不能为空")
    private String productName;
    
    /**
     * 参与角色
     */
    @NotBlank(message = "参与角色不能为空")
    private String role;
    
    /**
     * 提成类型
     */
    @NotBlank(message = "提成类型不能为空")
    private String commissionType;
    
    /**
     * 数值范围
     */
    private String valueRange;
    
    /**
     * 备注
     */
    private String remark;
} 