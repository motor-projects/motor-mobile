# 多阶段构建 - 摩托车性能数据移动应用
# 阶段1: 构建应用
FROM node:18-alpine AS builder

WORKDIR /workspace

# 复制 workspace 文件
COPY package*.json ./
COPY motor-shared/ ./motor-shared/
COPY motor-mobile-app/package*.json ./motor-mobile-app/
COPY motor-mobile-app/app.json ./motor-mobile-app/
COPY motor-mobile-app/babel.config.js ./motor-mobile-app/
COPY motor-mobile-app/metro.config.js ./motor-mobile-app/

# 安装依赖
WORKDIR /workspace/motor-mobile-app
RUN npm ci --only=production

# 复制源代码
COPY motor-mobile-app/ .

# 构建应用
RUN npm run build:web

# 阶段2: 生产环境
FROM nginx:alpine AS production

# 安装必要的工具
RUN apk add --no-cache curl

# 复制nginx配置
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 复制构建后的文件
COPY --from=builder /app/web-build /usr/share/nginx/html

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]