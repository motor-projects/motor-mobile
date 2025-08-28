# 摩托车性能数据系统 - DevOps 部署总览

## 📋 系统架构

### 应用层
- **移动前端**: React Native (Web 版本)
- **API 后端**: Node.js + Express
- **数据库**: MongoDB 副本集 (3节点)
- **缓存**: Redis
- **负载均衡**: Nginx

### 基础设施层
- **容器化**: Docker
- **编排**: Kubernetes
- **云平台**: AWS (支持阿里云)
- **CDN**: CloudFront
- **存储**: S3

### 监控和日志
- **监控**: Prometheus + Grafana
- **日志**: Fluentd
- **告警**: AlertManager
- **追踪**: APM 集成

## 🚀 快速部署指南

### 1. 环境准备

```bash
# 安装依赖工具
# - Docker
# - kubectl
# - AWS CLI
# - Terraform (可选)

# 配置 AWS 凭证
aws configure

# 验证 Kubernetes 集群连接
kubectl cluster-info
```

### 2. 基础设施部署 (可选 - 使用 Terraform)

```bash
cd terraform/
terraform init
terraform plan -var="environment=production"
terraform apply -var="environment=production"
```

### 3. 应用部署

```bash
# 使用部署脚本
./scripts/deploy.sh production deploy --image-tag=latest

# 或手动部署
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/
```

### 4. 验证部署

```bash
# 检查服务状态
./scripts/deploy.sh production status

# 验证健康检查
curl https://motorcycle.example.com/health
```

## 📁 文件结构

```
mobile/
├── 📁 .github/workflows/         # CI/CD 流水线
│   └── ci-cd.yml                # GitHub Actions 配置
├── 📁 backup/                   # 备份配置
│   └── mongodb-backup.yaml      # MongoDB 自动备份
├── 📁 config/                   # 环境配置
│   ├── production.env           # 生产环境变量
│   ├── staging.env              # 预发布环境变量
│   └── dev.env                  # 开发环境变量
├── 📁 docker/                   # Docker 配置
│   └── nginx.conf               # Nginx 配置
├── 📁 docs/                     # 文档
│   └── OPERATIONS_MANUAL.md     # 运维手册
├── 📁 k8s/                      # Kubernetes 部署清单
│   ├── namespace.yaml           # 命名空间
│   ├── configmap.yaml           # 配置映射
│   ├── secret.yaml              # 密钥配置
│   ├── backend-deployment.yaml  # 后端部署
│   ├── frontend-deployment.yaml # 前端部署
│   ├── mongodb-deployment.yaml  # MongoDB 部署
│   ├── redis-deployment.yaml    # Redis 部署
│   └── 📁 monitoring/           # 监控配置
│       ├── prometheus.yaml      # Prometheus 配置
│       └── grafana.yaml         # Grafana 配置
├── 📁 scripts/                  # 部署脚本
│   ├── deploy.sh                # 主部署脚本
│   └── backup-restore.sh        # 备份恢复脚本
├── 📁 security/                 # 安全配置
│   └── security-policies.yaml   # 安全策略
├── 📁 terraform/                # 基础设施代码
│   └── main.tf                  # Terraform 配置
├── Dockerfile                   # 前端容器化
├── Dockerfile.backend           # 后端容器化
├── docker-compose.yml           # 本地开发环境
└── DEPLOYMENT_SUMMARY.md        # 本文档
```

## 🔧 核心功能

### CI/CD 流水线
- ✅ 代码质量检查 (ESLint, TypeScript)
- ✅ 安全扫描 (Snyk, Trivy)
- ✅ 自动化测试 (单元、集成、E2E)
- ✅ 多环境部署 (开发、预发布、生产)
- ✅ 蓝绿部署
- ✅ 自动回滚

### 监控告警
- ✅ 应用性能监控 (APM)
- ✅ 基础设施监控
- ✅ 日志聚合分析
- ✅ 实时告警通知
- ✅ 自定义仪表板

### 备份恢复
- ✅ 自动化数据备份
- ✅ 增量备份策略
- ✅ 跨区域备份存储
- ✅ 一键恢复功能
- ✅ 备份验证测试

