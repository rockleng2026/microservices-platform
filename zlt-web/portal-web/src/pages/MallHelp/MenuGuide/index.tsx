import React, { useState } from 'react';
import { Card, Tabs, Input, Empty } from 'antd';
import './index.less';

const { Search } = Input;

// 功能模块列表
const modules = [
  { key: 'goods', label: '商品管理' },
  { key: 'order', label: '订单管理' },
  { key: 'coupon', label: '优惠券管理' },
  { key: 'banner', label: 'Banner管理' },
  { key: 'stock', label: '库存管理' },
  { key: 'member', label: '会员管理' },
  { key: 'promotion', label: '促销管理' },
  { key: 'settings', label: '系统设置' },
];

// 各模块说明数据
const moduleGuides: Record<string, {
  description: string;
  steps: string[];
  notes: string[];
}> = {
  goods: {
    description: '管理商城商品信息，包括商品基本信息、规格、库存、图片等。支持实物商品和虚拟商品（可下载资源）。',
    steps: [
      '进入「商品管理」页面，点击「新增商品」按钮',
      '填写商品基本信息：名称、分类、价格、库存预警阈值',
      '选择商品类型（实物商品/虚拟商品），虚拟商品需上传资源文件',
      '添加商品规格（如颜色、尺码），设置各规格的SKU编码和价格',
      '上传商品主图和详情图片，建议使用横版图片保证展示效果',
      '保存后可在列表中对商品进行上下架、编辑、删除操作',
      '支持批量选择商品进行批量上下架',
    ],
    notes: [
      '商品分类需先在「分类管理」中创建',
      '虚拟商品无需填写物流信息，支付后直接获得下载链接',
      '商品名称不超过60字符，描述不超过500字符',
      '建议先设置分类再添加商品，方便后续管理',
    ],
  },
  order: {
    description: '管理商城所有订单，支持多条件筛选查看、发货、关闭、调整金额等操作。',
    steps: [
      '进入「订单管理」页面，使用筛选条件查找目标订单',
      '点击订单号进入订单详情，查看商品明细、收货地址、支付信息',
      '对于待发货订单，点击「发货」按钮选择快递公司并填写快递单号',
      '如需调整订单金额，点击「改价」填写新金额和原因',
      '对于异常订单，可点击「关闭」并填写关闭原因',
      '可添加内部备注（对用户不可见）记录处理过程',
    ],
    notes: [
      '订单状态说明：待支付 → 已支付 → 已发货 → 已完成（已收货）→ 已取消',
      '管理员改价后，系统会记录操作日志',
      '订单关闭后库存自动释放回库存池',
      '已支付订单如需退款需走退款流程，订单不可直接关闭',
    ],
  },
  coupon: {
    description: '创建和管理优惠券模板，定义优惠规则，发放给用户使用。',
    steps: [
      '进入「优惠券管理」页面，点击「创建优惠券模板」',
      '填写优惠券信息：名称、优惠类型（满减/折扣）、金额/折扣比例、发放总量',
      '设置使用条件：满X元可用，有效期开始和结束时间',
      '保存后点击「发布」使优惠券生效，用户可开始领取',
      '如需发放给指定用户，点击「发放优惠券」输入用户手机号',
      '可生成限时领取码用于地推活动',
      '在统计数据中查看优惠券的领取量、使用量和核销率',
    ],
    notes: [
      '满减券和折扣券只能选其一，不可叠加',
      '优惠券一旦发布不可修改金额，只能下架',
      '已发放给用户的优惠券不影响使用',
      '建议设置领取上限防止羊毛党',
    ],
  },
  banner: {
    description: '配置小程序首页轮播图，设置跳转链接，支持跳转到商品详情或外部链接。',
    steps: [
      '进入「Banner管理」页面，点击「新增轮播图」',
      '上传轮播图片（建议尺寸750×350像素，PNG/JPG均可）',
      '选择跳转类型：商品详情 / 外部链接 / 不跳转',
      '如选外部链接，需填写完整的URL地址',
      '可拖拽调整轮播图的排列顺序',
      '启用的Banner会在小程序首页顶部展示',
    ],
    notes: [
      '最多支持10张轮播图，超出后需先删除再添加',
      '建议单张图片不超过500KB保证加载速度',
      'Banner顺序按排序值从小到大排列，数值越小越靠前',
    ],
  },
  stock: {
    description: '管理商品SKU的库存数量，支持库存预警、库存纠偏和批量录入。',
    steps: [
      '进入「库存管理」页面，可按商品名称或SKU编码搜索',
      '点击单个SKU查看详细库存信息',
      '如库存数据有误，点击「纠偏」手动调整库存并填写原因',
      '在「库存预警」页面查看低于阈值的SKU列表，及时补货',
      '新增SKU库存记录：点击「新建库存」，选择商品、填写SKU编码和库存数量',
    ],
    notes: [
      '库存阈值在商品管理中设置，默认建议为10',
      '订单支付成功会自动扣减库存，退款会释放库存',
      '库存为0时商品自动下架（需配置）',
      '建议每周核对一次系统库存与实际库存',
    ],
  },
  member: {
    description: '查看会员信息和积分余额，管理员可代为管理收货地址和调整积分。',
    steps: [
      '进入「会员管理」页面，搜索或浏览会员列表',
      '点击会员查看详细信息和积分余额',
      '如会员积分有误，点击「调整积分」进行增扣操作并填写原因',
      '管理员可代为新增、修改、删除会员的收货地址',
      '可在会员详情查看该用户的订单统计和消费记录',
    ],
    notes: [
      '会员等级由系统根据消费金额自动计算',
      '积分调整后会在会员积分记录中体现',
      '删除会员地址前需确认该地址没有关联中的订单',
    ],
  },
  promotion: {
    description: '创建和管理促销活动，配置活动规则和时间，参与的商品自动以活动价销售。',
    steps: [
      '进入「促销管理」页面，点击「创建促销」',
      '填写活动名称、描述、开始和结束时间',
      '选择参与促销的商品范围（全部商品或指定商品）',
      '设置促销规则：折扣比例或固定价格',
      '保存后活动到达开始时间自动生效，到期自动结束',
      '可随时启用/禁用促销活动',
    ],
    notes: [
      '促销价格与商品原价取两者中的较低值',
      '促销活动优先级高于优惠券',
      '同一商品同一时间只能参与一个促销活动',
    ],
  },
  settings: {
    description: '配置商城系统参数，包括微信支付参数、运费规则、售后服务政策等。',
    steps: [
      '进入「系统设置」页面，查看所有配置项',
      '找到「微信支付配置」区域，填写商户号、API密钥、证书路径等信息',
      '配置前需先设置商户平台API密钥（32位）和申请退款证书',
      '保存配置后系统可正常接收微信支付通知',
      '可使用「测试解密」功能验证证书配置是否正确',
    ],
    notes: [
      '微信支付配置涉及资金安全，修改需谨慎',
      'API密钥需在商户平台设置，不能与他人共享',
      '退款证书需使用官方途径申请，配置到服务器指定路径',
      '测试解密功能仅供验证，不要用于生产环境',
    ],
  },
};

const MenuGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('goods');
  const [searchText, setSearchText] = useState<string>('');

  const renderGuide = () => {
    const guide = moduleGuides[activeTab];
    if (!guide) return <Empty description="内容待配置" />;

    return (
      <div className="guide-content">
        <Card className="guide-desc-card">
          <p>{guide.description}</p>
        </Card>

        <Card title="操作步骤" size="small" className="guide-card">
          <ol>
            {guide.steps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>{step}</li>
            ))}
          </ol>
        </Card>

        <Card title="注意事项" size="small" className="guide-card" style={{ marginTop: 16 }}>
          <ul>
            {guide.notes.map((note, idx) => (
              <li key={idx} style={{ marginBottom: 6, color: '#d46b08' }}>{note}</li>
            ))}
          </ul>
        </Card>
      </div>
    );
  };

  return (
    <div className="menu-guide-container">
      <Card className="menu-guide-header">
        <div className="title-row">
          <h1>菜单使用说明</h1>
          <span className="subtitle">商城功能模块操作指南</span>
        </div>
      </Card>

      <Card className="menu-guide-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left"
          style={{ minHeight: 500 }}
          items={modules.map((m) => ({
            key: m.key,
            label: m.label,
            children: renderGuide(),
          }))}
        />
      </Card>
    </div>
  );
};

export default MenuGuide;