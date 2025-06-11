package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户个性化配置表
 * 记录用户的个人偏好设置，如默认岗位、主题、布局等
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("user_personal_config")
public class UserPersonalConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 默认岗位ID
     * 当用户有多个岗位时，指定默认登录时展示的岗位
     */
    private Long defaultPositionId;

    /**
     * 系统主题配置
     * 如：light（浅色主题）、dark（深色主题）、auto（跟随系统）
     */
    private String theme;

    /**
     * 布局配置
     * JSON格式存储，包含侧边栏、顶栏等布局偏好
     */
    private String layoutConfig;

    /**
     * 语言设置
     * 如：zh-CN（中文简体）、zh-TW（中文繁体）、en-US（英语）
     */
    private String language;

    /**
     * 时区设置
     * 如：Asia/Shanghai、America/New_York
     */
    private String timezone;

    /**
     * 首页设置
     * 登录后默认跳转的页面路径
     */
    private String homePage;

    /**
     * 消息通知配置
     * JSON格式存储各类消息的通知偏好
     */
    private String notificationConfig;

    /**
     * 其他扩展配置
     * JSON格式存储其他个性化设置
     */
    private String extendConfig;

    /**
     * 是否启用
     */
    private Boolean enabled;

    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 更新人ID
     */
    private Long updatedBy;
} 