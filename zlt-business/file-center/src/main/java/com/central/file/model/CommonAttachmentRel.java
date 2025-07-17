package com.central.file.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.util.Date;

@Data
@TableName("common_attachment_rel")
public class CommonAttachmentRel {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String tenantId;
    private Long bizId;
    private String bizType;
    private Long attachmentId;
    private Integer sortOrder;
    private Integer delflag;
    private Date createdAt;
    private Date updatedAt;
    private Long createdBy;
    private Long updatedBy;
} 