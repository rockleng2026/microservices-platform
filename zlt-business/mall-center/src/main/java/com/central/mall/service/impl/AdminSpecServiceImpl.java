package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallSpecMapper;
import com.central.mall.mapper.MallSpecValueMapper;
import com.central.mall.model.dto.SpecDTO;
import com.central.mall.model.dto.SpecValueDTO;
import com.central.mall.model.entity.MallSpec;
import com.central.mall.model.entity.MallSpecValue;
import com.central.mall.service.IAdminSpecService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSpecServiceImpl extends ServiceImpl<MallSpecMapper, MallSpec> implements IAdminSpecService {

    private final MallSpecMapper specMapper;
    private final MallSpecValueMapper specValueMapper;

    @Override
    public List<SpecDTO> getSpecList() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LambdaQueryWrapper<MallSpec> specWrapper = new LambdaQueryWrapper<>();
        specWrapper.eq(MallSpec::getTenantId, tenantId);
        List<MallSpec> specs = baseMapper.selectList(specWrapper);

        return specs.stream().map(spec -> {
            SpecDTO dto = new SpecDTO();
            dto.setId(spec.getId());
            dto.setSpecName(spec.getSpecName());

            LambdaQueryWrapper<MallSpecValue> valueWrapper = new LambdaQueryWrapper<>();
            valueWrapper.eq(MallSpecValue::getSpecId, spec.getId());
            List<MallSpecValue> values = specValueMapper.selectList(valueWrapper);

            dto.setValues(values.stream().map(v -> {
                SpecValueDTO valueDTO = new SpecValueDTO();
                valueDTO.setId(v.getId());
                valueDTO.setSpecValue(v.getSpecValue());
                return valueDTO;
            }).collect(Collectors.toList()));

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public Long addSpec(String specName) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LocalDateTime now = LocalDateTime.now();
        MallSpec spec = new MallSpec();
        spec.setTenantId(tenantId);
        spec.setSpecName(specName);
        spec.setCreateTime(now);
        baseMapper.insert(spec);
        return spec.getId();
    }

    @Override
    public Long addSpecValue(Long specId, String specValue) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LocalDateTime now = LocalDateTime.now();
        MallSpecValue value = new MallSpecValue();
        value.setTenantId(tenantId);
        value.setSpecId(specId);
        value.setSpecValue(specValue);
        value.setCreateTime(now);
        specValueMapper.insert(value);
        return value.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteSpec(Long specId) {
        LambdaQueryWrapper<MallSpecValue> valueWrapper = new LambdaQueryWrapper<>();
        valueWrapper.eq(MallSpecValue::getSpecId, specId);
        specValueMapper.delete(valueWrapper);

        int deleted = baseMapper.deleteById(specId);
        return deleted > 0;
    }

    @Override
    public boolean deleteSpecValue(Long valueId) {
        int deleted = specValueMapper.deleteById(valueId);
        return deleted > 0;
    }
}
