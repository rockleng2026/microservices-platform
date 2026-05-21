import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Tabs, Input, Tag, Table, Empty, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import mermaid from 'mermaid';
import apiDocsData from './data/api-docs.json';
import './index.less';

// Initialize mermaid once
mermaid.initialize({ startOnLoad: false, theme: 'default' });

const { Search } = Input;

// 模块列表 - 按模块分组展示接口文档
const modules = [
  { key: 'goods', label: '商品模块' },
  { key: 'order', label: '订单模块' },
  { key: 'user', label: '用户模块' },
  { key: 'coupon', label: '优惠券模块' },
  { key: 'marketing', label: '营销模块' },
  { key: 'admin', label: '管理模块' },
];

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  parameters: Array<{
    name: string;
    in: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responseFormat: string;
  businessLogic: string;
  flowchart?: string;
}

interface Controller {
  name: string;
  tag: string;
  description: string;
  endpoints: Endpoint[];
}

interface Module {
  key: string;
  label: string;
  controllers: Controller[];
}

// 转换JSON数据为模块结构
const modulesData = apiDocsData.modules as Module[];

// HTTP方法颜色映射
const methodColors: Record<string, string> = {
  GET: 'green',
  POST: 'blue',
  PUT: 'orange',
  DELETE: 'red',
};

// 参数字段定义
const paramColumns: ColumnsType<Endpoint['parameters'][0]> = [
  {
    title: '参数名',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    render: (name: string) => <code style={{ fontSize: 12 }}>{name}</code>,
  },
  {
    title: '位置',
    dataIndex: 'in',
    key: 'in',
    width: 70,
    render: (inVal: string) => {
      const colors: Record<string, string> = { path: 'purple', query: 'blue', body: 'orange', header: 'cyan' };
      return <Tag color={colors[inVal] || 'default'}>{inVal}</Tag>;
    },
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    render: (type: string) => <code style={{ fontSize: 12 }}>{type}</code>,
  },
  {
    title: '必填',
    dataIndex: 'required',
    key: 'required',
    width: 60,
    render: (required: boolean) => (required ? <Tag color="red">必填</Tag> : <Tag color="gray">可选</Tag>),
  },
  {
    title: '说明',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    render: (text: string) => <Tooltip title={text}><span>{text}</span></Tooltip>,
  },
];

const ApiDoc: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('goods');
  const [searchText, setSearchText] = useState<string>('');
  const mermaidInitialized = useRef(false);

  // Render mermaid diagrams when tab or endpoints change
  useEffect(() => {
    if (!mermaidInitialized.current) {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      mermaidInitialized.current = true;
    }
    // Use a small delay to ensure DOM is ready after render
    const timer = setTimeout(() => {
      const container = document.querySelector('.api-doc-content');
      if (container) {
        mermaid.run({ nodes: container.querySelectorAll('.mermaid') });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // 当前模块数据
  const currentModule = useMemo(() => {
    return modulesData.find((m) => m.key === activeTab);
  }, [activeTab]);

  // 过滤后的端点（跨所有Controller）
  const filteredEndpoints = useMemo(() => {
    if (!currentModule) return [];
    if (!searchText.trim()) {
      return currentModule.controllers.flatMap((c) => c.endpoints);
    }
    const lower = searchText.toLowerCase();
    return currentModule.controllers
      .flatMap((c) => c.endpoints.map((e) => ({ endpoint: e, controller: c })))
      .filter(
        ({ endpoint: e, controller: c }) =>
          e.path.toLowerCase().includes(lower) ||
          e.summary.toLowerCase().includes(lower) ||
          e.businessLogic.toLowerCase().includes(lower) ||
          c.name.toLowerCase().includes(lower) ||
          c.tag.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower),
      )
      .map(({ endpoint: e }) => e);
  }, [currentModule, searchText]);

  // 渲染单个端点卡片
  const renderEndpointCard = (endpoint: Endpoint, controllerName: string) => (
    <Card
      key={`${controllerName}-${endpoint.method}-${endpoint.path}`}
      size="small"
      style={{ marginBottom: 16 }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color={methodColors[endpoint.method] || 'default'} style={{ marginRight: 0 }}>
            {endpoint.method}
          </Tag>
          <code style={{ fontSize: 13 }}>{endpoint.path}</code>
        </span>
      }
      extra={<Tag>{endpoint.responseFormat}</Tag>}
    >
      {/* 接口名称 */}
      <div style={{ marginBottom: 8 }}>
        <strong>接口说明：</strong>
        <span>{endpoint.summary}</span>
      </div>

      {/* 业务逻辑 */}
      <div style={{ marginBottom: 12, color: '#555' }}>
        <strong>业务逻辑：</strong>
        <span>{endpoint.businessLogic}</span>
      </div>

      {/* 流程图 */}
      {endpoint.flowchart && (
        <div style={{ marginBottom: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <strong>流程图：</strong>
          <pre className="mermaid" style={{ marginTop: 8 }}>
            {endpoint.flowchart.replace(/^```mermaid\n?|```$/g, '')}
          </pre>
        </div>
      )}

      {/* 参数表格 */}
      {endpoint.parameters.length > 0 ? (
        <Table
          columns={paramColumns}
          dataSource={endpoint.parameters}
          rowKey="name"
          pagination={false}
          size="small"
        />
      ) : (
        <div style={{ color: '#999', fontStyle: 'italic' }}>无请求参数</div>
      )}
    </Card>
  );

  // 渲染Controller分组
  const renderControllers = () => {
    if (!currentModule) return null;

    // 如果有搜索词，按过滤结果展示
    if (searchText.trim()) {
      if (filteredEndpoints.length === 0) {
        return <Empty description={`未找到包含"${searchText}"的接口`} />;
      }
      return filteredEndpoints.map((ep, idx) => {
        const ctrl = currentModule.controllers.find((c) =>
          c.endpoints.some((e) => e.path === ep.path && e.method === ep.method),
        );
        return (
          <div key={`filtered-${idx}`}>
            <div style={{ marginBottom: 4, color: '#999', fontSize: 12 }}>
              {ctrl?.name} — {ctrl?.tag}
            </div>
            {renderEndpointCard(ep, ctrl?.name || '')}
          </div>
        );
      });
    }

    // 正常按Controller分组展示
    return currentModule.controllers.map((ctrl) => (
      <div key={ctrl.name} style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h3 style={{ margin: 0 }}>{ctrl.name}</h3>
          <Tag color="blue">{ctrl.tag}</Tag>
          <span style={{ color: '#999', fontSize: 12 }}>{ctrl.description}</span>
        </div>
        {ctrl.endpoints.map((endpoint) => renderEndpointCard(endpoint, ctrl.name))}
      </div>
    ));
  };

  return (
    <div className="api-doc-container">
      <Card className="api-doc-header">
        <div className="api-doc-title-row">
          <h1 className="api-doc-title">接口文档</h1>
          <span className="api-doc-count">
            共 {filteredEndpoints.length} 个接口
          </span>
        </div>
        <Search
          placeholder="搜索接口路径、名称或业务逻辑..."
          allowClear
          onSearch={(value) => setSearchText(value)}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 360 }}
        />
      </Card>

      <Card className="api-doc-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={modules.map((m) => ({
            key: m.key,
            label: m.label,
            children: renderControllers(),
          }))}
        />
      </Card>
    </div>
  );
};

export default ApiDoc;