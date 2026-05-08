package com.central.mall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.mall.model.dto.UserListDTO;
import com.central.mall.model.vo.UserStatisticsVO;

public interface IAdminUserService {

    /**
     * Get paginated user list with consumption stats (USER-04)
     */
    IPage<UserListDTO> getUserPage(Long page, Long pageSize, String keyword);

    /**
     * Get user statistics including order count and consumption (USER-05)
     */
    UserStatisticsVO getUserStatistics(Long userId);
}