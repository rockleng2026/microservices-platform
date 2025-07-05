package com.central.soo.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.Result;
import com.central.common.model.PageResult;
import com.central.soo.model.dto.RegionalSalaryCoefficientQueryDTO;
import com.central.soo.model.entity.RegionalSalaryCoefficient;

import java.time.LocalDate;
import java.util.List;

/**
 * 地区工资系数服务接口
 *
 * @author zlt
 * @date 2024-01-01
 */
public interface IRegionalSalaryCoefficientService extends IService<RegionalSalaryCoefficient> {

    /**
     * 分页查询地区工资系数
     *
     * @param queryDTO 查询参数
     * @return 分页结果
     */
    Result<Page<RegionalSalaryCoefficient>> pageQuery(RegionalSalaryCoefficientQueryDTO queryDTO);

    /**
     * 检查地区在指定日期范围内是否存在重叠的配置
     *
     * @param region 地区
     * @param effectiveDate 生效日期
     * @param expireDate 失效日期
     * @param excludeId 排除的ID（编辑时使用）
     * @return 是否存在重叠
     */
    boolean checkRegionDateOverlap(String region, LocalDate effectiveDate, LocalDate expireDate, Long excludeId);

    /**
     * 根据地区和日期获取有效的工资系数
     *
     * @param region 地区
     * @param targetDate 目标日期
     * @return 工资系数配置
     */
    RegionalSalaryCoefficient getEffectiveCoefficient(String region, LocalDate targetDate);

    /**
     * 获取所有有效的地区列表
     *
     * @return 地区列表
     */
    List<String> getActiveRegions();

    /**
     * 批量启用/禁用
     *
     * @param ids ID列表
     * @param status 状态
     * @return 操作结果
     */
    Result<Void> batchUpdateStatus(List<Long> ids, Integer status);

    /**
     * 复制配置到新地区
     *
     * @param sourceId 源配置ID
     * @param targetRegion 目标地区
     * @param targetRegionCode 目标地区编码
     * @param effectiveDate 生效日期
     * @return 操作结果
     */
    Result<Void> copyToNewRegion(Long sourceId, String targetRegion, String targetRegionCode, LocalDate effectiveDate);
} 