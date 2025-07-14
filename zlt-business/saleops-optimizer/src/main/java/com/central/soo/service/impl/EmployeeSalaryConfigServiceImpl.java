package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.mapper.EmployeeSalaryConfigMapper;
import com.central.soo.model.EmployeeSalaryConfig;
import com.central.soo.model.dto.EmployeeSalaryQueryDTO;
import com.central.soo.model.vo.EmployeeSalaryVO;
import com.central.soo.service.IEmployeeSalaryConfigService;
import com.central.soo.feign.EmployeeFeignClient;
import com.central.soo.mapper.JobLevelSalaryMapper;
import com.central.soo.model.JobLevelSalary;
import com.central.common.model.Result;
import com.central.common.model.PageResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class EmployeeSalaryConfigServiceImpl extends com.baomidou.mybatisplus.extension.service.impl.ServiceImpl<EmployeeSalaryConfigMapper, EmployeeSalaryConfig> implements IEmployeeSalaryConfigService {
    
    @Autowired
    private EmployeeFeignClient employeeFeignClient;
    
    @Autowired
    private JobLevelSalaryMapper jobLevelSalaryMapper;

    @Override
    public IPage<EmployeeSalaryVO> pageEmployeeSalary(EmployeeSalaryQueryDTO query) {
        try {
            // 1. 调用组织服务获取员工列表
            PageResult<Map<String, Object>> employeePageResult = employeeFeignClient.getEmployeePage(
                query.getPageNum(), query.getPageSize(), 
                query.getEmployeeName(), query.getEmployeeNo(), 
                query.getDepartmentId(), 1); // 1表示在职状态

            if (employeePageResult == null || employeePageResult.getData() == null) {
                return new Page<>(query.getPageNum(), query.getPageSize());
            }

            // 新增：判断resp_code是否为0
            if (employeePageResult.getResp_code() != null && employeePageResult.getResp_code() != 0) {
                return new Page<>(query.getPageNum(), query.getPageSize());
            }
            List<Map<String, Object>> employees = employeePageResult.getData();
            
            if (employees == null || employees.isEmpty()) {
                return new Page<>(query.getPageNum(), query.getPageSize());
            }

            // 2. 获取员工ID列表
            List<Long> employeeIds = employees.stream()
                .map(emp -> getLongValue(emp.get("id")))
                .collect(Collectors.toList());

            // 3. 查询员工薪酬配置
            QueryWrapper<EmployeeSalaryConfig> configQuery = new QueryWrapper<>();
            configQuery.in("employee_id", employeeIds);
            configQuery.eq("delflag", 0);
            if (query.getStatus() != null) {
                configQuery.eq("status", query.getStatus());
            }
            List<EmployeeSalaryConfig> salaryConfigs = this.list(configQuery);

            // 4. 组装返回数据
            List<EmployeeSalaryVO> result = new ArrayList<>();
            Map<Long, EmployeeSalaryConfig> salaryConfigMap = salaryConfigs.stream()
                .collect(Collectors.toMap(EmployeeSalaryConfig::getEmployeeId, config -> config, (existing, replacement) -> existing));

            for (Map<String, Object> employee : employees) {
                EmployeeSalaryVO vo = new EmployeeSalaryVO();
                Long employeeId = getLongValue(employee.get("id"));
                
                // 设置员工基础信息
                vo.setEmployeeId(employeeId);
                vo.setEmployeeNo(getStringValue(employee.get("empNo")));
                vo.setEmployeeName(getStringValue(employee.get("name")));
                vo.setMobile(getStringValue(employee.get("mobile")));
                vo.setEmail(getStringValue(employee.get("email")));
                vo.setDepartmentId(getLongValue(employee.get("departmentId")));
                vo.setDepartmentName(getStringValue(employee.get("departmentName")));
                vo.setPositionId(getLongValue(employee.get("positionId")));
                vo.setPositionName(getStringValue(employee.get("positionName")));

                // 获取职位职级标准信息（统一查询一次）
                EmployeeSalaryVO.JobLevelInfo jobLevelInfo = getJobLevelByPositionId(vo.getPositionId());
                vo.setJobLevelInfo(jobLevelInfo);

                // 设置薪酬配置信息
                EmployeeSalaryConfig salaryConfig = salaryConfigMap.get(employeeId);
                if (salaryConfig != null) {
                    vo.setId(salaryConfig.getId());
                    EmployeeSalaryVO.SalaryConfigDetail configDetail = new EmployeeSalaryVO.SalaryConfigDetail();
                    configDetail.setId(salaryConfig.getId());
                    configDetail.setBaseSalary(salaryConfig.getBaseSalary());
                    configDetail.setRegion(salaryConfig.getRegion());
                    configDetail.setRegionName(getRegionName(salaryConfig.getRegion()));
                    configDetail.setIsSalesIncentive(salaryConfig.getIsSalesIncentive());
                    configDetail.setIsTeamIncentive(salaryConfig.getIsTeamIncentive());
                    configDetail.setIsDepartmentBonus(salaryConfig.getIsDepartmentBonus());
                    configDetail.setSalesIncentiveRatio(salaryConfig.getSalesIncentiveRatio());
                    configDetail.setTeamIncentiveRatio(salaryConfig.getTeamIncentiveRatio());
                    configDetail.setEffectiveDate(salaryConfig.getEffectiveDate());
                    configDetail.setExpireDate(salaryConfig.getExpireDate());
                    configDetail.setStatus(salaryConfig.getStatus());
                    configDetail.setRemark(salaryConfig.getRemark());
                    
                    // 校验基础工资是否在职级标准范围内
                    boolean isInRange = true;
                    if (jobLevelInfo != null && jobLevelInfo.getBaseSalaryMin() != null && jobLevelInfo.getBaseSalaryMax() != null) {
                        isInRange = salaryConfig.getBaseSalary().compareTo(jobLevelInfo.getBaseSalaryMin()) >= 0 
                                && salaryConfig.getBaseSalary().compareTo(jobLevelInfo.getBaseSalaryMax()) <= 0;
                    }
                    configDetail.setIsInRange(isInRange);
                    vo.setSalaryConfig(configDetail);
                }

                result.add(vo);
            }

            // 4.5. 根据薪酬状态筛选
            if (query.getSalaryStatus() != null && !query.getSalaryStatus().isEmpty()) {
                result = result.stream().filter(vo -> {
                    switch (query.getSalaryStatus()) {
                        case "CONFIGURED":
                            return vo.getSalaryConfig() != null;
                        case "NOT_CONFIGURED":
                            return vo.getSalaryConfig() == null;
                        case "EXPIRED":
                            return vo.getSalaryConfig() != null && 
                                   vo.getSalaryConfig().getExpireDate() != null && 
                                   vo.getSalaryConfig().getExpireDate().isBefore(java.time.LocalDate.now());
                        case "OUT_OF_RANGE":
                            return vo.getSalaryConfig() != null && 
                                   vo.getSalaryConfig().getIsInRange() != null && 
                                   !vo.getSalaryConfig().getIsInRange();
                        default:
                            return true;
                    }
                }).collect(Collectors.toList());
            }

            // 5. 构建分页结果
            Page<EmployeeSalaryVO> page = new Page<>(query.getPageNum(), query.getPageSize());
            page.setRecords(result);
            page.setTotal(employeePageResult.getCount() != null ? employeePageResult.getCount() : result.size());
            page.setSize(query.getPageSize());
            page.setCurrent(query.getPageNum());
            
            return page;

        } catch (Exception e) {
            e.printStackTrace();
            return new Page<>(query.getPageNum(), query.getPageSize());
        }
    }

    @Override
    public IPage<EmployeeSalaryConfig> pageQuery(Page<EmployeeSalaryConfig> page, Long employeeId, String employeeName, Long departmentId, String jobLevelId, Integer status, LocalDate startDate, LocalDate endDate) {
        QueryWrapper<EmployeeSalaryConfig> qw = new QueryWrapper<>();
        if (employeeId != null) qw.eq("employee_id", employeeId);
        if (employeeName != null && !employeeName.isEmpty()) qw.like("employee_name", employeeName);
        if (departmentId != null) qw.eq("department_id", departmentId);
        if (jobLevelId != null && !jobLevelId.isEmpty()) qw.eq("job_level_id", jobLevelId);
        if (status != null) qw.eq("status", status);
        if (startDate != null) qw.ge("effective_date", startDate);
        if (endDate != null) qw.le("effective_date", endDate);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        return this.page(page, qw);
    }

    @Override
    public boolean checkUnique(Long employeeId, LocalDate effectiveDate, Long excludeId) {
        QueryWrapper<EmployeeSalaryConfig> qw = new QueryWrapper<>();
        qw.eq("employee_id", employeeId);
        qw.eq("effective_date", effectiveDate);
        qw.eq("delflag", 0);
        if (excludeId != null) {
            qw.ne("id", excludeId);
        }
        return this.count(qw) == 0;
    }

    @Override
    public boolean validateSalaryRange(Long positionId, BigDecimal baseSalary) {
        if (positionId == null || baseSalary == null) {
            return false;
        }
        
        // 通过positionId查询soo_job_level_salary表获取工资范围进行校验
        EmployeeSalaryVO.JobLevelInfo jobLevelInfo = getJobLevelByPositionId(positionId);
        if (jobLevelInfo == null || jobLevelInfo.getBaseSalaryMin() == null || jobLevelInfo.getBaseSalaryMax() == null) {
            return true; // 没有配置职级标准时，暂时允许通过
        }
        
        return baseSalary.compareTo(jobLevelInfo.getBaseSalaryMin()) >= 0 
            && baseSalary.compareTo(jobLevelInfo.getBaseSalaryMax()) <= 0;
    }

    @Override
    public List<EmployeeSalaryConfig> getHistoryByEmployee(Long employeeId) {
        QueryWrapper<EmployeeSalaryConfig> qw = new QueryWrapper<>();
        qw.eq("employee_id", employeeId);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        return this.list(qw);
    }

    @Override
    public boolean restore(Long id) {
        EmployeeSalaryConfig config = this.getById(id);
        if (config != null) {
            config.setDelflag(0);
            return this.updateById(config);
        }
        return false;
    }

    @Override
    public List<Map<String, Object>> getJobLevelList() {
        try {
            // 查询所有职级薪资标准，按部门和岗位分组
            QueryWrapper<JobLevelSalary> query = new QueryWrapper<>();
            query.eq("status", 1);
            query.eq("delflag", 0);
            query.orderByAsc("department_id");
            query.orderByAsc("position_id");
            
            List<JobLevelSalary> jobLevelSalaryList = jobLevelSalaryMapper.selectList(query);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (JobLevelSalary jobLevelSalary : jobLevelSalaryList) {
                Map<String, Object> level = new HashMap<>();
                level.put("id", jobLevelSalary.getId());
                level.put("jobLevelCode", jobLevelSalary.getJobLevelCode());
                level.put("jobLevelName", getJobLevelName(jobLevelSalary.getJobLevelCode()));
                level.put("departmentId", jobLevelSalary.getDepartmentId());
                level.put("positionId", jobLevelSalary.getPositionId());
                level.put("baseSalaryMin", jobLevelSalary.getBaseSalaryMin());
                level.put("baseSalaryMax", jobLevelSalary.getBaseSalaryMax());
                level.put("performanceRatioMin", jobLevelSalary.getPerformanceRatioMin());
                level.put("performanceRatioMax", jobLevelSalary.getPerformanceRatioMax());
                result.add(level);
            }
            
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getDepartmentTree() {
        try {
            Result<List<Map<String, Object>>> result = employeeFeignClient.getDepartmentTree();
            if (result != null && result.getDatas() != null) {
                return result.getDatas();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getRegionList() {
        // 返回常用地区列表
        List<Map<String, Object>> result = new ArrayList<>();
        
        String[] regions = {"BEIJING", "SHANGHAI", "GUANGZHOU", "SHENZHEN", "HANGZHOU", "NANJING", "WUHAN", "CHENGDU"};
        String[] regionNames = {"北京", "上海", "广州", "深圳", "杭州", "南京", "武汉", "成都"};
        
        for (int i = 0; i < regions.length; i++) {
            Map<String, Object> region = new HashMap<>();
            region.put("code", regions[i]);
            region.put("name", regionNames[i]);
            result.add(region);
        }
        
        return result;
    }

    @Override
    public boolean saveEmployeeSalary(EmployeeSalaryConfig config) {
        return this.save(config);
    }

    @Override
    public boolean updateEmployeeSalary(EmployeeSalaryConfig config) {
        return this.updateById(config);
    }

    // 辅助方法
    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private String getStringValue(Object value) {
        return value != null ? value.toString() : null;
    }

    private String getRegionName(String regionCode) {
        if (regionCode == null) return null;
        switch (regionCode) {
            case "BEIJING": return "北京";
            case "SHANGHAI": return "上海";
            case "GUANGZHOU": return "广州";
            case "SHENZHEN": return "深圳";
            case "HANGZHOU": return "杭州";
            case "NANJING": return "南京";
            case "WUHAN": return "武汉";
            case "CHENGDU": return "成都";
            default: return regionCode;
        }
    }

    /**
     * 根据岗位ID查询职位职级标准信息
     */
    private EmployeeSalaryVO.JobLevelInfo getJobLevelByPositionId(Long positionId) {
        if (positionId == null) {
            return null;
        }

        try {
            // 查询soo_job_level_salary表，根据position_id获取职位职级标准
            QueryWrapper<JobLevelSalary> query = new QueryWrapper<>();
            query.eq("position_id", positionId);
            query.eq("status", 1);
            query.eq("delflag", 0);
            query.orderByDesc("effective_date");
            query.last("LIMIT 1"); // 取最新的一条记录
            
            JobLevelSalary jobLevelSalary = jobLevelSalaryMapper.selectOne(query);
            
            if (jobLevelSalary != null) {
                EmployeeSalaryVO.JobLevelInfo jobLevelInfo = new EmployeeSalaryVO.JobLevelInfo();
                jobLevelInfo.setId(jobLevelSalary.getId());
                jobLevelInfo.setJobLevelId(jobLevelSalary.getJobLevelCode());
                jobLevelInfo.setJobLevelName(getJobLevelName(jobLevelSalary.getJobLevelCode()));
                jobLevelInfo.setBaseSalaryMin(jobLevelSalary.getBaseSalaryMin());
                jobLevelInfo.setBaseSalaryMax(jobLevelSalary.getBaseSalaryMax());
                jobLevelInfo.setPerformanceRatioMin(jobLevelSalary.getPerformanceRatioMin());
                jobLevelInfo.setPerformanceRatioMax(jobLevelSalary.getPerformanceRatioMax());
                return jobLevelInfo;
            }
            
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * 根据职级编码获取职级名称
     */
    private String getJobLevelName(String jobLevelCode) {
        if (jobLevelCode == null) return null;
        // 这里可以通过字典服务获取职级名称，暂时用简单映射
        switch (jobLevelCode) {
            case "P1": return "P1级别";
            case "P2": return "P2级别";
            case "P3": return "P3级别";
            case "P4": return "P4级别";
            case "P5": return "P5级别";
            case "M1": return "M1级别";
            case "M2": return "M2级别";
            case "M3": return "M3级别";
            default: return jobLevelCode;
        }
    }
} 