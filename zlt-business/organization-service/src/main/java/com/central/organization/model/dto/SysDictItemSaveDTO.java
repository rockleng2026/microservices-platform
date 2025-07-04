package com.central.organization.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * 通用字典明细项保存DTO
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class SysDictItemSaveDTO {

    /**
     * 主键ID(修改时传入)
     */
    private Long id;

    /**
     * 类目ID
     */
    @NotNull(message = "类目ID不能为空")
    private Long categoryId;

    /**
     * 项目编码
     */
    @NotBlank(message = "项目编码不能为空")
    private String itemCode;

    /**
     * 项目名称
     */
    @NotBlank(message = "项目名称不能为空")
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
     * 状态(0=禁用, 1=启用)
     */
    @NotNull(message = "状态不能为空")
    private Integer status;

    /**
     * 扩展数据(key-value形式)
     */
    private Map<String, Object> extendData;
} 