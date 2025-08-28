import { Dimensions } from 'react-native'

// API配置
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'
  : 'https://api.motor-projects.com/api'

export const WS_BASE_URL = __DEV__
  ? 'ws://localhost:5000'
  : 'wss://api.motor-projects.com'

// 屏幕尺寸
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// 设计规范
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',
  
  // 中性色
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // 品牌色彩
  brand: {
    yamaha: '#0066CC',
    honda: '#CC0000',
    kawasaki: '#00AA44',
    suzuki: '#FFD700',
    ducati: '#CC0000',
    bmw: '#0066CC',
    ktm: '#FF6600',
    harley: '#FF6600',
    triumph: '#000000',
    aprilia: '#CC0000',
  },
  
  // 背景色
  background: {
    light: '#FFFFFF',
    dark: '#000000',
    gray: '#F8F9FA',
  },
  
  // 文本色
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  // 边框色
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
}

// 深色模式颜色
export const DARK_COLORS = {
  background: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#AEAEB2',
    tertiary: '#8E8E93',
  },
  border: {
    light: '#38383A',
    medium: '#48484A',
    dark: '#58585A',
  },
}

// 字体
export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  families: {
    system: 'System',
    mono: 'Courier New',
  },
}

// 间距
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
}

// 边框圆角
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
}

// 阴影
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}

// 动画配置
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
}

// 布局常量
export const LAYOUT = {
  headerHeight: 44,
  tabBarHeight: 49,
  statusBarHeight: 20,
  bottomSafeArea: 34,
  cardSpacing: 16,
  listItemHeight: 80,
  imageAspectRatio: 16 / 9,
}

// 摩托车类别
export const MOTORCYCLE_CATEGORIES = [
  'Sport',
  'Cruiser',
  'Touring',
  'Standard',
  'Adventure',
  'Dual-Sport',
  'Dirt Bike',
  'Electric',
  'Scooter',
  'Three-Wheeler',
]

// 摩托车品牌
export const MOTORCYCLE_BRANDS = [
  'Yamaha',
  'Honda',
  'Kawasaki',
  'Suzuki',
  'Ducati',
  'BMW',
  'KTM',
  'Harley-Davidson',
  'Triumph',
  'Aprilia',
  'MV Agusta',
  'Indian',
  'Moto Guzzi',
  'Husqvarna',
  'Beta',
  'Gas Gas',
  'Sherco',
  'Zero',
  'Energica',
  'LiveWire',
]

// 排序选项
export const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price', order: 'asc' },
  { label: 'Price: High to Low', value: 'price', order: 'desc' },
  { label: 'Power: Low to High', value: 'power', order: 'asc' },
  { label: 'Power: High to Low', value: 'power', order: 'desc' },
  { label: 'Year: Newest First', value: 'year', order: 'desc' },
  { label: 'Year: Oldest First', value: 'year', order: 'asc' },
  { label: 'Rating: Highest First', value: 'rating', order: 'desc' },
  { label: 'Popularity', value: 'popularity', order: 'desc' },
]

// 缓存键
export const CACHE_KEYS = {
  motorcycles: 'motorcycles',
  favorites: 'favorites',
  user: 'user',
  searches: 'search_history',
  settings: 'app_settings',
  notifications: 'notifications',
  location: 'user_location',
}

// 错误消息
export const ERROR_MESSAGES = {
  network: 'Network connection error. Please check your internet connection.',
  server: 'Server error. Please try again later.',
  notFound: 'The requested item could not be found.',
  unauthorized: 'You need to login to access this feature.',
  validation: 'Please check your input and try again.',
  camera: 'Camera permission is required to take photos.',
  location: 'Location permission is required for this feature.',
  storage: 'Storage permission is required to save images.',
  unknown: 'An unexpected error occurred. Please try again.',
}

// 成功消息
export const SUCCESS_MESSAGES = {
  login: 'Successfully logged in!',
  logout: 'Successfully logged out!',
  register: 'Account created successfully!',
  favoriteAdded: 'Added to favorites!',
  favoriteRemoved: 'Removed from favorites!',
  reviewSubmitted: 'Review submitted successfully!',
  photoSaved: 'Photo saved to gallery!',
  shared: 'Successfully shared!',
}

// 应用配置
export const APP_CONFIG = {
  name: 'MotorSpecs',
  version: '1.0.0',
  developer: 'MotorSpecs Team',
  supportEmail: 'support@motorspecs.com',
  privacyPolicyUrl: 'https://motorspecs.com/privacy',
  termsOfServiceUrl: 'https://motorspecs.com/terms',
  maxCacheSize: 100, // MB
  imageQuality: 0.8,
  maxImageSize: 1024, // pixels
  searchHistoryLimit: 50,
  favoritesLimit: 100,
  reviewsPerPage: 20,
  motorcyclesPerPage: 20,
}

// 权限请求消息
export const PERMISSION_MESSAGES = {
  camera: {
    title: 'Camera Permission',
    message: 'This app needs access to your camera to take photos of motorcycles.',
    buttonPositive: 'Grant Permission',
    buttonNegative: 'Cancel',
  },
  location: {
    title: 'Location Permission',
    message: 'This app needs access to your location to find nearby dealers.',
    buttonPositive: 'Grant Permission',
    buttonNegative: 'Cancel',
  },
  storage: {
    title: 'Storage Permission',
    message: 'This app needs access to your storage to save photos.',
    buttonPositive: 'Grant Permission',
    buttonNegative: 'Cancel',
  },
  notifications: {
    title: 'Notification Permission',
    message: 'Allow notifications to stay updated on new motorcycles and price changes.',
    buttonPositive: 'Allow',
    buttonNegative: 'Maybe Later',
  },
}

// 网络配置
export const NETWORK_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
}

// 手势配置
export const GESTURE_CONFIG = {
  swipeThreshold: 50,
  longPressDelay: 500,
  doubleTapDelay: 300,
  shakeThreshold: 800,
  shakesRequired: 3,
}

// 推送通知类型
export const NOTIFICATION_TYPES = {
  NEW_MOTORCYCLE: 'new_motorcycle',
  PRICE_DROP: 'price_drop',
  REVIEW_REPLY: 'review_reply',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
}

// 深度链接路径
export const DEEP_LINK_PATHS = {
  motorcycle: '/motorcycle/:id',
  brand: '/brand/:brand',
  category: '/category/:category',
  search: '/search',
  favorites: '/favorites',
  profile: '/profile',
}