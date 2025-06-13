package com.central.organization.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.context.TenantContextHolder;
import com.central.common.model.PageResult;
import com.central.organization.mapper.WorkpositionMapper;
import com.central.organization.model.Workposition;
import com.central.organization.model.dto.WorkpositionQueryDTO;
import com.central.organization.model.dto.WorkpositionSaveDTO;
import com.central.organization.model.vo.WorkpositionVO;
import com.central.organization.service.IWorkpositionService;
import com.central.common.utils.LoginUserUtils;
import com.central.common.model.LoginAppUser;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 岗位管理Service实现类
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Service
public class WorkpositionServiceImpl extends ServiceImpl<WorkpositionMapper, Workposition> implements IWorkpositionService {

    @Override
    public PageResult<WorkpositionVO> queryPage(WorkpositionQueryDTO queryDTO) {
        String tenantId = TenantContextHolder.getTenant();
        
        Page<WorkpositionVO> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        baseMapper.selectPageList(page, queryDTO, tenantId);
        
        return PageResult.<WorkpositionVO>builder()
                .data(page.getRecords())
                .count(page.getTotal())
                .build();
    }

    @Override
    public WorkpositionVO getDetailById(Long id) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.selectDetailById(id, tenantId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveWorkposition(WorkpositionSaveDTO saveDTO) {
        String tenantId = TenantContextHolder.getTenant();
        
        // 获取当前登录用户信息
        Long currentUserId = null;
        try {
            LoginAppUser currentUser = LoginUserUtils.getCurrentUser(false);
            if (currentUser != null) {
                currentUserId = currentUser.getId();
            }
        } catch (Exception e) {
            // 如果获取用户失败，记录日志但不影响业务流程
            System.out.println("获取当前用户失败: " + e.getMessage());
        }
        
        // 检查岗位名称是否重复
        if (checkNameExists(saveDTO.getName(), saveDTO.getDepartmentId(), saveDTO.getId())) {
            throw new RuntimeException("同部门下已存在相同名称的岗位");
        }
        
        Workposition workposition = new Workposition();
        BeanUtils.copyProperties(saveDTO, workposition);
        workposition.setTenantId(tenantId);
        
        if (saveDTO.getId() != null) {
            // 更新
            workposition.setUpdatedAt(LocalDateTime.now());
            if (currentUserId != null) {
                workposition.setUpdatedBy(currentUserId);
            }
            return updateById(workposition);
        } else {
            // 新增
            workposition.setCreatedAt(LocalDateTime.now());
            workposition.setUpdatedAt(LocalDateTime.now());
            if (currentUserId != null) {
                workposition.setCreatedBy(currentUserId);
                workposition.setUpdatedBy(currentUserId);
            }
            workposition.setStatus(saveDTO.getStatus() != null ? saveDTO.getStatus() : 1);
            workposition.setDelflag(0);
            return save(workposition);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteById(Long id) {
        String tenantId = TenantContextHolder.getTenant();
        
        // 获取当前登录用户信息
        Long currentUserId = null;
        try {
            LoginAppUser currentUser = LoginUserUtils.getCurrentUser(false);
            if (currentUser != null) {
                currentUserId = currentUser.getId();
            }
        } catch (Exception e) {
            System.out.println("获取当前用户失败: " + e.getMessage());
        }
        
        // 检查是否有员工在该岗位
        Integer employeeCount = baseMapper.getEmployeeCountByPosition(id, tenantId);
        if (employeeCount > 0) {
            throw new RuntimeException("该岗位下还有员工，无法删除");
        }
        
        Workposition workposition = new Workposition();
        workposition.setId(id);
        workposition.setDelflag(1);
        workposition.setUpdatedAt(LocalDateTime.now());
        if (currentUserId != null) {
            workposition.setUpdatedBy(currentUserId);
        }
        return updateById(workposition);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDelete(List<Long> ids) {
        String tenantId = TenantContextHolder.getTenant();
        
        // 检查每个岗位是否有员工
        for (Long id : ids) {
            Integer employeeCount = baseMapper.getEmployeeCountByPosition(id, tenantId);
            if (employeeCount > 0) {
                WorkpositionVO position = baseMapper.selectDetailById(id, tenantId);
                throw new RuntimeException("岗位【" + position.getName() + "】下还有员工，无法删除");
            }
        }
        
        return baseMapper.batchDelete(ids, tenantId) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(List<Long> ids, Integer status) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.updateStatus(ids, status, tenantId) > 0;
    }

    @Override
    public List<WorkpositionVO> getByDepartmentId(Long departmentId) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.selectByDepartmentId(departmentId, tenantId);
    }

    @Override
    public List<WorkpositionVO> getByEmployeeId(Long employeeId) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.selectByEmployeeId(employeeId, tenantId);
    }

    @Override
    public List<WorkpositionVO> getByUserId(Long userId) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.selectByUserId(userId, tenantId);
    }

    @Override
    public List<WorkpositionVO> getManagerPositions() {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.selectManagerPositions(tenantId);
    }

    @Override
    public List<WorkpositionVO> getSubPositions(Long positionId) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.selectSubPositionsByPositionId(positionId, tenantId);
    }

