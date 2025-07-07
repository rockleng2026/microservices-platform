package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.mapper.MonthlyPerformanceMapper;
import com.central.soo.model.MonthlyPerformance;
import com.central.soo.model.dto.MonthlyPerformanceImportDTO;
import com.central.soo.service.IMonthlyPerformanceService;
import com.central.soo.feign.DepartmentFeignClient;
import com.central.soo.feign.EmployeeFeignClient;
import com.central.common.exception.BusinessException;
import com.central.common.model.Result;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.util.regex.Pattern;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;

@Slf4j
@Service
public class MonthlyPerformanceServiceImpl extends com.baomidou.mybatisplus.extension.service.impl.ServiceImpl<MonthlyPerformanceMapper, MonthlyPerformance> implements IMonthlyPerformanceService {
    
    @Autowired
    private DepartmentFeignClient departmentFeignClient;
    
    @Autowired
    private EmployeeFeignClient employeeFeignClient;
    
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

    @Override
    public byte[] generateImportTemplate() {
        try {
            // 读取classpath下的模板文件
            ClassPathResource resource = new ClassPathResource("template/monthly_performance_template.xlsx");
            
            if (!resource.exists()) {
                // 如果模板文件不存在，动态生成一个
                log.warn("模板文件不存在，动态生成模板");
                return generateTemplateInMemory();
            }
            
            // 读取模板文件内容
            try (InputStream inputStream = resource.getInputStream();
                 ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                
                byte[] buffer = new byte[1024];
                int length;
                while ((length = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, length);
                }
                
                log.info("成功读取模板文件: {}", resource.getFilename());
                return outputStream.toByteArray();
            }
            
        } catch (Exception e) {
            log.error("读取模板文件失败，使用动态生成", e);
            return generateTemplateInMemory();
        }
    }
    
    /**
     * 在内存中动态生成模板
     */
    private byte[] generateTemplateInMemory() {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            // 创建模板数据
            List<MonthlyPerformanceImportDTO> templateData = new ArrayList<>();
            MonthlyPerformanceImportDTO template = new MonthlyPerformanceImportDTO();
            template.setMonth("2024-01");
            template.setEmployeeId(1001L);
            template.setEmployeeName("张三");
            template.setDepartmentId(1L);
            template.setDepartmentName("技术研发部");
            template.setPerformanceScore(new BigDecimal("85.5"));
            template.setPersonalProjectRevenue(new BigDecimal("50000"));
            template.setPersonalProjectMargin(new BigDecimal("0.20"));
            template.setTeamProjectRevenue(new BigDecimal("100000"));
            template.setTeamProjectMargin(new BigDecimal("0.15"));
            template.setStatus(1);
            templateData.add(template);
            
            // 生成Excel文件
            EasyExcel.write(outputStream, MonthlyPerformanceImportDTO.class)
                    .sheet("月度绩效导入模板")
                    .doWrite(templateData);
            
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("动态生成导入模板失败", e);
            throw new BusinessException("生成导入模板失败：" + e.getMessage(), 500);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> importExcelData(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        
        try {
            // 解析Excel文件
            List<MonthlyPerformanceImportDTO> importData = new ArrayList<>();
            
            EasyExcel.read(file.getInputStream(), MonthlyPerformanceImportDTO.class, new ReadListener<MonthlyPerformanceImportDTO>() {
                @Override
                public void invoke(MonthlyPerformanceImportDTO data, AnalysisContext context) {
                    data.setRowNum(context.readRowHolder().getRowIndex() + 1);
                    importData.add(data);
                }

                @Override
                public void doAfterAllAnalysed(AnalysisContext context) {
                    log.info("Excel解析完成，共{}行数据", importData.size());
                }
            }).sheet().doRead();
            
            if (importData.isEmpty()) {
                result.put("success", false);
                result.put("message", "Excel文件为空或格式不正确");
                return result;
            }
            
            // 数据校验
            Map<String, Object> validateResult = validateImportData(importData.stream()
                    .map(dto -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("rowNum", dto.getRowNum());
                        map.put("month", dto.getMonth());
                        map.put("employeeId", dto.getEmployeeId());
                        map.put("employeeName", dto.getEmployeeName());
                        map.put("departmentId", dto.getDepartmentId());
                        map.put("departmentName", dto.getDepartmentName());
                        map.put("performanceScore", dto.getPerformanceScore());
                        map.put("personalProjectRevenue", dto.getPersonalProjectRevenue());
                        map.put("personalProjectMargin", dto.getPersonalProjectMargin());
                        map.put("teamProjectRevenue", dto.getTeamProjectRevenue());
                        map.put("teamProjectMargin", dto.getTeamProjectMargin());
                        map.put("status", dto.getStatus());
                        return map;
                    }).collect(Collectors.toList()));
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> validData = (List<Map<String, Object>>) validateResult.get("validData");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> errorData = (List<Map<String, Object>>) validateResult.get("errorData");
            
            if (!errorData.isEmpty()) {
                result.put("success", false);
                result.put("message", "数据校验失败");
                result.put("errorData", errorData);
                result.put("errorCount", errorData.size());
                return result;
            }
            
            // 转换为实体对象并保存
            List<MonthlyPerformance> entities = validData.stream().map(data -> {
                MonthlyPerformance entity = new MonthlyPerformance();
                entity.setMonth((String) data.get("month"));
                entity.setEmployeeId(((Number) data.get("employeeId")).longValue());
                entity.setEmployeeName((String) data.get("employeeName"));
                entity.setDepartmentId(((Number) data.get("departmentId")).longValue());
                entity.setDepartmentName((String) data.get("departmentName"));
                entity.setPerformanceScore((BigDecimal) data.get("performanceScore"));
                entity.setPersonalProjectRevenue((BigDecimal) data.get("personalProjectRevenue"));
                entity.setPersonalProjectMargin((BigDecimal) data.get("personalProjectMargin"));
                entity.setTeamProjectRevenue((BigDecimal) data.get("teamProjectRevenue"));
                entity.setTeamProjectMargin((BigDecimal) data.get("teamProjectMargin"));
                entity.setStatus(((Number) data.get("status")).intValue());
                return entity;
            }).collect(Collectors.toList());
            
            // 批量保存
            this.batchSave(entities);
            
            result.put("success", true);
            result.put("message", "导入成功");
            result.put("successCount", entities.size());
            return result;
            
        } catch (Exception e) {
            log.error("导入Excel数据失败", e);
            result.put("success", false);
            result.put("message", "导入失败：" + e.getMessage());
            return result;
        }
    }

