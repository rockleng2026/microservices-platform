-- 菜单表初始化数据
-- 参考：sql/organization-module.sql 的实际表结构

-- 删除已存在的数据（测试环境）
DELETE FROM menu_func WHERE menu_page_id IN (SELECT id FROM menu_page);
DELETE FROM menu_page WHERE id > 10;

-- 插入系统管理相关菜单（基于原有数据扩展）
INSERT INTO menu_page (id, name, parent_id, link_url, description, icon, sort_order, status, delflag, created_at, tenant_id) VALUES
-- 系统管理模块菜单
(11, '用户管理', 10, '/system/user', '系统用户管理页面', 'user', 1, 1, 0, NOW(), 'default'),
(12, '角色管理', 10, '/system/role', '系统角色管理页面', 'team', 2, 1, 0, NOW(), 'default'),
(13, '菜单管理', 10, '/system/menu', '系统菜单管理页面', 'menu', 3, 1, 0, NOW(), 'default'),
(14, '权限管理', 10, '/system/permission', '系统权限管理页面', 'safety-certificate', 4, 1, 0, NOW(), 'default'),
(15, '操作日志', 10, '/system/log', '系统操作日志页面', 'history', 5, 1, 0, NOW(), 'default'),
(16, '系统配置', 10, '/system/config', '系统配置管理页面', 'tool', 6, 1, 0, NOW(), 'default'),
(17, '租户管理', 10, '/system/tenant', '租户管理页面', 'cluster', 7, 1, 0, NOW(), 'default'),
(18, '租户配置', 10, '/system/tenant-config', '租户配置管理页面', 'setting', 8, 1, 0, NOW(), 'default');

-- 插入菜单功能权限数据
-- 用户管理功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
('system:user:view', '查看用户', 1, 11, 1, '查看用户列表和详情', NOW(), 'default'),
('system:user:add', '新增用户', 1, 11, 2, '新增系统用户', NOW(), 'default'),
('system:user:edit', '编辑用户', 1, 11, 3, '编辑用户信息', NOW(), 'default'),
('system:user:delete', '删除用户', 1, 11, 4, '删除系统用户', NOW(), 'default'),
('system:user:reset-password', '重置密码', 1, 11, 5, '重置用户密码', NOW(), 'default'),
('system:user:assign-role', '分配角色', 1, 11, 6, '为用户分配角色', NOW(), 'default'),
('system:user:export', '导出用户', 1, 11, 7, '导出用户数据', NOW(), 'default'),
('system:user:import', '导入用户', 1, 11, 8, '导入用户数据', NOW(), 'default');

-- 角色管理功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
('system:role:view', '查看角色', 1, 12, 1, '查看角色列表和详情', NOW(), 'default'),
('system:role:add', '新增角色', 1, 12, 2, '新增系统角色', NOW(), 'default'),
('system:role:edit', '编辑角色', 1, 12, 3, '编辑角色信息', NOW(), 'default'),
('system:role:delete', '删除角色', 1, 12, 4, '删除系统角色', NOW(), 'default'),
('system:role:assign-permission', '分配权限', 1, 12, 5, '为角色分配权限', NOW(), 'default'),
('system:role:assign-user', '分配用户', 1, 12, 6, '为角色分配用户', NOW(), 'default');

-- 菜单管理功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
('system:menu:view', '查看菜单', 1, 13, 1, '查看菜单列表和详情', NOW(), 'default'),
('system:menu:add', '新增菜单', 1, 13, 2, '新增系统菜单', NOW(), 'default'),
('system:menu:edit', '编辑菜单', 1, 13, 3, '编辑菜单信息', NOW(), 'default'),
('system:menu:delete', '删除菜单', 1, 13, 4, '删除系统菜单', NOW(), 'default'),
('system:menu:sort', '菜单排序', 1, 13, 5, '调整菜单排序', NOW(), 'default'),
('system:menu:export', '导出菜单', 1, 13, 6, '导出菜单配置', NOW(), 'default');

-- 权限管理功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
('system:permission:view', '查看权限', 1, 14, 1, '查看权限列表和详情', NOW(), 'default'),
('system:permission:add', '新增权限', 1, 14, 2, '新增系统权限', NOW(), 'default'),
('system:permission:edit', '编辑权限', 1, 14, 3, '编辑权限信息', NOW(), 'default'),
('system:permission:delete', '删除权限', 1, 14, 4, '删除系统权限', NOW(), 'default');

-- 操作日志功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
('system:log:view', '查看日志', 1, 15, 1, '查看操作日志', NOW(), 'default'),
('system:log:export', '导出日志', 1, 15, 2, '导出日志数据', NOW(), 'default'),
('system:log:clean', '清理日志', 1, 15, 3, '清理历史日志', NOW(), 'default'),
('system:log:statistics', '日志统计', 1, 15, 4, '查看日志统计报表', NOW(), 'default');

-- 系统配置功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
('system:config:view', '查看配置', 1, 16, 1, '查看系统配置', NOW(), 'default'),
('system:config:edit', '编辑配置', 1, 16, 2, '编辑系统配置', NOW(), 'default'),
('system:config:cache', '缓存管理', 1, 16, 3, '管理系统缓存', NOW(), 'default'),
('system:config:backup', '数据备份', 1, 16, 4, '系统数据备份', NOW(), 'default');

-- 租户管理功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
('system:tenant:view', '查看租户', 1, 17, 1, '查看租户列表和详情', NOW(), 'default'),
('system:tenant:add', '新增租户', 1, 17, 2, '新增系统租户', NOW(), 'default'),
('system:tenant:edit', '编辑租户', 1, 17, 3, '编辑租户信息', NOW(), 'default'),
('system:tenant:delete', '删除租户', 1, 17, 4, '删除系统租户', NOW(), 'default'),
('system:tenant:enable', '启用租户', 1, 17, 5, '启用禁用租户', NOW(), 'default'),
('system:tenant:config', '租户配置', 1, 17, 6, '管理租户配置', NOW(), 'default');

-- 租户配置功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
('system:tenant-config:view', '查看配置', 1, 18, 1, '查看租户配置', NOW(), 'default'),
('system:tenant-config:edit', '编辑配置', 1, 18, 2, '编辑租户配置', NOW(), 'default'),
('system:tenant-config:delete', '删除配置', 1, 18, 3, '删除租户配置', NOW(), 'default'),
('system:tenant-config:export', '导出配置', 1, 18, 4, '导出租户配置', NOW(), 'default');

-- 重置自增序列（MySQL）
ALTER TABLE menu_page AUTO_INCREMENT = 100;
ALTER TABLE menu_func AUTO_INCREMENT = 1000;

-- 查询验证
SELECT 
    m.id,
    m.parent_id,
    m.name,
    m.link_url,
    m.icon,
    m.sort_order,
    m.status,
    COUNT(f.id) as function_count
FROM menu_page m
LEFT JOIN menu_func f ON m.id = f.menu_page_id
WHERE m.delflag = 0
AND m.id >= 10
GROUP BY m.id, m.parent_id, m.name, m.link_url, m.icon, m.sort_order, m.status
ORDER BY m.parent_id ASC, m.sort_order ASC; 