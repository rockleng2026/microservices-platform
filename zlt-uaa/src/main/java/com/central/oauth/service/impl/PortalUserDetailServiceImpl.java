package com.central.oauth.service.impl;

import com.central.common.constant.SecurityConstants;
import com.central.common.feign.OrganizationService;
import com.central.common.model.SysUser;
import com.central.common.utils.LoginUserUtils;
import com.central.oauth.service.ZltUserDetailsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * Portal用户认证服务实现
 * 
 * @author zlt
 * <p>
 * Blog: http://zlt2000.gitee.io
 * Github: https://github.com/zlt2000
 */
@Slf4j
@Service
public class PortalUserDetailServiceImpl implements ZltUserDetailsService {
    private static final String ACCOUNT_TYPE_PORTAL = SecurityConstants.PORTAL_ACCOUNT_TYPE;

    @Resource
    private OrganizationService organizationService;

    @Override
    public boolean supports(String accountType) {
        return ACCOUNT_TYPE_PORTAL.equals(accountType);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Portal用户登录，用户名: {}", username);
        try {
            SysUser sysUser = organizationService.findByUsername(username);
            if (sysUser == null) {
                throw new InternalAuthenticationServiceException("用户名或密码错误");
            }
            checkUser(sysUser);
            log.info("Portal用户认证成功，用户ID: {}, 用户名: {}", sysUser.getId(), sysUser.getUsername());
            return LoginUserUtils.getLoginAppUser(sysUser);
        } catch (Exception e) {
            log.error("Portal用户认证失败，用户名: {}, 错误: {}", username, e.getMessage());
            throw new InternalAuthenticationServiceException("用户认证失败: " + e.getMessage());
        }
    }

    @Override
    public UserDetails loadUserByMobile(String mobile) {
        log.info("Portal用户手机号登录: {}", mobile);
        try {
            SysUser sysUser = organizationService.findByMobile(mobile);
            if (sysUser == null) {
                throw new InternalAuthenticationServiceException("手机号不存在");
            }
            checkUser(sysUser);
            return LoginUserUtils.getLoginAppUser(sysUser);
        } catch (Exception e) {
            log.error("Portal用户手机号认证失败，手机号: {}, 错误: {}", mobile, e.getMessage());
            throw new InternalAuthenticationServiceException("手机号认证失败: " + e.getMessage());
        }
    }

    @Override
    public UserDetails loadUserByUserId(String userId) throws UsernameNotFoundException {
        log.info("Portal用户ID登录: {}", userId);
        try {
            SysUser sysUser = organizationService.findByUserId(Long.parseLong(userId));
            if (sysUser == null) {
                throw new InternalAuthenticationServiceException("用户不存在");
            }
            checkUser(sysUser);
            return LoginUserUtils.getLoginAppUser(sysUser);
        } catch (Exception e) {
            log.error("Portal用户ID认证失败，用户ID: {}, 错误: {}", userId, e.getMessage());
            throw new InternalAuthenticationServiceException("用户ID认证失败: " + e.getMessage());
        }
    }

    /**
     * 检查用户状态
     * @param sysUser 用户信息
     */
    private void checkUser(SysUser sysUser) {
        if (sysUser != null && !sysUser.getEnabled()) {
            throw new DisabledException("用户已被禁用");
        }
    }
}
