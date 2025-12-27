#!/bin/bash

# 快速部署脚本 - 简化版本
# 检查git更新，如果有更新则重新构建和重启docker-compose

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}[$(date)] 开始检查更新...${NC}"

# 获取当前提交hash
CURRENT_COMMIT=$(git rev-parse HEAD)

# 拉取最新代码
git fetch origin

# 获取远程提交hash
REMOTE_COMMIT=$(git rev-parse origin/$(git branch --show-current))

# 检查是否有更新
if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo -e "${GREEN}[$(date)] 代码已是最新版本，无需更新${NC}"
    exit 0
fi

echo -e "${YELLOW}[$(date)] 发现更新，开始部署...${NC}"

# 拉取最新代码
git pull origin $(git branch --show-current)

# 停止并重新构建服务
echo -e "${YELLOW}[$(date)] 停止现有服务...${NC}"
docker-compose down

echo -e "${YELLOW}[$(date)] 重新构建镜像...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}[$(date)] 启动服务...${NC}"
docker-compose up -d

# 等待服务启动
sleep 10

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}[$(date)] 部署成功！服务正在运行${NC}"
    echo -e "${GREEN}访问地址: http://localhost:9393${NC}"
else
    echo -e "${RED}[$(date)] 部署失败，请检查日志${NC}"
    docker-compose logs
    exit 1
fi