import { Platform, Linking, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import * as Sharing from 'expo-sharing'
import { Motorcycle, CacheItem, ShareOptions } from '../types'

// 格式化价格
export const formatPrice = (price?: number, currency = 'USD'): string => {
  if (!price) return 'Price on request'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// 格式化功率
export const formatPower = (hp?: number, kw?: number): string => {
  if (hp) return `${hp} HP`
  if (kw) return `${kw} kW`
  return 'N/A'
}

// 格式化扭矩
export const formatTorque = (nm?: number, lbft?: number): string => {
  if (nm) return `${nm} Nm`
  if (lbft) return `${lbft} lb-ft`
  return 'N/A'
}

// 格式化重量
export const formatWeight = (weight?: number, unit = 'kg'): string => {
  if (!weight) return 'N/A'
  return `${weight} ${unit}`
}

// 格式化排量
export const formatDisplacement = (displacement?: number): string => {
  if (!displacement) return 'N/A'
  return displacement >= 1000 
    ? `${(displacement / 1000).toFixed(1)}L`
    : `${displacement}cc`
}

// 格式化评分
export const formatRating = (rating?: number): string => {
  if (!rating) return 'No rating'
  return rating.toFixed(1)
}

// 格式化日期
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 格式化相对时间
export const formatRelativeTime = (date: string): string => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

// 生成摩托车全名
export const getMotorcycleFullName = (motorcycle: Motorcycle): string => {
  return `${motorcycle.year} ${motorcycle.brand} ${motorcycle.model}`
}

// 获取主要图片
export const getPrimaryImage = (motorcycle: Motorcycle): string => {
  if (!motorcycle.images || motorcycle.images.length === 0) {
    return 'https://via.placeholder.com/400x300?text=No+Image'
  }
  return motorcycle.images[0].url
}

// 获取品牌标志
export const getBrandLogo = (brand: string): string => {
  const brandMap: { [key: string]: string } = {
    yamaha: 'https://example.com/logos/yamaha.png',
    honda: 'https://example.com/logos/honda.png',
    kawasaki: 'https://example.com/logos/kawasaki.png',
    suzuki: 'https://example.com/logos/suzuki.png',
    ducati: 'https://example.com/logos/ducati.png',
    bmw: 'https://example.com/logos/bmw.png',
    ktm: 'https://example.com/logos/ktm.png',
    'harley-davidson': 'https://example.com/logos/harley.png',
  }
  
  return brandMap[brand.toLowerCase()] || 'https://via.placeholder.com/100x50?text=Logo'
}

// 验证邮箱
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export const validatePassword = (password: string): boolean => {
  // 至少8位，包含大小写字母和数字
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// 缓存操作
export const setCache = async <T>(key: string, data: T, ttl?: number): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: ttl ? Date.now() + ttl : Date.now() + 24 * 60 * 60 * 1000, // 默认24小时
    }
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem))
  } catch (error) {
    console.warn('Failed to set cache:', error)
  }
}

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(key)
    if (!cached) return null

    const cacheItem: CacheItem<T> = JSON.parse(cached)
    
    // 检查是否过期
    if (Date.now() > cacheItem.expiry) {
      await AsyncStorage.removeItem(key)
      return null
    }

    return cacheItem.data
  } catch (error) {
    console.warn('Failed to get cache:', error)
    return null
  }
}

export const clearCache = async (key?: string): Promise<void> => {
  try {
    if (key) {
      await AsyncStorage.removeItem(key)
    } else {
      await AsyncStorage.clear()
    }
  } catch (error) {
    console.warn('Failed to clear cache:', error)
  }
}

// 震动反馈
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): void => {
  if (Platform.OS === 'ios') {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        break
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        break
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        break
    }
  }
}

// 分享功能
export const shareMotorcycle = async (motorcycle: Motorcycle): Promise<void> => {
  const shareOptions: ShareOptions = {
    title: getMotorcycleFullName(motorcycle),
    message: `Check out this ${getMotorcycleFullName(motorcycle)} - ${formatPower(motorcycle.performance?.power?.hp, motorcycle.performance?.power?.kw)} | ${formatPrice(motorcycle.price?.msrp, motorcycle.price?.currency)}`,
    url: `https://motorspecs.com/motorcycle/${motorcycle._id}`,
  }

  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(shareOptions.url || '', {
        mimeType: 'text/plain',
        dialogTitle: shareOptions.title,
      })
    } else {
      // 降级到原生分享
      Alert.alert('Share', shareOptions.message)
    }
  } catch (error) {
    console.warn('Failed to share:', error)
  }
}

// 打开外部链接
export const openURL = async (url: string): Promise<void> => {
  try {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert('Error', 'Cannot open this URL')
    }
  } catch (error) {
    console.warn('Failed to open URL:', error)
  }
}

// 拨打电话
export const makeCall = async (phoneNumber: string): Promise<void> => {
  const url = `tel:${phoneNumber}`
  await openURL(url)
}

// 发送邮件
export const sendEmail = async (email: string, subject?: string, body?: string): Promise<void> => {
  let url = `mailto:${email}`
  const params = []
  
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  
  if (params.length > 0) {
    url += `?${params.join('&')}`
  }
  
  await openURL(url)
}

// 计算距离
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 格式化距离
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`
  }
  return `${distance.toFixed(1)}km away`
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let lastExecTime = 0
  return (...args: Parameters<T>) => {
    const currentTime = Date.now()
    if (currentTime - lastExecTime >= delay) {
      func(...args)
      lastExecTime = currentTime
    }
  }
}

// 生成唯一ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 获取文件扩展名
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// 检查图片格式
export const isValidImageFormat = (filename: string): boolean => {
  const validFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  return validFormats.includes(getFileExtension(filename))
}

// 压缩图片大小描述
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成随机颜色
export const generateRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 检查是否为夜间模式合适的时间
export const isNightTime = (): boolean => {
  const hour = new Date().getHours()
  return hour >= 19 || hour <= 6
}

// 获取问候语
export const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// 获取星级评分颜色
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#4CAF50' // 绿色
  if (rating >= 4.0) return '#8BC34A' // 浅绿色
  if (rating >= 3.5) return '#FFEB3B' // 黄色
  if (rating >= 3.0) return '#FF9800' // 橙色
  return '#F44336' // 红色
}

// 获取性能等级
export const getPerformanceLevel = (hp?: number): string => {
  if (!hp) return 'Unknown'
  if (hp < 50) return 'Entry Level'
  if (hp < 100) return 'Mid Range'
  if (hp < 150) return 'High Performance'
  if (hp < 200) return 'Super Sport'
  return 'Hyper Sport'
}

// 获取价格等级
export const getPriceLevel = (price?: number): string => {
  if (!price) return 'Unknown'
  if (price < 5000) return 'Budget'
  if (price < 15000) return 'Mid Range'
  if (price < 30000) return 'Premium'
  return 'Luxury'
}