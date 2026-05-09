# Phase 7: 扩展功能 - Pattern Map

**Mapped:** 2026-05-08
**Files analyzed:** 12 new/modified files
**Analogs found:** 12 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `StockServiceImpl.java` (MODIFIED) | service | request-response | Same file - current implementation | exact |
| `MallMerchant.java` (NEW) | entity | CRUD | `MallGoods.java` | role-match |
| `MallMerchantMapper.java` (NEW) | mapper | CRUD | `MallGoodsMapper.java` | role-match |
| `IMerchantService.java` (NEW) | service | CRUD | `IAdminGoodsService.java` | role-match |
| `MerchantServiceImpl.java` (NEW) | service | CRUD | `AdminGoodsServiceImpl.java` | role-match |
| `AdminMerchantController.java` (NEW) | controller | request-response | `AdminGoodsController.java` | role-match |
| `MerchantDTO.java` (NEW) | DTO | request-response | `AdminGoodsDTO.java` | role-match |
| `WeChatTemplateMsgUtil.java` (NEW) | utility | external-API | `WeChatPayUtil.java` | role-match |
| `MallOrder.java` (MODIFIED) | entity | CRUD | Same entity | exact |
| `PayServiceImpl.java` (MODIFIED) | service | request-response | Same service | exact |
| `OrderServiceImpl.java` (MODIFIED) | service | request-response | Same service | exact |
| `MallDelivery.java` (MODIFIED) | entity | CRUD | Same entity | exact |

## Pattern Assignments

### `StockServiceImpl.java` (service, request-response) - MODIFIED

**Analog:** Same file - current non-atomic implementation (lines 32-78)

**Imports pattern** (lines 1-19):
```java
package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallGoodsSkuMapper;
import com.central.mall.mapper.MallStockLogMapper;
import com.central.mall.model.entity.MallGoodsSku;
import com.central.mall.model.entity.MallStockLog;
import com.central.mall.service.IStockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
```

**Tenant context pattern** (line 35):
```java
String tenantId = TenantInterceptor.getCurrentTenantId();
```

**Core preAllocateStock pattern to REPLACE** (lines 48-58 - non-atomic, race condition):
```java
// Atomic decrement
String stockKey = SKU_STOCK_KEY_PREFIX + skuId;
Long stockAfterDecr = redisTemplate.opsForValue().decrement(stockKey, quantity);

if (stockAfterDecr != null && stockAfterDecr < 0) {
    // Rollback the decrement
    redisTemplate.opsForValue().increment(stockKey, quantity);
    log.warn("Stock insufficient for SKU {}: requested {}, available before: {}",
            skuId, quantity, stockAfterDecr + quantity);
    return false;
}
```

**Lua atomic pre-allocation pattern to ADD** (from RESEARCH.md, lines 144-157):
```java
// Lua script for atomic stock pre-allocation
// KEYS[1]: stock key (e.g., "sku:stock:123")
// ARGV[1]: quantity to pre-allocate
// Returns: remaining stock after allocation, or -1 if insufficient/not found
local stock = redis.call('GET', KEYS[1])
if stock == false then
    return -1
end
local current = tonumber(stock)
local quantity = tonumber(ARGV[1])
if current < quantity then
    return -1
end
local remaining = current - quantity
redis.call('DECRBY', KEYS[1], quantity)
return remaining
```

**Redisson RScript invocation pattern** (from RESEARCH.md lines 160-189):
```java
@Autowired
private RedissonClient redisson;

public boolean preAllocateStock(Long orderId, List<Map<String, Object>> items) {
    RScript<Integer> script = redisson.getScript();
    for (Map<String, Object> item : items) {
        Long skuId = Long.valueOf(item.get("skuId").toString());
        Integer quantity = Integer.valueOf(item.get("quantity").toString());
        
        String stockKey = SKU_STOCK_KEY_PREFIX + skuId;
        Integer result = script.evalReadOnly(
            RScriptScriptSource.fromString(LUA_PREALLOCATE_SCRIPT),
            RScriptReturnType.INTEGER,
            List.of(stockKey),
            quantity
        );
        
        if (result != null && result < 0) {
            log.warn("Stock insufficient for SKU {}: requested {}", skuId, quantity);
            return false;
        }
    }
    return true;
}
```

