package com.central.organization.service.impl;

import com.central.common.model.SysUser;
import com.central.organization.mapper.EmployeeMapper;
import com.central.organization.mapper.UsersMapper;
import com.central.organization.mapper.UserPersonalConfigMapper;
import com.central.organization.mapper.WorkpositionMapper;
import com.central.organization.mapper.DepartmentMapper;
import com.central.organization.model.Employee;
import com.central.organization.model.PortalUser;
import com.central.organization.model.UserPersonalConfig;
import com.central.organization.model.Workposition;
import com.central.organization.model.Department;
import com.central.organization.service.MenuPermissionService;
import com.central.organization.service.PortalUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

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
    private UserPersonalConfigMapper userPersonalConfigMapper;

    @Autowired
    private WorkpositionMapper workpositionMapper;

    @Autowired
    private DepartmentMapper departmentMapper;

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
            // 1. 获取用户基本信息
            PortalUser user = usersMapper.selectByPrimaryKey(userId);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }

            // 构建用户基本信息
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("nickname", user.getNickname());
            userInfo.put("mobile", user.getMobile());
            userInfo.put("headImgUrl", user.getHeadImgUrl());
            userInfo.put("enabled", user.getEnabled());
            userInfo.put("type", "portal");
            userInfo.put("tenantId", user.getTenantId());
            
            result.put("user", userInfo);
            
            // 2. 获取员工信息
            Employee employee = null;
            if (user.getEmployeeId() != null) {
                employee = employeeMapper.selectById(user.getEmployeeId());
                if (employee != null) {
                    Map<String, Object> employeeInfo = buildEmployeeInfo(employee);
                    result.put("employee", employeeInfo);
                }
            }
            
            // 3. 获取用户的所有岗位列表
            List<Map<String, Object>> positions = getUserPositions(userId);
            result.put("positions", positions);
            
            // 4. 获取用户个性化配置
            UserPersonalConfig personalConfig = getUserPersonalConfig(userId);
            if (personalConfig == null) {
                // 首次登录，初始化默认配置
                Long defaultPositionId = null;
                if (employee != null && employee.getPositionId() != null) {
                    defaultPositionId = employee.getPositionId();
                } else if (!positions.isEmpty()) {
                    defaultPositionId = (Long) positions.get(0).get("id");
                }
                initUserDefaultConfig(userId, defaultPositionId);
                personalConfig = getUserPersonalConfig(userId);
            }
            result.put("personalConfig", personalConfig);
            
            // 5. 确定当前生效的岗位
            Long currentPositionId = null;
            if (personalConfig != null && personalConfig.getDefaultPositionId() != null) {
                // 使用个性化配置中的默认岗位
                currentPositionId = personalConfig.getDefaultPositionId();
            } else if (employee != null && employee.getPositionId() != null) {
                // 使用员工的主岗位
                currentPositionId = employee.getPositionId();
            } else if (!positions.isEmpty()) {
                // 使用第一个可用岗位
                currentPositionId = (Long) positions.get(0).get("id");
            }
            
            // 6. 获取当前岗位详细信息
            if (currentPositionId != null) {
                Workposition currentPosition = workpositionMapper.selectById(currentPositionId);
                if (currentPosition != null) {
                    Map<String, Object> currentPositionInfo = buildPositionInfo(currentPosition);
                    result.put("currentPosition", currentPositionInfo);
                    
                    // 7. 获取当前岗位的菜单权限
                    List<Map<String, Object>> menus = menuPermissionService.getMenusByPositionId(currentPositionId);
                    List<Map<String, Object>> menuTree = menuPermissionService.buildMenuTree(menus);
                    result.put("menus", menuTree);
                }
            }
            
            // 8. 租户信息
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
    public List<Map<String, Object>> getUserPositions(Long userId) {
        log.info("获取用户岗位列表: {}", userId);
        try {
            PortalUser user = usersMapper.selectByPrimaryKey(userId);
            if (user == null || user.getEmployeeId() == null) {
                return new ArrayList<>();
            }

            Employee employee = employeeMapper.selectById(user.getEmployeeId());
            if (employee == null) {
                return new ArrayList<>();
            }

            List<Map<String, Object>> positions = new ArrayList<>();
            
            // 获取主岗位
            if (employee.getPositionId() != null) {
                Workposition mainPosition = workpositionMapper.selectById(employee.getPositionId());
                if (mainPosition != null) {
                    Map<String, Object> positionInfo = buildPositionInfo(mainPosition);
                    positionInfo.put("isMain", true);
                    positions.add(positionInfo);
                }
            }
            
            // TODO: 获取副岗位（后续实现多岗位关联表）
            // 暂时只返回主岗位
            
            return positions;
        } catch (Exception e) {
            log.error("获取用户岗位列表失败: {}", userId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getCurrentUserMenus(Long userId) {
        return menuPermissionService.getCurrentUserMenus(userId);
    }

    @Override
    public UserPersonalConfig getUserPersonalConfig(Long userId) {
        try {
            PortalUser user = usersMapper.selectByPrimaryKey(userId);
            if (user == null) {
                return null;
            }
            String tenantId = user.getTenantId() != null ? user.getTenantId() : "default";
            return userPersonalConfigMapper.selectByUserId(userId, tenantId);
        } catch (Exception e) {
            log.error("获取用户个性化配置失败: {}", userId, e);
            return null;
        }
    }

    @Override
    @Transactional
    public boolean saveUserPersonalConfig(UserPersonalConfig config) {
        try {
            if (config.getId() == null) {
                // 新增
                config.setCreatedAt(LocalDateTime.now());
                config.setUpdatedAt(LocalDateTime.now());
                config.setEnabled(true);
                return userPersonalConfigMapper.insert(config) > 0;
            } else {
                // 更新
                config.setUpdatedAt(LocalDateTime.now());
                return userPersonalConfigMapper.updateById(config) > 0;
            }
        } catch (Exception e) {
            log.error("保存用户个性化配置失败: {}", config.getUserId(), e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean updateDefaultPosition(Long userId, Long positionId) {
        try {
            UserPersonalConfig config = getUserPersonalConfig(userId);
            if (config == null) {
                // 创建新配置
                initUserDefaultConfig(userId, positionId);
                return true;
            } else {
                // 更新现有配置
                config.setDefaultPositionId(positionId);
                config.setUpdatedAt(LocalDateTime.now());
                config.setUpdatedBy(userId);
                return userPersonalConfigMapper.updateById(config) > 0;
            }
        } catch (Exception e) {
            log.error("更新用户默认岗位失败: userId={}, positionId={}", userId, positionId, e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean initUserDefaultConfig(Long userId, Long defaultPositionId) {
        try {
            PortalUser user = usersMapper.selectByPrimaryKey(userId);
            if (user == null) {
                return false;
            }

            UserPersonalConfig config = new UserPersonalConfig();
            config.setUserId(userId);
            config.setDefaultPositionId(defaultPositionId);
            config.setTheme("light");
            config.setLanguage("zh-CN");
            config.setTimezone("Asia/Shanghai");
            config.setHomePage("/dashboard");
            config.setLayoutConfig("{}");
            config.setNotificationConfig("{}");
            config.setExtendConfig("{}");
            config.setEnabled(true);
            config.setTenantId(user.getTenantId() != null ? user.getTenantId() : "default");
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());
            config.setCreatedBy(userId);
            config.setUpdatedBy(userId);

            return userPersonalConfigMapper.insertDefaultConfig(config) > 0;
        } catch (Exception e) {
            log.error("初始化用户默认配置失败: {}", userId, e);
            return false;
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
            
            Workposition position = workpositionMapper.selectById(positionId);
            if (position == null) {
                throw new RuntimeException("岗位不存在");
            }
            
            // 验证用户是否有权限使用该岗位
            List<Map<String, Object>> userPositions = getUserPositions(userId);
            boolean hasPermission = userPositions.stream()
                    .anyMatch(p -> positionId.equals(p.get("id")));
            
            if (!hasPermission) {
                throw new RuntimeException("您没有权限使用该岗位");
            }
            
            // 更新用户的默认岗位配置
            boolean updateSuccess = updateDefaultPosition(userId, positionId);
            if (!updateSuccess) {
                throw new RuntimeException("岗位切换失败");
            }
            
            // 获取新岗位信息
            Map<String, Object> newPosition = buildPositionInfo(position);
            
            // 获取新岗位的菜单权限
            List<Map<String, Object>> menus = menuPermissionService.getMenusByPositionId(positionId);
            List<Map<String, Object>> menuTree = menuPermissionService.buildMenuTree(menus);
            
            result.put("success", true);
            result.put("message", "岗位切换成功");
            result.put("position", newPosition);
            result.put("menus", menuTree);
            
            log.info("用户 {} 成功切换到岗位 {}", userId, positionId);
            return result;
        } catch (Exception e) {
            log.error("岗位切换失败: userId={}, positionId={}", userId, positionId, e);
            result.put("success", false);
            result.put("message", e.getMessage());
            return result;
        }
    }

    /**
     * 构建员工信息
     */
    private Map<String, Object> buildEmployeeInfo(Employee employee) {
        Map<String, Object> employeeInfo = new HashMap<>();
        employeeInfo.put("id", employee.getId());
        employeeInfo.put("empNo", employee.getEmpNo());
        employeeInfo.put("name", employee.getName());
        employeeInfo.put("nameEn", employee.getNameEn());
        employeeInfo.put("email", employee.getEmail());
        employeeInfo.put("mobile", employee.getMobile());
        employeeInfo.put("gender", employee.getGender());
        employeeInfo.put("entryDate", employee.getEntryDate());
        employeeInfo.put("employmentStatus", employee.getEmploymentStatus());
        employeeInfo.put("education", employee.getEducation());
        
        // 部门信息
        if (employee.getDepartmentId() != null) {
            Department department = departmentMapper.selectById(employee.getDepartmentId());
            if (department != null) {
                Map<String, Object> deptInfo = new HashMap<>();
                deptInfo.put("id", department.getId());
                deptInfo.put("name", department.getName());
                deptInfo.put("depNo", department.getDepNo());
                deptInfo.put("gradeId", department.getGradeId());
                employeeInfo.put("department", deptInfo);
            }
        }
        
        return employeeInfo;
    }

    /**
     * 构建岗位信息
     */
    private Map<String, Object> buildPositionInfo(Workposition position) {
        Map<String, Object> positionInfo = new HashMap<>();
        positionInfo.put("id", position.getId());
        positionInfo.put("name", position.getName());
        positionInfo.put("shortName", position.getShortName());
        positionInfo.put("positionLevel", position.getPositionLevel());
        positionInfo.put("jobDescription", position.getJobDescription());
        positionInfo.put("isManager", position.getIsManager());
        positionInfo.put("isDirector", position.getIsDirector());
        
        // 部门信息
        if (position.getDepartmentId() != null) {
            Department department = departmentMapper.selectById(position.getDepartmentId());
            if (department != null) {
                Map<String, Object> deptInfo = new HashMap<>();
                deptInfo.put("id", department.getId());
                deptInfo.put("name", department.getName());
                positionInfo.put("department", deptInfo);
            }
        }
        
        return positionInfo;
    }
} 