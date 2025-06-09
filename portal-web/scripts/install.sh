#!/bin/bash

# Portal 3.0 前端项目自动化安装脚本
# Author: Portal Team
# Version: 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Node.js版本
check_node_version() {
    log_info "检查Node.js版本..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js >= 18.0.0"
        log_info "下载地址: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        log_error "Node.js 版本过低，当前版本: $NODE_VERSION，要求版本: >= $REQUIRED_VERSION"
        exit 1
    fi
    
    log_success "Node.js 版本检查通过: $NODE_VERSION"
}

# 检查包管理器
check_package_manager() {
    log_info "检查包管理器..."
    
    if command -v yarn &> /dev/null; then
        PACKAGE_MANAGER="yarn"
        YARN_VERSION=$(yarn -v)
        log_success "检测到 Yarn: $YARN_VERSION"
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
        NPM_VERSION=$(npm -v)
        log_success "检测到 npm: $NPM_VERSION"
    else
        log_error "未找到包管理器 (npm 或 yarn)"
        exit 1
    fi
}

# 清理缓存
clean_cache() {
    log_info "清理缓存..."
    
    # 删除 node_modules
    if [ -d "node_modules" ]; then
        log_info "删除 node_modules 目录..."
        rm -rf node_modules
    fi
    
    # 删除 .umi 缓存
    if [ -d ".umi" ]; then
        log_info "删除 .umi 缓存..."
        rm -rf .umi
    fi
    
    # 删除 .umi-production 缓存
    if [ -d ".umi-production" ]; then
        log_info "删除 .umi-production 缓存..."
        rm -rf .umi-production
    fi
    
    # 删除 dist 目录
    if [ -d "dist" ]; then
        log_info "删除 dist 目录..."
        rm -rf dist
    fi
    
    # 清理包管理器缓存
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        log_info "清理 Yarn 缓存..."
        yarn cache clean
    else
        log_info "清理 npm 缓存..."
        npm cache clean --force
    fi
    
    log_success "缓存清理完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn install --frozen-lockfile
    else
        npm install
    fi
    
    log_success "依赖安装完成"
}

# TypeScript 类型检查
type_check() {
    log_info "执行 TypeScript 类型检查..."
    
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn type-check
    else
        npm run type-check
    fi
    
    log_success "TypeScript 类型检查通过"
}

# 检查项目配置
check_project_config() {
    log_info "检查项目配置文件..."
    
    CONFIG_FILES=(
        "package.json"
        ".umirc.ts"
        "tsconfig.json"
        ".eslintrc.js"
        ".prettierrc"
        "typings.d.ts"
    )
    
    for file in "${CONFIG_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "配置文件缺失: $file"
            exit 1
        fi
    done
    
    log_success "项目配置文件检查完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录结构..."
    
    DIRECTORIES=(
        "public"
        "src/components"
        "src/pages/Login"
        "src/pages/Organization/Departments"
        "src/pages/Organization/Positions"
        "src/pages/CRM/Customers"
        "src/pages/System/Users"
        "src/pages/System/Roles"
        "src/pages/System/Permissions"
        "src/utils"
        "src/models"
        "src/hooks"
    )
    
    for dir in "${DIRECTORIES[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_info "创建目录: $dir"
        fi
    done
    
    log_success "目录结构创建完成"
}

# 显示项目信息
show_project_info() {
    log_info "项目信息:"
    echo "  名称: Portal 3.0 前端工程"
    echo "  技术栈: React + TypeScript + Ant Design Pro + UmiJS"
    echo "  开发端口: 8066"
    echo "  API代理: http://localhost:9900"
    echo ""
    log_info "可用命令:"
    echo "  $PACKAGE_MANAGER run dev          # 启动开发服务器"
    echo "  $PACKAGE_MANAGER run build        # 构建生产版本"
    echo "  $PACKAGE_MANAGER run lint         # 代码检查"
    echo "  $PACKAGE_MANAGER run type-check   # TypeScript类型检查"
    echo ""
}

# 主函数
main() {
    echo "======================================"
    echo "   Portal 3.0 前端项目安装脚本"
    echo "======================================"
    echo ""
    
    # 检查环境
    check_node_version
    check_package_manager
    check_project_config
    
    # 清理和安装
    clean_cache
    create_directories
    install_dependencies
    
    # 类型检查
    if [ "${1:-}" != "--skip-type-check" ]; then
        type_check
    else
        log_warning "跳过 TypeScript 类型检查"
    fi
    
    echo ""
    log_success "项目安装完成！"
    echo ""
    show_project_info
    
    # 询问是否启动开发服务器
    echo ""
    read -p "是否立即启动开发服务器? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "启动开发服务器..."
        if [ "$PACKAGE_MANAGER" = "yarn" ]; then
            yarn dev
        else
            npm run dev
        fi
    else
        log_info "使用 '$PACKAGE_MANAGER run dev' 启动开发服务器"
    fi
}

# 错误处理
trap 'log_error "安装过程中发生错误，脚本退出"; exit 1' ERR

# 执行主函数
main "$@" 