---

### `MallMerchant.java` (entity, CRUD) - NEW

**Analog:** `MallGoods.java`

**Entity pattern** (lines 1-33):
```java
package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("mall_merchant")
public class MallMerchant {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;           // Merchant's assigned tenant_id (e.g., "MERCHANT_001")
    private String merchantName;       // Business name
    private String contactName;        // Contact person
    private String contactPhone;       // Contact phone
    private String businessLicenseUrl; // Business license image URL
    private Integer status;            // 0=pending, 1=approved, 2=rejected
    private String rejectReason;       // Rejection reason if rejected
    private LocalDateTime applyTime;   // Application time
    private LocalDateTime reviewTime;   // Review time
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

---

### `MallMerchantMapper.java` (mapper, CRUD) - NEW

**Analog:** `MallGoodsMapper.java`

**Mapper pattern** (lines 1-8):
```java
package com.central.mall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.mall.model.entity.MallMerchant;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MallMerchantMapper extends BaseMapper<MallMerchant> {
}
```

---

### `IMerchantService.java` (service interface, CRUD) - NEW

**Analog:** `IAdminGoodsService.java`

**Service interface pattern** (lines 1-51):
```java
package com.central.mall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.dto.MerchantDTO;
import com.central.mall.model.entity.MallMerchant;

import java.util.Map;

public interface IMerchantService extends IService<MallMerchant> {

    /**
     * Merchant application list with filters (admin)
     */
    IPage<MerchantDTO> getMerchantPage(IPage<MerchantDTO> page, Map<String, Object> params);

    /**
     * Full merchant detail
     */
    MerchantDTO getMerchantDetail(Long id);

    /**
     * Register new merchant (creates tenant)
     */
    boolean registerMerchant(MerchantDTO dto);

    /**
     * Review merchant application (approve/reject)
     */
    boolean reviewMerchant(Long id, Integer status, String rejectReason);

    /**
     * Get merchant by tenantId
     */
    MallMerchant getByTenantId(String tenantId);
}
```

---

### `MerchantServiceImpl.java` (service, CRUD) - NEW

**Analog:** `AdminGoodsServiceImpl.java`

**Imports pattern** (lines 1-27):
```java
package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallMerchantMapper;
import com.central.mall.model.dto.MerchantDTO;
import com.central.mall.model.entity.MallMerchant;
import com.central.mall.service.IMerchantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
```

**Tenant-aware query pattern** (from AdminGoodsServiceImpl lines 38-41):
```java
@Override
public IPage<MerchantDTO> getMerchantPage(IPage<MerchantDTO> page, Map<String, Object> params) {
    LambdaQueryWrapper<MallMerchant> wrapper = new LambdaQueryWrapper<>();
    String tenantId = TenantInterceptor.getCurrentTenantId();
    wrapper.eq(MallMerchant::getTenantId, tenantId);
    // ...
}
```

**Publish/create pattern** (from AdminGoodsServiceImpl lines 78-99):
```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean publishGoods(AdminGoodsDTO dto) {
    String tenantId = TenantInterceptor.getCurrentTenantId();
    LocalDateTime now = LocalDateTime.now();
    MallGoods goods = new MallGoods();
    goods.setTenantId(tenantId);
    // ... set fields from dto
    goods.setDelFlag(0);
    goods.setCreateTime(now);
    goods.setUpdateTime(now);
    baseMapper.insert(goods);
    // ...
}
```

---

### `AdminMerchantController.java` (controller, request-response) - NEW

**Analog:** `AdminGoodsController.java`

**Controller pattern** (lines 1-126):
```java
package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.mall.model.dto.MerchantDTO;
import com.central.mall.service.IMerchantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mall/admin/merchant")
@RequiredArgsConstructor
@Tag(name = "管理员-商户管理")
@Validated
public class AdminMerchantController {

    private final IMerchantService merchantService;

