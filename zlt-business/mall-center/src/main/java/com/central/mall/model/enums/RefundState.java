package com.central.mall.model.enums;

import java.util.Arrays;

/**
 * 退款状态枚举
 */
public enum RefundState {
    PENDING_AUDIT(1, "待审核"),
    AUDIT_PASSED(2, "审核通过"),
    AUDIT_REJECTED(3, "审核拒绝"),
    REFUNDING(4, "退款中"),
    REFUND_SUCCESS(5, "已完成"),
    REFUND_FAILED(6, "已关闭");

    private final Integer code;
    private final String desc;

    RefundState(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public Integer getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }

    public static RefundState fromCode(Integer code) {
        if (code == null) return null;
        return Arrays.stream(values())
                .filter(s -> s.code.equals(code))
                .findFirst()
                .orElse(null);
    }

    /**
     * 判断是否可以从 from 状态转换到 to 状态
     */
    public static boolean canTransition(Integer fromCode, Integer toCode) {
        if (fromCode == null || toCode == null) return false;
        RefundState from = fromCode(fromCode);
        RefundState to = fromCode(toCode);
        if (from == null || to == null) return false;

        return switch (from) {
            case PENDING_AUDIT -> to == AUDIT_PASSED || to == AUDIT_REJECTED;
            case AUDIT_PASSED -> to == REFUNDING;
            case REFUNDING -> to == REFUND_SUCCESS || to == REFUND_FAILED;
            default -> false;
        };
    }
}
