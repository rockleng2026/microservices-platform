package com.central.organization.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;

import java.time.LocalDateTime;

/**
 * 通用字典类目实体
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_dict_category")
public class SysDictCategory {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 类目名称
     */
    private String name;

    /**
     * 类目编码(唯一)
     */
    private String code;

    /**
     * 类目描述
     */
    private String description;

    /**
     * 状态(0=禁用, 1=启用)
     */
    private Integer status;

    /**
     * 扩展字段Schema(JSON格式)
     */
    private String extendSchema;

    /**
     * 排序值
     */
    private Integer sortOrder;

    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 更新人ID
     */
    private Long updatedBy;

    /**
     * 删除标记(0=正常, 1=删除)
     */
    private Integer delflag;
} 