    @GetMapping("/list")
    @Operation(summary = "商户列表（分页）")
    public Result<IPage<MerchantDTO>> getMerchantPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword) {
        // ... implementation
    }

    @GetMapping("/{id}")
    @Operation(summary = "商户详情")
    public Result<MerchantDTO> getMerchantDetail(@PathVariable Long id) {
        MerchantDTO merchant = merchantService.getMerchantDetail(id);
        if (merchant == null) {
            return Result.failed("商户不存在");
        }
        return Result.succeed(merchant);
    }

    @PostMapping("/review/{id}")
    @Operation(summary = "审核商户")
    public Result<Boolean> reviewMerchant(@PathVariable Long id, @RequestBody @Validated MerchantReviewDTO dto) {
        boolean result = merchantService.reviewMerchant(id, dto.getStatus(), dto.getRejectReason());
        return result ? Result.succeed(true, "审核成功") : Result.failed("审核失败");
    }
}
```

---

### `MerchantDTO.java` (DTO, request-response) - NEW

**Analog:** `AdminGoodsDTO.java`

**DTO pattern** (lines 1-26):
```java
package com.central.mall.model.dto;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MerchantDTO implements Serializable {
    private Long id;
    private String tenantId;
    private String merchantName;
    private String contactName;
    private String contactPhone;
    private String businessLicenseUrl;
    private Integer status;
    private String rejectReason;
    private LocalDateTime applyTime;
    private LocalDateTime reviewTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

---

### `WeChatTemplateMsgUtil.java` (utility, external-API) - NEW

**Analog:** `WeChatPayUtil.java`

**WeChat API call pattern** (from PayServiceImpl lines 254-275):
```java
private String sendRequest(String url, Map<String, String> params) {
    try {
        // Build XML request body
        StringBuilder xmlBuilder = new StringBuilder("<xml>");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            xmlBuilder.append("<").append(entry.getKey()).append("><![CDATA[")
                    .append(entry.getValue()).append("]]></").append(entry.getKey()).append(">");
        }
        xmlBuilder.append("</xml>");

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_XML);

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(xmlBuilder.toString(), headers);
        org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        return response.getBody();
    } catch (Exception e) {
        log.error("Error sending request to WeChat Pay API", e);
        throw new RuntimeException("Failed to call WeChat Pay API", e);
    }
}
```

**Template message send pattern** (from RESEARCH.md lines 328-365):
```java
public boolean sendTemplateMessage(String openid, String templateId, String page, Map<String, String> data) {
    String url = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send";
    
    Map<String, Object> body = new HashMap<>();
    body.put("touser", openid);
    body.put("template_id", templateId);
    body.put("page", page);
    body.put("miniprogram_state", "developer");
    body.put("lang", "zh_CN");
    
    // data format: { "key1": { "value": "content" }, ... }
    Map<String, Map<String, String>> dataMap = new HashMap<>();
    for (Map.Entry<String, String> entry : data.entrySet()) {
        Map<String, String> item = new HashMap<>();
        item.put("value", entry.getValue());
        dataMap.put(entry.getKey(), item);
    }
    body.put("data", dataMap);
    
    // Use access_token from cache
    String token = weChatAccessTokenService.getAccessToken();
    String fullUrl = url + "?access_token=" + token;
    
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
    
    ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);
    Map<String, Object> result = objectMapper.readValue(response.getBody(), Map.class);
    
    return "0".equals(String.valueOf(result.get("errcode")));
}
```

---

### `MallOrder.java` (entity, CRUD) - MODIFIED

**Analog:** Same entity - add openid field

**Field to add** (after line 18 - addressId):
```java
private String openid;  // User's openid for WeChat template messages
```

**Status constants pattern** (lines 25-33):
```java
// Status constants
public static final Integer STATUS_PENDING = 1;
public static final Integer STATUS_PAID = 2;
public static final Integer STATUS_SHIPPED = 3;
public static final Integer STATUS_COMPLETED = 4;
public static final Integer STATUS_CANCELLED = 5;
public static final Integer STATUS_REFUNDING = 6;
public static final Integer STATUS_REFUNDED = 7;
public static final Integer STATUS_CLOSED = 8;
```

---

### `PayServiceImpl.java` (service, request-response) - MODIFIED

**Analog:** Same service - add WeChatTemplateMsgUtil call on payment success

**Integration point pattern** (from PayServiceImpl lines 107-148 - processPayCallback):
```java
@Override
public boolean processPayCallback(String xmlData) {
    try {
        // Verify signature
        if (apiKey != null && !apiKey.isEmpty()) {
            if (!WeChatPayUtil.verifySignature(xmlData, apiKey)) {
                log.error("WeChat Pay callback signature verification failed");
                return false;
            }
        }

        // Parse callback data
        Map<String, String> callbackData = WeChatPayUtil.parseXml(xmlData);

        if (!"SUCCESS".equals(callbackData.get("result_code"))) {
            log.error("WeChat Pay callback result failed: {}", callbackData.get("err_code_des"));
            return false;
        }

        String orderNo = callbackData.get("out_trade_no");
        String transactionId = callbackData.get("transaction_id");

        // Find order by orderNo
        LambdaQueryWrapper<MallOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallOrder::getOrderNo, orderNo);
        MallOrder order = orderMapper.selectOne(wrapper);

        if (order == null) {
            log.error("Order not found for callback: {}", orderNo);
            return false;
        }

        // Update order as paid (will handle virtual goods auto-complete)
        orderService.updateOrderPaid(order.getId());

        // ADD: Send WeChat template message notification
        // WeChatTemplateMsgUtil.sendOrderNotify(order);

        log.info("WeChat Pay callback processed successfully: orderNo={}, transactionId={}", orderNo, transactionId);
        return true;

    } catch (Exception e) {
        log.error("Error processing WeChat Pay callback", e);
        return false;
    }
}
```

---

### `OrderServiceImpl.java` (service, request-response) - MODIFIED

**Analog:** Same service - add WeChatTemplateMsgUtil call on shipping

**Integration point pattern** (from OrderServiceImpl lines 264-293 - shipOrder):
```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean shipOrder(Long orderId, String expressCode, String expressName, String waybillNo) {
    MallOrder order = baseMapper.selectById(orderId);
    if (order == null) {
        throw new RuntimeException("Order not found");
    }
    if (order.getStatus() != 2) { // 2=paid
        throw new RuntimeException("Only paid orders can be shipped");
    }

    // Create delivery record
    MallDelivery delivery = new MallDelivery();
    delivery.setTenantId(order.getTenantId());
    delivery.setOrderId(orderId);
    delivery.setExpressCode(expressCode);
    delivery.setExpressName(expressName);
    delivery.setWaybillNo(waybillNo);
    delivery.setShipTime(LocalDateTime.now());
    delivery.setCreateTime(LocalDateTime.now());
    delivery.setUpdateTime(LocalDateTime.now());
    deliveryMapper.insert(delivery);

    // Update order status
    order.setStatus(3); // 3=shipped
    order.setShipTime(LocalDateTime.now());
    order.setUpdateTime(LocalDateTime.now());
    baseMapper.updateById(order);

    // ADD: Send WeChat template message notification
    // WeChatTemplateMsgUtil.sendShippingNotify(order, expressName, waybillNo);

    return true;
}
```

---

### `MallDelivery.java` (entity, CRUD) - MODIFIED

**Analog:** Same entity - no structural changes needed for WeChat notification

**Existing pattern** (lines 1-22):
```java
@Data
@TableName("mall_delivery")
public class MallDelivery {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long orderId;
    private String expressCode;    // 物流编码
    private String expressName;    // 物流名称
    private String waybillNo;       // 运单号
    private LocalDateTime shipTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

---

## Shared Patterns

### Authentication / Tenant Context

**Source:** `TenantInterceptor.java` (lines 22-32)
**Apply to:** All service and controller files
```java
private static final String TENANT_HEADER = "x-tenant-header";
private static final ThreadLocal<String> TENANT_CONTEXT = new ThreadLocal<>();

@Override
public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    try {
        String tenantId = request.getHeader(TENANT_HEADER);
        if (tenantId != null && !tenantId.trim().isEmpty()) {
            TENANT_CONTEXT.set(tenantId.trim());
            log.debug("设置当前线程租户ID: {}", tenantId);
        }
        return true;
    } catch (Exception e) {
        log.error("处理租户信息时发生异常", e);
        return true;
    }
}

