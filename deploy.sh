#!/bin/bash

# 自动化部署脚本
# 功能：检查git更新，如果有更新则重新构建和重启docker-compose

set -e  # 遇到错误立即退出

# 配置变量
PROJECT_NAME="next-demo"
COMPOSE_FILE="docker-compose.yml"
LOG_FILE="deploy.log"
BACKUP_DIR="backups"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$LOG_FILE"
}

# 检查必要的命令是否存在
check_dependencies() {
    log "检查依赖..."
    
    if ! command -v git &> /dev/null; then
        log_error "Git 未安装"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 创建备份目录
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "创建备份目录: $BACKUP_DIR"
    fi
}

# 备份上传文件
backup_uploads() {
    if [ -d "public/uploads" ] && [ "$(ls -A public/uploads)" ]; then
        local backup_name="uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        log "备份上传文件到: $BACKUP_DIR/$backup_name"
        tar -czf "$BACKUP_DIR/$backup_name" public/uploads/
        log_success "上传文件备份完成"
    else
        log_warning "没有找到上传文件或目录为空，跳过备份"
    fi
}

# 检查git状态
check_git_updates() {
    log "检查Git更新..."
    
    # 获取当前分支
    local current_branch=$(git branch --show-current)
    log "当前分支: $current_branch"
    
    # 获取远程更新
    git fetch origin
    
    # 检查是否有更新
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/$current_branch)
    
    log "本地提交: $local_commit"
    log "远程提交: $remote_commit"
    
    if [ "$local_commit" = "$remote_commit" ]; then
        log_success "代码已是最新版本，无需更新"
        return 1
    else
        log_warning "发现代码更新"
        return 0
    fi
}

# 拉取最新代码
pull_latest_code() {
    log "拉取最新代码..."
    
    # 保存当前状态
    git stash push -m "Auto stash before deploy $(date)"
    
    # 拉取最新代码
    git pull origin $(git branch --show-current)
    
    log_success "代码更新完成"
}

# 停止现有服务
stop_services() {
    log "停止现有服务..."
    
    if docker-compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
        docker-compose -f "$COMPOSE_FILE" down
        log_success "服务已停止"
    else
        log_warning "没有运行中的服务"
    fi
}

# 清理旧镜像
cleanup_old_images() {
    log "清理旧镜像..."
    
    # 删除悬空镜像
    if docker images -f "dangling=true" -q | grep -q .; then
        docker rmi $(docker images -f "dangling=true" -q) 2>/dev/null || true
        log_success "清理悬空镜像完成"
    else
        log "没有悬空镜像需要清理"
    fi
}

# 构建新镜像
build_new_image() {
    log "构建新镜像..."
    
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    log "启动服务..."
    
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "服务启动完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:9393 >/dev/null 2>&1; then
            log_success "服务健康检查通过"
            return 0
        fi
        
        log "健康检查尝试 $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done
    
    log_error "健康检查失败，服务可能未正常启动"
    return 1
}

# 显示服务状态
show_status() {
    log "服务状态:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    log "服务日志 (最后20行):"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20
}

# 发送通知 (可选)
send_notification() {
    local status=$1
    local message=$2
    
    # 这里可以添加通知逻辑，比如发送邮件、Slack消息等
    # 示例：
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$PROJECT_NAME 部署$status: $message\"}" \
    #   YOUR_SLACK_WEBHOOK_URL
    
    log "通知: $PROJECT_NAME 部署$status - $message"
}

# 主函数
main() {
    log "========================================="
    log "开始自动化部署流程"
    log "项目: $PROJECT_NAME"
    log "========================================="
    
    # 检查依赖
    check_dependencies
    
    # 创建备份目录
    create_backup_dir
    
    # 检查git更新
    if ! check_git_updates; then
        log_success "部署完成 - 无需更新"
        exit 0
    fi
    
    # 备份上传文件
    backup_uploads
    
    # 拉取最新代码
    pull_latest_code
    
    # 停止现有服务
    stop_services
    
    # 清理旧镜像
    cleanup_old_images
    
    # 构建新镜像
    if ! build_new_image; then
        log_error "镜像构建失败"
        send_notification "失败" "镜像构建失败"
        exit 1
    fi
    
    # 启动服务
    if ! start_services; then
        log_error "服务启动失败"
        send_notification "失败" "服务启动失败"
        exit 1
    fi
    
    # 健康检查
    if ! health_check; then
        log_error "健康检查失败"
        send_notification "失败" "健康检查失败"
        show_status
        exit 1
    fi
    
    # 显示服务状态
    show_status
    
    log_success "========================================="
    log_success "自动化部署完成！"
    log_success "访问地址: http://localhost:9393"
    log_success "========================================="
    
    send_notification "成功" "部署完成，服务正常运行"
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"; send_notification "失败" "部署过程中发生错误"' ERR

# 执行主函数
main "$@"