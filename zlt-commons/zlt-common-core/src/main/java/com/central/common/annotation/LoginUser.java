package com.central.common.annotation;

import java.lang.annotation.*;

/**
 * 登录用户注解
 * 用于在Controller方法参数中自动注入当前登录用户信息
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface LoginUser {
} 