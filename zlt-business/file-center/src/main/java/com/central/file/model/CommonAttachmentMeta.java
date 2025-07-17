package com.central.file.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.util.Date;

@Data
@TableName("common_attachment_meta")
public class CommonAttachmentMeta {
    private String tenantId;
    private Long attachmentId;
    private String metaKey;
    private String metaValue;
    private Integer delflag;
    private Date createdAt;
    private Date updatedAt;
    private Long createdBy;
    private Long updatedBy;
} 