### 安全加固
- ✅ 网络策略隔离
- ✅ Pod 安全策略
- ✅ RBAC 权限控制
- ✅ 密钥管理
- ✅ SSL/TLS 加密

## 🌐 环境管理

### 开发环境 (dev)
- **域名**: https://dev.motorcycle.example.com
- **副本数**: 1
- **资源配置**: 最小配置
- **特性**: 调试模式、热重载

### 预发布环境 (staging)
- **域名**: https://staging.motorcycle.example.com
- **副本数**: 2
- **资源配置**: 中等配置
- **特性**: 生产镜像、完整测试

### 生产环境 (production)
- **域名**: https://motorcycle.example.com
- **副本数**: 3+
- **资源配置**: 高可用配置
- **特性**: 监控告警、自动扩容

## 📊 监控地址

| 服务 | 地址 | 用途 |
|------|------|------|
| Grafana | https://grafana.motorcycle.example.com | 监控仪表板 |
| Prometheus | https://prometheus.motorcycle.example.com | 指标数据 |
| 应用健康检查 | https://motorcycle.example.com/health | 服务状态 |

## 🛠️ 常用命令

### 部署相关
```bash
# 部署到生产环境
./scripts/deploy.sh production deploy --image-tag=v1.2.3

# 查看部署状态
./scripts/deploy.sh production status

# 扩容服务
./scripts/deploy.sh production scale --replicas=5

# 回滚部署
./scripts/deploy.sh production rollback

# 查看日志
./scripts/deploy.sh production logs --component=backend
```

### 备份相关
```bash
# 立即备份
./scripts/backup-restore.sh backup

# 列出备份
./scripts/backup-restore.sh list

# 恢复最新备份
./scripts/backup-restore.sh restore

# 恢复指定备份
./scripts/backup-restore.sh restore --file=mongodb_20231201_020000.tar.gz

# 清理旧备份
./scripts/backup-restore.sh cleanup --days=30
```

### Kubernetes 相关
```bash
# 查看 Pod 状态
kubectl get pods -n motorcycle-system

# 查看服务状态
kubectl get services -n motorcycle-system

# 查看日志
kubectl logs -f deployment/backend-deployment -n motorcycle-system

# 执行命令
kubectl exec -it deployment/backend-deployment -n motorcycle-system -- bash
```

## 🚨 故障排除

### 常见问题快速解决

1. **服务无法启动**
   ```bash
   kubectl describe pod <pod-name> -n motorcycle-system
   kubectl logs <pod-name> -n motorcycle-system
   ```

2. **数据库连接失败**
   ```bash
   kubectl exec -it mongodb-0 -n motorcycle-system -- mongo --eval "db.adminCommand('ping')"
   ```

3. **内存不足**
   ```bash
   kubectl top pods -n motorcycle-system
   kubectl scale deployment backend-deployment --replicas=3 -n motorcycle-system
   ```

4. **网络连通性问题**
   ```bash
   kubectl run netshoot --image=nicolaka/netshoot -it --rm --restart=Never
   ```

## 📈 性能优化

### 应用层优化
- 数据库查询优化
- 缓存策略实施
- 连接池配置
- 异步处理优化

### 基础设施优化
- 自动扩缩容配置
- 资源限制调优
- 网络优化
- 存储优化

## 🔐 安全最佳实践

- 定期更新依赖包
- 实施最小权限原则
- 启用网络策略
- 定期安全扫描
- 加密敏感数据
- 审计日志记录

## 📞 支持联系

### 技术支持
- **DevOps 团队**: devops@company.com
- **紧急联系**: +86 138-0000-0000
- **文档更新**: 请提交 Pull Request

### 外部服务
- **云服务支持**: AWS Support
- **监控服务**: Datadog Support
- **CDN 服务**: CloudFlare Support

---

**版本**: v1.0.0  
**最后更新**: 2023-12-01  
**维护团队**: DevOps & 开发团队

## 🎯 下一步计划

- [ ] 实施服务网格 (Istio)
- [ ] 集成 GitOps (ArgoCD)
- [ ] 多云部署支持
- [ ] AI 驱动的异常检测
- [ ] 成本优化自动化