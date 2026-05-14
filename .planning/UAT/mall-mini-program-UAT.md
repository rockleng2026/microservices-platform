# UAT Report - 小程序验证

**日期**: 2026-05-13
**环境**: H5模式，手机浏览器IP+端口访问
**主分支**: portal

---

## 测试结果汇总

| 测试项 | 状态 | 说明 |
|--------|------|------|
| 首页Banner图片 | ✅ PASS | Banner图片显示正常 |
| 热门推荐商品图片 | ❌ FAIL | 商品图片URL为localhost，无法手机访问 |
| 用户头像显示 | ❌ FAIL | 空白圆圈，未登录/已登录均不显示 |
| 个人主页点击 | ❌ FAIL | `onLoad` 导入错误导致页面无法加载 |

---

## 问题1: 热门推荐商品图片不显示（localhost问题）

**严重程度**: 高

**现象**: Banner图片正常，但热门推荐商品图片为 `http://localhost:5000/files/local/...` 格式

**根因分析**:
- `LocalFileService.java:20` 硬编码了 `GATEWAY_BASE = "http://localhost:9900/api-file"`
- 后端返回的商品图片URL包含完整的 localhost 地址
- 手机无法访问电脑的 localhost

**修复计划**:
- [ ] 后端 `LocalFileService.java` 应根据请求的 Host header 动态生成URL，或使用配置的中心地址
- [ ] 前端临时方案：在图片显示前做URL替换
- [ ] 根本解决：文件服务使用 Nginx 代理，所有环境统一域名

---

## 问题2: 用户头像显示空白

**严重程度**: 高

**现象**: 我的页面左上角和编辑资料页面头像都是空白圆圈

**根因分析**:
- `/static/default-avatar.png` 在 H5 打包后路径解析可能有问题
- 没有使用 base64 内联默认头像作为 fallback

**修复计划**:
- [x] 创建 `src/utils/helpers.ts` 包含 base64 SVG 默认头像
- [x] 用户页和编辑资料页使用 data URI 作为默认头像 fallback

---

## 问题3: onLoad 导入错误

**严重程度**: 高

**错误**:
```
SyntaxError: The requested module '/node_modules/@dcloudio/uni-h5-vue/dist/vue.runtime.esm.js' does not provide an export named 'onLoad' (at profile.vue:109:34)
```

**根因分析**:
- `profile.vue` 从 vue 导入 `onLoad`: `import { ref, onLoad } from 'vue'`
- uni-app 的 `onLoad` 是从 `@dcloudio/uni-app` 导入的生命周期钩子，不是 Vue 提供的

**修复计划**:
- [x] 将 `onLoad` 导入改为: `import { onLoad } from '@dcloudio/uni-app'`

---

## 已修复文件

| 文件 | 修复内容 |
|------|----------|
| `profile.vue:109` | `import { ref, onLoad }` → `import { onLoad } from '@dcloudio/uni-app'` |
| `user/index.vue` | 添加 `getAvatarSrc()` 函数使用 base64 默认头像 |
| `profile.vue` | 添加 `getAvatarSrc()` 函数，修复 `onLoad` 调用 `getLocalUserInfo()` |
| `src/utils/helpers.ts` | 新增文件，包含图片URL处理函数和 base64 默认头像 |

---

## 待验证清单

- [ ] 修复 `onLoad` 导入后，编辑资料页面能否正常加载
- [ ] 添加 base64 默认头像后，头像是否显示灰色用户图标
- [ ] 商品图片 URL 问题需要后端修复或前端临时处理