    @Override
    public boolean checkNameExists(String name, Long departmentId, Long excludeId) {
        String tenantId = TenantContextHolder.getTenant();
        Integer count = baseMapper.checkNameExists(name, departmentId, excludeId, tenantId);
        return count > 0;
    }

    @Override
    public Integer getPositionCountByDepartment(Long departmentId) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.getPositionCountByDepartment(departmentId, tenantId);
    }

    @Override
    public Integer getEmployeeCountByPosition(Long positionId) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.getEmployeeCountByPosition(positionId, tenantId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean copyWorkposition(Long sourceId, Long targetDepartmentId, String newName) {
        String tenantId = TenantContextHolder.getTenant();
        
        // 检查新名称是否重复
        if (checkNameExists(newName, targetDepartmentId, null)) {
            throw new RuntimeException("目标部门下已存在相同名称的岗位");
        }
        
        // 获取源岗位信息
        WorkpositionVO sourcePosition = baseMapper.selectDetailById(sourceId, tenantId);
        if (sourcePosition == null) {
            throw new RuntimeException("源岗位不存在");
        }
        
        // 获取当前登录用户信息
        Long currentUserId = null;
        try {
            LoginAppUser currentUser = LoginUserUtils.getCurrentUser(false);
            if (currentUser != null) {
                currentUserId = currentUser.getId();
            }
        } catch (Exception e) {
            System.out.println("获取当前用户失败: " + e.getMessage());
        }
        
        // 创建新岗位
        Workposition newPosition = new Workposition();
        BeanUtils.copyProperties(sourcePosition, newPosition);
        newPosition.setId(null);
        newPosition.setName(newName);
        newPosition.setDepartmentId(targetDepartmentId);
        newPosition.setTenantId(tenantId);
        newPosition.setCreatedAt(LocalDateTime.now());
        newPosition.setUpdatedAt(LocalDateTime.now());
        if (currentUserId != null) {
            newPosition.setCreatedBy(currentUserId);
            newPosition.setUpdatedBy(currentUserId);
        }
        newPosition.setDelflag(0);
        
        return save(newPosition);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean configPermissions(Long positionId, String menuIds, String menuFuncIds) {
        String tenantId = TenantContextHolder.getTenant();
        
        // 获取当前登录用户信息
        Long currentUserId = null;
        try {
            LoginAppUser currentUser = LoginUserUtils.getCurrentUser(false);
            if (currentUser != null) {
                currentUserId = currentUser.getId();
            }
        } catch (Exception e) {
            System.out.println("获取当前用户失败: " + e.getMessage());
        }
        
        Workposition workposition = new Workposition();
        workposition.setId(positionId);
        workposition.setMenuIds(menuIds);
        workposition.setMenuFuncIds(menuFuncIds);
        workposition.setUpdatedAt(LocalDateTime.now());
        if (currentUserId != null) {
            workposition.setUpdatedBy(currentUserId);
        }
        
        return updateById(workposition);
    }

    @Override
    public WorkpositionVO getPermissionConfig(Long positionId) {
        String tenantId = TenantContextHolder.getTenant();
        return baseMapper.selectDetailById(positionId, tenantId);
    }
} 