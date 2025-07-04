package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.sql.Timestamp;

@Data
@TableName("sys_dict_item")
public class DictItem implements Serializable {
    @TableId
    private Long id;
    private Long categoryId;
    private String itemCode;
    private String itemName;
    private Integer sortOrder;
    private String extendData;
    private Integer isDefault;
    private Integer status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private Long createdBy;
    private Long updatedBy;
} 