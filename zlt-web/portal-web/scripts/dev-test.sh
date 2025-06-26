#!/bin/bash
# 文件名: scripts/dev-test.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印标题
echo "=========================================="
echo "    Portal Web - Ubuntu 测试环境启动"
echo "=========================================="
echo ""

# 检查Node.js版本
print_info "检查Node.js环境..."
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装！请先安装 Node.js 16+ 版本"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js 版本过低（当前: $(node -v)），需要 16+ 版本"
    exit 1
fi

print_success "Node.js 版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    print_error "npm 未安装！"
    exit 1
fi

print_success "npm 版本: $(npm -v)"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    print_error "请在项目根目录（portal-web）下运行此脚本"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    print_warning "依赖未安装，正在安装..."
    npm install
fi

# 设置测试环境变量
print_info "设置测试环境变量..."
export NODE_ENV=test
export API_GATEWAY_URL=${API_GATEWAY_URL:-"http://test-gateway.example.com:9900"}
export PORT=${PORT:-8001}

print_success "环境变量设置完成:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - API_GATEWAY_URL: $API_GATEWAY_URL"
echo "  - PORT: $PORT"
echo ""

# 清理缓存（可选）
if [ "$1" = "--clean" ]; then
    print_info "清理缓存..."
    rm -rf .umi
    rm -rf node_modules/.cache
    print_success "缓存清理完成"
fi

# 启动开发服务器
print_info "启动测试环境开发服务器..."
echo "访问地址: http://localhost:$PORT"
echo "按 Ctrl+C 停止服务器"
echo ""

# 使用Linux兼容的PORT设置方式启动
PORT=$PORT npm run dev
