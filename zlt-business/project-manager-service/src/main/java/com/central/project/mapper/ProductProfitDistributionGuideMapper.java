package com.central.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.project.model.ProductProfitDistributionGuide;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 产品毛利分配指导表Mapper接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface ProductProfitDistributionGuideMapper extends BaseMapper<ProductProfitDistributionGuide> {
    
    /**
     * 分页查询产品毛利分配指导列表
     * @param page 分页参数
     * @param params 查询参数
     * @return 分页列表
     */
    IPage<ProductProfitDistributionGuide> selectGuidePage(Page<ProductProfitDistributionGuide> page, @Param("params") Map<String, Object> params);
    
    /**
     * 根据产品名称查询分配指导
     * @param productName 产品名称
     * @return 分配指导列表
     */
    List<ProductProfitDistributionGuide> selectByProductName(@Param("productName") String productName);
    
    /**
     * 根据产品名称和角色查询分配指导
     * @param productName 产品名称
     * @param role 角色
     * @return 分配指导
     */
    ProductProfitDistributionGuide selectByProductNameAndRole(@Param("productName") String productName, @Param("role") String role);
    
    /**
     * 根据角色查询分配指导
     * @param role 角色
     * @return 分配指导列表
     */
    List<ProductProfitDistributionGuide> selectByRole(@Param("role") String role);
    
    /**
     * 查询所有产品名称
     * @return 产品名称列表
     */
    List<String> selectAllProductNames();
    
    /**
     * 查询所有角色
     * @return 角色列表
     */
    List<String> selectAllRoles();
    
    /**
     * 根据提成类型查询分配指导
     * @param commissionType 提成类型
     * @return 分配指导列表
     */
    List<ProductProfitDistributionGuide> selectByCommissionType(@Param("commissionType") String commissionType);
} 