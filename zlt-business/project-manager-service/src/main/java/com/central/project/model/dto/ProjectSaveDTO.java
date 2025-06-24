package com.central.project.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Date;
import java.util.List;

/**
 * 项目保存DTO
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class ProjectSaveDTO {
    
    /**
     * 项目ID（更新时需要）
     */
    private Long id;
    
    /**
     * 项目名称
     */
    @NotBlank(message = "项目名称不能为空")
    private String name;
    
    /**
     * 项目类别
     */
    @NotBlank(message = "项目类别不能为空")
    private String category;
    
    /**
     * 项目负责人ID
     */
    @NotNull(message = "项目负责人不能为空")
    private Long leaderId;
    
    /**
     * 项目客户名称
     */
    @NotBlank(message = "客户名称不能为空")
    private String customerName;
    
    /**
     * 项目客户代表
     */
    private String customerContact;
    
    /**
     * 立项时间
     */
    private Date startTime;
    
    /**
     * 项目描述
     */
    private String description;
    
    /**
     * 项目参与人列表
     */
    private List<ProjectParticipantDTO> participants;
    
    /**
     * 预计合同金额
     */
    private String estimatedAmount;
    
    /**
     * 项目状态（可选，默认为init）
     */
    private String status;
    
    /**
     * 项目参与人DTO
     */
    @Data
    public static class ProjectParticipantDTO {
        
        /**
         * 参与人ID
         */
        @NotNull(message = "参与人ID不能为空")
        private Long participantId;
        
        /**
         * 参与人角色
         */
        @NotBlank(message = "参与人角色不能为空")
        private String role;
        
        /**
         * 参与人姓名（显示用，不存储）
         */
        private String participantName;
        
        /**
         * 参与人部门（显示用，不存储）
         */
        private String departmentName;
    }
} 