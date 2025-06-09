package com.central.organization.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 部门统计信息DTO
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
@Data
@Accessors(chain = true)
public class DepartmentStatisticsDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 部门基础信息
     */
    private Long departmentId;
    private String departmentName;
    private String depNo;
    private String fullPath;
    
    /**
     * 员工统计
     */
    private EmployeeStatistics employeeStats;
    
    /**
     * 岗位统计
     */
    private PositionStatistics positionStats;
    
    /**
     * 子部门统计
     */
    private DepartmentStats departmentStats;
    
    /**
     * 人员分析
     */
    private PersonnelAnalysis personnelAnalysis;
    
    /**
     * 趋势分析
     */
    private TrendAnalysis trendAnalysis;
    
    /**
     * 员工统计内部类
     */
    @Data
    @Accessors(chain = true)
    public static class EmployeeStatistics implements Serializable {
        private Integer totalEmployees; // 总员工数
        private Integer activeEmployees; // 在职员工数
        private Integer trialEmployees; // 试用期员工数
        private Integer leaveEmployees; // 离职员工数
        private Integer newEmployeesThisMonth; // 本月新入职
        private Integer leaveEmployeesThisMonth; // 本月离职
        private Double turnoverRate; // 离职率
        private Double averageAge; // 平均年龄
        private Double averageWorkYears; // 平均工作年限
        
        // 性别分布
        private Integer maleCount;
        private Integer femaleCount;
        private Double maleRatio;
        private Double femaleRatio;
        
        // 用工类型分布
        private Map<String, Integer> employmentTypeDistribution;
        
        // 学历分布
        private Map<String, Integer> educationDistribution;
        
        // 年龄段分布
        private Map<String, Integer> ageGroupDistribution;
    }
    
    /**
     * 岗位统计内部类
     */
    @Data
    @Accessors(chain = true)
    public static class PositionStatistics implements Serializable {
        private Integer totalPositions; // 总岗位数
        private Integer enabledPositions; // 启用岗位数
        private Integer disabledPositions; // 禁用岗位数
        private Integer managerPositions; // 主管岗位数
        private Integer emptyPositions; // 空缺岗位数
        private Integer fullPositions; // 满员岗位数
        private Double averagePositionWorkload; // 平均岗位工作量
        
        // 岗位等级分布
        private Map<String, Integer> gradeDistribution;
        
        // 岗位类型分布
        private Map<String, Integer> typeDistribution;
    }
    
    /**
     * 部门统计内部类
     */
    @Data
    @Accessors(chain = true)
    public static class DepartmentStats implements Serializable {
        private Integer totalSubDepartments; // 总子部门数
        private Integer activeSubDepartments; // 活跃子部门数
        private Integer emptySubDepartments; // 空部门数
        private Integer maxDepth; // 最大层级深度
        private Integer averageEmployeesPerDept; // 平均每部门员工数
        
        // 层级分布
        private Map<String, Integer> levelDistribution;
    }
    
    /**
     * 人员分析内部类
     */
    @Data
    @Accessors(chain = true)
    public static class PersonnelAnalysis implements Serializable {
        private Double headcountGrowthRate; // 人员增长率
        private Integer recruitmentNeed; // 招聘需求
        private List<String> keyVacancies; // 关键空缺岗位
        private List<String> overstaffedPositions; // 超编岗位
        private List<String> criticalPositions; // 关键岗位
        private Double skillCompetencyScore; // 技能胜任度得分
        private Double teamStabilityIndex; // 团队稳定性指数
        
        // 绩效分析
        private Double averagePerformanceScore; // 平均绩效得分
        private Map<String, Integer> performanceDistribution; // 绩效分布
    }
    
    /**
     * 趋势分析内部类
     */
    @Data
    @Accessors(chain = true)
    public static class TrendAnalysis implements Serializable {
        // 员工数量趋势（近12个月）
        private List<MonthlyData> employeeCountTrend;
        
        // 入职离职趋势
        private List<MonthlyData> entryLeaveTrend;
        
        // 岗位变动趋势
        private List<MonthlyData> positionChangeTrend;
        
        // 预测数据
        private ForecastData forecast;
    }
    
    /**
     * 月度数据内部类
     */
    @Data
    @Accessors(chain = true)
    public static class MonthlyData implements Serializable {
        private String month; // 月份 (YYYY-MM)
        private Integer value; // 数值
        private Double changeRate; // 环比变化率
        private String label; // 标签描述
    }
    
    /**
     * 预测数据内部类
     */
    @Data
    @Accessors(chain = true)
    public static class ForecastData implements Serializable {
        private Integer predictedEmployeeCount; // 预测员工数
        private Integer predictedRecruitment; // 预测招聘需求
        private Integer predictedTurnover; // 预测离职人数
        private String forecastPeriod; // 预测周期
        private Double confidence; // 预测置信度
    }
    
    /**
     * 对比数据（与上级部门、同级部门对比）
     */
    private ComparisonData comparison;
    
    /**
     * 对比数据内部类
     */
    @Data
    @Accessors(chain = true)
    public static class ComparisonData implements Serializable {
        // 与上级部门对比
        private ComparisonItem parentComparison;
        
        // 与同级部门对比
        private List<ComparisonItem> peerComparison;
        
        // 与全公司对比
        private ComparisonItem companyComparison;
    }
    
    /**
     * 对比项内部类
     */
    @Data
    @Accessors(chain = true)
    public static class ComparisonItem implements Serializable {
        private String name; // 对比对象名称
        private Integer employeeCount; // 员工数
        private Double turnoverRate; // 离职率
        private Double averageAge; // 平均年龄
        private Double performanceScore; // 绩效得分
        private String ranking; // 排名
    }
    
    /**
     * 关键指标
     */
    private KeyIndicators keyIndicators;
    
    /**
     * 关键指标内部类
     */
    @Data
    @Accessors(chain = true)
    public static class KeyIndicators implements Serializable {
        private Double organizationalEfficiency; // 组织效率
        private Double humanResourceUtilization; // 人力资源利用率
        private Double teamCollaboration; // 团队协作度
        private Double developmentPotential; // 发展潜力
        private Double riskLevel; // 风险等级
        private List<String> strengths; // 优势
        private List<String> improvements; // 改进建议
    }
    
    /**
     * 统计时间信息
     */
    private String statisticsDate; // 统计日期
    private String statisticsPeriod; // 统计周期
    private String lastUpdateTime; // 最后更新时间
} 