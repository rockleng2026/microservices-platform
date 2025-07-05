package com.central.soo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.EmployeeSalaryConfig;
import com.central.soo.model.dto.EmployeeSalaryQueryDTO;
import com.central.soo.model.vo.EmployeeSalaryVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

/**
 * 员工薪酬配置服务接口
 *
 * @author Portal Team
 * @since 2024-12-19
 */
public interface IEmployeeSalaryConfigService extends IService<EmployeeSalaryConfig> {
    
    /**
     * 分页查询员工薪酬配置(整合员工信息和职级标准)
     */
    IPage<EmployeeSalaryVO> pageEmployeeSalary(EmployeeSalaryQueryDTO query);

    /**
     * 分页条件查询(原方法保留)
     */
    IPage<EmployeeSalaryConfig> pageQuery(Page<EmployeeSalaryConfig> page, Long employeeId, String employeeName, Long departmentId, String jobLevelId, Integer status, LocalDate startDate, LocalDate endDate);

    /**
     * 校验唯一性（同一员工、生效日不能重复）
     */
    boolean checkUnique(Long employeeId, LocalDate effectiveDate, Long excludeId);

    /**
     * 校验基础工资是否在职级标准范围内
     */
    boolean validateSalaryRange(Long positionId, BigDecimal baseSalary);

    /**
     * 查询员工历史薪酬配置
     */
    List<EmployeeSalaryConfig> getHistoryByEmployee(Long employeeId);

    /**
     * 恢复已删除的员工薪酬配置
     */
    boolean restore(Long id);

    /**
     * 获取职级列表(包含工资范围和绩效范围)
     */
    List<Map<String, Object>> getJobLevelList();

    /**
     * 获取部门树
     */
    List<Map<String, Object>> getDepartmentTree();

    /**
     * 获取地区列表
     */
    List<Map<String, Object>> getRegionList();

    /**
     * 保存员工薪酬配置(包含数据校验)
     */
    boolean saveEmployeeSalary(EmployeeSalaryConfig config);

    /**
     * 更新员工薪酬配置(包含数据校验)
     */
    boolean updateEmployeeSalary(EmployeeSalaryConfig config);
} 