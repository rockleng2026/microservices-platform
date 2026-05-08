package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.mapper.MallGoodsSkuMapper;
import com.central.mall.mapper.MallSettingsMapper;
import com.central.mall.mapper.MallStockLogMapper;
import com.central.mall.model.dto.SkuStockDTO;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallGoodsSku;
import com.central.mall.model.entity.MallSettings;
import com.central.mall.model.entity.MallStockLog;
import com.central.mall.service.IAdminStockService;
import com.central.mall.service.IStockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStockServiceImpl implements IAdminStockService {

    private final MallGoodsSkuMapper skuMapper;
    private final MallGoodsMapper goodsMapper;
    private final MallStockLogMapper stockLogMapper;
    private final MallSettingsMapper settingsMapper;
    private final IStockService stockService;

    @Override
    public IPage<SkuStockDTO> getSkuStockPage(IPage<SkuStockDTO> page, Map<String, Object> params) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        Integer threshold = getStockThreshold();

        LambdaQueryWrapper<MallGoodsSku> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallGoodsSku::getTenantId, tenantId);

        // Filter by goodsId
        if (params.get("goodsId") != null && StringUtils.isNotBlank(params.get("goodsId").toString())) {
            Long goodsId = Long.parseLong(params.get("goodsId").toString());
            wrapper.eq(MallGoodsSku::getGoodsId, goodsId);
        }

        // Filter by keyword (goodsName or skuCode)
        if (params.get("keyword") != null && StringUtils.isNotBlank(params.get("keyword").toString())) {
            String keyword = params.get("keyword").toString();
            // Need to join with MallGoods for goodsName - use sub-query
            wrapper.inSql(MallGoodsSku::getGoodsId,
                "SELECT id FROM mall_goods WHERE tenant_id = '" + tenantId + "' AND del_flag = 0 AND (name LIKE '%" + keyword + "%' OR sub_title LIKE '%" + keyword + "%')");
        }

        wrapper.orderByDesc(MallGoodsSku::getUpdateTime);
        IPage<MallGoodsSku> skuPage = skuMapper.selectPage(new Page<>(page.getCurrent(), page.getSize()), wrapper);

        // Get goods names
        List<Long> goodsIds = skuPage.getRecords().stream()
                .map(MallGoodsSku::getGoodsId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> goodsNameMap = goodsMapper.selectBatchIds(goodsIds).stream()
                .collect(Collectors.toMap(MallGoods::getId, MallGoods::getName));

        IPage<SkuStockDTO> result = new Page<>(skuPage.getCurrent(), skuPage.getSize(), skuPage.getTotal());
        result.setRecords(skuPage.getRecords().stream().map(sku -> convertToDTO(sku, goodsNameMap, threshold)).collect(Collectors.toList()));
        return result;
    }

    @Override
    public SkuStockDTO getSkuStockDetail(Long skuId) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        Integer threshold = getStockThreshold();

        MallGoodsSku sku = skuMapper.selectById(skuId);
        if (sku == null || !tenantId.equals(sku.getTenantId())) {
            return null;
        }

        MallGoods goods = goodsMapper.selectById(sku.getGoodsId());
        SkuStockDTO dto = convertToDTO(sku, Map.of(goods.getId(), goods.getName()), threshold);

        // Get last stock change info from logs
        LambdaQueryWrapper<MallStockLog> logWrapper = new LambdaQueryWrapper<>();
        logWrapper.eq(MallStockLog::getSkuId, skuId)
                .orderByDesc(MallStockLog::getCreateTime)
                .last("LIMIT 1");
        MallStockLog lastLog = stockLogMapper.selectOne(logWrapper);
        if (lastLog != null) {
            dto.setLastStockChangeTime(lastLog.getCreateTime());
            dto.setLastStockChangeType(getOperationTypeName(lastLog.getOperationType()));
        }

        return dto;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean correctStock(Long skuId, Integer change, String operator, String remark) {
        // Use existing IStockService.correctStock which handles DB update, Redis sync, and stock log
        boolean success = stockService.correctStock(skuId, change, operator, remark);

        if (success) {
            // Check threshold and log alert (STOCK-06)
            sendStockAlert(skuId);
        }

        return success;
    }

    @Override
    public Integer getStockThreshold() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LambdaQueryWrapper<MallSettings> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallSettings::getTenantId, tenantId)
                .eq(MallSettings::getSettingKey, "stock_alert_threshold");
        MallSettings settings = settingsMapper.selectOne(wrapper);
        if (settings != null && settings.getSettingValue() != null) {
            try {
                return Integer.parseInt(settings.getSettingValue());
            } catch (NumberFormatException e) {
                // Ignore
            }
        }
        return 10; // Default threshold
    }

    @Override
    public List<SkuStockDTO> getStockAlertList() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        Integer threshold = getStockThreshold();

        LambdaQueryWrapper<MallGoodsSku> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallGoodsSku::getTenantId, tenantId)
                .ge(MallGoodsSku::getStock, 0)  // Exclude unlimited (-1)
                .le(MallGoodsSku::getStock, threshold);
        List<MallGoodsSku> alertSkus = skuMapper.selectList(wrapper);

        // Get goods names
        List<Long> goodsIds = alertSkus.stream()
                .map(MallGoodsSku::getGoodsId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> goodsNameMap = goodsIds.isEmpty() ? Map.of() :
                goodsMapper.selectBatchIds(goodsIds).stream()
                        .collect(Collectors.toMap(MallGoods::getId, MallGoods::getName));

        return alertSkus.stream()
                .map(sku -> convertToDTO(sku, goodsNameMap, threshold))
                .collect(Collectors.toList());
    }

    private SkuStockDTO convertToDTO(MallGoodsSku sku, Map<Long, String> goodsNameMap, Integer threshold) {
        SkuStockDTO dto = new SkuStockDTO();
        dto.setId(sku.getId());
        dto.setSkuId(sku.getId());
        dto.setGoodsId(sku.getGoodsId());
        dto.setGoodsName(goodsNameMap.getOrDefault(sku.getGoodsId(), ""));
        dto.setSkuCode(sku.getSkuCode());
        dto.setSpecs(sku.getSpecs());
        dto.setPrice(sku.getPrice());
        dto.setStock(sku.getStock());
        dto.setRealStock(sku.getStock()); // Redis and DB should be in sync

        // Determine stock status
        if (sku.getStock() != null && sku.getStock() == -1) {
            dto.setStockStatus("无限制");
            dto.setThreshold(-1);
        } else {
            dto.setThreshold(threshold);
            if (sku.getStock() != null && sku.getStock() <= threshold) {
                dto.setStockStatus("预警");
            } else {
                dto.setStockStatus("正常");
            }
        }

        return dto;
    }

    private void sendStockAlert(Long skuId) {
        Integer threshold = getStockThreshold();
        Integer currentStock = stockService.getCurrentStock(skuId);

        if (currentStock != null && currentStock != -1 && currentStock <= threshold) {
            log.warn("Stock alert: SKU {} stock {} below threshold {}", skuId, currentStock, threshold);
            // Actual notification (email/SMS/WeChat) depends on Phase 4 notification system
            // For now, just log the alert
        }
    }

    private String getOperationTypeName(Integer operationType) {
        if (operationType == null) return "未知";
        return switch (operationType) {
            case 1 -> "预占";
            case 2 -> "真实扣减";
            case 3 -> "释放/回滚";
            case 4 -> "手动修正";
            default -> "未知";
        };
    }
}