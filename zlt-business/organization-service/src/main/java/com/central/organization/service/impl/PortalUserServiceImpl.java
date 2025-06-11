package com.central.organization.service.impl;

import com.central.common.model.SysUser;
import com.central.organization.mapper.EmployeeMapper;
import com.central.organization.mapper.UsersMapper;
import com.central.organization.model.Employee;
import com.central.organization.model.PortalUser;
import com.central.organization.service.MenuPermissionService;
import com.central.organization.service.PortalUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Portal用户服务实现类
 * 
 * @author zlt
 */
@Slf4j
@Service
public class PortalUserServiceImpl implements PortalUserService {

    @Autowired
    private UsersMapper usersMapper;

    @Autowired
    private EmployeeMapper employeeMapper;

    @Autowired
    private MenuPermissionService menuPermissionService;

    @Override
    public SysUser findByUsername(String username) {
        log.info("根据用户名查询Portal用户: {}", username);
        try {
            // 从central_organization数据库查询用户
            PortalUser portalUser = usersMapper.selectByUsername(username);
            if (portalUser != null) {
                log.info("找到用户: {}, ID: {}", username, portalUser.getId());
                // 设置账号类型为portal
                portalUser.setType("portal");
                return portalUser;
            }
            return null;
        } catch (Exception e) {
            log.error("查询用户失败: {}", username, e);
            return null;
        }
    }

    @Override
    public SysUser findByMobile(String mobile) {
        log.info("根据手机号查询Portal用户: {}", mobile);
        try {
            PortalUser portalUser = usersMapper.selectByMobile(mobile);
            if (portalUser != null) {
                portalUser.setType("portal");
                return portalUser;
            }
            return null;
        } catch (Exception e) {
            log.error("根据手机号查询用户失败: {}", mobile, e);
            return null;
        }
    }

    @Override
    public SysUser findByUserId(Long userId) {
        log.info("根据用户ID查询Portal用户: {}", userId);
        try {
            PortalUser portalUser = usersMapper.selectByPrimaryKey(userId);
            if (portalUser != null) {
                portalUser.setType("portal");
                return portalUser;
            }
            return null;
        } catch (Exception e) {
            log.error("根据用户ID查询用户失败: {}", userId, e);
            return null;
        }
    }

    @Override
    public Map<String, Object> getCurrentUserInfo(Long userId) {
        log.info("获取用户详细信息: {}", userId);
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 获取用户基本信息
            PortalUser user = usersMapper.selectByPrimaryKey(userId);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }
            
            // 获取员工信息（包含部门、岗位）
            Employee employee = null;
            if (user.getEmployeeId() != null) {
                employee = employeeMapper.selectById(user.getEmployeeId());
            }
            
            // 构建返回数据
            result.put("id", user.getId());
            result.put("username", user.getUsername());
            result.put("nickname", user.getNickname());
            result.put("mobile", user.getMobile());
            result.put("headImgUrl", user.getHeadImgUrl());
            result.put("enabled", user.getEnabled());
            result.put("type", "portal");
            
            if (employee != null) {
                Map<String, Object> employeeInfo = new HashMap<>();
                employeeInfo.put("id", employee.getId());
                employeeInfo.put("empNo", employee.getEmpNo());
                employeeInfo.put("name", employee.getName());
                employeeInfo.put("email", employee.getEmail());
                employeeInfo.put("mobile", employee.getMobile());
                employeeInfo.put("gender", employee.getGender());
                employeeInfo.put("entryDate", employee.getEntryDate());
                employeeInfo.put("employmentStatus", employee.getEmploymentStatus());
                
                // 部门信息
                if (employee.getDepartmentId() != null) {
                    Map<String, Object> department = new HashMap<>();
                    department.put("id", employee.getDepartmentId());
                    department.put("name", "技术部"); // 临时硬编码，后续从数据库查询
                    employeeInfo.put("department", department);
                }
                
                // 当前岗位信息
                if (employee.getPositionId() != null) {
                    Map<String, Object> position = new HashMap<>();
                    position.put("id", employee.getPositionId());
                    position.put("name", "开发工程师"); // 临时硬编码，后续从数据库查询
                    employeeInfo.put("currentPosition", position);
                }
                
                // 可用岗位列表（主岗位+副岗位）
                // 临时返回空列表，后续实现
                employeeInfo.put("availablePositions", List.of());
                
                result.put("employee", employeeInfo);
            }
            
            // 租户信息
            Map<String, Object> tenant = new HashMap<>();
            tenant.put("id", user.getTenantId() != null ? user.getTenantId() : "default");
            tenant.put("name", "Portal企业");
            tenant.put("code", "PORTAL");
            result.put("tenant", tenant);
            
            return result;
        } catch (Exception e) {
            log.error("获取用户详细信息失败: {}", userId, e);
            throw new RuntimeException("获取用户信息失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> switchUserPosition(Long userId, Long positionId) {
        log.info("切换用户岗位: 用户ID={}, 岗位ID={}", userId, positionId);
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 验证用户和岗位
            PortalUser user = usersMapper.selectByPrimaryKey(userId);
            if (user == null || user.getEmployeeId() == null) {
                throw new RuntimeException("用户不存在或未关联员工信息");
            }
            
            Employee employee = employeeMapper.selectById(user.getEmployeeId());
            if (employee == null) {
                throw new RuntimeException("员工信息不存在");
            }
            
            // 验证用户是否有权限切换到该岗位
            // 临时跳过权限验证，直接允许切换
            
            // 更新员工的当前岗位
            employee.setPositionId(positionId);
            employeeMapper.updateById(employee);
            
            // 获取新岗位信息
            Map<String, Object> newPosition = new HashMap<>();
            newPosition.put("id", positionId);
            newPosition.put("name", "新岗位"); // 临时硬编码
            
            // 获取新的菜单权限
            List<Map<String, Object>> menus = menuPermissionService.getCurrentUserMenus(userId);
            
            result.put("success", true);
            result.put("message", "岗位切换成功");
            result.put("position", newPosition);
            result.put("menus", menus);
            
            log.info("用户 {} 成功切换到岗位 {}", userId, positionId);
            return result;
        } catch (Exception e) {
            log.error("切换用户岗位失败: 用户ID={}, 岗位ID={}", userId, positionId, e);
            throw new RuntimeException("岗位切换失败: " + e.getMessage());
        }
    }
} 