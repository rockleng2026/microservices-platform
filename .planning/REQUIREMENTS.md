# Mall v2.0 Frontend Requirements

## Overview

This document defines frontend requirements for Mall v2.0, covering the **Admin Web** (React + Umi 4 + Ant Design Pro + TypeScript) and **Mini Program** (uni-app + Vue 3). UI design for each page must call `/gsd-ui-phase` before implementation.

All requirements are traced to existing validated backend APIs in `mall-center` (port 7010).

---

## Part 1: Admin Web Requirements

### Module: Dashboard (ADMIN-01)

| ID | Requirement |
|----|-------------|
| ADMIN-01-01 | Admin can view sales trend chart (daily/weekly/monthly orders and revenue) on Dashboard |
| ADMIN-01-02 | Admin can view inventory warning alerts (low-stock SKUs) on Dashboard |
| ADMIN-01-03 | Admin can view user statistics (new registrations, active users) on Dashboard |
| ADMIN-01-04 | Admin can view top-selling products ranking on Dashboard |
| ADMIN-01-05 | Admin can view today's key metrics cards (orders, revenue, visitors, conversion rate) on Dashboard |

### Module: Product Management (ADMIN-02)

| ID | Requirement |
|----|-------------|
| ADMIN-02-01 | Admin can create a new product with name, description, price, stock, category, images, and type (physical/virtual) |
| ADMIN-02-02 | Admin can edit existing product details |
| ADMIN-02-03 | Admin can delete a product (soft delete) |
| ADMIN-02-04 | Admin can view paginated product list with search and filter by category/status |
| ADMIN-02-05 | Admin can batch publish (enable) selected products |
| ADMIN-02-06 | Admin can batch unpublish (disable) selected products |
| ADMIN-02-07 | Admin can manage product categories: create, edit, delete, reorder |
| ADMIN-02-08 | Admin can upload product images via file-center integration |
| ADMIN-02-09 | Admin can set product specifications (size, color, etc.) and stock per spec |
| ADMIN-02-10 | Admin can view product detail page with full info and sales stats |

### Module: Order Management (ADMIN-03)

| ID | Requirement |
|----|-------------|
| ADMIN-03-01 | Admin can view paginated order list with filters: status, date range, order number, customer |
| ADMIN-03-02 | Admin can view order detail including items, customer info, payment, and delivery status |
| ADMIN-03-03 | Admin can modify order price (with audit reason recorded) |
| ADMIN-03-04 | Admin can add internal notes to an order |
| ADMIN-03-05 | Admin can close an order (with reason selected) |
| ADMIN-03-06 | Admin can view order status flow: Pending Pay -> Paid -> Shipped -> Delivered -> Completed |
| ADMIN-03-07 | Admin can trigger virtual product order completion immediately after payment confirmation |

### Module: Coupon Management (ADMIN-04)

| ID | Requirement |
|----|-------------|
| ADMIN-04-01 | Admin can create a coupon with name, type, discount amount/percentage, min order value, validity period, and usage limit |
| ADMIN-04-02 | Admin can edit an existing coupon |
| ADMIN-04-03 | Admin can delete a coupon |
| ADMIN-04-04 | Admin can view paginated coupon list with status filter |
| ADMIN-04-05 | Admin can issue (send) a coupon to specific users by user ID or phone |
| ADMIN-04-06 | Admin can view coupon usage statistics (issued, used, unused counts) |
| ADMIN-04-07 | Admin can manually expire a coupon before its validity end date |

### Module: Promotion Management (ADMIN-05)

| ID | Requirement |
|----|-------------|
| ADMIN-05-01 | Admin can create a promotion activity with name, type (discount, gift, bundle), start/end time, applicable products, and rules |
| ADMIN-05-02 | Admin can edit an existing promotion |
| ADMIN-05-03 | Admin can delete a promotion |
| ADMIN-05-04 | Admin can view paginated promotion list with status filter (active/inactive/expired) |
| ADMIN-05-05 | Admin can enable or disable a promotion |
| ADMIN-05-06 | Admin can manage member points: view points rules, adjust user points balance |

