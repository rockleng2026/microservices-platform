package com.central.organization.utils;

import cn.hutool.core.util.IdUtil;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * ID生成和转换工具类
 * 解决前后端Long类型精度丢失问题
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
public class IdUtils {
    
    /**
     * 生成雪花算法ID
     * @return 唯一的长整型ID
     */
    public static Long generateId() {
        return IdUtil.getSnowflakeNextId();
    }
    
    /**
     * 生成雪花算法ID字符串
     * @return 唯一的ID字符串
     */
    public static String generateIdStr() {
        return String.valueOf(generateId());
    }
    
    /**
     * ID转字符串，避免前端精度丢失
     * @param id Long类型ID
     * @return String类型ID
     */
    public static String toIdString(Long id) {
        return id != null ? String.valueOf(id) : null;
    }
    
    /**
     * 字符串转ID
     * @param idStr 字符串ID
     * @return Long类型ID
     */
    public static Long toIdLong(String idStr) {
        try {
            return idStr != null && !idStr.trim().isEmpty() ? Long.valueOf(idStr) : null;
        } catch (NumberFormatException e) {
            log.warn("Invalid id string: {}", idStr);
            return null;
        }
    }
    
    /**
     * 字符串转ID (别名方法)
     * @param idStr 字符串ID
     * @return Long类型ID
     */
    public static Long stringToLong(String idStr) {
        return toIdLong(idStr);
    }
    
    /**
     * ID转字符串 (别名方法)
     * @param id Long类型ID
     * @return String类型ID
     */
    public static String longToString(Long id) {
        return toIdString(id);
    }
    
    /**
     * 生成下一个ID (别名方法)
     * @return 唯一的长整型ID
     */
    public static Long nextId() {
        return generateId();
    }
    
    /**
     * 自定义注解，标记需要序列化为字符串的Long类型字段
     */
    @Target({ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    @JsonSerialize(using = LongToStringSerializer.class)
    public @interface LongToString {
    }
    
    /**
     * Long转String序列化器
     */
    public static class LongToStringSerializer extends JsonSerializer<Long> {
        @Override
        public void serialize(Long value, JsonGenerator gen, SerializerProvider serializers) 
                throws IOException {
            if (value != null) {
                gen.writeString(value.toString());
            } else {
                gen.writeNull();
            }
        }
    }
} 