// Portal 3.0 统一导航菜单系统
// 版本: v1.0
// 说明: 统一管理所有页面的导航菜单结构，支持基于岗位的权限控制

// 导航菜单数据结构（兼容原有结构）
const menuData = [
    {
        id: 'dashboard',
        name: '工作台',
        icon: 'fas fa-tachometer-alt',
        children: [
            { id: 'oa-workspace', name: 'OA工作台', url: 'dashboard/oa-workspace.html' },
            { id: 'crm-workspace', name: 'CRM工作台', url: 'dashboard/crm-workspace.html' },
            { id: 'sales-workspace', name: '销售工作台', url: 'dashboard/sales-workspace.html' },
            { id: 'workspace-config', name: '工作台配置', url: 'dashboard/workspace-config.html' }
        ]
    },
    {
        id: 'organization',
        name: '组织架构',
        icon: 'fas fa-sitemap',
        children: [
            { id: 'dept-tree', name: '部门管理', url: 'organization/department-tree.html' },
            { id: 'employee-list', name: '员工管理', url: 'organization/employee-list.html' },
            { id: 'employee-add', name: '新增员工', url: 'organization/employee-add.html' },
            { id: 'position-manage', name: '岗位管理', url: 'organization/position-manage.html' },
            { id: 'workposition-permission', name: '岗位权限', url: 'organization/workposition-permission.html' }
        ]
    },
    {
        id: 'crm',
        name: '客户管理',
        icon: 'fas fa-users',
        children: [
            { id: 'customer-list', name: '客户列表', url: 'crm/customer-list.html' },
            { id: 'customer-detail', name: '客户详情', url: 'crm/customer-detail.html' },
            { id: 'follow-record', name: '跟进记录', url: 'crm/follow-record.html' },
            { id: 'customer-transfer', name: '客户交接', url: 'crm/customer-transfer.html' }
        ]
    },
    {
        id: 'product',
        name: '商品管理',
        icon: 'fas fa-box',
        children: [
            { id: 'category-manage', name: '类目管理', url: 'product/category-manage.html' },
            { id: 'product-list', name: '商品列表', url: 'product/product-list.html' },
            { id: 'product-form', name: '商品编辑', url: 'product/product-form.html' },
            { id: 'inventory-monitor', name: '库存监控', url: 'product/inventory-monitor.html' }
        ]
    },
    {
        id: 'order',
        name: '订单管理',
        icon: 'fas fa-shopping-cart',
        children: [
            { id: 'order-dashboard', name: '订单工作台', url: 'order/order-dashboard.html' },
            { id: 'order-list', name: '订单列表', url: 'order/order-list.html' },
            { id: 'order-detail', name: '订单详情', url: 'order/order-detail.html' },
            { id: 'order-create', name: '创建订单', url: 'order/order-create.html' }
        ]
    },
    {
        id: 'service',
        name: '客服中心',
        icon: 'fas fa-headset',
        children: [
            { id: 'service-dashboard', name: '客服工作台', url: 'service/service-dashboard.html' },
            { id: 'ticket-list', name: '工单列表', url: 'service/ticket-list.html' },
            { id: 'ticket-detail', name: '工单详情', url: 'service/ticket-detail.html' },
            { id: 'knowledge-base', name: '知识库', url: 'service/knowledge-base.html' }
        ]
    },
    {
        id: 'operations',
        name: '运维管理',
        icon: 'fas fa-tools',
        children: [
            { id: 'task-board', name: '任务看板', url: 'operations/task-board.html' },
            { id: 'schedule-calendar', name: '日程管理', url: 'operations/schedule-calendar.html' },
            { id: 'work-log', name: '工作日志', url: 'operations/work-log.html' },
            { id: 'report-center', name: '报表中心', url: 'operations/report-center.html' }
        ]
    },
    {
        id: 'project',
        name: '项目管理',
        icon: 'fas fa-project-diagram',
        children: [
            { id: 'project-list', name: '项目列表', url: 'project-manager/project-list.html' },
            { id: 'project-create', name: '项目立项', url: 'project-manager/project-create.html' }
        ]
    },
    {
        id: 'performance',
        name: '绩效考核',
        icon: 'fas fa-chart-line',
        children: [
            { id: 'performance-evaluation', name: '绩效考核', url: 'evaluation-plan/performance-evaluation.html' }
        ]
    },
    {
        id: 'salary',
        name: '薪酬管理',
        icon: 'fas fa-money-bill-wave',
        children: [
            { id: 'salary-overview', name: '薪酬总览', url: 'salary/salary-overview.html' }
        ]
    },
    {
        id: 'approval',
        name: '流程管理',
        icon: 'fas fa-tasks',
        children: [
            { id: 'approval-center', name: '审批中心', url: 'approval/approval-center.html' }
        ]
    },
    {
        id: 'system',
        name: '系统管理',
        icon: 'fas fa-cogs',
        children: [
            { id: 'tenant-list', name: '租户管理', url: 'system/tenant-list.html' },
            { id: 'tenant-config', name: '租户配置', url: 'system/tenant-config.html' },
            { id: 'menu-manage', name: '菜单管理', url: 'system/menu-manage.html' },
            { id: 'menu-function', name: '功能点管理', url: 'system/menu-function.html' },
            { id: 'user-manage', name: '用户管理', url: 'system/user-manage.html' },
            { id: 'operation-log', name: '操作日志', url: 'system/operation-log.html' }
        ]
    }
];

