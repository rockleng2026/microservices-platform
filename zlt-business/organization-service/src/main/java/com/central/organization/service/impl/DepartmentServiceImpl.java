package com.central.organization.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.context.TenantContextHolder;
import com.central.organization.mapper.DepartmentMapper;
import com.central.organization.model.Department;
import com.central.organization.model.dto.DepartmentQueryDTO;
import com.central.organization.model.dto.DepartmentSaveDTO;
import com.central.organization.model.vo.DepartmentTreeVO;
import com.central.organization.service.IDepartmentService;
import com.central.organization.utils.IdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 部门服务实现类
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class DepartmentServiceImpl extends ServiceImpl<DepartmentMapper, Department> implements IDepartmentService {
    
    @Autowired
    private DepartmentMapper departmentMapper;
    
    @Override
    public List<DepartmentTreeVO> getDepartmentTree(DepartmentQueryDTO query) {
        List<Department> departments = departmentMapper.listDepartmentsWithStats(query);
        return buildDepartmentTree(departments, 0L);
    }
    
    @Override
    public List<DepartmentTreeVO> getChildDepartmentTree(Long parentId, Boolean includeDisabled) {
        List<Department> children = departmentMapper.selectByParentId(parentId, includeDisabled);
        return buildDepartmentTree(children, parentId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Department saveDepartment(DepartmentSaveDTO saveDTO) {
        // 数据验证
        validateDepartmentData(saveDTO);
        
        Department department;
        if (saveDTO.getId() != null) {
            // 修改
            department = getById(saveDTO.getId());
            if (department == null) {
                throw new RuntimeException("部门不存在");
            }
            // 复制属性
            BeanUtil.copyProperties(saveDTO, department, "id", "createdAt", "createdBy", "tenantId");
            department.setUpdatedAt(LocalDateTime.now());
            // TODO: 设置更新人
            // department.setUpdatedBy(getCurrentUserId());
        } else {
            // 新增
            department = new Department();
            BeanUtil.copyProperties(saveDTO, department);
            department.setId(IdUtils.generateId());
            department.setTenantId(TenantContextHolder.getTenant());
            department.setDelflag(0);
            department.setCreatedAt(LocalDateTime.now());
            department.setUpdatedAt(LocalDateTime.now());
            // TODO: 设置创建人
            // department.setCreatedBy(getCurrentUserId());
            
            // 自动生成部门编号
            if (StrUtil.isBlank(department.getDepNo())) {
                department.setDepNo(generateDepartmentNo(department.getParentId()));
            }
            
            // 设置部门等级
            if (department.getGradeId() == null) {
                department.setGradeId(calculateDepartmentGrade(department.getParentId()));
            }
        }
        
        saveOrUpdate(department);
        return department;
    }
    
    @Override
    public Department getDepartmentById(Long id) {
        if (id == null) {
            return null;
        }
        
        // 使用带租户ID的查询
        Department department = departmentMapper.selectById(id);
        if (department != null && !department.isDeleted()) {
            // 获取部门路径
            String path = getDepartmentPath(id);
            department.setDepartmentPath(path);
            
            return department;
        }
        
        return null;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteDepartment(Long id) {
        Department department = getById(id);
        if (department == null || department.isDeleted()) {
            throw new RuntimeException("部门不存在");
        }
        
        // 检查是否有子部门
        Integer childrenCount = departmentMapper.countChildrenByParentId(id);
        if (childrenCount > 0) {
            throw new RuntimeException("该部门下还有子部门，无法删除");
        }
        
        // 检查是否有员工
        Integer employeeCount = countEmployeesByDepartment(id, false);
        if (employeeCount > 0) {
            throw new RuntimeException("该部门下还有员工，无法删除");
        }
        
        // 软删除
        return departmentMapper.softDelete(id) > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchDeleteDepartments(List<Long> ids) {
        if (CollUtil.isEmpty(ids)) {
            return true;
        }
        
        for (Long id : ids) {
            deleteDepartment(id);
        }
        return true;
    }
    
    @Override
    public Boolean updateDepartmentStatus(Long id, Integer status) {
        if (id == null || status == null) {
            return false;
        }
        return departmentMapper.updateStatus(id, status) > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean moveDepartment(Long id, Long newParentId) {
        if (id == null || Objects.equals(id, newParentId)) {
            return false;
        }
        
        Department department = getById(id);
        if (department == null) {
            throw new RuntimeException("部门不存在");
        }
        
        // 检查是否会形成循环引用
        if (newParentId != null && newParentId != 0) {
            List<Long> childrenIds = getDepartmentAndChildrenIds(id);
            if (childrenIds.contains(newParentId)) {
                throw new RuntimeException("不能将部门移动到其子部门下");
            }
        }
        
        // 更新父部门
        department.setParentId(newParentId == null ? 0L : newParentId);
        department.setGradeId(calculateDepartmentGrade(newParentId));
        department.setUpdatedAt(LocalDateTime.now());
        
        return updateById(department);
    }
    
    @Override
    public Boolean existsByDepNo(String depNo, Long excludeId) {
        if (StrUtil.isBlank(depNo)) {
            return false;
        }
        return departmentMapper.existsByDepNo(depNo, excludeId);
    }
    
    @Override
    public Boolean existsByNameAndParentId(String name, Long parentId, Long excludeId) {
        if (StrUtil.isBlank(name)) {
            return false;
        }
        return departmentMapper.existsByNameAndParentId(name, parentId, excludeId);
    }
    
    @Override
    public String getDepartmentPath(Long departmentId) {
        if (departmentId == null) {
            return "";
        }
        return departmentMapper.selectDepartmentPath(departmentId);
    }
    
    @Override
    public List<Long> getDepartmentAndChildrenIds(Long departmentId) {
        if (departmentId == null) {
            return new ArrayList<>();
        }
        return departmentMapper.selectDepartmentAndChildrenIds(departmentId);
    }
    
    @Override
    public Integer countEmployeesByDepartment(Long departmentId, Boolean includeChildren) {
        if (departmentId == null) {
            return 0;
        }
        return departmentMapper.countEmployeesByDepartment(departmentId, includeChildren);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean copyDepartmentStructure(Long sourceDeptId, Long targetParentId) {
        Department sourceDept = getById(sourceDeptId);
        if (sourceDept == null) {
            throw new RuntimeException("源部门不存在");
        }
        
        // 复制部门
        Department newDept = new Department();
        BeanUtil.copyProperties(sourceDept, newDept, "id", "depNo", "parentId", "createdAt", "updatedAt");
        newDept.setId(IdUtils.generateId());
        newDept.setParentId(targetParentId);
        newDept.setName(sourceDept.getName() + "_副本");
        newDept.setDepNo(generateDepartmentNo(targetParentId));
        newDept.setCreatedAt(LocalDateTime.now());
        newDept.setUpdatedAt(LocalDateTime.now());
        
        save(newDept);
        
        // 递归复制子部门
        List<Department> children = departmentMapper.selectByParentId(sourceDeptId, false);
        for (Department child : children) {
            copyDepartmentStructure(child.getId(), newDept.getId());
        }
        
        return true;
    }
    
    @Override
    public Integer getDepartmentLevel(Long departmentId) {
        if (departmentId == null || departmentId == 0) {
            return 0;
        }
        
        Department department = getById(departmentId);
        if (department == null || department.getParentId() == 0) {
            return 1;
        }
        
        return getDepartmentLevel(department.getParentId()) + 1;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean sortDepartments(List<Long> departmentIds) {
        if (CollUtil.isEmpty(departmentIds)) {
            return true;
        }
        
        for (int i = 0; i < departmentIds.size(); i++) {
            Department department = getById(departmentIds.get(i));
            if (department != null) {
                department.setSortOrder(i + 1);
                department.setUpdatedAt(LocalDateTime.now());
                updateById(department);
            }
        }
        
        return true;
    }
    
    /**
     * 构建部门树
     */
    private List<DepartmentTreeVO> buildDepartmentTree(List<Department> departments, Long parentId) {
        if (CollUtil.isEmpty(departments)) {
            return new ArrayList<>();
        }
        
        Map<Long, List<Department>> parentMap = departments.stream()
                .collect(Collectors.groupingBy(dept -> dept.getParentId() == null ? 0L : dept.getParentId()));
        
        return buildTreeRecursive(parentMap, parentId);
    }
    
    /**
     * 递归构建树形结构
     */
    private List<DepartmentTreeVO> buildTreeRecursive(Map<Long, List<Department>> parentMap, Long parentId) {
        List<Department> children = parentMap.get(parentId);
        if (CollUtil.isEmpty(children)) {
            return new ArrayList<>();
        }
        
        return children.stream()
                .sorted(Comparator.comparing(Department::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(Department::getId))
                .map(dept -> {
                    DepartmentTreeVO vo = convertToTreeVO(dept);
                    List<DepartmentTreeVO> childVOs = buildTreeRecursive(parentMap, dept.getId());
                    vo.setChildren(childVOs);
                    vo.setIsLeaf(CollUtil.isEmpty(childVOs));
                    vo.setChildrenCount(childVOs.size());
                    
                    // 设置图标和样式
                    setNodeIcon(vo);
                    
                    return vo;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 转换为树形VO
     */
    private DepartmentTreeVO convertToTreeVO(Department department) {
        DepartmentTreeVO vo = new DepartmentTreeVO();
        BeanUtil.copyProperties(department, vo);
        
        // 设置特殊属性
        vo.setIsFiliale("1".equals(department.getFiiale()));
        vo.setIsHalfLevel(department.isHalfLevel());
        vo.setLevel(getDepartmentLevel(department.getId()));
        vo.setDisabled(!department.isEnabled());
        
        return vo;
    }
    
    /**
     * 设置节点图标
     */
    private void setNodeIcon(DepartmentTreeVO vo) {
        if (vo.getIsFiliale()) {
            vo.setIcon("🏢"); // 分公司
            vo.setNodeClass("dept-filiale");
        } else if (vo.getIsHalfLevel()) {
            vo.setIcon("🏬"); // 半级部门
            vo.setNodeClass("dept-half-level");
        } else if (vo.getIsLeaf()) {
            vo.setIcon("📁"); // 叶子部门
            vo.setNodeClass("dept-leaf");
        } else {
            vo.setIcon("📂"); // 普通部门
            vo.setNodeClass("dept-normal");
        }
    }
    
    /**
     * 验证部门数据
     */
    private void validateDepartmentData(DepartmentSaveDTO saveDTO) {
        if (StrUtil.isBlank(saveDTO.getName())) {
            throw new RuntimeException("部门名称不能为空");
        }
        
        // 根据操作类型和ID判断是新增还是编辑
        boolean isEdit = saveDTO.getId() != null || "edit".equals(saveDTO.getOperationType());
        
        log.info("验证部门数据 - 操作类型: {}, ID: {}, 是否编辑: {}", 
                 saveDTO.getOperationType(), saveDTO.getId(), isEdit);
        
        // 检查部门编号是否重复
        if (StrUtil.isNotBlank(saveDTO.getDepNo())) {
            if (isEdit) {
                // 编辑操作：检查除当前部门外是否有相同编号
                if (existsByDepNo(saveDTO.getDepNo(), saveDTO.getId())) {
                    log.warn("编辑部门时部门编号重复 - 编号: {}, 排除ID: {}", 
                             saveDTO.getDepNo(), saveDTO.getId());
                    throw new RuntimeException("部门编号已存在");
                }
                log.info("编辑部门编号验证通过 - 编号: {}, 排除ID: {}", 
                         saveDTO.getDepNo(), saveDTO.getId());
            } else {
                // 新增操作：检查是否有任何部门使用此编号
                if (existsByDepNo(saveDTO.getDepNo(), null)) {
                    log.warn("新增部门时部门编号重复 - 编号: {}", saveDTO.getDepNo());
                    throw new RuntimeException("部门编号已存在");
                }
                log.info("新增部门编号验证通过 - 编号: {}", saveDTO.getDepNo());
            }
        }
        
        // 检查同级部门名称是否重复
        if (existsByNameAndParentId(saveDTO.getName(), saveDTO.getParentId(), saveDTO.getId())) {
            throw new RuntimeException("同级部门中已存在相同名称的部门");
        }
        
        // 检查父部门是否存在
        if (saveDTO.getParentId() != null && saveDTO.getParentId() != 0) {
            Department parentDept = getById(saveDTO.getParentId());
            if (parentDept == null || parentDept.isDeleted()) {
                throw new RuntimeException("父部门不存在");
            }
        }
    }
    
    /**
     * 生成部门编号
     */
    private String generateDepartmentNo(Long parentId) {
        String prefix = "DEPT";
        if (parentId != null && parentId != 0) {
            Department parent = getById(parentId);
            if (parent != null && StrUtil.isNotBlank(parent.getDepNo())) {
                prefix = parent.getDepNo();
            }
        }
        
        // 查询同级部门的最大编号
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<Department>()
                .eq(Department::getParentId, parentId == null ? 0 : parentId)
                .eq(Department::getDelflag, 0)
                .likeRight(Department::getDepNo, prefix)
                .orderByDesc(Department::getDepNo);
        
        List<Department> siblings = list(wrapper);
        int maxNo = 0;
        for (Department sibling : siblings) {
            String depNo = sibling.getDepNo();
            if (StrUtil.isNotBlank(depNo) && depNo.length() > prefix.length()) {
                try {
                    String suffix = depNo.substring(prefix.length());
                    int no = Integer.parseInt(suffix);
                    maxNo = Math.max(maxNo, no);
                } catch (NumberFormatException ignored) {
                }
            }
        }
        
        return prefix + String.format("%02d", maxNo + 1);
    }
    
    /**
     * 计算部门等级
     */
    private Integer calculateDepartmentGrade(Long parentId) {
        if (parentId == null || parentId == 0) {
            return 1; // 根部门
        }
        
        Department parent = getById(parentId);
        if (parent == null) {
            return 1;
        }
        
        Integer parentGrade = parent.getGradeId();
        return parentGrade == null ? 2 : Math.min(parentGrade + 1, 7);
    }
} 