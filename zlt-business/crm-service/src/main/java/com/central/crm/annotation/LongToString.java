package com.central.crm.annotation;

import com.central.crm.serializer.LongToStringSerializer;
import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Long转String注解，解决前端JavaScript处理Long类型精度丢失问题
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