// 导航菜单生成器
class NavigationManager {
    constructor() {
        this.currentPath = this.getCurrentPath();
        this.basePath = this.getBasePath();
        this.menuData = menuData; // 默认使用原始菜单数据
    }

    // 更新菜单数据（支持权限过滤后的菜单）
    updateMenuData(newMenuData) {
        this.menuData = newMenuData;
    }

    // 获取当前页面路径
    getCurrentPath() {
        const path = window.location.pathname;
        const fileName = path.substring(path.lastIndexOf('/') + 1);
        return fileName || 'index.html';
    }

    // 获取基础路径（相对于当前页面到html根目录的路径）
    getBasePath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(s => s); // 过滤空字符串
        
        // 查找html目录的位置
        const htmlIndex = segments.indexOf('html');
        
        if (htmlIndex === -1) {
            // 如果没有html目录，可能在根目录
            return './';
        }
        
        // 计算当前页面相对于html目录的深度
        const currentDepth = segments.length - htmlIndex - 2; // -2 因为最后一个是文件名，html本身也要减1
        return '../'.repeat(Math.max(0, currentDepth));
    }

    // 生成导航HTML
    generateNavigationHTML() {
        let html = `
            <div class="sidebar-header">
                <div class="logo">P3</div>
                <div class="brand-name">Portal 3.0</div>
            </div>
            
            <ul class="nav-menu">
        `;

        this.menuData.forEach(item => {
            if (item.children && item.children.length > 0) {
                // 有子菜单的分组
                const groupState = this.getGroupState(item);
                html += this.generateGroupItem(item, groupState);
            } else {
                // 单个链接项
                const isActive = this.isPageActive(item.url);
                const url = this.resolveUrl(item.url);
                html += this.generateLinkItem(item, url, isActive);
            }
        });

        html += '</ul>';
        return html;
    }

    // 生成链接项
    generateLinkItem(item, url, isActive) {
        return `
            <li class="nav-item">
                <a href="${url}" class="nav-link ${isActive ? 'active' : ''}">
                    <span class="nav-icon"><i class="${item.icon}"></i></span>
                    <span>${item.name}</span>
                </a>
            </li>
        `;
    }

    // 生成分组项
    generateGroupItem(item, groupState) {
        const { isExpanded, hasActiveChild } = groupState;
        
        let html = `
            <li class="nav-item">
                <button class="nav-group ${isExpanded ? 'expanded' : ''}" onclick="toggleNavGroup(this)">
                    <span class="nav-icon"><i class="${item.icon}"></i></span>
                    <span>${item.name}</span>
                    <span class="nav-arrow ${isExpanded ? 'rotated' : ''}">▶</span>
                </button>
                <div class="nav-submenu ${isExpanded ? 'expanded' : ''}">
        `;

        item.children.forEach(child => {
            const isActive = this.isPageActive(child.path || child.url);
            const url = this.resolveUrl(child.path || child.url);
            html += `<a href="${url}" class="nav-subitem ${isActive ? 'active' : ''}">${child.name}</a>`;
        });

        html += `
                </div>
            </li>
        `;

        return html;
    }

    // 检查页面是否激活
    isPageActive(url) {
        if (!url) return false;
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        return fileName === this.currentPath;
    }

    // 获取分组状态
    getGroupState(group) {
        const hasActiveChild = group.children.some(child => this.isPageActive(child.path || child.url));
        const isExpanded = hasActiveChild;
        return { isExpanded, hasActiveChild };
    }

    // 解析URL路径
    resolveUrl(url) {
        if (url === 'index.html') {
            return this.basePath + 'index.html';
        }
        
        // 如果当前在根目录（index.html），直接使用相对路径
        if (this.currentPath === 'index.html' || this.basePath === './') {
            return url;
        }
        
        // 如果在子目录，需要回到根目录
        return this.basePath + url;
    }

    // 渲染导航菜单
    render(containerId = 'app-sidebar') {
        const container = document.getElementById(containerId) || document.querySelector('.app-sidebar');
        console.log('Navigation render - looking for container:', containerId);
        console.log('Container found:', container);
        if (container) {
            const html = this.generateNavigationHTML();
            console.log('Generated navigation HTML:', html.substring(0, 200) + '...');
            container.innerHTML = html;
            console.log('Navigation rendered successfully');
        } else {
            console.error('Navigation container not found:', containerId);
            console.log('Available elements with class app-sidebar:', document.querySelectorAll('.app-sidebar'));
            console.log('Available elements with id app-sidebar:', document.getElementById('app-sidebar'));
        }
    }

    // 初始化导航菜单
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('Navigation init - current path:', this.currentPath);
                this.render();
            });
        } else {
            this.render();
        }
    }

    // 初始化权限控制的导航菜单
    initWithPermissions() {
        // 等待权限管理器就绪
        if (window.Portal && window.Portal.PermissionManager) {
            // 获取过滤后的菜单数据
            const filteredMenus = window.Portal.PermissionManager.getFilteredMenus();
            this.updateMenuData(filteredMenus);
        }
        
        // 初始化普通导航
        this.init();
    }
}

