package com.central.organization.service.impl;

import com.central.common.context.TenantContextHolder;
import com.central.organization.mapper.EmployeeMapper;
import com.central.organization.mapper.MenuMapper;
import com.central.organization.mapper.UserPersonalConfigMapper;
import com.central.organization.mapper.UsersMapper;
import com.central.organization.model.Employee;
import com.central.organization.model.PortalUser;
import com.central.organization.model.UserPersonalConfig;
import com.central.organization.service.MenuPermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 菜单权限服务实现类
 * 
 * @author zlt
 */
@Slf4j
@Service
public class MenuPermissionServiceImpl implements MenuPermissionService {

    @Autowired
    private UsersMapper usersMapper;

    @Autowired
    private EmployeeMapper employeeMapper;

    @Autowired
    private MenuMapper menuMapper;

    @Autowired
    private UserPersonalConfigMapper userPersonalConfigMapper;

    @Override
    public List<Map<String, Object>> getCurrentUserAllMenus(Long userId) {
        log.info("获取用户权限菜单，用户ID: {}", userId);
        
        try {
            // 1. 获取用户信息
            PortalUser user = usersMapper.selectByPrimaryKey(userId);
            if (user == null || user.getEmployeeId() == null) {
                log.warn("用户不存在或未关联员工信息，用户ID: {}", userId);
                return Collections.emptyList();
            }

            // 2. 获取员工信息
            Employee employee = employeeMapper.selectById(user.getEmployeeId());
            if (employee == null || employee.getPositionId() == null) {
                log.warn("员工不存在或未分配岗位，员工ID: {}", user.getEmployeeId());
                return Collections.emptyList();
            }

            // 3. 根据岗位获取菜单权限
            List<Map<String, Object>> menus = getMenusByPositionId(employee.getPositionId());
            
            // 4. 构建菜单树
            List<Map<String, Object>> menuTree = buildMenuTree(menus);
            
            log.info("用户 {} 获取到 {} 个菜单权限", userId, menuTree.size());
            return menuTree;
            
        } catch (Exception e) {
            log.error("获取用户权限菜单失败，用户ID: {}", userId, e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<Map<String, Object>> getCurrentUserPositionMenus(Long userId, Long positionId) {
        // 1. 获取用户信息
        String tenantId = TenantContextHolder.getTenant();
        if (positionId == null) {
            UserPersonalConfig userPersonalConfig = userPersonalConfigMapper.selectByUserId(userId, tenantId);
            positionId = userPersonalConfig.getDefaultPositionId();
        }

        List<Map<String, Object>> menus = getMenusByPositionId(positionId);
        // 4. 构建菜单树
        List<Map<String, Object>> menuTree = buildMenuTree(menus);

        log.info("用户 {} 获取到 {} 个菜单权限", userId, menuTree.size());
        return menuTree;
    }

    @Override
    public List<Map<String, Object>> getMenusByPositionId(Long positionId) {
        log.info("根据岗位ID获取菜单权限: {}", positionId);
        
        try {
            // 获取岗位配置的菜单权限
            List<Map<String, Object>> menus = menuMapper.selectMenusByPositionId(positionId);
            
            // 获取菜单对应的功能权限
            for (Map<String, Object> menu : menus) {
                Long menuId = (Long) menu.get("id");
                List<Map<String, Object>> functions = menuMapper.selectFunctionsByMenuId(menuId);
                menu.put("functions", functions);
            }
            
            log.info("岗位 {} 获取到 {} 个菜单权限", positionId, menus.size());
            return menus;
            
        } catch (Exception e) {
            log.error("根据岗位ID获取菜单权限失败，岗位ID: {}", positionId, e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<Map<String, Object>> buildMenuTree(List<Map<String, Object>> menuList) {
        if (menuList == null || menuList.isEmpty()) {
            return Collections.emptyList();
        }

        // 按sort_order排序
        menuList.sort((a, b) -> {
            Integer sortA = (Integer) a.getOrDefault("sortOrder", 0);
            Integer sortB = (Integer) b.getOrDefault("sortOrder", 0);
            return sortA.compareTo(sortB);
        });

        // 构建菜单映射
        Map<Long, Map<String, Object>> menuMap = new HashMap<>();
        for (Map<String, Object> menu : menuList) {
            Long id = (Long) menu.get("id");
            menu.put("children", new ArrayList<Map<String, Object>>());
            menuMap.put(id, menu);
        }

        // 构建树形结构
        List<Map<String, Object>> rootMenus = new ArrayList<>();
        for (Map<String, Object> menu : menuList) {
            Long parentId = (Long) menu.get("parentId");
            if (parentId == null || parentId == 0) {
                // 顶级菜单
                rootMenus.add(menu);
            } else {
                // 子菜单
                Map<String, Object> parentMenu = menuMap.get(parentId);
                if (parentMenu != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> children = (List<Map<String, Object>>) parentMenu.get("children");
                    children.add(menu);
                }
            }
        }

        return rootMenus;
    }
} 