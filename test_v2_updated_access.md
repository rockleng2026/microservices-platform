# V2版本模型实例管理更新测试指南

## 🎯 更新内容
模型实例管理页面已从根目录移动到v2目录下，所有相关链接已更新

## 📋 测试步骤

### 1. 访问V2版本财务模型管理页面
- 打开浏览器访问: http://localhost:8001/saleops-optimizer/financial-analysis/v2/financial-models
- 确认页面正常加载，显示"财务模型管理 V2"标题

### 2. 点击实例管理图标
- 在模型列表的操作列中点击"📦 实例管理"图标
- 应该在新标签页中打开: http://localhost:8001/saleops-optimizer/financial-analysis/v2/model-instances?modelId=1
- URL路径现在包含v2版本标识

### 3. 验证V2版本实例管理页面
- 确认新标签页正常加载
- 页面标题应该显示模型实例管理相关内容
- 检查是否只显示该模型的实例
- 验证所有功能组件正常工作

### 4. 测试组件功能
- **实例表单**: 点击"新建实例"按钮
- **实例详情**: 点击实例行的"查看详情"
- **变量编辑**: 点击"变量编辑"按钮
- **计算历史**: 点击"计算历史"按钮
- **实例克隆**: 点击"克隆"按钮

## 🔧 路由验证

### 主要路由
- **V2财务模型管理**: `/saleops-optimizer/financial-analysis/v2/financial-models`
- **V2模型实例管理**: `/saleops-optimizer/financial-analysis/v2/model-instances`
- **V2变量管理**: `/saleops-optimizer/financial-analysis/v2/variable-management`
- **V2图表管理**: `/saleops-optimizer/financial-analysis/v2/chart-management`

### 跳转链接验证
- 从V2财务模型管理 → V2模型实例管理 ✅
- 从V2财务模型管理 → V2变量管理 ✅
- 从V2财务模型管理 → V2图表管理 ✅

## ✅ 成功标志

- ✅ V2版本财务模型管理页面正常加载
- ✅ 实例管理图标正确显示
- ✅ 点击图标跳转到V2版本实例管理页面
- ✅ URL路径包含v2版本标识
- ✅ 实例管理页面所有功能正常工作
- ✅ 组件导入路径正确
- ✅ 样式文件正确加载

## 🐛 问题排查

### 如果页面无法加载
1. 检查路由配置是否正确
2. 确认组件文件存在于v2目录下
3. 检查导入路径是否正确
4. 查看浏览器控制台错误信息

### 如果组件功能异常
1. 检查components目录下的组件文件
2. 确认样式文件路径正确
3. 验证API调用是否正常
4. 检查网络请求状态

### 如果跳转失败
1. 确认路由配置已更新
2. 检查URL路径是否正确
3. 验证modelId参数传递
4. 确认新标签页没有被阻止

## 📁 文件结构验证

```
v2/
├── FinancialModelManagement.tsx ✅
├── ModelInstanceManagement.tsx ✅
├── VariableManagement.tsx ✅
├── ChartManagement.tsx ✅
├── BreakevenAnalysisPage.tsx ✅
├── ApiTestPage.tsx ✅
├── components/
│   ├── InstanceForm.tsx ✅
│   ├── InstanceDetail.tsx ✅
│   ├── VariableEditor.tsx ✅
│   ├── CalculationHistory.tsx ✅
│   └── ... (其他组件)
└── styles/
    └── ModelInstanceManagement.less ✅
```

## 🎉 完成测试

一旦所有测试通过，说明V2版本的模型实例管理功能已经完全迁移并正常工作！

用户现在可以：
1. 在V2版本财务模型管理页面查看所有模型
2. 点击任意模型的"📦 实例管理"图标
3. 在新标签页中打开V2版本的实例管理页面
4. 使用完整的V2版本功能进行实例管理

## 📝 版本对比

| 功能 | 原版本 | V2版本 |
|------|--------|--------|
| 页面路径 | /financial-analysis/model-instances | /financial-analysis/v2/model-instances |
| 组件位置 | /FinancialAnalysis/ | /FinancialAnalysis/v2/ |
| 样式文件 | /FinancialAnalysis/styles/ | /FinancialAnalysis/v2/styles/ |
| 跳转链接 | 指向原版本 | 指向V2版本 | 