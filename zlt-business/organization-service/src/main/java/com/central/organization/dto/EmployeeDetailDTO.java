package com.central.organization.dto;

import lombok.Data;
import lombok.experimental.Accessors;
import com.central.organization.model.Employee;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 员工详情DTO
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
@Data
@Accessors(chain = true)
public class EmployeeDetailDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 员工基础信息
     */
    private Employee employee;
    
    /**
     * 部门信息
     */
    private DepartmentInfo department;
    
    /**
     * 主岗位信息
     */
    private PositionInfo primaryPosition;
    
    /**
     * 副岗位信息列表
     */
    private List<PositionInfo> secondaryPositions;
    
    /**
     * 员工等级信息
     */
    private GradeInfo grade;
    
    /**
     * 扩展数据
     */
    private Map<String, Object> extendData;
    
    /**
     * 附件列表
     */
    private List<AttachmentInfo> attachments;
    
    /**
     * 直接上级信息
     */
    private ManagerInfo directManager;
    
    /**
     * 下属员工列表
     */
    private List<SubordinateInfo> subordinates;
    
    /**
     * 权限信息
     */
    private PermissionInfo permissions;
    
    /**
     * 部门信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class DepartmentInfo implements Serializable {
        private Long id;
        private String name;
        private String depNo;
        private String fullPath;
        private Integer level;
    }
    
    /**
     * 岗位信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class PositionInfo implements Serializable {
        private Long id;
        private String name;
        private String shortName;
        private Integer workGrade;
        private String workContent;
        private Boolean isManagerPosition;
    }
    
    /**
     * 等级信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class GradeInfo implements Serializable {
        private Long id;
        private String gradeCode;
        private String gradeName;
        private Integer gradeLevel;
        private String description;
    }
    
    /**
     * 附件信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class AttachmentInfo implements Serializable {
        private Long id;
        private String attachmentType;
        private String attachmentName;
        private String originalName;
        private Long fileSize;
        private String fileType;
        private String filePath;
        private String uploadTime;
        private Integer auditStatus;
    }
    
    /**
     * 主管信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class ManagerInfo implements Serializable {
        private Long id;
        private String empNo;
        private String name;
        private String positionName;
        private String departmentName;
        private String mobile;
        private String email;
    }
    
    /**
     * 下属信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class SubordinateInfo implements Serializable {
        private Long id;
        private String empNo;
        private String name;
        private String positionName;
        private String mobile;
        private String email;
        private Integer employmentStatus;
    }
    
    /**
     * 权限信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class PermissionInfo implements Serializable {
        private Boolean canEdit;
        private Boolean canDelete;
        private Boolean canViewSalary;
        private Boolean canManage;
        private List<String> functionPermissions;
        private List<String> dataPermissions;
    }
} 