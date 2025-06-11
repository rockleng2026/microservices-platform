package com.central.common.feign.fallback;

import com.central.common.feign.OrganizationService;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import org.springframework.cloud.openfeign.FallbackFactory;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

/**
 * OrganizationService熔断降级工厂
 *
 * @author zlt
 */
@Slf4j
public class OrganizationServiceFallbackFactory implements FallbackFactory<OrganizationService> {
    
    @Override
    public OrganizationService create(Throwable throwable) {
        return new OrganizationService() {
            @Override
            public SysUser findByUsername(String username) {
                log.error("通过用户名查询用户异常:{}", username, throwable);
                return null;
            }

            @Override
            public SysUser findByMobile(String mobile) {
                log.error("通过手机号查询用户异常:{}", mobile, throwable);
                return null;
            }

            @Override
            public SysUser findByUserId(Long userId) {
                log.error("通过用户ID查询用户异常:{}", userId, throwable);
                return null;
            }

            @Override
            public Result<Map<String, Object>> getCurrentUser() {
                log.error("获取当前用户信息异常", throwable);
                return Result.failed("获取用户信息失败");
            }

            @Override
            public Result<List<Map<String, Object>>> getCurrentUserMenus() {
                log.error("获取用户权限菜单异常", throwable);
                return Result.failed("获取菜单权限失败");
            }

            @Override
            public Result<Map<String, Object>> switchPosition(Long positionId) {
                log.error("切换用户岗位异常:{}", positionId, throwable);
                return Result.failed("切换岗位失败");
            }
        };
    }
} 