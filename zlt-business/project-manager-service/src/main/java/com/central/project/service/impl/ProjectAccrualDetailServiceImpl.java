package com.central.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.central.project.mapper.ProjectAccrualDetailMapper;
import com.central.project.model.ProjectAccrualDetail;
import com.central.project.model.ProjectClosure;
import com.central.project.service.IProjectAccrualDetailService;
import com.central.project.service.IProjectService;
import com.central.common.context.TenantContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
public class ProjectAccrualDetailServiceImpl implements IProjectAccrualDetailService {
    @Resource
    private ProjectAccrualDetailMapper detailMapper;
    @Resource
    private IProjectAccrualDetailService detailService;
    @Resource
    private IProjectService projectService;

    @Override
    public List<ProjectAccrualDetail> getByProjectId(Long projectId) {
        return detailMapper.selectList(new QueryWrapper<ProjectAccrualDetail>().eq("project_id", projectId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveOrUpdateBatch(List<ProjectAccrualDetail> details, Long projectId) {
        try {
            // 先删除历史明细
            detailMapper.delete(new QueryWrapper<ProjectAccrualDetail>().eq("project_id", projectId));
            String tenantId = TenantContextHolder.getTenant();
            Date now = new Date();
            // 查询毛利润
            BigDecimal grossProfit = null;
            ProjectClosure closure = null;
            try {
                closure = projectService.getProjectClosure(projectId);
                if (closure != null && closure.getGrossProfit() != null) {
                    grossProfit = closure.getGrossProfit();
                }
            } catch (Exception ignored) {}
            // 插入最新明细
            for (ProjectAccrualDetail detail : details) {
                detail.setProjectId(projectId);
                detail.setTenantId(tenantId);
                // 后端自动设置时间
                if (detail.getId() == null) {
                    detail.setCreatedAt(now);
                }
                detail.setUpdatedAt(now);
                // ratio为当前模块占比，totalRatio为总毛利润占比
                if (detail.getAmount() != null && grossProfit != null && grossProfit.compareTo(BigDecimal.ZERO) > 0) {
                    detail.setTotalRatio(detail.getAmount().divide(grossProfit, 6, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("100")));
                } else {
                    detail.setTotalRatio(null);
                }
                detailMapper.insert(detail);
            }
            // 无论明细是否为空都要更新项目分配状态为assigned
            projectService.updateProjectProfitDistributionStatus(projectId, "assigned");
        } catch (Exception e) {
            // 发生异常时事务回滚
            throw e;
        }
    }
} 