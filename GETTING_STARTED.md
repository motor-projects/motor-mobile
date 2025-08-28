# 快速开始 - 摩托车性能数据移动端应用

## 环境准备

### 必需软件
1. **Node.js** (16+)
   ```bash
   # 检查Node.js版本
   node --version
   ```

2. **npm 或 yarn**
   ```bash
   # 检查npm版本
   npm --version
   ```

3. **Expo CLI**
   ```bash
   # 全局安装Expo CLI
   npm install -g @expo/cli
   ```

### 开发环境选择

#### 选项1: 使用Expo Go（推荐新手）
- 下载Expo Go应用（iOS App Store / Google Play）
- 无需安装Xcode或Android Studio

#### 选项2: 本地模拟器
- **iOS**: 安装Xcode + iOS Simulator
- **Android**: 安装Android Studio + Android Emulator

## 快速启动

### 1. 进入项目目录
```bash
cd /Users/newdroid/Documents/project/motor/mobile
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
# 启动Expo开发服务器
npm start

# 或者使用yarn
yarn start
```

### 4. 运行应用

#### 使用Expo Go
1. 扫描终端中显示的二维码
2. 应用将在您的设备上自动加载

#### 使用模拟器
```bash
# iOS模拟器
npm run ios

# Android模拟器  
npm run android

# Web浏览器
npm run web
```

## 项目特性

### ✨ 已实现功能
- 🏠 **完整主页** - 问候语、搜索、分类、品牌、推荐内容
- 🎨 **精美UI** - 原生体验、流畅动画、触觉反馈
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🌓 **主题支持** - 深色/浅色模式
- 🔄 **状态管理** - Redux Toolkit + 持久化
- 🚀 **性能优化** - 懒加载、缓存、虚拟化

### 🚧 开发中功能
- 详细页面实现
- 搜索和筛选
- 用户认证
- 收藏管理
- 评价系统
- 相机集成

## 开发指南

### 项目结构
```
src/
├── components/     # UI组件
├── screens/       # 页面组件
├── navigation/    # 导航配置
├── store/         # Redux状态
├── services/      # API服务
├── types/         # TypeScript类型
└── utils/         # 工具函数
```

### 添加新功能
1. 在对应目录创建组件/页面
2. 更新导航配置
3. 添加状态管理（如需要）
4. 测试功能

### 调试技巧
- 使用React Native Debugger
- 启用Redux DevTools
- 查看Expo开发工具

## 常见问题

### Q: 依赖安装失败
A: 删除node_modules文件夹，重新运行npm install

### Q: 模拟器无法启动
A: 确保已正确安装Xcode/Android Studio

### Q: 二维码扫描无反应
A: 确保手机和电脑在同一WiFi网络

### Q: 应用无法加载
A: 检查后端API服务是否运行

## 后续开发

### 优先级功能
1. 完善详情页面
2. 实现搜索功能
3. 添加用户认证
4. 开发收藏系统

### 高级功能
1. 相机集成
2. 推送通知
3. 离线支持
4. 社交分享

## 技术支持

- 📧 **邮箱**: support@motorspecs.com
- 📖 **文档**: 查看README.md
- 🐛 **问题**: 提交GitHub Issue

## 下一步

1. 启动应用并浏览主页功能
2. 查看代码结构了解架构
3. 尝试修改UI组件
4. 开始开发新功能

祝您开发愉快！🚀