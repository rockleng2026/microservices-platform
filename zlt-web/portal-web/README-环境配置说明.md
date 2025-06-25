# 环境配置说明

## API 统一配置优化完成

✅ 已成功将所有硬编码的 `http://127.0.0.1:9900` 地址统一到配置文件中管理！

## 🎯 配置文件位置

### 主配置文件
- **`src/config/api.ts`** - 统一API配置管理中心
  - 支持多环境配置（开发、测试、生产）
  - 类型安全的TypeScript实现
  - 便捷的工具函数

### 构建配置
- **`.umirc.ts`** - 已更新支持环境变量配置

## 🚀 快速使用

### 1. 环境切换
修改 `src/config/api.ts` 中的配置：

```typescript
const SERVICE_CONFIG = {
  development: {
    GATEWAY_URL: 'http://你的开发服务器:9900',
    API_BASE_URL: 'http://你的开发服务器:9900',
  },
  test: {
    GATEWAY_URL: 'http://你的测试服务器:9900',
    API_BASE_URL: 'http://你的测试服务器:9900',
  },
  production: {
    GATEWAY_URL: 'http://你的生产服务器:9900',
    API_BASE_URL: 'http://你的生产服务器:9900',
  }
};
```

### 2. 环境变量配置（可选）
创建 `.env.local` 文件（此文件会被gitignore）：

```bash
# API 网关地址
API_GATEWAY_URL=http://你的服务器:9900

# 环境标识
NODE_ENV=development
```

### 3. 部署时配置
通过环境变量设置：

```bash
# Linux/Mac
export API_GATEWAY_URL=http://prod-server:9900

# Windows
set API_GATEWAY_URL=http://prod-server:9900

# Docker
docker run -e API_GATEWAY_URL=http://prod-server:9900 your-app
```

## 📊 迁移成果

### 已更新的文件
- ✅ `src/config/api.ts` - 统一配置文件（新建）
- ✅ `src/services/auth.ts` - 认证服务
- ✅ `src/services/organization.ts` - 组织架构服务
- ✅ `src/services/portal.ts` - 门户服务
- ✅ `src/pages/Login/index.tsx` - 登录页面
- ✅ `.umirc.ts` - 构建配置

### 配置架构
```
统一配置架构:
├── 基础配置层
│   ├── API_BASE_URL (基础地址)
│   ├── GATEWAY_URL (网关地址)
│   └── ENV_INFO (环境信息)
├── 服务端点层
│   ├── UAA (认证服务)
│   ├── PORTAL (门户服务)
│   ├── ORGANIZATION (组织架构)
│   ├── PROJECT (项目管理)
│   └── ... (其他服务)
└── 具体路径层
    ├── LOGIN (登录接口)
    ├── CURRENT_USER (当前用户)
    ├── CAPTCHA (验证码)
    └── ... (其他路径)
```

## 🛠️ 开发指南

### 在服务文件中使用
```typescript
// 引入统一配置
import { API_ENDPOINTS, API_PATHS, getApiUrl } from '@/config/api';

// 方式1：使用预定义路径
const userInfo = await request(API_PATHS.CURRENT_USER);

// 方式2：使用服务端点
const deptList = await request(getApiUrl('/api/organization/departments', 'ORGANIZATION'));

// 方式3：使用工具函数
const customApi = await request(getApiUrl('/custom/api/path'));
```

### 添加新服务
在 `src/config/api.ts` 中添加：

```typescript
export const API_ENDPOINTS = {
  // ... 现有服务
  NEW_SERVICE: `${API_BASE_URL}/api-new-service`,
};

export const API_PATHS = {
  // ... 现有路径
  NEW_API: `${API_ENDPOINTS.NEW_SERVICE}/your/path`,
};
```

## 🔧 调试支持

### 开发环境调试信息
开发环境下会在控制台显示配置信息：

```
🔧 API 配置信息: {
  environment: "development",
  baseUrl: "http://127.0.0.1:9900",
  endpoints: {...}
}
```

### 动态环境切换（仅开发环境）
```typescript
import { switchEnvironment } from '@/config/api';

// 在开发环境中临时切换到测试环境
switchEnvironment('test');
```

## 📋 验证清单

### 功能验证
- [ ] 登录功能正常（验证码显示和提交）
- [ ] 用户信息获取正常
- [ ] 组织架构功能正常（部门、员工、岗位管理）
- [ ] 项目管理功能正常
- [ ] 其他业务功能正常

### 环境切换验证
- [ ] 开发环境正常运行
- [ ] 修改配置后能成功切换到其他环境
- [ ] 构建生产版本正常
- [ ] 部署测试正常

### 性能验证
- [ ] API请求正常
- [ ] 响应时间无明显变化
- [ ] 内存使用正常

## 🚨 注意事项

1. **配置文件安全**：不要将生产环境配置提交到公共代码库
2. **环境变量优先级**：环境变量会覆盖配置文件中的设置
3. **缓存清理**：修改配置后可能需要清理浏览器缓存
4. **CORS配置**：确保新的API地址正确配置了CORS

## 📞 故障排除

### 常见问题

**Q: 修改配置后页面报错？**
A: 检查网络面板，确认API请求地址是否正确，并清理浏览器缓存。

**Q: 环境变量不生效？**
A: 重启开发服务器，环境变量修改需要重启才能生效。

**Q: 验证码不显示？**
A: 检查 `API_PATHS.CAPTCHA` 配置是否正确，确认API服务正常运行。

**Q: 部署后API请求失败？**
A: 检查生产环境的API地址配置，确认服务器网络连通性。

---

## 🎉 优化完成！

通过此次API统一配置优化：

✅ **统一管理**：所有API地址集中在一个配置文件中  
✅ **环境切换**：修改配置即可快速切换环境  
✅ **类型安全**：TypeScript确保配置使用的正确性  
✅ **开发友好**：提供调试信息和便捷工具函数  
✅ **部署简化**：支持环境变量覆盖，便于CI/CD集成  

现在您可以方便地进行环境切换和部署管理了！🚀 