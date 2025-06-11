/**
 * Portal 3.0 通用JavaScript库
 */

// 全局配置
window.PortalConfig = {
    version: '3.0',
    apiBaseUrl: '/api/v1',
    pageSize: 20,
    theme: 'default'
};

// 工具函数
const Utils = {
    // 格式化日期
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        const second = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hour)
            .replace('mm', minute)
            .replace('ss', second);
    },

    // 防抖函数
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 生成UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // 深拷贝
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    // 获取URL参数
    getUrlParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    },

    // 本地存储
    storage: {
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        get(key) {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch {
                return localStorage.getItem(key);
            }
        },
        remove(key) {
            localStorage.removeItem(key);
        },
        clear() {
            localStorage.clear();
        }
    }
};

// 消息提示组件
const Message = {
    show(content, type = 'info', duration = 3000) {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <i class="message-icon ${this.getIcon(type)}"></i>
                <span>${content}</span>
            </div>
        `;

        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: messageSlideIn 0.3s ease-out;
        `;

        this.setMessageStyle(messageEl, type);
        document.body.appendChild(messageEl);

        // 自动移除
        setTimeout(() => {
            messageEl.style.animation = 'messageSlideOut 0.3s ease-in';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    },

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    setMessageStyle(el, type) {
        const styles = {
            success: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
            error: { bg: '#fff2f0', color: '#f5222d', border: '#ffccc7' },
            warning: { bg: '#fffbe6', color: '#faad14', border: '#ffe58f' },
            info: { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' }
        };
        const style = styles[type] || styles.info;
        el.style.backgroundColor = style.bg;
        el.style.color = style.color;
        el.style.border = `1px solid ${style.border}`;
    },

    success(content, duration) { this.show(content, 'success', duration); },
    error(content, duration) { this.show(content, 'error', duration); },
    warning(content, duration) { this.show(content, 'warning', duration); },
    info(content, duration) { this.show(content, 'info', duration); }
};

// 确认对话框
const Modal = {
    confirm(options) {
        const { title, content, onConfirm, onCancel } = options;
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 24px;
            min-width: 400px;
            max-width: 90vw;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        `;

        modal.innerHTML = `
            <div class="modal-header" style="margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 500;">${title}</h3>
            </div>
            <div class="modal-body" style="margin-bottom: 24px; color: #666;">
                ${content}
            </div>
            <div class="modal-footer" style="text-align: right;">
                <button class="btn btn-cancel" style="margin-right: 8px;">取消</button>
                <button class="btn btn-primary btn-confirm">确定</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 事件处理
        const cancelBtn = modal.querySelector('.btn-cancel');
        const confirmBtn = modal.querySelector('.btn-confirm');

        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            onCancel && onCancel();
        };

        confirmBtn.onclick = () => {
            document.body.removeChild(overlay);
            onConfirm && onConfirm();
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                onCancel && onCancel();
            }
        };
    }
};

// 表格工具
const Table = {
    // 排序
    sort(tableEl, columnIndex, order = 'asc') {
        const tbody = tableEl.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent.trim();
            const bText = b.cells[columnIndex].textContent.trim();
            
            // 尝试数字比较
            const aNum = parseFloat(aText);
            const bNum = parseFloat(bText);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return order === 'asc' ? aNum - bNum : bNum - aNum;
            }
            
            // 字符串比较
            return order === 'asc' 
                ? aText.localeCompare(bText)
                : bText.localeCompare(aText);
        });
        
        // 重新排列行
        rows.forEach(row => tbody.appendChild(row));
    },

    // 筛选
    filter(tableEl, columnIndex, filterText) {
        const tbody = tableEl.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cellText = row.cells[columnIndex].textContent.toLowerCase();
            const shouldShow = cellText.includes(filterText.toLowerCase());
            row.style.display = shouldShow ? '' : 'none';
        });
    },

    // 分页
    paginate(tableEl, page = 1, pageSize = 10) {
        const tbody = tableEl.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        rows.forEach((row, index) => {
            row.style.display = (index >= start && index < end) ? '' : 'none';
        });
        
        return {
            total: rows.length,
            totalPages: Math.ceil(rows.length / pageSize),
            currentPage: page,
            pageSize: pageSize
        };
    }
};

