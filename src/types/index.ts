export interface Motorcycle {
  _id: string
  brand: string
  model: string
  year: number
  category: string
  price?: {
    msrp?: number
    currency: string
  }
  engine?: {
    type?: string
    displacement?: number
    bore?: number
    stroke?: number
    compressionRatio?: string
    cooling?: string
    fuelSystem?: string
    valvesPerCylinder?: number
    maxRpm?: number
  }
  performance?: {
    power?: {
      hp?: number
      kw?: number
      rpm?: number
    }
    torque?: {
      nm?: number
      lbft?: number
      rpm?: number
    }
    topSpeed?: number
    acceleration?: {
      zeroToSixty?: number
      zeroToHundred?: number
      quarterMile?: number
    }
    fuelEconomy?: {
      city?: number
      highway?: number
      combined?: number
    }
  }
  dimensions?: {
    length?: number
    width?: number
    height?: number
    wheelbase?: number
    seatHeight?: number
    groundClearance?: number
    weight?: {
      dry?: number
      wet?: number
      gvwr?: number
    }
    fuelCapacity?: number
  }
  images?: {
    url: string
    alt?: string
    type?: string
  }[]
  features?: string[]
  colors?: {
    name: string
    hex?: string
    imageUrl?: string
  }[]
  rating?: {
    overall: number
    reviews: number
    breakdown?: {
      performance?: number
      comfort?: number
      reliability?: number
      value?: number
      styling?: number
    }
  }
  transmission?: {
    type?: string
    gears?: number
  }
  suspension?: {
    front?: string
    rear?: string
  }
  brakes?: {
    front?: string
    rear?: string
    abs?: boolean
  }
  wheels?: {
    front?: {
      size?: string
      tire?: string
    }
    rear?: {
      size?: string
      tire?: string
    }
  }
  status: string
  tags?: string[]
  seo?: {
    slug: string
    metaTitle?: string
    metaDescription?: string
  }
  fullName?: string
  powerToWeight?: string
  createdAt: string
  updatedAt: string
}

export interface MotorcycleFilters {
  brand?: string[]
  category?: string[]
  minPrice?: number
  maxPrice?: number
  minPower?: number
  maxPower?: number
  search?: string
  sortBy?: 'price' | 'power' | 'year' | 'rating' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  inStock?: boolean
  featured?: boolean
  electric?: boolean
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrev: boolean
}

export interface MotorcycleListResponse {
  motorcycles: Motorcycle[]
  pagination: PaginationInfo
  filters: {
    applied: MotorcycleFilters
    available: {
      brands: string[]
      categories: string[]
      priceRange: { min: number; max: number }
      powerRange: { min: number; max: number }
    }
  }
}

// 用户认证相关类型
export interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
  favorites: string[]
  reviews: string[]
  profile?: {
    firstName?: string
    lastName?: string
    bio?: string
    location?: string
    joinDate: string
  }
  preferences?: {
    units: 'metric' | 'imperial'
    language: string
    notifications: boolean
    darkMode: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 评价系统类型
export interface Review {
  _id: string
  motorcycleId: string
  userId: string
  user: {
    username: string
    avatar?: string
  }
  rating: {
    overall: number
    performance: number
    comfort: number
    reliability: number
    value: number
    styling: number
  }
  title: string
  content: string
  pros: string[]
  cons: string[]
  ownership?: {
    duration: string
    mileage: number
    useCase: string
  }
  helpful: {
    count: number
    users: string[]
  }
  verified: boolean
  images?: string[]
  createdAt: string
  updatedAt: string
}

// 收藏类型
export interface Favorite {
  _id: string
  userId: string
  motorcycleId: string
  motorcycle?: Motorcycle
  addedAt: string
  notes?: string
}

// 移动端特有类型
export interface AppState {
  isOffline: boolean
  theme: 'light' | 'dark' | 'auto'
  language: string
  firstLaunch: boolean
  pushToken?: string
  location?: {
    latitude: number
    longitude: number
    accuracy: number
  }
}

export interface Notification {
  id: string
  type: 'new_motorcycle' | 'review_reply' | 'price_drop' | 'promotion'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
}

export interface CameraPhoto {
  uri: string
  width: number
  height: number
  type: 'image'
  fileName?: string
  fileSize?: number
}

export interface UploadProgress {
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

// 导航类型
export type RootStackParamList = {
  Home: undefined
  Search: { query?: string; filters?: MotorcycleFilters }
  MotorcycleDetail: { id: string; motorcycle?: Motorcycle }
  Favorites: undefined
  Profile: undefined
  Login: undefined
  Register: undefined
  Camera: { mode: 'photo' | 'barcode' }
  ImageGallery: { images: string[]; initialIndex?: number }
  ReviewWrite: { motorcycleId: string }
  Reviews: { motorcycleId: string }
  Settings: undefined
  About: undefined
  Dealers: { location?: { latitude: number; longitude: number } }
  Compare: { motorcycles?: Motorcycle[] }
  VoiceSearch: undefined
}

export type TabParamList = {
  HomeTab: undefined
  SearchTab: undefined
  FavoritesTab: undefined
  ProfileTab: undefined
}

// 手势类型
export interface GestureConfig {
  enabled: boolean
  sensitivity: number
  threshold: number
}

export interface ShakeConfig extends GestureConfig {
  shakesRequired: number
}

// 缓存类型
export interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

export interface CacheConfig {
  defaultTTL: number
  maxSize: number
  cleanupInterval: number
}

// 搜索历史
export interface SearchHistory {
  id: string
  query: string
  filters?: MotorcycleFilters
  timestamp: string
  resultCount: number
}

// 设备信息
export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web'
  version: string
  model: string
  manufacturer: string
  screenWidth: number
  screenHeight: number
  densityDpi: number
}

// 分享选项
export interface ShareOptions {
  title: string
  message: string
  url?: string
  type?: string
}

// 性能监控
export interface PerformanceMetrics {
  appStartTime: number
  navigationTime: number
  imageLoadTime: number
  apiResponseTime: number
  memoryUsage: number
}

// 错误日志
export interface ErrorLog {
  id: string
  message: string
  stack?: string
  component?: string
  action?: string
  timestamp: string
  deviceInfo: DeviceInfo
  userAgent?: string
}

// API响应基础类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页查询参数
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 位置服务
export interface LocationPermission {
  granted: boolean
  accuracy: 'high' | 'low' | 'none'
  canAskAgain: boolean
}

export interface Dealer {
  _id: string
  name: string
  address: string
  phone: string
  email?: string
  website?: string
  location: {
    latitude: number
    longitude: number
  }
  brands: string[]
  services: string[]
  hours: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  rating?: number
  distance?: number
}