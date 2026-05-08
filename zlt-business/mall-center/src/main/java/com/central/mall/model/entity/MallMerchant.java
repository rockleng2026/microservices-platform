package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 商户实体 - 支持多租户商户入驻
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@Data
@TableName("mall_merchant")
public class MallMerchant {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;           // 商户分配的租户ID（如 "MERCHANT_001"）
    private String merchantName;        // 商户名称（营业执照名称）
    private String contactName;        // 联系人姓名
    private String contactPhone;       // 联系人电话
    private String businessLicenseUrl; // 营业执照图片URL
    private Integer status;             // 状态：0=待审核, 1=已通过, 2=已拒绝
    private String rejectReason;       // 拒绝原因
    private LocalDateTime applyTime;   // 申请时间
    private LocalDateTime reviewTime;  // 审核时间
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    // 状态常量
    public static final Integer STATUS_PENDING = 0;
    public static final Integer STATUS_APPROVED = 1;
    public static final Integer STATUS_REJECTED = 2;
}