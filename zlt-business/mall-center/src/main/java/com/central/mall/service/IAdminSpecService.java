package com.central.mall.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.dto.SpecDTO;

import java.util.List;

public interface IAdminSpecService extends IService<Object> {

    /**
     * Get all specs with their values
     */
    List<SpecDTO> getSpecList();

    /**
     * Create new spec definition, return specId
     */
    Long addSpec(String specName);

    /**
     * Add value to spec's value pool
     */
    Long addSpecValue(Long specId, String specValue);

    /**
     * Delete spec and all its values
     */
    boolean deleteSpec(Long specId);

    /**
     * Delete single spec value
     */
    boolean deleteSpecValue(Long valueId);
}