### Module: Refund Audit (ADMIN-06)

| ID | Requirement |
|----|-------------|
| ADMIN-06-01 | Admin can view paginated refund application list with filters: status, date range |
| ADMIN-06-02 | Admin can view refund application detail including order info, refund reason, images, and amount |
| ADMIN-06-03 | Admin can approve a refund application and trigger WeChat refund API |
| ADMIN-06-04 | Admin can reject a refund application with a reason |
| ADMIN-06-05 | Admin can view refund status: Pending -> Approved/Rejected -> Refunded |
| ADMIN-06-06 | Admin can confirm manual refund completion for approved refunds (in case of payment API failure) |

### Module: Logistics Management (ADMIN-07)

| ID | Requirement |
|----|-------------|
| ADMIN-07-01 | Admin can view configured logistics company list |
| ADMIN-07-02 | Admin can add a logistics company (name, code, website URL, enabled/disabled) |
| ADMIN-07-03 | Admin can edit a logistics company |
| ADMIN-07-04 | Admin can delete a logistics company |
| ADMIN-07-05 | Admin can query logistics tracking trajectory by order number |
| ADMIN-07-06 | Admin can view real-time logistics status per order |

### Module: User Management (ADMIN-08)

| ID | Requirement |
|----|-------------|
| ADMIN-08-01 | Admin can view paginated user list with search by nickname/phone |
| ADMIN-08-02 | Admin can view user detail including profile, addresses, order history |
| ADMIN-08-03 | Admin can view per-user consumption statistics (total orders, total spend, avg order value) |
| ADMIN-08-04 | Admin can enable or disable a user account |

### Module: Merchant Management (ADMIN-09)

| ID | Requirement |
|----|-------------|
| ADMIN-09-01 | Admin can view paginated merchant application list with status filter |
| ADMIN-09-02 | Admin can view merchant application detail (business info, contacts, documents) |
| ADMIN-09-03 | Admin can approve a merchant application and auto-generate tenantId as MERCHANT_{id} |
| ADMIN-09-04 | Admin can reject a merchant application with a reason |
| ADMIN-09-05 | Admin can view merchant list and toggle merchant status (active/inactive) |

### Module: Banner Management (ADMIN-10)

| ID | Requirement |
|----|-------------|
| ADMIN-10-01 | Admin can create a banner with title, image, link type (product/category/url), link target, sort order, start/end date |
| ADMIN-10-02 | Admin can edit an existing banner |
| ADMIN-10-03 | Admin can delete a banner |
| ADMIN-10-04 | Admin can view paginated banner list |
| ADMIN-10-05 | Admin can enable or disable a banner |

### Module: WeChat Configuration (ADMIN-11)

| ID | Requirement |
|----|-------------|
| ADMIN-11-01 | Admin can configure WeChat payment parameters: appId, mchId, apiKey, certPath |
| ADMIN-11-02 | Admin can test WeChat payment configuration connectivity |
| ADMIN-11-03 | Admin can view current WeChat payment configuration status (configured/unconfigured) |

---

## Part 2: Mini Program Requirements

### Module: Home (MINI-01)

| ID | Requirement |
|----|-------------|
| MINI-01-01 | User can view banner carousel on Home |
| MINI-01-02 | User can tap banner to navigate to linked product/category/external URL |
| MINI-01-03 | User can view product category tiles on Home |
| MINI-01-04 | User can tap category tile to navigate to product list |
| MINI-01-05 | User can view recommended/hot products section on Home |
| MINI-01-06 | User can search products by keyword from Home search bar |
| MINI-01-07 | User can view search history |

### Module: Product List (MINI-02)

| ID | Requirement |
|----|-------------|
| MINI-02-01 | User can view paginated product list |
| MINI-02-02 | User can filter products by category (including subcategory) |
| MINI-02-03 | User can sort products by price, sales volume, newest |
| MINI-02-04 | User can search products by keyword with instant results |
| MINI-02-05 | User can tap product card to navigate to product detail |

### Module: Product Detail (MINI-03)

