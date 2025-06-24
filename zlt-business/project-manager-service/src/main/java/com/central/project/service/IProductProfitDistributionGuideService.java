package com.central.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.project.model.ProductProfitDistributionGuide;
import com.central.project.model.dto.ProductProfitDistributionGuideQueryDTO;
import com.central.project.model.dto.ProductProfitDistributionGuideSaveDTO;

import java.util.List;

/**
 * 产品毛利分配指导服务接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
public interface IProductProfitDistributionGuideService extends IService<ProductProfitDistributionGuide> {
    
    /**
     * 分页查询分配指导列表
     * @param queryDTO 查询条件
     * @return 分配指导分页列表
     */
    IPage<ProductProfitDistributionGuide> getGuidePage(ProductProfitDistributionGuideQueryDTO queryDTO);
    
    /**
     * 保存分配指导（新增或修改）
     * @param saveDTO 分配指导保存数据
     * @return 保存后的分配指导信息
     */
    ProductProfitDistributionGuide saveGuide(ProductProfitDistributionGuideSaveDTO saveDTO);
    
    /**
     * 删除分配指导（软删除）
     * @param id 分配指导ID
     * @return 是否成功
     */
    Boolean deleteGuide(Long id);
    
    /**
     * 批量删除分配指导
     * @param ids 分配指导ID列表
     * @return 是否成功
     */
    Boolean batchDeleteGuides(List<Long> ids);
    
    /**
     * 更新分配指导状态
     * @param id 分配指导ID
     * @param status 新状态
     * @return 是否成功
     */
    Boolean updateGuideStatus(Long id, String status);
    
    /**
     * 根据产品查询有效的分配指导
     * @param productName 产品名称
     * @param role 角色
     * @return 分配指导
     */
    ProductProfitDistributionGuide getActiveGuideByProduct(String productName, String role);
    
    /**
     * 根据产品类别查询分配指导列表
     * @param productName 产品名称
     * @return 分配指导列表
     */
    List<ProductProfitDistributionGuide> getGuidesByProductName(String productName);
    
    /**
     * 查询所有有效的分配指导
     * @return 分配指导列表
     */
    List<ProductProfitDistributionGuide> getAllActiveGuides();
    
    /**
     * 查询产品名称列表
     * @return 产品名称列表
     */
    List<String> getDistinctProductNames();
    
    /**
     * 查询角色列表
     * @return 角色列表
     */
    List<String> getDistinctRoles();
    
    /**
     * 根据角色查询分配指导列表
     * @param role 角色
     * @return 分配指导列表
     */
    List<ProductProfitDistributionGuide> getGuidesByRole(String role);
    
    /**
     * 根据提成类型查询分配指导列表
     * @param commissionType 提成类型
     * @return 分配指导列表
     */
    List<ProductProfitDistributionGuide> getGuidesByCommissionType(String commissionType);
    
    /**
     * 检查产品和角色是否已存在配置
     * @param productName 产品名称
     * @param role 角色
     * @param excludeId 排除的ID（用于更新时检查）
     * @return 是否存在
     */
    Boolean existsActiveConfig(String productName, String role, Long excludeId);
} 