// 表单验证
const Validator = {
    rules: {
        required: (value) => value && value.trim() !== '',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: (value) => /^1[3-9]\d{9}$/.test(value),
        number: (value) => !isNaN(value) && isFinite(value),
        minLength: (value, min) => value && value.length >= min,
        maxLength: (value, max) => !value || value.length <= max
    },

    validate(formEl) {
        let isValid = true;
        const errors = {};

        const inputs = formEl.querySelectorAll('[data-validate]');
        inputs.forEach(input => {
            const rules = input.dataset.validate.split('|');
            const value = input.value;
            const name = input.name || input.id;

            for (const rule of rules) {
                if (rule.includes(':')) {
                    const [ruleName, param] = rule.split(':');
                    if (this.rules[ruleName] && !this.rules[ruleName](value, param)) {
                        errors[name] = this.getErrorMessage(ruleName, param);
                        isValid = false;
                        break;
                    }
                } else {
                    if (this.rules[rule] && !this.rules[rule](value)) {
                        errors[name] = this.getErrorMessage(rule);
                        isValid = false;
                        break;
                    }
                }
            }
        });

        this.showErrors(formEl, errors);
        return { isValid, errors };
    },

    getErrorMessage(rule, param) {
        const messages = {
            required: '此字段为必填项',
            email: '请输入有效的邮箱地址',
            phone: '请输入有效的手机号码',
            number: '请输入有效的数字',
            minLength: `最少需要${param}个字符`,
            maxLength: `最多允许${param}个字符`
        };
        return messages[rule] || '输入格式不正确';
    },

    showErrors(formEl, errors) {
        // 清除之前的错误信息
        formEl.querySelectorAll('.error-message').forEach(el => el.remove());
        formEl.querySelectorAll('.form-control.error').forEach(el => {
            el.classList.remove('error');
        });

        // 显示新的错误信息
        for (const [name, message] of Object.entries(errors)) {
            const input = formEl.querySelector(`[name="${name}"], #${name}`);
            if (input) {
                input.classList.add('error');
                const errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                errorEl.textContent = message;
                errorEl.style.cssText = 'color: #f5222d; font-size: 12px; margin-top: 4px;';
                input.parentNode.appendChild(errorEl);
            }
        }
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes messageSlideIn {
            from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes messageSlideOut {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        }
        .form-control.error {
            border-color: #f5222d !important;
            box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2) !important;
        }
    `;
    document.head.appendChild(style);

    // 初始化侧边栏切换
    initSidebarToggle();
    
    // 初始化搜索功能
    initSearch();
    
    // 初始化表格排序
    initTableSort();
});

// 侧边栏切换
function initSidebarToggle() {
    const toggleBtns = document.querySelectorAll('.nav-toggle');
    const sidebar = document.querySelector('.layout-sidebar');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    });

    // 子菜单切换
    const menuItems = document.querySelectorAll('.nav-item.has-submenu > .nav-link');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const submenu = item.nextElementSibling;
            const parent = item.parentElement;
            
            // 关闭其他子菜单
            document.querySelectorAll('.submenu.open').forEach(menu => {
                if (menu !== submenu) {
                    menu.classList.remove('open');
                    menu.parentElement.classList.remove('active');
                }
            });
            
            // 切换当前子菜单
            submenu.classList.toggle('open');
            parent.classList.toggle('active');
        });
    });
}

// 搜索功能
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce((e) => {
            const keyword = e.target.value.trim();
            if (keyword) {
                console.log('搜索:', keyword);
                // 这里可以添加实际的搜索逻辑
            }
        }, 300));
    }
}

// 表格排序初始化
function initTableSort() {
    const sortableHeaders = document.querySelectorAll('.table th[data-sort]');
    sortableHeaders.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const table = header.closest('table');
            const currentOrder = header.dataset.order || 'asc';
            const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
            
            // 清除其他列的排序状态
            sortableHeaders.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
                delete h.dataset.order;
            });
            
            // 设置当前列的排序状态
            header.classList.add(`sort-${newOrder}`);
            header.dataset.order = newOrder;
            
            // 执行排序
            Table.sort(table, index, newOrder);
        });
    });
}

// 权限控制管理器
const PermissionManager = {
    // 获取当前用户信息
    getCurrentUser() {
        return currentUserData;
    },

    // 获取当前岗位
    getCurrentPosition() {
        const user = this.getCurrentUser();
        const currentPositionId = user.currentWorkPositionId;
        return user.workPositions.find(pos => pos.id === currentPositionId);
    },

    // 切换岗位
    switchPosition(positionId) {
        const user = this.getCurrentUser();
        const position = user.workPositions.find(pos => pos.id === positionId);
        
        if (position) {
            user.currentWorkPositionId = positionId;
            // 保存到本地存储
            Utils.storage.set('currentWorkPositionId', positionId);
            
            // 重新加载菜单
            this.refreshMenu();
            
            // 发送岗位切换事件
            document.dispatchEvent(new CustomEvent('positionChanged', {
                detail: { position }
            }));
            
            Message.success(`已切换到${position.name}岗位`);
            return true;
        }
        
        Message.error('岗位切换失败');
        return false;
    },

    // 检查当前岗位是否有权限访问指定菜单
    hasPermission(menuId) {
        const currentPosition = this.getCurrentPosition();
        if (!currentPosition) return false;
        
        const menu = menuPermissionData.find(m => m.id === menuId);
        if (!menu) return false;
        
        return menu.permissions.includes(currentPosition.code);
    },

    // 根据当前岗位权限过滤菜单
    getFilteredMenus() {
        const currentPosition = this.getCurrentPosition();
        if (!currentPosition) return [];
        
        // 获取有权限的一级菜单
        const rootMenus = menuPermissionData
            .filter(menu => menu.level === 1 && menu.permissions.includes(currentPosition.code))
            .sort((a, b) => a.sort - b.sort);
        
        // 为每个一级菜单添加有权限的子菜单
        return rootMenus.map(rootMenu => {
            const children = menuPermissionData
                .filter(menu => menu.parentId === rootMenu.id && menu.permissions.includes(currentPosition.code))
                .sort((a, b) => a.sort - b.sort);
            
            return {
                ...rootMenu,
                children: children.length > 0 ? children : undefined
            };
        }).filter(menu => {
            // 如果是分组菜单但没有子菜单，则过滤掉
            return menu.path || (menu.children && menu.children.length > 0);
        });
    },

    // 刷新菜单显示
    refreshMenu() {
        const navigationManager = window.navigationManager;
        if (navigationManager) {
            navigationManager.updateMenuData(this.getFilteredMenus());
            navigationManager.render();
        }
    },

    // 初始化权限系统
    init() {
        // 从本地存储恢复岗位选择
        const savedPositionId = Utils.storage.get('currentWorkPositionId');
        if (savedPositionId) {
            const user = this.getCurrentUser();
            const position = user.workPositions.find(pos => pos.id === savedPositionId);
            if (position) {
                user.currentWorkPositionId = savedPositionId;
            }
        }
        
        // 初始化岗位切换组件
        this.initPositionSwitcher();
    },

    // 初始化岗位切换组件
    initPositionSwitcher() {
        const user = this.getCurrentUser();
        const currentPosition = this.getCurrentPosition();
        
        // 创建岗位切换下拉菜单HTML
        const positionSwitcherHtml = `
            <div class="position-switcher">
                <div class="current-position" onclick="togglePositionDropdown()">
                    <span class="position-icon">👔</span>
                    <span class="position-name">${currentPosition.name}</span>
                    <span class="position-arrow">▼</span>
                </div>
                <div class="position-dropdown" id="positionDropdown">
                    <div class="position-dropdown-header">
                        <span>切换岗位</span>
                    </div>
                    <div class="position-list">
                        ${user.workPositions.map(pos => `
                            <div class="position-item ${pos.id === currentPosition.id ? 'active' : ''}" 
                                 onclick="switchToPosition(${pos.id})">
                                <div class="position-info">
                                    <div class="position-title">${pos.name}</div>
                                    <div class="position-dept">${pos.department}</div>
                                </div>
                                <div class="position-badge">
                                    ${pos.isMain ? '<span class="main-badge">主岗</span>' : '<span class="vice-badge">兼职</span>'}
                                </div>
                                ${pos.id === currentPosition.id ? '<div class="position-check">✓</div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // 查找用户菜单区域并插入岗位切换组件
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            // 在用户名前插入岗位切换组件
            userMenu.insertAdjacentHTML('afterbegin', positionSwitcherHtml);
        }
        
        // 添加样式
        this.addPositionSwitcherStyles();
    },

    // 添加岗位切换组件样式
    addPositionSwitcherStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .position-switcher {
                position: relative;
                margin-right: 16px;
            }
            
            .current-position {
                display: flex;
                align-items: center;
                padding: 6px 12px;
                background: #f0f2f5;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 120px;
            }
            
            .current-position:hover {
                background: #e6f7ff;
            }
            
            .position-icon {
                margin-right: 6px;
                font-size: 14px;
            }
            
            .position-name {
                flex: 1;
                font-size: 14px;
                color: #333;
            }
            
            .position-arrow {
                margin-left: 6px;
                font-size: 10px;
                color: #999;
                transition: transform 0.3s ease;
            }
            
            .position-switcher.open .position-arrow {
                transform: rotate(180deg);
            }
            
            .position-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e8e8e8;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                display: none;
                margin-top: 4px;
                min-width: 260px;
            }
            
            .position-switcher.open .position-dropdown {
                display: block;
            }
            
            .position-dropdown-header {
                padding: 12px 16px;
                border-bottom: 1px solid #f0f0f0;
                font-weight: 500;
                color: #333;
                font-size: 14px;
            }
            
            .position-list {
                max-height: 300px;
                overflow-y: auto;
            }
            
            .position-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                cursor: pointer;
                transition: background 0.3s ease;
                position: relative;
            }
            
            .position-item:hover {
                background: #f8f9fa;
            }
            
            .position-item.active {
                background: #e6f7ff;
                border-left: 3px solid #1890ff;
            }
            
            .position-info {
                flex: 1;
            }
            
            .position-title {
                font-size: 14px;
                font-weight: 500;
                color: #333;
                margin-bottom: 2px;
            }
            
            .position-dept {
                font-size: 12px;
                color: #999;
            }
            
            .position-badge {
                margin-left: 8px;
            }
            
            .main-badge {
                background: #52c41a;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
            }
            
            .vice-badge {
                background: #faad14;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
            }
            
            .position-check {
                position: absolute;
                right: 16px;
                color: #1890ff;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }
};

// 全局函数 - 岗位切换相关
function togglePositionDropdown() {
    const switcher = document.querySelector('.position-switcher');
    if (switcher) {
        switcher.classList.toggle('open');
    }
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', function closeDropdown(e) {
        if (!switcher.contains(e.target)) {
            switcher.classList.remove('open');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function switchToPosition(positionId) {
    PermissionManager.switchPosition(positionId);
    
    // 关闭下拉菜单
    const switcher = document.querySelector('.position-switcher');
    if (switcher) {
        switcher.classList.remove('open');
    }
    
    // 更新当前岗位显示
    const currentPosition = PermissionManager.getCurrentPosition();
    const positionNameEl = document.querySelector('.position-name');
    if (positionNameEl && currentPosition) {
        positionNameEl.textContent = currentPosition.name;
    }
    
    // 更新岗位列表中的active状态
    document.querySelectorAll('.position-item').forEach(item => {
        item.classList.remove('active');
        const checkEl = item.querySelector('.position-check');
        if (checkEl) {
            checkEl.remove();
        }
    });
    
    // 设置新的active状态
    const targetItem = document.querySelector(`[onclick="switchToPosition(${positionId})"]`);
    if (targetItem) {
        targetItem.classList.add('active');
        targetItem.insertAdjacentHTML('beforeend', '<div class="position-check">✓</div>');
    }
}

// 导出全局对象
window.Portal = {
    Utils,
    Message,
    Modal,
    Table,
    Validator,
    PermissionManager
}; 