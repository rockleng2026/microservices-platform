package com.central.oauth.service.impl;

import com.central.common.constant.SecurityConstants;
import com.central.common.model.SysUser;
import com.central.common.utils.LoginUserUtils;
import com.central.oauth.service.ZltUserDetailsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * Portal用户认证服务实现
 * 
 * @author leng
 */
@Slf4j
@Service
public class PortalUserDetailServiceImpl implements ZltUserDetailsService {
    private static final String ACCOUNT_TYPE_PORTAL = SecurityConstants.PORTAL_ACCOUNT_TYPE;

    private JdbcTemplate jdbcTemplate;

    @Autowired
    public void setDataSource(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public boolean supports(String accountType) {
        return ACCOUNT_TYPE_PORTAL.equals(accountType);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Portal用户登录，用户名: {}", username);
        try {
            SysUser sysUser = findUserByUsername(username);
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
            SysUser sysUser = findUserByMobile(mobile);
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
            SysUser sysUser = findUserById(Long.parseLong(userId));
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

    /**
     * 根据用户名查询用户信息
     */
    private SysUser findUserByUsername(String username) {
        try {
            String sql = "SELECT id, username, password, nickname, head_img_url, mobile, sex, enabled, type, create_time, update_time " +
                        "FROM central_organization.users WHERE username = ? AND enabled = 1 LIMIT 1";
            List<SysUser> users = jdbcTemplate.query(sql, new UserRowMapper(), username);
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            log.error("查询用户失败，用户名: {}, 错误: {}", username, e.getMessage());
            return null;
        }
    }

    /**
     * 根据手机号查询用户信息
     */
    private SysUser findUserByMobile(String mobile) {
        try {
            String sql = "SELECT id, username, password, nickname, head_img_url, mobile, sex, enabled, type, create_time, update_time " +
                        "FROM central_organization.users WHERE mobile = ? AND enabled = 1 LIMIT 1";
            List<SysUser> users = jdbcTemplate.query(sql, new UserRowMapper(), mobile);
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            log.error("查询用户失败，手机号: {}, 错误: {}", mobile, e.getMessage());
            return null;
        }
    }

    /**
     * 根据用户ID查询用户信息
     */
    private SysUser findUserById(Long userId) {
        try {
            String sql = "SELECT id, username, password, nickname, head_img_url, mobile, sex, enabled, type, create_time, update_time " +
                        "FROM central_organization.users WHERE id = ? AND enabled = 1 LIMIT 1";
            List<SysUser> users = jdbcTemplate.query(sql, new UserRowMapper(), userId);
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            log.error("查询用户失败，用户ID: {}, 错误: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * 用户信息行映射器
     */
    private static class UserRowMapper implements RowMapper<SysUser> {
        @Override
        public SysUser mapRow(ResultSet rs, int rowNum) throws SQLException {
            SysUser user = new SysUser();
            user.setId(rs.getLong("id"));
            user.setUsername(rs.getString("username"));
            user.setPassword(rs.getString("password"));
            user.setNickname(rs.getString("nickname"));
            user.setHeadImgUrl(rs.getString("head_img_url"));
            user.setMobile(rs.getString("mobile"));
            user.setSex(rs.getInt("sex"));
            user.setEnabled(rs.getBoolean("enabled"));
            user.setType(rs.getString("type"));
            user.setCreateTime(rs.getTimestamp("create_time"));
            user.setUpdateTime(rs.getTimestamp("update_time"));
            return user;
        }
    }
}
