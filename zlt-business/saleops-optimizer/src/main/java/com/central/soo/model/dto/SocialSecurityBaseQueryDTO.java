package com.central.soo.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 社保公积金基数配置查询DTO
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@Schema(description = "社保公积金基数配置查询条件")
public class SocialSecurityBaseQueryDTO {

    @Schema(description = "页码")
    private Integer pageNum = 1;

    @Schema(description = "页大小")
    private Integer pageSize = 20;

    @Schema(description = "地区")
    private String region;

    @Schema(description = "年度")
    private Integer year;

    @Schema(description = "状态(1启用,0禁用)")
    private Integer status;

    @Schema(description = "开始年度")
    private Integer startYear;

    @Schema(description = "结束年度")
    private Integer endYear;
} 