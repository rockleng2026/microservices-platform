package com.central.organization.model.vo;

import lombok.Data;
import java.io.Serializable;

/**
 * 账号-员工-部门联合分页VO
 */
@Data
public class AccountUserVO implements Serializable {
    private Long userId;
    private String username;
    private String type;
    private Integer enabled;
    private String userMobile;
    private String userEmail;
    private Long employeeId;
    private String employeeName;
    private String employeeMobile;
    private String employeeEmail;
    private Long departmentId;
    private String departmentName;
    private String createTime;
    private String updateTime;
} 