public static String getCurrentTenantId() {
    return TENANT_CONTEXT.get();
}
```

### WeChat API HTTP Calls

**Source:** `PayServiceImpl.java` (lines 254-275)
**Apply to:** `WeChatTemplateMsgUtil.java`
```java
private String sendRequest(String url, Map<String, String> params) {
    try {
        StringBuilder xmlBuilder = new StringBuilder("<xml>");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            xmlBuilder.append("<").append(entry.getKey()).append("><![CDATA[")
                    .append(entry.getValue()).append("]]></").append(entry.getKey()).append(">");
        }
        xmlBuilder.append("</xml>");

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_XML);

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(xmlBuilder.toString(), headers);
        org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        return response.getBody();
    } catch (Exception e) {
        log.error("Error sending request to WeChat Pay API", e);
        throw new RuntimeException("Failed to call WeChat Pay API", e);
    }
}
```

### RestTemplate Injection Pattern

**Source:** `PayServiceImpl.java` (line 40)
**Apply to:** `WeChatTemplateMsgUtil.java`
```java
private final RestTemplate restTemplate = new RestTemplate();
```

### ServiceImpl Base Pattern

**Source:** `AdminGoodsServiceImpl.java` (lines 28-35)
**Apply to:** `MerchantServiceImpl.java`
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminGoodsServiceImpl extends ServiceImpl<MallGoodsMapper, MallGoods> implements IAdminGoodsService {

    private final MallGoodsMapper goodsMapper;
    private final MallGoodsSkuMapper skuMapper;
    private final MallGoodsSpecMapper specMapper;
```

