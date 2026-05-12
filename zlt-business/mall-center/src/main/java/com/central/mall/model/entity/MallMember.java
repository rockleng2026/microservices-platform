package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 会员资料表
 */
@Data
@TableName("mall_member")
public class MallMember {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long userId;          // 用户ID
    private String nickname;      // 昵称
    private String avatar;        // 头像URL
    private String wxOpenId;      // 微信OpenId
    private String wxNickname;    // 微信昵称
    private String phone;         // 手机号
    private Integer gender;       // 性别:0=未知,1=男,2=女
    private LocalDate birthday;   // 生日
    private String province;      // 省份
    private String city;          // 城市
    private String remark;        // 备注
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
