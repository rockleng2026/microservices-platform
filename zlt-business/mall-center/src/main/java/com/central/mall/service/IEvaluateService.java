package com.central.mall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.mall.model.dto.EvaluateDTO;
import com.central.mall.model.dto.EvaluateListDTO;

public interface IEvaluateService {

    /**
     * Submit evaluation for a completed order item (EVAL-01)
     */
    boolean submitEvaluate(Long userId, EvaluateDTO dto);

    /**
     * Get user's evaluation history with pagination (EVAL-02)
     */
    IPage<EvaluateListDTO> listUserEvaluates(Long userId, Integer page, Integer pageSize);

    /**
     * Get goods evaluation list with pagination (EVAL-03)
     */
    IPage<EvaluateListDTO> listGoodsEvaluates(Long goodsId, Integer page, Integer pageSize);
}