package com.central.multitable.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.multitable.mapper.MtFieldTypeDictMapper;
import com.central.multitable.model.MtFieldTypeDict;
import com.central.multitable.service.IMtFieldTypeDictService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 字段类型字典Service实现类
 *
 * @author multi-table-system
 */
@Slf4j
@Service
public class MtFieldTypeDictServiceImpl extends ServiceImpl<MtFieldTypeDictMapper, MtFieldTypeDict> implements IMtFieldTypeDictService {
    
    @Override
    public List<MtFieldTypeDict> findByCategory(String category) {
        return baseMapper.findByCategory(category);
    }
    
    @Override
    public MtFieldTypeDict findByTypeKey(String typeKey) {
        return baseMapper.findByTypeKey(typeKey);
    }
    
    @Override
    public List<MtFieldTypeDict> findAllEnabled() {
        return baseMapper.findAllEnabled();
    }
    
    @Override
    public Map<String, List<MtFieldTypeDict>> findGroupByCategory() {
        List<MtFieldTypeDict> allTypes = findAllEnabled();
        return allTypes.stream()
                .collect(Collectors.groupingBy(MtFieldTypeDict::getCategory));
    }
} 