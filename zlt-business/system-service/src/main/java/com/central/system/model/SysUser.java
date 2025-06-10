package com.central.system.model;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.SuperEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;
import java.util.List;

/**
 * 系统用户实体
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("users")
@Schema(description = "系统用户")
public class SysUser extends SuperEntity {

    private static final long serialVersionUID = 1L;

    @Schema(description = "用户ID")
    @TableId(value = "id", type = IdType.AUTO)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;


    @Schema(description = "用户名")
    @TableField("username")
    private String username;

    @Schema(description = "登录密码")
    @TableField("password")
    @JsonIgnore
    private String password;

    @Schema(description = "员工ID")
    @TableField("employee_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long employeeId;

    @Schema(description = "昵称")
    @TableField("nickname")
    private String nickname;

    @Schema(description = "头像URL")
    @TableField("head_img_url")
    private String headImgUrl;

    @Schema(description = "手机号")
    @TableField("mobile")
    private String mobile;

    @Schema(description = "性别(1男,2女)")
    @TableField("sex")
    private Integer sex;

    @Schema(description = "状态(1正常,0禁用)")
    @TableField("enabled")
    private Integer enabled;

    @Schema(description = "用户类型")
    @TableField("type")
    private String type;



    @Schema(description = "公司")
    @TableField("company")
    private String company;

    @Schema(description = "OpenID")
    @TableField("open_id")
    private String openId;

    @Schema(description = "删除标识(0正常,1删除)")
    @TableField("is_del")
    @TableLogic
    private Integer isDel;

    @Schema(description = "创建人ID")
    @TableField("creator_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long creatorId;

    @Schema(description = "租户ID")
    @TableField("tenant_id")
    private String tenantId;

    @Schema(description = "创建时间")
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

    @Schema(description = "更新时间")  
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updateTime;

    // 非数据库字段
    @Schema(description = "员工姓名")
    @TableField(exist = false)
    private String employeeName;

    @Schema(description = "部门ID（来自员工信息）")
    @TableField(exist = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long departmentId;

    @Schema(description = "部门名称")
    @TableField(exist = false)
    private String departmentName;

    @Schema(description = "岗位ID")
    @TableField(exist = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long positionId;

    @Schema(description = "岗位名称")
    @TableField(exist = false)
    private String positionName;

    @Schema(description = "角色列表")
    @TableField(exist = false)
    private List<SysRole> roles;

    @Schema(description = "权限列表")
    @TableField(exist = false)
    private List<String> permissions;
} 