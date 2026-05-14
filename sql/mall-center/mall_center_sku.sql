USE central_mall;

-- 为测试商品插入SKU数据
INSERT INTO `mall_goods_sku` (`id`, `tenant_id`, `goods_id`, `sku_code`, `specs`, `price`, `stock`, `status`) VALUES
(1, 'default', 2, 'SKU-XEON-6348-001', '{"CPU型号":"Intel Xeon Gold 6348","核心数":"28核56线程"}', 8999.00, 100, 1),
(2, 'default', 1, 'SKU-DELL-R750-001', '{"规格":"2U机架式","电源":"800W"}', 25999.00, 50, 1),
(3, 'default', 3, 'SKU-DDR5-64G-001', '{"容量":"64GB","频率":"DDR5 4800MHz ECC"}', 1899.00, 200, 1);