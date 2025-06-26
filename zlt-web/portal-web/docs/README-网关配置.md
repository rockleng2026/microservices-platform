# Portal 3.0 前端网关配置说明

## 访问地址变更

### 变更前
- 直接访问前端应用：`http://127.0.0.1:8001/`
- API请求直接代理到后端服务

### 变更后  
- 通过网关访问前端应用：`http://127.0.0.1:9900/api-portal/`
- 所有请求统一通过网关路由

## 配置更改详情

### 1. 前端配置 (.umirc.ts)

```typescript
export default defineConfig({
  // 基础路径配置 - 通过网关访问 (仅在生产环境使用)
  base: process.env.NODE_ENV === 'production' ? '/api-portal/' : '/',
  publicPath: process.env.NODE_ENV === 'production' ? '/api-portal/' : '/',

  // 代理配置 - 开发环境所有API请求代理到网关
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:9900',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api-portal/api',
      },
    },
  },

  // 构建配置
  define: {
    API_BASE_URL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:9900' : '',
  },
});
```

### 2. 配置说明

#### base 和 publicPath
- 开发环境：设置为 `'/'`，确保路由正常工作
- 生产环境：设置为 `'/api-portal/'`，部署到网关的指定路径下
- `base`: 设置应用的基础路径，影响所有路由
- `publicPath`: 设置静态资源的公共路径

#### proxy 代理配置
- `target: 'http://127.0.0.1:9900'`: 指向网关地址
- `pathRewrite: {'^/api': '/api-portal/api'}`: 将 `/api` 重写为 `/api-portal/api`
- `changeOrigin: true`: 修改请求头中的 origin
- `logLevel: 'debug'`: 开启调试日志，便于排查代理问题
- 路径重写说明：
  - 前端请求：`/api/organization/departments/tree`
  - 代理后路径：`/api-portal/api/organization/departments/tree`
  - 最终请求：`http://127.0.0.1:9900/api-portal/api/organization/departments/tree`

#### API_BASE_URL
- 开发环境指向网关地址：`http://127.0.0.1:9900`

## 网关架构

```
前端应用 (http://127.0.0.1:9900/api-portal/)
    ↓
网关 (http://127.0.0.1:9900)
    ↓
├── organization-service (http://localhost:7002)
├── user-service (http://localhost:7001)  
└── 其他微服务...
```

## 启动说明

### 开发环境
1. 确保网关服务运行在 9900 端口
2. 确保各微服务正常运行（如 organization-service 在 7002 端口）
3. 启动前端开发服务器：`npm start`
4. 开发时直接访问：`http://127.0.0.1:8001/` （配置的开发端口）
5. API请求会自动代理到网关 `http://127.0.0.1:9900`
6. 代理日志会在控制台显示，便于调试

### 生产环境
1. 构建前端：`npm run build`
2. 将 dist 目录部署到网关的 `/api-portal/` 路径下
3. 通过网关访问：`http://127.0.0.1:9900/api-portal/`

## 部门管理功能

配置更改后，部门管理功能将：
- 通过网关访问：`http://127.0.0.1:9900/api-portal/organization/departments`
- API请求路径：`/api/organization/departments/*`
- 网关将请求路由到 organization-service (端口7002)

## 注意事项

1. 所有前端路由都会在 `/api-portal/` 路径下
2. API请求会自动代理到网关
3. 确保网关配置正确，能够路由到对应的微服务
4. 开发时可能需要配置网关的CORS策略 