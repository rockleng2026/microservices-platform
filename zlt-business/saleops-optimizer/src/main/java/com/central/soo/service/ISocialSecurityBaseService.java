package com.central.soo.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.SocialSecurityBase;
import com.central.soo.model.dto.SocialSecurityBaseQueryDTO;

import java.util.List;
import java.util.Map;

/**
 * 社保公积金基数配置服务接口
 *
 * @author Portal Team
 * @since 2024-12-19
 */
public interface ISocialSecurityBaseService extends IService<SocialSecurityBase> {

    /**
     * 分页查询社保公积金基数配置
     *
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<SocialSecurityBase> pageSocialSecurityBase(SocialSecurityBaseQueryDTO query);

    /**
     * 校验地区年度唯一性
     *
     * @param region 地区
     * @param year 年度
     * @param excludeId 排除的ID
     * @return 是否唯一
     */
    boolean checkUnique(String region, Integer year, Long excludeId);

    /**
     * 根据地区和年度获取社保公积金基数配置
     *
     * @param region 地区
     * @param year 年度
     * @return 配置信息
     */
    SocialSecurityBase getByRegionAndYear(String region, Integer year);

    /**
     * 获取地区列表
     *
     * @return 地区列表
     */
    List<Map<String, Object>> getRegionList();

    /**
     * 获取年度列表
     *
     * @return 年度列表
     */
    List<Integer> getYearList();

    /**
     * 复制上一年度配置
     *
     * @param sourceYear 源年度
     * @param targetYear 目标年度
     * @param regions 地区列表，为空则复制所有地区
     * @return 复制成功的数量
     */
    int copyFromPreviousYear(Integer sourceYear, Integer targetYear, List<String> regions);
} 