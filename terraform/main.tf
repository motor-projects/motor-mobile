# 摩托车性能数据系统 - Terraform 基础设施配置

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
  
  backend "s3" {
    bucket         = "motorcycle-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-lock-table"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "motorcycle-system"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# 数据源
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# 变量定义
variable "aws_region" {
  description = "AWS 区域"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "环境名称"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "cluster_name" {
  description = "EKS 集群名称"
  type        = string
  default     = "motorcycle-cluster"
}

variable "node_instance_type" {
  description = "节点实例类型"
  type        = string
  default     = "t3.medium"
}

variable "node_desired_capacity" {
  description = "期望节点数量"
  type        = number
  default     = 3
}

variable "node_min_size" {
  description = "最小节点数量"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "最大节点数量"
  type        = number
  default     = 10
}

# VPC 配置
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.environment}-motorcycle-vpc"
    "kubernetes.io/cluster/${var.cluster_name}-${var.environment}" = "shared"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.environment}-motorcycle-igw"
  }
}

# 公共子网
resource "aws_subnet" "public" {
  count = 2
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.environment}-motorcycle-public-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}-${var.environment}" = "shared"
    "kubernetes.io/role/elb" = "1"
  }
}

# 私有子网
resource "aws_subnet" "private" {
  count = 2
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "${var.environment}-motorcycle-private-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}-${var.environment}" = "owned"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# NAT Gateway
resource "aws_eip" "nat" {
  count = 2
  domain = "vpc"
  
  tags = {
    Name = "${var.environment}-motorcycle-nat-eip-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count = 2
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "${var.environment}-motorcycle-nat-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.main]
}

# 路由表 - 公共
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "${var.environment}-motorcycle-public-rt"
  }
}

# 路由表关联 - 公共
resource "aws_route_table_association" "public" {
  count = 2
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# 路由表 - 私有
resource "aws_route_table" "private" {
  count = 2
  
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = {
    Name = "${var.environment}-motorcycle-private-rt-${count.index + 1}"
  }
}

# 路由表关联 - 私有
resource "aws_route_table_association" "private" {
  count = 2
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# 安全组 - EKS 集群
resource "aws_security_group" "cluster" {
  name_prefix = "${var.environment}-motorcycle-cluster-sg"
  vpc_id      = aws_vpc.main.id
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.environment}-motorcycle-cluster-sg"
  }
}

# 安全组 - 工作节点
resource "aws_security_group" "node" {
  name_prefix = "${var.environment}-motorcycle-node-sg"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }
  
  ingress {
    from_port       = 1025
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.cluster.id]
  }
  
  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.cluster.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.environment}-motorcycle-node-sg"
  }
}

# IAM 角色 - EKS 集群
resource "aws_iam_role" "cluster" {
  name = "${var.environment}-motorcycle-cluster-role"
  
  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

# IAM 角色 - EKS 节点组
resource "aws_iam_role" "node" {
  name = "${var.environment}-motorcycle-node-role"
  
  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "node_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node.name
}

# EKS 集群
resource "aws_eks_cluster" "main" {
  name     = "${var.cluster_name}-${var.environment}"
  role_arn = aws_iam_role.cluster.arn
  version  = "1.28"
  
  vpc_config {
    subnet_ids              = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
    security_group_ids      = [aws_security_group.cluster.id]
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }
  
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
    aws_cloudwatch_log_group.cluster,
  ]
  
  tags = {
    Name = "${var.cluster_name}-${var.environment}"
  }
}

# EKS 节点组
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "main"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = aws_subnet.private[*].id
  instance_types  = [var.node_instance_type]
  ami_type        = "AL2_x86_64"
  capacity_type   = "ON_DEMAND"
  disk_size       = 50
  
  scaling_config {
    desired_size = var.node_desired_capacity
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }
  
  update_config {
    max_unavailable_percentage = 25
  }
  
  remote_access {
    ec2_ssh_key = aws_key_pair.main.key_name
    source_security_group_ids = [aws_security_group.node.id]
  }
  
  labels = {
    Environment = var.environment
    NodeGroup   = "main"
  }
  
  tags = {
    Name = "${var.environment}-motorcycle-node-group"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.node_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.node_AmazonEC2ContainerRegistryReadOnly,
  ]
}

# KMS 密钥
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
  
  tags = {
    Name = "${var.environment}-motorcycle-eks-key"
  }
}

resource "aws_kms_alias" "eks" {
  name          = "alias/${var.environment}-motorcycle-eks"
  target_key_id = aws_kms_key.eks.key_id
}

# CloudWatch 日志组
resource "aws_cloudwatch_log_group" "cluster" {
  name              = "/aws/eks/${var.cluster_name}-${var.environment}/cluster"
  retention_in_days = 7
  
  tags = {
    Name = "${var.environment}-motorcycle-cluster-logs"
  }
}

# SSH 密钥对
resource "aws_key_pair" "main" {
  key_name   = "${var.environment}-motorcycle-keypair"
  public_key = file("~/.ssh/id_rsa.pub") # 请确保公钥文件存在
  
  tags = {
    Name = "${var.environment}-motorcycle-keypair"
  }
}

# RDS 子网组
resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-motorcycle-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  
  tags = {
    Name = "${var.environment}-motorcycle-db-subnet-group"
  }
}

# RDS 安全组
resource "aws_security_group" "rds" {
  name_prefix = "${var.environment}-motorcycle-rds-sg"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.node.id]
  }
  
  tags = {
    Name = "${var.environment}-motorcycle-rds-sg"
  }
}

# S3 存储桶 - 应用资产
resource "aws_s3_bucket" "assets" {
  bucket = "${var.environment}-motorcycle-assets-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name = "${var.environment}-motorcycle-assets"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "assets" {
  bucket = aws_s3_bucket.assets.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# S3 存储桶 - 备份
resource "aws_s3_bucket" "backups" {
  bucket = "${var.environment}-motorcycle-backups-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name = "${var.environment}-motorcycle-backups"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  rule {
    id     = "backup_lifecycle"
    status = "Enabled"
    
    expiration {
      days = 90
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# CloudFront 分发
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.assets.bucket}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }
  
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${var.environment} Motorcycle CDN"
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.assets.bucket}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = {
    Name = "${var.environment}-motorcycle-cdn"
  }
}

resource "aws_cloudfront_origin_access_identity" "main" {
  comment = "${var.environment} Motorcycle OAI"
}

# 随机 ID
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# 输出
output "cluster_endpoint" {
  description = "EKS 集群端点"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_name" {
  description = "EKS 集群名称"
  value       = aws_eks_cluster.main.name
}

output "cluster_security_group_id" {
  description = "集群安全组 ID"
  value       = aws_security_group.cluster.id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "私有子网 IDs"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "公共子网 IDs"
  value       = aws_subnet.public[*].id
}

output "s3_assets_bucket" {
  description = "资产 S3 存储桶名称"
  value       = aws_s3_bucket.assets.bucket
}

output "s3_backups_bucket" {
  description = "备份 S3 存储桶名称"
  value       = aws_s3_bucket.backups.bucket
}

output "cloudfront_domain" {
  description = "CloudFront 域名"
  value       = aws_cloudfront_distribution.main.domain_name
}