| ID | Requirement |
|----|-------------|
| MINI-03-01 | User can view product image carousel |
| MINI-03-02 | User can view product name, price, stock status |
| MINI-03-03 | User can view product description and specifications |
| MINI-03-04 | User can select product specification (e.g., color, size) if variants exist |
| MINI-03-05 | User can view selected specification price adjustment |
| MINI-03-06 | User can input quantity (within available stock) |
| MINI-03-07 | User can add product to shopping cart |
| MINI-03-08 | User can view product评价 (reviews) summary and list |
| MINI-03-09 | User can tap to navigate to product评价详情 (evaluation detail) |

### Module: Shopping Cart (MINI-04)

| ID | Requirement |
|----|-------------|
| MINI-04-01 | User can view shopping cart product list with image, name, price, spec, quantity |
| MINI-04-02 | User can modify product quantity in cart |
| MINI-04-03 | User can delete a product from cart |
| MINI-04-04 | User can select/deselect all items |
| MINI-04-05 | User can view cart total price |
| MINI-04-06 | User can proceed to checkout with selected items |
| MINI-04-07 | System warns user if cart contains mixed physical and virtual products (not allowed to checkout together) |

### Module: Order Confirmation (MINI-05)

| ID | Requirement |
|----|-------------|
| MINI-05-01 | User can select shipping address from saved addresses |
| MINI-05-02 | User can add a new shipping address |
| MINI-05-03 | User can edit/delete existing address |
| MINI-05-04 | User can view order items summary |
| MINI-05-05 | User can apply coupon code |
| MINI-05-06 | System shows mutually exclusive coupon/promotion rule (only one can be used) |
| MINI-05-07 | User can view order total: product total, shipping fee, discount, final amount |
| MINI-05-08 | User can add order remark |
| MINI-05-09 | User can submit order (creates order in mall-center) |

### Module: Order List (MINI-06)

| ID | Requirement |
|----|-------------|
| MINI-06-01 | User can view order list with tab filters: All, Pending Payment, Pending Shipment, Pending Receipt, Completed |
| MINI-06-02 | User can view order card: order number, status, items, total amount, created time |
| MINI-06-03 | User can tap order card to view order detail |
| MINI-06-04 | User can cancel an order (Pending Payment status only) |
| MINI-06-05 | User can confirm delivery (Pending Receipt status only) |

### Module: Order Detail (MINI-07)

| ID | Requirement |
|----|-------------|
| MINI-07-01 | User can view full order info: items, address, payment info, logistics |
| MINI-07-02 | User can view logistics tracking timeline |
| MINI-07-03 | User can view evaluate button (after delivery confirmed) |
| MINI-07-04 | User can view refund/return button |
| MINI-07-05 | User can copy order number |

### Module: Refund Application (MINI-08)

| ID | Requirement |
|----|-------------|
| MINI-08-01 | User can apply for refund from order detail (before delivery confirmed) |
| MINI-08-02 | User can select refund reason from preset options |
| MINI-08-03 | User can input refund reason text |
| MINI-08-04 | User can upload refund reason images |
| MINI-08-05 | User can view refund application status |
| MINI-08-06 | User can cancel refund application before admin processes it |

### Module: Personal Center (MINI-09)

| ID | Requirement |
|----|-------------|
| MINI-09-01 | User can view personal avatar, nickname, phone |
| MINI-09-02 | User can edit personal profile (nickname) |
| MINI-09-03 | User can manage shipping addresses (add, edit, delete, set default) |
| MINI-09-04 | User can view my coupons list |
| MINI-09-05 | User can view my favorites (wishlist) |
| MINI-09-06 | User can remove item from favorites |
| MINI-09-07 | User can view my points balance and points history |

### Module: WeChat Payment (MINI-10)

| ID | Requirement |
|----|-------------|
| MINI-10-01 | User can initiate WeChat JSAPI payment from order confirmation |
| MINI-10-02 | System integrates with WeChat payment: call `/pay/create` to get prepay_id, then invoke `wx.requestPayment` |
| MINI-10-03 | User can view payment result (success/failure) |
| MINI-10-04 | System handles payment callback and updates order status |
| MINI-10-05 | User can retry payment for Pending Payment orders |

