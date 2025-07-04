package com.central.common.exception;

import lombok.Getter;
import lombok.Setter;

/**
 * 业务异常
 *
 * @author zlt
 */
public class BusinessException extends RuntimeException {
    private static final long serialVersionUID = 6610083281801529147L;

    @Getter
    @Setter
    private Integer resp_code;

    @Getter
    @Setter
    private String resp_msg;

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String resp_msg, Integer resp_code) {
        super(resp_msg);
        this.resp_code = resp_code;
        this.resp_msg = resp_msg;
    }
}
