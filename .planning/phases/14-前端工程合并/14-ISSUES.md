# 14-前端工程合并 - 问题记录

## 问题：图片上传失败

### 现象
- 请求 URL: `http://localhost:8001/api-file/files-anon` 或 `http://localhost:5000/files-anon`
- 请求头部没有 `x-tenant-header` 租户ID
- 图片上传返回错误

### 原因分析
1. **file-center** 没有接入网关统一认证，无法获取租户上下文
2. 上传请求直接打到 file-center，没有经过网关
3. file-center 是独立服务，需要单独处理租户问题

### 当前状态
- file-center 运行在 localhost:5000
- ImageUploader 配置直接上传到 `http://localhost:5000/files-anon`
- LocalFileService 存储路径改为 `C:\Users\lengz/file-center-data/files/`

### 待解决
~~1. file-center 需要接入租户拦截器~~ ✅ 已修复：新增 TenantInterceptor + WebMvcConfig
~~2. 上传时前端手动传递租户ID，file-center 从请求参数读取~~ ✅ 已修复：改用 request 工具自动携带 x-tenant-header

## 修改文件清单
- `zlt-web/portal-web/.umirc.ts` - 添加 /api-mall, /api-file 代理配置
- `zlt-web/portal-web/src/pages/MallAdmin/Goods/components/GoodsModal.tsx` - 商品类型Radio显示修复
- `zlt-web/portal-web/src/pages/MallAdmin/Goods/components/ImageUploader.tsx` - 图片上传地址修改 ✅ 已修复
- `zlt-business/file-center/src/main/java/com/central/file/service/impl/LocalFileService.java` - 存储路径修改
- `zlt-business/file-center/src/main/java/com/central/file/controller/LocalFileController.java` - 新增本地文件访问接口
- `zlt-business/file-center/src/main/java/com/central/file/config/TenantInterceptor.java` - 新增租户拦截器 ✅ 新增
- `zlt-business/file-center/src/main/java/com/central/file/config/WebMvcConfig.java` - 注册租户拦截器 ✅ 新增

## 数据库修改
- central_mall 所有表的 tenant_id 从 'SUPER' 改为 'default'
- AdminGoodsServiceImpl 默认租户从 'SUPER' 改为 'UNKNOWN'
- SQL初始化文件同步更新