    @Override
    public Map<String, Object> validateImportData(List<Map<String, Object>> importData) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> validData = new ArrayList<>();
        List<Map<String, Object>> errorData = new ArrayList<>();
        
        // 用于检查重复数据
        Set<String> duplicateCheck = new HashSet<>();
        
        // 日期格式验证正则
        Pattern monthPattern = Pattern.compile("^\\d{4}-\\d{2}$");
        
        for (Map<String, Object> data : importData) {
            List<String> rowErrors = new ArrayList<>();
            Integer rowNum = (Integer) data.get("rowNum");
            
            // 1. 必填字段校验
            if (data.get("month") == null || String.valueOf(data.get("month")).trim().isEmpty()) {
                rowErrors.add("月份不能为空");
            } else {
                String month = String.valueOf(data.get("month")).trim();
                if (!monthPattern.matcher(month).matches()) {
                    rowErrors.add("月份格式不正确，应为YYYY-MM格式");
                }
            }
            
            if (data.get("employeeId") == null) {
                rowErrors.add("员工ID不能为空");
            } else {
                try {
                    Long.valueOf(String.valueOf(data.get("employeeId")));
                } catch (NumberFormatException e) {
                    rowErrors.add("员工ID必须为数字");
                }
            }
            
            if (data.get("employeeName") == null || String.valueOf(data.get("employeeName")).trim().isEmpty()) {
                rowErrors.add("员工姓名不能为空");
            }
            
            if (data.get("departmentId") == null) {
                rowErrors.add("部门ID不能为空");
            } else {
                try {
                    Long.valueOf(String.valueOf(data.get("departmentId")));
                } catch (NumberFormatException e) {
                    rowErrors.add("部门ID必须为数字");
                }
            }
            
            if (data.get("departmentName") == null || String.valueOf(data.get("departmentName")).trim().isEmpty()) {
                rowErrors.add("部门名称不能为空");
            }
            
            if (data.get("performanceScore") == null) {
                rowErrors.add("绩效得分不能为空");
            } else {
                try {
                    BigDecimal score = new BigDecimal(String.valueOf(data.get("performanceScore")));
                    if (score.compareTo(BigDecimal.ZERO) < 0 || score.compareTo(new BigDecimal("100")) > 0) {
                        rowErrors.add("绩效得分必须在0-100之间");
                    }
                } catch (NumberFormatException e) {
                    rowErrors.add("绩效得分必须为数字");
                }
            }
            
            // 2. 数值字段校验
            if (data.get("personalProjectRevenue") != null) {
                try {
                    BigDecimal revenue = new BigDecimal(String.valueOf(data.get("personalProjectRevenue")));
                    if (revenue.compareTo(BigDecimal.ZERO) < 0) {
                        rowErrors.add("个人项目营业额不能为负数");
                    }
                } catch (NumberFormatException e) {
                    rowErrors.add("个人项目营业额必须为数字");
                }
            }
            
            if (data.get("personalProjectMargin") != null) {
                try {
                    BigDecimal margin = new BigDecimal(String.valueOf(data.get("personalProjectMargin")));
                    if (margin.compareTo(BigDecimal.ZERO) < 0 || margin.compareTo(BigDecimal.ONE) > 0) {
                        rowErrors.add("个人项目毛利率必须在0-1之间");
                    }
                } catch (NumberFormatException e) {
                    rowErrors.add("个人项目毛利率必须为数字");
                }
            }
            
            if (data.get("teamProjectRevenue") != null) {
                try {
                    BigDecimal revenue = new BigDecimal(String.valueOf(data.get("teamProjectRevenue")));
                    if (revenue.compareTo(BigDecimal.ZERO) < 0) {
                        rowErrors.add("团队项目营业额不能为负数");
                    }
                } catch (NumberFormatException e) {
                    rowErrors.add("团队项目营业额必须为数字");
                }
            }
            
            if (data.get("teamProjectMargin") != null) {
                try {
                    BigDecimal margin = new BigDecimal(String.valueOf(data.get("teamProjectMargin")));
                    if (margin.compareTo(BigDecimal.ZERO) < 0 || margin.compareTo(BigDecimal.ONE) > 0) {
                        rowErrors.add("团队项目毛利率必须在0-1之间");
                    }
                } catch (NumberFormatException e) {
                    rowErrors.add("团队项目毛利率必须为数字");
                }
            }
            
            // 3. 唯一性校验
            if (data.get("employeeId") != null && data.get("month") != null) {
                String uniqueKey = data.get("employeeId") + "_" + data.get("month");
                if (!duplicateCheck.add(uniqueKey)) {
                    rowErrors.add("同一员工同一月份的数据重复");
                }
                
                // 检查数据库中是否已存在
                try {
                    Long employeeId = Long.valueOf(String.valueOf(data.get("employeeId")));
                    String month = String.valueOf(data.get("month"));
                    if (!this.checkUnique(employeeId, month, null)) {
                        rowErrors.add("数据库中已存在该员工该月份的绩效数据");
                    }
                } catch (NumberFormatException e) {
                    // 数字格式错误在上面已经处理
                }
            }
            
            // 4. 状态字段校验
            if (data.get("status") != null) {
                try {
                    Integer status = Integer.valueOf(String.valueOf(data.get("status")));
                    if (status != 0 && status != 1) {
                        rowErrors.add("状态必须为0（无效）或1（有效）");
                    }
                } catch (NumberFormatException e) {
                    rowErrors.add("状态必须为数字");
                }
            }
            
            if (rowErrors.isEmpty()) {
                validData.add(data);
            } else {
                Map<String, Object> errorRecord = new HashMap<>(data);
                errorRecord.put("errors", rowErrors);
                errorRecord.put("errorMessage", String.join("；", rowErrors));
                errorData.add(errorRecord);
            }
        }
        
        result.put("validData", validData);
        result.put("errorData", errorData);
        result.put("totalCount", importData.size());
        result.put("validCount", validData.size());
        result.put("errorCount", errorData.size());
        
        return result;
    }
} 