// 全局导航管理器实例
window.navigationManager = new NavigationManager();

// 二级菜单控制
function toggleNavGroup(button) {
    const submenu = button.nextElementSibling;
    const arrow = button.querySelector('.nav-arrow');
    const isExpanded = submenu.classList.contains('expanded');
    
    // 关闭所有其他展开的菜单
    document.querySelectorAll('.nav-submenu.expanded').forEach(menu => {
        if (menu !== submenu) {
            menu.classList.remove('expanded');
            menu.previousElementSibling.classList.remove('expanded');
            menu.previousElementSibling.querySelector('.nav-arrow').classList.remove('rotated');
        }
    });
    
    // 切换当前菜单状态
    if (isExpanded) {
        submenu.classList.remove('expanded');
        button.classList.remove('expanded');
        arrow.classList.remove('rotated');
    } else {
        submenu.classList.add('expanded');
        button.classList.add('expanded');
        arrow.classList.add('rotated');
    }
}

// 移动端菜单切换
function toggleMobileMenu() {
    const sidebar = document.querySelector('.app-sidebar');
    sidebar.classList.toggle('mobile-open');
}

// 点击主内容区域时关闭移动端菜单
document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.app-sidebar');
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
    }
});

// 添加菜单项的工具函数
window.addMenuItem = function(parentId, newItem) {
    const parent = menuData.find(item => item.id === parentId);
    if (parent && parent.children) {
        parent.children.push(newItem);
        // 重新渲染导航
        window.navigationManager.render();
    }
};

// 删除菜单项的工具函数
window.removeMenuItem = function(parentId, itemId) {
    const parent = menuData.find(item => item.id === parentId);
    if (parent && parent.children) {
        parent.children = parent.children.filter(child => child.id !== itemId);
        // 重新渲染导航
        window.navigationManager.render();
    }
};

// 自动初始化
window.navigationManager.init(); 