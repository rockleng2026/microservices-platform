package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.sql.Timestamp;

@Data
@TableName("sys_dict_category")
public class DictCategory implements Serializable {
    @TableId
    private Long id;
    private String name;
    private String code;
    private String description;
    private Integer status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private Long createdBy;
    private Long updatedBy;
} 