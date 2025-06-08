/**
 * Portal 3.0 模拟数据
 */

// 模拟数据生成器
const MockDataGenerator = {
    // 生成随机ID
    generateId() {
        return Math.floor(Math.random() * 100000) + 1;
    },

    // 生成随机日期
    generateDate(daysAgo = 30) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
        return date.toISOString().split('T')[0];
    },

    // 生成随机手机号
    generatePhone() {
        const prefixes = ['138', '139', '159', '188', '186', '177', '173'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return prefix + suffix;
    },

    // 生成随机邮箱
    generateEmail(name) {
        const domains = ['qq.com', '163.com', 'gmail.com', 'company.com'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${name.toLowerCase()}@${domain}`;
    }
};

// 部门数据
const departmentData = [
    {
        id: 1,
        name: '总经理办公室',
        parentId: 0,
        directorId: 1,
        depNo: 'D001',
        gradeid: 1,
        fiiale: '1',
        employees: 3,
        createTime: '2023-01-01'
    },
    {
        id: 2,
        name: '人力资源部',
        parentId: 1,
        directorId: 2,
        depNo: 'D002',
        gradeid: 2,
        fiiale: '',
        employees: 8,
        createTime: '2023-01-01'
    },
    {
        id: 3,
        name: '财务部',
        parentId: 1,
        directorId: 3,
        depNo: 'D003',
        gradeid: 2,
        fiiale: '',
        employees: 6,
        createTime: '2023-01-01'
    },
    {
        id: 4,
        name: '技术研发部',
        parentId: 1,
        directorId: 4,
        depNo: 'D004',
        gradeid: 2,
        fiiale: '',
        employees: 25,
        createTime: '2023-01-01'
    },
    {
        id: 5,
        name: '前端团队',
        parentId: 4,
        directorId: 5,
        depNo: 'D005',
        gradeid: 3,
        fiiale: '',
        employees: 8,
        createTime: '2023-01-01'
    },
    {
        id: 6,
        name: '后端团队',
        parentId: 4,
        directorId: 6,
        depNo: 'D006',
        gradeid: 3,
        fiiale: '',
        employees: 12,
        createTime: '2023-01-01'
    },
    {
        id: 7,
        name: '产品设计团队',
        parentId: 4,
        directorId: 7,
        depNo: 'D007',
        gradeid: 3,
        fiiale: '',
        employees: 5,
        createTime: '2023-01-01'
    },
    {
        id: 8,
        name: '销售部',
        parentId: 1,
        directorId: 8,
        depNo: 'D008',
        gradeid: 2,
        fiiale: '',
        employees: 15,
        createTime: '2023-01-01'
    },
    {
        id: 9,
        name: '客服部',
        parentId: 1,
        directorId: 9,
        depNo: 'D009',
        gradeid: 2,
        fiiale: '',
        employees: 10,
        createTime: '2023-01-01'
    }
];

// 员工数据
const employeeData = [
    {
        id: 1,
        name: '张总',
        empNo: 'E001',
        department: 1,
        position: '总经理',
        workposition: 1,
        email: 'zhangzong@company.com',
        tel: '13800138001',
        sex: 1,
        isLeave: 1,
        entryTime: '2020-01-01',
        gradeid: 1
    },
    {
        id: 2,
        name: '李经理',
        empNo: 'E002',
        department: 2,
        position: '人力资源经理',
        workposition: 2,
        email: 'lijingli@company.com',
        tel: '13800138002',
        sex: 2,
        isLeave: 1,
        entryTime: '2020-03-01',
        gradeid: 2
    },
    {
        id: 3,
        name: '王会计',
        empNo: 'E003',
        department: 3,
        position: '财务经理',
        workposition: 3,
        email: 'wangkuaiji@company.com',
        tel: '13800138003',
        sex: 2,
        isLeave: 1,
        entryTime: '2020-02-01',
        gradeid: 2
    },
    {
        id: 4,
        name: '刘架构师',
        empNo: 'E004',
        department: 4,
        position: '技术总监',
        workposition: 4,
        email: 'liujiagou@company.com',
        tel: '13800138004',
        sex: 1,
        isLeave: 1,
        entryTime: '2020-01-15',
        gradeid: 2
    },
    {
        id: 5,
        name: '陈前端',
        empNo: 'E005',
        department: 5,
        position: '前端主管',
        workposition: 5,
        email: 'chenqianduan@company.com',
        tel: '13800138005',
        sex: 1,
        isLeave: 1,
        entryTime: '2021-06-01',
        gradeid: 3
    },
    {
        id: 6,
        name: '赵后端',
        empNo: 'E006',
        department: 6,
        position: '后端主管',
        workposition: 6,
        email: 'zhaohouduan@company.com',
        tel: '13800138006',
        sex: 1,
        isLeave: 1,
        entryTime: '2021-04-01',
        gradeid: 3
    },
    {
        id: 7,
        name: '孙设计师',
        empNo: 'E007',
        department: 7,
        position: '设计主管',
        workposition: 7,
        email: 'sundesign@company.com',
        tel: '13800138007',
        sex: 2,
        isLeave: 1,
        entryTime: '2021-03-01',
        gradeid: 3
    },
    {
        id: 8,
        name: '周销售',
        empNo: 'E008',
        department: 8,
        position: '销售经理',
        workposition: 8,
        email: 'zhouxiaoshou@company.com',
        tel: '13800138008',
        sex: 1,
        isLeave: 1,
        entryTime: '2020-08-01',
        gradeid: 2
    },
    {
        id: 9,
        name: '吴客服',
        empNo: 'E009',
        department: 9,
        position: '客服经理',
        workposition: 9,
        email: 'wukefu@company.com',
        tel: '13800138009',
        sex: 2,
        isLeave: 1,
        entryTime: '2020-09-01',
        gradeid: 2
    },
    {
        id: 10,
        name: '马开发',
        empNo: 'E010',
        department: 5,
        position: '前端工程师',
        workposition: 10,
        email: 'makaifa@company.com',
        tel: '13800138010',
        sex: 1,
        isLeave: 1,
        entryTime: '2022-01-01',
        gradeid: 4
    }
];

// 客户数据
const customerData = [
    {
        customer_id: 1,
        customer_name: '北京科技有限公司',
        customer_status: '3', // 正式客户
        vendition: 8,
        customer_type: '企业客户',
        customer_email: 'contact@bjtech.com',
        customer_mobile: '13901234567',
        customer_regtime: '2023-01-15',
        companyadress: '北京市朝阳区科技园区',
        companyScale: '100-500人',
        companyphone: '010-12345678'
    },
    {
        customer_id: 2,
        customer_name: '上海商贸集团',
        customer_status: '2', // 试用客户
        vendition: 8,
        customer_type: '企业客户',
        customer_email: 'info@shsm.com',
        customer_mobile: '13802345678',
        customer_regtime: '2023-02-20',
        companyadress: '上海市浦东新区商务区',
        companyScale: '500-1000人',
        companyphone: '021-23456789'
    },
    {
        customer_id: 3,
        customer_name: '广州制造企业',
        customer_status: '1', // 意向客户
        vendition: 8,
        customer_type: '制造业',
        customer_email: 'sales@gzmanuf.com',
        customer_mobile: '13703456789',
        customer_regtime: '2023-03-10',
        companyadress: '广州市天河区工业园',
        companyScale: '50-100人',
        companyphone: '020-34567890'
    },
    {
        customer_id: 4,
        customer_name: '深圳互联网公司',
        customer_status: '4', // 审核中
        vendition: 8,
        customer_type: '互联网',
        customer_email: 'hr@sznet.com',
        customer_mobile: '13604567890',
        customer_regtime: '2023-03-25',
        companyadress: '深圳市南山区高新技术园',
        companyScale: '200-500人',
        companyphone: '0755-45678901'
    },
    {
        customer_id: 5,
        customer_name: '杭州电商平台',
        customer_status: '3', // 正式客户
        vendition: 8,
        customer_type: '电商',
        customer_email: 'service@hzec.com',
        customer_mobile: '13505678901',
        customer_regtime: '2023-01-30',
        companyadress: '杭州市西湖区互联网小镇',
        companyScale: '100-200人',
        companyphone: '0571-56789012'
    }
];

// 客户跟进记录
const customerFollowData = [
    {
        id: 1,
        customer_id: 1,
        employee_id: 8,
        followTime: '2023-12-01',
        followContent: '初次接触，了解客户基本需求，客户对我们的产品很感兴趣',
        nextTime: '2023-12-05',
        followType: '电话跟进'
    },
    {
        id: 2,
        customer_id: 1,
        employee_id: 8,
        followTime: '2023-12-05',
        followContent: '发送产品资料和报价方案，客户表示需要内部讨论',
        nextTime: '2023-12-10',
        followType: '邮件跟进'
    },
    {
        id: 3,
        customer_id: 2,
        employee_id: 8,
        followTime: '2023-12-02',
        followContent: '客户申请试用版本，已开通试用账号',
        nextTime: '2023-12-09',
        followType: '现场拜访'
    },
    {
        id: 4,
        customer_id: 3,
        employee_id: 8,
        followTime: '2023-12-03',
        followContent: '客户咨询定制功能的可行性和费用',
        nextTime: '2023-12-08',
        followType: '微信沟通'
    }
];

// 商品类目数据
const categoryData = [
    {
        id: 1,
        typename: '办公软件',
        parentid: 0,
        fieldid: 1,
        delflag: 0
    },
    {
        id: 2,
        typename: 'OA系统',
        parentid: 1,
        fieldid: 2,
        delflag: 0
    },
    {
        id: 3,
        typename: 'CRM系统',
        parentid: 1,
        fieldid: 3,
        delflag: 0
    },
    {
        id: 4,
        typename: '进销存系统',
        parentid: 1,
        fieldid: 4,
        delflag: 0
    },
    {
        id: 5,
        typename: '硬件设备',
        parentid: 0,
        fieldid: 5,
        delflag: 0
    },
    {
        id: 6,
        typename: '服务器',
        parentid: 5,
        fieldid: 6,
        delflag: 0
    },
    {
        id: 7,
        typename: '网络设备',
        parentid: 5,
        fieldid: 7,
        delflag: 0
    }
];

// 商品数据
const productData = [
    {
        id: 1,
        name: 'Portal 3.0 标准版',
        type: 2,
        model: 1,
        price: 9800.00,
        employee: 4,
        supplier: 1,
        time: '2023-01-01',
        description: '企业级OA办公自动化系统标准版',
        stock: 999,
        status: '上架'
    },
    {
        id: 2,
        name: 'Portal 3.0 专业版',
        type: 2,
        model: 2,
        price: 19800.00,
        employee: 4,
        supplier: 1,
        time: '2023-01-01',
        description: '企业级OA办公自动化系统专业版',
        stock: 999,
        status: '上架'
    },
    {
        id: 3,
        name: 'CRM客户管理系统',
        type: 3,
        model: 3,
        price: 15800.00,
        employee: 4,
        supplier: 1,
        time: '2023-01-15',
        description: '专业客户关系管理系统',
        stock: 999,
        status: '上架'
    },
    {
        id: 4,
        name: '进销存管理系统',
        type: 4,
        model: 4,
        price: 12800.00,
        employee: 4,
        supplier: 1,
        time: '2023-01-20',
        description: '库存商品进销存管理系统',
        stock: 999,
        status: '上架'
    },
    {
        id: 5,
        name: '企业服务器(标准配置)',
        type: 6,
        model: 5,
        price: 25000.00,
        employee: 4,
        supplier: 2,
        time: '2023-02-01',
        description: 'Intel Xeon处理器，32GB内存，1TB SSD',
        stock: 50,
        status: '上架'
    }
];

// 订单数据
const orderData = [
    {
        id: 1,
        orderNo: 'SO202312010001',
        customer_id: 1,
        employee_id: 8,
        orderTime: '2023-12-01',
        totalMoney: 29600.00,
        orderStatus: '已完成',
        paymentStatus: '已付款',
        deliveryStatus: '已交付'
    },
    {
        id: 2,
        orderNo: 'SO202312020001',
        customer_id: 2,
        employee_id: 8,
        orderTime: '2023-12-02',
        totalMoney: 15800.00,
        orderStatus: '进行中',
        paymentStatus: '已付款',
        deliveryStatus: '配置中'
    },
    {
        id: 3,
        orderNo: 'SO202312030001',
        customer_id: 5,
        employee_id: 8,
        orderTime: '2023-12-03',
        totalMoney: 44600.00,
        orderStatus: '待确认',
        paymentStatus: '未付款',
        deliveryStatus: '未发货'
    }
];

// 订单详情数据
const orderDetailData = [
    {
        id: 1,
        saleOrderId: 1,
        productId: 1,
        quantity: 1,
        price: 9800.00,
        amount: 9800.00
    },
    {
        id: 2,
        saleOrderId: 1,
        productId: 2,
        quantity: 1,
        price: 19800.00,
        amount: 19800.00
    },
    {
        id: 3,
        saleOrderId: 2,
        productId: 3,
        quantity: 1,
        price: 15800.00,
        amount: 15800.00
    },
    {
        id: 4,
        saleOrderId: 3,
        productId: 2,
        quantity: 1,
        price: 19800.00,
        amount: 19800.00
    },
    {
        id: 5,
        saleOrderId: 3,
        productId: 4,
        quantity: 1,
        price: 12800.00,
        amount: 12800.00
    },
    {
        id: 6,
        saleOrderId: 3,
        productId: 5,
        quantity: 1,
        price: 25000.00,
        amount: 25000.00
    }
];

// 工单数据
const ticketData = [
    {
        id: 1,
        ticketNo: 'TK202312010001',
        title: '系统登录异常',
        customer_id: 1,
        priority: '高',
        status: '处理中',
        category: '技术支持',
        assignee: 9,
        description: '用户反馈无法正常登录系统，提示密码错误',
        createTime: '2023-12-01 09:00:00',
        updateTime: '2023-12-01 10:30:00'
    },
    {
        id: 2,
        ticketNo: 'TK202312010002',
        title: '功能咨询',
        customer_id: 2,
        priority: '中',
        status: '已解决',
        category: '产品咨询',
        assignee: 9,
        description: '客户咨询如何设置审批流程',
        createTime: '2023-12-01 14:20:00',
        updateTime: '2023-12-01 16:45:00'
    },
    {
        id: 3,
        ticketNo: 'TK202312020001',
        title: '数据导入问题',
        customer_id: 3,
        priority: '高',
        status: '待处理',
        category: '技术支持',
        assignee: null,
        description: 'Excel数据导入时出现格式错误',
        createTime: '2023-12-02 11:15:00',
        updateTime: '2023-12-02 11:15:00'
    }
];

// 统计数据
const dashboardData = {
    // 组织架构统计
    organization: {
        totalDepartments: departmentData.length,
        totalEmployees: employeeData.length,
        activeEmployees: employeeData.filter(emp => emp.isLeave === 1).length,
        newEmployeesThisMonth: 3
    },
    
    // CRM统计
    crm: {
        totalCustomers: customerData.length,
        intentionCustomers: customerData.filter(c => c.customer_status === '1').length,
        trialCustomers: customerData.filter(c => c.customer_status === '2').length,
        formalCustomers: customerData.filter(c => c.customer_status === '3').length,
        pendingCustomers: customerData.filter(c => c.customer_status === '4').length,
        followRecords: customerFollowData.length
    },
    
    // 商品统计
    product: {
        totalProducts: productData.length,
        activeProducts: productData.filter(p => p.status === '上架').length,
        totalCategories: categoryData.length,
        lowStockProducts: 2
    },
    
    // 订单统计
    order: {
        totalOrders: orderData.length,
        completedOrders: orderData.filter(o => o.orderStatus === '已完成').length,
        pendingOrders: orderData.filter(o => o.orderStatus === '待确认').length,
        processingOrders: orderData.filter(o => o.orderStatus === '进行中').length,
        totalRevenue: orderData.reduce((sum, order) => sum + order.totalMoney, 0)
    },
    
    // 客服统计
    support: {
        totalTickets: ticketData.length,
        pendingTickets: ticketData.filter(t => t.status === '待处理').length,
        processingTickets: ticketData.filter(t => t.status === '处理中').length,
        resolvedTickets: ticketData.filter(t => t.status === '已解决').length,
        highPriorityTickets: ticketData.filter(t => t.priority === '高').length
    }
};

// 图表数据
const chartData = {
    // 销售趋势图数据
    salesTrend: {
        categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        series: [
            {
                name: '销售额',
                data: [85, 92, 78, 105, 118, 135, 142, 128, 156, 189, 201, 178]
            }
        ]
    },
    
    // 客户状态分布
    customerStatus: [
        { name: '意向客户', value: 1, color: '#faad14' },
        { name: '试用客户', value: 1, color: '#1890ff' },
        { name: '正式客户', value: 2, color: '#52c41a' },
        { name: '审核中', value: 1, color: '#f5222d' }
    ],
    
    // 产品销量排行
    productSales: [
        { name: 'Portal 3.0 专业版', value: 25 },
        { name: 'CRM客户管理系统', value: 18 },
        { name: 'Portal 3.0 标准版', value: 15 },
        { name: '进销存管理系统', value: 12 },
        { name: '企业服务器', value: 8 }
    ],
    
    // 工单处理趋势
    ticketTrend: {
        categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        series: [
            {
                name: '新增工单',
                data: [12, 15, 8, 18, 22, 6, 3]
            },
            {
                name: '已解决工单',
                data: [10, 14, 12, 16, 20, 8, 5]
            }
        ]
    }
};

// 岗位数据
const positionData = [
    {
        id: 1,
        name: '总裁秘书长',
        shortName: 'ZCMSZ',
        deptId: 1,
        deptName: '综合办公室',
        isManager: true,
        level: 5, // 权重(5 高级经理级别,4总经理级别,3主管级别,2组长级别,1成员级别)
        description: '负责总裁办公室日常事务管理，协调各部门工作',
        salaryRange: '15000-25000',
        skillRequirements: '管理学、行政管理等相关专业',
        createTime: '2024-12-01',
        editTime: '2024-12-01 10:30:00',
        workContent: '负责总裁办公室日常管理工作，协调公司各部门事务，处理重要文件和会议安排', // 工作职责
        parentPositionId: null, // 上级岗位ID
        isPersonalManager: 1, // 是否人员主管
        // 功能权限ID列表 - 精确到页面功能点
        functionIDs: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,100,101,102,103,104,105,200,201,202,203,204,205,300,301,302,303,304,305',
        // 权限配置 - 精确到页面功能点
        permissions: {
            // 组织管理模块
            organization: {
                department: {
                    view: true,    // 查看部门
                    add: true,     // 新增部门
                    edit: true,    // 编辑部门
                    delete: true,  // 删除部门
                    assign: true   // 分配人员
                },
                employee: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    import: true,  // 批量导入
                    export: true   // 导出数据
                },
                position: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    permission_manage: true  // 权限管理
                }
            },
            // CRM客户管理模块
            crm: {
                customer: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    assign: true,
                    follow: true
                },
                contact: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false
                }
            },
            // 产品管理模块
            product: {
                category: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true
                },
                product: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: true    // 审核产品
                }
            },
            // 订单管理模块
            order: {
                order: {
                    view: true,
                    add: false,
                    edit: true,
                    delete: false,
                    audit: true,   // 审核订单
                    cancel: true   // 取消订单
                }
            },
            // 系统管理模块
            system: {
                user: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    reset_password: true
                },
                role: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true
                },
                menu: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true
                },
                log: {
                    view: true,
                    export: true
                }
            }
        }
    },
    {
        id: 2,
        name: '总裁秘书',
        shortName: 'ZCMS',
        deptId: 1,
        deptName: '综合办公室',
        isManager: false,
        level: 2,
        description: '协助总裁秘书长处理日常事务',
        salaryRange: '8000-12000',
        skillRequirements: '文秘、行政管理等相关专业',
        createTime: '2024-12-01',
        editTime: '2024-12-01 10:30:00',
        workContent: '协助处理总裁办公室日常事务，文件整理，会议记录',
        parentPositionId: 1,
        isPersonalManager: 0,
        functionIDs: '1,2,3,4,5,100,101,102,200,201,202',
        permissions: {
            organization: {
                department: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    assign: false
                },
                employee: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    import: false,
                    export: true
                },
                position: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    permission_manage: false
                }
            },
            crm: {
                customer: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    assign: false,
                    follow: false
                },
                contact: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                }
            },
            product: {
                category: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                },
                product: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: false
                }
            },
            order: {
                order: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: false,
                    cancel: false
                }
            },
            system: {
                user: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false,
                    reset_password: false
                },
                role: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                menu: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                log: {
                    view: false,
                    export: false
                }
            }
        }
    },
    {
        id: 3,
        name: '人力资源经理',
        shortName: 'RLZYJL',
        deptId: 2,
        deptName: '人力资源部',
        isManager: true,
        level: 3,
        description: '负责人力资源部门管理工作',
        salaryRange: '12000-18000',
        skillRequirements: '人力资源管理、心理学等相关专业',
        createTime: '2024-12-01',
        editTime: '2024-12-01 10:30:00',
        workContent: '负责公司人力资源规划、招聘、培训、绩效考核、薪酬福利等工作',
        parentPositionId: null,
        isPersonalManager: 1,
        functionIDs: '1,2,3,4,5,6,7,8,9,10,100,101,102,103,104,200,201,202,203',
        permissions: {
            organization: {
                department: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    assign: true
                },
                employee: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    import: true,
                    export: true
                },
                position: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    permission_manage: true
                }
            },
            crm: {
                customer: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false,
                    assign: false,
                    follow: false
                },
                contact: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                }
            },
            product: {
                category: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                product: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: false
                }
            },
            order: {
                order: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: false,
                    cancel: false
                }
            },
            system: {
                user: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    reset_password: true
                },
                role: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                },
                menu: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                log: {
                    view: true,
                    export: true
                }
            }
        }
    },
    {
        id: 4,
        name: '财务经理',
        shortName: 'CWJL',
        deptId: 3,
        deptName: '财务部',
        isManager: true,
        level: 3,
        description: '负责财务部门管理工作',
        salaryRange: '12000-20000',
        skillRequirements: '财务管理、会计学等相关专业，CPA优先',
        createTime: '2024-12-01',
        editTime: '2024-12-01 10:30:00',
        workContent: '负责公司财务管理、成本控制、预算编制、财务报表等工作',
        parentPositionId: null,
        isPersonalManager: 1,
        functionIDs: '1,2,3,4,5,100,101,200,201,300,301,302,303,304,305',
        permissions: {
            organization: {
                department: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    assign: false
                },
                employee: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    import: false,
                    export: true
                },
                position: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    permission_manage: false
                }
            },
            crm: {
                customer: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    assign: false,
                    follow: false
                },
                contact: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                }
            },
            product: {
                category: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                },
                product: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: true
                }
            },
            order: {
                order: {
                    view: true,
                    add: false,
                    edit: true,
                    delete: false,
                    audit: true,
                    cancel: true
                }
            },
            system: {
                user: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false,
                    reset_password: false
                },
                role: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                menu: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                log: {
                    view: true,
                    export: true
                }
            }
        }
    },
    {
        id: 5,
        name: '技术总监',
        shortName: 'JSZJ',
        deptId: 4,
        deptName: '技术部',
        isManager: true,
        level: 4,
        description: '负责公司技术架构和研发管理',
        salaryRange: '20000-35000',
        skillRequirements: '计算机相关专业，10年以上技术管理经验',
        createTime: '2024-12-01',
        editTime: '2024-12-01 10:30:00',
        workContent: '负责公司技术发展规划、架构设计、研发团队管理等工作',
        parentPositionId: null,
        isPersonalManager: 1,
        functionIDs: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,100,101,102,103,104,105,200,201,202,203,204,205',
        permissions: {
            organization: {
                department: {
                    view: true,
                    add: false,
                    edit: true,
                    delete: false,
                    assign: true
                },
                employee: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    import: false,
                    export: true
                },
                position: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    permission_manage: false
                }
            },
            crm: {
                customer: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    assign: false,
                    follow: false
                },
                contact: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                }
            },
            product: {
                category: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true
                },
                product: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    audit: true
                }
            },
            order: {
                order: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: false,
                    cancel: false
                }
            },
            system: {
                user: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    reset_password: false
                },
                role: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                },
                menu: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false
                },
                log: {
                    view: true,
                    export: true
                }
            }
        }
    },
    {
        id: 6,
        name: '销售经理',
        shortName: 'XSJL',
        deptId: 5,
        deptName: '销售部',
        isManager: true,
        level: 3,
        description: '负责销售团队管理和业务拓展',
        salaryRange: '10000-18000',
        skillRequirements: '市场营销相关专业，5年以上销售管理经验',
        createTime: '2024-12-01',
        editTime: '2024-12-01 10:30:00',
        workContent: '负责销售团队管理、客户开发、销售目标制定与执行',
        parentPositionId: null,
        isPersonalManager: 1,
        functionIDs: '1,2,3,4,5,100,101,200,201,202,203',
        permissions: {
            organization: {
                department: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    assign: false
                },
                employee: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    import: false,
                    export: true
                },
                position: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    permission_manage: false
                }
            },
            crm: {
                customer: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    assign: true,
                    follow: true
                },
                contact: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false
                }
            },
            product: {
                category: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                },
                product: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: false
                }
            },
            order: {
                order: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                    audit: false,
                    cancel: true
                }
            },
            system: {
                user: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false,
                    reset_password: false
                },
                role: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                menu: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                log: {
                    view: false,
                    export: false
                }
            }
        }
    },
    {
        id: 7,
        name: '客服专员',
        shortName: 'KFZY',
        deptId: 6,
        deptName: '客服部',
        isManager: false,
        level: 1,
        description: '负责客户服务和技术支持',
        salaryRange: '4500-7000',
        skillRequirements: '客服相关经验，良好的沟通能力',
        createTime: '2024-12-01',
        editTime: '2024-12-01 10:30:00',
        workContent: '处理客户咨询、投诉，提供技术支持服务',
        parentPositionId: null,
        isPersonalManager: 0,
        functionIDs: '1,2,3,100,101,200,201',
        permissions: {
            organization: {
                department: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    assign: false
                },
                employee: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    import: false,
                    export: false
                },
                position: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    permission_manage: false
                }
            },
            crm: {
                customer: {
                    view: true,
                    add: false,
                    edit: true,
                    delete: false,
                    assign: false,
                    follow: true
                },
                contact: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false
                }
            },
            product: {
                category: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false
                },
                product: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: false
                }
            },
            order: {
                order: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                    audit: false,
                    cancel: false
                }
            },
            system: {
                user: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false,
                    reset_password: false
                },
                role: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                menu: {
                    view: false,
                    add: false,
                    edit: false,
                    delete: false
                },
                log: {
                    view: false,
                    export: false
                }
            }
        }
    },
    {
        id: 8,
        name: '系统管理员',
        shortName: 'XTGLY',
        deptId: 4,
        deptName: '技术部',
        isManager: false,
        level: 2,
        description: '负责系统运维和管理',
        salaryRange: '8000-12000',
        skillRequirements: '计算机相关专业，熟悉Linux系统',
        createTime: '2024-12-01',
        editTime: '2024-12-01 10:30:00',
        workContent: '负责系统运维、数据备份、安全管理等工作',
        parentPositionId: 5,
        isPersonalManager: 0,
        functionIDs: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,100,101,102,103,104,105,200,201,202,203,204,205,300,301,302,303,304,305',
        permissions: {
            organization: {
                department: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    assign: true
                },
                employee: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    import: true,
                    export: true
                },
                position: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    permission_manage: true
                }
            },
            crm: {
                customer: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    assign: true,
                    follow: true
                },
                contact: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true
                }
            },
            product: {
                category: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true
                },
                product: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    audit: true
                }
            },
            order: {
                order: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    audit: true,
                    cancel: true
                }
            },
            system: {
                user: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true,
                    reset_password: true
                },
                role: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true
                },
                menu: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: true
                },
                log: {
                    view: true,
                    export: true
                }
            }
        }
    }
];

// 导出模拟数据
window.MockData = {
    departments: departmentData,
    employees: employeeData,
    positions: positionData,
    customers: customerData,
    customerFollows: customerFollowData,
    categories: categoryData,
    products: productData,
    orders: orderData,
    orderDetails: orderDetailData,
    tickets: ticketData,
    dashboard: dashboardData,
    charts: chartData,
    generator: MockDataGenerator
}; 