package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.central.common.model.SysRole;
import com.central.common.model.SysUser;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.Map;

/**
 * Portal用户模型（扩展SysUser）
 * 
 * @author zlt
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class PortalUser extends SysUser {
    
    /**
     * 关联的员工ID
     */
    private Long employeeId;
    
    /**
     * 租户ID
     */
    private String tenantId;
    
    /**
     * 公司名称
     */
    private String company;

    // ===== 扩展字段：员工信息 =====
    
    /**
     * 员工信息
     */
    @TableField(exist = false)
    private Employee employee;
    
    /**
     * 用户拥有的所有岗位
     */
    @TableField(exist = false)
    private List<Workposition> positions;
    
    /**
     * 当前生效的岗位
     */
    @TableField(exist = false)
    private Workposition currentPosition;
    
    /**
     * 用户的菜单权限树
     */
    @TableField(exist = false)
    private List<MenuPermission> menus;
    
    /**
     * 个性化配置
     */
    @TableField(exist = false)
    private UserPersonalConfig personalConfig;
    
    /**
     * 租户信息（暂时保留Map，后续可优化为Tenant对象）
     */
    @TableField(exist = false)
    private Map<String, Object> tenant;

    /**
     * 从SysUser构建PortalUser
     */
    public static PortalUser fromSysUser(SysUser sysUser) {
        if (sysUser == null) {
            return null;
        }
        
        PortalUser portalUser = new PortalUser();
        portalUser.setId(sysUser.getId());
        portalUser.setUsername(sysUser.getUsername());
        portalUser.setPassword(sysUser.getPassword());
        portalUser.setNickname(sysUser.getNickname());
        portalUser.setHeadImgUrl(sysUser.getHeadImgUrl());
        portalUser.setMobile(sysUser.getMobile());
        portalUser.setSex(sysUser.getSex());
        portalUser.setEnabled(sysUser.getEnabled());
        portalUser.setType(sysUser.getType());
        portalUser.setOpenId(sysUser.getOpenId());
        portalUser.setCreatorId(sysUser.getCreatorId());
        portalUser.setDel(sysUser.isDel());
        portalUser.setCreateTime(sysUser.getCreateTime());
        portalUser.setUpdateTime(sysUser.getUpdateTime());
        portalUser.setRoles(sysUser.getRoles());
        portalUser.setPermissions(sysUser.getPermissions());
        
        return portalUser;
    }
} 