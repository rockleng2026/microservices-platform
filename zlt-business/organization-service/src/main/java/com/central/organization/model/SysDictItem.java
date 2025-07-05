package com.central.organization.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;

import java.time.LocalDateTime;

/**
 * 通用字典明细项实体
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("sys_dict_item")
public class SysDictItem {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 类目ID
     */
    private Long categoryId;

    /**
     * 项目编码
     */
    private String itemCode;

    /**
     * 项目名称
     */
    private String itemName;

    /**
     * 描述
     */
    private String description;

    /**
     * 排序值
     */
    private Integer sortOrder;

    /**
     * 是否默认项(0=否, 1=是)
     */
    private Integer isDefault;

    /**
     * 状态(0=禁用, 1=启用)
     */
    private Integer status;

    /**
     * 扩展数据(JSON格式)
     */
    private String extendData;

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