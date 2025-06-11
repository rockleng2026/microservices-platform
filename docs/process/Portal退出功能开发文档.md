# Portal Web 退出功能开发文档

## 概述

本文档描述了Portal Web退出登录功能的完整实现，该功能参考了layui-web和react-web的最佳实践，提供了安全、可靠、用户友好的退出体验。

## 功能特性

### ✅ 核心功能
- **标准OAuth2退出流程** - 调用后端 `/api-uaa/oauth/remove/token` 接口
- **智能本地存储清理** - 清除所有相关的token和用户数据
- **优雅的错误处理** - 网络异常时提供强制退出选项
- **确认对话框** - 参考layui-web的用户确认交互
- **加载状态反馈** - 完整的加载和成功/失败提示

### ✅ 用户体验
- **防误操作** - 退出前弹出确认对话框
- **状态反馈** - 显示退出进度和结果
- **错误恢复** - 网络异常时仍可强制退出
- **页面重定向** - 自动跳转到登录页面并保留重定向参数

### ✅ 开发体验
- **可重用组件** - `LogoutConfirm` 组件可在任何地方使用
- **灵活配置** - 支持多种按钮样式和自定义渲染
- **回调支持** - 提供退出前确认、成功和失败回调
- **TypeScript支持** - 完整的类型定义

## 技术架构

### 1. 服务层 (`src/services/auth.ts`)

```typescript
// 标准退出流程
export async function logout()

// 快速退出（仅清理本地数据）
export async function quickLogout()

// 检查登录状态
export function isLoggedIn(): boolean

// 内部工具函数
function clearLocalStorage()
function redirectToLogin()
```

### 2. 组件层 (`src/components/LogoutConfirm/index.tsx`)

```typescript
interface LogoutConfirmProps {
  buttonType?: 'text' | 'link' | 'default' | 'primary' | 'ghost' | 'dashed';
  buttonText?: string;
  showIcon?: boolean;
  className?: string;
  renderButton?: (onClick: () => void, loading: boolean) => React.ReactNode;
  beforeLogout?: () => boolean | Promise<boolean>;
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: any) => void;
}
```

### 3. 布局层 (`src/layouts/BasicLayout.tsx`)

在主布局中集成退出功能，提供统一的用户界面。

## 使用方法

### 基本使用

```tsx
import LogoutConfirm from '@/components/LogoutConfirm';

// 最简单的使用
<LogoutConfirm />

// 自定义按钮文本
<LogoutConfirm buttonText="安全退出" />

// 不同按钮类型
<LogoutConfirm buttonType="primary" buttonText="立即退出" />
```

### 高级使用

```tsx
// 带回调函数
<LogoutConfirm
  buttonText="退出登录"
  beforeLogout={async () => {
    // 退出前的数据保存确认
    return await saveData();
  }}
  onLogoutSuccess={() => {
    console.log('退出成功');
  }}
  onLogoutError={(error) => {
    console.error('退出失败:', error);
  }}
/>

// 自定义渲染
<LogoutConfirm
  renderButton={(onClick, loading) => (
    <Button 
      type="primary" 
      danger 
      onClick={onClick}
      loading={loading}
    >
      立即退出
    </Button>
  )}
/>
```

## 后端接口

### 退出登录接口

```
POST /api-uaa/oauth/remove/token
Authorization: Bearer {access_token}
Content-Type: application/x-www-form-urlencoded
```

**说明：**
- 该接口会在服务端撤销access_token
- 即使接口调用失败，前端也会清理本地存储
- 支持统一登出（如果配置了的话）

## 参考实现对比

### layui-web 参考点
- 使用 `layer.confirm` 确认对话框
- 使用 `location.replace('/logout')` 跳转
- 简单直接的用户交互

```javascript
$('#btnLogout').click(function () {
    layer.confirm('确定退出登录？', function () {
        location.replace('/logout');
    });
});
```

### react-web 参考点
- 异步处理和错误恢复
- 状态管理和加载反馈
- 组件化和可重用性

```typescript
const loginOut = async () => {
  await outLogin();
  const { query = {}, search, pathname } = history.location;
  const { redirect } = query;
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
};
```

## 错误处理策略

### 1. 网络异常
- 显示错误信息
- 提供"强制退出"选项
- 确保用户总是能够退出

### 2. 接口失败
- 记录错误日志
- 继续执行本地清理
- 给用户明确的操作指引

### 3. 本地存储清理
- 清除所有相关的localStorage项
- 清空sessionStorage
- 确保不遗留敏感数据

## 安全考虑

### 1. Token管理
- 及时清除access_token和refresh_token
- 检查token过期时间
- 防止token泄露

### 2. 页面跳转
- 使用`location.replace`避免浏览器回退
- 保留重定向参数用于登录后跳转
- 防止未授权访问

### 3. 数据清理
- 清理用户信息和权限数据
- 清理临时缓存
- 确保完全登出

## 测试建议

### 1. 功能测试
- 正常退出流程
- 网络异常情况
- 接口失败情况
- 强制退出功能

### 2. 用户体验测试
- 确认对话框交互
- 加载状态显示
- 错误信息提示
- 页面跳转流畅性

### 3. 安全测试
- Token是否完全清理
- 是否能够回退到登录前页面
- 敏感数据是否泄露

## 部署注意事项

### 1. 环境配置
- 确保API_BASE地址正确
- 确认后端退出接口可用
- 检查路由配置

### 2. 浏览器兼容性
- 测试localStorage支持
- 测试fetch API支持
- 测试ES6语法支持

### 3. 性能优化
- 组件懒加载
- 减少不必要的重渲染
- 优化错误处理逻辑

## 总结

Portal Web的退出功能实现了：

1. **安全可靠** - 完整的服务端token撤销和本地数据清理
2. **用户友好** - 清晰的确认流程和状态反馈
3. **开发友好** - 可重用的组件和灵活的配置选项
4. **错误恢复** - 网络异常时的优雅降级处理

该实现参考了layui-web的简洁交互和react-web的技术架构，为Portal 3.0提供了企业级的退出登录解决方案。 