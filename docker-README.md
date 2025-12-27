# Docker 部署说明

本项目提供了完整的Docker部署方案，包括生产环境和开发环境的配置。

## 文件说明

- `docker-compose.yml` - 生产环境配置
- `docker-compose.dev.yml` - 开发环境配置
- `Dockerfile` - 生产环境镜像构建文件
- `Dockerfile.dev` - 开发环境镜像构建文件

## 快速开始

### 生产环境部署

```bash
# 构建并启动生产环境
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问地址：http://localhost:9393

### 开发环境

```bash
# 构建并启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

访问地址：http://localhost:3000

## 功能特性

### 生产环境
- 使用优化的生产构建
- 端口映射：9393
- 自动重启策略
- 持久化上传文件目录

### 开发环境
- 支持热重载
- 端口映射：3000
- 源代码挂载
- 开发依赖完整安装

## 数据持久化

上传的文件会持久化到 `./public/uploads` 目录，即使容器重启也不会丢失。

## 扩展配置

如果需要数据库或Redis，可以取消注释 `docker-compose.yml` 中相应的服务配置。

### 添加PostgreSQL数据库

```yaml
postgres:
  image: postgres:15-alpine
  container_name: next-demo-db
  environment:
    POSTGRES_DB: nextdemo
    POSTGRES_USER: nextuser
    POSTGRES_PASSWORD: nextpass
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

### 添加Redis缓存

```yaml
redis:
  image: redis:7-alpine
  container_name: next-demo-redis
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

## 常用命令

```bash
# 重新构建镜像
docker-compose build --no-cache

# 查看运行状态
docker-compose ps

# 进入容器
docker-compose exec next-demo sh

# 查看容器资源使用情况
docker stats

# 清理未使用的镜像和容器
docker system prune -a
```

## 故障排除

1. **端口冲突**：如果端口被占用，修改 `docker-compose.yml` 中的端口映射
2. **权限问题**：确保 `./public/uploads` 目录有正确的读写权限
3. **构建失败**：尝试使用 `--no-cache` 参数重新构建

## 环境变量

可以创建 `.env` 文件来配置环境变量：

```env
NODE_ENV=production
PORT=9393
```