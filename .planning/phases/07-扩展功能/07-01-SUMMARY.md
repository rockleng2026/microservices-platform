# Plan 07-01 Summary: Redis Lua Atomic Stock Pre-allocation

## Objective
Implement Redis Lua atomic stock pre-allocation to eliminate the race condition in `preAllocateStock`.

## What Was Built

**StockServiceImpl.java** - Modified to use Spring Data Redis `DefaultRedisScript` for atomic Lua script execution:

- **Lua script** (`LUA_PREALLOCATE_SCRIPT`): Atomic decrement with check — GET → compare → DECRBY → return remaining stock (or -1 if insufficient)
- **Spring Data Redis scripting**: Uses `redisTemplate.execute(LUA_SCRIPT, List.of(stockKey), String.valueOf(quantity))` instead of the broken Redisson `org.redisson.client.script.*` API (which does not exist in Redisson 3.25.0)
- **Race condition eliminated**: The entire decrement-check-rollback now happens atomically on the Redis server via Lua script

### Key Change

**Before (race condition window):**
```java
Long stockAfterDecr = redisTemplate.opsForValue().decrement(stockKey, quantity);
if (stockAfterDecr != null && stockAfterDecr < 0) {
    redisTemplate.opsForValue().increment(stockKey, quantity); // rollback
    return false;
}
```

**After (atomic):**
```java
Long luaResult = redisTemplate.execute(LUA_SCRIPT, List.of(stockKey), String.valueOf(quantity));
if (luaResult != null && luaResult < 0) {
    log.warn("Stock insufficient for SKU {}: requested {}", skuId, quantity);
    return false;
}
```

## Files Modified

- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/StockServiceImpl.java`

## Commits

- `b99624d52` - fix(7-01): use Spring Data Redis scripting instead of broken Redisson API

## Verification

- `mvn compile -f zlt-business/mall-center/pom.xml` passes ✓
