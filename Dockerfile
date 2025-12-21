# 使用Node.js作为运行时
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖，使用--legacy-peer-deps解决peer dependency冲突
RUN npm install -f

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 暴露端口（与package.json中的start脚本一致）
EXPOSE 9393

# 启动应用
CMD ["npm", "run", "start"]
