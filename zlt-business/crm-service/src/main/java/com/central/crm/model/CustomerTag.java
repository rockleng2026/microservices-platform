package com.central.crm.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.crm.annotation.LongToString;
import lombok.Data;

import java.util.Date;

/**
 * 客户标签实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("customer_tag")
public class CustomerTag {

    /**
     * 标签ID
     */
    @LongToString
    @TableId(value = "tag_id", type = IdType.ASSIGN_ID)
    private Long tagId;

    /**
     * 标签名称
     */
    @TableField("tag_name")
    private String tagName;

    /**
     * 标签颜色
     */
    @TableField("tag_color")
    private String tagColor;

    /**
     * 标签描述
     */
    @TableField("description")
    private String description;

    /**
     * 排序号
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 是否启用：0-禁用，1-启用
     */
    @TableField("is_enabled")
    private Integer isEnabled;

    /**
     * 创建时间
     */
    @TableField("created_at")
    private Date createdAt;

    /**
     * 创建人
     */
    @LongToString
    @TableField("created_by")
    private Long createdBy;

    /**
     * 更新时间
     */
    @TableField("updated_at")
    private Date updatedAt;

    /**
     * 更新人
     */
    @LongToString
    @TableField("updated_by")
    private Long updatedBy;
}