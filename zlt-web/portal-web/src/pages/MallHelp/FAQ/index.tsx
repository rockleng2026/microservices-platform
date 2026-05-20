import React, { useState } from 'react';
import { Card, Tabs, Input, Empty } from 'antd';
import './index.less';

const { Search } = Input;

// FAQ分类
const categories = [
  { key: 'dev', label: '开发类' },
  { key: 'biz', label: '业务类' },
  { key: 'config', label: '配置类' },
  { key: 'error', label: '常见错误' },
];

// FAQ数据
const faqData: Record<string, Array<{ q: string; a: string[] }>> = {
  dev: [
    {
      q: '接口文档在哪里可以找到？',
      a: [
        '在后台管理左侧菜单点击「商城使用帮助文档」→「接口文档」',
        '接口文档列出了 mall-center 所有 Controller 的接口路径、参数、响应格式和业务逻辑',
      ],
    },
    {
      q: '如何新增一个API接口？',
      a: [
        '在 mall-center 的 controller 包下创建新的 Controller 类',
        '使用 @Tag 和 @Operation 注解标注接口分组和说明',
        '使用 @GetMapping / @PostMapping 等注解定义路径和方法',
        '接口会自动出现在「接口文档」页面中',
      ],
    },
    {
      q: '前端页面路由是如何配置的？',
      a: [
        '路由配置在 zlt-web/portal-web/.umirc.ts 文件中',
        '商城相关路由都在 /mall-admin 路径下',
        '新增页面后需要在 .umirc.ts 中注册路由，并在数据库 menu_page 表中配置菜单',
      ],
    },
    {
      q: '数据库菜单是如何动态加载的？',
      a: [
        '菜单数据存储在 central_organization.menu_page 表中',
        '通过 getCurrentUserMenus(positionId) 接口获取当前岗位可见菜单',
        '前端 DynamicMenu 组件解析菜单数据并渲染侧边栏',
        '新增菜单需要在 menu_page 表中插入记录，并在 workposition.menu_ids 中添加对应ID',
      ],
    },
  ],
  biz: [
    {
      q: '如何添加新的商品分类？',
      a: [
        '进入「商品管理」→「分类管理」页面',
        '点击「新增分类」，填写分类名称和图标',
        '支持多级分类，填写父分类ID创建子分类',
        '分类创建后才能在商品管理中选择使用',
      ],
    },
    {
      q: '优惠券无法被用户领取怎么排查？',
      a: [
        '检查优惠券状态是否为「已发布」，未发布状态用户无法领取',
        '检查发放总量是否已用完',
        '检查优惠券有效期是否在当前时间范围内',
        '检查是否设置了领取上限（每个用户限领X张）',
      ],
    },
    {
      q: '用户反馈无法微信支付怎么排查？',
      a: [
        '检查「微信支付配置」是否已填写商户号、API密钥、证书',
        '确认后台服务已启动且 mall-center 微服务正常运行',
        '检查微信支付证书路径是否正确，证书是否在有效期',
        '查看 mall-center 日志中微信支付相关错误信息',
      ],
    },
    {
      q: '订单退款流程是什么？',
      a: [
        '用户在小程序端提交退款申请（订单详情页）',
        '管理员在「订单管理」→「退款审核」中查看申请',
        '审核通过后系统自动执行退款，退款原路返回微信支付账户',
        '审核拒绝需填写拒绝原因，用户会收到通知',
      ],
    },
  ],
  config: [
    {
      q: '如何在后台添加新的菜单项？',
      a: [
        '在 central_organization 数据库 menu_page 表中插入新记录',
        '设置 link_url 为对应的前端路由路径',
        '如果菜单有子菜单，设置 parent_id 为父菜单ID',
        '将菜单ID添加到 workposition 表中对应岗位的 menu_ids 字段',
        '刷新页面后即可在侧边栏看到新菜单',
      ],
    },
    {
      q: '微信支付配置需要哪些参数？',
      a: [
        'AppID：微信公众平台的公众号/小程序应用ID',
        '商户号：微信支付商户平台分配的商户号',
        'API密钥：在商户平台 → API安全 → 设置API密钥（32位字符）',
        '证书路径：退款证书的服务器存放路径，需申请并下载到服务器',
      ],
    },
    {
      q: '如何设置库存预警阈值？',
      a: [
        '在「商品管理」中编辑商品，找到「库存预警阈值」字段',
        '设置一个数值，当该商品的SKU库存低于此值时会在「库存预警」页面显示',
        '建议设置为安全库存的1.5-2倍',
        '可在「库存预警」页面集中查看所有低于阈值的SKU',
      ],
    },
    {
      q: '如何为指定用户发放优惠券？',
      a: [
        '在「优惠券管理」中找到目标优惠券模板',
        '点击「发放优惠券」按钮',
        '输入用户的手机号或用户ID',
        '系统会自动将优惠券发放到该用户账户',
      ],
    },
  ],
  error: [
    {
      q: '接口返回 401 未授权错误？',
      a: [
        '检查请求 Header 中是否携带了有效的 Token',
        'Token 过期或无效，需要重新登录获取',
        '检查网关（zlt-gateway）是否正常工作',
        '检查 token 解析服务（zlt-uaa）是否正常运行',
      ],
    },
    {
      q: '订单支付成功但状态未更新？',
      a: [
        '检查微信支付回调地址是否配置正确',
        '检查 mall-center 是否能正常收到微信支付回调通知',
        '查看 mall-center 日志中支付回调相关错误',
        '可通过「订单管理」页面手动确认订单状态',
      ],
    },
    {
      q: '商品详情页空白或加载失败？',
      a: [
        '检查商品是否已上架（状态为启用）',
        '检查商品是否关联了有效的分类',
        '检查商品图片URL是否可正常访问',
        '清除浏览器缓存后重试',
      ],
    },
    {
      q: '库存数据与实际不符怎么排查？',
      a: [
        '查看「操作日志」确认近期是否有异常的库存调整记录',
        '检查是否存在未完成的订单（占用库存但未支付）',
        '检查退款订单是否正确释放了库存',
        '可在「库存管理」中使用「纠偏」功能修正库存并记录原因',
      ],
    },
  ],
};

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('dev');
  const [searchText, setSearchText] = useState<string>('');

  const renderFAQ = () => {
    const items = faqData[activeCategory] || [];

    // 简单的搜索过滤
    const filtered = searchText.trim()
      ? items.filter(
          (item) =>
            item.q.includes(searchText.trim()) ||
            item.a.some((a) => a.includes(searchText.trim())),
        )
      : items;

    if (filtered.length === 0) {
      return (
        <Empty
          description={searchText.trim() ? `未找到包含"${searchText}"的FAQ` : '该分类暂无FAQ'} />
      );
    }

    return (
      <div className="faq-list">
        {filtered.map((item, idx) => (
          <Card key={idx} size="small" className="faq-card">
            <details open={idx === 0}>
              <summary className="faq-question">{item.q}</summary>
              <div className="faq-answer">
                {item.a.map((a, ai) => (
                  <p key={ai}>{a}</p>
                ))}
              </div>
            </details>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="faq-container">
      <Card className="faq-header">
        <div className="title-row">
          <h1>常见问题 (FAQ)</h1>
          <span className="subtitle">开发、业务、配置、异常问题解决方案</span>
        </div>
        <Search
          placeholder="搜索问题或解决方案..."
          allowClear
          onSearch={(value) => setSearchText(value)}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </Card>

      <Card className="faq-content">
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          items={categories.map((c) => ({
            key: c.key,
            label: c.label,
            children: renderFAQ(),
          }))}
        />
      </Card>
    </div>
  );
};

export default FAQ;