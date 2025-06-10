package com.central.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.system.model.OperationLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 操作日志Mapper接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {

    /**
     * 分页查询操作日志
     * 
     * @param page 分页参数
     * @param module 操作模块
     * @param operation 操作类型
     * @param userName 操作用户
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 日志列表
     */
        Page<OperationLog> selectLogPage(Page<OperationLog> page,
                                     @Param("module") String module,
                                     @Param("operation") String operation,
                                     @Param("userName") String userName,
                                     @Param("startTime") Date startTime,
                                     @Param("endTime") Date endTime);

    /**
     * 获取操作统计数据
     * 
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    List<Map<String, Object>> getOperationStatistics(@Param("startTime") Date startTime,
                                                     @Param("endTime") Date endTime);

    /**
     * 获取用户操作统计
     * 
     * @param userId 用户ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作数量
     */
    int countUserOperations(@Param("userId") Long userId,
                           @Param("startTime") Date startTime,
                           @Param("endTime") Date endTime);

    /**
     * 清理历史日志
     * 
     * @param beforeTime 时间点之前的日志将被清理
     * @return 清理数量
     */
    int cleanHistoryLogs(@Param("beforeTime") Date beforeTime);
} 