package com.central.organization.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 通用字典类目保存DTO
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class SysDictCategorySaveDTO {

    /**
     * 主键ID(修改时传入)
     */
    private Long id;

    /**
     * 类目名称
     */
    @NotBlank(message = "类目名称不能为空")
    private String name;

    /**
     * 类目编码(唯一)
     */
    @NotBlank(message = "类目编码不能为空")
    private String code;

    /**
     * 类目描述
     */
    private String description;

    /**
     * 状态(0=禁用, 1=启用)
     */
    @NotNull(message = "状态不能为空")
    private Integer status;

    /**
     * 排序值
     */
    private Integer sortOrder;

    /**
     * 扩展字段配置列表
     */
    private List<ExtendFieldDTO> extendFields;

    /**
     * 扩展字段配置DTO
     */
    @Data
    public static class ExtendFieldDTO {
        /**
         * 字段编码
         */
        @NotBlank(message = "字段编码不能为空")
        private String code;

        /**
         * 字段名称
         */
        @NotBlank(message = "字段名称不能为空")
        private String name;

        /**
         * 字段类型(string/number/date/boolean)
         */
        @NotBlank(message = "字段类型不能为空")
        private String type;

        /**
         * 默认值
         */
        private String defaultValue;

        /**
         * 是否必填(0=否, 1=是)
         */
        private Integer required;

        /**
         * 排序值
         */
        private Integer sort;
    }
} 