### Service Interface Pattern

**Source:** `IAdminGoodsService.java` (lines 1-51)
**Apply to:** `IMerchantService.java`
```java
public interface IAdminGoodsService extends IService<MallGoods> {
    IPage<AdminGoodsDTO> getGoodsPage(IPage<AdminGoodsDTO> page, Map<String, Object> params);
    AdminGoodsDTO getGoodsDetail(Long id);
    boolean publishGoods(AdminGoodsDTO dto);
    boolean updateGoods(AdminGoodsDTO dto);
    boolean deleteGoods(Long id);
    boolean updateStatus(Long id, Integer status);
    boolean batchUpdateStatus(java.util.List<Long> goodsIds, Integer status);
    Long cloneGoods(Long goodsId, Long newCategoryId, String newName);
}
```

### Controller Pattern

**Source:** `AdminGoodsController.java` (lines 1-126)
**Apply to:** `AdminMerchantController.java`
```java
@RestController
@RequestMapping("/api/mall/admin/merchant")
@RequiredArgsConstructor
@Tag(name = "管理员-商户管理")
@Validated
public class AdminMerchantController {
    private final IMerchantService merchantService;
    // ... endpoints
}
```

### DTO Pattern

**Source:** `AdminGoodsDTO.java` (lines 1-26)
**Apply to:** `MerchantDTO.java`
```java
@Data
public class AdminGoodsDTO implements Serializable {
    private Long id;
    // ... fields
}
```

### Mapper Pattern

**Source:** `MallGoodsMapper.java` (lines 1-8)
**Apply to:** `MallMerchantMapper.java`
```java
@Mapper
public interface MallGoodsMapper extends BaseMapper<MallGoods> {
}
```

### Entity Pattern

**Source:** `MallGoods.java` (lines 1-33)
**Apply to:** `MallMerchant.java`
```java
@Data
@TableName("mall_goods")
public class MallGoods {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    // ... fields
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer delFlag;
}
```

### Redis Key Constants Pattern

**Source:** `StockServiceImpl.java` (lines 25-26)
**Apply to:** `WeChatTemplateMsgUtil.java` (for token caching keys)
```java
private static final String SKU_STOCK_KEY_PREFIX = "sku:stock:";
private static final String ORDER_STOCK_LOCK_PREFIX = "order:stock:lock:";
```

### Transaction Pattern

**Source:** `AdminGoodsServiceImpl.java` (line 78)
**Apply to:** `MerchantServiceImpl.java`
```java
@Transactional(rollbackFor = Exception.class)
public boolean publishGoods(AdminGoodsDTO dto) {
```

---

## No Analog Found

None - all files have close matches in the codebase.

---

## Metadata

**Analog search scope:** `zlt-business/mall-center/src/main/java/com/central/mall/`
**Files scanned:** 42 service/impl files, 25 mapper files, 28 controller files, 12 entity files, 28 DTO files
**Pattern extraction date:** 2026-05-08
