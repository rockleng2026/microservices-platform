package com.central.common.feign;

import com.central.common.constant.ServiceNameConstants;
import com.central.common.feign.fallback.OrganizationServiceFallbackFactory;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 组织架构服务Feign客户端
 * 
 * @author zlt
 */
@FeignClient(name = ServiceNameConstants.ORGANIZATION_SERVICE, fallbackFactory = OrganizationServiceFallbackFactory.class, dismiss404 = true)
public interface OrganizationService {
    
    /**
     * 根据用户名查询用户信息（用于Portal登录认证）
     *
     * @param username 用户名
     * @return 用户信息
     */
    @GetMapping(value = "/users-anon/login", params = "username")
    SysUser findByUsername(@RequestParam("username") String username);

    /**
     * 根据手机号查询用户信息
     *
     * @param mobile 手机号
     * @return 用户信息
     */
    @GetMapping(value = "/users-anon/mobile", params = "mobile")
    SysUser findByMobile(@RequestParam("mobile") String mobile);

    /**
     * 根据用户ID查询用户信息
     *
     * @param userId 用户ID
     * @return 用户信息
     */
    @GetMapping(value = "/users-anon/id/{userId}")
    SysUser findByUserId(@PathVariable("userId") Long userId);

    /**
     * 获取当前用户信息（包含员工信息）
     *
     * @return 用户详细信息
     */
    @GetMapping(value = "/users/current")
    Result<Map<String, Object>> getCurrentUser();

    /**
     * 获取用户权限菜单
     *
     * @return 菜单权限列表
     */
    @GetMapping(value = "/menus/current")
    Result<List<Map<String, Object>>> getCurrentUserMenus();

    /**
     * 切换用户岗位
     *
     * @param positionId 岗位ID
     * @return 切换结果
     */
    @PostMapping(value = "/users/switch-position")
    Result<Map<String, Object>> switchPosition(@RequestParam("positionId") Long positionId);
} 