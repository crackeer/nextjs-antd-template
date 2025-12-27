# 自动化部署脚本使用说明

本项目提供了完整的自动化部署解决方案，包括Git更新检查、Docker镜像构建和服务重启。

## 脚本文件说明

### 1. `deploy.sh` - 完整版部署脚本
功能最全面的部署脚本，包含：
- 依赖检查
- Git更新检测
- 文件备份
- 健康检查
- 详细日志记录
- 错误处理

### 2. `quick-deploy.sh` - 快速部署脚本
轻量级版本，适合快速部署：
- 简化的更新检查
- 基本的构建和重启流程
- 简洁的输出信息

### 3. `setup-cron.sh` - 定时任务设置脚本
用于设置自动化定时部署：
- 多种定时频率选择
- 自动配置cron任务
- 日志管理

## 快速开始

### 1. 设置执行权限
```bash
chmod +x deploy.sh quick-deploy.sh setup-cron.sh
```

### 2. 手动执行部署
```bash
# 完整版部署
./deploy.sh

# 快速部署
./quick-deploy.sh
```

### 3. 设置自动化部署
```bash
./setup-cron.sh
```

## 使用场景

### 开发环境
推荐使用快速部署脚本，频繁更新：
```bash
# 每5分钟检查一次更新
*/5 * * * * cd /path/to/project && ./quick-deploy.sh >> cron.log 2>&1
```

### 生产环境
推荐使用完整版部署脚本，定时检查：
```bash
# 每天凌晨2点检查更新
0 2 * * * cd /path/to/project && ./deploy.sh >> cron.log 2>&1
```

## 功能特性

### Git更新检测
- 自动检查远程仓库更新
- 只有在有新提交时才执行部署
- 支持多分支部署

### Docker集成
- 自动停止现有服务
- 重新构建镜像（无缓存）
- 启动新服务
- 清理旧镜像

### 数据保护
- 自动备份上传文件
- Git stash保护本地修改
- 错误回滚机制

### 监控和日志
- 详细的部署日志
- 服务健康检查
- 状态通知（可扩展）

## 配置选项

### 环境变量
可以通过环境变量自定义配置：

```bash
export PROJECT_NAME="my-project"
export COMPOSE_FILE="docker-compose.prod.yml"
export LOG_FILE="custom-deploy.log"
export BACKUP_DIR="my-backups"
```

### 通知集成
在 `deploy.sh` 中的 `send_notification` 函数可以集成：
- Slack通知
- 邮件通知
- 企业微信
- 钉钉机器人

示例Slack集成：
```bash
send_notification() {
    local status=$1
    local message=$2
    
    curl -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"$PROJECT_NAME 部署$status: $message\"}" \
      $SLACK_WEBHOOK_URL
}
```

## 故障排除

### 常见问题

1. **权限错误**
```bash
chmod +x *.sh
```

2. **Docker权限问题**
```bash
sudo usermod -aG docker $USER
# 重新登录或执行
newgrp docker
```

3. **Git认证问题**
```bash
# 设置Git凭据
git config --global credential.helper store
```

4. **端口占用**
```bash
# 检查端口占用
lsof -i :9393
# 或修改docker-compose.yml中的端口映射
```

### 日志查看

```bash
# 查看部署日志
tail -f deploy.log

# 查看cron日志
tail -f cron.log

# 查看Docker服务日志
docker-compose logs -f

# 查看系统cron日志
tail -f /var/log/cron
```

### 手动回滚

如果部署出现问题，可以手动回滚：

```bash
# 回滚到上一个提交
git reset --hard HEAD~1

# 重新构建和启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 安全建议

1. **限制脚本权限**：确保脚本只能被授权用户执行
2. **定期备份**：定期备份重要数据和配置
3. **监控日志**：定期检查部署日志，及时发现问题
4. **测试环境**：在生产环境使用前，先在测试环境验证
5. **网络安全**：确保Git仓库和Docker镜像仓库的访问安全

## 扩展功能

### 多环境部署
可以创建不同环境的配置文件：
- `docker-compose.dev.yml`
- `docker-compose.staging.yml`
- `docker-compose.prod.yml`

### 蓝绿部署
可以扩展脚本支持蓝绿部署，实现零停机更新。

### 数据库迁移
可以在部署脚本中添加数据库迁移步骤。

### 性能监控
集成APM工具，监控部署后的应用性能。