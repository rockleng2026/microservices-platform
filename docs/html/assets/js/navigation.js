// Portal 3.0 统一导航菜单系统
// 版本: v1.0
// 说明: 统一管理所有页面的导航菜单结构

// 导航菜单数据结构
const navigationData = {
    // 菜单项配置
    menuItems: [
        {
            id: 'home',
            icon: '🏠',
            label: '首页总览',
            type: 'link',
            url: 'index.html',
            active: false
        },
        {
            id: 'workspace',
            icon: '💼',
            label: '工作台',
            type: 'group',
            expanded: false,
            children: [
                { id: 'oa-workspace', label: 'OA工作台', url: 'dashboard/oa-workspace.html' },
                { id: 'crm-workspace', label: 'CRM工作台', url: 'dashboard/crm-workspace.html' },
                { id: 'sales-workspace', label: '销售工作台', url: 'dashboard/sales-workspace.html' },
                { id: 'workspace-config', label: '工作台配置', url: 'dashboard/workspace-config.html' }
            ]
        },
        {
            id: 'organization',
            icon: '🏢',
            label: '组织架构',
            type: 'group',
            expanded: false,
            children: [
                { id: 'department-tree', label: '部门管理', url: 'organization/department-tree.html' },
                { id: 'employee-list', label: '员工管理', url: 'organization/employee-list.html' },
                { id: 'employee-add', label: '新增员工', url: 'organization/employee-add.html' },
                { id: 'position-manage', label: '岗位管理', url: 'organization/position-manage.html' },
                { id: 'role-permission', label: '角色权限', url: 'organization/role-permission.html' }
            ]
        },
        {
            id: 'crm',
            icon: '👥',
            label: '客户管理',
            type: 'group',
            expanded: false,
            children: [
                { id: 'customer-list', label: '客户列表', url: 'crm/customer-list.html' },
                { id: 'customer-detail', label: '客户详情', url: 'crm/customer-detail.html' },
                { id: 'follow-record', label: '跟进记录', url: 'crm/follow-record.html' },
                { id: 'customer-transfer', label: '客户转移', url: 'crm/customer-transfer.html' }
            ]
        },
        {
            id: 'product',
            icon: '📦',
            label: '商品管理',
            type: 'group',
            expanded: false,
            children: [
                { id: 'product-list', label: '商品列表', url: 'product/product-list.html' },
                { id: 'category-manage', label: '商品分类', url: 'product/category-manage.html' },
                { id: 'product-form', label: '商品编辑', url: 'product/product-form.html' },
                { id: 'inventory-monitor', label: '库存管理', url: 'product/inventory-monitor.html' }
            ]
        },
        {
            id: 'order',
            icon: '📋',
            label: '订单管理',
            type: 'group',
            expanded: false,
            children: [
                { id: 'order-dashboard', label: '订单工作台', url: 'order/order-dashboard.html' },
                { id: 'order-list', label: '订单列表', url: 'order/order-list.html' },
                { id: 'order-detail', label: '订单详情', url: 'order/order-detail.html' },
                { id: 'order-create', label: '创建订单', url: 'order/order-create.html' }
            ]
        },
        {
            id: 'service',
            icon: '🎧',
            label: '客服中心',
            type: 'group',
            expanded: false,
            children: [
                { id: 'service-dashboard', label: '客服工作台', url: 'service/service-dashboard.html' },
                { id: 'ticket-list', label: '工单管理', url: 'service/ticket-list.html' },
                { id: 'ticket-detail', label: '工单详情', url: 'service/ticket-detail.html' },
                { id: 'knowledge-base', label: '知识库', url: 'service/knowledge-base.html' }
            ]
        },
        {
            id: 'operations',
            icon: '⚙️',
            label: '运维管理',
            type: 'group',
            expanded: false,
            children: [
                { id: 'task-board', label: '任务看板', url: 'operations/task-board.html' },
                { id: 'schedule-calendar', label: '日程日历', url: 'operations/schedule-calendar.html' },
                { id: 'work-log', label: '工作日志', url: 'operations/work-log.html' },
                { id: 'report-center', label: '报表中心', url: 'operations/report-center.html' }
            ]
        }
    ]
};

// 导航菜单生成器
class NavigationManager {
    constructor() {
        this.currentPath = this.getCurrentPath();
        this.basePath = this.getBasePath();
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

        navigationData.menuItems.forEach(item => {
            if (item.type === 'link') {
                const isActive = this.isPageActive(item.url);
                const url = this.resolveUrl(item.url);
                html += this.generateLinkItem(item, url, isActive);
            } else if (item.type === 'group') {
                const groupState = this.getGroupState(item);
                html += this.generateGroupItem(item, groupState);
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
                    <span class="nav-icon">${item.icon}</span>
                    <span>${item.label}</span>
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
                    <span class="nav-icon">${item.icon}</span>
                    <span>${item.label}</span>
                    <span class="nav-arrow ${isExpanded ? 'rotated' : ''}">▶</span>
                </button>
                <div class="nav-submenu ${isExpanded ? 'expanded' : ''}">
        `;

        item.children.forEach(child => {
            const isActive = this.isPageActive(child.url);
            const url = this.resolveUrl(child.url);
            html += `<a href="${url}" class="nav-subitem ${isActive ? 'active' : ''}">${child.label}</a>`;
        });

        html += `
                </div>
            </li>
        `;

        return html;
    }

    // 检查页面是否激活
    isPageActive(url) {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        return fileName === this.currentPath;
    }

    // 获取分组状态
    getGroupState(group) {
        const hasActiveChild = group.children.some(child => this.isPageActive(child.url));
        const isExpanded = hasActiveChild;
        return { isExpanded, hasActiveChild };
    }

    // 解析URL路径
    resolveUrl(url) {
        if (url === 'index.html') {
            return this.basePath + 'index.html';
        }
        return this.basePath + url;
    }

    // 渲染导航菜单
    render(containerId = 'app-sidebar') {
        const container = document.getElementById(containerId) || document.querySelector('.app-sidebar');
        if (container) {
            const html = this.generateNavigationHTML();
            console.log('Rendering navigation HTML to container');
            container.innerHTML = html;
        } else {
            console.error('Navigation container not found:', containerId);
        }
    }

    // 初始化导航菜单
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('Navigation init - current path:', this.currentPath);
                console.log('Navigation init - base path:', this.basePath);
                this.render();
            });
        } else {
            console.log('Navigation init - current path:', this.currentPath);
            console.log('Navigation init - base path:', this.basePath);
            this.render();
        }
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
    const parent = navigationData.menuItems.find(item => item.id === parentId);
    if (parent && parent.children) {
        parent.children.push(newItem);
        // 重新渲染导航
        window.navigationManager.render();
    }
};

// 删除菜单项的工具函数
window.removeMenuItem = function(parentId, itemId) {
    const parent = navigationData.menuItems.find(item => item.id === parentId);
    if (parent && parent.children) {
        parent.children = parent.children.filter(child => child.id !== itemId);
        // 重新渲染导航
        window.navigationManager.render();
    }
};

// 自动初始化
window.navigationManager.init(); 