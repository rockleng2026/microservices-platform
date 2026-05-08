package com.central.mall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.dto.MerchantDTO;
import com.central.mall.model.entity.MallMerchant;

import java.util.Map;

/**
 * 商户服务接口
 *
 * @author Portal Team
 * @since 2026-05-08
 */
public interface IMerchantService extends IService<MallMerchant> {

    /**
     * 商户申请列表（管理员分页查询）
     */
    IPage<MerchantDTO> getMerchantPage(IPage<MerchantDTO> page, Map<String, Object> params);

    /**
     * 获取商户详情
     */
    MerchantDTO getMerchantDetail(Long id);

    /**
     * 审核商户申请（通过/拒绝）
     */
    boolean reviewMerchant(Long id, Integer status, String rejectReason);

    /**
     * 根据租户ID获取商户
     */
    MallMerchant getByTenantId(String tenantId);
}