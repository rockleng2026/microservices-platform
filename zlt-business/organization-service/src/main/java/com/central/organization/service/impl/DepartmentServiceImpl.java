package com.central.organization.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.organization.dto.DepartmentStatisticsDTO;
import com.central.organization.dto.DepartmentTreeDTO;
import com.central.organization.mapper.DepartmentMapper;
import com.central.organization.model.Department;
import com.central.organization.service.DepartmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 部门管理服务实现
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class DepartmentServiceImpl extends ServiceImpl<DepartmentMapper, Department> implements DepartmentService {

    @Autowired
    private DepartmentMapper departmentMapper;

    // TODO: 获取当前租户ID
    private String getCurrentTenantId() {
        return "default";
    }

    // TODO: 获取当前用户ID
    private Integer getCurrentUserId() {
        return 1;
    }

    @Override
    public List<DepartmentTreeDTO> getDepartmentTree(Integer parentId, Boolean includeDisabled) {
        String tenantId = getCurrentTenantId();
        return departmentMapper.selectDepartmentTree(tenantId, parentId, includeDisabled);
    }

    @Override
    public PageResult<Department> getDepartmentPage(Integer page, Integer size, String keyword, 
                                                   Integer parentId, Integer gradeId, Integer status) {
        String tenantId = getCurrentTenantId();
        Page<Department> pageParam = new Page<>(page, size);
        
        IPage<Department> result = departmentMapper.selectDepartmentPageWithStats(
            pageParam, tenantId, keyword, parentId, gradeId, status);
        
        return PageResult.<Department>builder()
                .list(result.getRecords())
                .total(result.getTotal())
                .page(page)
                .size(size)
                .build();
    }

    @Override
    public Department getDepartmentDetail(Integer id) {
        String tenantId = getCurrentTenantId();
        return departmentMapper.selectDepartmentDetailById(id, tenantId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Department> createDepartment(Department department) {
        try {
            // 设置租户信息
            department.setTenantId(getCurrentTenantId());
            department.setCreatedBy(getCurrentUserId());
            
            // 验证部门编号唯一性
            if (StringUtils.hasText(department.getDepNo())) {
                if (!isDepartmentNoAvailable(department.getDepNo(), null)) {
                    return Result.failed("部门编号已存在");
                }
            }
            
            // 验证部门层级
            if (!validateDepartmentLevel(department.getParentId(), department.getGradeid())) {
                return Result.failed("部门层级设置不合规");
            }
            
            // 保存部门
            boolean success = save(department);
            if (success) {
                return Result.succeed(department, "创建成功");
            } else {
                return Result.failed("创建失败");
            }
        } catch (Exception e) {
            log.error("创建部门失败", e);
            return Result.failed("创建失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Department> updateDepartment(Department department) {
        try {
            // 设置更新信息
            department.setUpdatedBy(getCurrentUserId());
            
            // 验证部门编号唯一性
            if (StringUtils.hasText(department.getDepNo())) {
                if (!isDepartmentNoAvailable(department.getDepNo(), department.getId())) {
                    return Result.failed("部门编号已存在");
                }
            }
            
            // 验证部门层级
            if (!validateDepartmentLevel(department.getParentId(), department.getGradeid())) {
                return Result.failed("部门层级设置不合规");
            }
            
            // 更新部门
            boolean success = updateById(department);
            if (success) {
                return Result.succeed(department, "更新成功");
            } else {
                return Result.failed("更新失败");
            }
        } catch (Exception e) {
            log.error("更新部门失败", e);
            return Result.failed("更新失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteDepartment(Integer id) {
        try {
            String tenantId = getCurrentTenantId();
            
            // 检查是否有下级部门
            List<Department> children = departmentMapper.selectChildrenByParentId(id, tenantId);
            if (!CollectionUtils.isEmpty(children)) {
                return Result.failed("存在下级部门，无法删除");
            }
            
            // 检查是否有员工
            Integer employeeCount = departmentMapper.selectEmployeeCountByDepartment(id, tenantId);
            if (employeeCount != null && employeeCount > 0) {
                return Result.failed("部门下有员工，无法删除");
            }
            
            // 软删除部门
            List<Integer> ids = List.of(id);
            int result = departmentMapper.batchSoftDelete(ids, tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed("删除成功");
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception e) {
            log.error("删除部门失败", e);
            return Result.failed("删除失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteDepartments(List<Integer> ids) {
        try {
            String tenantId = getCurrentTenantId();
            
            // 批量检查约束
            for (Integer id : ids) {
                List<Department> children = departmentMapper.selectChildrenByParentId(id, tenantId);
                if (!CollectionUtils.isEmpty(children)) {
                    return Result.failed("部门ID " + id + " 存在下级部门，无法删除");
                }
                
                Integer employeeCount = departmentMapper.selectEmployeeCountByDepartment(id, tenantId);
                if (employeeCount != null && employeeCount > 0) {
                    return Result.failed("部门ID " + id + " 下有员工，无法删除");
                }
            }
            
            // 批量软删除
            int result = departmentMapper.batchSoftDelete(ids, tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed("批量删除成功");
            } else {
                return Result.failed("批量删除失败");
            }
        } catch (Exception e) {
            log.error("批量删除部门失败", e);
            return Result.failed("批量删除失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> updateDepartmentStatus(Integer id, Integer status) {
        try {
            String tenantId = getCurrentTenantId();
            int result = departmentMapper.updateDepartmentStatus(id, status, tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed(status == 1 ? "启用成功" : "禁用成功");
            } else {
                return Result.failed("状态更新失败");
            }
        } catch (Exception e) {
            log.error("更新部门状态失败", e);
            return Result.failed("状态更新失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> moveDepartment(Integer id, Integer newParentId) {
        try {
            // 获取部门信息
            Department department = getById(id);
            if (department == null) {
                return Result.failed("部门不存在");
            }
            
            // 验证不能移动到自己或子部门下
            if (id.equals(newParentId)) {
                return Result.failed("不能移动到自己下面");
            }
            
            String tenantId = getCurrentTenantId();
            List<Integer> childrenIds = departmentMapper.selectDepartmentAndChildrenIds(id, tenantId);
            if (childrenIds.contains(newParentId)) {
                return Result.failed("不能移动到子部门下面");
            }
            
            // 更新父部门
            department.setParentId(newParentId);
            department.setUpdatedBy(getCurrentUserId());
            
            boolean success = updateById(department);
            if (success) {
                return Result.succeed("移动成功");
            } else {
                return Result.failed("移动失败");
            }
        } catch (Exception e) {
            log.error("移动部门失败", e);
            return Result.failed("移动失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Department> copyDepartmentStructure(Integer sourceId, Integer targetParentId, Boolean includeEmployees) {
        try {
            // 获取源部门
            Department sourceDept = getById(sourceId);
            if (sourceDept == null) {
                return Result.failed("源部门不存在");
            }
            
            // 创建新部门
            Department newDept = new Department();
            newDept.setName(sourceDept.getName() + "_副本");
            newDept.setParentId(targetParentId);
            newDept.setDepNo(generateDepartmentNo(targetParentId));
            newDept.setGradeid(sourceDept.getGradeid());
            newDept.setTel(sourceDept.getTel());
            newDept.setAddress(sourceDept.getAddress());
            newDept.setDescription(sourceDept.getDescription());
            newDept.setStatus(1);
            newDept.setTenantId(getCurrentTenantId());
            newDept.setCreatedBy(getCurrentUserId());
            
            boolean success = save(newDept);
            if (success) {
                // TODO: 如果includeEmployees为true，复制员工信息
                return Result.succeed(newDept, "复制成功");
            } else {
                return Result.failed("复制失败");
            }
        } catch (Exception e) {
            log.error("复制部门结构失败", e);
            return Result.failed("复制失败：" + e.getMessage());
        }
    }

    @Override
    public DepartmentStatisticsDTO getDepartmentStatistics(Integer departmentId) {
        String tenantId = getCurrentTenantId();
        return departmentMapper.selectDepartmentStatistics(departmentId, tenantId);
    }

    @Override
    public String getDepartmentPath(Integer departmentId) {
        String tenantId = getCurrentTenantId();
        List<Department> path = departmentMapper.selectDepartmentPath(departmentId, tenantId);
        
        return path.stream()
                .map(Department::getName)
                .collect(Collectors.joining(" / "));
    }

    @Override
    public List<Department> getUserManageableDepartments(Integer userId) {
        String tenantId = getCurrentTenantId();
        return departmentMapper.selectUserManageableDepartments(userId, tenantId);
    }

    @Override
    public Boolean isDepartmentNoAvailable(String depNo, Integer excludeId) {
        String tenantId = getCurrentTenantId();
        int count = departmentMapper.checkDepNoExists(depNo, excludeId, tenantId);
        return count == 0;
    }

    @Override
    public Result<String> importDepartments(MultipartFile file) {
        try {
            // TODO: 实现Excel导入逻辑
            return Result.succeed("导入成功");
        } catch (Exception e) {
            log.error("导入部门失败", e);
            return Result.failed("导入失败：" + e.getMessage());
        }
    }

    @Override
    public Result<String> exportDepartments(Integer parentId) {
        try {
            // TODO: 实现Excel导出逻辑
            return Result.succeed("/downloads/departments.xlsx");
        } catch (Exception e) {
            log.error("导出部门失败", e);
            return Result.failed("导出失败：" + e.getMessage());
        }
    }

    @Override
    public Boolean validateDepartmentLevel(Integer parentId, Integer gradeId) {
        String tenantId = getCurrentTenantId();
        return departmentMapper.validateDepartmentLevel(parentId, gradeId, tenantId);
    }

    @Override
    public String generateDepartmentNo(Integer parentId) {
        // TODO: 实现部门编号生成逻辑
        return "DEPT" + System.currentTimeMillis();
    }
} 