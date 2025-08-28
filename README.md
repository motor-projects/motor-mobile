# Motor Projects

这是 Motor 摩托车性能数据管理系统的项目集合，采用微服务架构设计。

## 项目结构

```
motor-projects/
├── motor-backend/      # 后端 API 服务
│   ├── src/           # Node.js 后端源码
│   ├── scripts/       # Python 爬虫脚本
│   └── tests/         # 测试文件
├── motor-shared/      # 共享代码库
│   ├── types.ts       # TypeScript 类型定义
│   ├── constants.ts   # 常量定义
│   └── utils.ts       # 工具函数
└── README.md
```

## 服务说明

### motor-backend
独立的后端 API 服务，提供：
- RESTful API 接口
- 用户认证和授权
- 摩托车数据管理
- 文件上传服务
- Python 爬虫工具

### motor-shared
共享代码库，包含：
- TypeScript 类型定义
- 常量和配置
- 通用工具函数
- 可被多个服务复用的代码

## 🚀 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Git

### 一键部署

```bash
# 1. 克隆项目
git clone <repository-url>
cd motor-projects

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置必要参数

# 3. 一键部署开发环境
./scripts/deploy.sh development all
```

### 访问服务

部署完成后，可通过以下地址访问：

- 🌐 **Web前端**: http://localhost:3000
- 📱 **移动端Web**: http://localhost:19006
- 🔧 **API后端**: http://localhost:5000
- 📊 **Grafana监控**: http://localhost:3001 (admin/admin123)
- 🔍 **Prometheus**: http://localhost:9090

## 🛠️ 开发工作流

### 本地开发

```bash
# 启动开发环境
docker-compose up -d

# 查看服务状态
./scripts/manage.sh status all

# 查看日志
./scripts/manage.sh logs backend

# 进入服务容器
./scripts/manage.sh shell backend
```

### 共享库开发

```bash
cd motor-shared
npm install
npm run build

# 发布到GitHub Packages（自动CI/CD）
git commit -am "feat: 新功能"
git push origin main
```

### 前端开发

```bash
cd motor-web-frontend
npm install
npm run dev    # 开发模式
npm run build  # 构建生产版本
npm test       # 运行测试
```

### 后端开发

```bash
cd motor-backend
npm install
npm run dev    # 开发模式
npm test       # 运行测试
npm run lint   # 代码检查
```

## 📦 部署方案

### 环境对比

| 环境 | 用途 | 配置 | 部署方式 |
|------|------|------|----------|
| Development | 本地开发 | 单机Docker | 手动部署 |
| Staging | 测试验证 | 适中资源 | CI/CD自动部署 |
| Production | 生产运行 | 高可用集群 | Blue-Green部署 |

### 快速部署命令

```bash
# 测试环境部署
./scripts/deploy.sh staging all

# 生产环境部署
./scripts/deploy.sh production all

# 单服务更新
./scripts/deploy.sh production backend
```

## 🏧 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   Mobile Web    │    │  Nginx Proxy    │
│   (React/Vite)  │    │   (Expo Web)    │    │  Load Balancer  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────────┴───────────────────────────┘
                                 │
         ┌───────────────────────────┬───────────────────────────┐
         │              Backend API                      │
         │           (Node.js/Express)                   │
         └───────────────────────────┬───────────────────────────┘
                                 │
    ┌────────────────────────────────┴────────────────────────────────┐
    │                            │                            │
┌───┴────┐              ┌───────┴────┐              ┌────────┴────┐
│MongoDB │              │   Redis    │              │  File Store │
│Replica │              │   Cache    │              │ (Cloudinary)│
│  Set   │              │            │              │             │
└────────┘              └────────────┘              └─────────────┘

         ┌─────────────────────────────────────────────┐
         │           Monitoring Stack                  │
         │  Prometheus + Grafana + Loki + Promtail    │
         └─────────────────────────────────────────────┘
```

## 📋 项目依赖关系

```
motor-web-frontend → motor-shared
motor-backend → motor-shared
motor-mobile-app → motor-shared
motor-miniprogram → 独立开发
```

## 📚 技术栈

### 前端技术
- **Web**: React 18 + TypeScript + Vite + TailwindCSS
- **Mobile**: React Native + Expo + Redux Toolkit
- **小程序**: 微信原生开发

### 后端技术  
- **API**: Node.js + Express.js + TypeScript
- **数据库**: MongoDB 副本集 + Redis
- **认证**: JWT + bcrypt
- **文件**: Cloudinary + Multer

### DevOps 技术
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana + Loki
- **代理**: Nginx 负载均衡
- **部署**: Blue-Green 部署

## 🔍 管理命令

```bash
# 服务管理
./scripts/manage.sh start|stop|restart [service] [env]
./scripts/manage.sh status all production
./scripts/manage.sh logs backend staging

# 数据备份和恢复
./scripts/manage.sh backup all production
./scripts/manage.sh restore backup-file.tar.gz production

# 健康检查和监控
./scripts/manage.sh health all production
./scripts/manage.sh cleanup
```

## 🚀 CI/CD 流程

```
代码提交 → 自动测试 → 构建镜像 → 部署测试环境 → 人工验收 → 部署生产环境
```

**分支策略:**
- `develop` → 自动部署到测试环境
- `main` → 自动部署到生产环境  
- `feature/*` → 运行测试，不自动部署

## 📊 监控和日志

- **Grafana**: 性能监控和告警
- **Prometheus**: 指标收集和存储
- **Loki + Promtail**: 集中式日志管理
- **Health Checks**: 服务健康检查

## 🔒 安全特性

- **HTTPS**: SSL/TLS 加密通信
- **认证**: JWT + 刷新令牌
- **权限**: 基于角色的访问控制
- **限流**: API 请求频率限制
- **验证**: 输入数据验证和清理

## 📄 文档

- [🚀 部署指南](DEPLOYMENT.md) - 详细的部署文档
- [⚙️ API文档](motor-backend/docs/api.md) - API接口文档
- [📱 移动端文档](motor-mobile-app/README.md) - 移动应用文档
- [🌐 前端文档](motor-web-frontend/README.md) - Web前端文档

## 👥 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/awesome-feature`)
3. 提交更改 (`git commit -m 'feat: add awesome feature'`)
4. 推送到分支 (`git push origin feature/awesome-feature`)
5. 创建 Pull Request

## 📜 许可证

MIT License - 详情查看 [LICENSE](LICENSE) 文件

---

> ✨ **Motor Projects** - 专业的摩托车性能数据管理系统，支持多端访问和高可用部署。