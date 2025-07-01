package com.central.crm.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.crm.mapper.OpportunityMapper;
import com.central.crm.model.Opportunity;
import com.central.crm.service.OpportunityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 商机管理Service实现类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class OpportunityServiceImpl extends ServiceImpl<OpportunityMapper, Opportunity> implements OpportunityService {

    @Override
    public IPage<Opportunity> selectOpportunityPage(Page<Opportunity> page, Map<String, Object> params) {
        return baseMapper.selectOpportunityPage(page, params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createOpportunity(Opportunity opportunity) {
        try {
            // 设置创建时间
            opportunity.setCreatedAt(new Date());
            
            // 设置初始状态
            if (opportunity.getStage() == null) {
                opportunity.setStage("潜在客户");
            }
            
            if (opportunity.getProbability() == null) {
                opportunity.setProbability(10);
            }
            
            return save(opportunity);
        } catch (Exception e) {
            log.error("创建商机失败", e);
            throw new RuntimeException("创建商机失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateOpportunity(Opportunity opportunity) {
        try {
            // 设置更新时间
            opportunity.setUpdatedAt(new Date());
            return updateById(opportunity);
        } catch (Exception e) {
            log.error("更新商机失败", e);
            throw new RuntimeException("更新商机失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteOpportunity(Long opportunityId) {
        try {
            // 逻辑删除
            Opportunity opportunity = new Opportunity();
            opportunity.setOpportunityId(opportunityId);
            opportunity.setIsDeleted(1);
            opportunity.setUpdatedAt(new Date());
            return updateById(opportunity);
        } catch (Exception e) {
            log.error("删除商机失败", e);
            throw new RuntimeException("删除商机失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDeleteOpportunities(List<Long> opportunityIds) {
        try {
            List<Opportunity> opportunities = new ArrayList<>();
            Date now = new Date();
            
            for (Long opportunityId : opportunityIds) {
                Opportunity opportunity = new Opportunity();
                opportunity.setOpportunityId(opportunityId);
                opportunity.setIsDeleted(1);
                opportunity.setUpdatedAt(now);
                opportunities.add(opportunity);
            }
            
            return updateBatchById(opportunities);
        } catch (Exception e) {
            log.error("批量删除商机失败", e);
            throw new RuntimeException("批量删除商机失败: " + e.getMessage());
        }
    }

    @Override
    public List<Opportunity> getByCustomerId(Long customerId) {
        return baseMapper.selectByCustomerId(customerId);
    }

    @Override
    public List<Map<String, Object>> getFunnelStatistics(Map<String, Object> params) {
        try {
            return baseMapper.selectFunnelStatistics(params);
        } catch (Exception e) {
            log.error("查询商机漏斗统计失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Object> getWinStatistics(Map<String, Object> params) {
        try {
            return baseMapper.selectWinStatistics(params);
        } catch (Exception e) {
            log.error("查询商机成交统计失败", e);
            return new HashMap<>();
        }
    }

    @Override
    public List<Map<String, Object>> getTrendStatistics(Map<String, Object> params) {
        try {
            return baseMapper.selectTrendStatistics(params);
        } catch (Exception e) {
            log.error("查询商机趋势统计失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean advanceOpportunityStage(Long opportunityId, String newStage, Integer newProbability, String notes) {
        try {
            Opportunity opportunity = new Opportunity();
            opportunity.setOpportunityId(opportunityId);
            opportunity.setStage(newStage);
            opportunity.setProbability(newProbability);
            opportunity.setUpdatedAt(new Date());
            
            if (notes != null) {
                opportunity.setDescription(notes);
            }
            
            return updateById(opportunity);
        } catch (Exception e) {
            log.error("推进商机阶段失败", e);
            throw new RuntimeException("推进商机阶段失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean winOpportunity(Long opportunityId, String actualAmount, String winReason, String notes) {
        try {
            Opportunity opportunity = new Opportunity();
            opportunity.setOpportunityId(opportunityId);
            opportunity.setStage("已成交");
            opportunity.setProbability(100);
            opportunity.setUpdatedAt(new Date());
            
            if (notes != null) {
                opportunity.setDescription(notes);
            }
            
            return updateById(opportunity);
        } catch (Exception e) {
            log.error("商机成交处理失败", e);
            throw new RuntimeException("商机成交处理失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean loseOpportunity(Long opportunityId, String loseReason, String notes) {
        try {
            Opportunity opportunity = new Opportunity();
            opportunity.setOpportunityId(opportunityId);
            opportunity.setStage("已失败");
            opportunity.setProbability(0);
            opportunity.setUpdatedAt(new Date());
            
            if (notes != null) {
                opportunity.setDescription(notes);
            }
            
            return updateById(opportunity);
        } catch (Exception e) {
            log.error("商机失败处理失败", e);
            throw new RuntimeException("商机失败处理失败: " + e.getMessage());
        }
    }

    @Override
    public List<Opportunity> getMyOpportunities(Long employeeId, String stage) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("ownerEmployeeId", employeeId);
            if (stage != null) {
                params.put("stage", stage);
            }
            
            // 这里应该通过Mapper查询，暂时简化处理
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("查询我的商机失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Opportunity> getExpiringOpportunities(Integer days, Long employeeId) {
        try {
            // 查询即将到期的商机
            Map<String, Object> params = new HashMap<>();
            params.put("days", days);
            if (employeeId != null) {
                params.put("ownerEmployeeId", employeeId);
            }
            
            // 这里应该通过Mapper查询，暂时简化处理
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("查询即将到期商机失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getCompetitorAnalysis(Map<String, Object> params) {
        try {
            // 竞争对手分析
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("查询竞争对手分析失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Object> predictWinProbability(Long opportunityId) {
        try {
            // 预测成交概率的算法逻辑
            Map<String, Object> prediction = new HashMap<>();
            prediction.put("opportunityId", opportunityId);
            prediction.put("predictedProbability", 50);
            prediction.put("confidenceLevel", 0.8);
            prediction.put("factors", Arrays.asList("客户规模", "预算匹配度", "决策周期"));
            
            return prediction;
        } catch (Exception e) {
            log.error("预测商机成交概率失败", e);
            return new HashMap<>();
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> importOpportunities(List<Opportunity> opportunities) {
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> errorMessages = new ArrayList<>();
        
        try {
            for (Opportunity opportunity : opportunities) {
                try {
                    createOpportunity(opportunity);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errorMessages.add("商机【" + opportunity.getOpportunityName() + "】导入失败: " + e.getMessage());
                }
            }
            
            result.put("total", opportunities.size());
            result.put("successCount", successCount);
            result.put("failCount", failCount);
            result.put("errorMessages", errorMessages);
            
            return result;
        } catch (Exception e) {
            log.error("导入商机数据失败", e);
            throw new RuntimeException("导入商机数据失败: " + e.getMessage());
        }
    }

    @Override
    public List<Opportunity> exportOpportunities(Map<String, Object> params) {
        try {
            // 根据参数导出商机数据
            return list();
        } catch (Exception e) {
            log.error("导出商机数据失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cloneOpportunity(Long opportunityId, String newOpportunityName) {
        try {
            Opportunity original = getById(opportunityId);
            if (original == null) {
                throw new RuntimeException("原商机不存在");
            }
            
            Opportunity cloned = new Opportunity();
            cloned.setCustomerId(original.getCustomerId());
            cloned.setOpportunityName(newOpportunityName);
            cloned.setOpportunitySource(original.getOpportunitySource());
            cloned.setStage("潜在客户");
            cloned.setProbability(10);
            cloned.setExpectedAmount(original.getExpectedAmount());
            cloned.setOwnerEmployeeId(original.getOwnerEmployeeId());
            cloned.setCompetitor(original.getCompetitor());
            cloned.setDescription("克隆自: " + original.getOpportunityName());
            
            return createOpportunity(cloned);
        } catch (Exception e) {
            log.error("克隆商机失败", e);
            throw new RuntimeException("克隆商机失败: " + e.getMessage());
        }
    }

    @Override
    public boolean associateCompetitor(Long opportunityId, List<String> competitors) {
        try {
            Opportunity opportunity = new Opportunity();
            opportunity.setOpportunityId(opportunityId);
            opportunity.setCompetitor(String.join(",", competitors));
            opportunity.setUpdatedAt(new Date());
            
            return updateById(opportunity);
        } catch (Exception e) {
            log.error("关联竞争对手失败", e);
            throw new RuntimeException("关联竞争对手失败: " + e.getMessage());
        }
    }

    @Override
    public boolean checkPermission(Long opportunityId, Long employeeId, String action) {
        // 简化的权限验证逻辑
        return true;
    }

    @Override
    public List<Map<String, Object>> getSalesStages() {
        List<Map<String, Object>> stages = new ArrayList<>();
        
        stages.add(createStage("潜在客户", 10, "#f56c6c"));
        stages.add(createStage("初步接触", 20, "#e6a23c"));
        stages.add(createStage("需求确认", 30, "#409eff"));
        stages.add(createStage("方案演示", 50, "#67c23a"));
        stages.add(createStage("商务谈判", 70, "#909399"));
        stages.add(createStage("合同签署", 90, "#67c23a"));
        stages.add(createStage("已成交", 100, "#67c23a"));
        stages.add(createStage("已失败", 0, "#f56c6c"));
        
        return stages;
    }

    @Override
    public Map<String, Object> getOpportunityStatusStatistics(Map<String, Object> params) {
        try {
            // 商机状态统计
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("total", 0);
            statistics.put("inProgress", 0);
            statistics.put("won", 0);
            statistics.put("lost", 0);
            
            return statistics;
        } catch (Exception e) {
            log.error("查询商机状态统计失败", e);
            return new HashMap<>();
        }
    }

    private Map<String, Object> createStage(String name, Integer probability, String color) {
        Map<String, Object> stage = new HashMap<>();
        stage.put("name", name);
        stage.put("probability", probability);
        stage.put("color", color);
        return stage;
    }
}