package com.central.organization.model;

import com.central.common.model.SysUser;
import lombok.Data;
import lombok.EqualsAndHashCode;

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