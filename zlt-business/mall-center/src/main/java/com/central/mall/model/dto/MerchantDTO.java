package com.central.mall.model.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 商户DTO - 用于商户信息传输
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@Data
public class MerchantDTO implements Serializable {
    private Long id;
    private String tenantId;
    private String merchantName;
    private String contactName;
    private String contactPhone;
    private String businessLicenseUrl;
    private Integer status;
    private String rejectReason;
    private LocalDateTime applyTime;
    private LocalDateTime reviewTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}