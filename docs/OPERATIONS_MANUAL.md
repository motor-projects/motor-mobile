# 摩托车性能数据系统运维手册

## 目录

1. [系统概述](#系统概述)
2. [部署指南](#部署指南)
3. [监控和告警](#监控和告警)
4. [备份和恢复](#备份和恢复)
5. [故障排除](#故障排除)
6. [性能优化](#性能优化)
7. [安全管理](#安全管理)
8. [日常维护](#日常维护)
9. [紧急响应](#紧急响应)
10. [联系信息](#联系信息)

## 系统概述

### 架构组件

- **前端**: React Native 移动应用 (Web版本)
- **后端**: Node.js API 服务
- **数据库**: MongoDB 副本集 (3节点)
- **缓存**: Redis
- **负载均衡**: Nginx
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack
- **容器编排**: Kubernetes
- **CI/CD**: GitHub Actions

### 环境说明

- **开发环境** (`dev`): 用于开发和测试
- **预发布环境** (`staging`): 用于预发布验证
- **生产环境** (`production`): 线上生产环境

## 部署指南

### 快速部署

```bash
# 部署到生产环境
./scripts/deploy.sh production deploy --image-tag=v1.2.3

# 查看部署状态
./scripts/deploy.sh production status

# 查看应用日志
./scripts/deploy.sh production logs
```

### 滚动更新

```bash
# 更新后端服务
kubectl set image deployment/backend-deployment backend=motorcycle/backend:v1.2.4 -n motorcycle-system

# 监控更新进度
kubectl rollout status deployment/backend-deployment -n motorcycle-system
```

### 回滚操作

```bash
# 快速回滚
./scripts/deploy.sh production rollback

# 查看回滚历史
kubectl rollout history deployment/backend-deployment -n motorcycle-system
```

## 监控和告警

### 监控地址

- **Grafana**: https://grafana.motorcycle.example.com
- **Prometheus**: https://prometheus.motorcycle.example.com
- **应用健康检查**: https://motorcycle.example.com/health

### 关键指标

#### 应用指标
- **请求率**: 每秒请求数 (RPS)
- **响应时间**: P50, P95, P99 延迟
- **错误率**: 4xx, 5xx 错误百分比
- **可用性**: 服务正常运行时间

#### 系统指标
- **CPU 使用率**: < 80%
- **内存使用率**: < 85%
- **磁盘使用率**: < 85%
- **网络 I/O**: 入站/出站流量

#### 数据库指标
- **连接数**: 当前活跃连接
- **查询性能**: 慢查询监控
- **复制延迟**: 主从同步状态

### 告警阈值

| 指标 | 警告阈值 | 严重阈值 | 处理时间 |
|------|----------|----------|----------|
| CPU 使用率 | 70% | 85% | 15分钟 |
| 内存使用率 | 80% | 90% | 10分钟 |
| 错误率 | 2% | 5% | 5分钟 |
| 响应时间 | 500ms | 1000ms | 5分钟 |
| 服务不可用 | - | 服务宕机 | 1分钟 |

## 备份和恢复

### 自动备份

```bash
# 查看备份状态
./scripts/backup-restore.sh schedule status

# 启用/禁用自动备份
./scripts/backup-restore.sh schedule enable
./scripts/backup-restore.sh schedule disable
```

### 手动备份

```bash
# 立即执行备份
./scripts/backup-restore.sh backup

# 列出所有备份
./scripts/backup-restore.sh list
```

### 数据恢复

```bash
# 恢复最新备份
./scripts/backup-restore.sh restore

# 恢复指定备份
./scripts/backup-restore.sh restore --file=mongodb_20231201_020000.tar.gz
```

### 备份验证

```bash
# 测试备份恢复流程
./scripts/backup-restore.sh test
```

## 故障排除

### 常见问题

#### 1. 服务启动失败

**症状**: Pod 处于 `CrashLoopBackOff` 状态

**排查步骤**:
```bash
# 查看 Pod 状态
kubectl get pods -n motorcycle-system

# 查看 Pod 日志
kubectl logs <pod-name> -n motorcycle-system

# 查看 Pod 事件
kubectl describe pod <pod-name> -n motorcycle-system
```

**常见原因**:
- 环境变量配置错误
- 数据库连接失败
- 镜像拉取失败
- 资源限制不足

#### 2. 数据库连接问题

**症状**: 应用报告数据库连接错误

**排查步骤**:
```bash
# 检查 MongoDB 服务状态
kubectl get pods -l app=mongodb -n motorcycle-system

# 检查数据库连接
kubectl exec -it mongodb-0 -n motorcycle-system -- mongo --eval "db.adminCommand('ping')"

# 查看数据库日志
kubectl logs mongodb-0 -n motorcycle-system
```

#### 3. 内存不足

**症状**: Pod 被 OOMKilled

**解决方案**:
```bash
# 增加内存限制
kubectl patch deployment backend-deployment -n motorcycle-system -p '{"spec":{"template":{"spec":{"containers":[{"name":"backend","resources":{"limits":{"memory":"1Gi"}}}]}}}}'

# 水平扩容
kubectl scale deployment backend-deployment --replicas=5 -n motorcycle-system
```

#### 4. 磁盘空间不足

**排查步骤**:
```bash
# 查看节点磁盘使用情况
kubectl describe nodes | grep -A 5 "Capacity:"

# 查看 PV 使用情况
kubectl get pv
```

**解决方案**:
- 清理旧日志文件
- 扩容存储卷
- 清理不使用的镜像

### 故障排查工具

#### 日志查看
```bash
# 查看应用日志
kubectl logs -f deployment/backend-deployment -n motorcycle-system

# 查看多个副本日志
kubectl logs -f -l app=backend -n motorcycle-system --max-log-requests=10
```

#### 性能分析
```bash
# 查看资源使用情况
kubectl top pods -n motorcycle-system
kubectl top nodes

# 执行性能测试
kubectl run loadtest --image=busybox -it --rm --restart=Never -- wget -O- http://backend-service:3000/health
```

#### 网络诊断
```bash
# 测试服务连通性
kubectl run netshoot --image=nicolaka/netshoot -it --rm --restart=Never

# 在容器内测试
nslookup backend-service.motorcycle-system.svc.cluster.local
curl http://backend-service:3000/health
```

## 性能优化

### 应用层优化

#### 代码优化
- 使用连接池优化数据库连接
- 实现查询结果缓存
- 优化数据库索引
- 异步处理耗时操作

#### 缓存策略
```bash
# 监控 Redis 使用情况
kubectl exec -it deployment/redis-deployment -n motorcycle-system -- redis-cli info memory

# 调整缓存 TTL
kubectl exec -it deployment/redis-deployment -n motorcycle-system -- redis-cli config set timeout 300
```

### 基础设施优化

#### 资源调优
```yaml
# 调整资源配置
resources:
  requests:
    cpu: 200m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

#### 自动扩容
```yaml
# 配置 HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 数据库优化

#### 索引优化
```javascript
// 创建复合索引
db.motorcycles.createIndex({ "brand": 1, "year": -1 })
db.reviews.createIndex({ "motorcycleId": 1, "createdAt": -1 })
```

#### 查询优化
- 使用聚合管道优化复杂查询
- 实现分页查询
- 避免 N+1 查询问题

## 安全管理

### 访问控制

#### RBAC 配置
```bash
# 创建服务账户
kubectl create serviceaccount motorcycle-sa -n motorcycle-system

# 绑定角色
kubectl create rolebinding motorcycle-binding --clusterrole=view --serviceaccount=motorcycle-system:motorcycle-sa
```

#### 网络策略
```bash
# 应用网络策略
kubectl apply -f security/security-policies.yaml
```

### 密钥管理

#### 更新密钥
```bash
# 更新数据库密码
kubectl create secret generic motorcycle-secrets \
  --from-literal=MONGO_ROOT_PASSWORD=new-password \
  --dry-run=client -o yaml | kubectl apply -f -

# 重启相关服务
kubectl rollout restart deployment/backend-deployment -n motorcycle-system
```

#### SSL 证书管理
```bash
# 查看证书状态
kubectl get certificates -n motorcycle-system

# 手动续期证书
kubectl delete certificate tls-certificate -n motorcycle-system
kubectl apply -f k8s/secret.yaml
```

## 日常维护

### 日常检查清单

#### 每日检查
- [ ] 检查服务可用性
- [ ] 查看错误日志
- [ ] 监控告警状态
- [ ] 验证备份完成

```bash
#!/bin/bash
# 每日健康检查脚本
./scripts/deploy.sh production status
./scripts/backup-restore.sh list | head -5
kubectl get alerts -n monitoring
```

#### 每周检查
- [ ] 资源使用情况分析
- [ ] 性能指标回顾
- [ ] 安全补丁更新
- [ ] 备份恢复测试

#### 每月检查
- [ ] 系统性能优化
- [ ] 容量规划评估
- [ ] 灾难恢复演练
- [ ] 依赖项更新

### 维护窗口

**生产环境维护窗口**: 
- 时间: 每周日凌晨 2:00-4:00 (UTC+8)
- 通知: 提前 72 小时通知用户

**维护操作**:
1. 数据库维护
2. 系统更新
3. 配置变更
4. 性能调优

## 紧急响应

### 严重故障响应流程

#### 1. 故障检测 (0-5分钟)
- 收到告警通知
- 确认故障范围
- 评估影响程度

#### 2. 快速响应 (5-15分钟)
```bash
# 快速回滚
./scripts/deploy.sh production rollback

# 启用维护模式
kubectl patch ingress frontend-ingress -n motorcycle-system -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/default-backend":"maintenance-service"}}}'

# 扩容服务
kubectl scale deployment backend-deployment --replicas=10 -n motorcycle-system
```

#### 3. 问题诊断 (15-60分钟)
- 分析日志和监控数据
- 确定根本原因
- 制定修复方案

#### 4. 故障修复 (根据情况)
- 实施修复方案
- 验证修复效果
- 恢复正常服务

#### 5. 事后总结
- 编写故障报告
- 分析改进措施
- 更新运维文档

### 紧急联系方式

#### 值班人员
- **主值班**: 张三 (+86 138-0000-0000)
- **副值班**: 李四 (+86 139-0000-0000)
- **技术经理**: 王五 (+86 137-0000-0000)

#### 外部服务商
- **云服务商**: AWS Support
- **CDN 服务**: CloudFlare Support
- **监控服务**: Datadog Support

### 故障通知模板

```
【生产故障通知】

故障时间: 2023-12-01 14:30:00
影响范围: 摩托车性能数据系统全站
故障症状: 网站无法访问
预计修复时间: 15分钟内
当前处理人: 张三

我们正在紧急处理此问题，将在修复完成后第一时间通知大家。
```

## 容量规划

### 资源监控

#### CPU 和内存
- 监控 7 天平均使用率
- 预留 30% 缓冲空间
- 根据业务增长预测扩容

#### 存储容量
- MongoDB: 每月增长约 10GB
- 日志存储: 每天约 1GB
- 备份存储: 保留 30 天

#### 网络带宽
- 平均带宽使用: 100Mbps
- 峰值带宽: 500Mbps
- CDN 分流率: 80%

### 扩容策略

#### 水平扩容
```bash
# 应用层扩容
kubectl scale deployment backend-deployment --replicas=5 -n motorcycle-system

# 数据库分片 (需要规划)
# 实现读写分离
```

#### 垂直扩容
```bash
# 增加资源配置
kubectl patch deployment backend-deployment -n motorcycle-system -p '{"spec":{"template":{"spec":{"containers":[{"name":"backend","resources":{"limits":{"cpu":"1","memory":"2Gi"}}}]}}}}'
```

## 版本管理

### 发布流程

1. **开发阶段**: 在 dev 分支开发
2. **测试阶段**: 部署到 staging 环境
3. **生产发布**: 合并到 main 分支
4. **监控验证**: 观察系统指标
5. **回滚准备**: 准备快速回滚方案

### 版本标记

- **语义化版本**: v1.2.3 (major.minor.patch)
- **Pre-release**: v1.2.3-alpha.1
- **快照版本**: v1.2.3-20231201.1430

## 联系信息

### 团队联系方式

| 角色 | 姓名 | 电话 | 邮箱 | 备用联系方式 |
|------|------|------|------|--------------|
| DevOps 负责人 | 张三 | 138-0000-0000 | zhang.san@company.com | 微信: zhangsan123 |
| 后端开发负责人 | 李四 | 139-0000-0000 | li.si@company.com | 钉钉: lisi456 |
| 前端开发负责人 | 王五 | 137-0000-0000 | wang.wu@company.com | 微信: wangwu789 |
| 产品经理 | 赵六 | 136-0000-0000 | zhao.liu@company.com | 微信: zhaoliu321 |

### 外部服务联系方式

- **AWS 技术支持**: https://console.aws.amazon.com/support/
- **GitHub 支持**: https://support.github.com/
- **域名服务商**: support@domain.com
- **SSL 证书提供商**: support@ssl-provider.com

---

**文档版本**: v1.0.0  
**最后更新**: 2023-12-01  
**维护者**: DevOps 团队