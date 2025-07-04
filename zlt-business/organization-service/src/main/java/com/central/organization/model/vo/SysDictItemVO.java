package com.central.organization.model.vo;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 通用字典明细项VO
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class SysDictItemVO {

    /**
     * 主键ID
     */
    private String id;

    /**
     * 类目ID
     */
    private String categoryId;

    /**
     * 类目名称
     */
    private String categoryName;

    /**
     * 类目编码
     */
    private String categoryCode;

    /**
     * 项目编码
     */
    private String itemCode;

    /**
     * 项目名称
     */
    private String itemName;

    /**
     * 排序值
     */
    private Integer sortOrder;

    /**
     * 是否默认项(0=否, 1=是)
     */
    private Integer isDefault;

    /**
     * 默认项描述
     */
    private String isDefaultText;

    /**
     * 状态(0=禁用, 1=启用)
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusText;

    /**
     * 扩展数据(key-value形式)
     */
    private Map<String, Object> extendData;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 创建人姓名
     */
    private String createdByName;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 更新人姓名
     */
    private String updatedByName;
} 