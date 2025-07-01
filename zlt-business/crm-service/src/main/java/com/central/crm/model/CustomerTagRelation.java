package com.central.crm.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.crm.annotation.LongToString;
import lombok.Data;

import java.util.Date;

/**
 * 客户标签关联实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("customer_tag_relation")
public class CustomerTagRelation {

    /**
     * 关联ID
     */
    @LongToString
    @TableId(value = "relation_id", type = IdType.ASSIGN_ID)
    private Long relationId;

    /**
     * 客户ID
     */
    @LongToString
    @TableField("customer_id")
    private Long customerId;

    /**
     * 标签ID
     */
    @LongToString
    @TableField("tag_id")
    private Long tagId;

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
}