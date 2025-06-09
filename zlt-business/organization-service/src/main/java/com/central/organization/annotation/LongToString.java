package com.central.organization.annotation;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Long转String注解
 * 用于解决前端JavaScript处理Long类型精度丢失问题
 * 
 * 使用方式：
 * @LongToString
 * private Long id;
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonSerialize(using = LongToStringSerializer.class)
public @interface LongToString {
} 