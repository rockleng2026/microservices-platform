#!/bin/bash
# 文件名: scripts/build-test.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo "=========================================="
echo "    Portal Web - 测试环境构建"
echo "=========================================="
echo ""

# 设置环境变量
export NODE_ENV=test
export API_GATEWAY_URL=${API_GATEWAY_URL:-"http://test-gateway.example.com:9900"}

print_info "开始构建测试环境..."
print_info "API网关地址: $API_GATEWAY_URL"

# 构建项目
npm run build

print_success "测试环境构建完成！"
print_info "构建文件位于: ./dist"
