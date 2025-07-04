package com.central.organization.model.vo;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 通用字典类目VO
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class SysDictCategoryVO {

    /**
     * 主键ID
     */
    private String id;

    /**
     * 类目名称
     */
    private String name;

    /**
     * 类目编码
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
     * 状态描述
     */
    private String statusText;

    /**
     * 排序值
     */
    private Integer sortOrder;

    /**
     * 扩展字段配置列表
     */
    private List<ExtendFieldVO> extendFields;

    /**
     * 明细项数量
     */
    private Integer itemCount;

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

    /**
     * 扩展字段配置VO
     */
    @Data
    public static class ExtendFieldVO {
        /**
         * 字段编码
         */
        private String code;

        /**
         * 字段名称
         */
        private String name;

        /**
         * 字段类型
         */
        private String type;

        /**
         * 字段类型描述
         */
        private String typeText;

        /**
         * 默认值
         */
        private String defaultValue;

        /**
         * 是否必填
         */
        private Integer required;

        /**
         * 必填描述
         */
        private String requiredText;

        /**
         * 排序值
         */
        private Integer sort;
    }
} 