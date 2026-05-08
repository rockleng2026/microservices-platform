package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallEvaluateMapper;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.mapper.MallOrderItemMapper;
import com.central.mall.mapper.MallOrderMapper;
import com.central.mall.model.dto.EvaluateDTO;
import com.central.mall.model.dto.EvaluateListDTO;
import com.central.mall.model.entity.MallEvaluate;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallOrder;
import com.central.mall.model.entity.MallOrderItem;
import com.central.mall.service.IEvaluateService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluateServiceImpl implements IEvaluateService {

    private final MallEvaluateMapper evaluateMapper;
    private final MallOrderMapper orderMapper;
    private final MallOrderItemMapper orderItemMapper;
    private final MallGoodsMapper goodsMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean submitEvaluate(Long userId, EvaluateDTO dto) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        // 1. Validate order exists and belongs to user
        MallOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null || !userId.equals(order.getUserId())) {
            throw new RuntimeException("订单不存在");
        }

        // 2. Validate order status == 4 (completed)
        if (order.getStatus() != 4) {
            throw new RuntimeException("订单未完成，无法评价");
        }

        // 3. Validate orderItemId belongs to order
        MallOrderItem orderItem = orderItemMapper.selectById(dto.getOrderItemId());
        if (orderItem == null || !dto.getOrderId().equals(orderItem.getOrderId())) {
            throw new RuntimeException("订单项不匹配");
        }

        // 4. Check not already evaluated (unique constraint on orderItemId)
        LambdaQueryWrapper<MallEvaluate> checkWrapper = new LambdaQueryWrapper<>();
        checkWrapper.eq(MallEvaluate::getOrderItemId, dto.getOrderItemId());
        if (evaluateMapper.selectCount(checkWrapper) > 0) {
            throw new RuntimeException("已评价过此商品");
        }

        // 5. Insert evaluation
        MallEvaluate evaluate = new MallEvaluate();
        evaluate.setTenantId(tenantId);
        evaluate.setOrderId(dto.getOrderId());
        evaluate.setOrderItemId(dto.getOrderItemId());
        evaluate.setGoodsId(dto.getGoodsId());
        evaluate.setUserId(userId);
        evaluate.setStar(dto.getStar());
        evaluate.setContent(dto.getContent());
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            try {
                evaluate.setImages(objectMapper.writeValueAsString(dto.getImages()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize images", e);
            }
        }
        evaluate.setCreateTime(LocalDateTime.now());
        evaluate.setUpdateTime(LocalDateTime.now());
        evaluateMapper.insert(evaluate);

        return true;
    }

    @Override
    public IPage<EvaluateListDTO> listUserEvaluates(Long userId, Integer page, Integer pageSize) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        LambdaQueryWrapper<MallEvaluate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallEvaluate::getUserId, userId)
                .orderByDesc(MallEvaluate::getCreateTime);

        IPage<MallEvaluate> evaluatePage = evaluateMapper.selectPage(
                new Page<>(page, pageSize), wrapper);

        return convertToListDTO(evaluatePage);
    }

    @Override
    public IPage<EvaluateListDTO> listGoodsEvaluates(Long goodsId, Integer page, Integer pageSize) {
        LambdaQueryWrapper<MallEvaluate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallEvaluate::getGoodsId, goodsId)
                .orderByDesc(MallEvaluate::getCreateTime);

        IPage<MallEvaluate> evaluatePage = evaluateMapper.selectPage(
                new Page<>(page, pageSize), wrapper);

        return convertToListDTO(evaluatePage);
    }

    private IPage<EvaluateListDTO> convertToListDTO(IPage<MallEvaluate> evaluatePage) {
        // Get goods names
        List<Long> goodsIds = evaluatePage.getRecords().stream()
                .map(MallEvaluate::getGoodsId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, String> goodsNameMap = goodsIds.isEmpty() ? Map.of() :
                goodsMapper.selectBatchIds(goodsIds).stream()
                        .collect(Collectors.toMap(MallGoods::getId, MallGoods::getName));

        IPage<EvaluateListDTO> result = new Page<>(
                evaluatePage.getCurrent(),
                evaluatePage.getSize(),
                evaluatePage.getTotal());

        result.setRecords(evaluatePage.getRecords().stream()
                .map(eval -> {
                    EvaluateListDTO dto = new EvaluateListDTO();
                    dto.setId(eval.getId());
                    dto.setOrderId(eval.getOrderId());
                    dto.setOrderItemId(eval.getOrderItemId());
                    dto.setGoodsId(eval.getGoodsId());
                    dto.setUserId(eval.getUserId());
                    dto.setStar(eval.getStar());
                    dto.setContent(eval.getContent());
                    if (StringUtils.hasText(eval.getImages())) {
                        try {
                            dto.setImages(objectMapper.readValue(eval.getImages(),
                                    new TypeReference<List<String>>() {}));
                        } catch (JsonProcessingException ex) {
                            dto.setImages(List.of());
                        }
                    } else {
                        dto.setImages(List.of());
                    }
                    dto.setGoodsName(goodsNameMap.getOrDefault(eval.getGoodsId(), ""));
                    dto.setUserNickname("匿名用户");
                    dto.setCreateTime(eval.getCreateTime());
                    return dto;
                })
                .collect(Collectors.toList()));

        return result;
    }
}