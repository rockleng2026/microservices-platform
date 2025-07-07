package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.mapper.MonthlyPerformanceMapper;
import com.central.soo.model.MonthlyPerformance;
import com.central.soo.service.IMonthlyPerformanceService;
import com.central.soo.feign.DepartmentFeignClient;
import com.central.common.exception.BusinessException;
import com.central.common.model.Result;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MonthlyPerformanceServiceImpl extends com.baomidou.mybatisplus.extension.service.impl.ServiceImpl<MonthlyPerformanceMapper, MonthlyPerformance> implements IMonthlyPerformanceService {
    
    @Autowired
    private DepartmentFeignClient departmentFeignClient;
    
    @Override
    public IPage<MonthlyPerformance> pageQuery(Page<MonthlyPerformance> page, Long employeeId, String employeeName, Long departmentId, String month, Integer status, Boolean includeSubDept) {
        QueryWrapper<MonthlyPerformance> qw = new QueryWrapper<>();
        
        if (employeeId != null) {
            qw.eq("employee_id", employeeId);
        }
        if (employeeName != null && !employeeName.isEmpty()) {
            qw.like("employee_name", employeeName);
        }
        if (departmentId != null) {
            if (includeSubDept != null && includeSubDept) {
                // 获取部门及其所有子部门ID
                List<Long> departmentIds = getDepartmentAndSubDepartmentIds(departmentId);
                if (!departmentIds.isEmpty()) {
                    qw.in("department_id", departmentIds);
                }
            } else {
                qw.eq("department_id", departmentId);
            }
        }
        if (month != null && !month.isEmpty()) {
            qw.eq("month", month);
        }
        if (status != null) {
            qw.eq("status", status);
        }
        qw.eq("delflag", 0);
        qw.orderByDesc("month");
        return this.page(page, qw);
    }
    
    /**
     * 获取部门及其所有子部门ID
     */
    private List<Long> getDepartmentAndSubDepartmentIds(Long departmentId) {
        List<Long> departmentIds = new ArrayList<>();
        departmentIds.add(departmentId); // 包含自己
        
        try {
            // 调用组织服务获取子部门，使用Feign客户端
            log.info("调用组织服务获取子部门，部门ID: {}", departmentId);
            Result<List<Map<String, Object>>> result = departmentFeignClient.getChildDepartmentTree(departmentId, false);
            log.info("组织服务响应: {}", result);
            
            if (result != null && result.getResp_code() != null && result.getResp_code() == 0) {
                List<Map<String, Object>> children = result.getDatas();
                log.info("获取到的子部门数据: {}", children);
                if (children != null && !children.isEmpty()) {
                    collectDepartmentIds(children, departmentIds);
                    log.info("收集完成，总部门ID列表: {}", departmentIds);
                }
            } else {
                log.warn("组织服务返回失败: {}", result != null ? result.getResp_msg() : "null result");
            }
        } catch (Exception e) {
            log.error("获取子部门失败，仅查询当前部门: " + departmentId, e);
        }
        
        log.info("最终查询的部门ID列表: {}", departmentIds);
        return departmentIds;
    }
    
    /**
     * 递归收集部门ID
     */
    private void collectDepartmentIds(List<Map<String, Object>> departments, List<Long> departmentIds) {
        for (Map<String, Object> dept : departments) {
            Object idObj = dept.get("id");
            if (idObj != null) {
                Long deptId = null;
                if (idObj instanceof Number) {
                    deptId = ((Number) idObj).longValue();
                } else if (idObj instanceof String) {
                    try {
                        deptId = Long.parseLong((String) idObj);
                    } catch (NumberFormatException e) {
                        log.warn("无效的部门ID格式: {}", idObj);
                    }
                }
                if (deptId != null) {
                    departmentIds.add(deptId);
                    log.debug("添加部门ID: {}", deptId);
                }
            }
            
            // 递归处理子部门
            Object childrenObj = dept.get("children");
            if (childrenObj instanceof List) {
                List<Map<String, Object>> children = (List<Map<String, Object>>) childrenObj;
                log.debug("递归处理子部门，数量: {}", children.size());
                collectDepartmentIds(children, departmentIds);
            }
        }
    }

    @Override
    public boolean checkUnique(Long employeeId, String month, Long excludeId) {
        QueryWrapper<MonthlyPerformance> qw = new QueryWrapper<>();
        qw.eq("employee_id", employeeId);
        qw.eq("month", month);
        qw.eq("delflag", 0);
        if (excludeId != null) qw.ne("id", excludeId);
        return this.count(qw) == 0;
    }

    @Override
    public List<MonthlyPerformance> getHistoryByEmployee(Long employeeId) {
        QueryWrapper<MonthlyPerformance> qw = new QueryWrapper<>();
        qw.eq("employee_id", employeeId);
        qw.eq("delflag", 0);
        qw.orderByDesc("month");
        return this.list(qw);
    }

    @Override
    public boolean restore(Long id) {
        MonthlyPerformance config = this.getById(id);
        if (config != null && config.getDelflag() != null && config.getDelflag() == 1) {
            config.setDelflag(0);
            return this.updateById(config);
        }
        return false;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchSave(List<MonthlyPerformance> list) {
        if (list == null || list.isEmpty()) {
            throw new BusinessException("批量数据不能为空", 400);
        }
        // 批次内唯一性校验 key: employeeId+month
        java.util.Set<String> batchKeySet = new java.util.HashSet<>();
        for (MonthlyPerformance mp : list) {
            if (mp.getEmployeeId() == null) {
                throw new BusinessException("员工ID不能为空", 400);
            }
            if (mp.getMonth() == null || mp.getMonth().trim().isEmpty()) {
                throw new BusinessException("月份不能为空", 400);
            }
            if (mp.getPerformanceScore() == null) {
                throw new BusinessException("绩效得分不能为空", 400);
            }
            if (mp.getPerformanceScore().compareTo(java.math.BigDecimal.ZERO) < 0 || mp.getPerformanceScore().compareTo(new java.math.BigDecimal("100")) > 0) {
                throw new BusinessException("绩效得分必须在0-100之间", 400);
            }
            if (mp.getPersonalProjectRevenue() != null && mp.getPersonalProjectRevenue().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new BusinessException("个人项目营业额不能为负", 400);
            }
            if (mp.getPersonalProjectMargin() != null && (mp.getPersonalProjectMargin().compareTo(java.math.BigDecimal.ZERO) < 0 || mp.getPersonalProjectMargin().compareTo(java.math.BigDecimal.ONE) > 0)) {
                throw new BusinessException("个人项目毛利率必须在0-1之间", 400);
            }
            if (mp.getTeamProjectRevenue() != null && mp.getTeamProjectRevenue().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new BusinessException("团队项目营业额不能为负", 400);
            }
            if (mp.getTeamProjectMargin() != null && (mp.getTeamProjectMargin().compareTo(java.math.BigDecimal.ZERO) < 0 || mp.getTeamProjectMargin().compareTo(java.math.BigDecimal.ONE) > 0)) {
                throw new BusinessException("团队项目毛利率必须在0-1之间", 400);
            }
            String key = mp.getEmployeeId() + "_" + mp.getMonth();
            if (!batchKeySet.add(key)) {
                throw new BusinessException("批量数据中存在同一员工同一月份的重复数据", 400);
            }
        }
        // 数据库唯一性校验
        for (MonthlyPerformance mp : list) {
            boolean unique = this.checkUnique(mp.getEmployeeId(), mp.getMonth(), null);
            if (!unique) {
                throw new BusinessException("数据库中已存在该员工该月份的绩效数据，员工ID:" + mp.getEmployeeId() + ", 月份:" + mp.getMonth(), 400);
            }
        }
        // 全部校验通过后批量保存
        this.saveBatch(list);
    }
} 