package com.central.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.crm.model.IndividualCustomer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 个人客户扩展信息数据访问接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface IndividualCustomerMapper extends BaseMapper<IndividualCustomer> {

    /**
     * 根据客户ID查询个人客户信息
     */
    IndividualCustomer selectByCustomerId(@Param("customerId") Long customerId);

    /**
     * 根据身份证号查询个人客户信息
     */
    IndividualCustomer selectByIdCard(@Param("idCard") String idCard);

    /**
     * 检查身份证号是否存在
     */
    Integer checkIdCardExists(@Param("idCard") String idCard, @Param("customerId") Long customerId);
}