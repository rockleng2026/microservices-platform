package com.central.organization.service.impl;

import com.central.common.context.TenantContextHolder;
import com.central.common.model.SysUser;
import com.central.organization.mapper.EmployeeMapper;
import com.central.organization.mapper.UsersMapper;
import com.central.organization.mapper.UserPersonalConfigMapper;
import com.central.organization.mapper.WorkpositionMapper;
import com.central.organization.mapper.DepartmentMapper;
import com.central.organization.model.Employee;
import com.central.organization.model.MenuPermission;
import com.central.organization.model.PortalUser;
import com.central.organization.model.UserPersonalConfig;
import com.central.organization.model.Workposition;
import com.central.organization.model.Department;
import com.central.organization.model.vo.WorkpositionVO;
import com.central.organization.model.vo.AccountUserVO;
import com.central.organization.service.MenuPermissionService;
import com.central.organization.service.PortalUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.central.common.model.PageResult;

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

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    public PortalUser getCurrentUserInfo(Long userId) {
        log.info("获取用户详细信息: {}", userId);
        
        try {
            // 1. 获取用户基本信息
            PortalUser user = usersMapper.selectByPrimaryKey(userId);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }

            // 设置基本信息
            user.setType("portal");
            
            // 2. 获取员工信息
            Employee employee = null;
            if (user.getEmployeeId() != null) {
                employee = employeeMapper.selectById(user.getEmployeeId());
                user.setEmployee(employee);
            }
            
            // 3. 获取用户的所有岗位列表
            List<Workposition> positions = getUserPositions(userId);
            user.setPositions(positions);
            
            // 4. 获取用户个性化配置
            UserPersonalConfig personalConfig = getUserPersonalConfig(userId);
            if (personalConfig == null) {
                // 首次登录，初始化默认配置
                Long defaultPositionId = null;
                if (employee != null && employee.getPositionId() != null) {
                    defaultPositionId = employee.getPositionId();
                } else if (!positions.isEmpty()) {
                    defaultPositionId = positions.get(0).getId();
                }
                initUserDefaultConfig(userId, defaultPositionId);
                personalConfig = getUserPersonalConfig(userId);
            }
            user.setPersonalConfig(personalConfig);
            
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
                currentPositionId = positions.get(0).getId();
            }
            
            // 6. 获取当前岗位详细信息
            if (currentPositionId != null) {
                Workposition currentPosition = workpositionMapper.selectById(currentPositionId);
                if (currentPosition != null) {
                    // 关联部门名称
                    if (currentPosition.getDepartmentId() != null) {
                        Department department = departmentMapper.selectById(currentPosition.getDepartmentId());
                        if (department != null) {
                            currentPosition.setDeptName(department.getName());
                        }
                    }
                    user.setCurrentPosition(currentPosition);
                }
                
                // 7. 获取当前岗位的菜单权限--这个不需要关联-菜单信息留给菜单功能接口查询
                // 注List<MenuPermission> menus = getCurrentUserMenus(userId);
                // 注user.setMenus(menus);
            }
            
            // 8. 租户信息
            Map<String, Object> tenant = new HashMap<>();
            tenant.put("id", user.getTenantId() != null ? user.getTenantId() : "default");
            tenant.put("name", "Portal企业");
            tenant.put("code", "PORTAL");
            user.setTenant(tenant);
            
            return user;
        } catch (Exception e) {
            log.error("获取用户详细信息失败: {}", userId, e);
            throw new RuntimeException("获取用户信息失败: " + e.getMessage());
        }
    }

    @Override
    public List<Workposition> getUserPositions(Long userId) {
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

            List<Workposition> positions = new ArrayList<>();
            
            // 获取主岗位
            if (employee.getPositionId() != null) {
                Workposition mainPosition = workpositionMapper.selectById(employee.getPositionId());
                if (mainPosition != null) {
                    // 关联部门名称
                    if (mainPosition.getDepartmentId() != null) {
                        Department department = departmentMapper.selectById(mainPosition.getDepartmentId());
                        if (department != null) {
                            mainPosition.setDeptName(department.getName());
                        }
                    }
                    positions.add(mainPosition);
                }
            }
            
            // 获取分管岗位（实现多岗位关联表）
            if (employee.getPositionId() != null) {
                List<WorkpositionVO> subPositionsVO = workpositionMapper.selectSubPositionsByPositionId(employee.getPositionId(), user.getTenantId() != null ? user.getTenantId() : "default");
                // 转换VO为实体
                List<Workposition> subPositions = subPositionsVO.stream().map(vo -> {
                    Workposition position = new Workposition();
                    position.setId(Long.parseLong(vo.getId()));
                    position.setName(vo.getName());
                    position.setShortName(vo.getShortName());
                    position.setDepartmentId(Long.parseLong(vo.getDepartmentId()));
                    position.setPositionLevel(vo.getPositionLevel());
                    position.setJobDescription(vo.getJobDescription());
                    position.setRequirements(vo.getRequirements());
                    position.setSalaryRange(vo.getSalaryRange());
                    position.setMaxEmployees(vo.getMaxEmployees());
                    position.setMenuIds(vo.getMenuIds());
                    position.setMenuFuncIds(vo.getMenuFuncIds());
                    position.setIsManager(vo.getIsManager());
                    position.setIsDirector(vo.getIsDirector());
                    position.setSortOrder(vo.getSortOrder());
                    position.setStatus(vo.getStatus());
                    position.setTenantId(vo.getTenantId());
                    position.setCreatedAt(vo.getCreatedAt());
                    position.setUpdatedAt(vo.getUpdatedAt());
                    position.setCreatedBy(vo.getCreatedBy());
                    position.setUpdatedBy(vo.getUpdatedBy());
                    
                    // 关联部门名称
                    if (position.getDepartmentId() != null) {
                        Department department = departmentMapper.selectById(position.getDepartmentId());
                        if (department != null) {
                            position.setDeptName(department.getName());
                        }
                    }
                    
                    return position;
                }).collect(java.util.stream.Collectors.toList());
                positions.addAll(subPositions);
            }

            return positions;
        } catch (Exception e) {
            log.error("获取用户岗位列表失败: {}", userId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<MenuPermission> getCurrentUserMenus(Long userId) {
        // 临时实现：将Map转换为MenuPermission对象
        List<Map<String, Object>> menuMaps = menuPermissionService.getCurrentUserAllMenus(userId);
        return convertToMenuPermissions(menuMaps);
    }
    
    /**
     * 将Map形式的菜单转换为MenuPermission对象
     */
    private List<MenuPermission> convertToMenuPermissions(List<Map<String, Object>> menuMaps) {
        List<MenuPermission> menuPermissions = new ArrayList<>();
        for (Map<String, Object> menuMap : menuMaps) {
            MenuPermission menu = new MenuPermission();
            menu.setId((Long) menuMap.get("id"));
            menu.setName((String) menuMap.get("name"));
            menu.setCode((String) menuMap.get("code"));
            menu.setParentId((Long) menuMap.get("parentId"));
            menu.setPath((String) menuMap.get("path"));
            menu.setComponent((String) menuMap.get("component"));
            menu.setIcon((String) menuMap.get("icon"));
            menu.setMenuType((Integer) menuMap.get("menuType"));
            menu.setSortOrder((Integer) menuMap.get("sortOrder"));
            menu.setVisible((Boolean) menuMap.get("visible"));
            menu.setEnabled((Boolean) menuMap.get("enabled"));
            
            // 处理子菜单
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) menuMap.get("children");
            if (children != null) {
                menu.setChildren(convertToMenuPermissions(children));
            }
            
            menuPermissions.add(menu);
        }
        return menuPermissions;
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
    public PortalUser switchUserPosition(Long userId, Long positionId) {
        log.info("切换用户岗位: 用户ID={}, 岗位ID={}", userId, positionId);
        
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
            List<Workposition> userPositions = getUserPositions(userId);
            boolean hasPermission = userPositions.stream()
                    .anyMatch(p -> positionId.equals(p.getId()));
            
            if (!hasPermission) {
                throw new RuntimeException("您没有权限使用该岗位");
            }
            
            // 更新用户的默认岗位配置
            boolean updateSuccess = updateDefaultPosition(userId, positionId);
            if (!updateSuccess) {
                throw new RuntimeException("岗位切换失败");
            }
            
            log.info("用户 {} 成功切换到岗位 {}", userId, positionId);
            
            // 返回更新后的用户信息
            return getCurrentUserInfo(userId);
        } catch (Exception e) {
            log.error("岗位切换失败: userId={}, positionId={}", userId, positionId, e);
            throw new RuntimeException("岗位切换失败: " + e.getMessage());
        }
    }

    // ================== 账号管理接口 ==================

    @Override
    public PageResult<AccountUserVO> pageAccount(String keyword, Integer status, Integer page, Integer size) {
        int offset = (page - 1) * size;
        List<AccountUserVO> list = usersMapper.selectAccountUserPage(keyword, status, offset, size, TenantContextHolder.getTenant());
        long total = usersMapper.countPage(keyword, status);
        int pages = (int) ((total + size - 1) / size);
        return PageResult.<AccountUserVO>builder()
                .data(list)
                .code(0)
                .resp_code(0)
                .count(total)
                .page(page)
                .size(size)
                .pages(pages)
                .build();
    }

    @Override
    public PortalUser getAccount(Long id) {
        return usersMapper.selectByPrimaryKey(id);
    }

    @Override
    @Transactional
    public void createAccount(PortalUser user) {
        // 兼容前端字段 userMobile/userEmail
        // 自动写入租户ID
        String tenantId = TenantContextHolder.getTenant();
        if (tenantId != null && !tenantId.isEmpty()) {
            user.setTenantId(tenantId);
        }
        // 校验employeeId唯一
        PortalUser exist = usersMapper.selectByEmployeeId(user.getEmployeeId());
        if (exist != null) throw new RuntimeException("该员工已开通账号");
        // 校验用户名唯一
        if (usersMapper.selectByUsername(user.getUsername()) != null) throw new RuntimeException("用户名已存在");
        // 密码加密
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEnabled(true);
        user.setType("portal");
        usersMapper.insert(user);
        // 可扩展：同步更新员工loginAccountFlag=1
    }

    @Override
    @Transactional
    public void updateAccount(PortalUser user) {
        usersMapper.updateByPrimaryKeySelective(user);
    }

    @Override
    @Transactional
    public void disableAccount(Long id) {
        PortalUser user = usersMapper.selectByPrimaryKey(id);
        if (user == null) throw new RuntimeException("账号不存在");
        user.setEnabled(false);
        usersMapper.updateByPrimaryKeySelective(user);
    }

    @Override
    @Transactional
    public void enableAccount(Long id) {
        PortalUser user = usersMapper.selectByPrimaryKey(id);
        if (user == null) throw new RuntimeException("账号不存在");
        user.setEnabled(true);
        usersMapper.updateByPrimaryKeySelective(user);
    }

    @Override
    @Transactional
    public void cancelAccount(Long id) {
        PortalUser user = usersMapper.selectByPrimaryKey(id);
        if (user == null) throw new RuntimeException("账号不存在");
        user.setEnabled(false);
        user.setDel(true);
        usersMapper.updateByPrimaryKeySelective(user);
        // 可扩展：同步更新员工loginAccountFlag=0
    }

    @Override
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        PortalUser user = usersMapper.selectByPrimaryKey(id);
        if (user == null) throw new RuntimeException("账号不存在");
        user.setPassword(passwordEncoder.encode(newPassword));
        usersMapper.updateByPrimaryKeySelective(user);
    }

    @Override
    @Transactional
    public void changePassword(Long id, String oldPassword, String newPassword) {
        PortalUser user = usersMapper.selectByPrimaryKey(id);
        if (user == null) throw new RuntimeException("账号不存在");
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) throw new RuntimeException("旧密码错误");
        user.setPassword(passwordEncoder.encode(newPassword));
        usersMapper.updateByPrimaryKeySelective(user);
    }

    @Override
    @Transactional
    public void batchCancelAccount(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        for (Long id : ids) {
            cancelAccount(id);
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