package com.central.mall.model.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class LogisticsTrackDTO {
    private Long orderId;
    private String waybillNo;
    private String expressCode;
    private String expressName;
    private Integer status;           // 0=pending, 1=in_transit, 2=delivered, 3=returned, 4=exception
    private String statusDesc;        // "待发货"/"在途"/"签收"/"退回"/"异常"
    private List<LogisticsTrace> traces;
    private LocalDateTime lastUpdateTime;

    @Data
    public static class LogisticsTrace {
        private String time;
        private String location;
        private String description;
    }
}