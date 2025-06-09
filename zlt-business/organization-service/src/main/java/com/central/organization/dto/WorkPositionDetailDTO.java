package com.central.organization.dto;

import lombok.Data;
import lombok.experimental.Accessors;
import com.central.organization.model.WorkPosition;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 岗位详情DTO
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
@Data
@Accessors(chain = true)
public class WorkPositionDetailDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 岗位基础信息
     */
    private WorkPosition workPosition;
    
    /**
     * 部门信息
     */
    private DepartmentInfo department;
    
    /**
     * 上级岗位信息
     */
    private PositionInfo parentPosition;
    
    /**
     * 下级岗位列表
     */
    private List<PositionInfo> childPositions;
    
    /**
     * 在职员工列表
     */
    private List<EmployeeInfo> employees;
    
    /**
     * 权限配置信息
     */
    private PermissionConfig permissions;
    
    /**
     * 统计信息
     */
    private StatisticsInfo statistics;
    
    /**
     * 岗位要求配置
     */
    private RequirementConfig requirements;
    
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
        private Long directorId;
        private String directorName;
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
        private String departmentName;
        private Boolean isManagerPosition;
        private Integer employeeCount;
    }
    
    /**
     * 员工信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class EmployeeInfo implements Serializable {
        private Long id;
        private String empNo;
        private String name;
        private String avatar;
        private String mobile;
        private String email;
        private Integer employmentStatus;
        private Integer employmentType;
        private String entryDate;
        private Boolean isPrimary; // 是否主岗位
    }
    
    /**
     * 权限配置内部类
     */
    @Data
    @Accessors(chain = true)
    public static class PermissionConfig implements Serializable {
        private String functionIds; // 功能权限ID串
        private Map<String, Object> detailPermissions; // 详细权限配置
        private List<String> dataPermissions; // 数据权限范围
        private List<MenuPermission> menuPermissions; // 菜单权限
        private List<OperationPermission> operationPermissions; // 操作权限
    }
    
    /**
     * 菜单权限内部类
     */
    @Data
    @Accessors(chain = true)
    public static class MenuPermission implements Serializable {
        private String menuCode;
        private String menuName;
        private String menuPath;
        private Boolean hasAccess;
        private List<MenuPermission> children;
    }
    
    /**
     * 操作权限内部类
     */
    @Data
    @Accessors(chain = true)
    public static class OperationPermission implements Serializable {
        private String permissionCode;
        private String permissionName;
        private String moduleCode;
        private String moduleName;
        private Boolean hasAccess;
    }
    
    /**
     * 统计信息内部类
     */
    @Data
    @Accessors(chain = true)
    public static class StatisticsInfo implements Serializable {
        private Integer totalEmployees; // 总员工数
        private Integer activeEmployees; // 在职员工数
        private Integer trialEmployees; // 试用期员工数
        private Integer avgWorkYears; // 平均工作年限
        private Double avgAge; // 平均年龄
        private Map<String, Integer> genderDistribution; // 性别分布
        private Map<String, Integer> educationDistribution; // 学历分布
        private Map<String, Integer> typeDistribution; // 用工类型分布
    }
    
    /**
     * 岗位要求配置内部类
     */
    @Data
    @Accessors(chain = true)
    public static class RequirementConfig implements Serializable {
        private String education; // 学历要求
        private String workExperience; // 工作经验要求
        private String skillRequirements; // 技能要求
        private String ageRange; // 年龄要求
        private String genderRequirement; // 性别要求
        private String languageRequirements; // 语言要求
        private String certificateRequirements; // 证书要求
        private String otherRequirements; // 其他要求
        private Integer minWorkYears; // 最低工作年限
        private Integer maxWorkYears; // 最高工作年限
        private Integer minAge; // 最低年龄
        private Integer maxAge; // 最高年龄
    }
    
    /**
     * 扩展配置信息
     */
    private Map<String, Object> extendConfig;
    
    /**
     * 操作权限信息
     */
    private OperationRights operationRights;
    
    /**
     * 操作权限内部类
     */
    @Data
    @Accessors(chain = true)
    public static class OperationRights implements Serializable {
        private Boolean canEdit; // 是否可编辑
        private Boolean canDelete; // 是否可删除
        private Boolean canManagePermission; // 是否可管理权限
        private Boolean canAssignEmployee; // 是否可分配员工
        private Boolean canViewStatistics; // 是否可查看统计
        private Boolean canCopy; // 是否可复制
        private Boolean canExport; // 是否可导出
    }
} 