---

## Part 3: Future Requirements (Deferred)

The following will be planned in a future release after v2.0:

| ID | Requirement | Rationale |
|----|-------------|-----------|
| FUTURE-01 | Admin can set up flash sale (限时秒杀) campaigns | Redis Lua atomic stock already implemented; UI needed |
| FUTURE-02 | Admin can manage points redemption catalog | Requires inventory and logistics planning |
| FUTURE-03 | User can redeem points for products | Depends on FUTURE-02 |
| FUTURE-04 | Admin can send WeChat template messages | ADVANCED-04 already in backend |
| FUTURE-05 | Admin can view sales analytics dashboard with charts | Backend STAT-01~03 complete; dashboard UI needed |
| FUTURE-06 | Admin can export order/product data to CSV/Excel | Backend data available; export UI needed |
| FUTURE-07 | Admin can set up automated refund rules | Fraud risk; manual review is safer |
| FUTURE-08 | User can share product to friends | Social feature |
| FUTURE-09 | Elasticsearch-based product search | Adds deployment complexity |
| FUTURE-10 | Video/live streaming product showcase | Non-core requirement |

---

## Part 4: Out of Scope

The following are explicitly excluded from v2.0:

| Item | Reason |
|------|--------|
| Admin role-based permissions (RBAC) UI | Backend reuses platform user system; UI out of scope |
| Video/live streaming带货 | Non-core for IT hardware retailer |
| Automated refund approval | Fraud risk; manual audit required |
| Elasticsearch search integration | Adds deployment complexity; MySQL LIKE sufficient for MVP |
|积分兑换商品 complex rules | Complexity high; deferred |
| Multi-language/i18n | Single-region B2C; CN only |
| PWA / desktop web version | Mini Program is primary consumer channel |
| Apple Pay / other payment methods | WeChat JSAPI only per backend |

---

## Part 5: Traceability

> **To be filled by the roadmap planning phase.**

### Backend API Coverage

| Frontend Module | Backend API | Status |
|-----------------|-------------|--------|
| ADMIN-01 Dashboard | STAT-01~03 | Implemented |
| ADMIN-02 Product | GOODS-05~08 | Implemented |
| ADMIN-03 Order | ORDER-01~09, ORDER-EXT-01~03 | Implemented |
| ADMIN-04 Coupon | MARKETING-01~09 | Implemented |
| ADMIN-05 Promotion | MARKETING-01~09 | Implemented |
| ADMIN-06 Refund | REFUND-01~10 | Implemented |
| ADMIN-07 Logistics | DELIVERY-01~04 | Implemented |
| ADMIN-08 User | USER-04~05 | Implemented |
| ADMIN-09 Merchant | ADVANCED-03 | Implemented |
| ADMIN-10 Banner | SYS-01~03 | Implemented |
| ADMIN-11 WeChat Config | SYS-02 (payment params) | Implemented |
| MINI-01 Home | GOODS-01, SYS-01 | Implemented |
| MINI-02 Product List | GOODS-01~04 | Implemented |
| MINI-03 Product Detail | GOODS-01~04 | Implemented |
| MINI-04 Cart | CART-01~06 | Implemented |
| MINI-05 Order Confirm | ORDER-01~09, MARKETING-01~09 | Implemented |
| MINI-06 Order List | ORDER-01~09 | Implemented |
| MINI-07 Order Detail | ORDER-01~09, DELIVERY-02~04 | Implemented |
| MINI-08 Refund | REFUND-01~10 | Implemented |
| MINI-09 Personal Center | USER-01~05, CART-01~06 | Implemented |
| MINI-10 Payment | PAY-01~04 | Implemented |

### Phase Mapping (TBD by roadmap)

| Phase | Admin Modules | Mini Modules |
|-------|---------------|--------------|
| Phase 1 | | |
| Phase 2 | | |
| Phase 3 | | |
| Phase 4 | | |

---

*Last updated: 2026-05-09*
