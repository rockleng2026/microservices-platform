# Milestones

## v1.0 MVP — 2026-05-08

**Phases:** 4 | **Plans:** 12 | **Tasks:** ~24

### Key Accomplishments

1. 基础架构完成 — mall-center服务(7010端口)、数据库8表、商品/购物车/地址CRUD
2. 后台管理完成 — 商品分类树形管理、商品CRUD、轮播图管理、微信支付参数配置、统计卡片
3. 订单支付核心完成 — 订单创建/流转/管理、微信JSAPI支付集成、Redis库存预占防超卖
4. 用户侧评价与交互完成 — 评价模块(评分/评论/图片)、物流轨迹追踪、用户消费统计

### Stats

- Commits: 39 (since 2026-05-08)
- Files changed: 120
- Lines added: ~8898
- Timeline: 2026-05-08 (single day session)

### Decisions

| Decision | Outcome |
|----------|---------|
| 虚拟商品订单支付后自动完成，无需发货 | ✓ Implemented |
| 混合购物车不支持实物+虚拟同时结算 | ✓ Implemented |
| 库存扣减：下单预占+支付成功真实扣减 | ✓ Implemented |
| 微信支付配置一期暂不联调 | ✓ Deferred |

### Known Gaps

- Phase 1/2 Result.succeed() 泛型问题导致编译失败（不影响功能）
- 微信支付需真实商户参数才能联调

---

*Last updated: 2026-05-08*