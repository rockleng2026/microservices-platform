package com.central.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.crm.model.CorporateCustomer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 企业客户扩展信息数据访问接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface CorporateCustomerMapper extends BaseMapper<CorporateCustomer> {

    /**
     * 根据客户ID查询企业客户信息
     */
    CorporateCustomer selectByCustomerId(@Param("customerId") Long customerId);

    /**
     * 根据统一社会信用代码查询企业客户信息
     */
    CorporateCustomer selectByCreditCode(@Param("creditCode") String creditCode);

    /**
     * 检查统一社会信用代码是否存在
     */
    Integer checkCreditCodeExists(@Param("creditCode") String creditCode, @Param("customerId") Long customerId);

    /**
     * 按公司规模统计企业客户分布
     */
    List<Map<String, Object>> selectDistributionByScale();

    /**
     * 按行业统计企业客户分布
     */
    List<Map<String, Object>> selectDistributionByIndustry();

    /**
     * 按注册资本统计企业客户分布
     */
    List<Map<String, Object>> selectDistributionByCapital();
}