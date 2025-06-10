package com.central.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.system.mapper.SysUserMapper;
import com.central.system.model.SysUser;
import com.central.system.service.SysUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 系统用户Service实现类
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    private static final String DEFAULT_PASSWORD = "123456";

    @Override
    public Page<SysUser> getUserPage(Page<SysUser> page, String username, String employeeName, Long departmentId, Integer status) {
        try {
            return baseMapper.selectUserPage(page, username, employeeName, departmentId, status);
        } catch (Exception e) {
            log.error("分页查询用户失败", e);
            throw new RuntimeException("分页查询用户失败", e);
        }
    }

    @Override
    public SysUser getUserByUsername(String username) {
        try {
            if (!StringUtils.hasText(username)) {
                return null;
            }
            return baseMapper.selectByUsername(username);
        } catch (Exception e) {
            log.error("根据用户名查询用户失败，用户名: {}", username, e);
            throw new RuntimeException("查询用户失败", e);
        }
    }

    @Override
    public SysUser getUserByEmployeeId(Long employeeId) {
        try {
            if (employeeId == null) {
                return null;
            }
            return baseMapper.selectByEmployeeId(employeeId);
        } catch (Exception e) {
            log.error("根据员工ID查询用户失败，员工ID: {}", employeeId, e);
            throw new RuntimeException("查询用户失败", e);
        }
    }

    @Override
    public SysUser getUserByMobile(String mobile) {
        try {
            if (!StringUtils.hasText(mobile)) {
                return null;
            }
            return baseMapper.selectByMobile(mobile);
        } catch (Exception e) {
            log.error("根据手机号查询用户失败，手机号: {}", mobile, e);
            throw new RuntimeException("查询用户失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveUser(SysUser user) {
        try {
            // 验证用户数据
            validateUser(user, true);
            
            // 设置默认值
            setDefaultValues(user);
            
            // 设置默认密码
            if (!StringUtils.hasText(user.getPassword())) {
                user.setPassword(DEFAULT_PASSWORD);
            }
            
            return this.save(user);
        } catch (Exception e) {
            log.error("保存用户失败", e);
            throw new RuntimeException("保存用户失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateUser(SysUser user) {
        try {
            // 验证用户数据
            validateUser(user, false);
            
            // 检查用户是否存在
            SysUser existUser = this.getById(user.getId());
            if (existUser == null) {
                throw new RuntimeException("用户不存在");
            }
            
            // 更新时不修改密码，密码单独修改
            user.setPassword(null);
            
            return this.updateById(user);
        } catch (Exception e) {
            log.error("更新用户失败", e);
            throw new RuntimeException("更新用户失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateStatus(List<Long> userIds, Integer status) {
        try {
            if (userIds == null || userIds.isEmpty()) {
                return false;
            }
            
            int result = baseMapper.batchUpdateStatus(userIds, status);
            return result > 0;
        } catch (Exception e) {
            log.error("批量更新用户状态失败", e);
            throw new RuntimeException("批量更新用户状态失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean resetPassword(Long userId, String newPassword) {
        try {
            if (userId == null) {
                return false;
            }
            
            SysUser user = this.getById(userId);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }
            
            // 如果没有提供新密码，使用默认密码
            String password = StringUtils.hasText(newPassword) ? newPassword : DEFAULT_PASSWORD;
            
            user.setPassword(password);
            return this.updateById(user);
        } catch (Exception e) {
            log.error("重置用户密码失败，用户ID: {}", userId, e);
            throw new RuntimeException("重置密码失败", e);
        }
    }

    @Override
    public boolean validatePassword(String username, String password) {
        try {
            if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
                return false;
            }
            
            SysUser user = getUserByUsername(username);
            if (user == null || user.getEnabled() != 1) {
                return false;
            }
            
            return password.equals(user.getPassword());
        } catch (Exception e) {
            log.error("验证用户密码失败，用户名: {}", username, e);
            return false;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePassword(Long userId, String oldPassword, String newPassword) {
        try {
            if (userId == null || !StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
                return false;
            }
            
            SysUser user = this.getById(userId);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }
            
            // 验证旧密码
            if (!oldPassword.equals(user.getPassword())) {
                throw new RuntimeException("旧密码错误");
            }
            
            // 更新新密码
            user.setPassword(newPassword);
            return this.updateById(user);
        } catch (Exception e) {
            log.error("更新用户密码失败，用户ID: {}", userId, e);
            throw new RuntimeException("更新密码失败", e);
        }
    }

    @Override
    public int countByDepartment(Long departmentId) {
        try {
            if (departmentId == null) {
                return 0;
            }
            return baseMapper.countByDepartment(departmentId);
        } catch (Exception e) {
            log.error("统计部门用户数量失败，部门ID: {}", departmentId, e);
            return 0;
        }
    }

    /**
     * 验证用户数据
     */
    private void validateUser(SysUser user, boolean isNew) {
        if (user == null) {
            throw new IllegalArgumentException("用户信息不能为空");
        }
        
        if (!StringUtils.hasText(user.getUsername())) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        
        // 检查用户名是否重复
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, user.getUsername())
               .eq(SysUser::getIsDel, 0);
        
        if (!isNew && user.getId() != null) {
            wrapper.ne(SysUser::getId, user.getId());
        }
        
        long count = this.count(wrapper);
        if (count > 0) {
            throw new IllegalArgumentException("用户名已存在");
        }
        
        // 检查手机号是否重复
        if (StringUtils.hasText(user.getMobile())) {
            wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysUser::getMobile, user.getMobile())
                   .eq(SysUser::getIsDel, 0);
            
            if (!isNew && user.getId() != null) {
                wrapper.ne(SysUser::getId, user.getId());
            }
            
            count = this.count(wrapper);
            if (count > 0) {
                throw new IllegalArgumentException("手机号已存在");
            }
        }
    }

    /**
     * 设置默认值
     */
    private void setDefaultValues(SysUser user) {
        if (user.getEnabled() == null) {
            user.setEnabled(1);
        }
        
        if (!StringUtils.hasText(user.getType())) {
            user.setType("NORMAL");
        }
        
        if (user.getIsDel() == null) {
            user.setIsDel(0);
        }
    }
} 