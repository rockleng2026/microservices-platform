#!/bin/bash

# 多维表格系统前端项目初始化脚本
echo "🚀 正在初始化多维表格系统前端项目..."

# 检查Node.js版本
echo "📋 检查环境..."
node_version=$(node -v 2>/dev/null || echo "未安装")
npm_version=$(npm -v 2>/dev/null || echo "未安装")

echo "Node.js 版本: $node_version"
echo "npm 版本: $npm_version"

if [ "$node_version" = "未安装" ]; then
    echo "❌ 请先安装 Node.js (推荐版本 >= 16.0.0)"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")/.."
echo "📁 当前目录: $(pwd)"

# 安装依赖
echo "📦 安装项目依赖..."
if command -v yarn >/dev/null 2>&1; then
    echo "使用 yarn 安装依赖..."
    yarn install
else
    echo "使用 npm 安装依赖..."
    npm install
fi

# 检查安装结果
if [ $? -eq 0 ]; then
    echo "✅ 依赖安装完成"
else
    echo "❌ 依赖安装失败，请检查网络连接或手动安装"
    exit 1
fi

# 创建环境变量文件
if [ ! -f ".env.local" ]; then
    echo "📝 创建环境变量文件..."
    cat > .env.local << EOF
# 开发环境配置
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=多维表格系统
VITE_APP_VERSION=1.0.0

# VTable配置
VITE_VTABLE_LICENSE=
VITE_VTABLE_THEME=default

# 调试模式
VITE_DEBUG=true
EOF
    echo "✅ 环境变量文件已创建: .env.local"
fi

echo ""
echo "🎉 项目初始化完成！"
echo ""
echo "📚 快速开始:"
echo "  npm run dev     # 启动开发服务器"
echo "  npm run build   # 构建生产版本"
echo "  npm run preview # 预览生产构建"
echo "  npm run lint    # 代码检查"
echo ""
echo "🌐 开发服务器地址: http://localhost:3000"
echo "📖 项目文档: ./README.md"
echo ""
echo "✨ 祝您开发愉快！" 