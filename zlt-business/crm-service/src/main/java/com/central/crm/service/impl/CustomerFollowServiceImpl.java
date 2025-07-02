package com.central.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.crm.feign.EmployeeFeignService;
import com.central.crm.mapper.CustomerFollowMapper;
import com.central.crm.model.CustomerFollow;
import com.central.crm.service.CustomerFollowService;
import com.central.common.model.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 客户跟进Service实现类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class CustomerFollowServiceImpl extends ServiceImpl<CustomerFollowMapper, CustomerFollow> implements CustomerFollowService {

    @Autowired
    private EmployeeFeignService employeeFeignService;

    @Override
    public IPage<CustomerFollow> selectFollowPage(Page<CustomerFollow> page, Map<String, Object> params) {
        IPage<CustomerFollow> followPage = baseMapper.selectFollowPage(page, params);
        
        // 填充员工信息
        if (followPage.getRecords() != null && !followPage.getRecords().isEmpty()) {
            fillEmployeeNames(followPage.getRecords());
        }
        
        return followPage;
    }
    
    /**
     * 批量填充员工姓名
     */
    private void fillEmployeeNames(List<CustomerFollow> follows) {
        try {
            // 提取所有员工ID
            List<String> employeeIds = follows.stream()
                    .map(follow -> follow.getEmployeeId().toString())
                    .distinct()
                    .collect(Collectors.toList());
            
            if (employeeIds.isEmpty()) {
                return;
            }
            
            // 批量查询员工信息
            Result<List<Map<String, Object>>> result = employeeFeignService.getEmployeeBatchDetail(employeeIds);
            if (result != null && result.getDatas() != null) {
                Map<Long, String> employeeNameMap = result.getDatas().stream()
                        .collect(Collectors.toMap(
                                emp -> Long.valueOf(emp.get("id").toString()),
                                emp -> emp.get("name").toString(),
                                (existing, replacement) -> existing
                        ));
                
                // 设置员工姓名
                follows.forEach(follow -> {
                    String employeeName = employeeNameMap.get(follow.getEmployeeId());
                    follow.setEmployeeName(employeeName != null ? employeeName : "未知员工");
                });
            } else {
                log.warn("获取员工信息失败，result: {}", result);
                // 设置默认值
                follows.forEach(follow -> follow.setEmployeeName("未知员工"));
            }
        } catch (Exception e) {
            log.error("填充员工姓名失败", e);
            // 设置默认值
            follows.forEach(follow -> follow.setEmployeeName("未知员工"));
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createFollow(CustomerFollow follow) {
        try {
            // 设置创建时间
            follow.setCreatedAt(new Date());
            // 设置跟进时间（如果没有设置）
            if (follow.getFollowTime() == null) {
                follow.setFollowTime(new Date());
            }
            // 设置默认阶段
            if (!StringUtils.hasText(follow.getStage())) {
                follow.setStage("初步接触");
            }
            
            return save(follow);
        } catch (Exception e) {
            log.error("创建跟进记录失败", e);
            throw new RuntimeException("创建跟进记录失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateFollow(CustomerFollow follow) {
        try {
            // 设置更新时间
            follow.setUpdatedAt(new Date());
            return updateById(follow);
        } catch (Exception e) {
            log.error("更新跟进记录失败", e);
            throw new RuntimeException("更新跟进记录失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteFollow(Long followId) {
        try {
            return removeById(followId);
        } catch (Exception e) {
            log.error("删除跟进记录失败", e);
            throw new RuntimeException("删除跟进记录失败: " + e.getMessage());
        }
    }

    @Override
    public List<CustomerFollow> getByCustomerId(Long customerId) {
        return baseMapper.selectByCustomerId(customerId);
    }

    @Override
    public List<Map<String, Object>> getPendingFollowList(Map<String, Object> params) {
        return baseMapper.selectPendingFollowList(params);
    }

    @Override
    public Map<String, Object> getFollowStatistics(Map<String, Object> params) {
        return baseMapper.selectFollowStatistics(params);
    }

    @Override
    public List<CustomerFollow> getRecentFollows(Map<String, Object> params) {
        return baseMapper.selectRecentFollows(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> batchCreateFollows(List<CustomerFollow> follows) {
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> errorMessages = new ArrayList<>();

        for (CustomerFollow follow : follows) {
            try {
                if (createFollow(follow)) {
                    successCount++;
                } else {
                    failCount++;
                    errorMessages.add("跟进记录 " + follow.getContent() + " 创建失败");
                }
            } catch (Exception e) {
                failCount++;
                errorMessages.add("跟进记录 " + follow.getContent() + " 创建异常: " + e.getMessage());
            }
        }

        result.put("totalCount", follows.size());
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errorMessages", errorMessages);

        return result;
    }

    @Override
    public List<CustomerFollow> exportFollows(Map<String, Object> params) {
        LambdaQueryWrapper<CustomerFollow> wrapper = new LambdaQueryWrapper<>();
        
        // 根据参数构建查询条件
        if (params.get("followType") != null) {
            wrapper.eq(CustomerFollow::getFollowType, params.get("followType"));
        }
        if (params.get("stage") != null) {
            wrapper.eq(CustomerFollow::getStage, params.get("stage"));
        }
        if (params.get("employeeId") != null) {
            wrapper.eq(CustomerFollow::getEmployeeId, params.get("employeeId"));
        }
        if (params.get("customerId") != null) {
            wrapper.eq(CustomerFollow::getCustomerId, params.get("customerId"));
        }
        if (params.get("startDate") != null) {
            wrapper.ge(CustomerFollow::getFollowTime, params.get("startDate"));
        }
        if (params.get("endDate") != null) {
            wrapper.le(CustomerFollow::getFollowTime, params.get("endDate"));
        }
        
        wrapper.orderByDesc(CustomerFollow::getFollowTime);
        
        return list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean setFollowReminder(Long followId, String reminderTime, String reminderContent) {
        try {
            CustomerFollow follow = new CustomerFollow();
            follow.setFollowId(followId);
            // TODO: 实现提醒功能，可能需要添加提醒相关字段
            follow.setUpdatedAt(new Date());
            return updateById(follow);
        } catch (Exception e) {
            log.error("设置跟进提醒失败", e);
            throw new RuntimeException("设置跟进提醒失败: " + e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> getMyFollowTasks(Long employeeId) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("employeeId", employeeId);
            params.put("needFollowUp", true);  // 只查询需要跟进的任务
            
            return baseMapper.selectPendingFollowList(params);
        } catch (Exception e) {
            log.error("获取我的跟进任务失败", e);
            throw new RuntimeException("获取我的跟进任务失败: " + e.getMessage());
        }
    }
}