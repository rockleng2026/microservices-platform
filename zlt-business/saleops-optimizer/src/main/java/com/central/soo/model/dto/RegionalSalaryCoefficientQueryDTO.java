package com.central.soo.model.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * 地区工资系数查询DTO
 *
 * @author zlt
 * @date 2024-01-01
 */
@Data
public class RegionalSalaryCoefficientQueryDTO {

    private String region;

    private String regionCode;

    private Integer status;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveDateStart;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveDateEnd;

    private Boolean includeExpired;

    private Integer pageNum = 1;

    private Integer pageSize = 10;
} 