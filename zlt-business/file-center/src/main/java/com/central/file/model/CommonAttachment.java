package com.central.file.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.util.Date;

@Data
@TableName("common_attachment")
public class CommonAttachment {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String tenantId;
    private String originalName;
    private String fileKey;
    private String fileType;
    private Long fileSize;
    private String storageType;
    private String md5;
    private Date uploadTime;
    private Long uploadUserId;
    private Integer sortOrder;
    private Integer delflag;
    private Date createdAt;
    private Date updatedAt;
    private Long createdBy;
    private Long updatedBy;
} 